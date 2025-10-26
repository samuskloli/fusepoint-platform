import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
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
    target: 'esnext',
    sourcemap: true
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: process.env.VITE_API_URL || 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      },
      '/r': {
        target: process.env.VITE_API_URL || 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
