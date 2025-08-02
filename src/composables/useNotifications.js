import { ref, reactive } from 'vue'

// État global des notifications
const notifications = ref([])
let notificationId = 0

export function useNotifications() {
  const addNotification = (type, message, duration = 5000) => {
    const id = ++notificationId
    const notification = {
      id,
      type, // 'success', 'error', 'warning', 'info'
      message,
      timestamp: Date.now()
    }
    
    notifications.value.push(notification)
    
    // Auto-remove après la durée spécifiée
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
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
  
  // Méthodes de convenance
  const success = (message, duration) => addNotification('success', message, duration)
  const error = (message, duration) => addNotification('error', message, duration)
  const warning = (message, duration) => addNotification('warning', message, duration)
  const info = (message, duration) => addNotification('info', message, duration)
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  }
}