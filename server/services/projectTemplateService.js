const MariaDBService = require('./mariadbService');
const mariadbService = new MariaDBService();
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
          COUNT(ptw.widget_id) as widget_count
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
      
      const templates = await mariadbService.query(query, params);
      
      // Récupérer les widgets pour chaque modèle
      for (const template of templates) {
        template.widgets = await this.getTemplateWidgets(template.id);
        template.tags = template.tags ? JSON.parse(template.tags) : [];
      }
      
      return { success: true, data: templates };
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération des modèles', 'project_templates', null, null, { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupérer un modèle de projet par ID
   */
  async getTemplateById(templateId) {
    try {
      const query = 'SELECT * FROM project_templates WHERE id = ? AND is_active = 1';
      const templates = await mariadbService.query(query, [templateId]);
      
      if (templates.length === 0) {
        return { success: false, error: 'Modèle non trouvé' };
      }
      
      const template = templates[0];
      template.widgets = await this.getTemplateWidgets(templateId);
      template.tags = template.tags ? JSON.parse(template.tags) : [];
      
      return { success: true, data: template };
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération du modèle', 'project_templates', null, null, { templateId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Créer un nouveau modèle de projet
   */
  async createTemplate(templateData, agentId) {
    try {
      // Validation des données
      const validation = validationService.validateProjectTemplate(templateData);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      const { name, description, duration_estimate, tags, icon, color, category, widgets } = templateData;
      
      // Insérer le modèle
      const insertQuery = `
        INSERT INTO project_templates (name, description, duration_estimate, tags, icon, color, category)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const result = await mariadbService.query(insertQuery, [
        name,
        description,
        duration_estimate || null,
        JSON.stringify(tags || []),
        icon || 'fas fa-project-diagram',
        color || '#3B82F6',
        category || 'general'
      ]);
      
      const templateId = result.insertId;
      
      // Associer les widgets si fournis
      if (widgets && widgets.length > 0) {
        await this.updateTemplateWidgets(templateId, widgets);
      }
      
      systemLogsService.info('Modèle de projet créé', 'project_templates', agentId, null, { templateId, name });
      
      return { success: true, data: { id: templateId, ...templateData } };
    } catch (error) {
      systemLogsService.error('Erreur lors de la création du modèle', 'project_templates', agentId, null, { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Mettre à jour un modèle de projet
   */
  async updateTemplate(templateId, templateData, agentId) {
    try {
      const { name, description, duration_estimate, tags, icon, color, category, widgets } = templateData;
      
      const updateQuery = `
        UPDATE project_templates 
        SET name = ?, description = ?, duration_estimate = ?, tags = ?, icon = ?, color = ?, category = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await mariadbService.query(updateQuery, [
        name,
        description,
        duration_estimate,
        JSON.stringify(tags || []),
        icon,
        color,
        category,
        templateId
      ]);
      
      // Mettre à jour les widgets si fournis
      if (widgets) {
        await this.updateTemplateWidgets(templateId, widgets);
      }
      
      systemLogsService.info('Modèle de projet mis à jour', 'project_templates', agentId, null, { templateId });
      
      return { success: true, data: templateData };
    } catch (error) {
      systemLogsService.error('Erreur lors de la mise à jour du modèle', 'project_templates', agentId, null, { templateId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Supprimer un modèle de projet (soft delete)
   */
  async deleteTemplate(templateId, agentId) {
    try {
      const updateQuery = 'UPDATE project_templates SET is_active = 0 WHERE id = ?';
      await mariadbService.query(updateQuery, [templateId]);
      
      systemLogsService.info('Modèle de projet supprimé', 'project_templates', agentId, null, { templateId });
      
      return { success: true };
    } catch (error) {
      systemLogsService.error('Erreur lors de la suppression du modèle', 'project_templates', agentId, null, { templateId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupérer les widgets d'un modèle
   */
  async getTemplateWidgets(templateId) {
    try {
      const query = `
        SELECT 
          w.*,
          ptw.position,
          ptw.is_enabled,
          ptw.default_config
        FROM widgets w
        INNER JOIN project_template_widgets ptw ON w.id = ptw.widget_id
        WHERE ptw.template_id = ?
        ORDER BY ptw.position
      `;
      
      const widgets = await mariadbService.query(query, [templateId]);
      
      return widgets.map(widget => ({
        ...widget,
        config_schema: widget.config_schema ? JSON.parse(widget.config_schema) : {},
        default_config: widget.default_config ? JSON.parse(widget.default_config) : {},
        permissions: widget.permissions ? JSON.parse(widget.permissions) : {}
      }));
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
      // Supprimer les anciennes associations
      await mariadbService.query('DELETE FROM project_template_widgets WHERE template_id = ?', [templateId]);
      
      // Ajouter les nouvelles associations
      for (const widget of widgets) {
        const insertQuery = `
          INSERT INTO project_template_widgets (template_id, widget_id, position, is_enabled, default_config)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        await mariadbService.query(insertQuery, [
          templateId,
          widget.widget_id,
          widget.position || 0,
          widget.is_enabled !== false,
          JSON.stringify(widget.default_config || {})
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
      
      query += ' ORDER BY category, name';
      
      const widgets = await mariadbService.query(query, params);
      
      return {
        success: true,
        data: widgets.map(widget => ({
          ...widget,
          config_schema: widget.config_schema ? JSON.parse(widget.config_schema) : {},
          default_config: widget.default_config ? JSON.parse(widget.default_config) : {},
          permissions: widget.permissions ? JSON.parse(widget.permissions) : {}
        }))
      };
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
      console.log('🔍 Début createProjectFromTemplate:', { templateId, projectData, agentId });
      
      // Récupérer le modèle
      console.log('📋 Récupération du modèle...');
      const templateResult = await this.getTemplateById(templateId);
      if (!templateResult.success) {
        console.log('❌ Échec récupération modèle:', templateResult);
        return templateResult;
      }
      
      const template = templateResult.data;
      console.log('✅ Modèle récupéré:', template.name);
      
      // Créer le projet
      console.log('💾 Création du projet en base...');
      const projectInsertQuery = `
        INSERT INTO projects (client_id, agent_id, template_id, title, name, description, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, 'en_cours', ?)
      `;
      
      const projectParams = [
        projectData.client_id,
        agentId,
        templateId,
        projectData.title,
        projectData.name || projectData.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
        projectData.description || template.description,
        agentId
      ];
      
      console.log('📝 Paramètres du projet:', projectParams);
      const projectResult = await mariadbService.query(projectInsertQuery, projectParams);
      console.log('✅ Projet créé avec ID:', projectResult.insertId);
      
      const projectId = projectResult.insertId;
      
      // Créer les instances de widgets pour le projet
      console.log('🔧 Création des widgets, nombre:', template.widgets.length);
      for (const widget of template.widgets) {
        console.log('🔧 Traitement widget:', { id: widget.id, name: widget.name, position: widget.position });
        const widgetInsertQuery = `
          INSERT INTO project_widgets (project_id, widget_id, position, is_enabled, widget_config)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        const widgetParams = [
          projectId,
          widget.id,
          widget.position,
          widget.is_enabled,
          JSON.stringify(widget.default_config || {})
        ];
        
        console.log('🔧 Paramètres widget:', widgetParams);
        await mariadbService.query(widgetInsertQuery, widgetParams);
        console.log('✅ Widget créé avec succès');
      }
      
      console.log('📝 Enregistrement du log système...');
      systemLogsService.info('Projet créé à partir du modèle', 'projects', agentId, null, { projectId, templateId });
      console.log('✅ Log système enregistré');
      
      console.log('🎉 Retour du résultat final...');
      return { success: true, data: { id: projectId, ...projectData, template } };
    } catch (error) {
      console.log('❌ ERREUR dans createProjectFromTemplate:', error);
      console.log('📊 Stack trace:', error.stack);
      systemLogsService.error('Erreur lors de la création du projet à partir du modèle', 'projects', agentId, null, { templateId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupérer les catégories de modèles
   */
  async getTemplateCategories() {
    try {
      const query = `
        SELECT DISTINCT category, COUNT(*) as count
        FROM project_templates 
        WHERE is_active = 1 
        GROUP BY category 
        ORDER BY category
      `;
      
      const categories = await mariadbService.query(query);
      
      return { success: true, data: categories };
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération des catégories', 'project_templates', null, null, { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupérer les widgets d'un projet
   */
  async getProjectWidgets(projectId) {
    try {
      const query = `
        SELECT 
          w.*,
          pw.position,
          pw.is_enabled,
          pw.widget_config
        FROM widgets w
        INNER JOIN project_widgets pw ON w.id = pw.widget_id
        WHERE pw.project_id = ?
        ORDER BY pw.position
      `;
      
      const widgets = await mariadbService.query(query, [projectId]);
      
      return widgets.map(widget => ({
        ...widget,
        config_schema: widget.config_schema ? JSON.parse(widget.config_schema) : {},
        widget_config: widget.widget_config ? JSON.parse(widget.widget_config) : {},
        permissions: widget.permissions ? JSON.parse(widget.permissions) : {}
      }));
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
      const query = `
        SELECT DISTINCT category, COUNT(*) as count
        FROM widgets 
        WHERE is_active = 1 
        GROUP BY category 
        ORDER BY category
      `;
      
      const categories = await mariadbService.query(query);
      
      return { success: true, data: categories };
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération des catégories de widgets', 'widgets', null, null, { error: error.message });
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ProjectTemplateService();