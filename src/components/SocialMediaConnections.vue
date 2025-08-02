<template>
  <div class="social-media-connections">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Connexions Réseaux Sociaux</h2>
      
      <!-- Facebook Connection -->
      <div class="mb-8">
        <div class="flex items-center justify-between p-4 border rounded-lg">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-800">Facebook</h3>
              <p class="text-sm text-gray-600">
                {{ facebookStatus.isConnected ? `Connecté - ${facebookStatus.pages?.length || 0} page(s)` : 'Non connecté' }}
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              v-if="!facebookStatus.isConnected"
              @click="connectFacebook"
              :disabled="facebookLoading"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="facebookLoading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion...
              </span>
              <span v-else>Connecter</span>
            </button>
            <button
              v-else
              @click="disconnectFacebook"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Déconnecter
            </button>
          </div>
        </div>
        
        <!-- Facebook Pages -->
        <div v-if="facebookStatus.isConnected" class="mt-4 ml-16">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Pages gérées :</h4>
          <div v-if="facebookStatus.pages?.length" class="space-y-2">
            <div
              v-for="page in facebookStatus.pages"
              :key="page.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="font-medium text-gray-800">{{ page.name }}</p>
                <p class="text-sm text-gray-600">{{ page.category }}</p>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="viewMetaInsights"
                  class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Voir les stats
                </button>
                <button
                  @click="diagnoseFacebookPages"
                  class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  title="Diagnostiquer les problèmes de pages"
                >
                  Diagnostic
                </button>
              </div>
            </div>
          </div>
          <div v-else class="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-yellow-800 font-medium">Aucune page trouvée</span>
            </div>
            <button
              @click="diagnoseFacebookPages"
              class="mt-2 px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
            >
              Diagnostiquer le problème
            </button>
          </div>
        </div>
      </div>
      
      <!-- Instagram Connection -->
      <div class="mb-8">
        <div class="flex items-center justify-between p-4 border rounded-lg">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-800">Instagram</h3>
              <p class="text-sm text-gray-600">
                {{ instagramStatus.isConnected ? `Connecté - @${instagramStatus.username} (${instagramStatus.accountType})` : 'Non connecté' }}
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              v-if="!instagramStatus.isConnected"
              @click="connectInstagram"
              :disabled="instagramLoading"
              class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="instagramLoading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion...
              </span>
              <span v-else>Connecter</span>
            </button>
            <button
              v-else
              @click="disconnectInstagram"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Déconnecter
            </button>
          </div>
        </div>
        
        <!-- Instagram Account Info -->
        <div v-if="instagramStatus.isConnected" class="mt-4 ml-16">
          <div class="p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-800">{{ instagramStatus.mediaCount || 0 }} publications</p>
                <p class="text-sm text-gray-600">
                  Type de compte: {{ instagramStatus.accountType }}
                  <span v-if="instagramStatus.accountType === 'BUSINESS'" class="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                    Insights disponibles
                  </span>
                </p>
              </div>
              <button
                @click="viewMetaInsights"
                :disabled="instagramStatus.accountType !== 'BUSINESS'"
                class="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Voir les stats
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Status Messages -->
      <div v-if="statusMessage" class="mt-6">
        <div 
          :class="[
            'p-4 rounded-lg',
            statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          ]"
        >
          {{ statusMessage.text }}
        </div>
      </div>

      <!-- Déconnexion globale -->
      <div v-if="hasAnyConnection" class="mt-8 pt-6 border-t border-gray-200">
        <div class="text-center">
          <h3 class="text-lg font-medium text-gray-900 mb-3">Gestion Globale</h3>
          <p class="text-sm text-gray-600 mb-4">
            Déconnectez-vous de tous les services connectés en une seule action
          </p>
          <button
            @click="showDisconnectAllModal = true"
            class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            :disabled="disconnectAllLoading"
          >
            <svg v-if="disconnectAllLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            {{ disconnectAllLoading ? 'Déconnexion...' : 'Déconnecter tous les services' }}
          </button>
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
              Vous êtes sur le point de vous déconnecter de tous les services suivants :
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
              <li v-if="googleAnalyticsStatus?.isConnected" class="flex items-center">
                <span class="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                Google Analytics
              </li>
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
  </div>
</template>

<script>
import facebookService from '@/services/facebookService';
import instagramService from '@/services/instagramService';
import googleAnalyticsService from '@/services/googleAnalyticsService';

