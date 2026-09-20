import logging

from fastapi import FastAPI, WebSocket
from pydantic import BaseModel

import rag

logger = logging.getLogger("uvicorn.error")

app = FastAPI(title="AzureOps Copilot")


@app.get("/health")
def health():
    return {"status": "UP"}


class IngestRequest(BaseModel):
    text: str
    source: str


@app.post("/ingest")
def ingest(req: IngestRequest):
    n_chunks = rag.ingest_text(req.text, req.source)
    return {"source": req.source, "chunks_ingested": n_chunks}


@app.websocket("/chat")
async def chat(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            query = await ws.receive_text()
            try:
                context_chunks = rag.retrieve(query)
                for token in rag.generate_answer(query, context_chunks):
                    await ws.send_text(token)
            except Exception:
                logger.exception("chat generation failed")
                await ws.send_text("[error] something went wrong generating a response")
            await ws.send_text("[[END]]")
    except Exception:
        await ws.close()
