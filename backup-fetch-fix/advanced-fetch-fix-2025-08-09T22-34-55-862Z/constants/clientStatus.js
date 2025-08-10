// Configuration centralisée des statuts clients
// Centralise tous les statuts avec leurs propriétés (labels, couleurs, icônes, permissions)

export const CLIENT_STATUS = {
  ACTIVE: {
    key: 'active',
    value: true,
    label: 'Actif',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    icon: 'CheckCircleIcon',
    description: 'Client actif et opérationnel',
    permissions: {
      canEdit: true,
      canDelete: true,
      canAssignAgent: true,
      canSendEmail: true,
      canSendNotification: true,
      canDeactivate: true,
      canActivate: false
    },
    actions: ['edit', 'delete', 'assign_agent', 'send_email', 'send_notification', 'deactivate']
  },
  
  INACTIVE: {
    key: 'inactive',
    value: false,
    label: 'Inactif',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    icon: 'XCircleIcon',
    description: 'Client temporairement désactivé',
    permissions: {
      canEdit: true,
      canDelete: true,
      canAssignAgent: false,
      canSendEmail: false,
      canSendNotification: true,
      canDeactivate: false,
      canActivate: true
    },
    actions: ['edit', 'delete', 'send_notification', 'activate']
  },
  
  PENDING: {
    key: 'pending',
    value: 'pending',
    label: 'En attente',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    icon: 'ClockIcon',
    description: 'Client en cours de validation',
    permissions: {
      canEdit: true,
      canDelete: true,
      canAssignAgent: true,
      canSendEmail: true,
      canSendNotification: true,
      canDeactivate: false,
      canActivate: true
    },
    actions: ['edit', 'delete', 'assign_agent', 'send_email', 'send_notification', 'activate']
  },
  
  SUSPENDED: {
    key: 'suspended',
    value: 'suspended',
    label: 'Suspendu',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200',
    icon: 'ExclamationTriangleIcon',
    description: 'Client suspendu temporairement',
    permissions: {
      canEdit: true,
      canDelete: true,
      canAssignAgent: false,
      canSendEmail: false,
      canSendNotification: true,
      canDeactivate: false,
      canActivate: true
    },
    actions: ['edit', 'delete', 'send_notification', 'activate']
  },
  
  ARCHIVED: {
    key: 'archived',
    value: 'archived',
    label: 'Archivé',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200',
    icon: 'ArchiveBoxIcon',
    description: 'Client archivé (inactif définitivement)',
    permissions: {
      canEdit: false,
      canDelete: true,
      canAssignAgent: false,
      canSendEmail: false,
      canSendNotification: false,
      canDeactivate: false,
      canActivate: true
    },
    actions: ['delete', 'activate']
  }
}

// Fonctions utilitaires pour la gestion des statuts
export const ClientStatusUtils = {
  /**
   * Obtenir la configuration d'un statut par sa clé
   * @param {string} statusKey - Clé du statut
   * @returns {Object|null} Configuration du statut
   */
  getStatusByKey(statusKey) {
    return Object.values(CLIENT_STATUS).find(status => status.key === statusKey) || null
  },

  /**
   * Obtenir la configuration d'un statut par sa valeur
   * @param {boolean|string} statusValue - Valeur du statut
   * @returns {Object|null} Configuration du statut
   */
  getStatusByValue(statusValue) {
    return Object.values(CLIENT_STATUS).find(status => status.value === statusValue) || null
  },

  /**
   * Déterminer le statut d'un client basé sur ses propriétés
   * @param {Object} client - Objet client
   * @returns {Object} Configuration du statut
   */
  getClientStatus(client) {
    // Logique de détermination du statut basée sur les propriétés du client
    if (client.status) {
      // Si le client a un statut explicite
      return this.getStatusByKey(client.status) || this.getStatusByValue(client.status)
    }
    
    // Logique de fallback basée sur is_active
    if (client.is_active === true || client.is_active === 1) {
      return CLIENT_STATUS.ACTIVE
    } else if (client.is_active === false || client.is_active === 0) {
      return CLIENT_STATUS.INACTIVE
    }
    
    // Statut par défaut
    return CLIENT_STATUS.PENDING
  },

  /**
   * Vérifier si une action est autorisée pour un statut
   * @param {Object} status - Configuration du statut
   * @param {string} action - Action à vérifier
   * @returns {boolean} True si l'action est autorisée
   */
  canPerformAction(status, action) {
    if (!status || !status.permissions) return false
    
    const actionPermissionMap = {
      'edit': 'canEdit',
      'delete': 'canDelete',
      'assign_agent': 'canAssignAgent',
      'send_email': 'canSendEmail',
      'send_notification': 'canSendNotification',
      'activate': 'canActivate',
      'deactivate': 'canDeactivate'
    }
    
    const permissionKey = actionPermissionMap[action]
    return permissionKey ? status.permissions[permissionKey] : false
  },

  /**
   * Obtenir toutes les actions disponibles pour un statut
   * @param {Object} status - Configuration du statut
   * @returns {Array} Liste des actions disponibles
   */
  getAvailableActions(status) {
    if (!status || !status.actions) return []
    return status.actions
  },

  /**
   * Obtenir les classes CSS pour un statut
   * @param {Object} status - Configuration du statut
   * @returns {Object} Classes CSS
   */
  getStatusClasses(status) {
    if (!status) return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
    
    return {
      bg: status.bgColor,
      text: status.textColor,
      border: status.borderColor
    }
  },

  /**
   * Obtenir tous les statuts disponibles
   * @returns {Array} Liste de tous les statuts
   */
  getAllStatuses() {
    return Object.values(CLIENT_STATUS)
  },

  /**
   * Obtenir les statuts filtrables pour l'interface
   * @returns {Array} Liste des statuts pour les filtres
   */
  getFilterableStatuses() {
    return this.getAllStatuses().map(status => ({
      key: status.key,
      label: status.label,
      value: status.value
    }))
  },

  /**
   * Valider un changement de statut
   * @param {Object} currentStatus - Statut actuel
   * @param {Object} newStatus - Nouveau statut
   * @returns {Object} Résultat de la validation
   */
  validateStatusChange(currentStatus, newStatus) {
    if (!currentStatus || !newStatus) {
      return { valid: false, message: 'Statuts invalides' }
    }

    // Règles de transition de statuts
    const allowedTransitions = {
      'active': ['inactive', 'suspended', 'archived'],
      'inactive': ['active', 'archived'],
      'pending': ['active', 'inactive', 'suspended'],
      'suspended': ['active', 'inactive', 'archived'],
      'archived': ['active']
    }

    const allowed = allowedTransitions[currentStatus.key] || []
    if (!allowed.includes(newStatus.key)) {
      return {
        valid: false,
        message: `Transition de ${currentStatus.label} vers ${newStatus.label} non autorisée`
      }
    }

    return { valid: true, message: 'Changement de statut autorisé' }
  }
}

// Export par défaut
export default CLIENT_STATUS