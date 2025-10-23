<template>
  <RoleLayout>
    <div class="p-6">
      <div class="max-w-6xl mx-auto">
        <!-- Titre -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            Démonstration du Système de Statuts Client
          </h1>
          <p class="text-gray-600">
            Test et validation du nouveau système de gestion des statuts clients
          </p>
        </div>
        
        <!-- Statistiques des statuts -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div 
            v-for="status in allStatuses" 
            :key="status.key"
            class="bg-white rounded-lg shadow p-6"
          >
            <div class="flex items-center">
              <div 
                :class="[
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  status.bgColor
                ]"
              >
                <component 
                  :is="status.icon" 
                  :class="['w-4 h-4', status.textColor]"
                />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">{{ status.label }}</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ statusStats[status.key] || 0 }}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Clients de démonstration -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">
              Clients de Démonstration
            </h2>
            <p class="text-sm text-gray-500 mt-1">
              Testez les changements de statut avec ces clients fictifs
            </p>
          </div>
          
          <div class="p-6">
            <!-- Boutons d'actions en masse -->
            <div class="mb-6 flex flex-wrap gap-3">
              <button
                @click="generateDemoClients"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Générer des clients de test
              </button>
              <button
                @click="clearDemoClients"
                class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Vider la liste
              </button>
              <button
                @click="activateAllClients"
                :disabled="isChangingStatus"
                class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Activer tous
              </button>
              <button
                @click="deactivateAllClients"
                :disabled="isChangingStatus"
                class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Désactiver tous
              </button>
            </div>
            
            <!-- Liste des clients -->
            <div class="space-y-4">
              <div 
                v-for="client in demoClients" 
                :key="client.id"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <!-- Avatar -->
                    <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium text-gray-700">
                        {{ getInitials(client.first_name, client.last_name) }}
                      </span>
                    </div>
                    
                    <!-- Informations client -->
                    <div>
                      <h3 class="text-sm font-medium text-gray-900">
                        {{ client.first_name }} {{ client.last_name }}
                      </h3>
                      <p class="text-sm text-gray-500">{{ client.email }}</p>
                      <p class="text-xs text-gray-400">{{ client.company_name }}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-4">
                    <!-- Badge de statut -->
                    <ClientStatusBadge :client="client" />
                    
                    <!-- Menu de changement de statut -->
                    <ClientStatusMenu
                      :client="client"
                      @status-change="handleStatusChange"
                    />
                    
                    <!-- Actions rapides -->
                    <div class="flex space-x-2">
                      <button
                        @click="toggleClientStatus(client)"
                        :disabled="isClientStatusChanging(client.id)"
                        class="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors disabled:opacity-50"
                      >
                        {{ getToggleText(client) }}
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Actions disponibles -->
                <div class="mt-3 pt-3 border-t border-gray-100">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-xs text-gray-500 mb-1">Actions disponibles:</p>
                      <div class="flex flex-wrap gap-1">
                        <span 
                          v-for="action in getAvailableActions(client)"
                          :key="action"
                          class="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-50 text-blue-700"
                        >
                          {{ action }}
                        </span>
                      </div>
                    </div>
                    
                    <div class="text-right">
                      <p class="text-xs text-gray-500">Statut actuel:</p>
                      <p class="text-sm font-medium">{{ getCurrentStatusLabel(client) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Message si aucun client -->
            <div 
              v-if="demoClients.length === 0"
              class="text-center py-12"
            >
              <p class="text-gray-500 mb-4">
                Aucun client de démonstration. Cliquez sur "Générer des clients de test" pour commencer.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Logs des changements -->
        <div class="mt-8 bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">
              Journal des Changements
            </h2>
            <button
              @click="clearLogs"
              class="text-sm text-gray-500 hover:text-gray-700"
            >
              Vider le journal
            </button>
          </div>
          
          <div class="p-6">
            <div class="space-y-2 max-h-64 overflow-y-auto">
              <div 
                v-for="(log, index) in statusLogs" 
                :key="index"
                class="text-sm p-3 bg-gray-50 rounded border-l-4"
                :class="{
                  'border-green-400': log.type === 'success',
                  'border-red-400': log.type === 'error',
                  'border-blue-400': log.type === 'info'
                }"
              >
                <div class="flex justify-between items-start">
                  <span>{{ log.message }}</span>
                  <span class="text-xs text-gray-500 ml-4">{{ log.timestamp }}</span>
                </div>
              </div>
            </div>
            
            <div 
              v-if="statusLogs.length === 0"
              class="text-center py-8 text-gray-500"
            >
              Aucun changement enregistré
            </div>
          </div>
        </div>
      </div>
    </div>
  </RoleLayout>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useClientStatus } from '@/composables/useClientStatus'
import { ClientStatusUtils } from '@/constants/clientStatus'
import RoleLayout from '@/components/RoleLayout.vue'
import ClientStatusBadge from '@/components/clients/ClientStatusBadge.vue'
import ClientStatusMenu from '@/components/clients/ClientStatusMenu.vue'

