# 🗄️ Guide d'Import et Synchronisation de Base de Données

## Vue d'ensemble

Ce guide vous explique comment utiliser les outils d'import et de synchronisation pour transférer votre base de données locale vers le serveur Infomaniak.

## 🚀 Démarrage Rapide

### Option 1: Interface Graphique (Recommandée)
```bash
./manage-database.sh
```

### Option 2: Import Complet Direct
```bash
./import-database-to-server.sh --backup
```

### Option 3: Synchronisation Interactive
```bash
node sync-database-to-server.cjs
```

## 📋 Outils Disponibles

### 1. `manage-database.sh` - Interface Principale
**Interface graphique interactive pour gérer tous les aspects de la synchronisation.**

**Fonctionnalités:**
- ✅ Analyse comparative des bases de données
- ✅ Import complet avec sauvegardes
- ✅ Synchronisation sélective
- ✅ Réparation automatique des colonnes manquantes
- ✅ Interface utilisateur intuitive

**Usage:**
```bash
./manage-database.sh
```

### 2. `import-database-to-server.sh` - Import Complet
**Script Bash pour remplacer complètement la base de données du serveur.**

**Fonctionnalités:**
- 🔄 Remplacement complet de la base serveur
- 💾 Sauvegarde automatique avant import
- 🔍 Vérification d'intégrité
- 🚀 Redémarrage automatique du serveur
- ⚡ Gestion des erreurs robuste

**Usage:**
```bash
# Import simple
./import-database-to-server.sh

# Import avec sauvegarde
./import-database-to-server.sh --backup

# Import forcé (sans confirmation)
./import-database-to-server.sh --force

# Import forcé avec sauvegarde
./import-database-to-server.sh --force --backup
```

**Options:**
- `--force` : Pas de confirmation, remplace directement
- `--backup` : Crée une sauvegarde de la base serveur avant import

### 3. `sync-database-to-server.cjs` - Synchronisation Sélective
**Script Node.js pour synchroniser des tables spécifiques.**

**Fonctionnalités:**
- 🎯 Synchronisation table par table
- 📊 Analyse détaillée des différences
- 🔄 Mode interactif ou automatique
- 📋 Comparaison des données en temps réel

**Usage:**
```bash
# Mode interactif
node sync-database-to-server.cjs

# Synchronisation automatique complète
node sync-database-to-server.cjs --auto

# Synchroniser des tables spécifiques
node sync-database-to-server.cjs --tables users,companies

# Afficher l'aide
node sync-database-to-server.cjs --help
```

## 📁 Structure des Sauvegardes

Tous les outils créent des sauvegardes dans le répertoire `database-backups/`:

```
database-backups/
├── server_backup_20241208_143022.db      # Sauvegarde complète du serveur
├── server_dump_20241208_143022.sql       # Dump SQL du serveur
├── local_export_20241208_143022.sql      # Export de la base locale
├── users_export_20241208_143022.sql      # Export table users
└── sync_users_20241208_143022.sql        # Script de synchronisation
```

## 🔧 Résolution des Problèmes Courants

### Erreur: "no such column: u.agent_id"
```bash
# Solution automatique via l'interface
./manage-database.sh
# Puis choisir l'option 5: "Réparer la colonne agent_id manquante"

# Ou directement:
ssh gjNCbjZ4HAb_sam@57-101961.ssh.hosting-ik.com "cd sites/beta.fusepoint.ch/server && node fix-agent-id.js"
```

### Erreur de Connexion SSH
```bash
# Tester la connexion
ssh gjNCbjZ4HAb_sam@57-101961.ssh.hosting-ik.com "echo 'Connexion OK'"

# Vérifier les clés SSH
ls -la ~/.ssh/
```

### Base de Données Corrompue
```bash
# Vérifier l'intégrité locale
sqlite3 server/database/fusepoint.db "PRAGMA integrity_check;"

# Vérifier l'intégrité serveur
ssh gjNCbjZ4HAb_sam@57-101961.ssh.hosting-ik.com "cd sites/beta.fusepoint.ch/server/database && sqlite3 fusepoint.db 'PRAGMA integrity_check;'"
```

