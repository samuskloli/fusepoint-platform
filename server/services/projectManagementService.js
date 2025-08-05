/**
 * Service de gestion avancée des projets
 * Centralise la logique métier complexe pour les opérations projets
 */

const projectService = require('./projectService');
const clientService = require('./clientService');
const agentService = require('./agentService');
const languageService = require('./languageService');
const translationService = require('./translationService');
const systemLogsService = require('./systemLogsService');

class ProjectManagementService {
  /**
   * Crée un nouveau projet avec validation complète
   * @param {Object} projectData - Données du projet
   * @param {string} clientId - ID du client
   * @param {string} agentId - ID de l'agent
   * @returns {Object} - Projet créé
   */
  static async createProjectWithValidation(projectData, clientId, agentId) {
    const { name, description, deadline, budget, priority } = projectData;

    // Validation des champs requis
    if (!name || !description) {
      const error = new Error('Required fields missing');
      error.code = 'REQUIRED_FIELDS_MISSING';
      throw error;
    }

    // Vérifier que le client existe
    const client = await clientService.getClientById(clientId);
    if (!client) {
      const error = new Error('Client not found');
      error.code = 'CLIENT_NOT_FOUND';
      throw error;
    }

    // Vérifier que l'agent a accès au client
    const hasAccess = await agentService.checkAgentClientAccess(agentId, clientId);
    if (!hasAccess) {
      const error = new Error('Access denied');
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    // Créer le projet
    const newProject = await projectService.createProject({
      name,
      description,
      deadline,
      budget,
      priority: priority || 'medium',
      clientId,
      agentId,
      status: 'active'
    });

    // Log de l'opération
    systemLogsService.info('Projet créé avec succès', 'projects', null, null, {
      projectId: newProject.id,
      clientId,
      agentId,
      projectName: name
    });

    return newProject;
  }

  /**
   * Met à jour un projet avec validation
   * @param {string} projectId - ID du projet
   * @param {Object} updateData - Données à mettre à jour
   * @param {string} agentId - ID de l'agent
   * @returns {Object} - Projet mis à jour
   */
  static async updateProjectWithValidation(projectId, updateData, agentId) {
    // Vérifier que le projet existe
    const project = await projectService.getProjectById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.code = 'PROJECT_NOT_FOUND';
      throw error;
    }

    // Vérifier que l'agent a accès au projet
    const hasAccess = await agentService.checkAgentProjectAccess(agentId, projectId);
    if (!hasAccess) {
      const error = new Error('Access denied');
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    // Valider les données de mise à jour
    const allowedFields = ['name', 'description', 'deadline', 'budget', 'priority', 'status'];
    const filteredData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    if (Object.keys(filteredData).length === 0) {
      const error = new Error('No valid fields to update');
      error.code = 'NO_VALID_FIELDS';
      throw error;
    }

    // Mettre à jour le projet
    const updatedProject = await projectService.updateProject(projectId, filteredData);
    
    // Log de l'opération
    systemLogsService.info('Projet mis à jour', 'projects', null, null, {
      projectId,
      agentId,
      updatedFields: Object.keys(filteredData)
    });

    return updatedProject;
  }

  /**
   * Récupère les projets d'un client avec pagination
   * @param {string} clientId - ID du client
   * @param {string} agentId - ID de l'agent
   * @param {Object} options - Options de pagination et filtrage
   * @returns {Object} - Projets paginés
   */
  static async getClientProjectsPaginated(clientId, agentId, options = {}) {
    const { page = 1, limit = 10, status, priority } = options;

    // Vérifier que l'agent a accès au client
    const hasAccess = await agentService.checkAgentClientAccess(agentId, clientId);
    if (!hasAccess) {
      const error = new Error('Access denied');
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    // Construire les filtres
    const filters = { clientId };
    if (status) filters.status = status;
    if (priority) filters.priority = priority;

    // Récupérer les projets
    const result = await projectService.getProjectsPaginated(filters, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Log de l'opération
    systemLogsService.info('Projets récupérés', 'projects', null, null, {
      clientId,
      agentId,
      count: result.projects.length,
      page,
      limit
    });

    return result;
  }

  /**
   * Récupère les tâches d'un projet
   * @param {string} projectId - ID du projet
   * @param {string} agentId - ID de l'agent
   * @returns {Array} - Liste des tâches
   */
  static async getProjectTasks(projectId, agentId) {
    // Vérifier que l'agent a accès au projet
    const hasAccess = await agentService.checkAgentProjectAccess(agentId, projectId);
    if (!hasAccess) {
      const error = new Error('Access denied');
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    const tasks = await projectService.getProjectTasks(projectId);
    
    // Log de l'opération
    systemLogsService.info('Tâches du projet récupérées', 'projects', null, null, {
      projectId,
      agentId,
      taskCount: tasks.length
    });

    return tasks;
  }

  /**
   * Récupère les fichiers d'un projet
   * @param {string} projectId - ID du projet
   * @param {string} agentId - ID de l'agent
   * @returns {Array} - Liste des fichiers
   */
  static async getProjectFiles(projectId, agentId) {
    // Vérifier que l'agent a accès au projet
    const hasAccess = await agentService.checkAgentProjectAccess(agentId, projectId);
    if (!hasAccess) {
      const error = new Error('Access denied');
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    const files = await projectService.getProjectFiles(projectId);
    
    // Log de l'opération
    systemLogsService.info('Fichiers du projet récupérés', 'projects', null, null, {
      projectId,
      agentId,
      fileCount: files.length
    });

    return files;
  }

  /**
   * Récupère l'équipe d'un projet
   * @param {string} projectId - ID du projet
   * @param {string} agentId - ID de l'agent
   * @returns {Array} - Liste des membres de l'équipe
   */
  static async getProjectTeam(projectId, agentId) {
    // Vérifier que l'agent a accès au projet
    const hasAccess = await agentService.checkAgentProjectAccess(agentId, projectId);
    if (!hasAccess) {
      const error = new Error('Access denied');
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    const team = await projectService.getProjectTeam(projectId);
    
    // Log de l'opération
    systemLogsService.info('Équipe du projet récupérée', 'projects', null, null, {
      projectId,
      agentId,
      teamSize: team.length
    });

    return team;
  }

  /**
   * Supprime un projet avec vérifications
   * @param {string} projectId - ID du projet
   * @param {string} agentId - ID de l'agent
   * @returns {boolean} - Succès de la suppression
   */
  static async deleteProjectWithValidation(projectId, agentId) {
    // Vérifier que le projet existe
    const project = await projectService.getProjectById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.code = 'PROJECT_NOT_FOUND';
      throw error;
    }

    // Vérifier que l'agent a accès au projet
    const hasAccess = await agentService.checkAgentProjectAccess(agentId, projectId);
    if (!hasAccess) {
      const error = new Error('Access denied');
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    // Vérifier que le projet peut être supprimé (pas de tâches en cours)
    const activeTasks = await projectService.getActiveProjectTasks(projectId);
    if (activeTasks.length > 0) {
      const error = new Error('Cannot delete project with active tasks');
      error.code = 'PROJECT_HAS_ACTIVE_TASKS';
      throw error;
    }

    // Supprimer le projet
    const result = await projectService.deleteProject(projectId);
    
    // Log de l'opération
    systemLogsService.info('Projet supprimé', 'projects', null, null, {
      projectId,
      agentId,
      projectName: project.name
    });

    return result;
  }

  /**
   * Récupère les tâches d'un client
   * @param {string} clientId - ID du client
   * @param {string} agentId - ID de l'agent
   * @param {Object} options - Options de pagination et filtrage
   * @returns {Object} - Liste des tâches
   */
  static async getClientTasks(clientId, agentId, options = {}) {
    // Vérifier que l'agent a accès au client
    const hasAccess = await agentService.checkAgentClientAccess(agentId, clientId);
    if (!hasAccess) {
      const error = new Error('Access denied');
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    const tasks = await projectService.getClientTasks(clientId, options);
    
    // Log de l'opération
    systemLogsService.info('Tâches du client récupérées', 'projects', null, null, {
      clientId,
      agentId,
      taskCount: tasks.length
    });

    return tasks;
  }

  /**
   * Récupère tous les projets avec pagination
   * @param {string} agentId - ID de l'agent
   * @param {Object} options - Options de pagination et filtrage
   * @returns {Object} - Projets paginés
   */
  static async getAllProjectsPaginated(agentId, options = {}) {
    const { page = 1, limit = 10, status, priority, clientId } = options;

    // Construire les filtres
    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (clientId) {
      // Vérifier que l'agent a accès au client
      const hasAccess = await agentService.checkAgentClientAccess(agentId, clientId);
      if (!hasAccess) {
        const error = new Error('Access denied');
        error.code = 'ACCESS_DENIED';
        throw error;
      }
      filters.clientId = clientId;
    }

    // Récupérer les projets accessibles à l'agent
    const result = await projectService.getAgentProjectsPaginated(agentId, filters, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Log de l'opération
    systemLogsService.info('Tous les projets récupérés', 'projects', null, null, {
      agentId,
      count: result.projects.length,
      page,
      limit
    });

    return result;
  }
}

module.exports = ProjectManagementService;