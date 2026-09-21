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

### Module 8 — Infrastructure as Code with Terraform

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

**Outcome:** provision and change Azure infrastructure safely through code.

### Module 9 — Kubernetes Fundamentals

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

### Module 10 — Azure Kubernetes Service (AKS)

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

### Module 11 — Monitoring & Observability

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

### Module 12 — Azure Security & Governance

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

### Module 13 — Azure Front Door & Production Edge

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

## Out of scope initially

Jenkins, AWS/GCP breadth, deep database internals, advanced distributed-systems theory, and large-scale platform engineering are deferred until the core Azure DevOps path is complete.
