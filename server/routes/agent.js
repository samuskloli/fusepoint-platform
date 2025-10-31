const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const agentService = require('../services/agentService');
const projectService = require('../services/projectService');
const clientService = require('../services/clientService');
const translationService = require('../services/translationService');
const validationService = require('../services/validationService');
const responseService = require('../services/responseService');
const emailService = require('../services/emailService');
const databaseService = require('../services/databaseService');
const bcrypt = require('bcrypt');
const AccompagnementService = require('../services/accompagnementService');
const accompagnementService = new AccompagnementService();
const companyService = require('../services/companyService');
const bulkEmailService = require('../services/bulkEmailService');
const languageService = require('../services/languageService');

// Nouveaux services de gestion
const RouteHandlerService = require('../services/routeHandlerService');
const ClientManagementService = require('../services/clientManagementService');
const ProjectManagementService = require('../services/projectManagementService');
const NotificationManagementService = require('../services/notificationManagementService');
const { requireProjectView, requireProjectEdit } = require('../middleware/projectAccess');

// Middleware pour toutes les routes agent - seuls les admins et agents peuvent accéder
router.use(authMiddleware);
router.use(roleAuth(['admin', 'agent', 'super_admin']));

/**
 * GET /api/agent/stats
 * Récupérer les statistiques pour le tableau de bord agent
 */
router.get('/stats', RouteHandlerService.createCrudHandler(
  agentService,
  'getAgentStats',
  {
    logOperation: 'retrievingAgentStats',
    successMessage: 'success.statsRetrieved',
    errorMessage: 'errors.retrievingStats',
    extractParams: (req) => [req.user.id]
  }
));

/**
 * GET /api/agent/clients
 * Récupérer la liste de tous les clients
 */
router.get('/clients', RouteHandlerService.asyncHandler(async (req, res) => {
  const userRole = req.user.role;
  const currentAgentId = req.user.id;
  RouteHandlerService.logOperation('retrievingClients', { agentId: currentAgentId, role: userRole });

  // Construire les filtres à partir des paramètres de requête
  const filters = {
    search: req.query.search,
    status: req.query.status,
    // Par défaut, pour un utilisateur role "agent", filtrer par son propre agentId
    // Les admins et super_admin voient tous les clients (pas de filtre agentId)
    agentId: (userRole === 'agent')
      ? (req.query.agentId !== undefined && req.query.agentId !== ''
          ? Number(req.query.agentId)
          : currentAgentId)
      : (req.query.agentId !== undefined && req.query.agentId !== ''
          ? Number(req.query.agentId)
          : null),
    limit: req.query.limit ? parseInt(req.query.limit) : undefined,
    offset: req.query.offset ? parseInt(req.query.offset) : undefined
  };

  // Log de debug pour bien voir le comportement côté distant
  console.log('🔎 [GET /api/agent/clients] Rôle:', userRole, 'Filtres:', filters);

  const clients = await agentService.getAgentClients(currentAgentId, filters);

  RouteHandlerService.successResponse(res, clients, 'success.clientsRetrieved');
}, { logKey: 'logs.clientsRetrieval', errorKey: 'errors.retrievingClients' }));

/**
 * GET /api/agent/assigned-clients
 * Récupérer les clients attribués à l'agent connecté
 */
