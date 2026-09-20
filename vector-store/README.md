# Vector store — Qdrant

- **Local / Week 1-3:** single Qdrant node via the root `docker-compose.yml`.
- **Week 4:** 3-node Qdrant cluster on Azure (one node per Availability Zone),
  configured for distributed mode per
  [Qdrant's clustering docs](https://qdrant.tech/documentation/guides/distributed_deployment/).
  This is the "3-node clustering" lesson from PLAN.md — killing the current
  leader node should trigger re-election without the app losing availability.

Cluster config (Bicep/Terraform + Qdrant peer config) lands in `../infra/`
and here once Week 4 starts — nothing to do here yet in Weeks 1-3.
