<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- En-tête -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Configuration Google Analytics</h1>
      <p class="text-gray-600">
        Connectez votre compte Google Analytics GA4 pour accéder à vos données d'audience et de performance.
      </p>
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

      <!-- Informations de connexion -->
      <div v-if="isConnected" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <div class="flex-1">
            <h3 class="text-sm font-medium text-green-800 mb-1">Connexion active</h3>
            <div class="text-sm text-green-700">
              <p><strong>Propriété GA4:</strong> {{ userInfo.propertyId }}</p>
              <p v-if="userInfo.email"><strong>Compte:</strong> {{ userInfo.email }}</p>
              <p v-if="userInfo.connectedAt"><strong>Connecté le:</strong> {{ formatDate(userInfo.connectedAt) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions de connexion -->
      <div class="space-y-3">
        <div v-if="!isConnected">
          <!-- Saisie de l'ID de propriété -->
          <div class="mb-4">
            <label for="propertyId" class="block text-sm font-medium text-gray-700 mb-2">
              ID de propriété GA4
            </label>
            <div class="relative">
              <input
                id="propertyId"
                v-model="propertyId"
                type="text"
                placeholder="ex: 123456789"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-300': propertyIdError }"
              />
              <div v-if="propertyIdError" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <p v-if="propertyIdError" class="mt-1 text-sm text-red-600">{{ propertyIdError }}</p>
            <p class="mt-1 text-sm text-gray-500">
              Vous pouvez trouver votre ID de propriété dans Google Analytics > Administration > Informations sur la propriété
            </p>
          </div>

          <!-- Bouton de connexion -->
          <button
            @click="initiateOAuth"
            :disabled="isConnecting || !isPropertyIdValid"
            class="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="isConnecting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {{ isConnecting ? 'Connexion en cours...' : 'Se connecter avec Google' }}
          </button>
        </div>

        <div v-else class="flex space-x-3">
          <button
            @click="testConnection"
            :disabled="isTesting"
            class="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <svg v-if="isTesting" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isTesting ? 'Test...' : 'Tester la connexion' }}
          </button>
          
          <button
            @click="disconnect"
            class="flex-1 flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>

    <!-- Messages d'erreur/succès -->
    <div v-if="message" class="mb-6">
      <div :class="messageClass" class="rounded-lg p-4">
        <div class="flex items-start">
          <svg :class="messageIconClass" class="w-5 h-5 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path v-if="messageType === 'success'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            <path v-else fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <div class="flex-1">
            <p :class="messageTextClass" class="text-sm font-medium">{{ message }}</p>
          </div>
          <button @click="clearMessage" class="ml-3">
            <svg class="w-4 h-4 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Informations sur l'intégration -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 class="text-lg font-medium text-blue-900 mb-3">À propos de cette intégration</h3>
      <div class="text-sm text-blue-800 space-y-2">
        <p>• <strong>Sécurisé :</strong> Utilise OAuth 2.0 avec PKCE pour une authentification sécurisée</p>
        <p>• <strong>Permissions minimales :</strong> Accès en lecture seule à vos données Google Analytics</p>
        <p>• <strong>Données locales :</strong> Vos tokens sont stockés localement dans votre navigateur</p>
        <p>• <strong>GA4 uniquement :</strong> Compatible avec Google Analytics 4 (Universal Analytics n'est plus supporté)</p>
        <p>• <strong>Révocable :</strong> Vous pouvez révoquer l'accès à tout moment depuis votre compte Google</p>
      </div>
    </div>
  </div>
</template>

<script>
import googleAnalyticsService from '../services/googleAnalyticsService.js';

export default {
  name: 'GoogleAnalyticsSetup',
  data() {
    return {
      propertyId: '',
      propertyIdError: '',
      isConnecting: false,
      isTesting: false,
      message: '',
      messageType: 'info', // 'success', 'error', 'info'
      userInfo: {
        email: '',
        propertyId: '',
        connectedAt: null
      }
    };
  },
  computed: {
    isConnected() {
      return googleAnalyticsService.isConnected();
    },
    isPropertyIdValid() {
      if (!this.propertyId) return false;
      const trimmed = this.propertyId.trim();
      // Accepter les IDs Google Analytics (9-12 chiffres) ou autres formats d'API
      return /^\d{9,12}$/.test(trimmed) || /^[a-zA-Z0-9_-]{10,}$/.test(trimmed);
    },
    connectionStatusClass() {
      return this.isConnected ? 'bg-green-500' : 'bg-gray-400';
    },
    connectionTextClass() {
      return this.isConnected ? 'text-green-700' : 'text-gray-600';
    },
    connectionStatusText() {
      return this.isConnected ? 'Connecté' : 'Non connecté';
    },
    messageClass() {
      const baseClass = 'border';
      switch (this.messageType) {
        case 'success':
          return `${baseClass} bg-green-50 border-green-200`;
        case 'error':
          return `${baseClass} bg-red-50 border-red-200`;
        default:
          return `${baseClass} bg-blue-50 border-blue-200`;
      }
    },
    messageIconClass() {
      switch (this.messageType) {
        case 'success':
          return 'text-green-600';
        case 'error':
          return 'text-red-600';
        default:
          return 'text-blue-600';
      }
    },
    messageTextClass() {
      switch (this.messageType) {
        case 'success':
          return 'text-green-800';
        case 'error':
          return 'text-red-800';
        default:
          return 'text-blue-800';
      }
    }
  },
  watch: {
    propertyId(newValue) {
      this.validatePropertyId(newValue);
    }
  },
  async mounted() {
    // Charger d'abord la configuration sauvegardée
    await this.loadSavedConfiguration();
    
    // Puis charger les informations utilisateur
    await this.loadUserInfo();
    
    // Vérifier si on revient d'un callback OAuth
    await this.handleOAuthCallback();
    
    // S'assurer que l'ID de propriété est affiché même si connecté
    if (this.isConnected && !this.propertyId && this.userInfo.propertyId) {
      this.propertyId = this.userInfo.propertyId;
    }
  },
  methods: {
    async loadUserInfo() {
      if (this.isConnected) {
        const userInfo = googleAnalyticsService.getUserInfo();
        if (userInfo) {
          this.userInfo = {
            ...this.userInfo,
            ...userInfo
          };
          
          // Ne pas écraser l'ID de propriété s'il est déjà défini
          if (userInfo.propertyId && !this.propertyId) {
            this.propertyId = userInfo.propertyId;
          }
          
          console.log('Informations utilisateur chargées:', userInfo);
        }
      }
    },

    async loadSavedConfiguration() {
      try {
        // Charger la configuration sauvegardée
        const config = googleAnalyticsService.getConfiguration();
        if (config && config.propertyId) {
          // Toujours charger l'ID de propriété depuis la config
          this.propertyId = config.propertyId;
          
          // Mettre à jour les informations utilisateur avec la config
          this.userInfo = {
            ...this.userInfo,
            propertyId: config.propertyId,
            connectedAt: config.connectedAt,
            lastSync: config.lastSync,
            status: config.status || 'unknown'
          };
          
          console.log('Configuration sauvegardée chargée:', config);
          console.log('ID de propriété défini à:', this.propertyId);
        } else {
          // Fallback: charger depuis l'ancien système
          const savedPropertyId = localStorage.getItem('ga_property_id');
          if (savedPropertyId) {
            this.propertyId = savedPropertyId;
            // Sauvegarder dans le nouveau format
            googleAnalyticsService.saveConfiguration(savedPropertyId);
            console.log('Configuration migrée depuis l\'ancien format:', savedPropertyId);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
      }
    },

    validatePropertyId(value) {
      this.propertyIdError = '';
      
      if (!value) {
        this.propertyIdError = 'L\'ID de propriété est requis';
        return false;
      }
      
      const trimmedValue = value.trim();
      // Validation flexible pour différents types d'IDs
      const isGoogleAnalyticsId = /^\d{9,12}$/.test(trimmedValue);
      const isApiKey = /^[a-zA-Z0-9_-]{10,}$/.test(trimmedValue);
      
      if (!isGoogleAnalyticsId && !isApiKey) {
        this.propertyIdError = 'Format d\'ID invalide. Utilisez un ID Google Analytics (9-12 chiffres) ou une clé API valide';
        return false;
      }
      
      return true;
    },

    async initiateOAuth() {
      if (!this.validatePropertyId(this.propertyId)) {
        return;
      }

      this.isConnecting = true;
      this.clearMessage();

      try {
        const trimmedPropertyId = this.propertyId.trim();
        
        // Sauvegarder la configuration avant l'OAuth
        googleAnalyticsService.saveConfiguration(trimmedPropertyId, {
          configuredAt: new Date().toISOString(),
          status: 'configuring'
        });
        
        // Sauvegarder temporairement l'ID de propriété
        localStorage.setItem('ga_property_id_temp', trimmedPropertyId);
        
        console.log('Initiation OAuth pour l\'ID de propriété:', trimmedPropertyId);
        
        // Initier le flux OAuth en utilisant la méthode authenticate
        await googleAnalyticsService.authenticate(trimmedPropertyId);
        
      } catch (error) {
        console.error('Erreur lors de l\'initiation OAuth:', error);
        this.showMessage('Erreur lors de l\'initiation de la connexion: ' + error.message, 'error');
        this.isConnecting = false;
      }
      // Note: isConnecting sera remis à false après le retour du callback OAuth
    },

    async testConnection() {
      this.isTesting = true;
      this.clearMessage();

      try {
        const result = await googleAnalyticsService.testConnection();
        
        if (result.success) {
          this.showMessage('Connexion testée avec succès ! Données récupérées.', 'success');
        } else {
          this.showMessage('Erreur lors du test: ' + result.message, 'error');
        }
      } catch (error) {
        console.error('Erreur lors du test de connexion:', error);
        this.showMessage('Erreur lors du test de connexion: ' + error.message, 'error');
      } finally {
        this.isTesting = false;
      }
    },

    async handleOAuthCallback() {
      try {
        // Vérifier si on a des paramètres de callback dans l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        
        if (code && state) {
          this.isConnecting = true;
          this.showMessage('Finalisation de la connexion...', 'info');
          
          // Traiter le callback OAuth
          const result = await googleAnalyticsService.handleOAuthCallback(code, state);
          
          if (result.success) {
            // Mettre à jour la configuration avec le statut connecté
            googleAnalyticsService.saveConfiguration(result.propertyId, {
              status: 'connected',
              connectedAt: new Date().toISOString()
            });
            
            // Recharger les informations
            await this.loadUserInfo();
            await this.loadSavedConfiguration();
            
            this.showMessage('Connexion Google Analytics réussie !', 'success');
            
            // Nettoyer l'URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          
          this.isConnecting = false;
        }
      } catch (error) {
        console.error('Erreur lors du callback OAuth:', error);
        this.showMessage('Erreur lors de la finalisation de la connexion: ' + error.message, 'error');
        this.isConnecting = false;
      }
    },

    async disconnect() {
      if (confirm('Êtes-vous sûr de vouloir vous déconnecter de Google Analytics ?')) {
        try {
          await googleAnalyticsService.disconnect();
          
          // Réinitialiser l'état local
          this.userInfo = {
            email: '',
            propertyId: '',
            connectedAt: null
          };
          this.propertyId = '';
          
          this.showMessage('Déconnexion réussie', 'success');
          
          // Émettre un événement pour notifier les autres composants
          this.$emit('connection-changed', { connected: false });
          
        } catch (error) {
          console.error('Erreur lors de la déconnexion:', error);
          this.showMessage('Erreur lors de la déconnexion: ' + error.message, 'error');
        }
      }
    },

    showMessage(text, type = 'info') {
      this.message = text;
      this.messageType = type;
      
      // Auto-clear success messages after 5 seconds
      if (type === 'success') {
        setTimeout(() => {
          this.clearMessage();
        }, 5000);
      }
    },

    clearMessage() {
      this.message = '';
      this.messageType = 'info';
    },

    formatDate(dateString) {
      if (!dateString) return '';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return dateString;
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