#!/bin/bash

# =============================================================================
# FUSEPOINT PLATFORM - GESTIONNAIRE PRINCIPAL
# =============================================================================
# Script centralisé pour toutes les opérations de la plateforme Fusepoint
# Remplace tous les scripts éparpillés par une interface unifiée
#
# Usage: ./fusepoint-manager.sh [category] [action] [options]
#
# Auteur: Assistant IA
# Version: 1.0
# Date: $(date +%Y-%m-%d)
# =============================================================================

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
# Résoudre le lien symbolique pour obtenir le vrai chemin du script
SCRIPT_PATH="${BASH_SOURCE[0]}"
if [ -L "$SCRIPT_PATH" ]; then
    SCRIPT_PATH="$(readlink "$SCRIPT_PATH")"
fi
PROJECT_ROOT="$(cd "$(dirname "$SCRIPT_PATH")" && cd ../.. && pwd)"
SERVER_DIR="$PROJECT_ROOT/server"
BACKUP_SCRIPT="$PROJECT_ROOT/scripts/backup-system.cjs"
DB_PATH="$PROJECT_ROOT/server/database/fusepoint.db"

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_header() {
    echo -e "${PURPLE}🚀 $1${NC}"
    echo -e "${PURPLE}$(printf '=%.0s' {1..60})${NC}"
}

# =============================================================================
# GESTION DES SERVEURS
# =============================================================================

server_start() {
    log_header "Démarrage des serveurs Fusepoint"
    
    cd "$PROJECT_ROOT"
    
    # Vérifier si les serveurs sont déjà en cours
    if pgrep -f "vite" > /dev/null || pgrep -f "server.js" > /dev/null; then
        log_warning "Des serveurs sont déjà en cours d'exécution"
        server_status
        return
    fi
    
    log_info "Démarrage du serveur backend..."
    cd "$SERVER_DIR"
    nohup node server.js > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../logs/backend.pid
    
    log_info "Démarrage du serveur frontend..."
    cd "$PROJECT_ROOT"
    nohup npm run dev > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > logs/frontend.pid
    
    sleep 3
    server_status
    log_success "Serveurs démarrés avec succès"
}

server_stop() {
    log_header "Arrêt des serveurs Fusepoint"
    
    # Arrêter les processus par PID
    if [ -f "$PROJECT_ROOT/logs/backend.pid" ]; then
        BACKEND_PID=$(cat "$PROJECT_ROOT/logs/backend.pid")
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill $BACKEND_PID
            log_info "Backend arrêté (PID: $BACKEND_PID)"
        fi
        rm -f "$PROJECT_ROOT/logs/backend.pid"
    fi
    
    if [ -f "$PROJECT_ROOT/logs/frontend.pid" ]; then
        FRONTEND_PID=$(cat "$PROJECT_ROOT/logs/frontend.pid")
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            log_info "Frontend arrêté (PID: $FRONTEND_PID)"
        fi
        rm -f "$PROJECT_ROOT/logs/frontend.pid"
    fi
    
    # Nettoyage supplémentaire
    pkill -f "node.*server.js" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    
    log_success "Tous les serveurs ont été arrêtés"
}

server_restart() {
    log_header "Redémarrage des serveurs Fusepoint"
    server_stop
    sleep 2
    server_start
}

server_status() {
    log_header "État des serveurs Fusepoint"
    
    # Vérifier le backend
    if pgrep -f "server.js" > /dev/null; then
        BACKEND_PID=$(pgrep -f "server.js")
        log_success "Backend: En cours (PID: $BACKEND_PID)"
        
        # Test de connectivité
        if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
            log_success "API Backend: Accessible"
        else
            log_warning "API Backend: Non accessible"
        fi
    else
        log_error "Backend: Arrêté"
    fi
    
    # Vérifier le frontend
    if pgrep -f "vite" > /dev/null; then
        FRONTEND_PID=$(pgrep -f "vite")
        log_success "Frontend: En cours (PID: $FRONTEND_PID)"
        
        # Test de connectivité
        if curl -s http://localhost:8080 > /dev/null 2>&1 || curl -s http://localhost:3000 > /dev/null 2>&1; then
            log_success "Frontend: Accessible sur http://localhost:8080 ou http://localhost:3000"
        else
            log_warning "Frontend: Non accessible"
        fi
    else
        log_error "Frontend: Arrêté"
    fi
}

