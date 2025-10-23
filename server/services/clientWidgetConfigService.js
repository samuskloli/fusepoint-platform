const databaseService = require('./databaseService');
const responseService = require('./responseService');

/**
 * Service pour gérer les configurations de widgets personnalisées par client et par projet
 */
class ClientWidgetConfigService {
  
  /**
   * Récupérer la configuration d'un widget pour un client et un projet spécifique
   * @param {number} clientId - ID du client
   * @param {number} projectId - ID du projet
   * @param {number} widgetId - ID du widget
   * @returns {Object} Configuration du widget
   */
  async getClientWidgetConfig(clientId, projectId, widgetId) {
    try {
      const query = `
        SELECT 
          cwc.id,
          cwc.client_id,
          cwc.project_id,
          cwc.widget_id,
          cwc.widget_config,
          cwc.position_x,
          cwc.position_y,
          cwc.width,
          cwc.height,
          cwc.is_enabled,
          cwc.is_active,
          cwc.display_order,
          cwc.permissions as client_permissions,
          cwc.created_at,
          cwc.updated_at,
          w.name as widget_name,
          w.component_name,
          w.default_config,
          w.permissions as widget_permissions,
          w.category,
          w.icon
        FROM client_widget_configs cwc
        INNER JOIN widgets w ON cwc.widget_id = w.id
        WHERE cwc.client_id = ? AND cwc.project_id = ? AND cwc.widget_id = ?
        AND cwc.is_active = 1
      `;
      
      const result = await databaseService.query(query, [clientId, projectId, widgetId]);
      
      if (result.length > 0) {
        const config = result[0];
        return {
          success: true,
          data: {
            id: config.id,
            clientId: config.client_id,
            projectId: config.project_id,
            widgetId: config.widget_id,
            widgetName: config.widget_name,
            componentName: config.component_name,
            category: config.category,
            icon: config.icon,
            config: config.widget_config ? safeParse(config.widget_config, safeParse(config.default_config, {})) : safeParse(config.default_config, {}),
            position: {
              x: config.position_x,
              y: config.position_y
            },
            size: {
              width: config.width,
              height: config.height
            },
            isEnabled: config.is_enabled,
            permissions: config.permissions ? safeParse(config.permissions, {}) : {},
            createdAt: config.created_at,
            updatedAt: config.updated_at
          }
        };
      }
      
      // Fallback: chercher la config du widget côté projet (vue agent)
      const fallbackQuery = `
        SELECT 
          w.*,
          pw.position_x,
          pw.position_y,
          pw.width,
          pw.height,
          pw.is_enabled,
          pw.widget_config,
          pw.created_at as pw_created_at,
          pw.updated_at as pw_updated_at
        FROM widgets w
        INNER JOIN project_widgets pw ON w.id = pw.widget_id
        WHERE pw.project_id = ? AND pw.widget_id = ?
        LIMIT 1
      `;
      const rows = await databaseService.query(fallbackQuery, [projectId, widgetId]);
      if (rows.length > 0) {
        const row = rows[0];
        return {
          success: true,
          data: {
            id: null,
            clientId: Number(clientId),
            projectId: Number(projectId),
            widgetId: row.id,
            widgetName: row.name,
            componentName: row.component_name,
            category: row.category,
            icon: row.icon,
            config: row.widget_config ? safeParse(row.widget_config, (row.default_config ? safeParse(row.default_config, {}) : {})) : (row.default_config ? safeParse(row.default_config, {}) : {}),
            position: {
              x: row.position_x || 0,
              y: row.position_y || 0
            },
            size: {
              width: row.width || row.default_width || 4,
              height: row.height || row.default_height || 2
            },
            isEnabled: row.is_enabled !== 0,
            permissions: row.permissions ? safeParse(row.permissions, {}) : {},
            createdAt: row.pw_created_at || null,
            updatedAt: row.pw_updated_at || null
          }
        };
      }
      
      // Si aucune configuration personnalisée ni projet, retourner la configuration par défaut
      return await this.getDefaultWidgetConfig(widgetId);
      
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration du widget:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Récupérer toutes les configurations de widgets pour un client et un projet
   * @param {number} clientId - ID du client
   * @param {number} projectId - ID du projet
   * @returns {Array} Liste des configurations de widgets
   */
  async getClientProjectWidgets(clientId, projectId) {
    try {
      const query = `
        SELECT 
          cwc.id,
          cwc.client_id,
          cwc.project_id,
          cwc.widget_id,
          cwc.widget_config,
          cwc.position_x,
          cwc.position_y,
          cwc.width,
          cwc.height,
          cwc.is_enabled,
          cwc.is_active,
          cwc.display_order,
          cwc.permissions as client_permissions,
          cwc.created_at,
          cwc.updated_at,
          w.name as widget_name,
          w.component_name,
          w.category,
          w.icon,
          w.default_config,
          w.permissions as widget_permissions
        FROM client_widget_configs cwc
        LEFT JOIN widgets w ON (
          cwc.widget_id = w.id OR 
          cwc.widget_id = w.component_name OR
          (cwc.widget_id = 'tasks' AND w.component_name = 'TasksWidget')
        )
        WHERE cwc.client_id = ? AND cwc.project_id = ? AND cwc.is_active = 1
        ORDER BY cwc.display_order ASC, cwc.position_y ASC, cwc.position_x ASC
      `;
      
      const result = await databaseService.query(query, [clientId, projectId]);
      
      let widgets = result.map(config => ({
        id: config.id,
        clientId: config.client_id,
        projectId: config.project_id,
        widgetId: config.widget_id,
        widgetName: config.widget_name,
        componentName: config.component_name,
        category: config.category,
        icon: config.icon,
        config: config.widget_config ? safeParse(config.widget_config, safeParse(config.default_config, {})) : safeParse(config.default_config, {}),
        position: {
          x: config.position_x,
          y: config.position_y
        },
        size: {
          width: config.width,
          height: config.height
        },
        isEnabled: config.is_enabled,
        displayOrder: config.display_order,
        permissions: config.client_permissions ? safeParse(config.client_permissions, (config.widget_permissions ? safeParse(config.widget_permissions, {}) : {})) : (config.widget_permissions ? safeParse(config.widget_permissions, {}) : {}),
        createdAt: config.created_at,
        updatedAt: config.updated_at
      }));
      
      // Fallback/complément: compléter avec les widgets du projet si manquants
      const projectRows = await databaseService.query(
        `SELECT w.*, pw.position_x, pw.position_y, pw.width, pw.height, pw.is_enabled, pw.widget_config,
                pw.created_at as pw_created_at, pw.updated_at as pw_updated_at
         FROM widgets w
         INNER JOIN project_widgets pw ON w.id = pw.widget_id
         WHERE pw.project_id = ?
         ORDER BY pw.position_y, pw.position_x`,
        [projectId]
      );
      
      if (widgets.length === 0) {
        // Aucun config client: renvoyer la vue projet (identique agent)
        widgets = projectRows.map((row, idx) => ({
          id: null,
          clientId: Number(clientId),
          projectId: Number(projectId),
          widgetId: row.id,
          widgetName: row.name,
          componentName: row.component_name,
          category: row.category,
          icon: row.icon,
          config: safeParse(row.widget_config) || safeParse(row.default_config) || {},
          position: { x: row.position_x || 0, y: row.position_y || 0 },
          size: { width: row.width || row.default_width || 4, height: row.height || row.default_height || 2 },
          isEnabled: row.is_enabled !== 0,
          displayOrder: idx,
          permissions: safeParse(row.permissions) || {},
          createdAt: row.pw_created_at || null,
          updatedAt: row.pw_updated_at || null
        }));
      } else {
        // Compléter: ajouter les widgets du projet absents des configs client
        const configuredIds = new Set(widgets.map(w => Number(w.widgetId)));
        const missing = projectRows.filter(r => !configuredIds.has(Number(r.id)));
        const baseCount = widgets.length;
        const toAppend = missing.map((row, i) => ({
          id: null,
          clientId: Number(clientId),
          projectId: Number(projectId),
          widgetId: row.id,
          widgetName: row.name,
          componentName: row.component_name,
          category: row.category,
          icon: row.icon,
          config: safeParse(row.widget_config) || safeParse(row.default_config) || {},
          position: { x: row.position_x || 0, y: row.position_y || 0 },
          size: { width: row.width || row.default_width || 4, height: row.height || row.default_height || 2 },
          isEnabled: row.is_enabled !== 0,
          displayOrder: baseCount + i,
          permissions: safeParse(row.permissions) || {},
          createdAt: row.pw_created_at || null,
          updatedAt: row.pw_updated_at || null
        }));
        if (toAppend.length > 0) {
          widgets = widgets.concat(toAppend);
        }
      }
      
      return { success: true, data: widgets };
      
    } catch (error) {
      console.error('Erreur lors de la récupération des widgets du projet:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Sauvegarder ou mettre à jour la configuration d'un widget pour un client
   * @param {number} clientId - ID du client
   * @param {number} projectId - ID du projet
   * @param {number} widgetId - ID du widget
   * @param {Object} configData - Données de configuration
   * @returns {Object} Résultat de l'opération
   */
  async saveClientWidgetConfig(clientId, projectId, widgetId, configData) {
    try {
      const {
        config = {},
        position = { x: 0, y: 0 },
        size = { width: 4, height: 2 },
        isEnabled = true,
        displayOrder = 0,
        permissions = {}
      } = configData;
      
      // Vérifier si une configuration existe déjà
      const existingQuery = `
        SELECT id FROM client_widget_configs 
        WHERE client_id = ? AND project_id = ? AND widget_id = ?
      `;
      
      const existing = await databaseService.query(existingQuery, [clientId, projectId, widgetId]);
      
      let result;
      
      if (existing.length > 0) {
        // Mettre à jour la configuration existante
        const updateQuery = `
          UPDATE client_widget_configs SET
            widget_config = ?,
            position_x = ?,
            position_y = ?,
            width = ?,
            height = ?,
            is_enabled = ?,
            display_order = ?,
            permissions = ?,
            is_active = 1,
            updated_at = NOW()
          WHERE id = ?
        `;
        
        result = await databaseService.query(updateQuery, [
          typeof config === 'string' ? config : JSON.stringify(config),
          position.x,
          position.y,
          size.width,
          size.height,
          isEnabled,
          displayOrder,
          typeof permissions === 'string' ? permissions : JSON.stringify(permissions),
          existing[0].id
        ]);
        
      } else {
        // Créer une nouvelle configuration
        const insertQuery = `
          INSERT INTO client_widget_configs (
            client_id, project_id, widget_id, widget_config,
            position_x, position_y, width, height,
            is_enabled, display_order, permissions, is_active,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
        `;
        
        result = await databaseService.query(insertQuery, [
          clientId,
          projectId,
          widgetId,
          typeof config === 'string' ? config : JSON.stringify(config),
          position.x,
          position.y,
          size.width,
          size.height,
          isEnabled,
          displayOrder,
          typeof permissions === 'string' ? permissions : JSON.stringify(permissions)
        ]);
      }
      
      return { success: true, data: { id: existing.length > 0 ? existing[0].id : result.insertId } };
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration du widget:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Supprimer la configuration d'un widget pour un client
   * @param {number} clientId - ID du client
   * @param {number} projectId - ID du projet
   * @param {number} widgetId - ID du widget
   * @returns {Object} Résultat de l'opération
   */
  async deleteClientWidgetConfig(clientId, projectId, widgetId) {
    try {
      const query = `
        UPDATE client_widget_configs SET
          is_active = 0,
          updated_at = NOW()
        WHERE client_id = ? AND project_id = ? AND widget_id = ?
      `;
      
      await databaseService.query(query, [clientId, projectId, widgetId]);
      
      return { success: true };
      
    } catch (error) {
      console.error('Erreur lors de la suppression de la configuration du widget:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Copier les configurations de widgets d'un projet template vers un projet client
   * @param {number} clientId - ID du client
   * @param {number} projectId - ID du projet
   * @param {number} templateId - ID du template
   * @returns {Object} Résultat de l'opération
   */
  async copyTemplateWidgetsToClient(clientId, projectId, templateId) {
    try {
      const query = `
        INSERT INTO client_widget_configs (
          client_id, project_id, widget_id, widget_config,
          position_x, position_y, width, height,
          is_enabled, display_order, permissions, is_active,
          created_at, updated_at
        )
        SELECT 
          ? as client_id,
          ? as project_id,
          ptw.widget_id,
          COALESCE(ptw.default_config, w.default_config) as widget_config,
          0 as position_x,
          ptw.position as position_y,
          w.default_width as width,
          w.default_height as height,
          ptw.is_enabled,
          ptw.position as display_order,
          '{}' as permissions,
          1 as is_active,
          NOW() as created_at,
          NOW() as updated_at
        FROM project_template_widgets ptw
        INNER JOIN widgets w ON ptw.widget_id = w.id
        WHERE ptw.template_id = ? AND ptw.is_enabled = 1
      `;
      
      const result = await databaseService.query(query, [clientId, projectId, templateId]);
      
      return { success: true, data: { copiedWidgets: result.affectedRows } };
      
    } catch (error) {
      console.error('Erreur lors de la copie des widgets du template:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Récupérer la configuration par défaut d'un widget
   * @param {number} widgetId - ID du widget
   * @returns {Object} Configuration par défaut
   */
  async getDefaultWidgetConfig(widgetId) {
    try {
      const query = `
        SELECT 
          w.*
        FROM widgets w
        WHERE w.id = ?
      `;
      
      const result = await databaseService.query(query, [widgetId]);
      
      if (result.length > 0) {
        const widget = result[0];
        return {
          success: true,
          data: {
            id: null,
            clientId: null,
            projectId: null,
            widgetId: widget.id,
            widgetName: widget.name,
            componentName: widget.component_name,
            config: widget.default_config ? safeParse(widget.default_config, {}) : {},
            position: { x: 0, y: 0 },
            size: {
              width: widget.default_width || 4,
              height: widget.default_height || 2
            },
            isEnabled: true,
            permissions: {},
            createdAt: null,
            updatedAt: null
          }
        };
      }
      
      return { success: false, error: 'Widget non trouvé' };
      
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration par défaut:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Réorganiser l'ordre d'affichage des widgets pour un client
   * @param {number} clientId - ID du client
   * @param {number} projectId - ID du projet
   * @param {Array} widgetOrders - Tableau des ordres [{widgetId, order}]
   * @returns {Object} Résultat de l'opération
   */
  async reorderClientWidgets(clientId, projectId, widgetOrders) {
    try {
      for (const { widgetId, order } of widgetOrders) {
        const query = `
          UPDATE client_widget_configs SET
            display_order = ?,
            updated_at = NOW()
          WHERE client_id = ? AND project_id = ? AND widget_id = ?
        `;
        
        await databaseService.query(query, [order, clientId, projectId, widgetId]);
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('Erreur lors de la réorganisation des widgets:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ClientWidgetConfigService();

const safeParse = (value, fallback = {}) => {
  try {
    if (!value) return fallback;
    if (typeof value === 'object') return value;
    const str = String(value);
    if (!/^\s*[\[{]/.test(str)) return fallback;
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
};