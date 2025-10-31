# CHANGELOG des déploiements Fusepoint

Ce fichier trace les déploiements effectués via `scripts/push-deploy.sh`.
Chaque entrée inclut la date/heure (UTC), la branche, le serveur, le chemin distant et
la liste des commits inclus.

Remarque: Les endpoints protégés (ex: `/api/health`, `/api/clients`) peuvent répondre `401` sans token d’authentification.
Cela est attendu et ne signifie pas un échec de déploiement.

## 2025-10-31 — Déploiement production fusepoint.ch (origin/main)

Commits inclus:
- 17e6a8e — fix(frontend-assets): servir /app/assets depuis dist/assets avec fallback vers app/ pour éviter les 404 JSON et erreurs MIME; mise à jour script de déploiement pour copier les assets vers dist/ et app/
- 1d0f341 — fix(routing): servir le frontend depuis le backend (/, /app/* fallback); corrige chemins PM2 prod; ajoute scripts de déploiement et changelog

Changements appliqués:
- Backend Node (server/server.js):
  - Ajout du fallback global pour servir index.html à la racine et app/index.html pour les routes SPA (/app/*) en production.
  - Ajout d’un serveur statique prioritaire pour les assets compilés sous `dist/assets` (MIME correct: application/javascript, text/css), avec fallback vers `app/` pour le dev.
  - Maintien des exclusions pour ne pas réécrire les assets (`/app/assets/*`, favicon, manifest) dans les catch-all.
- Frontend et configuration:
  - Build Vite multi-entrée (index.html et app/index.html) avec base `/app/` en production.
  - Copie automatique des `.htaccess` vers `dist/.htaccess` et `dist/app/.htaccess` via plugin de build.
- Apache /.htaccess:
  - `.htaccess.remote` déployé à la racine du DOCROOT pour router `/app/*` vers `dist/app/index.html` et mapper `/app/assets/*` vers `dist/assets/*` côté Apache si nécessaire.
  - En-têtes de sécurité et cache pour assets; no-cache pour HTML.
- Scripts de déploiement:
  - `scripts/update-backend.exp`: reset sur `origin/main`, redémarrage API (pm2 si dispo), tests santé `/api/health` et `/api/clients` (peuvent renvoyer 401 sans token).
  - `scripts/deploy_remote.exp`: déploiement de `dist/index.html`, `dist/app/index.html`, `.htaccess` et des assets vers `/srv/customer/sites/fusepoint.ch/dist/assets` et `/srv/customer/sites/fusepoint.ch/app/assets`; tests HTTP automatisés (Content-Type des JS, statut de `/app/login`).

Vérifications post-déploiement:
- `/app/login` retourne 200 avec `Content-Type: text/html; charset=UTF-8`.
- Assets JS sous `/app/assets/*.js` retournent 200 avec `Content-Type: application/javascript; charset=UTF-8`.
- `/api/health` et `/api/clients` retournent 401 (attendu sans authentification).

Notes:
- PM2 n’est pas disponible sur l’hébergement Infomaniak (commandes `pm2` non trouvées). Le redémarrage de l’API se fait via les scripts existants ou par le gestionnaire d’hébergement.
- Les règles `.htaccess` garantissent que les fichiers statiques (CSS/JS) ne sont plus réécrits vers `index.html`, évitant les erreurs MIME.