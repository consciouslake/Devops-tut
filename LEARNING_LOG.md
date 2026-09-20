# Learning Log

Daily entries — what you did, what broke, what you learned, and the exact
`az`/`docker`/`terraform` commands used. Keep entries factual and specific;
this file is also ingested by AzureOps Copilot as part of its own knowledge base.

## Template

```
## Day N — YYYY-MM-DD

**Plan item(s):** (copy the checklist line(s) from PLAN.md)

**What I did:**
-

**Commands used:**
```bash

```

**What broke / what I learned:**
-

**Cost check:** (anything left running that shouldn't be)
```

---

## Day 0 — 2026-09-20

**Plan item(s):** Repo scaffolded, plan written.

**What I did:**
- Initialized `Devops-tut` repo, created README/PLAN/ARCHITECTURE, folder scaffold for backend/frontend/vector-store/infra/scripts.

**Commands used:**
```bash
git init
git branch -M main
mkdir -p backend frontend vector-store infra scripts .github/workflows docs
```

**What broke / what I learned:**
- N/A yet — starting Day 1 next.

**Cost check:** No Azure resources created yet.

---

## Day 0 (cont.) — Azure setup — 2026-09-20

**Plan item(s):** `az login`/subscription check, budget alert, region choice, resource group + tag convention.

**What I did:**
- Confirmed `az` CLI was already logged in (not on PATH in this shell — had to call the full install path directly).
- Checked Availability Zone support for `Standard_B2s` across Central India, Southeast Asia, East US — Central India supports zones 1/2/3, so picked it as the project region (also lowest latency for me).
- Discovered `az consumption budget create`'s `--notifications` flag doesn't exist in this CLI version (the `consumption` command group is preview and missing it) — had to call the Cost Management REST API directly via `az rest` instead.
- Created a $200/month budget with email alerts at 50/75/90% to praveen@devopspk.online.
- Created the resource group with the `project=azureops-copilot` tag.

**Commands used:**
```bash
AZ="/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az"

"$AZ" account show -o table
"$AZ" vm list-skus --location centralindia --size Standard_B2s --query "[0].locationInfo[0].zones" -o tsv

# az consumption budget create --notifications ... FAILED: flag doesn't exist in this CLI version.
# Used the REST API directly instead:
"$AZ" rest --method put \
  --uri "https://management.azure.com/subscriptions/<sub-id>/providers/Microsoft.Consumption/budgets/azureops-copilot-monthly?api-version=2021-10-01" \
  --body "@budget-body.json"

"$AZ" group create --name azureops-copilot-rg --location centralindia --tags project=azureops-copilot
```

**What broke / what I learned:**
- The `az consumption budget` CLI command group is explicitly marked preview/limited — it can create a budget's amount/period but not its notification emails. The full feature set lives in the underlying ARM/REST API (`Microsoft.Consumption/budgets`), reachable via `az rest`. Lesson: when an `az` subcommand feels oddly limited, check if it's a thin wrapper over a richer REST API before assuming the feature doesn't exist.
- `az` wasn't on this shell's PATH despite being installed — had to reference the full binary path. Worth fixing PATH before Day 1's hands-on work to avoid retyping it constantly.

**Cost check:** Resource group + budget created, no billable resources yet (RG itself is free). First real spend starts at Day 4 (VM/VNet/NSG).
