import dotenv from 'dotenv';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import nodemailer, { Transporter } from 'nodemailer';
import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';

// Types
import { AuthenticatedRequest, DatabaseConfig, EmailConfig } from './types';

// Services
const aiChatService = require('./services/aiChatService');
const contextualAIService = require('./services/contextualAIService');
const companyDataService = require('./services/companyDataService');
const databaseService = require('./services/databaseService');
const accompagnementService = require('./services/accompagnementService');
const authService = require('./services/authService');
const PlatformSettingsService = require('./services/platformSettingsService');

// Créer une seule instance du service
const platformSettingsService = new PlatformSettingsService();

// Routes
const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/companies');
const facebookRoutes = require('./routes/facebook');
const instagramRoutes = require('./routes/instagram');
const accompagnementRoutes = require('./routes/accompagnement');
const agentRoutes = require('./routes/agent');
const superAdminRoutes = require('./routes/superAdmin');
const adminRoutes = require('./routes/admin');
const prestataireRoutes = require('./routes/prestataire');
const platformSettingsBlocksRoutes = require('./routes/platformSettingsBlocks');
const clientRoutes = require('./routes/client');

// Configuration
dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3002', 10);

// Middleware de sécurité - CSP désactivée pour éviter les blocages
app.use(helmet({
  contentSecurityPolicy: false
}));

// Configuration CORS optimisée pour production et développement
const allowedOrigins: string[] = (process.env.ALLOWED_ORIGINS || 
  'https://beta.fusepoint.ch,https://fusepoint.ch,https://www.fusepoint.ch,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:4173,http://127.0.0.1:4173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

interface CorsCallback {
  (err: Error | null, allow?: boolean): void;
}

const corsOptions = {
  origin(origin: string | undefined, callback: CorsCallback): void {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.log('❌ CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(compression());
app.use(express.json());
app.use(morgan('combined'));

// Rate limiting avec configuration avancée
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    error: 'Trop de requêtes depuis cette IP',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request): boolean => {
    return req.path === '/health' || req.path === '/api/health';
  }
});

// Rate limiting spécifique pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 50,
  message: {
    error: 'Trop de tentatives de connexion',
    retryAfter: '15 minutes'
  }
});

// Configuration Google Analytics
const analytics = google.analyticsdata('v1beta');
const keyFilePath: string = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || './config/service-account-key.json';
const auth = new google.auth.GoogleAuth({
  keyFile: keyFilePath,
  scopes: ['https://www.googleapis.com/auth/analytics.readonly']
});

// Configuration SMTP pour les emails
let emailTransporter: Transporter | null = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  const emailConfig: EmailConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  };
  
  emailTransporter = nodemailer.createTransport({
    ...emailConfig,
    tls: {
      rejectUnauthorized: false
    }
  });
  console.log('✅ Configuration SMTP initialisée');
} else {
  console.log('⚠️ Aucune configuration SMTP trouvée');
}

// Configuration Multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void): void => {
    const uploadPath: string = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void): void => {
    const uniqueSuffix: string = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const extname: boolean = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype: boolean = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

// Middleware d'authentification
const authMiddleware = require('./middleware/auth');

// Middleware de logging avancé
app.use((req: Request, res: Response, next: NextFunction): void => {
  const start: number = Date.now();
  
  // Log spécifique pour assign-agent
  if (req.path.includes('assign-agent')) {
    console.log('🔍 MIDDLEWARE GLOBAL - Requête assign-agent détectée:');
    console.log('🔍 Method:', req.method);
    console.log('🔍 Path:', req.path);
    console.log('🔍 Body:', req.body);
    console.log('🔍 Headers:', req.headers);
  }
  
  res.on('finish', (): void => {
    const duration: number = Date.now() - start;
    if (duration > 1000) {
      console.log(`🐌 Requête lente: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  next();
});

// Middleware de sécurité supplémentaire
app.use((req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/facebook', facebookRoutes);
app.use('/api/instagram', instagramRoutes);
app.use('/api/accompagnement', accompagnementRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/prestataire', prestataireRoutes);
app.use('/api/platform-settings-blocks', platformSettingsBlocksRoutes);
app.use('/api/client', clientRoutes);

// Route de santé
app.get('/health', (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware de gestion d'erreurs
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('❌ Erreur serveur:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Route 404
app.use('*', (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Démarrage du serveur
app.listen(PORT, (): void => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 CORS autorisé pour: ${allowedOrigins.join(', ')}`);
  
  // Test de la connexion à la base de données
  if (databaseService && typeof databaseService.testConnection === 'function') {
    databaseService.testConnection()
      .then(() => console.log('✅ Connexion à la base de données réussie'))
      .catch((err: Error) => console.error('❌ Erreur de connexion à la base de données:', err.message));
  }
  
  // Test de la configuration SMTP
  if (emailTransporter) {
    emailTransporter.verify((error: Error | null, success: boolean): void => {
      if (error) {
        console.error('❌ Erreur de configuration SMTP:', error.message);
      } else {
        console.log('✅ Configuration SMTP vérifiée avec succès');
      }
    });
  }
});

// Gestion propre de l'arrêt du serveur
process.on('SIGTERM', (): void => {
  console.log('🛑 Signal SIGTERM reçu, arrêt du serveur...');
  process.exit(0);
});

process.on('SIGINT', (): void => {
  console.log('🛑 Signal SIGINT reçu, arrêt du serveur...');
  process.exit(0);
});

export default app;