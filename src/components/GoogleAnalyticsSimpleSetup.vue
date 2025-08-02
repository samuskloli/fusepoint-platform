<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg class="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </div>
        <div>
          <h3 class="font-medium text-gray-900">Google Analytics</h3>
          <p class="text-sm text-gray-600">Analytics et suivi des performances</p>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <span :class="[
          'w-2 h-2 rounded-full',
          isConnected ? 'bg-green-500' : 'bg-gray-300'
        ]"></span>
        <span class="text-sm font-medium" :class="[
          isConnected ? 'text-green-600' : 'text-gray-500'
        ]">
          {{ connectionStatus }}
        </span>
      </div>
    </div>
    
    <p class="text-sm text-gray-600 mb-4">
      {{ isConnected ? 'Données synchronisées et disponibles dans le tableau de bord' : 'Entrez votre ID de propriété GA4 pour commencer' }}
    </p>
    
    <!-- Configuration simple -->
    <div v-if="!isConnected" class="space-y-4">
      <div>
        <label for="propertyId" class="block text-sm font-medium text-gray-700 mb-2">
          ID de propriété Google Analytics (GA4)
        </label>
        <div class="flex space-x-2">
          <input
            id="propertyId"
            v-model="propertyId"
            type="text"
            placeholder="Ex: 123456789"
            class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :disabled="isConnecting"
          >
          <button
            @click="connectWithPropertyId"
            :disabled="!propertyId.trim() || isConnecting"
            class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <svg v-if="isConnecting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isConnecting ? 'Configuration...' : 'Configurer' }}
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          Trouvez votre ID dans Google Analytics > Administration > Informations sur la propriété
        </p>
      </div>
    </div>
    
    <!-- État connecté -->
    <div v-else class="space-y-4">
      <div class="bg-green-50 border border-green-200 rounded-md p-3">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <div>
            <p class="text-sm font-medium text-green-800">Google Analytics configuré</p>
            <p class="text-xs text-green-600">Propriété: {{ currentPropertyId }}</p>
            <p class="text-xs text-green-600">Dernière sync: {{ lastSync }}</p>
          </div>
        </div>
      </div>
      
      <div class="flex space-x-2">
        <button
          @click="viewDashboard"
          class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Voir le tableau de bord
        </button>
        <button
          @click="disconnect"
          class="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
        >
          Déconnecter
        </button>
      </div>
    </div>
    
    <!-- Messages -->
    <div v-if="message" :class="messageClass" class="mt-4 p-3 rounded-md">
      <div class="flex items-center">
        <svg :class="messageIconClass" class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path v-if="messageType === 'success'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          <path v-else fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <p :class="messageTextClass" class="text-sm font-medium">{{ message }}</p>
        <button @click="clearMessage" class="ml-auto">
          <svg class="w-4 h-4 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import googleAnalyticsService from '../services/googleAnalyticsService.js';

export default {
  name: 'GoogleAnalyticsSimpleSetup',
  data() {
    return {
      isConnected: false,
      isConnecting: false,
      propertyId: '',
      currentPropertyId: '',
      lastSync: 'Jamais',
      connectionStatus: 'Non connecté',
      message: '',
      messageType: 'info' // 'success', 'error', 'info'
    };
  },
  computed: {
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
  mounted() {
    this.checkConnectionStatus();
    this.loadSavedConfiguration();
    
    // Écouter les changements de localStorage
    window.addEventListener('storage', this.handleStorageChange);
    window.addEventListener('focus', this.handleWindowFocus);
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange);
    window.removeEventListener('focus', this.handleWindowFocus);
  },
  methods: {
    async checkConnectionStatus() {
      try {
        const status = googleAnalyticsService.getConnectionStatus();
        const config = googleAnalyticsService.getConfiguration();
        
        this.isConnected = status.connected;
        
        if (status.status === 'connected') {
          this.connectionStatus = 'Connecté';
          this.currentPropertyId = config?.propertyId || '';
          this.updateLastSyncFromConfig(config);
        } else if (status.status === 'configured') {
          this.connectionStatus = 'Configuré (déconnecté)';
          this.currentPropertyId = config?.propertyId || '';
          this.propertyId = config?.propertyId || '';
          this.updateLastSyncFromConfig(config);
        } else {
          this.connectionStatus = 'Non connecté';
          this.lastSync = 'Jamais';
        }
        
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
        this.isConnected = false;
        this.connectionStatus = 'Erreur';
      }
    },
    
    async loadSavedConfiguration() {
      try {
        const config = googleAnalyticsService.getConfiguration();
        if (config && config.propertyId) {
          this.propertyId = config.propertyId;
          this.currentPropertyId = config.propertyId;
          console.log('Configuration chargée:', config);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
      }
    },
    
    async connectWithPropertyId() {
      if (!this.propertyId.trim()) {
        this.showMessage('Veuillez entrer un ID de propriété valide', 'error');
        return;
      }
      
      this.isConnecting = true;
      this.clearMessage();
      
      try {
        // Sauvegarder la configuration avec l'ID de propriété
        const config = googleAnalyticsService.saveConfiguration(this.propertyId.trim(), {
          status: 'configured',
          configuredAt: new Date().toISOString(),
          method: 'simple_setup'
        });
        
        if (config) {
          this.currentPropertyId = this.propertyId.trim();
          this.isConnected = true;
          this.connectionStatus = 'Connecté';
          this.lastSync = 'Configuration initiale';
          
          this.showMessage('Google Analytics configuré avec succès !', 'success');
          
          // Émettre un événement pour notifier les autres composants
          this.$emit('connection-changed', { connected: true, propertyId: this.currentPropertyId });
          
          // Rediriger vers le tableau de bord après un délai
          setTimeout(() => {
            this.viewDashboard();
          }, 2000);
        } else {
          throw new Error('Erreur lors de la sauvegarde de la configuration');
        }
        
      } catch (error) {
        console.error('Erreur lors de la configuration:', error);
        this.showMessage('Erreur lors de la configuration: ' + error.message, 'error');
      } finally {
        this.isConnecting = false;
      }
    },
    
    async disconnect() {
      if (confirm('Êtes-vous sûr de vouloir déconnecter Google Analytics ?')) {
        try {
          await googleAnalyticsService.disconnect();
          
          this.isConnected = false;
          this.connectionStatus = 'Non connecté';
          this.lastSync = 'Jamais';
          this.currentPropertyId = '';
          
          this.showMessage('Google Analytics déconnecté avec succès', 'success');
          
          // Émettre un événement pour notifier les autres composants
          this.$emit('connection-changed', { connected: false });
          
        } catch (error) {
          console.error('Erreur lors de la déconnexion:', error);
          this.showMessage('Erreur lors de la déconnexion: ' + error.message, 'error');
        }
      }
    },
    
    viewDashboard() {
      // Rediriger vers le tableau de bord Google Analytics
      this.$router.push('/analytics');
    },
    
    updateLastSyncFromConfig(config) {
      if (config) {
        if (config.lastSync) {
          this.lastSync = new Date(config.lastSync).toLocaleString('fr-FR');
        } else if (config.connectedAt) {
          this.lastSync = new Date(config.connectedAt).toLocaleString('fr-FR');
        } else if (config.configuredAt) {
          this.lastSync = new Date(config.configuredAt).toLocaleString('fr-FR');
        }
      }
    },
    
    handleStorageChange(event) {
      if (event.key === 'ga_config' || event.key === 'ga_user_data') {
        this.checkConnectionStatus();
      }
    },
    
    handleWindowFocus() {
      this.checkConnectionStatus();
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
    }
  }
};
</script>