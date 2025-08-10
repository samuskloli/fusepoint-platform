<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <!-- Modal de confirmation de déconnexion -->
    <LogoutConfirmationModal 
      :showModal="showLogoutModal" 
      :currentUserEmail="currentUserEmail"
      @close="showLogoutModal = false"
      @logout-confirmed="onLogoutConfirmed"
    />
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center">
        <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Confirmation de compte
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- État de chargement -->
        <div v-if="loading" class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Confirmation en cours...</p>
        </div>

        <!-- Succès -->
        <div v-else-if="success" class="text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="mt-4 text-lg font-medium text-gray-900">Compte confirmé !</h3>
          <p class="mt-2 text-gray-600">Votre compte a été activé avec succès.</p>
          <div class="mt-6">
            <router-link
              to="/login"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Se connecter
            </router-link>
          </div>
        </div>

        <!-- Erreur -->
        <div v-else-if="error" class="text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h3 class="mt-4 text-lg font-medium text-gray-900">Erreur de confirmation</h3>
          <p class="mt-2 text-gray-600">{{ errorMessage }}</p>
          
          <!-- Formulaire de renvoi d'email -->
          <div class="mt-6">
            <div class="space-y-4">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">
                  Adresse email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  v-model="resendEmail"
                  class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="votre@email.com"
                />
              </div>
              <button
                @click="resendConfirmation"
                :disabled="resendLoading || !resendEmail"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="resendLoading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </span>
                <span v-else>Renvoyer l'email de confirmation</span>
              </button>
            </div>
            
            <!-- Message de succès du renvoi -->
            <div v-if="resendSuccess" class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              Email de confirmation renvoyé avec succès !
            </div>
            
            <!-- Message d'erreur du renvoi -->
            <div v-if="resendError" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {{ resendErrorMessage }}
            </div>
          </div>
          
          <div class="mt-6">
            <router-link
              to="/login"
              class="text-blue-600 hover:text-blue-500 text-sm"
            >
              Retour à la connexion
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import authService from '@/services/authService'
import LogoutConfirmationModal from '@/components/LogoutConfirmationModal.vue'

export default {
  name: 'ConfirmAccount',
  components: {
    LogoutConfirmationModal
  },
  data() {
    return {
      loading: true,
      success: false,
      error: false,
      errorMessage: '',
      resendEmail: '',
      resendLoading: false,
      resendSuccess: false,
      resendError: false,
      resendErrorMessage: '',
      showLogoutModal: false,
      currentUserEmail: '',
      userWasLoggedIn: false,
      confirmationToken: null
    }
  },
  async mounted() {
    const token = this.$route.query.token
    
    if (!token) {
      this.loading = false
      this.error = true
      this.errorMessage = 'Token de confirmation manquant'
      return
    }
    
    this.confirmationToken = token
    
    // Vérifier si un utilisateur est déjà connecté
    this.checkCurrentUser()
    
    // Si aucun utilisateur connecté, procéder directement à la confirmation
    if (!this.userWasLoggedIn) {
      await this.confirmAccount(token)
    }
  },
  methods: {
    checkCurrentUser() {
      // Vérifier si un utilisateur est connecté
      const isAuthenticated = authService.isAuthenticated()
      const currentUser = authService.getUser()
      
      if (isAuthenticated && currentUser && currentUser.email) {
        this.currentUserEmail = currentUser.email
        this.userWasLoggedIn = true
        this.showLogoutModal = true
        this.loading = false // Arrêter le loading pour afficher la modal
      }
    },
    
    async onLogoutConfirmed() {
      // L'utilisateur a confirmé la déconnexion, procéder à la confirmation du compte
      this.userWasLoggedIn = false
      this.loading = true
      await this.confirmAccount(this.confirmationToken)
    },
    
    async confirmAccount(token) {
      try {
        const response = await axios.get(`/api/auth/confirm/${token}`)
        
        if (response.data.success) {
          this.success = true
        } else {
          this.error = true
          this.errorMessage = response.data.message || 'Erreur de confirmation'
        }
      } catch (error) {
        this.error = true
        if (error.response && error.response.data && error.response.data.error) {
          this.errorMessage = error.response.data.error
        } else {
          this.errorMessage = 'Erreur de connexion au serveur'
        }
      } finally {
        this.loading = false
      }
    },
    
    async resendConfirmation() {
      if (!this.resendEmail) return
      
      this.resendLoading = true
      this.resendSuccess = false
      this.resendError = false
      
      try {
        const response = await axios.post('/api/auth/resend-confirmation', {
          email: this.resendEmail
        })
        
        if (response.data.success) {
          this.resendSuccess = true
        } else {
          this.resendError = true
          this.resendErrorMessage = response.data.message || 'Erreur lors du renvoi'
        }
      } catch (error) {
        this.resendError = true
        if (error.response && error.response.data && error.response.data.error) {
          this.resendErrorMessage = error.response.data.error
        } else {
          this.resendErrorMessage = 'Erreur de connexion au serveur'
        }
      } finally {
        this.resendLoading = false
      }
    }
  }
}
</script>