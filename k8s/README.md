# AzureOps Copilot — Kubernetes deployment manifests

Deploys the real app (frontend, backend, Qdrant, Redis) onto the self-managed
k3s cluster built in Module 8, behind the Traefik Ingress already proven
working for Grafana in Module 10. Reuses existing infrastructure end to end —
no new Azure compute cost.

## Apply

```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
kubectl apply -f namespace.yaml -f qdrant.yaml -f redis.yaml -f backend.yaml -f frontend.yaml -f ingress.yaml
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
