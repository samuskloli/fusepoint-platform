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
# Configuration du serveur - Informations Infomaniak
# Basé sur les informations du serveur Infomaniak
SERVER_USER="gjNCbjZ4HAb_sam"  # Nom d'utilisateur SSH Infomaniak
SERVER_HOST="57-101961.ssh.hosting-ik.com"  # Hostname SSH Infomaniak
SERVER_PATH="~/sites/beta.fusepoint.ch"  # Chemin vers votre site
SERVER_SSH="$SERVER_USER@$SERVER_HOST"
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
    if ! ssh -T -o ConnectTimeout=10 -o BatchMode=yes "$SERVER_USER@$SERVER_HOST" exit 2>/dev/null; then
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

# Fonction pour établir une connexion SSH maître
setup_ssh_master() {
    # Utiliser un nom de socket très court
    local ssh_socket="/tmp/s$$"
    
    # Nettoyer les anciennes connexions
    ssh -O exit -S "$ssh_socket" "$SERVER_USER@$SERVER_HOST" 2>/dev/null || true
    
    # Établir la connexion maître sans messages verbeux
    ssh -M -S "$ssh_socket" -f -N -T "$SERVER_USER@$SERVER_HOST" 2>/dev/null
    local ssh_exit_code=$?
    
    if [ $ssh_exit_code -eq 0 ]; then
        echo "$ssh_socket"
        return 0
    else
        return 1
    fi
}

# Fonction pour fermer la connexion SSH maître
close_ssh_master() {
    local ssh_socket="$1"
    if [ -n "$ssh_socket" ]; then
        ssh -O exit -S "$ssh_socket" "$SERVER_USER@$SERVER_HOST" 2>/dev/null || true
    fi
}

# Fonction pour créer une sauvegarde sur le serveur
create_server_backup() {
    log_info "Création d'une sauvegarde sur le serveur..."
    
    local backup_timestamp=$(date +%Y%m%d_%H%M%S)
    local ssh_socket="$1"
    local backup_cmd="
        cd $SERVER_PATH && 
        if [ -d server ]; then 
            tar -czf backup_${backup_timestamp}.tar.gz server/ .env* ecosystem.config.* || true; 
            echo 'Sauvegarde créée: backup_${backup_timestamp}.tar.gz'; 
        else 
            echo 'Aucun serveur à sauvegarder'; 
        fi
    "
    
    if [ -n "$ssh_socket" ]; then
        ssh -S "$ssh_socket" -T "$SERVER_USER@$SERVER_HOST" "$backup_cmd"
    else
        ssh -T "$SERVER_USER@$SERVER_HOST" "$backup_cmd"
    fi
    
    local ssh_exit_code=$?
    
    if [ $ssh_exit_code -eq 0 ]; then
        log_success "Sauvegarde serveur créée: backup_${backup_timestamp}.tar.gz"
    elif [ $ssh_exit_code -eq 255 ]; then
        log_error "Erreur d'authentification SSH lors de la création de sauvegarde"
        log_info "Vérifiez votre mot de passe ou votre clé SSH"
        exit 1
    else
        log_warning "Impossible de créer la sauvegarde serveur (code: $ssh_exit_code)"
    fi
}

