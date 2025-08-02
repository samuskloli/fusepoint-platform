#!/bin/bash

# Script de commandes administratives pour Fusepoint Platform
# Usage: ./admin-commands.sh [commande]

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher l'aide
show_help() {
    echo "🔧 COMMANDES ADMINISTRATIVES FUSEPOINT"
    echo "======================================"
    echo "Usage: ./admin-commands.sh [commande]"
    echo ""
    echo "Commandes disponibles:"
    echo "  status      - Afficher le statut des serveurs"
    echo "  restart     - Redémarrer tous les serveurs"
    echo "  stop        - Arrêter tous les serveurs"
    echo "  logs        - Afficher les logs récents"
    echo "  db-backup   - Sauvegarder la base de données"
    echo "  cleanup     - Nettoyer les logs et fichiers temporaires"
    echo "  clients     - Afficher les clients en base"
    echo "  create-test - Créer des clients de test"
    echo "  health      - Vérifier la santé du système"
    echo ""
}

# Fonction pour vérifier si un port est utilisé
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port utilisé
    else
        return 1  # Port libre
    fi
}

# Fonction pour arrêter un processus sur un port
stop_port() {
    local port=$1
    echo "🛑 Arrêt du processus sur le port $port..."
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    sleep 2
}

# Fonction pour afficher le statut des serveurs
show_status() {
    echo "📊 STATUT DES SERVEURS"
    echo "====================="
    
    # Vérifier le backend
    if check_port 3002; then
        echo -e "🔧 Backend (port 3002): ${GREEN}✅ ACTIF${NC}"
        if [ -f "logs/backend.pid" ]; then
            PID=$(cat logs/backend.pid)
            echo "   PID: $PID"
        fi
    else
        echo -e "🔧 Backend (port 3002): ${RED}❌ INACTIF${NC}"
    fi
    
    # Vérifier le frontend
    if check_port 5173; then
        echo -e "🎨 Frontend (port 5173): ${GREEN}✅ ACTIF${NC}"
        if [ -f "logs/frontend.pid" ]; then
            PID=$(cat logs/frontend.pid)
            echo "   PID: $PID"
        fi
    else
        echo -e "🎨 Frontend (port 5173): ${RED}❌ INACTIF${NC}"
    fi
    
    echo ""
    echo "🌐 URLs d'accès:"
    echo "   Backend:  http://localhost:3002"
    echo "   Frontend: http://localhost:5173"
}

# Fonction pour redémarrer les serveurs
restart_servers() {
    echo "🔄 REDÉMARRAGE DES SERVEURS"
    echo "==========================="
    
    # Arrêter d'abord
    stop_servers
    
    echo "⏳ Attente de 3 secondes..."
    sleep 3
    
    # Redémarrer
    echo "🚀 Redémarrage en cours..."
    ./start-all-servers.sh
}

# Fonction pour arrêter les serveurs
stop_servers() {
    echo "🛑 ARRÊT DES SERVEURS"
    echo "===================="
    
    # Arrêter par PID si disponible
    if [ -f "logs/backend.pid" ]; then
        BACKEND_PID=$(cat logs/backend.pid 2>/dev/null)
        if [ ! -z "$BACKEND_PID" ]; then
            echo "🔧 Arrêt du backend (PID: $BACKEND_PID)..."
            kill $BACKEND_PID 2>/dev/null || true
        fi
        rm -f logs/backend.pid
    fi
    
    if [ -f "logs/frontend.pid" ]; then
        FRONTEND_PID=$(cat logs/frontend.pid 2>/dev/null)
        if [ ! -z "$FRONTEND_PID" ]; then
            echo "🎨 Arrêt du frontend (PID: $FRONTEND_PID)..."
            kill $FRONTEND_PID 2>/dev/null || true
        fi
        rm -f logs/frontend.pid
    fi
    
    # Arrêter par port en cas d'échec
    if check_port 3002; then
        stop_port 3002
    fi
    
    if check_port 5173; then
        stop_port 5173
    fi
    
    echo "✅ Serveurs arrêtés"
}

