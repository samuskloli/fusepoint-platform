/**
 * Fichier de traduction français - Messages d'erreur et d'information
 * Système simplifié pour la gestion multilingue future
 * Se concentre uniquement sur les messages utilisateur critiques
 */

module.exports = {
  // Messages d'erreur généraux
  errors: {
    unauthorized: 'Accès non autorisé',
    forbidden: 'Accès refusé',
    notFound: 'Ressource non trouvée',
    invalidData: 'Données invalides',
    serverError: 'Erreur interne du serveur',
    databaseError: 'Erreur de base de données',
    validationError: 'Erreur de validation',
    authenticationFailed: 'Échec de l\'authentification',
    tokenInvalid: 'Token invalide',
    passwordIncorrect: 'Mot de passe incorrect',
    clientNotFound: 'Client non trouvé',
    agentNotFound: 'Agent non trouvé',
    invalidEmail: 'Adresse email invalide',
    invalidId: 'Identifiant invalide',
    requiredFields: 'Champs requis manquants',
    emailExists: 'Cette adresse email existe déjà',
    invalidStatus: 'Statut invalide',
    passwordRequired: 'Mot de passe requis pour confirmer',
    clientAlreadyAssigned: 'Ce client a déjà un agent attribué',
    noAvailableAgent: 'Aucun agent disponible pour l\'attribution',
    noClientsFound: 'Aucun client trouvé',
    projectNotFound: 'Projet non trouvé'
  },

  // Messages d'authentification
  auth: {
    loginSuccess: 'Connexion réussie',
    loginFailed: 'Échec de la connexion',
    logoutSuccess: 'Déconnexion réussie',
    registrationSuccess: 'Inscription réussie',
    registrationFailed: 'Échec de l\'inscription',
    tokenExpired: 'Session expirée',
    invalidCredentials: 'Identifiants invalides',
    accountLocked: 'Compte verrouillé',
    accountNotVerified: 'Compte non vérifié',
    passwordResetSent: 'Email de réinitialisation envoyé',
    passwordResetSuccess: 'Mot de passe réinitialisé avec succès',
    // Messages d'erreur spécifiques
    emailRequired: 'L\'adresse email est requise',
    passwordRequired: 'Le mot de passe est requis',
    emailPasswordRequired: 'Email et mot de passe requis',
    invalidEmailFormat: 'Format d\'email invalide',
    passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
    passwordWeak: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
    passwordsNotMatch: 'Les mots de passe ne correspondent pas',
    emailIncorrect: 'Adresse email incorrecte',
    passwordIncorrect: 'Mot de passe incorrect',
    emailOrPasswordIncorrect: 'Email ou mot de passe incorrect',
    accountNotFound: 'Compte inexistant',
    connectionError: 'Erreur de connexion au serveur',
    registrationError: 'Erreur lors de l\'inscription',
    loginError: 'Erreur lors de la connexion',
    logoutError: 'Erreur lors de la déconnexion',
    tokenInvalid: 'Token invalide ou expiré',
    tokenRefreshInvalid: 'Token de rafraîchissement invalide',
    tokenRequired: 'Token d\'authentification requis',
    userNotFound: 'Utilisateur non trouvé',
    allFieldsRequired: 'Tous les champs sont requis',
    emailAlreadyExists: 'Cette adresse email est déjà utilisée'
  },

  // Messages de succès
  success: {
    created: 'Créé avec succès',
    updated: 'Mis à jour avec succès',
    deleted: 'Supprimé avec succès',
    sent: 'Envoyé avec succès',
    assigned: 'Attribué avec succès',
    retrieved: 'Récupéré avec succès',
    statsRetrieved: 'Statistiques récupérées avec succès',
    clientsRetrieved: 'Clients récupérés avec succès',
    assignedClientsRetrieved: 'Clients attribués récupérés avec succès',
    clientCreated: 'Client créé avec succès',
    emailSent: 'Email envoyé avec succès',
    messageSent: 'Message envoyé avec succès',
    agentAssigned: 'Agent attribué avec succès',
    statusUpdated: 'Statut mis à jour avec succès'
  },

  // Messages spécifiques aux agents
  agent: {
    stats_retrieved: 'Statistiques de l\'agent récupérées avec succès',
    stats_error: 'Erreur lors de la récupération des statistiques',
    clients_retrieved: 'Clients récupérés avec succès',
    clients_error: 'Erreur lors de la récupération des clients',
    not_found: 'Agent non trouvé',
    assignment_success: 'Agent attribué avec succès',
    assignment_error: 'Erreur lors de l\'attribution de l\'agent',
    assigning: 'Attribution de l\'agent en cours',
    assigned_successfully: 'Agent attribué avec succès',
    fetching_available: 'Récupération des agents disponibles',
    available_fetched: 'Agents disponibles récupérés avec succès',
    fetch_available_error: 'Erreur lors de la récupération des agents disponibles'
  },

  // Messages spécifiques aux clients
  client: {
    notFound: 'Client non trouvé',
    idRequired: 'ID du client requis',
    statusRequired: 'Statut requis',
    invalidStatus: 'Statut invalide. Utilisez "active" ou "inactive"',
    subjectAndContentRequired: 'Sujet et contenu requis',
    clientIdsRequired: 'IDs des clients requis',
    noClientsFound: 'Aucun client trouvé',
    deletionError: 'Erreur lors de la suppression du client'
  },

  // Clients
  clients: {
    fetchingClients: 'Récupération de la liste des clients...',
    clientsFetched: 'Liste des clients récupérée avec succès',
    errorFetchingClients: 'Erreur lors de la récupération des clients',
    creatingClient: 'Création d\'un nouveau client...',
    clientCreated: 'Client créé avec succès',
    errorCreatingClient: 'Erreur lors de la création du client',
    sendingWelcomeEmail: 'Envoi de l\'email de bienvenue...',
    welcomeEmailSent: 'Email de bienvenue envoyé avec succès',
    errorSendingWelcomeEmail: 'Erreur lors de l\'envoi de l\'email de bienvenue',
    fetchingClientFiles: 'Récupération des fichiers du client...',
    clientFilesFetched: 'Fichiers du client récupérés avec succès',
    errorFetchingClientFiles: 'Erreur lors de la récupération des fichiers du client',
    fetchingClientTeam: 'Récupération de l\'équipe du client...',
    clientTeamFetched: 'Équipe du client récupérée avec succès',
    errorFetchingClientTeam: 'Erreur lors de la récupération de l\'équipe du client',
    updatingClient: 'Mise à jour du client...',
    clientUpdated: 'Client mis à jour avec succès',
    errorUpdatingClient: 'Erreur lors de la mise à jour du client',
    updatingClientStatus: 'Mise à jour du statut du client...',
    clientStatusUpdated: 'Statut du client mis à jour avec succès',
    errorUpdatingClientStatus: 'Erreur lors de la mise à jour du statut du client',
    deletingClient: 'Suppression du client...',
    clientDeleted: 'Client supprimé avec succès',
    errorDeletingClient: 'Erreur lors de la suppression du client',
    fetchingClientStats: 'Récupération des statistiques du client...',
    clientStatsFetched: 'Statistiques du client récupérées avec succès',
    errorFetchingClientStats: 'Erreur lors de la récupération des statistiques du client',
    fetch_stats_error: 'Erreur lors de la récupération des statistiques du client',
    bulkEmailSending: 'Erreur lors de l\'envoi d\'emails groupés',
    autoAssignment: 'Erreur lors de l\'attribution automatique',
    retrievingClientStats: 'Erreur lors de la récupération des statistiques du client',
    retrievingCompanies: 'Erreur lors de la récupération des entreprises',
    sendingBulkEmail: 'Erreur lors de l\'envoi d\'email en masse',
    autoAssigning: 'Erreur lors de l\'attribution automatique',
    noClientsFound: 'Aucun client trouvé',
    clientAlreadyAssigned: 'Ce client a déjà un agent attribué',
    noAvailableAgent: 'Aucun agent disponible pour l\'attribution'
  },

  // Prestataires
  providers: {
    fetching: 'Récupération des prestataires disponibles',
    fetch_error: 'Erreur lors de la récupération des prestataires'
  },
  companies: {
    fetching: 'Récupération des entreprises',
    fetch_error: 'Erreur lors de la récupération des entreprises'
  },
  bulk_email: {
    sending: 'Envoi d\'emails groupés',
    send_error: 'Erreur lors de l\'envoi d\'emails groupés'
  },
  auto_assign: {
    assigning: 'Attribution automatique d\'agent',
    assign_error: 'Erreur lors de l\'attribution automatique'
  },

  // Messages d'email
  email: {
    activationSent: 'Email d\'activation envoyé',
    deactivationSent: 'Email de désactivation envoyé',
    sendError: 'Erreur lors de l\'envoi de l\'email',
    groupEmailsResult: 'Emails envoyés: {success} réussis, {failed} échecs',
    sent_successfully: 'Email envoyé avec succès',
    send_error: 'Erreur lors de l\'envoi de l\'email',
    invalid_format: 'Format d\'email invalide',
    welcome_sent: 'Email de bienvenue envoyé avec succès',
    welcome_error: 'Erreur lors de l\'envoi de l\'email de bienvenue',
    sending_welcome: 'Envoi de l\'email de bienvenue en cours',
    sending_to_client: 'Envoi d\'email au client en cours'
  },

  // Messages de validation
  validation: {
    required: 'Ce champ est requis',
    invalidEmail: 'Adresse email invalide',
    invalidPhone: 'Numéro de téléphone invalide',
    passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
    invalidRole: 'Rôle invalide'
  },

  // Messages
  message: {
    sending_to_client: 'Envoi de message au client en cours',
    sent_successfully: 'Message envoyé avec succès',
    send_error: 'Erreur lors de l\'envoi du message'
  },

  // Notifications
  notifications: {
    fetching_for_client: 'Récupération des notifications du client',
    fetched_successfully: 'Notifications récupérées avec succès',
    fetch_error: 'Erreur lors de la récupération des notifications'
  },

  // Projets
  projects: {
    fetchingClientProjects: 'Récupération des projets du client...',
    clientProjectsFetched: 'Projets du client récupérés avec succès',
    errorFetchingClientProjects: 'Erreur lors de la récupération des projets du client',
    creatingProject: 'Création du projet...',
    projectCreated: 'Projet créé avec succès',
    errorCreatingProject: 'Erreur lors de la création du projet',
    fetchingAgentProjects: 'Récupération des projets de l\'agent...',
    agentProjectsFetched: 'Projets de l\'agent récupérés avec succès',
    errorFetchingAgentProjects: 'Erreur lors de la récupération des projets de l\'agent',
    fetchingProjectDetails: 'Récupération des détails du projet...',
    projectDetailsFetched: 'Détails du projet récupérés avec succès',
    errorFetchingProjectDetails: 'Erreur lors de la récupération des détails du projet',
    fetchingProjectTasks: 'Récupération des tâches du projet...',
    projectTasksFetched: 'Tâches du projet récupérées avec succès',
    errorFetchingProjectTasks: 'Erreur lors de la récupération des tâches du projet',
    fetchingProjectFiles: 'Récupération des fichiers du projet...',
    projectFilesFetched: 'Fichiers du projet récupérés avec succès',
    errorFetchingProjectFiles: 'Erreur lors de la récupération des fichiers du projet',
    fetchingProjectTeam: 'Récupération de l\'équipe du projet...',
    projectTeamFetched: 'Équipe du projet récupérée avec succès',
    errorFetchingProjectTeam: 'Erreur lors de la récupération de l\'équipe du projet',
    fetchingClientTasks: 'Récupération des tâches du client...',
    clientTasksFetched: 'Tâches du client récupérées avec succès',
    errorFetchingClientTasks: 'Erreur lors de la récupération des tâches du client'
  },

  // Labels et titres
  labels: {
    name: 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    status: 'Statut',
    role: 'Rôle',
    created_at: 'Créé le',
    updated_at: 'Mis à jour le',
    actions: 'Actions'
  },

  // Messages de log
  logs: {
    clientDeletion: 'Suppression du client {clientName} ({clientEmail}) par l\'agent {agentName}',
    clientStatusChange: 'Changement de statut client',
    clientUpdate: 'Mise à jour du client',
    autoAssignment: 'Attribution automatique d\'agent',
    groupEmailSent: 'Envoi d\'emails groupés',
    routeCalled: 'Route appelée: {route}',
    userAction: 'Action utilisateur: {action}',
    dataProcessed: 'Données traitées avec succès',
    operationCompleted: 'Opération terminée',
    retrievingAgentStats: 'Récupération des statistiques de l\'agent',
    retrievingClients: 'Récupération de la liste des clients',
    retrievingAssignedClients: 'Récupération des clients assignés',
    creatingClient: 'Création d\'un nouveau client',
    sendingWelcomeEmail: 'Envoi d\'email de bienvenue',
    assigningClient: 'Assignation d\'un client à un agent',
    sendingEmailToClient: 'Envoi d\'email à un client',
    sendingMessageToClient: 'Envoi d\'un message à un client',
    retrievingClientNotifications: 'Récupération des notifications du client',
    retrievingAvailableAgents: 'Récupération des agents disponibles',
    retrievingClientProjects: 'Récupération des projets du client',
    retrievingClientStats: 'Récupération des statistiques du client',
    retrievingProviders: 'Récupération des prestataires disponibles',
    retrievingCompanies: 'Récupération de la liste des entreprises',
    sendingBulkEmail: 'Envoi d\'email en masse',
    autoAssigning: 'Attribution automatique d\'un agent'
  }
};