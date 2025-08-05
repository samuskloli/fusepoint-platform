/**
 * Service de gestion des clients
 * Centralise toute la logique métier liée aux clients
 */

const translationService = require('./translationService');
const validationService = require('./validationService');
const databaseService = require('./databaseService');
const EmailService = require('./emailService');
const systemLogsService = require('./systemLogsService');
const bcrypt = require('bcryptjs');

// Créer une instance du service email
const emailService = new EmailService();

class ClientService {
  /**
   * Récupère les fichiers d'un client
   * @param {number} clientId - ID du client
   * @returns {Promise<Array>} Liste des fichiers
   */
  async getClientFiles(clientId) {
    try {
      systemLogsService.info('Récupération des fichiers du client', 'clients', null, null, { clientId });
      
      // Pour l'instant, retourner un tableau vide car la table files n'existe pas encore
      const files = [];
      
      systemLogsService.info('Fichiers du client récupérés avec succès', 'clients', null, null, {
        clientId,
        count: files.length
      });
      
      return files;
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération des fichiers du client', 'clients', null, null, {
        clientId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Récupère les membres de l'équipe d'un client
   * @param {number} clientId - ID du client
   * @returns {Promise<Array>} Liste des membres de l'équipe
   */
  async getClientTeamMembers(clientId) {
    try {
      systemLogsService.info('Récupération de l\'équipe du client', 'clients', null, null, { clientId });
      
      const teamMembers = await databaseService.query(
        `SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.role,
          ap.status,
          ap.created_at as assigned_at
         FROM agent_prestataires ap
         JOIN users u ON ap.agent_id = u.id
         WHERE ap.prestataire_id = ? AND ap.status = 'active'
         ORDER BY ap.created_at DESC`,
        [clientId]
      );
      
      systemLogsService.info('Équipe du client récupérée avec succès', 'clients', null, null, {
        clientId,
        count: teamMembers.length
      });
      
      return teamMembers;
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération de l\'équipe du client', 'clients', null, null, {
        clientId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Met à jour les informations d'un client
   * @param {number} clientId - ID du client
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Promise<Object>} Client mis à jour
   */
  async updateClient(clientId, updateData) {
    try {
      systemLogsService.info('Mise à jour du client', 'clients', null, null, { clientId });
      
      // Vérifier que le client existe
      const existingClient = await databaseService.get(
        'SELECT id, email FROM users WHERE id = ? AND role IN ("user", "client")',
        [clientId]
      );
      
      if (!existingClient) {
        const error = new Error('Client non trouvé');
        error.code = 'CLIENT_NOT_FOUND';
        throw error;
      }
      
      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      if (updateData.email && updateData.email !== existingClient.email) {
        const emailExists = await databaseService.get(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [updateData.email, clientId]
        );
        
        if (emailExists) {
          const error = new Error('Cet email est déjà utilisé par un autre utilisateur');
          error.code = 'EMAIL_ALREADY_EXISTS';
          throw error;
        }
      }
      
      // Construire la requête de mise à jour dynamiquement
      const updateFields = [];
      const updateValues = [];
      
      const allowedFields = ['first_name', 'last_name', 'email', 'phone', 'company', 'company_id'];
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          updateValues.push(updateData[field]);
        }
      });
      
      if (updateData.status !== undefined) {
        updateFields.push('is_active = ?');
        updateValues.push(updateData.status === 'active' ? 1 : 0);
      }
      
      if (updateFields.length === 0) {
        const error = new Error('Aucune donnée à mettre à jour');
        error.code = 'NO_DATA_TO_UPDATE';
        throw error;
      }
      
      // Ajouter updated_at
      updateFields.push('updated_at = datetime("now")');
      updateValues.push(clientId);
      
      const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ? AND role IN ("user", "client")`;
      
      const result = await databaseService.run(updateQuery, updateValues);
      
      if (result.changes === 0) {
        const error = new Error('Erreur lors de la mise à jour du client');
        error.code = 'UPDATE_FAILED';
        throw error;
      }
      
      // Récupérer le client mis à jour avec les informations de l'entreprise
      const updatedClient = await databaseService.get(
        `SELECT 
          u.id, u.first_name, u.last_name, u.email, u.phone, u.company, u.company_id, u.is_active, u.created_at, u.updated_at,
          c.name as company_name, c.industry, c.size, c.location
         FROM users u
         LEFT JOIN companies c ON u.company_id = c.id
         WHERE u.id = ?`,
        [clientId]
      );
      
      systemLogsService.info('Client mis à jour avec succès', 'clients', null, null, { clientId });
      
      return {
        ...updatedClient,
        status: updatedClient.is_active ? 'active' : 'inactive'
      };
    } catch (error) {
      systemLogsService.error('Erreur lors de la mise à jour du client', 'clients', null, null, {
        clientId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Change le statut d'un client
   * @param {number} clientId - ID du client
   * @param {string} status - Nouveau statut ('active' ou 'inactive')
   * @param {number} agentId - ID de l'agent qui effectue le changement (optionnel)
   * @returns {Promise<Object>} Résultat de l'opération
   */
  async updateClientStatus(clientId, status, agentId = null) {
    try {
      systemLogsService.info('Mise à jour du statut du client', 'clients', null, null, { clientId, status, agentId });
      
      // Validation du statut
      if (!['active', 'inactive'].includes(status)) {
        const error = new Error('Statut invalide. Utilisez "active" ou "inactive"');
        error.code = 'INVALID_STATUS';
        throw error;
      }
      
      // Vérifier que le client existe
      const client = await databaseService.get(
        'SELECT id, email, first_name, last_name, is_active FROM users WHERE id = ? AND role IN ("user", "client")',
        [clientId]
      );
      
      if (!client) {
        const error = new Error('Client non trouvé');
        error.code = 'CLIENT_NOT_FOUND';
        throw error;
      }
      
      // Convertir le statut en valeur booléenne
      const isActive = status === 'active' ? 1 : 0;
      
      // Mettre à jour le statut du client
      await databaseService.run(
        'UPDATE users SET is_active = ?, updated_at = datetime("now") WHERE id = ?',
        [isActive, clientId]
      );
      
      // Envoyer un email de notification au client
      try {
        // Récupérer les informations de l'agent si fourni
        let agentData = {
          agentName: 'Équipe Fusepoint',
          agentEmail: 'support@fusepoint.com'
        };
        
        if (agentId) {
          const agent = await databaseService.get(
            'SELECT first_name, last_name, email FROM users WHERE id = ? AND role IN ("agent", "super_admin", "admin")',
            [agentId]
          );
          
          if (agent) {
            agentData = {
              agentName: `${agent.first_name} ${agent.last_name}`,
              agentEmail: agent.email
            };
          }
        }
        
        const clientData = {
          email: client.email,
          firstName: client.first_name,
          lastName: client.last_name,
          ...agentData
        };
        
        if (status === 'active') {
          await emailService.sendClientActivationEmail(clientData);
          systemLogsService.info('Email d\'activation envoyé', 'emails', null, null, { email: client.email });
        } else {
          await emailService.sendClientDeactivationEmail(clientData);
          systemLogsService.info('Email de désactivation envoyé', 'emails', null, null, { email: client.email });
        }
      } catch (emailError) {
        systemLogsService.error('Erreur lors de l\'envoi de l\'email', 'emails', null, null, {
          email: client.email,
          error: emailError.message
        });
        // Ne pas faire échouer la requête si l'email échoue
      }
      
      systemLogsService.info('Statut du client mis à jour avec succès', 'clients', null, null, { clientId, status });
      
      return {
        clientId: clientId,
        status: status,
        isActive: isActive
      };
    } catch (error) {
      translationService.log('error', 'clients.errorUpdatingClientStatus', { 
        clientId, 
        status, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Supprime définitivement un client
   * @param {number} clientId - ID du client
   * @param {number} agentId - ID de l'agent qui effectue la suppression
   * @param {string} password - Mot de passe de l'agent pour confirmation
   * @param {string} reason - Raison de la suppression
   * @returns {Promise<Object>} Résultat de l'opération
   */
  async deleteClient(clientId, agentId, password, reason) {
    try {
      systemLogsService.info('Suppression du client', 'clients', null, null, { clientId, agentId });
      
      // Vérifier le mot de passe de l'agent
      const agent = await databaseService.get(
        'SELECT id, first_name, last_name, email, password_hash FROM users WHERE id = ? AND role IN ("agent", "super_admin", "admin")',
        [agentId]
      );
      
      if (!agent) {
        const error = new Error('Agent non trouvé');
        error.code = 'AGENT_NOT_FOUND';
        throw error;
      }
      
      // Vérifier le mot de passe avec bcrypt
      const isPasswordValid = await bcrypt.compare(password, agent.password_hash);
      
      if (!isPasswordValid) {
        const error = new Error('Mot de passe incorrect');
        error.code = 'INVALID_PASSWORD';
        throw error;
      }
      
      // Vérifier que le client existe
      const client = await databaseService.get(
        'SELECT id, email, first_name, last_name, is_active FROM users WHERE id = ? AND role IN ("user", "client")',
        [clientId]
      );
      
      if (!client) {
        const error = new Error('Client non trouvé');
        error.code = 'CLIENT_NOT_FOUND';
        throw error;
      }
      
      // Supprimer d'abord les enregistrements liés dans deletion_requests
      await databaseService.run(
        'DELETE FROM deletion_requests WHERE client_id = ? OR agent_id = ?',
        [clientId, clientId]
      );
      
      // Supprimer définitivement le client
      const result = await databaseService.run(
        'DELETE FROM users WHERE id = ?',
        [clientId]
      );
      
      if (result.changes === 0) {
        const error = new Error('Erreur lors de la suppression du client');
        error.code = 'DELETE_FAILED';
        throw error;
      }
      
      // Log de l'action de suppression
      try {
        await databaseService.run(
          `INSERT INTO system_logs (level, message, category, user_id, metadata, created_at)
           VALUES (?, ?, ?, ?, ?, datetime('now'))`,
          [
            'info',
            `Suppression du client ${client.first_name} ${client.last_name} (${client.email}) par l'agent ${agent.first_name} ${agent.last_name}`,
            'client_deletion',
            agentId,
            JSON.stringify({ 
              deletedClientId: clientId, 
              deletedClientEmail: client.email,
              deletedClientName: `${client.first_name} ${client.last_name}`,
              agentId, 
              reason: reason || 'Aucune raison spécifiée' 
            })
          ]
        );
      } catch (logError) {
        systemLogsService.error('Erreur lors de la création du log', 'logs', null, null, { error: logError.message });
      }
      
