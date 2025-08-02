<template>
  <div class="accompaniment-dashboard">
    <FusepointHeader />
    
    <div class="container mx-auto px-6 py-8">
      <!-- En-tête du tableau de bord -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Mon Accompagnement Fusepoint</h1>
        <p class="text-gray-600">Suivez vos demandes d'accompagnement et accédez à vos ressources personnalisées.</p>
      </div>

      <!-- Statistiques rapides -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <ClockIcon class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Demandes en cours</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <CheckCircleIcon class="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Demandes terminées</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.completed }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <ChatBubbleLeftRightIcon class="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Sessions de chat</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.chatSessions }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <StarIcon class="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Score satisfaction</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.satisfaction }}/5</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Colonne principale -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Demandes récentes -->
          <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Mes Demandes d'Accompagnement</h2>
              <router-link 
                to="/services" 
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Nouvelle demande
              </router-link>
            </div>
            
            <div v-if="loading" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p class="text-gray-500 mt-2">Chargement...</p>
            </div>
            
            <div v-else-if="requests.length === 0" class="text-center py-8">
              <DocumentIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-500">Aucune demande d'accompagnement pour le moment.</p>
              <router-link 
                to="/services" 
                class="text-blue-600 hover:text-blue-700 font-medium"
              >
                Découvrir nos services
              </router-link>
            </div>
            
            <div v-else class="space-y-4">
              <div 
                v-for="request in requests" 
                :key="request.id"
                class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
              >
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-medium text-gray-900">{{ request.serviceName }}</h3>
                  <span 
                    :class="getStatusClass(request.status)"
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ getStatusText(request.status) }}
                  </span>
                </div>
                <p class="text-gray-600 text-sm mb-2">{{ request.description }}</p>
                <div class="flex items-center justify-between text-sm text-gray-500">
                  <span>Demandé le {{ formatDate(request.createdAt) }}</span>
                  <button 
                    @click="viewRequestDetails(request)"
                    class="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Voir détails
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommandations IA -->
          <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Recommandations Personnalisées</h2>
            
            <div v-if="recommendations.length === 0" class="text-center py-8">
              <LightBulbIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-500">Aucune recommandation disponible pour le moment.</p>
            </div>
            
            <div v-else class="space-y-4">
              <div 
                v-for="recommendation in recommendations" 
                :key="recommendation.id"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex items-start justify-between mb-2">
                  <h3 class="font-medium text-gray-900">{{ recommendation.title }}</h3>
                  <span 
                    :class="getPriorityClass(recommendation.priority)"
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ recommendation.priority }}
                  </span>
                </div>
                <p class="text-gray-600 text-sm mb-3">{{ recommendation.description }}</p>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-500">Impact estimé: {{ recommendation.impact }}</span>
                  <button 
                    @click="applyRecommendation(recommendation)"
                    class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors duration-200"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Chat rapide -->
          <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Chat Fusepoint</h3>
            <p class="text-gray-600 text-sm mb-4">Besoin d'aide ? Discutez avec notre IA spécialisée.</p>
            <button 
              @click="openChat"
              class="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              Ouvrir le chat
            </button>
          </div>

          <!-- Prochains rendez-vous -->
          <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Prochains Rendez-vous</h3>
            
            <div v-if="appointments.length === 0" class="text-center py-4">
              <CalendarIcon class="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p class="text-gray-500 text-sm">Aucun rendez-vous planifié.</p>
            </div>
            
            <div v-else class="space-y-3">
              <div 
                v-for="appointment in appointments" 
                :key="appointment.id"
                class="border border-gray-200 rounded-lg p-3"
              >
                <h4 class="font-medium text-gray-900 text-sm">{{ appointment.title }}</h4>
                <p class="text-gray-600 text-xs">{{ formatDate(appointment.date) }}</p>
                <p class="text-gray-500 text-xs">{{ appointment.duration }}</p>
              </div>
            </div>
            
            <button 
              @click="scheduleAppointment"
              class="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
            >
              Planifier un rendez-vous
            </button>
          </div>

          <!-- Ressources utiles -->
          <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Ressources Utiles</h3>
            <div class="space-y-2">
              <a href="#" class="block text-blue-600 hover:text-blue-700 text-sm">Guide Google Analytics</a>
              <a href="#" class="block text-blue-600 hover:text-blue-700 text-sm">Bonnes pratiques SEO</a>
              <a href="#" class="block text-blue-600 hover:text-blue-700 text-sm">Templates de rapports</a>
              <a href="#" class="block text-blue-600 hover:text-blue-700 text-sm">FAQ Fusepoint</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Sidebar -->
    <ChatSidebar 
      v-if="showChat"
      @close="showChat = false"
    />

    <!-- Modal de planification -->
    <AppointmentModal 
      v-if="showScheduleModal"
      @close="showScheduleModal = false"
      @scheduled="handleAppointmentScheduled"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import FusepointHeader from '../FusepointHeader.vue'
