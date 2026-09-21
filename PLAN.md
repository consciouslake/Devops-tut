# Azure DevOps Zero-to-Production Curriculum

This is the source of truth for the learning path. The goal is to go from DevOps fundamentals to production-oriented Azure DevOps skills through one evolving project: **AzureOps Copilot**.

## Learning philosophy

- Learn the underlying concept before the Azure service.
- Every chapter includes: concept, why DevOps needs it, hands-on commands, troubleshooting, interview questions, and Azure connection.
- Build one system progressively instead of collecting disconnected tutorials.
- Keep a daily learning log with commands, mistakes, fixes, and architecture decisions.
- Prefer Azure-native services while keeping core DevOps concepts cloud-agnostic.

## 13-Module Roadmap

### Module 1 — Linux & Bash

1. Linux and the DevOps operating model
2. Filesystem navigation and file operations
3. Users, groups, permissions, sudo, ownership
4. Processes, jobs, signals, and resource inspection
5. Services with systemd and logs with journalctl
6. Packages, environment variables, shell configuration
7. Bash scripting fundamentals
8. SSH, remote administration, cron, and basic hardening
9. Linux troubleshooting lab

**Outcome:** operate and troubleshoot a Linux server confidently.

**Status (2026-09-21):** Done — VM created (`azureops-vm01`, southindia), Python app deployed as a systemd service (`pyapp.service`, `Restart=always`), self-healing verified (killed the process, watched systemd restart it via journalctl), NSG port-opening debugged end-to-end (curl worked locally but not externally until `az vm open-port` was run), core commands (chmod/chown/df/journalctl) practiced. Full chapter content written in the frontend curriculum browser. See LEARNING_LOG.md "Phase 1 — Linux fundamentals VM" for details.

### Module 2 — Git & GitHub

1. Version control mental model
2. Repositories, commits, branches
3. Staging, history, diff, restore, reset, revert
4. Branching strategies and pull requests
5. Merge conflicts and rebasing
6. Tags, releases, .gitignore, Git hygiene
7. GitHub Issues/Projects and collaboration
8. GitHub Actions introduction
9. Git troubleshooting lab

**Outcome:** use Git as the control system for infrastructure and application delivery.

**Status (2026-09-21):** Done — PR workflow used for real (`phase1-linux-vm` → `main`, 3 CI checks passed, merged), a real merge conflict resolved earlier in the session, undo practice done live (`git revert` on a shared-history commit, `git reset --soft` on local-only commits, `git reflog` recovery demonstrated), gitleaks wired in as both a pre-commit hook and a CI job (verified against a real fake secret and a known-placeholder one), GitHub Project board created. Full chapter content written in the frontend curriculum browser. See LEARNING_LOG.md "Module 2 — Git & GitHub" for details.

### Module 3 — Networking Fundamentals

1. Network basics: IP, MAC, ports, protocols
2. OSI and TCP/IP models
3. IPv4, CIDR, subnetting
4. DNS and name resolution
5. HTTP/HTTPS and TLS
6. Routing, NAT, gateways
7. Firewalls and security groups
8. Load balancing and reverse proxies
9. Network troubleshooting with ping, traceroute, curl, ss/netstat, nslookup/dig
10. Networking lab

**Outcome:** understand the traffic path before learning Azure networking.

**Status (2026-09-21):** Chapters 1-9 done — real DNS lookup, TLS handshake/HTTP trace, and hop-by-hop traceroute run against github.com; NSG rules from Phase 1 re-read through the firewall/stateful-filtering lens; `docker-compose.yml`'s bind-address split (0.0.0.0 for frontend/backend, 127.0.0.1 for Redis/Qdrant) used as a live public-vs-private example; nginx.conf's reverse proxy config used for the load-balancing/reverse-proxy chapter. Chapter 10 (dedicated from-scratch VNet/subnet/NSG lab) deliberately deferred to Module 6 rather than duplicated here — Phase 1 already exercised NSG debugging in a real scenario. Full chapter content written in the frontend curriculum browser. See LEARNING_LOG.md "Module 3 — Networking Fundamentals" for details.

### Module 4 — Docker

1. Why containers exist
2. Images, layers, containers
3. Dockerfile
4. Volumes and networking
5. Environment variables and secrets
6. Docker Compose
7. Container debugging and logs
8. Registries and image lifecycle
9. Image security and vulnerability scanning
10. Containerize AzureOps Copilot

**Outcome:** package, run, debug, and publish applications as containers.

