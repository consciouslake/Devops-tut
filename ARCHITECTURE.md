# AzureOps Copilot — Architecture

A RAG chatbot that answers Azure/DevOps questions by retrieving from a
knowledge base built during the 30-day plan (see [PLAN.md](PLAN.md)).

## Components

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React + Vite + TS + Tailwind | Chat UI, streams responses over WebSocket |
| Backend | Python FastAPI | `/ingest` (chunk + embed + upsert), `/chat` (retrieve + generate, streamed) |
| LLM | Gemini `gemini-2.0-flash` | Chat generation |
| Embeddings | Gemini `text-embedding-004` | Used for both ingestion and query embedding |
| Vector store | Qdrant | Single node locally/Week 1–3, 3-node cluster from Week 4 — chosen over MongoDB specifically because it has native distributed clustering, so the "cluster something" lesson clusters the database the app actually depends on |
| Cache | Redis | In front of `/chat`, caches repeated queries |
| Queue | Redis-backed (Service Bus optional later) | `/ingest` is async — a document ingestion request shouldn't block the HTTP response |
| Secrets | Azure Key Vault + Managed Identity (from Week 3) | Gemini key, Qdrant creds — plaintext `.env` only during local dev |
| Auth | JWT (bcrypt + PyJWT) | Personal tool, no external IdP needed |

## Data flow

```
User → React chat UI → FastAPI /chat (WebSocket)
                          │
                          ├─ check Redis cache
                          ├─ embed query (Gemini) → search Qdrant (top-k)
                          └─ Gemini generate (context + query) → stream tokens back

Ingestion (async, via queue):
  doc source → chunk → Gemini embed → Qdrant upsert
```

## Ingestion sources

- Curated Microsoft Learn pages matching the current week's topics (~50–100 pages total — stay small, Gemini free tier has rate limits)
- This repo's own `LEARNING_LOG.md` entries, re-ingested periodically
- This repo's own Terraform/Bicep files once they exist (Week 4) — lets you ask the app to explain your own infrastructure

## Deployment evolution (mirrors PLAN.md)

| Week | Where it runs |
|---|---|
| 1 | Single Azure VM, Docker Compose, one Qdrant node |
| 2 | VM Scale Set (2+ instances) behind Standard Load Balancer |
| 3 | + Azure Front Door, Key Vault/Managed Identity, App Insights |
| 4 | + 3-node Qdrant cluster, Terraform-managed, GitHub Actions CI/CD |
