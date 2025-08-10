<template>
  <div class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm">
    <div class="flex items-center space-x-3">
      <!-- Avatar de l'agent -->
      <div class="flex-shrink-0">
        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span class="text-blue-600 font-medium text-sm">
            {{ getInitials(agent.first_name, agent.last_name) }}
          </span>
        </div>
      </div>
      
      <!-- Informations de l'agent -->
      <div class="flex-1 min-w-0">
        <p class="font-medium text-gray-900 truncate">
          {{ agent.first_name }} {{ agent.last_name }}
        </p>
        <p class="text-sm text-gray-500 truncate">
          {{ agent.email }}
        </p>
        <div v-if="showStats" class="flex items-center space-x-4 mt-1">
          <span v-if="agent.clients_count !== undefined" class="text-xs text-gray-400">
            {{ agent.clients_count }} clients
          </span>
          <span v-if="agent.status" class="text-xs" :class="getStatusClass(agent.status)">
            {{ getStatusLabel(agent.status) }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Actions -->
    <div class="flex items-center space-x-2">
      <slot name="actions" :agent="agent">
        <!-- Action par défaut -->
        <button
          @click="$emit('select', agent)"
          :disabled="disabled"
          class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {{ actionLabel }}
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  agent: {
    type: Object,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  actionLabel: {
    type: String,
    default: 'Sélectionner'
  },
  showStats: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])

const getInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return '?'
  const first = firstName ? firstName.charAt(0).toUpperCase() : ''
  const last = lastName ? lastName.charAt(0).toUpperCase() : ''
  return first + last
}

const getStatusClass = (status) => {
  switch (status) {
    case 'active':
      return 'text-green-600'
    case 'busy':
      return 'text-orange-600'
    case 'offline':
      return 'text-gray-600'
    default:
      return 'text-gray-600'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'active':
      return 'Disponible'
    case 'busy':
      return 'Occupé'
    case 'offline':
      return 'Hors ligne'
    default:
      return 'Inconnu'
  }
}
</script>

<style scoped>
/* Styles spécifiques si nécessaire */
</style>