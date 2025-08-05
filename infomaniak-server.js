import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.FRONTEND_PORT || 8080;
const API_PORT = process.env.API_PORT || 3000;

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: false, // Désactivé pour Vue.js
  crossOriginEmbedderPolicy: false
}));

// Compression gzip
app.use(compression());

// CORS pour l'API
app.use('/api', cors({
  origin: ['https://beta.fusepoint.ch', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Proxy pour les requêtes API vers le backend Node.js
app.use('/api', createProxyMiddleware({
  target: `http://localhost:${API_PORT}`,
  changeOrigin: true,
  logLevel: 'info',
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error' });
  }
}));

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d', // Cache pour les assets
  setHeaders: (res, path) => {
    // Pas de cache pour index.html
    if (path.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Gestion des routes SPA - rediriger vers index.html
app.get('*', (req, res) => {
  // Ne pas rediriger les requêtes API
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Frontend server running on port ${PORT}`);
  console.log(`📡 Proxying API requests to http://localhost:${API_PORT}`);
  console.log(`🌐 Frontend available at: http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
});

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
  console.log('🛑 Frontend server shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Frontend server shutting down...');
  process.exit(0);
});

export default app;