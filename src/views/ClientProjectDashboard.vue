<template>
  <RoleLayout>
    
    <!-- Contenu principal -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- En-tête -->
      <div class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button 
              @click="goBack" 
              class="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Retour aux clients
            </button>
            <div class="h-6 w-px bg-gray-300"></div>
            <div v-if="clientInfo">
              <h1 class="text-2xl font-bold text-gray-900">
                Tableau de bord - {{ clientInfo.first_name }} {{ clientInfo.last_name }}
              </h1>
              <p class="text-sm text-gray-600">{{ clientInfo.email }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-sm text-gray-500">Dernière mise à jour: {{ formatDate(new Date()) }}</span>
            <button 
              @click="refreshData" 
              :disabled="loading"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Actualisation...' : 'Actualiser' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Contenu du tableau de bord -->
      <div class="flex-1 overflow-auto p-6">
        <!-- Statistiques -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-2 bg-blue-100 rounded-lg">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Projets Totaux</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.totalProjects }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-2 bg-green-100 rounded-lg">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Projets Terminés</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.completedProjects }}</p>
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
                <p class="text-sm font-medium text-gray-600">En Cours</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.activeProjects }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="p-2 bg-red-100 rounded-lg">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">En Retard</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.overdueProjects }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Projets du client -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Projets du Client</h2>
              <div class="flex items-center space-x-3">
                <select 
                  v-model="statusFilter" 
                  class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="planification">Planification</option>
                  <option value="en_cours">En cours</option>
                  <option value="en_revision">En révision</option>
                  <option value="termine">Terminé</option>
                  <option value="en_pause">En pause</option>
                </select>
                <button 
                  @click="showCreateProjectModal = true"
                  class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Nouveau Projet
                </button>
              </div>
            </div>
          </div>

          <!-- Boutons d'actions en masse -->
          <div v-if="selectedProjects.length > 0" class="px-6 py-4 bg-blue-50 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700">
                {{ selectedProjects.length }} projet(s) sélectionné(s)
              </span>
              <div class="flex space-x-2">
                <button 
                  @click="clearSelection"
                  class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Désélectionner tout
                </button>
                <button 
                  @click="deleteSelectedProjects"
                  class="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Supprimer la sélection
                </button>
              </div>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      :checked="isAllSelected" 
                      @change="toggleSelectAll"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progrès</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Échéance</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">

                <tr v-for="project in filteredProjects" :key="project.id" class="hover:bg-gray-50" :class="{ 'bg-blue-50': selectedProjects.includes(project.id) }">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      :checked="selectedProjects.includes(project.id)"
                      @change="toggleProjectSelection(project.id)"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ project.title }}</div>
                      <div class="text-sm text-gray-500">{{ project.description }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(project.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ getStatusLabel(project.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getPriorityClass(project.priority)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ getPriorityLabel(project.priority) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div :class="getProgressClass(project.progress)" class="h-2 rounded-full transition-all duration-300" :style="{ width: project.progress + '%' }"></div>
                      </div>
                      <span class="text-sm text-gray-600 min-w-0">{{ project.progress }}%</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span :class="{ 'text-red-600 font-semibold': isOverdue(project.end_date) }">
                      {{ formatDate(project.end_date) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button 
                        @click="viewProject(project)" 
                        class="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        Voir
                      </button>
                      <button 
                        @click="editProject(project)" 
                        class="text-green-600 hover:text-green-900 transition-colors"
                      >
                        Modifier
                      </button>
                      <button 
                        @click="deleteProject(project)" 
                        class="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <!-- Message si aucun projet -->
            <div v-if="filteredProjects.length === 0" class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun projet</h3>
              <p class="mt-1 text-sm text-gray-500">Ce client n'a pas encore de projets assignés.</p>
              <button 
                @click="showCreateProjectModal = true"
                class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer le premier projet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de création de projet -->
    <CreateProjectModal
      v-if="showCreateProjectModal"
      :client-id="clientId"
      @close="showCreateProjectModal = false"
      @projectCreated="onProjectCreated"
    />

    <!-- Modal d'édition de projet -->
    <EditProjectModal
      v-if="showEditProjectModal"
      :project="selectedProject"
      @close="showEditProjectModal = false"
      @updated="onProjectUpdated"
    />

    <!-- Modal de confirmation de suppression -->
    <ConfirmDeleteModal
      v-if="showDeleteModal"
      :title="'Supprimer le projet'"
      :message="`Êtes-vous sûr de vouloir supprimer le projet '${selectedProject?.title}' ? Cette action est irréversible.`"
      @close="showDeleteModal = false"
      @confirm="confirmDeleteProject"
    />

    <!-- Modal de confirmation de suppression multiple -->
    <ConfirmDeleteModal
      v-if="showBulkDeleteModal"
      :title="'Supprimer les projets sélectionnés'"
      :message="`Êtes-vous sûr de vouloir supprimer ${selectedProjects.length} projet(s) ? Cette action est irréversible.`"
      @close="showBulkDeleteModal = false"
      @confirm="confirmBulkDeleteProjects"
    />
  </RoleLayout>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import RoleLayout from '../components/RoleLayout.vue'
import CreateProjectModal from '../components/modals/CreateProjectModal.vue'
import EditProjectModal from '../components/ProjectManagement/EditProjectModal.vue'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.vue'
import projectManagementService, { clientProjectService } from '../services/projectManagementService'
import { useProjectsStore } from '@/stores/projects'

export default {
  name: 'ClientProjectDashboard',
  components: {
    RoleLayout,
    CreateProjectModal,
    EditProjectModal,
    ConfirmDeleteModal
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const clientId = route.params.clientId
    const projectsStore = useProjectsStore()
    
    const clientInfo = ref(null)
    const projects = ref([])
    const loading = ref(false)
    const statusFilter = ref('')
    const showCreateProjectModal = ref(false)
    const showEditProjectModal = ref(false)
    const showDeleteModal = ref(false)
    const showBulkDeleteModal = ref(false)
    const selectedProject = ref(null)
    const selectedProjects = ref([])

    const stats = computed(() => {
      // Vérifier que projects.value est un tableau
      const projectsArray = Array.isArray(projects.value) ? projects.value : []
      
      const totalProjects = projectsArray.length
      const completedProjects = projectsArray.filter(p => p.status === 'completed' || p.status === 'termine').length
      const activeProjects = projectsArray.filter(p => p.status === 'in_progress' || p.status === 'en_cours').length
      const overdueProjects = projectsArray.filter(p => {
        if (!p.end_date) return false
        return new Date(p.end_date) < new Date() && p.status !== 'completed' && p.status !== 'termine'
      }).length
      
      return { totalProjects, completedProjects, activeProjects, overdueProjects }
    })

    const filteredProjects = computed(() => {
      const projectsArray = Array.isArray(projects.value) ? projects.value : [];
      
      return statusFilter.value === '' 
    ? projectsArray
    : projectsArray.filter(project => project.status === statusFilter.value);
    });

    const isAllSelected = computed(() => {
      return filteredProjects.value.length > 0 && 
             filteredProjects.value.every(project => selectedProjects.value.includes(project.id))
    })

    const loadClientData = async () => {
      try {
        loading.value = true
        
        // Récupérer les informations du client
        const clientsResponse = await projectManagementService.getAssignedClients()
        if (clientsResponse.success) {
          clientInfo.value = clientsResponse.data.find(client => client.id == clientId)
        }
        
        // Récupérer les projets du client
        const projectsResponse = await clientProjectService.getClientProjects(clientId)
        console.log('🔍 Debug - Réponse getClientProjects:', {
          success: projectsResponse.success,
          dataLength: projectsResponse.data ? projectsResponse.data.length : 0,
          data: projectsResponse.data
        });
        if (projectsResponse.success) {
          // Les projets sont maintenant correctement extraits dans le service
          projects.value = projectsResponse.data || []
          console.log('🔍 Debug - Projets assignés à projects.value:', projects.value.length);
        } else {
          console.error('Échec de récupération des projets:', projectsResponse)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données du client:', error)
      } finally {
        loading.value = false
      }
    }

    const refreshData = () => {
      loadClientData()
    }

    const goBack = () => {
      router.push('/agent/projects')
    }

    const getStatusClass = (status) => {
      const classes = {
        'planning': 'bg-gray-100 text-gray-800',
        'planification': 'bg-gray-100 text-gray-800',
        'in_progress': 'bg-blue-100 text-blue-800',
        'en_cours': 'bg-blue-100 text-blue-800',
        'review': 'bg-yellow-100 text-yellow-800',
        'en_revision': 'bg-yellow-100 text-yellow-800',
        'completed': 'bg-green-100 text-green-800',
        'termine': 'bg-green-100 text-green-800',
        'on_hold': 'bg-red-100 text-red-800',
        'en_pause': 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusLabel = (status) => {
      const labels = {
        'planning': 'Planification',
        'planification': 'Planification',
        'in_progress': 'En cours',
        'en_cours': 'En cours',
        'review': 'En révision',
        'en_revision': 'En révision',
        'completed': 'Terminé',
        'termine': 'Terminé',
        'on_hold': 'En pause',
        'en_pause': 'En pause'
      }
      return labels[status] || status
    }

    const getPriorityClass = (priority) => {
      const classes = {
        'low': 'bg-green-100 text-green-800',
        'medium': 'bg-yellow-100 text-yellow-800',
        'high': 'bg-orange-100 text-orange-800',
        'urgent': 'bg-red-100 text-red-800'
      }
      return classes[priority] || 'bg-gray-100 text-gray-800'
    }

    const getPriorityLabel = (priority) => {
      const labels = {
        'low': 'Basse',
        'medium': 'Moyenne',
        'high': 'Haute',
        'urgent': 'Urgente'
      }
      return labels[priority] || priority
    }

    const getProgressClass = (progress) => {
      if (progress >= 80) return 'bg-green-500'
      if (progress >= 60) return 'bg-blue-500'
      if (progress >= 40) return 'bg-yellow-500'
      return 'bg-red-500'
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'Non définie'
      return new Date(dateString).toLocaleDateString('fr-FR')
    }

    const isOverdue = (dateString) => {
      if (!dateString) return false
      return new Date(dateString) < new Date()
    }

    const viewProject = (project) => {
      router.push(`/agent/clients/${clientId}/projects/${project.id}`)
    }

    const manageProject = (project) => {
      router.push(`/agent/clients/${clientId}/projects/${project.id}`)
    }

    const editProject = (project) => {
      selectedProject.value = project
      showEditProjectModal.value = true
    }

    const duplicateProject = async (project) => {
      try {
        loading.value = true
        const duplicatedProject = await projectManagementService.duplicateProject(project.id)
        projects.value.push(duplicatedProject)
        // Notification de succès
      } catch (error) {
        console.error('Erreur lors de la duplication du projet:', error)
        // Notification d'erreur
      } finally {
        loading.value = false
      }
    }

    const deleteProject = (project) => {
      selectedProject.value = project
      showDeleteModal.value = true
    }

    const confirmDeleteProject = async () => {
      try {
        loading.value = true
        const result = await projectManagementService.deleteProject(selectedProject.value.id)
        
        if (result.success) {
          // Supprimer du store global
          projectsStore.removeProject(selectedProject.value.id)
          
          // Supprimer de la liste locale
          const projectsArray = Array.isArray(projects.value) ? projects.value : []
          projects.value = projectsArray.filter(p => p.id !== selectedProject.value.id)
          
          // Forcer le rafraîchissement des données du client dans le store
          await projectsStore.loadClientProjects(clientId, true)
          
          showDeleteModal.value = false
          selectedProject.value = null
          // Notification de succès
        } else {
          console.error('Erreur lors de la suppression du projet:', result.error)
          // Notification d'erreur
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error)
        // Notification d'erreur
      } finally {
        loading.value = false
      }
    }

    const onProjectCreated = (projectData) => {
      try {
        // Vérifier que projects.value est un tableau avant d'ajouter
        if (!Array.isArray(projects.value)) {
          projects.value = []
        }
        
        // S'assurer que le projet a les propriétés par défaut nécessaires
        const projectWithDefaults = {
          ...projectData,
          status: projectData.status || 'planification',
          progress: projectData.progress || 0,
          priority: projectData.priority || 'medium'
        }
        
        projects.value.unshift(projectWithDefaults)
        showCreateProjectModal.value = false
        
        // Forcer la réactivité des statistiques
        // Les stats computed se mettront à jour automatiquement
        console.log('Projet créé avec succès:', projectData)
      } catch (error) {
        console.error('Erreur lors de l\'ajout du projet à la liste:', error)
      }
    }

    const onProjectUpdated = (updatedProject) => {
      const index = projects.value.findIndex(p => p.id === updatedProject.id)
      if (index !== -1) {
        // S'assurer que le projet mis à jour a toutes les propriétés nécessaires
        const projectWithDefaults = {
          ...projects.value[index], // Garder les propriétés existantes
          ...updatedProject, // Appliquer les mises à jour
          status: updatedProject.status || projects.value[index].status || 'planification',
          progress: updatedProject.progress !== undefined ? updatedProject.progress : (projects.value[index].progress || 0),
          priority: updatedProject.priority || projects.value[index].priority || 'medium'
        }
        projects.value[index] = projectWithDefaults
      }
      showEditProjectModal.value = false
      selectedProject.value = null
    }

    // Méthodes pour la gestion de la sélection multiple
    const toggleProjectSelection = (projectId) => {
      const index = selectedProjects.value.indexOf(projectId)
      if (index > -1) {
        selectedProjects.value.splice(index, 1)
      } else {
        selectedProjects.value.push(projectId)
      }
    }

    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        selectedProjects.value = []
      } else {
        selectedProjects.value = filteredProjects.value.map(project => project.id)
      }
    }

    const clearSelection = () => {
      selectedProjects.value = []
    }

    const deleteSelectedProjects = () => {
      if (selectedProjects.value.length > 0) {
        showBulkDeleteModal.value = true
      }
    }

    const confirmBulkDeleteProjects = async () => {
      try {
        loading.value = true
        await projectManagementService.deleteMultipleProjects(selectedProjects.value)
        
        // Supprimer les projets de la liste locale
        const projectsArray = Array.isArray(projects.value) ? projects.value : []
        projects.value = projectsArray.filter(p => !selectedProjects.value.includes(p.id))
        
        // Réinitialiser la sélection
        selectedProjects.value = []
        showBulkDeleteModal.value = false
        
        // Notification de succès
        console.log('Projets supprimés avec succès')
      } catch (error) {
        console.error('Erreur lors de la suppression des projets:', error)
        // Notification d'erreur
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadClientData()
    })

    return {
      clientId,
      clientInfo,
      projects,
      loading,
      statusFilter,
      showCreateProjectModal,
      showEditProjectModal,
      showDeleteModal,
      showBulkDeleteModal,
      selectedProject,
      selectedProjects,
      stats,
      filteredProjects,
      isAllSelected,
      refreshData,
      goBack,
      getStatusClass,
      getStatusLabel,
      getPriorityClass,
      getPriorityLabel,
      getProgressClass,
      formatDate,
      isOverdue,
      viewProject,
      manageProject,
      editProject,
      duplicateProject,
      deleteProject,
      confirmDeleteProject,
      onProjectCreated,
      onProjectUpdated,
      toggleProjectSelection,
      toggleSelectAll,
      clearSelection,
      deleteSelectedProjects,
      confirmBulkDeleteProjects
    }
  }
}
</script>