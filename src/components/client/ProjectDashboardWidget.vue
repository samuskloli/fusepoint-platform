<template>
  <div class="project-dashboard-widget">
    <div class="project-header">
      <div class="project-info">
        <h2>{{ project.nom }}</h2>
        <p v-if="project.description" class="project-description">{{ project.description }}</p>
        <div class="project-meta">
          <span :class="['project-status', `status-${project.statut}`]">
            <i :class="getStatusIcon(project.statut)"></i>
            {{ t(`projects.status.${project.statut}`) }}
          </span>
          <span :class="['project-priority', `priority-${project.priorite}`]">
            <i class="fas fa-flag"></i>
            {{ t(`projects.priority.${project.priorite}`) }}
          </span>
          <span v-if="project.date_fin_prevue" class="project-deadline">
            <i class="fas fa-calendar-alt"></i>
            {{ formatDate(project.date_fin_prevue) }}
          </span>
        </div>
      </div>
      <div class="project-actions">
        <button class="btn btn-outline" @click="toggleWidgetsView">
          <i :class="showAllWidgets ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          {{ showAllWidgets ? t('projects.showActiveWidgets') : t('projects.showAllWidgets') }}
        </button>
        <button class="btn btn-outline" :disabled="loading" @click="refreshProject">
          <i :class="['fas', 'fa-sync', { 'fa-spin': loading }]"></i>
          {{ t('common.refresh') }}
        </button>
      </div>
    </div>

    <div v-if="projectProgress" class="progress-section">
      <div class="progress-header">
        <span class="progress-label">{{ t('projects.progress') }}</span>
        <span class="progress-value">{{ Math.round(projectProgress.percentage) }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${projectProgress.percentage}%` }"></div>
      </div>
      <div class="progress-details">
        {{ t('projects.progressDetails', { completed: projectProgress.completed, total: projectProgress.total }) }}
      </div>
    </div>

    <div v-if="!loading && displayedWidgets.length > 0" class="widgets-container">
      <div v-for="widget in displayedWidgets" :key="widget.id" :class="['widget-wrapper']">
        <div class="widget-header">
          <div class="widget-title">
            <i :class="getWidgetIcon(widget.component_name)"></i>
            <h3>{{ widget.nom }}</h3>
          </div>
          <span v-if="!widget.is_enabled" class="status-badge disabled">{{ t('projects.widgetDisabled') }}</span>
          <span v-else :class="['status-badge', { 'completed': widget.etat === 'completed', 'in-progress': widget.etat === 'in_progress', 'pending': widget.etat === 'pending' }]"></span>
        </div>
        <div class="widget-content">
          <div v-if="!hasWidgetPermission(widget)" class="widget-disabled-message">
            <i class="fas fa-lock"></i>
            {{ t('projects.noPermission') }}
          </div>
          <component v-else :is="getWidgetComponent(widget.component_name)" :project-id="project.id" :widget="widget" @widget-updated="onWidgetUpdated" @widget-error="onWidgetError" />
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>{{ t('common.loading') }}</p>
    </div>

    <div v-else class="empty-state">
      <i class="fas fa-puzzle-piece"></i>
      <h3>{{ t('projects.noWidgets') }}</h3>
      <p>{{ t('projects.noWidgetsDescription') }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import projectTemplateService from '@/services/projectTemplateService'
import { useToast } from '@/composables/useToast'
import { useAuth } from '@/composables/useAuth'

// Import direct des widgets
import ChecklistWidget from '@/components/widgets/ChecklistWidget.vue'
import GoalsWidget from '@/components/widgets/GoalsWidget.vue'
import FilesWidget from '@/components/widgets/FilesWidget.vue'
import CommentsWidget from '@/components/widgets/CommentsWidget.vue'
import AIWidget from '@/components/widgets/AIWidget.vue'
import CalendarWidget from '@/components/widgets/CalendarWidget.vue'
import StatsWidget from '@/components/widgets/StatsWidget.vue'
import TaskListWidget from '@/components/widgets/TaskListWidget.vue'
import TeamWidget from '@/components/widgets/TeamWidget.vue'
import HistoryWidget from '@/components/widgets/HistoryWidget.vue'
import BaseWidget from '@/components/widgets/shared/components/BaseWidget.vue'
import FeedbackWidget from '@/components/widgets/FeedbackWidget.vue'
import FeatureTrackingWidget from '@/components/widgets/FeatureTrackingWidget.vue'
import VersioningWidget from '@/components/widgets/VersioningWidget.vue'
import DeliverablesWidget from '@/components/widgets/DeliverablesWidget.vue'

const widgetComponents = {
  ChecklistWidget,
  GoalsWidget,
  FilesWidget,
  CommentsWidget,
  AIWidget,
  CalendarWidget,
  StatsWidget,
  TaskListWidget,
  TeamWidget,
  HistoryWidget,
  BaseWidget,
  FeedbackWidget,
  FeatureTrackingWidget,
  VersioningWidget,
  DeliverablesWidget,
  // Aliases pour les composants de la base de données
  ProjectOverviewWidget: BaseWidget,
  TasksWidget: TaskListWidget,
  BudgetWidget: BaseWidget,
  DocumentsWidget: FilesWidget,
  NotesWidget: CommentsWidget
}

export default {
  name: 'ProjectDashboardWidget',
  components: {
    ChecklistWidget,
    GoalsWidget,
    FilesWidget,
    CommentsWidget,
    AIWidget,
    CalendarWidget,
    StatsWidget,
    TaskListWidget,
    TeamWidget,
    HistoryWidget,
    BaseWidget,
    FeedbackWidget,
    FeatureTrackingWidget,
    VersioningWidget,
    DeliverablesWidget
  },
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  emits: ['project-updated'],
  setup(props, { emit }) {
    const { t } = useTranslation()
    const { showError, showSuccess } = useToast()
    const { user } = useAuth()
    
    // État réactif
    const loading = ref(false)
    const projectWidgets = ref([])
    const showAllWidgets = ref(false)
    const projectProgress = ref(null)
    const refreshInterval = ref(null)
    
    // Widgets affichés selon le filtre
    const displayedWidgets = computed(() => {
      if (showAllWidgets.value) {
        return projectWidgets.value
      }
      return projectWidgets.value.filter(widget => widget.is_enabled)
    })
    
    // Méthodes utilitaires
    const getWidgetIcon = (componentName) => {
      const iconMap = {
        'ChecklistWidget': 'fas fa-tasks',
        'GoalsWidget': 'fas fa-bullseye',
        'FilesWidget': 'fas fa-folder',
        'CommentsWidget': 'fas fa-comments',
        'AIWidget': 'fas fa-robot',
        'CalendarWidget': 'fas fa-calendar',
        'StatsWidget': 'fas fa-chart-bar',
        'TaskListWidget': 'fas fa-list',
        'TeamWidget': 'fas fa-users',
        'HistoryWidget': 'fas fa-history',
        'BaseWidget': 'fas fa-puzzle-piece',
        'FeedbackWidget': 'fas fa-comment-dots',
        'FeatureTrackingWidget': 'fas fa-road',
        'VersioningWidget': 'fas fa-code-branch',
        // Icônes pour les composants de la base de données
        'ProjectOverviewWidget': 'fas fa-project-diagram',
        'TasksWidget': 'fas fa-tasks',
        'BudgetWidget': 'fas fa-euro-sign',
        'DocumentsWidget': 'fas fa-folder',
        'NotesWidget': 'fas fa-sticky-note'
      }
      return iconMap[componentName] || 'fas fa-puzzle-piece'
    }
    
    const getWidgetComponent = (componentName) => {
      return widgetComponents[componentName] || null
    }
    
    const getStatusIcon = (status) => {
      const iconMap = {
        'pending': 'fas fa-clock',
        'in_progress': 'fas fa-play',
        'completed': 'fas fa-check',
        'on_hold': 'fas fa-pause',
        'cancelled': 'fas fa-times'
      }
      return iconMap[status] || 'fas fa-question'
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    const hasWidgetPermission = (widget) => {
      // Logique de permissions basée sur le rôle utilisateur et les paramètres du widget
      if (user.value?.role === 'agent' || user.value?.role === 'admin' || user.value?.role === 'super_admin') {
        return true
      }
      
      // Pour les clients, vérifier les permissions spécifiques du widget
      // Si aucune permission n'est définie, autoriser par défaut
      if (!widget.permissions || Object.keys(widget.permissions).length === 0) {
        return true
      }
      
      // Vérifier les permissions client
      const clientPermissions = widget.permissions.client || []
      return clientPermissions.includes('read') || clientPermissions.includes('write') || clientPermissions.includes('view')
    }
    
    // Méthodes principales
    const loadProjectWidgets = async () => {
      loading.value = true
      try {
        const result = await projectTemplateService.getProjectWidgets(props.project.id)
        if (result.success) {
          projectWidgets.value = result.data.sort((a, b) => a.ordre_affichage - b.ordre_affichage)
          calculateProgress()
        } else {
          showError(result.error)
        }
      } catch (error) {
        showError(t('projects.loadWidgetsError'))
      } finally {
        loading.value = false
      }
    }
    
    const calculateProgress = () => {
      const enabledWidgets = projectWidgets.value.filter(w => w.is_enabled)
      const completedWidgets = enabledWidgets.filter(w => w.etat === 'completed')
      
      if (enabledWidgets.length === 0) {
        projectProgress.value = null
        return
      }
      
      projectProgress.value = {
        total: enabledWidgets.length,
        completed: completedWidgets.length,
        percentage: (completedWidgets.length / enabledWidgets.length) * 100
      }
    }
    
    const refreshProject = async () => {
      await loadProjectWidgets()
      emit('project-updated')
      showSuccess(t('projects.refreshSuccess'))
    }
    
    const toggleWidgetsView = () => {
      showAllWidgets.value = !showAllWidgets.value
    }
    
    // Gestionnaires d'événements des widgets
    const onWidgetUpdated = (widgetId, newState) => {
      const widget = projectWidgets.value.find(w => w.id === widgetId)
      if (widget) {
        widget.etat = newState
        calculateProgress()
        emit('project-updated')
      }
    }
    
    const onWidgetError = (widgetId, error) => {
      showError(t('widgets.errorMessage', { error }))
    }
    
    // Auto-refresh périodique
    const startAutoRefresh = () => {
      refreshInterval.value = setInterval(() => {
        loadProjectWidgets()
      }, 300000) // Refresh toutes les 5 minutes
    }
    
    const stopAutoRefresh = () => {
      if (refreshInterval.value) {
        clearInterval(refreshInterval.value)
        refreshInterval.value = null
      }
    }
    
    // Cycle de vie
    onMounted(() => {
      loadProjectWidgets()
      startAutoRefresh()
    })
    
    onUnmounted(() => {
      stopAutoRefresh()
    })
    
    return {loading,
      projectWidgets,
      showAllWidgets,
      projectProgress,
      displayedWidgets,
      getWidgetIcon,
      getWidgetComponent,
      getStatusIcon,
      formatDate,
      hasWidgetPermission,
      refreshProject,
      toggleWidgetsView,
      onWidgetUpdated,
      onWidgetError,
      t
    }
  }
}
</script>

<style scoped>
.project-dashboard-widget {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--border-color);
}

.project-info h2 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 1.8rem;
}

.project-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.6;
}

.project-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.project-meta > span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.project-status {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
}

.status-pending { color: var(--warning-color); }
.status-in_progress { color: var(--info-color); }
.status-completed { color: var(--success-color); }
.status-on_hold { color: var(--secondary-color); }
.status-cancelled { color: var(--danger-color); }

.project-priority {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
}

.priority-low { color: var(--success-color); }
.priority-medium { color: var(--warning-color); }
.priority-high { color: var(--danger-color); }

.project-deadline {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.project-actions {
  display: flex;
  gap: 0.5rem;
}

.progress-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-label {
  font-weight: 600;
  color: var(--text-primary);
}

.progress-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary-color);
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: var(--bg-tertiary);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--success-color));
  transition: width 0.3s ease;
}

.progress-details {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.widgets-container {
  display: grid;
  gap: 2rem;
}

.widget-wrapper {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.2s ease;
}

.widget-wrapper:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}



.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-primary);
}

.widget-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.widget-title i {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: white;
  border-radius: 0.5rem;
  font-size: 1.2rem;
}

.widget-title h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.disabled {
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
}

.status-badge.pending {
  background: rgba(var(--warning-color-rgb), 0.1);
  color: var(--warning-color);
}

.status-badge.in-progress {
  background: rgba(var(--info-color-rgb), 0.1);
  color: var(--info-color);
}

.status-badge.completed {
  background: rgba(var(--success-color-rgb), 0.1);
  color: var(--success-color);
}

.widget-content {
  padding: 1.5rem;
}



.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.loading-state i,
.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--text-tertiary);
}

.empty-state h3 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .project-dashboard-widget {
    padding: 1rem;
  }
  
  .project-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .project-actions {
    justify-content: center;
  }
  
  .project-meta {
    justify-content: center;
  }
  
  .widget-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .widget-title {
    justify-content: center;
  }
}
</style>