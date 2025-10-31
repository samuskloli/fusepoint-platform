#!/usr/bin/env bash
set -euo pipefail

# Déploiement complet côté serveur distant (htaccess, index, assets, validations)
# Variables requises:
#   REMOTE  : login@host (ex: user@fusepoint.ch)
#   DOCROOT : racine du site (ex: /var/www/fusepoint.ch/html)
#   DOMAIN  : domaine (ex: https://fusepoint.ch)
# Usage:
#   REMOTE="user@fusepoint.ch" DOCROOT="/var/www/fusepoint.ch/html" DOMAIN="https://fusepoint.ch" ./scripts/deploy-remote.sh

REMOTE=${REMOTE:-}
DOCROOT=${DOCROOT:-}
DOMAIN=${DOMAIN:-}

if [[ -z "${REMOTE}" || -z "${DOCROOT}" || -z "${DOMAIN}" ]]; then
  echo "[x] Merci de définir REMOTE, DOCROOT et DOMAIN" >&2
  echo "    Exemple: REMOTE=user@beta.fusepoint.ch DOCROOT=/var/www/beta.fusepoint.ch/html DOMAIN=https://beta.fusepoint.ch $0" >&2
  exit 1
fi

# Vérifier les artefacts de build
if [[ ! -f "dist/index.html" || ! -f "dist/app/index.html" ]]; then
  echo "[x] Artefacts manquants. Lancez d'abord: npm run build" >&2
  exit 1
fi

echo "[1/8] Upload du .htaccess racine (remote)…"
scp -q ./.htaccess.remote "${REMOTE}:${DOCROOT}/.htaccess"

echo "[2/8] Upload des .htaccess build (dist/ et dist/app/)…"
scp -q ./dist/.htaccess "${REMOTE}:${DOCROOT}/dist/.htaccess"
scp -q ./dist/app/.htaccess "${REMOTE}:${DOCROOT}/dist/app/.htaccess"

echo "[3/8] Sauvegarde et remplacement de l'index racine…"
ssh -o StrictHostKeyChecking=accept-new "${REMOTE}" \
  "if [[ -f '${DOCROOT}/index.html' ]]; then cp -a '${DOCROOT}/index.html' '${DOCROOT}/index.html.bak.$(date +%Y%m%d%H%M%S)'; fi"
scp -q ./dist/index.html "${REMOTE}:${DOCROOT}/index.html"

echo "[4/8] Upload SPA index et assets…"
scp -q ./dist/app/index.html "${REMOTE}:${DOCROOT}/dist/app/index.html"
rsync -a --delete ./dist/assets/ "${REMOTE}:${DOCROOT}/dist/assets/"

echo "[5/8] Vérification de fichiers essentiels côté serveur…"
ssh -o StrictHostKeyChecking=accept-new "${REMOTE}" \
  "ls -l '${DOCROOT}/.htaccess' '${DOCROOT}/index.html' '${DOCROOT}/dist/app/index.html' '${DOCROOT}/dist/.htaccess' '${DOCROOT}/dist/app/.htaccess' || true"

echo "[6/8] Nettoyage potentiel de pages de maintenance…"
ssh -o StrictHostKeyChecking=accept-new "${REMOTE}" \
  "for f in '${DOCROOT}/index_maint.html' '${DOCROOT}/maintenance.html' '${DOCROOT}/index_maintenance.html'; do if [[ -f \"$f\" ]]; then mv \"$f\" \"$f.bak.$(date +%s)\"; fi; done"

echo "[7/8] Tests HTTP de la SPA…"
CODE_APP=$(curl -s -o /dev/null -w "%{http_code}" "${DOMAIN}/app/login")
if [[ "${CODE_APP}" != "200" ]]; then
  echo "[!] /app/login a répondu ${CODE_APP}. Vérifiez vhost/AllowOverride et .htaccess." >&2
else
  echo "✓ /app/login renvoie 200"
fi
if curl -fsS "${DOMAIN}/app/login" | grep -q 'id="app"'; then
  echo "✓ SPA index détecté dans /app/login"
else
  echo "[!] Le contenu de /app/login ne ressemble pas à la SPA." >&2
fi

echo "[8/8] Test de santé API (si proxifiée)…"
if curl -fsS "${DOMAIN}/api/health" >/dev/null 2>&1; then
  echo "✓ API /api/health OK via ${DOMAIN}"
else
  echo "[!] API non joignable via ${DOMAIN}/api/health. Proxy Apache ou frontend node requis."
fi

echo "Terminé. Si la page de maintenance persiste, désactivez le mode maintenance dans le Manager Infomaniak et assurez AllowOverride All sur le vhost."