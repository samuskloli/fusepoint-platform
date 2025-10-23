<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <!-- En-tête du modal -->
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-cog"></i>
          {{ t('widgets.calendar.configuration') }}
        </h3>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- Contenu du modal -->
      <div class="modal-body">
        <!-- Vue par défaut -->
        <div class="config-section">
          <h4 class="section-title">
            <i class="fas fa-eye"></i>
            {{ t('widgets.calendar.defaultView') }}
          </h4>
          <div class="section-content">
            <div class="radio-group">
              <label 
                v-for="view in viewOptions" 
                :key="view.value"
                class="radio-option"
              >
                <input
                  v-model="configData.defaultView"
                  type="radio"
                  :value="view.value"
                  class="radio-input"
                />
                <div class="radio-content">
                  <i :class="view.icon"></i>
                  <div>
                    <div class="radio-title">{{ view.label }}</div>
                    <div class="radio-description">{{ view.description }}</div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Affichage des éléments -->
        <div class="config-section">
          <h4 class="section-title">
            <i class="fas fa-list"></i>
            {{ t('widgets.calendar.displayElements') }}
          </h4>
          <div class="section-content">
            <div class="checkbox-grid">
              <label class="checkbox-option">
                <input
                  v-model="configData.showWeekends"
                  type="checkbox"
                  class="checkbox-input"
                />
                <div class="checkbox-content">
                  <div class="checkbox-title">{{ t('widgets.calendar.showWeekends') }}</div>
                  <div class="checkbox-description">{{ t('widgets.calendar.showWeekendsDesc') }}</div>
                </div>
              </label>
              
              <label class="checkbox-option">
                <input
                  v-model="configData.showEventDetails"
                  type="checkbox"
                  class="checkbox-input"
                />
                <div class="checkbox-content">
                  <div class="checkbox-title">{{ t('widgets.calendar.showEventDetails') }}</div>
                  <div class="checkbox-description">{{ t('widgets.calendar.showEventDetailsDesc') }}</div>
                </div>
              </label>
              
              <label class="checkbox-option">
                <input
                  v-model="configData.showMiniCalendar"
                  type="checkbox"
                  class="checkbox-input"
                />
                <div class="checkbox-content">
                  <div class="checkbox-title">{{ t('widgets.calendar.showMiniCalendar') }}</div>
                  <div class="checkbox-description">{{ t('widgets.calendar.showMiniCalendarDesc') }}</div>
                </div>
              </label>
              
              <label class="checkbox-option">
                <input
                  v-model="configData.showEventCount"
                  type="checkbox"
                  class="checkbox-input"
                />
                <div class="checkbox-content">
                  <div class="checkbox-title">{{ t('widgets.calendar.showEventCount') }}</div>
                  <div class="checkbox-description">{{ t('widgets.calendar.showEventCountDesc') }}</div>
                </div>
              </label>
              
              <label class="checkbox-option">
                <input
                  v-model="configData.showCurrentTime"
                  type="checkbox"
                  class="checkbox-input"
                />
                <div class="checkbox-content">
                  <div class="checkbox-title">{{ t('widgets.calendar.showCurrentTime') }}</div>
                  <div class="checkbox-description">{{ t('widgets.calendar.showCurrentTimeDesc') }}</div>
                </div>
              </label>
              
              <label class="checkbox-option">
                <input
                  v-model="configData.showAllDayEvents"
                  type="checkbox"
                  class="checkbox-input"
                />
                <div class="checkbox-content">
                  <div class="checkbox-title">{{ t('widgets.calendar.showAllDayEvents') }}</div>
                  <div class="checkbox-description">{{ t('widgets.calendar.showAllDayEventsDesc') }}</div>
                </div>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Filtres par défaut -->
        <div class="config-section">
          <h4 class="section-title">
            <i class="fas fa-filter"></i>
            {{ t('widgets.calendar.defaultFilters') }}
          </h4>
          <div class="section-content">
            <!-- Types d'événements -->
            <div class="filter-group">
              <label class="filter-label">{{ t('widgets.calendar.eventTypes') }}</label>
              <div class="checkbox-list">
                <label 
                  v-for="type in eventTypes" 
                  :key="type.value"
                  class="checkbox-item"
                >
                  <input
                    v-model="configData.defaultEventTypes"
                    type="checkbox"
                    :value="type.value"
                    class="checkbox-input"
                  />
                  <span class="checkbox-text">{{ type.label }}</span>
                </label>
              </div>
            </div>
            
            <!-- Priorités -->
            <div class="filter-group">
              <label class="filter-label">{{ t('widgets.calendar.priorities') }}</label>
              <div class="checkbox-list">
                <label 
                  v-for="priority in priorities" 
                  :key="priority.value"
                  class="checkbox-item"
                >
                  <input
                    v-model="configData.defaultPriorities"
                    type="checkbox"
                    :value="priority.value"
                    class="checkbox-input"
                  />
                  <span class="checkbox-text">{{ priority.label }}</span>
                </label>
              </div>
            </div>
            
            <!-- Statuts -->
            <div class="filter-group">
              <label class="filter-label">{{ t('widgets.calendar.statuses') }}</label>
              <div class="checkbox-list">
                <label 
                  v-for="status in statuses" 
                  :key="status.value"
                  class="checkbox-item"
                >
                  <input
                    v-model="configData.defaultStatuses"
                    type="checkbox"
                    :value="status.value"
                    class="checkbox-input"
                  />
                  <span class="checkbox-text">{{ status.label }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Paramètres de temps -->
        <div class="config-section">
          <h4 class="section-title">
            <i class="fas fa-clock"></i>
            {{ t('widgets.calendar.timeSettings') }}
          </h4>
          <div class="section-content">
            <div class="form-grid">
              <!-- Heure de début -->
              <div class="form-group">
                <label class="form-label">{{ t('widgets.calendar.startTime') }}</label>
                <select v-model="configData.startTime" class="form-select">
                  <option v-for="hour in hours" :key="hour" :value="hour">
                    {{ formatHour(hour) }}
                  </option>
                </select>
              </div>
              
              <!-- Heure de fin -->
              <div class="form-group">
                <label class="form-label">{{ t('widgets.calendar.endTime') }}</label>
                <select v-model="configData.endTime" class="form-select">
                  <option v-for="hour in hours" :key="hour" :value="hour">
                    {{ formatHour(hour) }}
                  </option>
                </select>
              </div>
              
              <!-- Intervalle de temps -->
              <div class="form-group">
                <label class="form-label">{{ t('widgets.calendar.timeInterval') }}</label>
                <select v-model="configData.timeInterval" class="form-select">
                  <option value="15">15 {{ t('widgets.calendar.minutes') }}</option>
                  <option value="30">30 {{ t('widgets.calendar.minutes') }}</option>
                  <option value="60">1 {{ t('widgets.calendar.hour') }}</option>
                </select>
              </div>
              
              <!-- Premier jour de la semaine -->
              <div class="form-group">
                <label class="form-label">{{ t('widgets.calendar.firstDayOfWeek') }}</label>
                <select v-model="configData.firstDayOfWeek" class="form-select">
                  <option value="0">{{ t('widgets.calendar.sunday') }}</option>
                  <option value="1">{{ t('widgets.calendar.monday') }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Notifications -->
        <div class="config-section">
          <h4 class="section-title">
            <i class="fas fa-bell"></i>
            {{ t('widgets.calendar.notifications') }}
          </h4>
          <div class="section-content">
            <div class="checkbox-grid">
              <label class="checkbox-option">
                <input
                  v-model="configData.enableNotifications"
                  type="checkbox"
                  class="checkbox-input"
                />
                <div class="checkbox-content">
                  <div class="checkbox-title">{{ t('widgets.calendar.enableNotifications') }}</div>
                  <div class="checkbox-description">{{ t('widgets.calendar.enableNotificationsDesc') }}</div>
                </div>
              </label>
              
              <label class="checkbox-option">
                <input
                  v-model="configData.enableEmailReminders"
                  type="checkbox"
                  class="checkbox-input"
                  :disabled="!configData.enableNotifications"
                />
                <div class="checkbox-content">
                  <div class="checkbox-title">{{ t('widgets.calendar.enableEmailReminders') }}</div>
                  <div class="checkbox-description">{{ t('widgets.calendar.enableEmailRemindersDesc') }}</div>
                </div>
              </label>
              
              <label class="checkbox-option">
                <input
                  v-model="configData.enablePopupReminders"
                  type="checkbox"
                  class="checkbox-input"
                  :disabled="!configData.enableNotifications"
                />
                <div class="checkbox-content">
                  <div class="checkbox-title">{{ t('widgets.calendar.enablePopupReminders') }}</div>
                  <div class="checkbox-description">{{ t('widgets.calendar.enablePopupRemindersDesc') }}</div>
                </div>
              </label>
            </div>
            
            <!-- Délai de rappel par défaut -->
            <div v-if="configData.enableNotifications" class="form-group">
              <label class="form-label">{{ t('widgets.calendar.defaultReminderTime') }}</label>
              <select v-model="configData.defaultReminderMinutes" class="form-select">
                <option value="5">5 {{ t('widgets.calendar.minutes') }}</option>
                <option value="10">10 {{ t('widgets.calendar.minutes') }}</option>
                <option value="15">15 {{ t('widgets.calendar.minutes') }}</option>
                <option value="30">30 {{ t('widgets.calendar.minutes') }}</option>
                <option value="60">1 {{ t('widgets.calendar.hour') }}</option>
                <option value="120">2 {{ t('widgets.calendar.hours') }}</option>
                <option value="1440">1 {{ t('widgets.calendar.day') }}</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Actualisation automatique -->
        <div class="config-section">
          <h4 class="section-title">
            <i class="fas fa-sync-alt"></i>
            {{ t('widgets.calendar.autoRefresh') }}
          </h4>
          <div class="section-content">
            <label class="checkbox-option">
              <input
                v-model="configData.enableAutoRefresh"
                type="checkbox"
                class="checkbox-input"
              />
              <div class="checkbox-content">
                <div class="checkbox-title">{{ t('widgets.calendar.enableAutoRefresh') }}</div>
                <div class="checkbox-description">{{ t('widgets.calendar.enableAutoRefreshDesc') }}</div>
              </div>
            </label>
            
            <div v-if="configData.enableAutoRefresh" class="form-group">
              <label class="form-label">{{ t('widgets.calendar.refreshInterval') }}</label>
              <select v-model="configData.refreshInterval" class="form-select">
                <option value="30">30 {{ t('widgets.calendar.seconds') }}</option>
                <option value="60">1 {{ t('widgets.calendar.minute') }}</option>
                <option value="300">5 {{ t('widgets.calendar.minutes') }}</option>
                <option value="600">10 {{ t('widgets.calendar.minutes') }}</option>
                <option value="1800">30 {{ t('widgets.calendar.minutes') }}</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Thème et couleurs -->
        <div class="config-section">
          <h4 class="section-title">
            <i class="fas fa-palette"></i>
            {{ t('widgets.calendar.theme') }}
          </h4>
          <div class="section-content">
            <!-- Thème -->
            <div class="form-group">
              <label class="form-label">{{ t('widgets.calendar.colorTheme') }}</label>
              <div class="theme-options">
                <label 
                  v-for="theme in themes" 
                  :key="theme.value"
                  class="theme-option"
                  :class="{ 'selected': configData.theme === theme.value }"
                >
                  <input
                    v-model="configData.theme"
                    type="radio"
                    :value="theme.value"
                    class="theme-input"
                  />
                  <div class="theme-preview" :style="{ background: theme.gradient }">
                    <div class="theme-name">{{ theme.label }}</div>
                  </div>
                </label>
              </div>
            </div>
            
            <!-- Couleur d'accent -->
            <div class="form-group">
              <label class="form-label">{{ t('widgets.calendar.accentColor') }}</label>
              <div class="color-picker">
                <div
                  v-for="color in accentColors"
                  :key="color"
                  class="color-option"
                  :class="{ 'selected': configData.accentColor === color }"
                  :style="{ backgroundColor: color }"
                  @click="configData.accentColor = color"
                ></div>
                <input
                  v-model="configData.accentColor"
                  type="color"
                  class="color-input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Actions du modal -->
      <div class="modal-footer">
        <button type="button" @click="resetToDefaults" class="btn-secondary">
          <i class="fas fa-undo"></i>
          {{ t('widgets.calendar.resetDefaults') }}
        </button>
        <div class="footer-actions">
          <button type="button" @click="$emit('close')" class="btn-secondary">
            {{ t('common.cancel') }}
          </button>
          <button
            type="button"
            @click="handleSave"
            class="btn-primary"
            :disabled="loading"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-save"></i>
            {{ loading ? t('common.saving') : t('common.save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import type { CalendarWidgetConfig } from '../types'

interface Props {
  config: CalendarWidgetConfig
}

interface Emits {
  (e: 'close'): void
  (e: 'save', config: CalendarWidgetConfig): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useTranslation()

// État
const loading = ref(false)

// Configuration
const configData = reactive<CalendarWidgetConfig>({ ...props.config })

// Options de vue
const viewOptions = computed(() => [
  {
    value: 'month',
    label: t('widgets.calendar.views.month'),
    description: t('widgets.calendar.viewDescriptions.month'),
    icon: 'fas fa-calendar'
  },
  {
    value: 'week',
    label: t('widgets.calendar.views.week'),
    description: t('widgets.calendar.viewDescriptions.week'),
    icon: 'fas fa-calendar-week'
  },
  {
    value: 'day',
    label: t('widgets.calendar.views.day'),
    description: t('widgets.calendar.viewDescriptions.day'),
    icon: 'fas fa-calendar-day'
  },
  {
    value: 'list',
    label: t('widgets.calendar.views.list'),
    description: t('widgets.calendar.viewDescriptions.list'),
    icon: 'fas fa-list'
  }
])

// Types d'événements
const eventTypes = computed(() => [
  { value: 'meeting', label: t('widgets.calendar.eventTypes.meeting') },
  { value: 'deadline', label: t('widgets.calendar.eventTypes.deadline') },
  { value: 'milestone', label: t('widgets.calendar.eventTypes.milestone') },
  { value: 'task', label: t('widgets.calendar.eventTypes.task') },
  { value: 'reminder', label: t('widgets.calendar.eventTypes.reminder') }
])

// Priorités
const priorities = computed(() => [
  { value: 'low', label: t('widgets.calendar.priorities.low') },
  { value: 'medium', label: t('widgets.calendar.priorities.medium') },
  { value: 'high', label: t('widgets.calendar.priorities.high') },
  { value: 'urgent', label: t('widgets.calendar.priorities.urgent') }
])

// Statuts
const statuses = computed(() => [
  { value: 'confirmed', label: t('widgets.calendar.statuses.confirmed') },
  { value: 'tentative', label: t('widgets.calendar.statuses.tentative') },
  { value: 'cancelled', label: t('widgets.calendar.statuses.cancelled') }
])

// Heures
const hours = Array.from({ length: 24 }, (_, i) => i)

// Thèmes
const themes = computed(() => [
  {
    value: 'light',
    label: t('widgets.calendar.themes.light'),
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
  },
  {
    value: 'dark',
    label: t('widgets.calendar.themes.dark'),
    gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
  },
  {
    value: 'blue',
    label: t('widgets.calendar.themes.blue'),
    gradient: 'linear-gradient(135deg, #dbeafe 0%, #3b82f6 100%)'
  },
  {
    value: 'green',
    label: t('widgets.calendar.themes.green'),
    gradient: 'linear-gradient(135deg, #d1fae5 0%, #10b981 100%)'
  }
])

// Couleurs d'accent
const accentColors = [
  '#3B82F6', // Bleu
  '#EF4444', // Rouge
  '#10B981', // Vert
  '#F59E0B', // Orange
  '#8B5CF6', // Violet
  '#EC4899', // Rose
  '#14B8A6', // Teal
  '#F97316'  // Orange foncé
]

// Utilitaires
const formatHour = (hour: number) => {
  return hour.toString().padStart(2, '0') + ':00'
}

// Actions
const handleOverlayClick = () => {
  emit('close')
}

const resetToDefaults = () => {
  if (confirm(t('widgets.calendar.confirmResetDefaults'))) {
    Object.assign(configData, {
      defaultView: 'month',
      showWeekends: true,
      showEventDetails: true,
      showMiniCalendar: true,
      showEventCount: true,
      showCurrentTime: true,
      showAllDayEvents: true,
      defaultEventTypes: ['meeting', 'deadline', 'milestone', 'task', 'reminder'],
      defaultPriorities: ['low', 'medium', 'high', 'urgent'],
      defaultStatuses: ['confirmed', 'tentative'],
      startTime: 8,
      endTime: 18,
      timeInterval: 30,
      firstDayOfWeek: 1,
      enableNotifications: true,
      enableEmailReminders: true,
      enablePopupReminders: true,
      defaultReminderMinutes: 15,
      enableAutoRefresh: true,
      refreshInterval: 300,
      theme: 'light',
      accentColor: '#3B82F6'
    })
  }
}

const handleSave = async () => {
  loading.value = true
  
  try {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('save', { ...configData })
    emit('close')
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la configuration:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-screen overflow-hidden flex flex-col;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900 flex items-center gap-2;
}

.close-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors;
}

.modal-body {
  @apply flex-1 overflow-y-auto p-6 space-y-8;
}

.config-section {
  @apply space-y-4;
}

.section-title {
  @apply text-lg font-medium text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-200;
}

.section-content {
  @apply space-y-4;
}

.radio-group {
  @apply space-y-3;
}

.radio-option {
  @apply flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors;
}

.radio-option:has(.radio-input:checked) {
  @apply border-blue-500 bg-blue-50;
}

.radio-input {
  @apply w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1;
}

.radio-content {
  @apply flex items-start gap-3 flex-1;
}

.radio-title {
  @apply font-medium text-gray-900;
}

.radio-description {
  @apply text-sm text-gray-600;
}

.checkbox-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.checkbox-option {
  @apply flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors;
}

.checkbox-option:has(.checkbox-input:checked) {
  @apply border-blue-500 bg-blue-50;
}

.checkbox-input {
  @apply w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1;
}

.checkbox-content {
  @apply flex-1;
}

.checkbox-title {
  @apply font-medium text-gray-900;
}

.checkbox-description {
  @apply text-sm text-gray-600 mt-1;
}

.filter-group {
  @apply space-y-3;
}

.filter-label {
  @apply block text-sm font-medium text-gray-700;
}

.checkbox-list {
  @apply grid grid-cols-2 md:grid-cols-3 gap-2;
}

.checkbox-item {
  @apply flex items-center gap-2 cursor-pointer;
}

.checkbox-text {
  @apply text-sm text-gray-700;
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

.form-select {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors;
}

.theme-options {
  @apply grid grid-cols-2 md:grid-cols-4 gap-3;
}

.theme-option {
  @apply cursor-pointer;
}

.theme-option.selected .theme-preview {
  @apply ring-2 ring-blue-500;
}

.theme-input {
  @apply sr-only;
}

.theme-preview {
  @apply h-20 rounded-lg flex items-end p-3 transition-all;
}

.theme-name {
  @apply text-sm font-medium text-gray-900;
}

.color-picker {
  @apply flex items-center gap-2 flex-wrap;
}

.color-option {
  @apply w-8 h-8 rounded-full cursor-pointer border-2 border-transparent hover:border-gray-300 transition-colors;
}

.color-option.selected {
  @apply border-gray-600;
}

.color-input {
  @apply w-12 h-8 rounded border border-gray-300 cursor-pointer;
}

.modal-footer {
  @apply flex items-center justify-between p-6 border-t border-gray-200;
}

.footer-actions {
  @apply flex items-center gap-3;
}

.btn-secondary {
  @apply px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2;
}
</style>