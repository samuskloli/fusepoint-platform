const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const databaseService = require('../services/databaseService');
const EmailService = require('../services/emailService');
const AccompagnementService = require('../services/accompagnementService');
const emailService = new EmailService();
const accompagnementService = new AccompagnementService();

// Middleware pour toutes les routes agent - seuls les admins et agents peuvent accéder
router.use(authMiddleware);
router.use(roleAuth(['admin', 'agent', 'super_admin']));

/**
 * GET /api/agent/stats
 * Récupérer les statistiques pour le tableau de bord agent
 */
router.get('/stats', async (req, res) => {
  try {
    console.log('🔍 Debug - Route /api/agent/stats appelée');
    
    // Statistiques générales
    const totalClients = await databaseService.get(
      'SELECT COUNT(*) as count FROM users WHERE role = "user"'
    );
    
    const activeClients = await databaseService.get(
      'SELECT COUNT(*) as count FROM users WHERE role = "user" AND is_active = 1'
    );
    
    // Demandes en attente (accompagnement)
    const pendingRequests = await databaseService.get(
      'SELECT COUNT(*) as count FROM accompagnement_requests WHERE status = "pending"'
    );
    
    // Demandes résolues aujourd'hui
    const resolvedToday = await databaseService.get(
      'SELECT COUNT(*) as count FROM accompagnement_requests WHERE status = "completed" AND DATE(updated_at) = DATE("now")'
    );
    
    // Messages non lus (approximation)
    const unreadMessages = await databaseService.get(
      'SELECT COUNT(*) as count FROM messages WHERE recipient_id = ? AND read_at IS NULL',
      [req.user.id]
    );
    
    const stats = {
      totalClients: totalClients.count || 0,
      activeClients: activeClients.count || 0,
      pendingRequests: pendingRequests.count || 0,
      resolvedToday: resolvedToday.count || 0,
      unreadMessages: unreadMessages.count || 0
    };
    
    console.log('📊 Statistiques calculées:', stats);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Erreur récupération statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

/**
 * GET /api/agent/clients
 * Récupérer la liste de tous les clients
 */
router.get('/clients', async (req, res) => {
  try {
    console.log('🔍 Debug - Route /api/agent/clients appelée');
    console.log('🔍 Debug - databaseService:', !!databaseService);
    console.log('🔍 Debug - databaseService.db:', !!databaseService.db);
    
    const query = `
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.is_active,
        u.created_at,
        u.last_login,
        u.company,
        c.name as company_name,
        c.industry,
        c.size,
        c.location,
        agent.id as assigned_agent_id,
        agent.first_name as assigned_agent_first_name,
        agent.last_name as assigned_agent_last_name,
        agent.email as assigned_agent_email
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      LEFT JOIN users agent ON u.agent_id = agent.id AND agent.role = 'agent'
      WHERE u.role IN ('user', 'client')
      ORDER BY u.created_at DESC
    `;
    
    console.log('🔍 Debug - Exécution de la requête SQL');
    const rawClients = await databaseService.query(query);
    console.log('🔍 Debug - Résultats obtenus:', rawClients.length, 'clients');
    
    // Structurer les données pour inclure l'agent attribué
    const clients = rawClients.map(client => {
      const clientData = {
        id: client.id,
        email: client.email,
        first_name: client.first_name,
        last_name: client.last_name,
        is_active: client.is_active,
        status: client.is_active ? 'active' : 'inactive',
        created_at: client.created_at,
        last_login: client.last_login,
        company: client.company || client.company_name,
        phone: client.phone || null,
        company_name: client.company_name,
        industry: client.industry,
        size: client.size,
        location: client.location
      };
      
      // Ajouter l'agent attribué s'il existe
      if (client.assigned_agent_id) {
        clientData.assigned_agent = {
          id: client.assigned_agent_id,
          first_name: client.assigned_agent_first_name,
          last_name: client.assigned_agent_last_name,
          email: client.assigned_agent_email
        };
      }
      
      return clientData;
    });
    
    console.log('🔍 Debug - Clients avec attributions:', clients.filter(c => c.assigned_agent).length);
    
    res.json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error('❌ Erreur récupération clients:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des clients',
      error: error.message
    });
  }
});

/**
 * GET /api/agent/assigned-clients
 * Récupérer les clients attribués à l'agent connecté
 */
router.get('/assigned-clients', async (req, res) => {
  try {
    const agentId = req.user.id;
    const userRole = req.user.role;
    console.log('🔍 Debug - Récupération des clients pour utilisateur:', { agentId, userRole });
    
    let query, queryParams;
    
    if (userRole === 'super_admin') {
      // Super admin voit tous les clients
      query = `
        SELECT 
          u.id,
          u.email,
          u.first_name,
          u.last_name,
          u.phone,
          u.is_active,
          u.created_at,
          u.last_login,
          u.updated_at as assigned_at,
          u.company,
          c.name as company_name,
          c.industry,
          c.size,
          c.location
        FROM users u
        LEFT JOIN companies c ON u.company_id = c.id
        WHERE u.role IN ('user', 'client')
        AND u.is_active = 1
        ORDER BY u.updated_at DESC
      `;
      queryParams = [];
    } else {
      // Agent normal voit seulement ses clients assignés
      query = `
        SELECT 
          u.id,
          u.email,
          u.first_name,
          u.last_name,
          u.phone,
          u.is_active,
          u.created_at,
          u.last_login,
          u.updated_at as assigned_at,
          u.company,
          c.name as company_name,
          c.industry,
          c.size,
          c.location
        FROM users u
        LEFT JOIN companies c ON u.company_id = c.id
        WHERE u.agent_id = ? 
        AND u.role IN ('user', 'client')
        AND u.is_active = 1
        ORDER BY u.updated_at DESC
      `;
      queryParams = [agentId];
    }
    
    const assignedClients = await databaseService.query(query, queryParams);
    console.log('🔍 Debug - Clients attribués trouvés:', assignedClients.length);
    
    // Structurer les données
    const clients = assignedClients.map(client => ({
      id: client.id,
      email: client.email,
      first_name: client.first_name,
      last_name: client.last_name,
      is_active: client.is_active,
      status: client.is_active ? 'active' : 'inactive',
      created_at: client.created_at,
      last_login: client.last_login,
      company: client.company || client.company_name,
      phone: client.phone || null,
      company_name: client.company_name,
      industry: client.industry,
      size: client.size,
      location: client.location,
      assigned_at: client.assigned_at
    }));
    
    res.json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error('❌ Erreur récupération clients attribués:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des clients attribués',
      error: error.message
    });
  }
});

/**
 * POST /api/agent/clients/create
 * Créer un nouveau client
 */
router.post('/clients/create', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, companyName, isActive } = req.body;
    
    console.log('🔍 Debug - Création client:', { firstName, lastName, email });
    
    // Vérifier si l'email existe déjà
    const existingUser = await databaseService.get(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }
    
    // Créer l'utilisateur
    const result = await databaseService.run(
      `INSERT INTO users (first_name, last_name, email, phone, role, is_active, created_at) 
       VALUES (?, ?, ?, ?, 'client', ?, datetime('now'))`,
      [firstName, lastName, email, phone || null, isActive ? 1 : 0]
    );
    
    const userId = result.lastID;
    
    // Créer la compagnie si fournie
    if (companyName) {
      const companyResult = await databaseService.run(
        'INSERT INTO companies (name, created_at) VALUES (?, datetime(\'now\'))',
        [companyName]
      );
      
      // Lier l'utilisateur à la compagnie
      await databaseService.run(
        'INSERT INTO user_companies (user_id, company_id, role, created_at) VALUES (?, ?, \'owner\', datetime(\'now\'))',
        [userId, companyResult.lastID]
      );
    }
    
    res.json({
      success: true,
      message: 'Client créé avec succès',
      data: {
        userId: userId,
        email: email,
        firstLoginToken: 'temp-token-' + userId
      }
    });
  } catch (error) {
    console.error('❌ Erreur création client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du client',
      error: error.message
    });
  }
});

