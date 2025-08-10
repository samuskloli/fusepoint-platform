<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <!-- Modal de confirmation de déconnexion -->
    <LogoutConfirmationModal 
      :showModal="showLogoutModal" 
      :currentUserEmail="currentUserEmail"
      @close="showLogoutModal = false"
      @logout-confirmed="onLogoutConfirmed"
    />
    
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <!-- Logo Fusepoint Hub -->
        <div class="mx-auto h-16 w-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
          <span class="text-white font-bold text-xl">F</span>
        </div>
        
        <!-- Titre avec branding -->
        <h1 class="mt-6 text-center text-2xl font-bold text-gray-900">
          <span class="text-blue-600">Fusepoint Hub</span>
        </h1>
        <h2 class="mt-2 text-center text-xl font-semibold text-gray-700">
          Définir votre mot de passe
        </h2>
        <p class="mt-3 text-center text-sm text-gray-600">
          Créez un mot de passe sécurisé pour accéder à votre espace client
        </p>
      </div>
      
      <form class="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-200" @submit.prevent="setPassword">
        <div class="space-y-4">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              v-model="password"
              required
              class="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 sm:text-sm"
              placeholder="Entrez votre mot de passe"
            />
            <p class="mt-2 text-xs text-gray-500 flex items-center">
              <svg class="w-3 h-3 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              Le mot de passe doit contenir au moins 8 caractères
            </p>
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              v-model="confirmPassword"
              required
              class="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 sm:text-sm"
              placeholder="Confirmez votre mot de passe"
            />
          </div>
        </div>
        
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-800">{{ error }}</p>
            </div>
          </div>
        </div>
        
        <div class="pt-4">
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? 'Définition en cours...' : 'Accéder à Fusepoint Hub' }}
          </button>
        </div>
      </form>
      
      <!-- Footer -->
      <div class="text-center mt-8">
        <p class="text-xs text-gray-500">
          © 2025 Fusepoint Hub - Plateforme Marketing Intelligente
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import authService from '@/services/authService'
import LogoutConfirmationModal from '@/components/LogoutConfirmationModal.vue'

export default {
  name: 'SetPassword',
  components: {
    LogoutConfirmationModal
  },
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      password: '',
      confirmPassword: '',
      loading: false,
      error: null,
      token: null,
      showLogoutModal: false,
      currentUserEmail: '',
      userWasLoggedIn: false
    }
  },
  mounted() {
    // Récupérer le token depuis l'URL
    this.token = this.$route.query.token
    
    if (!this.token) {
      this.error = 'Token manquant ou invalide'
      return
    }
    
    // Vérifier si un utilisateur est déjà connecté
    this.checkCurrentUser()
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
      }
    },
    
    onLogoutConfirmed() {
      // L'utilisateur a confirmé la déconnexion, on peut maintenant procéder
      this.userWasLoggedIn = false
      console.log('Utilisateur déconnecté, prêt pour la création du mot de passe')
    },
    
    async setPassword() {
      this.error = null
      
      // Validation côté client
      if (!this.password || !this.confirmPassword) {
        this.error = 'Veuillez remplir tous les champs'
        return
      }
      
      if (this.password.length < 8) {
        this.error = 'Le mot de passe doit contenir au moins 8 caractères'
        return
      }
      
      if (this.password !== this.confirmPassword) {
        this.error = 'Les mots de passe ne correspondent pas'
        return
      }
      
      if (!this.token) {
        this.error = 'Token manquant ou invalide'
        return
      }
      
      this.loading = true
      
      try {
        const response = await axios.post('/api/auth/set-password', {
          token: this.token,
          password: this.password
        })
        
        if (response.data.success) {
          // Utiliser le service d'authentification pour gérer les tokens
          const { token: jwtToken, user } = response.data.data
          
          // Stocker les tokens via le service d'authentification
          authService.setTokens({
            accessToken: jwtToken,
            refreshToken: jwtToken, // Utiliser le même token pour le refresh
            sessionToken: jwtToken
          })
          authService.setUser(user)
          
          // Mettre à jour le store d'authentification
          this.authStore.initializeAuth()
          
          // Rediriger vers le dashboard
          this.$router.push('/dashboard')
        } else {
          this.error = response.data.message || 'Erreur lors de la définition du mot de passe'
        }
      } catch (error) {
        console.error('Erreur:', error)
        if (error.response && error.response.data && error.response.data.message) {
          this.error = error.response.data.message
        } else {
          this.error = 'Erreur lors de la définition du mot de passe'
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>