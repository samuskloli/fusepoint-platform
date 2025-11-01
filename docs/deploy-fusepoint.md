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

## Réinstallation rapide (script)

Pour réinstaller entièrement l’application sur le serveur distant via SSH, utilisez le script prêt à l’emploi:

```bash
# Sur votre machine locale (dans le repo)
chmod +x scripts/reinstall-remote.sh
./scripts/reinstall-remote.sh <ssh_user> <ssh_host> \
  --path /srv/customer/sites/fusepoint.ch/fusepoint-platform \
  --branch main \
  --pm2-config ecosystem.prod.config.js
```

- Le script effectue: arrêt/suppression PM2, `git reset --hard origin/<branch>`, `npm ci` racine et `server/`, `npm run build`, redémarrage PM2 avec `ecosystem.prod.config.js`, et vérifications de santé.
- Assurez-vous que les fichiers `.env` (racine et `server/.env`) sont présents et correctement configurés.

## Sécurité
- Ne jamais commiter les `.env`.
- Utiliser des secrets uniques par environnement.
- Vérifier que l’API ne répond pas aux origines non listées.

### Politique de Sécurité de Contenu (CSP) et en-têtes Helmet

En production, le backend applique une CSP via Helmet. Vous pouvez autoriser des hôtes CDN par directive grâce aux variables d’environnement suivantes (listes séparées par des virgules):

- `CSP_CONNECT_SRC` — destinations réseau (fetch/XHR/WebSocket)
- `CSP_SCRIPT_SRC` — scripts (CDN)
- `CSP_STYLE_SRC` — styles (CSS/Google Fonts)
- `CSP_IMG_SRC` — images
- `CSP_FONT_SRC` — polices
- `CSP_FRAME_SRC` — frames/embeds (YouTube/Vimeo)

Exemple (server/.env):

```
NODE_ENV=production
ALLOWED_ORIGINS=https://fusepoint.ch,https://www.fusepoint.ch

CSP_CONNECT_SRC=https://api.openai.com,https://*.googleapis.com
CSP_SCRIPT_SRC=https://cdn.jsdelivr.net,https://unpkg.com,https://cdnjs.cloudflare.com
CSP_STYLE_SRC=https://fonts.googleapis.com,https://cdn.jsdelivr.net
CSP_IMG_SRC=https://images.unsplash.com,https://cdn.jsdelivr.net
CSP_FONT_SRC=https://fonts.gstatic.com,https://cdn.jsdelivr.net
CSP_FRAME_SRC=https://player.vimeo.com,https://www.youtube.com
```

Helmet active également:
- HSTS (HTTP Strict Transport Security) avec une durée d’environ 180 jours
- Referrer Policy configurée sur `strict-origin-when-cross-origin`

Note: En développement, la CSP est désactivée pour ne pas bloquer Vite/HMR.