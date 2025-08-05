#!/bin/bash

# Script pour corriger le problème de build sur Infomaniak
echo "🔧 Correction du problème crypto.hash sur Infomaniak..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Exécutez ce script depuis la racine du projet."
    exit 1
fi

# Nettoyer les modules et le cache
echo "🧹 Nettoyage des modules et du cache..."
rm -rf node_modules
rm -rf dist
rm -f package-lock.json

# Vérifier la configuration Vite
echo "🔍 Vérification de la configuration Vite..."
if ! grep -q "define:" vite.config.js; then
    echo "❌ Configuration Vite manquante, ajout..."
    # Backup du fichier original
    cp vite.config.js vite.config.js.backup
    
    # Créer une nouvelle configuration Vite optimisée
    cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue': 'vue/dist/vue.esm-bundler.js'
    }
  },
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  build: {
    rollupOptions: {
      external: [
        'crypto',
        'fs', 
        'path',
        'bcrypt',
        'sqlite3',
        'jsonwebtoken',
        'node-cron',
        'archiver',
        'cors',
        'express',
        'http-proxy-middleware',
        'nodemailer'
      ]
    },
    target: 'esnext',
    minify: 'esbuild'
  },
  optimizeDeps: {
    exclude: ['crypto', 'fs', 'path', 'bcrypt', 'sqlite3', 'jsonwebtoken']
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
EOF
fi

# Réinstaller les dépendances
echo "📦 Réinstallation des dépendances..."
npm install

# Construire le projet
echo "🏗️ Construction du projet..."
NODE_ENV=production npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build réussi! Le dossier dist/ est prêt pour le déploiement."
    echo "📁 Fichiers générés dans: $(pwd)/dist/"
    ls -la dist/
else
    echo "❌ Échec du build. Vérifiez les erreurs ci-dessus."
    exit 1
fi

echo "🎯 Prochaines étapes:"
echo "1. Copiez le contenu de dist/ vers votre serveur web"
echo "2. Configurez Apache/Nginx pour servir les fichiers statiques"
echo "3. Configurez le proxy pour /api vers votre backend Node.js"