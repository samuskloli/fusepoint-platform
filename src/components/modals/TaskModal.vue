<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" @click.stop>
      <!-- En-tête -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ task ? t('tasks.editTask') : t('tasks.createTask') }}
        </h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="submitForm" class="mt-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Titre de la tâche -->
          <div class="md:col-span-2">
            <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('tasks.title') }} *
            </label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :placeholder="t('tasks.titlePlaceholder')"
            />
          </div>

          <!-- Description -->
          <div class="md:col-span-2">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('tasks.description') }}
            </label>
            <textarea
              id="description"
              v-model="formData.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :placeholder="t('tasks.descriptionPlaceholder')"
            ></textarea>
          </div>

          <!-- Statut -->
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('common.status') }}
            </label>
            <select
              id="status"
              v-model="formData.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">{{ t('tasks.status.pending') }}</option>
              <option value="in_progress">{{ t('tasks.status.inProgress') }}</option>
              <option value="completed">{{ t('tasks.status.completed') }}</option>
              <option value="cancelled">{{ t('tasks.status.cancelled') }}</option>
            </select>
          </div>

          <!-- Priorité -->
          <div>
            <label for="priority" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('common.priority') }}
            </label>
            <select
              id="priority"
              v-model="formData.priority"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">{{ t('tasks.priority.low') }}</option>
              <option value="medium">{{ t('tasks.priority.medium') }}</option>
              <option value="high">{{ t('tasks.priority.high') }}</option>
              <option value="urgent">{{ t('tasks.priority.urgent') }}</option>
            </select>
          </div>

          <!-- Date de début -->
          <div>
            <label for="start_date" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('tasks.startDate') }}
            </label>
            <input
              id="start_date"
              v-model="formData.start_date"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Date de fin -->
          <div>
            <label for="due_date" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('tasks.dueDate') }}
            </label>
            <input
              id="due_date"
              v-model="formData.due_date"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Assigné à -->
          <div>
            <label for="assigned_to" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('tasks.assignedTo') }}
            </label>
            <select
              id="assigned_to"
              v-model="formData.assigned_to"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{{ t('tasks.selectMember') }}</option>
              <option v-for="member in members" :key="member.id" :value="member.id">
                {{ member.name }}
              </option>
            </select>
          </div>

          <!-- Catégorie -->
          <div>
            <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('tasks.category') }}
            </label>
            <select
              id="category"
              v-model="formData.category"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{{ t('tasks.selectCategory') }}</option>
              <option value="development">{{ t('tasks.categories.development') }}</option>
              <option value="design">{{ t('tasks.categories.design') }}</option>
              <option value="testing">{{ t('tasks.categories.testing') }}</option>
              <option value="documentation">{{ t('tasks.categories.documentation') }}</option>
              <option value="meeting">{{ t('tasks.categories.meeting') }}</option>
              <option value="review">{{ t('tasks.categories.review') }}</option>
              <option value="deployment">{{ t('tasks.categories.deployment') }}</option>
              <option value="maintenance">{{ t('tasks.categories.maintenance') }}</option>
            </select>
          </div>

          <!-- Estimation (heures) -->
          <div>
            <label for="estimated_hours" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('tasks.estimatedHours') }}
            </label>
            <input
              id="estimated_hours"
              v-model.number="formData.estimated_hours"
              type="number"
              min="0"
              step="0.5"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :placeholder="t('tasks.estimatedHoursPlaceholder')"
            />
          </div>




        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="loading || !formData.title.trim()"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
            {{ task ? t('common.update') : t('common.create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'

export default {
  name: 'TaskModal',
  props: {
    task: {
      type: Object,
      default: null
    },
    projectId: {
      type: [String, Number],
      required: true
    },
    members: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const { t } = useTranslation()
    const { success, error: showError } = useNotifications()

    const loading = ref(false)

    const formData = reactive({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      start_date: '',
      due_date: '',
      assigned_to: '',
      category: '',
      estimated_hours: null,
      project_id: props.projectId
    })

    // Initialiser le formulaire avec les données de la tâche si en mode édition
    const initializeForm = () => {
      if (props.task) {
        Object.assign(formData, {
          title: props.task.title || '',
          description: props.task.description || '',
          status: props.task.status || 'pending',
          priority: props.task.priority || 'medium',
          start_date: props.task.start_date ? formatDateForInput(props.task.start_date) : '',
          due_date: props.task.due_date ? formatDateForInput(props.task.due_date) : '',
          assigned_to: props.task.assigned_to || '',
          category: props.task.category || '',
          estimated_hours: props.task.estimated_hours || null,
          project_id: props.task.project_id || props.projectId
        })
      }
    }

    const formatDateForInput = (dateString) => {
      if (!dateString) return ''
      const d = new Date(dateString)
      if (isNaN(d.getTime())) return ''
      const pad = (n) => String(n).padStart(2, '0')
      // Retourne uniquement la date au format YYYY-MM-DD
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    }

    const closeModal = () => {
      emit('close')
    }



    const validateForm = () => {
      if (!formData.title.trim()) {
        showError(t('tasks.validation.titleRequired'))
        return false
      }

      if (formData.start_date && formData.due_date) {
        const startDate = new Date(formData.start_date)
        const dueDate = new Date(formData.due_date)
        if (startDate > dueDate) {
          showError(t('tasks.validation.invalidDateRange'))
          return false
        }
      }

      return true
    }

    const submitForm = async () => {
      if (!validateForm()) return

      loading.value = true
      try {
        const taskData = {
          ...formData,
          start_date: formData.start_date || null,
          due_date: formData.due_date || null,
          assigned_to: formData.assigned_to || null,
          estimated_hours: formData.estimated_hours || null
        }

        if (props.task) {
          taskData.id = props.task.id
        }

        emit('save', taskData)
        success(props.task ? t('tasks.updated') : t('tasks.created'))
        closeModal()
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        showError(t('tasks.saveError'))
      } finally {
        loading.value = false
      }
    }

    // Watchers
    watch(() => props.task, initializeForm, { immediate: true })

    // Lifecycle
    onMounted(() => {
      initializeForm()
    })

    return {
      loading,
      formData,
      closeModal,
      submitForm,
      t
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques au composant */
.modal-overlay {
  backdrop-filter: blur(2px);
}

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>