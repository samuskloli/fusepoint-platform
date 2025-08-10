<template>
  <div class="test-chat p-8">
    <h1 class="text-2xl font-bold mb-6">Test Chat IA</h1>
    
    <div class="bg-white rounded-lg shadow p-6 max-w-2xl">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Message de test
        </label>
        <input
          v-model="testMessage"
          type="text"
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tapez votre message de test..."
        />
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Type d'agent
        </label>
        <select
          v-model="agentType"
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="strategy">Stratégie</option>
          <option value="content">Contenu</option>
          <option value="social">Social</option>
          <option value="email">Email</option>
          <option value="analytics">Analytics</option>
        </select>
      </div>
      
      <button
        @click="sendTestMessage"
        :disabled="loading || !testMessage.trim()"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Envoi en cours...' : 'Envoyer le message' }}
      </button>
      
      <!-- Logs de débogage -->
      <div v-if="debugLogs.length > 0" class="mt-6">
        <h3 class="text-lg font-medium mb-2">Logs de débogage :</h3>
        <div class="bg-gray-100 p-4 rounded-md max-h-60 overflow-y-auto">
          <div v-for="(log, index) in debugLogs" :key="index" class="mb-2 text-sm">
            <span class="font-mono text-gray-600">{{ log.timestamp }}</span>
            <span class="ml-2" :class="log.type === 'error' ? 'text-red-600' : 'text-gray-800'">
              {{ log.message }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Réponse -->
      <div v-if="response" class="mt-6">
        <h3 class="text-lg font-medium mb-2">Réponse reçue :</h3>
        <div class="bg-green-50 border border-green-200 p-4 rounded-md">
          <pre class="whitespace-pre-wrap text-sm">{{ JSON.stringify(response, null, 2) }}</pre>
        </div>
      </div>
      
      <!-- Erreur -->
      <div v-if="error" class="mt-6">
        <h3 class="text-lg font-medium mb-2 text-red-600">Erreur :</h3>
        <div class="bg-red-50 border border-red-200 p-4 rounded-md">
          <pre class="whitespace-pre-wrap text-sm text-red-800">{{ error }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import AIChatService from '@/services/aiChatService'

export default {
  name: 'TestChat',
  setup() {
    const testMessage = ref('Comment améliorer mon taux de conversion?')
    const agentType = ref('strategy')
    const loading = ref(false)
    const response = ref(null)
    const error = ref(null)
    const debugLogs = ref([])
    
    const aiChatService = new AIChatService()
    
    const addLog = (message, type = 'info') => {
      debugLogs.value.push({
        timestamp: new Date().toLocaleTimeString(),
        message,
        type
      })
    }
    
    const sendTestMessage = async () => {
      if (!testMessage.value.trim() || loading.value) return
      
      loading.value = true
      response.value = null
      error.value = null
      debugLogs.value = []
      
      addLog(`Envoi du message: "${testMessage.value}" avec agent: ${agentType.value}`)
      
      try {
        addLog('Appel du service aiChatService.sendMessage...')
        
        const result = await aiChatService.sendMessage(
          testMessage.value,
          agentType.value,
          [],
          { userId: null, companyId: null }
        )
        
        addLog('Réponse reçue du service')
        response.value = result
        
      } catch (err) {
        addLog(`Erreur: ${err.message}`, 'error')
        error.value = err.message
        console.error('Erreur test chat:', err)
      } finally {
        loading.value = false
        addLog('Test terminé')
      }
    }
    
    return {
      testMessage,
      agentType,
      loading,
      response,
      error,
      debugLogs,
      sendTestMessage
    }
  }
}
</script>

<style scoped>
.test-chat {
  min-height: 100vh;
  background-color: #f9fafb;
}
</style>