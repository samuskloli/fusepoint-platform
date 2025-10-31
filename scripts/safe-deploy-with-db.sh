#!/usr/bin/env bash
set -euo pipefail

# Déploiement SÉCURISÉ du code + mise à niveau du schéma de la base distante (sans perte de données)
# - Pousse les commits locaux et met à jour le code sur le serveur (via scripts/push-deploy.sh)
# - Sauvegarde la base distante (mysqldump horodaté) avant toute action
# - Met à niveau le schéma de la base (création de tables manquantes, ajout de colonnes) via server/services/databaseService
#   → Aucune suppression/écrasement de données
#   → Les INSERT de templates par défaut sont désactivés (DISABLE_DEFAULT_TEMPLATES=1)
# - Vérifie rapidement la base distante après migration
#
# Usage:
#   ./scripts/safe-deploy-with-db.sh [--auto-commit] [--skip-db] [--dry-run]
#
# Options:
#   --auto-commit : effectue automatiquement git add/commit si des modifications locales non commit sont présentes
#   --skip-db     : déploie le code uniquement, sans toucher à la base distante
#   --dry-run     : affiche les actions sans les exécuter

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOY_CONFIG="$SCRIPT_DIR/deploy.config"
DBSYNC_CONFIG="$SCRIPT_DIR/db-sync.config"

AUTO_COMMIT="false"
SKIP_DB="false"
DRY_RUN="false"

for arg in "$@"; do
  case "$arg" in
    --auto-commit) AUTO_COMMIT="true" ;;
    --skip-db)     SKIP_DB="true" ;;
    --dry-run)     DRY_RUN="true" ;;
  esac
done

function info(){ echo "[INFO] $*"; }
function warn(){ echo "[WARN] $*"; }
function err(){ echo "[ERROR] $*"; }

if [[ ! -f "$DEPLOY_CONFIG" ]]; then
  err "Configuration de déploiement introuvable: $DEPLOY_CONFIG"
  exit 1
fi
if [[ ! -f "$DBSYNC_CONFIG" ]]; then
  err "Configuration DB sync introuvable: $DBSYNC_CONFIG"
  exit 1
fi

# shellcheck source=/dev/null
source "$DEPLOY_CONFIG"
# shellcheck source=/dev/null
source "$DBSYNC_CONFIG"

REMOTE="$REMOTE_USER@$REMOTE_HOST"
DATE_ISO="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
TS="$(date +"%Y%m%d-%H%M%S")"

if [[ "$AUTO_COMMIT" == "true" ]]; then
  if [[ -n "$(git status --porcelain)" ]]; then
    info "Commit automatique des modifications locales…"
    git add -A
    git commit -m "deploy: $DATE_ISO"
  else
    info "Aucune modification locale à commit."
  fi
else
  if [[ -n "$(git status --porcelain)" ]]; then
    warn "Des modifications locales non commit sont présentes. Utilisez --auto-commit pour commit automatiquement ou committez manuellement avant."
  fi
fi

if [[ "$DRY_RUN" == "true" ]]; then
  info "[DRY-RUN] Déploiement du code via scripts/push-deploy.sh"
else
  info "Déploiement du code via scripts/push-deploy.sh (git push + update remote + PM2)…"
  "$SCRIPT_DIR/push-deploy.sh"
fi

if [[ "$SKIP_DB" == "true" ]]; then
  info "Option --skip-db activée → aucun traitement de base de données."
  exit 0
fi

# Étape DB sécurisée: backup complet puis migration schéma sans perte
REMOTE_BACKUPS_DIR="$REMOTE_PATH/backups/db"
REMOTE_BACKUP_FILE="$REMOTE_BACKUPS_DIR/${REMOTE_DB_NAME}.backup.$TS.sql.gz"

info "Préparation dossier de sauvegarde distant: $REMOTE_BACKUPS_DIR"
if [[ "$DRY_RUN" == "true" ]]; then
  info "[DRY-RUN] ssh $REMOTE 'mkdir -p $REMOTE_BACKUPS_DIR'"
else
  ssh "$REMOTE" "mkdir -p $REMOTE_BACKUPS_DIR"
fi

info "Sauvegarde distante (mysqldump) de $REMOTE_DB_NAME → $REMOTE_BACKUP_FILE"
MYSQLDUMP_CMD="mysqldump -h $REMOTE_DB_HOST -P ${REMOTE_DB_PORT:-3306} -u $REMOTE_DB_USER -p'$REMOTE_DB_PASS' --single-transaction --quick --default-character-set=utf8mb4 $REMOTE_DB_NAME | gzip -c > $REMOTE_BACKUP_FILE"
if [[ "$DRY_RUN" == "true" ]]; then
  info "[DRY-RUN] ssh $REMOTE \"$MYSQLDUMP_CMD\""
else
  ssh "$REMOTE" "$MYSQLDUMP_CMD"
fi

info "Mise à niveau du schéma distante via node/server (sans inserts par défaut)"
DB_MIGRATE_CMD="cd '$REMOTE_PATH' && DISABLE_DEFAULT_TEMPLATES=1 node -e \"require('./server/services/databaseService').initialize().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)})\""
if [[ "$DRY_RUN" == "true" ]]; then
  info "[DRY-RUN] ssh $REMOTE \"$DB_MIGRATE_CMD\""
else
  ssh "$REMOTE" "$DB_MIGRATE_CMD"
fi

info "Vérification rapide: nombre de tables et quelques colonnes clés"
VERIFY_CMD=$(cat <<'EOF'
mysql -h "$REMOTE_DB_HOST" -P ${REMOTE_DB_PORT:-3306} -u "$REMOTE_DB_USER" -p"$REMOTE_DB_PASS" -e "\
SELECT COUNT(*) AS tables FROM information_schema.tables WHERE table_schema='${REMOTE_DB_NAME}';\
SHOW TABLES FROM ${REMOTE_DB_NAME};\
DESCRIBE ${REMOTE_DB_NAME}.users;"
EOF
)

if [[ "$DRY_RUN" == "true" ]]; then
  info "[DRY-RUN] ssh $REMOTE <<VERIFY_CMD"
else
  # shellcheck disable=SC2029
  ssh "$REMOTE" "REMOTE_DB_HOST='$REMOTE_DB_HOST' REMOTE_DB_PORT='${REMOTE_DB_PORT:-3306}' REMOTE_DB_USER='$REMOTE_DB_USER' REMOTE_DB_PASS='$REMOTE_DB_PASS' REMOTE_DB_NAME='$REMOTE_DB_NAME' bash -lc \"$VERIFY_CMD\""
fi

info "Déploiement sécurisé terminé. Backup: $REMOTE_BACKUP_FILE"