# DevOps Learning Plan — AzureOps Copilot

Source of truth for what to do each phase. Check items off as you go and log
what you actually did (+ `az`/`docker`/`git`/`terraform` commands used) in
[LEARNING_LOG.md](LEARNING_LOG.md) — those entries also become ingestion
input for the app itself.

**Revised 2026-09-21**: originally a fixed 30-day Week 1-4 calendar. Replaced
with a phased roadmap — foundations before Azure, Azure before advanced
Azure networking/services, DevOps tooling woven in once the fundamentals are
solid. No fixed day count per phase; move on when the checkpoint is genuinely
true, not when a calendar box says so.

```
                    DEVOPS
                       │
       ┌───────────────┼────────────────┐
       │               │                │
    Linux           Git/GitHub        Networking
       │               │                │
       └───────────────┼────────────────┘
                       │
                    Docker
                       │
                       ▼
                  Azure Basics
                       │
              ┌────────┴────────┐
              │                 │
          Azure Compute      Azure Network
              │                 │
              └────────┬────────┘
                       ▼
                    CI/CD
                       │
                 GitHub Actions
                       │
                       ▼
                    Azure
                       │
                 Infrastructure
                    as Code
                       │
                   Terraform
                       │
                       ▼
                  Kubernetes
                       │
                      AKS
                       │
                       ▼
             Monitoring & Security
                       │
                       ▼
             Production DevOps
```

## Day 0 — Setup (done)

- [x] `az login`, confirm subscription: `az account show`
- [x] Budget alert at 50/75/90% of trial credit, alerts to email
- [x] Tag convention: `project=azureops-copilot` on every resource group
- [x] Repo scaffolded: FastAPI backend, React frontend skeleton, folder structure
- [ ] Gemini API key obtained, stored in `backend/.env` (gitignored) for now — moves to Key Vault in the Security phase
- [ ] GitHub repo pushed, GitHub Project board with columns per phase + `Backlog`
- [ ] Domain's GoDaddy DNS panel open and ready to edit (needed once we reach DNS/Front Door)

## Phase 1 — Linux

Don't skip this. A DevOps engineer constantly interacts with Linux systems.

**Core commands:**
- [ ] `pwd ls cd mkdir touch cp mv rm cat less grep find head tail sort uniq`
- [ ] `chmod chown`
- [ ] `ps top kill`
- [ ] `curl wget ssh`

**Concepts:**
- [ ] Processes, services (`systemctl`, `journalctl -u <service>`)
- [ ] Ports, users, groups, permissions
- [ ] Environment variables
- [ ] Logs
- [ ] Package managers (`apt`)
- [ ] SSH (keys, config, agent)

**First project — one Ubuntu VM, default networking, deploy a simple Python app:**

```
Laptop
   │ SSH
   ▼
Ubuntu VM
   │
   ▼
Python application
   │
   ▼
HTTP
```

- [ ] `Standard_B2s` VM, Ubuntu, default VNet/NSG (Azure's auto-created ones — no custom networking yet, that's Phase 6)
- [ ] SSH in, walk the core commands above on a live system
- [ ] Install Python, run a minimal script (or FastAPI `/health` endpoint) bound to a port, curl it from the VM and from your laptop
- [ ] Use `systemctl`/a unit file to keep it running; `journalctl` to read its logs
- [ ] Tear the VM down when done for the day (cost discipline)

**Checkpoint:** comfortable navigating a Linux box blind — no dashboard, just SSH and the commands above.

## Phase 2 — Git & GitHub

- [ ] `git init clone status add commit push pull branch switch merge rebase log`
- [ ] Understand the flow: Working Directory → Staging Area → Local Repository → Remote Repository
- [ ] Branches, pull requests, merge conflicts (resolve one for real)
- [ ] `.gitignore` hygiene (already started — `backend/.env` excluded)
- [ ] GitHub Actions basics (just enough to know what it is — full CI/CD is Phase 7)
- [ ] GitHub Secrets — where they live, how a workflow reads them

**Checkpoint:** can explain the four-stage Git model and resolve a merge conflict without panicking.

## Phase 3 — Networking

This is why Azure Front Door has to wait — it's meaningless without this.

- [ ] HTTP methods: `GET POST PUT PATCH DELETE`
- [ ] Status codes: `200 301 302 400 401 403 404 500 502 503 504` — know what each means, not just the number
- [ ] DNS: `example.com → DNS → IP address`
- [ ] Ports: `22 SSH`, `80 HTTP`, `443 HTTPS`
- [ ] IP, subnet, CIDR notation — comfortable computing a subnet range by hand
- [ ] Route, NAT, firewall
- [ ] Load balancer vs reverse proxy — the actual difference
- [ ] TLS — handshake at a conceptual level, cert vs key vs CA

