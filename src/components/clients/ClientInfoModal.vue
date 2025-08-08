<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    @click="$emit('close')"
  >
    <div
      class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white"
      @click.stop
    >
      <!-- En-tête de la modale -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <!-- Avatar du client -->
          <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <span class="text-lg font-medium text-blue-600">
              {{ getInitials(client.first_name, client.last_name) }}
            </span>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">
              {{ client.first_name }} {{ client.last_name }}
            </h3>
            <p class="text-sm text-gray-500">{{ messages.clientDetails }}</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <!-- Bouton d'édition -->
          <button
            @click="$emit('edit', client)"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {{ messages.edit }}
          </button>
          <!-- Bouton de fermeture -->
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Contenu de la modale -->
      <div class="mt-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Informations personnelles -->
          <div class="space-y-4">
            <h4 class="text-sm font-medium text-gray-900 uppercase tracking-wide">{{ messages.personalInfo }}</h4>
            
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ messages.firstName }}</label>
                <p class="mt-1 text-sm text-gray-900">{{ client.first_name || '-' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ messages.lastName }}</label>
                <p class="mt-1 text-sm text-gray-900">{{ client.last_name || '-' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ messages.email }}</label>
                <p class="mt-1 text-sm text-gray-900">{{ client.email || '-' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ messages.phone }}</label>
                <p class="mt-1 text-sm text-gray-900">{{ client.phone || '-' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ messages.company }}</label>
                <p class="mt-1 text-sm text-gray-900">{{ client.company || '-' }}</p>
              </div>
            </div>
          </div>

          <!-- Informations système -->
          <div class="space-y-4">
            <h4 class="text-sm font-medium text-gray-900 uppercase tracking-wide">{{ messages.systemInfo }}</h4>
            
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ messages.status }}</label>
                <div class="mt-1">
                  <ClientStatusBadge :client="client" :messages="messages" />
                </div>
              </div>
              
              <div v-if="client.assigned_agent">
                <label class="block text-sm font-medium text-gray-700">{{ messages.assignedAgent }}</label>
                <div class="mt-1 flex items-center space-x-2">
                  <div class="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                    <span class="text-xs font-medium text-green-600">
                      {{ getInitials(client.assigned_agent.first_name, client.assigned_agent.last_name) }}
                    </span>
                  </div>
                  <span class="text-sm text-gray-900">
                    {{ client.assigned_agent.first_name }} {{ client.assigned_agent.last_name }}
                  </span>
                </div>
              </div>
              <div v-else>
                <label class="block text-sm font-medium text-gray-700">{{ messages.assignedAgent }}</label>
                <p class="mt-1 text-sm text-gray-500">{{ messages.noAgentAssigned }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ messages.createdAt }}</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(client.created_at) }}</p>
              </div>
              
              <div v-if="client.last_login">
                <label class="block text-sm font-medium text-gray-700">{{ messages.lastLogin }}</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatLastLogin(client.last_login) }}</p>
              </div>
              <div v-else>
                <label class="block text-sm font-medium text-gray-700">{{ messages.lastLogin }}</label>
                <p class="mt-1 text-sm text-gray-500">{{ messages.neverConnected }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions de la modale -->
      <div class="mt-8 flex items-center justify-between pt-4 border-t border-gray-200">
        <div class="flex items-center space-x-3">
          <!-- Actions rapides -->
          <button
            @click="$emit('sendEmail', client)"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {{ messages.sendEmail }}
          </button>
          
          <button
            @click="$emit('assignAgent', client)"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {{ messages.assignAgent }}
          </button>
          
          <button
            @click="$emit('changePassword', client)"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            {{ messages.changePassword || 'Modifier mot de passe' }}
          </button>
        </div>
        
        <div class="flex items-center space-x-3">
          <button
            @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {{ messages.close }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ClientStatusBadge from './ClientStatusBadge.vue'

export default {
  name: 'ClientInfoModal',
  components: {
    ClientStatusBadge
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    client: {
      type: Object,
      default: () => ({})
    },
    messages: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'edit', 'sendEmail', 'assignAgent', 'changePassword'],
  methods: {
    getInitials(firstName, lastName) {
      const first = firstName && firstName.length > 0 ? firstName[0] : '?'
      const last = lastName && lastName.length > 0 ? lastName[0] : '?'
      return `${first}${last}`.toUpperCase()
    },
    
    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    formatLastLogin(dateString) {
      if (!dateString) return this.messages.neverConnected
      
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        return 'Aujourd\'hui'
      } else if (diffDays === 2) {
        return 'Hier'
      } else if (diffDays <= 7) {
        return `Il y a ${diffDays - 1} jours`
      } else {
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      }
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques à la modale d'information */
</style>