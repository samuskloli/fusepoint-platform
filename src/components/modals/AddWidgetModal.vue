<template>
  <div v-if="isOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white" @click.stop>
      <!-- En-tête -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-plus text-blue-600"></i>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">{{ t('widgets.addWidget') }}</h3>
            <p class="text-sm text-gray-600">{{ t('widgets.addWidgetDescription') }}</p>
          </div>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <!-- Contenu -->
      <div class="py-6">
        <!-- Indicateur de chargement -->
        <div v-if="loading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">{{ t('common.loading') }}...</span>
        </div>
        
        <!-- Message si aucun widget disponible -->
        <div v-else-if="!loading && availableWidgets.length === 0" class="text-center py-8">
          <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-puzzle-piece text-gray-400 text-2xl"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">{{ t('widgets.noAvailableWidgets') }}</h3>
          <p class="text-gray-600">{{ t('widgets.allWidgetsAdded') }}</p>
        </div>
        
        <!-- Liste des widgets -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="widget in availableWidgets" 
            :key="widget.id"
            @click="toggleSelection(widget)"
            class="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors relative"
            :class="{ 'border-blue-500 bg-blue-50': isSelected(widget) }"
          >
            <div class="absolute top-3 right-3">
              <input type="checkbox" :checked="isSelected(widget)" @change.prevent="toggleSelection(widget)" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 rounded-lg flex items-center justify-center" :style="{ backgroundColor: widget.color + '20', color: widget.color }">
                <i :class="widget.icon" class="text-xl"></i>
              </div>
              <div class="flex-1">
                <h4 class="font-medium text-gray-900">{{ widget.name || t(widget.titleKey) }}</h4>
                <p class="text-sm text-gray-600">{{ widget.description || t(widget.descriptionKey) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button 
          @click="closeModal" 
          type="button" 
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {{ t('common.cancel') }}
        </button>
        <button 
          @click="addWidget" 
          :disabled="selectedWidgets.length === 0"
          type="button" 
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ selectedWidgets.length > 1 ? t('widgets.addMultiple', { count: selectedWidgets.length }) : t('widgets.addWidget') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import widgetsCatalogService from '@/services/widgetsCatalogService'
import { componentNameToType, SUPPORTED_COMPONENTS_SET } from '@/utils/widgetsMap'

const { t } = useI18n()

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  existingWidgets: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'add-widget'])

const selectedWidgets = ref([])
const allWidgets = ref([])
const loading = ref(false)

// Fonction pour obtenir l'icône d'un widget basé sur sa catégorie ou son nom
const getWidgetIcon = (widget) => {
  if (widget.icon) return widget.icon
  
  // Icônes par défaut basées sur la catégorie
  const categoryIcons = {
    'project-management': 'fas fa-tasks',
    'analytics': 'fas fa-chart-bar',
    'files': 'fas fa-folder',
    'team-management': 'fas fa-users',
    'planning': 'fas fa-calendar',
    'communication': 'fas fa-comments',
    'ai': 'fas fa-robot',
    'productivity': 'fas fa-sticky-note',
    'development': 'fas fa-code',
    'finance': 'fas fa-dollar-sign',
    'security': 'fas fa-shield-alt',
    'system': 'fas fa-cog'
  }
  
  return categoryIcons[widget.category] || 'fas fa-puzzle-piece'
}

// Fonction pour obtenir la couleur d'un widget basé sur sa catégorie
const getWidgetColor = (widget) => {
  const categoryColors = {
    'project-management': '#3B82F6',
    'analytics': '#10B981',
    'files': '#F59E0B',
    'team-management': '#8B5CF6',
    'planning': '#EF4444',
    'communication': '#06B6D4',
    'ai': '#EC4899',
    'productivity': '#84CC16',
    'development': '#6366F1',
    'finance': '#F97316',
    'security': '#DC2626',
    'system': '#6B7280'
  }
  
  return categoryColors[widget.category] || '#6B7280'
}

// Charger les widgets depuis l'API
const loadWidgets = async () => {
  loading.value = true
  try {
    const result = await widgetsCatalogService.getWidgets()
    if (result.success) {
      allWidgets.value = result.data.map(widget => {
        const cname = widget.component_name || widget.name
        const resolvedType = componentNameToType(cname)
        return {
          id: widget.id,
          type: resolvedType,
          widget_type: resolvedType,
          name: widget.name,
          titleKey: `widgets.${(widget.component_name?.toLowerCase() || widget.name.toLowerCase())}.title`,
          descriptionKey: `widgets.${(widget.component_name?.toLowerCase() || widget.name.toLowerCase())}.description`,
          icon: getWidgetIcon(widget),
          color: getWidgetColor(widget),
          category: widget.category,
          description: widget.description,
          component_name: cname,
          is_active: widget.is_active
        }
      })
    }
  } catch (error) {
    console.error('Erreur lors du chargement des widgets:', error)
  } finally {
    loading.value = false
  }
}

const availableWidgets = computed(() => {
  if (!allWidgets.value.length) return []
  
  // Filtrer les widgets déjà ajoutés (utiliser widget_type du projet)
  const existingTypes = props.existingWidgets.map(w => w.widget_type || w.component_name)
  return allWidgets.value.filter(widget => {
    const compName = (widget.component_name || widget.name || '').toLowerCase()
    return (
      widget.is_active &&
      !!widget.type &&
      SUPPORTED_COMPONENTS_SET.has(compName) &&
      !existingTypes.includes(widget.type) &&
      !existingTypes.includes(widget.component_name)
    )
  })
})

// Charger les widgets quand le modal s'ouvre
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && allWidgets.value.length === 0) {
    loadWidgets()
  }
})

onMounted(() => {
  if (props.isOpen) {
    loadWidgets()
  }
})

const isSelected = (widget) => selectedWidgets.value.some(w => w.id === widget.id)
const toggleSelection = (widget) => {
  const idx = selectedWidgets.value.findIndex(w => w.id === widget.id)
  if (idx >= 0) {
    selectedWidgets.value.splice(idx, 1)
  } else {
    selectedWidgets.value.push(widget)
  }
}

const addWidget = () => {
  if (selectedWidgets.value.length) {
    emit('add-widget', [...selectedWidgets.value])
    closeModal()
  }
}

const closeModal = () => {
  selectedWidgets.value = []
  emit('close')
}
</script>

<style scoped>
/* Styles spécifiques au modal */
</style>