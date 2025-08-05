# 🗄️ Accès à phpMyAdmin - Base de données MariaDB Fusepoint

## 🚀 Accès rapide

**URL :** http://localhost:8083

## 🔐 Informations de connexion

- **Serveur :** localhost
- **Nom d'utilisateur :** oliveirasamuel
- **Mot de passe :** FusepointDB2025!
- **Base de données :** fusepoint_db

## 📋 Services en cours d'exécution

✅ **Backend Fusepoint :** http://localhost:3003  
✅ **Frontend Fusepoint :** http://localhost:5173  
✅ **phpMyAdmin :** http://localhost:8083  
✅ **MariaDB :** localhost:3306  

## 🛠️ Commandes utiles

### Redémarrer phpMyAdmin
```bash
# Arrêter le serveur phpMyAdmin actuel
kill $(lsof -ti:8083)

# Redémarrer phpMyAdmin avec PHP 8.1 (recommandé)
/opt/homebrew/opt/php@8.1/bin/php -c /Users/oliveirasamuel/Plateforme\ Marketing\ Fusepoint/fusepoint-platform/php-temp.ini -S localhost:8083 -t /opt/homebrew/share/phpmyadmin
```

### Vérifier les services
```bash
# Vérifier les services Homebrew
brew services list

# Vérifier MariaDB
mysql -u oliveirasamuel -p -h localhost fusepoint_db
```

### Arrêter tous les services
```bash
# Arrêter phpMyAdmin
kill $(lsof -ti:8083)

# Arrêter les services Homebrew
brew services stop httpd
brew services stop php
brew services stop mariadb
```

## 📊 Tables principales dans fusepoint_db

- `users` - Utilisateurs de la plateforme
- `companies` - Entreprises clientes
- `agent_clients` - Assignations agent-client
- `accompagnement` - Données d'accompagnement
- `notifications` - Système de notifications
- `prestataire_invitations` - Invitations prestataires

## 🔧 Dépannage

### Erreurs de dépréciation PHP
**Problème :** Messages d'erreur "Deprecated: Implicitly marking parameter as nullable"

**Solution :** Utiliser PHP 8.1 au lieu de PHP 8.4
```bash
# Installer PHP 8.1 si pas déjà fait
brew install php@8.1

# Utiliser PHP 8.1 avec configuration personnalisée
/opt/homebrew/opt/php@8.1/bin/php -c /Users/oliveirasamuel/Plateforme\ Marketing\ Fusepoint/fusepoint-platform/php-temp.ini -S localhost:8083 -t /opt/homebrew/share/phpmyadmin
```

### Problème de connexion à MariaDB
```bash
# Vérifier que MariaDB est démarré
brew services start mariadb

# Tester la connexion
mysql -u oliveirasamuel -p -h localhost
```

### Erreur 403 ou 404 sur phpMyAdmin
```bash
# Vérifier les permissions
ls -la /opt/homebrew/share/phpmyadmin/

# Redémarrer PHP
brew services restart php
```

### Port 8083 déjà utilisé
```bash
# Trouver le processus utilisant le port
lsof -ti:8083

# Arrêter le processus
kill $(lsof -ti:8083)

# Utiliser un autre port
/opt/homebrew/opt/php@8.1/bin/php -c /Users/oliveirasamuel/Plateforme\ Marketing\ Fusepoint/fusepoint-platform/php-temp.ini -S localhost:8082 -t /opt/homebrew/share/phpmyadmin
```

---

**Note :** Gardez ce fichier à portée de main pour un accès rapide à vos informations de base de données !