#!/bin/bash

# =============================================================================
# SCRIPT DE WORKFLOW DE DÉVELOPPEMENT - FUSEPOINT PLATFORM
# =============================================================================
# Ce script facilite le workflow de développement quotidien
#
# Usage: ./dev-workflow.sh [action]
# Actions disponibles:
#   start     - Démarrer l'environnement de développement
#   stop      - Arrêter l'environnement de développement
#   restart   - Redémarrer l'environnement
#   status    - Voir l'état des serveurs
#   backup    - Créer une sauvegarde locale
#   deploy    - Déployer vers le serveur
#   new       - Créer une nouvelle branche de feature
#   commit    - Commiter les modifications actuelles
#   push      - Pousser vers GitHub
#   help      - Afficher l'aide

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=3000
FRONTEND_PORT=8080

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction pour démarrer l'environnement de développement
start_dev() {
    log_info "Démarrage de l'environnement de développement..."
    
    # Vérifier si les ports sont libres
    if lsof -ti:$BACKEND_PORT >/dev/null 2>&1; then
        log_warning "Port $BACKEND_PORT déjà utilisé, arrêt du processus..."
        lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    if lsof -ti:$FRONTEND_PORT >/dev/null 2>&1; then
        log_warning "Port $FRONTEND_PORT déjà utilisé, arrêt du processus..."
        lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    # Créer les répertoires de logs
    mkdir -p logs
    
    # Démarrer le backend
    log_info "Démarrage du backend sur le port $BACKEND_PORT..."
    cd server
    nohup node server.js > ../logs/backend-dev.log 2>&1 &
    echo $! > ../backend.pid
    cd ..
    
    # Attendre que le backend démarre
    sleep 3
    
    # Vérifier que le backend fonctionne
    if ps -p $(cat backend.pid) > /dev/null 2>&1; then
        log_success "Backend démarré (PID: $(cat backend.pid))"
    else
        log_error "Échec du démarrage du backend"
        tail -20 logs/backend-dev.log
        return 1
    fi
    
    # Démarrer le frontend en mode développement
    log_info "Démarrage du frontend sur le port $FRONTEND_PORT..."
    nohup npm run dev > logs/frontend-dev.log 2>&1 &
    echo $! > frontend.pid
    
    # Attendre que le frontend démarre
    sleep 5
    
    # Vérifier que le frontend fonctionne
    if ps -p $(cat frontend.pid) > /dev/null 2>&1; then
        log_success "Frontend démarré (PID: $(cat frontend.pid))"
    else
        log_error "Échec du démarrage du frontend"
        tail -20 logs/frontend-dev.log
        return 1
    fi
    
    echo
    log_success "Environnement de développement démarré! 🚀"
    echo "  - Backend: http://localhost:$BACKEND_PORT"
    echo "  - Frontend: http://localhost:$FRONTEND_PORT"
    echo "  - API Health: http://localhost:$BACKEND_PORT/api/health"
    echo
    log_info "Commandes utiles:"
    echo "  - Voir les logs: tail -f logs/backend-dev.log"
    echo "  - Arrêter: ./dev-workflow.sh stop"
    echo "  - Redémarrer: ./dev-workflow.sh restart"
}

# Fonction pour arrêter l'environnement
stop_dev() {
    log_info "Arrêt de l'environnement de développement..."
    
    # Arrêter le backend
    if [ -f backend.pid ]; then
        local backend_pid=$(cat backend.pid)
        if ps -p $backend_pid > /dev/null 2>&1; then
            kill $backend_pid
            log_success "Backend arrêté (PID: $backend_pid)"
        fi
        rm -f backend.pid
    fi
    
    # Arrêter le frontend
    if [ -f frontend.pid ]; then
        local frontend_pid=$(cat frontend.pid)
        if ps -p $frontend_pid > /dev/null 2>&1; then
            kill $frontend_pid
            log_success "Frontend arrêté (PID: $frontend_pid)"
        fi
        rm -f frontend.pid
    fi
    
    # Nettoyer les processus restants
    pkill -f "node.*server.js" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    
    log_success "Environnement arrêté"
}

# Fonction pour voir le statut
show_status() {
    log_info "État de l'environnement de développement:"
    echo
    
    # Backend
    if [ -f backend.pid ] && ps -p $(cat backend.pid) > /dev/null 2>&1; then
        echo -e "  Backend: ${GREEN}✓ En cours${NC} (PID: $(cat backend.pid))"
        echo "    URL: http://localhost:$BACKEND_PORT"
        echo "    Health: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:$BACKEND_PORT/api/health 2>/dev/null || echo 'N/A')"
    else
        echo -e "  Backend: ${RED}✗ Arrêté${NC}"
    fi
    
    # Frontend
    if [ -f frontend.pid ] && ps -p $(cat frontend.pid) > /dev/null 2>&1; then
        echo -e "  Frontend: ${GREEN}✓ En cours${NC} (PID: $(cat frontend.pid))"
        echo "    URL: http://localhost:$FRONTEND_PORT"
    else
        echo -e "  Frontend: ${RED}✗ Arrêté${NC}"
    fi
    
    echo
    
    # État Git
    local current_branch=$(git branch --show-current)
    echo -e "  Branche Git: ${BLUE}$current_branch${NC}"
    
    if ! git diff-index --quiet HEAD --; then
        echo -e "  Modifications: ${YELLOW}✓ Non commitées${NC}"
    else
        echo -e "  Modifications: ${GREEN}✓ Tout committé${NC}"
    fi
}

