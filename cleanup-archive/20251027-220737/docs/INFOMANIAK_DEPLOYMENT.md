# Déploiement Fusepoint Platform sur Infomaniak avec Node.js

## Vue d'ensemble

Ce guide explique comment déployer Fusepoint Platform sur Infomaniak en utilisant Node.js au lieu d'Apache pour servir le frontend.

## Architecture

- **Backend API**: Node.js/Express sur le port 3000
- **Frontend Server**: Node.js/Express sur le port 8080
- **Base de données**: SQLite (configurée automatiquement)
- **Gestion des processus**: PM2

## Fichiers de configuration

### 1. `infomaniak-server.js`
Serveur Express.js qui :
- Sert les fichiers statiques du frontend Vue.js
- Proxifie les requêtes `/api/*` vers le backend
- Gère les routes SPA (Single Page Application)
- Applique la sécurité et la compression

### 2. `deploy-infomaniak-nodejs.sh`
Script de déploiement qui :
- Installe les dépendances nécessaires
- Corrige les problèmes de build Vite
- Construit le frontend pour la production
- Configure PM2 pour la gestion des processus

### 3. `ecosystem.config.js`
Configuration PM2 pour gérer les deux serveurs :
- `fusepoint-api`: Backend API
- `fusepoint-frontend`: Serveur frontend

## Instructions de déploiement

### Étape 1: Préparation locale

```bash
# Installer les dépendances du serveur frontend
npm install

# Exécuter le script de déploiement
npm run deploy:infomaniak
```

### Étape 2: Transfert sur Infomaniak

1. Transférez tous les fichiers vers `/srv/customer/fusepoint-platform/`
2. Assurez-vous que le fichier `.env` est correctement configuré

### Étape 3: Configuration sur le serveur

```bash
# Se connecter au serveur Infomaniak
ssh votre-utilisateur@votre-serveur.infomaniak.com

# Aller dans le répertoire du projet
cd /srv/customer/fusepoint-platform

# Installer Node.js et npm si nécessaire
# (généralement déjà disponible sur Infomaniak)

# Installer les dépendances
npm install

# Démarrer les serveurs
./start-infomaniak.sh
```

### Étape 4: Configuration du domaine

Dans le panneau de contrôle Infomaniak :
1. Configurez votre domaine pour pointer vers le port 8080
2. Ou configurez un reverse proxy si nécessaire

## Gestion des processus avec PM2

### Commandes utiles

```bash
# Voir le statut des processus
pm2 status

# Voir les logs en temps réel
pm2 logs

# Redémarrer tous les processus
pm2 restart ecosystem.config.js

# Redémarrer un processus spécifique
pm2 restart fusepoint-frontend
pm2 restart fusepoint-api

# Arrêter tous les processus
pm2 stop ecosystem.config.js

# Monitoring en temps réel
pm2 monit

# Voir les logs d'un processus spécifique
pm2 logs fusepoint-frontend
pm2 logs fusepoint-api
```

## Structure des ports

- **Port 3000**: Backend API (interne)
- **Port 8080**: Frontend (accessible publiquement)

## Fichiers de logs

Les logs sont stockés dans le dossier `logs/` :
- `api-error.log`: Erreurs du backend
- `api-out.log`: Sortie standard du backend
- `frontend-error.log`: Erreurs du frontend
- `frontend-out.log`: Sortie standard du frontend

## Variables d'environnement importantes

```bash
# Dans votre fichier .env
NODE_ENV=production
PORT=3000
FRONTEND_PORT=8080
API_PORT=3000

# Configuration de la base de données
DB_TYPE=sqlite
DB_PATH=./database.sqlite

# Configuration SMTP Infomaniak
SMTP_HOST=mail.infomaniak.com
SMTP_PORT=587
SMTP_USER=votre-email@votre-domaine.com
SMTP_PASS=votre-mot-de-passe
```

## Dépannage

### Problème: Frontend non accessible
```bash
# Vérifier que le serveur frontend fonctionne
pm2 status
curl http://localhost:8080
```

### Problème: API non accessible
```bash
# Vérifier que l'API fonctionne
curl http://localhost:3000/api/health
```

### Problème: Erreur de build
```bash
# Nettoyer et reconstruire
rm -rf dist/ node_modules/.vite/
npm install
npm run build
```

### Problème: Base de données verrouillée
```bash
# Arrêter tous les processus
pm2 stop ecosystem.config.js

# Supprimer les fichiers de verrouillage
rm -f database.sqlite-wal database.sqlite-shm

# Redémarrer
pm2 start ecosystem.config.js
```

## Sécurité

Le serveur frontend inclut :
- Headers de sécurité (Helmet.js)
- Protection CORS
- Compression gzip
- Cache optimisé pour les assets statiques

## Support

Pour toute question ou problème :
1. Vérifiez les logs avec `pm2 logs`
2. Consultez la documentation Infomaniak
3. Vérifiez la configuration de votre fichier `.env`

## Scripts npm disponibles

```bash
# Démarrer le serveur frontend localement
npm run start:frontend

# Déployer sur Infomaniak
npm run deploy:infomaniak

# Démarrer les serveurs sur Infomaniak
npm run start:infomaniak
```