RewriteEngine On

# Ne pas traiter les requêtes pour le répertoire /app (laissé au .htaccess du sous-répertoire)
RewriteCond %{REQUEST_URI} !^/app/
# Autres règles de réécriture pour le site principal peuvent être ajoutées ici