# Fonction pour créer une sauvegarde
create_backup() {
    log_info "Création d'une sauvegarde locale..."
    
    if [ -f scripts/backup-system.js ]; then
        node scripts/backup-system.js
    else
        log_warning "Script de sauvegarde non trouvé, création d'une sauvegarde simple..."
        local backup_dir="backups/manual_$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$backup_dir"
        
        # Sauvegarder la base de données
        if [ -f server/database/fusepoint.db ]; then
            cp server/database/fusepoint.db "$backup_dir/"
        fi
        
        # Sauvegarder les configurations
        cp .env* "$backup_dir/" 2>/dev/null || true
        cp server/.env* "$backup_dir/" 2>/dev/null || true
        
        log_success "Sauvegarde créée: $backup_dir"
    fi
}

# Fonction pour créer une nouvelle branche
create_new_branch() {
    echo "Création d'une nouvelle branche de feature"
    echo
    echo "Types de branches disponibles:"
    echo "  1. feature/  - Nouvelle fonctionnalité"
    echo "  2. fix/      - Correction de bug"
    echo "  3. hotfix/   - Correction urgente"
    echo "  4. refactor/ - Refactorisation"
    echo
    read -p "Choisissez le type (1-4): " branch_type
    read -p "Nom de la branche (ex: nouvelle-fonctionnalite): " branch_name
    
    case $branch_type in
        1) prefix="feature" ;;
        2) prefix="fix" ;;
        3) prefix="hotfix" ;;
        4) prefix="refactor" ;;
        *) log_error "Type invalide"; return 1 ;;
    esac
    
    local full_branch_name="$prefix/$branch_name"
    
    # Créer et basculer sur la nouvelle branche
    git checkout -b "$full_branch_name"
    log_success "Branche créée et activée: $full_branch_name"
}

# Fonction pour commiter
commit_changes() {
    log_info "Commit des modifications..."
    
    # Vérifier s'il y a des modifications
    if git diff-index --quiet HEAD --; then
        log_warning "Aucune modification à commiter"
        return 0
    fi
    
    # Afficher les modifications
    echo "Fichiers modifiés:"
    git status --porcelain
    echo
    
    read -p "Message de commit: " commit_message
    
    if [ -z "$commit_message" ]; then
        log_error "Message de commit requis"
        return 1
    fi
    
    git add .
    git commit -m "$commit_message"
    log_success "Modifications commitées"
}

# Fonction pour pousser vers GitHub
push_to_github() {
    local current_branch=$(git branch --show-current)
    
    log_info "Push de la branche '$current_branch' vers GitHub..."
    
    if git push origin "$current_branch"; then
        log_success "Code poussé vers GitHub"
    else
        log_error "Échec du push"
        return 1
    fi
}

# Fonction d'aide
show_help() {
    echo "Usage: ./dev-workflow.sh [action]"
    echo
    echo "Actions disponibles:"
    echo "  start     - Démarrer l'environnement de développement"
    echo "  stop      - Arrêter l'environnement de développement"
    echo "  restart   - Redémarrer l'environnement"
    echo "  status    - Voir l'état des serveurs"
    echo "  backup    - Créer une sauvegarde locale"
    echo "  deploy    - Déployer vers le serveur"
    echo "  new       - Créer une nouvelle branche de feature"
    echo "  commit    - Commiter les modifications actuelles"
    echo "  push      - Pousser vers GitHub"
    echo "  help      - Afficher cette aide"
    echo
    echo "Exemples:"
    echo "  ./dev-workflow.sh start"
    echo "  ./dev-workflow.sh new"
    echo "  ./dev-workflow.sh commit"
    echo "  ./dev-workflow.sh deploy main"
}

# Fonction principale
main() {
    local action=${1:-help}
    
    case $action in
        start)
            start_dev
            ;;
        stop)
            stop_dev
            ;;
        restart)
            stop_dev
            sleep 2
            start_dev
            ;;
        status)
            show_status
            ;;
        backup)
            create_backup
            ;;
        deploy)
            local branch=${2:-main}
            ./deploy-to-server.sh "$branch"
            ;;
        new)
            create_new_branch
            ;;
        commit)
            commit_changes
            ;;
        push)
            push_to_github
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Action inconnue: $action"
            show_help
            exit 1
            ;;
    esac
}

# Exécution
main "$@"