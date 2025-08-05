import { ref, reactive, computed } from 'vue'
import notificationService from '@/services/notificationService'
import { 
  NOTIFICATION_TYPES, 
  NOTIFICATION_PRIORITIES, 
  NOTIFICATION_DURATIONS,
  NOTIFICATION_PRIORITY_COLORS,
  NOTIFICATION_ICONS
} from '@/constants/notificationMessages'

// État global des notifications
const notifications = ref([])
const systemNotifications = ref([])
let notificationId = 0

export function useNotifications() {
  const addNotification = (type, message, duration = null, options = {}) => {
    const id = ++notificationId
    const priority = options.priority || NOTIFICATION_PRIORITIES.NORMAL
    const autoRemoveDuration = duration !== null ? duration : NOTIFICATION_DURATIONS[priority]
    
    const notification = {
      id,
      type, // 'success', 'error', 'warning', 'info'
      message,
      priority,
      timestamp: Date.now(),
      actionUrl: options.actionUrl || null,
      actionText: options.actionText || null,
      persistent: options.persistent || false,
      icon: NOTIFICATION_ICONS[type] || '📢',
      colors: NOTIFICATION_PRIORITY_COLORS[priority] || NOTIFICATION_PRIORITY_COLORS[NOTIFICATION_PRIORITIES.NORMAL]
    }
    
    notifications.value.push(notification)
    
    // Auto-remove après la durée spécifiée (sauf si persistant)
    if (autoRemoveDuration > 0 && !notification.persistent) {
      setTimeout(() => {
        removeNotification(id)
      }, autoRemoveDuration)
    }
    
    return id
  }
  
  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  const clearAll = () => {
    notifications.value.splice(0)
  }
  
  const clearByType = (type) => {
    notifications.value = notifications.value.filter(n => n.type !== type)
  }
  
  const clearByPriority = (priority) => {
    notifications.value = notifications.value.filter(n => n.priority !== priority)
  }
  
  // Méthodes de convenance pour les notifications toast
  const success = (message, duration, options = {}) => 
    addNotification(NOTIFICATION_TYPES.SUCCESS, message, duration, options)
    
  const error = (message, duration, options = {}) => 
    addNotification(NOTIFICATION_TYPES.ERROR, message, duration, { ...options, persistent: true })
    
  const warning = (message, duration, options = {}) => 
    addNotification(NOTIFICATION_TYPES.WARNING, message, duration, options)
    
  const info = (message, duration, options = {}) => 
    addNotification(NOTIFICATION_TYPES.INFO, message, duration, options)
  
  // Méthodes pour les notifications système
  const addSystemNotification = (notificationData) => {
    const id = ++notificationId
    const systemNotification = {
      id,
      ...notificationData,
      timestamp: Date.now(),
      read: false
    }
    
    systemNotifications.value.unshift(systemNotification)
    return id
  }
  
  const markSystemNotificationAsRead = (id) => {
    const notification = systemNotifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }
  
  const markAllSystemNotificationsAsRead = () => {
    systemNotifications.value.forEach(n => n.read = true)
  }
  
  const removeSystemNotification = (id) => {
    const index = systemNotifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      systemNotifications.value.splice(index, 1)
    }
  }
  
  // Computed pour les statistiques
  const unreadSystemNotificationsCount = computed(() => 
    systemNotifications.value.filter(n => !n.read).length
  )
  
  const notificationsByType = computed(() => {
    const grouped = {}
    notifications.value.forEach(notification => {
      if (!grouped[notification.type]) {
        grouped[notification.type] = []
      }
      grouped[notification.type].push(notification)
    })
    return grouped
  })
  
  const notificationsByPriority = computed(() => {
    const grouped = {}
    notifications.value.forEach(notification => {
      if (!grouped[notification.priority]) {
        grouped[notification.priority] = []
      }
      grouped[notification.priority].push(notification)
    })
    return grouped
  })
  
  // Méthodes pour l'envoi de notifications via l'API
  const sendNotificationToClient = async (clientId, notificationData) => {
    const validation = notificationService.validateNotificationData(notificationData)
    if (!validation.isValid) {
      error(`Erreur de validation: ${validation.errors.join(', ')}`)
      return { success: false, errors: validation.errors }
    }
    
    const result = await notificationService.sendToClient(clientId, notificationData)
    
    if (result.success) {
      success('Notification envoyée avec succès!')
    } else {
      error(result.error)
    }
    
    return result
  }
  
  const sendNotificationToMultipleClients = async (clientIds, notificationData) => {
    const validation = notificationService.validateNotificationData(notificationData)
    if (!validation.isValid) {
      error(`Erreur de validation: ${validation.errors.join(', ')}`)
      return { success: false, errors: validation.errors }
    }
    
    const result = await notificationService.sendToMultipleClients(clientIds, notificationData)
    
    if (result.success) {
      if (result.failureCount > 0) {
        warning(`${result.successCount} notifications envoyées, ${result.failureCount} échecs`)
      } else {
        success(`${result.successCount} notifications envoyées avec succès!`)
      }
    } else {
      error(result.error)
    }
    
    return result
  }
  
  const sendEmailToClient = async (clientId, emailData) => {
    if (!emailData.subject || !emailData.message) {
      error('Le sujet et le message sont requis')
      return { success: false, error: 'Champs requis manquants' }
    }
    
    const result = await notificationService.sendEmailToClient(clientId, emailData)
    
    if (result.success) {
      success('Email envoyé avec succès!')
    } else {
      error(result.error)
    }
    
    return result
  }
  
  const sendEmailToMultipleClients = async (clientIds, emailData) => {
    if (!emailData.subject || !emailData.message) {
      error('Le sujet et le message sont requis')
      return { success: false, error: 'Champs requis manquants' }
    }
    
    const result = await notificationService.sendEmailToMultipleClients(clientIds, emailData)
    
    if (result.success) {
      if (result.failureCount > 0) {
        warning(`${result.successCount} emails envoyés, ${result.failureCount} échecs`)
      } else {
        success(`${result.successCount} emails envoyés avec succès!`)
      }
    } else {
      error(result.error)
    }
    
    return result
  }
  
  return {
    // État
    notifications,
    systemNotifications,
    
    // Computed
    unreadSystemNotificationsCount,
    notificationsByType,
    notificationsByPriority,
    
    // Méthodes de base
    addNotification,
    removeNotification,
    clearAll,
    clearByType,
    clearByPriority,
    
    // Méthodes de convenance pour les toasts
    success,
    error,
    warning,
    info,
    
    // Méthodes pour les notifications système
    addSystemNotification,
    markSystemNotificationAsRead,
    markAllSystemNotificationsAsRead,
    removeSystemNotification,
    
    // Méthodes pour l'envoi via API
    sendNotificationToClient,
    sendNotificationToMultipleClients,
    sendEmailToClient,
    sendEmailToMultipleClients,
    
    // Service pour accès direct
    notificationService
  }
}