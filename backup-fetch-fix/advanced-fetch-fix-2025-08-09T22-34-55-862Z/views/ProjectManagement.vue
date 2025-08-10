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
              Retour aux clients
            </button>
            <div class="h-6 w-px bg-gray-300"></div>
            <div v-if="clientInfo">
              <h1 class="text-2xl font-bold text-gray-900">
                Centre de Contrôle - {{ clientInfo.first_name }} {{ clientInfo.last_name }}
              </h1>
              <p class="text-sm text-gray-600">{{ clientInfo.email }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <button 
              @click="showCreateProjectModal = true" 
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Nouveau Projet
            </button>
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
        <div v-if="activeTab === 'overview'">
          <OverviewTab 
            :client-id="clientId"
            :projects="projects" 
            :tasks="tasks"
            :files="files"
            :team-members="teamMembers"
          />
        </div>

        <!-- Onglet Projets -->
        <div v-if="activeTab === 'projects'">
          <ProjectsTab 
            :projects="projects" 
            :loading="loading"
            @edit-project="editProject"
            @delete-project="deleteProject"
            @view-project="viewProject"
            @duplicate-project="duplicateProject"
          />
        </div>

        <!-- Onglet Agenda -->
        <div v-if="activeTab === 'calendar'">
          <CalendarTab 
            :projects="projects"
            :tasks="tasks"
            @create-event="createEvent"
            @edit-event="editEvent"
          />
        </div>

        <!-- Onglet Tâches -->
        <div v-if="activeTab === 'tasks'">
          <TasksTab 
            :tasks="tasks"
            :projects="projects"
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
            :projects="projects"
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
            :projects="projects"
            :tasks="tasks"
            :team-members="teamMembers"
          />
        </div>
      </div>
    </div>

    <!-- Modal de création de projet -->
    <CreateProjectModal 
      v-if="showCreateProjectModal"
      @close="showCreateProjectModal = false"
      @create="createProject"
    />

    <!-- Modal d'édition de projet -->
    <EditProjectModal 
      v-if="showEditProjectModal"
      :project="selectedProject"
      @close="showEditProjectModal = false"
      @update="updateProject"
    />

    <!-- Modal de confirmation de suppression -->
    <ConfirmDeleteModal 
      v-if="showDeleteModal"
      :item="itemToDelete"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AgentSidebar from '../components/AgentSidebar.vue'
import OverviewTab from '../components/ProjectManagement/OverviewTab.vue'
import ProjectsTab from '../components/ProjectManagement/ProjectsTab.vue'
import CalendarTab from '../components/ProjectManagement/CalendarTab.vue'
import TasksTab from '../components/ProjectManagement/TasksTab.vue'
import FilesTab from '../components/ProjectManagement/FilesTab.vue'
import TeamTab from '../components/ProjectManagement/TeamTab.vue'
import ReportsTab from '../components/ProjectManagement/ReportsTab.vue'
import CreateProjectModal from '../components/modals/CreateProjectModal.vue'
import EditProjectModal from '../components/ProjectManagement/EditProjectModal.vue'
import ConfirmDeleteModal from '../components/ProjectManagement/ConfirmDeleteModal.vue'
import projectManagementService, { clientProjectService } from '../services/projectManagementService'

export default {
  name: 'ProjectManagement',
  components: {
    AgentSidebar,
    OverviewTab,
    ProjectsTab,
    CalendarTab,
    TasksTab,
    FilesTab,
    TeamTab,
    ReportsTab,
    CreateProjectModal,
    EditProjectModal,
    ConfirmDeleteModal
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const clientId = route.params.clientId
    
    const clientInfo = ref(null)
    const projects = ref([])
    const tasks = ref([])
    const files = ref([])
    const teamMembers = ref([])
    const availableProviders = ref([])
    const loading = ref(false)
    const activeTab = ref('overview')
    
    const showCreateProjectModal = ref(false)
    const showEditProjectModal = ref(false)
    const showDeleteModal = ref(false)
    const selectedProject = ref(null)
    const itemToDelete = ref(null)

    const tabs = [
      { id: 'overview', name: 'Vue d\'ensemble', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      { id: 'projects', name: 'Projets', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      { id: 'calendar', name: 'Agenda', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { id: 'tasks', name: 'Tâches', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
      { id: 'files', name: 'Fichiers', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { id: 'team', name: 'Équipe', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
      { id: 'reports', name: 'Rapports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
    ]

    const loadClientData = async () => {
      try {
        loading.value = true
        
        // Vérifier que clientId existe
        if (!clientId) {
          console.error('ClientId manquant dans les paramètres de route')
          router.push('/agent/projects')
          return
        }
        
        console.log('Chargement des données pour le client:', clientId)
        
        // Récupérer les informations du client
        const clientsResponse = await projectManagementService.getAssignedClients()
        if (clientsResponse.success) {
          clientInfo.value = clientsResponse.data.find(client => client.id == clientId)
        }
        
        // Récupérer les projets du client
        const projectsResponse = await clientProjectService.getClientProjects(clientId)
        if (projectsResponse.success) {
          projects.value = projectsResponse.data
        }

        // Récupérer les tâches
        const tasksResponse = await projectManagementService.getTasks(clientId)
        if (tasksResponse.success) {
          tasks.value = tasksResponse.data
        }

        // Récupérer les fichiers
        const filesResponse = await projectManagementService.getFiles(clientId)
        if (filesResponse.success) {
          files.value = filesResponse.data
        }

        // Récupérer les membres de l'équipe
        const teamResponse = await projectManagementService.getTeamMembers(clientId)
        if (teamResponse.success) {
          teamMembers.value = teamResponse.data
        }

        // Récupérer les prestataires disponibles
        const providersResponse = await projectManagementService.getAvailableProviders()
        if (providersResponse.success) {
          availableProviders.value = providersResponse.data
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
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

    // Gestion des projets
    const createProject = async (projectData) => {
      try {
        const response = await projectManagementService.createProject(clientId, projectData)
        if (response.success) {
          projects.value.push(response.data)
          showCreateProjectModal.value = false
        }
      } catch (error) {
        console.error('Erreur lors de la création du projet:', error)
      }
    }

    const editProject = (project) => {
      selectedProject.value = project
      showEditProjectModal.value = true
    }

    const updateProject = async (projectData) => {
      try {
        const response = await projectManagementService.updateProject(selectedProject.value.id, projectData)
        if (response.success) {
          const index = projects.value.findIndex(p => p.id === selectedProject.value.id)
          if (index !== -1) {
            projects.value[index] = response.data
          }
          showEditProjectModal.value = false
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du projet:', error)
      }
    }

    const deleteProject = (project) => {
      itemToDelete.value = { type: 'project', item: project }
      showDeleteModal.value = true
    }

    const duplicateProject = async (project) => {
      try {
        const response = await projectManagementService.duplicateProject(project.id)
        if (response.success) {
          projects.value.push(response.data)
        }
      } catch (error) {
        console.error('Erreur lors de la duplication du projet:', error)
      }
    }

    const viewProject = (project) => {
      router.push(`/agent/clients/${clientId}/projects/${project.id}`)
    }

    // Gestion des tâches
    const createTask = async (taskData) => {
      try {
        const response = await projectManagementService.createTask(clientId, taskData)
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

    const deleteTask = (task) => {
      itemToDelete.value = { type: 'task', item: task }
      showDeleteModal.value = true
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

    // Gestion des fichiers
    const uploadFile = async (fileData) => {
      try {
        const response = await projectManagementService.uploadFile(clientId, fileData)
        if (response.success) {
          files.value.push(response.data)
        }
      } catch (error) {
        console.error('Erreur lors du téléchargement du fichier:', error)
      }
    }

    const deleteFile = (file) => {
      itemToDelete.value = { type: 'file', item: file }
      showDeleteModal.value = true
    }

    const downloadFile = async (fileId) => {
      try {
        await projectManagementService.downloadFile(fileId)
      } catch (error) {
        console.error('Erreur lors du téléchargement du fichier:', error)
      }
    }

    // Gestion de l'équipe
    const inviteProvider = async (providerData) => {
      try {
        const response = await projectManagementService.inviteProvider(clientId, providerData)
        if (response.success) {
          teamMembers.value.push(response.data)
        }
      } catch (error) {
        console.error('Erreur lors de l\'invitation du prestataire:', error)
      }
    }

    const removeMember = (member) => {
      itemToDelete.value = { type: 'member', item: member }
      showDeleteModal.value = true
    }

    const updateRole = async (memberId, newRole) => {
      try {
        const response = await projectManagementService.updateMemberRole(memberId, newRole)
        if (response.success) {
          const index = teamMembers.value.findIndex(m => m.id === memberId)
          if (index !== -1) {
            teamMembers.value[index].role = newRole
          }
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du rôle:', error)
      }
    }

    // Gestion des événements du calendrier
    const createEvent = async (eventData) => {
      try {
        const response = await projectManagementService.createEvent(clientId, eventData)
        if (response.success) {
          // Actualiser les données
          refreshData()
        }
      } catch (error) {
        console.error('Erreur lors de la création de l\'événement:', error)
      }
    }

    const editEvent = async (eventId, eventData) => {
      try {
        const response = await projectManagementService.updateEvent(eventId, eventData)
        if (response.success) {
          // Actualiser les données
          refreshData()
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'événement:', error)
      }
    }

    // Confirmation de suppression
    const confirmDelete = async () => {
      try {
        const { type, item } = itemToDelete.value
        let response

        switch (type) {
          case 'project':
            response = await projectManagementService.deleteProject(item.id)
            if (response.success) {
              projects.value = projects.value.filter(p => p.id !== item.id)
            }
            break
          case 'task':
            response = await projectManagementService.deleteTask(item.id)
            if (response.success) {
              tasks.value = tasks.value.filter(t => t.id !== item.id)
            }
            break
          case 'file':
            response = await projectManagementService.deleteFile(item.id)
            if (response.success) {
              files.value = files.value.filter(f => f.id !== item.id)
            }
            break
          case 'member':
            response = await projectManagementService.removeMember(item.id)
            if (response.success) {
              teamMembers.value = teamMembers.value.filter(m => m.id !== item.id)
            }
            break
        }

        showDeleteModal.value = false
        itemToDelete.value = null
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }

    onMounted(() => {
      loadClientData()
    })

    return {
      clientInfo,
      projects,
      tasks,
      files,
      teamMembers,
      availableProviders,
      loading,
      activeTab,
      tabs,
      showCreateProjectModal,
      showEditProjectModal,
      showDeleteModal,
      selectedProject,
      itemToDelete,
      refreshData,
      goBack,
      createProject,
      editProject,
      updateProject,
      deleteProject,
      duplicateProject,
      viewProject,
      createTask,
      editTask,
      deleteTask,
      assignTask,
      uploadFile,
      deleteFile,
      downloadFile,
      inviteProvider,
      removeMember,
      updateRole,
      createEvent,
      editEvent,
      confirmDelete
    }
  }
}
</script>

<style scoped>
/* Styles personnalisés si nécessaire */
</style>