const express = require('express');
const router = express.Router();
const projectDashboardService = require('../services/projectDashboardService');
const { requireProjectView, requireProjectEdit } = require('../middleware/projectAccess');

/**
 * GET /api/projects/:projectId/dashboard
 * Récupérer le dashboard d'un projet
 */
router.get('/:projectId/dashboard', requireProjectView, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Récupérer le dashboard (source unique projet)
    const dashboard = await projectDashboardService.getProjectDashboard(
      parseInt(projectId),
      userId
    );

    // Générer ETag basé sur la version pour le cache
    const etag = `"${dashboard.version}"`;
    res.set('ETag', etag);

    // Vérifier If-None-Match pour le cache client
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    res.json({
      success: true,
      data: {
        projectId: dashboard.projectId,
        layout: dashboard.layout,
        version: dashboard.version,
        updatedAt: dashboard.updatedAt,
        updatedBy: dashboard.updatedBy,
        permissions: {
          canEdit:
            req.user &&
            ['agent', 'admin', 'super_admin'].includes(String(req.user.role).toLowerCase())
        }
      }
    });
  } catch (error) {
    console.error('Erreur GET dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du dashboard',
      details: error.message || 'Unknown error'
    });
  }
});

/**
 * PUT /api/projects/:projectId/dashboard
 * Mettre à jour le dashboard d'un projet (agents uniquement)
 */
router.put('/:projectId/dashboard', requireProjectEdit, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    // Accepter layout ou layout_json pour compatibilité
    const layout = req.body.layout || req.body.layout_json;
    const expectedVersion = req.body.version;

    // Valider le layout
    if (!layout || typeof layout !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Layout invalide : un objet layout est requis'
      });
    }

    // Vérifier If-Match pour la gestion des conflits
    const ifMatch = req.headers['if-match'];
    let versionToCheck = expectedVersion;

    if (ifMatch && ifMatch !== '*') {
      // Extraire la version de l'en-tête If-Match (format: "version")
      versionToCheck = parseInt(String(ifMatch).replace(/"/g, ''));
    }

    // Mettre à jour le dashboard (incrémente la version côté service)
    const updatedDashboard = await projectDashboardService.updateProjectDashboard(
      parseInt(projectId),
      layout,
      userId,
      versionToCheck
    );

    // Générer nouvel ETag
    const etag = `"${updatedDashboard.version}"`;
    res.set('ETag', etag);

    res.json({
      success: true,
      data: {
        projectId: updatedDashboard.projectId,
        layout: updatedDashboard.layout,
        version: updatedDashboard.version,
        updatedAt: updatedDashboard.updatedAt,
        updatedBy: updatedDashboard.updatedBy
      }
    });
  } catch (error) {
    console.error('Erreur PUT dashboard:', error);

    if (error.message && error.message.includes('CONFLICT')) {
      return res.status(409).json({
        success: false,
        message: 'Conflit de version : le dashboard a été modifié par un autre utilisateur',
        code: 'VERSION_CONFLICT'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du dashboard',
      details: error.message || 'Unknown error'
    });
  }
});

// Route de vérification brute pour inspection directe en base
router.get('/:projectId/dashboard/raw', requireProjectView, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    const db = require('../services/databaseService');
    const row = await db.get(
      'SELECT project_id, layout_json, version, updated_at, created_at, updated_by FROM project_dashboards WHERE project_id = ?',
      [projectId]
    );
    const normalized = row
      ? {
          ...row,
          layout_json: typeof row.layout_json === 'string' ? row.layout_json : JSON.stringify(row.layout_json)
        }
      : null;
    res.json({ success: true, data: normalized });
  } catch (error) {
    console.error('Erreur GET dashboard raw:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération brute du dashboard', details: error.message });
  }
});

router.get('/:projectId/deliverables', requireProjectView, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Essayer de récupérer depuis une table standard si elle existe
    let rows = [];
    try {
      rows = await projectDashboardService.getProjectDeliverables
        ? await projectDashboardService.getProjectDeliverables(parseInt(projectId))
        : await require('../services/databaseService').query(
            `SELECT id, title, description, status, due_date, version, submitted_by, submitted_at, approved_at, rejection_reason
             FROM project_deliverables WHERE project_id = ? AND is_active = 1
             ORDER BY COALESCE(due_date, submitted_at) ASC`,
            [projectId]
          );
    } catch (dbErr) {
      console.warn('Deliverables DB non disponible, fallback à liste vide:', dbErr.message);
      rows = [];
    }

    // Normaliser la réponse
    const deliverables = (rows || []).map((d) => ({
      id: typeof d.id === 'bigint' ? Number(d.id) : (d.id ?? null),
      title: d.title ?? '',
      description: d.description ?? '',
      status: d.status ?? 'pending',
      due_date: d.due_date ?? null,
      version: d.version ?? null,
      submitted_by: d.submitted_by ?? null,
      submitted_at: d.submitted_at ?? null,
      approved_at: d.approved_at ?? null,
      rejection_reason: d.rejection_reason ?? null
    }));

    res.json({ success: true, data: deliverables });
  } catch (error) {
    console.error('Erreur GET deliverables:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des livrables' });
  }
});

module.exports = router;