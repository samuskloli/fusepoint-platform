<template>
  <BaseWidget 
    :widget="widgetConfig"
    :loading="loading"
    :error="error"
    @configure="showConfigModal = true"
    @toggle="toggleWidget"
    @retry="loadHistory"
  >
    <div class="history-widget">
      <!-- En-tête de l'historique -->
      <div class="history-header">
        <div class="header-left">
          <h3 class="history-title">{{ t('widgets.history.title') }}</h3>
          <div class="history-stats">
            <span class="stat-item">
              <i class="fas fa-clock mr-1"></i>
              {{ totalEvents }} {{ t('widgets.history.totalEvents') }}
            </span>
            <span class="stat-item">
              <i class="fas fa-calendar-day mr-1"></i>
              {{ todayEvents }} {{ t('widgets.history.todayEvents') }}
            </span>
            <span class="stat-item">
              <i class="fas fa-users mr-1"></i>
              {{ activeUsers }} {{ t('widgets.history.activeUsers') }}
            </span>
          </div>
        </div>
        
        <div class="header-right">
          <div class="view-controls">
            <button 
              @click="viewMode = 'timeline'"
              class="view-btn"
              :class="{ active: viewMode === 'timeline' }"
              :title="t('widgets.history.timelineView')"
            >
              <i class="fas fa-stream"></i>
            </button>
            
            <button 
              @click="viewMode = 'list'"
              class="view-btn"
              :class="{ active: viewMode === 'list' }"
              :title="t('widgets.history.listView')"
            >
              <i class="fas fa-list"></i>
            </button>
            
            <button 
              @click="viewMode = 'calendar'"
              class="view-btn"
              :class="{ active: viewMode === 'calendar' }"
              :title="t('widgets.history.calendarView')"
            >
              <i class="fas fa-calendar-alt"></i>
            </button>
          </div>
          
          <div class="filter-controls">
            <select v-model="filterType" class="filter-select">
              <option value="all">{{ t('widgets.history.allTypes') }}</option>
              <option value="task">{{ t('widgets.history.tasks') }}</option>
              <option value="comment">{{ t('widgets.history.comments') }}</option>
              <option value="file">{{ t('widgets.history.files') }}</option>
              <option value="goal">{{ t('widgets.history.goals') }}</option>
              <option value="user">{{ t('widgets.history.users') }}</option>
              <option value="system">{{ t('widgets.history.system') }}</option>
            </select>
            
            <select v-model="filterPeriod" class="filter-select">
              <option value="today">{{ t('widgets.history.today') }}</option>
              <option value="week">{{ t('widgets.history.thisWeek') }}</option>
              <option value="month">{{ t('widgets.history.thisMonth') }}</option>
              <option value="quarter">{{ t('widgets.history.thisQuarter') }}</option>
              <option value="year">{{ t('widgets.history.thisYear') }}</option>
              <option value="all">{{ t('widgets.history.allTime') }}</option>
            </select>
            
            <select v-model="filterUser" class="filter-select">
              <option value="all">{{ t('widgets.history.allUsers') }}</option>
              <option 
                v-for="user in uniqueUsers"
                :key="user.id"
                :value="user.id"
              >
                {{ user.name }}
              </option>
            </select>
          </div>
          
          <button @click="exportHistory" class="export-btn">
            <i class="fas fa-download mr-2"></i>
            {{ t('widgets.history.export') }}
          </button>
        </div>
      </div>
      
      <!-- Barre de recherche -->
      <div class="search-bar">
        <div class="search-input-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input 
            v-model="searchQuery"
            type="text"
            :placeholder="t('widgets.history.searchHistory')"
            class="search-input"
          >
          <button 
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="clear-search-btn"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <!-- Statistiques rapides -->
      <div v-if="widgetConfig.showStats" class="history-stats-overview">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon bg-blue-100 text-blue-600">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalEvents }}</div>
              <div class="stat-label">{{ t('widgets.history.totalEvents') }}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon bg-green-100 text-green-600">
              <i class="fas fa-calendar-day"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ todayEvents }}</div>
              <div class="stat-label">{{ t('widgets.history.todayEvents') }}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon bg-purple-100 text-purple-600">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ activeUsers }}</div>
              <div class="stat-label">{{ t('widgets.history.activeUsers') }}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon bg-orange-100 text-orange-600">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ averageEventsPerDay }}</div>
              <div class="stat-label">{{ t('widgets.history.avgPerDay') }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Contenu principal -->
      <div class="history-container" :class="viewMode">
        <!-- Vue timeline -->
        <div v-if="viewMode === 'timeline'" class="timeline-view">
          <div class="timeline">
            <div 
              v-for="(group, date) in groupedEvents"
              :key="date"
              class="timeline-group"
            >
              <div class="timeline-date">
                <div class="date-badge">
                  <span class="date-text">{{ formatDate(date) }}</span>
                  <span class="event-count">{{ group.length }} {{ t('widgets.history.events') }}</span>
                </div>
              </div>
              
              <div class="timeline-events">
                <div 
                  v-for="event in group"
                  :key="event.id"
                  class="timeline-event"
                  :class="getEventClass(event.type)"
                  @click="selectEvent(event)"
                >
                  <div class="event-icon">
                    <i :class="getEventIcon(event.type)"></i>
                  </div>
                  
                  <div class="event-content">
                    <div class="event-header">
                      <h4 class="event-title">{{ event.title }}</h4>
                      <div class="event-meta">
                        <span class="event-time">{{ formatTime(event.created_at) }}</span>
                        <span class="event-type">{{ getEventTypeLabel(event.type) }}</span>
                      </div>
                    </div>
                    
                    <p v-if="event.description" class="event-description">{{ event.description }}</p>
                    
                    <div class="event-footer">
                      <div class="event-user">
                        <img 
                          v-if="event.user.avatar"
                          :src="event.user.avatar"
                          :alt="event.user.name"
                          class="user-avatar"
                        >
                        <div v-else class="user-avatar-placeholder">
                          {{ event.user.name.charAt(0).toUpperCase() }}
                        </div>
                        <span class="user-name">{{ event.user.name }}</span>
                      </div>
                      
                      <div v-if="event.metadata" class="event-metadata">
                        <span 
                          v-for="(value, key) in event.metadata"
                          :key="key"
                          class="metadata-item"
                        >
                          {{ key }}: {{ value }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="event-actions">
                    <button 
                      @click.stop="viewEventDetails(event)"
                      class="action-btn"
                      :title="t('widgets.history.viewDetails')"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    
                    <div class="dropdown">
                      <button 
                        @click.stop="toggleEventMenu(event.id)"
                        class="action-btn"
                        :title="t('widgets.history.moreActions')"
                      >
                        <i class="fas fa-ellipsis-v"></i>
                      </button>
                      
                      <div v-if="activeEventMenu === event.id" class="dropdown-menu">
                        <button @click="copyEventLink(event)" class="dropdown-item">
                          <i class="fas fa-link mr-2"></i>
                          {{ t('widgets.history.copyLink') }}
                        </button>
                        
                        <button @click="shareEvent(event)" class="dropdown-item">
                          <i class="fas fa-share mr-2"></i>
                          {{ t('widgets.history.share') }}
                        </button>
                        
                        <button 
                          v-if="canDeleteEvent(event)"
                          @click="deleteEvent(event)"
                          class="dropdown-item text-red-600"
                        >
                          <i class="fas fa-trash mr-2"></i>
                          {{ t('widgets.history.delete') }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Vue liste -->
        <div v-else-if="viewMode === 'list'" class="list-view">
          <div class="list-header">
            <div class="header-cell type">{{ t('widgets.history.type') }}</div>
            <div class="header-cell title">{{ t('widgets.history.title') }}</div>
            <div class="header-cell user">{{ t('widgets.history.user') }}</div>
            <div class="header-cell date">{{ t('widgets.history.date') }}</div>
            <div class="header-cell actions">{{ t('widgets.history.actions') }}</div>
          </div>
          
          <div 
            v-for="event in filteredEvents"
            :key="event.id"
            class="list-item"
            :class="{
              'selected': selectedEvent?.id === event.id
            }"
            @click="selectEvent(event)"
          >
            <div class="list-cell type">
              <div class="type-indicator" :class="getEventClass(event.type)">
                <i :class="getEventIcon(event.type)"></i>
                <span class="type-label">{{ getEventTypeLabel(event.type) }}</span>
              </div>
            </div>
            
            <div class="list-cell title">
              <div class="event-title-cell">
                <h5 class="event-title">{{ event.title }}</h5>
                <p v-if="event.description" class="event-description">{{ event.description }}</p>
              </div>
            </div>
            
            <div class="list-cell user">
              <div class="user-info">
                <img 
                  v-if="event.user.avatar"
                  :src="event.user.avatar"
                  :alt="event.user.name"
                  class="user-avatar"
                >
                <div v-else class="user-avatar-placeholder">
                  {{ event.user.name.charAt(0).toUpperCase() }}
                </div>
                <span class="user-name">{{ event.user.name }}</span>
              </div>
            </div>
            
            <div class="list-cell date">
              <div class="date-info">
                <span class="date-text">{{ formatDateTime(event.created_at) }}</span>
                <span class="relative-time">{{ getRelativeTime(event.created_at) }}</span>
              </div>
            </div>
            
            <div class="list-cell actions">
              <div class="action-buttons">
                <button 
                  @click.stop="viewEventDetails(event)"
                  class="action-btn-small"
                  :title="t('widgets.history.viewDetails')"
                >
                  <i class="fas fa-eye"></i>
                </button>
                
                <div class="dropdown">
                  <button 
                    @click.stop="toggleEventMenu(event.id)"
                    class="action-btn-small"
                    :title="t('widgets.history.moreActions')"
                  >
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                  
                  <div v-if="activeEventMenu === event.id" class="dropdown-menu">
                    <button @click="copyEventLink(event)" class="dropdown-item">
                      <i class="fas fa-link mr-2"></i>
                      {{ t('widgets.history.copyLink') }}
                    </button>
                    
                    <button @click="shareEvent(event)" class="dropdown-item">
                      <i class="fas fa-share mr-2"></i>
                      {{ t('widgets.history.share') }}
                    </button>
                    
                    <button 
                      v-if="canDeleteEvent(event)"
                      @click="deleteEvent(event)"
                      class="dropdown-item text-red-600"
                    >
                      <i class="fas fa-trash mr-2"></i>
                      {{ t('widgets.history.delete') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Vue calendrier -->
        <div v-else-if="viewMode === 'calendar'" class="calendar-view">
          <div class="calendar-header">
            <button @click="previousMonth" class="nav-btn">
              <i class="fas fa-chevron-left"></i>
            </button>
            
            <h4 class="calendar-title">
              {{ formatMonthYear(currentCalendarDate) }}
            </h4>
            
            <button @click="nextMonth" class="nav-btn">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          
          <div class="calendar-grid">
            <div class="calendar-weekdays">
              <div 
                v-for="day in weekdays"
                :key="day"
                class="weekday"
              >
                {{ day }}
              </div>
            </div>
            
            <div class="calendar-days">
              <div 
                v-for="day in calendarDays"
                :key="day.date"
                class="calendar-day"
                :class="{
                  'other-month': !day.isCurrentMonth,
                  'today': day.isToday,
                  'has-events': day.events.length > 0,
                  'selected': selectedCalendarDay === day.date
                }"
                @click="selectCalendarDay(day)"
              >
                <div class="day-number">{{ day.dayNumber }}</div>
                <div v-if="day.events.length > 0" class="day-events">
                  <div 
                    v-for="event in day.events.slice(0, 3)"
                    :key="event.id"
                    class="day-event"
                    :class="getEventClass(event.type)"
                    :title="event.title"
                  >
                    <i :class="getEventIcon(event.type)"></i>
                    <span class="event-title-short">{{ event.title }}</span>
                  </div>
                  <div v-if="day.events.length > 3" class="more-events">
                    +{{ day.events.length - 3 }} {{ t('widgets.history.more') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Détails du jour sélectionné -->
          <div v-if="selectedCalendarDay" class="selected-day-events">
            <h5 class="selected-day-title">
              {{ t('widgets.history.eventsFor') }} {{ formatDate(selectedCalendarDay) }}
            </h5>
            
            <div class="selected-day-list">
              <div 
                v-for="event in getEventsForDay(selectedCalendarDay)"
                :key="event.id"
                class="selected-day-event"
                @click="selectEvent(event)"
              >
                <div class="event-icon" :class="getEventClass(event.type)">
                  <i :class="getEventIcon(event.type)"></i>
                </div>
                
                <div class="event-info">
                  <h6 class="event-title">{{ event.title }}</h6>
                  <p class="event-time">{{ formatTime(event.created_at) }}</p>
                  <p class="event-user">{{ event.user.name }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Message si aucun événement -->
        <div v-if="filteredEvents.length === 0" class="no-events">
          <i class="fas fa-clock text-gray-400 text-4xl mb-3"></i>
          <h5 class="text-gray-600 mb-2">{{ t('widgets.history.noEvents') }}</h5>
          <p class="text-gray-500 text-sm">{{ t('widgets.history.noEventsDescription') }}</p>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1 && viewMode !== 'calendar'" class="pagination">
        <button 
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <span class="pagination-info">
          {{ currentPage }} / {{ totalPages }}
        </span>
        
        <button 
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
    
    <!-- Modal de détails d'événement -->
    <EventDetailsModal 
      v-if="showDetailsModal"
      :event="selectedEvent"
      @close="showDetailsModal = false"
      @delete="deleteEvent"
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import BaseWidget from './shared/components/BaseWidget.vue'
import EventDetailsModal from '../modals/EventDetailsModal.vue'
import WidgetConfigModal from '../modals/WidgetConfigModal.vue'
import historyService from '@/services/historyService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'
import type { HistoryEvent, HistoryEventType, HistoryFilter } from './types'

// Props
interface Props {
  projectId: string
  widgetData?: any
  widget?: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'widget-updated': [widget: any]
}>()

// Composables
const { success, error: showError } = useNotifications()
const { t } = useTranslation()
const { user } = useAuth()

// État réactif
const loading = ref(false)
const error = ref(null)
const events = ref([])
const selectedEvent = ref(null)
const viewMode = ref('timeline')
const filterType = ref('all')
const filterPeriod = ref('week')
const filterUser = ref('all')
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(20)
const showDetailsModal = ref(false)
const showConfigModal = ref(false)
const activeEventMenu = ref(null)
const currentCalendarDate = ref(new Date())
const selectedCalendarDay = ref(null)

// Configuration du widget
const widgetConfig = computed(() => ({
  titleKey: 'widgets.history.title',
  isEnabled: props.widget?.is_enabled ?? true,
  showStats: props.widget?.show_stats ?? true,
  showUserAvatars: props.widget?.show_user_avatars ?? true,
  showEventTypes: props.widget?.show_event_types ?? true,
  allowDelete: props.widget?.allow_delete ?? false,
  autoRefresh: props.widget?.auto_refresh ?? true,
  refreshInterval: props.widget?.refresh_interval ?? 300000,
  maxEvents: props.widget?.max_events ?? 1000
}))

// Options de configuration
const configOptions = ref([
  {
    key: 'showStats',
    type: 'boolean',
    label: 'Afficher les statistiques',
    default: true
  },
  {
    key: 'showUserAvatars',
    type: 'boolean',
    label: 'Afficher les avatars utilisateurs',
    default: true
  },
  {
    key: 'showEventTypes',
    type: 'boolean',
    label: 'Afficher les types d\'événements',
    default: true
  },
  {
    key: 'allowDelete',
    type: 'boolean',
    label: 'Permettre la suppression',
    default: false
  },
  {
    key: 'autoRefresh',
    type: 'boolean',
    label: 'Actualisation automatique',
    default: true
  },
  {
    key: 'refreshInterval',
    type: 'number',
    label: 'Intervalle d\'actualisation (ms)',
    min: 60000,
    max: 600000,
    step: 60000,
    default: 300000
  },
  {
    key: 'maxEvents',
    type: 'number',
    label: 'Nombre maximum d\'événements',
    min: 100,
    max: 5000,
    step: 100,
    default: 1000
  }
])

    
    // Propriétés calculées
    const totalEvents = computed(() => events.value.length)
    
    const todayEvents = computed(() => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      return events.value.filter(event => {
        const eventDate = new Date(event.created_at)
        return eventDate >= today && eventDate < tomorrow
      }).length
    })
    
    const activeUsers = computed(() => {
      const userIds = new Set(events.value.map(event => event.user.id))
      return userIds.size
    })
    
    const uniqueUsers = computed(() => {
      const usersMap = new Map()
      events.value.forEach(event => {
        if (!usersMap.has(event.user.id)) {
          usersMap.set(event.user.id, event.user)
        }
      })
      return Array.from(usersMap.values())
    })
    
    const averageEventsPerDay = computed(() => {
      if (events.value.length === 0) return 0
      
      const firstEvent = events.value[events.value.length - 1]
      const lastEvent = events.value[0]
      const daysDiff = Math.ceil(
        (new Date(lastEvent.created_at) - new Date(firstEvent.created_at)) / (1000 * 60 * 60 * 24)
      )
      
      return daysDiff > 0 ? Math.round(events.value.length / daysDiff) : events.value.length
    })
    
    const filteredEvents = computed(() => {
      let filtered = [...events.value]
      
      // Filtrer par type
      if (filterType.value !== 'all') {
        filtered = filtered.filter(event => event.type === filterType.value)
      }
      
      // Filtrer par utilisateur
      if (filterUser.value !== 'all') {
        filtered = filtered.filter(event => event.user.id === filterUser.value)
      }
      
      // Filtrer par période
      const now = new Date()
      switch (filterPeriod.value) {
        case 'today':
          const today = new Date(now)
          today.setHours(0, 0, 0, 0)
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.created_at)
            return eventDate >= today && eventDate < tomorrow
          })
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(event => new Date(event.created_at) >= weekAgo)
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(event => new Date(event.created_at) >= monthAgo)
          break
        case 'quarter':
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(event => new Date(event.created_at) >= quarterAgo)
          break
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(event => new Date(event.created_at) >= yearAgo)
          break
      }
      
      // Filtrer par recherche
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(event => 
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.user.name.toLowerCase().includes(query)
        )
      }
      
      // Pagination pour la vue liste
      if (viewMode.value === 'list') {
        const start = (currentPage.value - 1) * itemsPerPage.value
        const end = start + itemsPerPage.value
        return filtered.slice(start, end)
      }
      
      return filtered
    })
    
    const groupedEvents = computed(() => {
      const groups = {}
      
      filteredEvents.value.forEach(event => {
        const date = new Date(event.created_at).toDateString()
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(event)
      })
      
      return groups
    })
    
    const totalPages = computed(() => {
      if (viewMode.value !== 'list') return 1
      
      const totalFiltered = events.value.filter(event => {
        // Appliquer les mêmes filtres que filteredEvents mais sans pagination
        let include = true
        
        if (filterType.value !== 'all') {
          include = event.type === filterType.value
        }
        
        if (filterUser.value !== 'all' && include) {
          include = event.user.id === filterUser.value
        }
        
        if (include) {
          const now = new Date()
          switch (filterPeriod.value) {
            case 'today':
              const today = new Date(now)
              today.setHours(0, 0, 0, 0)
              const tomorrow = new Date(today)
              tomorrow.setDate(tomorrow.getDate() + 1)
              const eventDate = new Date(event.created_at)
              include = eventDate >= today && eventDate < tomorrow
              break
            case 'week':
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
              include = new Date(event.created_at) >= weekAgo
              break
            case 'month':
              const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
              include = new Date(event.created_at) >= monthAgo
              break
            case 'quarter':
              const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
              include = new Date(event.created_at) >= quarterAgo
              break
            case 'year':
              const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
              include = new Date(event.created_at) >= yearAgo
              break
          }
        }
        
        if (searchQuery.value && include) {
          const query = searchQuery.value.toLowerCase()
          include = event.title.toLowerCase().includes(query) ||
                   event.description?.toLowerCase().includes(query) ||
                   event.user.name.toLowerCase().includes(query)
        }
        
        return include
      }).length
      
      return Math.ceil(totalFiltered / itemsPerPage.value)
    })
    
    const weekdays = computed(() => {
      return ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    })
    
    const calendarDays = computed(() => {
      const year = currentCalendarDate.value.getFullYear()
      const month = currentCalendarDate.value.getMonth()
      
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())
      
      const days = []
      const today = new Date()
      
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        
        const dayEvents = events.value.filter(event => {
          const eventDate = new Date(event.created_at)
          return eventDate.toDateString() === date.toDateString()
        })
        
        days.push({
          date: date.toDateString(),
          dayNumber: date.getDate(),
          isCurrentMonth: date.getMonth() === month,
          isToday: date.toDateString() === today.toDateString(),
          events: dayEvents
        })
      }
      
      return days
    })
    
    // Méthodes
    const loadHistory = async () => {
      loading.value = true
      error.value = null
      
      try {
        const result = await historyService.getProjectHistory(props.projectId, {
          limit: widgetConfig.value.maxEvents
        })
        if (result.success) {
          events.value = result.data
        } else {
          error.value = result.error
        }
      } catch (err) {
        error.value = t('errors.loadingFailed')
      } finally {
        loading.value = false
      }
    }
    
    const toggleWidget = () => {
      const updatedWidget = {
        ...props.widget,
        is_enabled: !props.widget?.is_enabled
      }
      emit('widget-updated', updatedWidget)
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      if (date.toDateString() === today.toDateString()) {
        return t('widgets.history.today')
      } else if (date.toDateString() === yesterday.toDateString()) {
        return t('widgets.history.yesterday')
      } else {
        return date.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        })
      }
    }
    
    const formatTime = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const formatDateTime = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const formatMonthYear = (date) => {
      return date.toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric'
      })
    }
    
    const getRelativeTime = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffMinutes = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      if (diffMinutes < 1) return t('widgets.history.justNow')
      if (diffMinutes < 60) return t('widgets.history.minutesAgo', { count: diffMinutes })
      if (diffHours < 24) return t('widgets.history.hoursAgo', { count: diffHours })
      return t('widgets.history.daysAgo', { count: diffDays })
    }
    
    const getEventClass = (type) => {
      const classes = {
        task: 'event-task',
        comment: 'event-comment',
        file: 'event-file',
        goal: 'event-goal',
        user: 'event-user',
        system: 'event-system'
      }
      return classes[type] || 'event-default'
    }
    
    const getEventIcon = (type) => {
      const icons = {
        task: 'fas fa-tasks',
        comment: 'fas fa-comment',
        file: 'fas fa-file',
        goal: 'fas fa-bullseye',
        user: 'fas fa-user',
        system: 'fas fa-cog'
      }
      return icons[type] || 'fas fa-circle'
    }
    
    const getEventTypeLabel = (type) => {
      const labels = {
        task: t('widgets.history.taskEvent'),
        comment: t('widgets.history.commentEvent'),
        file: t('widgets.history.fileEvent'),
        goal: t('widgets.history.goalEvent'),
        user: t('widgets.history.userEvent'),
        system: t('widgets.history.systemEvent')
      }
      return labels[type] || type
    }
    
    const selectEvent = (event) => {
      selectedEvent.value = event
      showDetailsModal.value = true
    }
    
    const toggleEventMenu = (eventId) => {
      activeEventMenu.value = activeEventMenu.value === eventId ? null : eventId
    }
    
    const viewEventDetails = (event) => {
      selectedEvent.value = event
      showDetailsModal.value = true
      activeEventMenu.value = null
    }
    
    const copyEventLink = async (event) => {
      try {
        const link = `${window.location.origin}/projects/${props.projectId}/history/${event.id}`
        await navigator.clipboard.writeText(link)
        success(t('widgets.history.linkCopied'))
      } catch (err) {
        showError(t('widgets.history.copyError'))
      }
      
      activeEventMenu.value = null
    }
    
    const shareEvent = (event) => {
      // Implémenter le partage d'événement
      const link = `${window.location.origin}/projects/${props.projectId}/history/${event.id}`
      
      if (navigator.share) {
        navigator.share({
          title: event.title,
          text: event.description,
          url: link
        })
      } else {
        copyEventLink(event)
      }
      
      activeEventMenu.value = null
    }
    
    const canDeleteEvent = (event) => {
      return widgetConfig.value.allowDelete && 
             (user.value.role === 'admin' || user.value.role === 'super_admin' || event.user.id === user.value.id)
    }
    
    const deleteEvent = async (event) => {
      if (!canDeleteEvent(event)) {
        showError(t('widgets.history.deleteNotAllowed'))
        return
      }
      
      if (!confirm(t('widgets.history.confirmDelete', { title: event.title }))) return
      
      try {
        const result = await historyService.deleteEvent(event.id)
        if (result.success) {
          events.value = events.value.filter(e => e.id !== event.id)
          success(t('widgets.history.eventDeleted'))
        } else {
          showError(result.error)
        }
      } catch (err) {
        showError(t('widgets.history.deleteError'))
      }
      
      activeEventMenu.value = null
      showDetailsModal.value = false
    }
    
    const exportHistory = async () => {
      try {
        const result = await historyService.exportHistory(props.projectId, {
          type: filterType.value,
          period: filterPeriod.value,
          user: filterUser.value,
          search: searchQuery.value
        })
        
        if (result.success) {
          // Créer un lien de téléchargement
          const blob = new Blob([result.data], { type: 'text/csv' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `history-${props.projectId}-${new Date().toISOString().split('T')[0]}.csv`
          link.click()
          window.URL.revokeObjectURL(url)
          
          success(t('widgets.history.exportSuccess'))
        } else {
          showError(result.error)
        }
      } catch (err) {
        showError(t('widgets.history.exportError'))
      }
    }
    
    const previousMonth = () => {
      const newDate = new Date(currentCalendarDate.value)
      newDate.setMonth(newDate.getMonth() - 1)
      currentCalendarDate.value = newDate
    }
    
    const nextMonth = () => {
      const newDate = new Date(currentCalendarDate.value)
      newDate.setMonth(newDate.getMonth() + 1)
      currentCalendarDate.value = newDate
    }
    
    const selectCalendarDay = (day) => {
      selectedCalendarDay.value = day.date
    }
    
    const getEventsForDay = (dateString) => {
      return events.value.filter(event => {
        const eventDate = new Date(event.created_at)
        return eventDate.toDateString() === dateString
      })
    }
    
    const updateConfig = (newConfig) => {
      widgetConfig.value = { ...widgetConfig.value, ...newConfig }
      emit('update-widget', widgetConfig.value)
      showConfigModal.value = false
    }
    
    // Auto-refresh
    let refreshInterval = null
    
    const startAutoRefresh = () => {
      if (widgetConfig.value.autoRefresh && widgetConfig.value.refreshInterval) {
        refreshInterval = setInterval(loadHistory, widgetConfig.value.refreshInterval)
      }
    }
    
    const stopAutoRefresh = () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
        refreshInterval = null
      }
    }
    
    // Lifecycle
    onMounted(() => {
      loadHistory()
      startAutoRefresh()
    })
    
    // Watchers
    watch(() => props.projectId, loadHistory)
    
    watch(() => widgetConfig.value.autoRefresh, (newValue) => {
      if (newValue) {
        startAutoRefresh()
      } else {
        stopAutoRefresh()
      }
    })
    
    watch(() => widgetConfig.value.refreshInterval, () => {
      stopAutoRefresh()
      startAutoRefresh()
    })
    
    // Cleanup
    onUnmounted(() => {
      stopAutoRefresh()
    })
    

