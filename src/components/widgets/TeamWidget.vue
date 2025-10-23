<template>
  <BaseWidget 
    :widget="widgetConfig"
    :loading="loading"
    :error="error"
    @configure="showConfigModal = true"
    @toggle="toggleWidget"
    @refresh="loadTeamData"
    class="team-widget"
  >
    <div class="team-header">
      <div v-if="widgetConfig.showStats" class="team-stats">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-users text-blue-500"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ teamMembers.length }}</div>
              <div class="stat-label">{{ t('widgets.team.totalMembers') }}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-user-check text-green-500"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ activeMembers }}</div>
              <div class="stat-label">{{ t('widgets.team.activeMembers') }}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-tasks text-purple-500"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalTasks }}</div>
              <div class="stat-label">{{ t('widgets.team.totalTasks') }}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-chart-line text-orange-500"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ Math.round(averageWorkload) }}%</div>
              <div class="stat-label">{{ t('widgets.team.averageWorkload') }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="team-actions">
        <div class="view-controls">
          <button 
            @click="viewMode = 'grid'"
            :class="['view-btn', { active: viewMode === 'grid' }]"
          >
            {{ t('widgets.team.gridView') }}
          </button>
          <button 
            @click="viewMode = 'list'"
            :class="['view-btn', { active: viewMode === 'list' }]"
          >
            {{ t('widgets.team.listView') }}
          </button>
          <button 
            @click="viewMode = 'workload'"
            :class="['view-btn', { active: viewMode === 'workload' }]"
          >
            {{ t('widgets.team.workloadView') }}
          </button>
        </div>
        
        <button 
          v-if="canManageMembers && widgetConfig.allowInvitations"
          @click="showInviteModal = true"
          class="invite-btn"
        >
          <i class="fas fa-user-plus mr-2"></i>
          {{ t('widgets.team.inviteMember') }}
        </button>
      </div>
    </div>
    
    <div v-if="teamMembers.length > 0" class="team-filters">
      <div class="filters-left">
        <div class="search-box">
          <i class="fas fa-search search-icon"></i>
          <input 
            v-model="searchQuery"
            type="text"
            :placeholder="t('widgets.team.searchPlaceholder')"
            class="search-input"
          >
        </div>
        
        <select v-model="roleFilter" class="filter-select">
          <option value="all">{{ t('widgets.team.allRoles') }}</option>
          <option value="admin">{{ t('widgets.team.admin') }}</option>
          <option value="manager">{{ t('widgets.team.manager') }}</option>
          <option value="developer">{{ t('widgets.team.developer') }}</option>
          <option value="designer">{{ t('widgets.team.designer') }}</option>
          <option value="client">{{ t('widgets.team.client') }}</option>
        </select>
        
        <select v-model="statusFilter" class="filter-select">
          <option value="all">{{ t('widgets.team.allStatuses') }}</option>
          <option value="active">{{ t('widgets.team.active') }}</option>
          <option value="busy">{{ t('widgets.team.busy') }}</option>
          <option value="away">{{ t('widgets.team.away') }}</option>
          <option value="offline">{{ t('widgets.team.offline') }}</option>
        </select>
      </div>
      
      <div class="filters-right">
        <div class="sort-control">
          <select v-model="sortBy" class="sort-select">
            <option value="name">{{ t('widgets.team.sortByName') }}</option>
            <option value="role">{{ t('widgets.team.sortByRole') }}</option>
            <option value="workload">{{ t('widgets.team.sortByWorkload') }}</option>
            <option value="last_activity">{{ t('widgets.team.sortByActivity') }}</option>
          </select>
          
          <button 
            @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
            class="sort-order-btn"
            :title="t('widgets.team.toggleSortOrder')"
          >
            <i :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Vue Grille -->
    <div v-if="viewMode === 'grid'" class="team-grid">
      <div 
        v-for="member in filteredMembers" 
        :key="member.id"
        class="member-card"
        @click="showMemberDetails(member)"
      >
        <div class="member-avatar">
          <img 
            v-if="member.avatar" 
            :src="member.avatar" 
            :alt="member.name"
            class="avatar-img"
          >
          <div v-else class="avatar-placeholder">
            {{ member.name.charAt(0).toUpperCase() }}
          </div>
          <div :class="['status-indicator', `status-${member.status}`]"></div>
        </div>
        
        <div class="member-info">
          <h4 class="member-name">{{ member.name }}</h4>
          <p class="member-role">{{ t(`widgets.team.${member.role}`) }}</p>
          
          <div class="member-meta">
            <div v-if="widgetConfig.showWorkload" class="workload-info">
              <span class="workload-label">{{ t('widgets.team.workload') }}</span>
              <div class="workload-bar">
                <div 
                  class="workload-fill"
                  :style="{ width: member.workload + '%' }"
                  :class="{ 'workload-low': member.workload < 50, 'workload-medium': member.workload >= 50 && member.workload < 80, 'workload-high': member.workload >= 80 }"
                ></div>
              </div>
              <span class="workload-percentage">{{ member.workload }}%</span>
            </div>
            
            <div class="task-count">
              <i class="fas fa-tasks mr-1"></i>
              {{ member.active_tasks }} {{ t('widgets.team.activeTasks') }}
            </div>
            
            <div class="last-activity">
              <i class="fas fa-clock mr-1"></i>
              {{ formatLastActivity(member.last_activity) }}
            </div>
          </div>
        </div>
        
        <div class="member-actions">
          <button 
            @click.stop="sendMessage(member)"
            class="action-btn message-btn"
            :title="t('widgets.team.sendMessage')"
          >
            <i class="fas fa-envelope"></i>
          </button>
          
          <button 
            @click.stop="assignTask(member)"
            class="action-btn assign-btn"
            :title="t('widgets.team.assignTask')"
          >
            <i class="fas fa-plus"></i>
          </button>
          
          <button 
            v-if="canManageMembers"
            @click.stop="editMember(member)"
            class="action-btn edit-btn"
            :title="t('widgets.team.editMember')"
          >
            <i class="fas fa-edit"></i>
          </button>
        </div>
      </div>
      
      <div v-if="filteredMembers.length === 0" class="no-members">
        <i class="fas fa-users text-gray-400 text-4xl mb-3"></i>
        <h5 class="text-gray-600 mb-2">{{ t('widgets.team.noMembers') }}</h5>
        <p class="text-gray-500 text-sm mb-4">{{ t('widgets.team.noMembersDescription') }}</p>
        <button 
          v-if="canManageMembers"
          @click="showInviteModal = true"
          class="invite-first-btn"
        >
          <i class="fas fa-user-plus mr-2"></i>
          {{ t('widgets.team.inviteFirst') }}
        </button>
      </div>
    </div>
    
    <!-- Vue Liste -->
    <div v-if="viewMode === 'list'" class="team-list">
      <div class="list-header">
        <div class="header-cell member-col">{{ t('widgets.team.member') }}</div>
        <div class="header-cell role-col">{{ t('widgets.team.role') }}</div>
        <div class="header-cell status-col">{{ t('widgets.team.status') }}</div>
        <div class="header-cell workload-col">{{ t('widgets.team.workload') }}</div>
        <div class="header-cell tasks-col">{{ t('widgets.team.tasks') }}</div>
        <div class="header-cell activity-col">{{ t('widgets.team.lastActivity') }}</div>
        <div class="header-cell actions-col">{{ t('widgets.team.actions') }}</div>
      </div>
      
      <div class="list-body">
        <div 
          v-for="member in filteredMembers" 
          :key="member.id"
          class="list-row"
          @click="showMemberDetails(member)"
        >
          <div class="list-cell member-col">
            <div class="member-info-compact">
              <div class="member-avatar-small">
                <img 
                  v-if="member.avatar" 
                  :src="member.avatar" 
                  :alt="member.name"
                  class="avatar-img-small"
                >
                <div v-else class="avatar-placeholder-small">
                  {{ member.name.charAt(0).toUpperCase() }}
                </div>
                <div :class="['status-indicator-small', `status-${member.status}`]"></div>
              </div>
              
              <div class="member-details">
                <div class="member-name-small">{{ member.name }}</div>
                <div class="member-email">{{ member.email }}</div>
              </div>
            </div>
          </div>
          
          <div class="list-cell role-col">
            <span :class="['role-badge', `role-${member.role}`]">
              {{ t(`widgets.team.${member.role}`) }}
            </span>
          </div>
          
          <div class="list-cell status-col">
            <span :class="['status-badge', `status-${member.status}`]">
              <i :class="[getStatusIcon(member.status), 'mr-1']"></i>
              {{ t(`widgets.team.${member.status}`) }}
            </span>
          </div>
          
          <div class="list-cell workload-col">
            <div class="workload-display">
              <div class="workload-bar-small">
                <div 
                  class="workload-fill-small"
                  :style="{ width: member.workload + '%' }"
                  :class="{ 'workload-low': member.workload < 50, 'workload-medium': member.workload >= 50 && member.workload < 80, 'workload-high': member.workload >= 80 }"
                ></div>
              </div>
              <span class="workload-text">{{ member.workload }}%</span>
            </div>
          </div>
          
          <div class="list-cell tasks-col">
            <div class="task-info">
              <span class="task-count-text">{{ member.active_tasks }}</span>
              <span class="task-label">{{ t('widgets.team.tasks') }}</span>
            </div>
          </div>
          
          <div class="list-cell activity-col">
            <span class="activity-text">{{ formatLastActivity(member.last_activity) }}</span>
          </div>
          
          <div class="list-cell actions-col">
            <div class="action-buttons">
              <button 
                @click.stop="sendMessage(member)"
                class="action-btn-small message-btn"
                :title="t('widgets.team.sendMessage')"
              >
                <i class="fas fa-envelope"></i>
              </button>
              
              <button 
                @click.stop="assignTask(member)"
                class="action-btn-small assign-btn"
                :title="t('widgets.team.assignTask')"
              >
                <i class="fas fa-plus"></i>
              </button>
              
              <button 
                v-if="canManageMembers"
                @click.stop="editMember(member)"
                class="action-btn-small edit-btn"
                :title="t('widgets.team.editMember')"
              >
                <i class="fas fa-edit"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Vue Charge de travail -->
    <div v-if="viewMode === 'workload'" class="workload-view">
      <div class="workload-chart">
        <h4 class="chart-title">{{ t('widgets.team.workloadDistribution') }}</h4>
        
        <div class="workload-bars">
          <div 
            v-for="member in filteredMembers" 
            :key="member.id"
            class="workload-item"
          >
            <div class="member-info-tiny">
              <div class="member-avatar-tiny">
                <img 
                  v-if="member.avatar" 
                  :src="member.avatar" 
                  :alt="member.name"
                  class="avatar-img-tiny"
                >
                <div v-else class="avatar-placeholder-tiny">
                  {{ member.name.charAt(0).toUpperCase() }}
                </div>
              </div>
              <span class="member-name-tiny">{{ member.name }}</span>
            </div>
            
            <div class="workload-chart-bar">
              <div class="workload-bar-chart">
                <div 
                  class="workload-fill-chart"
                  :style="{ width: member.workload + '%' }"
                  :class="{ 'workload-low': member.workload < 50, 'workload-medium': member.workload >= 50 && member.workload < 80, 'workload-high': member.workload >= 80 }"
                ></div>
              </div>
            </div>
            
            <div class="workload-details">
              <span class="workload-percentage-chart">{{ member.workload }}%</span>
              <span class="task-count-chart">{{ member.active_tasks }} {{ t('widgets.team.tasks') }}</span>
            </div>
          </div>
        </div>
        
        <div class="workload-legend">
          <div class="legend-item">
            <div class="legend-color workload-low"></div>
            <span class="legend-text">{{ t('widgets.team.lowWorkload') }}</span>
          </div>
          <div class="legend-item">
            <div class="legend-color workload-medium"></div>
            <span class="legend-text">{{ t('widgets.team.mediumWorkload') }}</span>
          </div>
          <div class="legend-item">
            <div class="legend-color workload-high"></div>
            <span class="legend-text">{{ t('widgets.team.highWorkload') }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modales -->
    <InviteMemberModal 
      v-if="showInviteModal"
      :project-id="projectId"
      @close="showInviteModal = false"
      @member-invited="onMemberInvited"
    />
    
    <MemberDetailsModal 
      v-if="showMemberModal"
      :member="selectedMember"
      :project-id="projectId"
      @close="showMemberModal = false"
      @member-updated="onMemberUpdated"
    />
    
    <EditMemberModal 
      v-if="showEditModal"
      :member="editingMember"
      :project-id="projectId"
      @close="showEditModal = false"
      @member-saved="onMemberSaved"
    />
    
    <AssignTaskModal 
      v-if="showAssignModal"
      :member="assigningMember"
      :project-id="projectId"
      @close="showAssignModal = false"
      @task-assigned="onTaskAssigned"
    />
    
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
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'
import projectManagementService from '@/services/projectManagementService'
import BaseWidget from './shared/components/BaseWidget.vue'
import MemberModal from '@/components/modals/MemberModal.vue'
import WidgetConfigModal from '@/components/modals/WidgetConfigModal.vue'
import type { TeamMember } from './types'
import type { Widget } from '@/types/widgets'

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

const { success, error: showError } = useNotifications()
const { t } = useTranslation()
const { user } = useAuth()
    
    // État réactif
    const loading = ref(false)
    const error = ref<string | null>(null)
    const teamMembers = ref<TeamMember[]>([])
    const searchQuery = ref('')
    const roleFilter = ref('all')
    const statusFilter = ref('all')
    type MemberSortKey = 'name' | 'email' | 'role' | 'status' | 'workload' | 'active_tasks' | 'last_activity'
    const sortBy = ref<MemberSortKey>('name')
    const sortOrder = ref<'asc' | 'desc'>('asc')
    const viewMode = ref('grid')
    const showInviteModal = ref(false)
    const showMemberModal = ref(false)
    const showEditModal = ref(false)
    const showAssignModal = ref(false)
    const showConfigModal = ref(false)
    const selectedMember = ref<TeamMember | null>(null)
    const editingMember = ref<TeamMember | null>(null)
    const assigningMember = ref<TeamMember | null>(null)
    
    interface TeamWidgetOptions {
      showRoles: boolean
      showStatus: boolean
      showAvatar: boolean
      maxMembers: number
      defaultView: 'grid' | 'list' | 'workload'
      showStats: boolean
      allowInvitations: boolean
      showWorkload: boolean
      autoRefresh: boolean
      refreshInterval: number
    }
    
    // Configuration du widget
    const widgetConfig = ref<Widget & TeamWidgetOptions>({
      id: props.widget?.id ?? null,
      name: 'team',
      icon: 'fas fa-users',
      isEnabled: props.widget?.is_enabled ?? true,
      titleKey: 'widgets.team.title',
      showRoles: props.widget?.show_roles ?? true,
      showStatus: props.widget?.show_status ?? true,
      showAvatar: props.widget?.show_avatar ?? true,
      maxMembers: props.widget?.max_members ?? 10,
      defaultView: props.widget?.defaultView ?? 'grid',
      showStats: props.widget?.show_stats ?? true,
      allowInvitations: props.widget?.allow_invitations ?? true,
      showWorkload: props.widget?.show_workload ?? true,
      autoRefresh: props.widget?.auto_refresh ?? true,
      refreshInterval: props.widget?.refresh_interval ?? 300000
    })
    
    // Options de configuration
    const configOptions = ref([
      {
        key: 'showStats',
        type: 'boolean',
        label: 'Afficher les statistiques',
        default: true
      },
      {
        key: 'defaultView',
        type: 'select',
        label: 'Vue par défaut',
        options: [
          { value: 'grid', label: 'Grille' },
          { value: 'list', label: 'Liste' },
          { value: 'workload', label: 'Charge de travail' }
        ],
        default: 'grid'
      },
      {
        key: 'allowInvitations',
        type: 'boolean',
        label: 'Autoriser les invitations',
        default: true
      },
      {
        key: 'showWorkload',
        type: 'boolean',
        label: 'Afficher la charge de travail',
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
        default: 300000,
        min: 60000,
        max: 600000
      }
    ])
    
    // Propriétés calculées
    const canManageMembers = computed(() => {
      return user.value?.role === 'admin' || user.value?.role === 'manager'
    })
    
    const activeMembers = computed(() => {
      return teamMembers.value.filter((member: TeamMember) => member.status === 'active').length
    })
    
    const totalTasks = computed(() => {
      return teamMembers.value.reduce((total: number, member: TeamMember) => total + (member.active_tasks || 0), 0)
    })
    
    const averageWorkload = computed(() => {
      if (teamMembers.value.length === 0) return 0
      const totalWorkload = teamMembers.value.reduce((total: number, member: TeamMember) => total + (member.workload || 0), 0)
      return totalWorkload / teamMembers.value.length
    })
    
    const filteredMembers = computed(() => {
      let filtered: TeamMember[] = teamMembers.value
      // Filtrage par recherche
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(member => 
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query) ||
          member.role.toLowerCase().includes(query)
        )
      }
      
      // Filtrage par rôle
      if (roleFilter.value !== 'all') {
        filtered = filtered.filter(member => member.role === roleFilter.value)
      }
      
      // Filtrage par statut
      if (statusFilter.value !== 'all') {
        filtered = filtered.filter(member => member.status === statusFilter.value)
      }
      
      // Tri
      const key: keyof TeamMember = sortBy.value as keyof TeamMember
      filtered.sort((a, b) => {
        let aValue = a[key] as any
        let bValue = b[key] as any
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = (bValue as string).toLowerCase()
        }
        
        if (sortOrder.value === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        }
      })
      
      return filtered
    })
    
    // Méthodes
    const loadTeamData = async () => {
      loading.value = true
      error.value = null
      
      try {
        const response = await projectManagementService.getProjectTeamMembers(props.projectId)
        if (response.success) {
          teamMembers.value = response.data
        } else {
          error.value = t('widgets.team.loadError')
        }
      } catch (err) {
        error.value = t('widgets.team.loadError')
        console.error('Erreur chargement équipe:', err)
      } finally {
        loading.value = false
      }
    }
    
    const toggleWidget = () => {
      widgetConfig.value.isEnabled = !widgetConfig.value.isEnabled
      // Émettre avec la structure attendue par le backend
      const updatedWidget = {
        ...props.widget,
        is_enabled: widgetConfig.value.isEnabled
      }
      emit('widget-updated', updatedWidget)
    }
    
    const updateConfig = (newConfig: Partial<TeamWidgetOptions>) => {
      widgetConfig.value = { ...widgetConfig.value, ...newConfig }
      viewMode.value = widgetConfig.value.defaultView
      emit('widget-updated', widgetConfig.value)
    }
    
    const showMemberDetails = (member: TeamMember) => {
      selectedMember.value = member
      showMemberModal.value = true
    }
    
    const editMember = (member: TeamMember) => {
      editingMember.value = member
      showEditModal.value = true
    }
    
    const assignTask = (member: TeamMember) => {
      assigningMember.value = member
      showAssignModal.value = true
    }
    
    const sendMessage = (member: TeamMember) => {
      // Logique d'envoi de message
      console.log('Envoyer message à:', member.name)
    }
    
    const formatLastActivity = (timestamp: string | undefined) => {
      if (!timestamp) return t('widgets.team.never')
      const now = new Date()
      const activity = new Date(timestamp)
      const diffMs = now.getTime() - activity.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      if (diffMins < 1) return t('widgets.team.justNow')
      if (diffMins < 60) return t('widgets.team.minutesAgo', { minutes: diffMins })
      if (diffHours < 24) return t('widgets.team.hoursAgo', { hours: diffHours })
      return t('widgets.team.daysAgo', { days: diffDays })
    }
    
    const getStatusIcon = (status: 'active' | 'busy' | 'away' | 'offline') => {
      const icons = {
        active: 'fas fa-circle text-green-500',
        busy: 'fas fa-circle text-yellow-500',
        away: 'fas fa-circle text-orange-500',
        offline: 'fas fa-circle text-gray-400'
      }
      return icons[status]
    }
    
    // Gestionnaires d'événements
    const onMemberInvited = () => {
      loadTeamData()
      success(t('widgets.team.memberInvited'))
    }
    
    const onMemberUpdated = () => {
      loadTeamData()
      success(t('widgets.team.memberUpdated'))
    }
    
    const onMemberSaved = () => {
      loadTeamData()
      success(t('widgets.team.memberSaved'))
    }
    
    const onTaskAssigned = () => {
      loadTeamData()
      success(t('widgets.team.taskAssigned'))
    }
    
    // Watchers
    watch(() => props.widgetData, (newData: Partial<TeamWidgetOptions>) => {
      widgetConfig.value = { ...widgetConfig.value, ...newData }
    }, { deep: true })
    
    // Cycle de vie
    onMounted(() => {
      viewMode.value = widgetConfig.value.defaultView
      loadTeamData()
    })
    

