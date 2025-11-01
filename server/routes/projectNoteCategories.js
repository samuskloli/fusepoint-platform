const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');
const { authenticateToken } = require('../middleware/auth');
const { requireProjectView, requireProjectEdit } = require('../middleware/projectAccess');

/**
 * GET /api/projects/:projectId/note-categories
 */
router.get('/:projectId/note-categories', authenticateToken, requireProjectView, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    if (isNaN(projectId) || projectId <= 0) {
      return res.status(400).json({ success: false, error: 'projectId invalide' });
    }

    const proj = await databaseService.get('SELECT client_id FROM projects WHERE id = ?', [projectId]);
    if (!proj) {
      return res.status(404).json({ success: false, error: 'Projet introuvable' });
    }

    const items = await databaseService.query(
      'SELECT id, name, color, icon, parent_id, client_id, project_id, created_by, created_at, updated_at FROM note_categories WHERE client_id = ? AND project_id = ? ORDER BY name ASC',
      [proj.client_id, projectId]
    );
    return res.json({ success: true, data: { categories: items } });
  } catch (error) {
    console.error('❌ Erreur récupération catégories de notes:', error);
    return res.status(500).json({ success: false, error: 'Erreur interne lors de la récupération des catégories' });
  }
});

/**
 * POST /api/projects/:projectId/note-categories
 */
router.post('/:projectId/note-categories', authenticateToken, requireProjectEdit, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    if (isNaN(projectId) || projectId <= 0) {
      return res.status(400).json({ success: false, error: 'projectId invalide' });
    }

    const { name, color = null, icon = null, parent_id = null } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, error: 'name requis' });
    }

    const proj = await databaseService.get('SELECT client_id FROM projects WHERE id = ?', [projectId]);
    if (!proj) {
      return res.status(404).json({ success: false, error: 'Projet introuvable' });
    }

    const userId = req.user?.id || null;
    const parentIdNum = parent_id != null ? parseInt(String(parent_id), 10) : null;
    const insertSql = `
      INSERT INTO note_categories (name, color, icon, parent_id, client_id, project_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await databaseService.run(insertSql, [String(name).trim(), color, icon, parentIdNum, proj.client_id, projectId, userId]);
    const insertId = result.insertId ? Number(result.insertId) : null;
    return res.status(201).json({ success: true, data: { id: insertId } });
  } catch (error) {
    console.error('❌ Erreur création catégorie de notes:', error);
    if (String(error.message).includes('uniq_category_name_per_project')) {
      return res.status(400).json({ success: false, error: 'Une catégorie avec ce nom existe déjà pour ce projet' });
    }
    return res.status(500).json({ success: false, error: 'Erreur interne lors de la création de la catégorie' });
  }
});

/**
 * PUT /api/projects/:projectId/note-categories/:id
 */
router.put('/:projectId/note-categories/:id', authenticateToken, requireProjectEdit, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    const categoryId = parseInt(req.params.id, 10);
    if (isNaN(projectId) || projectId <= 0 || isNaN(categoryId) || categoryId <= 0) {
      return res.status(400).json({ success: false, error: 'Identifiants invalides' });
    }

    const { name, color, icon, parent_id } = req.body || {};
    const proj = await databaseService.get('SELECT client_id FROM projects WHERE id = ?', [projectId]);
    if (!proj) {
      return res.status(404).json({ success: false, error: 'Projet introuvable' });
    }

    const existing = await databaseService.get('SELECT id FROM note_categories WHERE id = ? AND client_id = ? AND project_id = ?', [categoryId, proj.client_id, projectId]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Catégorie introuvable' });
    }

    const fields = [];
    const params = [];
    if (typeof name !== 'undefined') { fields.push('name = ?'); params.push(String(name).trim()); }
    if (typeof color !== 'undefined') { fields.push('color = ?'); params.push(color); }
    if (typeof icon !== 'undefined') { fields.push('icon = ?'); params.push(icon); }
    if (typeof parent_id !== 'undefined') { 
      const parentIdNum = parent_id != null ? parseInt(String(parent_id), 10) : null; 
      fields.push('parent_id = ?'); params.push(parentIdNum);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'Aucun champ à mettre à jour' });
    }

    const sql = `UPDATE note_categories SET ${fields.join(', ')} WHERE id = ? AND client_id = ? AND project_id = ?`;
    params.push(categoryId, proj.client_id, projectId);
    await databaseService.run(sql, params);
    return res.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur mise à jour catégorie de notes:', error);
    if (String(error.message).includes('uniq_category_name_per_project')) {
      return res.status(400).json({ success: false, error: 'Une catégorie avec ce nom existe déjà pour ce projet' });
    }
    return res.status(500).json({ success: false, error: 'Erreur interne lors de la mise à jour de la catégorie' });
  }
});

/**
 * DELETE /api/projects/:projectId/note-categories/:id
 */
router.delete('/:projectId/note-categories/:id', authenticateToken, requireProjectEdit, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    const categoryId = parseInt(req.params.id, 10);
    if (isNaN(projectId) || projectId <= 0 || isNaN(categoryId) || categoryId <= 0) {
      return res.status(400).json({ success: false, error: 'Identifiants invalides' });
    }

    const proj = await databaseService.get('SELECT client_id FROM projects WHERE id = ?', [projectId]);
    if (!proj) {
      return res.status(404).json({ success: false, error: 'Projet introuvable' });
    }

    // Optional: prevent deletion if used by notes (could set category_id NULL)
    await databaseService.run('UPDATE notes SET category_id = NULL WHERE category_id = ? AND client_id = ? AND project_id = ?', [categoryId, proj.client_id, projectId]);

    const delSql = 'DELETE FROM note_categories WHERE id = ? AND client_id = ? AND project_id = ?';
    const result = await databaseService.run(delSql, [categoryId, proj.client_id, projectId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Catégorie introuvable' });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur suppression catégorie de notes:', error);
    return res.status(500).json({ success: false, error: 'Erreur interne lors de la suppression de la catégorie' });
  }
});

module.exports = router;