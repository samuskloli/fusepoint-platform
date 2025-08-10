/**
 * Traductions françaises pour l'administration
 */

export default {
  dashboard: {
    title: 'Tableau de bord Administrateur',
    subtitle: 'Gestion et supervision de la plateforme',
    backToDashboard: 'Retour au tableau de bord',
    totalUsers: 'Utilisateurs totaux',
    activeUsers: 'Utilisateurs actifs',
    agents: 'Agents',
    admins: 'Administrateurs',
    statistics: 'Statistiques',
    userManagement: 'Gestion des utilisateurs',
    platformSettings: 'Paramètres de la plateforme',
    systemLogs: 'Journaux système',
    overview: 'Vue d\'ensemble',
    quickActions: 'Actions rapides'
  },
  userManagement: {
    title: 'Gestion des utilisateurs',
    subtitle: 'Administrer les comptes utilisateurs et leurs permissions',
    searchPlaceholder: 'Rechercher par nom, email ou rôle...',
    filterByRole: 'Filtrer par rôle',
    filterByStatus: 'Filtrer par statut',
    allRoles: 'Tous les rôles',
    allStatuses: 'Tous les statuts',
    active: 'Actif',
    inactive: 'Inactif',
    usersPerPage: 'utilisateurs par page',
    noUsersFound: 'Aucun utilisateur trouvé',
    noUsersMessage: 'Aucun utilisateur ne correspond aux critères de recherche.',
    loadingUsers: 'Chargement des utilisateurs...',
    userDetails: 'Détails de l\'utilisateur',
    editUser: 'Modifier l\'utilisateur',
    resetPassword: 'Réinitialiser le mot de passe',
    toggleStatus: 'Basculer le statut',
    confirmDelete: 'Confirmer la suppression',
    actions: 'Actions',
    columns: {
      name: 'Nom',
      email: 'Email',
      role: 'Rôle',
      status: 'Statut',
      lastLogin: 'Dernière connexion',
      createdAt: 'Créé le',
      actions: 'Actions'
    },
    roles: {
      client: 'Client',
      agent: 'Agent',
      admin: 'Administrateur',
      super_admin: 'Super Administrateur'
    },
    status: {
      active: 'Actif',
      inactive: 'Inactif'
    },
    modals: {
      editUser: {
        title: 'Modifier l\'utilisateur',
        firstName: 'Prénom',
        lastName: 'Nom',
        email: 'Email',
        phone: 'Téléphone',
        role: 'Rôle',
        status: 'Statut',
        save: 'Enregistrer',
        cancel: 'Annuler',
        saving: 'Enregistrement...'
      },
      resetPassword: {
        title: 'Réinitialiser le mot de passe',
        newPassword: 'Nouveau mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        generatePassword: 'Générer un mot de passe',
        reset: 'Réinitialiser',
        cancel: 'Annuler',
        resetting: 'Réinitialisation...',
        passwordRequirements: 'Le mot de passe doit contenir au moins 8 caractères'
      },
      confirmAction: {
        title: 'Confirmer l\'action',
        activateUser: 'Êtes-vous sûr de vouloir activer cet utilisateur ?',
        deactivateUser: 'Êtes-vous sûr de vouloir désactiver cet utilisateur ?',
        confirm: 'Confirmer',
        cancel: 'Annuler'
      }
    },
    success: {
      userUpdated: 'Utilisateur mis à jour avec succès',
      passwordReset: 'Mot de passe réinitialisé avec succès',
      userActivated: 'Utilisateur activé avec succès',
      userDeactivated: 'Utilisateur désactivé avec succès',
      dataRefreshed: 'Données actualisées avec succès'
    },
    errors: {
      loadUsers: 'Erreur lors du chargement des utilisateurs',
      updateUser: 'Erreur lors de la mise à jour de l\'utilisateur',
      resetPassword: 'Erreur lors de la réinitialisation du mot de passe',
      updateStatus: 'Erreur lors de la mise à jour du statut',
      invalidEmail: 'Adresse email invalide',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
      refreshFailed: 'Échec de l\'actualisation des données',
      networkError: 'Erreur de connexion réseau',
      unauthorized: 'Vous n\'êtes pas autorisé à effectuer cette action'
    },
    validation: {
      required: 'Ce champ est requis',
      emailFormat: 'Format d\'email invalide',
      phoneFormat: 'Format de téléphone invalide',
      passwordLength: 'Le mot de passe doit contenir au moins 8 caractères'
    }
  },
  permissions: {
    title: 'Gestion des permissions',
    subtitle: 'Configurer les autorisations et les accès',
    userPermissions: 'Permissions utilisateur',
    rolePermissions: 'Permissions par rôle',
    accessControl: 'Contrôle d\'accès'
  },
  settings: {
    title: 'Paramètres administrateur',
    subtitle: 'Configuration avancée de la plateforme',
    general: 'Général',
    security: 'Sécurité',
    notifications: 'Notifications',
    maintenance: 'Maintenance'
  },
  logs: {
    title: 'Journaux système',
    subtitle: 'Surveillance et audit des activités',
    systemLogs: 'Journaux système',
    userActions: 'Actions utilisateur',
    errorLogs: 'Journaux d\'erreur',
    auditTrail: 'Piste d\'audit'
  }
};