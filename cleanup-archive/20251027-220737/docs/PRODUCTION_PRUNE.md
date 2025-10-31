# Nettoyage de Projet pour Serveur de Production

Ce document explique comment supprimer les fichiers et dossiers non nécessaires au serveur de production.

## Commandes

- Dry-run (aucune suppression, affiche les éléments ciblés):
  - `npm run prune:prod:dry`
- Appliquer la purge (supprime réellement):
  - `npm run prune:prod`
- Appliquer avec archivage (déplace d'abord vers `cleanup-archive/<timestamp>/`):
  - `npm run prune:prod:archive`

## Configuration

Le nettoyage est piloté par `prune.config.json` à la racine du projet. Modifiez ce fichier pour ajuster:

- `directories`: dossiers à supprimer (ex: `docs`, `.vscode`, `tests`)
- `files`: fichiers à supprimer (ex: pages de debug)
- `server_patterns`: patterns ciblant des fichiers dans `server/` (ex: `server/debug-*.js`)

## Précautions

- Exécutez d'abord en dry-run pour valider les éléments ciblés.
- Utilisez l'option `--archive` pour conserver une copie de sécurité.
- Vérifiez que le frontend est bien construit (`npm run build`) et que l'API fonctionne avant de purger.