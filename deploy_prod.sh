#!/usr/bin/env bash
set -euo pipefail

# Script de déploiement pour la production Infomaniak
# Informations de connexion pour le serveur de production

REMOTE_USER="ZDaULDMYSEC_sam"
REMOTE_HOST="57-104359.ssh.hosting-ik.com"
REMOTE_PASSWORD="35G0ke7I@Fz%~T"
REMOTE="${REMOTE_USER}@${REMOTE_HOST}"

# Configuration de la base de données distante
DB_HOST="tt3ae.myd.infomaniak.com"
DB_USER="tt3ae_sam"
DB_PASSWORD="JbW4D~7.@91.aGs"
DB_NAME="tt3ae_fusepoint"
DB_PORT="3306"

# Chemin sur le serveur distant
DOCROOT="/srv/customer/sites/fusepoint.ch"
DOMAIN="https://fusepoint.ch"

echo "🚀 Déploiement sur le serveur de production Infomaniak..."

# Vérifier que le build existe
if [[ ! -f "dist/index.html" || ! -f "dist/app/index.html" ]]; then
  echo "❌ Artefacts de build manquants. Le build a-t-il été effectué ?"
  exit 1
fi

echo "📁 Création des répertoires nécessaires sur le serveur..."
sshpass -p "${REMOTE_PASSWORD}" ssh -o StrictHostKeyChecking=no "${REMOTE}" \
  "mkdir -p ${DOCROOT}/{app,app/assets,uploads/lotties,dist,dist/app}"

echo "📤 Upload des fichiers .htaccess..."
sshpass -p "${REMOTE_PASSWORD}" scp -o StrictHostKeyChecking=no ./.htaccess.remote "${REMOTE}:${DOCROOT}/.htaccess"
sshpass -p "${REMOTE_PASSWORD}" scp -o StrictHostKeyChecking=no ./dist/.htaccess "${REMOTE}:${DOCROOT}/dist/.htaccess"
sshpass -p "${REMOTE_PASSWORD}" scp -o StrictHostKeyChecking=no ./dist/app/.htaccess "${REMOTE}:${DOCROOT}/dist/app/.htaccess"

echo "📤 Sauvegarde et upload de l'index principal..."
sshpass -p "${REMOTE_PASSWORD}" ssh -o StrictHostKeyChecking=no "${REMOTE}" \
  "if [[ -f '${DOCROOT}/index.html' ]]; then cp -a '${DOCROOT}/index.html' '${DOCROOT}/index.html.bak.$(date +%Y%m%d%H%M%S)'; fi"
sshpass -p "${REMOTE_PASSWORD}" scp -o StrictHostKeyChecking=no ./dist/index.html "${REMOTE}:${DOCROOT}/index.html"

echo "📤 Upload de l'application SPA..."
sshpass -p "${REMOTE_PASSWORD}" scp -o StrictHostKeyChecking=no ./dist/app/index.html "${REMOTE}:${DOCROOT}/app/index.html"

echo "📤 Upload des assets..."
sshpass -p "${REMOTE_PASSWORD}" scp -r -o StrictHostKeyChecking=no ./dist/assets/* "${REMOTE}:${DOCROOT}/app/assets/"

echo "📤 Upload des icônes et ressources publiques..."
sshpass -p "${REMOTE_PASSWORD}" scp -o StrictHostKeyChecking=no ./public/fusepoint-icon.svg "${REMOTE}:${DOCROOT}/app/fusepoint-icon.svg"
sshpass -p "${REMOTE_PASSWORD}" scp -o StrictHostKeyChecking=no ./public/fusepoint-logo.svg "${REMOTE}:${DOCROOT}/fusepoint-logo.svg"

echo "📤 Upload des animations Lottie..."
sshpass -p "${REMOTE_PASSWORD}" scp -r -o StrictHostKeyChecking=no ./public/lotties/* "${REMOTE}:${DOCROOT}/uploads/lotties/"

echo "✅ Déploiement des fichiers frontend terminé !"

echo "🔄 Redémarrage des services sur le serveur..."
sshpass -p "${REMOTE_PASSWORD}" ssh -o StrictHostKeyChecking=no "${REMOTE}" \
  "cd ${DOCROOT} && pm2 restart ecosystem.prod.config.js || echo 'PM2 restart failed, continuing...'"

echo "🎉 Déploiement terminé avec succès !"
echo "🌐 Votre application devrait être accessible à l'adresse : ${DOMAIN}"