</script>

<style scoped>
.team-widget {
  min-height: 400px;
}

.team-header {
  margin-bottom: 1.5rem;
}

.team-stats {
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.team-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.view-controls {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn:hover {
  background: var(--bg-secondary);
}

.view-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.invite-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.invite-btn:hover {
  background: var(--primary-dark);
}

.team-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.filters-left {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.search-input {
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  min-width: 200px;
}

.filter-select, .sort-select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.sort-control {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.sort-order-btn {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.sort-order-btn:hover {
  background: var(--bg-secondary);
}

/* Vue Grille */
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.member-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.member-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.member-avatar {
  position: relative;
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--bg-secondary);
}

.status-active { background: #10b981; }
.status-busy { background: #f59e0b; }
.status-away { background: #f97316; }
.status-offline { background: #6b7280; }

.member-info {
  text-align: center;
  margin-bottom: 1rem;
}

.member-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.member-role {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.member-meta {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.workload-info {
  margin-bottom: 0.5rem;
}

.workload-label {
  display: block;
  margin-bottom: 0.25rem;
}

.workload-bar {
  width: 100%;
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.workload-fill {
  height: 100%;
  transition: width 0.3s;
}

.workload-low { background: #10b981; }
.workload-medium { background: #f59e0b; }
.workload-high { background: #ef4444; }

.workload-percentage {
  font-weight: 600;
}

.task-count, .last-activity {
  margin-bottom: 0.25rem;
}

.member-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: var(--bg-secondary);
}

.message-btn:hover { color: #3b82f6; }
.assign-btn:hover { color: #10b981; }
.edit-btn:hover { color: #f59e0b; }

.no-members {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}

.invite-first-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.invite-first-btn:hover {
  background: var(--primary-dark);
}

/* Vue Liste */
.team-list {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow: hidden;
}

.list-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  color: var(--text-primary);
}

.list-body {
  max-height: 400px;
  overflow-y: auto;
}

.list-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
}

.list-row:hover {
  background: var(--bg-tertiary);
}

.list-row:last-child {
  border-bottom: none;
}

.list-cell {
  display: flex;
  align-items: center;
}

.member-info-compact {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.member-avatar-small {
  position: relative;
  width: 40px;
  height: 40px;
}

.avatar-img-small {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder-small {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
}

.status-indicator-small {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--bg-secondary);
}

.member-name-small {
  font-weight: 600;
  color: var(--text-primary);
}

.member-email {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.role-badge, .status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-admin { background: #fef3c7; color: #92400e; }
.role-manager { background: #dbeafe; color: #1e40af; }
.role-developer { background: #d1fae5; color: #065f46; }
.role-designer { background: #fce7f3; color: #9d174d; }
.role-client { background: #f3f4f6; color: #374151; }

.workload-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.workload-bar-small {
  width: 60px;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}

.workload-fill-small {
  height: 100%;
  transition: width 0.3s;
}

.workload-text {
  font-size: 0.75rem;
  font-weight: 600;
}

.task-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.task-count-text {
  font-weight: 600;
  color: var(--text-primary);
}

.task-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.activity-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.action-btn-small {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.action-btn-small:hover {
  background: var(--bg-secondary);
}

/* Vue Charge de travail */
.workload-view {
  padding: 1rem;
}

.workload-chart {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.workload-bars {
  margin-bottom: 2rem;
}

.workload-item {
  display: grid;
  grid-template-columns: 200px 1fr 150px;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
}

.member-info-tiny {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.member-avatar-tiny {
  width: 32px;
  height: 32px;
}

.avatar-img-tiny {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder-tiny {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
}

.member-name-tiny {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.workload-chart-bar {
  flex: 1;
}

.workload-bar-chart {
  width: 100%;
  height: 20px;
  background: var(--bg-tertiary);
  border-radius: 10px;
  overflow: hidden;
}

.workload-fill-chart {
  height: 100%;
  transition: width 0.3s;
}

.workload-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.workload-percentage-chart {
  font-weight: 600;
  color: var(--text-primary);
}

.task-count-chart {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.workload-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

.legend-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>