# Fonction pour déployer sur le serveur
deploy_to_server() {
    log_info "Déploiement sur le serveur Infomaniak..."
    
    local ssh_socket="$1"
    
    if [ -n "$ssh_socket" ]; then
        ssh -S "$ssh_socket" -T "$SERVER_USER@$SERVER_HOST" << 'EOF'
cd ~/sites/beta.fusepoint.ch
echo "Arrêt des processus existants..."
pkill -f "node.*server.js" || true
sleep 2
echo "Mise à jour depuis GitHub..."
git fetch origin
git checkout main
git pull origin main
echo "Installation des dépendances..."
cd server
npm install --production
cd ..
echo "Nettoyage des verrous SQLite..."
find server/database -name "*.db-wal" -delete 2>/dev/null || true
find server/database -name "*.db-shm" -delete 2>/dev/null || true
find server/database -name "*.db-journal" -delete 2>/dev/null || true
echo "Démarrage du serveur..."
nohup node server/server.js > logs/server.log 2>&1 &
echo $! > server.pid
sleep 3
echo "Vérification du démarrage..."
if ps -p $(cat server.pid) > /dev/null 2>&1; then
    echo "Serveur démarré avec succès (PID: $(cat server.pid))"
else
    echo "Erreur: Le serveur ne s'est pas démarré correctement"
    tail -20 logs/server.log
fi
EOF
    else
        ssh -T "$SERVER_USER@$SERVER_HOST" << 'EOF'
cd ~/sites/beta.fusepoint.ch
echo "Arrêt des processus existants..."
pkill -f "node.*server.js" || true
sleep 2
echo "Mise à jour depuis GitHub..."
git fetch origin
git checkout main
git pull origin main
echo "Installation des dépendances..."
cd server
npm install --production
cd ..
echo "Nettoyage des verrous SQLite..."
find server/database -name "*.db-wal" -delete 2>/dev/null || true
find server/database -name "*.db-shm" -delete 2>/dev/null || true
find server/database -name "*.db-journal" -delete 2>/dev/null || true
echo "Démarrage du serveur..."
nohup node server/server.js > logs/server.log 2>&1 &
echo $! > server.pid
sleep 3
echo "Vérification du démarrage..."
if ps -p $(cat server.pid) > /dev/null 2>&1; then
    echo "Serveur démarré avec succès (PID: $(cat server.pid))"
else
    echo "Erreur: Le serveur ne s'est pas démarré correctement"
    tail -20 logs/server.log
fi
EOF
    fi
    
    local ssh_exit_code=$?
    
    if [ $ssh_exit_code -eq 0 ]; then
        log_success "Déploiement terminé"
    elif [ $ssh_exit_code -eq 255 ]; then
        log_error "Erreur d'authentification SSH lors du déploiement"
        log_info "Causes possibles:"
        log_info "  - Mot de passe SSH incorrect"
        log_info "  - Clé SSH non configurée ou expirée"
        log_info "  - Problème de connexion réseau"
        log_info "  - Serveur SSH non accessible"
        log_info "Solution: Vérifiez vos identifiants SSH et la connectivité"
        exit 1
    else
        log_error "Erreur pendant le déploiement (code: $ssh_exit_code)"
        exit 1
    fi
}

# Fonction pour tester le déploiement
test_deployment() {
    log_info "Test du déploiement..."
    
    local ssh_socket="$1"
    local test_cmd="
        cd $SERVER_PATH && 
        echo 'Test de l\'API...' && 
        curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health || echo 'Erreur de connexion'
    "
    
    local http_code
    if [ -n "$ssh_socket" ]; then
        http_code=$(ssh -S "$ssh_socket" -T "$SERVER_USER@$SERVER_HOST" "$test_cmd" 2>/dev/null)
    else
        http_code=$(ssh -T "$SERVER_USER@$SERVER_HOST" "$test_cmd" 2>/dev/null)
    fi
    
    local ssh_exit_code=$?
    
    if [ $ssh_exit_code -eq 255 ]; then
        log_error "Erreur d'authentification SSH lors du test"
        log_info "Le déploiement peut avoir réussi mais le test a échoué"
        return 1
    elif [ $ssh_exit_code -ne 0 ]; then
        log_warning "Erreur lors du test de déploiement (code: $ssh_exit_code)"
        return 1
    fi
    
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
    
    # Exécuter les étapes préliminaires
    check_prerequisites
    check_git_status
    push_to_github
    
    # Établir la connexion SSH maître pour éviter les multiples demandes de mot de passe
    local ssh_socket
    ssh_socket=$(setup_ssh_master)
    if [ $? -eq 0 ] && [ -n "$ssh_socket" ]; then
        log_info "Utilisation du multiplexage SSH pour éviter les multiples saisies de mot de passe"
    else
        log_warning "Impossible d'établir le multiplexage SSH, utilisation des connexions individuelles"
        ssh_socket=""
    fi
    
    # Exécuter les étapes nécessitant SSH avec la connexion maître
    create_server_backup "$ssh_socket"
    deploy_to_server "$ssh_socket"
    test_deployment "$ssh_socket"
    
    # Fermer la connexion SSH maître
    close_ssh_master "$ssh_socket"
    
    echo
    log_success "Déploiement terminé avec succès! 🎉"
}

# Gestion des erreurs
trap 'log_error "Déploiement interrompu"; exit 1' INT TERM

# Exécution
main "$@"