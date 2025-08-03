import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
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
        'http-proxy-middleware'
      ]
    }
  },
  server: {
    host: '0.0.0.0', // Permet l'accès depuis le réseau local
    port: 5173,
    hmr: {
      port: 24678,
      host: 'localhost', // Utilise localhost pour éviter les erreurs WebSocket
      overlay: false
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
