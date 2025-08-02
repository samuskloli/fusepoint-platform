#!/bin/bash

# Script de mise à jour des logs de version - Plateforme Fusepoint
# Usage: ./update-version-logs.sh [version] [description]

VERSION=${1:-"Alpha 1.0.0"}
DESCRIPTION=${2:-"Mise à jour automatique"}
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
DATE=$(date +"%Y-%m-%d")

echo "🚀 Mise à jour des logs de version Fusepoint"
echo "Version: $VERSION"
echo "Description: $DESCRIPTION"
echo "Timestamp: $TIMESTAMP"
echo ""

# Mise à jour du fichier de logs système
echo "[INFO] $TIMESTAMP - Mise à jour version: $VERSION" >> logs/system.log
echo "[INFO] $TIMESTAMP - Description: $DESCRIPTION" >> logs/system.log
echo "[INFO] $TIMESTAMP - Sauvegarde créée automatiquement" >> logs/system.log
echo "" >> logs/system.log

# Création d'une sauvegarde automatique
BACKUP_DIR="../fusepoint-platform-backup-$VERSION-$DATE"
echo "📦 Création de la sauvegarde: $BACKUP_DIR"
cp -r . "$BACKUP_DIR" 2>/dev/null || echo "⚠️  Erreur lors de la création de la sauvegarde"

# Mise à jour du composant VersionFooter avec la nouvelle version
if [ -f "src/components/VersionFooter.vue" ]; then
    sed -i "" "s/version: 'Alpha [0-9.]\+'/version: '$VERSION'/g" src/components/VersionFooter.vue
    echo "✅ Version mise à jour dans VersionFooter.vue"
fi

# Mise à jour du README avec la nouvelle version
if [ -f "README.md" ]; then
    sed -i "" "s/Version Actuelle: \*\*Alpha [0-9.]\+\*\*/Version Actuelle: **$VERSION**/g" README.md
    sed -i "" "s/- \*\*Version\*\*: Alpha [0-9.]\+/- **Version**: $VERSION/g" README.md
    echo "✅ Version mise à jour dans README.md"
fi

# Mise à jour du fichier VERSION.md
if [ -f "VERSION.md" ]; then
    sed -i "" "s/## Version Actuelle: Alpha [0-9.]\+/## Version Actuelle: $VERSION/g" VERSION.md
    sed -i "" "s/\*Dernière mise à jour: [0-9-]\+ [0-9:]*\*/\*Dernière mise à jour: $TIMESTAMP\*/g" VERSION.md
    echo "✅ Version mise à jour dans VERSION.md"
fi

# Ajout d'une entrée dans le CHANGELOG
if [ -f "CHANGELOG.md" ]; then
    # Créer une nouvelle entrée au début du changelog
    TEMP_FILE=$(mktemp)
    echo "# Changelog - Plateforme Fusepoint" > "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    echo "## [$VERSION] - $DATE" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    echo "### ✅ Ajouté" >> "$TEMP_FILE"
    echo "- $DESCRIPTION" >> "$TEMP_FILE"
    echo "- Mise à jour automatique des logs et documentation" >> "$TEMP_FILE"
    echo "- Sauvegarde automatique créée" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    
    # Ajouter le contenu existant (en sautant la première ligne)
    tail -n +2 "CHANGELOG.md" >> "$TEMP_FILE"
    mv "$TEMP_FILE" "CHANGELOG.md"
    echo "✅ Nouvelle entrée ajoutée dans CHANGELOG.md"
fi

# Affichage du statut final
echo ""
echo "🎉 Mise à jour terminée!"
echo "📋 Fichiers mis à jour:"
echo "   - logs/system.log"
echo "   - src/components/VersionFooter.vue"
echo "   - README.md"
echo "   - VERSION.md"
echo "   - CHANGELOG.md"
echo "📦 Sauvegarde: $BACKUP_DIR"
echo ""
echo "🔍 Pour voir les changements:"
echo "   git status"
echo "   git diff"
echo ""
echo "💡 Pour valider les changements:"
echo "   git add ."
echo "   git commit -m 'Version $VERSION: $DESCRIPTION'"
echo ""

# Optionnel: Afficher un résumé des fonctionnalités
echo "📊 Résumé de la version $VERSION:"
echo "   🚀 Fonctionnalités: Chat IA, Dashboard, Auth, Intégrations"
echo "   🎯 Rôles: Utilisateur, Agent, Super Admin"
echo "   🐛 Bugs connus: Chat IA, Notifications, Logs Super Admin"
echo "   🔮 Roadmap: Fusepoint Hub avec centralisation et réseautage"
echo ""