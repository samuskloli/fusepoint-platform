<template>
  <div class="notification-center">
    <!-- Bouton de notification avec badge -->
    <div class="notification-trigger" @click="toggleNotifications">
      <font-awesome-icon icon="bell" />
      <span v-if="unreadCount > 0" class="notification-badge"></span>
    </div>

    <!-- Panel de notifications -->
    <div v-if="showNotifications" class="notification-panel" @click.stop>
      <div class="notification-header">
        <h3>
          <font-awesome-icon icon="bell" />
          Notifications
        </h3>
        <div class="header-actions">
          <button @click="createTestNotification" class="test-btn">
            <font-awesome-icon icon="flask" />
            Test
          </button>
          <button @click="toggleShowAll" class="filter-btn">
            <font-awesome-icon :icon="showOnlyUnread ? 'eye' : 'eye-slash'" />
            {{ showOnlyUnread ? 'Tout voir' : 'Non lues' }}
          </button>
          <button @click="markAllAsRead" class="mark-read-btn" v-if="unreadCount > 0">
            <font-awesome-icon icon="check-double" />
            Tout marquer lu
          </button>
          <button @click="closeNotifications" class="close-btn">
            <font-awesome-icon icon="times" />
          </button>
        </div>
      </div>

      <div class="notification-content">
        <!-- Liste des notifications -->
        <div v-if="filteredNotifications.length > 0" class="notifications-list">
          <div 
            v-for="notification in filteredNotifications" 
            :key="notification.id"
            :class="['notification-item', { 'unread': !notification.is_read }]"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon">
              <font-awesome-icon :icon="getNotificationIcon(notification.type)" />
            </div>
            <div class="notification-content-text">
              <h4 class="notification-title">{{ notification.title }}</h4>
              <div class="notification-message-container">
                <p class="notification-message" :class="{ 'expanded': expandedNotifications.has(notification.id) }">
                  {{ getDisplayMessage(notification) }}
                </p>
                <button 
                  v-if="isMessageLong(notification.message)"
                  @click.stop="toggleMessageExpansion(notification.id)"
                  class="see-more-btn"
                >
                  {{ expandedNotifications.has(notification.id) ? 'Voir moins' : 'Voir plus' }}
                </button>
              </div>
              <span class="notification-time">{{ formatTime(notification.created_at) }}</span>
            </div>
            <div v-if="!notification.is_read" class="unread-indicator"></div>
          </div>
        </div>

        <!-- État vide -->
        <div v-else class="empty-state">
          <font-awesome-icon icon="bell-slash" />
          <p>Aucune notification</p>
        </div>
      </div>

      <!-- Actions du footer -->
      <div class="notification-footer">
        <button @click="loadMoreNotifications" class="load-more-btn" v-if="hasMore">
          <font-awesome-icon icon="chevron-down" />
          Charger plus
        </button>
      </div>
    </div>

    <!-- Overlay pour fermer -->
    <div v-if="showNotifications" class="notification-overlay" @click="closeNotifications"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api.js'
import accompagnementService from '../services/accompagnementService.js'

export default {
  name: 'NotificationCenter',
  setup() {
    const router = useRouter()
    const showNotifications = ref(false)
    const notifications = ref([])
    const page = ref(1)
    const hasMore = ref(true)
    const pollingInterval = ref(null)
    const limit = 10
    const showOnlyUnread = ref(false)
    const loading = ref(false)
    const expandedNotifications = ref(new Set())
    const MESSAGE_PREVIEW_LENGTH = 100

    // Computed
    const unreadCount = computed(() => {
      return notifications.value.filter(n => !n.is_read).length
    })

    const filteredNotifications = computed(() => {
      if (showOnlyUnread.value) {
        return notifications.value.filter(n => !n.is_read)
      }
      return notifications.value
    })

    // Méthodes
    const toggleNotifications = () => {
      showNotifications.value = !showNotifications.value
      if (showNotifications.value && notifications.value.length === 0) {
        loadNotifications()
      }
    }

    const closeNotifications = () => {
      showNotifications.value = false
    }

    const toggleShowAll = () => {
      showOnlyUnread.value = !showOnlyUnread.value
    }

    const loadNotifications = async (reset = true, unreadOnly = false) => {
      if (loading.value) return
      
      try {
        loading.value = true
        const currentPage = reset ? 1 : page.value
        
        // Utiliser le service accompagnement pour récupérer les notifications
        const response = await accompagnementService.getNotifications()
        
        let newNotifications = response.data || []
        
        // Si on ne veut que les non lues, filtrer localement
        if (unreadOnly) {
          newNotifications = newNotifications.filter(n => !n.is_read)
        }
        
        if (reset) {
          if (unreadOnly) {
            // En mode unreadOnly, fusionner avec les notifications déjà lues
            const readNotifications = notifications.value.filter(n => n.is_read)
            notifications.value = [...readNotifications, ...newNotifications]
          } else {
            notifications.value = newNotifications
          }
          page.value = 1
        } else {
          notifications.value.push(...newNotifications)
        }
        
        hasMore.value = response.hasMore || false
        page.value = currentPage + 1
        
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error)
        // En cas d'erreur, essayer l'API directement
        try {
          const unreadParam = unreadOnly ? '&unread_only=true' : ''
          const currentPageForApi = reset ? 1 : page.value
          const response = await api.get(`/api/accompagnement/notifications?page=${currentPageForApi}&limit=${limit}${unreadParam}`)
          let newNotifications = response.data.data || []
          
          if (reset) {
            if (unreadOnly) {
              const readNotifications = notifications.value.filter(n => n.is_read)
              notifications.value = [...readNotifications, ...newNotifications]
            } else {
              notifications.value = newNotifications
            }
            page.value = 1
          } else {
            notifications.value.push(...newNotifications)
          }
          hasMore.value = response.data.hasMore || false
          page.value = currentPageForApi + 1
        } catch (apiError) {
          console.error('Erreur API directe:', apiError)
        }
      } finally {
        loading.value = false
      }
    }

    const loadMoreNotifications = () => {
      loadNotifications(false)
    }

    const markAsRead = async (notificationId) => {
      try {
        // Mettre à jour localement d'abord pour un feedback immédiat
        const notification = notifications.value.find(n => n.id === notificationId)
        if (notification) {
          notification.is_read = true
        }
        
        // Puis envoyer la requête au serveur
        await accompagnementService.markNotificationAsRead(notificationId)
        
      } catch (error) {
        console.error('Erreur lors du marquage comme lu:', error)
        // En cas d'erreur, remettre l'état précédent
        if (notification) {
          notification.is_read = false
        }
      }
    }

    const handleNotificationClick = async (notification) => {
      console.log('🔔 Clic sur notification:', notification)
      
      // Marquer la notification comme lue
      await markAsRead(notification.id)
      
      // Attendre un peu pour que l'utilisateur voie le changement visuel
      setTimeout(() => {
        // Fermer le panel de notifications
        showNotifications.value = false
        
        // Logique de redirection basée sur le type et le contenu de la notification
        let redirectPath = null
        
        if (notification.action_url) {
          // Si une URL d'action est définie, l'utiliser
          redirectPath = notification.action_url
        } else if (notification.type === 'new_user_without_agent' || 
                   notification.type === 'user_assignment' ||
                   notification.title?.includes('Nouvel utilisateur') ||
                   notification.title?.includes('utilisateur assigné')) {
          redirectPath = '/agent/clients'
        } else if (notification.type === 'agent_assignment') {
          redirectPath = '/agent/dashboard'
        } else if (notification.type === 'message') {
          redirectPath = '/support'
        } else if (notification.type === 'system') {
          redirectPath = '/settings'
        }
        
        if (redirectPath) {
          console.log('🔄 Redirection vers:', redirectPath)
          router.push(redirectPath)
        } else {
          console.log('ℹ️ Aucune redirection définie pour cette notification')
        }
      }, 300) // Délai de 300ms pour voir le changement
    }

    const markAllAsRead = async () => {
      try {
        await api.put('/api/accompagnement/notifications/mark-all-read')
        
        // Mettre à jour localement
        notifications.value.forEach(n => {
          n.is_read = true
        })
      } catch (error) {
        console.error('Erreur lors du marquage de toutes les notifications:', error)
      }
    }

    const createTestNotification = async () => {
      try {
        await accompagnementService.createTestNotification()
        
        // Recharger les notifications pour afficher la nouvelle
        await loadNotifications()
        
        console.log('Notification de test créée avec succès')
      } catch (error) {
        console.error('Erreur lors de la création de la notification de test:', error)
      }
    }

    const getNotificationIcon = (type) => {
      const icons = {
        'agent_assignment': 'user-plus',
        'user_assignment': 'user-plus',
        'message': 'comment',
        'system': 'cog',
        'warning': 'exclamation-triangle',
        'success': 'check-circle',
        'info': 'info-circle',
        'default': 'bell'
      }
      return icons[type] || icons.default
    }

    const formatTime = (timestamp) => {
      // Gérer les différents formats de timestamp
      let date
      if (typeof timestamp === 'string') {
        // Si c'est une chaîne, la parser correctement
        date = new Date(timestamp.replace(' ', 'T') + (timestamp.includes('T') ? '' : 'Z'))
      } else {
        date = new Date(timestamp)
      }
      
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        return 'Date invalide'
      }
      
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)
      
      if (minutes < 1) return 'À l\'instant'
      if (minutes < 60) return `Il y a ${minutes} min`
      if (hours < 24) return `Il y a ${hours}h`
      if (days < 7) return `Il y a ${days}j`
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    // Fermer les notifications en cliquant à l'extérieur
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-center')) {
        closeNotifications()
      }
    }

    // Polling pour les nouvelles notifications
    let pollInterval = null
    const startPolling = () => {
      pollInterval = setInterval(() => {
        if (!showNotifications.value) {
          // Ne recharger que les notifications non lues pour éviter de faire réapparaître les notifications lues
          loadNotifications(true, true) // reset=true, unreadOnly=true
        }
      }, 30000) // Vérifier toutes les 30 secondes
    }

    const stopPolling = () => {
      if (pollInterval) {
        clearInterval(pollInterval)
        pollInterval = null
      }
    }

    // Méthodes pour gérer l'expansion des messages
    const isMessageLong = (message) => {
      return message && message.length > MESSAGE_PREVIEW_LENGTH
    }

    const getDisplayMessage = (notification) => {
      if (!notification.message) return ''
      
      if (expandedNotifications.value.has(notification.id)) {
        return notification.message
      }
      
      if (notification.message.length > MESSAGE_PREVIEW_LENGTH) {
        return notification.message.substring(0, MESSAGE_PREVIEW_LENGTH) + '...'
      }
      
      return notification.message
    }

    const toggleMessageExpansion = (notificationId) => {
      const expanded = new Set(expandedNotifications.value)
      if (expanded.has(notificationId)) {
        expanded.delete(notificationId)
      } else {
        expanded.add(notificationId)
      }
      expandedNotifications.value = expanded
    }

    // Lifecycle
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      loadNotifications()
      startPolling()
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      stopPolling()
    })

    return {
      showNotifications,
      notifications,
      unreadCount,
      filteredNotifications,
      showOnlyUnread,
      loading,
      hasMore,
      expandedNotifications,
      toggleNotifications,
      closeNotifications,
      markAsRead,
      handleNotificationClick,
      markAllAsRead,
      loadNotifications,
      loadMoreNotifications,
      createTestNotification,
      getNotificationIcon,
      formatTime,
      toggleShowAll,
      isMessageLong,
      getDisplayMessage,
      toggleMessageExpansion
    }
  }
}
</script>

<style scoped>
.notification-center {
  position: relative;
  display: inline-block;
}

.notification-trigger {
  position: relative;
  cursor: pointer;
  padding: 10px;
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.6);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  backdrop-filter: blur(8px);
}

.notification-trigger:hover {
  background: rgba(241, 245, 249, 0.9);
  border-color: rgba(203, 213, 225, 0.8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.notification-trigger:active {
  transform: translateY(0);
}

.notification-trigger svg {
  font-size: 18px;
  color: #64748b;
  transition: all 0.3s ease;
}

.notification-trigger:hover svg {
  color: #475569;
}



.notification-badge {
  position: absolute;
  top: 3px;
  right: 3px;
  background: rgba(239, 68, 68, 0.8);
  border-radius: 50%;
  width: 6px;
  height: 6px;
  border: 1px solid white;
  box-shadow: 0 1px 2px rgba(239, 68, 68, 0.3);
}



.notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.notification-panel {
  position: absolute;
  top: 55px;
  right: 0;
  width: 380px;
  max-height: 520px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 25px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.8);
  z-index: 1000;
  overflow: hidden;
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(16px);
}

@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.notification-header {
  padding: 18px 20px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  background: rgba(248, 250, 252, 0.8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  backdrop-filter: blur(8px);
}

.notification-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 8px;
}

.notification-header h3 svg {
  font-size: 16px;
  color: #64748b;
}

.header-actions {
  display: flex;
  gap: 6px;
  position: relative;
  z-index: 1;
}

.mark-read-btn,
.test-btn,
.filter-btn,
.close-btn {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 4px;
  color: #64748b;
  backdrop-filter: blur(8px);
}

.mark-read-btn:hover,
.test-btn:hover,
.filter-btn:hover {
  background: rgba(241, 245, 249, 0.9);
  border-color: rgba(203, 213, 225, 0.9);
  color: #475569;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.close-btn {
  background: rgba(254, 242, 242, 0.8);
  border-color: rgba(252, 165, 165, 0.6);
  color: #dc2626;
}

.close-btn:hover {
  background: rgba(254, 226, 226, 0.9);
  border-color: rgba(248, 113, 113, 0.8);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.15);
}

.notification-content {
  max-height: 350px;
  overflow-y: auto;
}

.notifications-list {
  padding: 0;
}

.notification-item {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.4);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  margin: 0 6px;
  border-radius: 8px;
  margin-bottom: 2px;
}

.notification-item:hover {
  background: rgba(248, 250, 252, 0.8);
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.notification-item.unread {
  background: rgba(239, 246, 255, 0.6);
  border-left: 2px solid rgba(59, 130, 246, 0.6);
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.08);
}

.notification-item.unread:hover {
  background: rgba(239, 246, 255, 0.8);
  border-left-color: rgba(59, 130, 246, 0.8);
}

.notification-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(241, 245, 249, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(226, 232, 240, 0.6);
  position: relative;
}

.notification-icon svg {
  font-size: 14px;
  color: #64748b;
  transition: color 0.2s ease;
}

.notification-item:hover .notification-icon {
  background: rgba(248, 250, 252, 0.9);
  border-color: rgba(203, 213, 225, 0.8);
}

.notification-item:hover .notification-icon svg {
  color: #475569;
}

.notification-content-text {
  flex: 1;
  min-width: 0;
}

.notification-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #212529;
  line-height: 1.3;
}

.notification-message-container {
  margin-bottom: 6px;
}

.notification-message {
  margin: 0;
  font-size: 13px;
  color: #6c757d;
  line-height: 1.4;
  word-wrap: break-word;
  transition: all 0.3s ease;
}

.notification-message.expanded {
  max-height: none;
}

.see-more-btn {
  background: none;
  border: none;
  color: #007bff;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 0;
  margin-top: 4px;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.see-more-btn:hover {
  color: #0056b3;
  text-decoration: none;
}

.notification-time {
  font-size: 11px;
  color: #adb5bd;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background: #007bff;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

.empty-state {
  text-align: center;
  padding: 60px 24px;
  color: #8e9aaf;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02), rgba(118, 75, 162, 0.02));
  margin: 8px;
  border-radius: 12px;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.4;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.notification-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03), rgba(118, 75, 162, 0.03));
  text-align: center;
}

.load-more-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.load-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #764ba2, #667eea);
}

.load-more-btn:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 480px) {
  .notification-panel {
    width: 320px;
    right: -20px;
  }
}
</style>