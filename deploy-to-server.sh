#!/bin/bash

# =============================================================================
# SCRIPT DE DÉPLOIEMENT SÉCURISÉ - FUSEPOINT PLATFORM
# =============================================================================
# Ce script permet de déployer en toute sécurité depuis l'environnement local
# vers le serveur Infomaniak avec sauvegarde automatique.
#
# Usage: ./deploy-to-server.sh [branch]
# Exemple: ./deploy-to-server.sh main
#          ./deploy-to-server.sh dev/ma-feature

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="fusepoint-platform"
SERVER_USER="client"
SERVER_HOST="ik-01987154-2ed0-729b-942c-cd0901954bed-6f948858ff-w9nlg"
SERVER_PATH="~/sites/beta.fusepoint.ch"
BRANCH=${1:-main}

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

# Fonction pour vérifier les prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier Git
    if ! command -v git &> /dev/null; then
        log_error "Git n'est pas installé"
        exit 1
    fi
    
    # Vérifier SSH
    if ! command -v ssh &> /dev/null; then
        log_error "SSH n'est pas installé"
        exit 1
    fi
    
    # Vérifier la connexion au serveur
    log_info "Test de connexion au serveur..."
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$SERVER_USER@$SERVER_HOST" exit 2>/dev/null; then
        log_warning "Impossible de se connecter au serveur en mode batch"
        log_info "Vous devrez saisir votre mot de passe/clé SSH pendant le déploiement"
    else
        log_success "Connexion SSH configurée"
    fi
    
    log_success "Prérequis vérifiés"
}

# Fonction pour vérifier l'état Git local
check_git_status() {
    log_info "Vérification de l'état Git local..."
    
    # Vérifier s'il y a des modifications non commitées
    if ! git diff-index --quiet HEAD --; then
        log_warning "Vous avez des modifications non commitées"
        echo "Fichiers modifiés:"
        git status --porcelain
        echo
        read -p "Voulez-vous continuer sans commiter ces modifications? (y/N): " continue_choice
        if [[ ! $continue_choice =~ ^[Yy]$ ]]; then
            log_info "Déploiement annulé. Commitez vos modifications d'abord."
            exit 0
        fi
    fi
    
    # Vérifier si la branche existe
    if ! git show-ref --verify --quiet "refs/heads/$BRANCH"; then
        log_error "La branche '$BRANCH' n'existe pas localement"
        exit 1
    fi
    
    log_success "État Git vérifié"
}

# Fonction pour pousser vers GitHub
push_to_github() {
    log_info "Push vers GitHub..."
    
    # Basculer sur la branche à déployer
    git checkout "$BRANCH"
    
    # Pousser vers GitHub
    if git push origin "$BRANCH"; then
        log_success "Code poussé vers GitHub (branche: $BRANCH)"
    else
        log_error "Échec du push vers GitHub"
        exit 1
    fi
}

# Fonction pour créer une sauvegarde sur le serveur
create_server_backup() {
    log_info "Création d'une sauvegarde sur le serveur..."
    
    local backup_timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_cmd="
        cd $SERVER_PATH && 
        if [ -d server ]; then 
            tar -czf backup_${backup_timestamp}.tar.gz server/ .env* ecosystem.config.* || true; 
            echo 'Sauvegarde créée: backup_${backup_timestamp}.tar.gz'; 
        else 
            echo 'Aucun serveur à sauvegarder'; 
        fi
    "
    
    if ssh "$SERVER_USER@$SERVER_HOST" "$backup_cmd"; then
        log_success "Sauvegarde serveur créée: backup_${backup_timestamp}.tar.gz"
    else
        log_warning "Impossible de créer la sauvegarde serveur"
    fi
}

# Fonction pour déployer sur le serveur
deploy_to_server() {
    log_info "Déploiement sur le serveur Infomaniak..."
    
    local deploy_cmd="
        cd $SERVER_PATH && 
        echo 'Arrêt des processus existants...' && 
        pkill -f 'node.*server.js' || true && 
        sleep 2 && 
        echo 'Mise à jour depuis GitHub...' && 
        git fetch origin && 
        git checkout $BRANCH && 
        git pull origin $BRANCH && 
        echo 'Installation des dépendances...' && 
        cd server && 
        npm install --production && 
        cd .. && 
        echo 'Nettoyage des verrous SQLite...' && 
        find server/database -name '*.db-wal' -delete 2>/dev/null || true && 
        find server/database -name '*.db-shm' -delete 2>/dev/null || true && 
        find server/database -name '*.db-journal' -delete 2>/dev/null || true && 
        echo 'Démarrage du serveur...' && 
        nohup node server/server.js > logs/server.log 2>&1 & 
        echo \$! > server.pid && 
        sleep 3 && 
        echo 'Vérification du démarrage...' && 
        if ps -p \$(cat server.pid) > /dev/null 2>&1; then 
            echo 'Serveur démarré avec succès (PID: '\$(cat server.pid)')'; 
        else 
            echo 'Erreur: Le serveur ne s\'est pas démarré correctement'; 
            tail -20 logs/server.log; 
        fi
    "
    
    if ssh "$SERVER_USER@$SERVER_HOST" "$deploy_cmd"; then
        log_success "Déploiement terminé"
    else
        log_error "Erreur pendant le déploiement"
        exit 1
    fi
}

# Fonction pour tester le déploiement
test_deployment() {
    log_info "Test du déploiement..."
    
    local test_cmd="
        cd $SERVER_PATH && 
        echo 'Test de l\'API...' && 
        curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health || echo 'Erreur de connexion'
    "
    
    local http_code=$(ssh "$SERVER_USER@$SERVER_HOST" "$test_cmd")
    
    if [ "$http_code" = "200" ]; then
        log_success "API accessible (HTTP $http_code)"
        log_success "Déploiement réussi! 🚀"
        echo
        log_info "URLs d'accès:"
        echo "  - Frontend: https://beta.fusepoint.ch"
        echo "  - API: https://beta.fusepoint.ch/api/health"
    else
        log_warning "API non accessible (HTTP $http_code)"
        log_info "Vérifiez les logs sur le serveur:"
        echo "  ssh $SERVER_USER@$SERVER_HOST 'cd $SERVER_PATH && tail -50 logs/server.log'"
    fi
}

# Fonction principale
main() {
    echo -e "${GREEN}=== DÉPLOIEMENT SÉCURISÉ FUSEPOINT ===${NC}"
    echo "Branche à déployer: $BRANCH"
    echo "Serveur cible: $SERVER_USER@$SERVER_HOST:$SERVER_PATH"
    echo
    
    # Demander confirmation
    read -p "Voulez-vous continuer avec le déploiement? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        log_info "Déploiement annulé"
        exit 0
    fi
    
    # Exécuter les étapes
    check_prerequisites
    check_git_status
    push_to_github
    create_server_backup
    deploy_to_server
    test_deployment
    
    echo
    log_success "Déploiement terminé avec succès! 🎉"
}

# Gestion des erreurs
trap 'log_error "Déploiement interrompu"; exit 1' INT TERM

# Exécution
main "$@"