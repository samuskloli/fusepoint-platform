<template>
  <div v-if="isVisible" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" @click.stop>
      <form @submit.prevent="saveGoal">
        <!-- En-tête -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            {{ isEditing ? t('goals.editGoal') : t('goals.addGoal') }}
          </h3>
          <button @click="closeModal" type="button" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="mt-4">
          <!-- Titre -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('goals.title') }}
            </label>
            <input
              v-model="goalData.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :placeholder="t('goals.titlePlaceholder')"
            >
          </div>

          <!-- Description -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('goals.description') }}
            </label>
            <textarea
              v-model="goalData.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :placeholder="t('goals.descriptionPlaceholder')"
            ></textarea>
          </div>

          <!-- Catégorie -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('goals.category') }}
            </label>
            <select
              v-model="goalData.category"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{{ t('goals.selectCategory') }}</option>
              <option value="performance">{{ t('goals.performance') }}</option>
              <option value="quality">{{ t('goals.quality') }}</option>
              <option value="timeline">{{ t('goals.timeline') }}</option>
              <option value="budget">{{ t('goals.budget') }}</option>
              <option value="team">{{ t('goals.team') }}</option>
              <option value="client">{{ t('goals.client') }}</option>
            </select>
          </div>

          <!-- Priorité -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('goals.priority') }}
            </label>
            <select
              v-model="goalData.priority"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">{{ t('goals.low') }}</option>
              <option value="medium">{{ t('goals.medium') }}</option>
              <option value="high">{{ t('goals.high') }}</option>
              <option value="critical">{{ t('goals.critical') }}</option>
            </select>
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('goals.startDate') }}
              </label>
              <input
                v-model="goalData.start_date"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('goals.dueDate') }}
              </label>
              <input
                v-model="goalData.due_date"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
          </div>

          <!-- Objectif mesurable -->
          <div class="mb-4">
            <div class="flex items-center mb-2">
              <input
                v-model="goalData.is_measurable"
                type="checkbox"
                id="measurable"
                class="mr-2"
              >
              <label for="measurable" class="text-sm font-medium text-gray-700">
                {{ t('goals.measurableGoal') }}
              </label>
            </div>

            <div v-if="goalData.is_measurable" class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('goals.targetValue') }}
                </label>
                <input
                  v-model="goalData.target_value"
                  type="number"
                  step="0.01"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('goals.currentValue') }}
                </label>
                <input
                  v-model="goalData.current_value"
                  type="number"
                  step="0.01"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('goals.unit') }}
                </label>
                <input
                  v-model="goalData.unit"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="t('goals.unitPlaceholder')"
                >
              </div>
            </div>
          </div>

          <!-- Assigné à -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('goals.assignedTo') }}
            </label>
            <select
              v-model="goalData.assigned_to"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{{ t('goals.selectMember') }}</option>
              <option v-for="member in teamMembers" :key="member.id" :value="member.id">
                {{ member.name }}
              </option>
            </select>
          </div>

          <!-- Tags -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('goals.tags') }}
            </label>
            <div class="flex flex-wrap gap-2 mb-2">
              <span 
                v-for="tag in goalData.tags"
                :key="tag"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {{ tag }}
                <button 
                  @click="removeTag(tag)"
                  type="button"
                  class="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <i class="fas fa-times text-xs"></i>
                </button>
              </span>
            </div>
            <div class="flex">
              <input
                v-model="newTag"
                @keyup.enter="addTag"
                type="text"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :placeholder="t('goals.addTag')"
              >
              <button
                @click="addTag"
                type="button"
                class="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
              >
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            @click="closeModal"
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="loading || !goalData.title"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
            {{ isEditing ? t('common.update') : t('common.create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import projectManagementService from '@/services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'

export default {
  name: 'AddGoalModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    projectId: {
      type: [String, Number],
      required: true
    },
    goal: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const { t } = useTranslation()
    const { success, error: showError } = useNotifications()
    
    const loading = ref(false)
    const teamMembers = ref([])
    const newTag = ref('')
    
    const goalData = ref({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      start_date: '',
      due_date: '',
      is_measurable: false,
      target_value: null,
      current_value: 0,
      unit: '',
      assigned_to: '',
      tags: []
    })
    
    const isEditing = computed(() => !!props.goal)
    
    const closeModal = () => {
      emit('close')
    }
    
    const addTag = () => {
      if (newTag.value.trim() && !goalData.value.tags.includes(newTag.value.trim())) {
        goalData.value.tags.push(newTag.value.trim())
        newTag.value = ''
      }
    }
    
    const removeTag = (tag) => {
      const index = goalData.value.tags.indexOf(tag)
      if (index > -1) {
        goalData.value.tags.splice(index, 1)
      }
    }
    
    const loadTeamMembers = async () => {
      try {
        const response = await projectManagementService.getProjectMembers(props.projectId)
        if (response.success) {
          teamMembers.value = response.data
        }
      } catch (err) {
        console.error('Erreur lors du chargement des membres:', err)
      }
    }
    
    const saveGoal = async () => {
      loading.value = true
      try {
        const goalPayload = {
          ...goalData.value,
          project_id: props.projectId
        }
        
        let response
        if (isEditing.value) {
          response = await projectManagementService.updateGoal(props.goal.id, goalPayload)
        } else {
          response = await projectManagementService.createGoal(goalPayload)
        }
        
        if (response.success) {
          success(isEditing.value ? t('goals.goalUpdated') : t('goals.goalCreated'))
          emit('saved', response.data)
          closeModal()
        }
      } catch (err) {
        showError(t('errors.savingFailed'))
      } finally {
        loading.value = false
      }
    }
    
    const initializeGoalData = () => {
      if (props.goal) {
        goalData.value = {
          title: props.goal.title || '',
          description: props.goal.description || '',
          category: props.goal.category || '',
          priority: props.goal.priority || 'medium',
          start_date: props.goal.start_date || '',
          due_date: props.goal.due_date || '',
          is_measurable: props.goal.is_measurable || false,
          target_value: props.goal.target_value || null,
          current_value: props.goal.current_value || 0,
          unit: props.goal.unit || '',
          assigned_to: props.goal.assigned_to || '',
          tags: props.goal.tags ? [...props.goal.tags] : []
        }
      } else {
        goalData.value = {
          title: '',
          description: '',
          category: '',
          priority: 'medium',
          start_date: '',
          due_date: '',
          is_measurable: false,
          target_value: null,
          current_value: 0,
          unit: '',
          assigned_to: '',
          tags: []
        }
      }
    }
    
    watch(() => props.isVisible, (newValue) => {
      if (newValue) {
        initializeGoalData()
        loadTeamMembers()
      }
    })
    
    onMounted(() => {
      if (props.isVisible) {
        initializeGoalData()
        loadTeamMembers()
      }
    })
    
    return {
      loading,
      teamMembers,
      newTag,
      goalData,
      isEditing,
      closeModal,
      addTag,
      removeTag,
      saveGoal,
      t
    }
  }
}
</script>