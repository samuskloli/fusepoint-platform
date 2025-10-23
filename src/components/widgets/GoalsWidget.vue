<template>
  <BaseWidget 
    :widget="widgetConfig"
    :loading="loading"
    :error="error"
    @configure="showConfigModal = true"
    @toggle="toggleWidget"
    @retry="loadGoals"
  >
    <div class="goals-widget">
      <!-- En-tête des objectifs -->
      <div class="goals-header">
        <div class="header-left">
          <h3 class="goals-title">{{ t('widgets.goals.title') }}</h3>
          <div class="goals-stats">
            <span class="stat-item">
              <i class="fas fa-bullseye mr-1"></i>
              {{ totalGoals }} {{ t('widgets.goals.totalGoals') }}
            </span>
            <span class="stat-item">
              <i class="fas fa-check-circle mr-1 text-green-500"></i>
              {{ completedGoals }} {{ t('widgets.goals.completed') }}
            </span>
            <span class="stat-item">
              <i class="fas fa-percentage mr-1"></i>
              {{ completionRate }}% {{ t('widgets.goals.completionRate') }}
            </span>
          </div>
        </div>
        
        <div class="header-right">
          <div class="view-controls">
            <button 
              @click="viewMode = 'list'"
              class="view-btn"
              :class="{ active: viewMode === 'list' }"
              :title="t('widgets.goals.listView')"
            >
              <i class="fas fa-list"></i>
            </button>
            
            <button 
              @click="viewMode = 'cards'"
              class="view-btn"
              :class="{ active: viewMode === 'cards' }"
              :title="t('widgets.goals.cardsView')"
            >
              <i class="fas fa-th-large"></i>
            </button>
          </div>
          
          <div class="filter-controls">
            <select v-model="filterStatus" class="filter-select">
              <option value="all">{{ t('widgets.goals.allGoals') }}</option>
              <option value="active">{{ t('widgets.goals.active') }}</option>
              <option value="completed">{{ t('widgets.goals.completed') }}</option>
              <option value="overdue">{{ t('widgets.goals.overdue') }}</option>
              <option value="upcoming">{{ t('widgets.goals.upcoming') }}</option>
            </select>
            
            <select v-model="sortBy" class="filter-select">
              <option value="priority">{{ t('widgets.goals.sortByPriority') }}</option>
              <option value="deadline">{{ t('widgets.goals.sortByDeadline') }}</option>
              <option value="progress">{{ t('widgets.goals.sortByProgress') }}</option>
              <option value="name">{{ t('widgets.goals.sortByName') }}</option>
            </select>
          </div>
          
          <button @click="showCreateModal = true" class="create-btn">
            <i class="fas fa-plus mr-2"></i>
            {{ t('widgets.goals.createGoal') }}
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
            :placeholder="t('widgets.goals.searchGoals')"
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
      
      <!-- Graphique de progression globale -->
      <div v-if="widgetConfig.showOverview" class="goals-overview">
        <div class="overview-chart">
          <div class="chart-container">
            <div class="progress-ring">
              <svg class="progress-svg" width="120" height="120">
                <circle
                  class="progress-bg"
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#e5e7eb"
                  stroke-width="8"
                />
                <circle
                  class="progress-bar"
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#3b82f6"
                  stroke-width="8"
                  stroke-linecap="round"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="progressOffset"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div class="progress-text">
                <span class="progress-percentage">{{ completionRate }}%</span>
                <span class="progress-label">{{ t('widgets.goals.complete') }}</span>
              </div>
            </div>
          </div>
          
          <div class="overview-stats">
            <div class="stat-card">
              <div class="stat-icon bg-blue-100 text-blue-600">
                <i class="fas fa-bullseye"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalGoals }}</div>
                <div class="stat-label">{{ t('widgets.goals.totalGoals') }}</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon bg-green-100 text-green-600">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ completedGoals }}</div>
                <div class="stat-label">{{ t('widgets.goals.completed') }}</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon bg-yellow-100 text-yellow-600">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ activeGoals }}</div>
                <div class="stat-label">{{ t('widgets.goals.active') }}</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon bg-red-100 text-red-600">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ overdueGoals }}</div>
                <div class="stat-label">{{ t('widgets.goals.overdue') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Liste/Cartes des objectifs -->
      <div class="goals-container" :class="viewMode">
        <!-- Vue cartes -->
        <div v-if="viewMode === 'cards'" class="goals-grid">
          <div 
            v-for="goal in filteredGoals"
            :key="goal.id"
            class="goal-card"
            :class="{
              'completed': goal.status === 'completed',
              'overdue': isOverdue(goal),
              'high-priority': goal.priority === 'high'
            }"
            @click="selectGoal(goal)"
          >
            <div class="goal-header">
              <div class="goal-priority">
                <span 
                  class="priority-badge"
                  :class="getPriorityClass(goal.priority)"
                >
                  {{ getPriorityLabel(goal.priority) }}
                </span>
              </div>
              
              <div class="goal-actions">
                <button 
                  @click.stop="editGoal(goal)"
                  class="action-btn"
                  :title="t('widgets.goals.edit')"
                >
                  <i class="fas fa-edit"></i>
                </button>
                
                <div class="dropdown">
                  <button 
                    @click.stop="toggleGoalMenu(goal.id)"
                    class="action-btn"
                    :title="t('widgets.goals.moreActions')"
                  >
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                  
                  <div v-if="activeGoalMenu === goal.id" class="dropdown-menu">
                    <button @click="duplicateGoal(goal)" class="dropdown-item">
                      <i class="fas fa-copy mr-2"></i>
                      {{ t('widgets.goals.duplicate') }}
                    </button>
                    
                    <button @click="archiveGoal(goal)" class="dropdown-item">
                      <i class="fas fa-archive mr-2"></i>
                      {{ t('widgets.goals.archive') }}
                    </button>
                    
                    <button @click="deleteGoal(goal)" class="dropdown-item text-red-600">
                      <i class="fas fa-trash mr-2"></i>
                      {{ t('widgets.goals.delete') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="goal-content">
              <h4 class="goal-title" :title="goal.title">{{ goal.title }}</h4>
              <p v-if="goal.description" class="goal-description">{{ goal.description }}</p>
              
              <div class="goal-progress">
                <div class="progress-header">
                  <span class="progress-label">{{ t('widgets.goals.progress') }}</span>
                  <span class="progress-value">{{ goal.progress }}%</span>
                </div>
                <div class="progress-bar-container">
                  <div 
                    class="progress-bar"
                    :style="{ width: goal.progress + '%' }"
                    :class="getProgressClass(goal.progress)"
                  ></div>
                </div>
              </div>
              
              <div class="goal-meta">
                <div v-if="goal.deadline" class="goal-deadline">
                  <i class="fas fa-calendar-alt mr-1"></i>
                  <span :class="{ 'text-red-600': isOverdue(goal) }">
                    {{ formatDeadline(goal.deadline) }}
                  </span>
                </div>
                
                <div v-if="goal.assignee" class="goal-assignee">
                  <i class="fas fa-user mr-1"></i>
                  <span>{{ goal.assignee.name }}</span>
                </div>
              </div>
            </div>
            
            <div class="goal-footer">
              <div class="goal-tags">
                <span 
                  v-for="tag in goal.tags"
                  :key="tag"
                  class="goal-tag"
                >
                  {{ tag }}
                </span>
              </div>
              
              <div class="goal-status">
                <button 
                  @click.stop="toggleGoalStatus(goal)"
                  class="status-btn"
                  :class="getStatusClass(goal.status)"
                >
                  <i :class="getStatusIcon(goal.status)"></i>
                  {{ getStatusLabel(goal.status) }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Vue liste -->
        <div v-else class="goals-list">
          <div class="list-header">
            <div class="header-cell title">{{ t('widgets.goals.title') }}</div>
            <div class="header-cell priority">{{ t('widgets.goals.priority') }}</div>
            <div class="header-cell progress">{{ t('widgets.goals.progress') }}</div>
            <div class="header-cell deadline">{{ t('widgets.goals.deadline') }}</div>
            <div class="header-cell assignee">{{ t('widgets.goals.assignee') }}</div>
            <div class="header-cell status">{{ t('widgets.goals.status') }}</div>
            <div class="header-cell actions">{{ t('widgets.goals.actions') }}</div>
          </div>
          
          <div 
            v-for="goal in filteredGoals"
            :key="goal.id"
            class="list-item"
            :class="{
              'completed': goal.status === 'completed',
              'overdue': isOverdue(goal),
              'selected': selectedGoal?.id === goal.id
            }"
            @click="selectGoal(goal)"
          >
            <div class="list-cell title">
              <div class="goal-title-cell">
                <h5 class="goal-title">{{ goal.title }}</h5>
                <p v-if="goal.description" class="goal-description">{{ goal.description }}</p>
              </div>
            </div>
            
            <div class="list-cell priority">
              <span 
                class="priority-badge"
                :class="getPriorityClass(goal.priority)"
              >
                {{ getPriorityLabel(goal.priority) }}
              </span>
            </div>
            
            <div class="list-cell progress">
              <div class="progress-container">
                <div class="progress-bar-small">
                  <div 
                    class="progress-fill"
                    :style="{ width: goal.progress + '%' }"
                    :class="getProgressClass(goal.progress)"
                  ></div>
                </div>
                <span class="progress-text">{{ goal.progress }}%</span>
              </div>
            </div>
            
            <div class="list-cell deadline">
              <span 
                v-if="goal.deadline"
                :class="{ 'text-red-600': isOverdue(goal) }"
              >
                {{ formatDeadline(goal.deadline) }}
              </span>
              <span v-else class="text-gray-400">—</span>
            </div>
            
            <div class="list-cell assignee">
              <div v-if="goal.assignee" class="assignee-info">
                <img 
                  v-if="goal.assignee.avatar"
                  :src="goal.assignee.avatar"
                  :alt="goal.assignee.name"
                  class="assignee-avatar"
                >
                <div v-else class="assignee-avatar-placeholder">
                  {{ goal.assignee.name.charAt(0).toUpperCase() }}
                </div>
                <span class="assignee-name">{{ goal.assignee.name }}</span>
              </div>
              <span v-else class="text-gray-400">—</span>
            </div>
            
            <div class="list-cell status">
              <button 
                @click.stop="toggleGoalStatus(goal)"
                class="status-btn-small"
                :class="getStatusClass(goal.status)"
              >
                <i :class="getStatusIcon(goal.status)"></i>
                {{ getStatusLabel(goal.status) }}
              </button>
            </div>
            
            <div class="list-cell actions">
              <div class="action-buttons">
                <button 
                  @click.stop="editGoal(goal)"
                  class="action-btn-small"
                  :title="t('widgets.goals.edit')"
                >
                  <i class="fas fa-edit"></i>
                </button>
                
                <div class="dropdown">
                  <button 
                    @click.stop="toggleGoalMenu(goal.id)"
                    class="action-btn-small"
                    :title="t('widgets.goals.moreActions')"
                  >
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                  
                  <div v-if="activeGoalMenu === goal.id" class="dropdown-menu">
                    <button @click="duplicateGoal(goal)" class="dropdown-item">
                      <i class="fas fa-copy mr-2"></i>
                      {{ t('widgets.goals.duplicate') }}
                    </button>
                    
                    <button @click="archiveGoal(goal)" class="dropdown-item">
                      <i class="fas fa-archive mr-2"></i>
                      {{ t('widgets.goals.archive') }}
                    </button>
                    
                    <button @click="deleteGoal(goal)" class="dropdown-item text-red-600">
                      <i class="fas fa-trash mr-2"></i>
                      {{ t('widgets.goals.delete') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Message si aucun objectif -->
        <div v-if="filteredGoals.length === 0" class="no-goals">
          <i class="fas fa-bullseye text-gray-400 text-4xl mb-3"></i>
          <h5 class="text-gray-600 mb-2">{{ t('widgets.goals.noGoals') }}</h5>
          <p class="text-gray-500 text-sm">{{ t('widgets.goals.noGoalsDescription') }}</p>
          <button @click="showCreateModal = true" class="create-first-goal-btn">
            <i class="fas fa-plus mr-2"></i>
            {{ t('widgets.goals.createFirstGoal') }}
          </button>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
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
    
    <!-- Modal de création/édition -->
    <GoalFormModal 
      v-if="showCreateModal || showEditModal"
      :goal="selectedGoal"
      :project-id="projectId"
      @close="closeModals"
      @save="handleGoalSave"
    />
    
    <!-- Modal de détails -->
    <GoalDetailsModal 
      v-if="showDetailsModal"
      :goal="selectedGoal"
      @close="showDetailsModal = false"
      @edit="editGoal"
      @delete="deleteGoal"
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
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'
import BaseWidget from '@/components/widgets/shared/components/BaseWidget.vue'
import WidgetConfigModal from '@/components/widgets/shared/components/WidgetConfigModal.vue'
import GoalFormModal from './components/GoalFormModal.vue'
import GoalDetailsModal from './components/GoalDetailsModal.vue'
import { goalsService } from './services/goalsService'
import type { Widget } from '@/types/widgets'

// Types pour les objectifs
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled' | 'archived'
export type GoalPriority = 'high' | 'medium' | 'low'
export type FilterStatus = GoalStatus | 'all' | 'overdue' | 'upcoming'
export type SortBy = 'title' | 'deadline' | 'priority' | 'progress'

export interface Goal {
  id: string
  title: string
  description?: string
  status: GoalStatus
  priority: GoalPriority
  progress: number
  deadline?: string
  assignee?: {
    id: string
    name: string
    avatar?: string
  }
  tags: string[]
  created_at: string
  updated_at: string
}

export interface GoalsWidgetConfig {
  titleKey: string
  isEnabled: boolean
  showProgress: boolean
  showDeadlines: boolean
  showPriority: boolean
  showOverview: boolean
  maxGoals: number
  allowCreate: boolean
  allowEdit: boolean
  allowDelete: boolean
  defaultView: 'cards' | 'list'
  sortBy: 'priority' | 'deadline' | 'progress' | 'title'
  filterBy: 'all' | 'active' | 'completed'
  autoRefresh: boolean
  refreshInterval: number
}

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
    
    // État
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const goals = ref<Goal[]>([])
    const selectedGoal = ref<Goal | null>(null)
    const viewMode = ref<'cards' | 'list'>('cards')
    const filterStatus = ref<'all' | GoalStatus>('all')
    const sortBy = ref<'priority' | 'deadline' | 'progress' | 'title'>('priority')
    const searchQuery = ref<string>('')
    const currentPage = ref<number>(1)
    const itemsPerPage = ref<number>(12)
    const showCreateModal = ref<boolean>(false)
    const showEditModal = ref<boolean>(false)
    const showDetailsModal = ref<boolean>(false)
    const showConfigModal = ref<boolean>(false)
    const activeGoalMenu = ref<string | null>(null)
    
    // Configuration du widget
    const widgetConfig = computed((): Widget & GoalsWidgetConfig => ({
      id: props.widget?.id ?? null,
      name: props.widget?.name ?? 'Goals Widget',
      titleKey: 'widgets.goals.title',
      isEnabled: props.widget?.is_enabled ?? true,
      showProgress: props.widget?.show_progress ?? true,
      showDeadlines: props.widget?.show_deadlines ?? true,
      showPriority: props.widget?.show_priority ?? true,
      showOverview: props.widget?.show_overview ?? true,
      maxGoals: props.widget?.max_goals ?? 10,
      allowCreate: props.widget?.allow_create ?? true,
      allowEdit: props.widget?.allow_edit ?? true,
      allowDelete: props.widget?.allow_delete ?? true,
      defaultView: props.widget?.default_view ?? 'list',
      sortBy: props.widget?.sort_by ?? 'priority',
      filterBy: props.widget?.filter_by ?? 'all',
      autoRefresh: props.widget?.auto_refresh ?? false,
      refreshInterval: props.widget?.refresh_interval ?? 30000
    }))
    
    // Options de configuration
    const configOptions = ref([
      {
        key: 'showOverview',
        type: 'boolean',
        label: 'Afficher la vue d\'ensemble',
        default: true
      },
      {
        key: 'showProgress',
        type: 'boolean',
        label: 'Afficher la progression',
        default: true
      },
      {
        key: 'showDeadlines',
        type: 'boolean',
        label: 'Afficher les échéances',
        default: true
      },
      {
        key: 'showAssignees',
        type: 'boolean',
        label: 'Afficher les assignés',
        default: true
      },
      {
        key: 'allowCreate',
        type: 'boolean',
        label: 'Permettre la création',
        default: true
      },
      {
        key: 'allowEdit',
        type: 'boolean',
        label: 'Permettre la modification',
        default: true
      },
      {
        key: 'allowDelete',
        type: 'boolean',
        label: 'Permettre la suppression',
        default: true
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
      }
    ])
    
    // Propriétés calculées
    const totalGoals = computed(() => goals.value.length)
    
    const completedGoals = computed(() => {
      return goals.value.filter(goal => goal.status === 'completed').length
    })
    
    const activeGoals = computed(() => {
      return goals.value.filter(goal => goal.status === 'active').length
    })
    
    const overdueGoals = computed(() => {
      return goals.value.filter(goal => isOverdue(goal)).length
    })
    
    const completionRate = computed(() => {
      if (totalGoals.value === 0) return 0
      return Math.round((completedGoals.value / totalGoals.value) * 100)
    })
    
    const circumference = computed(() => 2 * Math.PI * 50)
    
    const progressOffset = computed(() => {
      const progress = completionRate.value
      return circumference.value - (progress / 100) * circumference.value
    })
    
    const filteredGoals = computed(() => {
      let filtered = [...goals.value]
      
      // Filtrer par statut
      switch (filterStatus.value) {
        case 'active':
          filtered = filtered.filter(goal => goal.status === 'active')
          break
        case 'completed':
          filtered = filtered.filter(goal => goal.status === 'completed')
          break
        case 'overdue':
          filtered = filtered.filter(goal => isOverdue(goal))
          break
        case 'upcoming':
          const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(goal => 
            goal.deadline && new Date(goal.deadline) <= nextWeek && !isOverdue(goal)
          )
          break
      }
      
      // Filtrer par recherche
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(goal => 
          goal.title.toLowerCase().includes(query) ||
          goal.description?.toLowerCase().includes(query) ||
          goal.tags?.some(tag => tag.toLowerCase().includes(query))
        )
      }
      
      // Trier
      filtered.sort((a, b) => {
        switch (sortBy.value) {
          case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 }
            return priorityOrder[b.priority] - priorityOrder[a.priority]
          case 'deadline':
            if (!a.deadline && !b.deadline) return 0
            if (!a.deadline) return 1
            if (!b.deadline) return -1
            return new Date(a.deadline) - new Date(b.deadline)
          case 'progress':
            return b.progress - a.progress
          case 'name':
            return a.title.localeCompare(b.title)
          default:
            return 0
        }
      })
      
      // Pagination
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      
      return filtered.slice(start, end)
    })
    
    const totalPages = computed(() => {
      const totalFiltered = goals.value.filter(goal => {
        // Appliquer les mêmes filtres que filteredGoals mais sans pagination
        let include = true
        
        switch (filterStatus.value) {
          case 'active':
            include = goal.status === 'active'
            break
          case 'completed':
            include = goal.status === 'completed'
            break
          case 'overdue':
            include = isOverdue(goal)
            break
          case 'upcoming':
            const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            include = goal.deadline && new Date(goal.deadline) <= nextWeek && !isOverdue(goal)
            break
        }
        
        if (searchQuery.value && include) {
          const query = searchQuery.value.toLowerCase()
          include = goal.title.toLowerCase().includes(query) ||
                   goal.description?.toLowerCase().includes(query) ||
                   goal.tags?.some(tag => tag.toLowerCase().includes(query))
        }
        
        return include
      }).length
      
      return Math.ceil(totalFiltered / itemsPerPage.value)
    })
    
    // Méthodes
    const loadGoals = async () => {
      loading.value = true
      error.value = null
      
      try {
        const result = await goalsService.getGoals()
        if (result.success) {
          goals.value = result.data
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
    
    const isOverdue = (goal: Goal): boolean => {
      if (!goal.deadline || goal.status === 'completed') return false
      return new Date(goal.deadline) < new Date()
    }
    
    const formatDeadline = (deadline: string): string => {
      const date = new Date(deadline)
      const now = new Date()
      const diffInDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24))
      
      if (diffInDays < 0) {
        return t('widgets.goals.overdueDays', { days: Math.abs(diffInDays) })
      } else if (diffInDays === 0) {
        return t('widgets.goals.today')
      } else if (diffInDays === 1) {
        return t('widgets.goals.tomorrow')
      } else if (diffInDays <= 7) {
        return t('widgets.goals.inDays', { days: diffInDays })
      } else {
        return date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        })
      }
    }
    
    const getPriorityClass = (priority: GoalPriority): string => {
      const classes: Record<GoalPriority, string> = {
        high: 'priority-high',
        medium: 'priority-medium',
        low: 'priority-low'
      }
      return classes[priority] || 'priority-medium'
    }
    
    const getPriorityLabel = (priority: GoalPriority): string => {
      const labels: Record<GoalPriority, string> = {
        high: t('widgets.goals.priorityHigh'),
        medium: t('widgets.goals.priorityMedium'),
        low: t('widgets.goals.priorityLow')
      }
      return labels[priority] || labels.medium
    }
    
    const getProgressClass = (progress: number): string => {
      if (progress >= 80) return 'progress-high'
      if (progress >= 50) return 'progress-medium'
      if (progress >= 25) return 'progress-low'
      return 'progress-minimal'
    }
    
    const getStatusClass = (status: GoalStatus): string => {
      const classes: Record<GoalStatus, string> = {
        active: 'status-active',
        completed: 'status-completed',
        paused: 'status-paused',
        cancelled: 'status-cancelled'
      }
      return classes[status] || 'status-active'
    }
    
    const getStatusIcon = (status: GoalStatus): string => {
      const icons: Record<GoalStatus, string> = {
        active: 'fas fa-play',
        completed: 'fas fa-check',
        paused: 'fas fa-pause',
        cancelled: 'fas fa-times'
      }
      return icons[status] || 'fas fa-play'
    }
    
    const getStatusLabel = (status: GoalStatus): string => {
      const labels: Record<GoalStatus, string> = {
        active: t('widgets.goals.statusActive'),
        completed: t('widgets.goals.statusCompleted'),
        paused: t('widgets.goals.statusPaused'),
        cancelled: t('widgets.goals.statusCancelled')
      }
      return labels[status] || labels.active
    }
    
    const selectGoal = (goal: Goal): void => {
      selectedGoal.value = goal
      showDetailsModal.value = true
    }
    
    const toggleGoalMenu = (goalId: string): void => {
      activeGoalMenu.value = activeGoalMenu.value === goalId ? null : goalId
    }
    
    const editGoal = (goal: Goal): void => {
      if (!widgetConfig.value.allowEdit) {
        showError(t('widgets.goals.editNotAllowed'))
        return
      }
      
      selectedGoal.value = goal
      showEditModal.value = true
      activeGoalMenu.value = null
    }
    
    const duplicateGoal = async (goal: Goal): Promise<void> => {
      try {
        const duplicatedGoal: Partial<Goal> = {
          ...goal,
          id: undefined,
          title: `${goal.title} (Copie)`,
          status: 'active',
          progress: 0,
          created_at: undefined,
          updated_at: undefined
        }
        
        const result = await goalsService.createGoal(duplicatedGoal as Goal)
        if (result.success) {
          goals.value.push(result.data)
          success(t('widgets.goals.goalDuplicated'))
        } else {
          showError(result.error)
        }
      } catch (err) {
        showError(t('widgets.goals.duplicateError'))
      }
      
      activeGoalMenu.value = null
    }
    
    const archiveGoal = async (goal: Goal): Promise<void> => {
      try {
        const result = await goalsService.updateGoal(goal.id, { status: 'archived' })
        if (result.success) {
          const index = goals.value.findIndex(g => g.id === goal.id)
          if (index > -1) {
            goals.value[index].status = 'archived'
          }
          success(t('widgets.goals.goalArchived'))
        } else {
          showError(result.error)
        }
      } catch (err) {
        showError(t('widgets.goals.archiveError'))
      }
      
      activeGoalMenu.value = null
    }
    
    const deleteGoal = async (goal: Goal): Promise<void> => {
      if (!widgetConfig.value.allowDelete) {
        showError(t('widgets.goals.deleteNotAllowed'))
        return
      }
      
      if (!confirm(t('widgets.goals.confirmDelete', { title: goal.title }))) return
      
      try {
        const result = await goalsService.deleteGoal(goal.id)
        if (result.success) {
          goals.value = goals.value.filter(g => g.id !== goal.id)
          success(t('widgets.goals.goalDeleted'))
        } else {
          showError(result.error)
        }
      } catch (err) {
        showError(t('widgets.goals.deleteError'))
      }
      
      activeGoalMenu.value = null
      showDetailsModal.value = false
    }
    
    const toggleGoalStatus = async (goal: Goal): Promise<void> => {
      const newStatus: GoalStatus = goal.status === 'completed' ? 'active' : 'completed'
      const newProgress = newStatus === 'completed' ? 100 : goal.progress
      
      try {
        const result = await goalsService.updateGoal(goal.id, {
          status: newStatus,
          progress: newProgress
        })
        
        if (result.success) {
          const index = goals.value.findIndex(g => g.id === goal.id)
          if (index > -1) {
            goals.value[index].status = newStatus
            goals.value[index].progress = newProgress
          }
          
          const message = newStatus === 'completed' 
            ? t('widgets.goals.goalCompleted')
            : t('widgets.goals.goalReactivated')
          success(message)
        } else {
          showError(result.error)
        }
      } catch (err) {
        showError(t('widgets.goals.updateError'))
      }
    }
    
    const handleGoalSave = (goalData: Partial<Goal>): void => {
      if (selectedGoal.value) {
        // Mise à jour
        const index = goals.value.findIndex(g => g.id === selectedGoal.value!.id)
        if (index > -1) {
          goals.value[index] = { ...goals.value[index], ...goalData }
        }
        success(t('widgets.goals.goalUpdated'))
      } else {
        // Création
        goals.value.push(goalData as Goal)
        success(t('widgets.goals.goalCreated'))
      }
      
      closeModals()
    }
    
    const closeModals = (): void => {
      showCreateModal.value = false
      showEditModal.value = false
      showDetailsModal.value = false
      selectedGoal.value = null
    }
    
    const updateConfig = (newConfig: Partial<GoalsWidgetConfig>): void => {
      emit('widget-updated', { ...widgetConfig.value, ...newConfig })
      showConfigModal.value = false
    }
    
    // Auto-refresh
    let refreshInterval = null
    
    const startAutoRefresh = () => {
      if (widgetConfig.value.autoRefresh && widgetConfig.value.refreshInterval) {
        refreshInterval = setInterval(loadGoals, widgetConfig.value.refreshInterval)
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
      loadGoals()
      startAutoRefresh()
    })
    
    // Watchers
    watch(() => props.projectId, loadGoals)
    
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
      
      // Dans <script setup>, toutes les variables et fonctions sont automatiquement exposées
      // Pas besoin de return statement

</script>

<style scoped>
.goals-widget {
  @apply space-y-4;
}

.goals-header {
  @apply flex items-center justify-between;
}

.header-left {
  @apply flex flex-col space-y-2;
}

.goals-title {
  @apply text-xl font-bold text-gray-900;
}

.goals-stats {
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

.create-btn {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center;
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

.goals-overview {
  @apply bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6;
}

.overview-chart {
  @apply flex items-center justify-between;
}

.chart-container {
  @apply relative;
}

.progress-ring {
  @apply relative;
}

.progress-svg {
  @apply transform -rotate-90;
}

.progress-text {
  @apply absolute inset-0 flex flex-col items-center justify-center;
}

.progress-percentage {
  @apply text-2xl font-bold text-gray-900;
}

.progress-label {
  @apply text-sm text-gray-600;
}

.overview-stats {
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

.goals-container {
  @apply min-h-[400px];
}

/* Vue cartes */
.goals-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.goal-card {
  @apply bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer;
}

.goal-card.completed {
  @apply border-green-200 bg-green-50;
}

.goal-card.overdue {
  @apply border-red-200 bg-red-50;
}

.goal-card.high-priority {
  @apply border-l-4 border-l-red-500;
}

.goal-header {
  @apply flex items-center justify-between mb-3;
}

.goal-priority {
  @apply flex items-center;
}

.priority-badge {
  @apply px-2 py-1 text-xs rounded-full font-medium;
}

.priority-high {
  @apply bg-red-100 text-red-800;
}

.priority-medium {
  @apply bg-yellow-100 text-yellow-800;
}

.priority-low {
  @apply bg-green-100 text-green-800;
}

.goal-actions {
  @apply flex items-center space-x-1;
}

.action-btn {
  @apply p-1 text-gray-400 hover:text-gray-600 transition-colors;
}

.goal-content {
  @apply space-y-3;
}

.goal-title {
  @apply text-lg font-semibold text-gray-900 truncate;
}

.goal-description {
  @apply text-sm text-gray-600 line-clamp-2;
}

.goal-progress {
  @apply space-y-2;
}

.progress-header {
  @apply flex items-center justify-between text-sm;
}

.progress-label {
  @apply text-gray-600;
}

.progress-value {
  @apply font-medium text-gray-900;
}

.progress-bar-container {
  @apply w-full bg-gray-200 rounded-full h-2;
}

.progress-bar {
  @apply h-2 rounded-full transition-all duration-300;
}

.progress-high {
  @apply bg-green-500;
}

.progress-medium {
  @apply bg-blue-500;
}

.progress-low {
  @apply bg-yellow-500;
}

.progress-minimal {
  @apply bg-gray-400;
}

.goal-meta {
  @apply flex items-center justify-between text-sm text-gray-600;
}

.goal-deadline {
  @apply flex items-center;
}

.goal-assignee {
  @apply flex items-center;
}

.goal-footer {
  @apply flex items-center justify-between mt-4 pt-3 border-t border-gray-200;
}

.goal-tags {
  @apply flex items-center space-x-1;
}

.goal-tag {
  @apply px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full;
}

.goal-status {
  @apply flex items-center;
}

.status-btn {
  @apply px-3 py-1 text-xs rounded-full font-medium transition-colors;
}

.status-active {
  @apply bg-blue-100 text-blue-800 hover:bg-blue-200;
}

.status-completed {
  @apply bg-green-100 text-green-800 hover:bg-green-200;
}

.status-paused {
  @apply bg-yellow-100 text-yellow-800 hover:bg-yellow-200;
}

.status-cancelled {
  @apply bg-red-100 text-red-800 hover:bg-red-200;
}

/* Vue liste */
.goals-list {
  @apply space-y-1;
}

.list-header {
  @apply grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700;
}

.list-item {
  @apply grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100;
}

.list-item.completed {
  @apply bg-green-50 border-green-200;
}

.list-item.overdue {
  @apply bg-red-50 border-red-200;
}

.list-item.selected {
  @apply bg-blue-50 border-blue-200;
}

.header-cell.title,
.list-cell.title {
  @apply col-span-4;
}

.header-cell.priority,
.list-cell.priority {
  @apply col-span-1 flex items-center;
}

.header-cell.progress,
.list-cell.progress {
  @apply col-span-2 flex items-center;
}

.header-cell.deadline,
.list-cell.deadline {
  @apply col-span-2 flex items-center;
}

.header-cell.assignee,
.list-cell.assignee {
  @apply col-span-2 flex items-center;
}

.header-cell.status,
.list-cell.status {
  @apply col-span-1 flex items-center;
}

.header-cell.actions,
.list-cell.actions {
  @apply col-span-1 flex items-center justify-end;
}

.goal-title-cell {
  @apply space-y-1;
}

.progress-container {
  @apply flex items-center space-x-2;
}

.progress-bar-small {
  @apply w-16 bg-gray-200 rounded-full h-2;
}

.progress-fill {
  @apply h-2 rounded-full transition-all duration-300;
}

.progress-text {
  @apply text-xs text-gray-600;
}

.assignee-info {
  @apply flex items-center space-x-2;
}

.assignee-avatar {
  @apply w-6 h-6 rounded-full object-cover;
}

.assignee-avatar-placeholder {
  @apply w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700;
}

.assignee-name {
  @apply text-sm text-gray-900;
}

.status-btn-small {
  @apply px-2 py-1 text-xs rounded-full font-medium transition-colors;
}

.action-buttons {
  @apply flex items-center space-x-1;
}

.action-btn-small {
  @apply p-1 text-gray-400 hover:text-gray-600 transition-colors;
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

.no-goals {
  @apply text-center py-12;
}

.create-first-goal-btn {
  @apply mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto;
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
</style>