# =============================================================================
# GESTION DES SAUVEGARDES
# =============================================================================

backup_create() {
    local type=${1:-full}
    log_header "Création d'une sauvegarde $type"
    
    if [ -f "$BACKUP_SCRIPT" ]; then
        node "$BACKUP_SCRIPT" create --type="$type"
    else
        log_error "Script de sauvegarde non trouvé: $BACKUP_SCRIPT"
        exit 1
    fi
}

backup_list() {
    log_header "Liste des sauvegardes"
    
    if [ -f "$BACKUP_SCRIPT" ]; then
        node "$BACKUP_SCRIPT" list
    else
        log_error "Script de sauvegarde non trouvé: $BACKUP_SCRIPT"
        exit 1
    fi
}

backup_restore() {
    local backup_id="$1"
    if [ -z "$backup_id" ]; then
        log_error "ID de sauvegarde requis"
        backup_list
        exit 1
    fi
    
    log_header "Restauration de la sauvegarde: $backup_id"
    
    if [ -f "$BACKUP_SCRIPT" ]; then
        node "$BACKUP_SCRIPT" restore "$backup_id"
    else
        log_error "Script de sauvegarde non trouvé: $BACKUP_SCRIPT"
        exit 1
    fi
}

# =============================================================================
# GESTION DE LA BASE DE DONNÉES
# =============================================================================

db_status() {
    log_header "État de la base de données"
    
    if [ -f "$DB_PATH" ]; then
        local size=$(du -h "$DB_PATH" | cut -f1)
        log_success "Base de données: $DB_PATH ($size)"
        
        # Test de connectivité
        if sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sqlite_master;" > /dev/null 2>&1; then
            local tables=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sqlite_master WHERE type='table';")
            log_success "Tables: $tables tables trouvées"
        else
            log_error "Impossible de se connecter à la base de données"
        fi
    else
        log_error "Base de données non trouvée: $DB_PATH"
    fi
}

db_export() {
    local output_file="database-backups/export_$(date +%Y%m%d_%H%M%S).sql"
    log_header "Export de la base de données"
    
    mkdir -p "$(dirname "$output_file")"
    
    if sqlite3 "$DB_PATH" ".dump" > "$output_file"; then
        log_success "Export créé: $output_file"
    else
        log_error "Échec de l'export"
        exit 1
    fi
}

# =============================================================================
# DÉPLOIEMENT
# =============================================================================

deploy_production() {
    local branch=${1:-main}
    log_header "Déploiement en production (branche: $branch)"
    
    # Vérifications préalables
    if ! git status > /dev/null 2>&1; then
        log_error "Ce n'est pas un dépôt Git"
        exit 1
    fi
    
    # Sauvegarde avant déploiement
    log_info "Création d'une sauvegarde avant déploiement..."
    backup_create "pre-deploy"
    
    # Déploiement
    log_info "Déploiement vers le serveur..."
    if [ -f "$PROJECT_ROOT/deploy-to-server.sh" ]; then
        "$PROJECT_ROOT/deploy-to-server.sh" "$branch"
    else
        log_error "Script de déploiement non trouvé"
        exit 1
    fi
}

# =============================================================================
# DÉVELOPPEMENT
# =============================================================================

dev_setup() {
    log_header "Configuration de l'environnement de développement"
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    log_info "Version Node.js: $(node --version)"
    
    # Installer les dépendances
    log_info "Installation des dépendances..."
    cd "$PROJECT_ROOT"
    npm install
    
    cd "$SERVER_DIR"
    npm install
    
    # Créer les dossiers nécessaires
    mkdir -p "$PROJECT_ROOT/logs"
    
    log_success "Environnement de développement configuré"
}

# =============================================================================
# MAINTENANCE
# =============================================================================

maintenance_cleanup() {
    log_header "Nettoyage du système"
    
    # Nettoyer les logs anciens
    find "$PROJECT_ROOT/logs" -name "*.log" -mtime +7 -delete 2>/dev/null || true
    log_info "Logs anciens supprimés"
    
    # Nettoyer les sauvegardes anciennes
    if [ -f "$BACKUP_SCRIPT" ]; then
        node "$BACKUP_SCRIPT" cleanup --days=30
    fi
    
    # Nettoyer les fichiers temporaires
    find "$PROJECT_ROOT" -name "*.tmp" -delete 2>/dev/null || true
    find "$PROJECT_ROOT" -name ".DS_Store" -delete 2>/dev/null || true
    
    log_success "Nettoyage terminé"
}

