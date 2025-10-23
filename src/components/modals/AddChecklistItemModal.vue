<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" @click.stop>
      <!-- En-tête -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ item ? t('widgets.checklist.editItem') : t('widgets.checklist.addItem') }}
        </h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Informations de la checklist -->
      <div v-if="checklist" class="mt-4 p-3 bg-gray-50 rounded-md">
        <div class="flex items-center">
          <i class="fas fa-list-check text-blue-600 mr-2"></i>
          <span class="font-medium text-gray-900">{{ checklist.title }}</span>
        </div>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="handleSubmit" class="mt-6">
        <!-- Titre de l'élément -->
        <div class="mb-4">
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('widgets.checklist.itemTitle') }}
          </label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :placeholder="t('widgets.checklist.itemTitlePlaceholder')"
          />
        </div>

        <!-- Description de l'élément -->
        <div class="mb-4">
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('widgets.checklist.itemDescription') }}
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :placeholder="t('widgets.checklist.itemDescriptionPlaceholder')"
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

        <!-- Assigné à -->
        <div class="mb-4">
          <label for="assignedTo" class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('widgets.checklist.assignedTo') }}
          </label>
          <input
            id="assignedTo"
            v-model="formData.assigned_to"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :placeholder="t('widgets.checklist.assignedToPlaceholder')"
          />
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

        <!-- Statut (pour l'édition) -->
        <div v-if="item" class="mb-6">
          <label class="flex items-center">
            <input
              v-model="formData.completed"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span class="ml-2 text-sm text-gray-700">{{ t('widgets.checklist.markAsCompleted') }}</span>
          </label>
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
            {{ item ? t('common.update') : t('common.add') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useTranslation } from '@/composables/useTranslation'

interface ChecklistItemData {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  assigned_to: string
  due_date: string
  completed: boolean
}

interface Props {
  checklist?: any
  item?: any
}

interface Emits {
  close: []
  save: [data: ChecklistItemData]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useTranslation()
const loading = ref(false)

const formData = reactive<ChecklistItemData>({
  title: '',
  description: '',
  priority: 'medium',
  assigned_to: '',
  due_date: '',
  completed: false
})

// Initialiser le formulaire avec les données existantes
watch(() => props.item, (newItem) => {
  if (newItem) {
    formData.title = newItem.title || ''
    formData.description = newItem.description || ''
    formData.priority = newItem.priority || 'medium'
    formData.assigned_to = newItem.assigned_to || ''
    formData.due_date = newItem.due_date || ''
    formData.completed = newItem.completed || false
  } else {
    // Réinitialiser pour un nouvel élément
    formData.title = ''
    formData.description = ''
    formData.priority = 'medium'
    formData.assigned_to = ''
    formData.due_date = ''
    formData.completed = false
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