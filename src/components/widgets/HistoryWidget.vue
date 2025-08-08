<template>
  <BaseWidget 
    :widget="widgetConfig=loading=error='showConfigModal = true=toggleWidget="loadHistory="history-widget=history-controls='controls-left="time-filter=timeFilter="time-select='today=week="month="all=action-filter='actionFilter="action-select=all="create='update=delete="comment="file=status='user-filter="users.length &gt; 1>
            <select  v-model="userFilter"export-btn="t('widgets.history.exportHistory=loadHistory='refresh-btn="loading=t('widgets.history.refresh="{ 'fa-spin='history-stats=stats="stats-grid="stat-card'></i>
            </div>
            <div class="stat-content=stat-value stat-label=stat-card=stat-icon='fas fa-users text-green-500"></i>
            </div>
            <div  class="stat-content=stat-value stat-label='stat-card=stat-icon="fas fa-calendar text-purple-500></i>
            </div>
            <div  class="stat-content=stat-value stat-label='history-timeline=timeline-container="(group, date) in groupedHistory="date=timeline-group='timeline-date="date-badge=fas fa-calendar-alt mr-2></i>
                {{ formatGroupDate(date) }}
              </div>
              
              <div  class="date-stats=action-count timeline-items='action in group=action.id="timeline-item
              >
                <div  class="timeline-marker=marker-icon getActionIcon(action.action_type)'></i>
                  </div>
                </div>
                
                <div class="timeline-content=action-header action-info=action-title=action-text='action-badge="getActionBadgeClass(action.action_type)"
                        >
                          {{ t(`widgets.history.actions.${action.action_type}`) }}
                        </div>
                      </div>
                      
                      <div  class="action-meta=action-user user-avatar='action.user?.avatar=action.user.avatar="action.user.name="avatar-img=avatar-placeholder='user-info="user-name=user-role="action-time='fas fa-clock mr-1></i>
                          <span>{{ formatActionTime(action.created_at) }}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div  class="action-controls=action.details toggleActionDetails(action.id)'
                        class="details-btn={ active: expandedActions.includes(action.id) }"
                        :title="t('widgets.history.viewDetails={ 'fa-rotate-180': expandedActions.includes(action.id) }'></i>
                      </button>
                      
                      <button  
                        v-if="action.revertible && widgetConfig.allowRevert=revertAction(action)
                        class="revert-btn=t('widgets.history.revertAction='expandedActions.includes(action.id) && action.details=""action-details=details-content="action.details.changes='changes-section=details-title="fas fa-edit mr-2""></i>
                          {{ t('widgets.history.changes="changes-list=(change, field) in action.details.changes='field="change-item=change-field="change-values='old-value=value-label="value-content="arrow-icon=fas fa-arrow-right='new-value="value-label=value-content="action.details.files='files-section=details-title="fas fa-paperclip mr-2"></i>
                          {{ t('widgets.history.attachedFiles="files-list=file in action.details.files='file.id="file-item=getFileIcon(file.type)" class="file-icon=file-name='file-size="action.details.comment=comment-section="details-title='fas fa-comment mr-2"></i>
                          {{ t('widgets.history.comment="comment-content=action.details.metadata='metadata-section="details-title=fas fa-info-circle mr-2"></i>
                          {{ t('widgets.history.metadata="metadata-list=(value, key) in action.details.metadata='key="metadata-item=metadata-key="metadata-value='Object.keys(groupedHistory).length === 0" class="no-history=fas fa-history text-gray-400 text-4xl mb-3'></i>
            <h5 class="text-gray-600 mb-2">{{ t('widgets.history.noHistory="text-gray-500 text-sm=pagination.total &gt; pagination.per_page='history-pagination="pagination-info=pagination-controls
              class="page-btn=fas fa-chevron-left='page-info="loadPage(pagination.current_page + 1)"
              ::disabled="pagination.current_page &gt;= Math.ceil(pagination.total / pagination.per_page)'
              class || page-btn=fas fa-chevron-right="showConfigModal='widgetConfig=configOptions="showConfigModal = false="updateConfig'
    />
  </BaseWidget>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import BaseWidget from './BaseWidget.vue'
import WidgetConfigModal from '../modals/WidgetConfigModal.vue'
import projectManagementService from '@/services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'

export default {
  name: 'HistoryWidget',
  components: {
    BaseWidget,
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
    const history = ref([])
    const users = ref([])
    const stats = ref(null)
    const timeFilter = ref('week')
    const actionFilter = ref('all')
    const userFilter = ref('all')
    const expandedActions = ref([])
    const showConfigModal = ref(false)
    
    // Pagination
    const pagination = ref({
      current_page: 1,
      per_page: 20,
      total: 0
    })
    
    // Configuration du widget
    const widgetConfig = ref({
      id: 'history',
      name: 'Historique',
      icon: 'fas fa-history',
      titleKey: 'widgets.history.title',
      isEnabled: true,
      showStats: true,
      allowRevert: false,
      groupByDate: true,
      showUserAvatars: true,
      autoRefresh: true,
      refreshInterval: 60000, // 1 minute
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
        key: 'allowRevert',
        type: 'boolean',
        label: 'Autoriser l\'annulation d\'actions',
        default: false
      },
      {
        key: 'groupByDate',
        type: 'boolean',
        label: 'Grouper par date',
        default: true
      },
      {
        key: 'showUserAvatars',
        type: 'boolean',
        label: 'Afficher les avatars',
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
        default: 60000,
        min: 30000,
        max: 300000
      }
    ])
    
    // Propriétés calculées
    const filteredHistory = computed(() => {
      let filtered = [...history.value]
      
      // Filtrer par temps
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      filtered = filtered.filter(action => {
        const actionDate = new Date(action.created_at)
        
        switch (timeFilter.value) {
          case 'today':
            return actionDate >= today
          case 'week':
            return actionDate >= weekAgo
          case 'month':
            return actionDate >= monthAgo
          case 'all':
          default:
            return true
        }
      })
      
      // Filtrer par type d'action
      if (actionFilter.value !== 'all') {
        filtered = filtered.filter(action => action.action_type === actionFilter.value)
      }
      
      // Filtrer par utilisateur
      if (userFilter.value !== 'all') {
        filtered = filtered.filter(action => action.user?.id === userFilter.value)
      }
      
      return filtered
    })
    
    const groupedHistory = computed(() => {
      if (!widgetConfig.value.groupByDate) {
        return {
      all: filteredHistory.value,
      t
    }
      }
      
      const groups = {}
      
      filteredHistory.value.forEach(action => {
        const date = new Date(action.created_at).toDateString()
        
        if (!groups[date]) {
          groups[date] = []
        }
        
        groups[date].push(action)
      })
      
      // Trier les groupes par date (plus récent en premier)
      const sortedGroups = {}
      Object.keys(groups)
        .sort((a, b) => new Date(b) - new Date(a))
        .forEach(date => {
          sortedGroups[date] = groups[date].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        })
      
      return sortedGroups
    })
    
    // Méthodes
    const loadHistory = async (page = 1) => {
      loading.value = true
      error.value = null
      
      try {
        // Simuler le chargement de l'historique
        const result = await projectManagementService.getProjectHistory?.(props.projectId, {
          page,
          per_page: pagination.value.per_page,
          time_filter: timeFilter.value,
          action_filter: actionFilter.value,
          user_filter: userFilter.value
        }) || {
          success: true,
          data: {
            history: [
              {
                id: 1,
                action_type: 'create',
                entity_type: 'task',
                entity_id: 1,
                user: {
                  id: 1,
                  name: 'Jean Dupont',
                  role: 'Chef de projet',
                  avatar: null
                },
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                details: {
                  comment: 'Création de la tâche "Développer la page d\'accueil"',
                  metadata: {
                    priority: 'high',
                    estimated_hours: 8
                  }
                },
                revertible: true
              },
              {
                id: 2,
                action_type: 'update',
                entity_type: 'task',
                entity_id: 1,
                user: {
                  id: 2,
                  name: 'Marie Martin',
                  role: 'Développeuse',
                  avatar: null
                },
                created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                details: {
                  changes: {
                    status: {
                      old: 'todo',
                      new: 'in_progress'
                    },
                    assignee: {
                      old: null,
                      new: 'Marie Martin'
                    }
                  },
                  comment: 'Début du développement'
                },
                revertible: true
              },
              {
                id: 3,
                action_type: 'file',
                entity_type: 'project',
                entity_id: props.projectId,
                user: {
                  id: 1,
                  name: 'Jean Dupont',
                  role: 'Chef de projet',
                  avatar: null
                },
                created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                details: {
                  files: [
                    {
                      id: 1,
                      name: 'mockup-homepage.png',
                      type: 'image/png',
                      size: 245760
                    }
                  ],
                  comment: 'Ajout du mockup de la page d\'accueil'
                },
                revertible: false
              },
              {
                id: 4,
                action_type: 'comment',
                entity_type: 'task',
                entity_id: 1,
                user: {
                  id: 3,
                  name: 'Pierre Durand',
                  role: 'Designer',
                  avatar: null
                },
                created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                details: {
                  comment: 'N\'oubliez pas d\'implémenter le design responsive pour mobile.',
                  metadata: {
                    mentions: ['Marie Martin']
                  }
                },
                revertible: false
              },
              {
                id: 5,
                action_type: 'status',
                entity_type: 'project',
                entity_id: props.projectId,
                user: {
                  id: 1,
                  name: 'Jean Dupont',
                  role: 'Chef de projet',
                  avatar: null
                },
                created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                details: {
                  changes: {
                    status: {
                      old: 'planning',
                      new: 'active'
                    }
                  },
                  comment: 'Lancement officiel du projet'
                },
                revertible: true
              }
            ],
            users: [
              { id: 1, name: 'Jean Dupont', role: 'Chef de projet' },
              { id: 2, name: 'Marie Martin', role: 'Développeuse' },
              { id: 3, name: 'Pierre Durand', role: 'Designer' }
            ],
            stats: {
              total_actions: 5,
              active_users: 3,
              last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            pagination: {
              current_page: page,
              per_page: 20,
              total: 5
            }
          }
        }
        
        if (result.success) {
          history.value = result.data.history
          users.value = result.data.users
          if (widgetConfig.value.showStats) {
            stats.value = result.data.stats
          }
          pagination.value = result.data.pagination
        }
      } catch (err) {
        error.value = t('errors.loadingFailed')
      } finally {
        loading.value = false
      }
    }
    
    const loadPage = (page) => {
      if (page >= 1 && page <= Math.ceil(pagination.value.total / pagination.value.per_page)) {
        loadHistory(page)
      }
    }
    
    const toggleActionDetails = (actionId) => {
      const index = expandedActions.value.indexOf(actionId)
      if (index > -1) {
        expandedActions.value.splice(index, 1)
      } else {
        expandedActions.value.push(actionId)
      }
    }
    
    const revertAction = async (action) => {
      if (!confirm(t('widgets.history.confirmRevert'))) {
        return
      }
      
      try {
        const result = await projectManagementService.revertAction?.(action.id)
        
        if (result?.success) {
          success(t('widgets.history.actionReverted'))
          loadHistory(pagination.value.current_page)
        }
      } catch (err) {
        showError(t('widgets.history.revertFailed'))
      }
    }
    
    const exportHistory = async () => {
      try {
        const result = await projectManagementService.exportProjectHistory?.(props.projectId, {
          time_filter: timeFilter.value,
          action_filter: actionFilter.value,
          user_filter: userFilter.value
        })
        
        if (result?.success) {
          // Créer et télécharger le fichier
          const blob = new Blob([result.data], { type: 'text/csv' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `project-${props.projectId}-history.csv`
          link.click()
          window.URL.revokeObjectURL(url)
          
          success(t('widgets.history.exportCompleted'))
        }
      } catch (err) {
        showError(t('widgets.history.exportFailed'))
      }
    }
    
    const getActionIcon = (actionType) => {
      const icons = {
        create: 'fas fa-plus text-green-500',
        update: 'fas fa-edit text-blue-500',
        delete: 'fas fa-trash text-red-500',
        comment: 'fas fa-comment text-purple-500',
        file: 'fas fa-paperclip text-orange-500',
        status: 'fas fa-flag text-yellow-500'
      }
      return icons[actionType] || 'fas fa-circle text-gray-500'
    }
    
    const getActionBadgeClass = (actionType) => {
      const classes = {
        create: 'badge-green',
        update: 'badge-blue',
        delete: 'badge-red',
        comment: 'badge-purple',
        file: 'badge-orange',
        status: 'badge-yellow'
      }
      return classes[actionType] || 'badge-gray'
    }
    
    const formatActionText = (action) => {
      const entityTypes = {
        task: t('entities.task'),
        project: t('entities.project'),
        comment: t('entities.comment'),
        file: t('entities.file')
      }
      
      const entityType = entityTypes[action.entity_type] || action.entity_type
      
      switch (action.action_type) {
        case 'create':
          return t('widgets.history.actionTexts.created', { entity: entityType })
        case 'update':
          return t('widgets.history.actionTexts.updated', { entity: entityType })
        case 'delete':
          return t('widgets.history.actionTexts.deleted', { entity: entityType })
        case 'comment':
          return t('widgets.history.actionTexts.commented', { entity: entityType })
        case 'file':
          return t('widgets.history.actionTexts.uploadedFile')
        case 'status':
          return t('widgets.history.actionTexts.changedStatus', { entity: entityType })
        default:
          return t('widgets.history.actionTexts.performed', { action: action.action_type, entity: entityType })
      }
    }
    
    const formatActionTime = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
    
    const formatGroupDate = (dateString) => {
      const date = new Date(dateString)
      const today = new Date()
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      
      if (date.toDateString() === today.toDateString()) {
        return t('widgets.history.today')
      } else if (date.toDateString() === yesterday.toDateString()) {
        return t('widgets.history.yesterday')
      } else {
        return date.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      }
    }
    
    const formatTimeAgo = (dateString) => {
      if (!dateString) return t('widgets.history.never')
      
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
    
    const formatValue = (value) => {
      if (value === null || value === undefined) {
        return t('widgets.history.empty')
      }
      
      if (typeof value === 'boolean') {
        return value ? t('common.yes') : t('common.no')
      }
      
      if (typeof value === 'object') {
        return JSON.stringify(value)
      }
      
      return String(value)
    }
    
    const getInitials = (name) => {
      if (!name) return '?'
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    
    const getFileIcon = (type) => {
      if (type?.includes('image')) return 'fas fa-image text-green-500'
      if (type?.includes('pdf')) return 'fas fa-file-pdf text-red-500'
      if (type?.includes('word')) return 'fas fa-file-word text-blue-500'
      if (type?.includes('excel')) return 'fas fa-file-excel text-green-500'
      return 'fas fa-file text-gray-500'
    }
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }
    
    const toggleWidget = () => {
      widgetConfig.value.isEnabled = !widgetConfig.value.isEnabled
      emit('update-widget', widgetConfig.value)
    }
    
    const updateConfig = (newConfig) => {
      widgetConfig.value = { ...widgetConfig.value, ...newConfig }
      emit('update-widget', widgetConfig.value)
      showConfigModal.value = false
      
      // Recharger si nécessaire
      if (newConfig.showStats !== undefined) {
        loadHistory(pagination.value.current_page)
      }
    }
    
    // Watchers
    watch(() => props.projectId, () => loadHistory(), { immediate: true })
    watch([timeFilter, actionFilter, userFilter], () => loadHistory())
    
    // Auto-refresh
    let refreshInterval
    watch(() => widgetConfig.value.autoRefresh, (enabled) => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
      
      if (enabled) {
        refreshInterval = setInterval(() => {
          loadHistory(pagination.value.current_page)
        }, widgetConfig.value.refreshInterval)
      }
    }, { immediate: true })
    
    onMounted(() => {
      loadHistory()
    })
    
    return {
      loading,
      error,
      history,
      users,
      stats,
      timeFilter,
      actionFilter,
      userFilter,
      expandedActions,
      showConfigModal,
      pagination,
      widgetConfig,
      configOptions,
      filteredHistory,
      groupedHistory,
      loadHistory,
      loadPage,
      toggleActionDetails,
      revertAction,
      exportHistory,
      getActionIcon,
      getActionBadgeClass,
      formatActionText,
      formatActionTime,
      formatGroupDate,
      formatTimeAgo,
      formatValue,
      getInitials,
      getFileIcon,
      formatFileSize,
      toggleWidget,
      updateConfig,
      t
    }
  }
}
</script>

<style scoped>
.history-widget {
  @apply space-y-4;
}

.history-controls {
  @apply flex items-center justify-between flex-wrap gap-3;
}

.controls-left {
  @apply flex items-center space-x-3;
}

.time-select,
.action-select,
.user-select {
  @apply px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm;
}

.controls-right {
  @apply flex items-center space-x-2;
}

.export-btn {
  @apply px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center transition-colors;
}

.refresh-btn {
  @apply p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors;
}

.history-stats {
  @apply bg-gray-50 rounded-lg p-4;
}

.stats-grid {
  @apply grid grid-cols-3 gap-4;
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

.history-timeline {
  @apply space-y-6;
}

.timeline-container {
  @apply space-y-6;
}

.timeline-group {
  @apply space-y-4;
}

.timeline-date {
  @apply flex items-center justify-between;
}

.date-badge {
  @apply flex items-center px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium;
}

.date-stats {
  @apply text-sm text-gray-500;
}

.timeline-items {
  @apply space-y-4 pl-4;
}

.timeline-item {
  @apply relative flex items-start space-x-4;
}

.timeline-marker {
  @apply relative flex-shrink-0;
}

.marker-icon {
  @apply w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-sm;
}

.action-create .marker-icon {
  @apply border-green-300 bg-green-50;
}

.action-update .marker-icon {
  @apply border-blue-300 bg-blue-50;
}

.action-delete .marker-icon {
  @apply border-red-300 bg-red-50;
}

.action-comment .marker-icon {
  @apply border-purple-300 bg-purple-50;
}

.action-file .marker-icon {
  @apply border-orange-300 bg-orange-50;
}

.action-status .marker-icon {
  @apply border-yellow-300 bg-yellow-50;
}

.timeline-item:not(:last-child) .timeline-marker::after {
  @apply absolute top-8 left-1/2 w-0.5 h-8 bg-gray-200 transform -translate-x-1/2;
  content: '';
}

.timeline-content {
  @apply flex-1 bg-white border rounded-lg p-4 shadow-sm;
}

.action-header {
  @apply flex items-start justify-between;
}

.action-info {
  @apply flex-1;
}

.action-title {
  @apply flex items-center space-x-2 mb-2;
}

.action-text {
  @apply text-sm font-medium text-gray-900;
}

.action-badge {
  @apply px-2 py-1 text-xs rounded-full font-medium;
}

.badge-green {
  @apply bg-green-100 text-green-800;
}

.badge-blue {
  @apply bg-blue-100 text-blue-800;
}

.badge-red {
  @apply bg-red-100 text-red-800;
}

.badge-purple {
  @apply bg-purple-100 text-purple-800;
}

.badge-orange {
  @apply bg-orange-100 text-orange-800;
}

.badge-yellow {
  @apply bg-yellow-100 text-yellow-800;
}

.badge-gray {
  @apply bg-gray-100 text-gray-800;
}

.action-meta {
  @apply flex items-center justify-between;
}

.action-user {
  @apply flex items-center space-x-2;
}

.user-avatar {
  @apply w-6 h-6 rounded-full overflow-hidden;
}

.avatar-img {
  @apply w-full h-full object-cover;
}

.avatar-placeholder {
  @apply w-full h-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700;
}

.user-info {
  @apply flex flex-col;
}

.user-name {
  @apply text-xs font-medium text-gray-900;
}

.user-role {
  @apply text-xs text-gray-500;
}

.action-time {
  @apply flex items-center text-xs text-gray-500;
}

.action-controls {
  @apply flex items-center space-x-1;
}

.details-btn,
.revert-btn {
  @apply w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded transition-colors;
}

.details-btn.active {
  @apply text-blue-600;
}

.revert-btn {
  @apply hover:text-red-600;
}

.action-details {
  @apply mt-4 pt-4 border-t border-gray-200;
}

.details-content {
  @apply space-y-4;
}

.details-title {
  @apply text-sm font-semibold text-gray-900 flex items-center;
}

.changes-section,
.files-section,
.comment-section,
.metadata-section {
  @apply space-y-2;
}

.changes-list {
  @apply space-y-3;
}

.change-item {
  @apply bg-gray-50 rounded-lg p-3;
}

.change-field {
  @apply text-sm font-medium text-gray-900 mb-2;
}

.change-values {
  @apply flex items-center space-x-3;
}

.old-value,
.new-value {
  @apply flex-1;
}

.value-label {
  @apply text-xs text-gray-500 block;
}

.value-content {
  @apply text-sm text-gray-900 font-medium;
}

.arrow-icon {
  @apply text-gray-400;
}

.files-list {
  @apply space-y-2;
}

.file-item {
  @apply flex items-center space-x-2 text-sm;
}

.file-icon {
  @apply text-lg;
}

.file-name {
  @apply font-medium text-gray-900;
}

.file-size {
  @apply text-gray-500;
}

.comment-content {
  @apply text-sm text-gray-700 bg-gray-50 rounded-lg p-3;
}

.metadata-list {
  @apply space-y-1;
}

.metadata-item {
  @apply flex items-center space-x-2 text-sm;
}

.metadata-key {
  @apply font-medium text-gray-700;
}

.metadata-value {
  @apply text-gray-900;
}

.no-history {
  @apply text-center py-12;
}

.history-pagination {
  @apply flex items-center justify-between pt-4 border-t border-gray-200;
}

.pagination-info {
  @apply text-sm text-gray-600;
}

.pagination-controls {
  @apply flex items-center space-x-2;
}

.page-btn {
  @apply w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.page-info {
  @apply text-sm text-gray-700 px-3;
}
</style>