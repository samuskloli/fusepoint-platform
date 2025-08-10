<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ isEditing ? messages.editTitle : messages.createTitle }}
        </h3>
        
        <form @submit.prevent="handleSave">
          <div class="space-y-4">
            <!-- Prénom -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ messages.firstNameLabel }}
              </label>
              <input
                v-model="localClient.first_name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': validationErrors.first_name }"
              />
              <p v-if="validationErrors.first_name" class="mt-1 text-sm text-red-600">
                {{ validationErrors.first_name }}
              </p>
            </div>
            
            <!-- Nom -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ messages.lastNameLabel }}
              </label>
              <input
                v-model="localClient.last_name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': validationErrors.last_name }"
              />
              <p v-if="validationErrors.last_name" class="mt-1 text-sm text-red-600">
                {{ validationErrors.last_name }}
              </p>
            </div>
            
            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ messages.emailLabel }}
              </label>
              <input
                v-model="localClient.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': validationErrors.email }"
              />
              <p v-if="validationErrors.email" class="mt-1 text-sm text-red-600">
                {{ validationErrors.email }}
              </p>
            </div>
            
            <!-- Téléphone -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ messages.phoneLabel }}
              </label>
              <input
                v-model="localClient.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': validationErrors.phone }"
              />
              <p v-if="validationErrors.phone" class="mt-1 text-sm text-red-600">
                {{ validationErrors.phone }}
              </p>
            </div>
            
            <!-- Entreprise -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ messages.companyLabel }}
              </label>
              <input
                v-model="localClient.company"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': validationErrors.company }"
              />
              <p v-if="validationErrors.company" class="mt-1 text-sm text-red-600">
                {{ validationErrors.company }}
              </p>
            </div>
            
            <!-- Statut -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ messages.statusLabel }}
              </label>
              <select
                v-model="localClient.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">{{ messages.statusActive }}</option>
                <option value="inactive">{{ messages.statusInactive }}</option>
              </select>
            </div>
            
            <!-- Dernière connexion (en lecture seule, uniquement en mode édition) -->
            <div v-if="isEditing && localClient.last_login">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ messages.lastLoginLabel || 'Dernière connexion' }}
              </label>
              <input
                :value="formatLastLogin(localClient.last_login)"
                type="text"
                readonly
                class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>
          
          <!-- Boutons d'action -->
          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="$emit('close')"
              :disabled="isSaving"
              class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ messages.cancelButton }}
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSaving" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ messages.saving }}
              </span>
              <span v-else>
                {{ isEditing ? messages.editButton : messages.createButton }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'ClientModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    client: {
      type: Object,
      default: () => ({})
    },
    isEditing: {
      type: Boolean,
      default: false
    },
    validationErrors: {
      type: Object,
      default: () => ({})
    },
    isSaving: {
      type: Boolean,
      default: false
    },
    messages: {
      type: Object,
      required: true
    }
  },
  emits: ['save', 'close'],
  setup(props, { emit }) {
    const localClient = ref({ ...props.client })
    
    // Synchroniser les données locales avec les props
    watch(
      () => props.client,
      (newClient) => {
        localClient.value = { ...newClient }
      },
      { deep: true, immediate: true }
    )
    
    // Émettre les changements vers le parent sans muter les props
    const handleSave = () => {
      console.log('🔄 ClientModal - handleSave appelé');
      console.log('🔄 ClientModal - localClient.value:', localClient.value);
      console.log('🔄 ClientModal - Type:', typeof localClient.value);
      console.log('🔄 ClientModal - Clés:', Object.keys(localClient.value));
      console.log('🔄 ClientModal - first_name:', localClient.value.first_name);
      console.log('🔄 ClientModal - last_name:', localClient.value.last_name);
      emit('save', localClient.value)
    }
    
    // Formater la date de dernière connexion
    const formatLastLogin = (lastLogin) => {
      if (!lastLogin) return 'Jamais connecté'
      
      const date = new Date(lastLogin)
      if (isNaN(date.getTime())) return 'Date invalide'
      
      const now = new Date()
      const diffInMs = now - date
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
      
      if (diffInDays === 0) {
        return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
      } else if (diffInDays === 1) {
        return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
      } else if (diffInDays < 7) {
        return `Il y a ${diffInDays} jours`
      } else {
        return date.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    }
    
    return {
      localClient,
      handleSave,
      formatLastLogin
    }
  }
}
</script>

<style scoped>
/* Animation du spinner */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>