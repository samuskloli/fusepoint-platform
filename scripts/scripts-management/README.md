# 🚀 Fusepoint Platform - Gestionnaire de Scripts Unifié

## 📋 Vue d'ensemble

Ce dossier contient le nouveau système de gestion unifié pour la plateforme Fusepoint. Tous les scripts ont été centralisés et organisés pour une meilleure maintenabilité.

## 🎯 Script Principal

### `fusepoint-manager.sh`

Script principal qui remplace tous les anciens scripts éparpillés. Il offre une interface unifiée pour toutes les opérations.

```bash
# Utilisation générale
./fusepoint-manager.sh [category] [action] [options]

# Raccourci depuis la racine du projet
./fusepoint.sh [category] [action] [options]
```

## 📂 Structure Organisée

```
scripts-management/
├── fusepoint-manager.sh          # 🎯 Script principal unifié
├── README.md                     # Cette documentation
├── core/                         # Scripts principaux
│   ├── start-all-servers.sh      # Démarrage des serveurs
│   ├── restart-servers.sh        # Redémarrage des serveurs
│   ├── dev-workflow.sh           # Workflow de développement
│   ├── admin-commands.sh         # Commandes administratives
│   └── backup-quick-start.sh     # Système de sauvegarde
├── deployment/                   # Scripts de déploiement
│   ├── deploy-from-github.sh     # Déploiement depuis GitHub
│   ├── deploy-to-server.sh       # Déploiement vers serveur
│   └── deploy-production.sh      # Déploiement production
├── database/                     # Scripts de base de données
│   ├── manage-database.sh        # Gestion de la base de données
│   └── import-database-to-server.sh # Import vers serveur
└── deprecated/                   # Scripts obsolètes
    └── [anciens scripts...]      # Scripts dépréciés
```

## 🛠️ Fonctionnalités Principales

### 1. Gestion des Serveurs
```bash
# Démarrer les serveurs (backend + frontend)
./fusepoint-manager.sh server start

# Arrêter tous les serveurs
./fusepoint-manager.sh server stop

# Redémarrer les serveurs
./fusepoint-manager.sh server restart

# Voir l'état des serveurs
./fusepoint-manager.sh server status
```

### 2. Gestion des Sauvegardes
```bash
# Créer une sauvegarde complète
./fusepoint-manager.sh backup create full

# Créer une sauvegarde de configuration
./fusepoint-manager.sh backup create config

# Lister toutes les sauvegardes
./fusepoint-manager.sh backup list

# Restaurer une sauvegarde
./fusepoint-manager.sh backup restore <backup-id>
```

### 3. Gestion de la Base de Données
```bash
# Voir l'état de la base de données
./fusepoint-manager.sh database status

# Exporter la base de données
./fusepoint-manager.sh database export
```

### 4. Déploiement
```bash
# Déployer en production (branche main)
./fusepoint-manager.sh deploy production

# Déployer une branche spécifique
./fusepoint-manager.sh deploy production feature-branch
```

### 5. Développement
```bash
# Configurer l'environnement de développement
./fusepoint-manager.sh dev setup
```

### 6. Maintenance
```bash
# Nettoyer le système (logs anciens, fichiers temporaires)
./fusepoint-manager.sh maintenance cleanup

# Rapport de santé complet
./fusepoint-manager.sh maintenance health
```

## 🔧 Configuration et Personnalisation

### Variables d'Environnement

Le script utilise ces variables par défaut :
- `PROJECT_ROOT` : Racine du projet
- `SERVER_DIR` : Dossier du serveur backend
- `DB_PATH` : Chemin vers la base de données SQLite
- `BACKUP_SCRIPT` : Script de sauvegarde

### Personnalisation

Vous pouvez modifier ces variables dans le script selon vos besoins.

## 📊 Monitoring et Logs

### Logs des Serveurs
```bash
# Logs du backend
tail -f logs/backend.log

# Logs du frontend
tail -f logs/frontend.log
```

### Fichiers PID
Les processus sont trackés via :
- `logs/backend.pid`
- `logs/frontend.pid`

## 🚨 Dépannage

### Problèmes Courants

1. **Serveurs qui ne démarrent pas**
   ```bash
   ./fusepoint-manager.sh server stop
   ./fusepoint-manager.sh maintenance cleanup
   ./fusepoint-manager.sh server start
   ```

2. **Base de données verrouillée**
   ```bash
   ./fusepoint-manager.sh server stop
   # Attendre quelques secondes
   ./fusepoint-manager.sh server start
   ```

3. **Ports occupés**
   ```bash
   # Vérifier les processus
   lsof -i :3000  # Backend
   lsof -i :5173  # Frontend
   ```

### Diagnostic Complet
```bash
# Rapport de santé détaillé
./fusepoint-manager.sh maintenance health
```

## 🔄 Migration depuis les Anciens Scripts

### Correspondances
| Ancien Script | Nouvelle Commande |
|---------------|-------------------|
| `./start-all-servers.sh` | `./fusepoint-manager.sh server start` |
| `./restart-servers.sh` | `./fusepoint-manager.sh server restart` |
| `./backup-quick-start.sh create full` | `./fusepoint-manager.sh backup create full` |
| `./deploy-to-server.sh main` | `./fusepoint-manager.sh deploy production main` |

### Liens Symboliques
Pour faciliter la transition :
- `./fusepoint.sh` → `./scripts-management/fusepoint-manager.sh`
- `./backup.sh` → `./scripts-management/core/backup-quick-start.sh`

## 📚 Documentation Complémentaire

- [MIGRATION_SCRIPTS.md](../MIGRATION_SCRIPTS.md) - Guide de migration complet
- [DEV-WORKFLOW.md](../DEV-WORKFLOW.md) - Workflow de développement
- [BACKUP_SYSTEM.md](../BACKUP_SYSTEM.md) - Système de sauvegarde

## 🆘 Support

### Aide Intégrée
```bash
# Afficher l'aide complète
./fusepoint-manager.sh help

# Aide pour une catégorie spécifique
./fusepoint-manager.sh server
```

### En Cas de Problème
1. Consultez les logs : `./fusepoint-manager.sh maintenance health`
2. Nettoyez le système : `./fusepoint-manager.sh maintenance cleanup`
3. Utilisez les anciens scripts en cas d'urgence (dossier `deprecated/`)

---

**Version** : 1.0  
**Dernière mise à jour** : $(date +%Y-%m-%d)  
**Statut** : ✅ Production Ready