/**
 * POST /api/agent/send-welcome-email
 * Envoyer un email de bienvenue
 */
router.post('/send-welcome-email', async (req, res) => {
  try {
    const { to, subject, clientName, agentName, firstLoginToken, companyName } = req.body;
    
    console.log('📧 Envoi email de bienvenue à:', to);
    
    // Construire le contenu de l'email
    const emailContent = `
      <h2>Bienvenue sur Fusepoint, ${clientName} !</h2>
      <p>Votre compte a été créé par ${agentName}.</p>
      ${companyName ? `<p>Entreprise: ${companyName}</p>` : ''}
      <p>Vous pouvez vous connecter avec ce lien temporaire: ${firstLoginToken}</p>
      <p>Cordialement,<br>L'équipe Fusepoint</p>
    `;
    
    await emailService.sendEmail({
      to: to,
      subject: subject,
      html: emailContent
    });
    
    res.json({
      success: true,
      message: 'Email de bienvenue envoyé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur envoi email de bienvenue:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de l\'email de bienvenue',
      error: error.message
    });
  }
});

/**
 * POST /api/agent/assign
 * Attribuer un agent à un client
 */
router.post('/assign', async (req, res) => {
  try {
    const { clientId, agentId } = req.body;
    
    console.log('🔗 Attribution agent:', { clientId, agentId });
    
    // Vérifier que le client existe
    const client = await databaseService.get(
      'SELECT id, email, first_name, last_name FROM users WHERE id = ? AND role IN (\'user\', \'client\')',
      [clientId]
    );
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    // Vérifier que l'agent existe
    const agent = await databaseService.get(
      'SELECT id, email, first_name, last_name FROM users WHERE id = ? AND role = \'agent\'',
      [agentId]
    );
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent non trouvé'
      });
    }
    
    // Mettre à jour la colonne agent_id du client
    await databaseService.run(
      'UPDATE users SET agent_id = ?, updated_at = datetime(\'now\') WHERE id = ?',
      [agentId, clientId]
    );
    
    // Envoyer un email de notification au client
    try {
      await emailService.sendEmail({
        to: client.email,
        subject: 'Votre agent Fusepoint vous a été attribué',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🎉 Votre agent Fusepoint vous a été attribué !</h2>
            
            <p>Bonjour <strong>${client.first_name} ${client.last_name}</strong>,</p>
            
            <div style="background: #DCFCE7; border: 1px solid #16A34A; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #15803D;">✅ Attribution réussie</h3>
              <p style="margin: 0; color: #166534;">
                Nous avons le plaisir de vous informer qu'un agent dédié vous a été attribué pour vous accompagner dans vos projets marketing.
              </p>
            </div>
            
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #1E293B;">👤 Votre agent :</h4>
              <p style="margin: 0; color: #475569; font-size: 16px;">
                <strong>${agent.first_name} ${agent.last_name}</strong><br>
                📧 ${agent.email}
              </p>
            </div>
            
            <p>Votre agent va prendre contact avec vous prochainement pour :</p>
            <ul style="color: #475569;">
              <li>Comprendre vos besoins et objectifs</li>
              <li>Vous proposer des solutions personnalisées</li>
              <li>Vous accompagner dans la mise en œuvre de votre stratégie marketing</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://fusepoint.ch/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Accéder à mon tableau de bord</a>
            </div>
            
            <p style="color: #6B7280; font-size: 14px;">Si vous avez des questions, n'hésitez pas à contacter votre agent directement.</p>
            
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
            <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
              Cet email a été envoyé par Fusepoint Hub<br>
              © 2024 Fusepoint. Tous droits réservés.
            </p>
          </div>
        `
      });
      console.log('📧 Email d\'attribution envoyé au client:', client.email);
    } catch (emailError) {
      console.error('❌ Erreur envoi email au client:', emailError);
      // Ne pas faire échouer l'attribution si l'email échoue
    }
    
    // Créer une notification sur la plateforme pour le client
    try {
      await databaseService.run(
        `INSERT INTO notifications (user_id, type, title, message, created_at) 
         VALUES (?, ?, ?, ?, datetime('now'))`,
        [
          clientId,
          'agent_assignment',
          'Agent attribué',
          `Votre agent ${agent.first_name} ${agent.last_name} (${agent.email}) vous a été attribué. Il va prendre contact avec vous prochainement pour vous accompagner dans vos projets marketing.`
        ]
      );
      console.log('🔔 Notification créée pour le client:', clientId);
    } catch (notificationError) {
      console.error('❌ Erreur création notification:', notificationError);
      // Ne pas faire échouer l'attribution si la notification échoue
    }
    
    console.log('✅ Agent attribué avec succès:', { clientId, agentId, clientEmail: client.email, agentEmail: agent.email });
    
    res.json({
      success: true,
      message: 'Agent attribué avec succès',
      data: {
        client: client,
        agent: agent
      }
    });
  } catch (error) {
    console.error('❌ Erreur attribution agent:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'attribution de l\'agent',
      error: error.message
    });
  }
});

/**
 * POST /api/agent/clients/:id/email
 * Envoyer un email à un client
 */
router.post('/clients/:id/email', async (req, res) => {
  try {
    const clientId = req.params.id;
    const { subject, content } = req.body;
    
    // Récupérer les informations du client
    const client = await databaseService.get(
      'SELECT email, first_name, last_name FROM users WHERE id = ? AND role = \'user\'',
      [clientId]
    );
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    console.log('📧 Envoi email à:', client.email);
    
    await emailService.sendEmail({
      to: client.email,
      subject: subject,
      html: content
    });
    
    res.json({
      success: true,
      message: 'Email envoyé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de l\'email',
      error: error.message
    });
  }
});

/**
 * POST /api/agent/clients/:id/message
 * Envoyer un message à un client
 */
router.post('/clients/:id/message', async (req, res) => {
  try {
    const clientId = req.params.id;
    const { subject, content } = req.body;
    const agentId = req.user.id;
    
    console.log('💬 Envoi message à client:', clientId);
    
    // Enregistrer le message dans la base de données
    await databaseService.run(
      `INSERT INTO messages (sender_id, recipient_id, subject, content, type, created_at) 
       VALUES (?, ?, ?, ?, 'agent_to_client', datetime('now'))`,
      [agentId, clientId, subject, content]
    );
    
    res.json({
      success: true,
      message: 'Message envoyé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur envoi message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message',
      error: error.message
    });
  }
});

/**
 * GET /api/agent/clients/:id/notifications
 * Récupérer les notifications d'un client
 */
router.get('/clients/:id/notifications', async (req, res) => {
  try {
    const clientId = req.params.id;
    
    console.log('🔔 Récupération notifications pour client:', clientId);
    
    const notifications = await databaseService.query(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [clientId]
    );
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('❌ Erreur récupération notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications',
      error: error.message
    });
  }
});

/**
 * GET /api/agent/available
 * Récupérer la liste des agents disponibles
 */
router.get('/available', async (req, res) => {
  try {
    console.log('🔍 Debug - Route /api/agent/available appelée');
    
    const query = `
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.is_active,
        u.created_at,
        COUNT(ap.id) as active_conversations
      FROM users u
      LEFT JOIN agent_prestataires ap ON u.id = ap.agent_id AND ap.status = 'active'
      WHERE u.role = 'agent' AND u.is_active = 1
      GROUP BY u.id, u.email, u.first_name, u.last_name, u.is_active, u.created_at
      ORDER BY u.first_name, u.last_name
    `;
    
    console.log('🔍 Debug - Exécution de la requête SQL pour agents disponibles');
    const agents = await databaseService.query(query);
    console.log('🔍 Debug - Agents disponibles trouvés:', agents.length);
    
    res.json({
      success: true,
      data: agents
    });
  } catch (error) {
    console.error('❌ Erreur récupération agents disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des agents disponibles',
      error: error.message
    });
  }
});

/**
 * GET /api/agent/clients/:clientId/projects
 * Récupérer les projets d'un client spécifique
 */
router.get('/clients/:clientId/projects', async (req, res) => {
  try {
    const clientId = req.params.clientId;
    
    console.log('📋 Récupération projets pour client:', clientId);
    
    const projects = await databaseService.query(
      `SELECT 
        p.*,
        u.first_name as client_first_name,
        u.last_name as client_last_name,
        u.email as client_email
       FROM projects p
       LEFT JOIN users u ON p.client_id = u.id
       WHERE p.client_id = ?
       ORDER BY p.created_at DESC`,
      [clientId]
    );
    
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('❌ Erreur récupération projets client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des projets du client',
      error: error.message
    });
  }
});

/**
 * POST /api/agent/clients/:clientId/projects
 * Créer un nouveau projet pour un client
 */
router.post('/clients/:clientId/projects', async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const { 
      title, 
      description, 
      status, 
      priority, 
      budget, 
      start_date, 
      end_date, 
      due_date,
      progress
    } = req.body;
    const agentId = req.user.id;
    
    console.log('📋 Création projet pour client:', clientId);
    console.log('📋 Données reçues:', req.body);
    
    const result = await databaseService.run(
      `INSERT INTO projects (
        title, description, client_id, agent_id, status, priority, 
        budget, start_date, end_date, due_date, progress, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        title, 
        description, 
        clientId, 
        agentId, 
        status || 'en_cours', 
        priority || 'normal', 
        budget || 0, 
        start_date, 
        end_date, 
        due_date,
        progress || 0
      ]
    );
    
    console.log('✅ Projet créé avec ID:', result.lastID);
    
    const newProject = await databaseService.get(
      'SELECT * FROM projects WHERE id = ?',
      [result.lastID]
    );
    
    console.log('✅ Projet récupéré:', newProject);
    
    res.json({
      success: true,
      data: newProject,
      message: 'Projet créé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur création projet:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du projet',
      error: error.message
    });
  }
});

