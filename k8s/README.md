# AzureOps Copilot — Kubernetes deployment manifests

Deploys the real app (frontend, backend, Qdrant) onto the self-managed
k3s cluster built in Module 8, behind the Traefik Ingress already proven
working for Grafana in Module 10. Reuses existing infrastructure end to end —
no new Azure compute cost. (Redis was deployed originally but removed —
it was never actually used by any app code.)

## Apply

```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
kubectl apply -f namespace.yaml -f qdrant.yaml -f tempo.yaml -f backend.yaml -f frontend.yaml -f waf.yaml -f ingress.yaml
kubectl apply -f tempo-grafana-datasource.yaml   # adds Tempo to the monitoring namespace's Grafana
kubectl apply -f traefik-tls-config.yaml         # HelmChartConfig, cluster-wide (kube-system)
kubectl apply -f ingress-tls-domain.yaml         # IngressRoute: devopspk.online + www + staging, one SAN cert via Let's Encrypt
```

**Staging** (`k8s/staging/`, first-time-only manual bootstrap — namespace,
PVC and Service objects, same as production above):
```bash
kubectl apply -f staging/namespace.yaml -f staging/qdrant.yaml -f staging/backend.yaml -f staging/frontend.yaml
```
After that, CI owns staging entirely — see "CI/CD" below.

## Cluster & workload commands

Quick reference for this specific cluster — every command here was actually
run against it. For the full teaching context (why each one, what broke
first), see Module 8 "Kubernetes Fundamentals" in the app's own curriculum
browser, or `LEARNING_LOG.md` for the narrative version.

**Bootstrap (already done — for reference/rebuild only):**
```bash
# first control-plane node
curl -sfL https://get.k3s.io | sh -s - server --cluster-init --node-ip=10.10.1.4 --advertise-address=10.10.1.4   # app-vm1

# additional nodes join the same cluster via --server + the first node's token
curl -sfL https://get.k3s.io | K3S_TOKEN='<token>' sh -s - server --server https://10.10.1.4:6443 --node-ip=10.10.1.5 --advertise-address=10.10.1.5   # app-vm2
curl -sfL https://get.k3s.io | K3S_TOKEN='<token>' sh -s - server --server https://10.10.1.4:6443 --node-ip=10.0.0.4 --advertise-address=10.0.0.4     # azureops-vm01
```

**Cluster & node inspection:**
```bash
kubectl get nodes -o wide                    # ROLES shows control-plane,etcd on all 3 -- real HA, not managed
kubectl get pods -A                          # every pod, every namespace
kubectl get pods -n azureops-copilot -o wide # this app's pods + which node each landed on
kubectl get svc -A                           # every Service, cluster-wide
kubectl get ingress,ingressroute -A          # every HTTP route into the cluster
```

**Everyday debugging (narrowest, most specific check first):**
```bash
kubectl describe pod <name> -n <namespace>              # events -- almost always the fastest answer
kubectl logs <name> -n <namespace>                      # current container output
kubectl logs <name> -n <namespace> --previous            # last crashed container's output
kubectl logs -n <namespace> -l app=<label> --tail 50     # by label, across replicas
kubectl get events -n <namespace> --sort-by=.lastTimestamp
kubectl auth can-i <verb> <resource> --as=<subject> -n <namespace>   # permission questions
```

**Scaling & rollouts:**
```bash
kubectl scale deployment <name> -n <namespace> --replicas=N
kubectl rollout status deployment <name> -n <namespace>
kubectl rollout restart deployment <name> -n <namespace>   # forces a fresh pull + restart, no manifest change needed
kubectl rollout undo deployment <name> -n <namespace>      # revert to the previous ReplicaSet
```