### Serveur qui ne Redémarre Pas
```bash
# Vérifier le statut PM2
ssh gjNCbjZ4HAb_sam@57-101961.ssh.hosting-ik.com "cd sites/beta.fusepoint.ch && pm2 status"

# Redémarrer manuellement
ssh gjNCbjZ4HAb_sam@57-101961.ssh.hosting-ik.com "cd sites/beta.fusepoint.ch && pm2 restart all"

# Voir les logs
ssh gjNCbjZ4HAb_sam@57-101961.ssh.hosting-ik.com "cd sites/beta.fusepoint.ch && pm2 logs"
```

## 📊 Workflow Recommandé

### Pour un Premier Déploiement
1. **Analyser** les données avec `./manage-database.sh`
2. **Sauvegarder** avec l'option `--backup`
3. **Importer** avec `./import-database-to-server.sh --backup`
4. **Vérifier** le fonctionnement sur https://beta.fusepoint.ch

### Pour des Mises à Jour Régulières
1. **Comparer** les bases avec `./manage-database.sh`
2. **Synchroniser** sélectivement avec `node sync-database-to-server.cjs`
3. **Tester** les changements

### Pour des Corrections d'Urgence
1. **Identifier** le problème (colonnes manquantes, etc.)
2. **Réparer** avec les outils intégrés
3. **Vérifier** immédiatement

## 🔒 Sécurité et Bonnes Pratiques

### Avant Chaque Import
- ✅ Créer une sauvegarde avec `--backup`
- ✅ Vérifier l'intégrité de la base locale
- ✅ Tester la connexion SSH
- ✅ S'assurer que le serveur est accessible

### Après Chaque Import
- ✅ Vérifier l'intégrité de la base serveur
- ✅ Tester l'application web
- ✅ Vérifier les logs PM2
- ✅ Conserver les sauvegardes

### Gestion des Sauvegardes
- 📅 Nettoyer les anciennes sauvegardes régulièrement
- 💾 Conserver au moins 3 sauvegardes récentes
- 🔐 Sauvegarder les données critiques séparément

## 🆘 Support et Dépannage

### Commandes de Diagnostic
```bash
# État du serveur
ssh gjNCbjZ4HAb_sam@57-101961.ssh.hosting-ik.com "cd sites/beta.fusepoint.ch && pm2 status && pm2 logs --lines 20"

# Espace disque
ssh gjNCbjZ4HAb_sam@57-101961.ssh.hosting-ik.com "df -h"

# Processus en cours
ssh gjNCbjZ4HAb_sam@57-101961.ssh.hosting-ik.com "ps aux | grep node"
```

### Logs Importants
- **PM2 Logs**: `pm2 logs` sur le serveur
- **Logs d'Import**: Affichés en temps réel pendant l'exécution
- **Logs Système**: `/var/log/` sur le serveur

### Contacts d'Urgence
- **Serveur Web**: https://beta.fusepoint.ch
- **SSH**: gjNCbjZ4HAb_sam@57-101961.ssh.hosting-ik.com
- **Support Infomaniak**: Via le panel de contrôle

---

## 📝 Notes Techniques

### Configuration SSH
Les scripts utilisent la configuration SSH suivante:
- **Utilisateur**: `gjNCbjZ4HAb_sam`
- **Serveur**: `57-101961.ssh.hosting-ik.com`
- **Chemin**: `sites/beta.fusepoint.ch/server/database`

### Dépendances Requises
- `sqlite3` - Gestion des bases de données
- `ssh` / `scp` - Connexion et transfert
- `node` / `npm` - Scripts Node.js
- `pm2` - Gestion des processus (sur le serveur)

### Compatibilité
- ✅ macOS
- ✅ Linux
- ⚠️ Windows (avec WSL recommandé)

---

*Dernière mise à jour: Décembre 2024*