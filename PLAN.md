# 30-Day Azure DevOps Plan — AzureOps Copilot

Source of truth for what to do each day. Check items off as you go and log
what you actually did (+ `az`/`kubectl`/`terraform` commands used) in
[LEARNING_LOG.md](LEARNING_LOG.md) — those entries also become ingestion
input for the app itself.

## Day 0 — Setup (do this before Day 1)

- [ ] `az login`, confirm subscription: `az account show`
- [ ] Budget alert at 50/75/90% of your trial credit, alerts to your email:
      `az consumption budget create ...`
- [ ] Tag convention decided: `project=azureops-copilot` on every resource group
- [ ] Gemini API key obtained, stored nowhere but `backend/.env` (gitignored) for now — moves to Key Vault in Week 3
- [ ] GitHub repo created, this plan pushed, a GitHub Project board with columns `Week 1..4` + `Backlog`
- [ ] Domain's GoDaddy DNS panel open and ready to edit

## Week 1 — Build the app, first deployment, Linux/networking fundamentals

**Days 1–3 — Build locally, no Azure yet**
- [ ] Scaffold repo (this repo), FastAPI skeleton, React chat skeleton
- [ ] `docker compose up` — backend + frontend + Qdrant (single node) all running locally
- [ ] Ingestion pipeline: chunk text → Gemini embeddings (`text-embedding-004`) → Qdrant upsert
- [ ] Chat endpoint: retrieve top-k from Qdrant → Gemini generate (`gemini-2.0-flash`) → stream to frontend via WebSocket
- [ ] Ingest ~10 Azure docs pages, ask a question, get a grounded answer end-to-end
- [ ] Add Redis in front of the chat endpoint, cache repeated queries
- [ ] Add a queue (Redis-backed or Azure Service Bus later) so `/ingest` doesn't block the HTTP request
- [ ] `pytest` for `/ingest` and `/chat`; pre-commit hook for secret scanning (gitleaks)

**Days 4–7 — First Azure deployment**
- [ ] Linux fundamentals on the VM before anything else: `systemctl`, `journalctl -u docker`, file permissions/`chown`, cron, `ps`/`top`/`kill`, package management (`apt`)
- [ ] Networking review: OSI/TCP-IP model, `ping`/`traceroute`/`netstat`, then apply it — VNet + subnet + NSG built from scratch (not defaults)
- [ ] Ansible playbook to configure the VM (Docker install, user/firewall setup) — replaces a raw bash bootstrap script
- [ ] One `Standard_B2s` VM, deploy the app via `docker compose --profile app`
- [ ] Azure Container Registry (ACR): build images, push to ACR, pull on the VM instead of building in place
- [ ] Trivy scan step on the ACR images — fail on critical CVEs
- [ ] GoDaddy A record → VM public IP
- [ ] TLS via certbot/Let's Encrypt
- [ ] Azure Bastion for VM access — no open port 22

**Checkpoint:** `https://yourdomain.com` serves AzureOps Copilot from one VM. You can explain VNets/NSGs/RBAC and Linux service management.

## Week 2 — Scale out, load balance

- [ ] Availability Zones vs Availability Sets — know the difference cold
- [ ] Convert the VM into a VM Scale Set (2 instances, zone-redundant), pulling images from ACR
- [ ] Standard Load Balancer + health probe on `/health`
- [ ] Kill one instance manually, confirm the LB reroutes traffic
- [ ] Autoscale rule on CPU; load-test with `hey`/`ab` to trigger it
- [ ] DNS → LB public IP

**Checkpoint:** you can explain LB health probes, autoscaling triggers, why zone-redundancy matters — and you watched it survive an instance kill.

## Week 3 — Edge, security, secrets

- [ ] Azure Front Door (Standard) in front of the LB — managed TLS on your domain, caching rules
- [ ] Application Gateway + WAF for one day only: test a payload against it, then **delete it** (don't let a $0.36/hr resource idle)
- [ ] Key Vault + Managed Identity — move Gemini key, Qdrant creds, `backend/.env` secrets out of plaintext
- [ ] Bandit (Python SAST) in CI; one manual OWASP ZAP baseline scan against the deployed app
- [ ] Optional half-day: run HashiCorp Vault in a container, migrate one secret to it, compare the workflow to Key Vault
- [ ] Application Insights wired into the FastAPI backend — trace retrieval time vs Gemini latency on the `/chat` path
- [ ] Microsoft Defender for Cloud (free tier) — fix at least one posture recommendation

**Checkpoint:** you can explain Front Door vs Application Gateway vs Load Balancer, and no secret exists outside Key Vault.

## Week 4 — Clustering, IaC, CI/CD, governance, capstone

- [ ] **Qdrant 3-node cluster** across zones, serving the app's real retrieval traffic — this is the "3-node clustering" lesson, tied directly to the app instead of an arbitrary unrelated database
- [ ] Kill the leader node, confirm the cluster re-elects and the app keeps answering
- [ ] Prometheus + Grafana scraping the VMSS/Qdrant nodes — a second, cloud-agnostic monitoring stack alongside Azure Monitor/App Insights
- [ ] Terraform (or Bicep) capturing everything from Weeks 1–3
- [ ] GitHub Actions CI/CD: build → push to ACR → redeploy VMSS, authenticated via **OIDC federation** (no stored service-principal secret)
- [ ] Azure Policy: enforce a tagging rule + a VM-SKU restriction on the resource group
- [ ] Backup: snapshot Qdrant volumes + scheduled export to Blob; restore once to prove it works
- [ ] **Capstone:** delete everything, redeploy the entire stack from IaC alone, time it

**Checkpoint:** you can stand up the whole architecture from code alone, explain every component, and have monitoring/alerts/backups proving it's production-credible.

## Bonus track (only if days/budget remain)

- [ ] Container Apps or a minimal AKS cluster as an alternative to VMSS
- [ ] Deploy the app via a **Helm chart** if you go the AKS route (not raw manifests)
- [ ] Azure Chaos Studio: a scripted experiment that kills a VMSS instance or a Qdrant node automatically
- [ ] End-of-month cost pass: right-size based on real usage, price out 1-yr reserved instances

## Explicitly out of scope this month (know they exist, don't deploy them)

- Jenkins — GitHub Actions covers the same CI/CD concepts; read one Jenkinsfile example for interview familiarity
- ELK Stack — Prometheus/Grafana covers monitoring; know ELK is the logging-focused alternative
- AWS/GCP — deliberately Azure-deep this month; breadth comes later
- Database internals/sharding/consensus theory, distributed queue theory beyond "why a queue exists" — software-architecture depth, not a DevOps-role requirement yet

## Cost discipline reminders

- Front Door, Application Gateway, and any bonus AKS cluster are the only line items expensive enough to matter on a 1-month trial — build, test, log the learning, tear down same day unless noted otherwise as a keeper.
- Everything else (VM/VMSS, LB, Qdrant×3, Key Vault, Blob, Log Analytics) can run the full month within a typical $200 Azure trial credit if the above is respected.
