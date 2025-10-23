<template>
  <RoleLayout>
    <!-- En-tête du projet -->
    <div class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            @click="$router.go(-1)"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Retour
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ project?.name || 'Projet' }}</h1>
            <p class="text-gray-600">{{ project?.description || 'Description du projet' }}</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <span :class="[
            'px-3 py-1 rounded-full text-sm font-medium',
            project?.status === 'active' ? 'bg-green-100 text-green-800' :
            project?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            project?.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          ]">
            {{ getStatusLabel(project?.status) }}
          </span>
          <button
            @click="showProjectSettings = true"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Paramètres
          </button>
        </div>
      </div>
    </div>

    <!-- Onglets -->
    <div class="bg-white border-b border-gray-200">
      <nav class="-mb-px flex space-x-8 px-6">
        <router-link
          v-for="tab in tabs"
          :key="tab.id"
          :to="getTabRoute(tab.id)"
          :class="[
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
            isActiveTab(tab.id)
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon"></path>
          </svg>
          {{ tab.name }}
        </router-link>
      </nav>
    </div>

    <!-- Contenu des onglets -->
    <div class="flex-1 overflow-auto p-6">
      <div v-if="activeTab === 'overview'">
        <OverviewTab 
          :project-id="projectId"
        />
      </div>

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

      <div v-if="activeTab === 'calendar'">
        <CalendarTab 
          :project-id="projectId"
          @create-task="createTask"
          @edit-task="editTask"
        />
      </div>

      <div v-if="activeTab === 'files'">
        <FilesTab :project-id="projectId" />
      </div>

      <div v-if="activeTab === 'team'">
        <TeamTab 
          :project-id="projectId"
          @invite-member="inviteMember"
          @edit-member="editMember"
          @remove-member="removeMember"
        />
      </div>

      <div v-if="activeTab === 'reports'">
        <ReportsTab 
          :project-id="projectId"
        />
      </div>
    </div>

    <!-- Modales -->
    <EditProjectModal 
      v-if="showProjectSettings"
      :project="project"
      @close="showProjectSettings = false"
      @update="updateProject"
    />
  </RoleLayout>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import RoleLayout from '../components/RoleLayout.vue'
import { useAuthStore } from '../stores/auth'
import OverviewTab from '../components/ProjectManagement/OverviewTab.vue'
import TasksTab from '../components/ProjectManagement/TasksTab.vue'
import CalendarTab from '../components/ProjectManagement/CalendarTab.vue'
import TeamTab from '../components/ProjectManagement/TeamTab.vue'
import ReportsTab from '../components/ProjectManagement/ReportsTab.vue'
import EditProjectModal from '../components/ProjectManagement/EditProjectModal.vue'
import projectManagementService from '../services/projectManagementService'
import FilesTab from '../components/ProjectManagement/FilesTab.vue'
import { useProjectsStore } from '../stores/projects'

