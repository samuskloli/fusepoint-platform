#!/usr/bin/env bash
set -euo pipefail

# Synchronise la base de données locale vers la base distante (Infomaniak)
# 1) Sauvegarde la base distante
# 2) Exporte la base locale
# 3) Transfère le dump
# 4) Importe sur la base distante
# 5) Vérifications basiques

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

CONFIG_FILE="$SCRIPT_DIR/db-sync.config"
if [[ -f "$CONFIG_FILE" ]]; then
  # shellcheck source=/dev/null
  source "$CONFIG_FILE"
else
  echo "[x] Configuration introuvable: $CONFIG_FILE" >&2
  echo "    Créez ce fichier à partir du modèle et remplissez les valeurs (LOCAL/REMOTE DB + SSH)." >&2
  exit 1
fi

function require_var(){
  local name="$1"; local value="${!name:-}"
  if [[ -z "$value" ]]; then
    echo "[x] Variable requise non définie: $name" >&2
    exit 1
  fi
}

# Vérifier les infos minimales
require_var LOCAL_DB_HOST
require_var LOCAL_DB_PORT
require_var LOCAL_DB_NAME
require_var REMOTE_DB_HOST
require_var REMOTE_DB_PORT
require_var REMOTE_DB_NAME
require_var REMOTE_USER
require_var REMOTE_HOST
require_var REMOTE_PATH

# Avertissement si mots de passe manquants
if [[ -z "${LOCAL_DB_USER:-}" || -z "${LOCAL_DB_PASS:-}" ]]; then
  echo "[!] LOCAL_DB_USER et/ou LOCAL_DB_PASS sont vides. Si votre MySQL local accepte sans mot de passe, ignorez." >&2
fi
if [[ -z "${REMOTE_DB_USER:-}" || -z "${REMOTE_DB_PASS:-}" ]]; then
  echo "[!] REMOTE_DB_USER et/ou REMOTE_DB_PASS sont vides. Remplissez-les pour que l'import fonctionne." >&2
fi

DATE_ISO="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
STAMP="$(date +"%Y%m%d-%H%M%S")"

BACKUPS_DIR_LOCAL="$REPO_ROOT/backup_redirects/db"
mkdir -p "$BACKUPS_DIR_LOCAL"
LOCAL_DUMP_FILE="$BACKUPS_DIR_LOCAL/${LOCAL_DB_NAME}.dump.$STAMP.sql"
REMOTE_BACKUPS_DIR="$REMOTE_PATH/backups/db"
REMOTE_DUMP_FILE="$REMOTE_BACKUPS_DIR/${REMOTE_DB_NAME}.backup.$STAMP.sql"

echo "[1/5] Sauvegarde de la base DISTANTE ($REMOTE_DB_NAME@$REMOTE_DB_HOST) via SSH…"
# Créer le répertoire de backup distant séparément pour éviter les soucis de quoting
ssh "$REMOTE_USER@$REMOTE_HOST" bash -lc "mkdir -p $REMOTE_BACKUPS_DIR || true"
ssh "$REMOTE_USER@$REMOTE_HOST" bash -lc "mysqldump -h '$REMOTE_DB_HOST' -P '$REMOTE_DB_PORT' -u '$REMOTE_DB_USER' -p'$REMOTE_DB_PASS' --single-transaction --quick --default-character-set=utf8mb4 '$REMOTE_DB_NAME' > $REMOTE_DUMP_FILE"

if [[ "${COMPRESS}" == "true" ]]; then
  echo "[1b/5] Compression de la sauvegarde distante…"
  ssh "$REMOTE_USER@$REMOTE_HOST" bash -lc "gzip -f '$REMOTE_DUMP_FILE'"
  REMOTE_DUMP_FILE+=".gz"
fi

