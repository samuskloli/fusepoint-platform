# Déploiement production — fusepoint.ch

Ce guide prépare l’installation sur un nouveau serveur (Infomaniak ou équivalent) pour le domaine `fusepoint.ch`.

## Prérequis
- Node.js LTS (>= 18) et `npm`
- MariaDB (>= 10.5) — base et utilisateur dédiés
- Accès SSH au serveur et dossier `/srv/customer/sites/fusepoint.ch`
- `pm2` installé globalement: `npm i -g pm2`

## Étapes

1) Cloner le repo dans `/srv/customer/sites/fusepoint.ch`:
```bash
cd /srv/customer/sites
git clone <REMOTE_URL> fusepoint.ch
cd fusepoint.ch
```

2) Créer les fichiers `.env` (racine et serveur):
- Copier `.env.example` vers `.env` à la racine et adapter:
  - `FRONTEND_URL=https://fusepoint.ch`
  - `API_BASE_URL=https://fusepoint.ch/api` (si API derrière le même domaine)
  - `ALLOWED_ORIGINS=https://fusepoint.ch,https://www.fusepoint.ch`
  - Secrets:
    - `JWT_SECRET=$(openssl rand -base64 32)`
    - `ENCRYPTION_KEY=$(openssl rand -hex 16)`
- Copier `server/.env.example` vers `server/.env` et adapter:
  - `NODE_ENV=production`
  - `FRONTEND_URL=https://fusepoint.ch`
  - `API_BASE_URL=https://fusepoint.ch/api` (ou `http://localhost:3000` si frontal proxie)
  - `ALLOWED_ORIGINS=https://fusepoint.ch,https://www.fusepoint.ch`
  - Configurer SMTP (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, etc.)
  - Générer `JWT_SECRET` et `ENCRYPTION_KEY` (voir ci-dessus)

3) Installer les dépendances et builder le frontend:
```bash
npm ci
npm run build
```

4) Préparer la base MariaDB:
```sql
CREATE DATABASE fusepoint_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER 'fusepoint'@'%' IDENTIFIED BY 'motdepassefort';
GRANT ALL PRIVILEGES ON fusepoint_db.* TO 'fusepoint'@'%';
FLUSH PRIVILEGES;
```
Mettre à jour `server/.env` avec `MARIADB_*`.

5) Démarrer avec PM2 (prod):
```bash
pm2 start ecosystem.prod.config.js
pm2 save
pm2 status
```

6) Vérifications santé:
```bash
curl -I http://localhost:8080/health
curl -i http://localhost:3000/health
```

7) Installer un administrateur (si nécessaire):
- Activer temporairement l’installation: mettre `INSTALL_ENABLED=true` dans `.env` (racine).
- Appeler `POST /api/install/create-admin` puis remettre `INSTALL_ENABLED=false`.

## Notes d’architecture
- `infomaniak-server.js` sert le build Vite sous `/app` et proxie `/api` vers `localhost:3000`.
- CORS: `ALLOWED_ORIGINS` doit inclure `https://fusepoint.ch` et `https://www.fusepoint.ch` côté frontend et backend.
- Logs PM2: générés sous `./logs/` dans le dossier du site.

## Commandes utiles
```bash
pm2 logs fusepoint-frontend --lines 100
pm2 logs fusepoint-api --lines 100
pm2 restart fusepoint-frontend
pm2 restart fusepoint-api
```

## Sécurité
- Ne jamais commiter les `.env`.
- Utiliser des secrets uniques par environnement.
- Vérifier que l’API ne répond pas aux origines non listées.