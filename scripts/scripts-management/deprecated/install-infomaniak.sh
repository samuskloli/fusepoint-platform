#!/bin/bash

# Script d'installation Fusepoint pour Infomaniak
# Auteur: Fusepoint Team
# Version: 1.0
# Description: Installation complète avec gestion SQLite BUSY et démarrage sans PM2

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables de configuration
PORT=3000
DOMAIN="beta.fusepoint.ch"
SITE_DIR="$HOME/sites/$DOMAIN"
LOG_DIR="$SITE_DIR/logs"
SERVER_DIR="$SITE_DIR/server"
PID_FILE="$SITE_DIR/server.pid"

# Fonction pour afficher les messages
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
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version 18+ requis (version actuelle: $(node --version))"
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        log_error "npm n'est pas installé"
        exit 1
    fi
    
    # Vérifier git
    if ! command -v git &> /dev/null; then
        log_error "git n'est pas installé"
        exit 1
    fi
    
    log_success "Prérequis vérifiés"
}

# Fonction pour arrêter tous les processus Node.js
stop_all_node_processes() {
    log_info "Arrêt de tous les processus Node.js..."
    
    # Arrêter via PID file si existe
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            kill "$PID" 2>/dev/null || true
            sleep 2
        fi
        rm -f "$PID_FILE"
    fi
    
    # Arrêter tous les processus Node.js sur le port 3000
    pkill -f "node.*server.js" 2>/dev/null || true
    pkill -f "node.*3000" 2>/dev/null || true
    
    # Vérifier si le port 3000 est libre
    if lsof -ti:3000 >/dev/null 2>&1; then
        log_warning "Le port 3000 est encore occupé, tentative de libération..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    log_success "Processus Node.js arrêtés"
}

# Fonction pour nettoyer les fichiers de verrouillage SQLite
clean_sqlite_locks() {
    log_info "Nettoyage des verrous SQLite..."
    
    if [ -d "$SERVER_DIR/database" ]; then
        # Supprimer tous les fichiers de verrouillage SQLite
        find "$SERVER_DIR/database" -name "*.db-wal" -delete 2>/dev/null || true
        find "$SERVER_DIR/database" -name "*.db-shm" -delete 2>/dev/null || true
        find "$SERVER_DIR/database" -name "*.db-journal" -delete 2>/dev/null || true
        find "$SERVER_DIR/database" -name ".*.lock" -delete 2>/dev/null || true
        find "$SERVER_DIR/database" -name "*.lock" -delete 2>/dev/null || true
        
        log_success "Verrous SQLite nettoyés"
    else
        log_warning "Répertoire database non trouvé"
    fi
}

# Fonction pour créer les répertoires nécessaires
create_directories() {
    log_info "Création des répertoires..."
    
    mkdir -p "$LOG_DIR"
    mkdir -p "$SERVER_DIR/database"
    
    log_success "Répertoires créés"
}

# Fonction pour installer les dépendances
install_dependencies() {
    log_info "Installation des dépendances..."
    
    cd "$SITE_DIR"
    
    # Installation des dépendances principales
    log_info "Installation des dépendances principales..."
    npm install --production
    
    # Installation des dépendances du serveur
    log_info "Installation des dépendances du serveur..."
    cd "$SERVER_DIR"
    npm install --production
    
    cd "$SITE_DIR"
    log_success "Dépendances installées"
}

# Fonction pour construire le frontend
build_frontend() {
    log_info "Construction du frontend..."
    
    cd "$SITE_DIR"
    npm run build
    
    log_success "Frontend construit"
}

# Fonction pour vérifier la configuration .env
check_env_config() {
    log_info "Vérification de la configuration .env..."
    
    ENV_FILE="$SERVER_DIR/.env"
    
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Fichier .env non trouvé dans $SERVER_DIR"
        log_info "Veuillez créer le fichier .env avec la configuration appropriée"
        exit 1
    fi
    
    # Vérifier les variables essentielles
    REQUIRED_VARS=("DATABASE_URL" "NODE_ENV" "PORT" "JWT_SECRET")
    
    for var in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "^$var=" "$ENV_FILE"; then
            log_error "Variable $var manquante dans .env"
            exit 1
        fi
    done
    
    log_success "Configuration .env vérifiée"
}

# Fonction pour tester la base de données
test_database() {
    log_info "Test de la connexion à la base de données..."
    
    cd "$SERVER_DIR"
    
    # Créer un script de test simple
    cat > test_db.js << 'EOF'
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);
        await connection.execute('SELECT 1');
        await connection.end();
        console.log('✓ Connexion base de données OK');
        process.exit(0);
    } catch (error) {
        console.error('✗ Erreur connexion base de données:', error.message);
        process.exit(1);
    }
}

testConnection();
EOF
    
    if node test_db.js; then
        log_success "Connexion base de données OK"
    else
        log_error "Échec de la connexion à la base de données"
        exit 1
    fi
    
    rm -f test_db.js
}

# Fonction pour démarrer le serveur
start_server() {
    log_info "Démarrage du serveur..."
    
    cd "$SERVER_DIR"
    
    # S'assurer que le répertoire logs existe
    mkdir -p "$LOG_DIR"
    
    # Démarrer le serveur en arrière-plan
    nohup node server.js > "$LOG_DIR/server.log" 2>&1 &
    SERVER_PID=$!
    
    # Sauvegarder le PID
    echo $SERVER_PID > "$PID_FILE"
    
    # Attendre un peu pour vérifier que le serveur démarre
    sleep 3
    
    # Vérifier si le processus est toujours en cours
    if ps -p $SERVER_PID > /dev/null 2>&1; then
        log_success "Serveur démarré (PID: $SERVER_PID)"
        
        # Tester la connexion
        sleep 2
        if curl -f http://localhost:$PORT/api/health >/dev/null 2>&1; then
            log_success "Serveur accessible sur le port $PORT"
        else
            log_warning "Serveur démarré mais pas encore accessible (normal au premier démarrage)"
        fi
    else
        log_error "Échec du démarrage du serveur"
        log_info "Vérification des logs..."
        tail -20 "$LOG_DIR/server.log"
        exit 1
    fi
}