/**
 * GET /api/agent/projects
 * Récupérer tous les projets gérés par l'agent
 */
router.get('/projects', async (req, res) => {
  try {
    const agentId = req.user.id;
    
    console.log('📋 Récupération projets pour agent:', agentId);
    
    const projects = await databaseService.query(
      `SELECT 
        p.*,
        u.first_name as client_first_name,
        u.last_name as client_last_name,
        u.email as client_email
       FROM projects p
       LEFT JOIN users u ON p.client_id = u.id
       WHERE p.agent_id = ?
       ORDER BY p.created_at DESC`,
      [agentId]
    );
    
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('❌ Erreur récupération projets agent:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des projets',
      error: error.message
    });
  }
});

/**
 * GET /api/agent/projects/:projectId
 * Récupérer les détails d'un projet spécifique
 */
router.get('/projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log(`📋 Récupération des détails du projet: ${projectId}`);
    
    const project = await databaseService.getProjectById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des détails du projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails du projet'
    });
  }
});

/**
 * GET /api/agent/projects/:projectId/tasks
 * Récupérer les tâches d'un projet spécifique
 */
router.get('/projects/:projectId/tasks', async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log(`📋 Récupération des tâches du projet: ${projectId}`);
    
    const tasks = await databaseService.getProjectTasks(projectId);
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des tâches du projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tâches du projet'
    });
  }
});

