#!/bin/bash

# Script d'installation automatique pour Fusepoint Platform sur Infomaniak
# Usage: ./deploy-infomaniak.sh

set -e  # Arrêter le script en cas d'erreur

echo "🚀 Installation automatique de Fusepoint Platform sur Infomaniak"
echo "================================================================"

# Configuration
PROJECT_NAME="fusepoint-platform"
GIT_REPO="https://github.com/samuskloli/fusepoint-platform.git"
NODE_VERSION="18"  # Version compatible avec Infomaniak
APP_PORT="4000"   # Port entre 4000-4009 pour Infomaniak

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Vérifier si on est sur Infomaniak
check_infomaniak() {
    log_info "Vérification de l'environnement Infomaniak..."
    if [[ ! "$PWD" =~ "/srv/" ]] && [[ ! "$PWD" =~ "/home/" ]]; then
        log_warning "Vous ne semblez pas être sur un serveur Infomaniak"
    fi
    log_success "Environnement vérifié"
}

# Créer la structure des dossiers
setup_directories() {
    log_info "Création de la structure des dossiers..."
    
    # Aller dans le répertoire home
    cd ~
    
    # Créer le dossier sites s'il n'existe pas
    mkdir -p sites
    cd sites
    
    log_success "Structure des dossiers créée"
}

# Installer NVM et Node.js
install_nodejs() {
    log_info "Installation de Node.js via NVM..."
    
    # Vérifier si NVM est déjà installé
    if command -v nvm &> /dev/null; then
        log_success "NVM est déjà installé"
    else
        log_info "Installation de NVM..."
        
        # Créer le fichier .profile s'il n'existe pas
        touch ~/.profile
        
        # Télécharger et installer NVM
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        
        # Recharger le profil
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
        
        # Ajouter NVM au .bashrc si pas déjà présent
        if ! grep -q "NVM_DIR" ~/.bashrc; then
            echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
            echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
            echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.bashrc
        fi
        
        source ~/.bashrc
        log_success "NVM installé avec succès"
    fi
    
    # Installer Node.js
    log_info "Installation de Node.js version $NODE_VERSION..."
    nvm install $NODE_VERSION
    nvm use $NODE_VERSION
    nvm alias default $NODE_VERSION
    
    # Vérifier l'installation
    node_version=$(node --version)
    npm_version=$(npm --version)
    
    log_success "Node.js $node_version installé"
    log_success "NPM $npm_version installé"
}

# Cloner le projet depuis GitHub
clone_project() {
    log_info "Clonage du projet depuis GitHub..."
    
    # Supprimer le dossier existant s'il existe
    if [ -d "$PROJECT_NAME" ]; then
        log_warning "Le projet existe déjà, suppression..."
        rm -rf "$PROJECT_NAME"
    fi
    
    # Cloner le projet
    git clone "$GIT_REPO" "$PROJECT_NAME"
    cd "$PROJECT_NAME"
    
    log_success "Projet cloné avec succès"
}

# Configurer l'environnement
setup_environment() {
    log_info "Configuration de l'environnement..."
    
    # Copier les fichiers d'exemple
    if [ -f ".env.example" ]; then
        cp .env.example .env
        log_success "Fichier .env créé depuis .env.example"
    fi
    
    if [ -f "server/.env.example" ]; then
        cp server/.env.example server/.env
        log_success "Fichier server/.env créé"
    fi
    
    # Configurer les variables d'environnement de base
    cat > .env << EOF
# Configuration de production Infomaniak
APP_ENV=production
NODE_ENV=production
PORT=$APP_PORT

# Base de données (à configurer avec vos informations Infomaniak)
# DATABASE_URL="mysql://user:password@user.myd.infomaniak.com:3306/database"

# Variables Google Analytics (à configurer)
# VITE_GOOGLE_CLIENT_ID=votre_client_id
# VITE_GOOGLE_CLIENT_SECRET=votre_client_secret

# JWT Secret (générer une clé sécurisée)
# JWT_SECRET=votre_jwt_secret_securise

# Configuration email Infomaniak
# EMAIL_HOST=mail.infomaniak.com
# EMAIL_PORT=587
# EMAIL_USER=votre_email@domaine.com
# EMAIL_PASS=votre_mot_de_passe
EOF
    
    log_success "Variables d'environnement configurées"
    log_warning "⚠️  N'oubliez pas de configurer vos variables dans .env et server/.env"
}

