<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0"
      :class="{ '-translate-x-full': !sidebarOpen, 'translate-x-0': sidebarOpen }"
    >
      <Sidebar @close-sidebar="sidebarOpen = false" />
    </div>

    <!-- Overlay for mobile -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Configuration content -->
      <main class="flex-1 overflow-y-auto p-6">
        <div class="max-w-4xl mx-auto">
          <!-- Page Header -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Configuration IA</h1>
            <p class="text-gray-600">Configurez votre connexion OpenAI pour activer l'intelligence artificielle avancée</p>
          </div>

          <!-- Status Card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-900">État de la connexion IA</h2>
              <div class="flex items-center space-x-2">
                <div :class="[
                  'w-3 h-3 rounded-full',
                  connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 
                  connectionStatus === 'testing' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'
                ]"></div>
                <span :class="[
                  'text-sm font-medium',
                  connectionStatus === 'connected' ? 'text-green-600' : 
                  connectionStatus === 'testing' ? 'text-yellow-600' : 'text-red-600'
                ]">
                  {{ getStatusText() }}
                </span>
              </div>
            </div>
            
            <div v-if="connectionStatus === 'disconnected'" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-yellow-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <div>
                  <h3 class="text-sm font-medium text-yellow-800">IA non configurée</h3>
                  <p class="text-sm text-yellow-700 mt-1">Configurez votre clé API OpenAI pour activer les fonctionnalités IA avancées.</p>
                </div>
              </div>
            </div>

            <div v-else-if="connectionStatus === 'connected'" class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-green-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <div>
                  <h3 class="text-sm font-medium text-green-800">IA connectée</h3>
                  <p class="text-sm text-green-700 mt-1">Votre assistant IA est opérationnel et prêt à vous aider.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Messages d'erreur et de succès -->
          <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <div>
                <h3 class="text-sm font-medium text-red-800">Erreur</h3>
                <p class="text-sm text-red-700 mt-1">{{ errorMessage }}</p>
              </div>
            </div>
          </div>

          <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-green-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <div>
                <h3 class="text-sm font-medium text-green-800">Succès</h3>
                <p class="text-sm text-green-700 mt-1">{{ successMessage }}</p>
              </div>
            </div>
          </div>

          <!-- Configuration Form -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Configuration OpenAI</h2>
            
            <form @submit.prevent="saveConfiguration" novalidate>
              <!-- Configuration Info -->
              <div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div class="flex items-center">
                  <i class="fas fa-check-circle text-green-600 mr-2"></i>
                  <span class="text-green-800 font-medium">Clé API OpenAI configurée côté serveur</span>
                </div>
                <p class="text-sm text-green-700 mt-1">
                  La clé API est sécurisée et gérée automatiquement par le serveur.
                </p>
              </div>

              <!-- Model Selection -->
              <div class="mb-6">
                <label for="model" class="block text-sm font-medium text-gray-700 mb-2">
                  Modèle IA
                </label>
                <select
                  id="model"
                  v-model="config.model"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Recommandé)</option>
                  <option value="gpt-4">GPT-4 (Plus avancé)</option>
                  <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                </select>
                <p class="text-sm text-gray-500 mt-1">
                  GPT-3.5 Turbo offre le meilleur rapport qualité/prix pour la plupart des usages
                </p>
              </div>

              <!-- Temperature -->
              <div class="mb-6">
                <label for="temperature" class="block text-sm font-medium text-gray-700 mb-2">
                  Créativité ({{ config.temperature }})
                </label>
                <input
                  id="temperature"
                  v-model.number="config.temperature"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Précis</span>
                  <span>Équilibré</span>
                  <span>Créatif</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex space-x-4">
                <button
                  type="button"
                  @click="testConnection"
                  :disabled="isTesting"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <svg v-if="isTesting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{{ isTesting ? 'Test en cours...' : 'Tester la connexion' }}</span>
                </button>
                
                <button
                  type="submit"
                  :disabled="isLoading"
                  class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>

          <!-- Info Section -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h3 class="text-lg font-semibold text-blue-900 mb-3">Configuration IA Simplifiée</h3>
            <div class="space-y-2 text-blue-800">
              <div class="flex items-center">
                <i class="fas fa-shield-alt text-blue-600 mr-2"></i>
                <span>Clé API sécurisée côté serveur</span>
              </div>
              <div class="flex items-center">
                <i class="fas fa-cog text-blue-600 mr-2"></i>
                <span>Configuration automatique</span>
              </div>
              <div class="flex items-center">
                <i class="fas fa-rocket text-blue-600 mr-2"></i>
                <span>Prêt à utiliser immédiatement</span>
              </div>
            </div>
            <p class="text-sm text-blue-700 mt-3">
              <strong>Note :</strong> Votre IA est maintenant configurée et sécurisée. Vous pouvez commencer à l'utiliser directement.
            </p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'
