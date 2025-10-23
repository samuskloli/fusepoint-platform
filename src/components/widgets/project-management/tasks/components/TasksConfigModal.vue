<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">{{ t('widgets.tasks.configuration') }}</h3>
        <button @click="$emit('close')" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Affichage -->
        <div class="config-section">
          <h4 class="section-title">{{ t('widgets.tasks.config.display') }}</h4>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                v-model="form.showStats" 
                type="checkbox" 
                class="checkbox-input"
              >
              <span class="checkbox-text">{{ t('widgets.tasks.config.showStats') }}</span>
            </label>
            <p class="form-help">{{ t('widgets.tasks.config.showStatsHelp') }}</p>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                v-model="form.showFilters" 
                type="checkbox" 
                class="checkbox-input"
              >
              <span class="checkbox-text">{{ t('widgets.tasks.config.showFilters') }}</span>
            </label>
            <p class="form-help">{{ t('widgets.tasks.config.showFiltersHelp') }}</p>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                v-model="form.showAssignee" 
                type="checkbox" 
                class="checkbox-input"
              >
              <span class="checkbox-text">{{ t('widgets.tasks.config.showAssignee') }}</span>
            </label>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                v-model="form.showDueDate" 
                type="checkbox" 
                class="checkbox-input"
              >
              <span class="checkbox-text">{{ t('widgets.tasks.config.showDueDate') }}</span>
            </label>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                v-model="form.showPriority" 
                type="checkbox" 
                class="checkbox-input"
              >
              <span class="checkbox-text">{{ t('widgets.tasks.config.showPriority') }}</span>
            </label>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                v-model="form.showTags" 
                type="checkbox" 
                class="checkbox-input"
              >
              <span class="checkbox-text">{{ t('widgets.tasks.config.showTags') }}</span>
            </label>
          </div>
        </div>
        
        <!-- Vue par défaut -->
        <div class="config-section">
          <h4 class="section-title">{{ t('widgets.tasks.config.defaultView') }}</h4>
          
          <div class="form-group">
            <label class="form-label">{{ t('widgets.tasks.config.viewType') }}</label>
            <select v-model="form.defaultView" class="form-select">
              <option value="list">{{ t('widgets.tasks.config.listView') }}</option>
              <option value="kanban">{{ t('widgets.tasks.config.kanbanView') }}</option>
              <option value="calendar">{{ t('widgets.tasks.config.calendarView') }}</option>
            </select>
          </div>
        </div>
        
        <!-- Pagination -->
        <div class="config-section">
          <h4 class="section-title">{{ t('widgets.tasks.config.pagination') }}</h4>
          
          <div class="form-group">
            <label class="form-label">{{ t('widgets.tasks.config.itemsPerPage') }}</label>
            <select v-model.number="form.itemsPerPage" class="form-select">
              <option :value="5">5 {{ t('widgets.tasks.config.items') }}</option>
              <option :value="10">10 {{ t('widgets.tasks.config.items') }}</option>
              <option :value="20">20 {{ t('widgets.tasks.config.items') }}</option>
              <option :value="50">50 {{ t('widgets.tasks.config.items') }}</option>
            </select>
          </div>
        </div>
        
        <!-- Actualisation automatique -->
        <div class="config-section">
          <h4 class="section-title">{{ t('widgets.tasks.config.autoRefresh') }}</h4>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                v-model="form.autoRefresh" 
                type="checkbox" 
                class="checkbox-input"
              >
              <span class="checkbox-text">{{ t('widgets.tasks.config.enableAutoRefresh') }}</span>
            </label>
            <p class="form-help">{{ t('widgets.tasks.config.autoRefreshHelp') }}</p>
          </div>
          
          <div v-if="form.autoRefresh" class="form-group">
            <label class="form-label">{{ t('widgets.tasks.config.refreshInterval') }}</label>
            <select v-model.number="form.refreshInterval" class="form-select">
              <option :value="30">30 {{ t('widgets.tasks.config.seconds') }}</option>
              <option :value="60">1 {{ t('widgets.tasks.config.minute') }}</option>
              <option :value="300">5 {{ t('widgets.tasks.config.minutes') }}</option>
              <option :value="600">10 {{ t('widgets.tasks.config.minutes') }}</option>
            </select>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="modal-actions">
          <button type="button" @click="resetToDefaults" class="btn-secondary">
            {{ t('widgets.tasks.config.resetDefaults') }}
          </button>
          <div class="action-buttons">
            <button type="button" @click="$emit('close')" class="btn-secondary">
              {{ t('common.cancel') }}
            </button>
            <button type="submit" class="btn-primary" :disabled="loading">
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              {{ t('common.save') }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import type { TasksWidgetConfig } from '../types'

interface Props {
  config: any
}

interface Emits {
  close: []
  save: [config: TasksWidgetConfig]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useTranslation()

// Configuration par défaut
const defaultConfig: TasksWidgetConfig = {
  showStats: true,
  showFilters: true,
  showAssignee: true,
  showDueDate: true,
  showPriority: true,
  showTags: true,
  defaultView: 'list',
  itemsPerPage: 10,
  autoRefresh: false,
  refreshInterval: 60
}

// État du formulaire
const form = ref<TasksWidgetConfig>({ ...defaultConfig })
const loading = ref(false)

// Initialisation du formulaire avec la configuration existante
const initializeForm = () => {
  if (props.config?.settings) {
    form.value = {
      ...defaultConfig,
      ...props.config.settings
    }
  }
}

// Réinitialisation aux valeurs par défaut
const resetToDefaults = () => {
  form.value = { ...defaultConfig }
}

// Soumission du formulaire
const handleSubmit = async () => {
  loading.value = true
  
  try {
    emit('save', { ...form.value })
  } catch (error) {
    console.error('Error saving configuration:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initializeForm()
})
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900 m-0;
}

.modal-close {
  @apply p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors;
}

.modal-body {
  @apply p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6;
}

.config-section {
  @apply space-y-4;
}

.section-title {
  @apply text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 m-0;
}

.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium text-gray-700;
}

.form-select {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.checkbox-label {
  @apply flex items-start gap-3 cursor-pointer;
}

.checkbox-input {
  @apply mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500;
}

.checkbox-text {
  @apply text-sm font-medium text-gray-700;
}

.form-help {
  @apply text-sm text-gray-500 ml-7;
}

.modal-actions {
  @apply flex justify-between items-center pt-4 border-t border-gray-200;
}

.action-buttons {
  @apply flex gap-3;
}

.btn-secondary {
  @apply px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center;
}
</style>