**Status (2026-09-21):** Done — all 10 chapters, including a real security bug found and fixed live: `backend/Dockerfile`'s `COPY . .` had no `.dockerignore`, so `backend/.env` (real Gemini API key) was actually baked into the built image (verified with `docker run ... ls /app/`). Added `.dockerignore` to both `backend/` and `frontend/`, rebuilt, reverified only `.env.example` remained, confirmed `/health` still returned `{"status":"UP"}` afterward since compose injects real config via `env_file` at runtime. Confirmed non-root (`appuser`) execution, multi-stage frontend build, and correct compose networking/volumes were already done right. Full chapter content written in the frontend curriculum browser. See LEARNING_LOG.md "Module 4 — Docker" for details.

### Module 5 — Azure Fundamentals

1. Azure global infrastructure: regions, zones, geography
2. Tenants, subscriptions, resource groups
3. Azure Resource Manager and tags
4. Azure CLI and Cloud Shell
5. Entra ID, authentication, RBAC
6. Compute choices: VM, App Service, Container Apps, Functions
7. Storage: Blob, Files, managed disks
8. Databases and managed services overview
9. Monitoring, cost management, budgets
10. Build the first Azure environment

**Outcome:** navigate Azure and choose basic services deliberately.

**Status (2026-09-21):** Done — all 10 chapters, grounded in real subscription data (4 regions in use across resource groups, RBAC role check, ARM tag query) and a new real resource: storage account `azureopscopilotstore` created with a blob container, `LEARNING_LOG.md` uploaded as a live backup demo. Hit a genuine RBAC finding: subscription Owner (control-plane) did NOT grant blob data access via `--auth-mode login` (data-plane) — self-assigning the `Storage Blob Data Contributor` role was correctly blocked when attempted autonomously (a permission-grant action), so it was left for a human decision; the user then ran the role assignment themselves and it was verified working (`--auth-mode login` succeeded, propagated within seconds). Also fixed the recurring `az` PATH issue permanently via `~/.bash_profile` sourcing `~/.bashrc`. Full chapter content written in the frontend curriculum browser. See LEARNING_LOG.md "Module 5 — Azure Fundamentals" for details.

### Module 6 — Azure Networking

1. VNet, subnet, NIC
2. NSG and traffic filtering
3. Public vs private IPs
4. Route tables and UDRs
5. Azure Load Balancer
6. Private endpoints and Private Link
7. Application Gateway and WAF concepts
8. Azure DNS
9. Azure Front Door concepts
10. Design and troubleshoot the AzureOps network

**Outcome:** understand how Azure traffic flows from the internet to the application.

**Status (2026-09-21):** Done — all 10 chapters, real infrastructure throughout, no resource built without a reason:
- **Ch 1-4**: `azureops-vnet` (10.10.0.0/16, app-subnet + gateway-subnet), NSG, connectivity, and routing built from scratch.
- **Ch 5**: `azureops-lb` (Standard LB) load-balancing `app-vm1`/`app-vm2`, real failover verified. Managed-vs-software LB comparison written into the chapter; final call deferred to Module 8 — Kubernetes Fundamentals (alongside the Qdrant cluster decision).
- **Ch 6**: Private Link on the Module 5 storage account, public access disabled, verified from both inside and outside the VNet.
- **Ch 7**: cost-conscious redirect — software WAF (`owasp/modsecurity-crs` on the existing VMs) instead of Azure Application Gateway, zero extra cost, verified blocking a real SQLi payload end-to-end through the LB.
- **Ch 8**: real public DNS zone (`azureops-lab.test`, an IANA test TLD) with A/CNAME/TXT records, verified via direct nameserver query — `devopspk.online` deliberately untouched.
- **Ch 9**: Front Door evaluated against Cloudflare/Traffic Manager/skip-it with real cost figures; built nothing, since this project is single-region and Cloudflare would have required touching the reserved domain.
- **Ch 10**: full network architecture documented, plus a real live troubleshooting lab (deliberately broke `Allow-Internet-8080`, diagnosed via app-health-first methodology, found and fixed it, confirmed recovery).

