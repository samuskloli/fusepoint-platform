#!/usr/bin/env bash
set -euo pipefail

# Ce script pousse les changements locaux vers le remote (via git) et déclenche une mise à jour sur le serveur de production,
# sans toucher aux paramètres sensibles (fichiers .env, accès DB) et en consignant un changelog avec date/heure et liste des commits.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="$SCRIPT_DIR/deploy.config"
LAST_DEPLOY_FILE="$SCRIPT_DIR/.last_deploy_commit"
CHANGELOG_LOCAL="$REPO_ROOT/docs/CHANGELOG.md"

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "Configuration introuvable: $CONFIG_FILE"
  echo "Créez le fichier à partir de scripts/deploy.config et ajustez REMOTE_USER, REMOTE_HOST, REMOTE_PATH, etc."
  exit 1
fi

# shellcheck source=/dev/null
source "$CONFIG_FILE"

REMOTE="$REMOTE_USER@$REMOTE_HOST"

function info(){ echo "[INFO] $*"; }
function warn(){ echo "[WARN] $*"; }
function err(){ echo "[ERROR] $*"; }

function confirm(){
  read -r -p "$1 [y/N] " response
  case "$response" in
    [yY][eE][sS]|[yY]) return 0;;
    *) return 1;;
  esac
}

# Vérification: statut du dépôt
if [[ -n "$(git status --porcelain)" ]]; then
  warn "Votre dépôt a des modifications non commit. Commitez ou stash avant de déployer."
  if ! confirm "Continuer malgré tout ?"; then
    exit 1
  fi
fi

CURRENT_COMMIT="$(git rev-parse HEAD)"
LAST_COMMIT=""
if [[ -f "$LAST_DEPLOY_FILE" ]]; then
  LAST_COMMIT="$(cat "$LAST_DEPLOY_FILE" || true)"
fi

# Préparer la liste des commits pour le changelog
if [[ -n "$LAST_COMMIT" ]]; then
  COMMITS_RANGE="$LAST_COMMIT..$CURRENT_COMMIT"
  COMMITS_LOG="$(git log --pretty=format:'- %h %s (%an)' --no-merges "$COMMITS_RANGE")"
else
  COMMITS_LOG="$(git log --pretty=format:'- %h %s (%an)' --no-merges -n 10)"
fi

DATE_ISO="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

info "Préparation du changelog pour $DATE_ISO"
mkdir -p "$(dirname "$CHANGELOG_LOCAL")"
{
  echo "## Déploiement $DATE_ISO";
  echo "Serveur: $REMOTE_HOST";
  echo "Branche: $GIT_BRANCH";
  echo "Chemin distant: $REMOTE_PATH";
  echo "";
  echo "Commits inclus:";
  echo "$COMMITS_LOG";
  echo "";
} >> "$CHANGELOG_LOCAL"

info "Changelog mis à jour dans $CHANGELOG_LOCAL"

if [[ "${DRY_RUN:-false}" == "true" ]]; then
  warn "DRY_RUN actif → aucun déploiement distant ne sera exécuté."
  exit 0
fi

if ! confirm "Pousser vos commits locaux vers $GIT_REMOTE/$GIT_BRANCH puis déployer sur $REMOTE_HOST ?"; then
  warn "Déploiement annulé par l’utilisateur."
  exit 0
fi

info "Push local → $GIT_REMOTE/$GIT_BRANCH"
git push "$GIT_REMOTE" "$GIT_BRANCH"

info "Mise à jour sur le serveur distant via SSH: $REMOTE"
SSH_UPDATE_CMD=$(cat <<'EOF'
set -euo pipefail
echo "[REMOTE] Début mise à jour"
cd "$REMOTE_PATH"
echo "[REMOTE] Git fetch/reset sur origin/$GIT_BRANCH"
git fetch "$GIT_REMOTE"
git reset --hard "origin/$GIT_BRANCH"

if [[ "${ENSURE_PM2_LOCAL}" == "true" ]]; then
  echo "[REMOTE] Installation locale de pm2 (si nécessaire)"
  npm i pm2 --no-audit --no-fund --no-progress --no-save || true
fi

echo "[REMOTE] Redémarrage de $API_APP_NAME via PM2 (npx)"
npx pm2 restart "$API_APP_NAME" || npx pm2 start "$ECOSYSTEM_CONFIG" --only "$API_APP_NAME" --update-env
npx pm2 ls || true

echo "[REMOTE] Écriture du log de déploiement"
{
  echo "=== Déploiement $DATE_ISO ==="
  echo "Branche: $GIT_BRANCH"
  echo "Chemin: $REMOTE_PATH"
  echo "Commits:"; echo "$COMMITS_LOG"
  echo
} >> "$LOG_REMOTE_FILE"

echo "[REMOTE] Fin mise à jour"
EOF
)

ssh "$REMOTE" bash -lc "$SSH_UPDATE_CMD"

info "Mise à jour distante terminée."
echo "$CURRENT_COMMIT" > "$LAST_DEPLOY_FILE"
info "Commit déployé enregistré dans $LAST_DEPLOY_FILE"

warn "Note: Les endpoints /api/health et /api/clients peuvent répondre 401 sans token d’authentification. Cela est attendu."
info "Déploiement finalisé. Consultez $CHANGELOG_LOCAL et le log distant $LOG_REMOTE_FILE pour les détails."