**Checkpoint:** can explain what happens between typing a URL and a page rendering, hop by hop.

## Phase 4 — Docker

One of the first major DevOps skills — should happen early, not late.

- [ ] Dockerfile, image, container, registry, volume, network — the vocabulary, cold
- [ ] `docker build run ps stop exec logs images pull push`
- [ ] Docker Compose — multi-container (backend + frontend + Qdrant)

**Apply it to this project:**

```
             Docker
               │
       ┌───────┴───────┐
       │               │
    Backend          Qdrant
   (FastAPI)        Container
   Container
```

- [ ] `docker compose up` — backend + frontend + Qdrant (single node) all running locally
- [ ] Ingestion pipeline: chunk text → Gemini embeddings (`text-embedding-004`) → Qdrant upsert
- [ ] Chat endpoint: retrieve top-k from Qdrant → Gemini generate (`gemini-2.0-flash`) → stream to frontend via WebSocket
- [ ] Ingest ~10 Azure docs pages, ask a question, get a grounded answer end-to-end
- [ ] Add Redis in front of the chat endpoint, cache repeated queries
- [ ] Add a queue (Redis-backed or Azure Service Bus later) so `/ingest` doesn't block the HTTP request
- [ ] `pytest` for `/ingest` and `/chat`; pre-commit hook for secret scanning (gitleaks)

**Checkpoint:** the whole app runs locally from `docker compose up` alone, no manual setup steps.

## Phase 5 — Azure Fundamentals

Now start Azure seriously — don't try to master everything, understand when
each service is appropriate.

- [ ] Subscription → Resource Group → resources hierarchy
- [ ] Resource groups, tagging (already applying `project=azureops-copilot`)
- [ ] Azure compute options: Virtual Machines, App Service, Container Apps, Azure Functions — know the tradeoffs between them, not just VMs

**Checkpoint:** given a workload, can say which compute option fits and why, without defaulting to "VM" out of habit.

## Phase 6 — Azure Networking

Front Door interest makes sense once this phase is done, not before.

```
Virtual Network
       │
       ├── Subnet
       │
       ├── NSG
       │
       ├── Route Table
       │
       └── Private Endpoint
```