router.get('/assigned-clients', RouteHandlerService.asyncHandler(async (req, res) => {
  const agentId = req.user.id;
  const userRole = req.user.role;
  
  console.log(`🔍 [DEBUG] Récupération des clients assignés pour l'utilisateur:`, {
    agentId,
    role: userRole,
    timestamp: new Date().toISOString()
  });
  
  RouteHandlerService.logOperation('retrievingAssignedClients', { agentId });
  
  // Construire les filtres selon le rôle
  const filters = {
    // Pour super_admin et admin, ne pas filtrer par agentId (voir tous les clients)
    // Pour les agents normaux, filtrer par leur agentId
    agentId: (userRole === 'super_admin' || userRole === 'admin') ? null : agentId,
    status: 'active',
    search: req.query.search,
    limit: req.query.limit ? parseInt(req.query.limit) : undefined,
    offset: req.query.offset ? parseInt(req.query.offset) : undefined
  };
  
  if (userRole !== 'super_admin' && userRole !== 'admin') {
    console.log(`🔒 [DEBUG] Agent normal - filtrage par agentId: ${agentId}`);
  } else {
    console.log(`👑 [DEBUG] Super-admin/Admin - pas de filtrage par agentId (role: ${userRole})`);
  }
  
  console.log(`📋 [DEBUG] Filtres appliqués:`, filters);
  
  const clients = await agentService.getAgentClients(agentId, filters);
  
  console.log(`📊 [DEBUG] Résultat de agentService.getAgentClients:`, {
    clientsLength: clients ? clients.length : 0,
    role: userRole,
    sampleClients: clients ? clients.slice(0, 2).map(c => ({ id: c.id, name: `${c.first_name} ${c.last_name}`, agent_id: c.agent_id })) : []
  });
  
  console.log(`✅ [DEBUG] ${clients ? clients.length : 0} clients récupérés avec succès pour role: ${userRole}`);
  
  RouteHandlerService.successResponse(res, clients, 'success.assignedClientsRetrieved');
}, { logKey: 'logs.assignedClientsRetrieval', errorKey: 'errors.retrievingAssignedClients' }));

/**
 * POST /api/agent/clients
 * Créer un nouveau client
 */
router.post('/clients', RouteHandlerService.asyncHandler(async (req, res) => {
  console.log('🔍 Debug POST /clients - req.body:', JSON.stringify(req.body, null, 2));
  console.log('🔍 Debug POST /clients - req.body type:', typeof req.body);
  console.log('🔍 Debug POST /clients - req.body keys:', Object.keys(req.body));
  console.log('🔍 Debug POST /clients - first_name:', req.body.first_name);
  console.log('🔍 Debug POST /clients - last_name:', req.body.last_name);
  console.log('🔍 Debug POST /clients - firstName:', req.body.firstName);
  console.log('🔍 Debug POST /clients - lastName:', req.body.lastName);
  RouteHandlerService.logOperation('creatingClient', { agentId: req.user.id, clientData: req.body });
  
  const clientData = await agentService.createClient(req.body);
  
  RouteHandlerService.successResponse(res, { success: true, client: clientData }, 'success.clientCreated');
}, { logKey: 'logs.clientCreation', errorKey: 'errors.creatingClient' }));

/**
 * POST /api/agent/clients/create
 * Créer un nouveau client
 */
router.post('/clients/create', RouteHandlerService.asyncHandler(async (req, res) => {
  RouteHandlerService.logOperation('creatingClient', { agentId: req.user.id, clientData: req.body });
  
  const clientData = await ClientManagementService.createClientWithValidation(req.body, req.user.id);
  
  return responseService.created(res, clientData, languageService.getMessage('success.clientCreated'));
}, { logKey: 'logs.clientCreation', errorKey: 'errors.creatingClient' }));

/**
 * POST /api/agent/send-welcome-email
 * Envoyer un email de bienvenue
 */
router.post('/send-welcome-email', RouteHandlerService.asyncHandler(async (req, res) => {
  const { to, subject, clientName, agentName, firstLoginToken, companyName } = req.body;
  
  // Validation des données
  if (!RouteHandlerService.validateEmail(to, res)) return;
  if (!RouteHandlerService.validateRequiredFields({ subject, clientName, agentName }, res)) return;
  
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
  
  RouteHandlerService.logOperation('welcomeEmailSent', { to, agentId: req.user.id });
  RouteHandlerService.successResponse(res, null, 'success.welcomeEmailSent');
}, { logKey: 'logs.welcomeEmailError', errorKey: 'errors.welcomeEmailError' }));

/**
 * POST /api/agent/assign
 * Attribuer un agent à un client
 */
