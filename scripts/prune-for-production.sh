#!/usr/bin/env bash
set -euo pipefail

APPLY=false
ARCHIVE=false
CONFIG="prune.config.json"

usage() {
  echo "Usage: $0 [--apply] [--archive] [--config <path>]"
  echo "  --apply     Appliquer la suppression (sinon dry-run par défaut)"
  echo "  --archive   Déplacer les fichiers/dossiers supprimés dans cleanup-archive/ avant suppression"
  echo "  --config    Chemin du fichier de configuration JSON (par défaut: prune.config.json)"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply)
      APPLY=true
      shift
      ;;
    --archive)
      ARCHIVE=true
      shift
      ;;
    --config)
      CONFIG="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Argument inconnu: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ ! -f "$CONFIG" ]]; then
  echo "❌ Fichier de config introuvable: $CONFIG" >&2
  exit 1
fi

# Lire configuration via Node pour éviter jq (compatible bash macOS)
DIRECTORIES=($(node -e "const fs=require('fs'); const c=JSON.parse(fs.readFileSync('${CONFIG}','utf8')); (c.directories||[]).forEach(x=>console.log(x));"))
FILES=($(node -e "const fs=require('fs'); const c=JSON.parse(fs.readFileSync('${CONFIG}','utf8')); (c.files||[]).forEach(x=>console.log(x));"))
SERVER_PATTERNS=($(node -e "const fs=require('fs'); const c=JSON.parse(fs.readFileSync('${CONFIG}','utf8')); (c.server_patterns||[]).forEach(x=>console.log(x));"))

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ARCHIVE_DIR="cleanup-archive/${TIMESTAMP}"

if $ARCHIVE; then
  mkdir -p "$ARCHIVE_DIR"
fi

COUNT=0
DRYRUN_MSG="(dry-run)"
if $APPLY; then
  DRYRUN_MSG=""
fi

echo "🔍 Nettoyage de production ${DRYRUN_MSG}"
echo "📄 Config: ${CONFIG}"

# Supprimer dossiers
for d in "${DIRECTORIES[@]}"; do
  if [[ -d "$d" ]]; then
    ((COUNT++))
    echo "📁 ${d} -> supprimer"
    if $APPLY; then
      if $ARCHIVE; then
        mv "$d" "$ARCHIVE_DIR/" || true
      else
        rm -rf "$d"
      fi
    fi
  fi
done

# Supprimer fichiers
for f in "${FILES[@]}"; do
  if [[ -f "$f" ]]; then
    ((COUNT++))
    echo "📄 ${f} -> supprimer"
    if $APPLY; then
      if $ARCHIVE; then
        mkdir -p "$ARCHIVE_DIR"
        mv "$f" "$ARCHIVE_DIR/" || true
      else
        rm -f "$f"
      fi
    fi
  fi
done

# Supprimer fichiers/dossiers par patterns dans server/
shopt -s nullglob
for p in "${SERVER_PATTERNS[@]}"; do
  for item in $p; do
    if [[ -e "$item" ]]; then
      ((COUNT++))
      echo "🧩 ${item} -> supprimer"
      if $APPLY; then
        if $ARCHIVE; then
          dest="$ARCHIVE_DIR/${item}"
          mkdir -p "$(dirname "$dest")"
          mv "$item" "$dest" || true
        else
          rm -rf "$item"
        fi
      fi
    fi
  done
done
shopt -u nullglob

echo "✅ Eléments ciblés: ${COUNT}"
if $APPLY; then
  if $ARCHIVE; then
    echo "📦 Archive: ${ARCHIVE_DIR}"
  fi
  echo "🧹 Nettoyage appliqué"
else
  echo "ℹ️ Aucun changement appliqué (dry-run). Utilisez --apply pour exécuter."
fi