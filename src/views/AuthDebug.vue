<template>
  <div class="p-8 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Debug Authentification</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- État d'authentification -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">État d'authentification</h2>
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
            <span class="font-medium">Utilisateur présent:</span>
            <span :class="!!user ? 'text-green-600' : 'text-red-600'">
              {{ !!user ? 'Oui' : 'Non' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Tokens -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Tokens</h2>
        <div class="space-y-2 text-sm">
          <div>
            <span class="font-medium">Access Token:</span>
            <div class="break-all text-gray-600">
              {{ accessToken ? accessToken.substring(0, 50) + '...' : 'Aucun' }}
            </div>
          </div>
          <div>
            <span class="font-medium">Refresh Token:</span>
            <div class="break-all text-gray-600">
              {{ refreshToken ? refreshToken.substring(0, 50) + '...' : 'Aucun' }}
            </div>
          </div>
          <div>
            <span class="font-medium">Expiration:</span>
            <div class="text-gray-600">
              {{ tokenExpiration || 'Non définie' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Utilisateur -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Utilisateur</h2>
        <pre class="text-sm bg-gray-100 p-3 rounded overflow-auto">{{ JSON.stringify(user, null, 2) }}</pre>
      </div>

      <!-- LocalStorage -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">LocalStorage Auth</h2>
        <div class="space-y-2 text-sm">
          <div v-for="key in authKeys" :key="key">
            <span class="font-medium">{{ key }}:</span>
            <div class="break-all text-gray-600">
              {{ localStorage.getItem(key) || 'Non défini' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-8 space-x-4">
      <button 
        @click="testCurrentUser"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Tester getCurrentUser
      </button>
      <button 
        @click="clearAuth"
        class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Nettoyer Auth
      </button>
      <button 
        @click="refreshData"
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Actualiser
      </button>
    </div>

    <!-- Logs -->
    <div class="mt-8 bg-white p-6 rounded-lg shadow">
      <h2 class="text-lg font-semibold mb-4">Logs de test</h2>
      <div class="bg-gray-100 p-3 rounded max-h-64 overflow-auto">
        <div v-for="(log, index) in logs" :key="index" class="text-sm">
          <span class="text-gray-500">{{ log.time }}</span> - {{ log.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import authService from '@/services/authService'

export default {
  name: 'AuthDebug',
  setup() {
    const isAuthenticated = ref(false)
    const isTokenExpired = ref(true)
    const user = ref(null)
    const accessToken = ref('')
    const refreshToken = ref('')
    const tokenExpiration = ref('')
    const logs = ref([])

    const authKeys = [
      'accessToken',
      'refreshToken', 
      'sessionToken',
      'tokenExpiresAt',
      'user',
      'companies'
    ]

    const addLog = (message) => {
      logs.value.unshift({
        time: new Date().toLocaleTimeString(),
        message
      })
      if (logs.value.length > 50) {
        logs.value = logs.value.slice(0, 50)
      }
    }

    const refreshData = () => {
      isAuthenticated.value = authService.isAuthenticated()
      isTokenExpired.value = authService.isTokenExpired()
      user.value = authService.getUser()
      accessToken.value = authService.getAccessToken()
      refreshToken.value = authService.getRefreshToken()
      tokenExpiration.value = localStorage.getItem('tokenExpiresAt')
      
      addLog('Données actualisées')
    }

    const testCurrentUser = async () => {
      try {
        addLog('Test getCurrentUser...')
        const response = await authService.getCurrentUser()
        addLog(`getCurrentUser réussi: ${JSON.stringify(response)}`)
        refreshData()
      } catch (error) {
        addLog(`getCurrentUser échoué: ${error.message}`)
      }
    }

    const clearAuth = () => {
      authService.clearTokens()
      authService.clearUser()
      authService.clearCompanies()
      addLog('Authentification nettoyée')
      refreshData()
    }

    onMounted(() => {
      refreshData()
      addLog('Page de debug chargée')
    })

    return {
      isAuthenticated,
      isTokenExpired,
      user,
      accessToken,
      refreshToken,
      tokenExpiration,
      authKeys,
      logs,
      localStorage,
      testCurrentUser,
      clearAuth,
      refreshData
    }
  }
}
</script>