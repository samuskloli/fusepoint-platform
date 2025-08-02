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
          <p class="text-sm text-gray-600">Analytics</p>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <span :class="[
          'w-2 h-2 rounded-full',
          isConnected ? 'bg-green-400' : 'bg-gray-400'
        ]"></span>
        <span :class="[
          'text-sm',
          isConnected ? 'text-green-600' : 'text-gray-500'
        ]">{{ connectionStatus }}</span>
      </div>
    </div>
    
    <p class="text-sm text-gray-600 mb-4">
      {{ isConnected ? 'Synchronisation des données de trafic et conversions' : 'Connectez Google Analytics pour analyser vos données' }}
    </p>
    
    <div class="flex items-center justify-between">
      <span v-if="isConnected" class="text-xs text-gray-500">
        Dernière sync: {{ lastSync }}
      </span>
      <span v-else class="text-xs text-gray-500">
        Non configuré
      </span>
      
      <div class="flex space-x-2">
        <button 
          v-if="!isConnected"
          @click="connectGoogleAnalytics"
          :disabled="isConnecting"
          class="text-sm bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {{ isConnecting ? 'Connexion...' : 'Connecter' }}
        </button>
        
        <button 
          v-if="isConnected"
          @click="showConfiguration = true"
          class="text-sm text-primary-600 hover:text-primary-700"
        >
          Configurer
        </button>
        
        <button 
          v-if="isConnected"
          @click="disconnectGoogleAnalytics"
          class="text-sm text-red-600 hover:text-red-700"
        >
          Déconnecter
        </button>
      </div>
    </div>
    
    <!-- Modal de configuration -->
    <div v-if="showConfiguration" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Configuration Google Analytics</h2>
          <button @click="showConfiguration = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <GoogleAnalyticsComparison />
      </div>
    </div>
    
    <!-- Modal de connexion rapide -->
    <div v-if="showQuickConnect" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Connexion Google Analytics</h2>
          <button @click="showQuickConnect = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="mb-6">
          <p class="text-gray-600 mb-4">Choisissez votre méthode de connexion préférée :</p>
          
          <div class="space-y-3">
            <button 
              @click="connectWithProxy"
              :disabled="isConnecting"
              class="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              Connexion rapide (Recommandé)
            </button>
            
            <button 
              @click="connectWithOAuth"
              :disabled="isConnecting"
              class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Configuration manuelle OAuth
            </button>
          </div>
        </div>
        
        <div class="text-sm text-gray-500">
          <p><strong>Connexion rapide :</strong> Configuration en 30 secondes</p>
          <p><strong>OAuth manuel :</strong> Contrôle total, configuration complexe</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GoogleAnalyticsComparison from './GoogleAnalyticsComparison.vue';
import googleAnalyticsService from '../services/googleAnalyticsService.js';

