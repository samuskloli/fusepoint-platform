const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');
const { requireProjectView } = require('../middleware/projectAccess');
const { authenticateToken } = require('../middleware/auth');

// Helper: dynamic columns for robust compatibility
async function getFileColumns() {
  try {
    const columns = await databaseService.query('SHOW COLUMNS FROM files');
    const colNames = columns.map(c => c.Field);
    const has = (name) => colNames.includes(name);
    return { has };
  } catch (err) {
    // Fallback: assume modern schema
    const has = () => true;
    return { has };
  }
}

/**
 * GET /api/projects/:projectId/files
 * Unified project-scoped file listing with standardized access control
 * Query: path(optional), page(default 1), limit(default 50)
 */
router.get('/:projectId/files', authenticateToken, requireProjectView, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    if (isNaN(projectId) || projectId <= 0) {
      return res.status(400).json({ success: false, error: 'projectId invalide' });
    }

    const { has } = await getFileColumns();
    const { path: folderPath = '/', page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const offset = (pageNum - 1) * limitNum;

    // Build select dynamically for compatibility
    const selectCols = [
      'id',
      has('name') ? 'name' : 'filename AS name',
      'original_name',
      has('size') ? 'size' : 'file_size AS size',
      'mime_type',
      has('client_id') ? 'client_id' : 'NULL AS client_id',
      has('project_id') ? 'project_id' : `${projectId} AS project_id`,
      has('folder_path') ? 'folder_path' : `'/' AS folder_path`,
      'created_at',
      has('updated_at') ? 'updated_at' : 'created_at AS updated_at',
      has('created_by') ? 'created_by' : 'uploaded_by AS created_by',
      has('url') ? 'url' : 'NULL AS url',
      has('thumbnail') ? 'thumbnail' : 'NULL AS thumbnail'
    ].join(', ');

    let whereClause = 'WHERE project_id = ?';
    const params = [projectId];

    if (has('client_id')) {
      // Ensure consistent scoping with client_id when present
      const proj = await databaseService.get('SELECT client_id FROM projects WHERE id = ?', [projectId]);
      if (!proj) {
        return res.status(404).json({ success: false, error: 'Projet introuvable' });
      }
      whereClause += ' AND client_id = ?';
      params.push(proj.client_id);
    }

    if (has('folder_path')) {
      whereClause += ' AND folder_path = ?';
      params.push(folderPath);
    }

    if (has('is_deleted')) {
      whereClause += ' AND is_deleted = FALSE';
    }

    const filesQuery = `
      SELECT ${selectCols}
      FROM files
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(limitNum, offset);

    const files = await databaseService.query(filesQuery, params);

    // Build public URL if absent, based on normalized uploads path
    const projRow = await databaseService.get('SELECT client_id FROM projects WHERE id = ?', [projectId]);
    const clientId = projRow ? projRow.client_id : null;
    const buildPublicUrl = (fname) => clientId ? `/uploads/clients/${clientId}/projects/${projectId}/files/${fname}` : '';

    const filesWithUrl = files.map(f => ({
      ...f,
      url: (typeof f.url === 'string' && f.url) ? f.url : (f.name ? buildPublicUrl(f.name) : f.url)
    }));

    // Count total
    let countWhere = 'WHERE project_id = ?';
    const countParams = [projectId];
    if (has('client_id')) {
      countWhere += ' AND client_id = ?';
      countParams.push(clientId);
    }
    if (has('folder_path')) {
      countWhere += ' AND folder_path = ?';
      countParams.push(folderPath);
    }
    if (has('is_deleted')) {
      countWhere += ' AND is_deleted = FALSE';
    }
    const countQuery = `SELECT COUNT(*) as total FROM files ${countWhere}`;
    const [{ total }] = await databaseService.query(countQuery, countParams);
    const totalNum = typeof total === 'bigint' ? Number(total) : Number(total);

    return res.json({
      success: true,
      data: {
        files: filesWithUrl,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalNum
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur fichiers projet unifiés:', error);
    return res.status(500).json({ success: false, error: 'Erreur interne lors de la récupération des fichiers' });
  }
});

module.exports = router;