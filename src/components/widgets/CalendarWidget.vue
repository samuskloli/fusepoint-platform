<template>
  <BaseWidget 
    :widget="widgetConfig"
    :loading="loading"
    :error="error"
    @configure="showConfigModal = true"
    @toggle="toggleWidget"
    @retry="loadCalendarData"
  >
    <div class="calendar-widget">
      <!-- En-tête du calendrier -->
      <div class="calendar-header">
        <div class="header-left">
          <h3 class="calendar-title">{{ formatMonthYear(currentDate) }}</h3>
          <div class="calendar-stats">
            <span class="stat-item">
              <i class="fas fa-calendar-day mr-1"></i>
              {{ todayEvents.length }} {{ t('widgets.calendar.todayEvents') }}
            </span>
            <span class="stat-item">
              <i class="fas fa-clock mr-1"></i>
              {{ upcomingEvents.length }} {{ t('widgets.calendar.upcomingEvents') }}
            </span>
          </div>
        </div>
        
        <div class="header-right">
          <div class="view-controls">
            <button 
              @click="viewMode = 'month'"
              :class="{ active: viewMode === 'month' }"
              class="view-btn"
            >
              <i class="fas fa-calendar"></i>
            </button>
            <button 
              @click="viewMode = 'week'"
              :class="{ active: viewMode === 'week' }"
              class="view-btn"
            >
              <i class="fas fa-calendar-week"></i>
            </button>
            <button 
              @click="viewMode = 'list'"
              :class="{ active: viewMode === 'list' }"
              class="view-btn"
            >
              <i class="fas fa-list"></i>
            </button>
          </div>
          
          <div class="navigation-controls">
            <button @click="previousPeriod" class="nav-btn">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button @click="goToToday" class="today-btn">
              {{ t('widgets.calendar.today') }}
            </button>
            <button @click="nextPeriod" class="nav-btn">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          
          <button @click="showCreateModal = true" class="create-btn">
            <i class="fas fa-plus mr-2"></i>
            {{ t('widgets.calendar.createEvent') }}
          </button>
        </div>
      </div>
      
      <!-- Vue Mois -->
      <div v-if="viewMode === 'month'" class="month-view">
        <!-- En-tête des jours de la semaine -->
        <div class="weekdays-header">
          <div 
            v-for="day in weekdays"
            :key="day"
            class="weekday"
          >
            {{ t(`widgets.calendar.weekdays.${day}`) }}
          </div>
        </div>
        
        <!-- Grille du calendrier -->
        <div class="calendar-grid">
          <div 
            v-for="date in calendarDates"
            :key="date.dateString"
            class="calendar-day"
            :class="{
              'other-month': !date.isCurrentMonth,
              'today': date.isToday,
              'selected': selectedDate && date.dateString === selectedDate.dateString,
              'has-events': date.events.length > 0
            }"
            @click="selectDate(date)"
          >
            <div class="day-number">{{ date.day }}</div>
            
            <div v-if="date.events.length > 0" class="day-events">
              <div 
                v-for="event in date.events.slice(0, 3)"
                :key="event.id"
                class="event-dot"
                :class="`event-${event.type}`"
                :title="event.title"
              ></div>
              
              <div v-if="date.events.length > 3" class="more-events">
                +{{ date.events.length - 3 }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Vue Semaine -->
      <div v-if="viewMode === 'week'" class="week-view">
        <div class="week-header">
          <div class="time-column"></div>
          <div 
            v-for="date in weekDates"
            :key="date.dateString"
            class="week-day-header"
            :class="{ 'today': date.isToday }"
          >
            <div class="day-name">{{ t(`widgets.calendar.weekdays.${date.dayName}`) }}</div>
            <div class="day-number">{{ date.day }}</div>
          </div>
        </div>
        
        <div class="week-grid">
          <div class="time-slots">
            <div 
              v-for="hour in hours"
              :key="hour"
              class="time-slot"
            >
              {{ formatHour(hour) }}
            </div>
          </div>
          
          <div 
            v-for="date in weekDates"
            :key="date.dateString"
            class="day-column"
          >
            <div 
              v-for="hour in hours"
              :key="hour"
              class="hour-slot"
              @click="createEventAt(date, hour)"
            >
              <div 
                v-for="event in getEventsForHour(date, hour)"
                :key="event.id"
                class="week-event"
                :class="`event-${event.type}`"
                @click.stop="selectEvent(event)"
              >
                <div class="event-time">{{ formatEventTime(event) }}</div>
                <div class="event-title">{{ event.title }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Vue Liste -->
      <div v-if="viewMode === 'list'" class="list-view">
        <div class="list-filters">
          <div class="filter-group">
            <label class="filter-label">{{ t('widgets.calendar.filterByType') }}</label>
            <select v-model="eventTypeFilter" class="filter-select">
              <option value="all">{{ t('widgets.calendar.allTypes') }}</option>
              <option value="meeting">{{ t('widgets.calendar.meeting') }}</option>
              <option value="deadline">{{ t('widgets.calendar.deadline') }}</option>
              <option value="reminder">{{ t('widgets.calendar.reminder') }}</option>
              <option value="task">{{ t('widgets.calendar.task') }}</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">{{ t('widgets.calendar.filterByPeriod') }}</label>
            <select v-model="periodFilter" class="filter-select">
              <option value="all">{{ t('widgets.calendar.allPeriods') }}</option>
              <option value="today">{{ t('widgets.calendar.today') }}</option>
              <option value="week">{{ t('widgets.calendar.thisWeek') }}</option>
              <option value="month">{{ t('widgets.calendar.thisMonth') }}</option>
            </select>
          </div>
          
          <div class="search-group">
            <input 
              v-model="searchQuery"
              type="text"
              :placeholder="t('widgets.calendar.searchEvents')"
              class="search-input"
            >
          </div>
        </div>
        
        <div class="events-list">
          <div 
            v-for="event in filteredEvents"
            :key="event.id"
            class="event-item"
            :class="`event-${event.type}`"
            @click="selectEvent(event)"
          >
            <div class="event-icon">
              <i :class="getEventIcon(event.type)"></i>
            </div>
            
            <div class="event-content">
              <div class="event-header">
                <h4 class="event-title">{{ event.title }}</h4>
                <span class="event-date">{{ formatEventDate(event) }}</span>
              </div>
              
              <p v-if="event.description" class="event-description">
                {{ event.description }}
              </p>
              
              <div class="event-meta">
                <span class="event-time">
                  <i class="fas fa-clock mr-1"></i>
                  {{ formatEventTime(event) }}
                </span>
                
                <span v-if="event.location" class="event-location">
                  <i class="fas fa-map-marker-alt mr-1"></i>
                  {{ event.location }}
                </span>
                
                <span v-if="event.attendees?.length" class="event-attendees">
                  <i class="fas fa-users mr-1"></i>
                  {{ event.attendees.length }} {{ t('widgets.calendar.attendees') }}
                </span>
              </div>
            </div>
            
            <div class="event-actions">
              <button 
                @click.stop="editEvent(event)"
                class="action-btn"
                :title="t('widgets.calendar.editEvent')"
              >
                <i class="fas fa-edit"></i>
              </button>
              
              <button 
                @click.stop="deleteEvent(event)"
                class="action-btn delete"
                :title="t('widgets.calendar.deleteEvent')"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="filteredEvents.length === 0" class="no-events">
          <i class="fas fa-calendar-times text-gray-400 text-4xl mb-3"></i>
          <h5 class="text-gray-600 mb-2">{{ t('widgets.calendar.noEvents') }}</h5>
          <p class="text-gray-500 text-sm">{{ t('widgets.calendar.noEventsDescription') }}</p>
        </div>
      </div>
      
      <!-- Événements du jour sélectionné -->
      <div v-if="selectedDate && selectedDate.events.length > 0" class="selected-day-events">
        <h4 class="events-title">
          {{ t('widgets.calendar.eventsFor') }} {{ formatSelectedDate(selectedDate) }}
        </h4>
        
        <div class="day-events-list">
          <div 
            v-for="event in selectedDate.events"
            :key="event.id"
            class="day-event-item"
            :class="`event-${event.type}`"
            @click="selectEvent(event)"
          >
            <div class="event-time">{{ formatEventTime(event) }}</div>
            <div class="event-info">
              <h5 class="event-title">{{ event.title }}</h5>
              <p v-if="event.description" class="event-description">{{ event.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de création/édition d'événement -->
    <EventModal 
      v-if="showCreateModal || showEditModal"
      :event="selectedEvent"
      :is-editing="showEditModal"
      @close="closeEventModal"
      @save="saveEvent"
    />
    
    <!-- Modal de configuration -->
    <WidgetConfigModal 
      v-if="showConfigModal"
      :widget="widgetConfig"
      :options="configOptions"
      @close="showConfigModal = false"
      @save="updateConfig"
    />
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
// import { useNotifications } from '@/composables/useNotifications'
// import { useAuth } from '@/composables/useAuth'
// import { calendarService } from './services/calendarService'
import BaseWidget from './shared/components/BaseWidget.vue'
// import EventModal from '@/components/modals/EventModal.vue'
// import WidgetConfigModal from '@/components/modals/WidgetConfigModal.vue'

// Interfaces TypeScript
interface CalendarEvent {
  id: string | number
  title: string
  description?: string
  start_date: string
  end_date?: string
  type: 'meeting' | 'deadline' | 'reminder' | 'task'
  location?: string
  attendees?: any[]
}

interface CalendarConfig {
  isEnabled: boolean
  title: string
  icon: string
  type: string
  viewMode: string
  showWeekends: boolean
  startHour: number
  endHour: number
  maxEvents: number
  defaultView?: string
  timeFormat?: string
  firstDayOfWeek?: number
}

interface ConfigOption {
  key: string
  type: string
  label: string
  options?: { value: any; label: string }[]
  default: any
  min?: number
  max?: number
}

interface CalendarDate {
  date: Date
  dateString: string
  day: number
  isCurrentMonth?: boolean
  isToday?: boolean
  events: CalendarEvent[]
  dayName?: string
}

interface Widget {
  id: string | number
  name: string
  is_enabled?: boolean
  view_mode?: string
  show_weekends?: boolean
  start_hour?: number
  end_hour?: number
  max_events?: number
}

// Fonction simulée pour les traductions
const t = (key: string): string => {
  const translations: Record<string, string> = {
    'widgets.calendar.title': 'Calendrier',
    'widgets.calendar.filterByType': 'Filtrer par type',
    'widgets.calendar.allTypes': 'Tous les types',
    'widgets.calendar.meeting': 'Réunion',
    'widgets.calendar.deadline': 'Échéance',
    'widgets.calendar.reminder': 'Rappel',
    'widgets.calendar.task': 'Tâche',
    'widgets.calendar.filterByPeriod': 'Filtrer par période',
    'widgets.calendar.allPeriods': 'Toutes les périodes',
    'widgets.calendar.today': 'Aujourd\'hui',
    'widgets.calendar.thisWeek': 'Cette semaine',
    'widgets.calendar.thisMonth': 'Ce mois',
    'widgets.calendar.searchEvents': 'Rechercher des événements',
    'widgets.calendar.attendees': 'participants',
    'widgets.calendar.editEvent': 'Modifier l\'événement',
    'widgets.calendar.deleteEvent': 'Supprimer l\'événement',
    'widgets.calendar.noEvents': 'Aucun événement',
    'widgets.calendar.noEventsDescription': 'Aucun événement trouvé pour les critères sélectionnés',
    'widgets.calendar.eventsFor': 'Événements pour',
    'errors.loadingFailed': 'Échec du chargement'
  }
  return translations[key] || key
}

// Fonction simulée pour les notifications
const showNotification = (message: string, type: 'success' | 'error' = 'success'): void => {
  console.log(`${type.toUpperCase()}: ${message}`)
}

// Props
interface Props {
  projectId: string | number
  widgetData?: any
  widget?: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'widget-updated': [widget: any]
}>()

// État réactif
const loading = ref<boolean>(false)
const error = ref<string | null>(null)
const viewMode = ref<string>('month')
const currentDate = ref<Date>(new Date())
const selectedDate = ref<CalendarDate | null>(null)
const selectedEvent = ref<CalendarEvent | null>(null)
const events = ref<CalendarEvent[]>([])
const eventTypeFilter = ref<string>('all')
const periodFilter = ref<string>('all')
const searchQuery = ref<string>('')
const showCreateModal = ref<boolean>(false)
const showEditModal = ref<boolean>(false)
const showConfigModal = ref<boolean>(false)

// Configuration du widget
const widgetConfig = computed<CalendarConfig>(() => ({
  isEnabled: props.widget?.is_enabled ?? true,
  title: t('widgets.calendar.title'),
  icon: 'fas fa-calendar-alt',
  type: 'calendar',
  viewMode: props.widget?.view_mode ?? 'month',
  showWeekends: props.widget?.show_weekends ?? true,
  startHour: props.widget?.start_hour ?? 8,
  endHour: props.widget?.end_hour ?? 18,
  maxEvents: props.widget?.max_events ?? 50,
  defaultView: props.widget?.view_mode ?? 'month',
  timeFormat: '24h',
  firstDayOfWeek: 1
}))
    
// Options de configuration
const configOptions = ref<ConfigOption[]>([
  {
    key: 'defaultView',
    type: 'select',
    label: 'Vue par défaut',
    options: [
      { value: 'month', label: 'Mois' },
      { value: 'week', label: 'Semaine' },
      { value: 'list', label: 'Liste' }
    ],
    default: 'month'
  },
  {
    key: 'showWeekends',
    type: 'boolean',
    label: 'Afficher les week-ends',
    default: true
  },
  {
    key: 'startHour',
    type: 'number',
    label: 'Heure de début',
    min: 0,
    max: 23,
    default: 8
  },
  {
    key: 'endHour',
    type: 'number',
    label: 'Heure de fin',
    min: 0,
    max: 23,
    default: 18
  },
  {
    key: 'timeFormat',
    type: 'select',
    label: 'Format d\'heure',
    options: [
      { value: '24h', label: '24 heures' },
      { value: '12h', label: '12 heures (AM/PM)' }
    ],
    default: '24h'
  },
  {
    key: 'firstDayOfWeek',
    type: 'select',
    label: 'Premier jour de la semaine',
    options: [
      { value: 0, label: 'Dimanche' },
      { value: 1, label: 'Lundi' }
    ],
    default: 1
  }
])

// Constantes
const weekdays: string[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

// Propriétés calculées
const todayEvents = computed<CalendarEvent[]>(() => {
  const today = new Date().toDateString()
  return events.value.filter((event: CalendarEvent) => {
    const eventDate = new Date(event.start_date).toDateString()
    return eventDate === today
  })
})

const upcomingEvents = computed<CalendarEvent[]>(() => {
  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  return events.value.filter((event: CalendarEvent) => {
    const eventDate = new Date(event.start_date)
    return eventDate > now && eventDate <= nextWeek
  })
})
    
const calendarDates = computed<CalendarDate[]>(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  // Premier jour du mois
  const firstDay = new Date(year, month, 1)
  // Dernier jour du mois
  const lastDay = new Date(year, month + 1, 0)
  
  // Ajuster pour le premier jour de la semaine
  const startDate = new Date(firstDay)
  const dayOfWeek = (firstDay.getDay() + 7 - (widgetConfig.value.firstDayOfWeek || 1)) % 7
  startDate.setDate(startDate.getDate() - dayOfWeek)
  
  // Générer 42 jours (6 semaines)
  const dates: CalendarDate[] = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const dateString = date.toDateString()
    const isCurrentMonth = date.getMonth() === month
    const isToday = dateString === new Date().toDateString()
    
    // Filtrer les événements pour cette date
    const dayEvents = events.value.filter((event: CalendarEvent) => {
      const eventDate = new Date(event.start_date).toDateString()
      return eventDate === dateString
    })
    
    dates.push({
      date,
      dateString,
      day: date.getDate(),
      isCurrentMonth,
      isToday,
      events: dayEvents,
      dayName: weekdays[date.getDay()]
    })
  }
  
  return dates
})
    
const weekDates = computed<CalendarDate[]>(() => {
  const startOfWeek = new Date(currentDate.value)
  const dayOfWeek = (currentDate.value.getDay() + 7 - (widgetConfig.value.firstDayOfWeek || 1)) % 7
  startOfWeek.setDate(currentDate.value.getDate() - dayOfWeek)
  
  const dates: CalendarDate[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    
    const dateString = date.toDateString()
    const isToday = dateString === new Date().toDateString()
    
    dates.push({
      date,
      dateString,
      day: date.getDate(),
      isToday,
      events: [],
      dayName: weekdays[date.getDay()]
    })
  }
  
  return dates
})

const hours = computed<number[]>(() => {
  const hoursList: number[] = []
  for (let i = widgetConfig.value.startHour; i <= widgetConfig.value.endHour; i++) {
    hoursList.push(i)
  }
  return hoursList
})

const filteredEvents = computed<CalendarEvent[]>(() => {
  let filtered = [...events.value]
  
  // Filtrer par type
  if (eventTypeFilter.value !== 'all') {
    filtered = filtered.filter((event: CalendarEvent) => event.type === eventTypeFilter.value)
  }
  
  // Filtrer par période
  if (periodFilter.value !== 'all') {
    const now = new Date()
    const filterDate = new Date()
    
    switch (periodFilter.value) {
      case 'today':
        filterDate.setHours(0, 0, 0, 0)
        filtered = filtered.filter((event: CalendarEvent) => {
          const eventDate = new Date(event.start_date)
          return eventDate.toDateString() === now.toDateString()
        })
        break
      case 'week':
        filterDate.setDate(now.getDate() - 7)
        filtered = filtered.filter((event: CalendarEvent) => {
          const eventDate = new Date(event.start_date)
          return eventDate >= filterDate && eventDate <= now
        })
        break
      case 'month':
        filterDate.setMonth(now.getMonth() - 1)
        filtered = filtered.filter((event: CalendarEvent) => {
          const eventDate = new Date(event.start_date)
          return eventDate >= filterDate && eventDate <= now
        })
        break
    }
  }
  
  // Filtrer par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((event: CalendarEvent) => 
      event.title.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query) ||
      event.location?.toLowerCase().includes(query)
    )
  }
  
  // Trier par date
  filtered.sort((a: CalendarEvent, b: CalendarEvent) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
  
  return filtered
})
    
// Méthodes
const loadCalendarData = async (): Promise<void> => {
  loading.value = true
  error.value = null
  
  try {
    // Simulation de données
    events.value = [
      {
        id: '1',
        title: 'Réunion équipe',
        description: 'Réunion hebdomadaire de l\'équipe',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        type: 'meeting',
        location: 'Salle de conférence',
        attendees: ['user1', 'user2']
      },
      {
        id: '2',
        title: 'Présentation client',
        description: 'Présentation du projet au client',
        start_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        type: 'deadline',
        location: 'Bureau client',
        attendees: ['user1', 'client1']
      }
    ]
  } catch (err) {
    error.value = t('errors.loadingFailed')
  } finally {
    loading.value = false
  }
}

const toggleWidget = (): void => {
  widgetConfig.value.isEnabled = !widgetConfig.value.isEnabled
  const updatedWidget = {
    ...props.widget,
    is_enabled: widgetConfig.value.isEnabled
  }
  emit('widget-updated', updatedWidget)
}

const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric'
  })
}

