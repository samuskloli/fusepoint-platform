<template>
  <BaseWidget 
    :widget="widgetConfig"
    :loading="loading"
    :error="error"
    @configure="showConfiguration"
    @toggle="toggleWidget"
    @retry="refreshWidget"
    class="calendar-widget"
  >
    <div class="calendar-content">
      <!-- En-tête du calendrier -->
      <div class="calendar-header">
        <div class="header-left">
          <h3 class="calendar-title">{{ currentMonthYear }}</h3>
          <div class="view-selector">
            <button 
              v-for="view in availableViews" 
              :key="view.value"
              @click="currentView = view.value"
              class="view-btn"
              :class="{ 'active': currentView === view.value }"
            >
              {{ t(view.label) }}
            </button>
          </div>
        </div>
        
        <div class="header-actions">
          <button @click="goToPreviousPeriod" class="nav-btn">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button @click="goToToday" class="today-btn">
            {{ t('widgets.calendar.today') }}
          </button>
          <button @click="goToNextPeriod" class="nav-btn">
            <i class="fas fa-chevron-right"></i>
          </button>
          <button @click="showAddEventModal = true" class="btn-primary">
            <i class="fas fa-plus"></i>
            {{ t('widgets.calendar.addEvent') }}
          </button>
        </div>
      </div>
      
      <!-- Filtres -->
      <div v-if="widgetConfig.settings?.showFilters" class="calendar-filters">
        <div class="filter-group">
          <label class="filter-label">{{ t('widgets.calendar.eventType') }}</label>
          <select v-model="selectedEventType" @change="filterEvents" class="filter-select">
            <option value="all">{{ t('widgets.calendar.allTypes') }}</option>
            <option value="meeting">{{ t('widgets.calendar.meeting') }}</option>
            <option value="deadline">{{ t('widgets.calendar.deadline') }}</option>
            <option value="milestone">{{ t('widgets.calendar.milestone') }}</option>
            <option value="task">{{ t('widgets.calendar.task') }}</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">{{ t('widgets.calendar.assignee') }}</label>
          <select v-model="selectedAssignee" @change="filterEvents" class="filter-select">
            <option value="all">{{ t('widgets.calendar.allMembers') }}</option>
            <option 
              v-for="member in teamMembers" 
              :key="member.id" 
              :value="member.id"
            >
              {{ member.name }}
            </option>
          </select>
        </div>
      </div>
      
      <!-- Vue calendrier -->
      <div class="calendar-view">
        <!-- Vue mensuelle -->
        <MonthView 
          v-if="currentView === 'month'"
          :current-date="currentDate"
          :events="filteredEvents"
          @event-click="handleEventClick"
          @date-click="handleDateClick"
        />
        
        <!-- Vue hebdomadaire -->
        <WeekView 
          v-else-if="currentView === 'week'"
          :current-date="currentDate"
          :events="filteredEvents"
          @event-click="handleEventClick"
          @time-slot-click="handleTimeSlotClick"
        />
        
        <!-- Vue journalière -->
        <DayView 
          v-else-if="currentView === 'day'"
          :current-date="currentDate"
          :events="filteredEvents"
          @event-click="handleEventClick"
          @time-slot-click="handleTimeSlotClick"
        />
        
        <!-- Vue liste -->
        <ListView 
          v-else
          :events="filteredEvents"
          :current-date="currentDate"
          @event-click="handleEventClick"
        />
      </div>
    </div>
    
    <!-- Modal d'ajout d'événement -->
    <AddEventModal
      v-if="showAddEventModal"
      :initial-date="selectedDate"
      :initial-time="selectedTime"
      @close="showAddEventModal = false"
      @save="addEvent"
    />
    
    <!-- Modal de détails d'événement -->
    <EventDetailsModal
      v-if="showEventModal && selectedEvent"
      :event="selectedEvent"
      @close="showEventModal = false"
      @edit="editEvent"
      @delete="deleteEvent"
    />
    
    <!-- Modal de configuration -->
    <CalendarConfigModal
      v-if="isConfiguring"
      :config="widgetConfig"
      @close="hideConfiguration"
      @save="saveConfiguration"
    />
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWidget } from '../../shared/composables'
import { BaseWidget } from '../../shared/components'
import { WidgetApiService } from '../../shared/services'
import MonthView from './components/MonthView.vue'
import WeekView from './components/WeekView.vue'
import DayView from './components/DayView.vue'
import ListView from './components/ListView.vue'
import AddEventModal from './components/AddEventModal.vue'
import EventDetailsModal from './components/EventDetailsModal.vue'
import CalendarConfigModal from './components/CalendarConfigModal.vue'
import { useTranslation } from '@/composables/useTranslation'
import type { CalendarEvent, CalendarView, EventType } from './types'

