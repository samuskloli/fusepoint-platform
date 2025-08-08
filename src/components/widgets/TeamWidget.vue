<template>
  <BaseWidget 
    :widget="widgetConfig=loading=error='showConfigModal = true=toggleWidget="loadTeamData="team-widget=team-header='team-stats="stats-grid=stat-card="stat-icon='fas fa-users text-blue-500></i>
              </div>
              <div  class="stat-content=stat-value stat-label='stat-card=stat-icon="fas fa-user-check text-green-500></i>
              </div>
              <div  class="stat-content=stat-value stat-label='stat-card=stat-icon="fas fa-tasks text-purple-500></i>
              </div>
              <div  class="stat-content=stat-value stat-label='stat-card=stat-icon="fas fa-chart-line text-orange-500></i>
              </div>
              <div  class="stat-content=stat-value stat-label='team-actions=view-controlsview-btn="t('widgets.team.listView=viewMode = 'workload='{ active: viewMode === 'workload="view-btn=t('widgets.team.workloadView="showInviteModal = true='invite-btn=t('widgets.team.inviteMember="team-filters="teamMembers.length &gt; 0'>
        <div  class="filters-left=search-box fas fa-search search-icon=searchQuery=text='t('widgets.team.searchPlaceholder="role-filter=roleFilter="filter-select='all=admin="manager="developer=designer='client="status-filter=statusFilter="filter-select='all=active="busy="away=offline='filters-right="sort-control=sortBy="sort-select='name=role="workload="last_activity=sortOrder = sortOrder === 'asc='sort-order-btn="t('widgets.team.toggleSortOrder')sortOrder === 'asc="viewMode === 'grid=team-grid='member in filteredMembers"showMemberDetails(member)"
        >
          <div  class="member-avatar=member.avatar member.avatar='member.name=avatar-img="avatar-placeholder class="status-indicator=`status-${member.status}`'></div>
          </div>
          
          <div class="member-info=member-name member-role=member-meta=workload-info='workload-label="workload-bar=workload-fill="{ width: member.workload + '%' }'
                    :class="{ 'workload-low': member.workload &lt; 50, 'workload-medium': member.workload >= 50 && member.workload &lt; 80, 'workload-high': member.workload &gt;= 80 }"
                  ></div>
                </div>
                <span class="workload-percentage=task-count='fas fa-tasks mr-1"></i>
                {{ member.active_tasks }} {{ t('widgets.team.activeTasks === last-activity=fas fa-clock mr-1'></i>
                {{ formatLastActivity(member.last_activity) }}
              </div>
            </div>
          </div>
          
          <div  class="member-actions=sendMessage(member)"
              class="action-btn message-btn=t('widgets.team.sendMessage='assignTask(member)"
              class="action-btn assign-btn=t('widgets.team.assignTask='canManageMembers="editMember(member)"
              class="action-btn edit-btn=t('widgets.team.editMember='filteredMembers.length === 0" class="no-members=fas fa-users text-gray-400 text-4xl mb-3'></i>
          <h5 class="text-gray-600 mb-2>{{ t('widgets.team.noMembers="text-gray-500 text-sm mb-4'>{{ t('widgets.team.noMembersDescription="showInviteModal = true=invite-first-btn="fas fa-user-plus mr-2'></i>
            {{ t('widgets.team.inviteFirst="viewMode === 'list=team-list="list-header='header-cell member-col=header-cell role-col="header-cell status-col="header-cell workload-col=header-cell tasks-col='header-cell activity-col="header-cell actions-col=list-body="member in filteredMembers='member.id=list-row="showMemberDetails(member)"
          >
            <div  class="list-cell member-col=member-info-compact member-avatar-small='member.avatar=member.avatar="member.name="avatar-img-small=avatar-placeholder-small='status-indicator-small class="`status-${member.status}`></div>
                </div>
                
                <div  class="member-details=member-name-small member-email='list-cell role-col=role-badge class="`role-${member.role}`>
                {{ t(`widgets.team.${member.role}`) }}
              </div>
            </div>
            
            <div  class="list-cell status-col=status-badge `status-${member.status}`'>
                <i :class="getStatusIcon(member.status) class: mr-1'></i>
                {{ t(`widgets.team.${member.status}`) }}
              </span>
            </div>
            
            <div  class="list-cell workload-col=workload-display workload-bar-small="workload-fill-small={ width: member.workload + '%' }'
                    :class="{ 'workload-low': member.workload &lt; 50, 'workload-medium': member.workload >= 50 && member.workload &lt; 80, 'workload-high': member.workload &gt;= 80 }
                  ></div>
                </div>
                <span  class: workload-text=list-cell tasks-col='task-info="task-count-text=task-label="list-cell activity-col='activity-text=list-cell actions-col="action-buttons="sendMessage(member)'
                  class="action-btn-small message-btn=t('widgets.team.sendMessage="assignTask(member)'
                  class="action-btn-small assign-btn=t('widgets.team.assignTask="canManageMembers='editMember(member)"
                  class="action-btn-small edit-btn=t('widgets.team.editMember='viewMode === 'workload="workload-view=workload-chart="chart-title='workload-bars=member in filteredMembers="member.id="workload-item'member.avatar=member.avatar="member.name="avatar-img-tiny=avatar-placeholder-tiny='member-name-tiny="workload-chart-bar=workload-bar-chart="workload-fill-chart='{ width: member.workload + '%' }"
                    :class="{ 'workload-low': member.workload &lt; 50, 'workload-medium': member.workload >= 50 && member.workload &lt; 80, 'workload-high': member.workload &gt;= 80 }'
                  ></div>
                </div>
                
                <div class: workload-details=workload-percentage-chart task-count-chart=workload-legend=legend-item='legend-color workload-low="legend-text=legend-item="legend-color workload-medium='legend-text=legend-item="legend-color workload-high="legend-text=showInviteModal='projectId="showInviteModal = false=onMemberInvited="showMemberModal='selectedMember=projectId="showMemberModal = false="onMemberUpdated=showEditModal='editingMember="projectId=showEditModal = false="onMemberSaved='showAssignModal=assigningMember="projectId="showAssignModal = false=onTaskAssigned='showConfigModal="widgetConfig=configOptions="showConfigModal = false='updateConfig"
     >
  </BaseWidget>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import BaseWidget from './BaseWidget.vue'
import InviteMemberModal from '../modals/InviteMemberModal.vue'
import MemberDetailsModal from '../modals/MemberDetailsModal.vue'
import EditMemberModal from '../modals/EditMemberModal.vue'
import AssignTaskModal from '../modals/AssignTaskModal.vue'
import WidgetConfigModal from '../modals/WidgetConfigModal.vue'
import projectManagementService from '@/services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'

export default {
  name: 'TeamWidget',
  components: {
    BaseWidget,
    InviteMemberModal,
    MemberDetailsModal,
    EditMemberModal,
    AssignTaskModal,
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
    const { user } = useAuth()
    const { t } = useTranslation()
    
    // État réactif
    const loading = ref(false)
    const error = ref(null)
    const teamMembers = ref([])
    const searchQuery = ref('')
    const roleFilter = ref('all')
    const statusFilter = ref('all')
    const sortBy = ref('name')
    const sortOrder = ref('asc')
    const viewMode = ref('grid')
    const showInviteModal = ref(false)
    const showMemberModal = ref(false)
    const showEditModal = ref(false)
    const showAssignModal = ref(false)
    const showConfigModal = ref(false)
    const selectedMember = ref(null)
    const editingMember = ref(null)
    const assigningMember = ref(null)
    
    // Configuration du widget
    const widgetConfig = ref({
      id: 'team',
      name: 'Équipe',
      icon: 'fas fa-users',
      titleKey: 'widgets.team.title',
      isEnabled: true,
      showStats: true,
      defaultView: 'grid',
      allowInvitations: true,
      showWorkload: true,
      autoRefresh: true,
      refreshInterval: 300000, // 5 minutes
      ...props.widgetData
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
      return teamMembers.value.filter(member => member.status === 'active').length
    })
    
    const totalTasks = computed(() => {
      return teamMembers.value.reduce((total, member) => total + member.active_tasks, 0)
    })
    
    const averageWorkload = computed(() => {
      if (teamMembers.value.length === 0) return 0
      const totalWorkload = teamMembers.value.reduce((total, member) => total + member.workload, 0)
      return Math.round(totalWorkload / teamMembers.value.length)
    })
    
    const filteredMembers = computed(() => {
      let filtered = [...teamMembers.value]
      
      // Filtrer par recherche
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(member => 
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query) ||
          member.role.toLowerCase().includes(query)
        )
      }
      
      // Filtrer par rôle
      if (roleFilter.value !== 'all') {
        filtered = filtered.filter(member => member.role === roleFilter.value)
      }
      
      // Filtrer par statut
      if (statusFilter.value !== 'all') {
        filtered = filtered.filter(member => member.status === statusFilter.value)
      }
      
      // Trier
      filtered.sort((a, b) => {
        let aValue, bValue
        
        switch (sortBy.value) {
          case 'name':
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case 'role':
            aValue = a.role
            bValue = b.role
            break
          case 'workload':
            aValue = a.workload
            bValue = b.workload
            break
          case 'last_activity':
            aValue = new Date(a.last_activity)
            bValue = new Date(b.last_activity)
            break
          default:
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
        }
        
        if (sortOrder.value === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
      
      return filtered
    })
    
    // Méthodes
    const loadTeamData = async () => {
      loading.value = true
      error.value = null
      
      try {
        // Simuler le chargement des données d'équipe
        const result = await projectManagementService.getProjectTeam?.(props.projectId) || {
          success: true,
          data: [
            {
              id: 1,
              name: 'Jean Dupont',
              email: 'jean.dupont@example.com',
              role: 'manager',
              status: 'active',
              avatar: null,
              workload: 75,
              active_tasks: 8,
              completed_tasks: 24,
              last_activity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              joined_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 2,
              name: 'Marie Martin',
              email: 'marie.martin@example.com',
              role: 'developer',
              status: 'active',
              avatar: null,
              workload: 90,
              active_tasks: 12,
              completed_tasks: 18,
              last_activity: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
              joined_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 3,
              name: 'Pierre Durand',
              email: 'pierre.durand@example.com',
              role: 'designer',
              status: 'busy',
              avatar: null,
              workload: 60,
              active_tasks: 5,
              completed_tasks: 15,
              last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              joined_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 4,
              name: 'Sophie Leroy',
              email: 'sophie.leroy@client.com',
              role: 'client',
              status: 'away',
              avatar: null,
              workload: 30,
              active_tasks: 2,
              completed_tasks: 8,
              last_activity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
              joined_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 5,
              name: 'Thomas Bernard',
              email: 'thomas.bernard@example.com',
              role: 'developer',
              status: 'offline',
              avatar: null,
              workload: 45,
              active_tasks: 3,
              completed_tasks: 12,
              last_activity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              joined_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        }
        
        if (result.success) {
          teamMembers.value = result.data
        }
      } catch (err) {
        error.value = t('errors.loadingFailed')
      } finally {
        loading.value = false
      }
    }
    
    const showMemberDetails = (member) => {
      selectedMember.value = member
      showMemberModal.value = true
    }
    
    const editMember = (member) => {
      editingMember.value = member
      showEditModal.value = true
    }
    
    const assignTask = (member) => {
      assigningMember.value = member
      showAssignModal.value = true
    }
    
    const sendMessage = async (member) => {
      try {
        // Ouvrir une conversation ou rediriger vers le système de messagerie
        const result = await projectManagementService.startConversation?.(member.id)
        
        if (result?.success) {
          success(t('widgets.team.messageStarted', { name: member.name }))
        }
      } catch (err) {
        showError(t('widgets.team.messageFailed'))
      }
    }
    
    const onMemberInvited = (newMember) => {
      teamMembers.value.push(newMember)
      success(t('widgets.team.memberInvited', { name: newMember.name }))
      showInviteModal.value = false
    }
    
    const onMemberUpdated = (updatedMember) => {
      const index = teamMembers.value.findIndex(m => m.id === updatedMember.id)
      if (index > -1) {
        teamMembers.value[index] = updatedMember
      }
      showMemberModal.value = false
    }
    
    const onMemberSaved = (savedMember) => {
      const index = teamMembers.value.findIndex(m => m.id === savedMember.id)
      if (index > -1) {
        teamMembers.value[index] = savedMember
      }
      success(t('widgets.team.memberUpdated'))
      showEditModal.value = false
    }
    
    const onTaskAssigned = (taskData) => {
      // Mettre à jour la charge de travail du membre
      const member = teamMembers.value.find(m => m.id === taskData.assignee_id)
      if (member) {
        member.active_tasks += 1
        member.workload = Math.min(100, member.workload + 10) // Estimation
      }
      
      success(t('widgets.team.taskAssigned'))
      showAssignModal.value = false
    }
    
    const getInitials = (name) => {
      if (!name) return '?'
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    
    const getStatusIcon = (status) => {
      const icons = {
        active: 'fas fa-circle text-green-500',
        busy: 'fas fa-circle text-yellow-500',
        away: 'fas fa-circle text-orange-500',
        offline: 'fas fa-circle text-gray-400'
      }
      return icons[status] || 'fas fa-circle text-gray-400'
    }
    
    const formatLastActivity = (dateString) => {
      if (!dateString) return t('widgets.team.never')
      
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffMinutes = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      if (diffMinutes < 1) return t('widgets.team.justNow')
      if (diffMinutes < 60) return t('widgets.team.minutesAgo', { count: diffMinutes })
      if (diffHours < 24) return t('widgets.team.hoursAgo', { count: diffHours })
      return t('widgets.team.daysAgo', { count: diffDays })
    }
    
    const toggleWidget = () => {
      widgetConfig.value.isEnabled = !widgetConfig.value.isEnabled
      emit('update-widget', widgetConfig.value)
    }
    
    const updateConfig = (newConfig) => {
      widgetConfig.value = { ...widgetConfig.value, ...newConfig }
      emit('update-widget', widgetConfig.value)
      showConfigModal.value = false
      
      // Appliquer la vue par défaut
      if (newConfig.defaultView) {
        viewMode.value = newConfig.defaultView
      }
    }
    
    // Watchers
    watch(() => props.projectId, () => loadTeamData(), { immediate: true })
    
    // Auto-refresh
    let refreshInterval
    watch(() => widgetConfig.value.autoRefresh, (enabled) => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
      
      if (enabled) {
        refreshInterval = setInterval(() => {
          loadTeamData()
        }, widgetConfig.value.refreshInterval)
      }
    }, { immediate: true })
    
    onMounted(() => {
      viewMode.value = widgetConfig.value.defaultView || 'grid'
      loadTeamData()
    })
    
    return {
      loading,
      error,
      teamMembers,
      searchQuery,
      roleFilter,
      statusFilter,
      sortBy,
      sortOrder,
      viewMode,
      showInviteModal,
      showMemberModal,
      showEditModal,
      showAssignModal,
      showConfigModal,
      selectedMember,
      editingMember,
      assigningMember,
      widgetConfig,
      configOptions,
      canManageMembers,
      activeMembers,
      totalTasks,
      averageWorkload,
      filteredMembers,
      loadTeamData,
      showMemberDetails,
      editMember,
      assignTask,
      sendMessage,
      onMemberInvited,
      onMemberUpdated,
      onMemberSaved,
      onTaskAssigned,
      getInitials,
      getStatusIcon,
      formatLastActivity,
      toggleWidget,
      updateConfig,
      t
    }
  }
}
</script>

<style scoped>
.team-widget {
  @apply space-y-6;
}

.team-header {
  @apply space-y-4;
}

.team-stats {
  @apply bg-gray-50 rounded-lg p-4;
}

.stats-grid {
  @apply grid grid-cols-4 gap-4;
}

.stat-card {
  @apply flex items-center space-x-3;
}

.stat-icon {
  @apply w-10 h-10 rounded-lg bg-white flex items-center justify-center text-lg;
}

.stat-content {
  @apply flex-1;
}

.stat-value {
  @apply text-lg font-bold text-gray-900;
}

.stat-label {
  @apply text-xs text-gray-600;
}

.team-actions {
  @apply flex items-center justify-between;
}

.view-controls {
  @apply flex items-center bg-gray-100 rounded-lg p-1;
}

.view-btn {
  @apply px-3 py-2 text-gray-600 hover:text-gray-900 rounded-md transition-colors;
}

.view-btn.active {
  @apply bg-white text-blue-600 shadow-sm;
}

.invite-btn {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors;
}

.team-filters {
  @apply flex items-center justify-between flex-wrap gap-3;
}

.filters-left {
  @apply flex items-center space-x-3;
}

.search-box {
  @apply relative;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400;
}

.search-input {
  @apply pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm;
}

.filter-select {
  @apply px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm;
}

.filters-right {
  @apply flex items-center space-x-2;
}

.sort-control {
  @apply flex items-center space-x-1;
}

.sort-select {
  @apply px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm;
}

.sort-order-btn {
  @apply p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors;
}

/* Vue grille */
.team-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.member-card {
  @apply bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer;
}

.member-avatar {
  @apply relative w-16 h-16 mx-auto mb-3;
}

.avatar-img {
  @apply w-full h-full rounded-full object-cover;
}

.avatar-placeholder {
  @apply w-full h-full rounded-full bg-gray-300 flex items-center justify-center text-lg font-medium text-gray-700;
}

.status-indicator {
  @apply absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white;
}

.status-active {
  @apply bg-green-500;
}

.status-busy {
  @apply bg-yellow-500;
}

.status-away {
  @apply bg-orange-500;
}

.status-offline {
  @apply bg-gray-400;
}

.member-info {
  @apply text-center space-y-2;
}

.member-name {
  @apply text-lg font-semibold text-gray-900;
}

.member-role {
  @apply text-sm text-gray-600;
}

.member-meta {
  @apply space-y-2 text-xs text-gray-500;
}

.workload-info {
  @apply flex items-center space-x-2;
}

.workload-label {
  @apply text-xs;
}

.workload-bar {
  @apply flex-1 bg-gray-200 rounded-full h-2;
}

.workload-fill {
  @apply h-2 rounded-full transition-all duration-300;
}

.workload-low {
  @apply bg-green-500;
}

.workload-medium {
  @apply bg-yellow-500;
}

.workload-high {
  @apply bg-red-500;
}

.workload-percentage {
  @apply text-xs font-medium;
}

.member-actions {
  @apply flex items-center justify-center space-x-2 mt-4;
}

.action-btn {
  @apply w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors;
}

.message-btn:hover {
  @apply text-blue-600;
}

.assign-btn:hover {
  @apply text-green-600;
}

.edit-btn:hover {
  @apply text-purple-600;
}

.no-members {
  @apply col-span-full text-center py-12;
}

.invite-first-btn {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto transition-colors;
}

/* Vue liste */
.team-list {
  @apply bg-white border rounded-lg overflow-hidden;
}

.list-header {
  @apply grid grid-cols-7 gap-4 p-4 bg-gray-50 border-b font-medium text-sm text-gray-700;
}

.list-body {
  @apply divide-y divide-gray-200;
}

.list-row {
  @apply grid grid-cols-7 gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors;
}

.list-cell {
  @apply flex items-center;
}

.member-col {
  @apply col-span-2;
}

.member-info-compact {
  @apply flex items-center space-x-3;
}

.member-avatar-small {
  @apply relative w-10 h-10;
}

.avatar-img-small {
  @apply w-full h-full rounded-full object-cover;
}

.avatar-placeholder-small {
  @apply w-full h-full rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700;
}

.status-indicator-small {
  @apply absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white;
}

.member-details {
  @apply flex flex-col;
}

.member-name-small {
  @apply text-sm font-medium text-gray-900;
}

.member-email {
  @apply text-xs text-gray-500;
}

.role-badge {
  @apply px-2 py-1 text-xs rounded-full font-medium;
}

.role-admin {
  @apply bg-red-100 text-red-800;
}

.role-manager {
  @apply bg-blue-100 text-blue-800;
}

.role-developer {
  @apply bg-green-100 text-green-800;
}

.role-designer {
  @apply bg-purple-100 text-purple-800;
}

.role-client {
  @apply bg-gray-100 text-gray-800;
}

.status-badge {
  @apply px-2 py-1 text-xs rounded-full font-medium flex items-center;
}

.status-badge.status-active {
  @apply bg-green-100 text-green-800;
}

.status-badge.status-busy {
  @apply bg-yellow-100 text-yellow-800;
}

.status-badge.status-away {
  @apply bg-orange-100 text-orange-800;
}

.status-badge.status-offline {
  @apply bg-gray-100 text-gray-800;
}

.workload-display {
  @apply flex items-center space-x-2;
}

.workload-bar-small {
  @apply w-16 bg-gray-200 rounded-full h-2;
}

.workload-fill-small {
  @apply h-2 rounded-full transition-all duration-300;
}

.workload-text {
  @apply text-xs font-medium;
}

.task-info {
  @apply flex flex-col items-center;
}

.task-count-text {
  @apply text-sm font-medium text-gray-900;
}

.task-label {
  @apply text-xs text-gray-500;
}

.activity-text {
  @apply text-sm text-gray-600;
}

.action-buttons {
  @apply flex items-center space-x-1;
}

.action-btn-small {
  @apply w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded transition-colors;
}

/* Vue charge de travail */
.workload-view {
  @apply space-y-6;
}

.workload-chart {
  @apply bg-white border rounded-lg p-6;
}

.chart-title {
  @apply text-lg font-semibold text-gray-900 mb-4;
}

.workload-bars {
  @apply space-y-4;
}

.workload-item {
  @apply flex items-center space-x-4;
}

.workload-member {
  @apply flex items-center space-x-3 w-48;
}

.member-avatar-tiny {
  @apply w-8 h-8;
}

.avatar-img-tiny {
  @apply w-full h-full rounded-full object-cover;
}

.avatar-placeholder-tiny {
  @apply w-full h-full rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700;
}

.member-name-tiny {
  @apply text-sm font-medium text-gray-900;
}

.workload-chart-bar {
  @apply flex-1 flex items-center space-x-4;
}

.workload-bar-chart {
  @apply flex-1 bg-gray-200 rounded-full h-4;
}

.workload-fill-chart {
  @apply h-4 rounded-full transition-all duration-300;
}

.workload-details {
  @apply flex items-center space-x-3 text-sm;
}

.workload-percentage-chart {
  @apply font-medium text-gray-900;
}

.task-count-chart {
  @apply text-gray-600;
}

.workload-legend {
  @apply flex items-center justify-center space-x-6 bg-gray-50 rounded-lg p-4;
}

.legend-item {
  @apply flex items-center space-x-2;
}

.legend-color {
  @apply w-3 h-3 rounded-full;
}

.legend-text {
  @apply text-sm text-gray-700;
}
</style>