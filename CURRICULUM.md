# Azure DevOps Chapter Content

This document expands the roadmap into the content to study in each chapter.

## Module 1 — Linux & Bash

### Chapter 1 — Linux and the DevOps operating model
Learn what an operating system does, why Linux dominates server environments, shells vs terminals, kernel vs user space, and how DevOps interacts with servers.

Hands-on:
```bash
uname -a
whoami
hostname
pwd
```

Azure connection: Linux VMs, container hosts, AKS nodes.

### Chapter 2 — Filesystem navigation
Learn /, /home, /etc, /var, /tmp, absolute vs relative paths, files vs directories.

Hands-on:
```bash
pwd
ls -la
cd
mkdir
touch
cp
mv
rm
cat
less
```

### Chapter 3 — Users, groups, permissions
Learn users, groups, ownership, rwx permissions, numeric modes, sudo.

Hands-on:
```bash
id
ls -l
chmod
chown
sudo
```

### Chapter 4 — Processes
Learn PID, foreground/background jobs, signals, CPU/memory inspection.

Hands-on:
```bash
ps aux
top
pgrep
kill
jobs
```

### Chapter 5 — Services and logs
Learn systemd units, service lifecycle, boot-time services, journal logs.

Hands-on:
```bash
systemctl status docker
systemctl restart docker
journalctl -u docker
```

### Chapter 6 — Packages and environment
Learn apt, repositories, environment variables, PATH, shell startup files.

Hands-on:
```bash
apt update
apt install
echo $PATH
export APP_ENV=dev
```

### Chapter 7 — Bash scripting
Learn variables, conditions, loops, functions, exit codes, positional arguments and safe scripting.

Project: write a deploy-check script that verifies Docker, disk space, memory, application port, and /health.

### Chapter 8 — SSH, cron, hardening
Learn key-based SSH, ssh client config, cron scheduling, basic host hardening.

Project: schedule a backup script.

### Chapter 9 — Linux troubleshooting
Work through broken permissions, failed services, full disks, missing ports, bad environment variables and DNS failures.

---

## Module 2 — Git & GitHub

### Chapter 1 — Git mental model
Working tree, staging area, repository, commit graph, distributed version control.

### Chapter 2 — Core workflow
```bash
git init
git status
git add
git commit
git log
git diff
git push
git pull
```

### Chapter 3 — Undo safely
Learn restore, reset, revert, reflog and the difference between local and published history.

### Chapter 4 — Branches and pull requests
Learn branch isolation, feature branches, protected main, pull request review.

### Chapter 5 — Merge conflicts and rebase
Resolve conflicts, understand merge commits vs rebasing, and know when not to rewrite shared history.

### Chapter 6 — Repository hygiene
.gitignore, README, tags, releases, conventional commit messages, secret scanning.

### Chapter 7 — GitHub collaboration
Issues, project boards, milestones, review etiquette and linking code to work.

### Chapter 8 — GitHub Actions introduction
Learn workflow files, triggers, runners, jobs, steps and artifacts. Keep deployment for Module 7.

### Chapter 9 — Git troubleshooting
Recover from bad merges, detached HEAD, non-fast-forward push, accidental secret commit and broken branch state.

---

## Module 3 — Networking

### Chapter 1 — Fundamentals
IP addresses, MAC addresses, ports, protocols, client/server model.

### Chapter 2 — TCP/IP and OSI
Understand layers as troubleshooting boundaries rather than memorization.

### Chapter 3 — IPv4 and CIDR
Learn subnet masks, network/broadcast addresses, usable ranges, private address space.

Practice converting CIDR ranges and designing small Azure subnets.

### Chapter 4 — DNS
A/AAAA/CNAME/TXT records, recursive vs authoritative DNS, TTL, caching.

Hands-on:
```bash
nslookup example.com
dig example.com
```

### Chapter 5 — HTTP/HTTPS
Methods, headers, status codes, cookies, reverse proxying and TLS handshake concepts.