interface Props {
  widget: any
  projectId: string
}

const props = defineProps<Props>()
const { t } = useTranslation()

// Utilisation du composable widget
const {
  loading,
  error,
  data,
  isConfiguring,
  widgetConfig,
  setLoading,
  setError,
  setData,
  toggleWidget,
  showConfiguration,
  hideConfiguration,
  refreshWidget,
  handleError
} = useWidget(props.widget)

// États locaux
const events = ref<CalendarEvent[]>([])
const currentDate = ref(new Date())
const currentView = ref<CalendarView>('month')
const selectedEventType = ref<string>('all')
const selectedAssignee = ref<string>('all')
const selectedDate = ref<string>('')
const selectedTime = ref<string>('')
const selectedEvent = ref<CalendarEvent | null>(null)
const showAddEventModal = ref(false)
const showEventModal = ref(false)
const teamMembers = ref<any[]>([])

// Vues disponibles
const availableViews = [
  { value: 'month', label: 'widgets.calendar.monthView' },
  { value: 'week', label: 'widgets.calendar.weekView' },
  { value: 'day', label: 'widgets.calendar.dayView' },
  { value: 'list', label: 'widgets.calendar.listView' }
]

// Titre du mois/année actuel
const currentMonthYear = computed(() => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long'
  }
  
  if (currentView.value === 'week') {
    const startOfWeek = getStartOfWeek(currentDate.value)
    const endOfWeek = getEndOfWeek(currentDate.value)
    return `${startOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`
  } else if (currentView.value === 'day') {
    return currentDate.value.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  return currentDate.value.toLocaleDateString('fr-FR', options)
})

// Événements filtrés
const filteredEvents = computed(() => {
  let filtered = events.value
  
  if (selectedEventType.value !== 'all') {
    filtered = filtered.filter(event => event.type === selectedEventType.value)
  }
  
  if (selectedAssignee.value !== 'all') {
    filtered = filtered.filter(event => 
      event.attendees?.some(attendee => attendee.id === selectedAssignee.value)
    )
  }
  
  return filtered
})

// Utilitaires de date
const getStartOfWeek = (date: Date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Lundi comme premier jour
  return new Date(d.setDate(diff))
}

const getEndOfWeek = (date: Date) => {
  const startOfWeek = getStartOfWeek(date)
  return new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000)
}

// Navigation
const goToPreviousPeriod = () => {
  const newDate = new Date(currentDate.value)
  
  switch (currentView.value) {
    case 'month':
      newDate.setMonth(newDate.getMonth() - 1)
      break
    case 'week':
      newDate.setDate(newDate.getDate() - 7)
      break
    case 'day':
      newDate.setDate(newDate.getDate() - 1)
      break
  }
  
  currentDate.value = newDate
}

const goToNextPeriod = () => {
  const newDate = new Date(currentDate.value)
  
  switch (currentView.value) {
    case 'month':
      newDate.setMonth(newDate.getMonth() + 1)
      break
    case 'week':
      newDate.setDate(newDate.getDate() + 7)
      break
    case 'day':
      newDate.setDate(newDate.getDate() + 1)
      break
  }
  
  currentDate.value = newDate
}

