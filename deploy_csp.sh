#!/usr/bin/env bash
set -euo pipefail

# Paramètres (surchageables via variables d'environnement)
SSH_USER="${SSH_USER:-UTILISATEUR_SSH}"
SSH_HOST="${SSH_HOST:-HOST_SSH}"
SSH_PORT="${SSH_PORT:-22}"
REMOTE_PATH="${REMOTE_PATH:-/srv/customer/sites/fusepoint.ch}"
LOCAL_HTACCESS="${LOCAL_HTACCESS:-./.htaccess}"
DATE_TAG="$(date +%Y%m%d-%H%M%S)"

# Optionnel: mot de passe SSH pour connexion non interactive (utilise sshpass si disponible)
SSH_PASS="${SSH_PASS:-}"

# Préparation des commandes ssh/scp (avec sshpass si SSH_PASS est défini)
SSH_BIN="ssh"
SCP_BIN="scp"
if [[ -n "$SSH_PASS" ]]; then
  if ! command -v sshpass >/dev/null 2>&1; then
    echo "sshpass introuvable. Tentative d'installation…"
    if command -v brew >/dev/null 2>&1; then
      brew install sshpass || { echo "Échec d'installation sshpass via brew"; exit 1; }
    else
      echo "Veuillez installer sshpass (ex: brew install sshpass) ou utiliser une clé SSH."
      exit 1
    fi
  fi
  SSH_BIN="sshpass -p \"$SSH_PASS\" ssh"
  SCP_BIN="sshpass -p \"$SSH_PASS\" scp"
fi

echo "[1/5] Test connexion SSH"
$SSH_BIN -o StrictHostKeyChecking=no -o PreferredAuthentications=password -o PubkeyAuthentication=no -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "echo ok"

echo "[2/5] Création du backup distant de .htaccess (si présent)"
$SSH_BIN -o StrictHostKeyChecking=no -o PreferredAuthentications=password -o PubkeyAuthentication=no -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" \
  "test -f '$REMOTE_PATH/.htaccess' && cp -a '$REMOTE_PATH/.htaccess' '$REMOTE_PATH/.htaccess.bak.$DATE_TAG' || true"

echo "[3/5] Upload du .htaccess"
$SCP_BIN -P "$SSH_PORT" "$LOCAL_HTACCESS" "$SSH_USER@$SSH_HOST:$REMOTE_PATH/.htaccess"

echo "[4/5] Vérification à distance du contenu (.htaccess)"
$SSH_BIN -o StrictHostKeyChecking=no -o PreferredAuthentications=password -o PubkeyAuthentication=no -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" \
  "grep -i 'Content-Security-Policy' '$REMOTE_PATH/.htaccess' || (echo 'CSP absente' && exit 1)"

echo "[5/5] Smoke test HTTP (CSP servie)"
curl -sI https://fusepoint.ch | grep -i content-security-policy || true

echo "Déploiement terminé ✅"
echo "Rollback si besoin :"
echo "ssh -p $SSH_PORT $SSH_USER@$SSH_HOST \"cp -a '$REMOTE_PATH/.htaccess.bak.$DATE_TAG' '$REMOTE_PATH/.htaccess'\""