import aiChatService from '../services/aiChatService.js'
import aiConfigService from '../services/aiConfigService'

export default {
  name: 'AIConfigPage',
  components: {
    Sidebar,
    Header
  },
  data() {
    return {
      sidebarOpen: false,
      showApiKey: false,
      isLoading: false,
      isTesting: false,
      connectionStatus: 'disconnected', // 'disconnected', 'testing', 'connected'
      errorMessage: '',
      successMessage: '',
      config: {
        apiKey: '',
        model: 'gpt-3.5-turbo',
        temperature: 0.7
      },
      availableModels: []
    }
  },
  async mounted() {
    this.availableModels = aiConfigService.getAvailableModels();
    await this.checkCurrentStatus();
  },
  methods: {
    async checkCurrentStatus() {
      try {
        const status = await aiConfigService.getStatus();
        if (status.isConfigured) {
          this.connectionStatus = 'connected';
          this.config.model = status.model;
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
      }
    },
    
    async testConnection() {
      this.isTesting = true
      this.connectionStatus = 'testing'
      this.clearMessages()
      
      try {
        const result = await aiConfigService.testConnection(this.config.model)
        console.log('Résultat test connexion:', result)
        this.connectionStatus = 'connected'
        this.showSuccess('Connexion IA réussie !')
      } catch (error) {
        console.error('Erreur test connexion:', error)
        this.connectionStatus = 'disconnected'
        this.showError(error.message || 'Erreur de connexion au serveur IA.')
      } finally {
        this.isTesting = false
      }
    },
    
    async saveConfiguration() {
      this.isLoading = true
      this.clearMessages()
      
      try {
        // Configurer l'IA
        const result = await aiConfigService.configure({
          model: this.config.model,
          temperature: this.config.temperature
        })
        console.log('Résultat configuration:', result)
        
        this.showSuccess('Configuration sauvegardée avec succès !')
        this.connectionStatus = 'connected'
        
        // Rediriger vers la page de chat après un délai
        setTimeout(() => {
          this.$router.push('/chat')
        }, 2000)
      } catch (error) {
        console.error('Erreur sauvegarde:', error)
        this.showError(error.message || 'Erreur lors de la sauvegarde de la configuration')
        this.connectionStatus = 'disconnected'
      } finally {
        this.isLoading = false
      }
    },
    
    getStatusText() {
      switch (this.connectionStatus) {
        case 'connected': return 'Connecté'
        case 'testing': return 'Test en cours...'
        case 'disconnected': return 'Non configuré'
        default: return 'Inconnu'
      }
    },
    
    goToChat() {
      this.$router.push('/chat')
    },
    
    clearMessages() {
      this.errorMessage = ''
      this.successMessage = ''
    },
    
    showError(message) {
      this.errorMessage = message
      this.successMessage = ''
      // Effacer le message d'erreur après 5 secondes
      setTimeout(() => {
        this.errorMessage = ''
      }, 5000)
    },
    
    showSuccess(message) {
      this.successMessage = message
      this.errorMessage = ''
      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        this.successMessage = ''
      }, 3000)
    }
  }
}
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
  border: none;
}
</style>