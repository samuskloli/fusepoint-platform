# 🔧 Commandes Administratives Fusepoint

Ce document décrit les commandes administratives disponibles pour gérer la plateforme Fusepoint.

## 🚀 Démarrage Rapide

### Démarrer tous les serveurs
```bash
./start-all-servers.sh
```

### Utiliser les commandes administratives
```bash
./admin-commands.sh [commande]
```

## 📋 Commandes Disponibles

### 📊 `status` - Statut des serveurs
Affiche l'état actuel des serveurs (backend et frontend)
```bash
./admin-commands.sh status
```

### 🔄 `restart` - Redémarrer les serveurs
Arrête et redémarre tous les serveurs
```bash
./admin-commands.sh restart
```

### 🛑 `stop` - Arrêter les serveurs
Arrête tous les serveurs en cours d'exécution
```bash
./admin-commands.sh stop
```

### 📋 `logs` - Afficher les logs
Affiche les 20 dernières lignes des logs de chaque service
```bash
./admin-commands.sh logs
```

### 🗄️ `db-backup` - Sauvegarder la base de données
Crée une sauvegarde horodatée de la base de données
```bash
./admin-commands.sh db-backup
```

### 🧹 `cleanup` - Nettoyer les fichiers temporaires
Supprime les anciens logs et fichiers temporaires
```bash
./admin-commands.sh cleanup
```

### 👥 `clients` - Afficher les clients
Affiche tous les clients présents en base de données
```bash
./admin-commands.sh clients
```

### 👥 `create-test` - Créer des clients de test
Ajoute des clients de test à la base de données
```bash
./admin-commands.sh create-test
```

### 🏥 `health` - Vérifier la santé du système
Vérifie l'état général du système (Node.js, npm, dépendances, bases de données, etc.)
```bash
./admin-commands.sh health
```

### ❓ `help` - Afficher l'aide
Affiche la liste de toutes les commandes disponibles
```bash
./admin-commands.sh help
```

## 🎯 Commandes Directes

Certaines commandes peuvent aussi être exécutées directement :

### Gestion des clients
```bash
# Voir tous les clients
node check-clients.cjs

# Créer des clients de test
node create-test-clients.cjs
```

## 📁 Structure des Logs

Les logs sont stockés dans le répertoire `logs/` :
- `backend.log` - Logs du serveur backend
- `frontend.log` - Logs du serveur frontend
- `system.log` - Logs système (si disponible)
- `backend.pid` - PID du processus backend
- `frontend.pid` - PID du processus frontend

## 🗄️ Sauvegardes

Les sauvegardes de la base de données sont stockées dans le répertoire `backups/` avec un horodatage :
- Format : `fusepoint_backup_YYYYMMDD_HHMMSS.db`
- Exemple : `fusepoint_backup_20241220_143022.db`

## 🌐 URLs d'Accès

- **Backend** : http://localhost:3002
- **Frontend** : http://localhost:5173

## 🔧 Dépannage

### Problème de ports occupés
```bash
# Vérifier le statut
./admin-commands.sh status

# Arrêter tous les serveurs
./admin-commands.sh stop

# Redémarrer
./admin-commands.sh restart
```

### Problème de dépendances
```bash
# Vérifier la santé du système
./admin-commands.sh health

# Installer les dépendances si nécessaire
npm install
cd server && npm install
```

### Problème de base de données
```bash
# Sauvegarder avant toute manipulation
./admin-commands.sh db-backup

# Vérifier les clients
./admin-commands.sh clients
```

### Nettoyage en cas de problème
```bash
# Nettoyer les fichiers temporaires
./admin-commands.sh cleanup

# Arrêter tous les processus
./admin-commands.sh stop

# Redémarrer proprement
./start-all-servers.sh
```

## 📝 Notes

- Toutes les commandes doivent être exécutées depuis le répertoire racine du projet
- Les scripts nécessitent Node.js et npm installés
- Les permissions d'exécution sont automatiquement définies lors de la création
- Les logs sont automatiquement nettoyés après 7 jours
- Les sauvegardes doivent être gérées manuellement (pas de suppression automatique)