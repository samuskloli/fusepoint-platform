#!/bin/bash

# Script de démarrage Fusepoint Platform pour Infomaniak (Fix permissions)
# Résout les problèmes de permissions PM2

echo "🚀 Démarrage des serveurs Fusepoint Platform (Fix)"

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Exécutez ce script depuis le répertoire racine du projet."
    exit 1
fi

# Créer le répertoire pour PM2 local si nécessaire
mkdir -p ~/.pm2

# Installer PM2 localement dans le projet
echo "📦 Installation de PM2 localement..."
npm install pm2 --save-dev

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation de PM2"
    echo "💡 Essayons une installation alternative..."
    
    # Alternative: utiliser npx pour PM2
    echo "🔄 Utilisation de npx pour PM2..."
    
    # Arrêter les processus existants
    echo "🛑 Arrêt des processus existants..."
    pkill -f "node.*server.js" 2>/dev/null || true
    pkill -f "node.*infomaniak-server.js" 2>/dev/null || true
    
    # Démarrer les serveurs manuellement
    echo "▶️ Démarrage des serveurs..."
    
    # Démarrer le backend API en arrière-plan
    echo "🔧 Démarrage du backend API (port 3000)..."
    cd server
    nohup node server.js > ../logs/api.log 2>&1 &
    API_PID=$!
    cd ..
    
    # Attendre que le backend démarre
    sleep 3
    
    # Démarrer le frontend en arrière-plan
    echo "🌐 Démarrage du frontend (port 8080)..."
    nohup node infomaniak-server.js > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # Sauvegarder les PIDs
    echo $API_PID > logs/api.pid
    echo $FRONTEND_PID > logs/frontend.pid
    
    echo "✅ Serveurs démarrés manuellement!"
    echo "🌐 Frontend: http://localhost:8080"
    echo "📡 API: http://localhost:3000"
    echo "📊 Logs: tail -f logs/frontend.log logs/api.log"
    echo "🛑 Arrêter: kill \$(cat logs/api.pid logs/frontend.pid)"
    
    exit 0
fi

# Si PM2 s'est installé correctement
echo "🛑 Arrêt des processus existants..."
./node_modules/.bin/pm2 kill 2>/dev/null || true

# Le fichier ecosystem.config.js existe déjà avec la syntaxe ES modules
echo "📝 Utilisation du fichier ecosystem.config.js existant..."

# Créer le dossier logs s'il n'existe pas
mkdir -p logs

# Démarrer les serveurs avec PM2 local
echo "▶️ Démarrage des serveurs..."
./node_modules/.bin/pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
./node_modules/.bin/pm2 save

echo "✅ Serveurs démarrés!"
echo "🌐 Frontend: http://localhost:8080"
echo "📡 API: http://localhost:3000"
echo ""
echo "🔧 Commandes utiles:"
echo " - Voir les logs: ./node_modules/.bin/pm2 logs"
echo " - Redémarrer: ./node_modules/.bin/pm2 restart ecosystem.config.js"
echo " - Arrêter: ./node_modules/.bin/pm2 stop ecosystem.config.js"
echo " - Monitoring: ./node_modules/.bin/pm2 monit"
echo " - Status: ./node_modules/.bin/pm2 status"

# Vérifier que les serveurs sont bien démarrés
echo ""
echo "🔍 Vérification des serveurs..."
sleep 2
./node_modules/.bin/pm2 status

echo ""
echo "📋 Pour tester les endpoints:"
echo "curl http://localhost:8080"
echo "curl http://localhost:3000/api/health"