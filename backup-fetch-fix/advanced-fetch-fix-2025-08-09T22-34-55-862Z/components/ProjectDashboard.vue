<template>
  <div  class="project-dashboard=dashboard-header header-content='project-info=project-title="project-description="project-meta=meta-item='fas fa-calendar mr-2></i>
              {{ formatDate(project.start_date) }} - {{ formatDate(project.end_date) }}
            </span>
            
            <span  class="meta-item=fas fa-flag mr-2'></i>
              {{ t(`projects.priority.${project.priority}`) }}
            </span>
            
            <span class="meta-item=fas fa-users mr-2></i>
              {{ project.team_members?.length || 0 }} {{ t('projects.members="project.budget=meta-item='fas fa-euro-sign mr-2"></i>
              {{ formatCurrency(project.budget, project.currency) }}
            </span>
          </div>
        </div>
        
        <div  class="header-actions=toggleEditMode action-btn='{ active: isEditMode }"
            v-if="canEditDashboard=isEditMode ? 'fas fa-check=mr-2'></i>
            {{ isEditMode ? t('common.done="showAddWidget = true=action-btn primary=isEditMode='fas fa-plus mr-2"></i>
            {{ t('widgets.addWidget="dropdown=!isEditMode='toggleDropdown="action-btn=fas fa-ellipsis-v="showDropdown='dropdown-menu=exportDashboard="dropdown-item="fas fa-download mr-2'></i>
                {{ t('customizableProjects.exportDashboard="resetLayout=dropdown-item="canEditDashboard='fas fa-undo mr-2"></i>
                {{ t('customizableProjects.resetLayout="showSettings = true=dropdown-item='canEditDashboard="fas fa-cog mr-2"></i>
                {{ t('customizableProjects.dashboardSettings="dashboardSettings.showWelcomeMessage && !isEditMode=welcome-message='welcome-content="welcome-title=welcome-text="dismissWelcome='welcome-dismiss=fas fa-times="loading="loading-state=loading-spinner='fas fa-spinner fa-spin text-3xl text-blue-600"></i>
        <p  class="loading-text=widgets-container='widgets-grid="{
          'edit-mode=isEditMode && projectWidgets.length === 0
          class="widget-placeholder=placeholder-content='fas fa-plus text-4xl text-gray-300 mb-4"></i>
            <h 3 class="placeholder-title=placeholder-description='showAddWidget = true="placeholder-btn=fas fa-plus mr-2></i>
              {{ t('widgets.addWidget="widget in sortedWidgets=widget.id='widget-container"
        >
          <!-- Overlay d="isEditMode=widget-edit-overlay='edit-controls="configureWidget(widget)"
                class="edit-btn=t('widgets.configure='toggleWidgetEnabled(widget)"
                class="edit-btn={ active: widget.is_enabled }'
                :title="widget.is_enabled ? t('widgets.disable=widget.is_enabled ? 'fas fa-eye=removeWidget(widget)"
                class="edit-btn danger=t('widgets.remove='resize-handles="dashboardSettings.allowWidgetResize=resize-handle resize-se="startResize(widget, 'se='getWidgetComponent(widget.widget_type)"
            :project-id="project.id'
            @error="handleWidgetError=showAddWidget(showAddWidget='project.id=projectWidgets="showAddWidget = false="handleWidgetAdded=showWidgetConfig='showWidgetConfig="configuringWidget=showWidgetConfig = false="handleWidgetConfigSaved='showSettings=showSettings="dashboardSettings="layoutSettings=showSettings = false='handleSettingsSaved"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import projectManagementService from '@/services/projectManagementService'
import projectTemplateService from '@/services/projectTemplateService'
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'
import { useTranslation } from '@/composables/useTranslation'

// Import des widgets
import TaskListWidget from '@/components/widgets/TaskListWidget.vue'
import StatsWidget from '@/components/widgets/StatsWidget.vue'
import CalendarWidget from '@/components/widgets/CalendarWidget.vue'
import CommentsWidget from '@/components/widgets/CommentsWidget.vue'
import GoalsWidget from '@/components/widgets/GoalsWidget.vue'
import AIWidget from '@/components/widgets/AIWidget.vue'
import FilesWidget from '@/components/widgets/FilesWidget.vue'
import HistoryWidget from '@/components/widgets/HistoryWidget.vue'
import ChecklistWidget from '@/components/widgets/ChecklistWidget.vue'
import TeamWidget from '@/components/widgets/TeamWidget.vue'

// Import des modales
import AddWidgetModal from '@/components/modals/AddWidgetModal.vue'
import WidgetConfigModal from '@/components/modals/WidgetConfigModal.vue'
import DashboardSettingsModal from '@/components/modals/DashboardSettingsModal.vue'

export default {
  name: 'ProjectDashboard',
  components: {
    TaskListWidget,
    StatsWidget,
    CalendarWidget,
    CommentsWidget,
    GoalsWidget,
    AIWidget,
    FilesWidget,
    HistoryWidget,
    ChecklistWidget,
    TeamWidget,
    AddWidgetModal,
    WidgetConfigModal,
    DashboardSettingsModal
  },
  props: {
    projectId: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const { success, error: showError, confirm } = useNotifications()
    const { user, hasPermission } = useAuth()
    const { t } = useTranslation()
    
    // État réactif
    const loading = ref(false)
    const project = ref({})
    const projectWidgets = ref([])
    const isEditMode = ref(false)
    const showDropdown = ref(false)
    const showAddWidget = ref(false)
    const showWidgetConfig = ref(false)
    const showSettings = ref(false)
    const configuringWidget = ref(null)
    const resizingWidget = ref(null)
    
    // Paramètres du tableau de bord
    const dashboardSettings = ref({
      showWelcomeMessage: true,
      enableNotifications: true,
      autoSaveLayout: true,
      allowWidgetResize: true,
      colorScheme: 'light',
      accentColor: '#3B82F6'
    })
    
    // Paramètres de disposition
    const layoutSettings = ref({
      columns: 12,
      spacing: 'normal'
    })
    
    // Propriétés calculées
    const canEditDashboard = computed(() => {
      return hasPermission('edit_project_dashboard') || project.value.created_by === user.value?.id
    })
    
    const sortedWidgets = computed(() => {
      return [...projectWidgets.value]
        .filter(widget => widget.is_enabled || isEditMode.value)
        .sort((a, b) => {
          const aOrder = a.position_y * layoutSettings.value.columns + a.position_x
          const bOrder = b.position_y * layoutSettings.value.columns + b.position_x
          return aOrder - bOrder
        })
    })
    
    // Méthodes
    const loadProject = async () => {
      try {
        const result = await projectManagementService.getProjectDetails(props.projectId)
        if (result.success) {
          project.value = result.data
        }
      } catch (err) {
        showError(t('errors.loadingFailed'))
      }
    }
    
    const loadProjectWidgets = async () => {
      try {
        const result = await projectTemplateService.getProjectWidgets(props.projectId)
        if (result.success) {
          projectWidgets.value = result.data
        }
      } catch (err) {
        showError(t('errors.loadingFailed'))
      }
    }
    
    const loadDashboardSettings = async () => {
      try {
        // Charger les paramètres depuis l'API ou le localStorage
        const savedSettings = localStorage.getItem(`dashboard-settings-${props.projectId}`)
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          dashboardSettings.value = { ...dashboardSettings.value, ...parsed.dashboard }
          layoutSettings.value = { ...layoutSettings.value, ...parsed.layout }
        }
      } catch (err) {
        console.warn('Failed to load dashboard settings:', err)
      }
    }
    
    const saveDashboardSettings = async () => {
      try {
        const settings = {
          dashboard: dashboardSettings.value,
          layout: layoutSettings.value
        }
        
        localStorage.setItem(`dashboard-settings-${props.projectId}`, JSON.stringify(settings))
        
        if (dashboardSettings.value.autoSaveLayout) {
          // Sauvegarder aussi sur le serveur
          await projectTemplateService.updateProjectDashboardSettings(props.projectId, settings)
        }
      } catch (err) {
        console.warn('Failed to save dashboard settings:', err)
      }
    }
    
    const getWidgetComponent = (widgetType) => {
      const componentMap = {
        'task_list': 'TaskListWidget',
        'stats': 'StatsWidget',
        'calendar': 'CalendarWidget',
        'comments': 'CommentsWidget',
        'goals': 'GoalsWidget',
        'ai': 'AIWidget',
        'files': 'FilesWidget',
        'history': 'HistoryWidget',
        'checklist': 'ChecklistWidget',
        'team': 'TeamWidget'
      }
      
      return componentMap[widgetType] || 'BaseWidget'
    }
    
    const getWidgetStyle = (widget) => {
      return {
      gridColumn: `span ${widget.width,
      t
    }`,
        gridRow: `span ${widget.height}`,
        order: widget.position_y * layoutSettings.value.columns + widget.position_x
      }
    }
    
    const toggleEditMode = () => {
      isEditMode.value = !isEditMode.value
      
      if (!isEditMode.value && dashboardSettings.value.autoSaveLayout) {
        saveDashboardSettings()
      }
    }
    
    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value
    }
    
    const configureWidget = (widget) => {
      configuringWidget.value = widget
      showWidgetConfig.value = true
    }
    
    const toggleWidgetEnabled = async (widget) => {
      try {
        const result = await projectTemplateService.updateProjectWidget(props.projectId, widget.id, {
          is_enabled: !widget.is_enabled
        })
        
        if (result.success) {
          widget.is_enabled = !widget.is_enabled
        }
      } catch (err) {
        showError(t('errors.updateFailed'))
      }
    }
    
    const removeWidget = async (widget) => {
      const confirmed = await confirm(
        t('widgets.removeConfirmation'),
        t('widgets.removeConfirmationMessage')
      )
      
      if (confirmed) {
        try {
          const result = await projectTemplateService.removeProjectWidget(props.projectId, widget.id)
          
          if (result.success) {
            projectWidgets.value = projectWidgets.value.filter(w => w.id !== widget.id)
            success(t('widgets.widgetRemoved'))
          }
        } catch (err) {
          showError(t('errors.deletingFailed'))
        }
      }
    }
    
    const handleWidgetAdded = async (widget) => {
      projectWidgets.value.push(widget)
      showAddWidget.value = false
      success(t('widgets.widgetAdded'))
    }
    
    const handleWidgetConfigSaved = async (updatedWidget) => {
      const index = projectWidgets.value.findIndex(w => w.id === updatedWidget.id)
      if (index !== -1) {
        projectWidgets.value[index] = updatedWidget
      }
      
      showWidgetConfig.value = false
      configuringWidget.value = null
      success(t('widgets.configurationSaved'))
    }
    
    const handleSettingsSaved = (settings) => {
      dashboardSettings.value = { ...dashboardSettings.value, ...settings.dashboard }
      layoutSettings.value = { ...layoutSettings.value, ...settings.layout }
      
      showSettings.value = false
      saveDashboardSettings()
      success(t('customizableProjects.settingsSaved'))
    }
    
    const handleWidgetError = (error) => {
      showError(error.message || t('errors.widgetError'))
    }
    
    const exportDashboard = () => {
      const dashboardData = {
        project: project.value,
        widgets: projectWidgets.value,
        settings: dashboardSettings.value,
        layout: layoutSettings.value
      }
      
      const dataStr = JSON.stringify(dashboardData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `dashboard-${project.value.name}-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      
      URL.revokeObjectURL(url)
      success(t('customizableProjects.dashboardExported'))
    }
    
    const resetLayout = async () => {
      const confirmed = await confirm(
        t('customizableProjects.resetLayoutConfirmation'),
        t('customizableProjects.resetLayoutConfirmationMessage')
      )
      
      if (confirmed) {
        try {
          // Réinitialiser la disposition des widgets
          projectWidgets.value.forEach((widget, index) => {
            widget.position_x = 0
            widget.position_y = index
            widget.width = 4
            widget.height = 2
          })
          
          // Réinitialiser les paramètres
          layoutSettings.value = {
            columns: 12,
            spacing: 'normal'
          }
          
          await saveDashboardSettings()
          success(t('customizableProjects.layoutReset'))
        } catch (err) {
          showError(t('errors.resetFailed'))
        }
      }
    }
    
    const dismissWelcome = () => {
      dashboardSettings.value.showWelcomeMessage = false
      saveDashboardSettings()
    }
    
    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString()
    }
    
    const formatCurrency = (amount, currency = 'EUR') => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency
      }).format(amount)
    }
    
    // Gestion du redimensionnement
    const startResize = (widget, direction, event) => {
      if (!dashboardSettings.value.allowWidgetResize) return
      
      resizingWidget.value = {
        widget,
        direction,
        startX: event.clientX,
        startY: event.clientY,
        startWidth: widget.width,
        startHeight: widget.height
      }
      
      document.addEventListener('mousemove', handleResize)
      document.addEventListener('mouseup', stopResize)
      event.preventDefault()
    }
    
    const handleResize = (event) => {
      if (!resizingWidget.value) return
      
      const { widget, startX, startY, startWidth, startHeight } = resizingWidget.value
      const deltaX = event.clientX - startX
      const deltaY = event.clientY - startY
      
      // Calculer la nouvelle taille (approximative)
      const newWidth = Math.max(1, Math.min(layoutSettings.value.columns, startWidth + Math.round(deltaX / 100)))
      const newHeight = Math.max(1, startHeight + Math.round(deltaY / 80))
      
      widget.width = newWidth
      widget.height = newHeight
    }
    
    const stopResize = () => {
      if (resizingWidget.value && dashboardSettings.value.autoSaveLayout) {
        saveDashboardSettings()
      }
      
      resizingWidget.value = null
      document.removeEventListener('mousemove', handleResize)
      document.removeEventListener('mouseup', stopResize)
    }
    
    // Fermer le dropdown quand on clique ailleurs
    const handleClickOutside = () => {
      showDropdown.value = false
    }
    
    // Watchers
    watch([dashboardSettings, layoutSettings], () => {
      if (dashboardSettings.value.autoSaveLayout) {
        saveDashboardSettings()
      }
    }, { deep: true })
    
    // Lifecycle
    onMounted(async () => {
      loading.value = true
      
      try {
        await Promise.all([
          loadProject(),
          loadProjectWidgets(),
          loadDashboardSettings()
        ])
      } finally {
        loading.value = false
      }
      
      document.addEventListener('click', handleClickOutside)
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('mousemove', handleResize)
      document.removeEventListener('mouseup', stopResize)
    })
    
    return {
      loading,
      project,
      projectWidgets,
      isEditMode,
      showDropdown,
      showAddWidget,
      showWidgetConfig,
      showSettings,
      configuringWidget,
      dashboardSettings,
      layoutSettings,
      canEditDashboard,
      sortedWidgets,
      user,
      getWidgetComponent,
      getWidgetStyle,
      toggleEditMode,
      toggleDropdown,
      configureWidget,
      toggleWidgetEnabled,
      removeWidget,
      handleWidgetAdded,
      handleWidgetConfigSaved,
      handleSettingsSaved,
      handleWidgetError,
      exportDashboard,
      resetLayout,
      dismissWelcome,
      formatDate,
      formatCurrency,
      startResize,
      t
    }
  }
}
</script>

<style scoped>
.project-dashboard {
  @apply space-y-6;
}

/* En-tête */
.dashboard-header {
  @apply space-y-4;
}

.header-content {
  @apply flex items-start justify-between;
}

.project-info {
  @apply flex-1;
}

.project-title {
  @apply text-3xl font-bold text-gray-900;
}

.project-description {
  @apply text-gray-600 mt-2;
}

.project-meta {
  @apply flex items-center flex-wrap gap-4 mt-4 text-sm text-gray-500;
}

.meta-item {
  @apply flex items-center;
}

.header-actions {
  @apply flex items-center space-x-3;
}

.action-btn {
  @apply px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center;
}

.action-btn.active {
  @apply bg-blue-600 text-white;
}

.action-btn.primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.dropdown {
  @apply relative;
}

.dropdown-menu {
  @apply absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10;
}

.dropdown-item {
  @apply w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center;
}

/* Message de bienvenue */
.welcome-message {
  @apply bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4;
}

.welcome-content {
  @apply relative;
}

.welcome-title {
  @apply text-lg font-semibold text-blue-900;
}

.welcome-text {
  @apply text-blue-700 mt-1;
}

.welcome-dismiss {
  @apply absolute top-0 right-0 p-1 text-blue-400 hover:text-blue-600 rounded transition-colors;
}

/* État de chargement */
.loading-state {
  @apply flex items-center justify-center py-20;
}

.loading-spinner {
  @apply text-center;
}

.loading-text {
  @apply mt-4 text-gray-600;
}

/* Conteneur de widgets */
.widgets-container {
  @apply min-h-screen;
}

.widgets-grid {
  @apply grid auto-rows-[120px];
}

.widgets-grid.grid-cols-12 {
  @apply grid-cols-12;
}

.widgets-grid.grid-cols-8 {
  @apply grid-cols-8;
}

.widgets-grid.grid-cols-6 {
  @apply grid-cols-6;
}

.widgets-grid.gap-tight {
  @apply gap-2;
}

.widgets-grid.gap-normal {
  @apply gap-4;
}

.widgets-grid.gap-loose {
  @apply gap-6;
}

.widgets-grid.edit-mode {
  @apply border-2 border-dashed border-gray-300 rounded-lg p-4;
}

/* Placeholder de widget */
.widget-placeholder {
  @apply col-span-full row-span-4 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg;
}

.placeholder-content {
  @apply text-center max-w-md;
}

.placeholder-title {
  @apply text-xl font-semibold text-gray-700 mb-2;
}

.placeholder-description {
  @apply text-gray-500 mb-6;
}

.placeholder-btn {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors;
}

/* Conteneur de widget */
.widget-container {
  @apply relative bg-white border border-gray-200 rounded-lg overflow-hidden;
}

.widget-container.widget-disabled {
  @apply opacity-50;
}

.widget-container.widget-editing {
  @apply border-blue-300 shadow-md;
}

/* Overlay d'édition */
.widget-edit-overlay {
  @apply absolute inset-0 bg-black bg-opacity-10 z-10 opacity-0 hover:opacity-100 transition-opacity;
}

.edit-controls {
  @apply absolute top-2 right-2 flex items-center space-x-1;
}

.edit-btn {
  @apply w-8 h-8 flex items-center justify-center bg-white text-gray-600 hover:text-gray-900 rounded shadow-sm hover:shadow transition-all;
}

.edit-btn.active {
  @apply text-blue-600;
}

.edit-btn.danger {
  @apply text-red-600 hover:text-red-700;
}

/* Poignées de redimensionnement */
.resize-handles {
  @apply absolute inset-0 pointer-events-none;
}

.resize-handle {
  @apply absolute pointer-events-auto;
}

.resize-se {
  @apply bottom-0 right-0 w-4 h-4 cursor-se-resize;
}

.resize-se::after {
  @apply absolute bottom-1 right-1 w-2 h-2 bg-blue-600 rounded-sm;
  content: '';
}
</style>