export default {
  name: 'ClientStatusDemo',
  components: {
    RoleLayout,
    ClientStatusBadge,
    ClientStatusMenu
  },
  setup() {
    const demoClients = ref([])
    const statusLogs = ref([])
    
    const {
      isChangingStatus,
      changeClientStatus,
      toggleClientStatus,
      activateClient,
      deactivateClient,
      getAvailableActions,
      canPerformAction,
      isClientStatusChanging,
      getStatusStats
    } = useClientStatus()
    
    // Tous les statuts disponibles
    const allStatuses = computed(() => {
      return ClientStatusUtils.getAllStatuses()
    })
    
    // Statistiques des statuts
    const statusStats = computed(() => {
      return getStatusStats(demoClients.value)
    })
    
    // Générer des clients de démonstration
    const generateDemoClients = () => {
      const names = [
        { first: 'Jean', last: 'Dupont', email: 'jean.dupont@email.com', company: 'TechCorp' },
        { first: 'Marie', last: 'Martin', email: 'marie.martin@email.com', company: 'InnovateLtd' },
        { first: 'Pierre', last: 'Durand', email: 'pierre.durand@email.com', company: 'StartupXYZ' },
        { first: 'Sophie', last: 'Leroy', email: 'sophie.leroy@email.com', company: 'BigCorp' },
        { first: 'Thomas', last: 'Moreau', email: 'thomas.moreau@email.com', company: 'SmallBiz' },
        { first: 'Emma', last: 'Simon', email: 'emma.simon@email.com', company: 'MediumCorp' },
        { first: 'Lucas', last: 'Laurent', email: 'lucas.laurent@email.com', company: 'NewVenture' },
        { first: 'Chloé', last: 'Petit', email: 'chloe.petit@email.com', company: 'OldFirm' }
      ]
      
      const statuses = ['active', 'inactive', 'pending', 'suspended']
      
      demoClients.value = names.map((name, index) => ({
        id: index + 1,
        first_name: name.first,
        last_name: name.last,
        email: name.email,
        company_name: name.company,
        status: statuses[index % statuses.length],
        is_active: statuses[index % statuses.length] === 'active' ? 1 : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      
      addLog('info', `${demoClients.value.length} clients de démonstration générés`)
    }
    
    // Vider les clients de démonstration
    const clearDemoClients = () => {
      demoClients.value = []
      addLog('info', 'Liste des clients vidée')
    }
    
    // Activer tous les clients
    const activateAllClients = async () => {
      const inactiveClients = demoClients.value.filter(c => {
        const status = ClientStatusUtils.getClientStatus(c)
        return status?.key !== 'active'
      })
      
      if (inactiveClients.length === 0) {
        addLog('info', 'Tous les clients sont déjà actifs')
        return
      }
      
      addLog('info', `Activation de ${inactiveClients.length} clients en cours...`)
      
      for (const client of inactiveClients) {
        try {
          await activateClient(client, { showNotification: false })
          addLog('success', `Client ${client.first_name} ${client.last_name} activé`)
        } catch (error) {
          addLog('error', `Erreur lors de l'activation de ${client.first_name} ${client.last_name}: ${error.message}`)
        }
      }
    }
    
    // Désactiver tous les clients
    const deactivateAllClients = async () => {
      const activeClients = demoClients.value.filter(c => {
        const status = ClientStatusUtils.getClientStatus(c)
        return status?.key === 'active'
      })
      
      if (activeClients.length === 0) {
        addLog('info', 'Aucun client actif à désactiver')
        return
      }
      
      addLog('info', `Désactivation de ${activeClients.length} clients en cours...`)
      
      for (const client of activeClients) {
        try {
          await deactivateClient(client, { showNotification: false })
          addLog('success', `Client ${client.first_name} ${client.last_name} désactivé`)
        } catch (error) {
          addLog('error', `Erreur lors de la désactivation de ${client.first_name} ${client.last_name}: ${error.message}`)
        }
      }
    }
    
    // Gérer le changement de statut
    const handleStatusChange = async (client, newStatus) => {
      try {
        const oldStatus = ClientStatusUtils.getClientStatus(client)
        addLog('info', `Changement de statut pour ${client.first_name} ${client.last_name}: ${oldStatus?.label} → ${newStatus.label}`)
        
        const result = await changeClientStatus(client, newStatus, { showNotification: false })
        
        if (result.success) {
          addLog('success', `Statut changé avec succès: ${newStatus.label}`)
        } else {
          addLog('error', `Erreur: ${result.error}`)
        }
      } catch (error) {
        addLog('error', `Erreur lors du changement de statut: ${error.message}`)
      }
    }
    
    // Obtenir le texte du bouton toggle
    const getToggleText = (client) => {
      const status = ClientStatusUtils.getClientStatus(client)
      return status?.key === 'active' ? 'Désactiver' : 'Activer'
    }
    
    // Obtenir le label du statut actuel
    const getCurrentStatusLabel = (client) => {
      const status = ClientStatusUtils.getClientStatus(client)
      return status?.label || 'Inconnu'
    }
    
    // Obtenir les initiales
    const getInitials = (firstName, lastName) => {
      return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
    }
    
    // Ajouter un log
    const addLog = (type, message) => {
      statusLogs.value.unshift({
        type,
        message,
        timestamp: new Date().toLocaleTimeString()
      })
      
      // Limiter à 50 logs
      if (statusLogs.value.length > 50) {
        statusLogs.value = statusLogs.value.slice(0, 50)
      }
    }
    
    // Vider les logs
    const clearLogs = () => {
      statusLogs.value = []
    }
    
    // Initialisation
    onMounted(() => {
      addLog('info', 'Démonstration du système de statuts initialisée')
    })
    
    return {
      // sidebarOpen removed
      demoClients,
      statusLogs,
      isChangingStatus,
      allStatuses,
      statusStats,
      
      // Actions
      generateDemoClients,
      clearDemoClients,
      activateAllClients,
      deactivateAllClients,
      handleStatusChange,
      toggleClientStatus,
      getAvailableActions,
      canPerformAction,
      isClientStatusChanging,
      getToggleText,
      getCurrentStatusLabel,
      getInitials,
      clearLogs
    }
  }
}
</script>

<style scoped>
</style>