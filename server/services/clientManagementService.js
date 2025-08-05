/**
 * Service de gestion avancée des clients
 * Centralise la logique métier complexe pour les opérations clients
 */

const clientService = require('./clientService');
const agentService = require('./agentService');
const projectService = require('./projectService');
const emailService = require('./emailService');
const languageService = require('./languageService');
const translationService = require('./translationService');
const systemLogsService = require('./systemLogsService');

class ClientManagementService {
  /**
   * Récupère les statistiques complètes d'un client
   * @param {string} clientId - ID du client
   * @param {string} agentId - ID de l'agent
   * @returns {Object} - Statistiques du client
   */
  static async getClientStats(clientId, agentId) {
    // Vérifier que l'agent a accès au client
    const hasAccess = await agentService.checkAgentClientAccess(agentId, clientId);
    if (!hasAccess) {
      const error = new Error('Access denied');
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    const client = await clientService.getClientById(clientId);
    if (!client) {
      const error = new Error('Client not found');
      error.code = 'CLIENT_NOT_FOUND';
      throw error;
    }

    // Récupérer les statistiques
    const [projects, tasks, files, messages] = await Promise.all([
      projectService.getClientProjects(clientId),
      projectService.getClientTasks(clientId),
      clientService.getClientFiles(clientId),
      clientService.getClientMessages(clientId)
    ]);

    return {
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        status: client.status,
        createdAt: client.createdAt
      },
      stats: {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        totalFiles: files.length,
        totalMessages: messages.length
      },
      recentActivity: {
        lastProject: projects[0] || null,
        lastMessage: messages[0] || null,
        lastFile: files[0] || null
      }
    };
  }

  /**
   * Crée un nouveau client avec validation complète
   * @param {Object} clientData - Données du client
   * @param {string} agentId - ID de l'agent créateur
   * @returns {Object} - Client créé
   */
  static async createClientWithValidation(clientData, agentId) {
    const { name, email, phone, company, password } = clientData;

    // Validation des champs requis
    if (!name || !email || !password) {
      const error = new Error('Required fields missing');
      error.code = 'REQUIRED_FIELDS_MISSING';
      throw error;
    }

    // Vérifier si l'email existe déjà
    const existingClient = await clientService.getClientByEmail(email);
    if (existingClient) {
      const error = new Error('Email already exists');
      error.code = 'EMAIL_ALREADY_EXISTS';
      throw error;
    }

    // Créer le client
    const newClient = await clientService.createClient({
      name,
      email,
      phone,
      company,
      password,
      agentId,
      status: 'active'
    });

    // Log de l'opération
    systemLogsService.info('Client créé avec succès', 'clients', null, null, {
      clientId: newClient.id,
      agentId,
      email
    });

    return newClient;
  }

