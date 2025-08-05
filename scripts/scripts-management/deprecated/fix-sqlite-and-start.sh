#!/bin/bash

# Script de résolution SQLite BUSY et démarrage serveur
# Spécialement conçu pour Infomaniak avec port 3000

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PORT=3000
SERVER_DIR="./server"
LOG_DIR="./logs"
PID_FILE="./server.pid"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Fonction pour arrêter tous les processus Node.js
stop_all_processes() {
    log_info "Arrêt de tous les processus Node.js..."
    
    # Arrêter via PID file
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            kill "$PID" 2>/dev/null || true
            sleep 2
            # Force kill si nécessaire
            if ps -p "$PID" > /dev/null 2>&1; then
                kill -9 "$PID" 2>/dev/null || true
            fi
        fi
        rm -f "$PID_FILE"
    fi
    
    # Arrêter tous les processus Node.js liés au serveur
    pkill -f "node.*server.js" 2>/dev/null || true
    pkill -f "node.*3000" 2>/dev/null || true
    
    # Libérer le port 3000 si occupé
    if command -v lsof >/dev/null 2>&1; then
        if lsof -ti:3000 >/dev/null 2>&1; then
            log_warning "Port 3000 occupé, libération..."
            lsof -ti:3000 | xargs kill -9 2>/dev/null || true
            sleep 2
        fi
    fi
    
    log_success "Processus arrêtés"
}

# Fonction pour nettoyer les verrous SQLite
clean_sqlite_locks() {
    log_info "Nettoyage des verrous SQLite..."
    
    if [ -d "$SERVER_DIR/database" ]; then
        # Supprimer tous les fichiers de verrouillage
        find "$SERVER_DIR/database" -name "*.db-wal" -delete 2>/dev/null || true
        find "$SERVER_DIR/database" -name "*.db-shm" -delete 2>/dev/null || true
        find "$SERVER_DIR/database" -name "*.db-journal" -delete 2>/dev/null || true
        find "$SERVER_DIR/database" -name ".*.lock" -delete 2>/dev/null || true
        find "$SERVER_DIR/database" -name "*.lock" -delete 2>/dev/null || true
        
        # Nettoyer les fichiers temporaires
        find "$SERVER_DIR/database" -name "*.tmp" -delete 2>/dev/null || true
        find "$SERVER_DIR/database" -name "*-journal" -delete 2>/dev/null || true
        
        log_success "Verrous SQLite nettoyés"
    else
        log_warning "Répertoire database non trouvé"
    fi
}

# Fonction pour vérifier et créer les répertoires
setup_directories() {
    log_info "Configuration des répertoires..."
    
    # Créer le répertoire logs s'il n'existe pas
    mkdir -p "$LOG_DIR"
    
    # Créer le répertoire database s'il n'existe pas
    mkdir -p "$SERVER_DIR/database"
    
    # Vérifier les permissions
    chmod 755 "$LOG_DIR" 2>/dev/null || true
    chmod 755 "$SERVER_DIR/database" 2>/dev/null || true
    
    log_success "Répertoires configurés"
}

# Fonction pour vérifier la configuration
check_config() {
    log_info "Vérification de la configuration..."
    
    # Vérifier que nous sommes dans le bon répertoire
    if [ ! -f "package.json" ]; then
        log_error "Ce script doit être exécuté depuis la racine du projet"
        exit 1
    fi
    
    # Vérifier l'existence du serveur
    if [ ! -f "$SERVER_DIR/server.js" ]; then
        log_error "Fichier server.js non trouvé dans $SERVER_DIR"
        exit 1
    fi
    
    # Vérifier le fichier .env
    if [ ! -f "$SERVER_DIR/.env" ]; then
        log_error "Fichier .env non trouvé dans $SERVER_DIR"
        log_info "Veuillez créer le fichier .env avec la configuration appropriée"
        exit 1
    fi
    
    log_success "Configuration vérifiée"
}

