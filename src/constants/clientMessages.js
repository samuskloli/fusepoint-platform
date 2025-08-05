// Messages centralisés pour la gestion des clients
// Facilite les modifications, personnalisations et traductions

export const MESSAGES = {
  // Titre et sous-titre de la page
  title: 'Gestion des Clients',
  subtitle: 'Gérez vos clients et leurs informations',
  
  // Boutons principaux
  addClient: 'Ajouter un client',
  bulkDelete: 'Supprimer les clients',
  bulkNotification: 'Notifications groupées',
  
  // Section des filtres
  filters: {
    searchPlaceholder: 'Rechercher un client...',
    filtersButton: 'Filtres',
    statusLabel: 'Statut',
    statusAll: 'Tous les statuts',
    statusActive: 'Actif',
    statusInactive: 'Inactif',
    statusPending: 'En attente',
    statusSuspended: 'Suspendu',
    statusArchived: 'Archivé',
    periodLabel: 'Période',
    periodAll: 'Toutes les périodes',
    periodToday: 'Aujourd\'hui',
    periodWeek: 'Cette semaine',
    periodMonth: 'Ce mois',
    resetButton: 'Réinitialiser'
  },
  
  // Tableau des clients
  table: {
    loading: 'Chargement des clients...',
    error: 'Erreur lors du chargement des clients',
    retry: 'Réessayer',
    noClients: 'Aucun client trouvé',
    noClientsSubtext: 'Commencez par ajouter votre premier client',
    selectAll: 'Sélectionner tout',
    selected: 'sélectionné(s)',
    noCompany: 'Aucune entreprise',
    noPhone: 'Aucun téléphone',
    statusActive: 'Actif',
    statusInactive: 'Inactif',
    editButton: 'Modifier',
    deleteButton: 'Supprimer le client',
    assignAgent: 'Attribuer un agent',
    sendEmail: 'Envoyer un email',
    sendNotification: 'Envoyer une notification',
    activate: 'Activer le client',
    deactivate: 'Désactiver le client',
    never: 'Jamais'
  },
  
  // Pagination
  pagination: {
    previous: 'Précédent',
    next: 'Suivant',
    showing: 'Affichage de',
    to: 'à',
    of: 'sur',
    results: 'résultats'
  },
  
  // Modal de création/édition
  modal: {
    createTitle: 'Ajouter un nouveau client',
    editTitle: 'Modifier le client',
    firstNameLabel: 'Prénom',
    lastNameLabel: 'Nom',
    emailLabel: 'Email',
    phoneLabel: 'Téléphone',
    companyLabel: 'Entreprise',
    statusLabel: 'Statut',
    statusActive: 'Actif',
    statusInactive: 'Inactif',
    cancelButton: 'Annuler',
    createButton: 'Créer',
    editButton: 'Modifier',
    saving: 'Enregistrement...'
  },
  
  // Modal de suppression individuelle
  deleteModal: {
    title: 'Supprimer le client',
    message: 'Êtes-vous sûr de vouloir supprimer définitivement',
    warning: 'Cette action est irréversible. Toutes les données du client seront supprimées.',
    reasonLabel: 'Raison de la suppression (optionnel)',
    reasonPlaceholder: 'Veuillez expliquer la raison de cette suppression...',
    confirmButton: 'Supprimer définitivement',
    cancelButton: 'Annuler',
    deleting: 'Suppression en cours...',
    passwordLabel: 'Confirmez votre mot de passe',
    passwordPlaceholder: 'Entrez votre mot de passe'
  },
  
  // Modal de suppression en masse
  bulkDeleteModal: {
    title: 'Supprimer',
    message: 'Êtes-vous sûr de vouloir supprimer définitivement',
    clientsPlural: 'clients',
    clientsSingular: 'client',
    selectedClientsLabel: 'Clients sélectionnés',
    warningLargeSelection: 'Attention : Vous êtes sur le point de supprimer un grand nombre de clients.',
    warning: 'Cette action est irréversible. Toutes les données des clients seront supprimées.',
    reasonLabel: 'Raison de la suppression (optionnel)',
    reasonPlaceholder: 'Veuillez expliquer la raison de ces suppressions...',
    confirmButton: 'Supprimer définitivement',
    cancelButton: 'Annuler',
    deleting: 'Suppression en cours...',
    passwordLabel: 'Confirmez votre mot de passe',
    passwordPlaceholder: 'Entrez votre mot de passe'
  },
  
  // Notifications
  notifications: {
    clientCreated: 'Client créé avec succès',
    clientUpdated: 'Client modifié avec succès',
    clientDeleted: 'Client supprimé avec succès',
    bulkClientsDeleted: 'Clients supprimés avec succès',
    clientActivated: 'Client activé avec succès',
    clientDeactivated: 'Client désactivé avec succès',
    clientSuspended: 'Client suspendu avec succès',
    clientArchived: 'Client archivé avec succès',
    statusChanged: 'Statut du client modifié avec succès',
    createError: 'Erreur lors de la création du client',
    updateError: 'Erreur lors de la modification du client',
    deleteError: 'Erreur lors de la suppression du client',
    deletePasswordError: 'Mot de passe incorrect. Suppression annulée.',
    bulkDeleteError: 'Erreur lors de la suppression des clients',
    bulkDeletePasswordError: 'Mot de passe incorrect. Suppression en masse annulée.',
    noClientSelected: 'Aucun client sélectionné'
  },
  
  // Messages d'erreur de validation
  validation: {
    required: 'Ce champ est requis',
    email: 'Veuillez saisir une adresse email valide',
    phone: 'Veuillez saisir un numéro de téléphone valide',
    minLength: 'Ce champ doit contenir au moins {min} caractères',
    maxLength: 'Ce champ ne peut pas dépasser {max} caractères'
  },
  
  // Formats de date
  dateFormats: {
    short: {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    },
    long: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
  }
}

// Messages pour différentes langues (exemple pour l'internationalisation future)
export const MESSAGES_EN = {
  title: 'Client Management',
  subtitle: 'Manage your clients and their information',
  addClient: 'Add Client',
  bulkDelete: 'Request Deletion',
  // ... autres traductions
}

export const MESSAGES_ES = {
  title: 'Gestión de Clientes',
  subtitle: 'Gestiona tus clientes y su información',
  addClient: 'Agregar Cliente',
  bulkDelete: 'Solicitar Eliminación',
  // ... autres traductions
}

// Fonction utilitaire pour obtenir les messages selon la langue
export const getMessages = (locale = 'fr') => {
  switch (locale) {
    case 'en':
      return MESSAGES_EN
    case 'es':
      return MESSAGES_ES
    case 'fr':
    default:
      return MESSAGES
  }
}

// Export par défaut
export default MESSAGES