maintenance_health() {
    log_header "Rapport de santé du système"
    
    # État des serveurs
    server_status
    echo
    
    # État de la base de données
    db_status
    echo
    
    # Espace disque
    log_info "Espace disque utilisé:"
    du -sh "$PROJECT_ROOT" 2>/dev/null || true
    
    # Dernière sauvegarde
    if [ -f "$BACKUP_SCRIPT" ]; then
        echo
        log_info "Dernières sauvegardes:"
        node "$BACKUP_SCRIPT" list | tail -3
    fi
}

# =============================================================================
# INTERFACE PRINCIPALE
# =============================================================================

show_help() {
    echo -e "${CYAN}🚀 Fusepoint Platform - Gestionnaire Principal${NC}"
    echo -e "${CYAN}================================================${NC}"
    echo
    echo "Usage: $0 [category] [action] [options]"
    echo
    echo -e "${YELLOW}📂 CATÉGORIES DISPONIBLES:${NC}"
    echo
    echo -e "${GREEN}server${NC}     - Gestion des serveurs"
    echo "  start              Démarrer les serveurs"
    echo "  stop               Arrêter les serveurs"
    echo "  restart            Redémarrer les serveurs"
    echo "  status             Voir l'état des serveurs"
    echo
    echo -e "${GREEN}backup${NC}     - Gestion des sauvegardes"
    echo "  create [type]      Créer une sauvegarde (full/config/database)"
    echo "  list               Lister les sauvegardes"
    echo "  restore <id>       Restaurer une sauvegarde"
    echo
    echo -e "${GREEN}database${NC}   - Gestion de la base de données"
    echo "  status             État de la base de données"
    echo "  export             Exporter la base de données"
    echo
    echo -e "${GREEN}deploy${NC}     - Déploiement"
    echo "  production [branch] Déployer en production"
    echo
    echo -e "${GREEN}dev${NC}        - Développement"
    echo "  setup              Configurer l'environnement de développement"
    echo
    echo -e "${GREEN}maintenance${NC} - Maintenance"
    echo "  cleanup            Nettoyer le système"
    echo "  health             Rapport de santé"
    echo
    echo -e "${YELLOW}📋 EXEMPLES:${NC}"
    echo "  $0 server start"
    echo "  $0 backup create full"
    echo "  $0 deploy production main"
    echo "  $0 maintenance health"
    echo
}

# =============================================================================
# POINT D'ENTRÉE PRINCIPAL
# =============================================================================

main() {
    local category="$1"
    local action="$2"
    local option="$3"
    
    case "$category" in
        "server")
            case "$action" in
                "start") server_start ;;
                "stop") server_stop ;;
                "restart") server_restart ;;
                "status") server_status ;;
                *) log_error "Action inconnue: $action"; show_help; exit 1 ;;
            esac
            ;;
        "backup")
            case "$action" in
                "create") backup_create "$option" ;;
                "list") backup_list ;;
                "restore") backup_restore "$option" ;;
                *) log_error "Action inconnue: $action"; show_help; exit 1 ;;
            esac
            ;;
        "database"|"db")
            case "$action" in
                "status") db_status ;;
                "export") db_export ;;
                *) log_error "Action inconnue: $action"; show_help; exit 1 ;;
            esac
            ;;
        "deploy")
            case "$action" in
                "production") deploy_production "$option" ;;
                *) log_error "Action inconnue: $action"; show_help; exit 1 ;;
            esac
            ;;
        "dev")
            case "$action" in
                "setup") dev_setup ;;
                *) log_error "Action inconnue: $action"; show_help; exit 1 ;;
            esac
            ;;
        "maintenance")
            case "$action" in
                "cleanup") maintenance_cleanup ;;
                "health") maintenance_health ;;
                *) log_error "Action inconnue: $action"; show_help; exit 1 ;;
            esac
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            log_error "Catégorie inconnue: $category"
            show_help
            exit 1
            ;;
    esac
}

# Exécuter le script
main "$@"