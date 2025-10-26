#!/bin/bash

# Script de démarrage automatique de tous les serveurs
# Évite les conflits et démarre dans le bon ordre

# Déterminer le répertoire racine du projet quelle que soit la cwd
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$PROJECT_ROOT"

# Ports configurables via variables d'environnement (défauts: 3002 backend, 5173 frontend)
BACKEND_PORT="${BACKEND_PORT:-3002}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

echo "🚀 ================================"
echo "📱 DÉMARRAGE AUTOMATIQUE FUSEPOINT"
echo "🚀 ================================"

# Fonction pour vérifier si un port est utilisé
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port utilisé
    else
        return 1  # Port libre
    fi
}

# Fonction pour arrêter proprement un processus sur un port
stop_port() {
    local port=$1
    echo "🛑 Arrêt du processus sur le port $port..."
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    sleep 2
}

# Nettoyage des ports si nécessaire
echo "🧹 Nettoyage des ports..."
if check_port "$BACKEND_PORT"; then
    stop_port "$BACKEND_PORT"
fi
if check_port "$FRONTEND_PORT"; then
    stop_port "$FRONTEND_PORT"
fi
# Proxy mobile supprimé

echo "✅ Ports nettoyés"

# Créer le répertoire logs s'il n'existe pas
if [ ! -d "logs" ]; then
    mkdir -p logs
    echo "📁 Répertoire logs créé"
fi

sleep 2

# Démarrage du backend (port 3002)
echo "🔧 Démarrage du backend..."
cd server
PORT=$BACKEND_PORT FRONTEND_URL=http://localhost:$FRONTEND_PORT npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
cd ..

# Attendre que le backend soit prêt
echo "⏳ Attente du backend..."
sleep 5

# Vérifier que le backend fonctionne
if ! check_port "$BACKEND_PORT"; then
    echo "❌ Échec du démarrage du backend"
    exit 1
fi
echo "✅ Backend démarré sur le port $BACKEND_PORT"

# Démarrage du frontend (port 5173)
echo "🎨 Démarrage du frontend..."
VITE_API_URL=http://localhost:$BACKEND_PORT npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > logs/frontend.pid

# Attendre que le frontend soit prêt
echo "⏳ Attente du frontend..."
sleep 5

# Vérifier que le frontend fonctionne
if ! check_port "$FRONTEND_PORT"; then
    echo "❌ Échec du démarrage du frontend"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi
echo "✅ Frontend démarré sur le port $FRONTEND_PORT"

# Proxy mobile supprimé

# Obtenir l'adresse IP locale
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || echo "IP non disponible")

echo ""
echo "🚀 ================================"
echo "✅ TOUS LES SERVEURS SONT DÉMARRÉS"
echo "🚀 ================================"
echo "🔧 Backend:"
echo "   📍 Local:     http://localhost:$BACKEND_PORT"
echo "   🌐 Réseau:    http://$LOCAL_IP:$BACKEND_PORT"
echo "🎨 Frontend:"
echo "   📍 Local:     http://localhost:$FRONTEND_PORT"
echo "   🌐 Réseau:    http://$LOCAL_IP:$FRONTEND_PORT"
echo "🚀 ================================"
echo ""

# Afficher les clients disponibles dans la base de données
echo "📊 Vérification des clients en base de données..."
if command -v node >/dev/null 2>&1; then
    if [ -f "check-clients.cjs" ]; then
        node check-clients.cjs
    else
        echo "⚠️  Script check-clients.cjs non trouvé"
    fi
else
    echo "⚠️  Node.js non disponible pour vérifier les clients"
fi

echo ""
echo "💡 Utilisez Ctrl+C pour arrêter tous les serveurs"
echo "💡 COMMANDES ADMINISTRATIVES DISPONIBLES:"
echo "   📊 node check-clients.cjs           - Voir tous les clients"
echo "   👥 node create-test-clients.cjs     - Créer des clients de test"
echo "   🔍 ./admin-commands.sh status       - Statut des serveurs"
echo "   🔄 ./admin-commands.sh restart      - Redémarrer les serveurs"
echo "   🛑 ./admin-commands.sh stop         - Arrêter les serveurs"
echo "   📋 ./admin-commands.sh logs         - Voir les logs"
echo "   🗄️  ./admin-commands.sh db-backup    - Sauvegarder la base de données"
echo "   🧹 ./admin-commands.sh cleanup      - Nettoyer les logs et fichiers temporaires"

# Fonction de nettoyage à l'arrêt
cleanup() {
    echo ""
    echo "🛑 Arrêt de tous les serveurs..."
    
    # Arrêter le backend
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    elif [ -f "logs/backend.pid" ]; then
        SAVED_BACKEND_PID=$(cat logs/backend.pid 2>/dev/null)
        if [ ! -z "$SAVED_BACKEND_PID" ]; then
            kill $SAVED_BACKEND_PID 2>/dev/null || true
        fi
    fi
    
    # Arrêter le frontend
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    elif [ -f "logs/frontend.pid" ]; then
        SAVED_FRONTEND_PID=$(cat logs/frontend.pid 2>/dev/null)
        if [ ! -z "$SAVED_FRONTEND_PID" ]; then
            kill $SAVED_FRONTEND_PID 2>/dev/null || true
        fi
    fi
    
    # Arrêter aussi par port au cas où
    stop_port 3002
    stop_port 5173
    
    # Nettoyer les fichiers PID
    rm -f logs/backend.pid logs/frontend.pid
    
    sleep 2
    echo "✅ Tous les serveurs arrêtés"
    exit 0
}

# Capturer les signaux d'arrêt
trap cleanup SIGINT SIGTERM

# Attendre indéfiniment
while true; do
    sleep 1
done