import ChatSidebar from './ChatSidebar.vue'
import AppointmentModal from './AppointmentModal.vue'
import {
  ClockIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  DocumentIcon,
  LightBulbIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline'
import accompagnementService from '@/services/accompagnementService'

export default {
  name: 'AccompagnementDashboard',
  components: {
    FusepointHeader,
    ChatSidebar,
    AppointmentModal,
    ClockIcon,
    CheckCircleIcon,
    ChatBubbleLeftRightIcon,
    StarIcon,
    DocumentIcon,
    LightBulbIcon,
    CalendarIcon
  },
  setup() {
    const loading = ref(true)
    const showChat = ref(false)
    const showScheduleModal = ref(false)
    const stats = ref({
      pending: 0,
      completed: 0,
      chatSessions: 0,
      satisfaction: 0
    })
    const requests = ref([])
    const recommendations = ref([])
    const appointments = ref([])

    const loadDashboardData = async () => {
      try {
        const [statsData, requestsData, recommendationsData, appointmentsData] = await Promise.all([
          accompagnementService.getStats(),
          accompagnementService.getServiceRequests(),
          accompagnementService.getRecommendations(),
          accompagnementService.getAppointments()
        ])
        
        stats.value = statsData
        requests.value = requestsData
        recommendations.value = recommendationsData
        appointments.value = appointmentsData
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
        // Données de démonstration en cas d'erreur
        stats.value = {
          pending: 2,
          completed: 8,
          chatSessions: 15,
          satisfaction: 4.8
        }
        requests.value = [
          {
            id: 1,
            serviceName: 'Audit Analytics Complet',
            description: 'Analyse approfondie de Google Analytics',
            status: 'in_progress',
            createdAt: new Date().toISOString()
          }
        ]
        recommendations.value = [
          {
            id: 1,
            title: 'Optimiser le taux de conversion',
            description: 'Vos pages de destination ont un potentiel d\'amélioration de 25%',
            priority: 'high',
            impact: '+25% conversions'
          }
        ]
      } finally {
        loading.value = false
      }
    }

    const getStatusClass = (status) => {
      const classes = {
        pending: 'bg-yellow-100 text-yellow-800',
        in_progress: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusText = (status) => {
      const texts = {
        pending: 'En attente',
        in_progress: 'En cours',
        completed: 'Terminé',
        cancelled: 'Annulé'
      }
      return texts[status] || status
    }

    const getPriorityClass = (priority) => {
      const classes = {
        high: 'bg-red-100 text-red-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-green-100 text-green-800'
      }
      return classes[priority] || 'bg-gray-100 text-gray-800'
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const viewRequestDetails = (request) => {
      // Implémenter la vue détaillée de la demande
      console.log('Voir détails de la demande:', request)
    }

    const applyRecommendation = async (recommendation) => {
      try {
        await accompagnementService.applyRecommendation(recommendation.id)
        // Recharger les recommandations
        loadDashboardData()
      } catch (error) {
        console.error('Erreur lors de l\'application de la recommandation:', error)
      }
    }

    const updateRequestStatus = async (requestId, status) => {
      try {
        await accompagnementService.updateServiceRequestStatus(requestId, status)
        await loadDashboardData()
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error)
      }
    }

    const updateRecommendationStatus = async (recommendationId, status) => {
      try {
        await accompagnementService.updateRecommendationStatus(recommendationId, status)
        await loadDashboardData()
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la recommandation:', error)
      }
    }

    const openChat = () => {
      showChat.value = true
    }

    const scheduleAppointment = () => {
      showScheduleModal.value = true
    }

    const handleAppointmentScheduled = (appointmentData) => {
      showScheduleModal.value = false
      loadDashboardData() // Recharger les données
    }

    onMounted(() => {
      loadDashboardData()
    })

    return {
      loading,
      showChat,
      showScheduleModal,
      stats,
      requests,
      recommendations,
      appointments,
      getStatusClass,
      getStatusText,
      getPriorityClass,
      formatDate,
      viewRequestDetails,
      applyRecommendation,
      openChat,
      scheduleAppointment,
      handleAppointmentScheduled
    }
  }
}
</script>

<style scoped>
.accompaniment-dashboard {
  min-height: 100vh;
  background-color: #f9fafb;
}
</style>