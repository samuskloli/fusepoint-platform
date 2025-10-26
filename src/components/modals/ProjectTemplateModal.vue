<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <!-- En-tête -->
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-layer-group mr-2"></i>
          {{ isEditing ? t('projectTemplates.editTemplate') : t('projectTemplates.createTemplate') }}
        </h3>
        <button @click="closeModal" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Corps -->
      <div class="modal-body">
        <form @submit.prevent="saveTemplate" class="template-form">
          <!-- Informations de base -->
          <div class="form-section">
            <h4 class="section-title">{{ t('projectTemplates.basicInfo') }}</h4>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label required">{{ t('projectTemplates.templateName') }}</label>
                <input
                  v-model="templateData.name"
                  type="text"
                  class="form-input"
                  :placeholder="t('projectTemplates.templateNamePlaceholder')"
                  required
                >
              </div>
              
              <div class="form-group">
                <label class="form-label">{{ t('projectTemplates.category') }}</label>
                <select v-model="templateData.category" class="form-select">
                  <option value="">{{ t('projectTemplates.selectCategory') }}</option>
                  <option
                    v-for="category in templateCategories"
                    :key="category.value"
                    :value="category.value"
                  >
                    {{ category.label }}
                  </option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ t('projectTemplates.description') }}</label>
              <textarea
                v-model="templateData.description"
                class="form-textarea"
                rows="3"
                :placeholder="t('projectTemplates.descriptionPlaceholder')"
              ></textarea>
            </div>
            
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">{{ t('projectTemplates.estimatedDuration') }}</label>
                <div class="duration-input">
                  <input
                    v-model="templateData.estimated_duration"
                    type="number"
                    class="form-input"
                    min="1"
                    :placeholder="t('projectTemplates.durationPlaceholder')"
                  >
                  <select v-model="templateData.duration_unit" class="duration-unit">
                    <option value="days">{{ t('time.days') }}</option>
                    <option value="weeks">{{ t('time.weeks') }}</option>
                    <option value="months">{{ t('time.months') }}</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">{{ t('projectTemplates.defaultPriority') }}</label>
                <select v-model="templateData.default_priority" class="form-select">
                  <option
                    v-for="priority in projectPriorities"
                    :key="priority.value"
                    :value="priority.value"
                  >
                    {{ priority.label }}
                  </option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ t('projectTemplates.tags') }}</label>
              <div class="tags-input">
                <div class="tags-list">
                  <span
                    v-for="(tag, index) in templateData.tags"
                    :key="index"
                    class="tag"
                  >
                    {{ tag }}
                    <button
                      @click="removeTag(index)"
                      type="button"
                      class="tag-remove"
                    >
                      ×
                    </button>
                  </span>
                </div>
                <input
                  v-model="newTag"
                  @keydown.enter.prevent="addTag"
                  type="text"
                  class="tag-input"
                  :placeholder="t('projectTemplates.addTag')"
                >
              </div>
            </div>
          </div>

          <!-- Widgets -->
          <div class="form-section">
            <div class="section-header">
              <h4 class="section-title">{{ t('projectTemplates.widgets') }}</h4>
              
              <!-- Filtres et recherche -->
              <div class="widgets-filters">
                <div class="search-box">
                  <i class="fas fa-search search-icon"></i>
                  <input
                    v-model="widgetSearchQuery"
                    type="text"
                    class="search-input"
                    :placeholder="t('projectTemplates.searchWidgets')"
                  >
                </div>
                
                <div class="filter-buttons">
                  <button
                    @click="widgetFilter = 'all'"
                    type="button"
                    class="filter-btn"
                    :class="{ active: widgetFilter === 'all' }"
                  >
                    {{ t('projectTemplates.allWidgets') }}
                  </button>
                  <button
                    @click="widgetFilter = 'developed'"
                    type="button"
                    class="filter-btn"
                    :class="{ active: widgetFilter === 'developed' }"
                  >
                    {{ t('projectTemplates.developedWidgets') }}
                  </button>
                  <button
                    @click="widgetFilter = 'undeveloped'"
                    type="button"
                    class="filter-btn"
                    :class="{ active: widgetFilter === 'undeveloped' }"
                  >
                    {{ t('projectTemplates.undevelopedWidgets') }}
                  </button>
                </div>
              </div>
            </div>
            
            <div class="widgets-grid">
              <div
                v-for="widget in filteredWidgets"
                :key="widget.id"
                class="widget-card"
                :class="{ 
                  active: isWidgetSelected(widget.id),
                  undeveloped: !isWidgetDeveloped(widget.component_name)
                }"
                @click="toggleWidget(widget)"
              >
                <div class="widget-header">
                  <div class="widget-icon">
                    <i :class="widget.icon"></i>
                  </div>
                  <div class="widget-info">
                    <div class="widget-name-container">
                      <div class="widget-name">{{ widget.name }}</div>
                      <div v-if="!isWidgetDeveloped(widget.component_name)" class="undeveloped-badge">
                        {{ t('projectTemplates.notDeveloped') }}
                      </div>
                    </div>
                    <div class="widget-description">{{ widget.description }}</div>
                  </div>
                  <div class="widget-toggle">
                    <input
                      :checked="isWidgetSelected(widget.id)"
                      @change="toggleWidget(widget)"
                      type="checkbox"
                      class="widget-checkbox"
                      :disabled="!isWidgetDeveloped(widget.component_name)"
                    >
                  </div>
                </div>

                <!-- Configuration du widget -->
                <div v-if="isWidgetSelected(widget.id)" class="widget-config">
                  <div class="config-grid">
                    <div class="config-group">
                      <label class="config-label">{{ t('projectTemplates.position') }}</label>
                      <div class="position-input">
                        <input
                          v-model.number="getWidgetConfig(widget.id).position_x"
                          type="number"
                          class="position-field"
                          min="0"
                          max="11"
                          :placeholder="t('projectTemplates.column')"
                        >
                        <input
                          v-model.number="getWidgetConfig(widget.id).position_y"
                          type="number"
                          class="position-field"
                          min="0"
                          :placeholder="t('projectTemplates.row')"
                        >
                      </div>
                    </div>
                    
                    <div class="config-group">
                      <label class="config-label">{{ t('projectTemplates.size') }}</label>
                      <div class="size-input">
                        <select v-model="getWidgetConfig(widget.id).width" class="size-select">
                          <option value="1">1 {{ t('projectTemplates.column') }}</option>
                          <option value="2">2 {{ t('projectTemplates.columns') }}</option>
                          <option value="3">3 {{ t('projectTemplates.columns') }}</option>
                          <option value="4">4 {{ t('projectTemplates.columns') }}</option>
                          <option value="6">6 {{ t('projectTemplates.columns') }}</option>
                          <option value="12">12 {{ t('projectTemplates.columns') }}</option>
                        </select>
                        <select v-model="getWidgetConfig(widget.id).height" class="size-select">
                          <option value="1">{{ t('projectTemplates.small') }}</option>
                          <option value="2">{{ t('projectTemplates.medium') }}</option>
                          <option value="3">{{ t('projectTemplates.large') }}</option>
                          <option value="4">{{ t('projectTemplates.extraLarge') }}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div class="config-group">
                    <label class="checkbox-label">
                      <input
                        v-model="getWidgetConfig(widget.id).is_enabled"
                        type="checkbox"
                        class="config-checkbox"
                      >
                      {{ t('projectTemplates.enabled') }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Aperçu de la disposition -->
          <div class="form-section">
            <h4 class="section-title">{{ t('projectTemplates.layoutPreview') }}</h4>
            <div class="layout-preview">
              <div class="preview-grid">
                <div
                  v-for="widget in selectedWidgetsSorted"
                  :key="widget.id"
                  class="preview-widget"
                  :style="getWidgetPreviewStyle(widget)"
                >
                  <div class="preview-widget-content">
                    <i :class="widget.icon" class="preview-icon"></i>
                    <span class="preview-name">{{ widget.name }}</span>
                  </div>
                </div>
                
                <div v-if="selectedWidgets.length === 0" class="preview-empty">
                  <i class="fas fa-puzzle-piece text-gray-400 text-3xl mb-2"></i>
                  <p class="text-gray-600">{{ t('projectTemplates.noWidgetsSelected') }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Options -->
          <div class="form-section">
            <h4 class="section-title">{{ t('projectTemplates.options') }}</h4>
            <div class="form-grid">
              <div class="form-group">
                <label class="checkbox-label">
                  <input
                    v-model="templateData.is_public"
                    type="checkbox"
                    class="form-checkbox"
                  >
                  {{ t('projectTemplates.publicTemplate') }}
                </label>
                <p class="form-help">{{ t('projectTemplates.publicTemplateHelp') }}</p>
              </div>
              
              <div class="form-group">
                <label class="checkbox-label">
                  <input
                    v-model="templateData.allow_customization"
                    type="checkbox"
                    class="form-checkbox"
                  >
                  {{ t('projectTemplates.allowCustomization') }}
                </label>
                <p class="form-help">{{ t('projectTemplates.allowCustomizationHelp') }}</p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Pied de page -->
      <div class="modal-footer">
        <div class="footer-actions">
          <button @click="closeModal" type="button" class="btn-secondary">
            {{ t('common.cancel') }}
          </button>
          
          <div class="primary-actions">
            <button
              v-if="isEditing"
              @click="duplicateTemplate"
              type="button"
              class="btn-outline"
              :disabled="loading"
            >
              <i v-if="loading" class="fas fa-copy mr-2"></i>
              {{ t('projectTemplates.duplicate') }}
            </button>
            
            <button
              @click="saveTemplate"
              type="submit"
              class="btn-primary"
              :disabled="loading || !isFormValid"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-save mr-2"></i>
              {{ isEditing ? t('common.save') : t('common.create') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import projectTemplateService from '@/services/projectTemplateService'
import { useNotifications } from '@/composables/useNotifications'
import { useTranslation } from '@/composables/useTranslation'

export default {
  name: 'ProjectTemplateModal',
  props: {
    template: {
      type: Object,
      default: null
    },
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'saved', 'duplicated'],
  setup(props, { emit }) {
    const { success, error: showError } = useNotifications()
    const { t } = useTranslation()
    
    // État réactif
    const loading = ref(false)
    const newTag = ref('')
    const availableWidgets = ref([])
    const selectedWidgets = ref([])
    
    // Nouveaux états pour les filtres
    const widgetSearchQuery = ref('')
    const widgetFilter = ref('all') // 'all', 'developed', 'undeveloped'
    
    // Liste des widgets non développés (basée sur l'analyse précédente)
    const undevelopedWidgets = ref([
      'ProjectOverviewWidget',
      'BudgetWidget', 
      'BrandGuideWidget',
      'SEOChecklistWidget',
      'TrackingChecklistWidget',
      'DevelopmentWidget',

      'LogoPreviewWidget',
      'NotesWidget',
      'ColorPaletteWidget',
      'ProjectPlanningWidget',
      'ResourcesWidget',
      'RoadmapWidget',
      'SocialMediaWidget',
      'TestingWidget',
      'TimelineWidget',
      'UserFeedbackWidget',
      'WebsitePreviewWidget'
    ])
    
    // Données du modèle
    const templateData = ref({
      name: '',
      description: '',
      category: '',
      estimated_duration: null,
      estimated_budget: null,
      duration_unit: 'days',
      default_priority: 'medium',
      tags: [],
      is_public: false,
      allow_customization: true
    })
    
    // Propriétés calculées
    const isEditing = computed(() => !!props.template)
    
    const templateCategories = computed(() => {
      return projectTemplateService.getTemplateCategories()
    })
    
    const projectPriorities = computed(() => {
      return projectTemplateService.getProjectPriorities()
    })
    
    const isFormValid = computed(() => {
      return templateData.value.name.trim().length > 0
    })
    
    const selectedWidgetsSorted = computed(() => {
      return selectedWidgets.value
        .map(widgetId => {
          const widget = availableWidgets.value.find(w => w.id === widgetId)
          const config = getWidgetConfig(widgetId)
          return {
            ...(widget || { id: widgetId, name: 'Widget', icon: 'fas fa-puzzle-piece' }),
            config
          }
        })
        .sort((a, b) => {
          if (a.config.position_y !== b.config.position_y) {
            return a.config.position_y - b.config.position_y
          }
          return a.config.position_x - b.config.position_x
        })
    })
    
    // Propriété calculée pour les widgets filtrés
    const filteredWidgets = computed(() => {
      let filtered = availableWidgets.value
      
      // Filtrage par recherche
      if (widgetSearchQuery.value.trim()) {
        const query = widgetSearchQuery.value.toLowerCase()
        filtered = filtered.filter(widget => 
          widget.name.toLowerCase().includes(query) ||
          widget.description.toLowerCase().includes(query) ||
          widget.category.toLowerCase().includes(query)
        )
      }
      
      // Filtrage par statut de développement
      if (widgetFilter.value === 'developed') {
        filtered = filtered.filter(widget => isWidgetDeveloped(widget.component_name))
      } else if (widgetFilter.value === 'undeveloped') {
        filtered = filtered.filter(widget => !isWidgetDeveloped(widget.component_name))
      }
      
      return filtered
    })
    
    // Configuration des widgets
    const widgetConfigs = ref({})
    
    // Méthodes
    const loadAvailableWidgets = async () => {
      // Éviter les chargements multiples
      if (availableWidgets.value.length > 0) {
        console.log('🔄 Widgets déjà chargés, éviter le rechargement')
        return
      }
      
      try {
        console.log('📦 Chargement des widgets disponibles...')
        const result = await projectTemplateService.getWidgets()
        if (result.success) {
          availableWidgets.value = result.data
          console.log('✅ Widgets chargés:', result.data.length)
        } else {
          console.error('❌ Erreur lors du chargement des widgets:', result.message)
          showError(result.message || t('errors.loadingFailed'))
        }
      } catch (err) {
        console.error('❌ Exception lors du chargement des widgets:', err)
        showError(t('errors.loadingFailed'))
      }
    }
    
    const initializeTemplate = async () => {
      console.log('🔄 Initialisation du template:', {
        hasTemplate: !!props.template,
        template: props.template,
        isVisible: props.isVisible
      })
      
      // Attendre que le DOM soit prêt
      await nextTick()
      
      if (props.template) {
        // Mode édition
        console.log('📝 Mode édition - Template reçu:', props.template)
        
        // Réinitialisation complète avant remplissage
        templateData.value = {
          name: '',
          description: '',
          category: '',
          estimated_duration: null,
          estimated_budget: null,
          duration_unit: 'days',
          default_priority: 'medium',
          tags: [],
          is_public: false,
          allow_customization: true
        }
        
        // Attendre un tick pour la réinitialisation
        await nextTick()
        
        // Remplir avec les données du template
        templateData.value = {
          ...templateData.value,
          ...props.template,
          tags: [...(props.template.tags || [])]
        }
        
        console.log('✅ Template data après initialisation:', templateData.value)
        
        // Mécanisme de fallback - vérifier après 100ms
        setTimeout(() => {
          if (!templateData.value.name && props.template?.name) {
            console.log('🚨 Fallback activé - Forçage du remplissage')
            templateData.value.name = props.template.name
            templateData.value.description = props.template.description || ''
            templateData.value.category = props.template.category || ''
            templateData.value.estimated_duration = props.template.estimated_duration
            templateData.value.duration_unit = props.template.duration_unit || 'days'
            templateData.value.default_priority = props.template.default_priority || 'medium'
            templateData.value.tags = [...(props.template.tags || [])]
            templateData.value.is_public = props.template.is_public || false
            templateData.value.allow_customization = props.template.allow_customization !== false
            console.log('✅ Fallback terminé:', templateData.value)
          }
        }, 100)
        
        // Charger la configuration des widgets
        if (props.template.widgets) {
          selectedWidgets.value = props.template.widgets.map(w => w.widget_id)
          
          props.template.widgets.forEach(widget => {
            widgetConfigs.value[widget.widget_id] = {
              position_x: widget.position_x || 0,
              position_y: widget.position_y || 0,
              width: widget.width || 4,
              height: widget.height || 2,
              is_enabled: widget.is_enabled !== false,
              config: widget.config || {}
            }
          })
        }
      } else {
        // Mode création - réinitialiser
        console.log('🆕 Mode création - Réinitialisation du formulaire')
        templateData.value = {
          name: '',
          description: '',
          category: '',
          estimated_duration: null,
          estimated_budget: null,
          duration_unit: 'days',
          default_priority: 'medium',
          tags: [],
          is_public: false,
          allow_customization: true
        }
        selectedWidgets.value = []
        widgetConfigs.value = {}
        console.log('✅ Formulaire réinitialisé pour création')
      }
    }
    
    const addTag = () => {
      const tag = newTag.value.trim()
      if (tag && !templateData.value.tags.includes(tag)) {
        templateData.value.tags.push(tag)
        newTag.value = ''
      }
    }
    
    const removeTag = (index) => {
      templateData.value.tags.splice(index, 1)
    }
    
    const isWidgetSelected = (widgetId) => {
      return selectedWidgets.value.includes(widgetId)
    }
    
    const isWidgetDeveloped = (componentName) => {
      return !undevelopedWidgets.value.includes(componentName)
    }
    
    const toggleWidget = (widget) => {
      // Empêcher la sélection des widgets non développés
      if (!isWidgetDeveloped(widget.component_name)) {
        showError(t('projectTemplates.widgetNotDeveloped', { name: widget.name }))
        return
      }
      
      const index = selectedWidgets.value.indexOf(widget.id)
      
      if (index > -1) {
        // Désélectionner
        selectedWidgets.value.splice(index, 1)
        delete widgetConfigs.value[widget.id]
      } else {
        // Sélectionner
        selectedWidgets.value.push(widget.id)
        
        // Configuration par défaut
        widgetConfigs.value[widget.id] = {
          position_x: 0,
          position_y: selectedWidgets.value.length - 1,
          width: widget.default_width || 4,
          height: widget.default_height || 2,
          is_enabled: true,
          config: { ...widget.default_config }
        }
      }
    }
    
    const getWidgetConfig = (widgetId) => {
      if (!widgetConfigs.value[widgetId]) {
        widgetConfigs.value[widgetId] = {
          position_x: 0,
          position_y: 0,
          width: 4,
          height: 2,
          is_enabled: true,
          config: {}
        }
      }
      return widgetConfigs.value[widgetId]
    }
    
    const getWidgetPreviewStyle = (widget) => {
      const config = widget.config
      return {
        gridColumn: `span ${config.width}`,
        gridRow: `span ${config.height}`,
        order: config.position_y * 12 + config.position_x
      }
    }
    
    const saveTemplate = async () => {
      if (!isFormValid.value) {
        console.warn('⚠️ Formulaire invalide, sauvegarde annulée')
        return
      }
      
      loading.value = true
      
      try {
        // Validation des données avant envoi
        if (!templateData.value.name.trim()) {
          showError(t('errors.nameRequired'))
          return
        }
        
        if (selectedWidgets.value.length === 0) {
          showError(t('errors.noWidgetsSelected'))
          return
        }
        
        const templatePayload = {
          ...templateData.value,
          name: templateData.value.name.trim(),
          description: templateData.value.description.trim(),
          // Ajouter les champs requis par le backend
          estimated_budget: templateData.value.estimated_budget || null,
          widgets: selectedWidgets.value.map(widgetId => {
            const config = widgetConfigs.value[widgetId] || {
              position_x: 0,
              position_y: 0,
              width: 4,
              height: 2,
              is_enabled: true,
              config: {}
            }
            return {
              widget_id: widgetId,
              ...config
            }
          })
        }
        
        console.log('💾 Sauvegarde du template:', {
          isEditing: isEditing.value,
          templateId: props.template?.id,
          payload: templatePayload
        })
        
        let result
        if (isEditing.value) {
          result = await projectTemplateService.updateTemplate(props.template.id, templatePayload)
        } else {
          result = await projectTemplateService.createTemplate(templatePayload)
        }
        
        console.log('📤 Résultat de la sauvegarde:', result)
        
        if (result.success) {
          success(isEditing.value ? t('projectTemplates.templateUpdated') : t('projectTemplates.templateCreated'))
          emit('saved', result.data)
          closeModal()
        } else {
          console.error('❌ Erreur de sauvegarde:', result.error)
          showError(result.error || t('errors.savingFailed'))
        }
      } catch (err) {
        console.error('❌ Exception lors de la sauvegarde:', err)
        showError(err.message || t('errors.savingFailed'))
      } finally {
        loading.value = false
      }
    }
    
    const duplicateTemplate = async () => {
      if (!props.template) return
      
      loading.value = true
      
      try {
        const result = await projectTemplateService.duplicateTemplate(props.template.id)
        
        if (result.success) {
          success(t('projectTemplates.templateDuplicated'))
          emit('duplicated', result.data)
          closeModal()
        }
      } catch (err) {
        showError(t('errors.duplicatingFailed'))
      } finally {
        loading.value = false
      }
    }
    
    const closeModal = () => {
      emit('close')
    }
    
    // Variables pour éviter les initialisations multiples
    const isInitializing = ref(false)
    const isWidgetsLoaded = ref(false)
    
    // Watchers
    watch(() => props.isVisible, async (visible, oldVisible) => {
      console.log('👁️ Changement de visibilité:', { visible, oldVisible })
      if (visible && !isInitializing.value) {
        console.log('🚀 Modale devenue visible - Initialisation...')
        isInitializing.value = true
        await initializeTemplate()
        if (!isWidgetsLoaded.value) {
          loadAvailableWidgets()
          isWidgetsLoaded.value = true
        }
        isInitializing.value = false
      } else if (!visible) {
        // Reset les flags quand la modale se ferme
        isInitializing.value = false
        isWidgetsLoaded.value = false
      }
    })
    
    watch(() => props.template, async (newTemplate, oldTemplate) => {
      console.log('📋 Changement de template:', { 
        newTemplate, 
        oldTemplate, 
        isVisible: props.isVisible 
      })
      if (props.isVisible && !isInitializing.value && newTemplate !== oldTemplate) {
        console.log('🔄 Template changé et modale visible - Réinitialisation...')
        isInitializing.value = true
        await initializeTemplate()
        isInitializing.value = false
      }
    })
    
    onMounted(async () => {
      console.log('🎯 Composant monté:', { 
        isVisible: props.isVisible, 
        hasTemplate: !!props.template,
        template: props.template 
      })
      if (props.isVisible && !isInitializing.value) {
        console.log('🚀 Modale visible au montage - Initialisation...')
        isInitializing.value = true
        await initializeTemplate()
        if (!isWidgetsLoaded.value) {
          loadAvailableWidgets()
          isWidgetsLoaded.value = true
        }
        isInitializing.value = false
      }
    })
    
    return {
      loading,
      newTag,
      availableWidgets,
      selectedWidgets,
      templateData,
      widgetConfigs,
      isEditing,
      templateCategories,
      projectPriorities,
      isFormValid,
      selectedWidgetsSorted,
      filteredWidgets,
      widgetSearchQuery,
      widgetFilter,
      addTag,
      removeTag,
      isWidgetSelected,
      isWidgetDeveloped,
      toggleWidget,
      getWidgetConfig,
      getWidgetPreviewStyle,
      saveTemplate,
      duplicateTemplate,
      closeModal,
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
  @apply bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-screen overflow-hidden flex flex-col;
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

.template-form {
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

.form-checkbox {
  @apply w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500;
}

.form-help {
  @apply text-xs text-gray-500;
}

.duration-input {
  @apply flex space-x-2;
}

.duration-unit {
  @apply px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-32;
}

.tags-input {
  @apply border border-gray-300 rounded-md p-2 min-h-[42px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500;
}

.tags-list {
  @apply flex flex-wrap gap-2 mb-2;
}

.tag {
  @apply inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md;
}

.tag-remove {
  @apply ml-1 text-blue-600 hover:text-blue-800 focus:outline-none;
}

.tag-input {
  @apply border-0 outline-0 flex-1 min-w-0 text-sm;
}

.checkbox-label {
  @apply flex items-center space-x-2 text-sm text-gray-700;
}

/* Widgets */
.section-header {
  @apply mb-6;
}

.widgets-filters {
  @apply mt-4 space-y-4;
}

.search-box {
  @apply relative;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm;
}

.search-input {
  @apply w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors;
}

.filter-buttons {
  @apply flex flex-wrap gap-2;
}

.filter-btn {
  @apply px-4 py-2 text-sm font-medium rounded-lg border transition-colors;
}

.filter-btn:not(.active) {
  @apply text-gray-700 bg-white border-gray-300 hover:bg-gray-50;
}

.filter-btn.active {
  @apply text-blue-700 bg-blue-50 border-blue-300;
}

.widgets-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-4;
}

.widget-card {
  @apply border border-gray-200 rounded-lg p-4 cursor-pointer transition-all hover:border-blue-300 hover:shadow-md;
}

.widget-card.active {
  @apply border-blue-500 bg-blue-50;
}

.widget-card.undeveloped {
  @apply border-orange-200 bg-orange-50 opacity-75;
}

.widget-card.undeveloped:hover {
  @apply border-orange-300;
}

.widget-header {
  @apply flex items-center space-x-3;
}

.widget-icon {
  @apply w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600;
}

.widget-card.active .widget-icon {
  @apply bg-blue-100 text-blue-600;
}

.widget-info {
  @apply flex-1;
}

.widget-name-container {
  @apply flex flex-col space-y-1;
}

.widget-name {
  @apply font-medium text-gray-900;
}

.undeveloped-badge {
  @apply inline-flex items-center px-2 py-1 text-xs font-medium text-orange-800 bg-orange-100 rounded-full;
}

.widget-description {
  @apply text-xs text-gray-600;
}

.widget-toggle {
  @apply flex items-center;
}

.widget-checkbox {
  @apply w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500;
}

.widget-config {
  @apply mt-4 pt-4 border-t border-gray-200 space-y-3;
}

.config-grid {
  @apply grid grid-cols-2 gap-3;
}

.config-group {
  @apply space-y-1;
}

.config-label {
  @apply block text-xs font-medium text-gray-700;
}

.position-input {
  @apply flex space-x-1;
}

.position-field {
  @apply flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500;
}

.size-input {
  @apply flex space-x-1;
}

.size-select {
  @apply flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500;
}

.config-checkbox {
  @apply w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500;
}

/* Aperçu */
.layout-preview {
  @apply bg-gray-50 rounded-lg p-4 min-h-[200px];
}

.preview-grid {
  @apply grid grid-cols-12 gap-2 auto-rows-[60px];
}

.preview-widget {
  @apply bg-white border border-gray-200 rounded-md p-2 flex items-center justify-center;
}

.preview-widget-content {
  @apply flex flex-col items-center space-y-1;
}

.preview-icon {
  @apply text-gray-600 text-lg;
}

.preview-name {
  @apply text-xs text-gray-700 text-center;
}

.preview-empty {
  @apply flex flex-col items-center justify-center h-full text-center;
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