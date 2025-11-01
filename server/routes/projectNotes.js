const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');
const { requireProjectView, requireProjectEdit } = require('../middleware/projectAccess');
const { authenticateToken } = require('../middleware/auth');

function toArrayTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(t => typeof t === 'string').map(t => t.trim()).filter(Boolean);
  if (typeof tags === 'string') {
    return tags.split(',').map(t => t.trim()).filter(Boolean);
  }
  return [];
}

/**
 * GET /api/projects/:projectId/notes
 * Liste des notes du projet avec scoping strict client_id + project_id
 */
router.get('/:projectId/notes', authenticateToken, requireProjectView, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    if (isNaN(projectId) || projectId <= 0) {
      return res.status(400).json({ success: false, error: 'projectId invalide' });
    }

    const { is_pinned, widgetInstanceId, categoryId, search, includeArchived = '0', page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const offset = (pageNum - 1) * limitNum;

    const proj = await databaseService.get('SELECT client_id FROM projects WHERE id = ?', [projectId]);
    if (!proj) {
      return res.status(404).json({ success: false, error: 'Projet introuvable' });
    }

    const where = ['project_id = ?', 'client_id = ?'];
    const params = [projectId, proj.client_id];

    if (typeof is_pinned !== 'undefined') {
      where.push('is_pinned = ?');
      params.push(String(is_pinned) === 'true');
    }
    if (widgetInstanceId) {
      where.push('widget_instance_id = ?');
      params.push(parseInt(widgetInstanceId, 10));
    }
    if (categoryId) {
      where.push('category_id = ?');
      params.push(parseInt(categoryId, 10));
    }
    if (search) {
      where.push('(title LIKE ? OR content LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    // Par défaut, on n'affiche pas les notes archivées, sauf si includeArchived=1
    if (String(includeArchived) !== '1') {
      where.push('archived = 0');
    }

    const query = `
      SELECT id, title, content, is_pinned, tags, created_by, created_at, updated_at, client_id, project_id, widget_instance_id, category_id, archived, archived_at
      FROM notes
      WHERE ${where.join(' AND ')}
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(limitNum, offset);

    const items = await databaseService.query(query, params);
    const countQuery = `SELECT COUNT(*) as total FROM notes WHERE ${where.join(' AND ')}`;
    const [{ total }] = await databaseService.query(countQuery, params.slice(0, params.length - 2));
    const totalNum = typeof total === 'bigint' ? Number(total) : Number(total);

    return res.json({ success: true, data: { notes: items, pagination: { page: pageNum, limit: limitNum, total: totalNum } } });
  } catch (error) {
    console.error('❌ Erreur récupération notes projet:', error);
    return res.status(500).json({ success: false, error: 'Erreur interne lors de la récupération des notes' });
  }
});

/**
 * POST /api/projects/:projectId/notes
 * Créer une note liée strictement au client et au projet
 */
router.post('/:projectId/notes', authenticateToken, requireProjectEdit, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    if (isNaN(projectId) || projectId <= 0) {
      return res.status(400).json({ success: false, error: 'projectId invalide' });
    }

    const { title = null, content, tags = [], is_pinned = false, widget_instance_id = null, category_id = null, archived = false } = req.body || {};
    if (!content || !String(content).trim()) {
      return res.status(400).json({ success: false, error: 'content requis' });
    }

    const proj = await databaseService.get('SELECT client_id FROM projects WHERE id = ?', [projectId]);
    if (!proj) {
      return res.status(404).json({ success: false, error: 'Projet introuvable' });
    }

    const userId = req.user?.id || null;
    const tagsArray = toArrayTags(tags);

    // Sécuriser widget_instance_id: doit être un entier ou null
    const widgetIdRaw = widget_instance_id;
    let widgetInstanceId = null;
    if (widgetIdRaw !== null && typeof widgetIdRaw !== 'undefined') {
      widgetInstanceId = typeof widgetIdRaw === 'number' ? widgetIdRaw : parseInt(String(widgetIdRaw), 10);
      if (Number.isNaN(widgetInstanceId)) widgetInstanceId = null;
    }

    // Normaliser category_id
    let categoryIdNum = null;
    if (category_id !== null && typeof category_id !== 'undefined') {
      categoryIdNum = typeof category_id === 'number' ? category_id : parseInt(String(category_id), 10);
      if (Number.isNaN(categoryIdNum)) categoryIdNum = null;
    }

    const insertQuery = `
      INSERT INTO notes (title, content, client_id, project_id, widget_instance_id, category_id, created_by, is_pinned, tags, archived, archived_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
    `;
    
    const result = await databaseService.run(insertQuery, [title, content, proj.client_id, projectId, widgetInstanceId, categoryIdNum, userId, !!is_pinned, JSON.stringify(tagsArray), archived ? 1 : 0]);

    // Convertir BigInt en nombre pour éviter les erreurs de sérialisation JSON
    const insertId = result.insertId ? Number(result.insertId) : (result.affectedRows > 0 ? 'created' : null);
    
    return res.status(201).json({ success: true, data: { id: insertId } });
  } catch (error) {
    console.error('❌ Erreur création note projet:', error);
    return res.status(500).json({ success: false, error: 'Erreur interne lors de la création de la note' });
  }
});

/**
 * PUT /api/projects/:projectId/notes/:id
 * Mettre à jour une note avec scoping strict
 */
router.put('/:projectId/notes/:id', authenticateToken, requireProjectEdit, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    const noteId = parseInt(req.params.id, 10);
    if (isNaN(projectId) || projectId <= 0 || isNaN(noteId) || noteId <= 0) {
      return res.status(400).json({ success: false, error: 'Identifiants invalides' });
    }

    const { title, content, tags, is_pinned, category_id, archived } = req.body || {};
    const proj = await databaseService.get('SELECT client_id FROM projects WHERE id = ?', [projectId]);
    if (!proj) {
      return res.status(404).json({ success: false, error: 'Projet introuvable' });
    }

    const existing = await databaseService.get('SELECT id FROM notes WHERE id = ? AND client_id = ? AND project_id = ?', [noteId, proj.client_id, projectId]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Note introuvable' });
    }

    const fields = [];
    const params = [];
    if (typeof title !== 'undefined') { fields.push('title = ?'); params.push(title); }
    if (typeof content !== 'undefined') { fields.push('content = ?'); params.push(content); }
    if (typeof is_pinned !== 'undefined') { fields.push('is_pinned = ?'); params.push(!!is_pinned); }
    if (typeof tags !== 'undefined') { fields.push('tags = ?'); params.push(JSON.stringify(toArrayTags(tags))); }
    if (typeof category_id !== 'undefined') {
      let categoryIdNum = null;
      if (category_id !== null) {
        categoryIdNum = typeof category_id === 'number' ? category_id : parseInt(String(category_id), 10);
        if (Number.isNaN(categoryIdNum)) categoryIdNum = null;
      }
      fields.push('category_id = ?');
      params.push(categoryIdNum);
    }
    if (typeof archived !== 'undefined') {
      const archivedVal = !!archived ? 1 : 0;
      fields.push('archived = ?');
      params.push(archivedVal);
      if (archivedVal === 1) {
        fields.push('archived_at = NOW()');
      } else {
        fields.push('archived_at = NULL');
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'Aucun champ à mettre à jour' });
    }

    const updateQuery = `UPDATE notes SET ${fields.join(', ')} WHERE id = ? AND client_id = ? AND project_id = ?`;
    params.push(noteId, proj.client_id, projectId);
    await databaseService.run(updateQuery, params);

    return res.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur mise à jour note projet:', error);
    return res.status(500).json({ success: false, error: 'Erreur interne lors de la mise à jour de la note' });
  }
});

/**
 * DELETE /api/projects/:projectId/notes/:id
 * Supprimer une note avec scoping strict
 */
router.delete('/:projectId/notes/:id', authenticateToken, requireProjectEdit, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    const noteId = parseInt(req.params.id, 10);
    if (isNaN(projectId) || projectId <= 0 || isNaN(noteId) || noteId <= 0) {
      return res.status(400).json({ success: false, error: 'Identifiants invalides' });
    }

    const proj = await databaseService.get('SELECT client_id FROM projects WHERE id = ?', [projectId]);
    if (!proj) {
      return res.status(404).json({ success: false, error: 'Projet introuvable' });
    }

    const delQuery = 'DELETE FROM notes WHERE id = ? AND client_id = ? AND project_id = ?';
    const result = await databaseService.run(delQuery, [noteId, proj.client_id, projectId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Note introuvable' });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur suppression note projet:', error);
    return res.status(500).json({ success: false, error: 'Erreur interne lors de la suppression de la note' });
  }
});

module.exports = router;