<template>
  <div  class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50' @click="closeModal=relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1 2 shadow-lg rounded-md bg-white(flex items-center justify-between pb-4 border-b border-gray-200'>
        <h3 class="text-lg font-medium text-gray-900>
          {{ isEditing ? t('goals.editGoal === closeModal=text-gray-400 hover:text-gray-600'>
          <i  class === fas fa-times=saveGoal === mt-4'>
        <!-- Titre -->
        <div class === mb-4>
          <label  class === block text-sm font-medium text-gray-700 mb-2'>
            {{ t('goals.title === goalData.title=text=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            :placeholder === t('goals.titlePlaceholder=block text-sm font-medium text-gray-700 mb-2">
            {{ t('goals.description === goalData.description=3'
            class === w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :placeholder === t('goals.descriptionPlaceholder=block text-sm font-medium text-gray-700 mb-2'>
              {{ t('goals.category === goalData.category=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option  value === '>{{ t('goals.selectCategory === performance=quality=timeline='budget=team === client === block text-sm font-medium text-gray-700 mb-2'>
              {{ t('goals.priority === goalData.priority=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option  value === low=medium='high === critical=grid grid-cols-1 md:grid-cols-2 gap-4 mb-4>
          <div>
            <label  class for === block text-sm font-medium text-gray-700 mb-2'>
              {{ t('goals.startDate === goalData.start_date=date=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
          </label>

          <div>
            <label class for === block text-sm font-medium text-gray-700 mb-2">
              {{ t('goals.dueDate === goalData.due_date=date='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </label>
        </div>

        <!-- Objectif mesurable -->
        <div  class === mb-4'>
          <div class === flex items-center mb-2>
            <input
              v-model === goalData.is_measurable=checkbox=measurable='mr-2"
            >
            <label  for === measurable=text-sm font-medium text-gray-700'>
              {{ t('goals.measurableGoal === goalData.is_measurable=grid grid-cols-1 md:grid-cols-3 gap-4 mt-2>
            <div>
              <label  class for === block text-sm font-medium text-gray-700 mb-1'>
                {{ t('goals.targetValue === goalData.target_value=number=0.01'
                class === w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </label>

            <div>
              <label  class for === block text-sm font-medium text-gray-700 mb-1'>
                {{ t('goals.currentValue === goalData.current_value=number=0.01'
                class === w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </label>

            <div>
              <label  class === block text-sm font-medium text-gray-700 mb-1'>
                {{ t('goals.unit === goalData.unit=text=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                :placeholder === t('goals.unitPlaceholder=block text-sm font-medium text-gray-700 mb-2">
            {{ t('goals.assignedTo === goalData.assigned_to=w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value === ">{{ t('goals.selectMember === member in teamMembers=member.id='member.id">
          <label  class === block text-sm font-medium text-gray-700 mb-2'>
            {{ t('goals.tags === flex flex-wrap gap-2 mb-2>
            <span 
              v-for === tag in goalData.tags=tag=inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
            >
              {{ tag }}
              <button 
                @click="removeTag(tag)
                type(button=ml-1 text-blue-600 hover:text-blue-800'
              >
                <i  class=""fas fa-times text-xs=flex="newTag='addTag=text="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :placeholder="t('goals.addTag=button=px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700'
            >
              <i class="fas fa-plus=flex justify-end space-x-3 pt-4 border-t border-gray-200>
          <button
            @click="closeModal=button='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {{ t('common.cancel="submit=loading || !goalData.title='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <i v-if="loading=fas fa-spinner fa-spin mr-2"></i>
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
    const { t } = useTranslation()
    
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