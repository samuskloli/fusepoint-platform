<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white" @click.stop>
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-user-plus text-green-600"></i>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">{{ t('tasks.assignTask') }}</h3>
            <p class="text-sm text-gray-600">{{ member ? t('tasks.assignToMember') : t('tasks.createNewTask') }}</p>
          </div>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <div class="mt-6">
        <form @submit.prevent="assignTask" v-if="!member">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('tasks.assignTo') }} <span class="text-red-500">*</span>
            </label>
            <select
              v-model="taskForm.assigned_to"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{{ t('tasks.selectMember') }}</option>
              <option v-for="teamMember in teamMembers" :key="teamMember.id" :value="teamMember.id">
                {{ teamMember.name }}
              </option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('tasks.title') }} <span class="text-red-500">*</span>
            </label>
            <input
              v-model="taskForm.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              :placeholder="t('tasks.enterTitle')"
            >
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('tasks.description') }}
            </label>
            <textarea
              v-model="taskForm.description"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              :placeholder="t('tasks.enterDescription')"
            ></textarea>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('tasks.priority') }} <span class="text-red-500">*</span>
            </label>
            <select
              v-model="taskForm.priority"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{{ t('tasks.selectPriority') }}</option>
              <option value="low">{{ t('tasks.priorities.low') }}</option>
              <option value="medium">{{ t('tasks.priorities.medium') }}</option>
              <option value="high">{{ t('tasks.priorities.high') }}</option>
              <option value="urgent">{{ t('tasks.priorities.urgent') }}</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('tasks.category') }}
            </label>
            <select
              v-model="taskForm.category"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{{ t('tasks.selectCategory') }}</option>
              <option v-for="category in taskCategories" :key="category.value" :value="category.value">
                {{ category.label }}
              </option>
            </select>
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('tasks.startDate') }}
              </label>
              <input
                v-model="taskForm.start_date"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('tasks.dueDate') }}
              </label>
              <input
                v-model="taskForm.due_date"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
            </div>
          </div>
          
          <!-- Estimation et Budget -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('tasks.estimatedHours') }}
              </label>
              <input
                v-model="taskForm.estimated_hours"
                type="number"
                min="0"
                step="0.5"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                :placeholder="t('tasks.enterEstimatedHours')"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('tasks.budget') }}
              </label>
              <div class="flex">
                <span class="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  €
                </span>
                <input
                  v-model="taskForm.budget"
                  type="number"
                  min="0"
                  step="0.01"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  :placeholder="t('tasks.enterBudget')"
                >
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('tasks.tags') }}
            </label>
            <div class="flex flex-wrap gap-2 mb-2">
              <span 
                v-for="tag in taskForm.tags"
                :key="tag"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {{ tag }}
                <button 
                  type="button"
                  @click="removeTag(tag)"
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
                class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                :placeholder="t('tasks.enterTag')"
              >
              <button
                type="button"
                @click="addTag"
                class="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
              >
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>

          <!-- Dépendances -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('tasks.dependencies') }}
            </label>
            <select
              v-model="selectedDependency"
              @change="addDependency"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{{ t('tasks.selectDependency') }}</option>
              <option v-for="task in availableTasks" :key="task.id" :value="task.id">
                {{ task.title }}
              </option>
            </select>
            <div v-if="taskForm.dependencies.length > 0" class="mt-2">
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="depId in taskForm.dependencies"
                  :key="depId"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                >
                  {{ getDependencyTitle(depId) }}
                  <button 
                    type="button"
                    @click="removeDependency(depId)"
                    class="ml-1 text-yellow-600 hover:text-yellow-800"
                  >
                    <i class="fas fa-times text-xs"></i>
                  </button>
                </span>
              </div>
            </div>
          </div>

          <!-- Pièces jointes -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('tasks.attachments') }}
            </label>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <input
                ref="fileInput"
                type="file"
                multiple
                @change="handleFileUpload"
                class="hidden"
              >
              <button 
                type="button"
                @click="$refs.fileInput.click()"
                class="text-blue-600 hover:text-blue-800"
              >
                <i class="fas fa-cloud-upload-alt text-2xl mb-2"></i>
                <p class="text-sm">{{ t('tasks.uploadFiles') }}</p>
              </button>
            </div>
            <div v-if="taskForm.attachments.length > 0" class="mt-2">
              <div class="space-y-2">
                <div
                  v-for="(file, index) in taskForm.attachments"
                  :key="index"
                  class="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <div class="flex items-center space-x-2">
                    <i class="fas fa-file text-gray-400"></i>
                    <span class="text-sm text-gray-700">{{ file.name }}</span>
                    <span class="text-xs text-gray-500">({{ formatFileSize(file.size) }})</span>
                  </div>
                  <button 
                    type="button"
                    @click="removeAttachment(index)"
                    class="text-red-600 hover:text-red-800"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Options -->
          <div class="mb-4">
            <div class="flex items-center space-x-4">
              <label class="flex items-center">
                <input
                  v-model="taskForm.is_milestone"
                  type="checkbox"
                  class="mr-2"
                >
                <span class="text-sm text-gray-700">{{ t('tasks.isMilestone') }}</span>
              </label>
              
              <label class="flex items-center">
                <input
                  v-model="taskForm.notify_assignee"
                  type="checkbox"
                  class="mr-2"
                >
                <span class="text-sm text-gray-700">{{ t('tasks.notifyAssignee') }}</span>
              </label>
              
              <label class="flex items-center">
                <input
                  v-model="taskForm.auto_start"
                  type="checkbox"
                  class="mr-2"
                >
                <span class="text-sm text-gray-700">{{ t('tasks.autoStart') }}</span>
              </label>
            </div>
          </div>

          <!-- Message -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('tasks.messageToAssignee') }}
            </label>
            <textarea
              v-model="taskForm.message"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              :placeholder="t('tasks.enterMessage')"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              {{ t('tasks.assignTask') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import projectManagementService from '@/services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'

export default {
  name: 'AssignTaskModal',
  props: {
    member: {
      type: Object,
      default: null
    },
    projectId: {
      type: [String, Number],
      required: true
    },
    existingTask: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'assigned'],
  setup(props, { emit }) {
    const { t } = useTranslation()
    const { success, error: showError } = useNotifications()
    
    const loading = ref(false)
    const newTag = ref('')
    const selectedDependency = ref('')
    const teamMembers = ref([])
    const availableTasks = ref([])
    
    const taskCategories = ref([
      { value: 'development', label: t('tasks.categories.development') },
      { value: 'design', label: t('tasks.categories.design') },
      { value: 'testing', label: t('tasks.categories.testing') },
      { value: 'documentation', label: t('tasks.categories.documentation') },
      { value: 'meeting', label: t('tasks.categories.meeting') },
      { value: 'review', label: t('tasks.categories.review') }
    ])
    
    const taskForm = ref({
      assigned_to: props.member?.id || '',
      title: '',
      description: '',
      priority: 'medium',
      category: '',
      start_date: '',
      due_date: '',
      estimated_hours: '',
      budget: '',
      tags: [],
      dependencies: [],
      attachments: [],
      is_milestone: false,
      notify_assignee: true,
      auto_start: false,
      message: ''
    })
    
    const isFormValid = computed(() => {
      return taskForm.value.title.trim() && 
             taskForm.value.priority && 
             (props.member || taskForm.value.assigned_to)
    })
    
    const closeModal = () => {
      emit('close')
    }
    
    const assignTask = async () => {
      if (!isFormValid.value) return
      
      loading.value = true
      try {
        const taskData = {
          ...taskForm.value,
          project_id: props.projectId
        }
        
        await projectManagementService.createTask(taskData)
        success(t('tasks.taskAssignedSuccessfully'))
        emit('assigned')
        closeModal()
      } catch (error) {
        console.error('Erreur lors de l\'assignation de la tâche:', error)
        showError(t('tasks.errorAssigningTask'))
      } finally {
        loading.value = false
      }
    }
    
    const addTag = () => {
      if (newTag.value.trim() && !taskForm.value.tags.includes(newTag.value.trim())) {
        taskForm.value.tags.push(newTag.value.trim())
        newTag.value = ''
      }
    }
    
    const removeTag = (tag) => {
      const index = taskForm.value.tags.indexOf(tag)
      if (index > -1) {
        taskForm.value.tags.splice(index, 1)
      }
    }
    
    const addDependency = () => {
      if (selectedDependency.value && !taskForm.value.dependencies.includes(selectedDependency.value)) {
        taskForm.value.dependencies.push(selectedDependency.value)
        selectedDependency.value = ''
      }
    }
    
    const removeDependency = (depId) => {
      const index = taskForm.value.dependencies.indexOf(depId)
      if (index > -1) {
        taskForm.value.dependencies.splice(index, 1)
      }
    }
    
    const getDependencyTitle = (depId) => {
      const task = availableTasks.value.find(t => t.id === depId)
      return task ? task.title : `Task ${depId}`
    }
    
    const handleFileUpload = (event) => {
      const files = Array.from(event.target.files)
      taskForm.value.attachments.push(...files)
    }
    
    const removeAttachment = (index) => {
      taskForm.value.attachments.splice(index, 1)
    }
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    const loadTeamMembers = async () => {
      try {
        const response = await projectManagementService.getProjectTeam(props.projectId)
        teamMembers.value = response.data
      } catch (error) {
        console.error('Erreur lors du chargement des membres:', error)
      }
    }
    
    const loadAvailableTasks = async () => {
      try {
        const response = await projectManagementService.getProjectTasks(props.projectId)
        availableTasks.value = response.data.filter(task => task.id !== props.existingTask?.id)
      } catch (error) {
        console.error('Erreur lors du chargement des tâches:', error)
      }
    }
    
    onMounted(() => {
      loadTeamMembers()
      loadAvailableTasks()
      
      if (props.existingTask) {
        Object.assign(taskForm.value, props.existingTask)
      }
    })
    
    return {
      t,
      loading,
      newTag,
      selectedDependency,
      teamMembers,
      availableTasks,
      taskCategories,
      taskForm,
      isFormValid,
      closeModal,
      assignTask,
      addTag,
      removeTag,
      addDependency,
      removeDependency,
      getDependencyTitle,
      handleFileUpload,
      removeAttachment,
      formatFileSize
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>