# Fonction pour afficher les logs
show_logs() {
    echo "📋 LOGS RÉCENTS"
    echo "==============="
    
    if [ -f "logs/backend.log" ]; then
        echo -e "${BLUE}🔧 Backend (20 dernières lignes):${NC}"
        tail -20 logs/backend.log
        echo ""
    else
        echo "⚠️  Aucun log backend trouvé"
    fi
    
    if [ -f "logs/frontend.log" ]; then
        echo -e "${BLUE}🎨 Frontend (20 dernières lignes):${NC}"
        tail -20 logs/frontend.log
        echo ""
    else
        echo "⚠️  Aucun log frontend trouvé"
    fi
    
    if [ -f "logs/system.log" ]; then
        echo -e "${BLUE}🖥️  Système (20 dernières lignes):${NC}"
        tail -20 logs/system.log
    fi
}

# Fonction pour sauvegarder la base de données
backup_database() {
    echo "🗄️  SAUVEGARDE DE LA BASE DE DONNÉES"
    echo "==================================="
    
    # Créer le répertoire de sauvegarde s'il n'existe pas
    mkdir -p backups
    
    # Nom du fichier de sauvegarde avec timestamp
    BACKUP_FILE="backups/fusepoint_backup_$(date +%Y%m%d_%H%M%S).db"
    
    # Sauvegarder la base principale
    if [ -f "fusepoint.db" ]; then
        cp fusepoint.db "$BACKUP_FILE"
        echo "✅ Base de données sauvegardée: $BACKUP_FILE"
    else
        echo "⚠️  Base de données principale non trouvée"
    fi
    
    # Sauvegarder la base du serveur si elle existe
    if [ -f "server/fusepoint.db" ]; then
        SERVER_BACKUP="backups/server_fusepoint_backup_$(date +%Y%m%d_%H%M%S).db"
        cp server/fusepoint.db "$SERVER_BACKUP"
        echo "✅ Base serveur sauvegardée: $SERVER_BACKUP"
    fi
    
    # Afficher les sauvegardes existantes
    echo ""
    echo "📁 Sauvegardes disponibles:"
    ls -la backups/*.db 2>/dev/null || echo "Aucune sauvegarde trouvée"
}

# Fonction pour nettoyer les fichiers temporaires
cleanup_files() {
    echo "🧹 NETTOYAGE DES FICHIERS TEMPORAIRES"
    echo "===================================="
    
    # Nettoyer les logs anciens (garder les 5 plus récents)
    if [ -d "logs" ]; then
        echo "🗑️  Nettoyage des anciens logs..."
        find logs -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true
        echo "✅ Logs anciens supprimés"
    fi
    
    # Nettoyer les fichiers PID orphelins
    if [ -f "logs/backend.pid" ]; then
        PID=$(cat logs/backend.pid 2>/dev/null)
        if [ ! -z "$PID" ] && ! ps -p $PID > /dev/null 2>&1; then
            rm -f logs/backend.pid
            echo "🗑️  Fichier PID backend orphelin supprimé"
        fi
    fi
    
    if [ -f "logs/frontend.pid" ]; then
        PID=$(cat logs/frontend.pid 2>/dev/null)
        if [ ! -z "$PID" ] && ! ps -p $PID > /dev/null 2>&1; then
            rm -f logs/frontend.pid
            echo "🗑️  Fichier PID frontend orphelin supprimé"
        fi
    fi
    
    # Nettoyer les fichiers temporaires Node.js
    rm -rf node_modules/.cache 2>/dev/null || true
    rm -rf server/node_modules/.cache 2>/dev/null || true
    
    # Nettoyer nohup.out s'il est trop volumineux (>10MB)
    if [ -f "nohup.out" ]; then
        SIZE=$(stat -f%z nohup.out 2>/dev/null || echo 0)
        if [ $SIZE -gt 10485760 ]; then
            > nohup.out
            echo "🗑️  Fichier nohup.out vidé (trop volumineux)"
        fi
    fi
    
    echo "✅ Nettoyage terminé"
}

# Fonction pour afficher les clients
show_clients() {
    echo "👥 CLIENTS EN BASE DE DONNÉES"
    echo "============================="
    
    if command -v node >/dev/null 2>&1; then
        if [ -f "check-clients.cjs" ]; then
            node check-clients.cjs
        else
            echo "⚠️  Script check-clients.cjs non trouvé"
        fi
    else
        echo "⚠️  Node.js non disponible"
    fi
}

# Fonction pour créer des clients de test
create_test_clients() {
    echo "👥 CRÉATION DE CLIENTS DE TEST"
    echo "=============================="
    
    if command -v node >/dev/null 2>&1; then
        if [ -f "create-test-clients.cjs" ]; then
            node create-test-clients.cjs
        else
            echo "⚠️  Script create-test-clients.cjs non trouvé"
        fi
    else
        echo "⚠️  Node.js non disponible"
    fi
}

# Fonction pour vérifier la santé du système
check_health() {
    echo "🏥 VÉRIFICATION DE LA SANTÉ DU SYSTÈME"
    echo "======================================"
    
    # Vérifier Node.js
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        echo -e "✅ Node.js: ${GREEN}$NODE_VERSION${NC}"
    else
        echo -e "❌ Node.js: ${RED}Non installé${NC}"
    fi
    
    # Vérifier npm
    if command -v npm >/dev/null 2>&1; then
        NPM_VERSION=$(npm --version)
        echo -e "✅ npm: ${GREEN}$NPM_VERSION${NC}"
    else
        echo -e "❌ npm: ${RED}Non installé${NC}"
    fi
    
    # Vérifier les dépendances
    echo ""
    echo "📦 Vérification des dépendances:"
    
    if [ -f "package.json" ]; then
        echo "✅ package.json trouvé"
        if [ -d "node_modules" ]; then
            echo "✅ node_modules présent"
        else
            echo -e "⚠️  node_modules: ${YELLOW}Manquant - Exécutez 'npm install'${NC}"
        fi
    else
        echo "❌ package.json non trouvé"
    fi
    
    if [ -f "server/package.json" ]; then
        echo "✅ server/package.json trouvé"
        if [ -d "server/node_modules" ]; then
            echo "✅ server/node_modules présent"
        else
            echo -e "⚠️  server/node_modules: ${YELLOW}Manquant - Exécutez 'cd server && npm install'${NC}"
        fi
    else
        echo "❌ server/package.json non trouvé"
    fi
    
    # Vérifier les bases de données
    echo ""
    echo "🗄️  Vérification des bases de données:"
    
    if [ -f "fusepoint.db" ]; then
        SIZE=$(stat -f%z fusepoint.db 2>/dev/null || echo 0)
        echo "✅ fusepoint.db trouvée ($(($SIZE / 1024)) KB)"
    else
        echo "⚠️  fusepoint.db non trouvée"
    fi
    
    if [ -f "server/fusepoint.db" ]; then
        SIZE=$(stat -f%z server/fusepoint.db 2>/dev/null || echo 0)
        echo "✅ server/fusepoint.db trouvée ($(($SIZE / 1024)) KB)"
    else
        echo "⚠️  server/fusepoint.db non trouvée"
    fi
    
    # Vérifier l'espace disque
    echo ""
    echo "💾 Espace disque:"
    df -h . | tail -1 | awk '{print "   Utilisé: " $3 " / " $2 " (" $5 ")"}'
    
    # Vérifier la mémoire
    echo ""
    echo "🧠 Utilisation mémoire:"
    vm_stat | grep "Pages free" | awk '{print "   Mémoire libre: " $3 * 4096 / 1024 / 1024 " MB"}'
}

# Script principal
case "$1" in
    "status")
        show_status
        ;;
    "restart")
        restart_servers
        ;;
    "stop")
        stop_servers
        ;;
    "logs")
        show_logs
        ;;
    "db-backup")
        backup_database
        ;;
    "cleanup")
        cleanup_files
        ;;
    "clients")
        show_clients
        ;;
    "create-test")
        create_test_clients
        ;;
    "health")
        check_health
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Commande inconnue: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac