#!/bin/bash

# =============================================================================
# SCRIPT DE DÉPLOIEMENT PRODUCTION - FUSEPOINT HUB
# =============================================================================
# Ce script automatise le déploiement en production avec toutes les vérifications
# nécessaires pour s'assurer que les URLs et emails fonctionnent correctement.
#
# Usage: ./deploy-production.sh [--skip-tests] [--force]
# =============================================================================

set -e  # Arrêter en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Fusepoint Hub"
FRONTEND_DIR="./frontend"
SERVER_DIR="./server"
BUILD_DIR="./frontend/dist"
BACKUP_DIR="./backups"
LOG_FILE="./deploy-$(date +%Y%m%d-%H%M%S).log"

# Options
SKIP_TESTS=false
FORCE_DEPLOY=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --force)
            FORCE_DEPLOY=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [--skip-tests] [--force]"
            echo "  --skip-tests  Ignorer les tests de validation"
            echo "  --force       Forcer le déploiement même en cas d'avertissements"
            exit 0
            ;;
        *)
            echo "Option inconnue: $1"
            exit 1
            ;;
    esac
done

# =============================================================================
# FONCTIONS UTILITAIRES
# =============================================================================

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "Commande '$1' non trouvée. Veuillez l'installer."
        exit 1
    fi
}

check_file() {
    if [[ ! -f "$1" ]]; then
        log_error "Fichier requis non trouvé: $1"
        exit 1
    fi
}

check_directory() {
    if [[ ! -d "$1" ]]; then
        log_error "Répertoire requis non trouvé: $1"
        exit 1
    fi
}

# =============================================================================
# VÉRIFICATIONS PRÉLIMINAIRES
# =============================================================================

pre_deployment_checks() {
    log "🔍 Vérifications préliminaires..."
    
    # Vérifier les commandes nécessaires
    check_command "node"
    check_command "npm"
    check_command "git"
    
    # Vérifier la structure du projet
    check_directory "$FRONTEND_DIR"
    check_directory "$SERVER_DIR"
    check_file "$FRONTEND_DIR/package.json"
    check_file "$SERVER_DIR/package.json"
    
    # Vérifier les fichiers de configuration
    if [[ ! -f "$SERVER_DIR/.env" ]]; then
        log_warning "Fichier .env manquant dans le serveur"
        if [[ -f "$SERVER_DIR/.env.example" ]]; then
            log "Copie de .env.example vers .env..."
            cp "$SERVER_DIR/.env.example" "$SERVER_DIR/.env"
            log_warning "⚠️ IMPORTANT: Configurez le fichier .env avant de continuer!"
            if [[ "$FORCE_DEPLOY" != true ]]; then
                exit 1
            fi
        fi
    fi
    
    log_success "Vérifications préliminaires terminées"
}

# =============================================================================
# VALIDATION DE LA CONFIGURATION
# =============================================================================

validate_configuration() {
    log "🔧 Validation de la configuration..."
    
    # Charger les variables d'environnement
    if [[ -f "$SERVER_DIR/.env" ]]; then
        source "$SERVER_DIR/.env"
    fi
    
    # Vérifier les variables critiques
    local errors=0
    
    if [[ -z "$NODE_ENV" ]]; then
        log_error "NODE_ENV non défini"
        ((errors++))
    elif [[ "$NODE_ENV" != "production" ]]; then
        log_warning "NODE_ENV n'est pas défini sur 'production' (actuel: $NODE_ENV)"
    fi
    
    if [[ -z "$FRONTEND_URL" ]]; then
        log_error "FRONTEND_URL non défini"
        ((errors++))
    elif [[ "$FRONTEND_URL" == *"localhost"* ]]; then
        log_error "FRONTEND_URL contient 'localhost' en production: $FRONTEND_URL"
        ((errors++))
    fi
    
    if [[ -z "$API_BASE_URL" ]]; then
        log_error "API_BASE_URL non défini"
        ((errors++))
    elif [[ "$API_BASE_URL" == *"localhost"* ]]; then
        log_error "API_BASE_URL contient 'localhost' en production: $API_BASE_URL"
        ((errors++))
    fi
    
    if [[ -z "$JWT_SECRET" ]] || [[ "$JWT_SECRET" == "votre_jwt_secret_tres_securise"* ]]; then
        log_error "JWT_SECRET non configuré ou utilise la valeur par défaut"
        ((errors++))
    fi
    
    if [[ -z "$ENCRYPTION_KEY" ]] || [[ "$ENCRYPTION_KEY" == "votre_cle_chiffrement"* ]]; then
        log_error "ENCRYPTION_KEY non configuré ou utilise la valeur par défaut"
        ((errors++))
    fi
    
    if [[ $errors -gt 0 ]]; then
        log_error "$errors erreur(s) de configuration détectée(s)"
        if [[ "$FORCE_DEPLOY" != true ]]; then
            exit 1
        fi
    fi
    
    log_success "Configuration validée"
}

