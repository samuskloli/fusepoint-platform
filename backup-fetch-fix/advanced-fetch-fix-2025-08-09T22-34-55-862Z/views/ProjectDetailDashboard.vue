<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Menu latéral de l'agent -->
    <AgentSidebar />
    
    <!-- Contenu principal -->
    <div class="flex-1 flex flex-col overflow-hidden ml-64">
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
              Retour aux projets
            </button>
            <div class="h-6 w-px bg-gray-300"></div>
            <div v-if="project">
              <h1 class="text-2xl font-bold text-gray-900">
                {{ project.title }}
              </h1>
              <p class="text-sm text-gray-600">{{ project.description }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span 
              :class="[
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                getStatusClass(project?.status)
              ]"
            >
              {{ getStatusLabel(project?.status) }}
            </span>
            <button 
              @click="editProject" 
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Modifier
            </button>
            <button 
              @click="refreshData" 
              :disabled="loading"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
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

      <!-- Statistiques du projet -->
      <div class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ project?.progress || 0 }}%</div>
            <div class="text-sm text-gray-600">Progression</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ completedTasks }}</div>
            <div class="text-sm text-gray-600">Tâches terminées</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600">{{ pendingTasks }}</div>
            <div class="text-sm text-gray-600">Tâches en cours</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ teamMembers.length }}</div>
            <div class="text-sm text-gray-600">Membres équipe</div>
          </div>
        </div>
      </div>

      <!-- Onglets de navigation -->
      <div class="bg-white border-b border-gray-200">
        <nav class="flex space-x-8 px-6">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === tab.id 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon"></path>
            </svg>
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Contenu des onglets -->
      <div class="flex-1 overflow-auto p-6">
        <!-- Onglet Vue d'ensemble -->
        <div v-if="activeTab === 'overview'" class="space-y-6">
          <!-- Debug info -->
          <div v-if="!project && !loading" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-yellow-800">⚠️ Aucune donnée de projet trouvée. ProjectId: {{ projectId }}</p>
          </div>
          
          <!-- Informations du projet -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Informations du projet</h3>
            <div v-if="project" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700">Priorité</label>
                <span :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1',
                  getPriorityClass(project?.priority)
                ]">
                  {{ getPriorityLabel(project?.priority) }}
                </span>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Budget</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatCurrency(project?.budget) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Date de début</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(project?.start_date) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Date de fin</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(project?.end_date) }}</p>
              </div>
            </div>
            <div v-else-if="loading" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p class="mt-2 text-gray-600">Chargement des informations...</p>
            </div>
            <div v-else class="text-center py-8">
              <p class="text-gray-500">Aucune information de projet disponible</p>
            </div>
          </div>

          <!-- Barre de progression -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Progression du projet</h3>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                :class="[
                  'h-3 rounded-full transition-all duration-300',
                  getProgressClass(project?.progress || 0)
                ]"
                :style="{ width: `${project?.progress || 0}%` }"
              ></div>
            </div>
            <p class="text-sm text-gray-600 mt-2">{{ project?.progress || 0 }}% terminé</p>
          </div>

          <!-- Tâches récentes -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Tâches récentes</h3>
            <div class="space-y-3">
              <div v-for="task in recentTasks" :key="task.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <div :class="[
                    'w-3 h-3 rounded-full',
                    task.status === 'completed' ? 'bg-green-500' : 
                    task.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'
                  ]"></div>
                  <span class="text-sm font-medium text-gray-900">{{ task.title }}</span>
                </div>
                <span class="text-xs text-gray-500">{{ formatDate(task.updated_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet Tâches -->
        <div v-if="activeTab === 'tasks'">
          <TasksTab 
            :tasks="tasks"
            :project="project"
            :team-members="teamMembers"
            @create-task="createTask"
            @edit-task="editTask"
            @delete-task="deleteTask"
            @assign-task="assignTask"
          />
        </div>

        <!-- Onglet Fichiers -->
        <div v-if="activeTab === 'files'">
          <FilesTab 
            :files="files"
            :project="project"
            @upload-file="uploadFile"
            @delete-file="deleteFile"
            @download-file="downloadFile"
          />
        </div>

        <!-- Onglet Équipe -->
        <div v-if="activeTab === 'team'">
          <TeamTab 
            :team-members="teamMembers"
            :available-providers="availableProviders"
            @invite-provider="inviteProvider"
            @remove-member="removeMember"
            @update-role="updateRole"
          />
        </div>

        <!-- Onglet Rapports -->
        <div v-if="activeTab === 'reports'">
          <ReportsTab 
            :project="project"
            :tasks="tasks"
            :team-members="teamMembers"
          />
        </div>
      </div>
    </div>

    <!-- Modal d'édition de projet -->
    <EditProjectModal 
      v-if="showEditProjectModal"
      :project="project"
      @close="showEditProjectModal = false"
      @update="updateProject"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AgentSidebar from '../components/AgentSidebar.vue'

import TasksTab from '../components/ProjectManagement/TasksTab.vue'
import FilesTab from '../components/ProjectManagement/FilesTab.vue'
import TeamTab from '../components/ProjectManagement/TeamTab.vue'
import ReportsTab from '../components/ProjectManagement/ReportsTab.vue'
import EditProjectModal from '../components/ProjectManagement/EditProjectModal.vue'
import projectManagementService from '../services/projectManagementService.js'

export default {
  name: 'ProjectDetailDashboard',
  components: {
    AgentSidebar,
    TasksTab,
    FilesTab,
    TeamTab,
    ReportsTab,
    EditProjectModal
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const clientId = route.params.clientId
    const projectId = route.params.projectId
    
    // Debug: Afficher les paramètres de route
    console.log('🔍 Debug ProjectDetailDashboard - Route params:', route.params)
    console.log('🔍 Debug ProjectDetailDashboard - clientId:', clientId)
    console.log('🔍 Debug ProjectDetailDashboard - projectId:', projectId)
    
    const project = ref(null)
    const tasks = ref([])
    const files = ref([])
    const teamMembers = ref([])
    const availableProviders = ref([])
    const loading = ref(false)
    const activeTab = ref('overview')
    const showEditProjectModal = ref(false)

    const tabs = [
      { id: 'overview', name: 'Vue d\'ensemble', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      { id: 'tasks', name: 'Tâches', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
      { id: 'files', name: 'Fichiers', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { id: 'team', name: 'Équipe', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
      { id: 'reports', name: 'Rapports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
    ]

    const completedTasks = computed(() => {
      if (!Array.isArray(tasks.value)) return 0
      return tasks.value.filter(task => task.status === 'completed').length
    })

    const pendingTasks = computed(() => {
      if (!Array.isArray(tasks.value)) return 0
      return tasks.value.filter(task => task.status !== 'completed').length
    })

    const recentTasks = computed(() => {
      if (!Array.isArray(tasks.value)) return []
      return tasks.value
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 5)
    })

    const loadProjectData = async () => {
      try {
        loading.value = true
        
        if (!projectId) {
          console.error('ProjectId manquant dans les paramètres de route')
          router.push(`/agent/clients/${clientId}/dashboard`)
          return
        }
        
        // Récupérer les détails du projet
        console.log('🔍 Debug - Chargement du projet ID:', projectId)
        const projectResponse = await projectManagementService.getProjectDetails(projectId)
        console.log('🔍 Debug - Réponse du projet:', projectResponse)
        if (projectResponse.success) {
          project.value = projectResponse.data
          console.log('✅ Projet chargé avec succès:', project.value)
        } else {
          console.error('❌ Échec du chargement du projet:', {
            success: projectResponse.success,
            data: projectResponse.data,
            message: projectResponse.message,
            error: projectResponse.error
          })
        }
        
        // Récupérer les tâches du projet
        const tasksResponse = await projectManagementService.getProjectTasks(projectId)
        console.log('🔍 Debug - Réponse des tâches:', tasksResponse)
        if (tasksResponse.success && Array.isArray(tasksResponse.data)) {
          tasks.value = tasksResponse.data
          console.log('✅ Tâches chargées avec succès:', tasks.value.length, 'tâches')
        } else {
          console.error('❌ Échec du chargement des tâches:', {
            success: tasksResponse.success,
            data: tasksResponse.data,
            message: tasksResponse.message,
            error: tasksResponse.error
          })
          tasks.value = [] // S'assurer que tasks.value est toujours un tableau
        }
        
        // Récupérer les fichiers du projet
        const filesResponse = await projectManagementService.getProjectFiles(projectId)
        if (filesResponse.success && Array.isArray(filesResponse.data)) {
          files.value = filesResponse.data
        } else {
          files.value = [] // S'assurer que files.value est toujours un tableau
        }
        
        // Récupérer les membres de l'équipe
        const teamResponse = await projectManagementService.getProjectTeamMembers(projectId)
        if (teamResponse.success && Array.isArray(teamResponse.data)) {
          teamMembers.value = teamResponse.data
        } else {
          teamMembers.value = [] // S'assurer que teamMembers.value est toujours un tableau
        }
        
        // Récupérer les prestataires disponibles
        const providersResponse = await projectManagementService.getAvailableProviders()
        if (providersResponse.success && Array.isArray(providersResponse.data)) {
          availableProviders.value = providersResponse.data
        } else {
          availableProviders.value = [] // S'assurer que availableProviders.value est toujours un tableau
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données du projet:', error)
      } finally {
        loading.value = false
      }
    }

    const refreshData = () => {
      loadProjectData()
    }

    const goBack = () => {
      router.push(`/agent/clients/${clientId}/dashboard`)
    }

    const editProject = () => {
      showEditProjectModal.value = true
    }

    const updateProject = async (projectData) => {
      try {
        const response = await projectManagementService.updateProject(projectId, projectData)
        if (response.success) {
          project.value = { ...project.value, ...response.data }
          showEditProjectModal.value = false
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du projet:', error)
      }
    }

    // Fonctions utilitaires
    const getStatusClass = (status) => {
      const classes = {
        'planning': 'bg-gray-100 text-gray-800',
        'in_progress': 'bg-blue-100 text-blue-800',
        'review': 'bg-yellow-100 text-yellow-800',
        'completed': 'bg-green-100 text-green-800',
        'on_hold': 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusLabel = (status) => {
      const labels = {
        'planning': 'Planification',
        'in_progress': 'En cours',
        'review': 'En révision',
        'completed': 'Terminé',
        'on_hold': 'En pause'
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

    const formatCurrency = (amount) => {
      if (amount === null || amount === undefined) return '0 CHF'
      return new Intl.NumberFormat('fr-CH', {
        style: 'currency',
        currency: 'CHF'
      }).format(amount)
    }

    // Gestionnaires d'événements pour les onglets
    const createTask = async (taskData) => {
      try {
        const response = await projectManagementService.createTask(projectId, taskData)
        if (response.success) {
          tasks.value.push(response.data)
        }
      } catch (error) {
        console.error('Erreur lors de la création de la tâche:', error)
      }
    }

    const editTask = async (taskId, taskData) => {
      try {
        const response = await projectManagementService.updateTask(taskId, taskData)
        if (response.success) {
          const index = tasks.value.findIndex(t => t.id === taskId)
          if (index !== -1) {
            tasks.value[index] = response.data
          }
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la tâche:', error)
      }
    }

    const deleteTask = async (taskId) => {
      try {
        const response = await projectManagementService.deleteTask(taskId)
        if (response.success) {
          tasks.value = tasks.value.filter(t => t.id !== taskId)
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de la tâche:', error)
      }
    }

    const assignTask = async (taskId, assigneeId) => {
      try {
        const response = await projectManagementService.assignTask(taskId, assigneeId)
        if (response.success) {
          const index = tasks.value.findIndex(t => t.id === taskId)
          if (index !== -1) {
            tasks.value[index].assignee_id = assigneeId
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'attribution de la tâche:', error)
      }
    }

    const uploadFile = async (fileData) => {
      try {
        const response = await projectManagementService.uploadFile(projectId, fileData)
        if (response.success) {
          files.value.push(response.data)
        }
      } catch (error) {
        console.error('Erreur lors du téléchargement du fichier:', error)
      }
    }

    const deleteFile = async (fileId) => {
      try {
        const response = await projectManagementService.deleteFile(fileId)
        if (response.success) {
          files.value = files.value.filter(f => f.id !== fileId)
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du fichier:', error)
      }
    }

    const downloadFile = async (fileId) => {
      try {
        await projectManagementService.downloadFile(fileId)
      } catch (error) {
        console.error('Erreur lors du téléchargement du fichier:', error)
      }
    }

    const inviteProvider = async (providerData) => {
      try {
        const response = await projectManagementService.inviteProvider(projectId, providerData)
        if (response.success) {
          teamMembers.value.push(response.data)
        }
      } catch (error) {
        console.error('Erreur lors de l\'invitation du prestataire:', error)
      }
    }

    const removeMember = async (memberId) => {
      try {
        const response = await projectManagementService.removeMember(projectId, memberId)
        if (response.success) {
          teamMembers.value = teamMembers.value.filter(m => m.id !== memberId)
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du membre:', error)
      }
    }

    const updateRole = async (memberId, role) => {
      try {
        const response = await projectManagementService.updateMemberRole(projectId, memberId, role)
        if (response.success) {
          const index = teamMembers.value.findIndex(m => m.id === memberId)
          if (index !== -1) {
            teamMembers.value[index].role = role
          }
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du rôle:', error)
      }
    }

    onMounted(() => {
      loadProjectData()
    })

    return {
      project,
      tasks,
      files,
      teamMembers,
      availableProviders,
      loading,
      activeTab,
      showEditProjectModal,
      tabs,
      completedTasks,
      pendingTasks,
      recentTasks,
      refreshData,
      goBack,
      editProject,
      updateProject,
      getStatusClass,
      getStatusLabel,
      getPriorityClass,
      getPriorityLabel,
      getProgressClass,
      formatDate,
      formatCurrency,
      createTask,
      editTask,
      deleteTask,
      assignTask,
      uploadFile,
      deleteFile,
      downloadFile,
      inviteProvider,
      removeMember,
      updateRole
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques au composant si nécessaire */
</style>