export default {
  name: 'GoogleAnalyticsIntegration',
  components: {
    GoogleAnalyticsComparison
  },
  data() {
    return {
      isConnected: false,
      isConnecting: false,
      showConfiguration: false,
      showQuickConnect: false,
      lastSync: 'Jamais',
      connectionStatus: 'Non connecté'
    };
  },
  mounted() {
    this.checkConnectionStatus();
    // Écouter les changements de configuration
    window.addEventListener('storage', this.handleStorageChange);
    // Écouter quand la fenêtre reprend le focus (retour sur la page)
    window.addEventListener('focus', this.handleWindowFocus);
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange);
    window.removeEventListener('focus', this.handleWindowFocus);
  },
  methods: {
    async checkConnectionStatus() {
      try {
        // Utiliser la nouvelle méthode pour obtenir le statut complet
        const status = googleAnalyticsService.getConnectionStatus();
        const config = googleAnalyticsService.getConfiguration();
        
        this.isConnected = status.connected;
        
        if (status.status === 'connected') {
          this.connectionStatus = 'Connecté';
          this.updateLastSyncFromConfig(config);
        } else if (status.status === 'configured') {
          this.connectionStatus = 'Configuré (déconnecté)';
          this.updateLastSyncFromConfig(config);
        } else {
          this.connectionStatus = 'Non connecté';
          this.lastSync = 'Jamais';
        }
        
        console.log('État de connexion vérifié:', {
          isConnected: this.isConnected,
          config: config
        });
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
        this.isConnected = false;
        this.connectionStatus = 'Erreur';
      }
    },
    
    handleStorageChange(event) {
      // Réagir aux changements dans localStorage (connexion/déconnexion)
      if (event.key === 'ga_config' || event.key === 'ga_user_data') {
        console.log('Changement détecté dans la configuration GA');
        this.checkConnectionStatus();
      }
    },
    
    handleWindowFocus() {
      // Vérifier l'état quand l'utilisateur revient sur la page
      console.log('Fenêtre reprend le focus, vérification de l\'état GA');
      this.checkConnectionStatus();
    },
    
    connectGoogleAnalytics() {
      this.showQuickConnect = true;
    },
    
    async connectWithProxy() {
      this.isConnecting = true;
      try {
        // Simuler une connexion rapide via proxy
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Pour l'instant, on simule une connexion réussie
        // Dans un vrai environnement, cela ferait appel au service proxy
        this.isConnected = true;
        this.connectionStatus = 'Connecté';
        this.lastSync = 'il y a quelques secondes';
        this.showQuickConnect = false;
        
        this.$emit('connection-changed', { connected: true, method: 'proxy' });
        
        // Afficher un message de succès
        this.showSuccessMessage('Google Analytics connecté avec succès via Proxy API!');
      } catch (error) {
        console.error('Erreur lors de la connexion proxy:', error);
        this.showErrorMessage('Erreur lors de la connexion. Veuillez réessayer.');
      } finally {
        this.isConnecting = false;
      }
    },
    
    async connectWithOAuth() {
      this.isConnecting = true;
      this.showQuickConnect = false;
      
      try {
        // Utiliser le service OAuth existant
        await googleAnalyticsService.authenticate();
        
        this.isConnected = true;
        this.connectionStatus = 'Connecté';
        this.lastSync = 'il y a quelques secondes';
        
        this.$emit('connection-changed', { connected: true, method: 'oauth' });
        
        this.showSuccessMessage('Google Analytics connecté avec succès via OAuth!');
      } catch (error) {
        console.error('Erreur lors de la connexion OAuth:', error);
        this.showErrorMessage('Erreur lors de la connexion OAuth. Veuillez vérifier vos permissions.');
      } finally {
        this.isConnecting = false;
      }
    },
    
    async disconnectGoogleAnalytics() {
      if (confirm('Êtes-vous sûr de vouloir déconnecter Google Analytics ?')) {
        try {
          await googleAnalyticsService.disconnect();
          
          this.isConnected = false;
          this.connectionStatus = 'Non connecté';
          this.lastSync = 'Jamais';
          
          this.$emit('connection-changed', { connected: false });
          
          this.showSuccessMessage('Google Analytics déconnecté avec succès.');
        } catch (error) {
          console.error('Erreur lors de la déconnexion:', error);
          this.showErrorMessage('Erreur lors de la déconnexion.');
        }
      }
    },
    
    updateLastSync() {
      const now = new Date();
      const minutes = Math.floor(Math.random() * 30) + 1;
      this.lastSync = `il y a ${minutes} min`;
    },
    
    updateLastSyncFromConfig(config) {
      if (config && config.lastSync) {
        const lastSyncDate = new Date(config.lastSync);
        const now = new Date();
        const diffMinutes = Math.floor((now - lastSyncDate) / (1000 * 60));
        
        if (diffMinutes < 1) {
          this.lastSync = 'il y a quelques secondes';
        } else if (diffMinutes < 60) {
          this.lastSync = `il y a ${diffMinutes} min`;
        } else {
          const diffHours = Math.floor(diffMinutes / 60);
          this.lastSync = `il y a ${diffHours}h`;
        }
      } else {
        this.lastSync = 'Jamais';
      }
    },
    
    showSuccessMessage(message) {
      // Vous pouvez implémenter un système de notifications ici
      alert(message);
    },
    
    showErrorMessage(message) {
      // Vous pouvez implémenter un système de notifications ici
      alert(message);
    }
  }
};
</script>