# =============================================================================
# TESTS DE VALIDATION
# =============================================================================

run_validation_tests() {
    if [[ "$SKIP_TESTS" == true ]]; then
        log_warning "Tests de validation ignorés (--skip-tests)"
        return
    fi
    
    log "🧪 Exécution des tests de validation..."
    
    # Test de validation des URLs
    if [[ -f "$SERVER_DIR/validate-production-urls.js" ]]; then
        log "Validation des URLs..."
        cd "$SERVER_DIR"
        if node validate-production-urls.js --production; then
            log_success "Validation des URLs réussie"
        else
            log_error "Validation des URLs échouée"
            if [[ "$FORCE_DEPLOY" != true ]]; then
                exit 1
            fi
        fi
        cd ..
    fi
    
    # Test de validation des emails
    if [[ -f "$SERVER_DIR/test-email-production.js" ]]; then
        log "Validation des emails..."
        cd "$SERVER_DIR"
        if node test-email-production.js; then
            log_success "Validation des emails réussie"
        else
            log_error "Validation des emails échouée"
            if [[ "$FORCE_DEPLOY" != true ]]; then
                exit 1
            fi
        fi
        cd ..
    fi
    
    log_success "Tests de validation terminés"
}

# =============================================================================
# SAUVEGARDE
# =============================================================================

create_backup() {
    log "💾 Création de la sauvegarde..."
    
    # Créer le répertoire de sauvegarde
    mkdir -p "$BACKUP_DIR"
    
    local backup_name="backup-$(date +%Y%m%d-%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    mkdir -p "$backup_path"
    
    # Sauvegarder les fichiers critiques
    if [[ -f "$SERVER_DIR/.env" ]]; then
        cp "$SERVER_DIR/.env" "$backup_path/server.env"
    fi
    
    if [[ -f "$FRONTEND_DIR/.env.production" ]]; then
        cp "$FRONTEND_DIR/.env.production" "$backup_path/frontend.env.production"
    fi
    
    if [[ -f "$SERVER_DIR/fusepoint.db" ]]; then
        cp "$SERVER_DIR/fusepoint.db" "$backup_path/fusepoint.db"
    fi
    
    # Sauvegarder la build actuelle si elle existe
    if [[ -d "$BUILD_DIR" ]]; then
        cp -r "$BUILD_DIR" "$backup_path/frontend-build"
    fi
    
    log_success "Sauvegarde créée: $backup_path"
}

# =============================================================================
# CONSTRUCTION DU FRONTEND
# =============================================================================

build_frontend() {
    log "🏗️ Construction du frontend..."
    
    cd "$FRONTEND_DIR"
    
    # Installer les dépendances
    log "Installation des dépendances frontend..."
    npm ci --production=false
    
    # Construire l'application
    log "Construction de l'application..."
    npm run build
    
    # Vérifier que la build a réussi
    if [[ ! -d "dist" ]] || [[ ! -f "dist/index.html" ]]; then
        log_error "La construction du frontend a échoué"
        exit 1
    fi
    
    cd ..
    log_success "Frontend construit avec succès"
}

# =============================================================================
# PRÉPARATION DU SERVEUR
# =============================================================================

prepare_server() {
    log "⚙️ Préparation du serveur..."
    
    cd "$SERVER_DIR"
    
    # Installer les dépendances
    log "Installation des dépendances serveur..."
    npm ci --production
    
    # Vérifier la base de données
    if [[ ! -f "fusepoint.db" ]]; then
        log "Initialisation de la base de données..."
        # Ici, vous pourriez ajouter un script d'initialisation de la DB
        touch fusepoint.db
    fi
    
    cd ..
    log_success "Serveur préparé"
}

