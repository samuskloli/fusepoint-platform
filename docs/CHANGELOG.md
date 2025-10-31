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
- Les règles `.htaccess` garantissent que les fichiers statiques (CSS/JS) ne sont plus réécrits vers `index.html`, évitant les erreurs MIME.## Déploiement 2025-10-31T22:58:24Z
Serveur: 57-104359.ssh.hosting-ik.com
Branche: main
Chemin distant: /srv/customer/sites/fusepoint.ch

Commits inclus:
- 0415afd chore(deploy): envoyer toutes les mises à jour locales (frontend DnD, corrections widgets, scripts et backend) (Samuel Oliveira)
- c9799fe fix(agent): make getAgentClients resilient to remote DB schema (conditional joins and order by fallback) (Samuel Oliveira)
- 084eac4 docs(changelog): ajouter entrée détaillée pour le déploiement du 2025-10-31 (fix routing SPA, correctifs MIME des assets, scripts de déploiement) (Samuel Oliveira)
- 17e6a8e fix(frontend-assets): servir /app/assets depuis dist/assets avec fallback vers app/ pour éviter les 404 JSON et erreurs MIME; mise à jour script de déploiement pour copier les assets vers dist/ et app/ (Samuel Oliveira)
- 1d0f341 fix(routing): servir le frontend depuis le backend (/, /app/* fallback); corrige chemins PM2 prod; ajoute scripts de déploiement et changelog (Samuel Oliveira)
- d654f3a 🚀 Préparation déploiement: correction bug redirection LinkPoints + nettoyage code (Samuel Oliveira)
- 0972c72 chore(prod): ajouter PM2 ecosystem pour fusepoint.ch, doc de déploiement, mise à jour des .env.example et ajustements CORS/login (Samuel Oliveira)
- 61532be Security: remove VAPID keys file; ignore and provide example (Samuel Oliveira)
- 4ae3f0c Sync: push complet de tous les changements en cours (serveur, scripts, config, vues) (Samuel Oliveira)
- 041d4a0 Landing mobile: marges/espacements sections QR & Projets, fix débordement texte et conteneurs anim responsives (Samuel Oliveira)

## Déploiement 2025-10-31T23:02:40Z
Serveur: 57-104359.ssh.hosting-ik.com
Branche: main
Chemin distant: /srv/customer/sites/fusepoint.ch

Commits inclus:
- 55ccde4 chore(deploy): pousser toutes les mises à jour locales (modale widgets, sélection multiple, DnD, corrections UI/serveur) (Samuel Oliveira)
- b3dc70b chore(deploy): envoyer toutes les mises à jour locales (frontend DnD, corrections widgets, scripts et backend) (Samuel Oliveira)
- d65408d fix(agent): make getAgentClients resilient to remote DB schema (conditional joins and order by fallback) (Samuel Oliveira)
- 6cbfc7c docs(changelog): ajouter entrée détaillée pour le déploiement du 2025-10-31 (fix routing SPA, correctifs MIME des assets, scripts de déploiement) (Samuel Oliveira)
- 1874bfc fix(frontend-assets): servir /app/assets depuis dist/assets avec fallback vers app/ pour éviter les 404 JSON et erreurs MIME; mise à jour script de déploiement pour copier les assets vers dist/ et app/ (Samuel Oliveira)
- edce426 fix(routing): servir le frontend depuis le backend (/, /app/* fallback); corrige chemins PM2 prod; ajoute scripts de déploiement et changelog (Samuel Oliveira)
- d683d3b 🚀 Préparation déploiement: correction bug redirection LinkPoints + nettoyage code (Samuel Oliveira)
- bf6ba08 chore(prod): ajouter PM2 ecosystem pour fusepoint.ch, doc de déploiement, mise à jour des .env.example et ajustements CORS/login (Samuel Oliveira)
- d523dd4 Security: remove VAPID keys file; ignore and provide example (Samuel Oliveira)
- d914039 Sync: push complet de tous les changements en cours (serveur, scripts, config, vues) (Samuel Oliveira)
- 3c0fd56 Landing mobile: marges/espacements sections QR & Projets, fix débordement texte et conteneurs anim responsives (Samuel Oliveira)
- 31b9069 chore(repo): sync remaining changes; stop tracking .env.development; ignore symlinked public uploads/backup_redirects (Samuel Oliveira)
- 7e81695 feat(beta): add first/last name; company optional; update SuperAdmin table (Samuel Oliveira)
- 61dd10d docs: add remote server installation and update scripts (Samuel Oliveira)
- 16fae8b Refactor: ClientStatusDemo migrated to RoleLayout; remove AgentSidebar usage (Samuel Oliveira)
- e1b3dca Cleanup: Notifications via RoleLayout; .gitignore tmp/uploads; untrack temp; remove obsolete AgentSidebar (Samuel Oliveira)
- f04f568 Snapshot: sauvegarde complète + Librairie Widgets intégrée (menu latéral unifié); correction ProjectTemplatesManagement et SVG (Fusepoint Dev)
- 5b994eb Nettoyage du projet: suppression des fichiers temporaires et de test (Samuel Oliveira)
- ad1e5d6 Mise à jour complète de la plateforme Fusepoint - Correction suppression projets et améliorations UI/UX (Samuel Oliveira)
- 9a78ed3 🔒 SÉCURITÉ: Suppression des fichiers avec mots de passe du versioning (Samuel Oliveira)
- 16aaa66 ✨ Design & Documentation: Mise à jour professionnelle (Samuel Oliveira)
- bc75add Update .env.development (samuskloli)