router.post('/assign', RouteHandlerService.asyncHandler(async (req, res) => {
  const { clientId, agentId } = req.body;
  
  // Validation des données
  if (!RouteHandlerService.validateId(clientId, res, 'clientId')) return;
  if (!RouteHandlerService.validateId(agentId, res, 'agentId')) return;
  
  const result = await ClientManagementService.assignAgentToClient(clientId, agentId, req.user.id);
  
  RouteHandlerService.successResponse(res, result, 'success.agentAssigned');
}, { logKey: 'logs.agentAssignment', errorKey: 'errors.agentAssignment' }));

/**
 * POST /api/agent/clients/:id/email
 * Envoyer un email à un client
 */
router.post('/clients/:id/email', RouteHandlerService.validateIdParam('id'), RouteHandlerService.asyncHandler(async (req, res) => {
  const clientId = req.validatedParams.id;
  const { subject, message } = req.body;
  
  if (!RouteHandlerService.validateRequiredFields({ subject, message }, res)) return;
  
  const result = await NotificationManagementService.sendEmailToClient(
    clientId, 
    { subject, message, type: 'general' }, 
    req.user.id
  );
  
  RouteHandlerService.successResponse(res, result, 'success.emailSent');
}, { logKey: 'logs.emailSending', errorKey: 'errors.sendingEmail' }));

/**
 * POST /api/agent/clients/:id/message
 * Envoyer un message à un client
 */
router.post('/clients/:id/message', RouteHandlerService.validateIdParam('id'), RouteHandlerService.asyncHandler(async (req, res) => {
  const clientId = req.validatedParams.id;
  const { content, type, priority } = req.body;
  
  if (!RouteHandlerService.validateRequiredFields({ content }, res)) return;
  
  const message = await NotificationManagementService.sendMessageToClient(
    clientId, 
    { content, type, priority }, 
    req.user.id
  );
  
  RouteHandlerService.successResponse(res, message, 'success.messageSent');
}, { logKey: 'logs.messageSending', errorKey: 'errors.sendingMessage' }));

/**
 * POST /api/agent/clients/:id/notification
 * Envoyer une notification à un client
 */
router.post('/clients/:id/notification', RouteHandlerService.validateIdParam('id'), RouteHandlerService.asyncHandler(async (req, res) => {
  const clientId = req.validatedParams.id;
  const { type, priority, title, message, sendEmail, scheduledDate, actionUrl } = req.body;
  
  if (!RouteHandlerService.validateRequiredFields({ title, message }, res)) return;
  
  const notificationData = {
    type: type || 'info',
    priority: priority || 'normal',
    title,
    message,
    sendEmail: sendEmail || false,
    scheduledDate: scheduledDate || null,
    actionUrl: actionUrl || null
  };
  
  const result = await NotificationManagementService.sendNotificationToClient(
    clientId, 
    notificationData, 
    req.user.id
  );
  
  RouteHandlerService.successResponse(res, result, 'success.notificationSent');
}, { logKey: 'logs.notificationSending', errorKey: 'errors.sendingNotification' }));

/**
 * POST /api/agent/clients/bulk-notification
 * Envoyer une notification à plusieurs clients
 */
router.post('/clients/bulk-notification', RouteHandlerService.validateRequiredFieldsMiddleware(['clientIds', 'title', 'message']), RouteHandlerService.asyncHandler(async (req, res) => {
  const { clientIds, type, priority, title, message, sendEmail, scheduledDate, actionUrl } = req.body;
  const agentId = req.user.id;
  
  const notificationData = {
    type: type || 'info',
    priority: priority || 'normal',
    title,
    message,
    sendEmail: sendEmail || false,
    scheduledDate: scheduledDate || null,
    actionUrl: actionUrl || null
  };
  
  const result = await NotificationManagementService.sendBulkNotification(clientIds, notificationData, agentId);
  
  RouteHandlerService.successResponse(res, result, result.message);
}, { logKey: 'logs.sendingBulkNotification', errorKey: 'errors.sendingBulkNotification' }));

/**
 * GET /api/agent/clients/:id/notifications
 * Récupérer les notifications d'un client
 */
