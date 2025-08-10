<template>
  <div class="space-y-6">
    <!-- En-tête avec actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-lg font-medium text-gray-900">Agenda du projet</h3>
        <p class="mt-1 text-sm text-gray-500">
          Planifiez et suivez les événements, réunions et échéances du projet
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex space-x-3">
        <button
          @click="showCreateEventModal = true"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Nouvel événement
        </button>
        <div class="flex rounded-md shadow-sm">
          <button
            @click="currentView = 'month'"
            :class="[
              'relative inline-flex items-center px-4 py-2 rounded-l-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
              currentView === 'month' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            ]"
          >
            Mois
          </button>
          <button
            @click="currentView = 'week'"
            :class="[
              'relative inline-flex items-center px-4 py-2 -ml-px border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
              currentView === 'week' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            ]"
          >
            Semaine
          </button>
          <button
            @click="currentView = 'day'"
            :class="[
              'relative inline-flex items-center px-4 py-2 -ml-px border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
              currentView === 'day' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            ]"
          >
            Jour
          </button>
          <button
            @click="currentView = 'list'"
            :class="[
              'relative inline-flex items-center px-4 py-2 -ml-px rounded-r-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
              currentView === 'list' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            ]"
          >
            Liste
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation du calendrier -->
    <div class="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
      <div class="flex items-center space-x-4">
        <button
          @click="previousPeriod"
          class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h2 class="text-xl font-semibold text-gray-900">{{ currentPeriodLabel }}</h2>
        <button
          @click="nextPeriod"
          class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
        <button
          @click="goToToday"
          class="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-500 border border-blue-300 rounded-md hover:border-blue-400 transition-colors"
        >
          Aujourd'hui
        </button>
      </div>
      
      <!-- Filtres -->
      <div class="flex items-center space-x-3">
        <select
          v-model="selectedEventType"
          class="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Tous les types</option>
          <option value="meeting">Réunions</option>
          <option value="deadline">Échéances</option>
          <option value="milestone">Jalons</option>
          <option value="task">Tâches</option>
          <option value="review">Revues</option>
          <option value="other">Autres</option>
        </select>
        <select
          v-model="selectedMember"
          class="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Tous les membres</option>
          <option v-for="member in teamMembers" :key="member.id" :value="member.id">
            {{ member.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Vue calendrier -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <!-- Vue mois -->
      <div v-if="currentView === 'month'" class="p-4">
        <div class="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
          <!-- En-têtes des jours -->
          <div
            v-for="day in dayHeaders"
            :key="day"
            class="bg-gray-50 p-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wide"
          >
            {{ day }}
          </div>
          
          <!-- Cellules du calendrier -->
          <div
            v-for="date in calendarDates"
            :key="date.date"
            class="bg-white min-h-[120px] p-2 border-r border-b border-gray-100 relative"
            :class="{
              'bg-gray-50': !date.isCurrentMonth,
              'bg-blue-50': date.isToday
            }"
            @click="selectDate(date)"
          >
            <div class="flex items-center justify-between mb-1">
              <span
                class="text-sm font-medium"
                :class="{
                  'text-gray-400': !date.isCurrentMonth,
                  'text-blue-600': date.isToday,
                  'text-gray-900': date.isCurrentMonth && !date.isToday
                }"
              >
                {{ date.day }}
              </span>
            </div>
            
            <!-- Événements du jour -->
            <div class="space-y-1">
              <div
                v-for="event in getEventsForDate(date.date)"
                :key="event.id"
                class="text-xs p-1 rounded cursor-pointer truncate"
                :class="getEventClass(event.type)"
                @click.stop="selectEvent(event)"
                :title="event.title"
              >
                {{ event.title }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue semaine -->
      <div v-else-if="currentView === 'week'" class="p-4">
        <div class="grid grid-cols-8 gap-px bg-gray-200 rounded-lg overflow-hidden">
          <!-- Colonne des heures -->
          <div class="bg-gray-50">
            <div class="h-12 border-b border-gray-200"></div>
            <div
              v-for="hour in hours"
              :key="hour"
              class="h-16 border-b border-gray-200 p-2 text-xs text-gray-500"
            >
              {{ hour }}:00
            </div>
          </div>
          
          <!-- Colonnes des jours -->
          <div
            v-for="date in weekDates"
            :key="date.date"
            class="bg-white"
          >
            <!-- En-tête du jour -->
            <div
              class="h-12 border-b border-gray-200 p-2 text-center"
              :class="{ 'bg-blue-50': date.isToday }"
            >
              <div class="text-xs text-gray-500 uppercase">{{ date.dayName }}</div>
              <div
                class="text-sm font-medium"
                :class="{ 'text-blue-600': date.isToday }"
              >
                {{ date.day }}
              </div>
            </div>
            
            <!-- Grille horaire -->
            <div class="relative">
              <div
                v-for="hour in hours"
                :key="hour"
                class="h-16 border-b border-gray-100"
              ></div>
              
              <!-- Événements positionnés -->
              <div
                v-for="event in getEventsForDate(date.date)"
                :key="event.id"
                class="absolute left-1 right-1 p-1 rounded text-xs cursor-pointer"
                :class="getEventClass(event.type)"
                :style="getEventPosition(event)"
                @click="selectEvent(event)"
              >
                <div class="font-medium truncate">{{ event.title }}</div>
                <div class="text-xs opacity-75">{{ formatEventTime(event) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue jour -->
      <div v-else-if="currentView === 'day'" class="p-4">
        <div class="grid grid-cols-2 gap-px bg-gray-200 rounded-lg overflow-hidden">
          <!-- Colonne des heures -->
          <div class="bg-gray-50">
            <div class="h-12 border-b border-gray-200 p-2 text-center">
              <div class="text-xs text-gray-500 uppercase">{{ selectedDate.dayName }}</div>
              <div class="text-sm font-medium">{{ selectedDate.day }} {{ selectedDate.monthName }}</div>
            </div>
            <div
              v-for="hour in hours"
              :key="hour"
              class="h-16 border-b border-gray-200 p-2 text-xs text-gray-500"
            >
              {{ hour }}:00
            </div>
          </div>
          
          <!-- Colonne des événements -->
          <div class="bg-white relative">
            <div class="h-12 border-b border-gray-200"></div>
            <div
              v-for="hour in hours"
              :key="hour"
              class="h-16 border-b border-gray-100"
            ></div>
            
            <!-- Événements positionnés -->
            <div
              v-for="event in getEventsForDate(selectedDate.date)"
              :key="event.id"
              class="absolute left-2 right-2 p-2 rounded text-sm cursor-pointer"
              :class="getEventClass(event.type)"
              :style="getEventPosition(event)"
              @click="selectEvent(event)"
            >
              <div class="font-medium">{{ event.title }}</div>
              <div class="text-xs opacity-75 mt-1">{{ formatEventTime(event) }}</div>
              <div v-if="event.description" class="text-xs opacity-75 mt-1">{{ event.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue liste -->
      <div v-else-if="currentView === 'list'" class="divide-y divide-gray-200">
        <div
          v-for="event in filteredEvents"
          :key="event.id"
          class="p-4 hover:bg-gray-50 cursor-pointer"
          @click="selectEvent(event)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div
                class="w-3 h-3 rounded-full"
                :class="getEventColorClass(event.type)"
              ></div>
              <div>
                <h4 class="text-sm font-medium text-gray-900">{{ event.title }}</h4>
                <p class="text-sm text-gray-500">{{ formatEventDateTime(event) }}</p>
                <p v-if="event.description" class="text-sm text-gray-600 mt-1">{{ event.description }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getEventTypeClass(event.type)"
              >
                {{ getEventTypeLabel(event.type) }}
              </span>
              <button
                @click.stop="editEvent(event)"
                class="text-gray-400 hover:text-gray-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- État vide -->
        <div v-if="filteredEvents.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11m-6 0h8m-8 0V7a2 2 0 012-2h4a2 2 0 012 2v4"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun événement</h3>
          <p class="mt-1 text-sm text-gray-500">Aucun événement ne correspond à vos critères.</p>
        </div>
      </div>
    </div>

    <!-- Modal de création/édition d'événement -->
    <CreateEventModal
      v-if="showCreateEventModal"
      :project-id="projectId"
      :selected-date="selectedDateForEvent"
      @close="showCreateEventModal = false"
      @created="onEventCreated"
    />

    <!-- Modal d'édition d'événement -->
    <EditEventModal
      v-if="showEditEventModal"
      :event="selectedEvent"
      :project-id="projectId"
      @close="showEditEventModal = false"
      @updated="onEventUpdated"
      @deleted="onEventDeleted"
    />

    <!-- Modal de détails d'événement -->
    <EventDetailsModal
      v-if="showEventDetailsModal"
      :event="selectedEvent"
      @close="showEventDetailsModal = false"
      @edit="editEvent"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { projectManagementService } from '@/services/projectManagementService'
import CreateEventModal from './CreateEventModal.vue'
import EditEventModal from './EditEventModal.vue'
import EventDetailsModal from './EventDetailsModal.vue'

export default {
  name: 'CalendarTab',
  components: {
    CreateEventModal,
    EditEventModal,
    EventDetailsModal
  },
  props: {
    projectId: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const events = ref([])
    const teamMembers = ref([])
    const loading = ref(false)
    const currentView = ref('month')
    const currentDate = ref(new Date())
    const selectedEventType = ref('')
    const selectedMember = ref('')
    const showCreateEventModal = ref(false)
    const showEditEventModal = ref(false)
    const showEventDetailsModal = ref(false)
    const selectedEvent = ref(null)
    const selectedDateForEvent = ref(null)

    const dayHeaders = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    const hours = Array.from({ length: 24 }, (_, i) => i)

    const currentPeriodLabel = computed(() => {
      const date = currentDate.value
      const options = { year: 'numeric', month: 'long' }
      
      switch (currentView.value) {
        case 'month':
          return date.toLocaleDateString('fr-FR', options)
        case 'week':
          const startOfWeek = getStartOfWeek(date)
          const endOfWeek = new Date(startOfWeek)
          endOfWeek.setDate(startOfWeek.getDate() + 6)
          return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${endOfWeek.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
        case 'day':
          return date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        default:
          return ''
      }
    })

    const calendarDates = computed(() => {
      const year = currentDate.value.getFullYear()
      const month = currentDate.value.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const startDate = getStartOfWeek(firstDay)
      const dates = []
      
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        
        dates.push({
          date: date.toISOString().split('T')[0],
          day: date.getDate(),
          isCurrentMonth: date.getMonth() === month,
          isToday: isToday(date)
        })
      }
      
      return dates
    })

    const weekDates = computed(() => {
      const startOfWeek = getStartOfWeek(currentDate.value)
      const dates = []
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        
        dates.push({
          date: date.toISOString().split('T')[0],
          day: date.getDate(),
          dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
          isToday: isToday(date)
        })
      }
      
      return dates
    })

    const selectedDate = computed(() => {
      const date = currentDate.value
      return {
        date: date.toISOString().split('T')[0],
        day: date.getDate(),
        dayName: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
        monthName: date.toLocaleDateString('fr-FR', { month: 'long' }),
        isToday: isToday(date)
      }
    })

    const filteredEvents = computed(() => {
      let filtered = [...events.value]
      
      if (selectedEventType.value) {
        filtered = filtered.filter(event => event.type === selectedEventType.value)
      }
      
      if (selectedMember.value) {
        filtered = filtered.filter(event => 
          event.attendees && event.attendees.some(attendee => attendee.id === selectedMember.value)
        )
      }
      
      return filtered.sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    })

    const loadEvents = async () => {
      try {
        loading.value = true
        const response = await projectManagementService.getCalendarEvents(props.projectId)
        events.value = response.data
      } catch (error) {
        console.error('Erreur lors du chargement des événements:', error)
      } finally {
        loading.value = false
      }
    }

    const loadTeamMembers = async () => {
      try {
        const response = await projectManagementService.getTeamMembers(props.projectId)
        teamMembers.value = response.data
      } catch (error) {
        console.error('Erreur lors du chargement des membres:', error)
      }
    }

    const getStartOfWeek = (date) => {
      const d = new Date(date)
      const day = d.getDay()
      const diff = d.getDate() - day
      return new Date(d.setDate(diff))
    }

    const isToday = (date) => {
      const today = new Date()
      return date.toDateString() === today.toDateString()
    }

    const getEventsForDate = (dateString) => {
      return filteredEvents.value.filter(event => {
        const eventDate = new Date(event.start_date).toISOString().split('T')[0]
        return eventDate === dateString
      })
    }

    const getEventClass = (type) => {
      const classes = {
        meeting: 'bg-blue-100 text-blue-800 border-blue-200',
        deadline: 'bg-red-100 text-red-800 border-red-200',
        milestone: 'bg-purple-100 text-purple-800 border-purple-200',
        task: 'bg-green-100 text-green-800 border-green-200',
        review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        other: 'bg-gray-100 text-gray-800 border-gray-200'
      }
      return classes[type] || classes.other
    }

    const getEventColorClass = (type) => {
      const classes = {
        meeting: 'bg-blue-500',
        deadline: 'bg-red-500',
        milestone: 'bg-purple-500',
        task: 'bg-green-500',
        review: 'bg-yellow-500',
        other: 'bg-gray-500'
      }
      return classes[type] || classes.other
    }

    const getEventTypeClass = (type) => {
      const classes = {
        meeting: 'bg-blue-100 text-blue-800',
        deadline: 'bg-red-100 text-red-800',
        milestone: 'bg-purple-100 text-purple-800',
        task: 'bg-green-100 text-green-800',
        review: 'bg-yellow-100 text-yellow-800',
        other: 'bg-gray-100 text-gray-800'
      }
      return classes[type] || classes.other
    }

    const getEventTypeLabel = (type) => {
      const labels = {
        meeting: 'Réunion',
        deadline: 'Échéance',
        milestone: 'Jalon',
        task: 'Tâche',
        review: 'Revue',
        other: 'Autre'
      }
      return labels[type] || type
    }

    const getEventPosition = (event) => {
      const startTime = new Date(event.start_date)
      const endTime = new Date(event.end_date)
      const startHour = startTime.getHours() + startTime.getMinutes() / 60
      const duration = (endTime - startTime) / (1000 * 60 * 60) // en heures
      
      return {
        top: `${startHour * 64}px`, // 64px par heure
        height: `${Math.max(duration * 64, 20)}px`
      }
    }

    const formatEventTime = (event) => {
      const start = new Date(event.start_date)
      const end = new Date(event.end_date)
      return `${start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
    }

    const formatEventDateTime = (event) => {
      const start = new Date(event.start_date)
      const end = new Date(event.end_date)
      const dateStr = start.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      const timeStr = formatEventTime(event)
      return `${dateStr} • ${timeStr}`
    }

    const selectDate = (date) => {
      selectedDateForEvent.value = date.date
      showCreateEventModal.value = true
    }

    const selectEvent = (event) => {
      selectedEvent.value = event
      showEventDetailsModal.value = true
    }

    const editEvent = (event) => {
      selectedEvent.value = event
      showEventDetailsModal.value = false
      showEditEventModal.value = true
    }

    const previousPeriod = () => {
      const date = new Date(currentDate.value)
      switch (currentView.value) {
        case 'month':
          date.setMonth(date.getMonth() - 1)
          break
        case 'week':
          date.setDate(date.getDate() - 7)
          break
        case 'day':
          date.setDate(date.getDate() - 1)
          break
      }
      currentDate.value = date
    }

    const nextPeriod = () => {
      const date = new Date(currentDate.value)
      switch (currentView.value) {
        case 'month':
          date.setMonth(date.getMonth() + 1)
          break
        case 'week':
          date.setDate(date.getDate() + 7)
          break
        case 'day':
          date.setDate(date.getDate() + 1)
          break
      }
      currentDate.value = date
    }

    const goToToday = () => {
      currentDate.value = new Date()
    }

    const onEventCreated = () => {
      showCreateEventModal.value = false
      loadEvents()
    }

    const onEventUpdated = () => {
      showEditEventModal.value = false
      loadEvents()
    }

    const onEventDeleted = () => {
      showEditEventModal.value = false
      loadEvents()
    }

    onMounted(() => {
      loadEvents()
      loadTeamMembers()
    })

    return {
      events,
      teamMembers,
      loading,
      currentView,
      currentDate,
      selectedEventType,
      selectedMember,
      showCreateEventModal,
      showEditEventModal,
      showEventDetailsModal,
      selectedEvent,
      selectedDateForEvent,
      dayHeaders,
      hours,
      currentPeriodLabel,
      calendarDates,
      weekDates,
      selectedDate,
      filteredEvents,
      getEventsForDate,
      getEventClass,
      getEventColorClass,
      getEventTypeClass,
      getEventTypeLabel,
      getEventPosition,
      formatEventTime,
      formatEventDateTime,
      selectDate,
      selectEvent,
      editEvent,
      previousPeriod,
      nextPeriod,
      goToToday,
      onEventCreated,
      onEventUpdated,
      onEventDeleted
    }
  }
}
</script>

<style scoped>
/* Styles pour le calendrier */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

/* Animation pour les événements */
.event-item {
  transition: all 0.2s ease;
}

.event-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>