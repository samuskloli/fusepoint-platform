#!/bin/bash

# Script de déploiement automatique Fusepoint pour Infomaniak
# Ce script clone le projet depuis GitHub et configure tout automatiquement

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="fusepoint-platform"
GITHUB_REPO="https://github.com/samuskloli/fusepoint-platform.git"
INSTALL_DIR="$HOME/$PROJECT_NAME"
BACKUP_DIR="$HOME/${PROJECT_NAME}_backup_$(date +%Y%m%d_%H%M%S)"
ENV_FILE="$INSTALL_DIR/server/.env"
LOG_FILE="$INSTALL_DIR/deployment.log"

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Fonction pour demander le token GitHub
get_github_token() {
    echo -e "${YELLOW}Pour cloner le dépôt privé, vous devez fournir un token GitHub.${NC}"
    echo "Vous pouvez créer un token sur: https://github.com/settings/tokens"
    echo "Permissions requises: repo (Full control of private repositories)"
    echo
    read -p "Entrez votre token GitHub: " GITHUB_TOKEN
    
    if [ -z "$GITHUB_TOKEN" ]; then
        log_error "Token GitHub requis pour continuer"
        exit 1
    fi
    
    # Construire l'URL avec le token
    GITHUB_REPO="https://${GITHUB_TOKEN}@github.com/samuskloli/fusepoint-platform.git"
}

# Fonction pour vérifier les prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    log_success "Node.js détecté: $NODE_VERSION"
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        log_error "npm n'est pas installé"
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    log_success "npm détecté: $NPM_VERSION"
    
    # Vérifier git
    if ! command -v git &> /dev/null; then
        log_error "git n'est pas installé"
        exit 1
    fi
    
    GIT_VERSION=$(git --version)
    log_success "git détecté: $GIT_VERSION"
}

# Fonction pour sauvegarder l'installation existante
backup_existing() {
    if [ -d "$INSTALL_DIR" ]; then
        log_warning "Installation existante détectée"
        read -p "Voulez-vous sauvegarder l'installation existante? (y/N): " backup_choice
        
        if [[ $backup_choice =~ ^[Yy]$ ]]; then
            log_info "Sauvegarde en cours vers $BACKUP_DIR..."
            mv "$INSTALL_DIR" "$BACKUP_DIR"
            log_success "Sauvegarde créée: $BACKUP_DIR"
        else
            log_warning "Suppression de l'installation existante..."
            rm -rf "$INSTALL_DIR"
        fi
    fi
}

# Fonction pour cloner le projet
clone_project() {
    log_info "Clonage du projet depuis GitHub..."
    
    if git clone "$GITHUB_REPO" "$INSTALL_DIR"; then
        log_success "Projet cloné avec succès"
    else
        log_error "Échec du clonage du projet"
        exit 1
    fi
    
    cd "$INSTALL_DIR"
}

# Fonction pour créer le fichier .env
create_env_file() {
    log_info "Création du fichier de configuration .env..."
    
    # Créer le répertoire server s'il n'existe pas
    mkdir -p "$(dirname "$ENV_FILE")"
    
    # Créer le fichier .env avec des valeurs par défaut
    cat > "$ENV_FILE" << 'EOF'
# Base de données
DATABASE_URL="mysql://username:password@host:3306/database"

# Configuration serveur
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://your-domain.com
API_URL=https://your-domain.com/api

# Répertoires
UPLOAD_DIR=./uploads
LOG_DIR=./logs
BACKUP_DIR=./backups

# Sécurité
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Configuration SMTP Infomaniak
SMTP_HOST=mail.infomaniak.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@domain.com
SMTP_PASS="your_smtp_password"
EMAIL_FROM=your_email@domain.com
EMAIL_FROM_NAME="Fusepoint Hub"
TEST_EMAIL=samuskl@gmail.com

# Configuration OAuth Facebook
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Configuration OAuth Instagram
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret

# Configuration OAuth Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Configuration OAuth LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Configuration OAuth TikTok
TIKTOK_CLIENT_ID=your_tiktok_client_id
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# Logs
LOG_LEVEL=info
LOG_FILE=./logs/app.log
ERROR_LOG_FILE=./logs/error.log
ACCESS_LOG_FILE=./logs/access.log
EOF

    log_success "Fichier .env créé avec des valeurs par défaut"
    log_warning "IMPORTANT: Vous devez modifier le fichier $ENV_FILE avec vos vraies valeurs"
}

