const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;
const crypto = require('crypto');
const databaseService = require('../services/databaseService');
const { assertFileAccess } = require('../services/fileAccessService');
const { authenticateToken } = require('../middleware/auth');

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const SIGNING_SECRET = process.env.FILES_SIGNING_SECRET || 'dev-secret-change-me';

function signPayload(payload) {
  const json = JSON.stringify(payload);
  const data = Buffer.from(json).toString('base64url');
  const sig = crypto.createHmac('sha256', SIGNING_SECRET).update(data).digest('hex');
  return `${data}.${sig}`;
}

function verifyToken(token) {
  try {
    const [data, sig] = String(token).split('.');
    if (!data || !sig) return null;
    
    const expected = crypto.createHmac('sha256', SIGNING_SECRET).update(data).digest('hex');
    if (expected !== sig) return null;
    
    const json = Buffer.from(data, 'base64url').toString('utf8');
    const payload = JSON.parse(json);
    
    if (payload.exp && payload.exp < Date.now()) return null;
    
    return payload;
  } catch (e) {
    return null;
  }
}

function getMimeType(fileName) {
  const ext = path.extname(fileName || '').toLowerCase();
  const mimeMap = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.zip': 'application/zip',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  return mimeMap[ext] || 'application/octet-stream';
}

async function resolveFileById(fileId) {
  const row = await databaseService.get('SELECT * FROM files WHERE id = ?', [fileId]);
  if (!row) return null;
  const clientId = row.client_id || row.clientId;
  const projectId = row.project_id || row.projectId;
  const fileName = row.name || row.filename || row.original_name || row.originalName;
  const directPath = row.path || row.file_path;
  const originalPath = directPath && fs.existsSync(directPath)
    ? directPath
    : (clientId && projectId && fileName
        ? path.join(process.cwd(), 'uploads', 'clients', String(clientId), 'projects', String(projectId), 'files', String(fileName))
        : null);
  return {
    row,
    clientId,
    projectId,
    fileName,
    originalPath
  };
}

// POST /api/files/signed-url { fileId, intent: 'thumbnail'|'preview'|'download', size? }
router.post('/signed-url', authenticateToken, async (req, res) => {
  try {
    const { fileId, intent = 'preview', size } = req.body || {};
    if (!fileId) {
      return res.status(400).json({ success: false, error: 'fileId requis' });
    }

    const role = (req.user?.role || '').toLowerCase();
    const isAdmin = role.includes('admin');

    // Déterminer le tenant selon le rôle
    let tenantId = req.tenantId ?? req.user?.tenantId ?? null;
    if (!tenantId) {
      if (role === 'agent') {
        tenantId = req.user?.id;
      } else {
        tenantId = req.user?.company_id || req.user?.client_id || req.user?.id;
      }
    }

    let info;
    try {
      const fileRow = isAdmin ? await resolveFileById(fileId) : await assertFileAccess(fileId, tenantId);
      if (!fileRow) {
        console.warn(`📦 Signed URL NOT_FOUND fileId=${fileId} tenantId=${tenantId} userId=${req.userId || req.user?.id}`);
        return res.status(404).json({ success: false, error: 'Fichier introuvable' });
      }
      const clientId = fileRow.client_id || fileRow.clientId;
      const projectId = fileRow.project_id || fileRow.projectId;
      const fileName = fileRow.name || fileRow.filename || fileRow.original_name || fileRow.originalName;
      const directPath = fileRow.path || fileRow.file_path;
      const originalPath = directPath && fs.existsSync(directPath)
        ? directPath
        : (clientId && projectId && fileName
            ? path.join(process.cwd(), 'uploads', 'clients', String(clientId), 'projects', String(projectId), 'files', String(fileName))
            : null);
      info = { row: fileRow, clientId, projectId, fileName, originalPath };
    } catch (err) {
      if (!isAdmin && err.code === 'FORBIDDEN') {
        const row = await databaseService.get('SELECT client_id FROM files WHERE id = ?', [fileId]);
        const rowTenant = row ? row.client_id : undefined;
        console.warn(`🚫 Signed URL FORBIDDEN fileId=${fileId} fileTenant=${rowTenant} reqTenant=${tenantId} userId=${req.userId || req.user?.id}`);
        return res.status(403).json({ success: false, error: 'FORBIDDEN' });
      }
      console.error('❌ Erreur génération signed URL:', err);
      return res.status(500).json({ success: false, error: 'Erreur serveur lors de la génération de l\'URL signée' });
    }

    const ttlMs = DEFAULT_TTL_MS;
    const payload = { fileId: Number(fileId), intent, size: size ? Number(size) : undefined, exp: Date.now() + ttlMs };
    const token = signPayload(payload);
    const url = `/api/files/signed/${token}`;
    return res.json({ success: true, data: { url, expiresAt: new Date(payload.exp).toISOString() } });
  } catch (error) {
    console.error('❌ Erreur génération signed URL:', error);
    return res.status(500).json({ success: false, error: 'Erreur serveur lors de la génération de l’URL signée' });
  }
});

// GET /api/files/signed/:token
// Streams the resource after verifying signature and expiration
router.get('/signed/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const payload = verifyToken(token);
    
    if (!payload) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const { fileId } = payload;
    const fileResult = await resolveFileById(fileId);
    
    let filePath = null;
    let fileName = null;
    
    if (fileResult && fileResult.originalPath && fs.existsSync(fileResult.originalPath)) {
      // Fichier trouvé via la base de données
      filePath = fileResult.originalPath;
      fileName = fileResult.fileName;
    } else {
      // Fallback: chercher directement dans le répertoire uploads
      const directFilePath = path.join(process.cwd(), 'uploads', fileId);
      if (fs.existsSync(directFilePath)) {
        filePath = directFilePath;
        fileName = fileId;
      }
    }
    
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    try {
      const stats = fs.statSync(filePath);
      const mimeType = getMimeType(fileName);
      
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', stats.size);
      
      if (payload.download) {
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      }
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
    } catch (error) {
      console.error('Error reading file:', error);
      return res.status(500).json({ error: 'Error reading file' });
    }
    
  } catch (error) {
    console.error('Error in /signed/:token route:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;