      systemLogsService.info('Client supprimé avec succès', 'clients', null, null, { clientId });
      
      return {
        clientId,
        status: 'deleted'
      };
    } catch (error) {
      translationService.log('error', 'clients.errorDeletingClient', { 
        clientId, 
        agentId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Récupère les statistiques d'un client
   * @param {number} clientId - ID du client
   * @returns {Promise<Object>} Statistiques du client
   */
  async getClientStats(clientId) {
    try {
      systemLogsService.info('Récupération des statistiques du client', 'clients', null, null, { clientId });
      
      // Vérifier que le client existe
      const client = await databaseService.get(
        'SELECT id, first_name, last_name FROM users WHERE id = ? AND role = "user"',
        [clientId]
      );
      
      if (!client) {
        const error = new Error('Client non trouvé');
        error.code = 'CLIENT_NOT_FOUND';
        throw error;
      }
      
      // Récupérer les statistiques des projets
      const projectStats = await databaseService.get(
        `SELECT 
          COUNT(*) as total_projects,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_projects
         FROM projects WHERE client_id = ?`,
        [clientId]
      );
      
      // Récupérer les statistiques des tâches
      const taskStats = await databaseService.get(
        `SELECT 
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks
         FROM tasks t
         JOIN projects p ON t.project_id = p.id
         WHERE p.client_id = ?`,
        [clientId]
      );
      
      // Récupérer les statistiques des fichiers
      const fileStats = await databaseService.get(
        `SELECT 
          COUNT(*) as total_files,
          COALESCE(SUM(file_size), 0) as total_size
         FROM files f
         JOIN projects p ON f.project_id = p.id
         WHERE p.client_id = ?`,
        [clientId]
      );
      
      // Récupérer les membres de l'équipe
      const teamStats = await databaseService.get(
        `SELECT 
          COUNT(DISTINCT tm.user_id) as total_members
         FROM team_members tm
         JOIN projects p ON tm.project_id = p.id
         WHERE p.client_id = ?`,
        [clientId]
      );
      
      const stats = {
        projects: {
          total: projectStats?.total_projects || 0,
          active: projectStats?.active_projects || 0,
          completed: projectStats?.completed_projects || 0,
          pending: projectStats?.pending_projects || 0
        },
        tasks: {
          total: taskStats?.total_tasks || 0,
          pending: taskStats?.pending_tasks || 0,
          in_progress: taskStats?.in_progress_tasks || 0,
          completed: taskStats?.completed_tasks || 0
        },
        files: {
          total: fileStats?.total_files || 0,
          total_size: fileStats?.total_size || 0
        },
        team: {
          total_members: teamStats?.total_members || 0
        }
      };
      
      systemLogsService.info('Statistiques du client récupérées', 'clients', null, null, { clientId });
      
      return stats;
    } catch (error) {
      systemLogsService.error('Erreur lors de la mise à jour du statut du client', 'clients', null, null, {
        clientId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Récupère les notifications d'un client
   * @param {Object} filters - Filtres pour les notifications
   * @param {Object} options - Options de pagination
   * @returns {Promise<Array>} Liste des notifications
   */
  async getNotifications(filters = {}, options = {}) {
    try {
      const { clientId, read } = filters;
      const { page = 1, limit = 20 } = options;
      const offset = (page - 1) * limit;
      
      systemLogsService.info('Récupération des notifications du client', 'clients', null, null, { clientId, page, limit });
      
      let query = 'SELECT * FROM notifications WHERE 1=1';
      let params = [];
      
      if (clientId) {
        query += ' AND user_id = ?';
        params.push(clientId);
      }
      
      if (read !== undefined) {
        query += ' AND is_read = ?';
        params.push(read ? 1 : 0);
      }
      
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const notifications = await databaseService.db.all(query, params);
      
      systemLogsService.info('Notifications du client récupérées', 'clients', null, null, { 
        clientId, 
        count: notifications.length 
      });
      
      return notifications;
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération des notifications', 'clients', null, null, { 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Marque des notifications comme lues
   * @param {Array} notificationIds - IDs des notifications
   * @param {number} agentId - ID de l'agent
   * @returns {Promise<Object>} Résultat de l'opération
   */
  async markNotificationsAsRead(notificationIds, agentId) {
    try {
      systemLogsService.info('Marquage des notifications comme lues', 'clients', null, null, { 
        notificationIds, 
        agentId 
      });
      
      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        throw new Error('Invalid notification IDs');
      }
      
      const placeholders = notificationIds.map(() => '?').join(',');
      const query = `UPDATE notifications SET is_read = 1, read_at = datetime('now') WHERE id IN (${placeholders})`;
      
      const result = await databaseService.db.run(query, notificationIds);
      
      systemLogsService.info('Notifications marquées comme lues', 'clients', null, null, { 
        agentId, 
        count: result.changes 
      });
      
      return {
        success: true,
        markedCount: result.changes
      };
    } catch (error) {
      systemLogsService.error('Erreur lors du marquage des notifications', 'clients', null, null, { 
        notificationIds, 
        agentId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Récupère un client par son ID
   * @param {number} clientId - ID du client
   * @returns {Object|null} - Client ou null si non trouvé
   */
  async getClientById(clientId) {
    try {
      systemLogsService.info('Récupération du client par ID', 'clients', null, null, { clientId });
      
      const client = await databaseService.get(
        'SELECT id, first_name, last_name, email, phone, is_active, agent_id, created_at, updated_at FROM users WHERE id = ? AND role IN ("user", "client")',
        [clientId]
      );
      
      if (!client) {
        systemLogsService.warn('Client non trouvé', 'clients', null, null, { clientId });
        return null;
      }
      
      systemLogsService.info('Client récupéré avec succès', 'clients', null, null, { 
        clientId, 
        clientEmail: client.email 
      });
      
      return {
        ...client,
        status: client.is_active ? 'active' : 'inactive'
      };
    } catch (error) {
      systemLogsService.error('Erreur lors de la récupération du client par ID', 'clients', null, null, {
        clientId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Assigne un agent à un client
   * @param {number} clientId - ID du client
   * @param {number} agentId - ID de l'agent
   * @returns {Promise<Object>} Résultat de l'assignation
   */
  async assignAgent(clientId, agentId) {
    try {
      systemLogsService.info('Assignation d\'agent au client', 'clients', null, null, { clientId, agentId });
      
      // Vérifier que le client existe
      const client = await databaseService.get(
        'SELECT id, first_name, last_name, email FROM users WHERE id = ? AND role IN ("user", "client")',
        [clientId]
      );
      
      if (!client) {
        const error = new Error('Client non trouvé');
        error.code = 'CLIENT_NOT_FOUND';
        throw error;
      }
      
      // Vérifier que l'agent existe
      const agent = await databaseService.get(
        'SELECT id, first_name, last_name, email FROM users WHERE id = ? AND role = "agent"',
        [agentId]
      );
      
      if (!agent) {
        const error = new Error('Agent non trouvé');
        error.code = 'AGENT_NOT_FOUND';
        throw error;
      }
      
      // Mettre à jour l'assignation
      const result = await databaseService.run(
        'UPDATE users SET agent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [agentId, clientId]
      );
      
      if (result.changes === 0) {
        const error = new Error('Échec de l\'assignation');
        error.code = 'ASSIGNMENT_FAILED';
        throw error;
      }
      
      systemLogsService.info('Agent assigné avec succès', 'clients', null, null, {
        clientId,
        agentId,
        clientName: `${client.first_name} ${client.last_name}`,
        agentName: `${agent.first_name} ${agent.last_name}`
      });
      
      return {
        success: true,
        message: 'Agent assigné avec succès',
        data: {
          clientId,
          agentId,
          client: {
            id: client.id,
            name: `${client.first_name} ${client.last_name}`,
            email: client.email
          },
          agent: {
            id: agent.id,
            name: `${agent.first_name} ${agent.last_name}`,
            email: agent.email
          }
        }
      };
    } catch (error) {
      systemLogsService.error('Erreur lors de l\'assignation d\'agent', 'clients', null, null, {
        clientId,
        agentId,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = new ClientService();