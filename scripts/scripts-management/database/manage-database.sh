#!/bin/bash

# Script de gestion principal pour l'import et la synchronisation de base de données
# Usage: ./manage-database.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Fonction d'affichage
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Fonction pour afficher le titre
show_title() {
    clear
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║           🗄️  GESTIONNAIRE DE BASE DE DONNÉES 🗄️             ║"
    echo "║                     Fusepoint Platform                      ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
}

# Fonction pour vérifier les prérequis
check_prerequisites() {
    log "🔍 Vérification des prérequis..."
    
    # Vérifier que nous sommes dans le bon répertoire
    if [ ! -f "package.json" ] || [ ! -d "server" ]; then
        error "Veuillez exécuter ce script depuis la racine du projet Fusepoint"
    fi
    
    # Vérifier la base de données locale
    if [ ! -f "server/database/fusepoint.db" ]; then
        warning "Base de données locale introuvable: server/database/fusepoint.db"
        echo "Voulez-vous créer une nouvelle base de données? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            log "Initialisation de la base de données locale..."
            cd server && npm run init-db && cd ..
            success "Base de données locale créée"
        else
            error "Base de données locale requise"
        fi
    fi
    
    # Vérifier les outils nécessaires
    for tool in sqlite3 ssh scp node; do
        if ! command -v $tool &> /dev/null; then
            error "$tool n'est pas installé ou accessible"
        fi
    done
    
    # Vérifier les scripts
    if [ ! -f "import-database-to-server.sh" ]; then
        error "Script import-database-to-server.sh introuvable"
    fi
    
    if [ ! -f "sync-database-to-server.cjs" ]; then
        error "Script sync-database-to-server.cjs introuvable"
    fi
    
    success "Tous les prérequis sont satisfaits"
}

# Fonction pour analyser les bases de données
analyze_databases() {
    log "📊 Analyse des bases de données..."
    
    # Analyse locale
    echo -e "\n${CYAN}📍 Base de données LOCALE:${NC}"
    LOCAL_TABLES=$(sqlite3 server/database/fusepoint.db "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
    LOCAL_USERS=$(sqlite3 server/database/fusepoint.db "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
    LOCAL_COMPANIES=$(sqlite3 server/database/fusepoint.db "SELECT COUNT(*) FROM companies;" 2>/dev/null || echo "0")
    
    echo "  • Tables: $LOCAL_TABLES"
    echo "  • Utilisateurs: $LOCAL_USERS"
    echo "  • Entreprises: $LOCAL_COMPANIES"
    
    # Analyse serveur
    echo -e "\n${CYAN}🌐 Base de données SERVEUR:${NC}"
    
    if ssh -o ConnectTimeout=5 gjNCbjZ4HAb_sam@57-101961.ssh.hosting-ik.com "echo 'test'" &>/dev/null; then
        SERVER_TABLES=$(ssh gjNCbjZ4HAb_sam@57-101961.ssh.hosting-ik.com 'cd sites/beta.fusepoint.ch/server/database && sqlite3 fusepoint.db "SELECT COUNT(*) FROM sqlite_master WHERE type=\"table\" AND name NOT LIKE \"sqlite_%\";"' 2>/dev/null || echo "0")
        SERVER_USERS=$(ssh gjNCbjZ4HAb_sam@57-101961.ssh.hosting-ik.com 'cd sites/beta.fusepoint.ch/server/database && sqlite3 fusepoint.db "SELECT COUNT(*) FROM users;"' 2>/dev/null || echo "0")
        SERVER_COMPANIES=$(ssh gjNCbjZ4HAb_sam@57-101961.ssh.hosting-ik.com 'cd sites/beta.fusepoint.ch/server/database && sqlite3 fusepoint.db "SELECT COUNT(*) FROM companies;"' 2>/dev/null || echo "0")
        
        echo "  • Tables: $SERVER_TABLES"
        echo "  • Utilisateurs: $SERVER_USERS"
        echo "  • Entreprises: $SERVER_COMPANIES"
        
        # Comparaison
        echo -e "\n${YELLOW}📈 Différences:${NC}"
        DIFF_USERS=$((LOCAL_USERS - SERVER_USERS))
        DIFF_COMPANIES=$((LOCAL_COMPANIES - SERVER_COMPANIES))
        
        if [ $DIFF_USERS -ne 0 ]; then
            echo "  • Utilisateurs: ${DIFF_USERS:+$DIFF_USERS}"
        fi
        if [ $DIFF_COMPANIES -ne 0 ]; then
            echo "  • Entreprises: ${DIFF_COMPANIES:+$DIFF_COMPANIES}"
        fi
        
        if [ $DIFF_USERS -eq 0 ] && [ $DIFF_COMPANIES -eq 0 ]; then
            success "Les bases de données sont synchronisées"
        fi
    else
        warning "Impossible de se connecter au serveur pour l'analyse"
    fi
}

# Menu principal
show_main_menu() {
    echo -e "\n${CYAN}🎯 Que souhaitez-vous faire?${NC}\n"
    
    echo "1. 📊 Analyser les bases de données"
    echo "2. 🚀 Import complet (remplace tout sur le serveur)"
    echo "3. 🔄 Synchronisation interactive (Node.js)"
    echo "4. ⚡ Import rapide avec sauvegarde"
    echo "5. 🛠️  Réparer la colonne agent_id manquante"
    echo "6. 📋 Afficher l'aide détaillée"
    echo "7. 🚪 Quitter"
    
    echo -e "\n${YELLOW}Choisissez une option (1-7):${NC} "
    read -r choice
    
    case $choice in
        1)
            analyze_databases
            echo -e "\nAppuyez sur Entrée pour continuer..."
            read -r
            ;;
        2)
            echo -e "\n${RED}⚠️  ATTENTION: Cela remplacera COMPLÈTEMENT la base du serveur!${NC}"
            echo "Voulez-vous continuer? (tapez 'OUI' en majuscules pour confirmer)"
            read -r confirm
            if [ "$confirm" = "OUI" ]; then
                log "Lancement de l'import complet..."
                ./import-database-to-server.sh --backup
            else
                info "Import annulé"
            fi
            ;;
        3)
            log "Lancement de la synchronisation interactive..."
            node sync-database-to-server.cjs
            ;;
        4)
            log "Lancement de l'import rapide avec sauvegarde..."
            ./import-database-to-server.sh --force --backup
            ;;
        5)
            log "Réparation de la colonne agent_id..."
            ssh gjNCbjZ4HAb_sam@57-101961.ssh.hosting-ik.com "cd sites/beta.fusepoint.ch/server && node fix-agent-id.js"
            success "Réparation terminée"
            ;;
        6)
            show_help
            ;;
        7)
            log "👋 Au revoir!"
            exit 0
            ;;
        *)
            warning "Option invalide. Veuillez choisir entre 1 et 7."
            ;;
    esac
}