router.get('/clients/:id/notifications', RouteHandlerService.validateIdParam('id'), RouteHandlerService.asyncHandler(async (req, res) => {
  const clientId = req.validatedParams.id;
  const options = {
    page: req.query.page,
    limit: req.query.limit,
    unreadOnly: req.query.unreadOnly === 'true'
  };
  
  const notifications = await NotificationManagementService.getClientNotifications(clientId, req.user.id, options);
  
  RouteHandlerService.successResponse(res, notifications, 'success.retrieved');
}, { logKey: 'logs.retrievingNotifications', errorKey: 'errors.retrievingNotifications' }));

/**
 * GET /api/agent/available
 * Récupérer la liste des agents disponibles
 */
router.get('/available', RouteHandlerService.createCrudHandler(
  agentService,
  'getAvailableAgents',
  {
    logOperation: 'retrievingAvailableAgents',
    successMessage: 'success.retrieved',
    errorMessage: 'errors.retrievingAvailableAgents',
    extractParams: () => []
  }
));

/**
 * GET /api/agent/clients/:clientId/projects
 * Récupérer les projets d'un client spécifique
 */
router.get('/clients/:clientId/projects', RouteHandlerService.validateIdParam('clientId'), RouteHandlerService.asyncHandler(async (req, res) => {
  const clientId = req.validatedParams.clientId;
  const options = {
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
    priority: req.query.priority
  };

  // Enregistrer la consultation du client par l'agent
  try {
    await agentService.recordClientInteraction(req.user.id, clientId);
  } catch (e) {
    // Ne pas bloquer la route en cas d'erreur de suivi
  }
  
  const projects = await ProjectManagementService.getClientProjectsPaginated(clientId, req.user.id, options);
  
  RouteHandlerService.successResponse(res, projects, 'success.retrieved');
}, { logKey: 'logs.retrievingClientProjects', errorKey: 'errors.retrievingClientProjects' }));

/**
 * POST /api/agent/clients/:clientId/projects
 * Créer un nouveau projet pour un client
 */
router.post('/clients/:clientId/projects', RouteHandlerService.validateIdParam('clientId'), RouteHandlerService.validateRequiredFieldsMiddleware(['name', 'description']), RouteHandlerService.asyncHandler(async (req, res) => {
  const clientId = req.validatedParams.clientId;
  const projectData = req.body;
  
  const project = await ProjectManagementService.createProjectWithValidation(projectData, clientId, req.user.id);
  
  RouteHandlerService.successResponse(res, project, 'projects.projectCreated', 201);
}, { logKey: 'logs.creatingProject', errorKey: 'errors.creatingProject' }));

/**
 * GET /api/agent/projects
 * Récupérer tous les projets gérés par l'agent
 */
router.get('/projects', RouteHandlerService.asyncHandler(async (req, res) => {
  const agentId = req.user.id;
  const options = {
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
    priority: req.query.priority
  };
  
  const projects = await ProjectManagementService.getAgentProjectsPaginated(agentId, options);
  
  RouteHandlerService.successResponse(res, projects, 'projects.agentProjectsFetched');
}, { logKey: 'logs.retrievingAgentProjects', errorKey: 'errors.retrievingAgentProjects' }));

/**
 * DELETE /api/agent/projects/bulk
 * Supprimer plusieurs projets en même temps
 */
router.delete('/projects/bulk', RouteHandlerService.validateRequiredFieldsMiddleware(['projectIds']), RouteHandlerService.asyncHandler(async (req, res) => {
  const { projectIds } = req.body;
  const agentId = req.user.id;

  const ids = Array.isArray(projectIds) ? projectIds : [];
  const idValidation = validationService.validateIdArray(ids);
  if (!idValidation.isValid) {
    return responseService.validationError(res, [{ field: 'projectIds', message: idValidation.message }]);
  }

  const result = await ProjectManagementService.deleteMultipleProjectsWithValidation(ids, agentId);
  RouteHandlerService.successResponse(res, result, 'projects.multipleProjectsDeleted');
}, { logKey: 'logs.deletingMultipleProjects', errorKey: 'errors.deletingMultipleProjects' }));

/**
 * GET /api/agent/projects/:projectId
 * Récupérer les détails d'un projet spécifique
 */
