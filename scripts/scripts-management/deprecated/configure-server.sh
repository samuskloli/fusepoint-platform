#!/bin/bash

# =============================================================================
# SCRIPT DE CONFIGURATION SERVEUR INFOMANIAK
# =============================================================================
# Ce script vous aide à configurer les informations de votre serveur Infomaniak
# pour le déploiement automatique.

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fonctions utilitaires
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

# Fonction pour afficher l'aide
show_help() {
    echo "🔧 Configuration du Serveur Infomaniak pour Fusepoint"
    echo "===================================================="
    echo
    echo "Ce script vous aide à configurer les informations de connexion"
    echo "à votre serveur Infomaniak pour le déploiement automatique."
    echo
    echo "Vous aurez besoin de :"
    echo "  - Votre nom d'utilisateur SSH Infomaniak"
    echo "  - L'adresse de votre serveur Infomaniak"
    echo "  - Le chemin vers votre site web"
    echo
    echo "Ces informations sont disponibles dans votre panel Infomaniak :"
    echo "  Panel > Hébergement > Votre site > SSH/SFTP"
    echo
}

# Fonction pour obtenir les informations SSH
get_ssh_info() {
    echo
    log_info "Configuration des informations SSH Infomaniak"
    echo
    
    # Nom d'utilisateur
    echo "📝 Nom d'utilisateur SSH :"
    echo "   (Généralement 'client' ou votre nom d'utilisateur Infomaniak)"
    read -p "   Entrez votre nom d'utilisateur SSH: " ssh_user
    
    if [ -z "$ssh_user" ]; then
        ssh_user="client"
        log_warning "Utilisation du nom d'utilisateur par défaut: client"
    fi
    
    echo
    
    # Hostname du serveur
    echo "🌐 Adresse du serveur :"
    echo "   (Format: votre-serveur.infomaniak.com ou IP)"
    echo "   Exemple: web123.infomaniak.com"
    read -p "   Entrez l'adresse de votre serveur: " ssh_host
    
    if [ -z "$ssh_host" ]; then
        log_error "L'adresse du serveur est obligatoire"
        return 1
    fi
    
    echo
    
    # Chemin du site
    echo "📁 Chemin vers votre site :"
    echo "   (Généralement ~/sites/votre-domaine.com)"
    echo "   Exemple: ~/sites/beta.fusepoint.ch"
    read -p "   Entrez le chemin vers votre site: " site_path
    
    if [ -z "$site_path" ]; then
        site_path="~/sites/beta.fusepoint.ch"
        log_warning "Utilisation du chemin par défaut: ~/sites/beta.fusepoint.ch"
    fi
    
    echo
    
    # Afficher un résumé
    echo "📋 Résumé de la configuration :"
    echo "   Utilisateur SSH: $ssh_user"
    echo "   Serveur: $ssh_host"
    echo "   Chemin du site: $site_path"
    echo "   Connexion complète: $ssh_user@$ssh_host"
    echo
    
    read -p "Ces informations sont-elles correctes? (y/N): " confirm
    
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        log_warning "Configuration annulée"
        return 1
    fi
    
    # Sauvegarder les informations
    SERVER_USER="$ssh_user"
    SERVER_HOST="$ssh_host"
    SERVER_PATH="$site_path"
}

# Fonction pour tester la connexion SSH
test_ssh_connection() {
    log_info "Test de la connexion SSH..."
    
    if ssh -o ConnectTimeout=10 -o BatchMode=yes "$SERVER_USER@$SERVER_HOST" "echo 'Connexion SSH réussie'" 2>/dev/null; then
        log_success "Connexion SSH réussie!"
        return 0
    else
        log_warning "Impossible de se connecter en mode automatique"
        log_info "Cela peut être normal si vous utilisez un mot de passe ou une clé SSH avec passphrase"
        
        read -p "Voulez-vous tester la connexion manuellement? (y/N): " test_manual
        
        if [[ $test_manual =~ ^[Yy]$ ]]; then
            log_info "Test de connexion manuelle..."
            ssh "$SERVER_USER@$SERVER_HOST" "echo 'Connexion SSH manuelle réussie'; exit"
            
            if [ $? -eq 0 ]; then
                log_success "Connexion SSH manuelle réussie!"
                return 0
            else
                log_error "Échec de la connexion SSH"
                return 1
            fi
        fi
    fi
}

