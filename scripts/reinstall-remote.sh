#!/usr/bin/env bash

set -euo pipefail

usage() {
  echo "Usage: $0 <ssh_user> <ssh_host> [--path /srv/customer/sites/fusepoint.ch/fusepoint-platform] [--branch main] [--pm2-config ecosystem.prod.config.js]" >&2
  exit 1
}

if [[ ${1:-} == "" || ${2:-} == "" ]]; then
  usage
fi

SSH_USER="$1"
SSH_HOST="$2"
shift 2

# Defaults
REMOTE_PATH="/srv/customer/sites/fusepoint.ch/fusepoint-platform"
BRANCH="main"
PM2_CONFIG="ecosystem.prod.config.js"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --path)
      REMOTE_PATH="${2:-}"; shift 2 ;;
    --branch)
      BRANCH="${2:-}"; shift 2 ;;
    --pm2-config)
      PM2_CONFIG="${2:-}"; shift 2 ;;
    *)
      echo "Unknown argument: $1" >&2; usage ;;
  esac
done

echo "[Reinstall] Connecting to ${SSH_USER}@${SSH_HOST} ..."

ssh "${SSH_USER}@${SSH_HOST}" bash -s <<EOF
set -euo pipefail

echo "[Reinstall] Working directory: ${REMOTE_PATH}"
cd "${REMOTE_PATH}"

echo "[Reinstall] Checking pm2 ..."
if ! command -v pm2 >/dev/null 2>&1; then
  echo "[Reinstall] pm2 not found, installing globally"
  npm i -g pm2
fi

echo "[Reinstall] Stopping existing PM2 apps (if any) ..."
pm2 stop fusepoint-frontend || true
pm2 stop fusepoint-api || true
pm2 delete fusepoint-frontend || true
pm2 delete fusepoint-api || true

echo "[Reinstall] Updating code to origin/${BRANCH} ..."
git fetch --all
git reset --hard "origin/${BRANCH}"

echo "[Reinstall] Cleaning node_modules ..."
rm -rf node_modules server/node_modules

echo "[Reinstall] Installing root dependencies with npm ci ..."
npm ci

echo "[Reinstall] Installing server dependencies with npm ci ..."
cd server && npm ci && cd -

echo "[Reinstall] Building frontend ..."
npm run build

echo "[Reinstall] Starting PM2 with ${PM2_CONFIG} ..."
pm2 start "${PM2_CONFIG}" --update-env
pm2 save
pm2 status

echo "[Reinstall] Health checks ..."
curl -I http://localhost:8080/app/login || true
curl -i http://localhost:3000/health || true

echo "[Reinstall] Done."
EOF

echo "[Reinstall] Remote reinstall finished."