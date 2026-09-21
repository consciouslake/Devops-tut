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

---

## Phase 1 — Linux fundamentals VM — 2026-09-21

**Plan item(s):** Module 1 first project — one Ubuntu VM, default networking, SSH in, deploy a simple Python app as a systemd service.

**What I did:**
- Rewrote PLAN.md/added CURRICULUM.md from the original Week 1-4 calendar into a 13-module foundations-first roadmap (Linux → Git → Networking → Docker → Azure → Azure Networking → CI/CD → Terraform → K8s → AKS → Monitoring → Security → Front Door last). Renamed branch `day1-vnet-vm` → `phase1-linux-vm` to match.
- Hit `SkuNotAvailable` creating a VM with `Standard_B2s` in Central India, then `Standard_B1s`/`Standard_D2s_v3`/`Standard_A1_v2` across Central India, Southeast Asia, and East US — all failed identically despite vCPU quota showing headroom (limit 4, used 0). Root cause: a capacity/eligibility restriction Azure applies to new subscriptions, separate from quota.
- Found the fix by discovering a pre-existing, unrelated VM (`ububtu-server-01`, `Standard_B2s_v2`, southindia) already running successfully — proved that SKU+region combo works. Created `azureops-vm01` the same way and it succeeded immediately.
- Discovered two problems via Cost Management in the portal: (1) the Day 0 budget was created as ₹200/month instead of the intended $200 — the REST body never specified currency, so it silently used the subscription's billing currency (INR); current spend was already ~9.8x over it. (2) the budget was subscription-wide, so unrelated pre-existing resources (`rg-linux-lab` VM running since 2026-09-14, `bob-test-rg` container registry) were consuming it.
- Fixed the budget to ₹16,600/month (~$200 at current rate) via `az rest` PUT, keeping it subscription-wide. Deleted `rg-linux-lab` and `bob-test-rg`.
- Deployed a minimal Python `http.server` app on `azureops-vm01` as a systemd unit (`pyapp.service`, `Restart=always`, runs as `azureadmin` not root).
- Hit a second real bug: external `curl` to the VM's public IP on port 8000 failed even though the app worked fine locally on the VM. Cause: `az vm create` with default networking only opens port 22 — port 8000 was never opened. Fixed with `az vm open-port --port 8000`, confirmed working from both the VM and externally afterward.
- Verified self-healing: killed the app's PID manually, confirmed via `journalctl -u pyapp` that systemd detected the deactivation, incremented the restart counter, and relaunched it with a new PID within ~2 seconds — no gap in `curl` availability from outside.
- Practiced `chmod`/`chown` on `app.py`, checked disk usage (`df -h`, 7% used) and `$PATH`/environment.
- Built a Module → Chapter curriculum browser into the frontend (replacing the old flat 8-topic list), with full detailed content for all 9 chapters of Module 1 written into `frontend/src/data/curriculum.ts`. Rebuilt the Docker frontend image to pick it up (was serving a 12-hour-stale build on port 5173).

**Commands used:**
```bash
AZ="/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az"
RG="azureops-copilot-rg"

# Failed attempts (SkuNotAvailable) — kept for the record:
"$AZ" vm create -g $RG -n azureops-vm01 --image Ubuntu2204 --size Standard_B2s --location centralindia ...
"$AZ" vm create -g $RG -n azureops-vm01 --image Ubuntu2204 --size Standard_B1s --location centralindia ...
"$AZ" vm create -g $RG -n azureops-vm01 --image Ubuntu2204 --size Standard_D2s_v3 --location centralindia ...
"$AZ" vm create -g $RG -n azureops-vm01 --image Ubuntu2204 --size Standard_A1_v2 --location centralindia ...
"$AZ" vm create -g $RG -n azureops-vm01 --image Ubuntu2204 --size Standard_B1s --location eastus ...

# What worked:
"$AZ" vm list -d -o table   # found ububtu-server-01 already running as Standard_B2s_v2/southindia
"$AZ" vm create -g $RG -n azureops-vm01 --image Ubuntu2204 --size Standard_B2s_v2 \
  --admin-username azureadmin --generate-ssh-keys --location southindia --tags project=azureops-copilot

# Budget fix
"$AZ" rest --method put \
  --uri "https://management.azure.com/subscriptions/<sub-id>/providers/Microsoft.Consumption/budgets/azureops-copilot-monthly?api-version=2021-10-01" \
  --body "@budget-body-fix.json"   # amount corrected to 16600 (INR)

# Cleanup
"$AZ" group delete --name rg-linux-lab --yes --no-wait
"$AZ" group delete --name bob-test-rg --yes --no-wait

# NSG fix
"$AZ" vm open-port --resource-group $RG --name azureops-vm01 --port 8000

# On the VM
sudo apt update && sudo apt install -y python3
sudo systemctl daemon-reload
sudo systemctl enable --now pyapp
sudo kill <pid>   # then watched systemd auto-restart via journalctl -u pyapp
```