/**
 * GET /api/agent/projects/:projectId/files
 * Récupérer les fichiers d'un projet spécifique
 */
router.get('/projects/:projectId/files', async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log(`📁 Récupération des fichiers du projet: ${projectId}`);
    
    const files = await databaseService.getProjectFiles(projectId);
    
    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des fichiers du projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des fichiers du projet'
    });
  }
});

/**
 * GET /api/agent/projects/:projectId/team
 * Récupérer les membres de l'équipe d'un projet spécifique
 */
router.get('/projects/:projectId/team', async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log(`👥 Récupération de l'équipe du projet: ${projectId}`);
    
    const teamMembers = await databaseService.getProjectTeamMembers(projectId);
    
    res.json({
      success: true,
      data: teamMembers
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'équipe du projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'équipe du projet'
    });
  }
});

/**
 * GET /api/agent/clients/:clientId/tasks
 * Récupérer les tâches d'un client spécifique
 */
router.get('/clients/:clientId/tasks', async (req, res) => {
  try {
    const clientId = req.params.clientId;
    
    console.log('📋 Récupération tâches pour client:', clientId);
    
    const tasks = await databaseService.query(
      `SELECT 
        t.*,
        p.title as project_title
       FROM tasks t
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.client_id = ?
       ORDER BY t.created_at DESC`,
      [clientId]
    );
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('❌ Erreur récupération tâches client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tâches du client',
      error: error.message
    });
  }
});