  /**
   * Met à jour le statut d'un client avec validation
   * @param {string} clientId - ID du client
   * @param {string} status - Nouveau statut
   * @param {string} agentId - ID de l'agent
   * @returns {Object} - Client mis à jour
   */
  static async updateClientStatus(clientId, status, agentId) {
    try {
      // Vérifier que l'agent a accès au client
      const hasAccess = await agentService.checkAgentClientAccess(agentId, clientId);
      if (!hasAccess) {
        const error = new Error('Access denied');
        error.code = 'ACCESS_DENIED';
        throw error;
      }

      // Valider le statut
      const validStatuses = ['active', 'inactive', 'suspended', 'pending'];
      if (!validStatuses.includes(status)) {
        const error = new Error('Invalid status');
        error.code = 'INVALID_STATUS';
        throw error;
      }

      const updatedClient = await clientService.updateClientStatus(clientId, status, agentId);
      
      // Log de l'opération
      await systemLogsService.info('Statut du client mis à jour', 'clients', null, null, {
        clientId,
        agentId,
        newStatus: status
      });

      return updatedClient;
    } catch (error) {
      console.error('❌ Erreur dans ClientManagementService.updateClientStatus:', {
        clientId,
        status,
        agentId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Met à jour un client avec validation
   * @param {string} clientId - ID du client
   * @param {Object} updateData - Données à mettre à jour
   * @param {string} agentId - ID de l'agent
   * @returns {Object} - Client mis à jour
   */
  static async updateClient(clientId, updateData, agentId) {
    // Vérifier que l'agent a accès au client
    const hasAccess = await agentService.checkAgentClientAccess(agentId, clientId);
    if (!hasAccess) {
      const error = new Error('Access denied');
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    const updatedClient = await clientService.updateClient(clientId, updateData);
    
    // Log de l'opération
    await systemLogsService.info('Client mis à jour', 'clients', null, null, {
      clientId,
      agentId
    });

    return updatedClient;
  }

  /**
   * Supprime un client avec vérifications de sécurité
   * @param {string} clientId - ID du client
   * @param {string} agentId - ID de l'agent
   * @param {string} password - Mot de passe de confirmation
   * @param {string} reason - Raison de la suppression
   * @returns {boolean} - Succès de la suppression
   */
  static async deleteClient(clientId, agentId, password, reason) {
    // Vérifier le mot de passe de l'agent
    const agent = await agentService.getAgentById(agentId);
    if (!agent) {
      const error = new Error('Agent not found');
      error.code = 'AGENT_NOT_FOUND';
      throw error;
    }

    const isPasswordValid = await agentService.verifyPassword(agentId, password);
    if (!isPasswordValid) {
      const error = new Error('Invalid password');
      error.code = 'INVALID_PASSWORD';
      throw error;
    }

    // Vérifier que l'agent a accès au client
    const hasAccess = await agentService.checkAgentClientAccess(agentId, clientId);
    if (!hasAccess) {
      const error = new Error('Access denied');
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    // Supprimer le client
    const result = await clientService.deleteClient(clientId, agentId, password, reason);
    
    // Log de l'opération
    await systemLogsService.info('Client supprimé', 'clients', null, null, {
      clientId,
      agentId
    });

    return result;
  }

  /**
   * Envoie un email de bienvenue à un client
   * @param {string} clientId - ID du client
   * @param {string} agentId - ID de l'agent
   * @returns {boolean} - Succès de l'envoi
   */
  static async sendWelcomeEmail(clientId, agentId) {
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

    const emailSent = await emailService.sendWelcomeEmail(client.email, {
      clientName: client.name,
      agentId
    });

    if (emailSent) {
      // Log de l'opération
      await systemLogsService.info('Email de bienvenue envoyé', 'clients', null, null, {
        clientId,
        agentId,
        email: client.email
      });
    }

    return emailSent;
  }

  /**
   * Assigne un agent à un client
   * @param {string} clientId - ID du client
   * @param {string} agentId - ID de l'agent à assigner
   * @param {string} currentAgentId - ID de l'agent actuel
   * @returns {Object} - Résultat de l'assignation
   */
  static async assignAgentToClient(clientId, agentId, currentAgentId) {
    // Vérifier que le client existe
    const client = await clientService.getClientById(clientId);
    if (!client) {
      const error = new Error('Client not found');
      error.code = 'CLIENT_NOT_FOUND';
      throw error;
    }

    // Vérifier que l'agent à assigner existe
    const agent = await agentService.getAgentById(agentId);
    if (!agent) {
      const error = new Error('Agent not found');
      error.code = 'AGENT_NOT_FOUND';
      throw error;
    }

    // Assigner l'agent
    const result = await agentService.assignAgentToClient(clientId, agentId);
    
    // Log de l'opération
    await systemLogsService.info('Agent assigné au client', 'clients', null, null, {
      clientId,
      agentId,
      assignedBy: currentAgentId
    });

    return result;
  }

  /**
   * Récupère les fichiers d'un client
   * @param {string} clientId - ID du client
   * @param {string} agentId - ID de l'agent
   * @param {Object} options - Options de pagination et filtrage
   * @returns {Object} - Liste des fichiers
   */
  static async getClientFiles(clientId, agentId, options = {}) {
    // Vérifier que l'agent a accès au client
    const hasAccess = await agentService.checkAgentClientAccess(agentId, clientId);
    if (!hasAccess) {
      const error = new Error('Access denied');
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    const files = await clientService.getClientFiles(clientId, options);
    return files;
  }

  /**
   * Récupère l'équipe d'un client
   * @param {string} clientId - ID du client
   * @param {string} agentId - ID de l'agent
   * @param {Object} options - Options de pagination et filtrage
   * @returns {Object} - Liste des membres de l'équipe
   */
  static async getClientTeam(clientId, agentId, options = {}) {
    // Vérifier que l'agent a accès au client
    const hasAccess = await agentService.checkAgentClientAccess(agentId, clientId);
    if (!hasAccess) {
      const error = new Error('Access denied');
      error.code = 'ACCESS_DENIED';
      throw error;
    }

    const team = await clientService.getClientTeam(clientId, options);
    return team;
  }

  /**
   * Attribution automatique d'un agent à un client
   * @param {string} clientId - ID du client
   * @param {string} currentAgentId - ID de l'agent actuel
   * @returns {Object} - Résultat de l'attribution automatique
   */
  static async autoAssignAgent(clientId, currentAgentId) {
    // Vérifier que le client existe
    const client = await clientService.getClientById(clientId);
    if (!client) {
      const error = new Error('Client not found');
      error.code = 'CLIENT_NOT_FOUND';
      throw error;
    }

    // Trouver un agent disponible
    const availableAgent = await agentService.findAvailableAgent();
    if (!availableAgent) {
      const error = new Error('No available agent found');
      error.code = 'NO_AVAILABLE_AGENT';
      throw error;
    }

    // Assigner l'agent
    const result = await agentService.assignAgentToClient(clientId, availableAgent.id);
    
    // Log de l'opération
    systemLogsService.info('Agent assigné automatiquement', 'clients', null, null, {
      clientId,
      agentId: availableAgent.id,
      assignedBy: currentAgentId
    });

    return {
      success: true,
      assignedAgent: availableAgent,
      client: client
    };
  }
}

module.exports = ClientManagementService;