<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Test de Persistance Google Analytics</h2>
      
      <!-- État actuel -->
      <div class="mb-6">
        <h3 class="text-lg font-medium text-gray-800 mb-3">État Actuel</h3>
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="text-sm font-medium text-gray-600">Connecté:</span>
              <span :class="isConnected ? 'text-green-600' : 'text-red-600'" class="ml-2 font-semibold">
                {{ isConnected ? 'Oui' : 'Non' }}
              </span>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-600">ID Propriété:</span>
              <span class="ml-2 text-gray-900">{{ currentUser.propertyId || 'Non défini' }}</span>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-600">User ID:</span>
              <span class="ml-2 text-gray-900">{{ currentUser.userId || 'Non défini' }}</span>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-600">Token expire:</span>
              <span class="ml-2 text-gray-900">{{ formatExpiration(currentUser.expiresAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Configuration sauvegardée -->
      <div class="mb-6">
        <h3 class="text-lg font-medium text-gray-800 mb-3">Configuration Sauvegardée</h3>
        <div class="bg-blue-50 rounded-lg p-4">
          <div v-if="savedConfig" class="space-y-2">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span class="text-sm font-medium text-blue-700">ID Propriété:</span>
                <span class="ml-2 text-blue-900">{{ savedConfig.propertyId || 'Non défini' }}</span>
              </div>
              <div>
                <span class="text-sm font-medium text-blue-700">Configuré:</span>
                <span class="ml-2 text-blue-900">{{ savedConfig.isConfigured ? 'Oui' : 'Non' }}</span>
              </div>
              <div>
                <span class="text-sm font-medium text-blue-700">Statut:</span>
                <span class="ml-2 text-blue-900">{{ savedConfig.status || 'Non défini' }}</span>
              </div>
              <div>
                <span class="text-sm font-medium text-blue-700">Connecté le:</span>
                <span class="ml-2 text-blue-900">{{ formatDate(savedConfig.connectedAt) }}</span>
              </div>
              <div>
                <span class="text-sm font-medium text-blue-700">Dernière sync:</span>
                <span class="ml-2 text-blue-900">{{ formatDate(savedConfig.lastSync) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="text-blue-700">
            Aucune configuration sauvegardée trouvée
          </div>
        </div>
      </div>

      <!-- Données localStorage -->
      <div class="mb-6">
        <h3 class="text-lg font-medium text-gray-800 mb-3">Données localStorage</h3>
        <div class="bg-yellow-50 rounded-lg p-4">
          <div class="space-y-2 text-sm">
            <div>
              <span class="font-medium text-yellow-700">ga_user_data:</span>
              <span class="ml-2 text-yellow-900">{{ localStorageData.ga_user_data ? 'Présent' : 'Absent' }}</span>
            </div>
            <div>
              <span class="font-medium text-yellow-700">ga_config:</span>
              <span class="ml-2 text-yellow-900">{{ localStorageData.ga_config ? 'Présent' : 'Absent' }}</span>
            </div>
            <div>
              <span class="font-medium text-yellow-700">ga_property_id:</span>
              <span class="ml-2 text-yellow-900">{{ localStorageData.ga_property_id || 'Absent' }}</span>
            </div>
            <div>
              <span class="font-medium text-yellow-700">ga_oauth_temp:</span>
              <span class="ml-2 text-yellow-900">{{ localStorageData.ga_oauth_temp ? 'Présent' : 'Absent' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions de test -->
      <div class="mb-6">
        <h3 class="text-lg font-medium text-gray-800 mb-3">Actions de Test</h3>
        <div class="flex flex-wrap gap-3">
          <button
            @click="refreshData"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Actualiser les données
          </button>
          
          <button
            @click="testPersistence"
            :disabled="isTesting"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {{ isTesting ? 'Test en cours...' : 'Tester la persistance' }}
          </button>
          
          <button
            @click="clearAllData"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Effacer toutes les données
          </button>
          
          <button
            @click="simulateReload"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Simuler rechargement
          </button>
        </div>
      </div>

      <!-- Résultats du test -->
      <div v-if="testResult" class="mb-6">
        <h3 class="text-lg font-medium text-gray-800 mb-3">Résultat du Test</h3>
        <div :class="testResultClass" class="rounded-lg p-4">
          <div class="flex items-start">
            <svg :class="testResult.success ? 'text-green-600' : 'text-red-600'" class="w-5 h-5 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path v-if="testResult.success" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              <path v-else fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="font-medium">{{ testResult.message }}</p>
              <div v-if="testResult.details" class="mt-2 text-sm opacity-90">
                <pre class="whitespace-pre-wrap">{{ testResult.details }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="text-lg font-medium text-gray-800 mb-3">Instructions</h3>
        <div class="text-sm text-gray-700 space-y-2">
          <p><strong>1. Actualiser les données:</strong> Recharge les informations depuis le service</p>
          <p><strong>2. Tester la persistance:</strong> Vérifie que les données sont correctement sauvegardées</p>
          <p><strong>3. Effacer toutes les données:</strong> Supprime toutes les données Google Analytics du localStorage</p>
          <p><strong>4. Simuler rechargement:</strong> Simule un rechargement de page pour tester la persistance</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import googleAnalyticsService from '../services/googleAnalyticsService.js';

export default {
  name: 'GoogleAnalyticsConfigTest',
  data() {
    return {
      currentUser: {},
      savedConfig: null,
      localStorageData: {},
      testResult: null,
      isTesting: false
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
      
      // Charger les données localStorage
      this.localStorageData = {
        ga_user_data: localStorage.getItem('ga_user_data'),
        ga_config: localStorage.getItem('ga_config'),
        ga_property_id: localStorage.getItem('ga_property_id'),
        ga_oauth_temp: localStorage.getItem('ga_oauth_temp')
      };
    },
    
    async testPersistence() {
      this.isTesting = true;
      this.testResult = null;
      
      try {
        // Test 1: Vérifier que les données sont présentes
        const hasUserData = !!localStorage.getItem('ga_user_data');
        const hasConfig = !!localStorage.getItem('ga_config');
        const hasPropertyId = !!localStorage.getItem('ga_property_id');
        
        // Test 2: Vérifier la cohérence des données
        const userData = JSON.parse(localStorage.getItem('ga_user_data') || '{}');
        const configData = JSON.parse(localStorage.getItem('ga_config') || '{}');
        const propertyId = localStorage.getItem('ga_property_id');
        
        const isConsistent = (
          userData.propertyId === configData.propertyId &&
          userData.propertyId === propertyId
        );
        
        // Test 3: Vérifier que le service peut charger les données
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
✓ Données utilisateur présentes: ${hasUserData ? 'OUI' : 'NON'}
✓ Configuration présente: ${hasConfig ? 'OUI' : 'NON'}
✓ ID propriété présent: ${hasPropertyId ? 'OUI' : 'NON'}
✓ Cohérence des données: ${isConsistent ? 'OUI' : 'NON'}
✓ Service fonctionnel: ${serviceWorking ? 'OUI' : 'NON'}`
        };
        
      } catch (error) {
        this.testResult = {
          success: false,
          message: 'Erreur lors du test de persistance',
          details: error.message
        };
      } finally {
        this.isTesting = false;
      }
    },
    
    clearAllData() {
      if (confirm('Êtes-vous sûr de vouloir effacer toutes les données Google Analytics ?')) {
        googleAnalyticsService.disconnect();
        this.refreshData();
        this.testResult = {
          success: true,
          message: 'Toutes les données ont été effacées'
        };
      }
    },
    
    simulateReload() {
      // Sauvegarder l'état actuel
      const beforeReload = {
        userData: this.currentUser,
        config: this.savedConfig
      };
      
      // Simuler un rechargement en recréant le service
      googleAnalyticsService.loadUserData();
      
      // Recharger les données
      this.refreshData();
      
      // Comparer avec l'état précédent
      const afterReload = {
        userData: this.currentUser,
        config: this.savedConfig
      };
      
      const dataPreserved = (
        beforeReload.userData.propertyId === afterReload.userData.propertyId &&
        beforeReload.config?.propertyId === afterReload.config?.propertyId
      );
      
      this.testResult = {
        success: dataPreserved,
        message: dataPreserved 
          ? 'Simulation de rechargement réussie - données préservées' 
          : 'Simulation de rechargement échouée - données perdues',
        details: `Avant: ${JSON.stringify(beforeReload, null, 2)}\n\nAprès: ${JSON.stringify(afterReload, null, 2)}`
      };
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Non défini';
      try {
        return new Date(dateString).toLocaleString('fr-FR');
      } catch {
        return dateString;
      }
    },
    
    formatExpiration(timestamp) {
      if (!timestamp) return 'Non défini';
      try {
        const date = new Date(timestamp);
        const now = new Date();
        const isExpired = date <= now;
        const timeLeft = Math.abs(date - now);
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        return isExpired 
          ? `Expiré il y a ${hours}h ${minutes}m`
          : `Dans ${hours}h ${minutes}m`;
      } catch {
        return 'Erreur de format';
      }
    }
  }
};
</script>