**Secrets/config (imperative, not committed to git — same pattern as Headlamp's own secrets below):**
```bash
kubectl create secret generic <name> -n <namespace> --from-literal=KEY=value
kubectl get secret <name> -n <namespace> -o jsonpath='{.data.KEY}' | base64 -d   # decode to verify -- base64 is encoding, not encryption
```

## Notes

- **Images**: `ghcr.io/consciouslake/azureops-backend:latest` and
  `azureops-frontend:latest`, built and published by `.github/workflows/ci.yml`
  on every merge to `main` (also pushed tagged by exact commit SHA — that
  SHA tag, not `:latest`, is what actually gets deployed; see below). Both
  packages must be public (no image pull secret is configured) — see
  Package settings on GitHub.
- **CI/CD — staging before production, deploy by SHA, automated rollback**:
  a merge to `main` no longer goes straight to production. `ci.yml` now
  runs `deploy-staging` (auto, no approval — the `staging` GitHub
  Environment has no required reviewers) against the
  `azureops-copilot-staging` namespace on this same cluster, smoke-tests it
  through `https://staging.devopspk.online`, and only THEN makes
  `deploy-production`'s manual-approval gate available
  (`needs: deploy-staging`). Both deploy jobs use `kubectl set image` to the
  exact `${{ github.sha }}`-tagged image, not `kubectl rollout restart`
  against the mutable `:latest` tag — "promote to production" means "run
  the literal image staging just verified," not "restart and hope the node
  re-pulls whatever `:latest` currently points to." Added after a real gap
  was hit: publishing a fresh `:latest` image doesn't make a running pod
  pull it — Module 12's curriculum content sat stale in production until
  someone noticed and ran a restart by hand; the fix is deploying by SHA,
  not relying on tag mutation at all. If production's post-deploy health
  check (`/`, `/health`) fails, a rollback step automatically runs
  `kubectl rollout undo` for both Deployments, re-checks health, and fails
  the job loudly either way — a caught bad deploy leaves production on the
  last-good image instead of the broken one. Same `az vm run-command`
  pattern throughout (no direct network path from a GitHub-hosted runner to
  the cluster's API server, it's VNet-only); no new Azure permission was
  needed, the OIDC identity's existing `Contributor` role (flagged,
  deliberately left as-is, in Module 11's RBAC audit) already covers it.
  Staging's manifests are fetched fresh from `raw.githubusercontent.com` at
  the exact deploying commit rather than a persistent git clone living on
  the VM, so there's no drift between what's in git and what staging
  applies.
- **Secrets**: the backend pod sets `AZURE_KEY_VAULT_NAME=azureops-copilot-kv`
  and fetches `GEMINI_API_KEY`/`JWT_SECRET` from Key Vault via Managed
  Identity at startup (Module 11) — no secret is stored in these manifests
  or in a Kubernetes Secret.
- **`nodeSelector: kubernetes.io/hostname: app-vm1`** on the backend
  Deployment: only `app-vm1` currently has the `Key Vault Secrets User` role
  granted to its Managed Identity. Removing this constraint (or granting the
  same role to `app-vm2`'s and `azureops-vm01`'s identities) would let the
  pod be scheduled on any node.
- **Routing**: the app owns `/` on the cluster's public IP
  (`20.235.48.180`). Grafana was moved to `/grafana` (see
  `grafana-subpath-persistence-values.yaml`, applied via
  `helm upgrade monitoring ... --reuse-values -f grafana-subpath-persistence-values.yaml`)
  to free up the root path — that Helm upgrade also turned on persistent
  storage for Grafana, since it previously had none and lost all
  API/UI-created dashboards on every pod restart.
- **Rate limiting**: `/ingest` and `/chat` are both limited in-app
  (`backend/rate_limit.py`) to protect the real, usage-billed Gemini API
  from being run up now that the app is public.
- **Resource `requests`/`limits`**: added to every container in
  `backend.yaml`, `frontend.yaml`, `qdrant.yaml`, `tempo.yaml`, `waf.yaml` —
  previously unset entirely, a real production gap (no scheduler placement
  guidance, no protection against one container starving a node). Sized off
  real `kubectl top pods` output, not guessed: `tempo` in particular sits
  around 512Mi even near-idle (trace buffering/compaction), so its request
  reflects that rather than a low, more "typical-looking" number that would
  under-represent its actual steady-state footprint. Rolled out one
  Deployment at a time, verifying `kubectl rollout status` and the live
  site (`/`, `/health`, `/grafana/login`) after each before moving to the
  next — no restarts, no OOMKills, all real usage comfortably inside the
  new limits.
- **WAF**: `waf.yaml` deploys `owasp/modsecurity-crs:nginx` (Module 6's
  self-hosted WAF pattern, rebuilt as a real Kubernetes workload) in front of
  `frontend`. The Ingress's `/` path now targets the `waf-proxy` Service
  instead of `frontend` directly — chosen over Application Gateway/Front
  Door WAF (~$33/month+ for App Gateway v2 alone) for $0 marginal cost.
  Verified against the live public IP: a real SQL-injection-style payload
  gets `HTTP 403`, normal HTTP and WebSocket (`/chat`) traffic passes
  through unaffected.
- **Tracing**: `tempo.yaml` deploys a real Tempo instance in-cluster
  (PVC-backed, same pattern as local dev's `docker-compose.yml` Tempo).
  `backend.yaml` sets `OTEL_ENABLED=true` and points
  `OTEL_EXPORTER_OTLP_ENDPOINT` at it — tracing is no longer local-dev-only.
  `tempo-grafana-datasource.yaml` wires it into the `monitoring` namespace's
  Grafana as a non-default datasource, alongside Prometheus and Loki.
- **TLS / custom domain (Module 12) — LIVE, real Let's Encrypt cert**:
  `traefik-tls-config.yaml` is a `HelmChartConfig` (the correct way to
  customize k3s's bundled Traefik) adding a real Let's Encrypt ACME
  resolver, HTTP-01 challenge, persistent `/data` for `acme.json`.
  `ingress-tls-domain.yaml` is a Traefik `IngressRoute` (not a plain
  Kubernetes `Ingress`) covering both `devopspk.online` and
  `www.devopspk.online` in **one** rule (`Host(...) || Host(...)`) with
  **one** `tls.domains` block (`main` + `sans`) — this matters: an earlier
  attempt using two separate host-based Ingress rules triggered two
  *concurrent* ACME certificate requests through the same resolver, which
  raced each other and both failed with a real, reproducible `403`
  (Let's Encrypt's HTTP-01 validator got a `404` for its own just-issued
  challenge token). A single `IngressRoute` requesting one SAN certificate
  for both hostnames avoids the race entirely — confirmed working:
  `curl https://devopspk.online/` and `https://www.devopspk.online/` both
  return real, trusted-cert `200`s, verified via `openssl s_client` showing
  `issuer=... Let's Encrypt` and both hostnames in the cert's SAN list.
  It's deliberately split from the catch-all `ingress.yaml` rather than
  adding `tls.hosts` to that Ingress directly: doing that once broke
  bare-IP access entirely, because Traefik restricts a router's *whole*
  rule (HTTP included) to the TLS hosts list when the Ingress rule itself
  has no `host` field. Azure Front Door (this module's namesake) could not
  actually be built — this subscription's Free Trial tier is explicitly
  blocked from creating any Front Door resource, confirmed via a real,
  failed `az afd profile create` call, not a guess.
- **Cluster UI — Headlamp, not the Kubernetes Dashboard**: the official
  Kubernetes Dashboard project is archived/unmaintained; Kubernetes itself
  now points to **Headlamp** (Kubernetes SIG-UI) instead. Installed via
  Helm (`headlamp-values.yaml` captures the real applied config —
  `-base-url=/headlamp` plus matching probe paths, both needed since the
  chart's defaults assume root-path serving). Its ServiceAccount is bound
  to `cluster-admin` by the chart's own default, judged acceptable here
  since it grants nothing beyond what the account owner already has via
  their own kubeconfig. `headlamp-ingress.yaml` is the **permanent**
  public route (`/headlamp` on `devopspk.online`, `priority: 1000` —
  needed to unambiguously beat the catch-all Ingress's own
  Traefik-computed default priority, based on its rule string's length).
  Gated by Headlamp's own Kubernetes bearer-token login only — a Traefik
  `basicAuth` Middleware was tried in front of it as a second, password-based
  layer, but **reverted**: Traefik's BasicAuth and Headlamp's own token both
  need the single `Authorization` header, and a request can't carry both at
  once — the browser's cached Basic credentials and Headlamp's JS-set Bearer
  token collided, confirmed with `curl` sending each in isolation (a
  Bearer-only request got rejected by Traefik with a `401` asking for Basic,
  proving the two mechanisms are fundamentally incompatible on the same
  route). Mint a fresh token any time with (run `ssh azureadmin@20.235.48.180`
  alone first if this is a new machine, to accept the host key):
  ```bash
  ssh azureadmin@20.235.48.180 "sudo kubectl -n headlamp create token headlamp --duration=1h"
  ```
