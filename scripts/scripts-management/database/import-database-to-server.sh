#!/bin/bash

# Script pour importer la base de données locale vers le serveur Infomaniak
# Usage: ./import-database-to-server.sh [--force] [--backup]

set -e

# Configuration
SERVER_USER="gjNCbjZ4HAb_sam"
SERVER_HOST="57-101961.ssh.hosting-ik.com"
LOCAL_DB="server/database/fusepoint.db"
REMOTE_PATH="sites/beta.fusepoint.ch/server/database"
BACKUP_DIR="database-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Options
FORCE_IMPORT=false
CREATE_BACKUP=false

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Analyse des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE_IMPORT=true
            shift
            ;;
        --backup)
            CREATE_BACKUP=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [--force] [--backup]"
            echo "  --force   : Remplace la base de données serveur sans confirmation"
            echo "  --backup  : Crée une sauvegarde de la base serveur avant import"
            exit 0
            ;;
        *)
            error "Option inconnue: $1"
            ;;
    esac
done

# Vérifications préliminaires
log "🔍 Vérification des prérequis..."

if [ ! -f "$LOCAL_DB" ]; then
    error "Base de données locale introuvable: $LOCAL_DB"
fi

if ! command -v sqlite3 &> /dev/null; then
    error "sqlite3 n'est pas installé"
fi

if ! command -v scp &> /dev/null; then
    error "scp n'est pas disponible"
fi

success "Prérequis validés"

# Création du répertoire de sauvegarde local
mkdir -p "$BACKUP_DIR"

# Test de connexion SSH
log "🔗 Test de connexion SSH..."
if ! ssh -o ConnectTimeout=10 "$SERVER_USER@$SERVER_HOST" "echo 'Connexion OK'" &>/dev/null; then
    error "Impossible de se connecter au serveur SSH"
fi
success "Connexion SSH établie"

# Sauvegarde de la base serveur si demandée
if [ "$CREATE_BACKUP" = true ]; then
    log "💾 Création d'une sauvegarde de la base serveur..."
    
    # Télécharger la base serveur actuelle
    scp "$SERVER_USER@$SERVER_HOST:$REMOTE_PATH/fusepoint.db" "$BACKUP_DIR/server_backup_$TIMESTAMP.db" || {
        warning "Impossible de télécharger la base serveur (peut-être qu'elle n'existe pas encore)"
    }
    
    # Créer aussi un dump SQL de la base serveur
    ssh "$SERVER_USER@$SERVER_HOST" "cd $REMOTE_PATH && sqlite3 fusepoint.db '.dump'" > "$BACKUP_DIR/server_dump_$TIMESTAMP.sql" 2>/dev/null || {
        warning "Impossible de créer un dump SQL de la base serveur"
    }
    
    success "Sauvegarde serveur créée dans $BACKUP_DIR/"
fi

# Analyse de la base locale
log "📊 Analyse de la base de données locale..."

