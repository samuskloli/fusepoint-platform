#!/bin/bash

# Script de déploiement pour Infomaniak avec Node.js
# Ce script configure le serveur frontend Node.js et corrige les problèmes de build

echo "🚀 Déploiement Fusepoint Platform sur Infomaniak avec Node.js"
echo "================================================="

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Assurez-vous d'être dans le répertoire du projet."
    exit 1
fi

# Installer les dépendances du serveur frontend
echo "📦 Installation des dépendances du serveur frontend..."
npm install express http-proxy-middleware compression helmet cors

# Nettoyer et reconstruire le frontend
echo "🧹 Nettoyage des fichiers de build..."
rm -rf dist/
rm -rf node_modules/.vite/
npm cache clean --force

# Réinstaller les dépendances
echo "📦 Réinstallation des dépendances..."
npm install

# Construire le frontend pour la production
echo "🔨 Construction du frontend..."
NODE_ENV=production npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la construction du frontend"
    exit 1
fi

# Vérifier que le dossier dist existe
if [ ! -d "dist" ]; then
    echo "❌ Erreur: Le dossier dist n'a pas été créé"
    exit 1
fi

echo "✅ Frontend construit avec succès"

# Créer le script de démarrage pour PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'fusepoint-api',
      script: './server/server.js',
      cwd: '/srv/customer/fusepoint-platform',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true
    },
    {
      name: 'fusepoint-frontend',
      script: './infomaniak-server.js',
      cwd: '/srv/customer/fusepoint-platform',
      env: {
        NODE_ENV: 'production',
        FRONTEND_PORT: 8080,
        API_PORT: 3000
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '300M',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};
EOF

# Créer le dossier logs s'il n'existe pas
mkdir -p logs

# Créer un script de démarrage simple
cat > start-infomaniak.sh << 'EOF'
#!/bin/bash

echo "🚀 Démarrage des serveurs Fusepoint Platform"

# Installer PM2 globalement si pas déjà installé
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installation de PM2..."
    npm install -g pm2
fi

# Arrêter les processus existants
echo "🛑 Arrêt des processus existants..."
pm2 stop ecosystem.config.js 2>/dev/null || true
pm2 delete ecosystem.config.js 2>/dev/null || true

# Démarrer les serveurs
echo "▶️ Démarrage des serveurs..."
pm2 start ecosystem.config.js

# Afficher le statut
pm2 status

echo "✅ Serveurs démarrés!"
echo "🌐 Frontend: http://localhost:8080"
echo "📡 API: http://localhost:3000"
echo "📊 Monitoring: pm2 monit"
EOF

chmod +x start-infomaniak.sh

echo "✅ Configuration terminée!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Transférez tous les fichiers sur votre serveur Infomaniak"
echo "2. Configurez votre fichier .env avec vos vraies clés"
echo "3. Exécutez: ./start-infomaniak.sh"
echo "4. Configurez votre domaine pour pointer vers le port 8080"
echo ""
echo "🔧 Commandes utiles:"
echo "- Voir les logs: pm2 logs"
echo "- Redémarrer: pm2 restart ecosystem.config.js"
echo "- Arrêter: pm2 stop ecosystem.config.js"
echo "- Monitoring: pm2 monit"