router.get('/projects/:projectId', RouteHandlerService.validateIdParam('projectId'), requireProjectView, RouteHandlerService.asyncHandler(async (req, res) => {
  const projectId = req.validatedParams.projectId;
  
  const project = await ProjectManagementService.getProjectDetails(projectId, req.user.id);
  
  RouteHandlerService.successResponse(res, project, 'projects.projectDetailsFetched');
}, { logKey: 'logs.retrievingProjectDetails', errorKey: 'errors.retrievingProjectDetails' }));

/**
 * GET /api/agent/projects/:projectId/tasks
 * Récupérer les tâches d'un projet spécifique
 */
router.get('/projects/:projectId/tasks', RouteHandlerService.validateIdParam('projectId'), requireProjectView, RouteHandlerService.asyncHandler(async (req, res) => {
  const projectId = req.validatedParams.projectId;
  const options = {
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
    priority: req.query.priority
  };
  
  const tasks = await ProjectManagementService.getProjectTasks(projectId, req.user.id, options);
  
  RouteHandlerService.successResponse(res, tasks, 'projects.projectTasksFetched');
}, { logKey: 'logs.retrievingProjectTasks', errorKey: 'errors.retrievingProjectTasks' }));

/**
 * GET /api/agent/projects/:projectId/files
 * Récupérer les fichiers d'un projet spécifique
 */
router.get('/projects/:projectId/files', RouteHandlerService.validateIdParam('projectId'), requireProjectView, RouteHandlerService.asyncHandler(async (req, res) => {
  const projectId = req.validatedParams.projectId;
  const options = {
    page: req.query.page,
    limit: req.query.limit,
    fileType: req.query.fileType
  };
  
  const files = await ProjectManagementService.getProjectFiles(projectId, req.user.id, options);
  
  RouteHandlerService.successResponse(res, files, 'projects.projectFilesFetched');
}, { logKey: 'logs.retrievingProjectFiles', errorKey: 'errors.retrievingProjectFiles' }));

/**
 * GET /api/agent/projects/:projectId/team
 * Récupérer les membres de l'équipe d'un projet spécifique
 */
router.get('/projects/:projectId/team', RouteHandlerService.validateIdParam('projectId'), requireProjectView, RouteHandlerService.asyncHandler(async (req, res) => {
  const projectId = req.validatedParams.projectId;
  
  const members = await ProjectManagementService.getProjectTeamMembers(projectId, req.user.id);
  
  RouteHandlerService.successResponse(res, members, 'success.retrieved');
}, { logKey: 'logs.retrievingProjectTeam', errorKey: 'errors.retrievingProjectTeam' }));

/**
 * DELETE /api/agent/projects/bulk
 * Supprimer plusieurs projets en même temps
 */
// (Bloc '/projects/bulk' supprimé; la route est définie plus haut une seule fois)

/**
 * PUT /api/agent/projects/:projectId
 * Mettre à jour un projet spécifique
 */
router.put('/projects/:projectId', RouteHandlerService.validateIdParam('projectId'), requireProjectEdit, RouteHandlerService.asyncHandler(async (req, res) => {
  const projectId = req.validatedParams.projectId;
  const updateData = req.body;
  
  const updatedProject = await ProjectManagementService.updateProjectWithValidation(projectId, updateData, req.user.id);
  
  RouteHandlerService.successResponse(res, updatedProject, 'projects.projectUpdated');
}, { logKey: 'logs.updatingProject', errorKey: 'errors.updatingProject' }));

/**
 * DELETE /api/agent/projects/:projectId
 * Supprimer un projet spécifique
 */
router.delete('/projects/:projectId', RouteHandlerService.validateIdParam('projectId'), requireProjectEdit, RouteHandlerService.asyncHandler(async (req, res) => {
  const projectId = req.validatedParams.projectId;
  
  const result = await ProjectManagementService.deleteProjectWithValidation(projectId, req.user.id);
  
  RouteHandlerService.successResponse(res, result, 'projects.projectDeleted');
}, { logKey: 'logs.deletingProject', errorKey: 'errors.deletingProject' }));



/**
 * GET /api/agent/clients/:clientId/tasks
 * Récupérer les tâches d'un client spécifique
 */
