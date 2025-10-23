<template>
  <BaseWidget 
    :widget="widgetConfig"
    :loading="loading"
    :error="error"
    @show-config="showConfigModal = true"
    @toggle="toggleWidget"
    @refresh="loadStats"
  >
    <div class="stats-widget">
      <!-- Statistiques principales -->
      <div class="stats-grid">
        <div 
          v-for="stat in mainStats" 
          :key="stat.key" 
          class="stat-card"
        >
          <div class="stat-icon">
            <i :class="[stat.iconClass, stat.icon]"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ t(stat.labelKey) }}</div>
            <div v-if="stat.change" :class="['stat-change', stat.changeClass]">
              <i :class="stat.changeIcon"></i>
              {{ stat.change }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Section progression -->
      <div v-if="showProgress" class="progress-section">
        <h4 class="section-title">{{ t('widgets.stats.progress') }}</h4>
        <div class="progress-container">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${projectProgress}%` }"
            ></div>
          </div>
          <span class="progress-text">{{ projectProgress }}%</span>
        </div>
        <div class="progress-details">
          <div class="progress-item">
            <div class="progress-dot completed"></div>
            <span>{{ completedTasks }} {{ t('widgets.stats.completed') }}</span>
          </div>
          <div class="progress-item">
            <div class="progress-dot pending"></div>
            <span>{{ pendingTasks }} {{ t('widgets.stats.pending') }}</span>
          </div>
          <div v-if="overdueTasks > 0" class="progress-item">
            <div class="progress-dot overdue"></div>
            <span>{{ overdueTasks }} {{ t('widgets.stats.overdue') }}</span>
          </div>
        </div>
      </div>
      
      <!-- Section graphique -->
      <div v-if="showChart" class="chart-section">
        <h4 class="section-title">{{ t('widgets.stats.distribution') }}</h4>
        <div class="chart-container">
          <canvas ref="chartCanvas" width="200" height="200"></canvas>
        </div>
        
        <div class="chart-legend">
          <div 
            v-for="item in chartData" 
            :key="item.label" 
            class="legend-item"
          >
            <div 
              class="legend-color" 
              :style="{ backgroundColor: item.color }"
            ></div>
            <span class="legend-label">{{ item.label }}</span>
            <span class="legend-value">{{ item.value }}</span>
          </div>
        </div>
      </div>
      
      <!-- Métriques temporelles -->
      <div v-if="showTimeStats" class="time-stats">
        <h4 class="section-title">{{ t('widgets.stats.timeMetrics') }}</h4>
        <div class="time-grid">
          <div class="time-stat">
            <div class="time-value">{{ daysRemaining }}</div>
            <div class="time-label">{{ t('widgets.stats.daysRemaining') }}</div>
          </div>
          <div class="time-stat">
            <div class="time-value">{{ averageTaskTime }}</div>
            <div class="time-label">{{ t('widgets.stats.avgTaskTime') }}</div>
          </div>
        </div>
      </div>
      
      <!-- Actions rapides -->
      <div v-if="showActions" class="quick-actions">
        <button @click="exportStats" class="action-btn">
          <i class="fas fa-download mr-2"></i>
          {{ t('common.export') }}
        </button>
        <button @click="refreshStats" class="action-btn">
          <i class="fas fa-sync-alt mr-2"></i>
          {{ t('common.refresh') }}
        </button>
      </div>
    </div>
    
    <!-- Modal de configuration -->
    <WidgetConfigModal
      v-if="showConfigModal"
      :widget="widgetConfig"
      :options="configOptions"
      @close="showConfigModal = false"
      @save="updateConfig"
    />
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import BaseWidget from './shared/components/BaseWidget.vue'
import WidgetConfigModal from '../modals/WidgetConfigModal.vue'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'
import { statsService } from './services/statsService'
import projectManagementService from '@/services/projectManagementService'

// Props
interface Props {
  projectId: string
  widgetData?: any
  widget?: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'widget-updated': [widget: any]
}>()

// Composables
const { t } = useTranslation()
const { success, error: showError } = useNotifications()
const { user } = useAuth()
    // Widget configuration
    const widgetConfig = ref({
      id: 'stats',
      name: 'Statistiques',
      icon: 'fas fa-chart-bar',
      titleKey: 'widgets.stats.title',
      isEnabled: props.widget?.is_enabled ?? true,
      showCharts: true,
      showTrends: true,
      refreshInterval: 30000,
      ...props.widget
    })
    
    // État réactif
    const loading = ref(false)
    const error = ref(null)
    const projectData = ref({})
    const tasks = ref([])
    const showConfigModal = ref(false)
    const chartCanvas = ref(null)
    
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
      return days > 0 ? `${days}j` : '<1j'
    })
    
    // Méthodes
    const loadStats = async () => {
      try {
        loading.value = true
        error.value = null
        
        const [projectResponse, tasksResponse] = await Promise.all([
          projectManagementService.getProjectDetails(props.projectId),
          projectManagementService.getProjectTasks(props.projectId)
        ])
        
        projectData.value = projectResponse.data
        tasks.value = tasksResponse.data || []
        
        // Redessiner le graphique si nécessaire
        if (showChart.value) {
          await nextTick()
          drawChart()
        }
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err)
        error.value = 'Erreur lors du chargement des statistiques'
        showError('Erreur lors du chargement des statistiques')
      } finally {
        loading.value = false
      }
    }
    
    const drawChart = () => {
      if (!chartCanvas.value) return
      
      const ctx = chartCanvas.value.getContext('2d')
      const centerX = 100
      const centerY = 100
      const radius = 80
      
      // Effacer le canvas
      ctx.clearRect(0, 0, 200, 200)
      
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
    
    const exportStats = () => {
      const statsData = {
        project: projectData.value.name,
        date: new Date().toLocaleDateString(),
        stats: {
          total: tasks.value.length,
          completed: completedTasks.value,
          pending: pendingTasks.value,
          overdue: overdueTasks.value,
          progress: projectProgress.value
        },
        timeMetrics: {
          daysRemaining: daysRemaining.value,
          averageTaskTime: averageTaskTime.value
        }
      }
      
      const dataStr = JSON.stringify(statsData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `stats-${projectData.value.name || 'project'}-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
      
      success('Statistiques exportées avec succès')
    }
    
    const refreshStats = () => {
      loadStats()
    }
    
    const toggleWidget = () => {
       widgetConfig.value.isEnabled = !widgetConfig.value.isEnabled
       const updatedWidget = {
         ...props.widget,
         is_enabled: widgetConfig.value.isEnabled
       }
       emit('widget-updated', updatedWidget)
     }
    
    const updateConfig = (newConfig) => {
      widgetConfig.value = { ...widgetConfig.value, ...newConfig }
      emit('update-widget', widgetConfig.value)
      showConfigModal.value = false
      
      // Redessiner le graphique si la configuration a changé
      if (showChart.value) {
        nextTick(() => drawChart())
      }
    }
    
    // Watchers
    watch(() => props.projectId, () => {
      if (props.projectId) {
        loadStats()
      }
    }, { immediate: true })
    
    watch(showChart, (newValue) => {
      if (newValue) {
        nextTick(() => drawChart())
      }
    })
    
    // Lifecycle
    onMounted(() => {
      if (props.projectId) {
        loadStats()
      }
    })
    

</script>

<style scoped>
.stats-widget {
  padding: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.stat-icon {
  margin-right: 1rem;
  font-size: 1.5rem;
}

.stat-icon-blue { color: #3b82f6; }
.stat-icon-green { color: #10b981; }
.stat-icon-yellow { color: #f59e0b; }
.stat-icon-red { color: #ef4444; }

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.stat-change {
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-positive { color: #10b981; }
.stat-negative { color: #ef4444; }

.progress-section,
.chart-section,
.time-stats {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.progress-bar {
  flex: 1;
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  transition: width 0.3s ease;
}

.progress-text {
  font-weight: 600;
  color: #1f2937;
}

.progress-details {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.progress-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
}

.progress-dot.completed { background: #10b981; }
.progress-dot.pending { background: #f59e0b; }
.progress-dot.overdue { background: #ef4444; }

.chart-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.legend-color {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
}

.legend-label {
  flex: 1;
  color: #6b7280;
}

.legend-value {
  font-weight: 600;
  color: #1f2937;
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.time-stat {
  text-align: center;
}

.time-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
}

.time-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.mr-2 {
  margin-right: 0.5rem;
}
</style>