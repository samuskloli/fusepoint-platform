<template>
  <div class="project-dashboard-widget">
    <div class="project-header">
      <div class="project-info">
        <h2>{{ project?.title || project?.name || t('projects.project') }}</h2>
        <p class="project-description" v-if="project?.description">{{ project.description }}</p>
        <div class="project-meta">
          <span class="project-status">
            <i class="fas fa-circle status-indicator" :class="{
              'status-pending': project?.status === 'pending',
              'status-in-progress': project?.status === 'in_progress',
              'status-completed': project?.status === 'completed',
              'status-on-hold': project?.status === 'on_hold',
              'status-cancelled': project?.status === 'cancelled'
            }"></i>
            {{ t(`projects.status.${project?.status || 'unknown'}`) }}
          </span>
          <span class="project-dates" v-if="project?.startDate || project?.endDate">
            <i class="fas fa-calendar"></i>
            {{ formatDate(project?.startDate) }} → {{ formatDate(project?.endDate) }}
          </span>
          <span class="project-widgets">
            <i class="fas fa-puzzle-piece"></i>
            {{ t('projects.widgetsCount', { count: projectWidgets.length }) }}
          </span>
        </div>
      </div>
      <div class="project-actions">
        <button class="btn btn-primary" @click="refreshProject">
          <i class="fas fa-sync-alt"></i>
          {{ t('actions.refresh') }}
        </button>
        <button class="btn btn-secondary" @click="toggleWidgetsView">
          <i :class="showAllWidgets ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          {{ showAllWidgets ? t('projects.hideDisabled') : t('projects.showAll') }}
        </button>
      </div>
    </div>

    <div v-if="displayedWidgets.length" class="widgets-grid">
      <div v-for="widget in displayedWidgets" :key="widget.id" class="widget-card" :class="{ 'widget-disabled': !widget.is_enabled }">
        <div class="widget-header">
          <div class="widget-title">
            <i :class="getWidgetIcon(widget.component_name)" class="widget-icon"></i>
            <span>{{ widget.name || t('widgets.widget') }}</span>
          </div>
          <span class="widget-status" :class="`status-${widget.etat || 'unknown'}`">
            <i :class="getStatusIcon(widget.etat)"></i>
            {{ t(`widgets.status.${widget.etat || 'unknown'}`) }}
          </span>
        </div>
        
        <div class="widget-content">
          <div v-if="!hasWidgetPermission(widget)" class="no-permission">
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
import { componentNameToIcon } from '@/utils/widgetsMap'

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
import WidgetCard from '@/components/widgets/WidgetCard.vue'
import ProjectOverviewWidget from '@/components/widgets/ProjectOverviewWidget.vue'
import TasksWidget from '@/components/widgets/project-management/tasks/TasksWidget.vue'
import BudgetWidget from '@/components/widgets/BudgetWidget.vue'

import NotesWidget from '@/components/widgets/NotesWidget.vue'

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
  WidgetCard,
  ProjectOverviewWidget,
  TasksWidget,
  BudgetWidget,

  NotesWidget
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
    DeliverablesWidget,
    WidgetCard,
    ProjectOverviewWidget,
    TasksWidget,
    BudgetWidget,

    NotesWidget
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
    const getWidgetIcon = (componentName) => componentNameToIcon(componentName)
    
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

.project-dates {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
}

.project-widgets {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
}

.status-indicator {
  font-size: 0.6rem;
}

.status-pending { color: #f59e0b; }
.status-in-progress { color: #3b82f6; }
.status-completed { color: #10b981; }
.status-on-hold { color: #6b7280; }
.status-cancelled { color: #ef4444; }

.project-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  cursor: pointer;
}

.btn-primary {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.btn-secondary {
  background: var(--bg-secondary);
}

.widgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.widget-card {
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  overflow: hidden;
}

.widget-card.widget-disabled {
  opacity: 0.7;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
}

.widget-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.widget-icon {
  color: var(--primary);
}

.widget-content {
  padding: 1rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 2rem;
  color: var(--primary);
}
</style>