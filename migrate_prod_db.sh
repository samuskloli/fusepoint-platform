#!/usr/bin/env bash
set -euo pipefail

# Script de migration de la base de données de production
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

# Chemin du projet sur le serveur
PROJECT_PATH="/srv/customer/sites/fusepoint.ch"

echo "🗄️  Mise à jour de la base de données de production..."

# Copier les fichiers de migration sur le serveur
echo "📤 Upload des fichiers de migration..."
sshpass -p "${REMOTE_PASSWORD}" scp -r -o StrictHostKeyChecking=no ./server/migrations/ "${REMOTE}:${PROJECT_PATH}/server/"

# Copier aussi les services nécessaires
echo "📤 Upload des services..."
sshpass -p "${REMOTE_PASSWORD}" scp -r -o StrictHostKeyChecking=no ./server/services/ "${REMOTE}:${PROJECT_PATH}/server/"

# Créer un fichier .env temporaire avec les informations de base de données
echo "📝 Configuration de l'environnement sur le serveur..."
sshpass -p "${REMOTE_PASSWORD}" ssh -o StrictHostKeyChecking=no "${REMOTE}" "cat > ${PROJECT_PATH}/.env.migration << 'EOF'
MARIADB_HOST=${DB_HOST}
MARIADB_USER=${DB_USER}
MARIADB_PASSWORD=${DB_PASSWORD}
MARIADB_DATABASE=${DB_NAME}
MARIADB_PORT=${DB_PORT}
EOF"

# Exécuter chaque migration individuellement
echo "🚀 Exécution des migrations sur le serveur..."

# Liste des migrations dans l'ordre
migrations=(
  "migrate_company_billing_and_user_profile.js"
  "migrate_config_column.js"
  "migrate_estimated_budget.js"
  "migrate_is_required_column.js"
  "migrate_linkpoint_event_enrichment.js"
  "migrate_note_categories.js"
  "migrate_notes_archive.js"
  "migrate_project_dashboards.js"
)

for migration in "${migrations[@]}"; do
  echo "🔄 Exécution de la migration: $migration"
  
  # Exécuter la migration sur le serveur
  sshpass -p "${REMOTE_PASSWORD}" ssh -o StrictHostKeyChecking=no "${REMOTE}" \
    "cd ${PROJECT_PATH} && NODE_ENV=production node server/migrations/$migration" || {
    echo "⚠️  Erreur lors de l'exécution de $migration, mais on continue..."
  }
done

# Nettoyer les fichiers temporaires
echo "🧹 Nettoyage..."
sshpass -p "${REMOTE_PASSWORD}" ssh -o StrictHostKeyChecking=no "${REMOTE}" \
  "rm -f ${PROJECT_PATH}/.env.migration"

echo "✅ Mise à jour de la base de données terminée !"