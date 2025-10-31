# Système de Sauvegarde et Récupération Fusepoint

## Vue d'ensemble

Le système de sauvegarde complet de la plateforme Fusepoint permet de créer, gérer et restaurer des sauvegardes de tous les composants critiques de l'application :

- **Base de données** : Sauvegarde de la base SQLite avec dump SQL
- **Configuration** : Fichiers .env, config/, package.json, etc.
- **Code source** : Ensemble du code de l'application (excluant node_modules, logs, etc.)

## Installation et Configuration

### Dépendances

Les dépendances suivantes sont automatiquement installées :
```bash
npm install archiver node-cron
```

### Structure des Sauvegardes

```
backups/
└── complete/
    ├── database/     # Fichiers .db et .sql
    ├── config/       # Archives .tar.gz des configurations
    ├── source/       # Archives .tar.gz du code source
    └── full/         # Métadonnées JSON des sauvegardes
```

## Utilisation

### Script de Démarrage Rapide

Utilisez le script `backup-quick-start.sh` pour toutes les opérations :

```bash
# Créer une sauvegarde complète
./backup-quick-start.sh create full

# Créer une sauvegarde de configuration seulement
./backup-quick-start.sh create config

# Lister toutes les sauvegardes
./backup-quick-start.sh list

# Afficher les statistiques
./backup-quick-start.sh stats

# Rapport de santé
./backup-quick-start.sh health

# Nettoyer les sauvegardes anciennes (> 30 jours)
./backup-quick-start.sh cleanup 30

# Restaurer une sauvegarde
./backup-quick-start.sh restore backup-2025-01-01T10-00-00-000Z-abc123

# Vérifier l'intégrité d'une sauvegarde
./backup-quick-start.sh verify backup-2025-01-01T10-00-00-000Z-abc123

# Démarrer les sauvegardes automatiques
./backup-quick-start.sh auto-start
```

### Utilisation Directe du Script

```bash
# Créer une sauvegarde
node scripts/backup-system.cjs create --type=full

# Lister les sauvegardes
node scripts/backup-system.cjs list

# Restaurer (attention: écrase les fichiers existants)
node scripts/backup-system.cjs restore backup-id database config
```

## Types de Sauvegardes

### 1. Sauvegarde Complète (`full`)
- Base de données + Configuration + Code source
- Recommandée pour les sauvegardes hebdomadaires
- Taille : ~25-30 MB

### 2. Sauvegarde Configuration (`config`)
- Base de données + Fichiers de configuration
- Recommandée pour les sauvegardes quotidiennes
- Taille : ~1-2 MB

### 3. Sauvegarde Base de Données (`database`)
- Base de données SQLite uniquement
- Pour les sauvegardes fréquentes
- Taille : ~0.5-1 MB

## Sauvegardes Automatiques

Le système peut être configuré pour des sauvegardes automatiques :

- **Quotidienne** : Configuration + Base de données à 2h00
- **Hebdomadaire** : Sauvegarde complète le dimanche à 3h00
- **Nettoyage** : Suppression automatique des sauvegardes > 30 jours

```bash
# Démarrer le planificateur
./backup-quick-start.sh auto-start

# Ou utiliser le script dédié
node scripts/start-backup-scheduler.js
```

## API REST

Le système est intégré aux routes API du super administrateur :

### Endpoints Disponibles

```http
# Créer une sauvegarde complète
POST /api/super-admin/system/backup/complete
Body: { "type": "full" }

# Lister les sauvegardes
GET /api/super-admin/system/backups/complete

# Restaurer une sauvegarde
POST /api/super-admin/system/backup/restore
Body: { "backupId": "backup-id", "type": "full" }

# Statistiques
GET /api/super-admin/system/backup/stats

# Nettoyage
POST /api/super-admin/system/backup/cleanup
Body: { "days": 30 }

# Démarrer les sauvegardes automatiques
POST /api/super-admin/system/backup/scheduler/start

# Rapport de santé
GET /api/super-admin/system/backup/health

# Rapport détaillé
GET /api/super-admin/system/backup/report
```

## Sécurité et Bonnes Pratiques

### ⚠️ Avertissements Importants

1. **Restauration** : La restauration écrase les fichiers existants. Toujours créer une sauvegarde avant de restaurer.

2. **Permissions** : Assurez-vous que l'utilisateur a les permissions d'écriture sur les répertoires de sauvegarde.

3. **Espace Disque** : Surveillez l'espace disque disponible. Les sauvegardes complètes peuvent être volumineuses.

4. **Sauvegardes Externes** : Considérez la copie des sauvegardes vers un stockage externe pour une protection maximale.

### Recommandations

- **Fréquence** : Sauvegarde quotidienne minimum, complète hebdomadaire
- **Rétention** : Garder au moins 30 jours de sauvegardes
- **Test** : Tester régulièrement la restauration sur un environnement de test
- **Monitoring** : Utiliser le rapport de santé pour surveiller le système

## Dépannage

### Problèmes Courants

1. **Erreur "MODULE_NOT_FOUND"**
   ```bash
   npm install archiver node-cron
   ```

2. **Erreur "ENOENT: no such file or directory"**
   ```bash
   mkdir -p backups/complete/{database,config,source,full}
   ```

3. **Permissions insuffisantes**
   ```bash
   chmod +x backup-quick-start.sh
   chmod -R 755 backups/
   ```

4. **Base de données verrouillée**
   - Arrêter temporairement l'application
   - Ou utiliser le mode "hot backup" de SQLite

### Vérification de l'Intégrité

```bash
# Vérifier une sauvegarde spécifique
./backup-quick-start.sh verify backup-id

# Rapport de santé global
./backup-quick-start.sh health
```

## Logs et Monitoring

Les opérations de sauvegarde génèrent des logs détaillés :

- ✅ Succès des opérations
- ❌ Erreurs avec messages explicites
- 📊 Statistiques de taille et durée
- ⚠️ Avertissements pour les problèmes non critiques

## Support

Pour toute question ou problème :

1. Vérifiez les logs d'erreur
2. Consultez le rapport de santé
3. Vérifiez les permissions et l'espace disque
4. Testez avec une sauvegarde simple (database only)

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2025-01-02  
**Compatibilité** : Node.js 18+, SQLite 3+