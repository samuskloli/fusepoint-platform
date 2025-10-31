#!/bin/bash

echo "🔧 Configuration finale du serveur Fusepoint..."

# Génération des clés de sécurité
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
echo "ENCRYPTION_KEY=$(openssl rand -base64 32)" >> .env
echo "FRONTEND_URL=https://fusepoint.ch" >> .env
echo "API_BASE_URL=https://fusepoint.ch/api" >> .env

echo "✅ Configuration terminée!"
echo "📋 Contenu du fichier .env:"
cat .env

echo ""
echo "🚀 Démarrage du serveur..."
nohup node server.js > ../app.log 2>&1 &

sleep 3
echo "📊 Processus Node.js en cours:"
ps aux | grep node | grep -v grep

echo ""
echo "📝 Logs du serveur:"
tail -20 ../app.log