export default {
  name: 'SocialMediaConnections',
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
      googleAnalyticsStatus: {
        isConnected: false,
        email: null,
        propertyId: null
      },
      facebookLoading: false,
      instagramLoading: false,
      disconnectAllLoading: false,
      showDisconnectAllModal: false,
      statusMessage: null
    };
  },
  computed: {
    hasAnyConnection() {
      return this.facebookStatus.isConnected || 
             this.instagramStatus.isConnected || 
             (this.googleAnalyticsStatus && this.googleAnalyticsStatus.isConnected);
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
        
        // Vérifier Google Analytics
        const gaConnected = googleAnalyticsService.isConnected();
        if (gaConnected) {
          this.googleAnalyticsStatus = {
            isConnected: true,
            email: googleAnalyticsService.currentUser.email || 'Connecté',
            propertyId: googleAnalyticsService.currentUser.propertyId
          };
        }
        
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
      }
    },
    
    /**
     * Connecter Facebook
     */
    async connectFacebook() {
      try {
        this.facebookLoading = true;
        await facebookService.authenticate();
      } catch (error) {
        console.error('Erreur connexion Facebook:', error);
        this.showMessage('Erreur lors de la connexion à Facebook: ' + error.message, 'error');
      } finally {
        this.facebookLoading = false;
      }
    },
    
    /**
     * Déconnecter Facebook
     */
    async disconnectFacebook() {
      try {
        await facebookService.disconnect();
        this.facebookStatus = {
          isConnected: false,
          pages: [],
          user: null
        };
        this.showMessage('Déconnecté de Facebook avec succès', 'success');
      } catch (error) {
        console.error('Erreur déconnexion Facebook:', error);
        this.showMessage('Erreur lors de la déconnexion de Facebook', 'error');
      }
    },
    
    /**
     * Connecter Instagram
     */
    async connectInstagram() {
      try {
        this.instagramLoading = true;
        await instagramService.authenticate();
      } catch (error) {
        console.error('Erreur connexion Instagram:', error);
        this.showMessage('Erreur lors de la connexion à Instagram: ' + error.message, 'error');
      } finally {
        this.instagramLoading = false;
      }
    },
    
    /**
     * Déconnecter Instagram
     */
    async disconnectInstagram() {
      try {
        await instagramService.disconnect();
        this.instagramStatus = {
          isConnected: false,
          username: null,
          accountType: null,
          mediaCount: 0
        };
        this.showMessage('Déconnecté d\'Instagram avec succès', 'success');
      } catch (error) {
        console.error('Erreur déconnexion Instagram:', error);
        this.showMessage('Erreur lors de la déconnexion d\'Instagram', 'error');
      }
    },
    
    /**
     * Voir les insights Meta unifiés
     */
    viewMetaInsights() {
      // Rediriger vers la page Meta Insights unifiée
      this.$router.push({
        name: 'MetaInsights'
      });
    },
    
    /**
     * Déconnecter tous les services
     */
    async disconnectAllServices() {
      try {
        this.disconnectAllLoading = true;
        
        // Déconnecter Facebook si connecté
        if (this.facebookStatus.isConnected) {
          await facebookService.disconnect();
          this.facebookStatus = {
            isConnected: false,
            pages: [],
            user: null
          };
        }
        
        // Déconnecter Instagram si connecté
        if (this.instagramStatus.isConnected) {
          await instagramService.disconnect();
          this.instagramStatus = {
            isConnected: false,
            username: null,
            accountType: null,
            mediaCount: 0
          };
        }
        
        // Déconnecter Google Analytics si connecté
         if (this.googleAnalyticsStatus && this.googleAnalyticsStatus.isConnected) {
           await googleAnalyticsService.disconnect();
           this.googleAnalyticsStatus = {
             isConnected: false,
             email: null,
             propertyId: null
           };
         }
        
        this.showDisconnectAllModal = false;
        this.showMessage('Tous les services ont été déconnectés avec succès', 'success');
        
      } catch (error) {
        console.error('Erreur lors de la déconnexion globale:', error);
        this.showMessage('Erreur lors de la déconnexion de certains services', 'error');
      } finally {
        this.disconnectAllLoading = false;
      }
    },

    /**
     * Diagnostic et réparation automatique des problèmes Facebook
     */
    async diagnoseFacebookPages() {
      try {
        this.showMessage('Diagnostic en cours...', 'info');
        
        // Lancer le diagnostic automatique
        const diagnostic = await facebookService.diagnosePagesIssue();
        
        console.log('🔍 Résultats du diagnostic:', diagnostic);
        
        // Si le problème est résolu automatiquement
        if (diagnostic.fixed) {
          this.showMessage('Problème résolu automatiquement! Pages rechargées.', 'success');
          await this.checkConnectionStatus();
          return;
        }
        
        // Si aucun problème détecté
        if (diagnostic.issues.includes('Aucun problème détecté')) {
          this.showMessage('Aucun problème détecté. Le système fonctionne correctement.', 'success');
          return;
        }
        
        // Si réparation automatique possible
        if (diagnostic.canAutoFix) {
          const confirmRepair = confirm(
            `Problèmes détectés:\n${diagnostic.issues.join('\n')}\n\nVoulez-vous tenter une réparation automatique?`
          );
          
          if (confirmRepair) {
            this.showMessage('Réparation en cours...', 'info');
            
            const repair = await facebookService.autoFixPagesIssue();
            
            if (repair.success) {
              this.showMessage(`Réparation réussie! ${repair.message}`, 'success');
              await this.checkConnectionStatus();
            } else {
              this.showMessage(`Échec de la réparation: ${repair.message}`, 'error');
              this.showManualSolutions(diagnostic.solutions);
            }
          }
        } else {
          // Afficher les solutions manuelles
          this.showManualSolutions(diagnostic.solutions);
        }
        
      } catch (error) {
        console.error('Erreur lors du diagnostic:', error);
        this.showMessage('Erreur lors du diagnostic. Consultez la console pour plus de détails.', 'error');
      }
    },

    /**
     * Affiche les solutions manuelles à l'utilisateur
     */
    showManualSolutions(solutions) {
      const solutionsText = solutions.join('\n• ');
      alert(
        `Actions manuelles requises:\n\n• ${solutionsText}\n\nConsultez la console (F12) pour plus de détails.`
      );
    },
    
    /**
     * Afficher un message de statut
     */
    showMessage(text, type = 'info') {
      this.statusMessage = { text, type };
      
      // Effacer le message après 5 secondes
      setTimeout(() => {
        this.statusMessage = null;
      }, 5000);
    }
  }
};
</script>

<style scoped>
.social-media-connections {
  max-width: 800px;
  margin: 0 auto;
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