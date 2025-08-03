#!/bin/bash

# Script d'arrêt pour Fusepoint Platform sur Infomaniak

echo "🛑 Arrêt des serveurs Fusepoint Platform..."

# Méthode 1: Arrêt via PM2 local
if [ -f "./node_modules/.bin/pm2" ]; then
    echo "📦 Arrêt via PM2 local..."
    ./node_modules/.bin/pm2 stop ecosystem.config.js 2>/dev/null || true
    ./node_modules/.bin/pm2 delete ecosystem.config.js 2>/dev/null || true
    ./node_modules/.bin/pm2 kill 2>/dev/null || true
fi

# Méthode 2: Arrêt via PM2 global (si disponible)
if command -v pm2 &> /dev/null; then
    echo "🌐 Arrêt via PM2 global..."
    pm2 stop ecosystem.config.js 2>/dev/null || true
    pm2 delete ecosystem.config.js 2>/dev/null || true
fi

# Méthode 3: Arrêt via PIDs sauvegardés
if [ -f "logs/api.pid" ] && [ -f "logs/frontend.pid" ]; then
    echo "🔢 Arrêt via PIDs sauvegardés..."
    API_PID=$(cat logs/api.pid 2>/dev/null)
    FRONTEND_PID=$(cat logs/frontend.pid 2>/dev/null)
    
    if [ ! -z "$API_PID" ]; then
        kill $API_PID 2>/dev/null || true
        echo "✅ API arrêtée (PID: $API_PID)"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo "✅ Frontend arrêté (PID: $FRONTEND_PID)"
    fi
    
    # Supprimer les fichiers PID
    rm -f logs/api.pid logs/frontend.pid
fi

# Méthode 4: Arrêt forcé par nom de processus
echo "🔍 Recherche et arrêt des processus Node.js restants..."
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "node.*infomaniak-server.js" 2>/dev/null || true
pkill -f "fusepoint-api" 2>/dev/null || true
pkill -f "fusepoint-frontend" 2>/dev/null || true

# Vérifier les ports
echo "🔍 Vérification des ports..."
API_PORT_USED=$(lsof -ti:3000 2>/dev/null)
FRONTEND_PORT_USED=$(lsof -ti:8080 2>/dev/null)

if [ ! -z "$API_PORT_USED" ]; then
    echo "⚠️ Port 3000 encore utilisé par PID: $API_PORT_USED"
    echo "💡 Pour forcer l'arrêt: kill -9 $API_PORT_USED"
else
    echo "✅ Port 3000 libéré"
fi

if [ ! -z "$FRONTEND_PORT_USED" ]; then
    echo "⚠️ Port 8080 encore utilisé par PID: $FRONTEND_PORT_USED"
    echo "💡 Pour forcer l'arrêt: kill -9 $FRONTEND_PORT_USED"
else
    echo "✅ Port 8080 libéré"
fi

echo "✅ Arrêt terminé!"
echo ""
echo "📋 Pour redémarrer:"
echo "./start-infomaniak-fix.sh"
echo ""
echo "📋 Pour vérifier qu'aucun processus ne tourne:"
echo "ps aux | grep node"
echo "lsof -i:3000,8080"