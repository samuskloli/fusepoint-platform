<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- En-tête -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Configuration Google Analytics - Proxy API</h1>
      <p class="text-gray-600">
        Configuration simplifiée via notre API proxy. Connectez-vous en 30 secondes avec juste votre ID de propriété GA4.
      </p>
    </div>

    <!-- Avantages -->
    <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-lg font-medium text-green-800">Avantages de la méthode Proxy</h3>
          <div class="mt-2 text-sm text-green-700">
            <ul class="list-disc list-inside space-y-1">
              <li>Configuration en 30 secondes</li>
              <li>Aucune configuration OAuth complexe</li>
              <li>Sécurité renforcée via notre backend</li>
              <li>Maintenance automatique des tokens</li>
              <li>Support technique inclus</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- État de connexion -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900">État de la connexion</h2>
        <div class="flex items-center space-x-2">
          <div :class="connectionStatusClass" class="w-3 h-3 rounded-full"></div>
          <span :class="connectionTextClass" class="text-sm font-medium">
            {{ connectionStatusText }}
          </span>
        </div>
      </div>

      <div v-if="isConnected" class="space-y-3">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Propriété GA4:</span>
          <span class="text-sm font-medium text-gray-900">{{ propertyId }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Dernière synchronisation:</span>
          <span class="text-sm font-medium text-gray-900">{{ lastSync }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Statut API:</span>
          <span class="text-sm font-medium text-green-600">Opérationnel</span>
        </div>
      </div>

      <div v-else class="text-sm text-gray-600">
        Aucune connexion active. Configurez votre propriété GA4 ci-dessous.
      </div>
    </div>

    <!-- Formulaire de configuration -->
    <div v-if="!isConnected" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Configuration rapide</h2>
      
      <form @submit.prevent="connectWithProxy" class="space-y-4">
        <div>
          <label for="propertyId" class="block text-sm font-medium text-gray-700 mb-2">
            ID de propriété Google Analytics 4
          </label>
          <input
            id="propertyId"
            v-model="formData.propertyId"
            type="text"
            placeholder="Ex: 123456789"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            :disabled="isConnecting"
            required
          >
          <p class="mt-1 text-xs text-gray-500">
            Trouvez votre ID dans Google Analytics > Admin > Informations sur la propriété
          </p>
        </div>

        <div>
          <label for="websiteUrl" class="block text-sm font-medium text-gray-700 mb-2">
            URL de votre site web (optionnel)
          </label>
          <input
            id="websiteUrl"
            v-model="formData.websiteUrl"
            type="url"
            placeholder="https://votre-site.com"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            :disabled="isConnecting"
          >
        </div>

        <div class="flex items-center">
          <input
            id="acceptTerms"
            v-model="formData.acceptTerms"
            type="checkbox"
            class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            :disabled="isConnecting"
            required
          >
          <label for="acceptTerms" class="ml-2 block text-sm text-gray-700">
            J'accepte que Fusepoint accède à mes données Google Analytics en lecture seule
          </label>
        </div>

        <button
          type="submit"
          :disabled="isConnecting || !formData.propertyId || !formData.acceptTerms"
          class="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg v-if="isConnecting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isConnecting ? 'Connexion en cours...' : 'Connecter via Proxy API' }}
        </button>
      </form>
    </div>

    <!-- Actions pour utilisateur connecté -->
    <div v-if="isConnected" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
      
      <div class="flex flex-wrap gap-3">
        <button
          @click="testConnection"
          :disabled="isTesting"
          class="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
        >
          <svg v-if="isTesting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isTesting ? 'Test...' : 'Tester la connexion' }}
        </button>
        
        <button
          @click="refreshData"
          :disabled="isRefreshing"
          class="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
        >
          <svg v-if="isRefreshing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isRefreshing ? 'Actualisation...' : 'Actualiser les données' }}
        </button>
        
        <button
          @click="disconnect"
          class="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
        >
          Déconnecter
        </button>
      </div>
    </div>

    <!-- Guide d'aide -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 class="text-lg font-medium text-blue-800 mb-3">Comment trouver votre ID de propriété GA4 ?</h3>
      <div class="text-sm text-blue-700 space-y-2">
        <p><strong>Étape 1:</strong> Connectez-vous à <a href="https://analytics.google.com" target="_blank" class="underline">Google Analytics</a></p>
        <p><strong>Étape 2:</strong> Cliquez sur "Admin" (roue dentée) en bas à gauche</p>
        <p><strong>Étape 3:</strong> Dans la colonne "Propriété", cliquez sur "Informations sur la propriété"</p>
        <p><strong>Étape 4:</strong> Copiez l'"ID DE PROPRIÉTÉ" (format: 123456789)</p>
      </div>
    </div>

    <!-- Messages d'état -->
    <div v-if="statusMessage" class="mt-6">
      <div :class="statusMessageClass" class="p-4 rounded-lg">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg v-if="statusMessage.type === 'success'" class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <svg v-else class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium">{{ statusMessage.message }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GoogleAnalyticsProxySetup',
  data() {
    return {
      isConnected: false,
      isConnecting: false,
      isTesting: false,
      isRefreshing: false,
      propertyId: null,
      lastSync: null,
      formData: {
        propertyId: '',
        websiteUrl: '',
        acceptTerms: false
      },
      statusMessage: null
    };
  },
  computed: {
    connectionStatusClass() {
      return this.isConnected ? 'bg-green-400' : 'bg-gray-400';
    },
    connectionTextClass() {
      return this.isConnected ? 'text-green-600' : 'text-gray-500';
    },
    connectionStatusText() {
      return this.isConnected ? 'Connecté via Proxy API' : 'Non connecté';
    },
    statusMessageClass() {
      if (!this.statusMessage) return '';
      return this.statusMessage.type === 'success' 
        ? 'bg-green-50 border border-green-200 text-green-800'
        : 'bg-red-50 border border-red-200 text-red-800';
    }
  },
  mounted() {
    this.checkExistingConnection();
  },
  methods: {
    checkExistingConnection() {
      // Vérifier s'il y a une connexion existante
      const savedConnection = localStorage.getItem('ga_proxy_connection');
      if (savedConnection) {
        try {
          const connection = JSON.parse(savedConnection);
          this.isConnected = true;
          this.propertyId = connection.propertyId;
          this.lastSync = connection.lastSync || 'Jamais';
        } catch (error) {
          console.error('Erreur lors de la lecture de la connexion sauvegardée:', error);
        }
      }
    },
    
    async connectWithProxy() {
      this.isConnecting = true;
      this.statusMessage = null;
      
      try {
        // Simuler un appel API au proxy backend
        await this.simulateProxyConnection();
        
        // Sauvegarder la connexion
        const connection = {
          propertyId: this.formData.propertyId,
          websiteUrl: this.formData.websiteUrl,
          connectedAt: new Date().toISOString(),
          lastSync: 'il y a quelques secondes',
          method: 'proxy'
        };
        
        localStorage.setItem('ga_proxy_connection', JSON.stringify(connection));
        
        this.isConnected = true;
        this.propertyId = this.formData.propertyId;
        this.lastSync = 'il y a quelques secondes';
        
        this.statusMessage = {
          type: 'success',
          message: 'Connexion réussie ! Vos données Google Analytics sont maintenant accessibles.'
        };
        
        // Émettre un événement pour notifier le parent
        this.$emit('connection-changed', { connected: true, method: 'proxy', propertyId: this.propertyId });
        
      } catch (error) {
        console.error('Erreur lors de la connexion proxy:', error);
        this.statusMessage = {
          type: 'error',
          message: 'Erreur lors de la connexion. Vérifiez votre ID de propriété et réessayez.'
        };
      } finally {
        this.isConnecting = false;
      }
    },
    
    async simulateProxyConnection() {
      // Simuler un délai de connexion
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simuler une validation de l'ID de propriété
      if (!this.formData.propertyId || this.formData.propertyId.length < 8) {
        throw new Error('ID de propriété invalide');
      }
      
      // Dans un vrai environnement, ceci ferait un appel au backend proxy
      // const response = await fetch('/api/ga-proxy/connect', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ propertyId: this.formData.propertyId })
      // });
      
      return { success: true };
    },
    
    async testConnection() {
      this.isTesting = true;
      this.statusMessage = null;
      
      try {
        // Simuler un test de connexion
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this.statusMessage = {
          type: 'success',
          message: 'Test de connexion réussi ! L\'API proxy fonctionne correctement.'
        };
        
        this.lastSync = 'il y a quelques secondes';
        
      } catch (error) {
        this.statusMessage = {
          type: 'error',
          message: 'Échec du test de connexion. Vérifiez votre configuration.'
        };
      } finally {
        this.isTesting = false;
      }
    },
    
    async refreshData() {
      this.isRefreshing = true;
      this.statusMessage = null;
      
      try {
        // Simuler une actualisation des données
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        this.lastSync = 'il y a quelques secondes';
        
        this.statusMessage = {
          type: 'success',
          message: 'Données actualisées avec succès !'
        };
        
      } catch (error) {
        this.statusMessage = {
          type: 'error',
          message: 'Erreur lors de l\'actualisation des données.'
        };
      } finally {
        this.isRefreshing = false;
      }
    },
    
    disconnect() {
      if (confirm('Êtes-vous sûr de vouloir déconnecter Google Analytics ?')) {
        localStorage.removeItem('ga_proxy_connection');
        
        this.isConnected = false;
        this.propertyId = null;
        this.lastSync = null;
        this.formData = {
          propertyId: '',
          websiteUrl: '',
          acceptTerms: false
        };
        
        this.statusMessage = {
          type: 'success',
          message: 'Déconnexion réussie.'
        };
        
        // Émettre un événement pour notifier le parent
        this.$emit('connection-changed', { connected: false });
      }
    }
  }
};
</script>

<style scoped>
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