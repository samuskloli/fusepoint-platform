# Scripts d'Installation Fusepoint pour Infomaniak

Ce document décrit les scripts d'installation et de déploiement automatiques pour la plateforme Fusepoint sur les serveurs Infomaniak.

## 📋 Scripts Disponibles

### 1. `deploy-from-github.sh` - Déploiement Complet depuis GitHub
**Usage recommandé pour une nouvelle installation**

```bash
./deploy-from-github.sh
```

**Fonctionnalités :**
- Clone automatiquement le projet depuis GitHub
- Sauvegarde l'installation existante
- Configure automatiquement l'environnement .env
- Installe toutes les dépendances
- Construit le frontend
- Configure Apache (.htaccess)
- Résout les problèmes SQLite BUSY
- Démarre le serveur sans PM2
- Crée les scripts de gestion

**Prérequis :**
- Token d'accès GitHub personnel
- Node.js 18+
- npm
- git

### 2. `install-infomaniak.sh` - Installation Locale
**Usage pour une installation depuis un code source déjà présent**

```bash
./install-infomaniak.sh
```

**Fonctionnalités :**
- Installation complète depuis le code source local
- Vérification des prérequis
- Gestion des processus Node.js
- Nettoyage des verrous SQLite
- Test de la base de données
- Configuration Apache
- Création des scripts de gestion

### 3. `fix-sqlite-and-start.sh` - Résolution Rapide et Démarrage
**Usage pour résoudre les problèmes SQLite BUSY et redémarrer**

```bash
./fix-sqlite-and-start.sh
```

**Fonctionnalités :**
- Arrêt propre de tous les processus Node.js
- Nettoyage complet des verrous SQLite
- Libération du port 3000
- Démarrage sécurisé du serveur
- Vérification du statut

## 🚀 Guide d'Installation Rapide

### Nouvelle Installation (Recommandé)

1. **Connectez-vous à votre serveur Infomaniak :**
   ```bash
   ssh votre_utilisateur@votre_serveur.infomaniak.com
   cd sites/beta.fusepoint.ch
   ```

2. **Téléchargez et exécutez le script de déploiement :**
   ```bash
   curl -O https://raw.githubusercontent.com/samuskl/fusepoint-platform/main/deploy-from-github.sh
   chmod +x deploy-from-github.sh
   ./deploy-from-github.sh
   ```

3. **Suivez les instructions :**
   - Entrez votre token GitHub quand demandé
   - Confirmez les configurations
   - Attendez la fin de l'installation

### Installation depuis Code Source Existant

1. **Si vous avez déjà le code source :**
   ```bash
   cd /path/to/fusepoint-platform
   ./install-infomaniak.sh
   ```

### Résolution de Problèmes SQLite BUSY

1. **En cas d'erreur SQLite BUSY :**
   ```bash
   ./fix-sqlite-and-start.sh
   ```

## 🔧 Configuration Automatique

### Fichier .env Généré
Les scripts créent automatiquement un fichier `.env` avec :
- Configuration base de données MySQL Infomaniak
- URLs pour beta.fusepoint.ch
- Configuration SMTP Infomaniak
- Clés de sécurité
- Paramètres OAuth Facebook/Instagram
- Configuration de production

### Configuration Apache
Création automatique du fichier `.htaccess` avec :
- Redirection HTTPS
- Proxy API vers port 3000
- Gestion des fichiers statiques
- Headers de sécurité
- Cache des assets

## 📁 Structure Créée

```
sites/beta.fusepoint.ch/
├── .htaccess                 # Configuration Apache
├── server.pid                # PID du serveur
├── restart.sh               # Script de redémarrage rapide
├── manage-server.sh         # Script de gestion complet
├── logs/
│   └── server.log          # Logs du serveur
├── server/
│   ├── .env                # Configuration environnement
│   ├── server.js           # Serveur Node.js
│   └── database/           # Base de données SQLite
└── dist/                   # Frontend construit
```

## 🛠️ Scripts de Gestion Créés

### `manage-server.sh`
```bash
./manage-server.sh start     # Démarrer le serveur
./manage-server.sh stop      # Arrêter le serveur
./manage-server.sh restart   # Redémarrer le serveur
./manage-server.sh status    # Voir le statut
./manage-server.sh logs      # Voir les logs en temps réel
./manage-server.sh test      # Tester l'API
```

### `restart.sh`
```bash
./restart.sh                 # Redémarrage rapide
```

## 🔍 Résolution de Problèmes

### Erreur SQLite BUSY
```bash
# Solution automatique
./fix-sqlite-and-start.sh

# Solution manuelle
pkill -f "node.*server.js"
find server/database -name "*.db-wal" -delete
find server/database -name "*.db-shm" -delete
find server/database -name "*.db-journal" -delete
./restart.sh
```

### Port 3000 Occupé
```bash
# Libérer le port
lsof -ti:3000 | xargs kill -9
./restart.sh
```

### Serveur ne Démarre Pas
```bash
# Vérifier les logs
tail -f logs/server.log

# Vérifier la configuration
cat server/.env

# Redémarrage complet
./fix-sqlite-and-start.sh
```

## 📊 Surveillance

### Vérifier le Statut
```bash
# Statut du serveur
./manage-server.sh status

# Test de l'API
curl https://beta.fusepoint.ch/api/health

# Processus en cours
ps aux | grep node
```

### Logs
```bash
# Logs en temps réel
tail -f logs/server.log

# Dernières erreurs
tail -50 logs/server.log | grep -i error

# Logs du jour
grep "$(date +%Y-%m-%d)" logs/server.log
```

## 🔒 Sécurité

### Bonnes Pratiques
- Les scripts nettoient automatiquement l'historique Git
- Les tokens GitHub ne sont pas sauvegardés
- Configuration HTTPS forcée
- Headers de sécurité automatiques
- Permissions de fichiers appropriées

### Sauvegarde Automatique
Le script `deploy-from-github.sh` crée automatiquement une sauvegarde de l'installation existante dans :
```
$HOME/backup-YYYYMMDD-HHMMSS/
```

## 🆘 Support

### Commandes de Diagnostic
```bash
# Informations système
node --version
npm --version
whoami
pwd

# État du serveur
./manage-server.sh status
curl -I https://beta.fusepoint.ch

# Espace disque
df -h
du -sh .
```

### Logs Importants
- `logs/server.log` - Logs du serveur Node.js
- `/var/log/apache2/error.log` - Logs Apache (si accessible)
- `~/.npm/_logs/` - Logs npm

## 📞 Contact

En cas de problème persistant :
1. Vérifiez les logs : `tail -f logs/server.log`
2. Exécutez le diagnostic : `./manage-server.sh status`
3. Tentez une réinstallation : `./deploy-from-github.sh`
4. Contactez le support avec les logs d'erreur

---

**Note :** Ces scripts sont spécialement conçus pour les serveurs Infomaniak avec accès uniquement au port 3000. Ils résolvent automatiquement les problèmes courants comme SQLite BUSY et la gestion des processus sans PM2.