# Fonction pour installer les dépendances
install_dependencies() {
    log_info "Installation des dépendances..."
    
    # Backend
    cd "$INSTALL_DIR/server"
    if npm install; then
        log_success "Dépendances backend installées"
    else
        log_error "Échec de l'installation des dépendances backend"
        exit 1
    fi
    
    # Frontend
    cd "$INSTALL_DIR/client"
    if npm install; then
        log_success "Dépendances frontend installées"
    else
        log_error "Échec de l'installation des dépendances frontend"
        exit 1
    fi
}

# Fonction pour construire le frontend
build_frontend() {
    log_info "Construction du frontend..."
    
    cd "$INSTALL_DIR/client"
    if npm run build; then
        log_success "Frontend construit avec succès"
    else
        log_error "Échec de la construction du frontend"
        exit 1
    fi
}

# Fonction pour configurer Apache
configure_apache() {
    log_info "Configuration d'Apache..."
    
    cat > "$INSTALL_DIR/.htaccess" << 'EOF'
# Redirection HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Configuration pour l'API
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
ProxyPassReverse /api/ http://localhost:3000/api/

# Configuration pour les fichiers statiques du frontend
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule ^(.*)$ /client/dist/index.html [L]

# Headers de sécurité
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache pour les ressources statiques
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
EOF

    log_success "Configuration Apache créée"
}

# Fonction pour arrêter les processus Node.js existants
stop_existing_processes() {
    log_info "Arrêt des processus Node.js existants..."
    
    # Trouver et arrêter les processus Node.js sur le port 3000
    if lsof -ti:3000 >/dev/null 2>&1; then
        log_warning "Processus détecté sur le port 3000, arrêt en cours..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    # Arrêter tous les processus node liés au projet
    pkill -f "node.*server" 2>/dev/null || true
    pkill -f "npm.*start" 2>/dev/null || true
    
    sleep 2
    log_success "Processus existants arrêtés"
}

# Fonction pour nettoyer les verrous SQLite
clean_sqlite_locks() {
    log_info "Nettoyage des verrous SQLite..."
    
    cd "$INSTALL_DIR/server"
    
    # Supprimer les fichiers de verrou SQLite
    find . -name "*.db-wal" -delete 2>/dev/null || true
    find . -name "*.db-shm" -delete 2>/dev/null || true
    find . -name "*.db-journal" -delete 2>/dev/null || true
    find . -name ".*.lock" -delete 2>/dev/null || true
    
    log_success "Verrous SQLite nettoyés"
}

# Fonction pour créer les répertoires nécessaires
create_directories() {
    log_info "Création des répertoires nécessaires..."
    
    cd "$INSTALL_DIR/server"
    mkdir -p logs uploads backups database
    
    log_success "Répertoires créés"
}

# Fonction pour démarrer le serveur
start_server() {
    log_info "Démarrage du serveur..."
    
    cd "$INSTALL_DIR/server"
    
    # Exporter les variables d'environnement
    if [ -f ".env" ]; then
        export $(grep -v '^#' .env | xargs)
    fi
    
    # Démarrer le serveur en arrière-plan avec nohup
    nohup npm start > "$INSTALL_DIR/server.log" 2>&1 &
    SERVER_PID=$!
    
    # Attendre un peu pour vérifier si le serveur démarre correctement
    sleep 5
    
    if kill -0 $SERVER_PID 2>/dev/null; then
        echo $SERVER_PID > "$INSTALL_DIR/server.pid"
        log_success "Serveur démarré avec succès (PID: $SERVER_PID)"
        
        # Vérifier si le port 3000 est ouvert
        sleep 2
        if lsof -ti:3000 >/dev/null 2>&1; then
            log_success "Serveur accessible sur le port 3000"
        else
            log_warning "Le serveur semble démarré mais le port 3000 n'est pas accessible"
        fi
    else
        log_error "Échec du démarrage du serveur"
        log_error "Vérifiez les logs: tail -f $INSTALL_DIR/server.log"
        exit 1
    fi
}

