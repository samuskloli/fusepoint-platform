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
    quickActions: 'Actions rapides',
    tabs: {
      users: 'Utilisateurs',
      statistics: 'Statistiques',
      settings: 'Paramètres',
      logs: 'Journaux'
    }
  },
  userManagement: {
    title: 'Gestion des utilisateurs',
    subtitle: 'Administrer les comptes utilisateurs et leurs permissions',
    totalUsers: 'Total Utilisateurs',
    activeUsers: 'Utilisateurs Actifs',
    newUsers: 'Nouveaux Utilisateurs',
    pendingInvitations: 'Invitations en Attente',
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
    filters: {
      all: 'Tous',
      active: 'Actifs',
      inactive: 'Inactifs',
      role: 'Rôle',
      subscription: 'Abonnement'
    },
    table: {
      name: 'Nom',
      email: 'Email',
      role: 'Rôle',
      status: 'Statut',
      lastLogin: 'Dernière Connexion',
      actions: 'Actions',
      subscription: 'Abonnement',
      createdAt: 'Date de création',
      updatedAt: 'Dernière modification'
    },
    pagination: {
      showing: 'Affichage de {start} à {end} sur {total} utilisateurs',
      previous: 'Précédent',
      next: 'Suivant',
      page: 'Page',
      of: 'sur',
      itemsPerPage: 'Éléments par page'
    },
    messages: {
      noUsers: 'Aucun utilisateur trouvé',
      loadingUsers: 'Chargement des utilisateurs...',
      userUpdated: 'Utilisateur mis à jour avec succès',
      userDeleted: 'Utilisateur supprimé avec succès',
      userActivated: 'Utilisateur activé avec succès',
      userDeactivated: 'Utilisateur désactivé avec succès',
      passwordReset: 'Mot de passe réinitialisé avec succès',
      subscriptionUpdated: 'Statut d\'abonnement mis à jour avec succès',
      errorLoadingUsers: 'Erreur lors du chargement des utilisateurs',
      errorUpdatingUser: 'Erreur lors de la mise à jour de l\'utilisateur',
      errorDeletingUser: 'Erreur lors de la suppression de l\'utilisateur',
      errorUpdatingSubscription: 'Erreur lors de la mise à jour de l\'abonnement'
    },
    columns: {
      name: 'Nom',
      email: 'Email',
      role: 'Rôle',
      status: 'Statut',
      subscription: 'Abonnement',
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
    // Informations personnelles
    personalInfo: 'Informations personnelles',
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    name: 'Nom',
    role: 'Rôle',
    status: 'Statut',
    createdAt: 'Date de création',
    lastLogin: 'Dernière connexion',
    
    statuses: {
      active: 'Actif',
      inactive: 'Inactif',
      allRoles: 'Tous les rôles',
      allStatuses: 'Tous les statuts',
    },
    actions: {
      editUser: 'Modifier l\'utilisateur',
      activate: 'Activer',
      deactivate: 'Désactiver',
      confirmActivate: 'Confirmer l\'activation',
      confirmDeactivate: 'Confirmer la désactivation',
      activateWarning: 'Cet utilisateur sera réactivé et pourra accéder à la plateforme.',
      deactivateWarning: 'Cet utilisateur sera désactivé et ne pourra plus accéder à la plateforme.',
      userDetails: 'Détails de l\'utilisateur',
      noUsers: 'Aucun utilisateur trouvé',
    },
    passwordManagement: {
      passwordManagement: 'Gestion du mot de passe',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      updatePassword: 'Mettre à jour le mot de passe',
    },
    subscription: {
      paid: 'Payé',
      free: 'Gratuit',
      unpaid: 'Non payé',
      makePaid: 'Marquer comme payé',
      makeFree: 'Marquer comme gratuit'
    },
    
    // Messages d'erreur
    errors: {
      loadUsers: 'Erreur lors du chargement des utilisateurs',
      loadUserDetails: 'Erreur lors du chargement des détails de l\'utilisateur',
      updateUser: 'Erreur lors de la mise à jour de l\'utilisateur',
      updateStatus: 'Erreur lors de la mise à jour du statut',
      updatePassword: 'Erreur lors de la mise à jour du mot de passe',
      updateSubscription: 'Erreur lors de la mise à jour de l\'abonnement',
      noUserSelected: 'Aucun utilisateur sélectionné',
      invalidUser: 'Utilisateur invalide',
      requiredFields: 'Veuillez remplir tous les champs obligatoires',
      invalidEmail: 'Adresse email invalide',
      passwordFieldsRequired: 'Veuillez remplir tous les champs de mot de passe',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères'
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
      dataRefreshed: 'Données actualisées avec succès',
      subscriptionUpdated: 'Statut d\'abonnement mis à jour avec succès',
      subscriptionUpgraded: 'Abonnement mis à niveau avec succès',
      subscriptionDowngraded: 'Abonnement rétrogradé avec succès'
    },
    errors: {
      loadUsers: 'Erreur lors du chargement des utilisateurs',
      updateUser: 'Erreur lors de la mise à jour de l\'utilisateur',
      resetPassword: 'Erreur lors de la réinitialisation du mot de passe',
      updateStatus: 'Erreur lors de la mise à jour du statut',
      updateSubscription: 'Erreur lors de la mise à jour de l\'abonnement',
      loadSubscription: 'Erreur lors du chargement du statut d\'abonnement',
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
  },
  widget_management: {
    title: 'Gestion des Widgets',
    description: 'Analysez et gérez les widgets développés et ceux en base de données',
    bulk_actions: 'Actions groupées',
    add_missing_widgets: 'Ajouter les widgets manquants',
    generate_manifests: 'Générer les manifestes manquants',
    overview: {
      title: 'Vue d\'ensemble',
      total_developed: 'Widgets développés',
      total_database: 'Widgets en base',
      missing_in_db: 'Manquants en base',
      missing_manifests: 'Manifestes manquants'
    },
    filters: {
      all_categories: 'Toutes les catégories',
      all_statuses: 'Tous les statuts',
      search_placeholder: 'Rechercher un widget...'
    },
    status: {
      in_database: 'En base',
      missing_in_db: 'Manquant en base',
      has_manifest: 'Avec manifeste',
      missing_manifest: 'Sans manifeste'
    },
    categories: {
      productivity: 'Productivité',
      analytics: 'Analytique',
      communication: 'Communication',
      management: 'Gestion',
      security: 'Sécurité',
      integration: 'Intégration',
      other: 'Autre'
    },
    actions: {
      add_to_db: 'Ajouter en base',
      update: 'Mettre à jour',
      delete: 'Supprimer',
      generate_manifest: 'Générer manifeste'
    },
    messages: {
      loading: 'Chargement de l\'analyse...',
      no_widgets: 'Aucun widget trouvé',
      analysis_complete: 'Analyse terminée',
      error_loading: 'Erreur lors du chargement'
    }
  }
};