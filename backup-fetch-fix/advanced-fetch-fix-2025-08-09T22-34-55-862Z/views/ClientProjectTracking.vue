<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-50 bg-gray-900 transform transition-all duration-300 ease-in-out md:translate-x-0 md:static md:inset-0"
      :class="{ 
        '-translate-x-full': !sidebarOpen, 
        'translate-x-0': sidebarOpen,
        'w-16': sidebarCollapsed,
        'w-64': !sidebarCollapsed
      }"
    >
      <Sidebar @close-sidebar="sidebarOpen = false" @toggle-collapse="handleSidebarCollapse" />
    </div>
    
    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      
      <!-- Page content -->
      <main class="flex-1 overflow-y-auto">
        <!-- Page header -->
        <div class="bg-white shadow-sm border-b border-gray-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between py-6">
              <div class="flex-1">
                <h1 class="text-2xl font-bold text-gray-900 flex items-center">
                  <svg class="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                  Suivi de mes projets
                </h1>
                <p class="text-gray-600 mt-1">
                  Suivez l'avancement de tous vos projets gérés par votre agent
                </p>
              </div>
              
              <!-- Filtres rapides -->
              <div class="flex items-center space-x-4">
                <select 
                  v-model="selectedStatus" 
                  @change="filterProjects"
                  class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="En cours">En cours</option>
                  <option value="En attente">En attente</option>
                  <option value="Terminé">Terminé</option>
                  <option value="En pause">En pause</option>
                </select>
                
                <select 
                  v-model="selectedPriority" 
                  @change="filterProjects"
                  class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les priorités</option>
                  <option value="Haute">Haute</option>
                  <option value="Moyenne">Moyenne</option>
                  <option value="Basse">Basse</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- Statistiques rapides -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total projets</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ projectStats.total }}</p>
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">En cours</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ projectStats.active }}</p>
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">En attente</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ projectStats.pending }}</p>
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Terminés</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ projectStats.completed }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Liste des projets -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Mes projets</h3>
            </div>
            
            <!-- Loading state -->
            <div v-if="loading" class="p-8 text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p class="text-gray-500 mt-4">Chargement des projets...</p>
            </div>
            
            <!-- Empty state -->
            <div v-else-if="filteredProjects.length === 0" class="p-8 text-center">
              <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <p class="text-gray-500">Aucun projet trouvé</p>
            </div>
            
            <!-- Projects list -->
            <div v-else class="divide-y divide-gray-200">
              <div 
                v-for="project in filteredProjects" 
                :key="project.id"
                class="p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                @click="viewProjectDetails(project.id)"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-2">
                      <h4 class="text-lg font-semibold text-gray-900">{{ project.name }}</h4>
                      <span 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getStatusBadgeClass(project.status)"
                      >
                        {{ project.status }}
                      </span>
                      <span 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getPriorityBadgeClass(project.priority)"
                      >
                        {{ project.priority }}
                      </span>
                    </div>
                    
                    <p class="text-gray-600 mb-3">{{ project.description }}</p>
                    
                    <div class="flex items-center space-x-6 text-sm text-gray-500">
                      <div class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        Créé le {{ formatDate(project.created_at) }}
                      </div>
                      
                      <div v-if="project.deadline" class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Échéance: {{ formatDate(project.deadline) }}
                      </div>
                      
                      <div v-if="project.agent_name" class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        Agent: {{ project.agent_name }}
                      </div>
                    </div>
                    
                    <!-- Progress bar -->
                    <div v-if="project.progress !== undefined" class="mt-4">
                      <div class="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progression</span>
                        <span>{{ project.progress }}%</span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          :style="{ width: project.progress + '%' }"
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-2 ml-4">
                    <button 
                      @click.stop="viewProjectDetails(project.id)"
                      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Voir détails
                    </button>
                    
                    <button 
                      v-if="project.agent_id"
                      @click.stop="contactAgent(project.agent_id)"
                      class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Contacter l'agent
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import { clientProjectService } from '@/services/projectManagementService'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'ClientProjectTracking',
  components: {
    Header,
    Sidebar
  },
  setup() {
    const toast = useToast()
    const authStore = useAuthStore()
    return { toast, authStore }
  },
  data() {
    return {
      sidebarOpen: false,
      sidebarCollapsed: false,
      loading: true,
      projects: [],
      filteredProjects: [],
      selectedStatus: '',
      selectedPriority: '',
      projectStats: {
        total: 0,
        active: 0,
        pending: 0,
        completed: 0
      }
    }
  },
  computed: {
    userId() {
      const storeUser = this.authStore?.user
      if (storeUser && storeUser.id) {
        return storeUser.id
      }
      return null
    }
  },
  methods: {
    handleSidebarCollapse(isCollapsed) {
      this.sidebarCollapsed = isCollapsed
    },
    
    async loadProjects() {
      try {
        this.loading = true
        const response = await clientProjectService.getMyProjects()
        
        if (response.success) {
          this.projects = response.data || []
          this.filteredProjects = [...this.projects]
          this.calculateStats()
        } else {
          this.toast.error('Erreur lors du chargement des projets')
        }
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error)
        this.toast.error('Erreur lors du chargement des projets')
      } finally {
        this.loading = false
      }
    },
    
    calculateStats() {
      this.projectStats = {
        total: this.projects.length,
        active: this.projects.filter(p => p.status === 'En cours').length,
        pending: this.projects.filter(p => p.status === 'En attente').length,
        completed: this.projects.filter(p => p.status === 'Terminé').length
      }
    },
    
    filterProjects() {
      let filtered = [...this.projects]
      
      if (this.selectedStatus) {
        filtered = filtered.filter(project => project.status === this.selectedStatus)
      }
      
      if (this.selectedPriority) {
        filtered = filtered.filter(project => project.priority === this.selectedPriority)
      }
      
      this.filteredProjects = filtered
    },
    
    viewProjectDetails(projectId) {
      this.$router.push(`/projects/${projectId}`)
    },
    
    contactAgent(agentId) {
      // Contacter l'agent
        this.$toast.info('La fonctionnalité de contact direct n\'est plus disponible.')
    },
    
    formatDate(date) {
      if (!date) return 'Non défini'
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(new Date(date))
    },
    
    getStatusBadgeClass(status) {
      const classes = {
        'En cours': 'bg-blue-100 text-blue-800',
        'En attente': 'bg-yellow-100 text-yellow-800',
        'Terminé': 'bg-green-100 text-green-800',
        'En pause': 'bg-gray-100 text-gray-800',
        'Annulé': 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    },
    
    getPriorityBadgeClass(priority) {
      const classes = {
        'Haute': 'bg-red-100 text-red-800',
        'Moyenne': 'bg-orange-100 text-orange-800',
        'Basse': 'bg-green-100 text-green-800'
      }
      return classes[priority] || 'bg-gray-100 text-gray-800'
    }
  },
  
  async mounted() {
    this.authStore.initializeAuth()
    await this.loadProjects()
  }
}
</script>

<style scoped>
/* Styles personnalisés si nécessaire */
</style>