# Fonction pour mettre à jour le script de déploiement
update_deploy_script() {
    local deploy_script="./deploy-to-server.sh"
    
    if [ ! -f "$deploy_script" ]; then
        log_error "Script de déploiement non trouvé: $deploy_script"
        return 1
    fi
    
    log_info "Mise à jour du script de déploiement..."
    
    # Créer une sauvegarde
    cp "$deploy_script" "${deploy_script}.backup"
    
    # Mettre à jour les variables
    sed -i.tmp "s/SERVER_USER=\".*\"/SERVER_USER=\"$SERVER_USER\"/g" "$deploy_script"
    sed -i.tmp "s/SERVER_HOST=\".*\"/SERVER_HOST=\"$SERVER_HOST\"/g" "$deploy_script"
    sed -i.tmp "s|SERVER_PATH=\".*\"|SERVER_PATH=\"$SERVER_PATH\"|g" "$deploy_script"
    
    # Nettoyer les fichiers temporaires
    rm -f "${deploy_script}.tmp"
    
    log_success "Script de déploiement mis à jour!"
    
    # Afficher les modifications
    echo
    log_info "Nouvelles valeurs dans le script de déploiement :"
    grep -E "SERVER_(USER|HOST|PATH)=" "$deploy_script" | sed 's/^/   /'
}

# Fonction pour créer un fichier de configuration
create_config_file() {
    local config_file=".server-config"
    
    log_info "Création du fichier de configuration..."
    
    cat > "$config_file" << EOF
# Configuration du serveur Infomaniak
# Généré le $(date)

SERVER_USER="$SERVER_USER"
SERVER_HOST="$SERVER_HOST"
SERVER_PATH="$SERVER_PATH"
SERVER_SSH="$SERVER_USER@$SERVER_HOST"

# Pour utiliser cette configuration dans vos scripts :
# source .server-config
EOF

    log_success "Fichier de configuration créé: $config_file"
}

# Fonction pour afficher les prochaines étapes
show_next_steps() {
    echo
    log_success "Configuration terminée! 🎉"
    echo
    echo "📋 Prochaines étapes :"
    echo
    echo "1. 🚀 Déployer votre code :"
    echo "   ./deploy-to-server.sh main"
    echo
    echo "2. 🔧 Ou utiliser le workflow de développement :"
    echo "   ./dev-workflow.sh deploy main"
    echo
    echo "3. 📊 Vérifier le statut après déploiement :"
    echo "   ssh $SERVER_USER@$SERVER_HOST 'cd $SERVER_PATH && ./manage-server.sh status'"
    echo
    echo "4. 🌐 Tester votre site :"
    echo "   https://votre-domaine.com"
    echo
    log_info "Fichiers créés/modifiés :"
    echo "   - deploy-to-server.sh (mis à jour)"
    echo "   - .server-config (nouveau)"
    echo "   - deploy-to-server.sh.backup (sauvegarde)"
    echo
}

# Fonction principale
main() {
    show_help
    
    read -p "Voulez-vous continuer avec la configuration? (y/N): " continue_setup
    
    if [[ ! $continue_setup =~ ^[Yy]$ ]]; then
        log_info "Configuration annulée"
        exit 0
    fi
    
    # Obtenir les informations SSH
    if ! get_ssh_info; then
        log_error "Échec de la configuration"
        exit 1
    fi
    
    # Tester la connexion
    if ! test_ssh_connection; then
        log_warning "Connexion SSH non testée, mais configuration sauvegardée"
    fi
    
    # Mettre à jour le script de déploiement
    if ! update_deploy_script; then
        log_error "Échec de la mise à jour du script de déploiement"
        exit 1
    fi
    
    # Créer le fichier de configuration
    create_config_file
    
    # Afficher les prochaines étapes
    show_next_steps
}

# Exécution
main "$@"