# Fonction pour créer les scripts de gestion
create_management_scripts() {
    log_info "Création des scripts de gestion..."
    
    # Script de gestion principal
    cat > "$INSTALL_DIR/manage-server.sh" << 'EOF'
#!/bin/bash

# Script de gestion du serveur Fusepoint

SERVER_DIR="$(dirname "$0")/server"
PID_FILE="$(dirname "$0")/server.pid"
LOG_FILE="$(dirname "$0")/server.log"

case "$1" in
    start)
        echo "Démarrage du serveur..."
        cd "$SERVER_DIR"
        if [ -f ".env" ]; then
            export $(grep -v '^#' .env | xargs)
        fi
        nohup npm start > "$LOG_FILE" 2>&1 &
        echo $! > "$PID_FILE"
        echo "Serveur démarré (PID: $(cat $PID_FILE))"
        ;;
    stop)
        echo "Arrêt du serveur..."
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            kill $PID 2>/dev/null || true
            rm -f "$PID_FILE"
            echo "Serveur arrêté"
        else
            echo "Aucun PID trouvé, arrêt forcé..."
            pkill -f "node.*server" 2>/dev/null || true
        fi
        ;;
    restart)
        $0 stop
        sleep 2
        $0 start
        ;;
    status)
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            if kill -0 $PID 2>/dev/null; then
                echo "Serveur en cours d'exécution (PID: $PID)"
            else
                echo "Serveur arrêté (PID obsolète)"
                rm -f "$PID_FILE"
            fi
        else
            echo "Serveur arrêté"
        fi
        ;;
    logs)
        tail -f "$LOG_FILE"
        ;;
    test)
        echo "Test de connexion au serveur..."
        if curl -s http://localhost:3000/api/health >/dev/null; then
            echo "✅ Serveur accessible"
        else
            echo "❌ Serveur non accessible"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|test}"
        exit 1
        ;;
esac
EOF

    chmod +x "$INSTALL_DIR/manage-server.sh"
    
    # Script de redémarrage rapide
    cat > "$INSTALL_DIR/restart.sh" << 'EOF'
#!/bin/bash
echo "Redémarrage rapide du serveur Fusepoint..."
./manage-server.sh stop
sleep 2
# Nettoyer les verrous SQLite
find server -name "*.db-wal" -delete 2>/dev/null || true
find server -name "*.db-shm" -delete 2>/dev/null || true
find server -name "*.db-journal" -delete 2>/dev/null || true
./manage-server.sh start
echo "Redémarrage terminé"
EOF

    chmod +x "$INSTALL_DIR/restart.sh"
    
    log_success "Scripts de gestion créés"
}

# Fonction principale
main() {
    echo -e "${BLUE}=== Déploiement automatique Fusepoint pour Infomaniak ===${NC}"
    echo
    
    # Créer le fichier de log
    mkdir -p "$(dirname "$LOG_FILE")"
    touch "$LOG_FILE"
    
    # Demander le token GitHub
    get_github_token
    
    # Exécuter les étapes
    check_prerequisites
    backup_existing
    clone_project
    create_env_file
    install_dependencies
    build_frontend
    configure_apache
    stop_existing_processes
    clean_sqlite_locks
    create_directories
    start_server
    create_management_scripts
    
    echo
    echo -e "${GREEN}=== Déploiement terminé avec succès! ===${NC}"
    echo
    echo -e "${YELLOW}Prochaines étapes:${NC}"
    echo "1. Modifiez le fichier de configuration: $ENV_FILE"
    echo "2. Redémarrez le serveur: $INSTALL_DIR/restart.sh"
    echo "3. Vérifiez les logs: $INSTALL_DIR/manage-server.sh logs"
    echo "4. Testez l'application: $INSTALL_DIR/manage-server.sh test"
    echo
    echo -e "${YELLOW}Commandes utiles:${NC}"
    echo "• Gérer le serveur: $INSTALL_DIR/manage-server.sh {start|stop|restart|status|logs|test}"
    echo "• Redémarrage rapide: $INSTALL_DIR/restart.sh"
    echo "• Logs du serveur: tail -f $INSTALL_DIR/server.log"
    echo "• Statut du port: lsof -i:3000"
    echo
    echo -e "${BLUE}Installation terminée dans: $INSTALL_DIR${NC}"
}

# Exécuter le script principal
main "$@"