**What broke / what I learned:**
- `SkuNotAvailable` errors that persist across multiple sizes AND multiple regions (including a large region like East US) are not real capacity shortages — they're a subscription-level restriction new/trial Azure accounts get. Quota (`az vm list-usage`) showing headroom doesn't rule this out; it's a separate mechanism. The fix is a support request (Compute-VM quota) or finding a SKU/region combo already proven to work in that subscription.
- Azure budgets are created in the subscription's billing currency regardless of what number you pass — never assume `amount: 200` means $200 without checking `currentSpend.unit` on the resulting object.
- `az vm create` with default (auto-created) networking only opens SSH (port 22). Any other port the app needs must be opened explicitly with `az vm open-port` or an NSG rule — a working `curl localhost:8000` on the VM itself proves nothing about external reachability.
- A Docker container serving a built frontend bundle doesn't reflect source changes until rebuilt — `docker compose up -d --build <service>` needed, hot-reload only applies to a real dev server.

**Cost check:** `rg-linux-lab` (VM + disk + public IP) and `bob-test-rg` (Container Registry) deleted — stopped an unrelated, unbudgeted spend. `azureops-vm01` (Standard_B2s_v2, southindia) deallocated at end of session. Budget corrected to ₹16,600/month, subscription-wide, alerts still enabled at 50/75/90% to praveen@devopspk.online.

---

## Module 2 — Git & GitHub — 2026-09-21

**Plan item(s):** Module 2 — version control mental model, core workflow, undo (restore/reset/revert/reflog), branches/PRs, merge conflicts/rebase, repo hygiene + gitleaks, GitHub Issues/Projects, GitHub Actions intro, troubleshooting lab.

**What I did:**
- Opened and merged a real PR (`phase1-linux-vm` → `main`) covering the whole Phase 1 session — 3 CI checks passed before merge.
- Resolved a real merge conflict earlier in the session (not staged as an exercise).
- Practiced undo commands deliberately: made a throwaway commit, undid it with `git revert` (safe for shared/pushed history — creates a new commit rather than rewriting), then used `git reset --soft` to collapse the scratch+revert pair back to a clean state (safe only because neither commit had been pushed), and confirmed via `git reflog` that both "removed" commits were still recoverable by hash even though `git log` no longer showed them.
- Found gitleaks (secret scanning) had never actually been set up despite being in the original Day 0 plan. Added `.pre-commit-config.yaml` (gitleaks pre-commit hook) and a `gitleaks` job in `.github/workflows/ci.yml`. Verified it actually works: a realistic fake AWS key blocked the commit (exit code 1); gitleaks' own well-known placeholder example key (`AKIAIOSFODNN7EXAMPLE`) correctly passed (allowlisted to avoid flagging docs/tutorials) — first test used a malformed key that accidentally didn't match the regex at all, had to redo it with a valid-length key to get a real signal.
- Confirmed `backend/.env` is genuinely gitignored (`git check-ignore -v`).
- Created a GitHub Project board (Backlog/In Progress/Done) for active work items, separate from PLAN.md/CURRICULUM.md which hold the fixed curriculum.
- Wrote full chapter content for all 9 chapters of Module 2 into the frontend curriculum browser, using this session's real Git work as the examples instead of generic ones.

**Commands used:**
```bash
git branch -m day1-vnet-vm phase1-linux-vm
git fetch origin && git checkout main && git pull origin main
git branch -d phase1-linux-vm   # after merge
git checkout phase2

pip install pre-commit
pre-commit install
pre-commit run --all-files

# undo practice
git commit -m "scratch: undo-practice commit (will be reverted)"
git revert --no-edit HEAD
git reset --soft <prior-commit>
git reflog -5
```

**What broke / what I learned:**
- A `git reset --hard` mid-session wiped an uncommitted edit to `ci.yml` along with the intended test file — had to redo the edit. Lesson: `reset --hard` discards *all* uncommitted changes, not just the ones you're thinking about; check `git status` immediately before running it.
- gitleaks allowlists well-known placeholder secrets from documentation (like AWS's own `AKIAIOSFODNN7EXAMPLE`) to cut false positives — don't use textbook example keys to test whether a secret scanner works, they may be intentionally ignored.

**Cost check:** No new Azure spend this module — pure Git/GitHub work.