- [ ] VNet + subnet + NSG built from scratch (not defaults) — this is where the day1-vnet-vm branch's original work belongs
- [ ] Ansible playbook to configure the VM (Docker install, user/firewall setup) — replaces a raw bash bootstrap script
- [ ] Deploy the app via `docker compose --profile app` on the VM
- [ ] Azure Container Registry (ACR): build images, push to ACR, pull on the VM instead of building in place
- [ ] Trivy scan step on the ACR images — fail on critical CVEs
- [ ] GoDaddy A record → VM public IP
- [ ] TLS via certbot/Let's Encrypt
- [ ] Azure Bastion for VM access — no open port 22
- [ ] Load Balancer + health probe on `/health`, convert VM → VM Scale Set (2 instances, zone-redundant)
- [ ] Availability Zones vs Availability Sets — know the difference cold
- [ ] Kill one instance manually, confirm the LB reroutes traffic
- [ ] Autoscale rule on CPU; load-test with `hey`/`ab` to trigger it
- [ ] Application Gateway + WAF for one day only: test a payload against it, then **delete it** (don't let a $0.36/hr resource idle)
- [ ] **Azure Front Door** (Standard) in front of the LB — managed TLS on your domain, caching rules — this is the payoff for Phase 3+6, not a shortcut around them
- [ ] Traffic Manager, VPN, Private Link — conceptual pass, deploy only if budget allows

```
                    USERS
                 🌍 🌎 🌏
                     │
                     ▼
             Azure Front Door
                     │
              ┌──────┴──────┐
              │             │
              ▼             ▼
          Region A       Region B
              │             │
          App Service    App Service
```

**Checkpoint:** `https://yourdomain.com` serves AzureOps Copilot behind a real VNet/NSG/LB, and you can explain Front Door vs Application Gateway vs Load Balancer without notes.

## Phase 7 — CI/CD (GitHub Actions)

Where this starts being DevOps rather than "using Azure."

```
Django/FastAPI app
       │
       ▼
     GitHub
       │
       │ push
       ▼
GitHub Actions
       │
 ┌─────┼─────────┐
 ▼     ▼         ▼
Test  Build     Scan
       │
       ▼
   Docker Image
       │
       ▼
     Azure
```

- [ ] Vocabulary: CI, CD, pipeline, workflow, runner, artifact, environment, secrets, deployment, rollback
- [ ] First pipeline: push → run tests → build Docker image → push to ACR → deploy to Azure
- [ ] Bandit (Python SAST) in CI

**Checkpoint:** a `git push` alone gets a tested, scanned image running on Azure — no manual step in between.

## Phase 8 — Infrastructure as Code (Terraform)

Instead of manually creating VM/VNet/Subnet/Storage/Database, write it as code.

```
Terraform
    │
    ▼
Azure Provider
    │
    ▼
Azure Resources
```

Target repo layout:
```
Devops-tut/
├── backend/
├── frontend/
├── docker-compose.yml
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── terraform.tfvars
└── .github/workflows/deploy.yml
```

- [ ] Terraform (or Bicep) capturing everything from Phases 5-7
- [ ] GitHub Actions CI/CD authenticated via **OIDC federation** (no stored service-principal secret)
- [ ] Azure Policy: enforce a tagging rule + a VM-SKU restriction on the resource group
- [ ] Backup: snapshot Qdrant volumes + scheduled export to Blob; restore once to prove it works

**Checkpoint:** can destroy the whole environment and rebuild it from `terraform apply` alone, timed.

## Phase 9 — Kubernetes

Don't start this until Docker + Azure + CI/CD + Terraform are solid.

```
Docker
   ↓
Kubernetes
   ↓
Azure Kubernetes Service
   ↓
AKS
```

- [ ] Pod, Deployment, Service, Ingress, ConfigMap, Secret, Namespace, Replica, deployment strategies
- [ ] Helm chart for the app (not raw manifests)
- [ ] **Qdrant 3-node cluster** across zones, serving the app's real retrieval traffic
- [ ] Kill the leader node, confirm the cluster re-elects and the app keeps answering

**Checkpoint:** can explain a rolling deployment and a StatefulSet's guarantees, and watched Qdrant survive a node kill.

## Phase 10 — Observability & Security

- [ ] Application Insights wired into the FastAPI backend — trace retrieval time vs Gemini latency on `/chat`
- [ ] Azure Monitor, Log Analytics, alerts, metrics, logs
- [ ] Prometheus + Grafana scraping the VMSS/Qdrant nodes — a second, cloud-agnostic monitoring stack alongside Azure Monitor
- [ ] Key Vault + Managed Identity — move Gemini key, Qdrant creds, `backend/.env` secrets out of plaintext
- [ ] Microsoft Entra ID, RBAC concepts
- [ ] Microsoft Defender for Cloud (free tier) — fix at least one posture recommendation
- [ ] One manual OWASP ZAP baseline scan against the deployed app
- [ ] Optional half-day: run HashiCorp Vault in a container, migrate one secret to it, compare the workflow to Key Vault

**Checkpoint:** no secret exists outside Key Vault, and there's a dashboard + alert that would actually catch a real incident.

## Capstone

- [ ] Delete everything, redeploy the entire stack from IaC alone, time it
- [ ] Explain every component in the architecture without notes

## Bonus track (only if time/budget remain)

- [ ] Container Apps as an alternative to VMSS/AKS for part of the stack
- [ ] Azure Chaos Studio: a scripted experiment that kills a VMSS instance or a Qdrant node automatically
- [ ] End-of-month cost pass: right-size based on real usage, price out 1-yr reserved instances

## Explicitly out of scope for now (know they exist, don't deploy them)

- Jenkins — GitHub Actions covers the same CI/CD concepts; read one Jenkinsfile example for interview familiarity
- ELK Stack — Prometheus/Grafana covers monitoring; know ELK is the logging-focused alternative
- AWS/GCP — deliberately Azure-deep; breadth comes later
- Database internals/sharding/consensus theory, distributed queue theory beyond "why a queue exists" — software-architecture depth, not a DevOps-role requirement yet

## Cost discipline reminders

- Front Door, Application Gateway, VM Scale Sets, and any bonus AKS cluster are the line items expensive enough to matter on a trial budget — build, test, log the learning, tear down same day unless noted otherwise as a keeper.
- Phase 1's VM should be torn down at the end of each session until Phase 6, when it becomes part of the longer-running deployment.
- Everything else (single VM, LB, Qdrant×3, Key Vault, Blob, Log Analytics) can run within a typical $200 Azure trial credit if the above is respected.
