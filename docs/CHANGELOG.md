# CHANGELOG des déploiements Fusepoint

Ce fichier trace les déploiements effectués via `scripts/push-deploy.sh`.
Chaque entrée inclut la date/heure (UTC), la branche, le serveur, le chemin distant et
la liste des commits inclus.

Remarque: Les endpoints protégés (ex: `/api/health`, `/api/clients`) peuvent répondre `401` sans token d’authentification.
Cela est attendu et ne signifie pas un échec de déploiement.