# Fonction pour installer les dépendances si nécessaire
check_dependencies() {
    log_info "Vérification des dépendances..."
    
    cd "$SERVER_DIR"
    
    # Vérifier si node_modules existe
    if [ ! -d "node_modules" ]; then
        log_info "Installation des dépendances du serveur..."
        npm install --production
    fi
    
    cd ..
    
    # Vérifier les dépendances principales
    if [ ! -d "node_modules" ]; then
        log_info "Installation des dépendances principales..."
        npm install --production
    fi
    
    log_success "Dépendances vérifiées"
}

# Fonction pour démarrer le serveur avec gestion d'erreurs
start_server() {
    log_info "Démarrage du serveur..."
    
    cd "$SERVER_DIR"
    
    # Exporter les variables d'environnement explicitement
    export NODE_ENV=production
    export PORT=3000
    
    # Charger le fichier .env
    if [ -f ".env" ]; then
        set -a  # Exporter automatiquement les variables
        source .env
        set +a
    fi
    
    # Démarrer le serveur avec gestion d'erreurs
    {
        nohup node server.js > "../$LOG_DIR/server.log" 2>&1 &
        SERVER_PID=$!
        echo $SERVER_PID > "../$PID_FILE"
        
        log_info "Serveur démarré avec PID: $SERVER_PID"
        
        # Attendre un peu pour vérifier le démarrage
        sleep 5
        
        # Vérifier si le processus est toujours actif
        if ps -p $SERVER_PID > /dev/null 2>&1; then
            log_success "Serveur en cours d'exécution (PID: $SERVER_PID)"
            
            # Tester la connexion après un délai
            sleep 3
            if command -v curl >/dev/null 2>&1; then
                if curl -f http://localhost:$PORT/api/health >/dev/null 2>&1; then
                    log_success "API accessible sur http://localhost:$PORT"
                else
                    log_warning "API pas encore accessible (normal au premier démarrage)"
                fi
            fi
        else
            log_error "Le serveur s'est arrêté de manière inattendue"
            log_info "Dernières lignes du log:"
            tail -20 "../$LOG_DIR/server.log" 2>/dev/null || echo "Aucun log disponible"
            exit 1
        fi
    } || {
        log_error "Erreur lors du démarrage du serveur"
        exit 1
    }
    
    cd ..
}

# Fonction pour afficher le statut
show_status() {
    echo
    log_info "=== Statut du serveur ==="
    
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo "✓ Serveur actif (PID: $PID)"
            echo "✓ Port: $PORT"
            echo "✓ Logs: $LOG_DIR/server.log"
            echo "✓ PID file: $PID_FILE"
        else
            echo "✗ Serveur arrêté (PID file obsolète)"
            rm -f "$PID_FILE"
        fi
    else
        echo "✗ Aucun PID file trouvé"
    fi
    
    echo
    log_info "Commandes utiles:"
    echo "  - Voir les logs: tail -f $LOG_DIR/server.log"
    echo "  - Arrêter: kill \$(cat $PID_FILE) 2>/dev/null || pkill -f 'node.*server.js'"
    echo "  - Redémarrer: $0"
    echo "  - Tester API: curl http://localhost:$PORT/api/health"
}

# Fonction principale
main() {
    echo
    log_info "=== Fix SQLite BUSY et démarrage serveur ==="
    log_info "Port: $PORT"
    log_info "Répertoire serveur: $SERVER_DIR"
    echo
    
    check_config
    stop_all_processes
    clean_sqlite_locks
    setup_directories
    check_dependencies
    start_server
    show_status
    
    echo
    log_success "=== Serveur démarré avec succès ==="
    log_info "Le serveur Fusepoint est maintenant accessible sur le port $PORT"
}

# Gestion des signaux
trap 'log_error "Script interrompu"; exit 1' INT TERM

# Exécuter le script
main "$@"