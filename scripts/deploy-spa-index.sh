#!/usr/bin/env bash
set -euo pipefail

# Minimal deployment helper for SPA index
# Usage:
#   REMOTE="user@beta.fusepoint.ch" \
#   DOCROOT="/var/www/beta.fusepoint.ch/html" \
#   DOMAIN="https://beta.fusepoint.ch" \
#   ./scripts/deploy-spa-index.sh

REMOTE=${REMOTE:-}
DOCROOT=${DOCROOT:-}
DOMAIN=${DOMAIN:-}

if [[ -z "${REMOTE}" || -z "${DOCROOT}" || -z "${DOMAIN}" ]]; then
  echo "[x] Please set REMOTE, DOCROOT and DOMAIN environment variables." >&2
  echo "    Example: REMOTE=user@beta.fusepoint.ch DOCROOT=/var/www/beta.fusepoint.ch/html DOMAIN=https://beta.fusepoint.ch $0" >&2
  exit 1
fi

LOCAL_INDEX="dist/app/index.html"
REMOTE_INDEX="${DOCROOT}/dist/app/index.html"

if [[ ! -f "${LOCAL_INDEX}" ]]; then
  echo "[x] Local file not found: ${LOCAL_INDEX}. Build your SPA first (e.g., npm run build)." >&2
  exit 1
fi

echo "[1/4] Backing up remote index…"
ssh -o StrictHostKeyChecking=accept-new "${REMOTE}" \
  "if [[ -f '${REMOTE_INDEX}' ]]; then cp -a '${REMOTE_INDEX}' '${REMOTE_INDEX}.bak.$(date +%Y%m%d%H%M%S)'; fi"

echo "[2/4] Uploading new SPA index…"
scp -q "${LOCAL_INDEX}" "${REMOTE}:${REMOTE_INDEX}"

echo "[3/4] Verifying deployed /dist/app/index.html…"
if curl -fsS "${DOMAIN}/dist/app/index.html" | grep -q 'id="app"'; then
  echo "    ✓ Found <div id=\"app\"></div> in SPA index"
else
  echo "[x] Validation failed: could not find id=\"app\" in ${DOMAIN}/dist/app/index.html" >&2
  exit 1
fi

echo "[4/4] Verifying /app/login route serves SPA…"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${DOMAIN}/app/login")
if [[ "${STATUS}" != "200" ]]; then
  echo "[x] Unexpected status for /app/login: ${STATUS}" >&2
  exit 1
fi

# Quick smoke-check: page should not contain landing-only markers
if curl -fsS "${DOMAIN}/app/login" | grep -qi "Chaque entreprise"; then
  echo "[x] /app/login still looks like the landing page. Investigate server-side caching or the index file." >&2
  exit 1
fi

echo "All good. Try ${DOMAIN}/app/login in a private window."