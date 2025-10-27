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
// Supporte les ports fournis par la plateforme (PORT), fallback sur FRONTEND_PORT ou 8080
const PORT = process.env.PORT || process.env.FRONTEND_PORT || 8080;
const API_PORT = process.env.API_PORT || 3000;

// Origines autorisées pour CORS
const allowedOriginsEnv = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const defaultAllowedOrigins = [
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
  'https://beta.fusepoint.ch',
  'https://fusepoint.ch',
  'https://www.fusepoint.ch'
];
const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...allowedOriginsEnv]));

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: false, // Désactivé pour Vue.js
  crossOriginEmbedderPolicy: false
}));

// Compression gzip
app.use(compression());

// CORS pour l'API (avec liste d'origines autorisées configurable)
app.use('/api', cors({
  origin: (origin, callback) => {
    // Autoriser requêtes sans en-tête Origin (ex: curl, outils internes)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
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

// Servir localement les lotties sous /uploads/lotties depuis public/lotties (prioritaire sur le proxy)
app.use('/uploads/lotties', express.static(path.join(__dirname, 'public', 'lotties'), {
  maxAge: '1d'
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

// Servir localement les lotties sous /uploads/lotties depuis public/lotties (prioritaire sur le proxy)
app.use('/uploads/lotties', express.static(path.join(__dirname, 'public', 'lotties'), {
  maxAge: '1d'
}));

// Servir aussi sous le préfixe /app pour correspondre au base Vite en production
app.use('/app', express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d',
  setHeaders: (res, path) => {
    if (path.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Route de santé pour l’orchestrateur de l’hébergeur
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.head('/health', (req, res) => {
  res.status(200).end();
});

// Gestion des routes SPA
// 1) Les routes sous /app/* doivent renvoyer l'index de la SPA app
app.get('/app/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'app', 'index.html'));
});

// 2) Fallback global: renvoyer l'index marketing pour toutes les autres routes non-API
app.get('*', (req, res) => {
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
// Forcer l'écoute sur 0.0.0.0 pour compatibilité hébergeur
app.listen(PORT, '0.0.0.0', () => {
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