/**
 * Messages pour les notifications
 * Centralise tous les textes liés aux notifications pour faciliter la traduction
 */

export const NOTIFICATION_MESSAGES = {
  fr: {
    // Titres de la modale
    singleTitle: 'Envoyer une Notification',
    groupTitle: 'Notification Groupée',
    
    // Labels des champs
    recipients: 'Destinataires',
    recipient: 'Destinataire',
    clientsSelected: 'client(s) sélectionné(s)',
    type: 'Type de notification',
    priority: 'Priorité',
    title: 'Titre',
    message: 'Message',
    advancedOptions: 'Options avancées',
    sendByEmail: 'Envoyer également par email',
    scheduleDelivery: 'Programmer l\'envoi',
    actionUrl: 'URL d\'action (optionnel)',
    
    // Placeholders
    titlePlaceholder: 'Titre de la notification',
    messagePlaceholder: 'Contenu de la notification',
    actionUrlPlaceholder: 'https://exemple.com/action',
    
    // Types de notification
    types: {
      info: 'Information',
      success: 'Succès',
      warning: 'Avertissement',
      error: 'Erreur',
      update: 'Mise à jour',
      message: 'Message'
    },
    
    // Priorités
    priorities: {
      low: 'Faible',
      normal: 'Normale',
      high: 'Élevée',
      urgent: 'Urgente'
    },
    
    // Actions
    cancel: 'Annuler',
    send: 'Envoyer',
    sending: 'Envoi...',
    
    // Messages de retour
    notificationSent: 'Notification envoyée avec succès!',
    notificationsSent: 'notifications envoyées avec succès!',
    notificationsFailed: 'notifications ont échoué',
    allNotificationsFailed: 'Toutes les notifications ont échoué',
    sendError: 'Erreur lors de l\'envoi de la notification',
    
    // Messages de validation
    titleRequired: 'Le titre est requis',
    messageRequired: 'Le message est requis',
    scheduledDateRequired: 'La date de programmation est requise',
    invalidUrl: 'URL d\'action invalide'
  },
  
  en: {
    // Modal titles
    singleTitle: 'Send Notification',
    groupTitle: 'Group Notification',
    
    // Field labels
    recipients: 'Recipients',
    recipient: 'Recipient',
    clientsSelected: 'client(s) selected',
    type: 'Notification type',
    priority: 'Priority',
    title: 'Title',
    message: 'Message',
    advancedOptions: 'Advanced options',
    sendByEmail: 'Also send by email',
    scheduleDelivery: 'Schedule delivery',
    actionUrl: 'Action URL (optional)',
    
    // Placeholders
    titlePlaceholder: 'Notification title',
    messagePlaceholder: 'Notification content',
    actionUrlPlaceholder: 'https://example.com/action',
    
    // Notification types
    types: {
      info: 'Information',
      success: 'Success',
      warning: 'Warning',
      error: 'Error',
      update: 'Update',
      message: 'Message'
    },
    
    // Priorities
    priorities: {
      low: 'Low',
      normal: 'Normal',
      high: 'High',
      urgent: 'Urgent'
    },
    
    // Actions
    cancel: 'Cancel',
    send: 'Send',
    sending: 'Sending...',
    
    // Feedback messages
    notificationSent: 'Notification sent successfully!',
    notificationsSent: 'notifications sent successfully!',
    notificationsFailed: 'notifications failed',
    allNotificationsFailed: 'All notifications failed',
    sendError: 'Error sending notification',
    
    // Validation messages
    titleRequired: 'Title is required',
    messageRequired: 'Message is required',
    scheduledDateRequired: 'Scheduled date is required',
    invalidUrl: 'Invalid action URL'
  }
}

/**
 * Types de notification disponibles
 */
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  UPDATE: 'update',
  MESSAGE: 'message'
}

/**
 * Priorités de notification disponibles
 */
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
}

/**
 * Configuration des icônes par type de notification
 */
export const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPES.INFO]: 'ℹ️',
  [NOTIFICATION_TYPES.SUCCESS]: '✅',
  [NOTIFICATION_TYPES.WARNING]: '⚠️',
  [NOTIFICATION_TYPES.ERROR]: '❌',
  [NOTIFICATION_TYPES.UPDATE]: '🔄',
  [NOTIFICATION_TYPES.MESSAGE]: '💬'
}

/**
 * Configuration des couleurs par priorité
 */
export const NOTIFICATION_PRIORITY_COLORS = {
  [NOTIFICATION_PRIORITIES.LOW]: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-700',
    icon: 'text-gray-500'
  },
  [NOTIFICATION_PRIORITIES.NORMAL]: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'text-blue-500'
  },
  [NOTIFICATION_PRIORITIES.HIGH]: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    icon: 'text-orange-500'
  },
  [NOTIFICATION_PRIORITIES.URGENT]: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: 'text-red-500'
  }
}

/**
 * Durées par défaut pour l'affichage des notifications (en millisecondes)
 */
export const NOTIFICATION_DURATIONS = {
  [NOTIFICATION_PRIORITIES.LOW]: 3000,
  [NOTIFICATION_PRIORITIES.NORMAL]: 5000,
  [NOTIFICATION_PRIORITIES.HIGH]: 8000,
  // Urgent: auto-dismiss également, mais avec une durée plus longue
  [NOTIFICATION_PRIORITIES.URGENT]: 12000
}