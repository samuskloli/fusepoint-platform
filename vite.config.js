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
        'jsonwebtoken',
        'nodemailer',
        'mysql2',
        'node-cron',
        'archiver',
        'cors',
        'express',
        'http-proxy-middleware'
      ]
    }
  },
  server: {
    port: 5173,
    hmr: {
      port: 24681
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