Hands-on:
```bash
curl -I https://example.com
curl -v https://example.com
```

### Chapter 6 — Routing and NAT
Default gateway, route tables, SNAT/DNAT concepts and private-to-public connectivity.

### Chapter 7 — Firewalls
Host firewall vs network firewall, allow/deny rules, stateful filtering.

### Chapter 8 — Load balancing and reverse proxy
L4 vs L7, health probes, TLS termination, path-based routing.

### Chapter 9 — Troubleshooting toolkit
ping, traceroute, curl, ss/netstat, ip, route, dig/nslookup.

### Chapter 10 — Azure network lab
Build a VNet, subnet, NSG and application path from scratch.

---

## Module 4 — Docker

### Chapter 1 — Containers
Process isolation, immutable images, container lifecycle.

### Chapter 2 — Images and layers
Docker image layers, tags, registries, reproducibility.

### Chapter 3 — Dockerfile
Base images, COPY, RUN, ENV, EXPOSE, CMD, ENTRYPOINT, multi-stage builds.

### Chapter 4 — Storage and networking
Volumes, bind mounts, bridge networks, container-to-container DNS.

### Chapter 5 — Configuration
Environment variables, .env for local development, secret handling principles.

### Chapter 6 — Compose
Multi-container application definition, dependency ordering, health checks.

### Chapter 7 — Debugging
docker ps, logs, exec, inspect, stats, restart behavior.

### Chapter 8 — Registry
ACR concepts, image naming, push/pull lifecycle and immutable version tags.

### Chapter 9 — Security
Run as non-root, minimal images, dependency scanning, Trivy and vulnerability triage.

### Chapter 10 — Project
Containerize AzureOps Copilot frontend, backend, Redis and Qdrant locally.

---

## Module 5 — Azure Fundamentals

### Chapter 1 — Azure geography
Regions, region pairs, availability zones, latency and resiliency.

### Chapter 2 — Tenant, subscription, resource group
Understand management boundaries and billing scope.

### Chapter 3 — ARM, tags, naming
Resources, resource providers, deployment model, naming standards and tags.

### Chapter 4 — CLI
```bash
az login
az account show
az group create
az resource list
```

### Chapter 5 — Identity
Microsoft Entra ID, RBAC, scopes, users, groups, service principals and managed identities.

### Chapter 6 — Compute
Compare VM, VMSS, App Service, Container Apps and Functions by control vs abstraction.

### Chapter 7 — Storage and data
Blob Storage, Files, disks and managed database concepts.

### Chapter 8 — Monitoring and cost
Budgets, tags, Azure Monitor, Log Analytics, cost-aware resource lifecycle.

### Chapter 9 — First Azure deployment
Create a resource group, network and a Linux VM; deploy a simple containerized service.

---

## Module 6 — Azure Networking

### Chapter 1 — VNet and subnet
Address design, subnet isolation and Azure routing.

### Chapter 2 — NSG
Inbound/outbound rules, priorities and troubleshooting.

### Chapter 3 — Public/private connectivity
Public IP, private IP, private DNS concepts.

### Chapter 4 — Route tables
User-defined routes, next hops and common routing mistakes.

### Chapter 5 — Azure Load Balancer
L4 load balancing, backend pools, probes and rules.

### Chapter 6 — Private Link
Private endpoints, service exposure without public ingress.

### Chapter 7 — Application Gateway/WAF
L7 proxy, TLS termination, URL routing, WAF inspection.

### Chapter 8 — Azure DNS
Public/private zones and DNS integration.

### Chapter 9 — Front Door
Global edge entry point, routing, origins, origin groups, health probes, TLS, caching, WAF.

### Chapter 10 — Network architecture lab
Build and troubleshoot the complete AzureOps traffic path.

---

## Module 7 — CI/CD

### Chapter 1 — CI/CD lifecycle
Commit -> test -> package -> scan -> release -> deploy -> verify -> rollback.

