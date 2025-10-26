<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Prestataire -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo et titre -->
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">🎯 Fusepoint</h1>
            <span class="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              Prestataire
            </span>
          </div>
          
          <!-- Menu utilisateur -->
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-700">
              {{ user?.first_name }} {{ user?.last_name }}
            </span>
            <button
              @click="logout"
              class="text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Chargement de vos données...</span>
      </div>

      <!-- Contenu du dashboard -->
      <div v-else>
        <!-- Statistiques -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Tâches</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ dashboardData?.stats?.totalTasks || 0 }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">En cours</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ dashboardData?.stats?.inProgressTasks || 0 }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Terminées</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ dashboardData?.stats?.completedTasks || 0 }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Agents</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ dashboardData?.stats?.totalAgents || 0 }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Grille principale -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Tâches récentes -->
          <div class="lg:col-span-2">
            <div class="bg-white shadow rounded-lg">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Mes Tâches</h3>
              </div>
              <div class="p-6">
                <div v-if="!dashboardData?.tasks?.length" class="text-center py-8">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune tâche</h3>
                  <p class="mt-1 text-sm text-gray-500">Vous n'avez pas encore de tâches assignées.</p>
                </div>
                
                <div v-else class="space-y-4">
                  <div
                    v-for="task in dashboardData.tasks"
                    :key="task.id"
                    class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h4 class="text-sm font-medium text-gray-900">{{ task.title }}</h4>
                        <p class="mt-1 text-sm text-gray-600">{{ task.description }}</p>
                        
                        <div class="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span>Agent: {{ task.agent.name }}</span>
                          <span v-if="task.client">Client: {{ task.client.name }}</span>
                          <span v-if="task.dueDate">Échéance: {{ formatDate(task.dueDate) }}</span>
                        </div>
                        
                        <!-- Données spécifiques de la tâche -->
                        <div v-if="task.taskData && Object.keys(task.taskData).length" class="mt-2">
                          <div v-if="task.taskData.technologies" class="flex flex-wrap gap-1">
                            <span
                              v-for="tech in task.taskData.technologies"
                              :key="tech"
                              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {{ tech }}
                            </span>
                          </div>
                          <p v-if="task.taskData.budget" class="text-xs text-gray-600 mt-1">
                            Budget: {{ $formatCurrency(task.taskData.budget) }}
                          </p>
                        </div>
                      </div>
                      
                      <div class="ml-4 flex flex-col items-end space-y-2">
                        <!-- Statut -->
                        <span
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="getStatusClass(task.status)"
                        >
                          {{ getStatusLabel(task.status) }}
                        </span>
                        
                        <!-- Priorité -->
                        <span
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="getPriorityClass(task.priority)"
                        >
                          {{ getPriorityLabel(task.priority) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Agents associés -->
            <div class="bg-white shadow rounded-lg">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Mes Agents</h3>
              </div>
              <div class="p-6">
                <div v-if="!dashboardData?.agents?.length" class="text-center py-4">
                  <p class="text-sm text-gray-500">Aucun agent associé</p>
                </div>
                
                <div v-else class="space-y-3">
                  <div
                    v-for="agent in dashboardData.agents"
                    :key="agent.id"
                    class="flex items-center space-x-3"
                  >
                    <div class="flex-shrink-0">
                      <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-700">
                          {{ agent.name.split(' ').map(n => n[0]).join('') }}
                        </span>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ agent.name }}</p>
                      <p class="text-xs text-gray-500 truncate">{{ agent.email }}</p>
                      <p class="text-xs text-gray-400">{{ agent.relationshipType }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions rapides -->
            <div class="bg-white shadow rounded-lg">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Actions</h3>
              </div>
              <div class="p-6">
                <div class="space-y-3">
                  <button
                    @click="refreshData"
                    class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Actualiser
                  </button>
                  
                  <button
                    class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled
                  >
                    <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Support (Bientôt)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import authService from '../services/authService'

export default {
  name: 'PrestataireDashboard',
  setup() {
    const router = useRouter()
    const loading = ref(true)
    const dashboardData = ref(null)
    const user = ref(null)
    
    onMounted(async () => {
      // Vérifier l'authentification et le rôle
      user.value = authService.getCurrentUser()
      
      if (!user.value || user.value.role !== 'prestataire') {
        router.push('/login')
        return
      }
      
      await loadDashboardData()
    })
    
    const loadDashboardData = async () => {
      try {
        loading.value = true
        const response = await axios.get('/api/prestataire/dashboard-data')
        
        if (response.data.success) {
          dashboardData.value = response.data.data
        }
      } catch (error) {
        console.error('Erreur chargement dashboard:', error)
      } finally {
        loading.value = false
      }
    }
    
    const refreshData = async () => {
      await loadDashboardData()
    }
    
    const logout = () => {
      authService.logout()
      router.push('/login')
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('fr-FR')
    }
    
    const getStatusClass = (status) => {
      const classes = {
        'assigned': 'bg-gray-100 text-gray-800',
        'in_progress': 'bg-yellow-100 text-yellow-800',
        'completed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }
    
    const getStatusLabel = (status) => {
      const labels = {
        'assigned': 'Assignée',
        'in_progress': 'En cours',
        'completed': 'Terminée',
        'cancelled': 'Annulée'
      }
      return labels[status] || status
    }
    
    const getPriorityClass = (priority) => {
      const classes = {
        'low': 'bg-blue-100 text-blue-800',
        'medium': 'bg-yellow-100 text-yellow-800',
        'high': 'bg-orange-100 text-orange-800',
        'urgent': 'bg-red-100 text-red-800'
      }
      return classes[priority] || 'bg-gray-100 text-gray-800'
    }
    
    const getPriorityLabel = (priority) => {
      const labels = {
        'low': 'Faible',
        'medium': 'Moyenne',
        'high': 'Haute',
        'urgent': 'Urgente'
      }
      return labels[priority] || priority
    }
    
    return {
      loading,
      dashboardData,
      user,
      refreshData,
      logout,
      formatDate,
      getStatusClass,
      getStatusLabel,
      getPriorityClass,
      getPriorityLabel
    }
  }
}
</script>