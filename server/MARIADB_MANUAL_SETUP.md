# Configuration Manuelle MariaDB

## Problème
L'authentification automatique avec sudo ne fonctionne pas. Voici comment configurer manuellement MariaDB.

## Mot de passe configuré
**Utilisateur:** `oliveirasamuel`  
**Mot de passe:** `FusepointDB2025!`  
**Base de données:** `fusepoint_db`

## Étapes de configuration manuelle

### 1. Se connecter à MariaDB en tant que root
```bash
# Essayez d'abord sans mot de passe
sudo mariadb

# Ou si cela ne fonctionne pas
sudo mariadb -u root
```

### 2. Exécuter les commandes SQL suivantes
```sql
-- Créer la base de données
CREATE DATABASE IF NOT EXISTS fusepoint_db;

-- Supprimer l'utilisateur s'il existe déjà
DROP USER IF EXISTS 'oliveirasamuel'@'localhost';

-- Créer l'utilisateur avec le mot de passe
CREATE USER 'oliveirasamuel'@'localhost' IDENTIFIED BY 'FusepointDB2025!';

-- Donner tous les privilèges sur la base de données
GRANT ALL PRIVILEGES ON fusepoint_db.* TO 'oliveirasamuel'@'localhost';

-- Donner les privilèges de création/suppression de tables
GRANT CREATE, DROP, ALTER ON *.* TO 'oliveirasamuel'@'localhost';

-- Appliquer les changements
FLUSH PRIVILEGES;

-- Quitter MariaDB
EXIT;
```

### 3. Tester la connexion
```bash
# Tester la connexion avec le nouvel utilisateur
mariadb -u oliveirasamuel -pFusepointDB2025! -e "SELECT 'Connexion réussie' as status;"
```

### 4. Vérifier le fichier .env.mariadb
Le fichier `.env.mariadb` a déjà été mis à jour avec le bon mot de passe :
```
MARIADB_PASSWORD=FusepointDB2025!
```

## Prochaines étapes
Une fois la configuration manuelle terminée :

1. **Migrer les données :**
   ```bash
   node scripts/migrate-sqlite-to-mariadb.js
   ```

2. **Tester la migration :**
   ```bash
   node scripts/test-mariadb-migration.js
   ```

## Dépannage

### Si vous ne pouvez pas vous connecter en tant que root
```bash
# Redémarrer MariaDB
brew services restart mariadb

# Essayer avec différentes méthodes
sudo mariadb
sudo mariadb -u root
mariadb -u root
```

### Si l'utilisateur existe déjà
```sql
-- Supprimer et recréer l'utilisateur
DROP USER 'oliveirasamuel'@'localhost';
CREATE USER 'oliveirasamuel'@'localhost' IDENTIFIED BY 'FusepointDB2025!';
```

### Vérifier les utilisateurs existants
```sql
SELECT User, Host FROM mysql.user WHERE User = 'oliveirasamuel';
```

## Informations importantes
- **Le mot de passe est visible** : `FusepointDB2025!`
- **Il est déjà configuré** dans le fichier `.env.mariadb`
- **La base de données** `fusepoint_db` sera créée automatiquement
- **Tous les privilèges** nécessaires seront accordés à l'utilisateur