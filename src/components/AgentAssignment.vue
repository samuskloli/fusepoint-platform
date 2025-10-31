<template>
  <div class="agent-assignment">
    <!-- Message quand aucun agent n'est attribué -->
    <div v-if="!hasAssignedAgent && !loading" class="no-agent-message">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <div class="mb-4">
          <svg class="mx-auto h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-blue-900 mb-2">
          🤝 {{ $t('agentAssignment.agentWillBeAssigned') }}
        </h3>
        <p class="text-blue-700 mb-4">
          {{ $t('agentAssignment.agentAssignmentDescription') }}
        </p>
        <button 
          @click="requestAgentAssignment"
          :disabled="requesting"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="requesting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ requesting ? $t('agentAssignment.requestingAgent') : $t('agentAssignment.requestAgentNow') }}
        </button>
      </div>
    </div>

    <!-- Informations de l'agent attribué -->
    <div v-else-if="hasAssignedAgent && assignedAgent" class="assigned-agent">
      <div class="bg-green-50 border border-green-200 rounded-lg p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div class="ml-4 flex-1">
            <h3 class="text-lg font-medium text-green-900">
              ✅ {{ $t('agentAssignment.yourAssignedAgent') }}
            </h3>
            <p class="text-green-700">
              <strong>{{ assignedAgent.firstName }} {{ assignedAgent.lastName }}</strong>
            </p>
            <p class="text-sm text-green-600">
              {{ assignedAgent.email }}
            </p>
            <p class="text-xs text-green-500 mt-1">
              {{ $t('agentAssignment.assignedOn') }} {{ formatDate(assignedAgent.assigned_at) }}
            </p>
          </div>
          <div class="ml-4">
            <button 
              @click="contactAgent"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              📞 {{ $t('agentAssignment.contactAgent') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-else-if="loading" class="loading-state">
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div class="animate-spin mx-auto h-8 w-8 text-gray-400 mb-4">
          <svg fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p class="text-gray-600">{{ $t('agentAssignment.checkingAssignment') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import authService from '@/services/authService'

export default {
  name: 'AgentAssignment',
  props: {
    clientId: {
      type: [String, Number],
      default: null
    }
  },
  emits: ['agent-assigned', 'agent-contacted'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    const toast = useToast()
    
    const loading = ref(true)
    const requesting = ref(false)
    const hasAssignedAgent = ref(false)
    const assignedAgent = ref(null)
    
    const checkAgentAssignment = async () => {
      try {
        loading.value = true
        
        // Utiliser l'ID du client passé en prop ou l'utilisateur connecté
        const clientIdToCheck = props.clientId || authStore.user?.id
        const accessToken = authService.getAccessToken?.() || localStorage.getItem('accessToken')
        
        // Ne pas appeler l'API si pas d'utilisateur ou pas de token (ex: page de login)
        if (!clientIdToCheck || !accessToken) {
          console.warn('Aucun ID client disponible pour vérifier l\'attribution')
          loading.value = false
          return
        }
        
        const response = await authService.getApiInstance().get(`/api/client/${clientIdToCheck}/assigned-agent`)
        
        if (response.data) {
          hasAssignedAgent.value = response.data.hasAssignedAgent
          assignedAgent.value = response.data.agent
          
          if (hasAssignedAgent.value) {
            emit('agent-assigned', assignedAgent.value)
          }
        }
      } catch (error) {
        console.warn('Erreur lors de la vérification de l\'attribution:', error)
        if (error.response?.status === 401) {
          // Problème d'authentification, laisser le middleware gérer
          console.log('Problème d\'authentification détecté')
        }
      } finally {
        loading.value = false
      }
    }
    
    const requestAgentAssignment = async () => {
      try {
        requesting.value = true
        
        const clientIdToAssign = props.clientId || authStore.user?.id
        
        if (!clientIdToAssign) {
          toast.error('Aucun utilisateur identifié')
          return
        }
        
        const response = await authService.getApiInstance().post(`/api/agent/auto-assign/${clientIdToAssign}`)
        
        if (response.data) {
          toast.success(response.data.message)
          hasAssignedAgent.value = true
          assignedAgent.value = {
            firstName: response.data.data.agent.first_name,
            lastName: response.data.data.agent.last_name,
            email: response.data.data.agent.email,
            assigned_at: new Date().toISOString()
          }
          emit('agent-assigned', assignedAgent.value)
        }
      } catch (error) {
        console.error('Erreur lors de l\'attribution d\'agent:', error)
        const errorMessage = error.response?.data?.message || 'Erreur lors de l\'attribution d\'agent'
        toast.error(errorMessage)
        
        if (error.response?.status === 401) {
          // Problème d'authentification, laisser le middleware gérer
          console.log('Problème d\'authentification détecté')
        }
      } finally {
        requesting.value = false
      }
    }
    
    const contactAgent = () => {
      emit('agent-contacted', assignedAgent.value)
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    onMounted(() => {
      checkAgentAssignment()
    })
    
    return {
      loading,
      requesting,
      hasAssignedAgent,
      assignedAgent,
      checkAgentAssignment,
      requestAgentAssignment,
      contactAgent,
      formatDate
    }
  }
}
</script>

<style scoped>
.agent-assignment {
  margin: 1rem 0;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>