# Infrastructure as Code

Empty in Week 1 on purpose — Weeks 1-3 are built by hand (VM, VNet/NSG, VMSS,
Load Balancer, Front Door, Key Vault) so the manual steps and the "why" behind
each resource are understood first.

Terraform (or Bicep) files land here in **Week 4**, capturing everything built
in Weeks 1-3 so the capstone (`PLAN.md`) — delete everything, redeploy from
code alone — actually proves the infra is fully codified.

Planned structure once populated:

```
infra/
  main.tf / main.bicep
  network.tf            # VNet, subnets, NSGs
  compute.tf             # VMSS, Load Balancer
  vector-store.tf        # 3-node Qdrant cluster
  security.tf            # Key Vault, Managed Identity, Azure Policy
  variables.tf / outputs.tf
```
