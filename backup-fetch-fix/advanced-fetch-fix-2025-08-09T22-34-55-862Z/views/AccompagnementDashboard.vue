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
                {{ $t('messages.hello') }} {{ user?.first_name }}, voici votre suivi personnalisé
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
              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div 
                  v-if="showNotifications"
                  class="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden backdrop-blur-sm"
                  style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);"
                >
                  <!-- Header avec gradient -->
                  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <BellIcon class="w-4 h-4 text-white" />
                        </div>
                        <h3 class="text-base font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <div class="flex items-center space-x-2">
                        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {{ notifications.length }} nouvelle{{ notifications.length > 1 ? 's' : '' }}
                        </span>
                        <button 
                          @click="showNotifications = false"
                          class="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Contenu des notifications -->
                  <div class="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <div v-if="notifications.length === 0" class="p-8 text-center">
                      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BellIcon class="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 class="text-sm font-medium text-gray-900 mb-1">Aucune notification</h4>
                      <p class="text-xs text-gray-500">Vous êtes à jour ! 🎉</p>
                    </div>
                    
                    <div v-else class="divide-y divide-gray-50">
                      <div 
                        v-for="notification in notifications.slice(0, 5)" 
                        :key="notification.id"
                        class="group p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent cursor-pointer transition-all duration-200 relative"
                        @click="markNotificationAsRead(notification.id)"
                      >
                        <!-- Indicateur de notification non lue -->
                        <div 
                          v-if="!notification.is_read" 
                          class="absolute left-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"
                        ></div>
                        
                        <div class="flex items-start space-x-3 ml-2">
                          <!-- Icône de type de notification -->
                          <div class="flex-shrink-0 mt-1">
                            <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                                 :class="getNotificationIconClass(notification.type)">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path v-if="notification.type === 'info'" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                                <path v-else-if="notification.type === 'success'" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                <path v-else-if="notification.type === 'warning'" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
                                <path v-else d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                              </svg>
                            </div>
                          </div>
                          
                          <!-- Contenu de la notification -->
                          <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between">
                              <div class="flex-1">
                                <p class="text-sm font-medium text-gray-900 group-hover:text-blue-900 transition-colors">
                                  {{ notification.title }}
                                </p>
                                <p class="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {{ notification.message }}
                                </p>
                                <div class="flex items-center space-x-2 mt-2">
                                  <span class="text-xs text-gray-400">
                                    {{ formatDate(notification.created_at) }}
                                  </span>
                                  <span v-if="!notification.is_read" class="text-xs text-blue-600 font-medium">
                                    • Nouveau
                                  </span>
                                </div>
                              </div>
                              
                              <!-- Badge de statut -->
                              <div v-if="!notification.is_read" class="flex-shrink-0 ml-2">
                                <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Footer avec actions -->
                  <div v-if="notifications.length > 0" class="bg-gray-50 px-6 py-3 border-t border-gray-100">
                    <div class="flex items-center justify-between">
                      <button 
                        @click="markAllAsRead"
                        class="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        Tout marquer comme lu
                      </button>
                      <router-link 
                        to="/notifications" 
                        class="text-xs text-gray-600 hover:text-gray-700 font-medium transition-colors flex items-center space-x-1"
                      >
                        <span>Voir tout</span>
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </router-link>
                    </div>
                  </div>
                </div>
              </transition>
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
import authService from '@/services/authService'
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
        const response = await authService.getApiInstance().get('/api/accompagnement/metrics')
        if (response.data) {
          metrics.value = response.data.data
        }
      } catch (error) {
        console.error('Erreur chargement métriques:', error)
        if (error.response?.status === 401) {
          console.log('Problème d\'authentification détecté dans loadMetrics')
        }
      }
    }

    const loadActiveRequests = async () => {
      try {
        loadingRequests.value = true
        const response = await authService.getApiInstance().get('/api/accompagnement/requests?status=pending,in_progress')
        if (response.data) {
          activeRequests.value = Array.isArray(response.data.data) ? response.data.data : []
        }
      } catch (error) {
        console.error('Erreur chargement demandes:', error)
        if (error.response?.status === 401) {
          console.log('Problème d\'authentification détecté dans loadActiveRequests')
        }
      } finally {
        loadingRequests.value = false
      }
    }

    const loadRecommendations = async () => {
      try {
        loadingRecommendations.value = true
        const response = await authService.getApiInstance().get('/api/accompagnement/recommendations?status=pending&limit=5')
        if (response.data) {
          pendingRecommendations.value = Array.isArray(response.data.data) ? response.data.data : []
        }
      } catch (error) {
        console.error('Erreur chargement recommandations:', error)
        if (error.response?.status === 401) {
          console.log('Problème d\'authentification détecté dans loadRecommendations')
        }
      } finally {
        loadingRecommendations.value = false
      }
    }

    const loadRecentActivity = async () => {
      try {
        const response = await authService.getApiInstance().get('/api/accompagnement/activity?limit=10')
        if (response.data) {
          recentActivity.value = Array.isArray(response.data.data) ? response.data.data : []
        }
      } catch (error) {
        console.error('Erreur chargement activité:', error)
        if (error.response?.status === 401) {
          console.log('Problème d\'authentification détecté dans loadRecentActivity')
        }
      }
    }

    const loadNotifications = async () => {
      try {
        const response = await authService.getApiInstance().get('/api/accompagnement/notifications?limit=10')
        if (response.data) {
          notifications.value = Array.isArray(response.data.data) ? response.data.data : []
        }
      } catch (error) {
        console.error('Erreur chargement notifications:', error)
        if (error.response?.status === 401) {
          console.log('Problème d\'authentification détecté dans loadNotifications')
        }
      }
    }

    // Actions
    const respondToRecommendation = async (recommendationId, response) => {
      try {
        const apiResponse = await authService.getApiInstance().put(`/api/accompagnement/recommendations/${recommendationId}/response`, {
          response
        })
        
        if (apiResponse.data) {
          showToast(`Recommandation ${response === 'accept' ? 'acceptée' : 'refusée'}`, 'success')
          loadRecommendations()
          loadMetrics()
        }
      } catch (err) {
        console.error('Erreur réponse recommandation:', err)
        if (err.response?.status === 401) {
          console.log('Problème d\'authentification détecté dans respondToRecommendation')
        }
        showToast('Erreur lors de la réponse', 'error')
      }
    }

    const scheduleRecommendation = (recommendation) => {
      selectedRecommendation.value = recommendation
      showScheduleModal.value = true
    }

    const handleScheduleRecommendation = async (data) => {
      try {
        const response = await authService.getApiInstance().post(`/api/accompagnement/recommendations/${selectedRecommendation.value.id}/respond`, {
          response: 'schedule',
          scheduled_date: data.scheduledDate
        })
        
        if (response.data) {
          showToast('Recommandation planifiée', 'success')
          showScheduleModal.value = false
          loadRecommendations()
          loadMetrics()
        }
      } catch (err) {
        console.error('Erreur planification recommandation:', err)
        if (err.response?.status === 401) {
          console.log('Problème d\'authentification détecté dans handleScheduleRecommendation')
        }
        showToast('Erreur lors de la planification', 'error')
      }
    }

    const markNotificationAsRead = async (notificationId) => {
      try {
        await authService.getApiInstance().put(`/api/accompagnement/notifications/${notificationId}/read`)
        
        // Mettre à jour localement
        const notification = notifications.value.find(n => n.id === notificationId)
        if (notification) {
          notification.is_read = true
        }
      } catch (err) {
        console.error('Erreur marquage notification:', err)
        if (err.response?.status === 401) {
          console.log('Problème d\'authentification détecté dans markNotificationAsRead')
        }
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

    const getNotificationIconClass = (type) => {
      const classes = {
        info: 'bg-blue-100 text-blue-600',
        success: 'bg-green-100 text-green-600',
        warning: 'bg-yellow-100 text-yellow-600',
        error: 'bg-red-100 text-red-600'
      }
      return classes[type] || 'bg-gray-100 text-gray-600'
    }

    const markAllAsRead = async () => {
      try {
        await authService.getApiInstance().put('/api/accompagnement/notifications/mark-all-read')
        
        // Mettre à jour localement
        notifications.value.forEach(notification => {
          notification.is_read = true
        })
        
        showToast('Toutes les notifications ont été marquées comme lues', 'success')
      } catch (err) {
        console.error('Erreur marquage toutes notifications:', err)
        if (err.response?.status === 401) {
          console.log('Problème d\'authentification détecté dans markAllAsRead')
        }
        showToast('Erreur lors du marquage des notifications', 'error')
      }
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
      markAllAsRead,
      contactSupport,
      contactGeneralSupport,
      viewRequestDetails,
      getStatusClass,
      getStatusLabel,
      getPriorityClass,
      getPriorityLabel,
      formatDate,
      getNotificationIconClass
    }
  }
}
</script>