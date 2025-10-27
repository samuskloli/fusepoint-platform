const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const databaseService = require('../services/databaseService');

// Sécurité: activer explicitement via env INSTALL_ENABLED=true
function isInstallEnabled() {
  const enabled = String(process.env.INSTALL_ENABLED || '').toLowerCase();
  return enabled === 'true' || enabled === '1';
}

// Filtre global: bloquer si non activé ou en production sans activation
router.use((req, res, next) => {
  if (!isInstallEnabled()) {
    return res.status(403).json({ error: 'Install route disabled. Set INSTALL_ENABLED=true to use.' });
  }
  next();
});

// GET /api/install/status — vérifie la présence des variables critiques et la connexion DB
router.get('/status', async (req, res) => {
  try {
    const envChecks = {
      NODE_ENV: process.env.NODE_ENV || null,
      FRONTEND_URL: process.env.FRONTEND_URL || null,
      API_BASE_URL: process.env.API_BASE_URL || null,
      JWT_SECRET: !!process.env.JWT_SECRET,
      ENCRYPTION_KEY: !!process.env.ENCRYPTION_KEY,
      DB_TYPE: process.env.DB_TYPE || 'mariadb',
      MARIADB_HOST: process.env.MARIADB_HOST || null,
      MARIADB_PORT: process.env.MARIADB_PORT || null,
      MARIADB_USER: process.env.MARIADB_USER || null,
      MARIADB_PASSWORD: !!process.env.MARIADB_PASSWORD,
      MARIADB_DATABASE: process.env.MARIADB_DATABASE || null,
    };

    const missing = Object.entries(envChecks)
      .filter(([key, value]) => value === null || value === '' || value === false)
      .map(([key]) => key);

    let dbOk = false;
    let dbError = null;
    try {
      dbOk = await databaseService.checkConnection();
    } catch (e) {
      dbOk = false;
      dbError = e?.message || String(e);
    }

    return res.json({
      installEnabled: isInstallEnabled(),
      env: envChecks,
      missing,
      db: { ok: dbOk, error: dbError },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/install/db-test — teste une connexion DB fournie sans persister
router.post('/db-test', async (req, res) => {
  try {
    const { host, port, user, password, database } = req.body || {};
    if (!host || !user || !database) {
      return res.status(400).json({ error: 'host, user, database requis' });
    }

    // Utilise le config MariaDB à la volée (sans écrire .env)
    const mariadb = require('mariadb');
    let conn;
    try {
      conn = await mariadb.createConnection({
        host,
        port: Number(port) || 3306,
        user,
        password,
        database,
        connectTimeout: 10000,
      });
      await conn.query('SELECT 1');
      return res.json({ ok: true });
    } catch (e) {
      return res.status(200).json({ ok: false, error: e?.message || String(e) });
    } finally {
      if (conn) await conn.end();
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Nouveau: initialiser la base de données (crée les tables)
router.post('/init-db', async (req, res) => {
  try {
    const ok = await databaseService.initialize();
    return res.json({ ok: !!ok });
  } catch (error) {
    return res.status(200).json({ ok: false, error: error?.message || String(error) });
  }
});

// Nouveau: créer un compte administrateur (super_admin)
router.post('/create-admin', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'email et password requis' });
    }
    const user = await databaseService.createUser({ email, password, firstName, lastName, role: 'super_admin' }, false);
    if (!user?.id) {
      return res.status(200).json({ ok: false, error: 'création utilisateur échouée' });
    }
    // Renforcer: activer et s’assurer du rôle super_admin
    await databaseService.updateUserStatus(user.id, true, user.id);
    await databaseService.updateUserRole(user.id, 'super_admin', user.id);
    return res.json({ ok: true, userId: user.id });
  } catch (error) {
    return res.status(200).json({ ok: false, error: error?.message || String(error) });
  }
});

// Nouveau: générer un contenu .env (et écrire si ALLOW_INSTALL_WRITE=true)
router.post('/generate-env', async (req, res) => {
  try {
    const cfg = req.body || {};
    const lines = [
      `# Fusepoint Platform`,
      `NODE_ENV=${process.env.NODE_ENV || 'production'}`,
      `FRONTEND_URL=${cfg.frontendUrl || process.env.FRONTEND_URL || 'http://localhost:5175'}`,
      `API_BASE_URL=${cfg.apiBaseUrl || process.env.API_BASE_URL || 'http://localhost:3000'}`,
      `JWT_SECRET=${cfg.jwtSecret || process.env.JWT_SECRET || ''}`,
      `ENCRYPTION_KEY=${cfg.encryptionKey || process.env.ENCRYPTION_KEY || ''}`,
      `INSTALL_ENABLED=false`,
      `ALLOW_INSTALL_WRITE=${process.env.ALLOW_INSTALL_WRITE || 'false'}`,
      `MARIADB_HOST=${cfg.db?.host || process.env.MARIADB_HOST || 'localhost'}`,
      `MARIADB_PORT=${cfg.db?.port || process.env.MARIADB_PORT || 3306}`,
      `MARIADB_USER=${cfg.db?.user || process.env.MARIADB_USER || ''}`,
      `MARIADB_PASSWORD=${cfg.db?.password || process.env.MARIADB_PASSWORD || ''}`,
      `MARIADB_DATABASE=${cfg.db?.database || process.env.MARIADB_DATABASE || 'fusepoint_db'}`,
    ];
    const content = lines.join('\n') + '\n';

    const allowWrite = String(process.env.ALLOW_INSTALL_WRITE || '').toLowerCase() === 'true';
    let written = false;
    let filePath = null;
    if (allowWrite) {
      try {
        const rootEnvPath = path.join(__dirname, '../../.env');
        const installEnvPath = path.join(__dirname, '../.env.install');
        // Écrire dans .env s'il n'existe pas, sinon .env.install
        const targetPath = fs.existsSync(rootEnvPath) ? installEnvPath : rootEnvPath;
        fs.writeFileSync(targetPath, content, 'utf8');
        written = true;
        filePath = targetPath;
      } catch (e) {
        written = false;
      }
    }

    return res.json({ ok: true, written, filePath, content });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || String(error) });
  }
});

module.exports = router;