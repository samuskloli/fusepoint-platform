const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleAuth');
const { requireProjectView, requireProjectEdit } = require('../middleware/projectAccess');

// Middleware pour s'assurer que le projet appartient bien au client fourni
async function ensureProjectClientMatch(req, res, next) {
  try {
    const { clientId, projectId } = req.params;
    const projectCheck = await databaseService.query(
      'SELECT id FROM projects WHERE id = ? AND client_id = ?',
      [projectId, clientId]
    );
    if (projectCheck.length === 0) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }
    next();
  } catch (error) {
    console.error('Erreur vérification client-projet:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// GET /api/projects/:clientId/:projectId/config - Récupérer toutes les configurations
router.get('/:clientId/:projectId/config', 
  authenticateToken, 
  requireProjectView,
  ensureProjectClientMatch,
  async (req, res) => {
    try {
      const { clientId, projectId } = req.params;
      let configs = [];
      try {
        configs = await databaseService.query(`
                SELECT config_type, config_data, version, updated_at
                FROM project_configurations 
                WHERE client_id = ? AND project_id = ? AND is_active = TRUE
            `, [clientId, projectId]);
      } catch (dbErr) {
        console.warn('Configurations indisponibles, renvoi d\'un objet vide:', dbErr.message);
        return res.json({ success: true, data: {} });
      }

      const configObject = {};
      configs.forEach(config => {
        configObject[config.config_type] = {
          data: config.config_data,
          version: config.version,
          updated_at: config.updated_at
        };
      });

      res.json({
        success: true,
        data: configObject
      });
    } catch (error) {
      console.error('Erreur récupération configurations:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// GET /api/projects/:clientId/:projectId/config/:configType - Récupérer une configuration spécifique
router.get('/:clientId/:projectId/config/:configType', 
  authenticateToken, 
  requireProjectView,
  ensureProjectClientMatch,
  async (req, res) => {
    try {
      const { clientId, projectId, configType } = req.params;
      let configs = [];
      try {
        configs = await databaseService.query(`
                SELECT config_data, version, updated_at
                FROM project_configurations 
                WHERE client_id = ? AND project_id = ? AND config_type = ? AND is_active = TRUE
            `, [clientId, projectId, configType]);
      } catch (dbErr) {
        console.warn('Configuration spécifique indisponible, renvoi d\'un objet vide:', dbErr.message);
        return res.json({ success: true, data: {}, version: 0, updated_at: null });
      }

      if (configs.length === 0) {
        return res.status(404).json({ error: 'Configuration non trouvée' });
      }

      res.json({
        success: true,
        data: configs[0].config_data,
        version: configs[0].version,
        updated_at: configs[0].updated_at
      });
    } catch (error) {
      console.error('Erreur récupération configuration:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// PUT /api/projects/:clientId/:projectId/config/:configType - Mettre à jour une configuration
router.put('/:clientId/:projectId/config/:configType', 
  authenticateToken, 
  requireProjectEdit,
  ensureProjectClientMatch,
  async (req, res) => {
    try {
      const { clientId, projectId, configType } = req.params;
      const { config_data } = req.body;
      const userId = req.user.id;

      console.log('DEBUG PUT config:', { clientId, projectId, configType, userId, config_data });

      if (!config_data) {
        return res.status(400).json({ error: 'Données de configuration requises' });
      }

      // Vérifier si la configuration existe
      const existing = await databaseService.query(`
                SELECT version FROM project_configurations 
                WHERE client_id = ? AND project_id = ? AND config_type = ? AND is_active = TRUE
            `, [clientId, projectId, configType]);

      if (existing.length > 0) {
        // Mettre à jour
        await databaseService.query(`
                    UPDATE project_configurations 
                    SET config_data = ?, version = version + 1, updated_by = ?
                    WHERE client_id = ? AND project_id = ? AND config_type = ? AND is_active = TRUE
                `, [JSON.stringify(config_data), userId, clientId, projectId, configType]);
      } else {
        // Créer nouvelle configuration
        await databaseService.query(`
                    INSERT INTO project_configurations 
                    (client_id, project_id, config_type, config_data, created_by, updated_by)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [clientId, projectId, configType, JSON.stringify(config_data), userId, userId]);
      }

      res.json({
        success: true,
        message: 'Configuration mise à jour avec succès'
      });
    } catch (error) {
      console.error('Erreur mise à jour configuration:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// POST /api/projects/:clientId/:projectId/initialize - Initialiser les configurations depuis les templates
router.post('/:clientId/:projectId/initialize', 
  authenticateToken, 
  requireProjectEdit,
  ensureProjectClientMatch,
  async (req, res) => {
    try {
      const { clientId, projectId } = req.params;
      const { client_type } = req.body;
      const userId = req.user.id;

      if (!client_type) {
        return res.status(400).json({ error: 'Type de client requis' });
      }

      // Appeler la procédure stockée
      await databaseService.query(
        'CALL InitializeProjectConfig(?, ?, ?, ?)',
        [clientId, projectId, client_type, userId]
      );

      res.json({
        success: true,
        message: 'Configurations initialisées avec succès'
      });
    } catch (error) {
      console.error('Erreur initialisation configurations:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// GET /api/projects/:clientId/:projectId/metrics - Récupérer les métriques récentes
router.get('/:clientId/:projectId/metrics', 
  authenticateToken, 
  requireProjectView,
  ensureProjectClientMatch,
  async (req, res) => {
    try {
      const { clientId, projectId } = req.params;
      const { category, days = 30 } = req.query;
      
      let query = `
                SELECT 
                    metric_category,
                    metric_key,
                    metric_value,
                    metric_unit,
                    target_value,
                    measurement_date,
                    CASE 
                        WHEN target_value IS NOT NULL AND target_value > 0 
                        THEN (metric_value / target_value) * 100
                        ELSE metric_value
                    END as progress_percentage
                FROM project_progress_metrics 
                WHERE client_id = ? AND project_id = ? 
                AND measurement_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            `;
      
      const params = [clientId, projectId, days];
      
      if (category) {
        query += ' AND metric_category = ?';
        params.push(category);
      }
      
      query += ' ORDER BY measurement_date DESC, metric_category, metric_key';
      
      const metrics = await databaseService.query(query, params);

      // Grouper par catégorie pour faciliter l'utilisation
      const groupedMetrics = {};
      metrics.forEach(metric => {
        if (!groupedMetrics[metric.metric_category]) {
          groupedMetrics[metric.metric_category] = [];
        }
        groupedMetrics[metric.metric_category].push(metric);
      });

      res.json({
        success: true,
        data: groupedMetrics,
        total_metrics: metrics.length
      });
    } catch (error) {
      console.error('Erreur récupération métriques:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// POST /api/projects/:clientId/:projectId/metrics - Ajouter/mettre à jour des métriques
router.post('/:clientId/:projectId/metrics', 
  authenticateToken, 
  requireProjectEdit,
  ensureProjectClientMatch,
  async (req, res) => {
    try {
      const { clientId, projectId } = req.params;
      const { metrics } = req.body;

      if (!metrics || !Array.isArray(metrics)) {
        return res.status(400).json({ error: 'Tableau de métriques requis' });
      }

      // Appeler la procédure stockée
      await databaseService.query(
        'CALL UpdateProjectMetrics(?, ?, ?)',
        [clientId, projectId, JSON.stringify(metrics)]
      );

      res.json({
        success: true,
        message: 'Métriques mises à jour avec succès',
        metrics_count: metrics.length
      });
    } catch (error) {
      console.error('Erreur mise à jour métriques:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// GET /api/projects/:clientId/:projectId/dashboard - Récupérer données complètes pour le dashboard
router.get('/:clientId/:projectId/dashboard', 
  authenticateToken, 
  requireProjectView,
  ensureProjectClientMatch,
  async (req, res) => {
    try {
      const { clientId, projectId } = req.params;
      
      // Récupérer configurations actives
      const configs = await databaseService.query(`
                SELECT config_type, config_data, version, updated_at
                FROM project_configurations 
                WHERE client_id = ? AND project_id = ? AND is_active = TRUE
            `, [clientId, projectId]);

      // Récupérer métriques récentes (7 derniers jours)
      const metrics = await databaseService.query(`
                SELECT 
                    metric_category,
                    metric_key,
                    metric_value,
                    metric_unit,
                    target_value,
                    measurement_date,
                    progress_percentage
                FROM latest_project_metrics 
                WHERE client_id = ? AND project_id = ?
                AND measurement_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                ORDER BY metric_category, metric_key
            `, [clientId, projectId]);

      // Récupérer informations du projet
      const projectInfo = await databaseService.query(`
                SELECT p.name, p.description, p.status, c.name as client_name
                FROM projects p
                JOIN clients c ON p.client_id = c.id
                WHERE p.id = ? AND p.client_id = ?
            `, [projectId, clientId]);

      // Transformer les données
      const configObject = {};
      configs.forEach(config => {
        configObject[config.config_type] = {
          data: config.config_data,
          version: config.version,
          updated_at: config.updated_at
        };
      });

      const groupedMetrics = {};
      metrics.forEach(metric => {
        if (!groupedMetrics[metric.metric_category]) {
          groupedMetrics[metric.metric_category] = [];
        }
        groupedMetrics[metric.metric_category].push(metric);
      });

      res.json({
        success: true,
        data: {
          project: projectInfo[0] || null,
          configurations: configObject,
          metrics: groupedMetrics,
          last_updated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Erreur récupération dashboard:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// GET /api/templates/:clientType - Récupérer les templates pour un type de client
router.get('/templates/:clientType', 
  authenticateToken, 
  requireRole(['admin', 'agent']), 
  async (req, res) => {
    try {
      const { clientType } = req.params;
      
      const templates = await databaseService.query(`
                SELECT template_name, config_type, template_data, is_default
                FROM client_config_templates 
                WHERE client_type = ? AND is_active = TRUE
                ORDER BY config_type, is_default DESC
            `, [clientType]);

      const groupedTemplates = {};
      templates.forEach(template => {
        if (!groupedTemplates[template.config_type]) {
          groupedTemplates[template.config_type] = [];
        }
        groupedTemplates[template.config_type].push({
          name: template.template_name,
          data: template.template_data,
          is_default: template.is_default
        });
      });

      res.json({
        success: true,
        data: groupedTemplates
      });
    } catch (error) {
      console.error('Erreur récupération templates:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

module.exports = router;