import { defineConfig, loadEnv } from 'vite'
import type { Plugin, ViteDevServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL || 'http://localhost:3002'
  const uploadsProxy = env.VITE_UPLOADS_PROXY === '1'

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

  return {
    plugins: [vue(), devAppRewritePlugin],
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
