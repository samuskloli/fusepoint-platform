# Installation Propre sur Infomaniak - Guide Complet

## 🎯 Objectif
Ce guide vous accompagne pour faire une installation complètement propre de Fusepoint Platform sur votre serveur Infomaniak, en supprimant tous les anciens fichiers.

## ⚠️ Avertissements Importants

- **SAUVEGARDE**: Ce processus supprime TOUS les fichiers existants
- **DONNÉES**: Vos données actuelles seront perdues sans sauvegarde
- **TEMPS D'ARRÊT**: Votre site sera indisponible pendant l'installation

## 📋 Prérequis

- Accès SSH à votre serveur Infomaniak
- Node.js installé sur le serveur (généralement déjà disponible)
- Vos clés et configurations (SMTP, OpenAI, etc.)

## 🚀 Étapes d'Installation

### Étape 1: Préparation Locale

```bash
# Sur votre machine locale
cd /Users/oliveirasamuel/Plateforme\ Marketing\ Fusepoint/fusepoint-platform

# S'assurer que tout est à jour
git pull origin main

# Préparer les fichiers pour le transfert
npm run deploy:infomaniak
```

### Étape 2: Connexion au Serveur

```bash
# Se connecter à votre serveur Infomaniak
ssh votre-utilisateur@votre-serveur.infomaniak.com

# Aller dans le répertoire de déploiement
cd /srv/customer/fusepoint-platform
```

### Étape 3: Nettoyage Complet (ATTENTION!)

```bash
# Télécharger le script de nettoyage
wget https://raw.githubusercontent.com/samuskloli/fusepoint-platform/main/clean-infomaniak-server.sh

# Ou si vous avez déjà les fichiers:
chmod +x clean-infomaniak-server.sh

# Exécuter le nettoyage (ATTENTION: supprime tout!)
./clean-infomaniak-server.sh
```

**Le script va:**
- Demander confirmation
- Proposer une sauvegarde des fichiers importants
- Arrêter tous les processus Node.js
- Supprimer tous les fichiers
- Nettoyer les caches
- Préparer un répertoire propre

### Étape 4: Transfert des Nouveaux Fichiers

#### Option A: Via Git (Recommandé)

```bash
# Dans le répertoire propre
cd /srv/customer/fusepoint-platform

# Cloner le projet
git clone https://github.com/samuskloli/fusepoint-platform.git .

# Ou si le dossier .git existe déjà:
git fetch origin
git reset --hard origin/main
```

#### Option B: Via SCP/SFTP

```bash
# Sur votre machine locale
scp -r * votre-utilisateur@votre-serveur.infomaniak.com:/srv/customer/fusepoint-platform/
```

### Étape 5: Configuration de l'Environnement

```bash
# Sur le serveur
cd /srv/customer/fusepoint-platform

# Créer le fichier .env
cp .env.example .env
nano .env
```

**Configurez votre .env avec vos vraies valeurs:**

```env
# Base de données
DB_TYPE=sqlite
DB_PATH=./database.sqlite

# Serveur
NODE_ENV=production
PORT=3000
FRONTEND_PORT=8080
BACKEND_URL=https://beta.fusepoint.ch
FRONTEND_URL=https://beta.fusepoint.ch

# Sécurité (générez des clés sécurisées!)
JWT_SECRET=votre-cle-jwt-securisee
ENCRYPTION_KEY=votre-cle-chiffrement-32-caracteres
SESSION_SECRET=votre-cle-session-securisee

# SMTP Infomaniak
SMTP_HOST=mail.infomaniak.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@votre-domaine.com
SMTP_PASS=votre-mot-de-passe-email
SMTP_FROM=votre-email@votre-domaine.com

# OpenAI
OPENAI_API_KEY=votre-cle-openai

# OAuth Facebook
FACEBOOK_APP_ID=votre-app-id
FACEBOOK_APP_SECRET=votre-app-secret
```

### Étape 6: Installation et Déploiement

```bash
# Installer les dépendances
npm install

# Exécuter le script de déploiement
chmod +x deploy-infomaniak-nodejs.sh
./deploy-infomaniak-nodejs.sh
```

### Étape 7: Démarrage des Serveurs

```bash
# Démarrer avec PM2
chmod +x start-infomaniak.sh
./start-infomaniak.sh

# Vérifier le statut
pm2 status
pm2 logs
```

### Étape 8: Configuration du Domaine

1. **Dans le panneau Infomaniak:**
   - Configurez votre domaine pour pointer vers le port 8080
   - Ou configurez un reverse proxy

2. **Test de fonctionnement:**
   ```bash
   # Tester l'API
   curl http://localhost:3000/api/health
   
   # Tester le frontend
   curl http://localhost:8080
   ```

## 🔧 Commandes de Gestion

### Surveillance
```bash
# Voir les logs en temps réel
pm2 logs

# Monitoring
pm2 monit

# Statut des processus
pm2 status
```

### Redémarrage
```bash
# Redémarrer tout
pm2 restart ecosystem.config.js

# Redémarrer un service spécifique
pm2 restart fusepoint-frontend
pm2 restart fusepoint-api
```

### Arrêt
```bash
# Arrêter tout
pm2 stop ecosystem.config.js

# Supprimer les processus
pm2 delete ecosystem.config.js
```

## 🛠️ Dépannage

### Problème: Processus qui ne s'arrêtent pas
```bash
# Forcer l'arrêt
pkill -f node
pm2 kill
```

### Problème: Permissions
```bash
# Corriger les permissions
chmod -R 755 /srv/customer/fusepoint-platform
chown -R votre-utilisateur:votre-groupe /srv/customer/fusepoint-platform
```

### Problème: Base de données verrouillée
```bash
# Supprimer les fichiers de verrouillage
rm -f database.sqlite-wal database.sqlite-shm
```

### Problème: Build qui échoue
```bash
# Nettoyer et reconstruire
rm -rf node_modules dist
npm cache clean --force
npm install
npm run build
```

## 📊 Vérification Post-Installation

### Tests de Fonctionnement

1. **API Backend:**
   ```bash
   curl https://beta.fusepoint.ch/api/health
   ```

2. **Frontend:**
   ```bash
   curl https://beta.fusepoint.ch
   ```

3. **Base de données:**
   - Vérifiez que les tables sont créées
   - Testez la connexion

4. **Logs:**
   ```bash
   tail -f logs/api-combined.log
   tail -f logs/frontend-combined.log
   ```

## 🔒 Sécurité Post-Installation

1. **Changez tous les mots de passe par défaut**
2. **Générez de nouvelles clés JWT et de chiffrement**
3. **Configurez les sauvegardes automatiques**
4. **Activez la surveillance des logs**

## 📞 Support

En cas de problème:
1. Vérifiez les logs: `pm2 logs`
2. Vérifiez le statut: `pm2 status`
3. Consultez ce guide
4. Vérifiez la configuration `.env`

## 🎉 Installation Terminée!

Votre Fusepoint Platform est maintenant installé proprement sur Infomaniak avec:
- ✅ Serveur backend sur le port 3000
- ✅ Serveur frontend sur le port 8080
- ✅ Base de données SQLite configurée
- ✅ Gestion des processus avec PM2
- ✅ Logs centralisés
- ✅ Configuration de sécurité

Accédez à votre plateforme: **https://beta.fusepoint.ch**