# =============================================================================
# DÉPLOIEMENT
# =============================================================================

deploy_application() {
    log "🚀 Déploiement de l'application..."
    
    # Arrêter les processus existants (si applicable)
    log "Arrêt des processus existants..."
    pkill -f "node.*server" || true
    
    # Attendre un peu pour que les processus se terminent
    sleep 2
    
    # Démarrer le serveur
    log "Démarrage du serveur..."
    cd "$SERVER_DIR"
    
    # Démarrer en arrière-plan avec PM2 si disponible, sinon avec nohup
    if command -v pm2 &> /dev/null; then
        pm2 delete fusepoint-hub || true
        pm2 start server.js --name fusepoint-hub
        pm2 save
    else
        nohup node server.js > ../server.log 2>&1 &
        echo $! > ../server.pid
    fi
    
    cd ..
    
    # Attendre que le serveur démarre
    log "Attente du démarrage du serveur..."
    sleep 5
    
    log_success "Application déployée"
}

# =============================================================================
# TESTS POST-DÉPLOIEMENT
# =============================================================================

post_deployment_tests() {
    log "🔍 Tests post-déploiement..."
    
    # Charger les variables d'environnement
    if [[ -f "$SERVER_DIR/.env" ]]; then
        source "$SERVER_DIR/.env"
    fi
    
    local api_url="${API_BASE_URL:-http://localhost:3002}"
    
    # Tester la connectivité de l'API
    log "Test de connectivité API: $api_url"
    if curl -f -s "$api_url/health" > /dev/null 2>&1; then
        log_success "API accessible"
    else
        log_warning "API non accessible à $api_url/health"
    fi
    
    # Tester les routes principales
    local routes=("/api/auth/status" "/api/health")
    for route in "${routes[@]}"; do
        if curl -f -s "$api_url$route" > /dev/null 2>&1; then
            log_success "Route $route accessible"
        else
            log_warning "Route $route non accessible"
        fi
    done
    
    log_success "Tests post-déploiement terminés"
}

# =============================================================================
# NETTOYAGE
# =============================================================================

cleanup() {
    log "🧹 Nettoyage..."
    
    # Nettoyer les anciens logs (garder les 10 derniers)
    find . -name "deploy-*.log" -type f | sort | head -n -10 | xargs rm -f
    
    # Nettoyer les anciennes sauvegardes (garder les 5 dernières)
    if [[ -d "$BACKUP_DIR" ]]; then
        find "$BACKUP_DIR" -name "backup-*" -type d | sort | head -n -5 | xargs rm -rf
    fi
    
    log_success "Nettoyage terminé"
}

# =============================================================================
# FONCTION PRINCIPALE
# =============================================================================

main() {
    log "🚀 Démarrage du déploiement de $PROJECT_NAME"
    log "📝 Log du déploiement: $LOG_FILE"
    
    # Enregistrer les informations de déploiement
    {
        echo "Déploiement de $PROJECT_NAME"
        echo "Date: $(date)"
        echo "Utilisateur: $(whoami)"
        echo "Répertoire: $(pwd)"
        echo "Options: SKIP_TESTS=$SKIP_TESTS, FORCE_DEPLOY=$FORCE_DEPLOY"
        echo "==========================================="
    } >> "$LOG_FILE"
    
    # Exécuter les étapes de déploiement
    pre_deployment_checks
    validate_configuration
    run_validation_tests
    create_backup
    build_frontend
    prepare_server
    deploy_application
    post_deployment_tests
    cleanup
    
    log_success "🎉 Déploiement terminé avec succès!"
    log "📊 Résumé:"
    log "   - Frontend: Construit et prêt"
    log "   - Serveur: Démarré"
    log "   - Logs: $LOG_FILE"
    
    if [[ -f "$SERVER_DIR/.env" ]]; then
        source "$SERVER_DIR/.env"
        log "   - Frontend URL: ${FRONTEND_URL:-Non défini}"
        log "   - API URL: ${API_BASE_URL:-Non défini}"
    fi
    
    log "\n🔗 Votre application est maintenant accessible!"
}

# =============================================================================
# GESTION DES ERREURS
# =============================================================================

trap 'log_error "Déploiement interrompu"; exit 1' INT TERM

# =============================================================================
# EXÉCUTION
# =============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi