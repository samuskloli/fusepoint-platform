<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Fusepoint -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-white">Mon accompagnement Fusepoint</h1>
              <p class="text-blue-100 text-sm">
                Bonjour {{ user?.first_name }}, voici votre suivi personnalisé
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Notifications -->
            <div class="relative">
              <button 
                @click="showNotifications = !showNotifications"
                class="relative p-2 text-blue-100 hover:text-white transition-colors"
              >
                <BellIcon class="w-6 h-6" />
                <span 
                  v-if="unreadNotifications > 0"
                  class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                >
                  {{ unreadNotifications > 9 ? '9+' : unreadNotifications }}
                </span>
              </button>
              
              <!-- Dropdown notifications -->
              <div 
                v-if="showNotifications"
                class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              >
                <div class="p-4 border-b border-gray-200">
                  <h3 class="text-sm font-medium text-gray-900">Notifications</h3>
                </div>
                <div class="max-h-64 overflow-y-auto">
                  <div v-if="notifications.length === 0" class="p-4 text-center text-gray-500 text-sm">
                    Aucune notification
                  </div>
                  <div 
                    v-for="notification in notifications.slice(0, 5)" 
                    :key="notification.id"
                    class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    @click="markNotificationAsRead(notification.id)"
                  >
                    <div class="flex items-start">
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                        <p class="text-xs text-gray-600 mt-1">{{ notification.message }}</p>
                        <p class="text-xs text-gray-400 mt-1">{{ formatDate(notification.created_at) }}</p>
                      </div>
                      <div v-if="!notification.is_read" class="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <router-link 
              to="/services"
              class="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              Voir toutes les prestations
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Métriques rapides -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClockIcon class="w-6 h-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ metrics.activeRequests || 0 }}</p>
              <p class="text-sm text-gray-600">Demandes en cours</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon class="w-6 h-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ metrics.completedRequests || 0 }}</p>
              <p class="text-sm text-gray-600">Prestations terminées</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <LightBulbIcon class="w-6 h-6 text-orange-600" />
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ metrics.pendingRecommendations || 0 }}</p>
              <p class="text-sm text-gray-600">Recommandations</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ChatBubbleLeftRightIcon class="w-6 h-6 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-2xl font-bold text-gray-900">{{ metrics.unreadMessages || 0 }}</p>
              <p class="text-sm text-gray-600">Messages non lus</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Colonne principale -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Demandes en cours -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900">Demandes en cours</h2>
                <router-link 
                  to="/services"
                  class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Nouvelle demande
                </router-link>
              </div>
            </div>
            
            <div v-if="loadingRequests" class="p-6">
              <div class="animate-pulse space-y-4">
                <div v-for="i in 3" :key="i" class="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
            
            <div v-else-if="activeRequests.length === 0" class="p-6 text-center">
              <div class="text-gray-400 mb-4">
                <ClockIcon class="w-12 h-12 mx-auto" />
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune demande en cours</h3>
              <p class="text-gray-600 mb-4">Découvrez nos prestations pour booster votre croissance</p>
              <router-link 
                to="/services"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Voir les prestations
              </router-link>
            </div>
            
            <div v-else class="divide-y divide-gray-200">
              <div 
                v-for="request in activeRequests" 
                :key="request.id"
                class="p-6 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3">
                      <h3 class="text-lg font-medium text-gray-900">{{ request.title }}</h3>
                      <span 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getStatusClass(request.status)"
                      >
                        {{ getStatusLabel(request.status) }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">{{ request.service_name }}</p>
                    <p class="text-sm text-gray-500 mt-2">{{ request.description }}</p>
                    <div class="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <span>Créé le {{ formatDate(request.created_at) }}</span>
                      <span v-if="request.deadline">Échéance: {{ formatDate(request.deadline) }}</span>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2 ml-4">
                    <button 
                      @click="contactSupport(request.id)"
                      class="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Contacter le support"
                    >
                      <PhoneIcon class="w-5 h-5" />
                    </button>
                    <button 
                      @click="viewRequestDetails(request)"
                      class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Voir les détails"
                    >
                      <EyeIcon class="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions proposées par Fusepoint -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Recommandations Fusepoint</h2>
              <p class="text-sm text-gray-600 mt-1">Actions personnalisées pour optimiser vos performances</p>
            </div>
            
            <div v-if="loadingRecommendations" class="p-6">
              <div class="animate-pulse space-y-4">
                <div v-for="i in 2" :key="i" class="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
            
            <div v-else-if="pendingRecommendations.length === 0" class="p-6 text-center">
              <div class="text-gray-400 mb-4">
                <LightBulbIcon class="w-12 h-12 mx-auto" />
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune recommandation</h3>
              <p class="text-gray-600">Nous analysons vos données pour vous proposer des actions personnalisées</p>
            </div>
            
            <div v-else class="divide-y divide-gray-200">
              <div 
                v-for="recommendation in pendingRecommendations" 
                :key="recommendation.id"
                class="p-6"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3">
                      <h3 class="text-lg font-medium text-gray-900">{{ recommendation.title }}</h3>
                      <span 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getPriorityClass(recommendation.priority)"
                      >
                        {{ getPriorityLabel(recommendation.priority) }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 mt-2">{{ recommendation.description }}</p>
                    <div class="mt-3 space-y-2">
                      <div class="text-sm">
                        <span class="font-medium text-gray-900">Action recommandée:</span>
                        <span class="text-gray-600 ml-1">{{ recommendation.action_required }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="font-medium text-gray-900">Impact attendu:</span>
                        <span class="text-gray-600 ml-1">{{ recommendation.expected_impact }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="font-medium text-gray-900">Effort estimé:</span>
                        <span class="text-gray-600 ml-1">{{ recommendation.estimated_effort }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center space-x-3 mt-4">
                  <button 
                    @click="respondToRecommendation(recommendation.id, 'accept')"
                    class="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Accepter
                  </button>
                  <button 
                    @click="scheduleRecommendation(recommendation)"
                    class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Planifier
                  </button>
                  <button 
                    @click="respondToRecommendation(recommendation.id, 'decline')"
                    class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 transition-colors"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Support rapide -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Support Fusepoint</h3>
            </div>
            <div class="p-6">
              <p class="text-sm text-gray-600 mb-4">Besoin d'aide ou d'informations ? Notre équipe est là pour vous accompagner.</p>
              <button 
                @click="contactGeneralSupport"
                class="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Contacter le support
              </button>
            </div>
          </div>

          <!-- Activité récente -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Activité récente</h3>
            </div>
            <div class="p-6">
              <div v-if="recentActivity.length === 0" class="text-center text-gray-500 text-sm">
                Aucune activité récente
              </div>
              <div v-else class="space-y-4">
                <div 
                  v-for="activity in recentActivity.slice(0, 5)" 
                  :key="activity.id"
                  class="flex items-start space-x-3"
                >
                  <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ activity.title }}</p>
                    <p class="text-xs text-gray-500">{{ activity.activity_type }}</p>
                    <p class="text-xs text-gray-400">{{ formatDate(activity.activity_date) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Conseil Fusepoint -->
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
            <div class="flex items-start">
              <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <LightBulbIcon class="w-5 h-5 text-white" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-semibold text-blue-900">Conseil Fusepoint</h3>
                <p class="text-sm text-blue-700 mt-1">
                  Pensez à vérifier vos performances hebdomadaires dans Google Analytics pour identifier les tendances.
                </p>
                <router-link 
                  to="/analytics"
                  class="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
                >
                  Voir mes analytics →
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de planification -->
    <ScheduleModal 
      v-if="showScheduleModal"
      :recommendation="selectedRecommendation"
      @close="showScheduleModal = false"
      @schedule="handleScheduleRecommendation"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useAuth } from '@/composables/useAuth'
import ScheduleModal from '@/components/accompagnement/ScheduleModal.vue'
import {
  BellIcon,
  ClockIcon,
  CheckCircleIcon,
  LightBulbIcon,
  PhoneIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'AccompagnementDashboard',
  components: {
    ScheduleModal
  },
  setup() {
    const router = useRouter()
    const { showToast } = useToast()
    const { user } = useAuth()
    
    // État réactif
    const metrics = ref({})
    const activeRequests = ref([])
    const pendingRecommendations = ref([])
    const recentActivity = ref([])
    const notifications = ref([])
    const loadingRequests = ref(true)
    const loadingRecommendations = ref(true)
    const showNotifications = ref(false)
    const showScheduleModal = ref(false)
    const selectedRecommendation = ref(null)

    // Computed
    const unreadNotifications = computed(() => {
      return notifications.value.filter(n => !n.is_read).length
    })

    // Charger les données
    const loadMetrics = async () => {
      try {
        const response = await fetch('/api/accompagnement/metrics', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          metrics.value = data.data
        }
      } catch (err) {
        console.error('Erreur chargement métriques:', err)
      }
    }

    const loadActiveRequests = async () => {
      try {
        loadingRequests.value = true
        const response = await fetch('/api/accompagnement/requests?status=pending,in_progress', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          activeRequests.value = Array.isArray(data.data) ? data.data : []
        }
      } catch (err) {
        console.error('Erreur chargement demandes:', err)
      } finally {
        loadingRequests.value = false
      }
    }

    const loadRecommendations = async () => {
      try {
        loadingRecommendations.value = true
        const response = await fetch('/api/accompagnement/recommendations?status=pending&limit=5', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          pendingRecommendations.value = Array.isArray(data.data) ? data.data : []
        }
      } catch (err) {
        console.error('Erreur chargement recommandations:', err)
      } finally {
        loadingRecommendations.value = false
      }
    }

    const loadRecentActivity = async () => {
      try {
        const response = await fetch('/api/accompagnement/activity?limit=10', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          recentActivity.value = Array.isArray(data.data) ? data.data : []
        }
      } catch (err) {
        console.error('Erreur chargement activité:', err)
      }
    }

    const loadNotifications = async () => {
      try {
        const response = await fetch('/api/accompagnement/notifications?limit=10', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          notifications.value = Array.isArray(data.data) ? data.data : []
        }
      } catch (err) {
        console.error('Erreur chargement notifications:', err)
      }
    }

    // Actions
    const respondToRecommendation = async (recommendationId, response) => {
      try {
        const apiResponse = await fetch(`/api/accompagnement/recommendations/${recommendationId}/response`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({ response })
        })
        
        if (apiResponse.ok) {
          showToast(`Recommandation ${response === 'accept' ? 'acceptée' : 'refusée'}`, 'success')
          loadRecommendations()
          loadMetrics()
        }
      } catch (err) {
        showToast('Erreur lors de la réponse', 'error')
      }
    }

    const scheduleRecommendation = (recommendation) => {
      selectedRecommendation.value = recommendation
      showScheduleModal.value = true
    }

    const handleScheduleRecommendation = async (data) => {
      try {
        const response = await fetch(`/api/accompagnement/recommendations/${recommendationId}/respond`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({
            response: 'schedule',
            scheduled_date: data.scheduledDate
          })
        })
        
        if (response.ok) {
          showToast('Recommandation planifiée', 'success')
          showScheduleModal.value = false
          loadRecommendations()
          loadMetrics()
        }
      } catch (err) {
        showToast('Erreur lors de la planification', 'error')
      }
    }

    const markNotificationAsRead = async (notificationId) => {
      try {
        await fetch(`/api/accompagnement/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        })
        
        // Mettre à jour localement
        const notification = notifications.value.find(n => n.id === notificationId)
        if (notification) {
          notification.is_read = true
        }
      } catch (err) {
        console.error('Erreur marquage notification:', err)
      }
    }

    const contactSupport = (requestId) => {
      // Logique pour contacter le support pour une demande spécifique
      console.log('Contact support pour la demande:', requestId)
    }

    const contactGeneralSupport = () => {
      // Logique pour contacter le support général
      console.log('Contact support général')
    }

    const viewRequestDetails = (request) => {
      router.push(`/accompagnement/requests/${request.id}`)
    }

    // Utilitaires
    const getStatusClass = (status) => {
      const classes = {
        pending: 'bg-yellow-100 text-yellow-800',
        in_progress: 'bg-blue-100 text-blue-800',
        in_review: 'bg-purple-100 text-purple-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusLabel = (status) => {
      const labels = {
        pending: 'En attente',
        in_progress: 'En cours',
        in_review: 'En validation',
        completed: 'Terminé',
        cancelled: 'Annulé'
      }
      return labels[status] || status
    }

    const getPriorityClass = (priority) => {
      const classes = {
        low: 'bg-gray-100 text-gray-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-orange-100 text-orange-800',
        urgent: 'bg-red-100 text-red-800'
      }
      return classes[priority] || 'bg-gray-100 text-gray-800'
    }

    const getPriorityLabel = (priority) => {
      const labels = {
        low: 'Faible',
        medium: 'Moyenne',
        high: 'Haute',
        urgent: 'Urgente'
      }
      return labels[priority] || priority
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }

    // Lifecycle
    onMounted(() => {
      loadMetrics()
      loadActiveRequests()
      loadRecommendations()
      loadRecentActivity()
      loadNotifications()
    })

    return {
      user,
      metrics,
      activeRequests,
      pendingRecommendations,
      recentActivity,
      notifications,
      loadingRequests,
      loadingRecommendations,
      showNotifications,
      showScheduleModal,
      selectedRecommendation,
      unreadNotifications,
      respondToRecommendation,
      scheduleRecommendation,
      handleScheduleRecommendation,
      markNotificationAsRead,
      contactSupport,
      contactGeneralSupport,
      viewRequestDetails,
      getStatusClass,
      getStatusLabel,
      getPriorityClass,
      getPriorityLabel,
      formatDate
    }
  }
}
</script>