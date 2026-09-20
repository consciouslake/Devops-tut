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

genai.configure(api_key=settings.gemini_api_key)

EMBEDDING_MODEL = "models/text-embedding-004"
EMBEDDING_DIM = 768
CHAT_MODEL = "gemini-2.0-flash"

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
    result = genai.embed_content(model=EMBEDDING_MODEL, content=text, task_type=task_type)
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
    hits = _qdrant.search(
        collection_name=settings.qdrant_collection, query_vector=query_vector, limit=top_k
    )
    return [{"text": h.payload["text"], "source": h.payload["source"], "score": h.score} for h in hits]


def generate_answer(query: str, context_chunks: list[dict]):
    """Yields response text chunks (Gemini streaming)."""
    context = "\n\n---\n\n".join(c["text"] for c in context_chunks)
    prompt = (
        "You are AzureOps Copilot, a DevOps/Azure study assistant. "
        "Answer using only the context below; say so if it doesn't contain the answer.\n\n"
        f"Context:\n{context}\n\nQuestion: {query}"
    )
    model = genai.GenerativeModel(CHAT_MODEL)
    for chunk in model.generate_content(prompt, stream=True):
        if chunk.text:
            yield chunk.text
