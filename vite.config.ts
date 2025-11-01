import { defineConfig, loadEnv } from 'vite'
import type { Plugin, ViteDevServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { resolve, join } from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Par défaut, le backend utilise le port 3004 en développement (env.PORT)
  // Utiliser ce port par défaut pour le proxy de développement si VITE_API_URL n'est pas défini
  const apiTarget = env.VITE_API_URL || 'http://localhost:3004'
  const uploadsProxy = env.VITE_UPLOADS_PROXY === '1'

  // Debug: afficher la configuration de proxy détectée
  try {
    // eslint-disable-next-line no-console
    console.log('🔎 Vite dev proxy configuration:')
    // eslint-disable-next-line no-console
    console.log('   mode =', mode)
    // eslint-disable-next-line no-console
    console.log('   env.VITE_API_URL =', env.VITE_API_URL)
    // eslint-disable-next-line no-console
    console.log('   env.VITE_UPLOADS_PROXY =', env.VITE_UPLOADS_PROXY)
    // eslint-disable-next-line no-console
    console.log('   apiTarget (resolved) =', apiTarget)
  } catch (_) {}

  // Ajoute une réécriture pour que le serveur de dev serve app/index.html
  // pour toutes les routes SPA sous /app/* (sans extension de fichier)
  const devAppRewritePlugin: Plugin = {
    name: 'dev-app-rewrite',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url?.split('?')[0]
        if (url && url.startsWith('/app/') && !url.includes('.')) {
          req.url = '/app/index.html'
        }
        next()
      })
    }
  }

  // Copie des .htaccess vers le dossier de build (dist et dist/app)
  const copyHtaccessPlugin: Plugin = {
    name: 'copy-htaccess',
    apply: 'build',
    closeBundle() {
      try {
        const distDir = resolve(__dirname, 'dist')
        const distAppDir = join(distDir, 'app')

        // S'assurer que les dossiers existent
        fs.mkdirSync(distDir, { recursive: true })
        fs.mkdirSync(distAppDir, { recursive: true })

        const rootHtaccessSrc = resolve(__dirname, '.htaccess')
        const spaHtaccessSrc = resolve(__dirname, '.htaccess.spa')

        const rootHtaccessDest = join(distDir, '.htaccess')
        const spaHtaccessDest = join(distAppDir, '.htaccess')

        if (fs.existsSync(rootHtaccessSrc)) {
          fs.copyFileSync(rootHtaccessSrc, rootHtaccessDest)
          // eslint-disable-next-line no-console
          console.log('✅ Copié .htaccess vers dist/.htaccess')
        } else {
          // eslint-disable-next-line no-console
          console.warn('⚠️ .htaccess introuvable à la racine, copie ignorée')
        }

        if (fs.existsSync(spaHtaccessSrc)) {
          fs.copyFileSync(spaHtaccessSrc, spaHtaccessDest)
          // eslint-disable-next-line no-console
          console.log('✅ Copié .htaccess.spa vers dist/app/.htaccess')
        } else {
          // eslint-disable-next-line no-console
          console.warn('⚠️ .htaccess.spa introuvable à la racine, copie ignorée')
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('❌ Erreur lors de la copie des .htaccess:', err)
      }
    }
  }

  return {
    plugins: [vue(), devAppRewritePlugin, copyHtaccessPlugin],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        'vue': 'vue/dist/vue.esm-bundler.js'
      }
    },
    define: {
      global: 'globalThis',
    },
    // appType: 'mpa',
    // Base pour production: servir la SPA sous /app/
    base: mode === 'production' ? '/app/' : '/',
    build: {
      target: 'esnext',
      sourcemap: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          app: resolve(__dirname, 'app/index.html'),
        }
      }
    },
    server: {
      port: 5173,
      host: true,
      strictPort: true,
      proxy: (() => {
        const base: Record<string, any> = {
          '/api': { target: apiTarget, changeOrigin: true, secure: false },
          '/r': { target: apiTarget, changeOrigin: true, secure: false }
        }
        // Ne proxier /uploads que si explicitement demandé
        if (uploadsProxy) {
          base['/uploads'] = { target: apiTarget, changeOrigin: true, secure: false }
        }
        return base
      })()
    }
  }
})
