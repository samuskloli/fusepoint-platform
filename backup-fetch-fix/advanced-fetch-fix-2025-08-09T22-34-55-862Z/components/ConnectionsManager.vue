<template>
  <div class="connections-manager">
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Connexions de Comptes</h2>
          <p class="text-sm text-gray-600 mt-1">
            Gérez vos connexions aux différents services
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500">{{ connectedCount }}/3 connectés</span>
          <div class="w-16 bg-gray-200 rounded-full h-2">
            <div 
              class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              :style="{ width: (connectedCount / 3 * 100) + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Liste des connexions -->
      <div class="space-y-4">
        <!-- Facebook -->
        <div class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Facebook</h3>
              <p class="text-sm text-gray-500">
                {{ facebookStatus.isConnected ? 
                  `Connecté - ${facebookStatus.pages?.length || 0} page(s)` : 
                  'Non connecté' 
                }}
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <div :class="facebookStatus.isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" 
                 class="px-2 py-1 rounded-full text-xs font-medium">
              {{ facebookStatus.isConnected ? 'Connecté' : 'Déconnecté' }}
            </div>
            <button
              v-if="facebookStatus.isConnected"
              @click="disconnectService('facebook')"
              class="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Déconnecter
            </button>
          </div>
        </div>

        <!-- Instagram -->
        <div class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Instagram</h3>
              <p class="text-sm text-gray-500">
                {{ instagramStatus.isConnected ? 
                  `Connecté - @${instagramStatus.username}` : 
                  'Non connecté' 
                }}
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <div :class="instagramStatus.isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" 
                 class="px-2 py-1 rounded-full text-xs font-medium">
              {{ instagramStatus.isConnected ? 'Connecté' : 'Déconnecté' }}
            </div>
            <button
              v-if="instagramStatus.isConnected"
              @click="disconnectService('instagram')"
              class="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Déconnecter
            </button>
          </div>
        </div>

        <!-- Google Analytics -->
        <div class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Google Analytics</h3>
              <p class="text-sm text-gray-500">
                Non connecté (Google Analytics supprimé)
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <div class="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
              Supprimé
            </div>
          </div>
        </div>
      </div>

      <!-- Actions globales -->
      <div v-if="connectedCount > 1" class="mt-6 pt-6 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-900">Actions globales</h3>
            <p class="text-xs text-gray-500 mt-1">
              Gérez toutes vos connexions en une seule action
            </p>
          </div>
          <button
            @click="showDisconnectAllModal = true"
            class="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            :disabled="disconnectAllLoading"
          >
            <svg v-if="disconnectAllLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ disconnectAllLoading ? 'Déconnexion...' : 'Tout déconnecter' }}
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div v-if="message" class="mt-4 p-4 rounded-lg" :class="messageClass">
        <div class="flex items-start">
          <svg v-if="messageType === 'success'" class="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <svg v-else-if="messageType === 'error'" class="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-medium" :class="messageType === 'success' ? 'text-green-800' : 'text-red-800'">{{ message }}</p>
          </div>
          <button @click="clearMessage" class="ml-3">
            <svg class="w-4 h-4 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Modale de confirmation pour déconnexion globale -->
    <div v-if="showDisconnectAllModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showDisconnectAllModal = false">
      <div class="bg-white rounded-lg p-6 max-w-md mx-4 transform transition-all">
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900">Confirmer la déconnexion globale</h3>
        </div>
        <div class="mb-4">
          <p class="text-gray-600 mb-3">
            Vous êtes sur le point de vous déconnecter de tous les services connectés :
          </p>
          <ul class="text-sm text-gray-700 space-y-1">
            <li v-if="facebookStatus.isConnected" class="flex items-center">
              <span class="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              Facebook ({{ facebookStatus.pages?.length || 0 }} page(s))
            </li>
            <li v-if="instagramStatus.isConnected" class="flex items-center">
              <span class="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mr-2"></span>
              Instagram (@{{ instagramStatus.username }})
            </li>
            <!-- Google Analytics connection removed -->
          </ul>
        </div>
        <p class="text-sm text-gray-500 mb-6">
          Cette action supprimera toutes les données de connexion stockées localement. Vous devrez vous reconnecter à chaque service individuellement.
        </p>
        <div class="flex space-x-3">
          <button 
            @click="disconnectAllServices" 
            class="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            :disabled="disconnectAllLoading"
          >
            {{ disconnectAllLoading ? 'Déconnexion...' : 'Confirmer la déconnexion' }}
          </button>
          <button 
            @click="showDisconnectAllModal = false" 
            class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            :disabled="disconnectAllLoading"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import facebookService from '../services/facebookService.js';
import instagramService from '../services/instagramService.js';
// Google Analytics service removed

