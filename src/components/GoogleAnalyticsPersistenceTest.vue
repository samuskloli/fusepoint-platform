<template>
  <div class="max-w-2xl mx-auto p-6">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Test de Persistance Google Analytics</h2>
      
      <!-- État actuel -->
      <div class="mb-6">
        <h3 class="text-lg font-medium text-gray-800 mb-3">État Actuel</h3>
        <div class="bg-gray-50 rounded-lg p-4 space-y-2">
          <div class="flex justify-between">
            <span class="text-sm font-medium text-gray-600">Connecté:</span>
            <span :class="isConnected ? 'text-green-600' : 'text-red-600'" class="text-sm font-semibold">
              {{ isConnected ? 'Oui' : 'Non' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm font-medium text-gray-600">ID Propriété (Service):</span>
            <span class="text-sm text-gray-900">{{ currentUser.propertyId || 'Non défini' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm font-medium text-gray-600">ID Propriété (localStorage):</span>
            <span class="text-sm text-gray-900">{{ localStoragePropertyId || 'Non défini' }}</span>
          </div>
        </div>
      </div>

      <!-- Configuration sauvegardée -->
      <div class="mb-6">
        <h3 class="text-lg font-medium text-gray-800 mb-3">Configuration Sauvegardée</h3>
        <div class="bg-blue-50 rounded-lg p-4">
          <div v-if="savedConfig">
            <pre class="text-xs text-blue-900 whitespace-pre-wrap">{{ JSON.stringify(savedConfig, null, 2) }}</pre>
          </div>
          <div v-else class="text-blue-700 text-sm">
            Aucune configuration sauvegardée
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <button
          @click="refreshData"
          class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Actualiser les données
        </button>
        
        <button
          @click="testPersistence"
          class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Tester la persistance
        </button>
        
        <button
          @click="clearAllData"
          class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Effacer toutes les données
        </button>
      </div>

      <!-- Résultat du test -->
      <div v-if="testResult" class="mt-6">
        <div :class="testResultClass" class="rounded-lg p-4">
          <p class="font-medium">{{ testResult.message }}</p>
          <div v-if="testResult.details" class="mt-2 text-sm">
            <pre class="whitespace-pre-wrap">{{ testResult.details }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import googleAnalyticsService from '../services/googleAnalyticsService.js';

export default {
  name: 'GoogleAnalyticsPersistenceTest',
  data() {
    return {
      currentUser: {},
      savedConfig: null,
      localStoragePropertyId: '',
      testResult: null
    };
  },
  computed: {
    isConnected() {
      return googleAnalyticsService.isConnected();
    },
    testResultClass() {
      if (!this.testResult) return '';
      return this.testResult.success 
        ? 'bg-green-50 border border-green-200 text-green-800'
        : 'bg-red-50 border border-red-200 text-red-800';
    }
  },
  mounted() {
    this.refreshData();
  },
  methods: {
    refreshData() {
      // Charger les données du service
      this.currentUser = googleAnalyticsService.getCurrentUser();
      
      // Charger la configuration sauvegardée
      this.savedConfig = googleAnalyticsService.getConfiguration();
      
      // Charger l'ID de propriété depuis localStorage
      this.localStoragePropertyId = localStorage.getItem('ga_property_id');
      
      console.log('Données actualisées:', {
        currentUser: this.currentUser,
        savedConfig: this.savedConfig,
        localStoragePropertyId: this.localStoragePropertyId
      });
    },
    
    testPersistence() {
      try {
        const hasUserData = !!localStorage.getItem('ga_user_data');
        const hasConfig = !!localStorage.getItem('ga_config');
        const hasPropertyId = !!localStorage.getItem('ga_property_id');
        
        const userData = JSON.parse(localStorage.getItem('ga_user_data') || '{}');
        const configData = JSON.parse(localStorage.getItem('ga_config') || '{}');
        const propertyId = localStorage.getItem('ga_property_id');
        
        const isConsistent = (
          userData.propertyId === configData.propertyId &&
          userData.propertyId === propertyId
        );
        
        const serviceUser = googleAnalyticsService.getCurrentUser();
        const serviceConfig = googleAnalyticsService.getConfiguration();
        
        const serviceWorking = (
          serviceUser.propertyId === userData.propertyId &&
          serviceConfig?.propertyId === configData.propertyId
        );
        
        const allTestsPassed = hasUserData && hasConfig && hasPropertyId && isConsistent && serviceWorking;
        
        this.testResult = {
          success: allTestsPassed,
          message: allTestsPassed 
            ? 'Tous les tests de persistance ont réussi !' 
            : 'Certains tests de persistance ont échoué',
          details: `Tests effectués:
✓ Données utilisateur: ${hasUserData ? 'OUI' : 'NON'}
✓ Configuration: ${hasConfig ? 'OUI' : 'NON'}
✓ ID propriété: ${hasPropertyId ? 'OUI' : 'NON'}
✓ Cohérence: ${isConsistent ? 'OUI' : 'NON'}
✓ Service: ${serviceWorking ? 'OUI' : 'NON'}

Détails:
- userData.propertyId: ${userData.propertyId}
- configData.propertyId: ${configData.propertyId}
- localStorage propertyId: ${propertyId}
- serviceUser.propertyId: ${serviceUser.propertyId}
- serviceConfig.propertyId: ${serviceConfig?.propertyId}`
        };
        
      } catch (error) {
        this.testResult = {
          success: false,
          message: 'Erreur lors du test de persistance',
          details: error.message
        };
      }
    },
    
    clearAllData() {
      if (confirm('Êtes-vous sûr de vouloir effacer toutes les données ?')) {
        googleAnalyticsService.disconnect();
        this.refreshData();
        this.testResult = {
          success: true,
          message: 'Toutes les données ont été effacées'
        };
      }
    }
  }
};
</script>