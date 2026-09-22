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
kubectl apply -f ingress-tls-domain.yaml         # IngressRoute: devopspk.online + www, one SAN cert via Let's Encrypt
```

## Notes

- **Images**: `ghcr.io/consciouslake/azureops-backend:latest` and
  `azureops-frontend:latest`, built and published by `.github/workflows/ci.yml`
  on every merge to `main`. Both packages must be public (no image pull
  secret is configured) — see Package settings on GitHub.
- **Auto-redeploy**: `ci.yml`'s `deploy` job (after its manual approval gate)
  now also runs `kubectl rollout restart` for `backend` and `frontend` against
  the live cluster via `az vm run-command`, then checks `/health` and `/`
  really respond afterward. Added after a real gap was hit: publishing a
  fresh `:latest` image doesn't make a running pod pull it — Module 12's
  curriculum content sat stale in production until someone noticed and ran
  the restart by hand. No new Azure permission was needed; the OIDC
  identity's existing `Contributor` role (flagged, deliberately left as-is,
  in Module 11's RBAC audit) already covers `az vm run-command`.
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
  their own kubeconfig. **`headlamp-ingress-temp.yaml` is a deliberately
  temporary public route** (`/headlamp` on `devopspk.online`, `priority:
  1000` — needed to unambiguously beat the catch-all Ingress's own
  Traefik-computed default priority, based on its rule string's length)
  added only so the user could view it in a browser without a working
  local `kubectl` tunnel. **Remove this Ingress once no longer needed** —
  `kubectl delete -f headlamp-ingress-temp.yaml` — a cluster-admin login
  screen shouldn't sit on the public internet indefinitely.
