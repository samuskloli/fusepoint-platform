<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-cogs mr-2"></i>
          {{ t('customizableProjects.customizeProject') }}
        </h3>
        <button @click="closeModal" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="customization-container">
          <!-- Template Info -->
          <div class="template-info">
            <div class="template-header">
              <div class="template-icon">
                <i class="fas fa-layer-group text-blue-600"></i>
              </div>
              
              <div class="template-details">
                <h4 class="template-name">{{ template.name }}</h4>
                <p class="template-description">{{ template.description }}</p>
                
                <div class="template-meta">
                  <span class="meta-item">
                    <i class="fas fa-clock mr-1"></i>
                    {{ template.estimated_duration }} {{ t(`projectTemplates.${template.duration_unit}`) }}
                  </span>
                  
                  <span class="meta-item">
                    <i class="fas fa-tag mr-1"></i>
                    {{ t(`projectTemplates.${template.category}`) }}
                  </span>
                  
                  <span class="meta-item">
                    <i class="fas fa-puzzle-piece mr-1"></i>
                    {{ template.widgets?.length || 0 }} {{ t('customizableProjects.widgets') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Project Form -->
          <div class="project-form">
            <div class="form-section">
              <h4 class="section-title">{{ t('customizableProjects.projectDetails') }}</h4>
              
              <!-- Validation Errors -->
              <div v-if="validationErrors.length > 0" class="validation-errors">
                <div v-for="error in validationErrors" :key="error" class="error-message">
                  <i class="fas fa-exclamation-triangle mr-2"></i>
                  {{ error }}
                </div>
              </div>
              
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label required">{{ t('customizableProjects.projectName') }}</label>
                  <input 
                    v-model="projectData.name"
                    type="text"
                    class="form-input"
                    :class="{ 'error': fieldErrors.name }"
                    :placeholder="t('customizableProjects.projectNamePlaceholder')"
                    @input="clearFieldError('name')"
                  />
                  <div v-if="fieldErrors.name" class="field-error">{{ fieldErrors.name }}</div>
                </div>
                
                <div class="form-group">
                  <label class="form-label required">{{ t('customizableProjects.client') }}</label>
                  <select 
                    v-model="projectData.client_id"
                    class="form-select"
                    :class="{ 'error': fieldErrors.client_id }"
                    @change="clearFieldError('client_id')"
                  >
                    <option value="">{{ t('customizableProjects.selectClient') }}</option>
                    <option v-for="client in availableClients" :key="client.id" :value="client.id">
                      {{ client.name }}
                    </option>
                  </select>
                  <div v-if="fieldErrors.client_id" class="field-error">{{ fieldErrors.client_id }}</div>
                </div>
                
                <div class="form-group">
                  <label class="form-label">{{ t('customizableProjects.description') }}</label>
                  <textarea 
                    v-model="projectData.description"
                    class="form-textarea"
                    :class="{ 'error': fieldErrors.description }"
                    rows="3"
                    :placeholder="t('customizableProjects.descriptionPlaceholder')"
                    @input="clearFieldError('description')"
                  ></textarea>
                  <div v-if="fieldErrors.description" class="field-error">{{ fieldErrors.description }}</div>
                </div>
              </div>
              
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">{{ t('customizableProjects.startDate') }}</label>
                  <input 
                    v-model="projectData.start_date"
                    type="date"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label">{{ t('customizableProjects.endDate') }}</label>
                  <input 
                    v-model="projectData.end_date"
                    type="date"
                    class="form-input"
                    :min="projectData.start_date"
                  />
                </div>
              </div>
              
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">{{ t('customizableProjects.priority') }}</label>
                  <select v-model="projectData.priority" class="form-select">
                    <option v-for="priority in projectPriorities" :key="priority.value" :value="priority.value">
                      {{ t(priority.label) }}
                    </option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="form-label">{{ t('customizableProjects.budget') }}</label>
                  <div class="budget-input">
                    <input 
                      v-model="projectData.budget"
                      type="number"
                      class="form-input"
                      min="0"
                      step="0.01"
                      :placeholder="t('customizableProjects.budgetPlaceholder')"
                    />
                    <select v-model="projectData.currency" class="currency-select">
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Widget Customization -->
            <div v-if="template.allow_customization" class="form-section">
              <h4 class="section-title">{{ t('customizableProjects.widgetsCustomization') }}</h4>
              
              <div class="customization-tabs">
                <button 
                  @click="activeTab = 'layout'"
                  class="tab-btn"
                  :class="{ active: activeTab === 'layout' }"
                >
                  <i class="fas fa-th mr-2"></i>
                  {{ t('customizableProjects.layout') }}
                </button>
                
                <button 
                  @click="activeTab = 'widgets'"
                  class="tab-btn"
                  :class="{ active: activeTab === 'widgets' }"
                >
                  <i class="fas fa-puzzle-piece mr-2"></i>
                  {{ t('customizableProjects.widgets') }}
                </button>
                
                <button 
                  @click="activeTab = 'settings'"
                  class="tab-btn"
                  :class="{ active: activeTab === 'settings' }"
                >
                  <i class="fas fa-cog mr-2"></i>
                  {{ t('customizableProjects.settings') }}
                </button>
              </div>
              
              <!-- Layout Tab -->
              <div v-if="activeTab === 'layout'" class="tab-content">
                <div class="layout-editor">
                  <div class="layout-controls">
                    <div class="control-group">
                      <label class="control-label">{{ t('customizableProjects.columns') }}</label>
                      <select v-model="layoutSettings.columns" class="control-select">
                        <option value="12">12 {{ t('customizableProjects.columns') }}</option>
                        <option value="8">8 {{ t('customizableProjects.columns') }}</option>
                        <option value="6">6 {{ t('customizableProjects.columns') }}</option>
                      </select>
                    </div>
                    
                    <div class="control-group">
                      <label class="control-label">{{ t('customizableProjects.spacing') }}</label>
                      <select v-model="layoutSettings.spacing" class="control-select">
                        <option value="tight">{{ t('customizableProjects.tight') }}</option>
                        <option value="normal">{{ t('customizableProjects.normal') }}</option>
                        <option value="loose">{{ t('customizableProjects.loose') }}</option>
                      </select>
                    </div>
                    
                    <button @click="resetLayout" class="reset-btn">
                      <i class="fas fa-undo mr-2"></i>
                      {{ t('customizableProjects.resetLayout') }}
                    </button>
                  </div>
                  
                  <div class="layout-preview">
                    <div 
                      class="preview-grid"
                      :class="`grid-cols-${layoutSettings.columns} gap-${layoutSettings.spacing}`"
                    >
                      <div  
                        v-for="widget in customizedWidgets"
                        :key="widget.widget_id"
                        class="preview-widget"
                        :class="{ disabled: !widget.is_enabled }"
                        :style="getWidgetStyle(widget)"
                        @click="selectWidget(widget)"
                      >
                        <div class="widget-preview-content">
                          <div class="widget-preview-header">
                            <i :class="getWidgetIcon(widget.widget_id)" class="widget-preview-icon"></i>
                            <span class="widget-preview-name">{{ getWidgetName(widget.widget_id) }}</span>
                          </div>
                          
                          <div class="widget-preview-actions">
                            <button 
                              @click.stop="toggleWidgetEnabled(widget)"
                              class="preview-action-btn"
                              :class="{ active: widget.is_enabled }"
                            >
                              <i :class="widget.is_enabled ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                            </button>
                          </div>
                          
                          <div v-if="widget.is_enabled" class="widget-preview-info">
                            <span class="preview-size">{{ widget.width }}x{{ widget.height }}</span>
                            <span class="preview-position">({{ widget.position_x }}, {{ widget.position_y }})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Widgets Tab -->
              <div v-if="activeTab === 'widgets'" class="tab-content">
                <div class="widgets-list">
                  <div 
                    v-for="widget in customizedWidgets"
                    :key="widget.widget_id"
                    class="widget-item"
                    :class="{ disabled: !widget.is_enabled }"
                  >
                    <div class="widget-item-header">
                      <div class="widget-item-info">
                        <i :class="getWidgetIcon(widget.widget_id)" class="widget-item-icon"></i>
                        
                        <div class="widget-item-details">
                          <h5 class="widget-item-name">{{ getWidgetName(widget.widget_id) }}</h5>
                          <p class="widget-item-description">{{ getWidgetDescription(widget.widget_id) }}</p>
                        </div>
                      </div>
                      
                      <div class="widget-item-toggle">
                        <label class="toggle-switch">
                          <input 
                            v-model="widget.is_enabled"
                            type="checkbox"
                            class="toggle-input"
                          />
                          <span class="toggle-slider" :class="{ active: widget.is_enabled }"></span>
                        </label>
                      </div>
                    </div>
                    
                    <div v-if="widget.is_enabled" class="widget-item-config">
                      <div class="config-grid">
                        <div class="config-group">
                          <label class="config-label">{{ t('customizableProjects.positionX') }}</label>
                          <input 
                            v-model="widget.position_x"
                            type="number"
                            class="position-input"
                            min="0"
                            :max="layoutSettings.columns - 1"
                            :placeholder="t('customizableProjects.column')"
                          />
                        </div>
                        
                        <div class="config-group">
                          <label class="config-label">{{ t('customizableProjects.positionY') }}</label>
                          <input 
                            v-model="widget.position_y"
                            type="number"
                            class="position-input"
                            min="0"
                            :placeholder="t('customizableProjects.row')"
                          />
                        </div>
                        
                        <div class="config-group">
                          <label class="config-label">{{ t('customizableProjects.width') }}</label>
                          <div class="size-inputs">
                            <select v-model="widget.width" class="size-select">
                              <option v-for="i in layoutSettings.columns" :key="i" :value="i">
                                {{ i }} {{ i === 1 ? t('customizableProjects.column') : t('customizableProjects.columns') }}
                              </option>
                            </select>
                          </div>
                        </div>
                        
                        <div class="config-group">
                          <label class="config-label">{{ t('customizableProjects.height') }}</label>
                          <select v-model="widget.height" class="size-select">
                            <option value="1">{{ t('customizableProjects.small') }}</option>
                            <option value="2">{{ t('customizableProjects.medium') }}</option>
                            <option value="3">{{ t('customizableProjects.large') }}</option>
                            <option value="4">{{ t('customizableProjects.extraLarge') }}</option>
                          </select>
                        </div>
                      </div>
                      
                      <!-- Widget-specific configuration -->
                      <div v-if="getWidgetConfigOptions(widget.widget_id)" class="widget-specific-config">
                        <h6 class="config-section-title">{{ t('customizableProjects.widgetSettings') }}</h6>
                        
                        <div class="config-options">
                          <div 
                            v-for="option in getWidgetConfigOptions(widget.widget_id)" 
                            :key="option.key"
                            class="config-option"
                          >
                            <label class="config-option-label">{{ t(option.labelKey) }}</label>
                            
                            <!-- Boolean option -->
                            <label v-if="option.type === 'boolean'" class="checkbox-label">
                              <input 
                                v-model="widget.config[option.key]"
                                type="checkbox"
                              />
                              {{ t(option.descriptionKey) }}
                            </label>
                            
                            <!-- Select option -->
                            <select 
                              v-else-if="option.type === 'select'"
                              v-model="widget.config[option.key]"
                              class="config-option-select"
                            >
                              <option 
                                v-for="selectOption in option.options" 
                                :key="selectOption.value" 
                                :value="selectOption.value"
                              >
                                {{ t(selectOption.labelKey) }}
                              </option>
                            </select>
                            
                            <!-- Number option -->
                            <input 
                              v-else-if="option.type === 'number'"
                              v-model="widget.config[option.key]"
                              type="number"
                              :min="option.min"
                              :max="option.max"
                              :placeholder="t(option.placeholderKey)"
                            />
                            
                            <!-- Text option -->
                            <input   
                              v-else
                              v-model="widget.config[option.key]"
                              type="text"
                              :placeholder="t(option.placeholderKey)"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Settings Tab -->
              <div v-if="activeTab === 'settings'" class="tab-content">
                <div class="settings-form">
                  <div class="settings-group">
                    <h5 class="settings-title">{{ t('customizableProjects.generalSettings') }}</h5>
                    
                    <div class="settings-options">
                      <div class="setting-option">
                        <input 
                          v-model="dashboardSettings.showWelcomeMessage"
                          type="checkbox"
                          class="setting-checkbox"
                        />
                        <label class="setting-label">{{ t('customizableProjects.showWelcomeMessage') }}</label>
                      </div>
                      
                      <div class="setting-option">
                        <input 
                          v-model="dashboardSettings.enableNotifications"
                          type="checkbox"
                          class="setting-checkbox"
                        />
                        <label class="setting-label">{{ t('customizableProjects.enableNotifications') }}</label>
                      </div>
                      
                      <div class="setting-option">
                        <input 
                          v-model="dashboardSettings.autoSaveLayout"
                          type="checkbox"
                          class="setting-checkbox"
                        />
                        <label class="setting-label">{{ t('customizableProjects.autoSaveLayout') }}</label>
                      </div>
                      
                      <div class="setting-option">
                        <input 
                          v-model="dashboardSettings.allowWidgetResize"
                          type="checkbox"
                          class="setting-checkbox"
                        />
                        <label class="setting-label">{{ t('customizableProjects.allowWidgetResize') }}</label>
                      </div>
                    </div>
                  </div>
                  
                  <div class="settings-group">
                    <h5 class="settings-title">{{ t('customizableProjects.appearance') }}</h5>
                    
                    <div class="theme-options">
                      <div class="theme-option">
                        <label class="theme-label">{{ t('customizableProjects.colorScheme') }}</label>
                        <select v-model="dashboardSettings.colorScheme" class="theme-select">
                          <option value="light">{{ t('customizableProjects.light') }}</option>
                          <option value="dark">{{ t('customizableProjects.dark') }}</option>
                          <option value="auto">{{ t('customizableProjects.auto') }}</option>
                        </select>
                      </div>
                      
                      <div class="theme-option">
                        <label class="theme-label">{{ t('customizableProjects.accentColor') }}</label>
                        <div class="color-picker">
                          <input 
                            v-model="dashboardSettings.accentColor"
                            type="color"
                            class="color-input"
                          />
                          <span class="color-value">{{ dashboardSettings.accentColor }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Customization Disabled Message -->
            <div v-else class="customization-disabled">
              <div class="disabled-message">
                <i class="fas fa-lock text-gray-400 text-3xl mb-3"></i>
                <h5 class="text-gray-600 mb-2">{{ t('customizableProjects.customizationDisabled') }}</h5>
                <p class="text-gray-500 text-sm">{{ t('customizableProjects.customizationDisabledDescription') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <div class="footer-actions">
          <button @click="closeModal" class="btn-secondary">
            {{ t('common.cancel') }}
          </button>
          
          <div class="primary-actions">
            <button 
              @click="previewProject"
              class="btn-outline"
              :disabled="loading || !isFormValid"
            >
              <i class="fas fa-eye mr-2"></i>
              {{ t('customizableProjects.preview') }}
            </button>
            
            <button 
              @click="createProject"
              class="btn-primary"
              :disabled="loading || !isFormValid"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
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
        const result = await projectTemplateService.getWidgets()
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
        gridColumn: `span ${widget.width}`,
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
        showError(t('projects.validationError'))
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
        
        const result = await createProjectFromTemplate(props.template.id, projectPayload)
        
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
          showError(errorMessage)
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
          showError(serverError)
        } else {
          showError(t('customizableProjects.createError'))
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

.template-info {
  @apply bg-gray-50 rounded-lg p-6;
}

.template-header {
  @apply flex items-start space-x-4;
}

.template-icon {
  @apply flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center;
}

.template-details {
  @apply flex-1;
}

.template-name {
  @apply text-lg font-semibold text-gray-900 mb-2;
}

.template-description {
  @apply text-gray-600 mb-4;
}

.template-meta {
  @apply flex flex-wrap gap-4;
}

.meta-item {
  @apply flex items-center text-sm text-gray-500;
}

.project-form {
  @apply space-y-6;
}

.form-section {
  @apply space-y-4;
}

.section-title {
  @apply text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2;
}

.validation-errors {
  @apply bg-red-50 border border-red-200 rounded-lg p-4 space-y-2;
}

.error-message {
  @apply flex items-center text-red-700 text-sm;
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
  content: ' *';
  @apply text-red-500;
}

.form-input,
.form-select,
.form-textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors;
}

.form-input.error,
.form-select.error,
.form-textarea.error {
  @apply border-red-500 focus:ring-red-500 focus:border-red-500;
}

.field-error {
  @apply text-red-600 text-sm;
}

.budget-input {
  @apply flex;
}

.budget-input .form-input {
  @apply rounded-r-none border-r-0;
}

.currency-select {
  @apply w-20 px-2 py-2 border border-gray-300 rounded-r-lg border-l-0 focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.customization-tabs {
  @apply flex border-b border-gray-200 mb-6;
}

.tab-btn {
  @apply px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 transition-colors;
}

.tab-btn.active {
  @apply text-blue-600 border-blue-600;
}

.tab-content {
  @apply space-y-6;
}

.layout-editor {
  @apply space-y-6;
}

.layout-controls {
  @apply flex flex-wrap gap-4 items-end;
}

.control-group {
  @apply space-y-2;
}

.control-label {
  @apply block text-sm font-medium text-gray-700;
}

.control-select {
  @apply px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.reset-btn {
  @apply px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center;
}

.layout-preview {
  @apply border border-gray-200 rounded-lg p-4 bg-gray-50;
}

.preview-grid {
  @apply grid gap-2;
}

.preview-grid.grid-cols-6 {
  grid-template-columns: repeat(6, 1fr);
}

.preview-grid.grid-cols-8 {
  grid-template-columns: repeat(8, 1fr);
}

.preview-grid.grid-cols-12 {
  grid-template-columns: repeat(12, 1fr);
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
  @apply bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-300 transition-colors;
}

.preview-widget.disabled {
  @apply opacity-50 bg-gray-100;
}

.widget-preview-content {
  @apply space-y-2;
}

.widget-preview-header {
  @apply flex items-center space-x-2;
}

.widget-preview-icon {
  @apply text-blue-600;
}

.widget-preview-name {
  @apply text-sm font-medium text-gray-900;
}

.widget-preview-actions {
  @apply flex justify-end;
}

.preview-action-btn {
  @apply p-1 text-gray-400 hover:text-gray-600 rounded transition-colors;
}

.preview-action-btn.active {
  @apply text-blue-600;
}

.widget-preview-info {
  @apply flex justify-between text-xs text-gray-500;
}

.widgets-list {
  @apply space-y-4;
}

.widget-item {
  @apply bg-white border border-gray-200 rounded-lg p-4;
}

.widget-item.disabled {
  @apply opacity-50 bg-gray-50;
}

.widget-item-header {
  @apply flex items-center justify-between mb-4;
}

.widget-item-info {
  @apply flex items-center space-x-3;
}

.widget-item-icon {
  @apply text-blue-600 text-lg;
}

.widget-item-details {
  @apply space-y-1;
}

.widget-item-name {
  @apply font-medium text-gray-900;
}

.widget-item-description {
  @apply text-sm text-gray-600;
}

.widget-item-toggle {
  @apply flex-shrink-0;
}

.toggle-switch {
  @apply relative inline-block w-12 h-6;
}

.toggle-input {
  @apply sr-only;
}

.toggle-slider {
  @apply absolute inset-0 bg-gray-300 rounded-full transition-colors cursor-pointer;
}

.toggle-slider::before {
  content: '';
  @apply absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform;
}

.toggle-slider.active {
  @apply bg-blue-600;
}

.toggle-slider.active::before {
  transform: translateX(1.5rem);
}

.widget-item-config {
  @apply space-y-4;
}

.config-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4;
}

.config-group {
  @apply space-y-2;
}

.config-label {
  @apply block text-sm font-medium text-gray-700;
}

.position-input,
.size-select {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.size-inputs {
  @apply space-y-2;
}

.widget-specific-config {
  @apply border-t border-gray-200 pt-4;
}

.config-section-title {
  @apply text-sm font-semibold text-gray-900 mb-3;
}

.config-options {
  @apply space-y-3;
}

.config-option {
  @apply space-y-2;
}

.config-option-label {
  @apply block text-sm font-medium text-gray-700;
}

.checkbox-label {
  @apply flex items-center space-x-2 text-sm text-gray-700;
}

.config-option-select {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.settings-form {
  @apply space-y-6;
}

.settings-group {
  @apply space-y-4;
}

.settings-title {
  @apply text-base font-semibold text-gray-900;
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
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.color-picker {
  @apply flex items-center space-x-3;
}

.color-input {
  @apply w-12 h-10 border border-gray-300 rounded-lg cursor-pointer;
}

.color-value {
  @apply text-sm text-gray-600 font-mono;
}

.customization-disabled {
  @apply flex items-center justify-center py-12;
}

.disabled-message {
  @apply text-center;
}

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
  @apply px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors;
}

.btn-outline {
  @apply px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center;
}
</style>