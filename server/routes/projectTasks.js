const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');
const { requireProjectView, requireProjectEdit } = require('../middleware/projectAccess');
const { authenticateToken } = require('../middleware/auth');

// Helper: detect columns
async function getTaskColumns() {
  try {
    const columns = await databaseService.query('SHOW COLUMNS FROM tasks');
    const colNames = columns.map(c => c.Field);
    const has = (name) => colNames.includes(name);
    return { has };
  } catch (e) {
    const has = () => true;
    return { has };
  }
}

/**
 * GET /api/projects/:projectId/tasks
 * Liste unifiée des tâches par projet (agent + client si membre)
 */
router.get('/:projectId/tasks', authenticateToken, requireProjectView, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    if (isNaN(projectId) || projectId <= 0) {
      return res.status(400).json({ success: false, error: 'projectId invalide' });
    }

    const { status, priority, assigned_to, page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const offset = (pageNum - 1) * limitNum;

    // Ensure client scoping consistency when client_id exists
    const proj = await databaseService.get('SELECT client_id FROM projects WHERE id = ?', [projectId]);
    if (!proj) {
      return res.status(404).json({ success: false, error: 'Projet introuvable' });
    }

    const where = ['project_id = ?'];
    const params = [projectId];

    if (proj.client_id) {
      where.push('client_id = ?');
      params.push(proj.client_id);
    }
    if (status) {
      where.push('status = ?');
      params.push(status);
    }
    if (priority) {
      where.push('priority = ?');
      params.push(priority);
    }
    if (assigned_to) {
      where.push('assigned_to = ?');
      params.push(assigned_to);
    }

    const tasksQuery = `
      SELECT id, title, description, status, priority, assigned_to, due_date, created_at, updated_at, client_id, project_id
      FROM tasks
      WHERE ${where.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(limitNum, offset);

    const tasks = await databaseService.query(tasksQuery, params);

    const countQuery = `SELECT COUNT(*) as total FROM tasks WHERE ${where.join(' AND ')}`;
    const [{ total }] = await databaseService.query(countQuery, params.slice(0, params.length - 2));
    const totalNum = typeof total === 'bigint' ? Number(total) : Number(total);

    return res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalNum
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur récupération tâches projet:', error);
    return res.status(500).json({ success: false, error: 'Erreur interne lors de la récupération des tâches' });
  }
});

/**
 * POST /api/projects/:projectId/tasks
 * Crée une nouvelle tâche dans un projet
 */
router.post('/:projectId/tasks', authenticateToken, requireProjectEdit, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    if (isNaN(projectId) || projectId <= 0) {
      return res.status(400).json({ success: false, error: 'projectId invalide' });
    }

    const { title, description, priority = 'medium', assigned_to = null, due_date = null } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'title et description requis' });
    }

    const proj = await databaseService.get('SELECT client_id FROM projects WHERE id = ?', [projectId]);
    if (!proj) {
      return res.status(404).json({ success: false, error: 'Projet introuvable' });
    }

    const insertQuery = `
      INSERT INTO tasks (title, description, priority, assigned_to, due_date, project_id, client_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [title, description, priority, assigned_to, due_date, projectId, proj.client_id];

    const result = await databaseService.run(insertQuery, params);

    return res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    console.error('❌ Erreur création tâche projet:', error);
    return res.status(500).json({ success: false, error: 'Erreur interne lors de la création de la tâche' });
  }
});

module.exports = router;