const goToToday = () => {
  currentDate.value = new Date()
}

// Gestion des événements
const handleEventClick = (event: CalendarEvent) => {
  selectedEvent.value = event
  showEventModal.value = true
}

const handleDateClick = (date: string) => {
  selectedDate.value = date
  selectedTime.value = ''
  showAddEventModal.value = true
}

const handleTimeSlotClick = (date: string, time: string) => {
  selectedDate.value = date
  selectedTime.value = time
  showAddEventModal.value = true
}

const filterEvents = () => {
  // Les événements sont automatiquement filtrés via le computed filteredEvents
}

// CRUD des événements
const loadData = async () => {
  try {
    setLoading(true)
    const response = await WidgetApiService.getWidgetData('calendar', props.projectId, {
      startDate: getStartOfWeek(currentDate.value).toISOString(),
      endDate: getEndOfWeek(currentDate.value).toISOString()
    })
    events.value = response.events || []
    teamMembers.value = response.teamMembers || []
    setData(response)
  } catch (err) {
    handleError(err)
  } finally {
    setLoading(false)
  }
}

const addEvent = async (eventData: Partial<CalendarEvent>) => {
  try {
    setLoading(true)
    const newEvent = await WidgetApiService.updateWidgetData('calendar', props.projectId, {
      action: 'create',
      event: eventData
    })
    events.value.push(newEvent)
    showAddEventModal.value = false
  } catch (err) {
    handleError(err)
  } finally {
    setLoading(false)
  }
}

const editEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
  try {
    const updatedEvent = await WidgetApiService.updateWidgetData('calendar', props.projectId, {
      action: 'update',
      eventId,
      updates
    })
    const index = events.value.findIndex(e => e.id === eventId)
    if (index !== -1) {
      events.value[index] = { ...events.value[index], ...updatedEvent }
    }
    showEventModal.value = false
  } catch (err) {
    handleError(err)
  }
}

const deleteEvent = async (eventId: string) => {
  try {
    await WidgetApiService.updateWidgetData('calendar', props.projectId, {
      action: 'delete',
      eventId
    })
    events.value = events.value.filter(e => e.id !== eventId)
    showEventModal.value = false
  } catch (err) {
    handleError(err)
  }
}

const saveConfiguration = async (config: any) => {
  try {
    await WidgetApiService.saveWidgetConfig(props.widget.id, config)
    hideConfiguration()
  } catch (err) {
    handleError(err)
  }
}

// Chargement initial
onMounted(() => {
  if (props.widget.isEnabled) {
    loadData()
  }
})
</script>

<style scoped>
.calendar-widget {
  @apply min-h-96;
}

.calendar-content {
  @apply space-y-4;
}

.calendar-header {
  @apply flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4;
}

.header-left {
  @apply flex flex-col sm:flex-row sm:items-center gap-4;
}

.calendar-title {
  @apply text-xl font-semibold text-gray-900 m-0;
}

.view-selector {
  @apply flex bg-gray-100 rounded-lg p-1;
}

.view-btn {
  @apply px-3 py-1 text-sm font-medium text-gray-600 rounded-md transition-colors;
}

.view-btn.active {
  @apply bg-white text-blue-600 shadow-sm;
}

.header-actions {
  @apply flex items-center gap-2;
}

.nav-btn {
  @apply p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors;
}

.today-btn {
  @apply px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors;
}

.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2;
}

.calendar-filters {
  @apply flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg;
}

.filter-group {
  @apply flex flex-col gap-1;
}

.filter-label {
  @apply text-sm font-medium text-gray-700;
}

.filter-select {
  @apply border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.calendar-view {
  @apply bg-white rounded-lg border border-gray-200 overflow-hidden;
}
</style>