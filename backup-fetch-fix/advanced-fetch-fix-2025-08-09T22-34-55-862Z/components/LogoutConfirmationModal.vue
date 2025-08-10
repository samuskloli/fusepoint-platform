<template>
  <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <!-- Overlay -->
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeModal"></div>

      <!-- Modal panel -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      
      <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
            <!-- Warning icon -->
            <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              Utilisateur déjà connecté
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Vous êtes actuellement connecté sur le compte <strong>{{ currentUserEmail }}</strong>.
              </p>
              <p class="text-sm text-gray-500 mt-2">
                Voulez-vous vous déconnecter pour créer le mot de passe du nouveau compte ?
              </p>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
            @click="confirmLogout"
            :disabled="loading"
          >
            <span v-if="loading" class="mr-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? 'Déconnexion...' : 'Se déconnecter' }}
          </button>
          <button
            type="button"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200"
            @click="closeModal"
            :disabled="loading"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService'

export default {
  name: 'LogoutConfirmationModal',
  props: {
    showModal: {
      type: Boolean,
      default: false
    },
    currentUserEmail: {
      type: String,
      default: ''
    }
  },
  emits: ['close', 'logout-confirmed'],
  data() {
    return {
      loading: false
    }
  },
  methods: {
    closeModal() {
      if (!this.loading) {
        this.$emit('close')
      }
    },
    async confirmLogout() {
      this.loading = true
      try {
        // Déconnecter l'utilisateur actuel
        await authService.logout()
        
        // Émettre l'événement de confirmation
        this.$emit('logout-confirmed')
        
        // Fermer la modal
        this.$emit('close')
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
        // Même en cas d'erreur, on procède à la déconnexion locale
        authService.clearTokens()
        authService.clearUser()
        authService.clearCompanies()
        
        this.$emit('logout-confirmed')
        this.$emit('close')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>