const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;
const sharp = require('sharp');
const databaseService = require('../services/databaseService');
const { assertFileAccess } = require('../services/fileAccessService');

/**
 * GET /api/thumbnails/:fileId?size=128|256|512
 * Returns an optimized square thumbnail (cover) with EXIF orientation fixed and metadata stripped.
 * - Prefers WebP if the client Accept header includes image/webp, otherwise JPEG.
 * - Caches generated thumbnails on disk and serves with strong ETag and long Cache-Control.
 */
router.get('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const sizeParam = parseInt(String(req.query.size || '256'), 10);
    const allowedSizes = [128, 256, 512];
    const size = allowedSizes.includes(sizeParam) ? sizeParam : 256;

    // Determine preferred format based on Accept header
    const accept = String(req.headers.accept || '');
    const prefersWebp = accept.includes('image/webp');
    const format = prefersWebp ? 'webp' : 'jpeg';
    const contentType = prefersWebp ? 'image/webp' : 'image/jpeg';

    // Contrôle d'accès multi-tenant via utilitaire
    const tenantId = req.tenantId ?? (req.user?.tenantId || req.user?.company_id);
    let fileRow;
    try {
      fileRow = await assertFileAccess(fileId, tenantId);
    } catch (err) {
      if (err.code === 'NOT_FOUND') {
        console.warn(`📦 Thumbnail NOT_FOUND fileId=${fileId} tenantId=${tenantId} userId=${req.userId || req.user?.id}`);
        return res.status(404).json({ success: false, error: 'File not found' });
      }
      if (err.code === 'FORBIDDEN') {
        const row = await databaseService.get('SELECT client_id FROM files WHERE id = ?', [fileId]);
    const rowTenant = row ? row.client_id : undefined;
        console.warn(`🚫 Thumbnail FORBIDDEN fileId=${fileId} fileTenant=${rowTenant} reqTenant=${tenantId} userId=${req.userId || req.user?.id}`);
        return res.status(403).json({ success: false, error: 'FORBIDDEN' });
      }
      console.error('❌ Thumbnail access error:', err);
      return res.status(500).json({ success: false, error: 'Failed to generate thumbnail' });
    }

    // Resolve original file path
    const clientId = fileRow.client_id || fileRow.clientId;
    const projectId = fileRow.project_id || fileRow.projectId;
    const fileName = fileRow.name || fileRow.filename || fileRow.original_name || fileRow.originalName;
    const directPath = fileRow.path || fileRow.file_path;

    let sourceFilePath;
    if (directPath && fs.existsSync(directPath)) {
      sourceFilePath = directPath;
    } else if (clientId && projectId && fileName) {
      sourceFilePath = path.join(process.cwd(), 'uploads', 'clients', String(clientId), 'projects', String(projectId), 'files', String(fileName));
    }

    if (!sourceFilePath || !fs.existsSync(sourceFilePath)) {
      console.warn(`📦 Thumbnail source missing fileId=${fileId} clientId=${clientId} projectId=${projectId}`);
      return res.status(404).json({ success: false, error: 'Source file not found on disk' });
    }

    // Determine cache path for thumbnails
    const thumbnailsDir = path.join(process.cwd(), 'uploads', 'clients', String(clientId), 'projects', String(projectId), 'thumbnails', String(size));
    const baseName = path.parse(fileName).name; // without extension
    const cachedThumbPath = path.join(thumbnailsDir, `${baseName}.${format}`);

    await fsp.mkdir(thumbnailsDir, { recursive: true });

    // If cached thumbnail exists, send it directly
    if (fs.existsSync(cachedThumbPath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Content-Type', contentType);
      return res.sendFile(cachedThumbPath);
    }

    // Generate thumbnail with sharp
    const image = sharp(sourceFilePath, { failOn: 'none' });
    const processed = await image
      .rotate() // respect EXIF orientation
      .resize({ width: size, height: size, fit: 'cover', position: 'centre' })
      .toFormat(format, { quality: 85 })
      .toBuffer();

    // Write to cache
    await fsp.writeFile(cachedThumbPath, processed);

    // Serve from cache path to leverage ETag via sendFile
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Type', contentType);
    return res.sendFile(cachedThumbPath);
  } catch (error) {
    console.error('❌ Thumbnail generation error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate thumbnail' });
  }
});

router.head('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const sizeParam = parseInt(String(req.query.size || '256'), 10);
    const allowedSizes = [128, 256, 512];
    const size = allowedSizes.includes(sizeParam) ? sizeParam : 256;

    const accept = String(req.headers.accept || '');
    const prefersWebp = accept.includes('image/webp');
    const contentType = prefersWebp ? 'image/webp' : 'image/jpeg';

    const tenantId = req.tenantId ?? (req.user?.tenantId || req.user?.company_id);
    let fileRow;
    try {
      fileRow = await assertFileAccess(fileId, tenantId);
    } catch (err) {
      if (err.code === 'NOT_FOUND') {
        console.warn(`📦 Thumbnail HEAD NOT_FOUND fileId=${fileId} tenantId=${tenantId} userId=${req.userId || req.user?.id}`);
        return res.status(404).end();
      }
      if (err.code === 'FORBIDDEN') {
        const row = await databaseService.get('SELECT client_id FROM files WHERE id = ?', [fileId]);
        const rowTenant = row ? row.client_id : undefined;
        console.warn(`🚫 Thumbnail HEAD FORBIDDEN fileId=${fileId} fileTenant=${rowTenant} reqTenant=${tenantId} userId=${req.userId || req.user?.id}`);
        return res.status(403).end();
      }
      console.error('❌ Thumbnail HEAD access error:', err);
      return res.status(500).end();
    }

    const clientId = fileRow.client_id || fileRow.clientId;
    const projectId = fileRow.project_id || fileRow.projectId;
    const fileName = fileRow.name || fileRow.filename || fileRow.original_name || fileRow.originalName;
    const directPath = fileRow.path || fileRow.file_path;

    let sourceFilePath;
    if (directPath && fs.existsSync(directPath)) {
      sourceFilePath = directPath;
    } else if (clientId && projectId && fileName) {
      sourceFilePath = path.join(process.cwd(), 'uploads', 'clients', String(clientId), 'projects', String(projectId), 'files', String(fileName));
    }

    if (!sourceFilePath || !fs.existsSync(sourceFilePath)) {
      return res.status(404).end();
    }

    const thumbnailsDir = path.join(process.cwd(), 'uploads', 'clients', String(clientId), 'projects', String(projectId), 'thumbnails', String(size));
    const baseName = path.parse(fileName).name;
    const cachedWebp = path.join(thumbnailsDir, `${baseName}.webp`);
    const cachedJpeg = path.join(thumbnailsDir, `${baseName}.jpeg`);

    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Thumbnail-Available', (fs.existsSync(cachedWebp) || fs.existsSync(cachedJpeg)) ? '1' : '0');
    return res.status(200).end();
  } catch (e) {
    return res.status(500).end();
  }
});

module.exports = router;