router.get('/clients/:clientId/tasks', RouteHandlerService.validateIdParam('clientId'), RouteHandlerService.asyncHandler(async (req, res) => {
  const clientId = req.validatedParams.clientId;
  const options = {
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
    priority: req.query.priority
  };
  
  const tasks = await ProjectManagementService.getClientTasks(clientId, req.user.id, options);
  
  RouteHandlerService.successResponse(res, tasks, 'success.retrieved');
}, { logKey: 'logs.retrievingClientTasks', errorKey: 'errors.retrievingClientTasks' }));

/**
 * GET /api/agent/clients/:clientId/files
 * Récupérer les fichiers d'un client spécifique
 */
router.get('/clients/:clientId/files', RouteHandlerService.validateIdParam('clientId'), RouteHandlerService.asyncHandler(async (req, res) => {
  const clientId = req.validatedParams.clientId;
  const options = {
    page: req.query.page,
    limit: req.query.limit,
    fileType: req.query.fileType
  };
  
  const files = await ClientManagementService.getClientFiles(clientId, req.user.id, options);
  
  RouteHandlerService.successResponse(res, files, 'success.retrieved');
}, { logKey: 'logs.retrievingClientFiles', errorKey: 'errors.retrievingClientFiles' }));

/**
 * GET /api/agent/clients/:clientId/team
 * Récupérer les membres de l'équipe d'un client spécifique
 */
router.get('/clients/:clientId/team', RouteHandlerService.validateIdParam('clientId'), RouteHandlerService.asyncHandler(async (req, res) => {
  const clientId = req.validatedParams.clientId;
  
  const teamMembers = await ClientManagementService.getClientTeam(clientId, req.user.id);
  
  RouteHandlerService.successResponse(res, teamMembers, 'success.retrieved');
}, { logKey: 'logs.retrievingClientTeam', errorKey: 'errors.retrievingClientTeam' }));

/**
 * PUT /api/agent/clients/:id
 * Mettre à jour les informations d'un client
 */
router.put('/clients/:id', RouteHandlerService.validateIdParam('id'), RouteHandlerService.asyncHandler(async (req, res) => {
  const clientId = req.validatedParams.id;
  const updateData = req.body;
  
  const updatedClient = await ClientManagementService.updateClient(clientId, updateData, req.user.id);
  
  RouteHandlerService.successResponse(res, { client: updatedClient }, 'success.updated');
}, { logKey: 'logs.updatingClient', errorKey: 'errors.updatingClient' }));

/**
 * PUT /api/agent/clients/:id/status
 * Changer le statut d'un client (actif/inactif)
 */
router.put('/clients/:id/status', RouteHandlerService.validateIdParam('id'), RouteHandlerService.validateRequiredFieldsMiddleware(['status']), RouteHandlerService.asyncHandler(async (req, res) => {
  const clientId = req.validatedParams.id;
  const { status } = req.body;
  
  const result = await ClientManagementService.updateClientStatus(clientId, status, req.user.id);
  
  RouteHandlerService.successResponse(res, result, 'success.updated');
}, { logKey: 'logs.updatingClientStatus', errorKey: 'errors.updatingClientStatus' }));

/**
 * DELETE /api/agent/clients/:id
 * Supprimer définitivement un client
 */
router.delete('/clients/:id', RouteHandlerService.validateIdParam('id'), RouteHandlerService.validateRequiredFieldsMiddleware(['password']), RouteHandlerService.asyncHandler(async (req, res) => {
  const clientId = req.validatedParams.id;
  const agentId = req.user.id;
  const { reason, password } = req.body;
  
  const result = await ClientManagementService.deleteClient(clientId, agentId, password, reason);
  
  RouteHandlerService.successResponse(res, result, 'success.deleted');
}, { logKey: 'logs.deletingClient', errorKey: 'errors.deletingClient' }));

/**
 * PUT /api/agent/clients/:id/password
 * Mettre à jour le mot de passe d'un client
 */
