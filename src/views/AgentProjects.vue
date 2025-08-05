<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <AgentSidebar />
    
    <!-- Main Content -->
    <div class="ml-64 p-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Projets en cours</h1>
        <p class="text-gray-600 mt-2">Sélectionnez un client pour accéder à son tableau de bord</p>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Clients assignés</p>
              <p class="text-2xl font-semibold text-gray-900">{{ assignedClients.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Projets actifs</p>
              <p class="text-2xl font-semibold text-gray-900">{{ totalActiveProjects }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Échéances cette semaine</p>
              <p class="text-2xl font-semibold text-gray-900">{{ upcomingDeadlines }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <div class="flex items-center space-x-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Rechercher un client</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Nom, email ou entreprise..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <button
              @click="searchQuery = ''"
              class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Effacer
            </button>
          </div>
        </div>
      </div>

      <!-- Clients Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="client in filteredClients"
          :key="client.id"
          @click="goToClientDashboard(client)"
          class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300"
        >
          <div class="p-6">
            <!-- Client Header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-blue-600 font-semibold text-lg">
                    {{ getClientInitials(client) }}
                  </span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ client.first_name }} {{ client.last_name }}
                  </h3>
                  <p class="text-sm text-gray-500">{{ client.email }}</p>
                </div>
              </div>
              <div class="text-right">
                <span :class="client.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ client.is_active ? 'Actif' : 'Inactif' }}
                </span>
              </div>
            </div>

            <!-- Company Info -->
            <div v-if="client.company_name" class="mb-4">
              <div class="flex items-center text-sm text-gray-600">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                {{ client.company_name }}
              </div>
              <div v-if="client.industry" class="text-sm text-gray-500 mt-1">
                {{ client.industry }}
              </div>
            </div>

            <!-- Project Stats -->
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{ client.projectCount || 0 }}</div>
                <div class="text-xs text-gray-500">Projets</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">{{ client.completedProjects || 0 }}</div>
                <div class="text-xs text-gray-500">Terminés</div>
              </div>
            </div>

            <!-- Last Activity -->
            <div class="text-xs text-gray-500 border-t pt-3">
              <div class="flex items-center justify-between">
                <span>Dernière connexion:</span>
                <span>{{ formatLastLogin(client.last_login) }}</span>
              </div>
            </div>

            <!-- Action Button -->
            <div class="mt-4">
              <button class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                Accéder au tableau de bord
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredClients.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun client trouvé</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ searchQuery ? 'Aucun client ne correspond à votre recherche.' : 'Aucun client ne vous est assigné pour le moment.' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AgentSidebar from '../components/AgentSidebar.vue'
import projectManagementService, { clientProjectService } from '../services/projectManagementService'

export default {
  name: 'AgentProjects',
  components: {
    AgentSidebar
  },
  setup() {
    const router = useRouter()
    const assignedClients = ref([])
    const loading = ref(false)
    const searchQuery = ref('')
    const totalActiveProjects = ref(0)
    const upcomingDeadlines = ref(0)

    const filteredClients = computed(() => {
      if (!searchQuery.value) return assignedClients.value
      
      const search = searchQuery.value.toLowerCase()
      return assignedClients.value.filter(client => 
        `${client.first_name} ${client.last_name}`.toLowerCase().includes(search) ||
        client.email.toLowerCase().includes(search) ||
        client.company_name?.toLowerCase().includes(search)
      )
    })

    const loadAssignedClients = async () => {
      try {
        loading.value = true
        
        // Récupérer les clients assignés à l'agent
        const clientsResponse = await projectManagementService.getAssignedClients()
        if (clientsResponse.success) {
          assignedClients.value = Array.isArray(clientsResponse.data) ? clientsResponse.data : []
          
          // Calculer les statistiques pour chaque client
          for (const client of assignedClients.value) {
            try {
              const projectsResponse = await clientProjectService.getClientProjects(client.id)
              if (projectsResponse.success) {
                client.projectCount = projectsResponse.data.length
                client.completedProjects = projectsResponse.data.filter(p => p.status === 'completed').length
              }
            } catch (error) {
              console.error(`Erreur lors du chargement des projets pour le client ${client.id}:`, error)
              client.projectCount = 0
              client.completedProjects = 0
            }
          }
          
          // Calculer les statistiques globales
          await calculateGlobalStats()
        }
      } catch (error) {
        console.error('Erreur lors du chargement des clients assignés:', error)
      } finally {
        loading.value = false
      }
    }

    const calculateGlobalStats = async () => {
      try {
        const projectsResponse = await clientProjectService.getAgentProjects()
        if (projectsResponse.success) {
          const projects = projectsResponse.data
          totalActiveProjects.value = projects.filter(p => p.status !== 'completed').length
          
          // Calculer les échéances de cette semaine
          const oneWeekFromNow = new Date()
          oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7)
          
          upcomingDeadlines.value = projects.filter(p => {
            if (!p.end_date) return false
            const endDate = new Date(p.end_date)
            return endDate <= oneWeekFromNow && endDate >= new Date()
          }).length
        }
      } catch (error) {
        console.error('Erreur lors du calcul des statistiques:', error)
      }
    }

    const getClientInitials = (client) => {
      const firstInitial = client.first_name ? client.first_name.charAt(0).toUpperCase() : ''
      const lastInitial = client.last_name ? client.last_name.charAt(0).toUpperCase() : ''
      return firstInitial + lastInitial || '??'
    }

    const formatLastLogin = (lastLogin) => {
      if (!lastLogin) return 'Jamais'
      
      const date = new Date(lastLogin)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) return 'Hier'
      if (diffDays < 7) return `Il y a ${diffDays} jours`
      if (diffDays < 30) return `Il y a ${Math.ceil(diffDays / 7)} semaines`
      return date.toLocaleDateString('fr-FR')
    }

    const goToClientDashboard = (client) => {
      // Navigation vers le tableau de bord du client
      router.push({
        name: 'ClientProjectDashboard',
        params: { clientId: client.id }
      })
    }

    onMounted(() => {
      loadAssignedClients()
    })

    return {
      assignedClients,
      loading,
      searchQuery,
      totalActiveProjects,
      upcomingDeadlines,
      filteredClients,
      getClientInitials,
      formatLastLogin,
      goToClientDashboard
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques si nécessaire */
</style>