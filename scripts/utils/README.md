# 🛠️ Utilitaires et Scripts Helper - Fusepoint Platform

## 📋 Vue d'ensemble

Ce dossier contient tous les utilitaires, scripts helper et outils de maintenance pour la plateforme Fusepoint.

## 🔧 Utilitaires Disponibles

### 💾 **Synchronisation Base de Données**

#### `sync-database-to-server.cjs`
**Fonction** : Synchronisation de la base de données locale vers le serveur distant

```bash
# Utilisation
node utils/sync-database-to-server.cjs

# Ou via le script principal
./fusepoint.sh database export
```

**Fonctionnalités** :
- Export de la base de données locale
- Upload sécurisé vers le serveur
- Vérification d'intégrité
- Sauvegarde automatique avant sync
- Logs détaillés de l'opération

**Configuration** :
- Serveur SSH : Infomaniak
- Chemin distant : `/home/clients/[user]/[domain]/server/database/`
- Format : SQLite → SQL dump → SQLite

### 🔧 **Correction Base de Données**

#### `fix-phone-column.js`
**Fonction** : Correction et normalisation de la colonne téléphone

```bash
# Utilisation
node utils/fix-phone-column.js
```

**Corrections** :
- Normalisation des formats de téléphone
- Suppression des caractères invalides
- Validation des numéros
- Mise à jour en lot

### 📊 **Gestion des Versions**

#### `update-version-logs.sh`
**Fonction** : Mise à jour automatique des logs de version

```bash
# Utilisation
./utils/update-version-logs.sh [nouvelle_version]

# Exemple
./utils/update-version-logs.sh "Alpha 2.2.0"
```

**Actions** :
- Mise à jour du fichier VERSION.md
- Mise à jour du README.md principal
- Horodatage automatique
- Sauvegarde des anciennes versions

### 🌐 **Test et Validation**

#### `test-login.html`
**Fonction** : Interface de test pour la connexion utilisateur

**Utilisation** :
1. Ouvrir dans un navigateur web
2. Configurer l'URL de l'API
3. Tester différents scénarios de connexion
4. Valider les réponses

**Tests disponibles** :
- Connexion normale
- Connexion avec mauvais identifiants
- Test de session
- Validation des tokens

## 🚀 Utilisation Recommandée

### 📋 **Workflow de Synchronisation**

```bash
# 1. Créer une sauvegarde locale
./fusepoint.sh backup create database

# 2. Synchroniser vers le serveur
node utils/sync-database-to-server.cjs

# 3. Vérifier la synchronisation
./fusepoint.sh maintenance health
```

### 🔧 **Maintenance Régulière**

```bash
# Correction des données téléphone (mensuel)
node utils/fix-phone-column.js

# Mise à jour de version (à chaque release)
./utils/update-version-logs.sh "Alpha X.X.X"

# Test de connexion (après modifications auth)
# Ouvrir utils/test-login.html dans le navigateur
```

### 🔄 **Intégration CI/CD**

```bash
# Script de déploiement automatique
#!/bin/bash

# 1. Sauvegarde
./fusepoint.sh backup create full

# 2. Mise à jour version
./utils/update-version-logs.sh "$NEW_VERSION"

# 3. Synchronisation
node utils/sync-database-to-server.cjs

# 4. Vérification
./fusepoint.sh maintenance health
```

## 📊 **Configuration et Paramètres**

### 🔐 **Synchronisation Base de Données**

```javascript
// Configuration dans sync-database-to-server.cjs
const CONFIG = {
  SERVER_HOST: "57-101961.ssh.hosting-ik.com",
  SERVER_USER: "gjNCbjZ4HAb_sam",
  REMOTE_PATH: "/home/clients/[user]/[domain]/server/database/",
  LOCAL_DB: "server/database/fusepoint.db",
  BACKUP_BEFORE_SYNC: true,
  VERIFY_INTEGRITY: true
};
```

### 📝 **Logs de Version**

```bash
# Format de version supporté
"Alpha X.X.X"
"Beta X.X.X"
"Release X.X.X"

# Fichiers mis à jour automatiquement
- docs/VERSION.md
- README.md
- docs/CHANGELOG.md (si présent)
```

## 🔍 **Monitoring et Logs**

### 📊 **Logs de Synchronisation**

```bash
# Vérifier les logs de sync
tail -f logs/sync-database.log

# Logs d'erreur
tail -f logs/sync-errors.log
```

### 📈 **Métriques**

- **Temps de synchronisation** : Généralement < 30 secondes
- **Taille de base** : ~2-5 MB en moyenne
- **Fréquence recommandée** : Quotidienne ou après modifications importantes

## 🚨 **Dépannage**

### Problème : "Échec de synchronisation SSH"

```bash
# Vérifier la connexion SSH
ssh gjNCbjZ4HAb_sam@57-101961.ssh.hosting-ik.com

# Vérifier les clés SSH
ls -la ~/.ssh/

# Régénérer si nécessaire
ssh-keygen -t rsa -b 4096
```

### Problème : "Base de données corrompue"

```bash
# Vérifier l'intégrité
sqlite3 server/database/fusepoint.db "PRAGMA integrity_check;"

# Restaurer depuis sauvegarde
./fusepoint.sh backup restore [backup-id]
```

### Problème : "Erreur de format téléphone"

```bash
# Diagnostic
node utils/fix-phone-column.js --dry-run

# Correction
node utils/fix-phone-column.js --fix
```

## 🔗 **Intégration avec le Système Principal**

### Via Script Principal

```bash
# Synchronisation base de données
./fusepoint.sh database export

# Maintenance générale (inclut certains utilitaires)
./fusepoint.sh maintenance cleanup
```

### Utilisation Directe

```bash
# Accès direct aux utilitaires
cd utils/
node sync-database-to-server.cjs
node fix-phone-column.js
./update-version-logs.sh "Alpha 2.2.0"
```

## 📚 **Documentation Associée**

- **[../docs/DATABASE_IMPORT_GUIDE.md](../docs/DATABASE_IMPORT_GUIDE.md)** - Guide complet base de données
- **[../docs/INFOMANIAK_DEPLOYMENT.md](../docs/INFOMANIAK_DEPLOYMENT.md)** - Déploiement serveur
- **[../docs/VERSION.md](../docs/VERSION.md)** - Informations de version
- **[../docs/TROUBLESHOOTING_INFOMANIAK.md](../docs/TROUBLESHOOTING_INFOMANIAK.md)** - Dépannage

## 🔄 **Automatisation**

### Cron Jobs Recommandés

```bash
# Synchronisation quotidienne (2h du matin)
0 2 * * * cd /path/to/fusepoint && node utils/sync-database-to-server.cjs

# Nettoyage téléphones (1er du mois)
0 3 1 * * cd /path/to/fusepoint && node utils/fix-phone-column.js

# Sauvegarde avant sync
55 1 * * * cd /path/to/fusepoint && ./fusepoint.sh backup create database
```

### Scripts de Monitoring

```bash
# Vérification automatique post-sync
#!/bin/bash
if node utils/sync-database-to-server.cjs; then
  echo "✅ Sync réussie - $(date)"
  ./fusepoint.sh maintenance health
else
  echo "❌ Échec sync - $(date)"
  # Envoyer alerte
fi
```

---

**🛠️ Utilitaires maintenus à jour - Dernière révision : 2025-08-04**