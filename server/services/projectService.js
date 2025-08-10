/**
 * Service de gestion des projets
 * Centralise toute la logique métier liée aux projets
 */

const translationService = require('./translationService');
const validationService = require('./validationService');
const databaseService = require('./databaseService');
const systemLogsService = require('./systemLogsService');

class ProjectService {
  /**
   * Récupère les projets d'un client
   * @param {number} clientId - ID du client
   * @returns {Promise<Array>} Liste des projets
   */
  async getClientProjects(clientId) {
    try {
      systemLogsService.info('Récupération des projets du client', 'projects', null, null, { clientId });
      
      const projects = await databaseService.query(
        'SELECT * FROM projects WHERE client_id = ? ORDER BY created_at DESC',
        [clientId]
      );
      
      systemLogsService.info('Projets du client récupérés avec succès', 'projects', null, null, { 
        clientId, 
        count: projects.length 
      });
      
      return projects;
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération des projets du client', 'projects', null, null, { 
        clientId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Crée un nouveau projet pour un client
   * @param {number} clientId - ID du client
   * @param {Object} projectData - Données du projet
   * @returns {Promise<Object>} Projet créé
   */
  async createProject(clientId, projectData) {
    try {
      systemLogsService.info('Création d\'un nouveau projet', 'projects', null, null, { clientId });
      
      // Validation des données
      const validation = validationService.validateProjectData(projectData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Vérifier que le client existe et récupérer son agent assigné
      const client = await databaseService.get(
        'SELECT id, agent_id FROM users WHERE id = ? AND role IN ("client", "user")',
        [clientId]
      );
      
      if (!client) {
        throw new Error('Client non trouvé');
      }

      // Récupérer l'agent assigné au client
      const agentId = client.agent_id;

      const projectId = await databaseService.run(
        `INSERT INTO projects (client_id, agent_id, name, description, status, progress, budget, start_date, end_date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          clientId,
          agentId, // Assigner automatiquement l'agent du client au projet
          projectData.name,
          projectData.description || null,
          projectData.status || 'en_cours',
          projectData.progress || 0,
          projectData.budget || null,
          projectData.start_date || null,
          projectData.end_date || null
        ]
      );

      const project = await databaseService.get(
        'SELECT * FROM projects WHERE id = ?',
        [projectId.insertId]
      );

      systemLogsService.info('Projet créé avec succès', 'projects', null, null, { 
        clientId, 
        agentId,
        projectId: projectId.insertId 
      });
      
      return project;
    } catch (error) {
      systemLogsService.error('Erreur lors de la création du projet', 'projects', null, null, { 
        clientId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Récupère tous les projets gérés par un agent
   * @param {number} agentId - ID de l'agent
   * @returns {Promise<Array>} Liste des projets
   */
  async getAgentProjects(agentId) {
    try {
      systemLogsService.info('Récupération des projets de l\'agent', 'projects', null, null, { agentId });
      
      const projects = await databaseService.query(
        `SELECT p.*, u.first_name, u.last_name, u.email as client_email
         FROM projects p
         LEFT JOIN users u ON p.client_id = u.id
         WHERE p.agent_id = ? OR p.client_id IN (
           SELECT ac.client_id FROM agent_clients ac 
           WHERE ac.agent_id = ? AND ac.status = 'active'
         )
         ORDER BY p.created_at DESC`,
        [agentId, agentId]
      );
      
      systemLogsService.info('Projets de l\'agent récupérés avec succès', 'projects', null, null, { 
        agentId, 
        count: projects.length 
      });
      
      return projects;
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération des projets de l\'agent', 'projects', null, null, { 
        agentId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Récupère un projet par son ID
   * @param {number} projectId - ID du projet
   * @returns {Promise<Object>} Projet trouvé
   */
  async getProjectById(projectId) {
    try {
      systemLogsService.info('Récupération du projet par ID', 'projects', null, null, { projectId });
      
      const project = await databaseService.getProjectById(projectId);
      
      if (!project) {
        throw new Error('Projet non trouvé');
      }
      
      systemLogsService.info('Projet récupéré avec succès', 'projects', null, null, { projectId });
      
      return project;
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération du projet', 'projects', null, null, { 
        projectId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Récupère les détails d'un projet
   * @param {number} projectId - ID du projet
   * @returns {Promise<Object>} Détails du projet
   */
  async getProjectDetails(projectId) {
    try {
      systemLogsService.info('Récupération des détails du projet', 'projects', null, null, { projectId });
      
      const project = await databaseService.getProjectById(projectId);
      
      if (!project) {
        throw new Error('Projet non trouvé');
      }
      
      systemLogsService.info('Détails du projet récupérés avec succès', 'projects', null, null, { projectId });
      
      return project;
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération des détails du projet', 'projects', null, null, { 
        projectId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Récupère les tâches d'un projet
   * @param {number} projectId - ID du projet
   * @returns {Promise<Array>} Liste des tâches
   */
  async getProjectTasks(projectId) {
    try {
      systemLogsService.info('Récupération des tâches du projet', 'projects', null, null, { projectId });
      
      const tasks = await databaseService.getProjectTasks(projectId);
      
      systemLogsService.info('Tâches du projet récupérées avec succès', 'projects', null, null, { 
        projectId, 
        count: tasks.length 
      });
      
      return tasks;
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération des tâches du projet', 'projects', null, null, { 
        projectId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Récupère les fichiers d'un projet
   * @param {number} projectId - ID du projet
   * @returns {Promise<Array>} Liste des fichiers
   */
  async getProjectFiles(projectId) {
    try {
      systemLogsService.info('Récupération des fichiers du projet', 'projects', null, null, { projectId });
      
      const files = await databaseService.getProjectFiles(projectId);
      
      systemLogsService.info('Fichiers du projet récupérés avec succès', 'projects', null, null, { 
        projectId, 
        count: files.length 
      });
      
      return files;
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération des fichiers du projet', 'projects', null, null, { 
        projectId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Récupère les membres de l'équipe d'un projet
   * @param {number} projectId - ID du projet
   * @returns {Promise<Array>} Liste des membres
   */
  async getProjectTeamMembers(projectId) {
    try {
      systemLogsService.info('Récupération de l\'équipe du projet', 'projects', null, null, { projectId });
      
      const members = await databaseService.getProjectTeamMembers(projectId);
      
      systemLogsService.info('Équipe du projet récupérée avec succès', 'projects', null, null, { 
        projectId, 
        count: members.length 
      });
      
      return members;
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération de l\'équipe du projet', 'projects', null, null, { 
        projectId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Récupère les projets d'un client avec pagination
   * @param {number} clientId - ID du client
   * @param {Object} options - Options de pagination
   * @returns {Promise<Object>} Projets paginés
   */
  async getClientProjectsPaginated(clientId, options = {}) {
    try {
      const { page = 1, limit = 10, status = null } = options;
      const offset = (page - 1) * limit;
      
      console.log('🔍 Debug projectService.getClientProjectsPaginated - clientId:', clientId, 'options:', options);
      
      systemLogsService.info('Récupération des projets du client avec pagination', 'projects', null, null, { 
        clientId, page, limit 
      });
      
      let query = 'SELECT * FROM projects WHERE client_id = ?';
      let params = [clientId];
      
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      console.log('🔍 Debug projectService.getClientProjectsPaginated - query:', query, 'params:', params);
      
      const projects = await databaseService.query(query, params);
      console.log('🔍 Debug projectService.getClientProjectsPaginated - projects found:', projects.length, 'projects:', projects);
      
      // Compter le total
      let countQuery = 'SELECT COUNT(*) as total FROM projects WHERE client_id = ?';
      let countParams = [clientId];
      
      if (status) {
        countQuery += ' AND status = ?';
        countParams.push(status);
      }
      
      const countResult = await databaseService.get(countQuery, countParams);
      const total = Number(countResult.total); // Convertir BigInt en Number
      console.log('🔍 Debug projectService.getClientProjectsPaginated - total count:', total);
      
      systemLogsService.info('Projets du client récupérés avec pagination', 'projects', null, null, { 
        clientId, 
        count: projects.length,
        total,
        page
      });
      
      return {
        projects,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération des projets du client avec pagination', 'projects', null, null, { 
        clientId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Récupère les projets d'un agent avec pagination
   * @param {number} agentId - ID de l'agent
   * @param {Object} filters - Filtres à appliquer
   * @param {Object} options - Options de pagination
   * @returns {Promise<Object>} Projets paginés
   */
  async getAgentProjectsPaginated(agentId, filters = {}, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;
      
      systemLogsService.info('Récupération des projets de l\'agent avec pagination', 'projects', null, null, { 
        agentId, page, limit 
      });
      
      // Vérifier le rôle de l'utilisateur
      const user = await databaseService.get(
        'SELECT role FROM users WHERE id = ?',
        [agentId]
      );
      
      let query, params;
      
      // Si c'est un super admin ou admin, voir tous les projets
      if (user && (user.role === 'super_admin' || user.role === 'admin')) {
        query = `SELECT p.*, u.first_name, u.last_name, u.email as client_email
                 FROM projects p
                 LEFT JOIN users u ON p.client_id = u.id
                 WHERE 1=1`;
        params = [];
      } else {
        // Pour les agents normaux, utiliser la table agent_clients pour voir tous les projets de leurs clients assignés
        query = `SELECT p.*, u.first_name, u.last_name, u.email as client_email
                 FROM projects p
                 LEFT JOIN users u ON p.client_id = u.id
                 WHERE (p.agent_id = ? OR p.client_id IN (
                   SELECT client_id FROM agent_clients 
                   WHERE agent_id = ? AND status = 'active'
                 ))`;
        params = [agentId, agentId];
      }
      
      if (filters.status) {
        query += ' AND p.status = ?';
        params.push(filters.status);
      }
      
      if (filters.clientId) {
        query += ' AND p.client_id = ?';
        params.push(filters.clientId);
      }
      
      query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const projects = await databaseService.query(query, params);
      
      // Compter le total
      let countQuery, countParams;
      
      if (user && (user.role === 'super_admin' || user.role === 'admin')) {
        countQuery = `SELECT COUNT(*) as total FROM projects p WHERE 1=1`;
        countParams = [];
      } else {
        countQuery = `SELECT COUNT(*) as total FROM projects p 
                      WHERE (p.agent_id = ? OR p.client_id IN (
                        SELECT client_id FROM agent_clients 
                        WHERE agent_id = ? AND status = 'active'
                      ))`;
        countParams = [agentId, agentId];
      }
      
      if (filters.status) {
        countQuery += ' AND p.status = ?';
        countParams.push(filters.status);
      }
      
      if (filters.clientId) {
        countQuery += ' AND p.client_id = ?';
        countParams.push(filters.clientId);
      }
      
      const countResult = await databaseService.get(countQuery, countParams);
      const total = Number(countResult.total); // Convertir BigInt en Number
      
      systemLogsService.info('Projets de l\'agent récupérés avec pagination', 'projects', null, null, { 
        agentId, 
        userRole: user?.role,
        count: projects.length,
        total,
        page
      });
      
      return {
        projects,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération des projets de l\'agent avec pagination', 'projects', null, null, { 
        agentId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Récupère les tâches d'un client
   * @param {number} clientId - ID du client
   * @returns {Promise<Array>} Liste des tâches
   */
  async getClientTasks(clientId) {
    try {
      systemLogsService.info('Récupération des tâches du client', 'projects', null, null, { clientId });
      
      const tasks = await databaseService.query(
        `SELECT t.*, p.name as project_name
         FROM tasks t
         LEFT JOIN projects p ON t.project_id = p.id
         WHERE p.client_id = ?
         ORDER BY t.created_at DESC`,
        [clientId]
      );
      
      systemLogsService.info('Tâches du client récupérées avec succès', 'projects', null, null, { 
        clientId, 
        count: tasks.length 
      });
      
      return tasks;
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération des tâches du client', 'projects', null, null, { 
        clientId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Vérifie si un projet a des tâches actives
   * @param {number} projectId - ID du projet
   * @returns {Promise<boolean>} True si le projet a des tâches actives
   */
  async hasActiveTasks(projectId) {
    try {
      const activeTasks = await databaseService.get(
        'SELECT COUNT(*) as count FROM tasks WHERE project_id = ? AND status IN ("pending", "in_progress")',
        [projectId]
      );
      
      return Number(activeTasks.count) > 0;
    } catch (error) {
      systemLogsService.error('Erreur lors de la vérification des tâches actives', 'projects', null, null, { 
        projectId, 
        error: error.message 
      });
      throw error;
    }
  }

  async getActiveProjectTasks(projectId) {
    try {
      systemLogsService.info('Récupération des tâches actives du projet', 'projects', null, null, { projectId });
      
      const tasks = await databaseService.query(
        'SELECT * FROM tasks WHERE project_id = ? AND status IN ("pending", "in_progress") ORDER BY created_at DESC',
        [projectId]
      );
      
      systemLogsService.info('Tâches actives du projet récupérées avec succès', 'projects', null, null, { 
        projectId, 
        count: tasks.length 
      });
      
      return tasks;
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération des tâches actives du projet', 'projects', null, null, { 
        projectId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Supprime un projet
   * @param {number} projectId - ID du projet
   * @returns {Promise<void>}
   */
  async deleteProject(projectId) {
    try {
      systemLogsService.info('Suppression du projet', 'projects', null, null, { projectId });
      
      // Vérifier que le projet existe avant de le supprimer
      const project = await databaseService.get('SELECT id FROM projects WHERE id = ?', [projectId]);
      if (!project) {
        throw new Error(`Projet avec l'ID ${projectId} non trouvé`);
      }
      
      // Supprimer d'abord les tâches associées
      const tasksResult = await databaseService.run('DELETE FROM tasks WHERE project_id = ?', [projectId]);
      systemLogsService.info('Tâches supprimées', 'projects', null, null, { projectId, deletedTasks: tasksResult.changes });
      
      // Supprimer les fichiers associés
      const filesResult = await databaseService.run('DELETE FROM files WHERE project_id = ?', [projectId]);
      systemLogsService.info('Fichiers supprimés', 'projects', null, null, { projectId, deletedFiles: filesResult.changes });
      
      // Supprimer les membres de l'équipe
      const membersResult = await databaseService.run('DELETE FROM team_members WHERE project_id = ?', [projectId]);
      systemLogsService.info('Membres d\'équipe supprimés', 'projects', null, null, { projectId, deletedMembers: membersResult.changes });
      
      // Supprimer le projet
      const projectResult = await databaseService.run('DELETE FROM projects WHERE id = ?', [projectId]);
      
      // Vérifier que le projet a bien été supprimé
      if (projectResult.changes === 0) {
        throw new Error(`Échec de la suppression du projet ${projectId} - aucune ligne affectée`);
      }
      
      systemLogsService.info('Projet supprimé avec succès', 'projects', null, null, { 
        projectId, 
        deletedRows: projectResult.changes 
      });
      
      return {
        success: true,
        deletedRows: projectResult.changes,
        message: `Projet ${projectId} supprimé avec succès`
      };
    } catch (error) {
      systemLogsService.error('Erreur lors de la suppression du projet', 'projects', null, null, { 
        projectId, 
        error: error.message 
      });
      throw error;
    }
  }
}

module.exports = new ProjectService();