router.put('/clients/:id/password', RouteHandlerService.validateIdParam('id'), RouteHandlerService.validateRequiredFieldsMiddleware(['newPassword']), RouteHandlerService.asyncHandler(async (req, res) => {
  const clientId = req.validatedParams.id;
  const agentId = req.user.id;
  const { newPassword } = req.body;
  
  const result = await ClientManagementService.updateClientPassword(clientId, newPassword, agentId);
  
  RouteHandlerService.successResponse(res, result, 'success.passwordUpdated');
}, { logKey: 'logs.updatingClientPassword', errorKey: 'errors.updatingClientPassword' }));

/**
 * GET /api/agent/providers/available
 * Récupérer les prestataires disponibles
 */
router.get('/providers/available', RouteHandlerService.createCrudHandler(
  agentService,
  'getAvailableProviders',
  {
    logOperation: 'retrievingProviders',
    successMessage: 'success.retrieved',
    errorMessage: 'errors.retrievingProviders',
    extractParams: () => []
  }
));

/**
 * GET /api/agent/clients/:id/stats
 * Récupérer les statistiques d'un client spécifique
 */
router.get('/clients/:id/stats', RouteHandlerService.validateIdParam('id'), RouteHandlerService.asyncHandler(async (req, res) => {
  const clientId = req.validatedParams.id;
  
  const stats = await ClientManagementService.getClientStats(clientId, req.user.id);
  
  RouteHandlerService.successResponse(res, stats, 'success.retrieved');
}, { logKey: 'logs.retrievingClientStats', errorKey: 'errors.retrievingClientStats' }));



/**
 * GET /api/agent/companies
 * Récupérer la liste des entreprises disponibles
 */
router.get('/companies', RouteHandlerService.createCrudHandler(
  companyService,
  'getCompanies',
  {
    logOperation: 'retrievingCompanies',
    successMessage: 'success.retrieved',
    errorMessage: 'errors.retrievingCompanies',
    extractParams: () => []
  }
));

/**
 * POST /api/agent/bulk-email
 * Envoyer un email à plusieurs clients
 */
router.post('/bulk-email', RouteHandlerService.validateRequiredFieldsMiddleware(['clientIds', 'subject', 'content']), RouteHandlerService.asyncHandler(async (req, res) => {
  const { clientIds, subject, content } = req.body;
  const agentId = req.user.id;
  
  const result = await NotificationManagementService.sendBulkEmail(clientIds, subject, content, agentId);
  
  RouteHandlerService.successResponse(res, result, result.message);
}, { logKey: 'logs.sendingBulkEmail', errorKey: 'errors.sendingBulkEmail' }));

/**
 * POST /api/agent/auto-assign/:clientId
 * Attribution automatique d'un agent à un client
 */
router.post('/auto-assign/:clientId', RouteHandlerService.validateIdParam('clientId'), RouteHandlerService.asyncHandler(async (req, res) => {
  const clientId = req.validatedParams.clientId;
  
  const result = await ClientManagementService.autoAssignAgent(clientId);
  
  RouteHandlerService.successResponse(res, result, result.message);
}, { logKey: 'logs.autoAssigning', errorKey: 'errors.autoAssigning' }));

