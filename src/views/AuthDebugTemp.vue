<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Debug Authentification</h1>
    
    <div class="grid gap-6">
      <!-- État de l'authentification -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">État de l'authentification</h2>
        <div class="space-y-2">
          <div>
            <span class="font-medium">Authentifié:</span>
            <span :class="isAuthenticated ? 'text-green-600' : 'text-red-600'">
              {{ isAuthenticated ? 'Oui' : 'Non' }}
            </span>
          </div>
          <div>
            <span class="font-medium">Token expiré:</span>
            <span :class="isTokenExpired ? 'text-red-600' : 'text-green-600'">
              {{ isTokenExpired ? 'Oui' : 'Non' }}
            </span>
          </div>
          <div>
            <span class="font-medium">Expiration:</span>
            <span class="text-gray-600">{{ tokenExpiration || 'Non définie' }}</span>
          </div>
        </div>
      </div>

      <!-- Tokens -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Tokens</h2>
        <div class="space-y-2 text-sm">
          <div>
            <span class="font-medium">Access Token:</span>
            <div class="break-all text-gray-600 font-mono">
              {{ accessToken ? accessToken.substring(0, 100) + '...' : 'Aucun' }}
            </div>
          </div>
          <div>
            <span class="font-medium">Refresh Token:</span>
            <div class="break-all text-gray-600 font-mono">
              {{ refreshToken ? refreshToken.substring(0, 50) + '...' : 'Aucun' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Utilisateur -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Utilisateur</h2>
        <pre class="text-sm bg-gray-100 p-3 rounded overflow-auto">{{ JSON.stringify(user, null, 2) }}</pre>
      </div>

      <!-- Test API -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Test API</h2>
        <div class="space-y-4">
          <button 
            @click="testAccompagnementAPI" 
            :disabled="loading"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {{ loading ? 'Test en cours...' : 'Tester API Accompagnement' }}
          </button>
          
          <div v-if="apiResult" class="mt-4">
            <h3 class="font-medium mb-2">Résultat du test:</h3>
            <pre class="text-sm bg-gray-100 p-3 rounded overflow-auto">{{ JSON.stringify(apiResult, null, 2) }}</pre>
          </div>
          
          <div v-if="apiError" class="mt-4">
            <h3 class="font-medium mb-2 text-red-600">Erreur API:</h3>
            <pre class="text-sm bg-red-100 p-3 rounded overflow-auto text-red-800">{{ apiError }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService'
import { accompagnementService } from '@/services/accompagnementService'

export default {
  name: 'AuthDebugTemp',
  data() {
    return {
      loading: false,
      apiResult: null,
      apiError: null
    }
  },
  computed: {
    isAuthenticated() {
      return authService.isAuthenticated()
    },
    isTokenExpired() {
      return authService.isTokenExpired()
    },
    accessToken() {
      return localStorage.getItem('accessToken')
    },
    refreshToken() {
      return localStorage.getItem('refreshToken')
    },
    tokenExpiration() {
      const expiry = localStorage.getItem('tokenExpiresAt')
      if (expiry) {
        return new Date(expiry).toLocaleString('fr-FR')
      }
      return null
    },
    user() {
      return authService.getUser()
    }
  },
  methods: {
    async testAccompagnementAPI() {
      this.loading = true
      this.apiResult = null
      this.apiError = null
      
      try {
        console.log('🧪 Test de l\'API accompagnement...')
        const result = await accompagnementService.getServices()
        this.apiResult = result
        console.log('✅ Test API réussi:', result)
      } catch (error) {
        console.error('❌ Test API échoué:', error)
        this.apiError = {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>