export default {
  name: 'ConnectionsManager',
  data() {
    return {
      facebookStatus: {
        isConnected: false,
        pages: [],
        user: null
      },
      instagramStatus: {
        isConnected: false,
        username: null,
        accountType: null,
        mediaCount: 0
      },
      // googleAnalyticsStatus removed,
      disconnectAllLoading: false,
      showDisconnectAllModal: false,
      message: '',
      messageType: 'info'
    };
  },
  computed: {
    connectedCount() {
      let count = 0;
      if (this.facebookStatus.isConnected) count++;
      if (this.instagramStatus.isConnected) count++;
      // Google Analytics connection check removed
      return count;
    },
    messageClass() {
      return {
        'bg-green-50 border border-green-200': this.messageType === 'success',
        'bg-red-50 border border-red-200': this.messageType === 'error',
        'bg-blue-50 border border-blue-200': this.messageType === 'info'
      };
    }
  },
  mounted() {
    this.checkConnectionStatus();
  },
  methods: {
    /**
     * Vérifier le statut de connexion des services
     */
    async checkConnectionStatus() {
      try {
        // Vérifier Facebook
        const fbConnected = await facebookService.isConnected();
        if (fbConnected) {
          const fbPages = await facebookService.getAvailablePages();
          this.facebookStatus = {
            isConnected: true,
            pages: fbPages.data || [],
            user: facebookService.currentUser
          };
        }
        
        // Vérifier Instagram
        const igConnected = await instagramService.isConnected();
        if (igConnected) {
          this.instagramStatus = {
            isConnected: true,
            username: instagramService.currentUser.username,
            accountType: instagramService.currentUser.accountType,
            mediaCount: instagramService.currentUser.mediaCount || 0
          };
        }
        
        // Google Analytics status check removed
        
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
      }
    },

    /**
     * Déconnecter un service spécifique
     */
    async disconnectService(service) {
      try {
        switch (service) {
          case 'facebook':
            await facebookService.disconnect();
            this.facebookStatus = {
              isConnected: false,
              pages: [],
              user: null
            };
            this.showMessage('Déconnecté de Facebook avec succès', 'success');
            break;
            
          case 'instagram':
            await instagramService.disconnect();
            this.instagramStatus = {
              isConnected: false,
              username: null,
              accountType: null,
              mediaCount: 0
            };
            this.showMessage('Déconnecté d\'Instagram avec succès', 'success');
            break;
            
          // Google Analytics disconnect case removed
        }
        
        // Émettre un événement pour notifier le parent
        this.$emit('connection-updated', {
          service,
          isConnected: false
        });
        
      } catch (error) {
        console.error(`Erreur lors de la déconnexion de ${service}:`, error);
        this.showMessage(`Erreur lors de la déconnexion de ${service}`, 'error');
      }
    },

    /**
     * Déconnecter tous les services
     */
    async disconnectAllServices() {
      try {
        this.disconnectAllLoading = true;
        
        const disconnectPromises = [];
        
        // Déconnecter Facebook si connecté
        if (this.facebookStatus.isConnected) {
          disconnectPromises.push(
            facebookService.disconnect().then(() => {
              this.facebookStatus = {
                isConnected: false,
                pages: [],
                user: null
              };
            })
          );
        }
        
        // Déconnecter Instagram si connecté
        if (this.instagramStatus.isConnected) {
          disconnectPromises.push(
            instagramService.disconnect().then(() => {
              this.instagramStatus = {
                isConnected: false,
                username: null,
                accountType: null,
                mediaCount: 0
              };
            })
          );
        }
        
        // Google Analytics disconnect removed
        
        // Attendre que toutes les déconnexions soient terminées
        await Promise.all(disconnectPromises);
        
        this.showDisconnectAllModal = false;
        this.showMessage('Tous les services ont été déconnectés avec succès', 'success');
        
        // Émettre un événement pour notifier le parent
        this.$emit('all-disconnected');
        
      } catch (error) {
        console.error('Erreur lors de la déconnexion globale:', error);
        this.showMessage('Erreur lors de la déconnexion de certains services', 'error');
      } finally {
        this.disconnectAllLoading = false;
      }
    },

    /**
     * Afficher un message
     */
    showMessage(text, type = 'info') {
      this.message = text;
      this.messageType = type;
      
      // Auto-hide après 5 secondes
      setTimeout(() => {
        this.clearMessage();
      }, 5000);
    },

    /**
     * Effacer le message
     */
    clearMessage() {
      this.message = '';
      this.messageType = 'info';
    }
  }
};
</script>

<style scoped>
.connections-manager {
  /* Styles spécifiques si nécessaire */
}

/* Animation pour la modale */
.transform {
  transform: scale(1);
}

/* Transition pour les états de connexion */
.transition-colors {
  transition: background-color 0.2s ease, color 0.2s ease;
}
</style>