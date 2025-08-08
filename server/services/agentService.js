/**
 * Service de gestion des agents
 * Centralise toute la logique métier liée aux agents
 */

const databaseService = require('./databaseService');
const emailService = require('./emailService');
const translationService = require('./translationService');
const validationService = require('./validationService');
const bcrypt = require('bcryptjs');
const { randomBytes } = require('node:crypto');

class AgentService {
  /**
   * Récupère les statistiques d'un agent
   * @param {number} agentId - ID de l'agent
   * @returns {Object} - Statistiques de l'agent
   */
  async getAgentStats(agentId) {
    try {
      // Statistiques générales
      const totalClients = await databaseService.get(
        'SELECT COUNT(*) as count FROM users WHERE role = "user"'
      );
      
      const activeClients = await databaseService.get(
        'SELECT COUNT(*) as count FROM users WHERE role = "user" AND is_active = 1'
      );
      
      const inactiveClients = await databaseService.get(
        'SELECT COUNT(*) as count FROM users WHERE role = "user" AND is_active = 0'
      );
      
      const assignedClients = await databaseService.get(
        'SELECT COUNT(*) as count FROM users WHERE role = "user" AND agent_id = ?',
        [agentId]
      );
      
      const unassignedClients = await databaseService.get(
        'SELECT COUNT(*) as count FROM users WHERE role = "user" AND (agent_id IS NULL OR agent_id = "")'
      );

      return {
        totalClients: totalClients.count,
        activeClients: activeClients.count,
        inactiveClients: inactiveClients.count,
        assignedClients: assignedClients.count,
        unassignedClients: unassignedClients.count
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques agent:', error);
      throw error;
    }
  }

  /**
   * Récupère la liste des agents disponibles
   * @returns {Array} - Liste des agents actifs
   */
  async getAvailableAgents() {
    try {
      const agents = await databaseService.query(
        `SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.role,
          u.is_active,
          u.created_at,
          COUNT(assigned.id) as client_count
        FROM users u
        LEFT JOIN users assigned ON assigned.agent_id = u.id AND assigned.role IN ('user', 'client')
        WHERE u.role IN ('agent', 'admin', 'super_admin') AND u.is_active = 1
        GROUP BY u.id, u.first_name, u.last_name, u.email, u.role, u.is_active, u.created_at
        ORDER BY client_count ASC, u.created_at ASC`
      );

      return agents.map(agent => ({
        ...agent,
        client_count: Number(agent.client_count), // Convertir BigInt en Number
        status: agent.is_active ? 'active' : 'inactive'
      }));
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des agents:', error);
      throw error;
    }
  }

  /**
   * Récupère la liste des prestataires disponibles
   * @returns {Array} - Liste des prestataires et agents actifs
   */
  async getAvailableProviders() {
    try {
      const providers = await databaseService.query(
        `SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.role,
          u.is_active,
          COUNT(ap.id) as active_assignments
         FROM users u
         LEFT JOIN agent_prestataires ap ON u.id = ap.agent_id AND ap.status = 'active'
         WHERE u.role IN ('agent', 'prestataire') AND u.is_active = 1
         GROUP BY u.id
         ORDER BY u.first_name, u.last_name`
      );
      
      return providers;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des prestataires:', error);
      throw error;
    }
  }

  /**
   * Récupère les clients d'un agent
   * @param {number} agentId - ID de l'agent
   * @param {Object} filters - Filtres de recherche
   * @returns {Array} - Liste des clients
   */
  async getAgentClients(agentId, filters = {}) {
    try {
      let query = `
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.phone,
          u.company,
          u.is_active,
          u.last_login,
          u.created_at,
          u.updated_at,
          agent.first_name as agent_first_name,
          agent.last_name as agent_last_name
        FROM users u
        LEFT JOIN users agent ON agent.id = u.agent_id
        WHERE u.role IN ('user', 'client')
      `;
      
      const params = [];
      
      // Filtrer par agent si spécifié
      if (filters.agentId) {
        query += ' AND u.agent_id = ?';
        params.push(filters.agentId);
      }
      
      // Filtrer par statut si spécifié
      if (filters.status) {
        const isActive = filters.status === 'active' ? 1 : 0;
        query += ' AND u.is_active = ?';
        params.push(isActive);
      }
      
      // Filtrer par recherche textuelle
      if (filters.search) {
        query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      query += ' ORDER BY u.created_at DESC';
      
      // Pagination
      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
        
        if (filters.offset) {
          query += ' OFFSET ?';
          params.push(filters.offset);
        }
      }

      const clients = await databaseService.query(query, params);
      
      return clients.map(client => ({
        ...client,
        firstName: client.first_name,
        lastName: client.last_name,
        status: client.is_active ? 'active' : 'inactive',
        assigned_agent: client.agent_first_name ? {
          first_name: client.agent_first_name,
          last_name: client.agent_last_name
        } : null
      }));
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des clients:', error);
      throw error;
    }
  }

  /**
   * Met à jour les informations d'un client
   * @param {number} clientId - ID du client
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Object} - Client mis à jour
   */
  async updateClient(clientId, updateData) {
    try {
      // Validation des données
      const validation = validationService.validateClientData(updateData);
      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }

      // Vérifier que le client existe
      const existingClient = await databaseService.get(
        'SELECT * FROM users WHERE id = ? AND role IN ("user", "client")',
        [clientId]
      );

      if (!existingClient) {
        throw new Error(translationService.t('client.notFound'));
      }

      // Construire la requête de mise à jour
      const updateFields = [];
      const updateParams = [];
      
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && key !== 'id') {
          updateFields.push(`${key} = ?`);
          updateParams.push(updateData[key]);
        }
      });
      
      updateFields.push('updated_at = NOW()');
      updateParams.push(clientId);

      const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
      await databaseService.run(updateQuery, updateParams);

      // Récupérer le client mis à jour
      const updatedClient = await databaseService.get(
        'SELECT * FROM users WHERE id = ?',
        [clientId]
      );

      return {
        ...updatedClient,
        firstName: updatedClient.first_name,
        lastName: updatedClient.last_name,
        status: updatedClient.is_active ? 'active' : 'inactive'
      };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du client:', error);
      throw error;
    }
  }

  /**
   * Change le statut d'un client
   * @param {number} clientId - ID du client
   * @param {string} status - Nouveau statut ('active' ou 'inactive')
   * @returns {Object} - Résultat de l'opération
   */
  async changeClientStatus(clientId, status) {
    try {
      // Validation du statut
      const statusValidation = validationService.validateStatus(status);
      if (!statusValidation.isValid) {
        throw new Error(statusValidation.message);
      }

      // Vérifier que le client existe
      const client = await databaseService.get(
        'SELECT id, email, first_name, last_name, is_active FROM users WHERE id = ? AND role IN ("user", "client")',
        [clientId]
      );

      if (!client) {
        throw new Error(translationService.t('client.notFound'));
      }

      // Convertir le statut en valeur booléenne
      const isActive = status === 'active' ? 1 : 0;

      // Mettre à jour le statut du client
      await databaseService.run(
        'UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?',
        [isActive, clientId]
      );

      // Envoyer un email de notification au client
      try {
        const clientData = {
          email: client.email,
          firstName: client.first_name,
          lastName: client.last_name
        };
        
        if (status === 'active') {
          await emailService.sendClientActivationEmail(clientData);
          console.log('📧', translationService.t('email.activationSent'), ':', client.email);
        } else {
          await emailService.sendClientDeactivationEmail(clientData);
          console.log('📧', translationService.t('email.deactivationSent'), ':', client.email);
        }
      } catch (emailError) {
        console.error('❌', translationService.t('email.sendError'), ':', emailError);
        // Ne pas faire échouer la requête si l'email échoue
      }

      return {
        clientId: clientId,
        status: status,
        isActive: isActive
      };
    } catch (error) {
      console.error('❌ Erreur changement statut client:', error);
      throw error;
    }
  }

  /**
   * Supprime définitivement un client
   * @param {number} clientId - ID du client
   * @param {number} agentId - ID de l'agent qui effectue la suppression
   * @param {string} password - Mot de passe de l'agent pour confirmation
   * @param {string} reason - Raison de la suppression
   * @returns {Object} - Résultat de l'opération
   */
  async deleteClient(clientId, agentId, password, reason) {
    try {
      // Vérifier le mot de passe de l'agent
      const agent = await databaseService.get(
        'SELECT id, first_name, last_name, email, password_hash FROM users WHERE id = ? AND role IN ("agent", "super_admin", "admin")',
        [agentId]
      );

      if (!agent) {
        throw new Error(translationService.t('agent.notFound'));
      }

      // Vérifier le mot de passe avec bcrypt
      const isPasswordValid = await bcrypt.compare(password, agent.password_hash);
      if (!isPasswordValid) {
        throw new Error(translationService.t('errors.passwordIncorrect'));
      }

      // Vérifier que le client existe
      const client = await databaseService.get(
        'SELECT id, email, first_name, last_name, is_active FROM users WHERE id = ? AND role IN ("user", "client")',
        [clientId]
      );

      if (!client) {
        throw new Error(translationService.t('client.notFound'));
      }

      // Supprimer d'abord les enregistrements liés
      await databaseService.run(
        'DELETE FROM deletion_requests WHERE client_id = ? OR agent_id = ?',
        [clientId, clientId]
      );

      // Supprimer définitivement le client
      const result = await databaseService.run(
        'DELETE FROM users WHERE id = ?',
        [clientId]
      );

      if (result.affectedRows === 0) {
        throw new Error(translationService.t('client.deletionError'));
      }

      // Log de l'action de suppression
      try {
        await databaseService.run(
          `INSERT INTO system_logs (level, message, category, user_id, metadata, created_at)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            'info',
            translationService.t('logs.clientDeletion', {
              clientName: `${client.first_name} ${client.last_name}`,
              clientEmail: client.email,
              agentName: `${agent.first_name} ${agent.last_name}`
            }),
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
        console.log('ℹ️ Erreur création log:', logError.message);
      }

      return {
        deletedClientId: clientId,
        deletedClientName: `${client.first_name} ${client.last_name}`,
        deletedClientEmail: client.email,
        reason: reason || 'Aucune raison spécifiée'
      };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du client:', error);
      throw error;
    }
  }

  /**
   * Attribution automatique d'un agent à un client
   * @param {number} clientId - ID du client
   * @returns {Object} - Résultat de l'attribution
   */
  async autoAssignAgent(clientId) {
    try {
      // Vérifier que le client existe
      const client = await databaseService.get(
        'SELECT id, first_name, last_name, email, agent_id FROM users WHERE id = ? AND role IN ("user", "client")',
        [clientId]
      );

      if (!client) {
        throw new Error(translationService.t('client.notFound'));
      }

      // Vérifier si le client a déjà un agent attribué
      if (client.agent_id) {
        const existingAgent = await databaseService.get(
          'SELECT first_name, last_name, email FROM users WHERE id = ? AND role = "agent"',
          [client.agent_id]
        );
        
        if (existingAgent) {
          throw new Error(translationService.t('agent.clientAlreadyAssigned'));
        }
      }

      // Trouver un agent disponible (celui qui a le moins de clients)
      const availableAgent = await databaseService.get(`
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          COUNT(assigned.id) as client_count
        FROM users u
        LEFT JOIN users assigned ON assigned.agent_id = u.id AND assigned.role IN ('user', 'client')
        WHERE u.role = 'agent' AND u.is_active = 1
        GROUP BY u.id, u.first_name, u.last_name, u.email
        ORDER BY client_count ASC, u.created_at ASC
        LIMIT 1
      `);

      if (!availableAgent) {
        throw new Error(translationService.t('agent.noAvailableAgent'));
      }

      // Attribuer l'agent au client
      await databaseService.run(
        'UPDATE users SET agent_id = ?, updated_at = NOW() WHERE id = ?',
        [availableAgent.id, clientId]
      );

      // Créer une entrée dans agent_prestataires pour la compatibilité
      await databaseService.run(`
        INSERT OR REPLACE INTO agent_prestataires 
        (agent_id, prestataire_id, status, assigned_at, created_at, updated_at)
        VALUES (?, ?, 'active', NOW(), NOW(), NOW())
      `, [availableAgent.id, clientId]);

      return {
        agent: {
          id: availableAgent.id,
          first_name: availableAgent.first_name,
          last_name: availableAgent.last_name,
          email: availableAgent.email
        },
        client: {
          id: client.id,
          first_name: client.first_name,
          last_name: client.last_name,
          email: client.email
        }
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'attribution automatique:', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau client
   * @param {Object} clientData - Données du client
   * @returns {Object} - Client créé
   */
  async createClient(clientData) {
    try {
      // Accepter les deux formats : firstName/lastName ou first_name/last_name
      const firstName = clientData.firstName || clientData.first_name;
      const lastName = clientData.lastName || clientData.last_name;
      const { email, phone, companyName, company, isActive } = clientData;
      
      // Utiliser company si companyName n'est pas fourni
      const finalCompanyName = companyName || company;
      
      // Mapper les champs pour la validation
      const validationData = {
        ...clientData,
        first_name: firstName,
        last_name: lastName
      };
      
      // Validation des données
      const validation = validationService.validateClientData(validationData);
      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }

      // Vérifier si l'email existe déjà
      const existingUser = await databaseService.get(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      
      if (existingUser) {
        throw new Error(translationService.t('errors.emailExists'));
      }

      let companyId = null;
      
      // Créer la compagnie si fournie
      if (finalCompanyName) {
        const companyResult = await databaseService.run(
          'INSERT INTO companies (name, created_at) VALUES (?, CURRENT_TIMESTAMP)',
          [finalCompanyName]
        );
        companyId = Number(companyResult.insertId);
      }
      
      // Générer un token de première connexion
      const firstLoginToken = randomBytes(32).toString('hex');
      
      // Créer l'utilisateur avec les informations de l'entreprise et le token
      const result = await databaseService.run(
        `INSERT INTO users (first_name, last_name, email, phone, company, company_id, role, is_active, first_login_token, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'user', ?, ?, CURRENT_TIMESTAMP)`,
        [firstName, lastName, email, phone || null, finalCompanyName || null, companyId, isActive ? 1 : 0, firstLoginToken]
      );
      
      const userId = Number(result.insertId);
      
      // Lier l'utilisateur à la compagnie si elle existe
      if (companyId) {
        await databaseService.run(
          'INSERT INTO user_companies (user_id, company_id, role, created_at) VALUES (?, ?, \'owner\', CURRENT_TIMESTAMP)',
          [userId, companyId]
        );
      }

      // Récupérer le client créé avec toutes ses données
      const createdClient = await databaseService.get(
        'SELECT id, first_name, last_name, email, phone, role, is_active, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      );
      
      // Envoyer l'e-mail de bienvenue automatiquement
      try {
        const emailData = {
          to: email,
          subject: '🎉 Bienvenue sur Fusepoint Hub !',
          clientName: `${firstName} ${lastName}`,
          agentName: 'Équipe Fusepoint',
          firstLoginToken: firstLoginToken,
          companyName: finalCompanyName
        };
        
        await emailService.sendWelcomeEmail(emailData);
        console.log('✅ E-mail de bienvenue envoyé automatiquement à:', email);
      } catch (emailError) {
        console.error('⚠️ Erreur lors de l\'envoi de l\'e-mail de bienvenue:', emailError);
        // Ne pas faire échouer la création du client si l'e-mail échoue
      }
      
      return {
        id: userId,
        first_name: firstName,
        last_name: lastName,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        company: finalCompanyName || null,
        status: isActive ? 'active' : 'inactive',
        is_active: isActive ? 1 : 0,
        role: 'client',
        created_at: createdClient.created_at,
        updated_at: createdClient.updated_at,
        firstLoginToken: firstLoginToken
      };
    } catch (error) {
      console.error('❌ Erreur lors de la création du client:', error);
      throw error;
    }
  }

  /**
   * Attribue un agent à un client
   * @param {number} clientId - ID du client
   * @param {number} agentId - ID de l'agent
   * @returns {Object} - Résultat de l'attribution
   */
  async assignAgentToClient(clientId, agentId) {
    try {
      // Vérifier que le client existe
      const client = await databaseService.get(
        'SELECT id, email, first_name, last_name FROM users WHERE id = ? AND role IN (\'user\', \'client\')',
        [clientId]
      );
      
      if (!client) {
        throw new Error(translationService.t('client.notFound'));
      }
      
      // Vérifier que l'agent existe
      console.log('🔍 Debug assignAgentToClient - Recherche agent avec ID:', agentId);
      const agent = await databaseService.get(
        'SELECT id, email, first_name, last_name, role FROM users WHERE id = ? AND role IN ("agent", "super_admin", "admin")',
        [agentId]
      );
      
      console.log('🔍 Debug assignAgentToClient - Agent trouvé:', agent);
      
      if (!agent) {
        console.log('❌ Debug assignAgentToClient - Aucun agent trouvé avec ID:', agentId);
        throw new Error(translationService.t('agent.notFound'));
      }
      
      // Mettre à jour la colonne agent_id du client
      await databaseService.run(
        'UPDATE users SET agent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [agentId, clientId]
      );

      return {
        client: {
          id: client.id,
          first_name: client.first_name,
          last_name: client.last_name,
          email: client.email
        },
        agent: {
          id: agent.id,
          first_name: agent.first_name,
          last_name: agent.last_name,
          email: agent.email
        }
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'attribution:', error);
      throw error;
    }
  }

  /**
   * Vérifie si un agent a accès à un client spécifique
   * @param {number} agentId - ID de l'agent
   * @param {number} clientId - ID du client
   * @returns {boolean} - True si l'agent a accès au client
   */
  async checkAgentClientAccess(agentId, clientId) {
    try {
      console.log('🔍 Debug checkAgentClientAccess - agentId:', agentId, 'clientId:', clientId);
      
      // Vérifier si l'agent existe et est actif
      const agent = await databaseService.get(
        'SELECT id, role FROM users WHERE id = ? AND role IN ("agent", "super_admin", "admin") AND is_active = 1',
        [agentId]
      );
      
      console.log('🔍 Debug checkAgentClientAccess - agent trouvé:', agent);
      
      if (!agent) {
        console.log('❌ Debug checkAgentClientAccess - agent non trouvé ou inactif');
        return false;
      }
      
      // Les super_admin et admin ont accès à tous les clients
      if (agent.role === 'super_admin' || agent.role === 'admin') {
        console.log('✅ Debug checkAgentClientAccess - accès accordé (super_admin/admin)');
        return true;
      }
      
      // Vérifier si le client existe
      const client = await databaseService.get(
        'SELECT id, agent_id FROM users WHERE id = ? AND role IN ("user", "client")',
        [clientId]
      );
      
      console.log('🔍 Debug checkAgentClientAccess - client trouvé:', client);
      
      if (!client) {
        console.log('❌ Debug checkAgentClientAccess - client non trouvé');
        return false;
      }
      
      // Vérifier si l'agent est assigné à ce client
      const hasAccess = client.agent_id === agentId;
      console.log('🔍 Debug checkAgentClientAccess - accès par assignation:', hasAccess);
      return hasAccess;
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification d\'accès:', error);
      return false;
    }
  }

  /**
   * Récupère un agent par son ID
   * @param {number} agentId - ID de l'agent
   * @returns {Object|null} - Agent ou null si non trouvé
   */
  async getAgentById(agentId) {
    try {
      const agent = await databaseService.get(
        'SELECT id, first_name, last_name, email, role, is_active, created_at FROM users WHERE id = ? AND role IN ("agent", "super_admin", "admin")',
        [agentId]
      );
      
      return agent || null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'agent:', error);
      return null;
    }
  }

  /**
   * Vérifie le mot de passe d'un agent
   * @param {number} agentId - ID de l'agent
   * @param {string} password - Mot de passe à vérifier
   * @returns {boolean} - True si le mot de passe est correct
   */
  async verifyPassword(agentId, password) {
    try {
      const agent = await databaseService.get(
        'SELECT password_hash FROM users WHERE id = ? AND role IN ("agent", "super_admin", "admin")',
        [agentId]
      );
      
      if (!agent) {
        return false;
      }
      
      return await bcrypt.compare(password, agent.password_hash);
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du mot de passe:', error);
      return false;
    }
  }

  /**
   * Met à jour le mot de passe d'un client
   * @param {number} clientId - ID du client
   * @param {string} newPassword - Nouveau mot de passe
   * @param {number} agentId - ID de l'agent qui effectue la modification
   * @returns {Object} - Résultat de l'opération
   */
  async updateClientPassword(clientId, newPassword, agentId) {
    try {
      // Vérifier que l'agent a accès au client
      const hasAccess = await this.checkAgentClientAccess(agentId, clientId);
      if (!hasAccess) {
        throw new Error('Accès refusé : vous n\'avez pas l\'autorisation de modifier ce client');
      }

      // Vérifier que le client existe
      const client = await databaseService.get(
        'SELECT id, email, first_name, last_name FROM users WHERE id = ? AND role IN ("user", "client")',
        [clientId]
      );

      if (!client) {
        throw new Error('Client non trouvé');
      }

      // Valider le nouveau mot de passe
      if (!newPassword || newPassword.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Mettre à jour le mot de passe
      await databaseService.updateUserPassword(clientId, hashedPassword);

      // Log de l'opération
      console.log(`✅ Mot de passe du client ${clientId} mis à jour par l'agent ${agentId}`);

      return {
        success: true,
        message: 'Mot de passe du client mis à jour avec succès',
        clientId: clientId,
        clientName: `${client.first_name} ${client.last_name}`
      };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du mot de passe du client:', error);
      throw error;
    }
  }
}

module.exports = new AgentService();