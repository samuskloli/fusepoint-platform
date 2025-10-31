#!/bin/bash

# Configuration SSH
SSH_HOST="57-104354.ssh.hosting-ik.com"
SSH_USER="RhVNtynnzFS_sam"
SSH_PASS="Srn~CLb17&2*4"

echo "🚀 Début de la réinstallation complète de Fusepoint Platform"

# Fonction pour exécuter des commandes SSH
ssh_exec() {
    expect -c "
        spawn ssh $SSH_USER@$SSH_HOST \"$1\"
        expect \"password:\"
        send \"$SSH_PASS\r\"
        expect eof
    "
}

echo "📋 Étape 1: Nettoyage du serveur..."
ssh_exec "pkill -f node; pkill -f npm; echo 'Processus arrêtés'"

echo "📋 Étape 2: Sauvegarde de l'ancien projet..."
ssh_exec "cd /srv/customer && rm -rf sites/fusepoint-platform-backup-\$(date +%Y%m%d) && mv sites/fusepoint-platform sites/fusepoint-platform-backup-\$(date +%Y%m%d) 2>/dev/null || echo 'Pas de dossier existant'"

echo "📋 Étape 3: Clonage du projet depuis GitHub..."
ssh_exec "cd /srv/customer/sites && git clone https://github.com/samuskloli/fusepoint-platform.git"

echo "📋 Étape 4: Installation des dépendances backend..."
ssh_exec "cd /srv/customer/sites/fusepoint-platform/server && npm install"

echo "📋 Étape 5: Installation des dépendances frontend..."
ssh_exec "cd /srv/customer/sites/fusepoint-platform && npm install"

echo "📋 Étape 6: Build du frontend..."
ssh_exec "cd /srv/customer/sites/fusepoint-platform && npm run build"

echo "📋 Étape 7: Configuration de l'environnement..."
ssh_exec "cd /srv/customer/sites/fusepoint-platform/server && cp .env.example .env"

echo "📋 Étape 8: Démarrage de l'API..."
ssh_exec "cd /srv/customer/sites/fusepoint-platform/server && nohup node server.js > /dev/null 2>&1 &"

echo "✅ Installation terminée!"