// Route pour récupérer les demandes de service pour les agents
router.get('/service-requests', async (req, res) => {
  try {
    const agentId = req.user.id;
    const agentRole = req.user.role;
    
    // Vérifier que l'utilisateur est bien un agent, admin ou super_admin
    if (!['agent', 'admin', 'super_admin'].includes(agentRole)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les agents peuvent accéder aux demandes de service.'
      });
    }

    let serviceRequests = [];
    
    if (agentRole === 'super_admin' || agentRole === 'admin') {
      // Les admins et super_admins voient toutes les demandes
      const query = `
        SELECT sr.*, ags.name as service_name, ags.category as service_category,
               u.first_name, u.last_name, u.email, u.company as client_name
        FROM service_requests sr
        JOIN agency_services ags ON sr.service_id = ags.id
        JOIN users u ON sr.user_id = u.id
        ORDER BY sr.created_at DESC
      `;
      serviceRequests = await databaseService.query(query);
    } else {
      // Les agents voient seulement les demandes de leurs clients assignés
      // Adapter dynamiquement selon la présence de la colonne users.agent_id
      let hasUserAgentIdCol = false;
      try {
        const userCols = await databaseService.query('SHOW COLUMNS FROM users');
        const userColNames = (userCols || []).map(c => c.Field || c.COLUMN_NAME || c.column_name || c.name);
        hasUserAgentIdCol = userColNames.includes('agent_id');
      } catch (e) {
        hasUserAgentIdCol = false;
      }

      const baseQuery = `
        SELECT sr.*, ags.name as service_name, ags.category as service_category,
               u.first_name, u.last_name, u.email, u.company as client_name
        FROM service_requests sr
        JOIN agency_services ags ON sr.service_id = ags.id
        JOIN users u ON sr.user_id = u.id
      `;
      let whereClause;
      let params;
      if (hasUserAgentIdCol) {
        whereClause = 'WHERE u.agent_id = ? OR u.id IN (SELECT client_id FROM agent_clients WHERE agent_id = ?)';
        params = [agentId, agentId];
      } else {
        // En absence de users.agent_id, se baser uniquement sur agent_clients
        whereClause = 'WHERE u.id IN (SELECT client_id FROM agent_clients WHERE agent_id = ?)';
        params = [agentId];
      }
      const query = `${baseQuery} ${whereClause} ORDER BY sr.created_at DESC`;
      serviceRequests = await databaseService.query(query, params);
    }

    res.json({
      success: true,
      data: serviceRequests
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des demandes de service:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des demandes de service',
      error: error.message
    });
  }
});

// Route pour mettre à jour le statut d'une demande de service
router.put('/service-requests/:requestId/status', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const agentId = req.user.id;
    const agentRole = req.user.role;
    
    // Vérifier que l'utilisateur est bien un agent, admin ou super_admin
    if (!['agent', 'admin', 'super_admin'].includes(agentRole)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seuls les agents peuvent modifier les demandes de service.'
      });
    }

    // Vérifier que la demande existe et que l'agent y a accès
    let accessQuery;
    let accessParams;
    
    if (agentRole === 'super_admin' || agentRole === 'admin') {
      accessQuery = 'SELECT sr.* FROM service_requests sr WHERE sr.id = ?';
      accessParams = [requestId];
    } else {
      // Adapter dynamiquement selon la présence de users.agent_id
      let hasUserAgentIdCol = false;
      try {
        const userCols = await databaseService.query('SHOW COLUMNS FROM users');
        const userColNames = (userCols || []).map(c => c.Field || c.COLUMN_NAME || c.column_name || c.name);
        hasUserAgentIdCol = userColNames.includes('agent_id');
      } catch (e) {
        hasUserAgentIdCol = false;
      }

      if (hasUserAgentIdCol) {
        accessQuery = `
          SELECT sr.* FROM service_requests sr
          JOIN users u ON sr.user_id = u.id
          WHERE sr.id = ? AND (u.agent_id = ? OR u.id IN (
            SELECT client_id FROM agent_clients WHERE agent_id = ?
          ))
        `;
        accessParams = [requestId, agentId, agentId];
      } else {
        accessQuery = `
          SELECT sr.* FROM service_requests sr
          JOIN users u ON sr.user_id = u.id
          WHERE sr.id = ? AND u.id IN (
            SELECT client_id FROM agent_clients WHERE agent_id = ?
          )
        `;
        accessParams = [requestId, agentId];
      }
    }
    
    const serviceRequest = await databaseService.get(accessQuery, accessParams);
    
    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Demande de service non trouvée ou accès non autorisé'
      });
    }

    // Mettre à jour le statut
    await databaseService.run(
      'UPDATE service_requests SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, requestId]
    );

    // Enregistrer l'historique du changement de statut
    await databaseService.run(
      `INSERT INTO request_status_history (request_id, old_status, new_status, changed_by, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [requestId, serviceRequest.status, status, agentId]
    );

    res.json({
      success: true,
      message: 'Statut mis à jour avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut',
      error: error.message
    });
  }
});

module.exports = router;