Five genuine bugs hit and fixed across the module (mangled probe path, redundant NIC-level NSGs, a path-mangling recurrence, a container privileged-port issue, plus the Chapter 10 lab's deliberate one). All commands run by the user directly per their request. Full chapter content for all 10 chapters in the frontend curriculum browser. See LEARNING_LOG.md, search "Module 6" for the full chapter-by-chapter detail.

### Module 7 — CI/CD with GitHub Actions

1. CI vs CD and deployment lifecycle
2. GitHub Actions workflow syntax
3. Runners, jobs, steps, actions
4. Artifacts, caching, matrices
5. Secrets and environments
6. Build and test Python/FastAPI
7. Build and scan Docker images
8. Push to Azure Container Registry
9. Deploy to Azure
10. OIDC federation and passwordless Azure authentication
11. Rollback, approvals, and deployment strategies

**Outcome:** create a repeatable build-test-scan-deploy pipeline.

**Status (2026-09-21):** In progress — Chapters 1-10 done, real pipeline working end to end:
- **Ch 1-6**: reviewed/extended the real `ci.yml` from Module 2 rather than a fresh example.
- **Ch 7-8**: added `docker-build-scan` (Trivy). Found and fixed a real CRITICAL CVE (`python-jose`) and HIGH (`starlette`, pinned old by `fastapi`) in the backend; documented one unfixable transitive CVE (`pyasn1`) with reasoning; handled the frontend's 37 base-image OS findings via a differentiated severity policy rather than a giant ignore list.
- **Ch 9**: chose **GitHub Container Registry over ACR** (~$5/mo saved) after directly questioning whether ACR's advantages actually applied here — they didn't yet.
- **Ch 10**: real OIDC federation built (App Registration, Federated Credential scoped to `main` only, `Contributor` role on the RG — role assignment run by the user, same pattern as Module 5's RBAC moment). `deploy` job scoped deliberately to proving the passwordless auth works, not a full app rollout (Key Vault secrets management isn't in place until Module 11).
- **Real CI failure caught and fixed**: an invented `trivy-action` version tag broke the actual GitHub Actions run — found via a real failed run, fixed by verifying real tags via `WebFetch` instead of guessing.

**Module 7 COMPLETE — all 11 chapters, real pipeline, real approval gate.** After fixing a real Federated Credential subject mismatch (GitHub's actual OIDC subject includes numeric IDs after owner/repo, not the plain documented format), the pipeline ran green end to end. Chapter 11 added a real GitHub Environment (`production`) with a Required-reviewers gate — discovered live that simply adding `environment: production` to the job created the environment with **zero protection rules** by default (no approval prompt appeared); fixed by explicitly checking Required reviewers in Settings, which then broke OIDC auth again with a *second* subject-format mismatch (environment-based subject differs from ref-based), fixed with a second Federated Credential. Final run showed a genuine pause (`waiting for review`), a real manual approval, and `deploy` succeeding only afterward — the complete CD-with-a-gate loop verified live, not just written as YAML. Full chapter content for all 11 chapters in the frontend curriculum browser. See LEARNING_LOG.md "Module 7" for full chapter-by-chapter detail.

### Module 8 — Kubernetes Fundamentals

1. Why orchestration
2. Kubernetes architecture
3. Pods and containers
4. Deployments and ReplicaSets
5. Services and service discovery
6. ConfigMaps and Secrets
7. Namespaces and RBAC
8. Health probes and resource requests/limits
9. Ingress
10. Rolling updates and rollback
11. Kubernetes troubleshooting

**Outcome:** understand the core Kubernetes control model before using AKS.

**Status (2026-09-21):** In progress — Chapters 1-5 done, with a real, working 3-node HA cluster, not a conceptual walkthrough:
- User explicitly requested self-managed Kubernetes instead of AKS to avoid cost and to learn the control-plane mechanics directly — matches this project's own "learn the concept before the Azure service" philosophy.
- Hit a real hard blocker creating a 3rd VM: this subscription's Central India regional vCPU quota (4, already fully used by `app-vm1`+`app-vm2`) can't be increased via self-service (`ResourceNotAvailableForOffer` — a Free Trial-offer restriction). User's own idea: reuse the dormant Phase 1 VM (`azureops-vm01`) as the 3rd node instead of provisioning a new one — zero new vCPU request.
- `azureops-vm01` is in a different region (southindia) and a different, unpeered VNet — set up real bidirectional VNet peering (`azureops-vnet` centralindia <-> `azureops-vm01VNET` southindia), added NSG rules scoped to each other's address space (not Internet) for k3s's required ports, and verified real cross-region connectivity (~17-18ms ping) before installing anything.
- Installed **k3s** (chosen over kubeadm for being genuinely production-grade but bundling CNI/storage/ingress in one binary, better suited to modest `Standard_B2s_v2` nodes) as a true 3-node HA server cluster (embedded etcd, `--cluster-init` + 2 joins), spanning two Azure regions.
- Verified for real, not assumed: `kubectl get nodes` showed all 3 `Ready` with `control-plane,etcd` roles; deployed a real 3-replica workload, confirmed the scheduler spread one pod per node automatically; **stopped k3s on one node to simulate a real failure** — confirmed the API server stayed responsive (etcd quorum survived on 2/3 nodes) and new scheduling still worked; restarted the node and confirmed full recovery.
- Zero new Azure compute cost — reused `app-vm1`/`app-vm2` (Module 6) and `azureops-vm01` (Phase 1), all already-paid-for VMs.

**Module 8 COMPLETE — all 11 chapters**, every one built and verified for real on the live 3-node cluster:
- **Ch 6** (ConfigMaps/Secrets): real objects, confirmed a Secret is base64-encoded (not encrypted) by decoding one directly.
- **Ch 7** (Namespaces/RBAC): a real ServiceAccount + scoped Role + RoleBinding, permission boundary tested with `kubectl auth can-i` (allowed in-scope, denied for an ungranted verb, denied in a different namespace) — not just described.
- **Ch 8** (health probes/resources): a genuine liveness-probe restart (verified via events), and a real OOMKill that took **three attempts** to demonstrate correctly — first a memory limit too low for container init itself, then discovered `/dev/shm` has its own independent size cap separate from the pod's cgroup memory limit (writing to it doesn't test the limit at all), finally succeeded with real process-heap allocation.
- **Ch 9** (Ingress): a real public-internet `curl` (from outside the cluster entirely, via `azureops-vm01`'s public IP) through Traefik → Service → pod, confirmed alternating between both replicas — genuine external L7 routing, not `kubectl`-only verification.
- **Ch 10** (rolling updates/rollback): a real successful update, a real broken update (bad image tag, correctly stuck in `ImagePullBackOff` while all 3 old healthy pods stayed running), and a real `kubectl rollout undo` recovering cleanly — closes the loop Module 7 Chapter 11 could only describe conceptually.
- **Ch 11** (troubleshooting): synthesized from the module's own real incidents rather than staged — a container-name assumption that silently broke an image update, the two failed OOM attempts, and the intentionally-broken rollout, all diagnosed from actual `describe`/`logs`/status output.

Full chapter content for all 11 chapters in the frontend curriculum browser. See LEARNING_LOG.md "Module 8" for full detail.

### Module 9 — Azure Kubernetes Service (AKS)

1. AKS architecture and responsibilities
2. Nodes, node pools, networking
3. Identity and workload identity
4. Container Registry integration
5. Deploy AzureOps Copilot to AKS
6. Ingress and TLS
7. Autoscaling
8. Observability
9. Upgrade and maintenance concepts
10. AKS cost and security fundamentals

**Outcome:** deploy and operate a realistic workload on managed Kubernetes.

### Module 10 — Monitoring & Observability

1. Metrics vs logs vs traces
2. SLIs, SLOs, error budgets
3. Azure Monitor and Log Analytics
4. Application Insights
5. Alerts and action groups
6. Structured application logging
7. Prometheus and Grafana concepts
8. Tracing the /chat path
9. Incident troubleshooting lab
10. Dashboard and alert design

**Outcome:** detect, investigate, and explain production behavior.

### Module 11 — Azure Security & Governance

1. Shared responsibility
2. Entra ID and RBAC
3. Managed identities
4. Key Vault
5. Network security
6. Secret rotation and secure configuration
7. WAF and common web threats
8. Defender for Cloud concepts
9. Azure Policy and tagging governance
10. Security scanning in CI
11. Least privilege and threat-aware architecture

**Outcome:** secure the application and its delivery pipeline without hard-coded secrets.

### Module 12 — Azure Front Door & Production Edge

1. Reverse proxy and edge delivery
2. Front Door architecture
3. Endpoints, routes, domains, origins, origin groups
4. Health probes and failover
5. TLS/custom domains
6. Caching and rule sets
7. WAF at the edge
8. Front Door vs Application Gateway vs Load Balancer vs Traffic Manager
9. Multi-region architecture
10. Failure testing and recovery
11. Production design review

**Outcome:** understand when and how Front Door fits into a global Azure application.

### Module 13 — Infrastructure as Code with Terraform

1. Why IaC
2. Terraform workflow and state
3. Providers, resources, variables, outputs
4. Modules and reusable patterns
5. Remote state and locking
6. Secrets and sensitive values
7. Terraform plan/apply/destroy
8. Azure networking and compute as code
9. Drift and import
10. CI validation for Terraform
11. Rebuild AzureOps from IaC alone

**Outcome:** capture everything built manually across Modules 1-12 as code, and prove it by rebuilding from Terraform alone. Moved to the end of the roadmap (2026-09-21) — consolidating IaC once, after all the manual infrastructure work is done, rather than learning Terraform mid-sequence before most of what it would capture even exists yet.

## Capstone — AzureOps Copilot

Build the system progressively:

```
Internet
   |
Azure Front Door + WAF
   |
Azure Load Balancer / Ingress
   |
Compute: VMSS or AKS
   |
Azure Container Registry
   |
FastAPI + React
   |
Redis ---- Qdrant
   |
Azure services for secrets, monitoring, and storage
```

Delivery path:

```
Developer
  -> GitHub
  -> GitHub Actions
  -> test
  -> security scan
  -> container build
  -> ACR
  -> Azure deployment
  -> monitoring
```

Final capstone requirements:

- Multi-environment configuration
- IaC-only rebuild
- CI/CD with OIDC
- No application secrets in Git
- Health probes and failover test
- Monitoring, logs, traces, and alerts
- Backup and restore test
- Documented architecture and runbook
- Cost review and teardown procedure

## Recommended order of daily study

For each chapter:

1. Read the concept
2. Run the commands yourself
3. Break something intentionally
4. Diagnose and fix it
5. Add what you learned to LEARNING_LOG.md
6. Answer the interview questions without notes
7. Connect the concept to Azure
8. Commit the work to GitHub

## Milestones

- Milestone 1: Linux + Git + networking fundamentals
- Milestone 2: Dockerized application running locally
- Milestone 3: First Azure deployment
- Milestone 4: CI/CD pipeline
- Milestone 5: Infrastructure as Code
- Milestone 6: Kubernetes/AKS
- Milestone 7: Observability + security
- Milestone 8: Front Door + multi-region capstone

## Deferred goal — devopspk.online via Azure Front Door

2026-09-21: explicit end goal — publish the AzureOps Copilot frontend on
`devopspk.online` through Azure Front Door, as hands-on practice for
Module 12 (Front Door & Production Edge — renumbered 2026-09-21 when
Terraform moved to the end of the roadmap as Module 13). Deliberately
deferred until Phase 1 (Linux fundamentals) is finished, per the
foundations-first philosophy above — tracked here so it isn't lost. When
picked up, it belongs after Module 6 (Azure Networking, custom VNet/NSG/LB)
and pairs with Module 12's chapters (Front Door architecture, custom
domains/TLS, WAF at the edge).

## Deferred decision — app-tier Load Balancer: managed vs. software

2026-09-21: `azureops-lb` (Azure Standard Load Balancer, Module 6 Chapter 5)
is being kept running for now for direct comparison against the
cost-conscious choices made elsewhere in this module (Chapter 7's software
WAF). Explicit decision: **defer the final managed-vs-software call for the
app tier until Module 8** (Kubernetes Fundamentals — renumbered 2026-09-21
when Terraform moved to the end of the roadmap), when the Qdrant 3-node
cluster is built — at
that point, design one consistent software-LB approach (e.g. HAProxy) that
can inform (or directly cover) both the app tier (`app-vm1`/`app-vm2`,
currently behind `azureops-lb`) and whatever fronts the Qdrant cluster,
rather than making two separate one-off decisions. Note these are related
but distinct problems: the app tier is plain HTTP load balancing; Qdrant
has its own internal Raft-based clustering, so its "load balancing" need

**Update, 2026-09-21 (later same day):** a real 3-node self-managed
Kubernetes cluster now exists (k3s, spanning `app-vm1`/`app-vm2`/
`azureops-vm01`), with Traefik already running as a bundled Ingress
controller. This changes the shape of this decision: for anything that
ends up running *inside* the cluster (the app tier, and potentially Qdrant
if it's deployed as a StatefulSet there), Kubernetes' own Service/Ingress
primitives are the natural "software LB" answer — no separate HAProxy
investigation needed for that traffic. `azureops-lb` and the standalone
`app-vm1`/`app-vm2` VM-based deployment from Module 6 remain a valid,
separate comparison point (VM-based vs. cluster-based), not necessarily
something to migrate away from immediately. Final call still deferred to
whichever Module 8 chapter actually builds Ingress + deploys a real
workload through it.
is more likely a thin connection proxy than a full LB replacement.

## Out of scope initially

Jenkins, AWS/GCP breadth, deep database internals, advanced distributed-systems theory, and large-scale platform engineering are deferred until the core Azure DevOps path is complete.
