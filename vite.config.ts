import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL || 'http://localhost:3002'
  const uploadsProxy = env.VITE_UPLOADS_PROXY === '1'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        'vue': 'vue/dist/vue.esm-bundler.js'
      }
    },
    define: {
      global: 'globalThis',
    },
    build: {
      target: 'esnext',
      sourcemap: true
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
