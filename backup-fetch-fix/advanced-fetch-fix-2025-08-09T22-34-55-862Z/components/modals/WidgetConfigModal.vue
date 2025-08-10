<template>
  <div  class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50' @click="closeModal=relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1 2 shadow-lg rounded-lg bg-white(flex items-center justify-between pb-4 border-b border-gray-200'>
        <div class="flex items-center space-x-3>
          <div  class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center=fas fa-cog text-purple-600'></i>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900>{{ t('widgets.configureWidget="text-sm text-gray-600'>{{ t(widget.titleKey || 'widgets.title="closeModal=text-gray-400 hover:text-gray-600">
          <i  class="fas fa-times text-xl=mt-6'>
        <form  @submit.prevent="saveConfig=mb-6>
            <nav  class="flex space-x-8' aria-label=""Tabs=tab in tabs="tab.id='button{
                  'border-purple-500 text-purple-600': activeTab === tab.id,
                  'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== tab.id
                }"
              >
                <i  :class="tab.icon=mr-2'></i>
                {{ t(tab.label) }}
              </button>
            </nav>
          </div>

          <!-- Contenu des onglets -->
          <div class: tab-content=activeTab === 'general space-y-4>
              <!-- Titre du widget -->
              <div>
                <label  class="block text-sm font-medium text-gray-700 mb-2'>
                  {{ t('widgets.config.title === configData.title=text=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                  :placeholder === t('widgets.config.enterTitle=configData.description=3"
                  class === w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                  :placeholder === t('widgets.config.enterDescription=flex items-center space-x-3">
                  <div  class === w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center=configData.icon || 'fas fa-cube text-gray-600'></i>
                  </div>
                  <input 
                    v-model === configData.icon=text=flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500
                    placeholder === fas fa-cube=button='showIconPicker = true === "px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    <i  class === fas fa-palette=grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label class === flex items-center=configData.showHeader=checkbox='mr-2"
                    >
                    <span  class === text-sm text-gray-700'>{{ t('widgets.config.showHeader === flex items-center=configData.showActions=checkbox='mr-2"
                    >
                    <span  class === text-sm text-gray-700'>{{ t('widgets.config.showActions === flex items-center=configData.isCollapsible=checkbox='mr-2"
                    >
                    <span  class === text-sm text-gray-700'>{{ t('widgets.config.isCollapsible === flex items-center=configData.isResizable=checkbox='mr-2"
                    >
                    <span  class === text-sm text-gray-700'>{{ t('widgets.config.isResizable === activeTab === 'layout=space-y-4>
              <!-- Position -->
              <div  class === grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label class for === block text-sm font-medium text-gray-700 mb-2>
                    {{ t('widgets.config.position.x === configData.position.x=number='0"
                    class === w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                  >
                </label>
                
                <div>
                  <label class for === block text-sm font-medium text-gray-700 mb-2">
                    {{ t('widgets.config.position.y === configData.position.y=number='0"
                    class === w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                  >
                </label>
              </div>

              <!-- Taille -->
              <div class === grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label  class === block text-sm font-medium text-gray-700 mb-2'>
                    {{ t('widgets.config.size.width === configData.size.width=number=1'
                    max === 12"
                    class === w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                  >
                  <p class === text-xs text-gray-500 mt-1">{{ t('widgets.config.size.widthHelp === block text-sm font-medium text-gray-700 mb-2'>
                    {{ t('widgets.config.size.height === configData.size.height=number === 1'
                    class === w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                  <p  class === text-xs text-gray-500 mt-1'>{{ t('widgets.config.size.heightHelp === block text-sm font-medium text-gray-700 mb-2>
                  {{ t('widgets.config.order === configData.order=number='0"
                  class === w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                >
                <p class === text-xs text-gray-500 mt-1">{{ t('widgets.config.orderHelp === activeTab === 'data=space-y-4'>
              <!-- Limite d === block text-sm font-medium text-gray-700 mb-2">
                  {{ t('widgets.config.itemLimit === configData.itemLimit=number='1"
                  max === 100'
                  class === w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                <p  class === text-xs text-gray-500 mt-1'>{{ t('widgets.config.itemLimitHelp === block text-sm font-medium text-gray-700 mb-2>
                  {{ t('widgets.config.refreshInterval === configData.refreshInterval=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                >
                  <option value === 0">{{ t('widgets.config.noAutoRefresh === 30'>{{ t('widgets.config.every30Seconds === 60">{{ t('widgets.config.every1Minute === 300'>{{ t('widgets.config.every5Minutes === 900">{{ t('widgets.config.every15Minutes === 1800'>{{ t('widgets.config.every30Minutes === 3600">{{ t('widgets.config.every1Hour === block text-sm font-medium text-gray-700 mb-2'>
                  {{ t('widgets.config.defaultFilters === configData.defaultFilters=3"
                  class === w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                  :placeholder === t('widgets.config.defaultFiltersPlaceholder=space-y-2">
                <label  class === flex items-center=configData.showTimestamps='checkbox === mr-2
                  >
                  <span  class === text-sm text-gray-700'>{{ t('widgets.config.showTimestamps === flex items-center=configData.showPagination=checkbox='mr-2"
                  >
                  <span  class === text-sm text-gray-700'>{{ t('widgets.config.showPagination === flex items-center=configData.enableSearch=checkbox='mr-2"
                  >
                  <span  class === text-sm text-gray-700'>{{ t('widgets.config.enableSearch === flex items-center=configData.enableSort=checkbox='mr-2"
                  >
                  <span  class === text-sm text-gray-700'>{{ t('widgets.config.enableSort === activeTab === 'style=space-y-4>
              <!-- Thème -->
              <div>
                <label  class === block text-sm font-medium text-gray-700 mb-2'>
                  {{ t('widgets.config.theme === configData.theme=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500
                >
                  <option  value === default=minimal='dark === colorful=block text-sm font-medium text-gray-700 mb-2>
                  {{ t('widgets.config.accentColor === flex items-center space-x-3'>
                  <input  
                    v-model === configData.accentColor=color=w-12 h-10 border border-gray-300 rounded-md === configData.accentColor=text='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500""
                    placeholder === #6366f1'
                  >
                </div>
              </div>

              <!-- Bordures -->
              <div>
                <label class === block text-sm font-medium text-gray-700 mb-2>
                  {{ t('widgets.config.borderRadius === "configData.borderRadius=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                >
                  <option  value === none=sm === md='lg=xl === block text-sm font-medium text-gray-700 mb-2>
                  {{ t('widgets.config.shadow === configData.shadow=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                >
                  <option  value === none=sm === md='lg=xl === block text-sm font-medium text-gray-700 mb-2>
                  {{ t('widgets.config.customCSS === configData.customCSS=4'
                  class === w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm=t('widgets.config.customCSSPlaceholder === activeTab === 'specific='space-y-4">
              <div  v-if === configOptions && configOptions.length &gt; 0'>
                <div v-for === option in configOptions=option.key=mb-4>
                  <!-- Option de type texte -->
                  <div  v-if === option.type === 'text=block text-sm font-medium text-gray-700 mb-2'>
                      {{ t(option.label) }}
                      <span v-if class="option.required=text-red-500>*</span>
                    </label>
                    <input  
                      v-model="configData.specific[option.key]'
                      type""
                      :placeholder="t(option.placeholder || '')'
                    >
                    <p v-if="option.help=text-xs text-gray-500 mt-1>{{ t(option.help) }}</p>
                  </div>

                  <!-- Option de type nombre -->
                  <div  v-else-if=""option.type === 'number=block text-sm font-medium text-gray-700 mb-2'>
                      {{ t(option.label) }}
                      <span v-if class="option.required=text-red-500>*</span>
                    </label>
                    <input  
                      v-model.number="configData.specific[option.key]'
                      type="number""option.step=option.required"option.type === 'select=block text-sm font-medium text-gray-700 mb-2'>
                      {{ t(option.label) }}
                      <span v-if class="option.required=text-red-500>*</span>
                    </label>
                    <select 
                      v-model="configData.specific[option.key]'
                      :required"choice in option.options=choice.value=choice.value='option.help=text-xs text-gray-500 mt-1">{{ t(option.help) }}</p>
                  </div>

                  <!-- Option de type case à cocher -->
                  <div  v-else-if="option.type === 'checkbox=flex items-center=configData.specific[option.key]'
                        type="checkbox=mr-2
                      >
                      <span  class class="text-sm text-gray-700'>{{ t(option.label) }}</span>
                    </label>
                    <p v-if="option.help=text-xs text-gray-500 mt-1 ml-6>{{ t(option.help) }}</p>
                  </div>

                  <!-- Option de type zone de texte -->
                  <div  v-else-if="option.type === 'textarea=block text-sm font-medium text-gray-700 mb-2'>
                      {{ t(option.label) }}
                      <span v-if class="option.required=text-red-500>*</span>
                    </label>
                    <textarea 
                      v-model="configData.specific[option.key]'
                      :rows"
                      :requiredoption.help=text-xs text-gray-500 mt-1'>{{ t(option.help) }}</p>
                  </div>
                </div>
              </div>
              
              <div v-else class="text-center py-8 text-gray-500>
                <i  class="fas fa-cog text-3xl mb-2'></i>
                <p>{{ t('widgets.config.noSpecificOptions="flex justify-between items-center pt-6 border-t border-gray-200>
            <div  class="flex space-x-3'>
              <button 
                type="button
              >
                <i  class="fas fa-undo mr-2'></i>
                {{ t('widgets.config.resetDefaults=""button=previewChanges=px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100'
              >
                <i class="fas fa-eye mr-2"></i>
                {{ t('widgets.config.preview="flex space-x-3'>
              <button
                type="button"
              >
                {{ t('common.cancel="submit=loading='px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                <i v-if="loading=fas fa-spinner fa-spin mr-2"></i>
                {{ t('common.save') }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'

export default {
  name: 'WidgetConfigModal',
  props: {
    widget: {
      type: Object,
      required: true
    },
    configOptions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const { t } = useTranslation()

    const { success, error: showError } = useNotifications()
    const { t } = useTranslation()
    
    const loading = ref(false)
    const activeTab = ref('general')
    const showIconPicker = ref(false)
    
    const tabs = ref([
      { id: 'general', label: 'widgets.config.tabs.general', icon: 'fas fa-info-circle' },
      { id: 'layout', label: 'widgets.config.tabs.layout', icon: 'fas fa-th-large' },
      { id: 'data', label: 'widgets.config.tabs.data', icon: 'fas fa-database' },
      { id: 'style', label: 'widgets.config.tabs.style', icon: 'fas fa-palette' },
      { id: 'specific', label: 'widgets.config.tabs.specific', icon: 'fas fa-cogs' }
    ])
    
    const configData = ref({
      // Configuration générale
      title: '',
      description: '',
      icon: '',
      showHeader: true,
      showActions: true,
      isCollapsible: true,
      isResizable: true,
      
      // Configuration de mise en page
      position: {
        x: 0,
        y: 0
      },
      size: {
        width: 6,
        height: 4
      },
      order: 0,
      
      // Configuration des données
      itemLimit: 10,
      refreshInterval: 0,
      defaultFilters: '',
      showTimestamps: true,
      showPagination: true,
      enableSearch: true,
      enableSort: true,
      
      // Configuration du style
      theme: 'default',
      accentColor: '#6366f1',
      borderRadius: 'md',
      shadow: 'md',
      customCSS: '',
      
      // Configuration spécifique au widget
      specific: {}
    })
    
    const closeModal = () => {
      emit('close')
    }
    
    const saveConfig = async () => {
      loading.value = true
      try {
        // Valider la configuration
        if (!configData.value.title.trim()) {
          showError(t('widgets.config.titleRequired'))
          return
        }
        
        // Créer l'objet de configuration final
        const finalConfig = {
          ...props.widget,
          ...configData.value,
          updatedAt: new Date().toISOString()
        }
        
        emit('save', finalConfig)
        success(t('widgets.config.saved'))
        closeModal()
      } catch (err) {
        showError(t('widgets.config.saveError'))
      } finally {
        loading.value = false
      }
    }
    
    const resetToDefaults = () => {
      if (confirm(t('widgets.config.confirmReset'))) {
        initializeConfig()
        success(t('widgets.config.resetSuccess'))
      }
    }
    
    const previewChanges = () => {
      // Émettre un événement de prévisualisation
      emit('preview', configData.value)
    }
    
    const initializeConfig = () => {
      // Initialiser avec les valeurs du widget existant
      if (props.widget) {
        configData.value = {
          ...configData.value,
          title: props.widget.title || '',
          description: props.widget.description || '',
          icon: props.widget.icon || 'fas fa-cube',
          showHeader: props.widget.showHeader !== undefined ? props.widget.showHeader : true,
          showActions: props.widget.showActions !== undefined ? props.widget.showActions : true,
          isCollapsible: props.widget.isCollapsible !== undefined ? props.widget.isCollapsible : true,
          isResizable: props.widget.isResizable !== undefined ? props.widget.isResizable : true,
          position: {
            x: props.widget.position?.x || 0,
            y: props.widget.position?.y || 0
          },
          size: {
            width: props.widget.size?.width || 6,
            height: props.widget.size?.height || 4
          },
          order: props.widget.order || 0,
          itemLimit: props.widget.itemLimit || 10,
          refreshInterval: props.widget.refreshInterval || 0,
          defaultFilters: props.widget.defaultFilters || '',
          showTimestamps: props.widget.showTimestamps !== undefined ? props.widget.showTimestamps : true,
          showPagination: props.widget.showPagination !== undefined ? props.widget.showPagination : true,
          enableSearch: props.widget.enableSearch !== undefined ? props.widget.enableSearch : true,
          enableSort: props.widget.enableSort !== undefined ? props.widget.enableSort : true,
          theme: props.widget.theme || 'default',
          accentColor: props.widget.accentColor || '#6366f1',
          borderRadius: props.widget.borderRadius || 'md',
          shadow: props.widget.shadow || 'md',
          customCSS: props.widget.customCSS || '',
          specific: { ...props.widget.specific } || {}
        }
        
        // Initialiser les options spécifiques
        if (props.configOptions && props.configOptions.length > 0) {
          props.configOptions.forEach(option => {
            if (configData.value.specific[option.key] === undefined) {
              configData.value.specific[option.key] = option.default || ''
            }
          })
        }
      }
    }
    
    // Surveiller les changements du widget
    watch(() => props.widget, () => {
      initializeConfig()
    }, { immediate: true })
    
    onMounted(() => {
      initializeConfig()
    })
    
    return {
      loading,
      activeTab,
      showIconPicker,
      tabs,
      configData,
      closeModal,
      saveConfig,
      resetToDefaults,
      previewChanges,
      t
    }
  }
}
</script>

<style scoped>
.tab-content {
  min-height: 400px;
}

.widget-config-modal {
  max-height: 90vh;
  overflow-y: auto;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.color-picker {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.icon-preview {
  transition: all 0.2s ease;
}

.icon-preview:hover {
  transform: scale(1.1);
}
</style>