### Chapter 2 — Actions structure
YAML syntax, workflow triggers, jobs, steps, runners.

### Chapter 3 — Testing
Run Python tests and frontend checks on pull requests.

### Chapter 4 — Artifacts and caching
Publish build artifacts, cache dependencies and keep builds reproducible.

### Chapter 5 — Secrets
GitHub Secrets, environments, masking and secret handling rules.

### Chapter 6 — Container pipeline
Build Docker image, tag with commit SHA, run Trivy, push to ACR.

### Chapter 7 — Azure deployment
Deploy to target Azure environment and run post-deployment health checks.

### Chapter 8 — OIDC
Understand workload identity federation and eliminate long-lived Azure credentials from GitHub.

### Chapter 9 — Rollback
Immutable versions, deployment slots/strategy concepts, rollback procedure.

### Chapter 10 — Production pipeline
Add approvals, environment protection, failure notifications and evidence.

---

## Module 8 — Terraform

### Chapter 1 — IaC
Declarative infrastructure, reproducibility, review and drift.

### Chapter 2 — Terraform basics
```bash
terraform init
terraform fmt
terraform validate
terraform plan
terraform apply
terraform destroy
```

### Chapter 3 — Resources and variables
Provider configuration, resource blocks, input variables, locals, outputs.

### Chapter 4 — Modules
Reusable networking, compute and monitoring modules.

### Chapter 5 — State
Local vs remote state, state sensitivity, locking and state recovery.

### Chapter 6 — Secrets
Sensitive variables, external secret stores and what should never enter state unnecessarily.

### Chapter 7 — Azure infrastructure
Encode resource group, VNet, subnets, NSGs, VMSS, ACR, monitoring and Front Door.

### Chapter 8 — Drift/import
Detect out-of-band changes and import existing Azure resources.

### Chapter 9 — CI for IaC
terraform fmt/validate/plan on pull requests; controlled apply after review.

### Chapter 10 — Rebuild
Delete the environment and recreate it from Terraform.

---

## Module 9 — Kubernetes

### Chapter 1 — Why Kubernetes
Scheduling, desired state and self-healing.

### Chapter 2 — Architecture
Control plane, worker nodes, API server, scheduler, controllers, etcd concepts.

### Chapter 3 — Pods
Pod lifecycle and why containers are grouped.

### Chapter 4 — Deployments
Desired replicas, rollout and rollback.

### Chapter 5 — Services
ClusterIP, NodePort, LoadBalancer and service discovery.

### Chapter 6 — Config and secrets
ConfigMap, Secret, environment injection and mounted configuration.

### Chapter 7 — Health and resources
Startup/readiness/liveness probes, requests and limits.

### Chapter 8 — Ingress
HTTP routing and TLS termination.

### Chapter 9 — RBAC and namespaces
Isolation and least privilege.

### Chapter 10 — Troubleshooting
kubectl get/describe/logs/exec, events, rollout history and common failure modes.

---

## Module 10 — AKS

### Chapter 1 — AKS architecture
What Microsoft manages vs what you manage.

### Chapter 2 — Nodes and networking
Node pools, Azure CNI concepts, ingress and traffic path.

### Chapter 3 — Identity
Managed identity and workload identity.

### Chapter 4 — Registry integration
Pull private images from ACR.

### Chapter 5 — Application deployment
Deploy AzureOps Copilot with Helm.

### Chapter 6 — TLS and ingress
Expose the application securely.

### Chapter 7 — Scaling
Horizontal Pod Autoscaler and cluster/node scaling concepts.

### Chapter 8 — Operations
Logs, metrics, upgrades, node maintenance and disruption.

### Chapter 9 — Cost/security
Right-sizing, namespaces, network controls, identity and image hygiene.

### Chapter 10 — AKS project
Run the capstone workload end-to-end.

---

## Module 11 — Observability

### Chapter 1 — Three signals
Metrics, logs, traces and their relationship.

