const databaseService = require('./databaseService');

/**
 * Service pour gérer les dashboards de projets
 * Centralise la logique des dashboards au niveau projet (source de vérité unique)
 */
class ProjectDashboardService {
  
  /**
   * Récupérer le dashboard d'un projet
   * @param {number} projectId - ID du projet
   * @param {number} userId - ID de l'utilisateur (pour audit)
   * @returns {Object} Dashboard avec layout_json et version
   */
  async getProjectDashboard(projectId, userId = null) {
    try {
      const query = `
        SELECT 
          project_id,
          layout_json,
          version,
          updated_at,
          updated_by
        FROM project_dashboards 
        WHERE project_id = ?
      `;
      
      const dashboard = await databaseService.get(query, [projectId]);
      
      if (!dashboard) {
        // Si aucun dashboard n'existe, créer un dashboard par défaut
        return await this.createDefaultDashboard(projectId, userId);
      }
      
      // Gérer le cas où layout_json est déjà un objet ou une string
      let layout;
      if (typeof dashboard.layout_json === 'string') {
        layout = JSON.parse(dashboard.layout_json);
      } else {
        layout = dashboard.layout_json;
      }

      return {
        projectId: dashboard.project_id,
        layout: layout,
        version: dashboard.version,
        updatedAt: dashboard.updated_at,
        updatedBy: dashboard.updated_by
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du dashboard:', error);
      throw new Error('Impossible de récupérer le dashboard du projet');
    }
  }

  /**
   * Mettre à jour le dashboard d'un projet (agents uniquement)
   * @param {number} projectId - ID du projet
   * @param {Object} layout - Nouveau layout du dashboard
   * @param {number} userId - ID de l'utilisateur qui fait la modification
   * @param {number} expectedVersion - Version attendue pour éviter les conflits
   * @returns {Object} Dashboard mis à jour
   */
  async updateProjectDashboard(projectId, layout, userId, expectedVersion = null) {
    let conn;
    try {
      // Journaliser de manière sécurisée la structure du layout reçu
      const safeSummarizeLayout = (lx) => {
        try {
          const obj = typeof lx === 'string' ? JSON.parse(lx) : (lx || {})
          const wl = obj.widgetsLayout || obj.widgets || {}
          const keys = wl && typeof wl === 'object' ? Object.keys(wl) : []
          const sample = keys.slice(0, 5).map(k => {
            const v = wl[k] || {}
            return {
              key: k,
              type: v.widget_type,
              id: v.widget_id || v.widgetId,
              pos: [v.position_x, v.position_y],
              size: [v.width, v.height]
            }
          })
          return {
            hasDashboard: !!obj.dashboard,
            hasLayout: !!obj.layout,
            widgetsCount: keys.length,
            keysSample: sample
          }
        } catch (e) {
          return { parseError: true }
        }
      }
      console.info('[ProjectDashboardService] updateProjectDashboard payload summary:', safeSummarizeLayout(layout))

      conn = await databaseService.getConnection();
      await conn.beginTransaction();

      // Vérifier la version actuelle si expectedVersion est fourni
      if (expectedVersion !== null) {
        const rows = await conn.query(
          'SELECT version FROM project_dashboards WHERE project_id = ?',
          [projectId]
        );
        const currentDashboard = Array.isArray(rows) ? rows[0] : rows;
        
        if (currentDashboard && currentDashboard.version !== expectedVersion) {
          throw new Error('CONFLICT: La version du dashboard a été modifiée par un autre utilisateur');
        }
      }

      // Mettre à jour ou insérer le dashboard (même connexion)
      const layoutJson = JSON.stringify(layout);
      const updateQuery = `
        INSERT INTO project_dashboards (project_id, layout_json, version, updated_by)
        VALUES (?, ?, 1, ?)
        ON DUPLICATE KEY UPDATE
          layout_json = VALUES(layout_json),
          version = version + 1,
          updated_by = VALUES(updated_by),
          updated_at = CURRENT_TIMESTAMP
      `;
      
      await conn.query(updateQuery, [projectId, layoutJson, userId]);
      
      // Récupérer le dashboard mis à jour (même connexion)
      const updatedRows = await conn.query(
        'SELECT project_id, layout_json, version, updated_at, updated_by FROM project_dashboards WHERE project_id = ?',
        [projectId]
      );
      const updatedDashboard = Array.isArray(updatedRows) ? updatedRows[0] : updatedRows;
      
      await conn.commit();
      
      // Gérer le cas où layout_json est déjà un objet ou une string
      let updatedLayout;
      if (typeof updatedDashboard.layout_json === 'string') {
        updatedLayout = JSON.parse(updatedDashboard.layout_json);
      } else {
        updatedLayout = updatedDashboard.layout_json;
      }
      
      return {
        projectId: updatedDashboard.project_id,
        layout: updatedLayout,
        version: updatedDashboard.version,
        updatedAt: updatedDashboard.updated_at,
        updatedBy: updatedDashboard.updated_by
      };
    } catch (error) {
      if (conn) await conn.rollback();
      console.error('Erreur lors de la mise à jour du dashboard:', error);
      
      if (error.message && error.message.includes('CONFLICT')) {
        throw error; // Propager l'erreur de conflit de version
      }
      
      throw new Error('Impossible de mettre à jour le dashboard du projet');
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Créer un dashboard par défaut pour un projet
   * @param {number} projectId - ID du projet
   * @param {number} userId - ID de l'utilisateur (optionnel)
   * @returns {Object} Dashboard par défaut créé
   */
  async createDefaultDashboard(projectId, userId = null) {
    try {
      const defaultLayout = {
        widgets: [],
        layout: {
          columns: 12,
          rowHeight: 60,
          margin: [10, 10]
        },
        settings: {
          editable: true,
          resizable: true,
          draggable: true
        }
      };

      const layoutJson = JSON.stringify(defaultLayout);
      const insertQuery = `
        INSERT INTO project_dashboards (project_id, layout_json, version, updated_by)
        VALUES (?, ?, 1, ?)
        ON DUPLICATE KEY UPDATE
          layout_json = VALUES(layout_json),
          version = 1,
          updated_by = VALUES(updated_by)
      `;
      
      await databaseService.run(insertQuery, [projectId, layoutJson, userId]);
      
      return {
        projectId: projectId,
        layout: defaultLayout,
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      };
    } catch (error) {
      console.error('Erreur création dashboard par défaut:', error);
      throw new Error('Impossible de créer le dashboard par défaut');
    }
  }

  /**
   * Vérifier si l'utilisateur peut éditer le dashboard
   */
  async canEditDashboard(projectId, userId, userRole) {
    try {
      const role = String(userRole || '').toLowerCase();
      if (['admin', 'super_admin'].includes(role)) {
        return true;
      }

      // Accès édition si: membre agent/client du projet, agent assigné, ou client propriétaire
      // project_members (si disponible)
      try {
        const pm = await databaseService.get(
          'SELECT role FROM project_members WHERE project_id = ? AND user_id = ? AND is_active = 1',
          [projectId, userId]
        );
        if (pm && ['agent', 'client'].includes(String(pm.role).toLowerCase())) {
          return true;
        }
      } catch (e) {}

      // team_members (schéma alternatif)
      try {
        const tm = await databaseService.get(
          'SELECT role FROM team_members WHERE project_id = ? AND user_id = ?',
          [projectId, userId]
        );
        if (tm && ['agent', 'client'].includes(String(tm.role).toLowerCase())) {
          return true;
        }
      } catch (e) {}

      // Agent assigné au projet
      const project = await databaseService.get(
        'SELECT agent_id, client_id FROM projects WHERE id = ?',
        [projectId]
      );
      if (project && project.agent_id === userId) {
        return true;
      }

      // Client propriétaire
      if (project && role === 'client' && project.client_id === userId) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur vérification permissions édition:', error);
      return false;
    }
  }

  /**
   * Vérifier si l'utilisateur peut voir le dashboard
   */
  async canViewDashboard(projectId, userId, userRole) {
    try {
      const role = String(userRole || '').toLowerCase();
      if (['admin', 'super_admin'].includes(role)) {
        return true;
      }

      // project_members (si disponible)
      try {
        const pm = await databaseService.get(
          'SELECT id FROM project_members WHERE project_id = ? AND user_id = ? AND is_active = 1',
          [projectId, userId]
        );
        if (pm) {
          return true;
        }
      } catch (e) {}

      // team_members (schéma alternatif)
      try {
        const tm = await databaseService.get(
          'SELECT id FROM team_members WHERE project_id = ? AND user_id = ?',
          [projectId, userId]
        );
        if (tm) {
          return true;
        }
      } catch (e) {}

      // Agent assigné au projet
      const project = await databaseService.get(
        'SELECT agent_id, client_id FROM projects WHERE id = ?',
        [projectId]
      );
      if (project && project.agent_id === userId) {
        return true;
      }

      // Client propriétaire
      if (project && role === 'client' && project.client_id === userId) {
        return true;
      }

      // Accès via relation agent↔client active à travers le client du projet
      if (project && role === 'agent' && project.client_id) {
        try {
          const ac = await databaseService.get(
            'SELECT id FROM agent_clients WHERE agent_id = ? AND client_id = ? AND status = ? LIMIT 1',
            [userId, project.client_id, 'active']
          );
          if (ac) return true;
        } catch (e) {}
      }

      return false;
    } catch (error) {
      console.error('Erreur vérification permissions vue:', error);
      return false;
    }
  }

  /**
   * Migrer les dashboards depuis les configurations
   */
  async migrateDashboards() {
    try {
      const projects = await databaseService.query('SELECT id FROM projects');
      let migrated = 0;

      for (const p of projects) {
        try {
          await this.createDefaultDashboard(p.id, null);
          migrated++;
        } catch (e) {
          console.warn(`Migration échouée pour le projet ${p.id}:`, e.message);
        }
      }

      return migrated;
    } catch (error) {
      console.error('Erreur migration dashboards:', error);
      throw new Error('Impossible de migrer les dashboards');
    }
  }
}

module.exports = new ProjectDashboardService();