# Fonction pour créer le script de gestion
create_management_script() {
    log_info "Création du script de gestion..."
    
    cat > "$SITE_DIR/manage-server.sh" << EOF
#!/bin/bash

# Script de gestion du serveur Fusepoint
SITE_DIR="$SITE_DIR"
SERVER_DIR="$SERVER_DIR"
LOG_DIR="$LOG_DIR"
PID_FILE="$PID_FILE"
PORT=$PORT

case "\$1" in
    start)
        echo "Démarrage du serveur..."
        if [ -f "\$PID_FILE" ] && ps -p \$(cat "\$PID_FILE") > /dev/null 2>&1; then
            echo "Le serveur est déjà en cours d'exécution (PID: \$(cat "\$PID_FILE"))"
            exit 1
        fi
        
        # Nettoyer les verrous SQLite
        find "\$SERVER_DIR/database" -name "*.db-wal" -delete 2>/dev/null || true
        find "\$SERVER_DIR/database" -name "*.db-shm" -delete 2>/dev/null || true
        find "\$SERVER_DIR/database" -name "*.db-journal" -delete 2>/dev/null || true
        
        cd "\$SERVER_DIR"
        nohup node server.js > "\$LOG_DIR/server.log" 2>&1 &
        echo \$! > "\$PID_FILE"
        echo "Serveur démarré (PID: \$(cat "\$PID_FILE"))"
        ;;
    stop)
        echo "Arrêt du serveur..."
        if [ -f "\$PID_FILE" ]; then
            PID=\$(cat "\$PID_FILE")
            if ps -p "\$PID" > /dev/null 2>&1; then
                kill "\$PID"
                sleep 2
                if ps -p "\$PID" > /dev/null 2>&1; then
                    kill -9 "\$PID" 2>/dev/null || true
                fi
            fi
            rm -f "\$PID_FILE"
            echo "Serveur arrêté"
        else
            pkill -f "node.*server.js" 2>/dev/null || true
            echo "Processus Node.js arrêtés"
        fi
        ;;
    restart)
        \$0 stop
        sleep 2
        \$0 start
        ;;
    status)
        if [ -f "\$PID_FILE" ] && ps -p \$(cat "\$PID_FILE") > /dev/null 2>&1; then
            echo "Serveur en cours d'exécution (PID: \$(cat "\$PID_FILE"))"
            echo "Port: \$PORT"
            echo "Logs: \$LOG_DIR/server.log"
        else
            echo "Serveur arrêté"
        fi
        ;;
    logs)
        if [ -f "\$LOG_DIR/server.log" ]; then
            tail -f "\$LOG_DIR/server.log"
        else
            echo "Fichier de log non trouvé"
        fi
        ;;
    test)
        curl -f http://localhost:\$PORT/api/health && echo "\nServeur accessible" || echo "\nServeur non accessible"
        ;;
    *)
        echo "Usage: \$0 {start|stop|restart|status|logs|test}"
        exit 1
        ;;
esac
EOF
    
    chmod +x "$SITE_DIR/manage-server.sh"
    log_success "Script de gestion créé: $SITE_DIR/manage-server.sh"
}

# Fonction pour créer le fichier .htaccess
create_htaccess() {
    log_info "Création du fichier .htaccess..."
    
    cat > "$SITE_DIR/.htaccess" << EOF
RewriteEngine On

# Redirection HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API Proxy vers Node.js sur port 3000
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3000/api/\$1 [P,L]

# Gestion des fichiers statiques
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Headers de sécurité
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

# Cache pour les assets statiques
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
    Header append Cache-Control "public"
</FilesMatch>
EOF
    
    log_success "Fichier .htaccess créé"
}

# Fonction principale
main() {
    log_info "=== Installation Fusepoint pour Infomaniak ==="
    log_info "Domaine: $DOMAIN"
    log_info "Port: $PORT"
    log_info "Répertoire: $SITE_DIR"
    echo
    
    # Vérifier que nous sommes dans le bon répertoire
    if [ ! -f "package.json" ]; then
        log_error "Ce script doit être exécuté depuis la racine du projet Fusepoint"
        exit 1
    fi
    
    # Étapes d'installation
    check_prerequisites
    stop_all_node_processes
    clean_sqlite_locks
    create_directories
    install_dependencies
    build_frontend
    check_env_config
    test_database
    create_management_script
    create_htaccess
    start_server
    
    echo
    log_success "=== Installation terminée avec succès ==="
    echo
    log_info "Commandes utiles:"
    echo "  - Gérer le serveur: ./manage-server.sh {start|stop|restart|status|logs|test}"
    echo "  - Voir les logs: tail -f $LOG_DIR/server.log"
    echo "  - Tester l'API: curl https://$DOMAIN/api/health"
    echo "  - Accéder au site: https://$DOMAIN"
    echo
    log_info "Le serveur est maintenant en cours d'exécution sur le port $PORT"
}

# Gestion des signaux pour un arrêt propre
trap 'log_error "Installation interrompue"; exit 1' INT TERM

# Exécuter le script principal
main "$@"