echo "[2/5] Export de la base LOCALE ($LOCAL_DB_NAME@$LOCAL_DB_HOST)…"
mysqldump -h "$LOCAL_DB_HOST" -P "$LOCAL_DB_PORT" -u "${LOCAL_DB_USER:-root}" ${LOCAL_DB_PASS:+-p"$LOCAL_DB_PASS"} \
  --single-transaction --quick --set-gtid-purged=OFF \
  $( [[ "$INCLUDE_ROUTINES" == "true" ]] && echo "--routines" ) \
  $( [[ "$INCLUDE_TRIGGERS" == "true" ]] && echo "--triggers" ) \
  $( [[ "$INCLUDE_EVENTS" == "true" ]] && echo "--events" ) \
  --default-character-set=utf8mb4 "$LOCAL_DB_NAME" > "$LOCAL_DUMP_FILE"

if [[ "${COMPRESS}" == "true" ]]; then
  echo "[2b/5] Compression du dump local…"
  gzip -f "$LOCAL_DUMP_FILE"
  LOCAL_DUMP_FILE+=".gz"
fi

echo "[3/5] Transfert du dump local vers le serveur ($REMOTE_HOST)…"
ssh "$REMOTE_USER@$REMOTE_HOST" bash -lc "mkdir -p $REMOTE_BACKUPS_DIR || true"
scp -q "$LOCAL_DUMP_FILE" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_BACKUPS_DIR/"

if [[ "${DRY_RUN}" == "true" ]]; then
  echo "[!] DRY_RUN actif → import distant non exécuté. Dump transféré côté serveur: $REMOTE_BACKUPS_DIR"
  exit 0
fi

echo "[4/5] Import du dump local dans la base DISTANTE ($REMOTE_DB_NAME)…"
ssh "$REMOTE_USER@$REMOTE_HOST" bash -lc "
  set -euo pipefail
  IMPORT_FILE='$REMOTE_BACKUPS_DIR/$(basename "$LOCAL_DUMP_FILE")'
  # Désactiver les contraintes de clé étrangère pendant l'import
  mysql -h '$REMOTE_DB_HOST' -P '$REMOTE_DB_PORT' -u '$REMOTE_DB_USER' -p'$REMOTE_DB_PASS' -e 'SET FOREIGN_KEY_CHECKS=0;' '$REMOTE_DB_NAME'
  if [[ "${COMPRESS}" == "true" && "${LOCAL_DUMP_FILE}" == *.gz ]]; then
    gunzip -c "$IMPORT_FILE" | mysql -h '$REMOTE_DB_HOST' -P '$REMOTE_DB_PORT' -u '$REMOTE_DB_USER' -p'$REMOTE_DB_PASS' '$REMOTE_DB_NAME'
  else
    mysql -h '$REMOTE_DB_HOST' -P '$REMOTE_DB_PORT' -u '$REMOTE_DB_USER' -p'$REMOTE_DB_PASS' '$REMOTE_DB_NAME' < "$IMPORT_FILE"
  fi
  # Réactiver les contraintes
  mysql -h '$REMOTE_DB_HOST' -P '$REMOTE_DB_PORT' -u '$REMOTE_DB_USER' -p'$REMOTE_DB_PASS' -e 'SET FOREIGN_KEY_CHECKS=1;' '$REMOTE_DB_NAME'
"

echo "[5/5] Vérifications basiques côté distant…"
ssh "$REMOTE_USER@$REMOTE_HOST" bash -lc "
  echo -n '• Tables dans $REMOTE_DB_NAME: ';
  mysql -h '$REMOTE_DB_HOST' -P '$REMOTE_DB_PORT' -u '$REMOTE_DB_USER' -p'$REMOTE_DB_PASS' -N -e 'SHOW TABLES' '$REMOTE_DB_NAME' | wc -l
  echo '• Exemple: premières 5 tables:';
  mysql -h '$REMOTE_DB_HOST' -P '$REMOTE_DB_PORT' -u '$REMOTE_DB_USER' -p'$REMOTE_DB_PASS' -e 'SHOW TABLES' '$REMOTE_DB_NAME' | sed -n '1,5p'
"

echo "✓ Synchronisation terminée ($DATE_ISO)."
echo "- Sauvegarde distante: $REMOTE_DUMP_FILE"
echo "- Dump local importé: $LOCAL_DUMP_FILE"

echo "Note: Pensez à redémarrer l'API si nécessaire (pm2 restart fusepoint-api) et à vérifier /api/health, /api/agent/clients."