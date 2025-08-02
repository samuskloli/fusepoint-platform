<template>
  <div class="overview-dashboard">
    <!-- Statistiques principales -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon projects">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ dashboardData.totalProjects }}</h3>
          <p class="stat-label">Projets Total</p>
          <span class="stat-change positive">{{ dashboardData.activeProjects }} actifs</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon tasks">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
          </svg>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ dashboardData.totalTasks }}</h3>
          <p class="stat-label">Tâches Total</p>
          <span class="stat-change" :class="dashboardData.pendingTasks > 0 ? 'warning' : 'positive'">
            {{ dashboardData.pendingTasks }} en attente
          </span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon team">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
          </svg>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ dashboardData.teamMembers }}</h3>
          <p class="stat-label">Membres Équipe</p>
          <span class="stat-change positive">{{ dashboardData.activeMembers }} actifs</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon files">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ dashboardData.totalFiles }}</h3>
          <p class="stat-label">Fichiers</p>
          <span class="stat-change neutral">{{ formatFileSize(dashboardData.totalFileSize) }}</span>
        </div>
      </div>
    </div>

    <!-- Graphiques et informations détaillées -->
    <div class="dashboard-grid">
      <!-- Progression des projets -->
      <div class="dashboard-card">
        <div class="card-header">
          <h3 class="card-title">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Progression des Projets
          </h3>
        </div>
        <div class="card-content">
          <div class="progress-list">
            <div v-for="project in recentProjects" :key="project.id" class="progress-item">
              <div class="progress-info">
                <h4 class="progress-title">{{ project.title }}</h4>
                <p class="progress-status" :class="getStatusClass(project.status)">{{ getStatusLabel(project.status) }}</p>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: project.progress + '%' }"></div>
                </div>
                <span class="progress-percentage">{{ project.progress }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions récentes -->
      <div class="dashboard-card">
        <div class="card-header">
          <h3 class="card-title">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Actions Récentes
          </h3>
        </div>
        <div class="card-content">
          <div class="activity-list">
            <div v-for="action in recentActions" :key="action.id" class="activity-item">
              <div class="activity-icon" :class="getActionIconClass(action.type)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getActionIcon(action.type)"></path>
                </svg>
              </div>
              <div class="activity-content">
                <p class="activity-title">{{ action.title }}</p>
                <p class="activity-time">{{ formatRelativeTime(action.timestamp) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tâches prioritaires -->
      <div class="dashboard-card">
        <div class="card-header">
          <h3 class="card-title">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Tâches Prioritaires
          </h3>
        </div>
        <div class="card-content">
          <div class="task-list">
            <div v-for="task in priorityTasks" :key="task.id" class="task-item">
              <div class="task-priority" :class="getPriorityClass(task.priority)"></div>
              <div class="task-content">
                <h4 class="task-title">{{ task.title }}</h4>
                <p class="task-project">{{ task.project_title }}</p>
                <p class="task-due">Échéance: {{ formatDate(task.due_date) }}</p>
              </div>
              <div class="task-assignee" v-if="task.assignee">
                <div class="assignee-avatar">{{ getInitials(task.assignee) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Prochaines échéances -->
      <div class="dashboard-card">
        <div class="card-header">
          <h3 class="card-title">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Prochaines Échéances
          </h3>
        </div>
        <div class="card-content">
          <div class="deadline-list">
            <div v-for="deadline in upcomingDeadlines" :key="deadline.id" class="deadline-item">
              <div class="deadline-date">
                <span class="deadline-day">{{ formatDay(deadline.date) }}</span>
                <span class="deadline-month">{{ formatMonth(deadline.date) }}</span>
              </div>
              <div class="deadline-content">
                <h4 class="deadline-title">{{ deadline.title }}</h4>
                <p class="deadline-project">{{ deadline.project_title }}</p>
                <span class="deadline-urgency" :class="getUrgencyClass(deadline.urgency)">{{ deadline.urgency }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { clientProjectService } from '../../services/clientProjectService'
import { projectManagementService } from '../../services/projectManagementService'

const props = defineProps({
  clientId: {
    type: [String, Number],
    required: true
  },
  projects: {
    type: Array,
    default: () => []
  },
  tasks: {
    type: Array,
    default: () => []
  },
  files: {
    type: Array,
    default: () => []
  },
  teamMembers: {
    type: Array,
    default: () => []
  }
})

// Données réactives pour les statistiques
const dashboardData = ref({
  totalProjects: 0,
  activeProjects: 0,
  totalTasks: 0,
  pendingTasks: 0,
  teamMembers: 0,
  activeMembers: 0,
  totalFiles: 0,
  totalFileSize: 0
})

const loading = ref(false)
const projectStats = ref(null)

// Variables réactives pour les actions récentes et échéances
const recentActions = ref([])
const upcomingDeadlines = ref([])

// Fonctions pour charger les données
const loadDashboardData = async () => {
  try {
    loading.value = true
    
    // Charger les données du tableau de bord depuis le service client
    const clientData = await clientProjectService.getDashboardData(props.clientId)
    
    // Charger les statistiques du projet depuis le service de gestion de projet
    const stats = await projectManagementService.getProjectStats(props.clientId)
    projectStats.value = stats
    
    // Mettre à jour les données du tableau de bord
    dashboardData.value = {
      totalProjects: stats?.projects?.total || props.projects.length,
      activeProjects: stats?.projects?.active || props.projects.filter(p => p.status === 'en_cours').length,
      totalTasks: stats?.tasks?.total || props.tasks.length,
      pendingTasks: stats?.tasks?.pending || props.tasks.filter(t => t.status === 'pending' || t.status === 'pending_validation').length,
      teamMembers: stats?.team?.total_members || props.teamMembers.length,
      activeMembers: stats?.team?.active_members || props.teamMembers.filter(m => m.status === 'active').length,
      totalFiles: stats?.files?.total || props.files.length,
      totalFileSize: stats?.files?.total_size || props.files.reduce((total, file) => total + (file.size || 0), 0)
    }
    
    // Mettre à jour les actions récentes
    recentActions.value = clientData?.actions || props.projects.slice(0, 5).map(project => ({
      id: project.id,
      type: 'project',
      title: `Mise à jour du projet "${project.title}"`,
      timestamp: project.updated_at || project.created_at
    }))
    
    // Mettre à jour les échéances
    upcomingDeadlines.value = clientData?.deadlines || props.projects
      .filter(p => p.end_date && new Date(p.end_date) > new Date())
      .slice(0, 5)
      .map(project => ({
        id: project.id,
        title: project.title,
        project_title: project.title,
        date: project.end_date,
        urgency: project.priority || 'Normal'
      }))
    
  } catch (error) {
    console.error('Erreur lors du chargement des données du tableau de bord:', error)
    // Utiliser les données des props en cas d'erreur
    dashboardData.value = {
      totalProjects: props.projects.length,
      activeProjects: props.projects.filter(p => p.status === 'en_cours').length,
      totalTasks: props.tasks.length,
      pendingTasks: props.tasks.filter(t => t.status === 'pending' || t.status === 'pending_validation').length,
      teamMembers: props.teamMembers.length,
      activeMembers: props.teamMembers.filter(m => m.status === 'active').length,
      totalFiles: props.files.length,
      totalFileSize: props.files.reduce((total, file) => total + (file.size || 0), 0)
    }
    
    recentActions.value = []
    upcomingDeadlines.value = []
  } finally {
    loading.value = false
  }
}

// Données calculées
    const recentProjects = computed(() => {
      return props.projects
        .filter(p => p.status !== 'completed')
        .slice(0, 5)
        .map(p => ({
          ...p,
          progress: p.progress || Math.floor(Math.random() * 100) // Fallback si pas de progress
        }))
    })
    
    const priorityTasks = computed(() => {
      return props.tasks
        .filter(t => t.priority === 'high' || t.status === 'urgent')
        .slice(0, 5)
        .map(t => ({
          ...t,
          priority: t.priority || 'medium'
        }))
    })
    
    // Méthodes utilitaires
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    const formatDate = (date) => {
      if (!date) return 'Non définie'
      return new Date(date).toLocaleDateString('fr-FR')
    }
    
    const formatDay = (date) => {
      return new Date(date).getDate()
    }
    
    const formatMonth = (date) => {
      return new Date(date).toLocaleDateString('fr-FR', { month: 'short' })
    }
    
    const formatRelativeTime = (timestamp) => {
      const now = new Date()
      const time = new Date(timestamp)
      const diff = now - time
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)
      
      if (minutes < 60) return `Il y a ${minutes} min`
      if (hours < 24) return `Il y a ${hours}h`
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`
    }
    
    const getInitials = (name) => {
      if (!name) return '?'
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    
    const getStatusClass = (status) => {
      const classes = {
        'en_cours': 'status-active',
        'completed': 'status-completed',
        'en_pause': 'status-paused',
        'en_validation': 'status-validation'
      }
      return classes[status] || 'status-default'
    }
    
    const getStatusLabel = (status) => {
      const labels = {
        'en_cours': 'En cours',
        'completed': 'Terminé',
        'en_pause': 'En pause',
        'en_validation': 'En validation'
      }
      return labels[status] || status
    }
    
    const getPriorityClass = (priority) => {
      const classes = {
        'high': 'priority-high',
        'medium': 'priority-medium',
        'low': 'priority-low'
      }
      return classes[priority] || 'priority-medium'
    }
    
    const getUrgencyClass = (urgency) => {
      const classes = {
        'Urgent': 'urgency-urgent',
        'High': 'urgency-high',
        'Normal': 'urgency-normal'
      }
      return classes[urgency] || 'urgency-normal'
    }
    
    const getActionIconClass = (type) => {
      const classes = {
        'project': 'action-project',
        'task': 'action-task',
        'file': 'action-file',
        'team': 'action-team'
      }
      return classes[type] || 'action-default'
    }
    
    const getActionIcon = (type) => {
      const icons = {
        'project': 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
        'task': 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
        'file': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        'team': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
      }
      return icons[type] || 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    }
    

    
onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.overview-dashboard {
  padding: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.projects {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-icon.tasks {
  background: linear-gradient(135deg, #10b981, #047857);
}

.stat-icon.team {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.stat-icon.files {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0.5rem 0;
  font-weight: 500;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  display: inline-block;
}

.stat-change.positive {
  background: #dcfce7;
  color: #166534;
}

.stat-change.warning {
  background: #fef3c7;
  color: #92400e;
}

.stat-change.neutral {
  background: #f3f4f6;
  color: #374151;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.dashboard-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.card-header {
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  margin: 0;
  padding-bottom: 1rem;
}

.card-content {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

/* Progress List */
.progress-list {
  space-y: 1rem;
}

.progress-item {
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-title {
  font-weight: 600;
  color: #111827;
  margin: 0;
  font-size: 0.875rem;
}

.progress-status {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  margin: 0;
}

.status-active {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-completed {
  background: #dcfce7;
  color: #166534;
}

.status-paused {
  background: #fef3c7;
  color: #92400e;
}

.status-validation {
  background: #e0e7ff;
  color: #3730a3;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  transition: width 0.3s ease;
}

.progress-percentage {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  min-width: 2.5rem;
  text-align: right;
}

/* Activity List */
.activity-list {
  space-y: 0.75rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.action-project {
  background: #3b82f6;
}

.action-task {
  background: #10b981;
}

.action-file {
  background: #f59e0b;
}

.action-team {
  background: #8b5cf6;
}

.action-default {
  background: #6b7280;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  margin: 0;
}

.activity-time {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

/* Task List */
.task-list {
  space-y: 0.75rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.task-priority {
  width: 4px;
  height: 40px;
  border-radius: 2px;
}

.priority-high {
  background: #ef4444;
}

.priority-medium {
  background: #f59e0b;
}

.priority-low {
  background: #10b981;
}

.task-content {
  flex: 1;
}

.task-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.task-project {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
}

.task-due {
  font-size: 0.75rem;
  color: #374151;
  margin: 0;
}

.task-assignee {
  display: flex;
  align-items: center;
}

.assignee-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Deadline List */
.deadline-list {
  space-y: 0.75rem;
}

.deadline-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.deadline-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #f3f4f6;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
}

.deadline-day {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.deadline-month {
  font-size: 0.625rem;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 600;
}

.deadline-content {
  flex: 1;
}

.deadline-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.deadline-project {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
}

.deadline-urgency {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
}

.urgency-urgent {
  background: #fecaca;
  color: #dc2626;
}

.urgency-high {
  background: #fed7aa;
  color: #ea580c;
}

.urgency-normal {
  background: #e5e7eb;
  color: #374151;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .card-header {
    padding: 1rem 1rem 0 1rem;
  }
  
  .card-content {
    padding: 0 1rem 1rem 1rem;
  }
}
</style>