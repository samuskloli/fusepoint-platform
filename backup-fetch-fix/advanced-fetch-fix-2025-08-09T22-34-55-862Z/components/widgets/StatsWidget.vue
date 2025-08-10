<template>
  <BaseWidget 
    :widget="widgetConfig=loading=error='showConfigModal = true=toggleWidget="loadStats="stats-widget=stats-grid='stat-card"stat-icon="stat.iconClass=stat.icon='stat-content="stat-value=stat-label="stat-change='stat.changeClass=stat.change="stat.changeIcon="progress-section=showProgress='section-title="progress-container=progress-bar="progress-fill='{ width: `${projectProgress}%` }
            ></div>
          </div>
          <span  class="progress-text=progress-details='progress-item="progress-dot completed=progress-item="progress-dot pending='progress-item=progress-dot overdue="chart-section="showChart=section-title='chart-container="chartCanvas=200" height="200'></canvas>
        </div>
        
        <div class="chart-legend=legend-item item in chartData=item.label=legend-color class='{ backgroundColor: item.color }"></div>
            <span  class="legend-label=legend-value='time-stats="showTimeStats=section-title="time-grid='time-stat"time-stat=time-value="time-label='time-stat=time-value="time-label="quick-actions=showActions='exportStats="action-btn=fas fa-download mr-2></i>
          {{ t('common.export="refreshStats=action-btn='fas fa-sync-alt mr-2"></i>
          {{ t('common.refresh="showConfigModal=widgetConfig='configOptions="showConfigModal = false=updateConfig"
    />
  </BaseWidget>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import BaseWidget from './BaseWidget.vue'
import WidgetConfigModal from '../modals/WidgetConfigModal.vue'
import projectManagementService from '@/services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'

export default {
  name: 'StatsWidget',
  components: {
    BaseWidget,
    WidgetConfigModal
  },
  props: {
    projectId: {
      type: [String, Number],
      required: true
    },
    widgetData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update-widget'],
  setup(props, { emit }) {
    const { success, error: showError } = useNotifications()
    const { t } = useTranslation()
    
    // État réactif
    const loading = ref(false)
    const error = ref(null)
    const projectData = ref({})
    const tasks = ref([])
    const showConfigModal = ref(false)
    const chartCanvas = ref(null)
    
    // Configuration du widget
    const widgetConfig = ref({
      id: 'stats',
      name: 'Statistiques',
      icon: 'fas fa-chart-bar',
      titleKey: 'widgets.stats.title',
      isEnabled: true,
      showProgress: true,
      showChart: true,
      showTimeStats: true,
      showActions: true,
      ...props.widgetData
    })
    
    // Options de configuration
    const configOptions = ref([
      {
        key: 'showProgress',
        type: 'boolean',
        label: 'Afficher la progression',
        default: true
      },
      {
        key: 'showChart',
        type: 'boolean',
        label: 'Afficher le graphique',
        default: true
      },
      {
        key: 'showTimeStats',
        type: 'boolean',
        label: 'Afficher les métriques temporelles',
        default: true
      },
      {
        key: 'showActions',
        type: 'boolean',
        label: 'Afficher les actions rapides',
        default: true
      }
    ])
    
    // Propriétés calculées
    const showProgress = computed(() => widgetConfig.value.showProgress)
    const showChart = computed(() => widgetConfig.value.showChart)
    const showTimeStats = computed(() => widgetConfig.value.showTimeStats)
    const showActions = computed(() => widgetConfig.value.showActions)
    
    const completedTasks = computed(() => 
      tasks.value.filter(task => task.status === 'completed').length
    )
    
    const pendingTasks = computed(() => 
      tasks.value.filter(task => task.status === 'pending').length
    )
    
    const overdueTasks = computed(() => 
      tasks.value.filter(task => {
        if (!task.due_date || task.status === 'completed') return false
        return new Date(task.due_date) < new Date()
      }).length
    )
    
    const projectProgress = computed(() => {
      if (tasks.value.length === 0) return 0
      return Math.round((completedTasks.value / tasks.value.length) * 100)
    })
    
    const mainStats = computed(() => [
      {
        key: 'total-tasks',
        value: tasks.value.length,
        labelKey: 'widgets.stats.tasks',
        icon: 'fas fa-tasks',
        iconClass: 'stat-icon-blue'
      },
      {
        key: 'completed',
        value: completedTasks.value,
        labelKey: 'widgets.stats.completed',
        icon: 'fas fa-check-circle',
        iconClass: 'stat-icon-green',
        change: `+${Math.round((completedTasks.value / tasks.value.length) * 100) || 0}%`,
        changeClass: 'stat-positive',
        changeIcon: 'fas fa-arrow-up'
      },
      {
        key: 'pending',
        value: pendingTasks.value,
        labelKey: 'widgets.stats.pending',
        icon: 'fas fa-clock',
        iconClass: 'stat-icon-yellow'
      },
      {
        key: 'overdue',
        value: overdueTasks.value,
        labelKey: 'widgets.stats.overdue',
        icon: 'fas fa-exclamation-triangle',
        iconClass: 'stat-icon-red',
        change: overdueTasks.value > 0 ? `${overdueTasks.value}` : null,
        changeClass: 'stat-negative',
        changeIcon: 'fas fa-arrow-down'
      }
    ])
    
    const chartData = computed(() => [
      {
        label: t('widgets.stats.completed'),
        value: completedTasks.value,
        color: '#10B981'
      },
      {
        label: t('widgets.stats.pending'),
        value: pendingTasks.value,
        color: '#F59E0B'
      },
      {
        label: t('widgets.stats.overdue'),
        value: overdueTasks.value,
        color: '#EF4444'
      }
    ])
    
    const daysRemaining = computed(() => {
      if (!projectData.value.end_date) return '-'
      const endDate = new Date(projectData.value.end_date)
      const today = new Date()
      const diffTime = endDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 ? diffDays : 0
    })
    
    const averageTaskTime = computed(() => {
      const completedTasksWithTime = tasks.value.filter(task => 
        task.status === 'completed' && task.completed_at && task.created_at
      )
      
      if (completedTasksWithTime.length === 0) return '-'
      
      const totalTime = completedTasksWithTime.reduce((sum, task) => {
        const created = new Date(task.created_at)
        const completed = new Date(task.completed_at)
        return sum + (completed - created)
      }, 0)
      
      const avgTime = totalTime / completedTasksWithTime.length
      const days = Math.round(avgTime / (1000 * 60 * 60 * 24))
      return `${days}j`
    })
    
    const projectDuration = computed(() => {
      if (!projectData.value.start_date || !projectData.value.end_date) return '-'
      
      const startDate = new Date(projectData.value.start_date)
      const endDate = new Date(projectData.value.end_date)
      const diffTime = endDate - startDate
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return `${diffDays}j`
    })
    
    // Méthodes
    const loadStats = async () => {
      loading.value = true
      error.value = null
      
      try {
        // Charger les données du projet
        const projectResult = await projectManagementService.getProjectDetails(props.projectId)
        if (projectResult.success) {
          projectData.value = projectResult.data
        }
        
        // Charger les tâches
        const tasksResult = await projectManagementService.getProjectTasks(props.projectId)
        if (tasksResult.success) {
          tasks.value = tasksResult.data
        }
        
        // Dessiner le graphique après le prochain tick
        await nextTick()
        if (showChart.value) {
          drawChart()
        }
      } catch (err) {
        error.value = t('errors.loadingFailed')
      } finally {
        loading.value = false
      }
    }
    
    const drawChart = () => {
      if (!chartCanvas.value) return
      
      const canvas = chartCanvas.value
      const ctx = canvas.getContext('2d')
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = 80
      
      // Effacer le canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const total = tasks.value.length
      if (total === 0) {
        // Dessiner un cercle gris si pas de données
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
        ctx.fillStyle = '#E5E7EB'
        ctx.fill()
        return
      }
      
      let currentAngle = -Math.PI / 2 // Commencer en haut
      
      chartData.value.forEach(item => {
        if (item.value > 0) {
          const sliceAngle = (item.value / total) * 2 * Math.PI
          
          ctx.beginPath()
          ctx.moveTo(centerX, centerY)
          ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
          ctx.closePath()
          ctx.fillStyle = item.color
          ctx.fill()
          
          currentAngle += sliceAngle
        }
      })
    }
    
    const refreshStats = () => {
      loadStats()
      success(t('widgets.stats.refreshed'))
    }
    
    const exportStats = () => {
      const data = {
        project: projectData.value,
        stats: {
          totalTasks: tasks.value.length,
          completed: completedTasks.value,
          pending: pendingTasks.value,
          overdue: overdueTasks.value,
          progress: projectProgress.value
        },
        exportDate: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `project-stats-${props.projectId}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      success(t('widgets.stats.exported'))
    }
    
    const toggleWidget = () => {
      widgetConfig.value.isEnabled = !widgetConfig.value.isEnabled
      emit('update-widget', widgetConfig.value)
    }
    
    const updateConfig = (newConfig) => {
      widgetConfig.value = { ...widgetConfig.value, ...newConfig }
      emit('update-widget', widgetConfig.value)
      showConfigModal.value = false
      
      // Redessiner le graphique si nécessaire
      if (newConfig.showChart) {
        nextTick(() => drawChart())
      }
    }
    
    // Watchers
    watch(() => props.projectId, loadStats, { immediate: true })
    watch(() => tasks.value.length, () => {
      if (showChart.value) {
        nextTick(() => drawChart())
      }
    })
    
    onMounted(() => {
      loadStats()
    })
    
    return {
      loading,
      error,
      showConfigModal,
      chartCanvas,
      widgetConfig,
      configOptions,
      showProgress,
      showChart,
      showTimeStats,
      showActions,
      completedTasks,
      pendingTasks,
      overdueTasks,
      projectProgress,
      mainStats,
      chartData,
      daysRemaining,
      averageTaskTime,
      projectDuration,
      loadStats,
      refreshStats,
      exportStats,
      toggleWidget,
      updateConfig,
      t
    }
  }
}
</script>

<style scoped>
.stats-widget {
  @apply space-y-6;
}

.stats-grid {
  @apply grid grid-cols-2 gap-4;
}

.stat-card {
  @apply bg-gray-50 rounded-lg p-4 flex items-center space-x-3;
}

.stat-icon {
  @apply w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl;
}

.stat-icon-blue {
  @apply bg-blue-500;
}

.stat-icon-green {
  @apply bg-green-500;
}

.stat-icon-yellow {
  @apply bg-yellow-500;
}

.stat-icon-red {
  @apply bg-red-500;
}

.stat-content {
  @apply flex-1;
}

.stat-value {
  @apply text-2xl font-bold text-gray-900;
}

.stat-label {
  @apply text-sm text-gray-600;
}

.stat-change {
  @apply text-xs font-medium flex items-center space-x-1;
}

.stat-positive {
  @apply text-green-600;
}

.stat-negative {
  @apply text-red-600;
}

.section-title {
  @apply text-lg font-semibold text-gray-900 mb-3;
}

.progress-container {
  @apply flex items-center space-x-3 mb-3;
}

.progress-bar {
  @apply flex-1 bg-gray-200 rounded-full h-3 overflow-hidden;
}

.progress-fill {
  @apply h-full bg-blue-500 transition-all duration-500 ease-out;
}

.progress-text {
  @apply text-sm font-medium text-gray-700;
}

.progress-details {
  @apply space-y-2;
}

.progress-item {
  @apply flex items-center space-x-2 text-sm;
}

.progress-dot {
  @apply w-3 h-3 rounded-full;
}

.progress-dot.completed {
  @apply bg-green-500;
}

.progress-dot.pending {
  @apply bg-yellow-500;
}

.progress-dot.overdue {
  @apply bg-red-500;
}

.chart-container {
  @apply flex justify-center mb-4;
}

.chart-legend {
  @apply space-y-2;
}

.legend-item {
  @apply flex items-center justify-between;
}

.legend-color {
  @apply w-3 h-3 rounded-full mr-2;
}

.legend-label {
  @apply flex-1 text-sm text-gray-700;
}

.legend-value {
  @apply text-sm font-medium text-gray-900;
}

.time-grid {
  @apply grid grid-cols-3 gap-4;
}

.time-stat {
  @apply text-center;
}

.time-value {
  @apply text-xl font-bold text-gray-900;
}

.time-label {
  @apply text-xs text-gray-600;
}

.quick-actions {
  @apply flex items-center space-x-3 pt-4 border-t border-gray-200;
}

.action-btn {
  @apply px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center text-sm;
}
</style>