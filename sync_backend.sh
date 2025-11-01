#!/bin/bash

# Configuration SSH et serveur
SSH_USER="ZDaULDMYSEC_sam"
SSH_HOST="57-104359.ssh.hosting-ik.com"
SSH_PASS="35G0ke7I@Fz%~T"
DOCROOT="/srv/customer/sites/fusepoint.ch"

echo "🔄 Synchronisation des fichiers backend modifiés..."

# Fonction pour exécuter des commandes SSH
ssh_exec() {
    sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "$1"
}

# Fonction pour copier des fichiers
scp_upload() {
    sshpass -p "$SSH_PASS" scp -o StrictHostKeyChecking=no -r "$1" "$SSH_USER@$SSH_HOST:$2"
}

echo "📤 Upload des services backend modifiés..."
scp_upload "server/services/" "$DOCROOT/"

echo "📤 Upload des routes backend modifiées..."
scp_upload "server/routes/" "$DOCROOT/"

echo "📤 Upload des scripts backend..."
scp_upload "server/scripts/" "$DOCROOT/"

echo "📤 Upload des utilitaires backend..."
scp_upload "server/utils/" "$DOCROOT/"

echo "📤 Upload des middlewares..."
scp_upload "server/middleware/" "$DOCROOT/"

echo "📤 Upload des configurations..."
scp_upload "server/config/" "$DOCROOT/"

echo "📤 Upload du fichier principal server.js..."
scp_upload "server/server.js" "$DOCROOT/server/"

echo "📤 Upload des types TypeScript..."
scp_upload "server/types.ts" "$DOCROOT/server/"

echo "📤 Upload des fichiers de configuration..."
scp_upload "server/package.json" "$DOCROOT/server/"
scp_upload "server/tsconfig.json" "$DOCROOT/server/"
scp_upload "server/nodemon.json" "$DOCROOT/server/"

echo "🔄 Redémarrage du serveur backend..."
ssh_exec "cd $DOCROOT && node server/server.js &"

echo "✅ Synchronisation backend terminée !"