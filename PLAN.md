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

**Status (2026-09-21):** Done — as a deliberate comparison-only chapter, no real AKS cluster created, per the explicit decision made before Module 8. Content grounded directly in what Module 8's real cluster required to build by hand (etcd HA, CNI, ServiceLB workaround, manual node provisioning, no autoscaling/managed upgrades) versus what AKS's managed control plane would have provided instead (Free tier control plane, native cloud LoadBalancer integration, Managed Identity for node/pod Azure access, cluster autoscaler, one-command upgrades). Framed honestly as a tool-fit decision, not "AKS is better" — every real incident from Module 8 (quota wall, tmpfs-vs-cgroup discovery, container-name gotcha) is the concrete answer to what a managed control plane would have hidden.

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

**Status (2026-09-22):** Done (core PLG stack) — driven by an explicit cost-consciousness request to compare paid Azure monitoring/logging (Azure Monitor, Log Analytics, Managed Grafana, Application Insights) against self-hosted alternatives before building anything. User chose the self-hosted PLG stack (Prometheus + Loki + Grafana) on the existing k3s cluster over any Azure-native option, even free tiers. Real work done:
- `kube-prometheus-stack` and `loki-stack` installed via Helm onto the real 3-node k3s cluster (Module 8's cluster) — Prometheus, Grafana, Alertmanager, kube-state-metrics, node-exporter (×3), Loki, Promtail (×3), all genuinely `Running`.
- Real bug hit and fixed: `az vm run-command invoke` executes as root with `$HOME` unset, so Helm's repo config didn't persist across separate invocations (`helm repo list` came back empty on the next call). Fixed with explicit `export HOME=/root`.
- Real incident hit and fixed: wiring a Loki datasource into Grafana via the standard sidecar ConfigMap pattern caused the new Grafana pod to `CrashLoopBackOff` on restart (`"Only one datasource per organization can be marked as default"`) while the old pod correctly stayed healthy (safe rolling update). Root cause: the `loki-stack` Helm chart auto-creates its own datasource ConfigMap (`loki-loki-stack`, `isDefault: true`) even with `grafana.enabled=false`, conflicting with `kube-prometheus-stack`'s own default Prometheus datasource. Fixed by deleting the redundant chart-generated ConfigMap.
- Verified end-to-end with real data, not just "pods are running": all 23 Prometheus scrape targets `up`; real logs queried back out of Loki; a Grafana dashboard ("AzureOps k3s Cluster Overview") created via the Grafana API with 5 panels (node CPU/memory, running pods by namespace, pod restarts, live Loki logs), and every panel's query independently re-run directly against Prometheus/Loki to confirm real values (~5-7% CPU, ~17-26% memory across all 3 nodes).
- Also exposed Grafana publicly for real viewing, reusing `azureops-vm01`'s existing public IP: a no-host Traefik `Ingress` for the Grafana service, plus one new NSG rule (port 80) — confirmed reachable at `http://20.235.48.180/` (`HTTP 200`), zero new Azure spend since the public IP and Traefik were already in place.
- **Alertmanager, made real (2026-09-22):** `kube-prometheus-stack` already bundles the needed `PrometheusRule` objects (`KubePodCrashLooping`, `KubeNodeNotReady`, `KubeNodeUnreachable`) — no new rules needed. What was missing was routing: the default config sent every alert to a `"null"` receiver. Deployed a minimal in-cluster webhook receiver (~20-line Python `http.server`, $0 cost) and patched Alertmanager's config Secret to route crash/node alerts to it. Verified two ways: a synthetic alert POSTed directly to Alertmanager's API (confirmed received and correctly routed via the receiver's logs), and a real deliberately-crashing test Deployment that genuinely reached `CrashLoopBackOff` before cleanup — proving the actual rule condition, not just the routing.
- **Cost outcome:** $0 marginal cost — entire stack (PLG + alerting + public Ingress) runs on infrastructure already provisioned in Module 8 / Phase 1.
- **OpenTelemetry tracing for `/chat`, done (2026-09-22):** checked the real code first — `rag.py` never actually used Redis (provisioned in `docker-compose.yml`, configured in `config.py`, but no caching logic exists), so the original "Redis vs Qdrant vs Gemini" plan was corrected to trace what's real: `embed` (Gemini embedding call), `qdrant_search`, and `gemini_generate`, wrapped in a per-message `chat_query` parent span (needed since WebSocket auto-instrumentation only covers the connection, not each message). Exports via OTLP/gRPC to a self-hosted Tempo container added to `docker-compose.yml` (local disk storage, $0 cost, no Application Insights). Verified with a real ingested chunk + a real chat query, not synthetic spans: real trace showed `chat_query` 4101.8ms total (`gemini_generate` 3401.4ms, `embed` 596.2ms, `qdrant_search` 85.9ms). Backend test suite still passes (1 passed).
- Full chapter content (6 chapters: cost comparison, PLG deployment, the datasource-conflict incident, the verified dashboard, Alertmanager routing, OpenTelemetry tracing) written in the frontend curriculum browser, plus the resolved Load Balancer decision chapter. See LEARNING_LOG.md "Module 10 — Monitoring & Observability" for details.

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

**Status (2026-09-22):** In progress — Chapters 3-4 (Managed identities, Key Vault) done for real, chapters 1-2 and 5-11 not yet started.
- Real Key Vault created (`azureops-copilot-kv`, Standard SKU, **RBAC authorization** — not the legacy access-policy model), with the app's two real secrets (`gemini-api-key`, `jwt-secret`) migrated off `.env` and into it.
- System-assigned Managed Identity enabled on `app-vm1`, granted `Key Vault Secrets User` (role assignment run by the user, per this project's standing rule that permission grants are never done autonomously). Verified genuinely working via the VM's raw IMDS endpoint (no `az` CLI installed on the VM) — real `HTTP 200` with the actual secret, value length checked but never printed to any output.
- Negative case verified too: `app-vm2` given an identity but **no** role — gets a valid IMDS token but a real `403 Forbidden`/`ForbiddenByRbac` from Key Vault, proving this is identity-based access control, not network-based.
- `backend/config.py` extended with an optional `AZURE_KEY_VAULT_NAME`-driven Key Vault secret-loading path (via `azure-identity` + `azure-keyvault-secrets`), falling back to `.env` unchanged when unset — local dev behavior unaffected, verified via a clean `/health` check after rebuild.
- **Real regression found and fixed:** Module 10's `azureops-lb` decommission had silently killed `app-vm1`/`app-vm2`'s internet egress (Standard LB rules provide implicit outbound SNAT by default; neither VM has its own public IP or NAT Gateway). Neither a plain restart nor a full deallocate/start cycle restored it. Fixed with a NAT Gateway on `app-subnet` (real, ongoing cost — exact rate not stated, Azure's pricing pages only show placeholders) after checking real pricing pages first and presenting the honest tradeoff to the user.
- **Real finding carried forward:** `JWT_SECRET` is configured but never actually used anywhere in the app — no endpoint has any authentication at all. Worth addressing in the "least privilege" chapter later.
- **Cost outcome:** real, deliberate ongoing spend added (Key Vault per-operation billing, NAT Gateway hourly + per-GB) — both load-bearing (secrets no longer in plaintext, VMs need real egress), not optional. See LEARNING_LOG.md "Module 11 — Security & Governance" for full details.
- **Not yet done:** Shared responsibility overview, Entra ID/RBAC review, network security chapter, secret rotation chapter, WAF, Defender for Cloud, Azure Policy, CI security scanning, least privilege/threat-aware architecture. Curriculum browser chapters for Module 11 not yet written — pending completion of more of the module before writing up.

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

**Resolved, 2026-09-22:** Final call made and executed. `azureops-lb` (Standard SKU — genuine ongoing cost, confirmed via `az network lb show`; exact rate not stated here since Azure's own pricing page only shows placeholder figures without the region-specific calculator) was still actively serving real traffic to the Module 1/6 demo stack (`pyapp.service` behind a `waf-proxy` ModSecurity container) on `app-vm1`/`app-vm2`. With Module 10 having now proven Traefik Ingress genuinely routing public traffic (Grafana, reachable at `http://20.235.48.180/`), there was no remaining reason to keep a paid LB running in parallel. Cutover:
- Redeployed the same demo app (identical `app.py` — `Hello from <hostname>` / `/health`) as a 2-replica Kubernetes Deployment + Service in the k3s cluster, with real readiness/liveness probes.
- Added a path-based Ingress rule (`/demo-app`) on the same Traefik instance already serving Grafana at `/` — verified both coexist correctly on one public IP via path-prefix routing, no separate LB/IP needed.
- Verified real load balancing: repeated `curl http://20.235.48.180/demo-app` alternated between both pod hostnames, exactly like the original 2-VM LB setup.
- Deleted `azureops-lb` and its public IP (`135.235.240.52`) — confirmed gone (`az network lb list` empty, old IP unreachable).
- Removed the now-unneeded NSG rules (`Allow-LB-Probe-8000/8080`, `Allow-Internet-8000/8080` on `app-subnet-nsg`) and stopped/disabled the redundant `pyapp.service` + `waf-proxy` container on both VMs.
- **Cost outcome:** one real, ongoing-cost Azure resource (Standard Load Balancer + its public IP) eliminated; the same functional behavior (load balancing, health checks) now runs at $0 marginal cost on infrastructure already paid for.

## Out of scope initially

Jenkins, AWS/GCP breadth, deep database internals, advanced distributed-systems theory, and large-scale platform engineering are deferred until the core Azure DevOps path is complete.
