# 🚀 Workflow de Développement - Fusepoint Platform

Ce guide vous explique comment développer et déployer en toute sécurité sur la plateforme Fusepoint.

## 📋 Prérequis

- Node.js 18+ installé
- Git configuré avec vos identifiants
- Accès SSH au serveur de production (si déploiement)
- Variables d'environnement configurées (`.env`)

## 🛠️ Scripts Disponibles

### 1. Script de Workflow de Développement (`dev-workflow.sh`)

Script principal pour le développement quotidien :

```bash
# Démarrer l'environnement de développement
./dev-workflow.sh start

# Voir l'état des serveurs
./dev-workflow.sh status

# Arrêter l'environnement
./dev-workflow.sh stop

# Redémarrer l'environnement
./dev-workflow.sh restart

# Créer une nouvelle branche de feature
./dev-workflow.sh new

# Commiter les modifications
./dev-workflow.sh commit

# Pousser vers GitHub
./dev-workflow.sh push

# Créer une sauvegarde locale
./dev-workflow.sh backup

# Déployer vers le serveur
./dev-workflow.sh deploy [branche]
```

### 2. Script de Déploiement (`deploy-to-server.sh`)

Script pour déployer vers le serveur de production :

```bash
# Déployer la branche main
./deploy-to-server.sh main

# Déployer une branche spécifique
./deploy-to-server.sh feature/ma-nouvelle-fonctionnalite
```

## 🔄 Workflow Recommandé

### 1. Démarrage d'une Nouvelle Fonctionnalité

```bash
# 1. Créer une nouvelle branche
./dev-workflow.sh new
# Choisir le type (feature/fix/hotfix/refactor)
# Donner un nom descriptif

# 2. Démarrer l'environnement de développement
./dev-workflow.sh start

# 3. Développer votre fonctionnalité
# Modifier les fichiers nécessaires

# 4. Tester localement
# Backend: http://localhost:3000
# Frontend: http://localhost:8080
# API Health: http://localhost:3000/api/health
```

### 2. Sauvegarde et Commit

```bash
# 1. Vérifier l'état
./dev-workflow.sh status

# 2. Créer une sauvegarde (optionnel)
./dev-workflow.sh backup

# 3. Commiter les modifications
./dev-workflow.sh commit
# Entrer un message de commit descriptif

# 4. Pousser vers GitHub
./dev-workflow.sh push
```

### 3. Déploiement vers Production

```bash
# Option 1: Via le script de workflow
./dev-workflow.sh deploy main

# Option 2: Via le script de déploiement direct
./deploy-to-server.sh main
```

## 🌿 Stratégie de Branches

### Types de Branches

- **`main`** : Branche principale (production)
- **`dev/local-setup`** : Configuration locale (déjà créée)
- **`feature/nom-fonctionnalite`** : Nouvelles fonctionnalités
- **`fix/nom-correction`** : Corrections de bugs
- **`hotfix/nom-correction-urgente`** : Corrections urgentes
- **`refactor/nom-refactorisation`** : Refactorisations

### Workflow Git

1. **Développement** : Créer une branche depuis `main`
2. **Test** : Tester localement
3. **Commit** : Commiter avec des messages clairs
4. **Push** : Pousser vers GitHub
5. **Merge** : Fusionner dans `main` (via PR si équipe)
6. **Deploy** : Déployer vers production

## 🔧 Configuration Locale

### Variables d'Environnement

Assurez-vous d'avoir les fichiers suivants :

- **`.env`** (racine) : Configuration frontend
- **`server/.env`** : Configuration backend

### Ports par Défaut

- **Backend** : `3000`
- **Frontend** : `8080`

### Logs de Développement

Les logs sont stockés dans le dossier `logs/` :

```bash
# Voir les logs du backend
tail -f logs/backend-dev.log

# Voir les logs du frontend
tail -f logs/frontend-dev.log
```

## 🛡️ Sécurité et Bonnes Pratiques

### Avant Chaque Déploiement

1. **Sauvegarde automatique** : Le script crée une sauvegarde
2. **Tests locaux** : Vérifiez que tout fonctionne
3. **Variables d'environnement** : Ne jamais commiter les secrets
4. **Base de données** : Sauvegarde automatique avant déploiement

### Gestion des Erreurs

- **Port occupé** : Le script tue automatiquement les processus
- **Échec de déploiement** : Restauration automatique depuis la sauvegarde
- **Problèmes SQLite** : Nettoyage automatique des verrous

## 🚨 Résolution de Problèmes

### Serveurs ne Démarrent Pas

```bash
# Vérifier les ports
lsof -i :3000
lsof -i :8080

# Arrêter tous les processus
./dev-workflow.sh stop

# Redémarrer
./dev-workflow.sh start
```

### Problèmes de Base de Données

```bash
# Nettoyer les verrous SQLite
rm -f server/database/*.db-wal server/database/*.db-shm

# Redémarrer le backend
./dev-workflow.sh restart
```

### Problèmes Git

```bash
# Voir l'état
git status

# Annuler les modifications non commitées
git checkout -- .

# Revenir à la dernière version stable
git reset --hard HEAD
```

## 📞 Support

En cas de problème :

1. Vérifiez les logs : `tail -f logs/*.log`
2. Consultez ce guide
3. Vérifiez l'état : `./dev-workflow.sh status`
4. Créez une sauvegarde : `./dev-workflow.sh backup`

## 🎯 Exemples Pratiques

### Développer une Nouvelle Page

```bash
# 1. Nouvelle branche
./dev-workflow.sh new
# Type: 1 (feature)
# Nom: nouvelle-page-contact

# 2. Démarrer l'environnement
./dev-workflow.sh start

# 3. Développer (modifier les fichiers)
# ...

# 4. Tester sur http://localhost:8080

# 5. Commiter
./dev-workflow.sh commit
# Message: "feat: ajout page de contact avec formulaire"

# 6. Pousser
./dev-workflow.sh push

# 7. Déployer
./dev-workflow.sh deploy feature/nouvelle-page-contact
```

### Corriger un Bug

```bash
# 1. Nouvelle branche
./dev-workflow.sh new
# Type: 2 (fix)
# Nom: correction-formulaire-login

# 2. Développer la correction
# ...

# 3. Tester
./dev-workflow.sh start

# 4. Commiter et déployer
./dev-workflow.sh commit
./dev-workflow.sh push
./dev-workflow.sh deploy fix/correction-formulaire-login
```

Ce workflow vous permet de développer en toute sécurité avec des sauvegardes automatiques et un déploiement sécurisé ! 🚀