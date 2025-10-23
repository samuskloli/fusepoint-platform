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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="widget in availableWidgets" 
            :key="widget.type"
            @click="selectWidget(widget)"
            class="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
            :class="{ 'border-blue-500 bg-blue-50': selectedWidget?.type === widget.type }"
          >
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 rounded-lg flex items-center justify-center" :style="{ backgroundColor: widget.color + '20', color: widget.color }">
                <i :class="widget.icon" class="text-xl"></i>
              </div>
              <div class="flex-1">
                <h4 class="font-medium text-gray-900">{{ t(widget.titleKey) }}</h4>
                <p class="text-sm text-gray-600">{{ t(widget.descriptionKey) }}</p>
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
          :disabled="!selectedWidget"
          type="button" 
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ t('widgets.addWidget') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

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

const selectedWidget = ref(null)

const availableWidgets = computed(() => {
  const allWidgets = [
    {
      type: 'tasks',
      titleKey: 'widgets.tasks.title',
      descriptionKey: 'widgets.tasks.description',
      icon: 'fas fa-tasks',
      color: '#3B82F6'
    },
    {
      type: 'stats',
      titleKey: 'widgets.stats.title',
      descriptionKey: 'widgets.stats.description',
      icon: 'fas fa-chart-bar',
      color: '#10B981'
    },
    {
      type: 'files',
      titleKey: 'widgets.files.title',
      descriptionKey: 'widgets.files.description',
      icon: 'fas fa-folder',
      color: '#F59E0B'
    },
    {
      type: 'team',
      titleKey: 'widgets.team.title',
      descriptionKey: 'widgets.team.description',
      icon: 'fas fa-users',
      color: '#8B5CF6'
    },
    {
      type: 'calendar',
      titleKey: 'widgets.calendar.title',
      descriptionKey: 'widgets.calendar.description',
      icon: 'fas fa-calendar',
      color: '#EF4444'
    },
    {
      type: 'notes',
      titleKey: 'widgets.notes.title',
      descriptionKey: 'widgets.notes.description',
      icon: 'fas fa-sticky-note',
      color: '#06B6D4'
    },
    {
      type: 'deliverables',
      titleKey: 'widgets.deliverables.title',
      descriptionKey: 'widgets.deliverables.description',
      icon: 'fas fa-clipboard-check',
      color: '#22C55E'
    }
  ]
  
  // Filtrer les widgets déjà ajoutés (utiliser widget_type du projet)
  const existingTypes = props.existingWidgets.map(w => w.widget_type)
  return allWidgets.filter(widget => !existingTypes.includes(widget.type))
})

const selectWidget = (widget) => {
  selectedWidget.value = widget
}

const addWidget = () => {
  if (selectedWidget.value) {
    emit('add-widget', selectedWidget.value)
    closeModal()
  }
}

const closeModal = () => {
  selectedWidget.value = null
  emit('close')
}
</script>

<style scoped>
/* Styles spécifiques au modal */
</style>