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
  RouteHandlerService.logOperation('retrievingClients', { agentId: req.user.id });
  
  // Construire les filtres à partir des paramètres de requête
  const filters = {
    search: req.query.search,
    status: req.query.status,
    agentId: req.query.agentId,
    limit: req.query.limit ? parseInt(req.query.limit) : undefined,
    offset: req.query.offset ? parseInt(req.query.offset) : undefined
  };
  
  const clients = await agentService.getAgentClients(req.user.id, filters);
  
  RouteHandlerService.successResponse(res, clients, 'success.clientsRetrieved');
}, { logKey: 'logs.clientsRetrieval', errorKey: 'errors.retrievingClients' }));

/**
 * GET /api/agent/assigned-clients
 * Récupérer les clients attribués à l'agent connecté
 */
router.get('/assigned-clients', RouteHandlerService.asyncHandler(async (req, res) => {
  const agentId = req.user.id;
  const userRole = req.user.role;
  RouteHandlerService.logOperation('retrievingAssignedClients', { agentId });
  
  // Construire les filtres selon le rôle
  const filters = {
    agentId: userRole === 'super_admin' ? undefined : agentId,
    status: 'active',
    search: req.query.search,
    limit: req.query.limit ? parseInt(req.query.limit) : undefined,
    offset: req.query.offset ? parseInt(req.query.offset) : undefined
  };
  
  const clients = await agentService.getAgentClients(agentId, filters);
  
  RouteHandlerService.successResponse(res, clients, 'success.assignedClientsRetrieved');
}, { logKey: 'logs.assignedClientsRetrieval', errorKey: 'errors.retrievingAssignedClients' }));

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
  
  const project = await ProjectManagementService.createProject(clientId, projectData, req.user.id);
  
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
 * GET /api/agent/projects/:projectId
 * Récupérer les détails d'un projet spécifique
 */
router.get('/projects/:projectId', RouteHandlerService.validateIdParam('projectId'), RouteHandlerService.asyncHandler(async (req, res) => {
  const projectId = req.validatedParams.projectId;
  
  const project = await ProjectManagementService.getProjectDetails(projectId, req.user.id);
  
  RouteHandlerService.successResponse(res, project, 'projects.projectDetailsFetched');
}, { logKey: 'logs.retrievingProjectDetails', errorKey: 'errors.retrievingProjectDetails' }));

/**
 * GET /api/agent/projects/:projectId/tasks
 * Récupérer les tâches d'un projet spécifique
 */
router.get('/projects/:projectId/tasks', RouteHandlerService.validateIdParam('projectId'), RouteHandlerService.asyncHandler(async (req, res) => {
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
router.get('/projects/:projectId/files', RouteHandlerService.validateIdParam('projectId'), RouteHandlerService.asyncHandler(async (req, res) => {
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
router.get('/projects/:projectId/team', RouteHandlerService.validateIdParam('projectId'), RouteHandlerService.asyncHandler(async (req, res) => {
  const projectId = req.validatedParams.projectId;
  
  const members = await ProjectManagementService.getProjectTeamMembers(projectId, req.user.id);
  
  RouteHandlerService.successResponse(res, members, 'success.retrieved');
}, { logKey: 'logs.retrievingProjectTeam', errorKey: 'errors.retrievingProjectTeam' }));

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
  
  const teamMembers = await ClientManagementService.getClientTeamMembers(clientId, req.user.id);
  
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

module.exports = router;