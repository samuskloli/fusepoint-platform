<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-lg bg-white" @click.stop>
      <!-- En-tête -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="priorityConfig.bgColor">
            <i :class="[priorityConfig.icon, priorityConfig.textColor]"></i>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">{{ goal.title }}</h3>
            <div class="flex items-center space-x-4 text-sm text-gray-600">
              <span class="flex items-center">
                <i class="fas fa-bullseye mr-1"></i>
                {{ t('goals.goal') }}
              </span>
              <span class="flex items-center">
                <i class="fas fa-calendar mr-1"></i>
                {{ t('goals.createdOn') }} {{ formatDate(goal.created_at) }}
              </span>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button 
            v-if="canEdit"
            @click="editGoal"
            class="p-2 text-gray-400 hover:text-gray-600"
            :title="t('common.edit')"
          >
            <i class="fas fa-edit"></i>
          </button>
          <button 
            @click="closeModal"
            class="p-2 text-gray-400 hover:text-gray-600"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
      </div>

      <!-- Contenu principal -->
      <div class="mt-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Colonne principale -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Statut et priorité -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('goals.status') }}</label>
                  <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 rounded-full" :class="statusConfig.color"></div>
                    <span class="text-sm font-medium" :class="statusConfig.textColor">{{ t('goals.status.' + goal.status) }}</span>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('goals.priority') }}</label>
                  <div class="flex items-center space-x-2">
                    <i :class="[priorityConfig.icon, priorityConfig.textColor]"></i>
                    <span class="text-sm font-medium" :class="priorityConfig.textColor">{{ t('goals.priority.' + goal.priority) }}</span>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('goals.progress') }}</label>
                  <div class="flex items-center space-x-2">
                    <div class="flex-1 bg-gray-200 rounded-full h-2">
                      <div class="bg-blue-600 h-2 rounded-full" :style="{ width: goal.progress + '%' }"></div>
                    </div>
                    <span class="text-sm font-medium text-gray-700">{{ goal.progress }}%</span>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('goals.category') }}</label>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {{ goal.category || t('goals.noCategory') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">{{ t('goals.description') }}</h4>
              <div class="prose prose-sm max-w-none">
                <p>{{ goal.description || t('goals.noDescription') }}</p>
              </div>
            </div>

            <!-- Dates -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('goals.startDate') }}</label>
                <div class="flex items-center space-x-2 text-sm text-gray-600">
                  <i class="fas fa-calendar-plus"></i>
                  <span>{{ goal.start_date ? formatDate(goal.start_date) : t('goals.noStartDate') }}</span>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('goals.dueDate') }}</label>
                <div class="flex items-center space-x-2 text-sm" :class="dueDateClass">
                  <i class="fas fa-calendar-times"></i>
                  <span>{{ goal.due_date ? formatDate(goal.due_date) : t('goals.noDueDate') }}</span>
                </div>
              </div>
            </div>

            <!-- Tags -->
            <div v-if="goal.tags && goal.tags.length > 0">
              <h4 class="text-sm font-medium text-gray-700 mb-3">{{ t('goals.tags') }}</h4>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="tag in goal.tags"
                  :key="tag"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>

          <!-- Colonne latérale -->
          <div class="space-y-6">
            <!-- Assigné à -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">{{ t('goals.assignedTo') }}</h4>
              <div v-if="goal.assignee" class="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                <img :src="goal.assignee.avatar || '/default-avatar.png'" :alt="goal.assignee.name" class="w-8 h-8 rounded-full">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-700">{{ goal.assignee.name }}</p>
                  <p class="text-xs text-gray-500">{{ goal.assignee.role }}</p>
                </div>
              </div>
              <div v-else class="text-sm text-gray-500">
                {{ t('goals.noAssignee') }}
              </div>
            </div>

            <!-- Actions rapides -->
            <div v-if="canEdit">
              <h4 class="text-sm font-medium text-gray-700 mb-3">{{ t('goals.quickActions') }}</h4>
              <div class="space-y-2">
                <button 
                  @click="updateStatus('active')"
                  :disabled="goal.status === 'active'"
                  class="w-full px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 disabled:opacity-50"
                >
                  <i class="fas fa-play mr-2"></i>
                  {{ t('goals.startGoal') }}
                </button>
                
                <button 
                  @click="updateStatus('completed')"
                  :disabled="goal.status === 'completed'"
                  class="w-full px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100 disabled:opacity-50"
                >
                  <i class="fas fa-check mr-2"></i>
                  {{ t('goals.completeGoal') }}
                </button>
                
                <button 
                  @click="updateStatus('on_hold')"
                  :disabled="goal.status === 'on_hold'"
                  class="w-full px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 disabled:opacity-50"
                >
                  <i class="fas fa-pause mr-2"></i>
                  {{ t('goals.pauseGoal') }}
                </button>
              </div>
            </div>

            <!-- Actions de suppression -->
            <div v-if="canDelete">
              <button 
                @click="deleteGoal"
                class="w-full px-3 py-2 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100"
              >
                <i class="fas fa-trash mr-2"></i>
                {{ t('goals.deleteGoal') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import { useAuth } from '@/composables/useAuth'

export default {
  name: 'GoalDetailsModal',
  props: {
    goal: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'edit', 'delete'],
  setup(props, { emit }) {
    const { t } = useTranslation()
    const { user } = useAuth()
    
    const canEdit = computed(() => {
      return user.value && (user.value.role === 'admin' || props.goal.assigned_to === user.value.id)
    })
    
    const canDelete = computed(() => {
      return user.value && user.value.role === 'admin'
    })
    
    const statusConfig = computed(() => {
      const configs = {
        'active': { color: 'bg-blue-500', textColor: 'text-blue-700' },
        'completed': { color: 'bg-green-500', textColor: 'text-green-700' },
        'on_hold': { color: 'bg-yellow-500', textColor: 'text-yellow-700' },
        'cancelled': { color: 'bg-red-500', textColor: 'text-red-700' }
      }
      return configs[props.goal.status] || configs['active']
    })
    
    const priorityConfig = computed(() => {
      const configs = {
        'low': { icon: 'fas fa-arrow-down', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
        'medium': { icon: 'fas fa-minus', bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' },
        'high': { icon: 'fas fa-arrow-up', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
        'critical': { icon: 'fas fa-exclamation', bgColor: 'bg-red-100', textColor: 'text-red-600' }
      }
      return configs[props.goal.priority] || configs['medium']
    })
    
    const dueDateClass = computed(() => {
      if (!props.goal.due_date) return 'text-gray-600'
      const dueDate = new Date(props.goal.due_date)
      const now = new Date()
      return dueDate < now ? 'text-red-600' : 'text-gray-600'
    })
    
    const closeModal = () => {
      emit('close')
    }
    
    const editGoal = () => {
      emit('edit', props.goal)
    }
    
    const deleteGoal = () => {
      emit('delete', props.goal)
    }
    
    const updateStatus = (status) => {
      // Cette fonction sera gérée par le composant parent
      emit('edit', { ...props.goal, status })
    }
    
    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('fr-FR')
    }
    
    return {
      canEdit,
      canDelete,
      statusConfig,
      priorityConfig,
      dueDateClass,
      closeModal,
      editGoal,
      deleteGoal,
      updateStatus,
      formatDate,
      t
    }
  }
}
</script>

<style scoped>
.prose {
  @apply text-gray-600;
}
</style>