# Installer les dépendances
install_dependencies() {
    log_info "Installation des dépendances..."
    
    # Installer les dépendances du frontend
    log_info "Installation des dépendances frontend..."
    npm install
    
    # Installer les dépendances du backend
    log_info "Installation des dépendances backend..."
    cd server
    npm install
    cd ..
    
    log_success "Toutes les dépendances installées"
}

# Build de l'application
build_application() {
    log_info "Build de l'application..."
    
    # Build du frontend
    npm run build
    
    log_success "Application buildée avec succès"
}

# Créer le service systemd
setup_service() {
    log_info "Configuration du service systemd..."
    
    # Créer le répertoire pour les services utilisateur
    mkdir -p ~/.config/systemd/user
    
    # Créer le fichier de service
    cat > ~/.config/systemd/user/fusepoint.service << EOF
[Unit]
Description=Fusepoint Platform
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME/sites/$PROJECT_NAME
ExecStart=$(which node) server/server.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=$APP_PORT

[Install]
WantedBy=default.target
EOF
    
    # Recharger systemd et activer le service
    systemctl --user daemon-reload
    systemctl --user enable fusepoint.service
    
    log_success "Service systemd configuré"
}

# Créer un script de mise à jour
create_update_script() {
    log_info "Création du script de mise à jour..."
    
    cat > update.sh << 'EOF'
#!/bin/bash

# Script de mise à jour Fusepoint Platform
echo "🔄 Mise à jour de Fusepoint Platform..."

# Arrêter le service
systemctl --user stop fusepoint.service

# Récupérer les dernières modifications
git pull origin main

# Installer/mettre à jour les dépendances
npm install
cd server && npm install && cd ..

# Rebuild l'application
npm run build

# Redémarrer le service
systemctl --user start fusepoint.service

echo "✅ Mise à jour terminée !"
echo "📊 Statut du service :"
systemctl --user status fusepoint.service --no-pager
EOF
    
    chmod +x update.sh
    
    log_success "Script de mise à jour créé (./update.sh)"
}

# Afficher les informations finales
show_final_info() {
    echo ""
    echo "🎉 Installation terminée avec succès !"
    echo "======================================"
    echo ""
    echo "📁 Répertoire du projet : ~/sites/$PROJECT_NAME"
    echo "🌐 Port de l'application : $APP_PORT"
    echo "⚙️  Service systemd : fusepoint.service"
    echo ""
    echo "📋 Commandes utiles :"
    echo "  • Démarrer le service : systemctl --user start fusepoint.service"
    echo "  • Arrêter le service : systemctl --user stop fusepoint.service"
    echo "  • Statut du service : systemctl --user status fusepoint.service"
    echo "  • Logs du service : journalctl --user -u fusepoint.service -f"
    echo "  • Mise à jour : ./update.sh"
    echo ""
    echo "⚠️  Actions requises :"
    echo "  1. Configurer vos variables d'environnement dans .env et server/.env"
    echo "  2. Configurer votre base de données MariaDB sur Infomaniak"
    echo "  3. Configurer votre domaine pour pointer vers le port $APP_PORT"
    echo "  4. Activer le certificat SSL Let's Encrypt"
    echo ""
    echo "🚀 Pour démarrer l'application :"
    echo "   systemctl --user start fusepoint.service"
    echo ""
}

# Fonction principale
main() {
    echo "Début de l'installation..."
    echo ""
    
    check_infomaniak
    setup_directories
    install_nodejs
    clone_project
    setup_environment
    install_dependencies
    build_application
    setup_service
    create_update_script
    
    show_final_info
}

# Gestion des erreurs
trap 'log_error "Une erreur est survenue. Installation interrompue."; exit 1' ERR

# Exécuter le script principal
main

log_success "Installation automatique terminée !"