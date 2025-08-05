<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
        </div>
        
        <h3 class="text-lg font-medium text-gray-900 text-center mb-2">
          {{ messages.title }}
        </h3>
        
        <p class="text-sm text-gray-500 text-center mb-4">
          {{ messages.message }}
          <span v-if="client" class="font-medium text-gray-900">
            {{ client.first_name }} {{ client.last_name }}
          </span>
          ?
        </p>
        
        <!-- Champ de saisie du mot de passe -->
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            {{ messages.passwordLabel || 'Confirmez votre mot de passe' }}
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            :placeholder="messages.passwordPlaceholder || 'Entrez votre mot de passe'"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            :class="{ 'border-red-500': passwordError }"
            @keyup.enter="handleConfirm"
          />
          <p v-if="passwordError" class="mt-1 text-sm text-red-600">
            {{ passwordError }}
          </p>
        </div>
        
        <div class="flex justify-center space-x-3">
          <button
            type="button"
            @click="$emit('cancel')"
            :disabled="isDeleting"
            class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ messages.cancelButton }}
          </button>
          
          <button
            type="button"
            @click="handleConfirm"
            :disabled="isDeleting || !password.trim()"
            class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isDeleting" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ messages.deleting }}
            </span>
            <span v-else>
              {{ messages.confirmButton }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'DeleteModal',
  components: {
    ExclamationTriangleIcon
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    client: {
      type: Object,
      default: null
    },
    isDeleting: {
      type: Boolean,
      default: false
    },
    messages: {
      type: Object,
      required: true
    }
  },
  emits: ['confirm', 'cancel'],
  setup(props, { emit }) {
    const password = ref('')
    const passwordError = ref('')
    
    // Réinitialiser les champs quand la modale se ferme
    watch(() => props.show, (newValue) => {
      if (!newValue) {
        password.value = ''
        passwordError.value = ''
      }
    })
    
    const handleConfirm = () => {
      if (!password.value.trim()) {
        passwordError.value = 'Le mot de passe est requis pour confirmer la suppression'
        return
      }
      
      passwordError.value = ''
      emit('confirm', password.value)
    }
    
    return {
      password,
      passwordError,
      handleConfirm
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