/**
 * GET /api/agent/clients/:clientId/files
 * Récupérer les fichiers d'un client spécifique
 */
router.get('/clients/:clientId/files', async (req, res) => {
  try {
    const clientId = req.params.clientId;
    
    console.log('📁 Récupération fichiers pour client:', clientId);
    
    // Pour l'instant, retourner un tableau vide car la table files n'existe pas encore
    const files = [];
    
    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('❌ Erreur récupération fichiers client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des fichiers du client',
      error: error.message
    });
  }
});

/**
 * GET /api/agent/clients/:clientId/team
 * Récupérer les membres de l'équipe d'un client spécifique
 */
router.get('/clients/:clientId/team', async (req, res) => {
  try {
    const clientId = req.params.clientId;
    
    console.log('👥 Récupération équipe pour client:', clientId);
    
    // Récupérer les membres de l'équipe via agent_prestataires
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
    
    res.json({
      success: true,
      data: teamMembers
    });
  } catch (error) {
    console.error('❌ Erreur récupération équipe client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'équipe du client',
      error: error.message
    });
  }
});

/**
 * PUT /api/agent/clients/:id
 * Mettre à jour les informations d'un client
 */
router.put('/clients/:id', async (req, res) => {
  try {
    const clientId = req.params.id;
    const { first_name, last_name, email, phone, company, company_id, status } = req.body;
    
    console.log('🔍 Mise à jour client:', { clientId, first_name, last_name, email });
    
    // Vérifier que le client existe
    const existingClient = await databaseService.get(
      'SELECT id, email FROM users WHERE id = ? AND role IN ("user", "client")',
      [clientId]
    );
    
    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== existingClient.email) {
      const emailExists = await databaseService.get(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, clientId]
      );
      
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé par un autre utilisateur'
        });
      }
    }
    
    // Construire la requête de mise à jour dynamiquement
    const updateFields = [];
    const updateValues = [];
    
    if (first_name !== undefined) {
      updateFields.push('first_name = ?');
      updateValues.push(first_name);
    }
    
    if (last_name !== undefined) {
      updateFields.push('last_name = ?');
      updateValues.push(last_name);
    }
    
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    
    if (company !== undefined) {
      updateFields.push('company = ?');
      updateValues.push(company);
    }
    
    if (company_id !== undefined) {
      updateFields.push('company_id = ?');
      updateValues.push(company_id);
    }
    
    if (status !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(status === 'active' ? 1 : 0);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune donnée à mettre à jour'
      });
    }
    
    // Ajouter updated_at
    updateFields.push('updated_at = datetime("now")');
    updateValues.push(clientId);
    
    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ? AND role IN ("user", "client")`;
    
    const result = await databaseService.run(updateQuery, updateValues);
    
    if (result.changes === 0) {
      return res.status(400).json({
        success: false,
        message: 'Erreur lors de la mise à jour du client'
      });
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
    
    res.json({
      success: true,
      message: 'Client mis à jour avec succès',
      client: {
        ...updatedClient,
        status: updatedClient.is_active ? 'active' : 'inactive'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du client',
      error: error.message
    });
  }
});

/**
 * PUT /api/agent/clients/:id/status
 * Mettre à jour le statut d'un client (actif/inactif)
 */
router.put('/clients/:id/status', async (req, res) => {
  try {
    const clientId = req.params.id;
    const { is_active } = req.body;

    console.log('🔍 Debug - Mise à jour statut client:', { clientId, is_active });

    // Vérifier que le paramètre is_active est fourni
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Le paramètre is_active doit être un booléen'
      });
    }

    // Vérifier que le client existe et a le rôle 'client'
    const client = await databaseService.query(
      'SELECT id, role, first_name, last_name, email, is_active FROM users WHERE id = ? AND role = "client"',
      [clientId]
    );

    if (!client || client.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    const clientData = client[0];
    const wasActive = Boolean(clientData.is_active);

    // Mettre à jour le statut du client
    const result = await databaseService.query(
      'UPDATE users SET is_active = ?, updated_at = datetime("now") WHERE id = ? AND role = "client"',
      [is_active ? 1 : 0, clientId]
    );



    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucune modification effectuée'
      });
    }

    // Envoyer une notification email selon le changement de statut
    if (wasActive !== is_active) {

      try {
        // Récupérer les informations de l'agent qui effectue le changement
        const agent = await databaseService.get(
          'SELECT first_name, last_name, email FROM users WHERE id = ? AND role IN ("agent", "admin", "super_admin")',
          [req.user?.id]
        );
        
        const agentName = agent ? `${agent.first_name} ${agent.last_name}` : 'Équipe Fusepoint';
        
        if (is_active) {
          // Client activé - envoyer email d'activation
          await emailService.sendClientActivationEmail({
            email: clientData.email,
            firstName: clientData.first_name,
            lastName: clientData.last_name,
            agentName: agentName
          });

        } else {
          // Client désactivé - envoyer email de désactivation
          await emailService.sendClientDeactivationEmail({
            email: clientData.email,
            firstName: clientData.first_name,
            lastName: clientData.last_name,
            agentName: agentName,
            agentEmail: agent?.email || 'support@fusepoint.com'
          });

        }
      } catch (emailError) {
        console.error(`❌ Erreur lors de l'envoi de l'email de ${is_active ? 'activation' : 'désactivation'}:`, emailError);
        // Ne pas faire échouer la requête si l'email ne peut pas être envoyé
      }
    }

    // Vérifier la mise à jour
    const updatedClient = await databaseService.query(
      'SELECT id, is_active FROM users WHERE id = ?',
      [clientId]
    );



    res.json({
      success: true,
      message: `Client ${is_active ? 'activé' : 'désactivé'} avec succès`,
      data: {
        clientId: clientId,
        is_active: is_active,
        updated: true
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du statut du client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: error.message
    });
  }
});

/**
 * DELETE /api/agent/clients/:id
 * Supprimer définitivement un client
 */
router.delete('/clients/:id', async (req, res) => {
  try {
    const clientId = req.params.id;
    const agentId = req.user.id;
    const { reason, password } = req.body;
    
    console.log('🗑️ Suppression client:', { clientId, agentId, reason });
    
    // Vérifier que le mot de passe est fourni
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe est requis pour confirmer la suppression'
      });
    }
    
    // Vérifier le mot de passe de l'agent
    const agent = await databaseService.get(
      'SELECT id, first_name, last_name, email, password_hash FROM users WHERE id = ? AND role IN ("agent", "super_admin", "admin")',
      [agentId]
    );
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent non trouvé'
      });
    }
    
    // Vérifier le mot de passe avec bcrypt
    const isPasswordValid = await bcrypt.compare(password, agent.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe incorrect'
      });
    }
    
    // Vérifier que le client existe
    const client = await databaseService.get(
      'SELECT id, email, first_name, last_name, is_active FROM users WHERE id = ? AND role IN ("user", "client")',
      [clientId]
    );
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    // Les informations de l'agent sont déjà récupérées lors de la validation du mot de passe
    
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
      return res.status(400).json({
        success: false,
        message: 'Erreur lors de la suppression du client'
      });
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
      console.log('ℹ️ Erreur création log:', logError.message);
    }
    
    console.log('✅ Client supprimé définitivement:', clientId);
    
    res.json({
      success: true,
      message: 'Client supprimé avec succès.',
      data: {
        clientId,
        status: 'deleted'
      }
    });
  } catch (error) {
    console.error('❌ Erreur suppression client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du client',
      error: error.message
    });
  }
});

/**
 * GET /api/agent/providers/available
 * Récupérer les prestataires disponibles
 */
router.get('/providers/available', async (req, res) => {
  try {
    console.log('🔍 Récupération prestataires disponibles');
    
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
    
    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('❌ Erreur récupération prestataires disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des prestataires disponibles',
      error: error.message
    });
  }
});

/**
 * GET /api/agent/clients/:id/stats
 * Récupérer les statistiques d'un client spécifique
 */
router.get('/clients/:id/stats', async (req, res) => {
  try {
    const clientId = req.params.id;
    const agentId = req.user.id;
    
    console.log('📊 Récupération statistiques client:', clientId, 'par agent:', agentId);
    
    // Vérifier que le client existe
    const client = await databaseService.get(
      'SELECT id, first_name, last_name FROM users WHERE id = ? AND role = "user"',
      [clientId]
    );
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
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
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Erreur récupération statistiques client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques du client',
      error: error.message
    });
  }
});



/**
 * GET /api/agent/companies
 * Récupérer la liste des entreprises disponibles
 */
router.get('/companies', async (req, res) => {
  try {
    console.log('🔍 Debug - Route /api/agent/companies appelée');
    
    const companies = await databaseService.query(`
      SELECT 
        id,
        name,
        industry,
        size,
        location,
        website,
        description,
        created_at
      FROM companies
      ORDER BY name ASC
    `);
    
    console.log('🔍 Debug - Entreprises trouvées:', companies.length);
    
    res.json({
      success: true,
      data: companies
    });
  } catch (error) {
    console.error('❌ Erreur récupération entreprises:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des entreprises',
      error: error.message
    });
  }
});

/**
 * POST /api/agent/bulk-email
 * Envoyer un email à plusieurs clients
 */
router.post('/bulk-email', async (req, res) => {
  try {
    const { clientIds, subject, content } = req.body;
    
    if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Liste de clients requise'
      });
    }
    
    if (!subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Sujet et contenu requis'
      });
    }
    
    const db = await databaseService.getDatabase();
    const agentId = req.user.id;
    
    // Récupérer les informations de l'agent
    const agent = await db.get(
      'SELECT first_name, last_name, email FROM users WHERE id = ? AND role = "agent"',
      [agentId]
    );
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent non trouvé'
      });
    }
    
    // Récupérer les clients
    const placeholders = clientIds.map(() => '?').join(',');
    const clients = await db.all(
      `SELECT id, first_name, last_name, email FROM users 
       WHERE id IN (${placeholders}) AND role IN ('user', 'client')`,
      clientIds
    );
    
    if (clients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucun client trouvé'
      });
    }
    
    const agentName = `${agent.first_name} ${agent.last_name}`;
    let successCount = 0;
    let errorCount = 0;
    
    // Envoyer l'email à chaque client
    for (const client of clients) {
      try {
        const clientName = `${client.first_name} ${client.last_name}`;
        
        await emailService.sendAgentEmail({
          to: client.email,
          subject: subject,
          content: content,
          clientName: clientName,
          agentName: agentName,
          agentEmail: agent.email
        });
        
        successCount++;
      } catch (emailError) {
        console.error(`❌ Erreur envoi email à ${client.email}:`, emailError);
        errorCount++;
      }
    }
    
    res.json({
      success: true,
      message: `Emails envoyés: ${successCount} réussis, ${errorCount} échecs`,
      sent: successCount,
      failed: errorCount,
      total: clients.length
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi d\'emails groupés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi des emails'
    });
  }
});

module.exports = router;