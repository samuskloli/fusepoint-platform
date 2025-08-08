<template>
  <BaseWidget 
    :widget="widgetConfig=loading=error='showConfigModal = true=toggleWidget="loadEvents="calendar-widget=calendar-header='calendar-nav="previousMonth=nav-btn="fas fa-chevron-left=calendar-title=nextMonth='nav-btn="fas fa-chevron-right=calendar-actions=goToToday="action-btn=showAddEventModal = true='action-btn primary="canAddEvents=fas fa-plus mr-1></i>
            {{ t('widgets.calendar.addEvent="calendar-view=viewMode === 'month='weekdays="day in weekdays=day="weekday='calendar-grid=day in calendarDays="day.date="calendar-day={
              'other-month='selectDay(day)"
          >
            <div  class="day-number=day-events day.events.length &gt; 0'>
              <div 
                v-for="event in day.events.slice(0, 2) 
                :key="event.id=event-dot=`event-${event.type}`'
                :title="event.title=viewEvent(event)"
              ></div>
              
              <div  
                v-if="day.events.length &gt; 2'
                class="more-events=viewDayEvents(day)
              >
                +{{ day.events.length - 2 }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Vue liste -->
      <div  class="calendar-list=viewMode === 'list list-header='view-toggle=viewMode = 'month="toggle-btn="fas fa-calendar-alt=events-list='event in upcomingEvents="event.id=event-item="viewEvent(event)'
          >
            <div class="event-date=event-day event-month=event-content=event-title='event-time="event-description=event.description="event-type class='type-badge=`type-${event.type}`">
                {{ t(`widgets.calendar.types.${event.type}`) }}
              </div>
            </div>
          </div>
          
          <div  v-if="upcomingEvents.length === 0' class="no-events=fas fa-calendar-times text-gray-400 text-2xl mb-2></i>
            <p  class="text-gray-500'>{{ t('widgets.calendar.noEvents="view-controls=view-toggle=viewMode = 'month='toggle-btn={ active: viewMode === 'month="fas fa-calendar-alt="viewMode = 'list=toggle-btn='{ active: viewMode === 'list="fas fa-list=showAddEventModal="projectId='showAddEventModal = false=onEventAdded="showEventModal="selectedEvent=projectId='showEventModal = false="onEventUpdated=onEventDeleted="showDayEventsModal='selectedDay=selectedDayEvents="showDayEventsModal = false="viewEvent=showConfigModal='widgetConfig="configOptions=showConfigModal = false="updateConfig"
    />
  </BaseWidget>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import BaseWidget from './BaseWidget.vue'
import AddEventModal from '../modals/AddEventModal.vue'
import EventDetailsModal from '../modals/EventDetailsModal.vue'
import DayEventsModal from '../modals/DayEventsModal.vue'
import WidgetConfigModal from '../modals/WidgetConfigModal.vue'
import projectManagementService from '@/services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'

export default {
  name: 'CalendarWidget',
  components: {
    BaseWidget,
    AddEventModal,
    EventDetailsModal,
    DayEventsModal,
    WidgetConfigModal
  },
  props: {
    projectId: {
      type: [String, Number],
      required: true
    },
    widgetData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update-widget'],
  setup(props, { emit }) {
    const { success, error: showError } = useNotifications()
    const { t } = useTranslation()
    
    // État réactif
    const loading = ref(false)
    const error = ref(null)
    const events = ref([])
    const currentDate = ref(new Date())
    const selectedDate = ref(null)
    const viewMode = ref('month')
    const showAddEventModal = ref(false)
    const showEventModal = ref(false)
    const showDayEventsModal = ref(false)
    const showConfigModal = ref(false)
    const selectedEvent = ref(null)
    const selectedDay = ref(null)
    const selectedDayEvents = ref([])
    
    // Configuration du widget
    const widgetConfig = ref({
      id: 'calendar',
      name: 'Calendrier',
      icon: 'fas fa-calendar-alt',
      titleKey: 'widgets.calendar.title',
      isEnabled: true,
      canAddEvents: true,
      showWeekends: true,
      defaultView: 'month',
      ...props.widgetData
    })
    
    // Options de configuration
    const configOptions = ref([
      {
        key: 'canAddEvents',
        type: 'boolean',
        label: 'Permettre l\'ajout d\'événements',
        default: true
      },
      {
        key: 'showWeekends',
        type: 'boolean',
        label: 'Afficher les week-ends',
        default: true
      },
      {
        key: 'defaultView',
        type: 'select',
        label: 'Vue par défaut',
        options: [
          { value: 'month', label: 'Mois' },
          { value: 'list', label: 'Liste' }
        ],
        default: 'month'
      }
    ])
    
    // Propriétés calculées
    const canAddEvents = computed(() => widgetConfig.value.canAddEvents)
    const showWeekends = computed(() => widgetConfig.value.showWeekends)
    
    const weekdays = computed(() => {
      const days = ['mon', 'tue', 'wed', 'thu', 'fri']
      if (showWeekends.value) {
        days.push('sat', 'sun')
      }
      return days
    })
    
    const currentMonthYear = computed(() => {
      const options = { year: 'numeric', month: 'long' }
      return currentDate.value.toLocaleDateString('fr-FR', options)
    })
    
    const calendarDays = computed(() => {
      const year = currentDate.value.getFullYear()
      const month = currentDate.value.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const today = new Date()
      
      // Ajuster le premier jour de la semaine (lundi = 0)
      let startDate = new Date(firstDay)
      const dayOfWeek = (firstDay.getDay() + 6) % 7 // Convertir dimanche=0 en lundi=0
      startDate.setDate(startDate.getDate() - dayOfWeek)
      
      const days = []
      const totalDays = showWeekends.value ? 42 : 30 // 6 semaines ou 5 semaines
      
      for (let i = 0; i < totalDays; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        
        // Ignorer les week-ends si nécessaire
        if (!showWeekends.value && (date.getDay() === 0 || date.getDay() === 6)) {
          continue
        }
        
        const dayEvents = events.value.filter(event => {
          const eventDate = new Date(event.start_date)
          return eventDate.toDateString() === date.toDateString()
        })
        
        days.push({
          date: date.toISOString().split('T')[0],
          dayNumber: date.getDate(),
          isCurrentMonth: date.getMonth() === month,
          isToday: date.toDateString() === today.toDateString(),
          isSelected: selectedDate.value && date.toDateString() === selectedDate.value.toDateString(),
          events: dayEvents
        })
      }
      
      return days
    })
    
    const upcomingEvents = computed(() => {
      const today = new Date()
      return events.value
        .filter(event => new Date(event.start_date) >= today)
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
        .slice(0, 10)
    })
    
    // Méthodes
    const loadEvents = async () => {
      loading.value = true
      error.value = null
      
      try {
        // Simuler le chargement des événements du projet
        // En réalité, cela viendrait de projectManagementService
        const result = await projectManagementService.getProjectEvents?.(props.projectId) || {
          success: true,
          data: [
            {
              id: 1,
              title: 'Réunion de lancement',
              description: 'Réunion de démarrage du projet',
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
              type: 'meeting',
              all_day: false
            },
            {
              id: 2,
              title: 'Date limite livrable',
              description: 'Livraison de la première version',
              start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              type: 'deadline',
              all_day: true
            }
          ]
        }
        
        if (result.success) {
          events.value = result.data
        }
      } catch (err) {
        error.value = t('errors.loadingFailed')
      } finally {
        loading.value = false
      }
    }
    
    const previousMonth = () => {
      const newDate = new Date(currentDate.value)
      newDate.setMonth(newDate.getMonth() - 1)
      currentDate.value = newDate
    }
    
    const nextMonth = () => {
      const newDate = new Date(currentDate.value)
      newDate.setMonth(newDate.getMonth() + 1)
      currentDate.value = newDate
    }
    
    const goToToday = () => {
      currentDate.value = new Date()
      selectedDate.value = new Date()
    }
    
    const selectDay = (day) => {
      selectedDate.value = new Date(day.date)
      if (day.events.length > 0) {
        viewDayEvents(day)
      }
    }
    
    const viewEvent = (event) => {
      selectedEvent.value = event
      showEventModal.value = true
    }
    
    const viewDayEvents = (day) => {
      selectedDay.value = day
      selectedDayEvents.value = day.events
      showDayEventsModal.value = true
    }
    
    const formatEventDay = (dateString) => {
      const date = new Date(dateString)
      return date.getDate().toString().padStart(2, '0')
    }
    
    const formatEventMonth = (dateString) => {
      const date = new Date(dateString)
      const options = { month: 'short' }
      return date.toLocaleDateString('fr-FR', options)
    }
    
    const formatEventTime = (event) => {
      if (event.all_day) {
        return t('widgets.calendar.allDay')
      }
      
      const startTime = new Date(event.start_date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
      
      if (event.end_date) {
        const endTime = new Date(event.end_date).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        })
        return `${startTime} - ${endTime}`
      }
      
      return startTime
    }
    
    const onEventAdded = (newEvent) => {
      events.value.push(newEvent)
      showAddEventModal.value = false
      success(t('widgets.calendar.eventAdded'))
    }
    
    const onEventUpdated = (updatedEvent) => {
      const index = events.value.findIndex(e => e.id === updatedEvent.id)
      if (index !== -1) {
        events.value[index] = updatedEvent
      }
      showEventModal.value = false
      success(t('widgets.calendar.eventUpdated'))
    }
    
    const onEventDeleted = (eventId) => {
      events.value = events.value.filter(e => e.id !== eventId)
      showEventModal.value = false
      success(t('widgets.calendar.eventDeleted'))
    }
    
    const toggleWidget = () => {
      widgetConfig.value.isEnabled = !widgetConfig.value.isEnabled
      emit('update-widget', widgetConfig.value)
    }
    
    const updateConfig = (newConfig) => {
      widgetConfig.value = { ...widgetConfig.value, ...newConfig }
      if (newConfig.defaultView) {
        viewMode.value = newConfig.defaultView
      }
      emit('update-widget', widgetConfig.value)
      showConfigModal.value = false
    }
    
    // Watchers
    watch(() => props.projectId, loadEvents, { immediate: true })
    
    onMounted(() => {
      viewMode.value = widgetConfig.value.defaultView || 'month'
      loadEvents()
    })
    
    return {
      loading,
      error,
      events,
      currentDate,
      selectedDate,
      viewMode,
      showAddEventModal,
      showEventModal,
      showDayEventsModal,
      showConfigModal,
      selectedEvent,
      selectedDay,
      selectedDayEvents,
      widgetConfig,
      configOptions,
      canAddEvents,
      showWeekends,
      weekdays,
      currentMonthYear,
      calendarDays,
      upcomingEvents,
      loadEvents,
      previousMonth,
      nextMonth,
      goToToday,
      selectDay,
      viewEvent,
      viewDayEvents,
      formatEventDay,
      formatEventMonth,
      formatEventTime,
      onEventAdded,
      onEventUpdated,
      onEventDeleted,
      toggleWidget,
      updateConfig,
      t
    }
  }
}
</script>

<style scoped>
.calendar-widget {
  @apply space-y-4;
}

.calendar-header {
  @apply flex items-center justify-between;
}

.calendar-nav {
  @apply flex items-center space-x-4;
}

.nav-btn {
  @apply w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 transition-colors;
}

.calendar-title {
  @apply text-lg font-semibold text-gray-900 capitalize;
}

.calendar-actions {
  @apply flex items-center space-x-2;
}

.action-btn {
  @apply px-3 py-2 text-sm rounded-md border transition-colors;
}

.action-btn:not(.primary) {
  @apply bg-white border-gray-300 text-gray-700 hover:bg-gray-50;
}

.action-btn.primary {
  @apply bg-blue-600 border-blue-600 text-white hover:bg-blue-700;
}

.weekdays {
  @apply grid grid-cols-7 gap-1 mb-2;
}

.weekday {
  @apply text-center text-sm font-medium text-gray-500 py-2;
}

.calendar-grid {
  @apply grid grid-cols-7 gap-1;
}

.calendar-day {
  @apply relative min-h-[80px] p-1 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors;
}

.calendar-day.other-month {
  @apply text-gray-400 bg-gray-50;
}

.calendar-day.today {
  @apply bg-blue-50 border-blue-300;
}

.calendar-day.selected {
  @apply bg-blue-100 border-blue-500;
}

.calendar-day.has-events {
  @apply border-green-300;
}

.day-number {
  @apply text-sm font-medium;
}

.day-events {
  @apply mt-1 space-y-1;
}

.event-dot {
  @apply w-2 h-2 rounded-full cursor-pointer;
}

.event-meeting {
  @apply bg-blue-500;
}

.event-deadline {
  @apply bg-red-500;
}

.event-task {
  @apply bg-green-500;
}

.event-reminder {
  @apply bg-yellow-500;
}

.more-events {
  @apply text-xs text-gray-500 cursor-pointer hover:text-gray-700;
}

.list-header {
  @apply flex items-center justify-between mb-4;
}

.events-list {
  @apply space-y-3 max-h-96 overflow-y-auto;
}

.event-item {
  @apply flex items-start space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors;
}

.event-date {
  @apply text-center min-w-[50px];
}

.event-day {
  @apply text-lg font-bold text-gray-900;
}

.event-month {
  @apply text-xs text-gray-500 uppercase;
}

.event-content {
  @apply flex-1;
}

.event-title {
  @apply font-medium text-gray-900;
}

.event-time {
  @apply text-sm text-gray-600;
}

.event-description {
  @apply text-sm text-gray-500 mt-1;
}

.event-type {
  @apply flex-shrink-0;
}

.type-badge {
  @apply px-2 py-1 text-xs rounded-full;
}

.type-meeting {
  @apply bg-blue-100 text-blue-800;
}

.type-deadline {
  @apply bg-red-100 text-red-800;
}

.type-task {
  @apply bg-green-100 text-green-800;
}

.type-reminder {
  @apply bg-yellow-100 text-yellow-800;
}

.no-events {
  @apply text-center py-8;
}

.view-controls {
  @apply border-t border-gray-200 pt-4;
}

.view-toggle {
  @apply flex items-center space-x-2;
}

.toggle-btn {
  @apply px-3 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-1;
}

.toggle-btn.active {
  @apply bg-blue-600 border-blue-600 text-white;
}
</style>