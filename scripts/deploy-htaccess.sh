#!/usr/bin/env bash
set -euo pipefail

# Déploie les fichiers .htaccess du build vers le serveur distant.
# Usage:
#   REMOTE="user@fusepoint.ch" \
#   DOCROOT="/var/www/fusepoint.ch/html" \
#   ./scripts/deploy-htaccess.sh

REMOTE=${REMOTE:-}
DOCROOT=${DOCROOT:-}

if [[ -z "${REMOTE}" || -z "${DOCROOT}" ]]; then
  echo "[x] Merci de définir REMOTE et DOCROOT (ex: REMOTE=user@beta.fusepoint.ch DOCROOT=/var/www/beta.fusepoint.ch/html)" >&2
  exit 1
fi

ROOT_HTACCESS="dist/.htaccess"
SPA_HTACCESS="dist/app/.htaccess"

if [[ ! -f "${ROOT_HTACCESS}" || ! -f "${SPA_HTACCESS}" ]]; then
  echo "[x] Fichiers .htaccess introuvables dans dist/. Lancez d'abord: npm run build" >&2
  exit 1
fi

echo "[1/4] Sauvegarde des .htaccess distants…"
ssh -o StrictHostKeyChecking=accept-new "${REMOTE}" \
  "if [[ -f '${DOCROOT}/dist/.htaccess' ]]; then cp -a '${DOCROOT}/dist/.htaccess' '${DOCROOT}/dist/.htaccess.bak.$(date +%Y%m%d%H%M%S)'; fi; \
   if [[ -f '${DOCROOT}/dist/app/.htaccess' ]]; then cp -a '${DOCROOT}/dist/app/.htaccess' '${DOCROOT}/dist/app/.htaccess.bak.$(date +%Y%m%d%H%M%S)'; fi"

echo "[2/4] Upload des nouveaux .htaccess…"
scp -q "${ROOT_HTACCESS}" "${REMOTE}:${DOCROOT}/dist/.htaccess"
scp -q "${SPA_HTACCESS}" "${REMOTE}:${DOCROOT}/dist/app/.htaccess"

echo "[3/4] Vérification des règles SPA /app/…"
STATUS=$(ssh -o StrictHostKeyChecking=accept-new "${REMOTE}" "grep -q '^RewriteEngine On' '${DOCROOT}/dist/app/.htaccess' && echo OK || echo KO")
if [[ "${STATUS}" != "OK" ]]; then
  echo "[x] Validation échouée: dist/app/.htaccess ne contient pas les règles attendues" >&2
  exit 1
fi

echo "[4/4] Test rapide des routes /app/login…"
DOMAIN=${DOMAIN:-}
if [[ -n "${DOMAIN}" ]]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "${DOMAIN}/app/login")
  if [[ "${CODE}" != "200" ]]; then
    echo "[!] /app/login retourne le statut ${CODE}. Vérifiez la config Apache/Infomaniak." >&2
  else
    echo "✓ /app/login renvoie 200"
  fi
else
  echo "(Conseil) Définissez DOMAIN pour tester en HTTP: DOMAIN=https://fusepoint.ch $0"
fi

echo "Terminé. Les .htaccess sont déployés dans dist/ et dist/app/."