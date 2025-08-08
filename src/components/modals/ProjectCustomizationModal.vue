<template>
  <div  class="modal-overlay=closeModal modal-container='modal-header=modal-title="fas fa-cogs mr-2></i>
          {{ t('customizableProjects.customizeProject === closeModal=close-btn='fas fa-times === modal-body=customization-container === template-info='template-header=template-icon === fas fa-layer-group text-blue-600"></i>
              </div>
              
              <div  class === template-details=template-name template-description='template-meta=meta-item === fas fa-clock mr-1></i>
                    {{ template.estimated_duration }} {{ t(`projectTemplates.${template.duration_unit}`) }}
                  </span>
                  
                  <span  class="meta-item=fas fa-tag mr-1'></i>
                    {{ t(`projectTemplates.${template.category}`) }}
                  </span>
                  
                  <span class="meta-item=fas fa-puzzle-piece mr-1></i>
                    {{ template.widgets?.length || 0 }} {{ t('customizableProjects.widgets="createProject=project-form='form-section="section-title=validationErrors.length &gt; 0" class="validation-errors=error-message='error in validationErrors="error=fas fa-exclamation-triangle mr-2"></i>
                  {{ error }}
                </div>
              </div>
              
              <div  class="form-grid=form-group form-label required='projectData.name=text="form-input="{ 'error=t('customizableProjects.projectNamePlaceholder='fieldErrors.name="field-error=form-group="form-label required='projectData.client_id=form-select="{ 'error="clearFieldError('client_id='>{{ t('customizableProjects.selectClientclient.id="fieldErrors.client_id'form-label=projectData.description="form-textarea="{ 'error=3'
                  :placeholder="t('customizableProjects.descriptionPlaceholder=fieldErrors.description=field-error="form-grid=form-group='form-label="projectData.start_date=date="form-input='form-group=form-label="projectData.end_date="date=form-input='projectData.start_date="form-grid=form-group="form-label='projectData.priority=form-select="priority in projectPriorities="priority.value=priority.value='form-group="form-label=budget-input="projectData.budget='number=form-input="0"
                      step="0.01'
                      :placeholder="t('customizableProjects.budgetPlaceholder=currency-select=EUR="USD=GBP='template.allow_customization="form-section=section-title="widgets-customization='customization-tabs=activeTab = 'layout="button="{ active: activeTab === 'layout=tab-btn='fas fa-th mr-2"></i>
                    {{ t('customizableProjects.layout="activeTab = 'widgets=button='{ active: activeTab === 'widgets="tab-btn=fas fa-puzzle-piece mr-2"></i>
                    {{ t('customizableProjects.widgets="activeTab = 'settings=button='{ active: activeTab === 'settings="tab-btn=fas fa-cog mr-2"></i>
                    {{ t('customizableProjects.settings="activeTab === 'layout=tab-content='layout-editor="layout-controls=control-group="control-label='layoutSettings.columns=control-select="12">12 {{ t('customizableProjects.columns="8'>8 {{ t('customizableProjects.columns="6">6 {{ t('customizableProjects.columns="control-group=control-label='layoutSettings.spacing="control-select=tight="normal='loose=resetLayout="button="reset-btn=fas fa-undo mr-2'></i>
                        {{ t('customizableProjects.resetLayout="layout-preview=preview-grid="`grid-cols-${layoutSettings.columns} gap-${layoutSettings.spacing}`'
                      >
                        <div  
                          v-for="widget in customizedWidgets=widget.widget_id=preview-widget="{ disabled: !widget.is_enabled }'
                          :style="getWidgetStyle(widget)"
                          @click="selectWidget(widget)'
                        >
                          <div class(widget-preview-content=widget-preview-header getWidgetIcon(widget.widget_id) class="widget-preview-icon=widget-preview-name='widget-preview-actions="toggleWidgetEnabled(widget)"
                                  class="preview-action-btn={ active: widget.is_enabled }'
                                >
                                  <i  :class="widget.is_enabled ? 'fas fa-eye=widget.is_enabled=widget-preview-info: preview-size=preview-position='activeTab === 'widgets="tab-content=widgets-list="widget in customizedWidgets='widget.widget_id=widget-item="{ disabled: !widget.is_enabled }
                    >
                      <div class="widget-item-header=widget-item-info widget-item-icon='getWidgetIcon(widget.widget_id)"></i>
                          </div>
                          
                          <div  class="widget-item-details=widget-item-name widget-item-description='widget-item-toggle=toggle-switch="widget.is_enabled="checkbox=toggle-input='toggle-slider="widget.is_enabled=widget-item-config="config-grid='config-group"widget.position_x=number="position-input='0"
                                :max="layoutSettings.columns - 1'
                                :placeholder="t('customizableProjects.column=number=position-input="0'
                                :placeholder="t('customizableProjects.row=config-label=size-inputs="widget.width=size-select='i in layoutSettings.columns="i=i>
                                  {{ i }} {{ i === 1 ? t('customizableProjects.column="widget.height=size-select='1">{{ t('customizableProjects.small="2'>{{ t('customizableProjects.medium="3">{{ t('customizableProjects.large="4'>{{ t('customizableProjects.extraLarge="getWidgetConfigOptions(widget.widget_id)" class="widget-specific-config=config-section-title='config-options="option in getWidgetConfigOptions(widget.widget_id)" 
                              :key="option.key=config-option=config-option-label='option.type === 'boolean=config-option-input="checkbox-label="widget.config[option.key]'
                                    type="checkbox"widget.config[option.key]"
                                class="config-option-select=selectOption in option.options='selectOption.value="selectOption.value=option.type === 'number="widget.config[option.key]'
                                type="number"option.max=t(option.placeholderKey)"
                              >
                              
                              <!-- Text option -->
                              <input   
                                v-else
                                v-model="widget.config[option.key]'
                                type""activeTab === 'settings=tab-content=settings-form === settings-group=settings-title='settings-options="setting-option=dashboardSettings.showWelcomeMessage="checkbox='setting-checkbox=setting-label="setting-option="dashboardSettings.enableNotifications=checkbox='setting-checkbox="setting-label=setting-option="dashboardSettings.autoSaveLayout='checkbox=setting-checkbox="setting-label="setting-option=dashboardSettings.allowWidgetResize='checkbox="setting-checkbox=setting-label="settings-group='settings-title=theme-options="theme-option="theme-label=dashboardSettings.colorScheme='theme-select="light=dark="auto='theme-option=theme-label="color-picker="dashboardSettings.accentColor=color='color-input="color-value=customization-:disabled="disabled-message='fas fa-lock text-gray-400 text-3xl mb-3></i>
                <h 5 class || text-gray-600 mb-2'>{{ t('customizableProjects.customizationDisabled="text-gray-500 text-sm=modal-footer=footer-actions='closeModal=button="btn-secondary="primary-actions=previewProject='button="btn-outline=loading || !isFormValid="fas fa-eye mr-2'></i>
              {{ t('customizableProjects.preview="createProject=button="btn-primary='loading || !isFormValid=loading="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-plus mr-2"></i>
              {{ t('customizableProjects.createProject') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import projectTemplateService from '@/services/projectTemplateService'
import projectManagementService from '@/services/projectManagementService'
import { useNotifications } from '@/composables/useNotifications'
import { useTemplateProjects } from '@/composables/useProjectTemplates'
import { useTranslation } from '@/composables/useTranslation'

export default {
  name: 'ProjectCustomizationModal',
  props: {
    template: {
      type: Object,
      required: true
    },
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'created', 'preview'],
  setup(props, { emit }) {
    const { success, error: showError } = useNotifications()
    const { createProjectFromTemplate } = useTemplateProjects()
    const { t } = useTranslation()
    
    // État réactif
    const loading = ref(false)
    const activeTab = ref('layout')
    const availableClients = ref([])
    const availableWidgets = ref([])
    const selectedWidget = ref(null)
    const validationErrors = ref([])
    const fieldErrors = ref({})
    
    // Données du projet
    const projectData = ref({
      name: '',
      description: '',
      client_id: '',
      start_date: '',
      end_date: '',
      priority: 'medium',
      budget: null,
      currency: 'EUR'
    })
    
    // Configuration de la disposition
    const layoutSettings = ref({
      columns: 12,
      spacing: 'normal'
    })
    
    // Paramètres du tableau de bord
    const dashboardSettings = ref({
      showWelcomeMessage: true,
      enableNotifications: true,
      autoSaveLayout: true,
      allowWidgetResize: true,
      colorScheme: 'light',
      accentColor: '#3B82F6'
    })
    
    // Widgets personnalisés
    const customizedWidgets = ref([])
    
    // Propriétés calculées
    const projectPriorities = computed(() => {
      return projectTemplateService.getProjectPriorities()
    })
    
    const isFormValid = computed(() => {
      return projectData.value.name && 
             projectData.value.name.trim().length > 0 &&
             projectData.value.client_id &&
             customizedWidgets.value.length > 0 &&
             validationErrors.value.length === 0
    })
    
    // Méthodes
    const loadClients = async () => {
      try {
        // Simuler le chargement des clients
        availableClients.value = [
          { id: 1, name: 'Client A' },
          { id: 2, name: 'Client B' },
          { id: 3, name: 'Client C' }
        ]
      } catch (err) {
        showError(t('errors.loadingFailed'))
      }
    }
    
    const loadAvailableWidgets = async () => {
      try {
        const result = await projectTemplateService.getGlobalWidgets()
        if (result.success) {
          availableWidgets.value = result.data
        }
      } catch (err) {
        showError(t('errors.loadingFailed'))
      }
    }
    
    const initializeCustomization = () => {
      if (props.template?.widgets) {
        customizedWidgets.value = props.template.widgets.map(widget => ({
          ...widget,
          config: { ...widget.config }
        }))
      }
      
      // Initialiser les dates par défaut
      const today = new Date().toISOString().split('T')[0]
      projectData.value.start_date = today
      
      if (props.template.estimated_duration) {
        const endDate = new Date()
        const duration = props.template.estimated_duration
        const unit = props.template.duration_unit
        
        switch (unit) {
          case 'days':
            endDate.setDate(endDate.getDate() + duration)
            break
          case 'weeks':
            endDate.setDate(endDate.getDate() + (duration * 7))
            break
          case 'months':
            endDate.setMonth(endDate.getMonth() + duration)
            break
        }
        
        projectData.value.end_date = endDate.toISOString().split('T')[0]
      }
      
      // Initialiser la priorité par défaut
      if (props.template.default_priority) {
        projectData.value.priority = props.template.default_priority
      }
    }
    
    const getWidgetIcon = (widgetId) => {
      const widget = availableWidgets.value.find(w => w.id === widgetId)
      return widget?.icon || 'fas fa-puzzle-piece'
    }
    
    const getWidgetName = (widgetId) => {
      const widget = availableWidgets.value.find(w => w.id === widgetId)
      return widget ? t(widget.nameKey) : 'Widget'
    }
    
    const getWidgetDescription = (widgetId) => {
      const widget = availableWidgets.value.find(w => w.id === widgetId)
      return widget ? t(widget.descriptionKey) : ''
    }
    
    const getWidgetConfigOptions = (widgetId) => {
      const widget = availableWidgets.value.find(w => w.id === widgetId)
      return widget?.configOptions || []
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
    
    const selectWidget = (widget) => {
      selectedWidget.value = widget
    }
    
    const toggleWidgetEnabled = (widget) => {
      widget.is_enabled = !widget.is_enabled
    }
    
    const resetLayout = () => {
      customizedWidgets.value.forEach((widget, index) => {
        widget.position_x = 0
        widget.position_y = index
        widget.width = 4
        widget.height = 2
      })
    }
    
    const previewProject = () => {
      const previewData = {
        template: props.template,
        project: projectData.value,
        widgets: customizedWidgets.value,
        layout: layoutSettings.value,
        dashboard: dashboardSettings.value
      }
      
      emit('preview', previewData)
    }
    
    // Validation des champs
    const validateForm = () => {
      validationErrors.value = []
      fieldErrors.value = {}
      
      // Validation du nom du projet
      if (!projectData.value.name || !projectData.value.name.trim()) {
        fieldErrors.value.name = t('projects.titleRequired')
        validationErrors.value.push(t('projects.titleRequired'))
      } else if (projectData.value.name.trim().length > 200) {
        fieldErrors.value.name = t('projects.titleTooLong')
        validationErrors.value.push(t('projects.titleTooLong'))
      }
      
      // Validation du client
      if (!projectData.value.client_id) {
        fieldErrors.value.client_id = t('projects.clientRequired')
        validationErrors.value.push(t('projects.clientRequired'))
      }
      
      // Validation de la description (optionnelle mais limitée)
      if (projectData.value.description && projectData.value.description.length > 1000) {
        fieldErrors.value.description = t('projects.descriptionTooLong')
        validationErrors.value.push(t('projects.descriptionTooLong'))
      }
      
      return validationErrors.value.length === 0
    }
    
    // Nettoyer les erreurs de champ
    const clearFieldError = (fieldName) => {
      if (fieldErrors.value[fieldName]) {
        delete fieldErrors.value[fieldName]
      }
      // Retirer l'erreur correspondante de la liste générale
      validationErrors.value = validationErrors.value.filter(error => {
        switch (fieldName) {
          case 'name':
            return !error.includes(t('projects.titleRequired')) && !error.includes(t('projects.titleTooLong'))
          case 'client_id':
            return !error.includes(t('projects.clientRequired'))
          case 'description':
            return !error.includes(t('projects.descriptionTooLong'))
          default:
            return true
        }
      })
    }
    
    const createProject = async () => {
      // Valider le formulaire avant de continuer
        if (!validateForm()) {
          showToast(t('projects.validationError'), 'error')
          return
        }
      
      loading.value = true
      
      try {
        // Préparer les données du projet avec les champs requis
        const projectPayload = {
          client_id: projectData.value.client_id,
          title: projectData.value.name.trim(),
          name: projectData.value.name.trim(), // Assurer que name est défini
          description: projectData.value.description || '',
          start_date: projectData.value.start_date,
          end_date: projectData.value.end_date,
          priority: projectData.value.priority,
          budget: projectData.value.budget,
          currency: projectData.value.currency,
          template_id: props.template.id,
          widgets: customizedWidgets.value,
          layout_settings: layoutSettings.value,
          dashboard_settings: dashboardSettings.value
        }
        
        const result = await createProjectFromTemplate(projectPayload)
        
        if (result.success) {
          success(t('customizableProjects.projectCreated'))
          emit('created', result.data)
          closeModal()
        } else {
          // Gérer les erreurs spécifiques du serveur
          const errorMessage = result.error || t('customizableProjects.createError')
          if (errorMessage.includes('client_id') || errorMessage.includes('Client')) {
            fieldErrors.value.client_id = t('projects.clientRequired')
          }
          if (errorMessage.includes('title') || errorMessage.includes('nom')) {
            fieldErrors.value.name = t('projects.titleRequired')
          }
          showToast(errorMessage, 'error')
        }
      } catch (error) {
        console.error('Erreur lors de la création du projet:', error)
        // Gérer les erreurs de validation côté serveur
        if (error.response?.data?.message) {
          const serverError = error.response.data.message
          if (serverError.includes('client_id') || serverError.includes('Client')) {
            fieldErrors.value.client_id = t('projects.clientRequired')
          }
          if (serverError.includes('title') || serverError.includes('nom')) {
            fieldErrors.value.name = t('projects.titleRequired')
          }
          showToast(serverError, 'error')
        } else {
          showToast(t('customizableProjects.createError'), 'error')
        }
      } finally {
        loading.value = false
      }
    }
    
    const closeModal = () => {
      emit('close')
    }
    
    // Watchers
    watch(() => props.isVisible, (visible) => {
      if (visible) {
        initializeCustomization()
        loadClients()
        loadAvailableWidgets()
      }
    })
    
    onMounted(() => {
      if (props.isVisible) {
        initializeCustomization()
        loadClients()
        loadAvailableWidgets()
      }
    })
    
    return {
      loading,
      activeTab,
      availableClients,
      availableWidgets,
      selectedWidget,
      projectData,
      layoutSettings,
      dashboardSettings,
      customizedWidgets,
      projectPriorities,
      validationErrors,
      fieldErrors,
      isFormValid,
      getWidgetIcon,
      getWidgetName,
      getWidgetDescription,
      getWidgetConfigOptions,
      getWidgetStyle,
      selectWidget,
      toggleWidgetEnabled,
      resetLayout,
      previewProject,
      createProject,
      closeModal,
      validateForm,
      clearFieldError,
      t
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-container {
  @apply bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-screen overflow-hidden flex flex-col;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900 flex items-center;
}

.close-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors;
}

.modal-body {
  @apply flex-1 overflow-y-auto p-6;
}

.customization-container {
  @apply space-y-8;
}

/* Template info */
.template-info {
  @apply bg-blue-50 rounded-lg p-4;
}

.template-header {
  @apply flex items-start space-x-4;
}

.template-icon {
  @apply w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl;
}

.template-details {
  @apply flex-1;
}

.template-name {
  @apply text-lg font-semibold text-gray-900;
}

.template-description {
  @apply text-gray-600 mt-1;
}

.template-meta {
  @apply flex items-center space-x-4 mt-3 text-sm text-gray-500;
}

.meta-item {
  @apply flex items-center;
}

/* Form */
.project-form {
  @apply space-y-8;
}

.form-section {
  @apply space-y-4;
}

.section-title {
  @apply text-lg font-medium text-gray-900 border-b border-gray-200 pb-2;
}

.form-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium text-gray-700;
}

.form-label.required::after {
  @apply text-red-500 ml-1;
  content: '*';
}

.form-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.form-select {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.form-textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y;
}

.budget-input {
  @apply flex space-x-2;
}

.currency-select {
  @apply px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-24;
}

/* Customization */
.widgets-customization {
  @apply space-y-6;
}

.customization-tabs {
  @apply flex space-x-1 bg-gray-100 rounded-lg p-1;
}

.tab-btn {
  @apply flex-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md transition-colors;
}

.tab-btn.active {
  @apply bg-white text-blue-600 shadow-sm;
}

.tab-content {
  @apply mt-6;
}

/* Layout editor */
.layout-editor {
  @apply space-y-6;
}

.layout-controls {
  @apply flex items-center justify-between flex-wrap gap-4 p-4 bg-gray-50 rounded-lg;
}

.control-group {
  @apply flex items-center space-x-2;
}

.control-label {
  @apply text-sm font-medium text-gray-700;
}

.control-select {
  @apply px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500;
}

.reset-btn {
  @apply px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors;
}

.layout-preview {
  @apply bg-white border border-gray-200 rounded-lg p-4 min-h-[400px];
}

.preview-grid {
  @apply grid auto-rows-[80px];
}

.preview-grid.grid-cols-12 {
  @apply grid-cols-12;
}

.preview-grid.grid-cols-8 {
  @apply grid-cols-8;
}

.preview-grid.grid-cols-6 {
  @apply grid-cols-6;
}

.preview-grid.gap-tight {
  @apply gap-1;
}

.preview-grid.gap-normal {
  @apply gap-2;
}

.preview-grid.gap-loose {
  @apply gap-4;
}

.preview-widget {
  @apply bg-gray-50 border border-gray-200 rounded-md p-2 cursor-pointer hover:border-blue-300 transition-colors;
}

.preview-widget.disabled {
  @apply opacity-50 bg-gray-100;
}

.widget-preview-content {
  @apply h-full flex flex-col;
}

.widget-preview-header {
  @apply flex items-center justify-between;
}

.widget-preview-icon {
  @apply text-gray-600;
}

.widget-preview-name {
  @apply text-xs font-medium text-gray-700 flex-1 mx-2 truncate;
}

.widget-preview-actions {
  @apply flex items-center space-x-1;
}

.preview-action-btn {
  @apply w-5 h-5 flex items-center justify-center text-xs text-gray-400 hover:text-gray-600 rounded transition-colors;
}

.preview-action-btn.active {
  @apply text-blue-600;
}

.widget-preview-info {
  @apply mt-auto text-xs text-gray-500 space-y-1;
}

.preview-size {
  @apply block;
}

.preview-position {
  @apply block;
}

/* Widgets list */
.widgets-list {
  @apply space-y-4;
}

.widget-item {
  @apply border border-gray-200 rounded-lg p-4;
}

.widget-item.disabled {
  @apply opacity-60 bg-gray-50;
}

.widget-item-header {
  @apply flex items-center justify-between;
}

.widget-item-info {
  @apply flex items-center space-x-3;
}

.widget-item-icon {
  @apply w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600;
}

.widget-item-details {
  @apply flex-1;
}

.widget-item-name {
  @apply text-sm font-medium text-gray-900;
}

.widget-item-description {
  @apply text-xs text-gray-600;
}

.widget-item-toggle {
  @apply flex items-center;
}

.toggle-switch {
  @apply relative inline-block w-10 h-6;
}

.toggle-input {
  @apply opacity-0 w-0 h-0;
}

.toggle-slider {
  @apply absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full transition-all duration-300;
}

.toggle-slider:before {
  @apply absolute content-[''] h-4 w-4 left-1 bottom-1 bg-white rounded-full transition-all duration-300;
}

.toggle-input:checked + .toggle-slider {
  @apply bg-blue-600;
}

.toggle-input:checked + .toggle-slider:before {
  @apply transform translate-x-4;
}

.widget-item-config {
  @apply mt-4 pt-4 border-t border-gray-200 space-y-4;
}

.config-grid {
  @apply grid grid-cols-2 gap-4;
}

.config-group {
  @apply space-y-2;
}

.config-label {
  @apply block text-xs font-medium text-gray-700;
}

.position-inputs {
  @apply flex space-x-2;
}

.position-input {
  @apply flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500;
}

.size-inputs {
  @apply flex space-x-2;
}

.size-select {
  @apply flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500;
}

.widget-specific-config {
  @apply space-y-3;
}

.config-section-title {
  @apply text-sm font-medium text-gray-900;
}

.config-options {
  @apply space-y-3;
}

.config-option {
  @apply space-y-1;
}

.config-option-label {
  @apply block text-xs font-medium text-gray-700;
}

.config-option-input {
  @apply w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500;
}

.config-option-select {
  @apply w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500;
}

.checkbox-label {
  @apply flex items-center space-x-2 text-xs text-gray-700;
}

.config-checkbox {
  @apply w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500;
}

/* Settings */
.settings-form {
  @apply space-y-6;
}

.settings-group {
  @apply space-y-4;
}

.settings-title {
  @apply text-sm font-medium text-gray-900 border-b border-gray-200 pb-2;
}

.settings-options {
  @apply space-y-3;
}

.setting-option {
  @apply flex items-center space-x-3;
}

.setting-checkbox {
  @apply w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500;
}

.setting-label {
  @apply text-sm text-gray-700;
}

.theme-options {
  @apply space-y-4;
}

.theme-option {
  @apply space-y-2;
}

.theme-label {
  @apply block text-sm font-medium text-gray-700;
}

.theme-select {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.color-picker {
  @apply flex items-center space-x-3;
}

.color-input {
  @apply w-12 h-10 border border-gray-300 rounded cursor-pointer;
}

.color-value {
  @apply text-sm text-gray-600 font-mono;
}

/* Customization disabled */
.customization-disabled {
  @apply py-12;
}

.disabled-message {
  @apply text-center;
}

/* Footer */
.modal-footer {
  @apply border-t border-gray-200 p-6;
}

.footer-actions {
  @apply flex items-center justify-between;
}

.primary-actions {
  @apply flex items-center space-x-3;
}

.btn-secondary {
  @apply px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors;
}

.btn-outline {
  @apply px-4 py-2 text-blue-600 border border-blue-600 hover:bg-blue-50 rounded-lg transition-colors;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>