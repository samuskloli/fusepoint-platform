<template>
  <div class="bg-white shadow rounded-lg overflow-hidden">
    <!-- État de chargement -->
    <div v-if="loading" class="p-8 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">{{ messages.loading }}</p>
    </div>
    
    <!-- État d'erreur -->
    <div v-else-if="error" class="p-8 text-center">
      <div class="text-red-500 mb-4">
        <ExclamationTriangleIcon class="h-12 w-12 mx-auto" />
      </div>
      <p class="text-gray-600">{{ error }}</p>
      <button
        @click="$emit('retry')"
        class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        {{ messages.retry }}
      </button>
    </div>
    
    <!-- Aucun client -->
    <div v-else-if="clients.length === 0" class="p-8 text-center">
      <div class="text-gray-400 mb-4">
        <UsersIcon class="h-12 w-12 mx-auto" />
      </div>
      <p class="text-gray-600">{{ messages.noClients }}</p>
      <p class="text-sm text-gray-500 mt-1">{{ messages.noClientsSubtext }}</p>
    </div>
    
    <!-- Tableau des clients -->
    <div v-else>
      <!-- En-tête du tableau -->
      <div class="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div class="grid grid-cols-12 gap-4 items-center">
          <!-- Sélection et nom -->
          <div class="col-span-4 flex items-center">
            <input
              type="checkbox"
              :checked="selectedClients.length === clients.length && clients.length > 0"
              @change="$emit('toggleAll')"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="ml-3 text-sm font-medium text-gray-700">
              {{ selectedClients.length > 0 ? `${selectedClients.length} ${messages.selected}` : 'Client' }}
            </span>
          </div>
          
          <!-- En-têtes de colonnes pour desktop -->
           <div class="hidden lg:contents">
             <div class="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Entreprise</div>
             <div class="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Agent attribué</div>
             <div class="col-span-1 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Statut</div>
             <div class="col-span-1 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Créé le</div>
             <div class="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Actions</div>
           </div>
        </div>
      </div>
      
      <!-- Corps du tableau -->
      <div class="divide-y divide-gray-200">
        <div
          v-for="client in clients"
          :key="client.id"
          class="px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
        >
          <div class="grid grid-cols-12 gap-4 items-center">
            <!-- Client info (checkbox + avatar + nom) -->
            <div class="col-span-4 flex items-center">
              <input
                type="checkbox"
                :checked="selectedClients.includes(client.id)"
                @change="$emit('selectClient', client.id)"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
              />
              
              <div class="ml-4 flex items-center min-w-0">
                <!-- Avatar -->
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-600">
                      {{ getInitials(client.first_name, client.last_name) }}
                    </span>
                  </div>
                </div>
                
                <!-- Informations principales -->
                <div class="ml-3 min-w-0">
                  <div class="text-sm font-medium text-gray-900 truncate">
                    {{ client.first_name }} {{ client.last_name }}
                  </div>
                  <div class="text-sm text-gray-500 truncate">
                    {{ client.email }}
                  </div>
                  <!-- Agent attribué (mobile) -->
                  <div class="lg:hidden mt-1">
                    <div v-if="client.assigned_agent" class="inline-flex items-center text-xs text-green-600">
                      <svg class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Agent: {{ client.assigned_agent.first_name }} {{ client.assigned_agent.last_name }}
                    </div>
                    <div v-else class="inline-flex items-center text-xs text-gray-400">
                      <svg class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Aucun agent attribué
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Colonnes pour desktop -->
            <div class="hidden lg:contents">
              <!-- Entreprise -->
              <div class="col-span-2 text-center">
                <div class="text-sm text-gray-900">
                  {{ client.company || messages.noCompany }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ client.phone || messages.noPhone }}
                </div>
              </div>
              
              <!-- Agent attribué -->
              <div class="col-span-2 text-center">
                <div v-if="client.assigned_agent" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <div class="flex items-center">
                    <div class="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center mr-1.5">
                      <span class="text-xs font-semibold text-green-700">
                        {{ getInitials(client.assigned_agent.first_name, client.assigned_agent.last_name) }}
                      </span>
                    </div>
                    <span class="truncate max-w-[80px]">
                      {{ client.assigned_agent.first_name }} {{ client.assigned_agent.last_name }}
                    </span>
                  </div>
                </div>
                <div v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Non attribué
                </div>
              </div>
              
              <!-- Statut -->
              <div class="col-span-1 text-center">
                <ClientStatusBadge :client="client" :messages="messages" />
              </div>
              
              <!-- Date de création -->
              <div class="col-span-1 text-center text-sm text-gray-500">
                {{ formatDate(client.created_at) }}
              </div>
              
              <!-- Actions -->
              <div class="col-span-2 text-center">
                <div class="flex items-center justify-center space-x-0.5 overflow-hidden">
                <!-- Attribuer un agent -->
                <button
                  @click="$emit('assignAgent', client)"
                  class="p-1.5 text-indigo-600 hover:text-indigo-800 rounded hover:bg-indigo-50 flex-shrink-0"
                  :title="messages.assignAgent"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
                
                <!-- Envoyer un email -->
                <button
                  @click="$emit('sendEmail', client)"
                  class="p-1.5 text-green-600 hover:text-green-800 rounded hover:bg-green-50 flex-shrink-0"
                  :title="messages.sendEmail"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
                
                <!-- Envoyer une notification -->
                <button
                  @click="$emit('sendNotification', client)"
                  class="p-1.5 text-yellow-600 hover:text-yellow-800 rounded hover:bg-yellow-50 flex-shrink-0"
                  :title="messages.sendNotification || 'Envoyer une notification'"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h5m5 0v5" />
                  </svg>
                </button>
                
                <!-- Envoyer un message -->
                <button
                  @click="$emit('sendMessage', client)"
                  class="p-1.5 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50 flex-shrink-0"
                  title="Envoyer message"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 21l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                </button>
                
                <!-- Activer/Désactiver -->
                <button
                  @click="$emit('toggleStatus', client)"
                  :class="[
                    'p-1.5 rounded flex-shrink-0',
                    (client.is_active === 1 || client.is_active === true)
                      ? 'text-red-600 hover:text-red-800 hover:bg-red-50' 
                      : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                  ]"
                  :title="(client.is_active === 1 || client.is_active === true) ? messages.deactivate : messages.activate"
                >
                  <svg v-if="client.is_active === 1 || client.is_active === true" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                  </svg>
                  <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                
                <!-- Supprimer -->
                <button
                  @click="$emit('deleteClient', client)"
                  class="p-1.5 text-red-600 hover:text-red-800 rounded hover:bg-red-50 flex-shrink-0"
                  :title="messages.deleteButton"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                </div>
              </div>
            </div>
            
            <!-- Actions pour mobile -->
            <div class="lg:hidden col-span-8 flex items-center justify-end space-x-1">
              <!-- Informations secondaires mobile -->
              <div class="sm:hidden mr-4 text-right">
                <div class="text-sm text-gray-900">
                  {{ client.company || messages.noCompany }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ client.phone || messages.noPhone }}
                </div>
              </div>
              
              <!-- Statut mobile -->
              <div class="mr-2">
                <ClientStatusBadge :client="client" :messages="messages" />
              </div>
              
              <!-- Actions mobiles -->
              <div class="flex items-center space-x-1">
                <!-- Attribuer un agent -->
                <button
                  @click="$emit('assignAgent', client)"
                  class="p-2 text-indigo-600 hover:text-indigo-800 rounded-md hover:bg-indigo-50"
                  :title="messages.assignAgent"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
                
                <!-- Envoyer un email -->
                <button
                  @click="$emit('sendEmail', client)"
                  class="p-2 text-green-600 hover:text-green-800 rounded-md hover:bg-green-50"
                  :title="messages.sendEmail"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
                
                <!-- Supprimer -->
                <button
                  @click="$emit('deleteClient', client)"
                  class="p-2 text-red-600 hover:text-red-800 rounded-md hover:bg-red-50"
                  :title="messages.deleteButton"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import ClientStatusBadge from './ClientStatusBadge.vue'
import ClientStatusMenu from './ClientStatusMenu.vue'

export default {
  name: 'ClientsTable',
  components: {
    ExclamationTriangleIcon,
    ClientStatusBadge,
    ClientStatusMenu
  },
  props: {
    clients: {
      type: Array,
      default: () => []
    },
    selectedClients: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    messages: {
      type: Object,
      required: true
    }
  },
  emits: ['toggleAll', 'selectClient', 'editClient', 'deleteClient', 'retry', 'assignAgent', 'sendEmail', 'sendNotification', 'sendMessage', 'toggleStatus', 'statusChange'],
  methods: {
    getInitials(firstName, lastName) {
      const first = firstName && firstName.length > 0 ? firstName[0] : '?'
      const last = lastName && lastName.length > 0 ? lastName[0] : '?'
      return `${first}${last}`.toUpperCase()
    },
    
    formatDate(dateString) {
      if (!dateString) return this.messages.never
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },
    
    handleStatusChange(client, newStatus) {
      this.$emit('statusChange', client, newStatus)
    }
  }
}
</script>

<style scoped>
/* Animations et transitions personnalisées */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>