"""Chunking, embedding, retrieval and generation — the core of AzureOps Copilot.

Kept intentionally small for Week 1 (Days 1-3): synchronous ingestion, single
Qdrant node. The queue-based async ingestion and the 3-node Qdrant cluster are
Week 4 concerns (see PLAN.md) — this module's interface doesn't need to change
for either, only how `ingest_text` is invoked and where Qdrant lives.
"""

import uuid

import google.generativeai as genai
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

from config import settings
from tracing import get_tracer

tracer = get_tracer()

genai.configure(api_key=settings.gemini_api_key)

# text-embedding-004 was retired; gemini-embedding-001 is the current model.
# It defaults to 3072-dim output but supports Matryoshka truncation via
# output_dimensionality — pinned to 768 to keep the Qdrant collection small.
EMBEDDING_MODEL = "models/gemini-embedding-001"
EMBEDDING_DIM = 768
CHAT_MODEL = "gemini-3.6-flash"
# Caps real, usage-billed Gemini API cost per reply -- generous enough for a
# thorough study-assistant answer, not left unbounded.
MAX_OUTPUT_TOKENS = 1024

_qdrant = QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)


def ensure_collection() -> None:
    existing = [c.name for c in _qdrant.get_collections().collections]
    if settings.qdrant_collection not in existing:
        _qdrant.create_collection(
            collection_name=settings.qdrant_collection,
            vectors_config=qmodels.VectorParams(
                size=EMBEDDING_DIM, distance=qmodels.Distance.COSINE
            ),
        )


def chunk_text(text: str, max_chars: int = 1500, overlap: int = 200) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + max_chars
        chunks.append(text[start:end])
        start = end - overlap
    return [c for c in chunks if c.strip()]


def embed(text: str, task_type: str = "retrieval_document") -> list[float]:
    with tracer.start_as_current_span("embed") as span:
        span.set_attribute("embedding.model", EMBEDDING_MODEL)
        span.set_attribute("embedding.task_type", task_type)
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=text,
            task_type=task_type,
            output_dimensionality=EMBEDDING_DIM,
        )
        return result["embedding"]


def ingest_text(text: str, source: str) -> int:
    ensure_collection()
    chunks = chunk_text(text)
    points = [
        qmodels.PointStruct(
            id=str(uuid.uuid4()),
            vector=embed(chunk, task_type="retrieval_document"),
            payload={"text": chunk, "source": source},
        )
        for chunk in chunks
    ]
    if points:
        _qdrant.upsert(collection_name=settings.qdrant_collection, points=points)
    return len(points)


def retrieve(query: str, top_k: int = 5) -> list[dict]:
    ensure_collection()
    query_vector = embed(query, task_type="retrieval_query")
    with tracer.start_as_current_span("qdrant_search") as span:
        span.set_attribute("qdrant.collection", settings.qdrant_collection)
        span.set_attribute("qdrant.top_k", top_k)
        hits = _qdrant.search(
            collection_name=settings.qdrant_collection, query_vector=query_vector, limit=top_k
        )
        span.set_attribute("qdrant.hits", len(hits))
        return [{"text": h.payload["text"], "source": h.payload["source"], "score": h.score} for h in hits]


async def generate_plain_answer(query: str):
    """Yields response text chunks (Gemini streaming) — no Qdrant retrieval, plain Gemini chat.

    Uses generate_content_async, not the sync client: the sync call blocks the
    whole asyncio event loop for its entire duration (seconds, sometimes much
    longer), freezing every other concurrent /chat connection on this single
    Uvicorn worker until it returns.
    """
    with tracer.start_as_current_span("gemini_generate_plain") as span:
        span.set_attribute("gemini.model", CHAT_MODEL)
        prompt = (
            "You are AzureOps Copilot's AI Mentor, a helpful Azure/DevOps study assistant.\n\n"
            f"Question: {query}"
        )
        model = genai.GenerativeModel(CHAT_MODEL)
        response = await model.generate_content_async(
            prompt, stream=True, generation_config={"max_output_tokens": MAX_OUTPUT_TOKENS}
        )
        async for chunk in response:
            if chunk.text:
                yield chunk.text


async def generate_answer(query: str, context_chunks: list[dict]):
    """Yields response text chunks (Gemini streaming). See generate_plain_answer for why async."""
    with tracer.start_as_current_span("gemini_generate") as span:
        span.set_attribute("gemini.model", CHAT_MODEL)
        span.set_attribute("gemini.context_chunks", len(context_chunks))
        context = "\n\n---\n\n".join(c["text"] for c in context_chunks)
        prompt = (
            "You are AzureOps Copilot, a DevOps/Azure study assistant. "
            "Answer using only the context below; say so if it doesn't contain the answer.\n\n"
            f"Context:\n{context}\n\nQuestion: {query}"
        )
        model = genai.GenerativeModel(CHAT_MODEL)
        response = await model.generate_content_async(
            prompt, stream=True, generation_config={"max_output_tokens": MAX_OUTPUT_TOKENS}
        )
        async for chunk in response:
            if chunk.text:
                yield chunk.text
