# 🔧 Guide de Dépannage - Infomaniak

## Problème: Erreur de permissions PM2 (EACCES)

### Symptômes
```bash
npm error code EACCES
npm error syscall mkdir
npm error path /usr/local/lib/node_modules/pm2
npm error errno -13
```

### Cause
Les permissions d'écriture dans `/usr/local/lib/node_modules/` sont restreintes sur les serveurs Infomaniak.

### ✅ Solution 1: Script de démarrage corrigé

```bash
# Utiliser le script de démarrage corrigé
chmod +x start-infomaniak-fix.sh
./start-infomaniak-fix.sh
```

### ✅ Solution 2: Installation manuelle

```bash
# 1. Installer PM2 localement
npm install pm2 --save-dev

# 2. Créer le fichier ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'fusepoint-api',
      script: 'server/server.js',
      instances: 1,
      autorestart: true,
      env: { NODE_ENV: 'production', PORT: 3000 }
    },
    {
      name: 'fusepoint-frontend',
      script: 'infomaniak-server.js',
      instances: 1,
      autorestart: true,
      env: { NODE_ENV: 'production', PORT: 8080 }
    }
  ]
};
EOF

# 3. Démarrer avec PM2 local
./node_modules/.bin/pm2 start ecosystem.config.js
```

### ✅ Solution 3: Démarrage sans PM2

```bash
# 1. Créer le dossier logs
mkdir -p logs

# 2. Démarrer le backend
cd server
nohup node server.js > ../logs/api.log 2>&1 &
echo $! > ../logs/api.pid
cd ..

# 3. Démarrer le frontend
nohup node infomaniak-server.js > logs/frontend.log 2>&1 &
echo $! > logs/frontend.pid

# 4. Vérifier
tail -f logs/api.log logs/frontend.log
```

## Problème: Ports occupés

### Vérifier les ports
```bash
# Vérifier qui utilise les ports
lsof -i:3000
lsof -i:8080

# Voir tous les processus Node.js
ps aux | grep node
```

### Libérer les ports
```bash
# Arrêter proprement
./stop-infomaniak.sh

# Forcer l'arrêt si nécessaire
pkill -f "node.*server.js"
kill -9 $(lsof -ti:3000,8080)
```

## Problème: Serveurs ne démarrent pas

### Vérifications

1. **Fichier .env configuré**
```bash
# Vérifier que le fichier .env existe
ls -la .env

# Copier depuis l'exemple si nécessaire
cp .env.example .env
```

2. **Dépendances installées**
```bash
# Réinstaller les dépendances
npm install
cd server && npm install && cd ..
```

3. **Base de données initialisée**
```bash
# Initialiser la base de données
cd server
node scripts/initDatabase.js
cd ..
```

4. **Permissions des scripts**
```bash
# Rendre les scripts exécutables
chmod +x *.sh
```

## Problème: Erreur "command not found"

### PM2 non trouvé
```bash
# Utiliser le chemin complet
./node_modules/.bin/pm2 status

# Ou ajouter au PATH temporairement
export PATH=$PATH:./node_modules/.bin
pm2 status
```

### Node.js non trouvé
```bash
# Vérifier l'installation Node.js
which node
node --version

# Si Node.js n'est pas installé
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Commandes de diagnostic

### État des serveurs
```bash
# Avec PM2 local
./node_modules/.bin/pm2 status
./node_modules/.bin/pm2 logs

# Sans PM2
ps aux | grep node
lsof -i:3000,8080
```

### Test des endpoints
```bash
# Test frontend
curl -I http://localhost:8080
wget --spider http://localhost:8080

# Test API
curl http://localhost:3000/api/health
curl -I http://localhost:3000/api/health
```

### Logs détaillés
```bash
# Logs PM2
./node_modules/.bin/pm2 logs --lines 50

# Logs manuels
tail -f logs/api.log logs/frontend.log

# Logs système
journalctl -u nodejs --since "1 hour ago"
```

## Scripts de maintenance

### Redémarrage complet
```bash
#!/bin/bash
# restart-complete.sh

echo "🔄 Redémarrage complet..."
./stop-infomaniak.sh
sleep 5
./start-infomaniak-fix.sh
```

### Nettoyage des logs
```bash
#!/bin/bash
# clean-logs.sh

echo "🧹 Nettoyage des logs..."
mkdir -p logs/archive
mv logs/*.log logs/archive/ 2>/dev/null || true
./node_modules/.bin/pm2 flush 2>/dev/null || true
echo "✅ Logs nettoyés"
```

### Vérification de santé
```bash
#!/bin/bash
# health-check.sh

echo "🏥 Vérification de santé..."
echo "📊 Processus:"
ps aux | grep -E "(node|pm2)" | grep -v grep

echo "\n🌐 Ports:"
lsof -i:3000,8080

echo "\n📡 Tests endpoints:"
curl -s -o /dev/null -w "Frontend (8080): %{http_code}\n" http://localhost:8080
curl -s -o /dev/null -w "API (3000): %{http_code}\n" http://localhost:3000/api/health
```

## Contacts et ressources

- **Documentation Infomaniak**: [https://www.infomaniak.com/fr/support](https://www.infomaniak.com/fr/support)
- **Support Node.js**: [https://nodejs.org/en/docs/](https://nodejs.org/en/docs/)
- **Documentation PM2**: [https://pm2.keymetrics.io/docs/](https://pm2.keymetrics.io/docs/)

---

💡 **Conseil**: Gardez toujours une sauvegarde de votre configuration avant de faire des modifications importantes.