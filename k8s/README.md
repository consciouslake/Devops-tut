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
kubectl apply -f ingress-tls-domain.yaml         # devopspk.online / www, TLS via Let's Encrypt
```

## Notes

- **Images**: `ghcr.io/consciouslake/azureops-backend:latest` and
  `azureops-frontend:latest`, built and published by `.github/workflows/ci.yml`
  on every merge to `main`. Both packages must be public (no image pull
  secret is configured) — see Package settings on GitHub.
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
- **TLS / custom domain (Module 12)**: `traefik-tls-config.yaml` is a
  `HelmChartConfig` (the correct way to customize k3s's bundled Traefik)
  adding a real Let's Encrypt ACME resolver, HTTP-01 challenge, persistent
  `/data` for `acme.json`. `ingress-tls-domain.yaml` is a **separate**
  Ingress from `ingress.yaml` — explicit `host: devopspk.online` /
  `host: www.devopspk.online` rules plus the TLS/cert-resolver annotation.
  It's deliberately split from the catch-all `ingress.yaml` rather than
  adding `tls.hosts` to it directly: doing that once broke bare-IP access
  entirely, because Traefik restricts a router's *whole* rule (HTTP
  included) to the TLS hosts list when the Ingress rule itself has no
  `host` field. Azure Front Door (this module's namesake) could not
  actually be built — this subscription's Free Trial tier is explicitly
  blocked from creating any Front Door resource, confirmed via a real,
  failed `az afd profile create` call, not a guess.