export default {
  name: 'ProjectDetailDashboard',
  components: {
    RoleLayout,
    OverviewTab,
    TasksTab,
    CalendarTab,
    TeamTab,
    ReportsTab,
    EditProjectModal,
    FilesTab
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    const projectsStore = useProjectsStore()

    const clientId = route.params.clientId || (authStore.user && authStore.user.id)
    const projectId = route.params.projectId || route.params.id
    
    const project = ref(null)
    const tasks = ref([])
    const teamMembers = ref([])
    const recentActivity = ref([])
    const activeTab = ref(route.params.tab || 'overview')
    const showProjectSettings = ref(false)
    
    const tabs = ref([
      { id: 'overview', name: 'Aperçu', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      { id: 'tasks', name: 'Tâches', icon: 'M9 12h6m-6 4h6m-6-8h6M5 6h14M5 6a2 2 0 012-2h10a2 2 0 012 2M5 6v12a2 2 0 002 2h10a2 2 0 002-2V6' },
      { id: 'calendar', name: 'Calendrier', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { id: 'team', name: 'Équipe', icon: 'M17 20h5v-2a4 4 0 00-5-4M12 12a4 4 0 100-8 4 4 0 000 8zm-6 8h12v-2a6 6 0 00-12 0v2z' },
      { id: 'reports', name: 'Rapports', icon: 'M11 17a4 4 0 004-4V5a4 4 0 10-8 0v8a4 4 0 004 4zm-4 0h8' }
    ])
    
    const isActiveTab = (tabId) => (activeTab.value === tabId)
    const getTabRoute = (tabId) => {
      if (route.name === 'ProjectDetailDashboard') {
        return { name: 'ProjectDetailDashboard', params: { clientId, projectId, tab: tabId } }
      }
      return { name: 'ProjectDetails', params: { id: projectId, tab: tabId } }
    }

    const loadProjectData = async () => {
      try {
        // Charger les détails du projet selon le contexte
        if (route.name === 'ProjectDetailDashboard' && clientId) {
          const clientProjectsResponse = await projectManagementService.getClientProjects(clientId)
          if (clientProjectsResponse.success) {
            const foundProject = clientProjectsResponse.data.find(p => p.id == projectId)
            if (foundProject) {
              project.value = foundProject
            }
          }
        }
        
        if (!project.value) {
          const myProjectsResponse = await projectManagementService.getMyProjects()
          if (myProjectsResponse.success) {
            const foundProject = myProjectsResponse.data.find(p => p.id == projectId)
            if (foundProject) {
              project.value = foundProject
            } else {
              project.value = {
                id: projectId,
                name: 'Projet non trouvé',
                description: 'Ce projet n\'existe pas ou vous n\'y avez pas accès',
                status: 'unknown'
              }
            }
          }
        }
        
        // Charger les tâches du projet
        const tasksResponse = await projectManagementService.getProjectTasks(projectId)
        if (tasksResponse.success) {
          tasks.value = tasksResponse.data
        }
        
        // Charger les membres de l'équipe du projet
        const teamResponse = await projectManagementService.getProjectTeamMembers(projectId)
        if (teamResponse.success) {
          teamMembers.value = teamResponse.data
        }
        
        // Activité récente (placeholder)
        recentActivity.value = tasks.value.slice(0, 5).map(task => ({
          id: task.id,
          type: 'task',
          description: `Tâche: ${task.title}`,
          timestamp: task.updated_at || task.created_at,
          user: task.assignee_name || 'Non assigné'
        }))
        
      } catch (error) {
        console.error('Erreur lors du chargement des données du projet:', error)
        project.value = {
          id: projectId,
          name: 'Erreur de chargement',
          description: 'Impossible de charger les données du projet',
          status: 'error'
        }
      }
    }

    const getStatusLabel = (status) => {
      const statusLabels = {
        'active': 'Actif',
        'completed': 'Terminé',
        'on_hold': 'En pause',
        'cancelled': 'Annulé'
      }
      return statusLabels[status] || 'Inconnu'
    }
    
    const createTask = (taskData) => { console.log('Création de tâche:', taskData); loadProjectData() }
    const editTask = (task) => { console.log('Édition de tâche:', task) }
    const deleteTask = (task) => { console.log('Suppression de tâche:', task); loadProjectData() }
    const updateTaskStatus = (task, status) => { console.log('Mise à jour statut tâche:', task, status); loadProjectData() }
    
    const inviteMember = (memberData) => { console.log('Invitation de membre:', memberData); loadProjectData() }
    const editMember = (member) => { console.log('Édition de membre:', member) }
    const removeMember = (member) => { console.log('Suppression de membre:', member); loadProjectData() }
    
    const updateProject = (projectData) => { console.log('Mise à jour du projet:', projectData); showProjectSettings.value = false; loadProjectData() }
    const deleteProject = async () => {
      try {
        if (!project.value?.id) return
        const result = await projectManagementService.deleteProject(project.value.id)
        if (result.success) {
          const targetClientId = project.value?.client_id || clientId
          // Mettre à jour le store et forcer le rafraîchissement des caches
          projectsStore.removeProject(project.value.id)
          await projectsStore.loadAgentProjects(true)
          if (targetClientId) {
            await projectsStore.loadClientProjects(targetClientId, true)
          }
          // Redirection robuste selon disponibilité du client
          const redirectPath = targetClientId ? `/agent/clients/${targetClientId}/projects` : '/agent/projects'
          router.push(redirectPath)
        } else {
          console.error('Erreur lors de la suppression du projet:', result.error)
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error)
      }
    }

    onMounted(() => { loadProjectData() })
    watch(() => route.params.tab, (newTab) => { activeTab.value = newTab || 'overview' })
    watch(() => [route.params.projectId, route.params.id], () => { loadProjectData() })

    return {
      project,
      tasks,
      teamMembers,
      recentActivity,
      activeTab,
      tabs,
      showProjectSettings,
      getStatusLabel,
      createTask,
      editTask,
      deleteTask,
      updateTaskStatus,
      inviteMember,
      editMember,
      removeMember,
      updateProject,
      deleteProject,
      isActiveTab,
      getTabRoute,
      projectId,
      clientId
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>