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

      // Vérifier que le client existe
      const client = await databaseService.get(
        'SELECT id FROM users WHERE id = ? AND role = "client"',
        [clientId]
      );
      
      if (!client) {
        throw new Error('Client non trouvé');
      }

      const projectId = await databaseService.run(
        `INSERT INTO projects (client_id, name, description, status, budget, start_date, end_date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          clientId,
          projectData.name,
          projectData.description || null,
          projectData.status || 'pending',
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
           SELECT client_id FROM agent_clients WHERE agent_id = ?
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
      
      const projects = await databaseService.query(query, params);
      
      // Compter le total
      let countQuery = 'SELECT COUNT(*) as total FROM projects WHERE client_id = ?';
      let countParams = [clientId];
      
      if (status) {
        countQuery += ' AND status = ?';
        countParams.push(status);
      }
      
      const countResult = await databaseService.get(countQuery, countParams);
      const total = countResult.total;
      
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
}

module.exports = new ProjectService();