### Chapter 2 — SLI/SLO basics
Availability, latency, error rate and user-facing objectives.

### Chapter 3 — Azure Monitor
Metrics, activity logs, alerts and workbooks.

### Chapter 4 — Log Analytics
Queries with KQL and practical investigation.

### Chapter 5 — Application Insights
Request telemetry, dependencies, exceptions and traces.

### Chapter 6 — Structured logging
Consistent fields, correlation IDs and useful log levels.

### Chapter 7 — Prometheus/Grafana
Understand scraping, time series, dashboards and alerting.

### Chapter 8 — Trace the RAG path
Measure Redis lookup, embedding, Qdrant search and Gemini latency separately.

### Chapter 9 — Incident lab
Break a dependency and diagnose it from telemetry.

### Chapter 10 — Production dashboard
Create a concise dashboard and meaningful alerts.

---

## Module 12 — Security & Governance

### Chapter 1 — Shared responsibility
Know what Azure secures and what you must secure.

### Chapter 2 — Identity/RBAC
Scopes, role assignments and least privilege.

### Chapter 3 — Managed identity
Replace embedded credentials with workload identity.

### Chapter 4 — Key Vault
Secret lifecycle, access policies/RBAC, references and rotation.

### Chapter 5 — Network security
NSGs, private endpoints, WAF and secure ingress.

### Chapter 6 — CI security
Dependency scanning, container scanning, secret scanning and SAST.

### Chapter 7 — Defender for Cloud
Security posture and recommendation workflow.

### Chapter 8 — Azure Policy
Allowed SKUs, required tags and governance-as-code concepts.

### Chapter 9 — Threat modeling
Identify assets, trust boundaries and likely attack paths.

### Chapter 10 — Security review
Perform a practical review of AzureOps Copilot and remediate findings.

---

## Module 13 — Azure Front Door

### Chapter 1 — Why edge services exist
Latency, global routing, TLS termination and centralized ingress.

### Chapter 2 — Front Door architecture
Profile, endpoint, route, domain, origin group and origin.

### Chapter 3 — Routing
Path matching, forwarding, redirects and route precedence.

### Chapter 4 — Health probes/failover
Probe endpoint design, healthy/unhealthy origins and failover behavior.

### Chapter 5 — Custom domains/TLS
Domain validation and certificate lifecycle.

### Chapter 6 — Caching/rules
Cache behavior, rule sets, headers and redirects.

### Chapter 7 — WAF
Managed rules, custom rules, rate limiting concepts and logs.

### Chapter 8 — Service comparison
Front Door vs Application Gateway vs Load Balancer vs Traffic Manager.

### Chapter 9 — Multi-region
Design an active/active or active/passive application entry pattern.

### Chapter 10 — Failure lab
Disable an origin, observe health changes, verify routing, restore service.

### Chapter 11 — Production review
Document the request path, security boundaries, failure behavior and costs.

---

## Capstone chapters

### Chapter 1 — Local application
FastAPI + React + Redis + Qdrant.

### Chapter 2 — Containerization
Docker Compose and reproducible development.

### Chapter 3 — Azure landing zone
Resource group, VNet, identity, monitoring and budget controls.

### Chapter 4 — First deployment
Single compute target + ACR.

### Chapter 5 — High availability
VMSS/AKS + load balancing + health probes.

### Chapter 6 — Security
Key Vault, managed identity, WAF, network restrictions.

### Chapter 7 — CI/CD
GitHub Actions + tests + image scan + ACR + deployment + OIDC.

### Chapter 8 — IaC
Terraform manages all infrastructure.

### Chapter 9 — Observability
Azure Monitor/App Insights + Prometheus/Grafana.

### Chapter 10 — Global edge
Front Door, custom domain, WAF and failover.

### Chapter 11 — Disaster recovery
Backup, restore, failure test and documented recovery procedure.

### Chapter 12 — Final rebuild
Delete resources, recreate from IaC, verify application and record the rebuild evidence.
