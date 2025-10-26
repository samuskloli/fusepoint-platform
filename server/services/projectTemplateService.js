const databaseService = require('./databaseService');
const systemLogsService = require('./systemLogsService');
const validationService = require('./validationService');

class ProjectTemplateService {
  /**
   * Récupérer tous les modèles de projets
   */
  async getAllTemplates(filters = {}) {
    try {
      let query = `
        SELECT 
          pt.*,
          CAST(COUNT(ptw.widget_id) AS UNSIGNED) as widget_count
        FROM project_templates pt
        LEFT JOIN project_template_widgets ptw ON pt.id = ptw.template_id
        WHERE pt.is_active = 1
      `;
      
      const params = [];
      
      if (filters.category) {
        query += ' AND pt.category = ?';
        params.push(filters.category);
      }
      
      if (filters.search) {
        query += ' AND (pt.name LIKE ? OR pt.description LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      
      query += ' GROUP BY pt.id ORDER BY pt.name';
      
      const templates = await databaseService.query(query, params);
      
      // Récupérer les widgets pour chaque modèle
      for (const template of templates) {
        // Normaliser BigInt pour la sérialisation JSON
        if (typeof template.widget_count === 'bigint') {
          template.widget_count = Number(template.widget_count);
        }
        
        template.widgets = await this.getTemplateWidgets(template.id);
        try {
          if (!template.tags) {
            template.tags = [];
          } else if (typeof template.tags === 'string') {
            const t = template.tags.trim();
            if (t.startsWith('[') || t.startsWith('{')) {
              template.tags = JSON.parse(t);
            } else {
              template.tags = t.split(',').map(s => s.trim()).filter(Boolean);
            }
          } else if (Array.isArray(template.tags)) {
            // keep as-is
          } else {
            template.tags = [];
          }
        } catch (e) { template.tags = []; };
      }
      
      return { success: true, data: templates };
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération des modèles', 'project_templates', null, null, { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupérer un modèle par ID
   */
  async getTemplateById(templateId) {
    try {
      const template = await databaseService.get(
        'SELECT * FROM project_templates WHERE id = ? AND is_active = 1',
        [templateId]
      );
      
      if (!template) {
        return { success: false, error: 'Modèle non trouvé' };
      }
      
      template.widgets = await this.getTemplateWidgets(templateId);
      try {
        if (!template.tags) {
          template.tags = [];
        } else if (typeof template.tags === 'string') {
          const t = template.tags.trim();
          if (t.startsWith('[') || t.startsWith('{')) {
            template.tags = JSON.parse(t);
          } else {
            template.tags = t.split(',').map(s => s.trim()).filter(Boolean);
          }
        } else if (Array.isArray(template.tags)) {
          // keep as-is
        } else {
          template.tags = [];
        }
      } catch (e) { template.tags = []; };
      
      return { success: true, data: template };
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération du modèle', 'project_templates', null, null, { templateId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Créer un nouveau modèle
   */
  async createTemplate(templateData, agentId) {
    try {
      const validation = validationService.validateProjectTemplate(templateData);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      const result = await databaseService.run(`
        INSERT INTO project_templates (
          name, description, category, tags, 
          estimated_duration, estimated_budget, 
          created_by, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `, [
        templateData.name,
        templateData.description,
        templateData.category,
        JSON.stringify(templateData.tags || []),
        templateData.estimated_duration,
        templateData.estimated_budget,
        agentId
      ]);

      const templateId = result.insertId;

      // Ajouter les widgets si fournis
      if (templateData.widgets && templateData.widgets.length > 0) {
        await this.updateTemplateWidgets(templateId, templateData.widgets);
      }

      systemLogsService.info('Nouveau modèle de projet créé', 'project_templates', agentId, null, { templateId, name: templateData.name });
      
      return { success: true, data: { id: templateId } };
    } catch (error) {
      systemLogsService.error('Erreur lors de la création du modèle', 'project_templates', agentId, null, { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Mettre à jour un modèle
   */
  async updateTemplate(templateId, templateData, agentId) {
    try {
      const validation = validationService.validateProjectTemplate(templateData);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      await databaseService.run(`
        UPDATE project_templates SET 
          name = ?, description = ?, category = ?, tags = ?,
          estimated_duration = ?, estimated_budget = ?,
          updated_at = NOW()
        WHERE id = ?
      `, [
        templateData.name,
        templateData.description,
        templateData.category,
        JSON.stringify(templateData.tags || []),
        templateData.estimated_duration,
        templateData.estimated_budget,
        templateId
      ]);

      // Mettre à jour les widgets si fournis dans la payload
      if (Array.isArray(templateData.widgets)) {
        try {
          await this.updateTemplateWidgets(templateId, templateData.widgets);
        } catch (widgetsError) {
          systemLogsService.error('Erreur lors de la mise à jour des widgets du modèle (updateTemplate)', 'project_templates', agentId, null, { templateId, error: widgetsError.message });
          return { success: false, error: widgetsError.message };
        }
      }

      systemLogsService.info('Modèle de projet mis à jour', 'project_templates', agentId, null, { templateId, name: templateData.name });
      return { success: true, data: { id: templateId } };
    } catch (error) {
      systemLogsService.error('Erreur lors de la mise à jour du modèle', 'project_templates', agentId, null, { templateId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Supprimer un modèle
   */
  async deleteTemplate(templateId, agentId) {
    try {
      await databaseService.run(
        'UPDATE project_templates SET is_active = 0 WHERE id = ?',
        [templateId]
      );

      systemLogsService.info('Modèle de projet supprimé', 'project_templates', agentId, null, { templateId });
      return { success: true };
    } catch (error) {
      systemLogsService.error('Erreur lors de la suppression du modèle', 'project_templates', agentId, null, { templateId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Dupliquer un modèle
   */
  async duplicateTemplate(templateId, agentId) {
    try {
      // Récupérer le modèle original
      const originalTemplateResult = await this.getTemplateById(templateId);
      if (!originalTemplateResult.success) {
        return originalTemplateResult;
      }

      const originalTemplate = originalTemplateResult.data;

      // Créer le nouveau modèle avec un nom modifié
      const duplicatedName = `${originalTemplate.name} (Copie)`;
      
      const result = await databaseService.run(`
        INSERT INTO project_templates (
          name, description, category, tags, 
          estimated_duration, estimated_budget, 
          created_by, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `, [
        duplicatedName,
        originalTemplate.description,
        originalTemplate.category,
        JSON.stringify(originalTemplate.tags || []),
        originalTemplate.estimated_duration,
        originalTemplate.estimated_budget,
        agentId
      ]);

      const newTemplateId = result.insertId;

      // Copier les widgets du modèle original
      if (originalTemplate.widgets && originalTemplate.widgets.length > 0) {
        await this.updateTemplateWidgets(newTemplateId, originalTemplate.widgets);
      }

      systemLogsService.info('Modèle de projet dupliqué', 'project_templates', agentId, null, { 
        originalTemplateId: templateId, 
        newTemplateId, 
        name: duplicatedName 
      });
      
      return { success: true, data: { id: newTemplateId, name: duplicatedName } };
    } catch (error) {
      systemLogsService.error('Erreur lors de la duplication du modèle', 'project_templates', agentId, null, { 
        templateId, 
        error: error.message 
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupérer les widgets d'un modèle
   */
  async getTemplateWidgets(templateId) {
    try {
      const widgets = await databaseService.query(`
        SELECT 
          ptw.*,
          w.name as widget_name,
          w.description as widget_description,
          w.category as widget_category,
          w.component_name,
          w.default_config as widget_default_config
        FROM project_template_widgets ptw
        JOIN widgets w ON ptw.widget_id = w.id
        WHERE ptw.template_id = ?
        ORDER BY ptw.position
      `, [templateId]);

      return widgets.map(widget => {
        let cfg = {};
        let defCfg = {};
        
        // Parse config
        if (widget.config) {
          try {
            if (typeof widget.config === 'object' && widget.config !== null) {
              cfg = widget.config;
            } else if (typeof widget.config === 'string') {
              cfg = JSON.parse(widget.config);
            }
          } catch (e) { 
            cfg = {}; 
          }
        }

        // Utilitaires de parsing JSON sûrs
        const parseJson = (val) => {
          try {
            if (!val) return {};
            if (typeof val === 'object' && val !== null) return val;
            if (typeof val === 'string') return JSON.parse(val);
            return {};
          } catch { return {}; }
        };

        const templateDefault = parseJson(widget.default_config);
        const widgetDefault = parseJson(widget.widget_default_config);
        defCfg = Object.keys(templateDefault).length ? templateDefault : widgetDefault;
        
        return {
          ...widget,
          config: cfg,
          default_config: defCfg
        };
      });
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération des widgets du modèle', 'project_templates', null, null, { templateId, error: error.message });
      return [];
    }
  }

  /**
   * Mettre à jour les widgets d'un modèle
   */
  async updateTemplateWidgets(templateId, widgets) {
    try {
      // Supprimer les widgets existants
      await databaseService.run(
        'DELETE FROM project_template_widgets WHERE template_id = ?',
        [templateId]
      );

      // Ajouter les nouveaux widgets
      for (let i = 0; i < widgets.length; i++) {
        const widget = widgets[i];
        await databaseService.run(`
          INSERT INTO project_template_widgets (
            template_id, widget_id, position, config, is_required
          ) VALUES (?, ?, ?, ?, ?)
        `, [
          templateId,
          widget.widget_id,
          i + 1,
          JSON.stringify(widget.config || {}),
          widget.is_required || 0
        ]);
      }

      return { success: true };
    } catch (error) {
      systemLogsService.error('Erreur lors de la mise à jour des widgets du modèle', 'project_templates', null, null, { templateId, error: error.message });
      throw error;
    }
  }

  /**
   * Récupérer tous les widgets disponibles
   */
  async getAllWidgets(filters = {}) {
    try {
      let query = 'SELECT * FROM widgets WHERE is_active = 1';
      const params = [];

      if (filters.category) {
        query += ' AND category = ?';
        params.push(filters.category);
      }

      if (filters.search) {
        query += ' AND (name LIKE ? OR description LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      query += ' ORDER BY category, name';

      const widgets = await databaseService.query(query, params);
      
      const processedWidgets = widgets.map(widget => {
        let defaultConfig = {};
        
        if (widget.default_config) {
          try {
            // Si c'est déjà un objet valide (et pas null), l'utiliser tel quel
            if (typeof widget.default_config === 'object' && widget.default_config !== null) {
              defaultConfig = widget.default_config;
            } else if (typeof widget.default_config === 'string') {
              // Si c'est une chaîne, essayer de la parser
              defaultConfig = JSON.parse(widget.default_config);
            }
          } catch (parseError) {
            console.warn(`Erreur parsing default_config pour widget ${widget.id}:`, parseError);
            defaultConfig = {};
          }
        }
        
        return {
          ...widget,
          default_config: defaultConfig
        };
      });

      return { success: true, data: processedWidgets };
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération des widgets', 'widgets', null, null, { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Créer un projet à partir d'un modèle
   */
  async createProjectFromTemplate(templateId, projectData, agentId) {
    try {
      // Récupérer le modèle
      const templateResult = await this.getTemplateById(templateId);
      if (!templateResult.success) {
        return templateResult;
      }

      const template = templateResult.data;

      // Créer le projet
      const projectResult = await databaseService.run(`
        INSERT INTO projects (
          title, name, description, client_id, agent_id,
          status, budget, template_id, created_at
        ) VALUES (?, ?, ?, ?, ?, 'en_cours', ?, ?, NOW())
      `, [
        projectData.name, // title
        projectData.name, // name
        projectData.description || template.description,
        projectData.client_id,
        agentId,
        template.estimated_budget || null,
        templateId
      ]);

      const projectId = Number(projectResult.insertId);

      // Copier les widgets du modèle vers le projet
      for (const widget of template.widgets) {
        await databaseService.run(`
          INSERT INTO project_widgets (
            project_id, widget_id, position, widget_config, is_enabled
          ) VALUES (?, ?, ?, ?, ?)
        `, [
          projectId,
          widget.widget_id,
          widget.position || 0,
          JSON.stringify(widget.config || widget.default_config || {}),
          (widget.is_enabled === 0 || widget.is_enabled === false) ? 0 : 1
        ]);
      }

      // Créer les tâches par défaut basées sur le modèle
      const defaultTasks = [
        {
          title: 'Analyse des besoins',
          description: 'Analyser les besoins spécifiques du client',
          status: 'pending',
          priority: 'high'
        },
        {
          title: 'Planification du projet',
          description: 'Établir le planning détaillé du projet',
          status: 'pending',
          priority: 'high'
        },
        {
          title: 'Configuration des widgets',
          description: 'Configurer les widgets selon les besoins',
          status: 'pending',
          priority: 'medium'
        }
      ];

      for (const task of defaultTasks) {
        await databaseService.run(`
          INSERT INTO tasks (
            project_id, title, description, status
          ) VALUES (?, ?, ?, ?)
        `, [
          projectId,
          task.title,
          task.description,
          task.status
        ]);
      }

      systemLogsService.info('Projet créé à partir du modèle', 'projects', agentId, null, { 
        projectId, 
        templateId, 
        projectName: projectData.name 
      });

      return { 
        success: true, 
        data: { 
          id: projectId,
          template_used: template.name
        } 
      };
    } catch (error) {
      systemLogsService.error('Erreur lors de la création du projet depuis le modèle', 'projects', agentId, null, { 
        templateId, 
        error: error.message 
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupérer les catégories de modèles
   */
  async getTemplateCategories() {
    try {
      const categories = await databaseService.query(`
        SELECT DISTINCT category 
        FROM project_templates 
        WHERE is_active = 1 AND category IS NOT NULL
        ORDER BY category
      `);

      const categoryList = categories.map(row => row.category);
      return { success: true, data: categoryList };
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération des catégories de modèles', 'project_templates', null, null, { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupérer les widgets d'un projet
   */
  async getProjectWidgets(projectId) {
    try {
      const widgets = await databaseService.query(`
        SELECT 
          pw.*,
          w.name as widget_name,
          w.description as widget_description,
          w.category as widget_category,
          w.component_name,
          w.default_config
        FROM project_widgets pw
        JOIN widgets w ON pw.widget_id = w.id
        WHERE pw.project_id = ?
        ORDER BY pw.position
      `, [projectId]);

      return widgets.map(widget => {
        let cfg = {};
        let defCfg = {};
        
        // Parse config
        if (widget.config) {
          try {
            if (typeof widget.config === 'object' && widget.config !== null) {
              cfg = widget.config;
            } else if (typeof widget.config === 'string') {
              cfg = JSON.parse(widget.config);
            }
          } catch (e) { 
            cfg = {}; 
          }
        }
        
        // Parse default_config
        if (widget.default_config) {
          try {
            if (typeof widget.default_config === 'object' && widget.default_config !== null) {
              defCfg = widget.default_config;
            } else if (typeof widget.default_config === 'string') {
              defCfg = JSON.parse(widget.default_config);
            }
          } catch (e) { 
            defCfg = {}; 
          }
        }
        
        return {
          ...widget,
          config: cfg,
          default_config: defCfg
        };
      });
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération des widgets du projet', 'projects', null, null, { projectId, error: error.message });
      return [];
    }
  }

  /**
   * Récupérer les catégories de widgets
   */
  async getWidgetCategories() {
    try {
      const categories = await databaseService.query(`
        SELECT DISTINCT category 
        FROM widgets 
        WHERE is_active = 1 AND category IS NOT NULL
        ORDER BY category
      `);

      const categoryList = categories.map(row => row.category);
      return { success: true, data: categoryList };
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération des catégories de widgets', 'widgets', null, null, { error: error.message });
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ProjectTemplateService();