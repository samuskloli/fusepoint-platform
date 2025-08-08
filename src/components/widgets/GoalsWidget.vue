<template>
  <BaseWidget 
    :widget="widgetConfig=loading=error='showConfigModal = true=toggleWidget="loadGoals="goals-widget=goals-header='header-info="goals-title=goals-summary="summary-item='fas fa-bullseye text-blue-500></i>
              {{ activeGoals.length }} {{ t('widgets.goals.active === summary-item=fas fa-check-circle text-green-500'></i>
              {{ completedGoals.length }} {{ t('widgets.goals.completed="header-actions=showAddGoalModal = true="add-goal-btn='canAddGoals=fas fa-plus mr-2"></i>
            {{ t('widgets.goals.addGoal="goals-filters=filter-tabs='activeFilter = 'all="filter-tab={ active: activeFilter === 'all="activeFilter = 'active='filter-tab={ active: activeFilter === 'active="activeFilter = 'completed="filter-tab={ active: activeFilter === 'completed='activeFilter = 'overdue="filter-tab={ active: activeFilter === 'overdue="filter-options='sortBy=sort-select="priority="deadline=progress='created="overall-progress=goals.length &gt; 0">
        <div  class="progress-header=progress-label progress-percentage='progress-bar=progress-fill="{ width: `${overallProgress}%` }
          ></div>
        </div>
        
        <div  class="progress-details=detail-item goals-list='goal in filteredGoals=goal.id="goal-item"goal-info="goal-title-row=goal-title='goal-badges="priority-badge=`priority-${goal.priority}`
                  >
                    {{ t(`widgets.goals.priority.${goal.priority}`) }}
                  </div>
                  
                  <span  
                    class="category-badge=goal.category='goal-description="goal.description=goal-meta="meta-item='fas fa-calendar-alt=goal.deadline="text-gray-500>
                    {{ t('widgets.goals.noDeadline="meta-item=goal.assigned_to='fas fa-user="goal-actions=toggleGoalStatus(goal)"
                class="action-btn=goal.status === 'completed='goal.status === 'completed="fas fa-check=goal.status === 'completed="far fa-circle='dropdown=toggleGoalMenu(goal.id)"
                  class="action-btn=fas fa-ellipsis-v='activeGoalMenu === goal.id="dropdown-menu=editGoal(goal)"
                    class="dropdown-item=fas fa-edit mr-2'></i>
                    {{ t('common.edit="duplicateGoal(goal)"
                    class="dropdown-item=fas fa-copy mr-2'></i>
                    {{ t('common.duplicate="deleteGoal(goal)"
                    class="dropdown-item text-red-600'
                  >
                    <i class="fas fa-trash mr-2"></i>
                    {{ t('common.delete="goal-progress=progress-header='progress-label="progress-percentage=progress-bar small="progress-fill='{
                  'bg-green-500': goal.status === 'completed',
                  'bg-red-500': isOverdue(goal),
                  'bg-blue-500': !isOverdue(goal) && goal.status !== 'completed={ width: `${goal.progress || 0}%` }"
              ></div>
            </div>
          </div>
          
          <!-- Sous-objectifs -->
          <div  class="sub-goals=goal.sub_goals?.length &gt; 0'>
            <div class="sub-goals-header=sub-goals-title fas fa-list-ul mr-1></i>
                {{ t('widgets.goals.subGoals="toggleSubGoals(goal.id)'
                class="toggle-btn=fas fa-chevron-down="{ 'rotate-180': expandedGoals.includes(goal.id) }'></i>
              </button>
            </div>
            
            <div  
              v-if="expandedGoals.includes(goal.id)"
              class="sub-goals-list=subGoal in goal.sub_goals='subGoal.id="sub-goal-item"
                  class="sub-goal-checkbox=fas fa-check='subGoal.completed="sub-goal-title=sub-goal-deadline="subGoal.deadline='goal-comments=goal.recent_comments?.length &gt; 0>
            <div  class="comments-header=fas fa-comments mr-1'></i>
              {{ t('widgets.goals.recentComments="comments-list=comment in goal.recent_comments.slice(0, 2) 
                :key="comment.id=comment-item=comment.user.avatar || '/default-avatar.png='comment.user.name=comment-avatar="comment-content="comment-header=comment-author='comment-time="comment-text=filteredGoals.length === 0" class="no-goals=fas fa-bullseye text-gray-400 text-4xl mb-3'></i>
          <h5 class="text-gray-600 mb-2">{{ t('widgets.goals.noGoals="text-gray-500 text-sm mb-4'>{{ t('widgets.goals.noGoalsDescription="showAddGoalModal = true=create-first-goal-btn="canAddGoals='fas fa-plus mr-2"></i>
            {{ t('widgets.goals.createFirstGoal="showAddGoalModal=projectId='editingGoal="closeGoalModal=onGoalSaved="showConfigModal='widgetConfig=configOptions="showConfigModal = false="updateConfig"
    />
  </BaseWidget>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import BaseWidget from './BaseWidget.vue'
import AddGoalModal from '../modals/AddGoalModal.vue'
import WidgetConfigModal from '../modals/WidgetConfigModal.vue'
import projectManagementService from '@/services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'

export default {
  name: 'GoalsWidget',
  components: {
    BaseWidget,
    AddGoalModal,
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
    const goals = ref([])
    const activeFilter = ref('all')
    const sortBy = ref('priority')
    const expandedGoals = ref([])
    const activeGoalMenu = ref(null)
    const showAddGoalModal = ref(false)
    const showConfigModal = ref(false)
    const editingGoal = ref(null)
    
    // Configuration du widget
    const widgetConfig = ref({
      id: 'goals',
      name: 'Objectifs',
      icon: 'fas fa-bullseye',
      titleKey: 'widgets.goals.title',
      isEnabled: true,
      canAddGoals: true,
      showProgress: true,
      showSubGoals: true,
      showComments: true,
      autoCalculateProgress: true,
      ...props.widgetData
    })
    
    // Options de configuration
    const configOptions = ref([
      {
        key: 'canAddGoals',
        type: 'boolean',
        label: 'Permettre l\'ajout d\'objectifs',
        default: true
      },
      {
        key: 'showProgress',
        type: 'boolean',
        label: 'Afficher la progression',
        default: true
      },
      {
        key: 'showSubGoals',
        type: 'boolean',
        label: 'Afficher les sous-objectifs',
        default: true
      },
      {
        key: 'showComments',
        type: 'boolean',
        label: 'Afficher les commentaires récents',
        default: true
      },
      {
        key: 'autoCalculateProgress',
        type: 'boolean',
        label: 'Calculer automatiquement la progression',
        default: true
      }
    ])
    
    // Propriétés calculées
    const canAddGoals = computed(() => widgetConfig.value.canAddGoals)
    
    const activeGoals = computed(() => 
      goals.value.filter(goal => goal.status === 'active')
    )
    
    const completedGoals = computed(() => 
      goals.value.filter(goal => goal.status === 'completed')
    )
    
    const overdueGoals = computed(() => 
      goals.value.filter(goal => isOverdue(goal))
    )
    
    const overallProgress = computed(() => {
      if (goals.value.length === 0) return 0
      const totalProgress = goals.value.reduce((sum, goal) => sum + (goal.progress || 0), 0)
      return Math.round(totalProgress / goals.value.length)
    })
    
    const filteredGoals = computed(() => {
      let filtered = [...goals.value]
      
      // Filtrer par statut
      switch (activeFilter.value) {
        case 'active':
          filtered = filtered.filter(goal => goal.status === 'active')
          break
        case 'completed':
          filtered = filtered.filter(goal => goal.status === 'completed')
          break
        case 'overdue':
          filtered = filtered.filter(goal => isOverdue(goal))
          break
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
            return (b.progress || 0) - (a.progress || 0)
          case 'created':
            return new Date(b.created_at) - new Date(a.created_at)
          default:
            return 0
        }
      })
      
      return filtered
    })
    
    // Méthodes
    const loadGoals = async () => {
      loading.value = true
      error.value = null
      
      try {
        // Simuler le chargement des objectifs
        const result = await projectManagementService.getProjectGoals?.(props.projectId) || {
          success: true,
          data: [
            {
              id: 1,
              title: 'Augmenter le taux de conversion',
              description: 'Améliorer le taux de conversion du site web de 15%',
              status: 'active',
              priority: 'high',
              category: 'marketing',
              progress: 65,
              deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              assigned_to: {
                id: 1,
                name: 'Marie Dubois',
                avatar: null
              },
              created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              sub_goals: [
                {
                  id: 1,
                  title: 'Optimiser la page d\'accueil',
                  completed: true,
                  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                  id: 2,
                  title: 'Améliorer le tunnel de conversion',
                  completed: false,
                  deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
                }
              ],
              recent_comments: [
                {
                  id: 1,
                  content: 'Bonne progression sur cet objectif !',
                  user: {
                    id: 2,
                    name: 'Jean Martin',
                    avatar: null
                  },
                  created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                }
              ]
            },
            {
              id: 2,
              title: 'Lancer la campagne publicitaire',
              description: 'Mettre en place une campagne publicitaire sur les réseaux sociaux',
              status: 'completed',
              priority: 'medium',
              category: 'advertising',
              progress: 100,
              deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              assigned_to: {
                id: 2,
                name: 'Jean Martin',
                avatar: null
              },
              created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
              sub_goals: [],
              recent_comments: []
            }
          ]
        }
        
        if (result.success) {
          goals.value = result.data
        }
      } catch (err) {
        error.value = t('errors.loadingFailed')
      } finally {
        loading.value = false
      }
    }
    
    const isOverdue = (goal) => {
      if (!goal.deadline || goal.status === 'completed') return false
      return new Date(goal.deadline) < new Date()
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    
    const formatCommentTime = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      if (diffHours < 1) return t('widgets.goals.justNow')
      if (diffHours < 24) return t('widgets.goals.hoursAgo', { count: diffHours })
      return t('widgets.goals.daysAgo', { count: diffDays })
    }
    
    const toggleGoalStatus = async (goal) => {
      try {
        const newStatus = goal.status === 'completed' ? 'active' : 'completed'
        goal.status = newStatus
        
        if (newStatus === 'completed') {
          goal.progress = 100
        }
        
        success(t('widgets.goals.statusUpdated'))
      } catch (err) {
        showError(t('widgets.goals.updateFailed'))
      }
    }
    
    const toggleGoalMenu = (goalId) => {
      activeGoalMenu.value = activeGoalMenu.value === goalId ? null : goalId
    }
    
    const editGoal = (goal) => {
      editingGoal.value = goal
      showAddGoalModal.value = true
      activeGoalMenu.value = null
    }
    
    const duplicateGoal = async (goal) => {
      try {
        const duplicatedGoal = {
          ...goal,
          id: Date.now(),
          title: `${goal.title} (copie)`,
          status: 'active',
          progress: 0,
          created_at: new Date().toISOString()
        }
        
        goals.value.unshift(duplicatedGoal)
        activeGoalMenu.value = null
        success(t('widgets.goals.goalDuplicated'))
      } catch (err) {
        showError(t('widgets.goals.duplicateFailed'))
      }
    }
    
    const deleteGoal = async (goal) => {
      if (!confirm(t('widgets.goals.confirmDelete'))) return
      
      try {
        goals.value = goals.value.filter(g => g.id !== goal.id)
        activeGoalMenu.value = null
        success(t('widgets.goals.goalDeleted'))
      } catch (err) {
        showError(t('widgets.goals.deleteFailed'))
      }
    }
    
    const toggleSubGoals = (goalId) => {
      const index = expandedGoals.value.indexOf(goalId)
      if (index > -1) {
        expandedGoals.value.splice(index, 1)
      } else {
        expandedGoals.value.push(goalId)
      }
    }
    
    const toggleSubGoalStatus = async (goal, subGoal) => {
      try {
        subGoal.completed = !subGoal.completed
        
        // Recalculer la progression si activé
        if (widgetConfig.value.autoCalculateProgress) {
          const completedSubGoals = goal.sub_goals.filter(sg => sg.completed).length
          goal.progress = Math.round((completedSubGoals / goal.sub_goals.length) * 100)
          
          // Marquer l'objectif comme terminé si tous les sous-objectifs sont terminés
          if (completedSubGoals === goal.sub_goals.length) {
            goal.status = 'completed'
            goal.progress = 100
          }
        }
        
        success(t('widgets.goals.subGoalUpdated'))
      } catch (err) {
        showError(t('widgets.goals.updateFailed'))
      }
    }
    
    const closeGoalModal = () => {
      showAddGoalModal.value = false
      editingGoal.value = null
    }
    
    const onGoalSaved = (goalData) => {
      if (editingGoal.value) {
        // Mise à jour
        const index = goals.value.findIndex(g => g.id === editingGoal.value.id)
        if (index !== -1) {
          goals.value[index] = { ...goals.value[index], ...goalData }
        }
        success(t('widgets.goals.goalUpdated'))
      } else {
        // Ajout
        const newGoal = {
          id: Date.now(),
          ...goalData,
          status: 'active',
          progress: 0,
          created_at: new Date().toISOString(),
          sub_goals: [],
          recent_comments: []
        }
        goals.value.unshift(newGoal)
        success(t('widgets.goals.goalAdded'))
      }
      
      closeGoalModal()
    }
    
    const toggleWidget = () => {
      widgetConfig.value.isEnabled = !widgetConfig.value.isEnabled
      emit('update-widget', widgetConfig.value)
    }
    
    const updateConfig = (newConfig) => {
      widgetConfig.value = { ...widgetConfig.value, ...newConfig }
      emit('update-widget', widgetConfig.value)
      showConfigModal.value = false
    }
    
    // Watchers
    watch(() => props.projectId, loadGoals, { immediate: true })
    
    onMounted(() => {
      loadGoals()
    })
    
    return {
      loading,
      error,
      goals,
      activeFilter,
      sortBy,
      expandedGoals,
      activeGoalMenu,
      showAddGoalModal,
      showConfigModal,
      editingGoal,
      widgetConfig,
      configOptions,
      canAddGoals,
      activeGoals,
      completedGoals,
      overdueGoals,
      overallProgress,
      filteredGoals,
      loadGoals,
      isOverdue,
      formatDate,
      formatCommentTime,
      toggleGoalStatus,
      toggleGoalMenu,
      editGoal,
      duplicateGoal,
      deleteGoal,
      toggleSubGoals,
      toggleSubGoalStatus,
      closeGoalModal,
      onGoalSaved,
      toggleWidget,
      updateConfig,
      t
    }
  }
}
</script>

<style scoped>
.goals-widget {
  @apply space-y-4;
}

.goals-header {
  @apply flex items-start justify-between;
}

.header-info {
  @apply flex-1;
}

.goals-title {
  @apply text-lg font-semibold text-gray-900 mb-2;
}

.goals-summary {
  @apply flex items-center space-x-4 text-sm;
}

.summary-item {
  @apply flex items-center space-x-1 text-gray-600;
}

.header-actions {
  @apply flex-shrink-0;
}

.add-goal-btn {
  @apply px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm;
}

.goals-filters {
  @apply flex items-center justify-between border-b border-gray-200 pb-3;
}

.filter-tabs {
  @apply flex items-center space-x-1;
}

.filter-tab {
  @apply px-3 py-2 text-sm rounded-md transition-colors;
}

.filter-tab:not(.active) {
  @apply text-gray-600 hover:text-gray-900 hover:bg-gray-100;
}

.filter-tab.active {
  @apply bg-blue-100 text-blue-700;
}

.filter-options {
  @apply flex items-center space-x-2;
}

.sort-select {
  @apply px-3 py-2 border border-gray-300 rounded-md text-sm;
}

.overall-progress {
  @apply bg-gray-50 rounded-lg p-4;
}

.progress-header {
  @apply flex items-center justify-between mb-2;
}

.progress-label {
  @apply text-sm font-medium text-gray-700;
}

.progress-percentage {
  @apply text-sm font-bold text-gray-900;
}

.progress-bar {
  @apply w-full bg-gray-200 rounded-full h-3 overflow-hidden;
}

.progress-bar.small {
  @apply h-2;
}

.progress-fill {
  @apply h-full bg-blue-500 transition-all duration-500 ease-out;
}

.progress-details {
  @apply mt-2 text-xs text-gray-600;
}

.detail-item {
  @apply mr-4;
}

.goals-list {
  @apply space-y-4 max-h-96 overflow-y-auto;
}

.goal-item {
  @apply bg-white border border-gray-200 rounded-lg p-4 transition-all;
}

.goal-item.completed {
  @apply bg-green-50 border-green-200;
}

.goal-item.overdue {
  @apply bg-red-50 border-red-200;
}

.goal-item.high-priority {
  @apply border-l-4 border-l-red-500;
}

.goal-header {
  @apply flex items-start justify-between mb-3;
}

.goal-info {
  @apply flex-1;
}

.goal-title-row {
  @apply flex items-start justify-between mb-2;
}

.goal-title {
  @apply text-base font-semibold text-gray-900;
}

.goal-badges {
  @apply flex items-center space-x-2;
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

.category-badge {
  @apply px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700;
}

.goal-description {
  @apply text-sm text-gray-600 mb-3;
}

.goal-meta {
  @apply space-y-1;
}

.meta-item {
  @apply flex items-center space-x-2 text-sm text-gray-600;
}

.goal-actions {
  @apply flex items-center space-x-2;
}

.action-btn {
  @apply w-8 h-8 flex items-center justify-center rounded-md border transition-colors;
}

.action-btn.pending {
  @apply border-gray-300 text-gray-500 hover:border-green-300 hover:text-green-600;
}

.action-btn.completed {
  @apply border-green-500 bg-green-500 text-white;
}

.dropdown {
  @apply relative;
}

.dropdown-menu {
  @apply absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px];
}

.dropdown-item {
  @apply w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center;
}

.goal-progress {
  @apply mb-3;
}

.sub-goals {
  @apply border-t border-gray-200 pt-3 mt-3;
}

.sub-goals-header {
  @apply flex items-center justify-between mb-2;
}

.sub-goals-title {
  @apply text-sm font-medium text-gray-700 flex items-center;
}

.toggle-btn {
  @apply p-1 text-gray-500 hover:text-gray-700 transition-transform;
}

.rotate-180 {
  @apply transform rotate-180;
}

.sub-goals-list {
  @apply space-y-2;
}

.sub-goal-item {
  @apply flex items-center space-x-3 p-2 bg-gray-50 rounded-md;
}

.sub-goal-item.completed {
  @apply bg-green-50;
}

.sub-goal-checkbox {
  @apply w-5 h-5 border border-gray-300 rounded flex items-center justify-center text-white transition-colors;
}

.sub-goal-item.completed .sub-goal-checkbox {
  @apply bg-green-500 border-green-500;
}

.sub-goal-title {
  @apply flex-1 text-sm text-gray-700;
}

.sub-goal-item.completed .sub-goal-title {
  @apply line-through text-gray-500;
}

.sub-goal-deadline {
  @apply text-xs text-gray-500;
}

.goal-comments {
  @apply border-t border-gray-200 pt-3 mt-3;
}

.comments-header {
  @apply text-sm font-medium text-gray-700 mb-2 flex items-center;
}

.comments-list {
  @apply space-y-2;
}

.comment-item {
  @apply flex space-x-2;
}

.comment-avatar {
  @apply w-6 h-6 rounded-full object-cover;
}

.comment-content {
  @apply flex-1;
}

.comment-header {
  @apply flex items-center space-x-2 mb-1;
}

.comment-author {
  @apply text-xs font-medium text-gray-900;
}

.comment-time {
  @apply text-xs text-gray-500;
}

.comment-text {
  @apply text-xs text-gray-700;
}

.no-goals {
  @apply text-center py-8;
}

.create-first-goal-btn {
  @apply px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center;
}
</style>