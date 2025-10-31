# 🗄️ Guide de Migration SQLite vers MariaDB
## Fusepoint Platform - Migration de Base de Données

### 📋 Vue d'ensemble

Ce guide vous accompagne dans la migration complète de votre base de données SQLite vers MariaDB pour améliorer les performances, la scalabilité et la robustesse de votre plateforme Fusepoint.

### 🎯 Avantages de la Migration

- **Performance** : MariaDB offre de meilleures performances pour les requêtes complexes
- **Scalabilité** : Support natif pour la montée en charge
- **Concurrence** : Gestion optimisée des accès simultanés
- **Intégrité** : Contraintes de clés étrangères plus robustes
- **Outils** : Écosystème d'outils de monitoring et d'administration

---

## 🚀 Installation Automatique

### Option 1: Script d'Installation Complet (Recommandé)

```bash
# Depuis le dossier server/
node scripts/setup-mariadb.js
```

Ce script va :
1. ✅ Vérifier/installer MariaDB
2. 🔧 Configurer la base de données
3. 🗄️ Créer la base `fusepoint_db`
4. 📝 Générer le fichier de configuration
5. 🚀 Exécuter la migration
6. 🧪 Tester l'intégrité des données

---

## 🛠️ Installation Manuelle

### Étape 1: Installation de MariaDB

```bash
# Installation via Homebrew (macOS)
brew install mariadb

# Initialisation
mariadb-install-db

# Démarrage du service
brew services start mariadb
```

### Étape 2: Configuration de la Base de Données

```bash
# Connexion à MariaDB
mariadb -u $(whoami)

# Création de la base de données
CREATE DATABASE fusepoint_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Vérification
SHOW DATABASES;
USE fusepoint_db;
```

### Étape 3: Installation des Dépendances Node.js

```bash
# Depuis le dossier server/
npm install mariadb
```

### Étape 4: Configuration des Variables d'Environnement

Créez un fichier `.env.mariadb` :

```env
# Configuration MariaDB
DB_TYPE=mariadb
MARIADB_HOST=localhost
MARIADB_PORT=3306
MARIADB_USER=votre_utilisateur
MARIADB_PASSWORD=
MARIADB_DATABASE=fusepoint_db

# Clé de chiffrement
DB_ENCRYPTION_KEY=votre_cle_de_chiffrement_32_caracteres

# Copiez vos autres variables d'environnement existantes
JWT_SECRET=votre_jwt_secret
SMTP_HOST=votre_smtp_host
# etc...
```

---

## 🔄 Migration des Données

### Migration Automatique

```bash
# Depuis le dossier server/
node scripts/migrate-sqlite-to-mariadb.js
```

### Vérification de la Migration

```bash
# Test d'intégrité des données
node scripts/test-mariadb-migration.js
```

---

## 🔧 Intégration dans l'Application

### Option 1: Remplacement Complet

Modifiez `server/services/databaseService.js` :

```javascript
// Remplacer l'import SQLite
const MariaDBService = require('./mariadbService');

class DatabaseService extends MariaDBService {
  constructor() {
    super();
    // Votre logique existante
  }
}

module.exports = DatabaseService;
```

### Option 2: Service Hybride

Créez un service qui peut basculer entre SQLite et MariaDB :

```javascript
const SQLiteService = require('./databaseService');
const MariaDBService = require('./mariadbService');

class HybridDatabaseService {
  constructor() {
    this.dbType = process.env.DB_TYPE || 'sqlite';
    this.service = this.dbType === 'mariadb' 
      ? new MariaDBService() 
      : new SQLiteService();
  }

  async initialize() {
    return await this.service.initialize();
  }

  // Proxy toutes les méthodes vers le service approprié
  async query(sql, params) {
    return await this.service.query(sql, params);
  }

  // etc...
}

module.exports = HybridDatabaseService;
```

---

## 🧪 Tests et Validation

### Tests Automatiques

```bash
# Test complet de la migration
node scripts/test-mariadb-migration.js

# Test de performance
node scripts/benchmark-mariadb.js
```

### Tests Manuels

1. **Connexion** : Vérifiez que l'application se connecte
2. **Authentification** : Testez la connexion utilisateur
3. **CRUD** : Testez les opérations de base
4. **Performance** : Comparez les temps de réponse

---

## 📊 Monitoring et Maintenance

