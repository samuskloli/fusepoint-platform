<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-semibold text-gray-900">
          {{ t('widgets.features.addFeature') }}
        </h3>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form @submit.prevent="submitFeature" class="space-y-6">
        <!-- Nom de la fonctionnalité -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            {{ t('widgets.features.name') }} *
          </label>
          <input
            v-model="localFeature.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :placeholder="t('widgets.features.namePlaceholder')"
          />
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            {{ t('widgets.features.description') }}
          </label>
          <textarea
            v-model="localFeature.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :placeholder="t('widgets.features.descriptionPlaceholder')"
          ></textarea>
        </div>

        <!-- Priorité et Statut -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              {{ t('widgets.features.priority') }}
            </label>
            <select
              v-model="localFeature.priority"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">{{ t('widgets.features.priorities.low') }}</option>
              <option value="medium">{{ t('widgets.features.priorities.medium') }}</option>
              <option value="high">{{ t('widgets.features.priorities.high') }}</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              {{ t('widgets.features.status') }}
            </label>
            <select
              v-model="localFeature.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="planned">{{ t('widgets.features.statuses.planned') }}</option>
              <option value="in-progress">{{ t('widgets.features.statuses.inProgress') }}</option>
              <option value="testing">{{ t('widgets.features.statuses.testing') }}</option>
              <option value="completed">{{ t('widgets.features.statuses.completed') }}</option>
            </select>
          </div>
        </div>

        <!-- Assigné à et Date d'échéance -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              {{ t('widgets.features.assignee') }}
            </label>
            <input
              v-model="localFeature.assignee"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :placeholder="t('widgets.features.assigneePlaceholder')"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              {{ t('widgets.features.dueDate') }}
            </label>
            <input
              v-model="localFeature.due_date"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Progression -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            {{ t('widgets.features.progress') }} ({{ localFeature.progress }}%)
          </label>
          <input
            v-model.number="localFeature.progress"
            type="range"
            min="0"
            max="100"
            step="5"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div class="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <!-- Boutons d'action -->
        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="!localFeature.name.trim() || loading"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ t('common.saving') }}
            </span>
            <span v-else>
              {{ t('widgets.features.addFeature') }}
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import type { Feature } from '@/components/widgets/types'

// Props
interface Props {
  isOpen: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Emits
const emit = defineEmits<{
  'close': []
  'submit': [feature: Omit<Feature, 'id' | 'created_at' | 'updated_at'>]
}>()

// Composables
const { t } = useTranslation()

// State
const localFeature = ref({
  name: '',
  description: '',
  priority: 'medium' as const,
  status: 'planned' as const,
  assignee: '',
  due_date: '',
  progress: 0
})

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
})

// Methods
const resetForm = () => {
  localFeature.value = {
    name: '',
    description: '',
    priority: 'medium',
    status: 'planned',
    assignee: '',
    due_date: '',
    progress: 0
  }
}

const closeModal = () => {
  emit('close')
}

const submitFeature = () => {
  if (!localFeature.value.name.trim()) {
    return
  }

  emit('submit', { ...localFeature.value })
}
</script>

<style scoped>
/* Custom styles for range input */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input[type="range"]::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>