const formatHour = (hour: number): string => {
  if (widgetConfig.value.timeFormat === '12h') {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:00 ${period}`
  }
  return `${hour.toString().padStart(2, '0')}:00`
}

const formatEventTime = (event: CalendarEvent): string => {
  const start = new Date(event.start_date)
  const end = event.end_date ? new Date(event.end_date) : null
  
  const timeOptions = {
    hour: '2-digit' as const,
    minute: '2-digit' as const,
    hour12: widgetConfig.value.timeFormat === '12h'
  }
  
  if (end && start.toDateString() === end.toDateString()) {
    return `${start.toLocaleTimeString('fr-FR', timeOptions)} - ${end.toLocaleTimeString('fr-FR', timeOptions)}`
  }
  
  return start.toLocaleTimeString('fr-FR', timeOptions)
}
    
const formatEventDate = (event: CalendarEvent): string => {
  const date = new Date(event.start_date)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

const formatSelectedDate = (selectedDate: CalendarDate): string => {
  return selectedDate.date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

const getEventIcon = (type: string): string => {
  const icons: Record<string, string> = {
    meeting: 'fas fa-users',
    deadline: 'fas fa-flag',
    reminder: 'fas fa-bell',
    task: 'fas fa-tasks'
  }
  return icons[type] || 'fas fa-calendar'
}

const getEventsForHour = (date: CalendarDate, hour: number): CalendarEvent[] => {
  return events.value.filter((event: CalendarEvent) => {
    const eventDate = new Date(event.start_date)
    return eventDate.toDateString() === date.dateString &&
           eventDate.getHours() === hour
  })
}

const selectDate = (date: CalendarDate): void => {
  selectedDate.value = date
}

const selectEvent = (event: CalendarEvent): void => {
  selectedEvent.value = event
  // Ici vous pouvez ouvrir un modal de détails ou effectuer une autre action
}
    
const previousPeriod = (): void => {
  const newDate = new Date(currentDate.value)
  if (viewMode.value === 'month') {
    newDate.setMonth(newDate.getMonth() - 1)
  } else if (viewMode.value === 'week') {
    newDate.setDate(newDate.getDate() - 7)
  } else {
    newDate.setDate(newDate.getDate() - 1)
  }
  currentDate.value = newDate
}

const nextPeriod = (): void => {
  const newDate = new Date(currentDate.value)
  if (viewMode.value === 'month') {
    newDate.setMonth(newDate.getMonth() + 1)
  } else if (viewMode.value === 'week') {
    newDate.setDate(newDate.getDate() + 7)
  } else {
    newDate.setDate(newDate.getDate() + 1)
  }
  currentDate.value = newDate
}

const goToToday = (): void => {
  currentDate.value = new Date()
  selectedDate.value = null
}
    
const createEventAt = (date: CalendarDate, hour: number): void => {
  const eventDate = new Date(date.date)
  eventDate.setHours(hour, 0, 0, 0)
  
  selectedEvent.value = {
    id: '',
    title: '',
    description: '',
    start_date: eventDate.toISOString(),
    end_date: new Date(eventDate.getTime() + 60 * 60 * 1000).toISOString(), // 1 heure par défaut
    type: 'meeting',
    location: '',
    attendees: []
  }
  
  showCreateModal.value = true
}

const editEvent = (event: CalendarEvent): void => {
  selectedEvent.value = { ...event }
  showEditModal.value = true
}

const deleteEvent = async (event: CalendarEvent): Promise<void> => {
  if (!confirm(t('common.confirmations.deleteEvent'))) return
  
  try {
    // Simulation de suppression
    events.value = events.value.filter(e => e.id !== event.id)
    showNotification('Événement supprimé', 'success')
  } catch (err) {
    showNotification('Erreur lors de la suppression', 'error')
  }
}
    
const saveEvent = async (eventData: CalendarEvent): Promise<void> => {
  try {
    if (eventData.id) {
      // Mise à jour
      const index = events.value.findIndex((e: CalendarEvent) => e.id === eventData.id)
      if (index !== -1) {
        events.value[index] = eventData
      }
      showNotification('Événement mis à jour', 'success')
    } else {
      // Création
      const newEvent = {
        ...eventData,
        id: Date.now().toString()
      }
      events.value.push(newEvent)
      showNotification('Événement créé', 'success')
    }
  } catch (err) {
    showNotification('Erreur lors de la sauvegarde', 'error')
  }
  
  showCreateModal.value = false
  showEditModal.value = false
  selectedEvent.value = null
}
    
const closeEventModal = (): void => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedEvent.value = null
}

const openConfigModal = (): void => {
  showConfigModal.value = true
}

const closeConfigModal = (): void => {
  showConfigModal.value = false
}

const updateConfig = (newConfig: any): void => {
  widgetConfig.value = { ...widgetConfig.value, ...newConfig }
  viewMode.value = newConfig.defaultView || viewMode.value
  emit('widget-updated', widgetConfig.value)
  showConfigModal.value = false
}
    
    // Lifecycle
    onMounted(() => {
      viewMode.value = widgetConfig.value.defaultView
      loadCalendarData()
    })
    
    // Watchers
    watch(() => props.projectId, loadCalendarData)
</script>

<style scoped>
.calendar-widget {
  @apply space-y-4;
}

.calendar-header {
  @apply flex items-center justify-between;
}

.header-left {
  @apply flex flex-col space-y-2;
}

.calendar-title {
  @apply text-xl font-bold text-gray-900;
}

.calendar-stats {
  @apply flex items-center space-x-4 text-sm text-gray-600;
}

.stat-item {
  @apply flex items-center;
}

.header-right {
  @apply flex items-center space-x-3;
}

.view-controls {
  @apply flex items-center space-x-1 bg-gray-100 rounded-lg p-1;
}

.view-btn {
  @apply p-2 rounded-md text-gray-500 hover:text-gray-700 transition-colors;
}

.view-btn.active {
  @apply bg-white text-blue-600 shadow-sm;
}

.navigation-controls {
  @apply flex items-center space-x-1;
}

.nav-btn {
  @apply p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors;
}

.today-btn {
  @apply px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors;
}

.create-btn {
  @apply bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center;
}

.month-view {
  @apply bg-white rounded-lg border border-gray-200 overflow-hidden;
}

.weekdays-header {
  @apply grid grid-cols-7 bg-gray-50 border-b border-gray-200;
}

.weekday {
  @apply p-3 text-center text-sm font-medium text-gray-700;
}

.calendar-grid {
  @apply grid grid-cols-7;
}

.calendar-day {
  @apply min-h-24 p-2 border-r border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors;
}

.calendar-day.other-month {
  @apply text-gray-400 bg-gray-50;
}

.calendar-day.today {
  @apply bg-blue-50 border-blue-200;
}

.calendar-day.selected {
  @apply bg-blue-100 border-blue-300;
}

.calendar-day.has-events {
  @apply bg-green-50;
}

.day-number {
  @apply text-sm font-medium mb-1;
}

.today .day-number {
  @apply text-blue-600 font-bold;
}

.day-events {
  @apply space-y-1;
}

.event-dot {
  @apply w-2 h-2 rounded-full;
}

.event-meeting {
  @apply bg-blue-500;
}

.event-deadline {
  @apply bg-red-500;
}

.event-reminder {
  @apply bg-yellow-500;
}

.event-task {
  @apply bg-green-500;
}

.more-events {
  @apply text-xs text-gray-500;
}

.week-view {
  @apply bg-white rounded-lg border border-gray-200 overflow-hidden;
}

.week-header {
  @apply grid grid-cols-8 bg-gray-50 border-b border-gray-200;
}

.time-column {
  @apply w-16;
}

.week-day-header {
  @apply p-3 text-center border-r border-gray-200;
}

.week-day-header.today {
  @apply bg-blue-50 text-blue-600;
}

.day-name {
  @apply text-sm font-medium;
}

.day-number {
  @apply text-lg font-bold;
}

.week-grid {
  @apply grid grid-cols-8 max-h-96 overflow-y-auto;
}

.time-slots {
  @apply w-16;
}

.time-slot {
  @apply h-12 p-2 text-xs text-gray-500 border-b border-gray-200 text-right;
}

.day-column {
  @apply border-r border-gray-200;
}

.hour-slot {
  @apply h-12 border-b border-gray-200 relative cursor-pointer hover:bg-gray-50;
}

.week-event {
  @apply absolute left-1 right-1 rounded text-xs p-1 text-white cursor-pointer;
}

.week-event.event-meeting {
  @apply bg-blue-500;
}

.week-event.event-deadline {
  @apply bg-red-500;
}

.week-event.event-reminder {
  @apply bg-yellow-500;
}

.week-event.event-task {
  @apply bg-green-500;
}

.event-time {
  @apply font-medium;
}

.event-title {
  @apply truncate;
}

.list-view {
  @apply space-y-4;
}

.list-filters {
  @apply flex items-center space-x-4 p-4 bg-gray-50 rounded-lg;
}

.filter-group {
  @apply flex flex-col space-y-1;
}

.filter-label {
  @apply text-sm font-medium text-gray-700;
}

.filter-select {
  @apply px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.search-group {
  @apply flex-1;
}

.search-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.events-list {
  @apply space-y-3;
}

.event-item {
  @apply bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow flex items-start space-x-4;
}

.event-item.event-meeting {
  @apply border-blue-200;
}

.event-item.event-deadline {
  @apply border-red-200;
}

.event-item.event-reminder {
  @apply border-yellow-200;
}

.event-item.event-task {
  @apply border-green-200;
}

.event-icon {
  @apply w-10 h-10 rounded-lg flex items-center justify-center text-white;
}

.event-meeting .event-icon {
  @apply bg-blue-500;
}

.event-deadline .event-icon {
  @apply bg-red-500;
}

.event-reminder .event-icon {
  @apply bg-yellow-500;
}

.event-task .event-icon {
  @apply bg-green-500;
}

.event-content {
  @apply flex-1;
}

.event-header {
  @apply flex items-center justify-between mb-2;
}

.event-title {
  @apply font-semibold text-gray-900;
}

.event-date {
  @apply text-sm text-gray-500;
}

.event-description {
  @apply text-sm text-gray-600 mb-2;
}

.event-meta {
  @apply flex items-center space-x-4 text-sm text-gray-500;
}

.event-time,
.event-location,
.event-attendees {
  @apply flex items-center;
}

.event-actions {
  @apply flex items-center space-x-2;
}

.action-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 transition-colors;
}

.action-btn.delete {
  @apply hover:text-red-600;
}

.no-events {
  @apply text-center py-8;
}

.selected-day-events {
  @apply bg-gray-50 rounded-lg p-4;
}

.events-title {
  @apply text-lg font-semibold text-gray-900 mb-3;
}

.day-events-list {
  @apply space-y-2;
}

.day-event-item {
  @apply bg-white rounded-lg p-3 cursor-pointer hover:shadow-sm transition-shadow flex items-start space-x-3;
}

.day-event-item.event-meeting {
  @apply border-l-4 border-blue-500;
}

.day-event-item.event-deadline {
  @apply border-l-4 border-red-500;
}

.day-event-item.event-reminder {
  @apply border-l-4 border-yellow-500;
}

.day-event-item.event-task {
  @apply border-l-4 border-green-500;
}

.day-event-item .event-time {
  @apply text-sm font-medium text-gray-600 min-w-16;
}

.event-info {
  @apply flex-1;
}

.day-event-item .event-title {
  @apply font-medium text-gray-900 mb-1;
}

.day-event-item .event-description {
  @apply text-sm text-gray-600;
}
</style>