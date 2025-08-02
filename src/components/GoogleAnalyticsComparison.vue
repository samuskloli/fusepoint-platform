<template>
  <div class="max-w-6xl mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Intégration Google Analytics</h1>
      <p class="text-gray-600">Choisissez la méthode d'intégration qui convient le mieux à vos besoins</p>
    </div>

    <!-- Sélecteur de méthode -->
    <div class="mb-8">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Choisissez votre méthode d'intégration</h2>
          
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Méthode Proxy (Recommandée) -->
            <div 
              @click="selectedMethod = 'proxy'"
              :class="[
                'border-2 rounded-lg p-6 cursor-pointer transition-all',
                selectedMethod === 'proxy' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="w-6 h-6 rounded-full border-2 border-green-500 flex items-center justify-center">
                    <div v-if="selectedMethod === 'proxy'" class="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900 flex items-center">
                    Proxy API 
                    <span class="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Recommandé</span>
                  </h3>
                  <p class="text-gray-600 text-sm mt-1">Configuration simplifiée via notre backend</p>
                  
                  <div class="mt-3 space-y-2">
                    <div class="flex items-center text-sm text-green-700">
                      <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                      Configuration en 30 secondes
                    </div>
                    <div class="flex items-center text-sm text-green-700">
                      <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                      Sécurité renforcée
                    </div>
                    <div class="flex items-center text-sm text-green-700">
                      <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                      Maintenance automatique
                    </div>
                    <div class="flex items-center text-sm text-green-700">
                      <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                      Support technique inclus
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Méthode OAuth -->
            <div 
              @click="selectedMethod = 'oauth'"
              :class="[
                'border-2 rounded-lg p-6 cursor-pointer transition-all',
                selectedMethod === 'oauth' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center">
                    <div v-if="selectedMethod === 'oauth'" class="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">OAuth Direct</h3>
                  <p class="text-gray-600 text-sm mt-1">Configuration manuelle avec vos propres credentials</p>
                  
                  <div class="mt-3 space-y-2">
                    <div class="flex items-center text-sm text-blue-700">
                      <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                      Contrôle total
                    </div>
                    <div class="flex items-center text-sm text-blue-700">
                      <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                      Pas de dépendance externe
                    </div>
                    <div class="flex items-center text-sm text-orange-600">
                      <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                      </svg>
                      Configuration complexe
                    </div>
                    <div class="flex items-center text-sm text-orange-600">
                      <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                      </svg>
                      Maintenance utilisateur
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Composant sélectionné -->
    <div v-if="selectedMethod">
      <GoogleAnalyticsProxySetup v-if="selectedMethod === 'proxy'" />
      <GoogleAnalyticsSetup v-else-if="selectedMethod === 'oauth'" />
    </div>

    <!-- Comparaison détaillée -->
    <div v-if="!selectedMethod" class="mt-8">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Comparaison détaillée</h2>
        </div>
        
        <div class="p-6">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Critère</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proxy API</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OAuth Direct</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Temps de configuration</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">30 secondes</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-orange-600">15-30 minutes</td>
                </tr>
                <tr class="bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Complexité technique</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">Très simple</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-orange-600">Complexe</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Maintenance</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">Automatique</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-orange-600">Manuelle</td>
                </tr>
                <tr class="bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Sécurité</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">Très élevée</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600">Élevée</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Support technique</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">Inclus</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-orange-600">Auto-support</td>
                </tr>
                <tr class="bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Dépendances</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-orange-600">Backend Fusepoint</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">Aucune</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GoogleAnalyticsProxySetup from './GoogleAnalyticsProxySetup.vue';
import GoogleAnalyticsSetup from './GoogleAnalyticsSetup.vue';
import googleAnalyticsService from '../services/googleAnalyticsService.js';

export default {
  name: 'GoogleAnalyticsComparison',
  components: {
    GoogleAnalyticsProxySetup,
    GoogleAnalyticsSetup
  },
  data() {
    return {
      selectedMethod: null
    };
  },
  mounted() {
    this.loadExistingConfiguration();
  },
  methods: {
    async loadExistingConfiguration() {
      try {
        // Vérifier s'il y a une configuration existante (connectée ou non)
        const status = googleAnalyticsService.getConnectionStatus();
        const config = googleAnalyticsService.getConfiguration();
        
        if ((status.configured || status.connected) && config && config.propertyId) {
          // Il y a une configuration OAuth existante (connectée ou déconnectée)
          this.selectedMethod = 'oauth';
          console.log('Configuration OAuth existante détectée (statut:', status.status, '), méthode pré-sélectionnée');
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration existante:', error);
      }
    }
  }
};
</script>