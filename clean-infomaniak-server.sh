#!/bin/bash

# Script de nettoyage complet pour serveur Infomaniak
# ATTENTION: Ce script supprime TOUS les fichiers du répertoire de déploiement
# Utilisez avec précaution!

echo "🧹 Script de nettoyage complet pour Infomaniak"
echo "============================================="
echo "⚠️  ATTENTION: Ce script va supprimer TOUS les fichiers existants!"
echo "📁 Répertoire cible: /srv/customer/fusepoint-platform/"
echo ""

# Demander confirmation
read -p "Êtes-vous sûr de vouloir continuer? (tapez 'OUI' pour confirmer): " confirmation

if [ "$confirmation" != "OUI" ]; then
    echo "❌ Opération annulée."
    exit 1
fi

echo "🚀 Début du nettoyage..."

# Variables
DEPLOY_DIR="/srv/customer/fusepoint-platform"
BACKUP_DIR="/srv/customer/backup-$(date +%Y%m%d-%H%M%S)"

# Fonction de sauvegarde (optionnelle)
backup_existing() {
    if [ -d "$DEPLOY_DIR" ]; then
        echo "💾 Création d'une sauvegarde dans $BACKUP_DIR..."
        mkdir -p "$BACKUP_DIR"
        
        # Sauvegarder les fichiers importants
        if [ -f "$DEPLOY_DIR/.env" ]; then
            cp "$DEPLOY_DIR/.env" "$BACKUP_DIR/.env.backup"
            echo "✅ Fichier .env sauvegardé"
        fi
        
        if [ -f "$DEPLOY_DIR/database.sqlite" ]; then
            cp "$DEPLOY_DIR/database.sqlite" "$BACKUP_DIR/database.sqlite.backup"
            echo "✅ Base de données sauvegardée"
        fi
        
        if [ -d "$DEPLOY_DIR/logs" ]; then
            cp -r "$DEPLOY_DIR/logs" "$BACKUP_DIR/logs.backup"
            echo "✅ Logs sauvegardés"
        fi
    fi
}

# Arrêter tous les processus Node.js
stop_processes() {
    echo "🛑 Arrêt des processus Node.js..."
    
    # Arrêter PM2 si installé
    if command -v pm2 &> /dev/null; then
        echo "📦 Arrêt des processus PM2..."
        pm2 stop all 2>/dev/null || true
        pm2 delete all 2>/dev/null || true
        pm2 kill 2>/dev/null || true
    fi
    
    # Tuer tous les processus Node.js
    echo "🔪 Arrêt forcé des processus Node.js..."
    pkill -f "node" 2>/dev/null || true
    pkill -f "npm" 2>/dev/null || true
    
    # Attendre un peu
    sleep 3
    
    echo "✅ Processus arrêtés"
}

# Nettoyer les fichiers de verrouillage
clean_locks() {
    echo "🔓 Nettoyage des fichiers de verrouillage..."
    
    # Supprimer les fichiers de verrouillage SQLite
    find "$DEPLOY_DIR" -name "*.db-wal" -delete 2>/dev/null || true
    find "$DEPLOY_DIR" -name "*.db-shm" -delete 2>/dev/null || true
    find "$DEPLOY_DIR" -name "*.sqlite-wal" -delete 2>/dev/null || true
    find "$DEPLOY_DIR" -name "*.sqlite-shm" -delete 2>/dev/null || true
    
    # Supprimer les fichiers de verrouillage npm
    find "$DEPLOY_DIR" -name "package-lock.json" -delete 2>/dev/null || true
    find "$DEPLOY_DIR" -name ".npmrc" -delete 2>/dev/null || true
    
    echo "✅ Fichiers de verrouillage supprimés"
}

# Supprimer complètement le répertoire
clean_directory() {
    echo "🗑️  Suppression complète du répertoire..."
    
    if [ -d "$DEPLOY_DIR" ]; then
        # Changer les permissions pour s'assurer qu'on peut tout supprimer
        chmod -R 755 "$DEPLOY_DIR" 2>/dev/null || true
        
        # Supprimer le contenu
        rm -rf "$DEPLOY_DIR"/* 2>/dev/null || true
        rm -rf "$DEPLOY_DIR"/.[^.]* 2>/dev/null || true
        
        echo "✅ Répertoire nettoyé"
    else
        echo "ℹ️  Le répertoire $DEPLOY_DIR n'existe pas"
    fi
}

# Créer un répertoire propre
setup_clean_directory() {
    echo "📁 Création d'un répertoire propre..."
    
    # Créer le répertoire s'il n'existe pas
    mkdir -p "$DEPLOY_DIR"
    
    # Définir les bonnes permissions
    chmod 755 "$DEPLOY_DIR"
    
    # Créer les sous-répertoires nécessaires
    mkdir -p "$DEPLOY_DIR/logs"
    mkdir -p "$DEPLOY_DIR/backups"
    
    echo "✅ Répertoire propre créé"
}

# Nettoyer le cache système
clean_system_cache() {
    echo "🧽 Nettoyage du cache système..."
    
    # Nettoyer le cache npm global
    npm cache clean --force 2>/dev/null || true
    
    # Nettoyer les fichiers temporaires
    rm -rf /tmp/npm-* 2>/dev/null || true
    rm -rf /tmp/node-* 2>/dev/null || true
    
    echo "✅ Cache système nettoyé"
}

# Vérifier les prérequis
check_requirements() {
    echo "🔍 Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js n'est pas installé"
        echo "📦 Installez Node.js avant de continuer"
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        echo "❌ npm n'est pas installé"
        exit 1
    fi
    
    echo "✅ Node.js $(node --version) et npm $(npm --version) disponibles"
}

# Fonction principale
main() {
    echo "🎯 Début du processus de nettoyage..."
    
    # Demander si on veut faire une sauvegarde
    read -p "Voulez-vous sauvegarder les fichiers importants? (o/N): " do_backup
    if [[ $do_backup =~ ^[Oo]$ ]]; then
        backup_existing
    fi
    
    # Exécuter le nettoyage
    stop_processes
    clean_locks
    clean_directory
    setup_clean_directory
    clean_system_cache
    check_requirements
    
    echo ""
    echo "🎉 Nettoyage terminé avec succès!"
    echo "📁 Répertoire propre: $DEPLOY_DIR"
    
    if [ -d "$BACKUP_DIR" ]; then
        echo "💾 Sauvegarde disponible: $BACKUP_DIR"
    fi
    
    echo ""
    echo "📋 Prochaines étapes:"
    echo "1. Transférez vos nouveaux fichiers vers $DEPLOY_DIR"
    echo "2. Configurez votre fichier .env"
    echo "3. Exécutez le script de déploiement"
    echo "4. Démarrez les serveurs"
}

# Exécuter le script principal
main

echo "✅ Script de nettoyage terminé."