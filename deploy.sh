#!/usr/bin/env bash
# Local build & SSH deploy script
# Usage:
#   ./deploy.sh                  # deploy all services
#   ./deploy.sh social-api       # deploy single service
#   ./deploy.sh social-api web   # deploy multiple services

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
SSH_HOST="aliyun-root"
REMOTE_DIR="/opt/youthloop"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# service name → image name → Dockerfile context
declare -A IMAGE_MAP=(
  [social-api]="youthloop/social-api:latest"
  [game-api]="youthloop/game-api:latest"
  [social-worker]="youthloop/social-worker:latest"
  [web]="youthloop/web:latest"
)

declare -A CONTEXT_MAP=(
  [social-api]="$SCRIPT_DIR/apps/social-api"
  [game-api]="$SCRIPT_DIR/apps/game-api"
  [social-worker]="$SCRIPT_DIR/apps/social-worker"
  [web]="$SCRIPT_DIR/apps/web"
)

# ── Helpers ───────────────────────────────────────────────────────────────────
log()  { echo "[$(date '+%H:%M:%S')] $*"; }
err()  { echo "[ERROR] $*" >&2; exit 1; }

build_and_push() {
  local svc=$1
  local image="${IMAGE_MAP[$svc]}"
  local ctx="${CONTEXT_MAP[$svc]}"
  local tar_file="/tmp/${svc}.tar"

  log "Building $svc → $image"
  docker build -t "$image" "$ctx"

  log "Saving image to $tar_file"
  docker save "$image" -o "$tar_file"

  log "Transferring to server ($SSH_HOST)..."
  scp "$tar_file" "${SSH_HOST}:/tmp/${svc}.tar"

  log "Loading image on server..."
  ssh "$SSH_HOST" "docker load -i /tmp/${svc}.tar && rm /tmp/${svc}.tar"

  rm -f "$tar_file"
  log "$svc done ✓"
}

# ── Main ──────────────────────────────────────────────────────────────────────
# Determine which services to deploy
if [[ $# -eq 0 ]]; then
  SERVICES=("social-api" "game-api" "social-worker" "web")
else
  SERVICES=("$@")
fi

# Validate service names
for svc in "${SERVICES[@]}"; do
  [[ -v IMAGE_MAP[$svc] ]] || err "Unknown service: $svc. Valid: ${!IMAGE_MAP[*]}"
done

log "=== Deploy started: ${SERVICES[*]} ==="

# Build & transfer each service
for svc in "${SERVICES[@]}"; do
  build_and_push "$svc"
done

# Ensure compose.yml and .env.production are up to date on server
log "Syncing compose.yml and .env.production to server..."
ssh "$SSH_HOST" "mkdir -p $REMOTE_DIR"
scp "$SCRIPT_DIR/infra/docker/compose.yml" "${SSH_HOST}:${REMOTE_DIR}/compose.yml"
scp "$SCRIPT_DIR/.env.production"          "${SSH_HOST}:${REMOTE_DIR}/.env"

# Restart only the deployed services
log "Restarting services on server..."
ssh "$SSH_HOST" "cd $REMOTE_DIR && docker compose -f compose.yml --env-file .env up -d --no-deps ${SERVICES[*]}"

log "=== Deploy complete ==="
ssh "$SSH_HOST" "docker ps --format 'table {{.Names}}\t{{.Status}}' | grep youthloop"
