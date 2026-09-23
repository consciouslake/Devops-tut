import json
import logging

from fastapi import FastAPI, HTTPException, Request, WebSocket
from pydantic import BaseModel
from starlette.websockets import WebSocketDisconnect

import rag
from rate_limit import chat_limiter, client_ip_from_request, client_ip_from_websocket, ingest_limiter
from tracing import get_tracer, setup_tracing

logger = logging.getLogger("uvicorn.error")

app = FastAPI(title="AzureOps Copilot")
setup_tracing(app)
tracer = get_tracer()


@app.get("/health")
def health():
    return {"status": "UP"}


class IngestRequest(BaseModel):
    text: str
    source: str


@app.post("/ingest")
def ingest(req: IngestRequest, request: Request):
    if not ingest_limiter.allow(client_ip_from_request(request)):
        raise HTTPException(status_code=429, detail="Too many ingest requests, try again shortly.")
    n_chunks = rag.ingest_text(req.text, req.source)
    return {"source": req.source, "chunks_ingested": n_chunks}


@app.websocket("/chat")
async def chat(ws: WebSocket):
    await ws.accept()
    client_ip = client_ip_from_websocket(ws)
    try:
        while True:
            raw = await ws.receive_text()
            try:
                payload = json.loads(raw)
                query = payload.get("query", "")
                mode = payload.get("mode", "rag")
            except (json.JSONDecodeError, AttributeError):
                query, mode = raw, "rag"
            if not chat_limiter.allow(client_ip):
                await ws.send_text("[error] rate limit reached, please wait a few minutes and try again")
                await ws.send_text("[[END]]")
                continue
            with tracer.start_as_current_span("chat_query") as span:
                span.set_attribute("chat.query_length", len(query))
                span.set_attribute("chat.mode", mode)
                try:
                    if mode == "ai":
                        async for token in rag.generate_plain_answer(query):
                            await ws.send_text(token)
                    else:
                        context_chunks = rag.retrieve(query)
                        async for token in rag.generate_answer(query, context_chunks):
                            await ws.send_text(token)
                except Exception:
                    logger.exception("chat generation failed")
                    span.set_attribute("chat.error", True)
                    await ws.send_text("[error] something went wrong generating a response")
            await ws.send_text("[[END]]")
    except WebSocketDisconnect:
        pass
    except Exception:
        logger.exception("unexpected /chat error")
        try:
            await ws.close()
        except Exception:
            pass