# Fonction d'aide
show_help() {
    echo -e "\n${CYAN}📖 AIDE DÉTAILLÉE${NC}\n"
    
    echo -e "${YELLOW}🚀 Import complet:${NC}"
    echo "  • Remplace complètement la base du serveur"
    echo "  • Crée une sauvegarde automatique"
    echo "  • Redémarre le serveur automatiquement"
    echo "  • Usage: ./import-database-to-server.sh [--force] [--backup]"
    
    echo -e "\n${YELLOW}🔄 Synchronisation interactive:${NC}"
    echo "  • Interface interactive pour choisir les tables"
    echo "  • Permet la synchronisation partielle"
    echo "  • Analyse les différences avant sync"
    echo "  • Usage: node sync-database-to-server.cjs"
    
    echo -e "\n${YELLOW}📁 Structure des sauvegardes:${NC}"
    echo "  • Répertoire: database-backups/"
    echo "  • Format: server_backup_YYYYMMDD_HHMMSS.db"
    echo "  • Dumps SQL: server_dump_YYYYMMDD_HHMMSS.sql"
    
    echo -e "\n${YELLOW}🔧 Dépannage:${NC}"
    echo "  • Vérifiez la connexion SSH: ssh gjNCbjZ4HAb_sam@57-101961.ssh.hosting-ik.com"
    echo "  • Logs serveur: ssh gjNCbjZ4HAb_sam@57-101961.ssh.hosting-ik.com 'cd sites/beta.fusepoint.ch && pm2 logs'"
    echo "  • Redémarrer serveur: ssh gjNCbjZ4HAb_sam@57-101961.ssh.hosting-ik.com 'cd sites/beta.fusepoint.ch && pm2 restart all'"
    
    echo -e "\nAppuyez sur Entrée pour revenir au menu..."
    read -r
}

# Fonction principale
main() {
    # Vérifier les prérequis au démarrage
    check_prerequisites
    
    # Boucle principale
    while true; do
        show_title
        analyze_databases
        show_main_menu
    done
}

# Gestion des signaux
trap 'echo -e "\n\n${YELLOW}Script interrompu par l'"'"'utilisateur${NC}"; exit 1' INT TERM

# Démarrage du script
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi