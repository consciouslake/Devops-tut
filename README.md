# DevOps Tutorial — AzureOps Copilot

A 30-day, hands-on Azure DevOps learning project. The deliverable isn't just
notes — it's **AzureOps Copilot**, a small RAG chatbot (Gemini-powered) that
answers questions about Azure/DevOps by retrieving from a knowledge base you
build as you go (official docs + your own [LEARNING_LOG.md](LEARNING_LOG.md) +
your own infra code). Every Azure service in the curriculum is aimed at
deploying and hardening this one real app, not a throwaway demo.

See [PLAN.md](PLAN.md) for the full day-by-day curriculum and
[ARCHITECTURE.md](ARCHITECTURE.md) for how the app itself is built.

## Repository layout

```
backend/               FastAPI: /ingest (chunk+embed docs into Qdrant), /chat (RAG + Gemini)
frontend/               React + Vite + TS chat UI
vector-store/           Qdrant config (single node locally, 3-node cluster in Week 4)
infra/                  Terraform/Bicep — built up incrementally, Week 1 through Week 4
scripts/                deploy.sh, ingest.sh, backup.sh
docs/                   architecture notes, Azure resource inventory, keyvault map
.github/workflows/      CI/CD — added in Week 4
LEARNING_LOG.md          daily log — also an ingestion source for the app itself
PLAN.md                  the full curriculum (this is the source of truth for what to do each day)
```

## Prerequisites

- Azure CLI, logged in (`az login`), active subscription with budget alerts configured (see PLAN.md Day 0)
- A Gemini API key (for chat + embeddings)
- Docker + Docker Compose
- A domain you control (GoDaddy) for DNS/TLS practice
- Node 20+, Python 3.11+

## Run locally

```bash
cp backend/.env.example backend/.env      # fill in GEMINI_API_KEY
docker compose up -d --build
```

Frontend: http://localhost:5173 · Backend health: http://localhost:8000/health

## Status

Tracking progress against [PLAN.md](PLAN.md) day by day in [LEARNING_LOG.md](LEARNING_LOG.md).