### Commandes Utiles

```bash
# Statut du service
brew services list | grep mariadb

# Connexion à la base
mariadb -u $(whoami) fusepoint_db

# Sauvegarde
mysqldump -u $(whoami) fusepoint_db > backup_$(date +%Y%m%d).sql

# Restauration
mariadb -u $(whoami) fusepoint_db < backup_20241204.sql
```

### Requêtes de Monitoring

```sql
-- Statistiques des tables
SELECT 
  table_name,
  table_rows,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size in MB'
FROM information_schema.TABLES 
WHERE table_schema = 'fusepoint_db';

-- Processus actifs
SHOW PROCESSLIST;

-- Variables de configuration
SHOW VARIABLES LIKE '%innodb%';
```

---

## 🔒 Sécurité et Bonnes Pratiques

### Configuration Sécurisée

```bash
# Sécurisation de l'installation
mysql_secure_installation
```

### Utilisateur Dédié

```sql
-- Créer un utilisateur dédié pour l'application
CREATE USER 'fusepoint_app'@'localhost' IDENTIFIED BY 'mot_de_passe_fort';
GRANT ALL PRIVILEGES ON fusepoint_db.* TO 'fusepoint_app'@'localhost';
FLUSH PRIVILEGES;
```

### Sauvegarde Automatique

```bash
# Script de sauvegarde quotidienne
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u fusepoint_app -p fusepoint_db > "$BACKUP_DIR/fusepoint_backup_$DATE.sql"

# Garder seulement les 7 dernières sauvegardes
find $BACKUP_DIR -name "fusepoint_backup_*.sql" -mtime +7 -delete
```

---

## 🚨 Dépannage

### Problèmes Courants

#### Erreur de Connexion
```bash
# Vérifier le statut du service
brew services list | grep mariadb

# Redémarrer le service
brew services restart mariadb

# Vérifier les logs
tail -f /opt/homebrew/var/mysql/*.err
```

#### Erreur d'Authentification
```bash
# Réinitialiser le mot de passe root
brew services stop mariadb
mysqld_safe --skip-grant-tables &
mariadb -u root
# Dans MariaDB:
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'nouveau_mot_de_passe';
```

#### Problèmes de Performance
```sql
-- Analyser les requêtes lentes
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- Optimiser les tables
OPTIMIZE TABLE users, companies, projects, notifications;

-- Analyser les index
SHOW INDEX FROM users;
```

---

## 📈 Optimisation des Performances

### Configuration MariaDB

Ajoutez dans `/opt/homebrew/etc/my.cnf` :

```ini
[mysqld]
# Optimisations pour Fusepoint
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
max_connections = 100
query_cache_size = 32M
query_cache_type = 1

# Charset
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
```

### Index Recommandés

```sql
-- Index pour les performances
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

---

## 🔄 Rollback (Retour en Arrière)

Si vous devez revenir à SQLite :

1. **Sauvegardez MariaDB** :
   ```bash
   mysqldump -u $(whoami) fusepoint_db > mariadb_backup.sql
   ```

2. **Modifiez la configuration** :
   ```env
   DB_TYPE=sqlite
   ```

3. **Redémarrez l'application** avec l'ancien service SQLite

---

## 📞 Support

### Logs Importants
- **MariaDB** : `/opt/homebrew/var/mysql/*.err`
- **Application** : `server/logs/`
- **Migration** : Sortie console des scripts

### Commandes de Diagnostic

```bash
# Test de connexion
node -e "const MariaDBService = require('./server/services/mariadbService'); const db = new MariaDBService(); db.initialize().then(() => console.log('OK')).catch(console.error);"

# Statistiques de la base
node scripts/test-mariadb-migration.js
```

---

## ✅ Checklist de Migration

- [ ] MariaDB installé et configuré
- [ ] Base de données `fusepoint_db` créée
- [ ] Dépendances Node.js installées
- [ ] Variables d'environnement configurées
- [ ] Migration des données exécutée
- [ ] Tests d'intégrité passés
- [ ] Application modifiée pour utiliser MariaDB
- [ ] Tests fonctionnels validés
- [ ] Sauvegarde de l'ancienne base SQLite
- [ ] Monitoring mis en place
- [ ] Documentation mise à jour

---

*Dernière mise à jour : Décembre 2024*
*Version : 1.0.0*