# Compter les tables et enregistrements
LOCAL_TABLES=$(sqlite3 "$LOCAL_DB" "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
LOCAL_USERS=$(sqlite3 "$LOCAL_DB" "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
LOCAL_COMPANIES=$(sqlite3 "$LOCAL_DB" "SELECT COUNT(*) FROM companies;" 2>/dev/null || echo "0")

log "Base locale: $LOCAL_TABLES tables, $LOCAL_USERS utilisateurs, $LOCAL_COMPANIES entreprises"

# Analyse de la base serveur
log "📊 Analyse de la base de données serveur..."

SERVER_TABLES=$(ssh "$SERVER_USER@$SERVER_HOST" "cd $REMOTE_PATH && sqlite3 fusepoint.db 'SELECT COUNT(*) FROM sqlite_master WHERE type=\"table\" AND name NOT LIKE \"sqlite_%\";'" 2>/dev/null || echo "0")
SERVER_USERS=$(ssh "$SERVER_USER@$SERVER_HOST" "cd $REMOTE_PATH && sqlite3 fusepoint.db 'SELECT COUNT(*) FROM users;'" 2>/dev/null || echo "0")
SERVER_COMPANIES=$(ssh "$SERVER_USER@$SERVER_HOST" "cd $REMOTE_PATH && sqlite3 fusepoint.db 'SELECT COUNT(*) FROM companies;'" 2>/dev/null || echo "0")

log "Base serveur: $SERVER_TABLES tables, $SERVER_USERS utilisateurs, $SERVER_COMPANIES entreprises"

# Confirmation si pas de --force
if [ "$FORCE_IMPORT" = false ] && [ "$SERVER_USERS" -gt 0 ]; then
    warning "La base serveur contient déjà des données!"
    echo "Base locale  : $LOCAL_USERS utilisateurs, $LOCAL_COMPANIES entreprises"
    echo "Base serveur : $SERVER_USERS utilisateurs, $SERVER_COMPANIES entreprises"
    echo ""
    read -p "Voulez-vous continuer et remplacer la base serveur? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Import annulé par l'utilisateur"
        exit 0
    fi
fi

# Création d'un dump SQL de la base locale
log "📤 Création du dump SQL de la base locale..."
DUMP_FILE="$BACKUP_DIR/local_export_$TIMESTAMP.sql"
sqlite3 "$LOCAL_DB" ".dump" > "$DUMP_FILE"
success "Dump créé: $DUMP_FILE"

# Transfert du fichier de base de données
log "🚀 Transfert de la base de données vers le serveur..."

# Arrêter le serveur Node.js temporairement
log "⏸️  Arrêt temporaire du serveur..."
ssh "$SERVER_USER@$SERVER_HOST" "cd sites/beta.fusepoint.ch && pm2 stop ecosystem.config.cjs || pm2 stop all || true" || {
    warning "Impossible d'arrêter PM2 (peut-être pas en cours d'exécution)"
}

# Créer une sauvegarde rapide sur le serveur
ssh "$SERVER_USER@$SERVER_HOST" "cd $REMOTE_PATH && cp fusepoint.db fusepoint.db.backup_$TIMESTAMP 2>/dev/null || true"

# Transférer la nouvelle base
scp "$LOCAL_DB" "$SERVER_USER@$SERVER_HOST:$REMOTE_PATH/fusepoint.db" || {
    error "Échec du transfert de la base de données"
}

success "Base de données transférée"

# Vérification de l'intégrité sur le serveur
log "🔍 Vérification de l'intégrité sur le serveur..."

INTEGRITY_CHECK=$(ssh "$SERVER_USER@$SERVER_HOST" "cd $REMOTE_PATH && sqlite3 fusepoint.db 'PRAGMA integrity_check;'")
if [ "$INTEGRITY_CHECK" != "ok" ]; then
    error "Problème d'intégrité détecté: $INTEGRITY_CHECK"
fi

# Vérifier que les données sont bien présentes
NEW_SERVER_USERS=$(ssh "$SERVER_USER@$SERVER_HOST" "cd $REMOTE_PATH && sqlite3 fusepoint.db 'SELECT COUNT(*) FROM users;'")
NEW_SERVER_COMPANIES=$(ssh "$SERVER_USER@$SERVER_HOST" "cd $REMOTE_PATH && sqlite3 fusepoint.db 'SELECT COUNT(*) FROM companies;'")

log "Vérification: $NEW_SERVER_USERS utilisateurs, $NEW_SERVER_COMPANIES entreprises importés"

if [ "$NEW_SERVER_USERS" -eq 0 ] && [ "$LOCAL_USERS" -gt 0 ]; then
    error "Aucun utilisateur trouvé après import, quelque chose s'est mal passé"
fi

success "Intégrité vérifiée"

# Redémarrer le serveur
log "🔄 Redémarrage du serveur..."
ssh "$SERVER_USER@$SERVER_HOST" "cd sites/beta.fusepoint.ch && pm2 start ecosystem.config.cjs || pm2 restart all" || {
    warning "Problème lors du redémarrage PM2, vérifiez manuellement"
}

# Attendre que le serveur soit prêt
log "⏳ Attente du démarrage du serveur..."
sleep 5

# Test de fonctionnement
log "🧪 Test de fonctionnement..."
HEALTH_CHECK=$(ssh "$SERVER_USER@$SERVER_HOST" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health || echo 'FAIL'")

if [ "$HEALTH_CHECK" = "200" ]; then
    success "Serveur opérationnel"
else
    warning "Le serveur ne répond pas correctement (code: $HEALTH_CHECK)"
    log "Vérifiez les logs: ssh $SERVER_USER@$SERVER_HOST 'cd sites/beta.fusepoint.ch && pm2 logs'"
fi

# Résumé final
echo ""
log "📋 Résumé de l'import:"
echo "  • Base locale  : $LOCAL_USERS utilisateurs → $NEW_SERVER_USERS utilisateurs"
echo "  • Entreprises  : $LOCAL_COMPANIES → $NEW_SERVER_COMPANIES"
echo "  • Sauvegarde   : $BACKUP_DIR/"
echo "  • Dump SQL     : $DUMP_FILE"
echo ""
success "Import terminé avec succès!"

if [ "$CREATE_BACKUP" = true ]; then
    log "💡 Conseil: Gardez les sauvegardes dans $BACKUP_DIR/ en cas de problème"
fi

log "🌐 Votre application est disponible sur: https://beta.fusepoint.ch"