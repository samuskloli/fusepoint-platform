<template>
<RoleLayout>
  <!-- Main content -->
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Main content area -->
    <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
      <div class="container mx-auto px-6 py-8">
        <!-- Welcome section -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">
            Tableau de bord Agent 👋
          </h1>
          <p class="mt-2 text-gray-600">
            {{ $t('messages.hello') }} {{ authStore.user?.first_name }} {{ authStore.user?.last_name }}, voici un aperçu de votre activité aujourd'hui.
          </p>
        </div>
        <!-- Dashboard avec métriques -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Métrique Total Clients -->
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Clients</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.totalClients }}</p>
                <p class="text-sm text-gray-500">{{ stats.activeClients }} actifs aujourd'hui</p>
              </div>
              <div class="p-3 bg-blue-100 rounded-full">
                <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Métrique Demandes en attente -->
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">En attente</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.pendingRequests }}</p>
                <p class="text-sm text-gray-500">{{ getPriorityCount('high') }} priorité haute</p>
              </div>
              <div class="p-3 bg-yellow-100 rounded-full">
                <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Métrique Résolues aujourd'hui -->
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Résolues aujourd'hui</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.resolvedToday || 0 }}</p>
                <p class="text-sm text-gray-500">Temps moyen: 2h 15min</p>
              </div>
              <div class="p-3 bg-green-100 rounded-full">
                <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Métrique Messages non lus -->
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Messages non lus</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.unreadMessages }}</p>
                <p class="text-sm text-gray-500">{{ getActiveConversations() }} conversations actives</p>
              </div>
              <div class="p-3 bg-purple-100 rounded-full">
                <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Section Clients récents -->
        <div class="bg-white rounded-lg shadow mb-8">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Clients récents</h3>
          </div>
          <div class="p-6">
            <div v-if="loading" class="text-center py-4">
              <svg class="animate-spin h-8 w-8 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="mt-2 text-gray-500">Chargement des clients...</p>
            </div>
            
            <div v-else-if="filteredClients.length === 0" class="text-center py-8">
              <svg class="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p class="mt-2 text-gray-500">Aucun client trouvé</p>
            </div>
            
            <div v-else class="space-y-4">
              <div 
                v-for="client in filteredClients.slice(0, 5)" 
                :key="client.id" 
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                @click="viewClientDetails(client)"
              >
                <div class="flex items-center space-x-4">
                  <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-700">{{ getClientInitials(client) }}</span>
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">{{ client.first_name }} {{ client.last_name }}</h4>
                    <p class="text-sm text-gray-500">{{ client.email }}</p>
                    <p v-if="client.company_name" class="text-xs text-gray-400">{{ client.company_name }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <ClientStatusBadge :client="client" size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</RoleLayout>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import RoleLayout from '../components/RoleLayout.vue'
import ClientStatusBadge from '@/components/clients/ClientStatusBadge.vue'
import api from '@/services/api'

export default {
  name: 'AgentDashboard',
  components: {
    RoleLayout,
    ClientStatusBadge
  },
  setup() {
    const authStore = useAuthStore()

    const loading = ref(true)
    const totalNotifications = ref(5)
    
    const stats = reactive({
      totalClients: 0,
      activeClients: 0,
      pendingRequests: 0,
      resolvedToday: 0,
      unreadMessages: 0,
      priorityCounts: { high: 0, medium: 0, low: 0 }
    })
    
    const filteredClients = ref([])
    
    const loadData = async () => {
      try {
        loading.value = true
        
        // Charger les statistiques
        const statsResponse = await api.get('/api/agent/stats')
        if (statsResponse.data.success) {
          Object.assign(stats, statsResponse.data.data)
          // Harmoniser d'éventuels formats côté backend
          const data = statsResponse.data.data
          if (data.priorityCounts) {
            stats.priorityCounts = data.priorityCounts
          } else if (data.priorityBreakdown) {
            stats.priorityCounts = data.priorityBreakdown
          } else if (data.priorities) {
            stats.priorityCounts = data.priorities
          }
        }
        
        // Charger les clients récents
        const clientsResponse = await api.get('/api/agent/assigned-clients?limit=5')
        if (clientsResponse.data.success) {
          filteredClients.value = clientsResponse.data.data.slice(0, 5)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
        // Fallback avec données simulées
        stats.totalClients = 42
        stats.activeClients = 28
        stats.pendingRequests = 7
        stats.resolvedToday = 12
        stats.unreadMessages = 3
        stats.priorityCounts = { high: 2, medium: 3, low: 2 }
        
        filteredClients.value = [
          {
            id: 1,
            first_name: 'Jean',
            last_name: 'Dupont',
            email: 'jean.dupont@example.com',
            company_name: 'Entreprise ABC',
            is_active: true,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            first_name: 'Marie',
            last_name: 'Martin',
            email: 'marie.martin@example.com',
            company_name: 'Société XYZ',
            is_active: false,
            created_at: new Date().toISOString()
          }
        ]
      } finally {
        loading.value = false
      }
    }

    const getClientInitials = (client) => {
      const firstInitial = client.first_name ? client.first_name.charAt(0).toUpperCase() : ''
      const lastInitial = client.last_name ? client.last_name.charAt(0).toUpperCase() : ''
      return firstInitial + lastInitial || '??'
    }

    const getActiveConversations = () => {
      // Simulé pour l'instant
      return Math.floor(stats.unreadMessages / 2)
    }

    const getPriorityCount = (priority) => {
      const key = String(priority || '').toLowerCase()
      const counts = stats.priorityCounts || {}
      return counts[key] || 0
    }

    const viewClientDetails = (client) => {
      // Action simulée pour afficher les détails du client
      console.log('Voir les détails du client:', client)
    }

    onMounted(() => {
      loadData()
    })

    return {
      authStore,
      loading,
      stats,
      filteredClients,
      getClientInitials,
      getActiveConversations,
      getPriorityCount,
      viewClientDetails,
      totalNotifications
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>