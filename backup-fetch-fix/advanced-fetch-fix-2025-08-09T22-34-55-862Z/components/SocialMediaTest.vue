<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-lg font-semibold mb-4">Test de connexion réseaux sociaux</h3>
    
    <!-- Configuration Status -->
    <div class="mb-6">
      <h4 class="font-medium mb-2">État de la configuration :</h4>
      <div class="space-y-2">
        <div class="flex items-center space-x-2">
          <div :class="facebookConfigured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
               class="px-2 py-1 rounded text-sm">
            Facebook: {{ facebookConfigured ? 'Configuré' : 'Non configuré' }}
          </div>
          <span class="text-sm text-gray-600">{{ facebookStatus }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <div :class="instagramConfigured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
               class="px-2 py-1 rounded text-sm">
            Instagram: {{ instagramConfigured ? 'Configuré' : 'Non configuré' }}
          </div>
          <span class="text-sm text-gray-600">{{ instagramStatus }}</span>
        </div>
      </div>
    </div>

    <!-- Test Buttons -->
    <div class="space-y-3">
      <button 
        @click="testFacebookConnection"
        :disabled="!facebookConfigured || loading"
        class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Test en cours...' : 'Tester Facebook' }}
      </button>
      
      <button 
        @click="testInstagramConnection"
        :disabled="!instagramConfigured || loading"
        class="w-full bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Test en cours...' : 'Tester Instagram' }}
      </button>
    </div>

    <!-- Results -->
    <div v-if="testResult" class="mt-4 p-3 rounded" 
         :class="testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
      <h5 class="font-medium">Résultat du test :</h5>
      <p class="text-sm mt-1">{{ testResult.message }}</p>
      <pre v-if="testResult.details" class="text-xs mt-2 overflow-auto">{{ testResult.details }}</pre>
    </div>

    <!-- Debug Info -->
    <div class="mt-4 p-3 bg-gray-100 rounded">
      <h5 class="font-medium text-sm mb-2">Informations de debug :</h5>
      <div class="text-xs space-y-1">
        <div>Facebook App ID: {{ debugInfo.facebookAppId || 'Non défini' }}</div>
        <div>Instagram App ID: {{ debugInfo.instagramAppId || 'Non défini' }}</div>
        <div>URL actuelle: {{ debugInfo.currentUrl }}</div>
        <div>Environnement: {{ debugInfo.environment }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import facebookService from '../services/facebookService.js'
import instagramService from '../services/instagramService.js'

export default {
  name: 'SocialMediaTest',
  data() {
    return {
      loading: false,
      testResult: null,
      facebookService: facebookService,
      instagramService: instagramService
    }
  },
  computed: {
    facebookConfigured() {
      return !!(this.facebookService.appId && this.facebookService.appId !== 'your_facebook_app_id')
    },
    instagramConfigured() {
      return !!(this.instagramService.appId && this.instagramService.appId !== 'your_instagram_app_id')
    },
    facebookStatus() {
      if (!this.facebookService.appId) return 'App ID manquant'
      if (this.facebookService.appId === 'your_facebook_app_id') return 'Placeholder détecté'
      return `App ID: ${this.facebookService.appId.substring(0, 8)}...`
    },
    instagramStatus() {
      if (!this.instagramService.appId) return 'App ID manquant'
      if (this.instagramService.appId === 'your_instagram_app_id') return 'Placeholder détecté'
      return `App ID: ${this.instagramService.appId.substring(0, 8)}...`
    },
    debugInfo() {
      return {
        facebookAppId: this.facebookService.appId,
        instagramAppId: this.instagramService.appId,
        currentUrl: window.location.origin,
        environment: import.meta.env.MODE
      }
    }
  },
  methods: {
    async testFacebookConnection() {
      this.loading = true
      this.testResult = null
      
      try {
        // Test de génération d'URL d'authentification
        const authUrl = this.facebookService.generateAuthUrl()
        
        this.testResult = {
          success: true,
          message: 'Configuration Facebook valide - URL d\'authentification générée',
          details: `URL: ${authUrl}`
        }
        
        // Optionnel : ouvrir dans un nouvel onglet pour test
        // window.open(authUrl, '_blank')
        
      } catch (error) {
        this.testResult = {
          success: false,
          message: 'Erreur lors du test Facebook',
          details: error.message
        }
      } finally {
        this.loading = false
      }
    },
    
    async testInstagramConnection() {
      this.loading = true
      this.testResult = null
      
      try {
        // Test de génération d'URL d'authentification
        const authUrl = this.instagramService.generateAuthUrl()
        
        this.testResult = {
          success: true,
          message: 'Configuration Instagram valide - URL d\'authentification générée',
          details: `URL: ${authUrl}`
        }
        
        // Optionnel : ouvrir dans un nouvel onglet pour test
        // window.open(authUrl, '_blank')
        
      } catch (error) {
        this.testResult = {
          success: false,
          message: 'Erreur lors du test Instagram',
          details: error.message
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>