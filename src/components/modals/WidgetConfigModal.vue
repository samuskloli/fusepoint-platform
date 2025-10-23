<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white" @click.stop>
      <!-- En-tête -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-cog text-purple-600"></i>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">{{ t('widgets.configureWidget') }}</h3>
            <p class="text-sm text-gray-600">{{ t(widget.titleKey || 'widgets.title') }}</p>
          </div>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <!-- Contenu principal -->
      <div class="mt-6">
        <form @submit.prevent="saveConfig">
          <!-- Onglets -->
          <div class="mb-6">
            <nav class="flex space-x-8" aria-label="Tabs">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                @click="activeTab = tab.id"
                :class="{
                  'border-purple-500 text-purple-600': activeTab === tab.id,
                  'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== tab.id
                }"
                class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
              >
                <i :class="tab.icon" class="mr-2"></i>
                {{ t(tab.label) }}
              </button>
            </nav>
          </div>

          <!-- Contenu des onglets -->
          <div class="tab-content">
            <!-- Onglet Général -->
            <div v-if="activeTab === 'general'" class="space-y-4">
              <!-- Titre du widget -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('widgets.config.title') }}
                </label>
                <input
                  v-model="configData.title"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  :placeholder="t('widgets.config.enterTitle')"
                >
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('widgets.config.description') }}
                </label>
                <textarea
                  v-model="configData.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  :placeholder="t('widgets.config.enterDescription')"
                ></textarea>
              </div>

              <!-- Icône -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('widgets.config.icon') }}
                </label>
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <i :class="configData.icon || 'fas fa-cube'" class="text-gray-600"></i>
                  </div>
                  <input
                    v-model="configData.icon"
                    type="text"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    :placeholder="t('widgets.config.iconPlaceholder')"
                  >
                  <button
                    type="button"
                    @click="showIconPicker = true"
                    class="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    <i class="fas fa-palette"></i>
                  </button>
                </div>
              </div>

              <!-- Options d'affichage -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="flex items-center">
                    <input
                      v-model="configData.showHeader"
                      type="checkbox"
                      class="mr-2"
                    >
                    <span class="text-sm text-gray-700">{{ t('widgets.config.showHeader') }}</span>
                  </label>
                </div>
                <div>
                  <label class="flex items-center">
                    <input
                      v-model="configData.showActions"
                      type="checkbox"
                      class="mr-2"
                    >
                    <span class="text-sm text-gray-700">{{ t('widgets.config.showActions') }}</span>
                  </label>
                </div>
                <div>
                  <label class="flex items-center">
                    <input
                      v-model="configData.isCollapsible"
                      type="checkbox"
                      class="mr-2"
                    >
                    <span class="text-sm text-gray-700">{{ t('widgets.config.isCollapsible') }}</span>
                  </label>
                </div>
                <div>
                  <label class="flex items-center">
                    <input
                      v-model="configData.isResizable"
                      type="checkbox"
                      class="mr-2"
                    >
                    <span class="text-sm text-gray-700">{{ t('widgets.config.isResizable') }}</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Onglet Layout -->
            <div v-if="activeTab === 'layout'" class="space-y-4">
              <!-- Position -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ t('widgets.config.position.x') }}
                  </label>
                  <input
                    v-model.number="configData.position.x"
                    type="number"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ t('widgets.config.position.y') }}
                  </label>
                  <input
                    v-model.number="configData.position.y"
                    type="number"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                </div>
              </div>

              <!-- Taille -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ t('widgets.config.size.width') }}
                  </label>
                  <input
                    v-model.number="configData.size.width"
                    type="number"
                    min="1"
                    max="12"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                  <p class="text-xs text-gray-500 mt-1">{{ t('widgets.config.size.widthHelp') }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ t('widgets.config.size.height') }}
                  </label>
                  <input
                    v-model.number="configData.size.height"
                    type="number"
                    min="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                  <p class="text-xs text-gray-500 mt-1">{{ t('widgets.config.size.heightHelp') }}</p>
                </div>
              </div>

              <!-- Ordre -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('widgets.config.order') }}
                </label>
                <input
                  v-model.number="configData.order"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                <p class="text-xs text-gray-500 mt-1">{{ t('widgets.config.orderHelp') }}</p>
              </div>
            </div>

            <!-- Onglet Données -->
            <div v-if="activeTab === 'data'" class="space-y-4">
              <!-- Limite d'éléments -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('widgets.config.itemLimit') }}
                </label>
                <input
                  v-model.number="configData.itemLimit"
                  type="number"
                  min="1"
                  max="100"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                <p class="text-xs text-gray-500 mt-1">{{ t('widgets.config.itemLimitHelp') }}</p>
              </div>

              <!-- Intervalle de rafraîchissement -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('widgets.config.refreshInterval') }}
                </label>
                <select
                  v-model.number="configData.refreshInterval"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option :value="0">{{ t('widgets.config.noAutoRefresh') }}</option>
                  <option :value="30">{{ t('widgets.config.every30Seconds') }}</option>
                  <option :value="60">{{ t('widgets.config.every1Minute') }}</option>
                  <option :value="300">{{ t('widgets.config.every5Minutes') }}</option>
                  <option :value="900">{{ t('widgets.config.every15Minutes') }}</option>
                  <option :value="1800">{{ t('widgets.config.every30Minutes') }}</option>
                  <option :value="3600">{{ t('widgets.config.every1Hour') }}</option>
                </select>
              </div>

              <!-- Filtres par défaut -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('widgets.config.defaultFilters') }}
                </label>
                <textarea
                  v-model="configData.defaultFilters"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  :placeholder="t('widgets.config.defaultFiltersPlaceholder')"
                ></textarea>
              </div>

              <!-- Options d'affichage des données -->
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="configData.showTimestamps"
                    type="checkbox"
                    class="mr-2"
                  >
                  <span class="text-sm text-gray-700">{{ t('widgets.config.showTimestamps') }}</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="configData.showPagination"
                    type="checkbox"
                    class="mr-2"
                  >
                  <span class="text-sm text-gray-700">{{ t('widgets.config.showPagination') }}</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="configData.enableSearch"
                    type="checkbox"
                    class="mr-2"
                  >
                  <span class="text-sm text-gray-700">{{ t('widgets.config.enableSearch') }}</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="configData.enableSort"
                    type="checkbox"
                    class="mr-2"
                  >
                  <span class="text-sm text-gray-700">{{ t('widgets.config.enableSort') }}</span>
                </label>
              </div>
            </div>

            <!-- Onglet Style -->
            <div v-if="activeTab === 'style'" class="space-y-4">
              <!-- Thème -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('widgets.config.theme') }}
                </label>
                <select
                  v-model="configData.theme"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="default">{{ t('widgets.config.themes.default') }}</option>
                  <option value="minimal">{{ t('widgets.config.themes.minimal') }}</option>
                  <option value="dark">{{ t('widgets.config.themes.dark') }}</option>
                  <option value="colorful">{{ t('widgets.config.themes.colorful') }}</option>
                </select>
              </div>

              <!-- Couleur d'accent -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('widgets.config.accentColor') }}
                </label>
                <div class="flex items-center space-x-3">
                  <input
                    v-model="configData.accentColor"
                    type="color"
                    class="w-12 h-10 border border-gray-300 rounded-md"
                  >
                  <input
                    v-model="configData.accentColor"
                    type="text"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="#6366f1"
                  >
                </div>
              </div>

              <!-- Bordures -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('widgets.config.borderRadius') }}
                </label>
                <select
                  v-model="configData.borderRadius"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="none">{{ t('widgets.config.borderRadius.none') }}</option>
                  <option value="sm">{{ t('widgets.config.borderRadius.sm') }}</option>
                  <option value="md">{{ t('widgets.config.borderRadius.md') }}</option>
                  <option value="lg">{{ t('widgets.config.borderRadius.lg') }}</option>
                  <option value="xl">{{ t('widgets.config.borderRadius.xl') }}</option>
                </select>
              </div>

              <!-- Ombre -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('widgets.config.shadow') }}
                </label>
                <select
                  v-model="configData.shadow"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="none">{{ t('widgets.config.shadow.none') }}</option>
                  <option value="sm">{{ t('widgets.config.shadow.sm') }}</option>
                  <option value="md">{{ t('widgets.config.shadow.md') }}</option>
                  <option value="lg">{{ t('widgets.config.shadow.lg') }}</option>
                  <option value="xl">{{ t('widgets.config.shadow.xl') }}</option>
                </select>
              </div>

              <!-- CSS personnalisé -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('widgets.config.customCSS') }}
                </label>
                <textarea
                  v-model="configData.customCSS"
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  :placeholder="t('widgets.config.customCSSPlaceholder')"
                ></textarea>
              </div>
            </div>

            <!-- Onglet Spécifique -->
            <div v-if="activeTab === 'specific'" class="space-y-4">
              <div v-if="configOptions && configOptions.length > 0">
                <div v-for="option in configOptions" :key="option.key" class="mb-4">
                  <!-- Option de type texte -->
                  <div v-if="option.type === 'text'">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {{ t(option.label) }}
                      <span v-if="option.required" class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="configData.specific[option.key]"
                      type="text"
                      :required="option.required"
                      :placeholder="t(option.placeholder || '')"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                    <p v-if="option.help" class="text-xs text-gray-500 mt-1">{{ t(option.help) }}</p>
                  </div>

                  <!-- Option de type nombre -->
                  <div v-else-if="option.type === 'number'">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {{ t(option.label) }}
                      <span v-if="option.required" class="text-red-500">*</span>
                    </label>
                    <input
                      v-model.number="configData.specific[option.key]"
                      type="number"
                      :min="option.min"
                      :max="option.max"
                      :step="option.step"
                      :required="option.required"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                    <p v-if="option.help" class="text-xs text-gray-500 mt-1">{{ t(option.help) }}</p>
                  </div>

                  <!-- Option de type sélection -->
                  <div v-else-if="option.type === 'select'">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {{ t(option.label) }}
                      <span v-if="option.required" class="text-red-500">*</span>
                    </label>
                    <select
                      v-model="configData.specific[option.key]"
                      :required="option.required"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option v-for="choice in option.options" :key="choice.value" :value="choice.value">
                        {{ t(choice.label) }}
                      </option>
                    </select>
                    <p v-if="option.help" class="text-xs text-gray-500 mt-1">{{ t(option.help) }}</p>
                  </div>

                  <!-- Option de type case à cocher -->
                  <div v-else-if="option.type === 'checkbox'">
                    <label class="flex items-center">
                      <input
                        v-model="configData.specific[option.key]"
                        type="checkbox"
                        class="mr-2"
                      >
                      <span class="text-sm text-gray-700">{{ t(option.label) }}</span>
                    </label>
                    <p v-if="option.help" class="text-xs text-gray-500 mt-1 ml-6">{{ t(option.help) }}</p>
                  </div>

                  <!-- Option de type zone de texte -->
                  <div v-else-if="option.type === 'textarea'">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {{ t(option.label) }}
                      <span v-if="option.required" class="text-red-500">*</span>
                    </label>
                    <textarea
                      v-model="configData.specific[option.key]"
                      :rows="option.rows || 3"
                      :required="option.required"
                      :placeholder="t(option.placeholder || '')"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    ></textarea>
                    <p v-if="option.help" class="text-xs text-gray-500 mt-1">{{ t(option.help) }}</p>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-8 text-gray-500">
                <i class="fas fa-cog text-3xl mb-2"></i>
                <p>{{ t('widgets.config.noSpecificOptions') }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-between items-center pt-6 border-t border-gray-200">
            <div class="flex space-x-3">
              <button
                type="button"
                @click="resetToDefaults"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                <i class="fas fa-undo mr-2"></i>
                {{ t('widgets.config.resetDefaults') }}
              </button>
              <button
                type="button"
                @click="previewChanges"
                class="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
              >
                <i class="fas fa-eye mr-2"></i>
                {{ t('widgets.config.preview') }}
              </button>
            </div>
            <div class="flex space-x-3">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
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
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import { useToast } from '@/composables/useToast'

export default {
  name: 'WidgetConfigModal',
  props: {
    widget: {
      type: Object,
      required: true
    },
    visible: {
      type: Boolean,
      default: false
    },
    configOptions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'save', 'preview'],
  setup(props, { emit }) {
    const { t } = useTranslation()
    const { showToast } = useToast()

    // État réactif
    const loading = ref(false)
    const activeTab = ref('general')
    const showIconPicker = ref(false)

    // Configuration du widget
    const configData = reactive({
      title: '',
      description: '',
      icon: 'fas fa-cube',
      showHeader: true,
      showActions: true,
      isCollapsible: false,
      isResizable: true,
      position: {
        x: 0,
        y: 0
      },
      size: {
        width: 4,
        height: 3
      },
      order: 0,
      itemLimit: 10,
      refreshInterval: 0,
      defaultFilters: '',
      showTimestamps: true,
      showPagination: true,
      enableSearch: true,
      enableSort: true,
      theme: 'default',
      accentColor: '#6366f1',
      borderRadius: 'md',
      shadow: 'sm',
      customCSS: '',
      specific: {}
    })

    // Onglets de configuration
    const tabs = [
      {
        id: 'general',
        label: 'widgets.config.tabs.general',
        icon: 'fas fa-cog'
      },
      {
        id: 'layout',
        label: 'widgets.config.tabs.layout',
        icon: 'fas fa-th-large'
      },
      {
        id: 'data',
        label: 'widgets.config.tabs.data',
        icon: 'fas fa-database'
      },
      {
        id: 'style',
        label: 'widgets.config.tabs.style',
        icon: 'fas fa-palette'
      },
      {
        id: 'specific',
        label: 'widgets.config.tabs.specific',
        icon: 'fas fa-sliders-h'
      }
    ]

    // Méthodes
    const closeModal = () => {
      emit('close')
    }

    const saveConfig = async () => {
      try {
        loading.value = true
        
        // Validation des données
        if (!configData.title.trim()) {
          showToast(t('widgets.config.errors.titleRequired'), 'error')
          return
        }

        // Émission de l'événement de sauvegarde
        emit('save', { ...configData })
        
        showToast(t('widgets.config.success.saved'), 'success')
        closeModal()
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        showToast(t('widgets.config.errors.saveFailed'), 'error')
      } finally {
        loading.value = false
      }
    }

    const resetToDefaults = () => {
      // Réinitialiser aux valeurs par défaut
      Object.assign(configData, {
        title: props.widget.title || '',
        description: props.widget.description || '',
        icon: props.widget.icon || 'fas fa-cube',
        showHeader: true,
        showActions: true,
        isCollapsible: false,
        isResizable: true,
        position: { x: 0, y: 0 },
        size: { width: 4, height: 3 },
        order: 0,
        itemLimit: 10,
        refreshInterval: 0,
        defaultFilters: '',
        showTimestamps: true,
        showPagination: true,
        enableSearch: true,
        enableSort: true,
        theme: 'default',
        accentColor: '#6366f1',
        borderRadius: 'md',
        shadow: 'sm',
        customCSS: '',
        specific: {}
      })
      
      showToast(t('widgets.config.success.reset'), 'info')
    }

    const previewChanges = () => {
      emit('preview', { ...configData })
    }

    // Initialisation
    const initializeConfig = () => {
      if (props.widget && props.widget.config) {
        Object.assign(configData, props.widget.config)
      }
      
      // Initialiser les options spécifiques
      if (props.configOptions) {
        props.configOptions.forEach(option => {
          if (!(option.key in configData.specific)) {
            configData.specific[option.key] = option.default || null
          }
        })
      }
    }

    // Watchers
    watch(() => props.widget, initializeConfig, { immediate: true })
    watch(() => props.configOptions, initializeConfig)

    onMounted(() => {
      initializeConfig()
    })

    return {
      // État
      loading,
      activeTab,
      showIconPicker,
      configData,
      tabs,
      
      // Méthodes
      closeModal,
      saveConfig,
      resetToDefaults,
      previewChanges,
      
      // Composables
      t
    }
  }
}
</script>

<style scoped>
.tab-content {
  min-height: 400px;
}

.widget-preview {
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background-color: #f9fafb;
}

.color-picker {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.icon-option {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-option:hover {
  background-color: #f3f4f6;
  border-color: #6366f1;
}

.icon-option.selected {
  background-color: #6366f1;
  color: white;
  border-color: #6366f1;
}
</style>