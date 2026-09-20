#!/usr/bin/env bash
# AzureOps Copilot deploy script — Week 1 stub.
#
# Week 1: pulls images from ACR and runs docker-compose on the single VM.
# Week 2+: this gets replaced by the VMSS rolling-update path; keep this
# version around as the "what Week 1 looked like" reference in git history
# rather than deleting it.
set -euo pipefail

REMOTE_DIR="${REMOTE_DIR:-/home/azureuser/azureops-copilot}"

echo "[deploy] pulling latest images and restarting the app stack..."
ssh "${VM_USER:?set VM_USER}@${VM_HOST:?set VM_HOST}" "cd ${REMOTE_DIR} && \
  docker compose pull && \
  docker compose up -d --remove-orphans"

echo "[deploy] done."
