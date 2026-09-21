# DevOps Tutorial — Azure DevOps from Zero

This repository is a structured, hands-on learning path for becoming an Azure-focused DevOps engineer from zero.

The learning path uses **AzureOps Copilot**, a small RAG chatbot, as the evolving capstone. Every major DevOps concept is learned on the way to deploying, securing, automating, monitoring, and operating this one application.

## Curriculum

See:
- [PLAN.md](PLAN.md) — source-of-truth roadmap and milestones
- [CURRICULUM.md](CURRICULUM.md) — chapter-by-chapter learning content
- [ARCHITECTURE.md](ARCHITECTURE.md) — application architecture
- [LEARNING_LOG.md](LEARNING_LOG.md) — daily hands-on record

## Roadmap

Linux & Bash -> Git & GitHub -> Networking -> Docker -> Azure Fundamentals -> Azure Networking -> CI/CD -> Kubernetes -> AKS -> Observability -> Security -> Azure Front Door -> Terraform -> Capstone

## Repository layout

```
backend/
frontend/
vector-store/
infra/
scripts/
docs/
.github/workflows/
LEARNING_LOG.md
PLAN.md
CURRICULUM.md
ARCHITECTURE.md
```

## Learning method

For every chapter:
1. Understand the concept.
2. Run the commands.
3. Break something intentionally.
4. Troubleshoot it.
5. Log the lesson.
6. Answer interview questions.
7. Connect it to Azure.
8. Commit the work.

## Current capstone direction

```
Developer
  -> GitHub
  -> GitHub Actions
  -> test / scan / build
  -> Azure Container Registry
  -> Azure compute
  -> Azure Front Door / WAF
  -> monitoring / logs / traces
```

The curriculum intentionally starts with fundamentals before Azure Front Door, because understanding Linux, Git, HTTP, DNS, networking, reverse proxies, load balancing, and security makes the Azure services much easier to understand and troubleshoot.
