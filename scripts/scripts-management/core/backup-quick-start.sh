#!/bin/bash

# Script de démarrage rapide pour le système de sauvegarde Fusepoint
# Usage: ./backup-quick-start.sh [command] [options]

set -e

BACKUP_SCRIPT="scripts/backup-system.cjs"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$PROJECT_ROOT"

echo "🔧 Système de sauvegarde Fusepoint - Démarrage rapide"
echo "================================================="

case "$1" in
    "create")
        echo "📦 Création d'une sauvegarde..."
        TYPE=${2:-full}
        node "$BACKUP_SCRIPT" create --type="$TYPE"
        ;;
    "list")
        echo "📋 Liste des sauvegardes disponibles:"
        node "$BACKUP_SCRIPT" list
        ;;
    "stats")
        echo "📊 Statistiques des sauvegardes:"
        node "$BACKUP_SCRIPT" stats
        ;;
    "health")
        echo "🏥 Rapport de santé du système:"
        node "$BACKUP_SCRIPT" health
        ;;
    "cleanup")
        echo "🧹 Nettoyage des anciennes sauvegardes..."
        DAYS=${2:-30}
        node "$BACKUP_SCRIPT" cleanup --days="$DAYS"
        ;;
    "restore")
        if [ -z "$2" ]; then
            echo "❌ Erreur: ID de sauvegarde requis"
            echo "Usage: $0 restore <backup-id> [components...]"
            exit 1
        fi
        echo "🔄 Restauration de la sauvegarde: $2"
        shift 2
        node "$BACKUP_SCRIPT" restore "$2" "$@"
        ;;
    "auto-start")
        echo "⏰ Démarrage des sauvegardes automatiques..."
        node "$BACKUP_SCRIPT" auto-start
        ;;
    "verify")
        if [ -z "$2" ]; then
            echo "❌ Erreur: ID de sauvegarde requis"
            echo "Usage: $0 verify <backup-id>"
            exit 1
        fi
        echo "🔍 Vérification de la sauvegarde: $2"
        node "$BACKUP_SCRIPT" verify "$2"
        ;;
    "help"|"--help"|"-h"|"")
        echo ""
        echo "Commandes disponibles:"
        echo "  create [type]           Créer une sauvegarde (types: full, config, database)"
        echo "  list                    Lister toutes les sauvegardes"
        echo "  stats                   Afficher les statistiques"
        echo "  health                  Rapport de santé du système"
        echo "  cleanup [days]          Nettoyer les sauvegardes anciennes (défaut: 30 jours)"
        echo "  restore <id> [comp...]  Restaurer une sauvegarde"
        echo "  verify <id>             Vérifier l'intégrité d'une sauvegarde"
        echo "  auto-start              Démarrer les sauvegardes automatiques"
        echo "  help                    Afficher cette aide"
        echo ""
        echo "Exemples:"
        echo "  $0 create full          # Sauvegarde complète"
        echo "  $0 create config        # Sauvegarde configuration seulement"
        echo "  $0 list                 # Lister les sauvegardes"
        echo "  $0 cleanup 15           # Supprimer les sauvegardes > 15 jours"
        echo "  $0 restore backup-id    # Restaurer une sauvegarde"
        echo ""
        ;;
    *)
        echo "❌ Commande inconnue: $1"
        echo "Utilisez '$0 help' pour voir les commandes disponibles."
        exit 1
        ;;
esac

echo "✅ Opération terminée."