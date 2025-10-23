<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" @click.stop>
      <!-- En-tête -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ checklist ? t('widgets.checklist.editChecklist') : t('widgets.checklist.createChecklist') }}
        </h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="handleSubmit" class="mt-6">
        <!-- Titre -->
        <div class="mb-4">
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('widgets.checklist.title') }}
          </label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :placeholder="t('widgets.checklist.titlePlaceholder')"
          />
        </div>

        <!-- Description -->
        <div class="mb-4">
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('widgets.checklist.description') }}
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :placeholder="t('widgets.checklist.descriptionPlaceholder')"
          ></textarea>
        </div>

        <!-- Priorité -->
        <div class="mb-4">
          <label for="priority" class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('widgets.checklist.priority') }}
          </label>
          <select
            id="priority"
            v-model="formData.priority"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="low">{{ t('widgets.checklist.priorityLow') }}</option>
            <option value="medium">{{ t('widgets.checklist.priorityMedium') }}</option>
            <option value="high">{{ t('widgets.checklist.priorityHigh') }}</option>
          </select>
        </div>

        <!-- Date d'échéance -->
        <div class="mb-6">
          <label for="dueDate" class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('widgets.checklist.dueDate') }}
          </label>
          <input
            id="dueDate"
            v-model="formData.due_date"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- Boutons d'action -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
            {{ checklist ? t('common.update') : t('common.create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useTranslation } from '@/composables/useTranslation'

interface ChecklistData {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  due_date: string
}

interface Props {
  checklist?: any
}

interface Emits {
  close: []
  save: [data: ChecklistData]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useTranslation()
const loading = ref(false)

const formData = reactive<ChecklistData>({
  title: '',
  description: '',
  priority: 'medium',
  due_date: ''
})

// Initialiser le formulaire avec les données existantes
watch(() => props.checklist, (newChecklist) => {
  if (newChecklist) {
    formData.title = newChecklist.title || ''
    formData.description = newChecklist.description || ''
    formData.priority = newChecklist.priority || 'medium'
    formData.due_date = newChecklist.due_date || ''
  } else {
    // Réinitialiser pour une nouvelle checklist
    formData.title = ''
    formData.description = ''
    formData.priority = 'medium'
    formData.due_date = ''
  }
}, { immediate: true })

const closeModal = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (!formData.title.trim()) {
    return
  }

  loading.value = true
  try {
    emit('save', { ...formData })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Styles spécifiques à la modale */
</style>