</script>

<style scoped>
.history-widget {
  @apply space-y-4;
}

.history-header {
  @apply flex items-center justify-between;
}

.header-left {
  @apply flex flex-col space-y-2;
}

.history-title {
  @apply text-xl font-bold text-gray-900;
}

.history-stats {
  @apply flex items-center space-x-4 text-sm text-gray-600;
}

.stat-item {
  @apply flex items-center;
}

.header-right {
  @apply flex items-center space-x-3;
}

.view-controls {
  @apply flex items-center space-x-1 border border-gray-300 rounded-md;
}

.view-btn {
  @apply p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors;
}

.view-btn.active {
  @apply text-blue-600 bg-blue-50;
}

.filter-controls {
  @apply flex items-center space-x-2;
}

.filter-select {
  @apply px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.export-btn {
  @apply bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center;
}

.search-bar {
  @apply relative;
}

.search-input-wrapper {
  @apply relative;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400;
}

.search-input {
  @apply w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.clear-search-btn {
  @apply absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600;
}

.history-stats-overview {
  @apply bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6;
}

.stats-grid {
  @apply grid grid-cols-2 lg:grid-cols-4 gap-4;
}

.stat-card {
  @apply bg-white rounded-lg p-4 flex items-center space-x-3;
}

.stat-icon {
  @apply w-10 h-10 rounded-lg flex items-center justify-center;
}

.stat-content {
  @apply flex-1;
}

.stat-value {
  @apply text-xl font-bold text-gray-900;
}

.stat-label {
  @apply text-sm text-gray-600;
}

.history-container {
  @apply min-h-[400px];
}

/* Vue timeline */
.timeline-view {
  @apply space-y-6;
}

.timeline {
  @apply space-y-8;
}

.timeline-group {
  @apply space-y-4;
}

.timeline-date {
  @apply flex items-center;
}

.date-badge {
  @apply bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center space-x-2;
}

.date-text {
  @apply font-medium;
}

.event-count {
  @apply text-sm;
}

.timeline-events {
  @apply space-y-3 ml-4 border-l-2 border-gray-200 pl-6;
}

.timeline-event {
  @apply bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer relative;
}

.timeline-event::before {
  @apply absolute -left-8 top-4 w-3 h-3 bg-white border-2 border-gray-300 rounded-full;
  content: '';
}

.event-task::before {
  @apply border-blue-500;
}

.event-comment::before {
  @apply border-green-500;
}

.event-file::before {
  @apply border-purple-500;
}

.event-goal::before {
  @apply border-orange-500;
}

.event-user::before {
  @apply border-indigo-500;
}

.event-system::before {
  @apply border-gray-500;
}

.event-icon {
  @apply absolute -left-9 top-3 w-5 h-5 flex items-center justify-center text-xs;
}

.event-content {
  @apply space-y-3;
}

.event-header {
  @apply flex items-start justify-between;
}

.event-title {
  @apply text-lg font-semibold text-gray-900;
}

.event-meta {
  @apply flex items-center space-x-2 text-sm text-gray-600;
}

.event-time {
  @apply font-medium;
}

.event-type {
  @apply px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs;
}

.event-description {
  @apply text-gray-600;
}

.event-footer {
  @apply flex items-center justify-between;
}

.event-user {
  @apply flex items-center space-x-2;
}

.user-avatar {
  @apply w-6 h-6 rounded-full object-cover;
}

.user-avatar-placeholder {
  @apply w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700;
}

.user-name {
  @apply text-sm text-gray-900;
}

.event-metadata {
  @apply flex items-center space-x-2;
}

.metadata-item {
  @apply text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded;
}

.event-actions {
  @apply flex items-center space-x-1;
}

.action-btn {
  @apply p-1 text-gray-400 hover:text-gray-600 transition-colors;
}

/* Vue liste */
.list-view {
  @apply space-y-1;
}

.list-header {
  @apply grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700;
}

.list-item {
  @apply grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100;
}

.list-item.selected {
  @apply bg-blue-50 border-blue-200;
}

.header-cell.type,
.list-cell.type {
  @apply col-span-2 flex items-center;
}

.header-cell.title,
.list-cell.title {
  @apply col-span-4;
}

.header-cell.user,
.list-cell.user {
  @apply col-span-2 flex items-center;
}

.header-cell.date,
.list-cell.date {
  @apply col-span-3 flex items-center;
}

.header-cell.actions,
.list-cell.actions {
  @apply col-span-1 flex items-center justify-end;
}

.type-indicator {
  @apply flex items-center space-x-2;
}

.type-label {
  @apply text-sm;
}

.event-title-cell {
  @apply space-y-1;
}

.user-info {
  @apply flex items-center space-x-2;
}

.date-info {
  @apply space-y-1;
}

.relative-time {
  @apply text-xs text-gray-500;
}

.action-buttons {
  @apply flex items-center space-x-1;
}

.action-btn-small {
  @apply p-1 text-gray-400 hover:text-gray-600 transition-colors;
}

/* Vue calendrier */
.calendar-view {
  @apply space-y-4;
}

.calendar-header {
  @apply flex items-center justify-between;
}

.nav-btn {
  @apply p-2 text-gray-500 hover:text-gray-700 transition-colors;
}

.calendar-title {
  @apply text-lg font-semibold text-gray-900;
}

.calendar-grid {
  @apply bg-white border border-gray-200 rounded-lg overflow-hidden;
}

.calendar-weekdays {
  @apply grid grid-cols-7 bg-gray-50;
}

.weekday {
  @apply p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0;
}

.calendar-days {
  @apply grid grid-cols-7;
}

.calendar-day {
  @apply min-h-[100px] p-2 border-r border-b border-gray-200 last:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors;
}

.calendar-day.other-month {
  @apply bg-gray-50 text-gray-400;
}

.calendar-day.today {
  @apply bg-blue-50 border-blue-200;
}

.calendar-day.has-events {
  @apply bg-green-50;
}

.calendar-day.selected {
  @apply bg-blue-100 border-blue-300;
}

.day-number {
  @apply text-sm font-medium mb-1;
}

.day-events {
  @apply space-y-1;
}

.day-event {
  @apply flex items-center space-x-1 text-xs p-1 rounded truncate;
}

.event-title-short {
  @apply truncate;
}

.more-events {
  @apply text-xs text-gray-500 italic;
}

.selected-day-events {
  @apply bg-white border border-gray-200 rounded-lg p-4;
}

.selected-day-title {
  @apply text-lg font-semibold text-gray-900 mb-3;
}

.selected-day-list {
  @apply space-y-2;
}

.selected-day-event {
  @apply flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer;
}

.event-info {
  @apply flex-1;
}

.dropdown {
  @apply relative;
}

.dropdown-menu {
  @apply absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px];
}

.dropdown-item {
  @apply w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center;
}

.no-events {
  @apply text-center py-12;
}

.pagination {
  @apply flex items-center justify-center space-x-4 pt-4 border-t border-gray-200;
}

.pagination-btn {
  @apply p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}

.pagination-info {
  @apply text-sm text-gray-600;
}

/* Classes d'événements */
.event-task {
  @apply border-l-4 border-l-blue-500;
}

.event-comment {
  @apply border-l-4 border-l-green-500;
}

.event-file {
  @apply border-l-4 border-l-purple-500;
}

.event-goal {
  @apply border-l-4 border-l-orange-500;
}

.event-user {
  @apply border-l-4 border-l-indigo-500;
}

.event-system {
  @apply border-l-4 border-l-gray-500;
}

.event-default {
  @apply border-l-4 border-l-gray-300;
}
</style>