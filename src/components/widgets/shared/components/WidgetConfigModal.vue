<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ t('widgets.config.title') }}
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

      <form @submit.prevent="saveConfig" class="space-y-4">
        <div v-for="option in configOptions" :key="option.key" class="space-y-2">
          <!-- Boolean options -->
          <div v-if="option.type === 'boolean'" class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">
              {{ option.label }}
            </label>
            <input
              v-model="localConfig[option.key]"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <!-- Text options -->
          <div v-else-if="option.type === 'text'" class="space-y-1">
            <label class="text-sm font-medium text-gray-700">
              {{ option.label }}
            </label>
            <input
              v-model="localConfig[option.key]"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Number options -->
          <div v-else-if="option.type === 'number'" class="space-y-1">
            <label class="text-sm font-medium text-gray-700">
              {{ option.label }}
            </label>
            <input
              v-model.number="localConfig[option.key]"
              type="number"
              :min="option.min || 0"
              :max="option.max || 100"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Select options -->
          <div v-else-if="option.type === 'select'" class="space-y-1">
            <label class="text-sm font-medium text-gray-700">
              {{ option.label }}
            </label>
            <select
              v-model="localConfig[option.key]"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option v-for="selectOption in option.options" :key="selectOption.value" :value="selectOption.value">
                {{ selectOption.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            {{ t('common.save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useTranslation } from '@/composables/useTranslation'

// Props
interface ConfigOption {
  key: string
  label: string
  type: 'boolean' | 'text' | 'number' | 'select'
  value?: any
  min?: number
  max?: number
  options?: { value: any; label: string }[]
}

interface Props {
  isOpen: boolean
  configOptions: ConfigOption[]
  currentConfig?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  currentConfig: () => ({})
})

// Emits
const emit = defineEmits<{
  'close': []
  'save': [config: Record<string, any>]
}>()

// Composables
const { t } = useTranslation()

// State
const localConfig = ref<Record<string, any>>({})

// Initialize local config when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    // Initialize with current config values
    localConfig.value = { ...props.currentConfig }
    
    // Set default values from config options
    props.configOptions.forEach(option => {
      if (localConfig.value[option.key] === undefined) {
        localConfig.value[option.key] = option.value
      }
    })
  }
}, { immediate: true })

// Methods
const closeModal = () => {
  emit('close')
}

const saveConfig = () => {
  emit('save', { ...localConfig.value })
  closeModal()
}
</script>

<style scoped>
/* Additional styles if needed */
</style>