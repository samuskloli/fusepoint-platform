#!/bin/bash

# Script d'installation simplifié pour Infomaniak
# Usage: bash install-simple.sh

echo "🚀 Installation Fusepoint Platform - Version Infomaniak Simple"
echo "============================================================"

# Configuration
PROJECT_NAME="fusepoint-platform"
GIT_REPO="https://github.com/samuskloli/fusepoint-platform.git"
APP_PORT="4000"

# Aller dans le répertoire home
cd ~

# Créer le dossier sites
echo "📁 Création du dossier sites..."
mkdir -p sites
cd sites

# Installer Node.js manuellement si NVM n'est pas disponible
echo "📦 Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    echo "⚠️  Node.js non trouvé. Installation manuelle..."
    
    # Créer le dossier pour Node.js
    mkdir -p ~/nodejs
    cd ~/nodejs
    
    # Télécharger Node.js (version compatible Infomaniak)
    echo "⬇️  Téléchargement de Node.js..."
    wget https://nodejs.org/dist/v18.19.0/node-v18.19.0-linux-x64.tar.xz
    
    # Extraire
    echo "📦 Extraction..."
    tar -xf node-v18.19.0-linux-x64.tar.xz
    
    # Ajouter au PATH
    echo "🔧 Configuration du PATH..."
    echo 'export PATH="$HOME/nodejs/node-v18.19.0-linux-x64/bin:$PATH"' >> ~/.bashrc
    export PATH="$HOME/nodejs/node-v18.19.0-linux-x64/bin:$PATH"
    
    cd ~/sites
else
    echo "✅ Node.js déjà installé"
fi

# Vérifier Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js version: $(node --version)"
    echo "✅ NPM version: $(npm --version)"
else
    echo "❌ Erreur: Node.js non disponible"
    echo "💡 Solution: Contactez le support Infomaniak pour activer Node.js"
    exit 1
fi

# Cloner le projet
echo "📥 Clonage du projet..."
if [ -d "$PROJECT_NAME" ]; then
    echo "🗑️  Suppression de l'ancien projet..."
    rm -rf "$PROJECT_NAME"
fi

git clone "$GIT_REPO" "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Configuration de base
echo "⚙️  Configuration de l'environnement..."

# Créer .env principal
cat > .env << EOF
APP_ENV=production
NODE_ENV=production
PORT=$APP_PORT

# À configurer avec vos informations
# VITE_GOOGLE_CLIENT_ID=votre_client_id
# VITE_GOOGLE_CLIENT_SECRET=votre_client_secret
EOF

# Créer .env serveur
mkdir -p server
cat > server/.env << EOF
NODE_ENV=production
PORT=$APP_PORT

# Base de données Infomaniak
# DATABASE_URL=mysql://user:password@user.myd.infomaniak.com:3306/database

# JWT Secret
# JWT_SECRET=votre_jwt_secret_tres_securise

# Email Infomaniak
# EMAIL_HOST=mail.infomaniak.com
# EMAIL_PORT=587
# EMAIL_USER=votre_email@domaine.com
# EMAIL_PASS=votre_mot_de_passe
EOF

# Installation des dépendances
echo "📦 Installation des dépendances frontend..."
npm install --production

echo "📦 Installation des dépendances backend..."
cd server
npm install --production
cd ..

# Build de l'application
echo "🔨 Build de l'application..."
npm run build

# Créer un script de démarrage simple
echo "📝 Création du script de démarrage..."
cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Démarrage de Fusepoint Platform..."
cd ~/sites/fusepoint-platform
export NODE_ENV=production
export PORT=4000
node server/server.js
EOF

chmod +x start.sh

# Créer un script d'arrêt
cat > stop.sh << 'EOF'
#!/bin/bash
echo "🛑 Arrêt de Fusepoint Platform..."
pkill -f "node server/server.js"
echo "✅ Application arrêtée"
EOF

chmod +x stop.sh

# Créer un script de redémarrage
cat > restart.sh << 'EOF'
#!/bin/bash
echo "🔄 Redémarrage de Fusepoint Platform..."
./stop.sh
sleep 2
./start.sh
EOF

chmod +x restart.sh

# Créer un script de mise à jour
cat > update.sh << 'EOF'
#!/bin/bash
echo "🔄 Mise à jour de Fusepoint Platform..."

# Arrêter l'application
./stop.sh

# Mettre à jour le code
git pull origin main

# Mettre à jour les dépendances
npm install --production
cd server && npm install --production && cd ..

# Rebuild
npm run build

# Redémarrer
./start.sh

echo "✅ Mise à jour terminée !"
EOF

chmod +x update.sh

# Créer un script de monitoring
cat > status.sh << 'EOF'
#!/bin/bash
echo "📊 Statut de Fusepoint Platform"
echo "=============================="

if pgrep -f "node server/server.js" > /dev/null; then
    echo "✅ Application: EN COURS D'EXÉCUTION"
    echo "🔢 PID: $(pgrep -f 'node server/server.js')"
    echo "💾 Mémoire: $(ps -o pid,vsz,rss,comm -p $(pgrep -f 'node server/server.js'))"
else
    echo "❌ Application: ARRÊTÉE"
fi

echo ""
echo "🌐 Port configuré: 4000"
echo "📁 Répertoire: $(pwd)"
echo "🕒 Dernière modification: $(stat -c %y server/server.js 2>/dev/null || echo 'N/A')"
EOF

chmod +x status.sh

echo ""
echo "🎉 Installation terminée avec succès !"
echo "====================================="
echo ""
echo "📁 Répertoire: ~/sites/$PROJECT_NAME"
echo "🌐 Port: $APP_PORT"
echo ""
echo "📋 Scripts disponibles :"
echo "  • ./start.sh    - Démarrer l'application"
echo "  • ./stop.sh     - Arrêter l'application"
echo "  • ./restart.sh  - Redémarrer l'application"
echo "  • ./status.sh   - Vérifier le statut"
echo "  • ./update.sh   - Mettre à jour depuis Git"
echo ""
echo "⚠️  Actions requises :"
echo "  1. Configurer .env et server/.env avec vos variables"
echo "  2. Configurer votre base de données MariaDB"
echo "  3. Pointer votre domaine vers le port $APP_PORT"
echo ""
echo "🚀 Pour démarrer maintenant :"
echo "   ./start.sh"
echo ""
echo "💡 Pour démarrer en arrière-plan :"
echo "   nohup ./start.sh > app.log 2>&1 &"
echo ""