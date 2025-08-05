# Configuration de phpMyAdmin pour votre base de données MariaDB

## Étapes d'installation et de configuration

### 1. Vérification des installations
✅ phpMyAdmin installé via Homebrew
✅ Apache (httpd) installé via Homebrew
✅ PHP installé via Homebrew

### 2. Configuration d'Apache

Vous devez modifier le fichier de configuration Apache situé à :
`/opt/homebrew/etc/httpd/httpd.conf`

#### Ajoutez les lignes suivantes à la fin du fichier :

```apache
# Configuration PHP
LoadModule php_module /opt/homebrew/opt/php/lib/httpd/modules/libphp.so

<FilesMatch \.php$>
    SetHandler application/x-httpd-php
</FilesMatch>

# Configuration phpMyAdmin
Alias /phpmyadmin /opt/homebrew/share/phpmyadmin
<Directory /opt/homebrew/share/phpmyadmin/>
    Options Indexes FollowSymLinks MultiViews
    AllowOverride All
    <IfModule mod_authz_core.c>
        Require all granted
    </IfModule>
    <IfModule !mod_authz_core.c>
        Order allow,deny
        Allow from all
    </IfModule>
</Directory>
```

#### Modifiez également la ligne DirectoryIndex pour inclure index.php :
```apache
DirectoryIndex index.php index.html
```

### 3. Configuration de phpMyAdmin pour MariaDB

Modifiez le fichier de configuration phpMyAdmin :
`/opt/homebrew/etc/phpmyadmin.config.inc.php`

```php
<?php
$cfg['blowfish_secret'] = 'votre-clé-secrète-de-32-caractères';

$i = 0;
$i++;
$cfg['Servers'][$i]['auth_type'] = 'cookie';
$cfg['Servers'][$i]['host'] = 'localhost';
$cfg['Servers'][$i]['port'] = '3306';
$cfg['Servers'][$i]['connect_type'] = 'tcp';
$cfg['Servers'][$i]['compress'] = false;
$cfg['Servers'][$i]['extension'] = 'mysqli';

// Paramètres pour votre base de données MariaDB
$cfg['Servers'][$i]['user'] = 'fusepoint_user';
$cfg['Servers'][$i]['password'] = 'votre_mot_de_passe_mariadb';

$cfg['UploadDir'] = '';
$cfg['SaveDir'] = '';
?>
```

### 4. Commandes à exécuter

```bash
# Démarrer PHP-FPM
brew services start php

# Démarrer Apache
brew services start httpd

# Vérifier que MariaDB est en cours d'exécution
brew services list | grep mariadb
```

### 5. Accès à phpMyAdmin

Une fois configuré, vous pourrez accéder à phpMyAdmin via :
- **URL locale :** http://localhost:8080/phpmyadmin
- **Utilisateur :** fusepoint_user (ou root)
- **Mot de passe :** celui configuré dans votre fichier .env.mariadb

### 6. Informations de connexion à votre base de données

D'après votre configuration actuelle :
- **Host :** localhost
- **Port :** 3306
- **Base de données :** fusepoint_db
- **Utilisateur :** fusepoint_user
- **Mot de passe :** (voir fichier .env.mariadb)

### 7. Dépannage

Si vous rencontrez des problèmes :

1. **Vérifiez les logs Apache :**
   ```bash
   tail -f /opt/homebrew/var/log/httpd/error_log
   ```

2. **Vérifiez que MariaDB est accessible :**
   ```bash
   mysql -u fusepoint_user -p -h localhost fusepoint_db
   ```

3. **Redémarrez les services :**
   ```bash
   brew services restart httpd
   brew services restart php
   brew services restart mariadb
   ```

### 8. Alternative : Utilisation directe

Si vous préférez ne pas configurer Apache, vous pouvez utiliser le serveur PHP intégré :

```bash
cd /opt/homebrew/share/phpmyadmin
php -S localhost:8081
```

Puis accédez à : http://localhost:8081

---

**Note :** Assurez-vous que votre serveur backend (port 3003) et frontend (port 5173) ne sont pas en conflit avec Apache (port 8080).