<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- En-tête de la modal -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Attribuer un agent</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Informations du client -->
        <div v-if="client" class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Client sélectionné :</h4>
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-600 font-medium text-xs">
                {{ getInitials(client.first_name, client.last_name) }}
              </span>
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ client.first_name }} {{ client.last_name }}</p>
              <p class="text-sm text-gray-500">{{ client.email }}</p>
            </div>
          </div>
        </div>
        
        <!-- Liste des agents -->
        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-700 mb-3">Agents disponibles :</h4>
          
          <!-- État de chargement -->
          <div v-if="loading" class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span class="ml-2 text-gray-600">Chargement des agents...</span>
          </div>
          
          <!-- Aucun agent disponible -->
          <div v-else-if="agents.length === 0" class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun agent disponible</h3>
            <p class="mt-1 text-sm text-gray-500">Il n'y a actuellement aucun agent disponible pour l'assignation.</p>
          </div>
          
          <!-- Liste des agents -->
          <div v-else class="space-y-3 max-h-96 overflow-y-auto">
            <AgentCard
              v-for="agent in agents"
              :key="agent.id"
              :agent="agent"
              :disabled="assigning"
              :action-label="assigning ? 'Attribution...' : 'Attribuer'"
              :show-stats="true"
              @select="handleAssignAgent"
            >
              <template #actions="{ agent }">
                <button
                  @click="handleAssignAgent(agent)"
                  :disabled="assigning"
                  class="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg v-if="assigning" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{{ assigning ? 'Attribution...' : 'Attribuer' }}</span>
                </button>
              </template>
            </AgentCard>
          </div>
        </div>
        
        <!-- Actions de la modal -->
        <div class="flex justify-end space-x-3 pt-4 border-t">
          <button
            @click="$emit('close')"
            :disabled="assigning"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AgentCard from './AgentCard.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  client: {
    type: Object,
    default: null
  },
  agents: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  assigning: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'assign'])

const getInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return '?'
  const first = firstName ? firstName.charAt(0).toUpperCase() : ''
  const last = lastName ? lastName.charAt(0).toUpperCase() : ''
  return first + last
}

const handleAssignAgent = (agent) => {
  emit('assign', agent)
}
</script>

<style scoped>
/* Styles spécifiques si nécessaire */
</style>