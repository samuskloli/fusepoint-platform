<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-6">
      <div class="text-center">
        <!-- Loading State -->
        <div v-if="loading" class="space-y-4">
          <div class="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-800">Connexion à Facebook</h2>
          <p class="text-gray-600">Traitement de votre authentification...</p>
        </div>
        
        <!-- Success State -->
        <div v-else-if="success" class="space-y-4">
          <div class="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-800">Connexion réussie !</h2>
          <p class="text-gray-600">Votre compte Facebook a été connecté avec succès.</p>
          <div v-if="userInfo" class="mt-4 p-4 bg-blue-50 rounded-lg">
            <p class="text-sm text-gray-700">
              <strong>Pages connectées:</strong> {{ userInfo.pages?.length || 0 }}
            </p>
          </div>
          <button
            @click="redirectToApp"
            class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continuer
          </button>
        </div>
        
        <!-- Error State -->
        <div v-else class="space-y-4">
          <div class="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-800">Erreur de connexion</h2>
          <p class="text-gray-600">{{ errorMessage }}</p>
          <div class="space-y-2">
            <button
              @click="retryConnection"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
            <button
              @click="redirectToApp"
              class="block mx-auto px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Retour à l'application
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import facebookService from '@/services/facebookService';

export default {
  name: 'FacebookCallback',
  data() {
    return {
      loading: true,
      success: false,
      errorMessage: '',
      userInfo: null
    };
  },
  async mounted() {
    await this.handleCallback();
  },
  methods: {
    /**
     * Traite la callback OAuth de Facebook
     */
    async handleCallback() {
      try {
        console.log('🔄 Début du traitement de la callback Facebook...');
        
        // Récupérer les paramètres de l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        console.log('📋 Paramètres de callback:', {
          code: code ? 'présent' : 'manquant',
          state: state ? 'présent' : 'manquant',
          error: error || 'aucune'
        });
        
        // Vérifier s'il y a une erreur dans la callback
        if (error) {
          throw new Error(errorDescription || `Erreur OAuth: ${error}`);
        }
        
        // Vérifier que le code est présent
        if (!code) {
          throw new Error('Code d\'autorisation manquant');
        }
        
        // Traiter la callback avec le service Facebook
        console.log('📞 Appel du service Facebook...');
        const result = await facebookService.handleOAuthCallback(code, state);
        
        if (result.success) {
          console.log('✅ Callback traitée avec succès');
          this.success = true;
          this.userInfo = result.user;
          
          // Nettoyer l'URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Rediriger automatiquement après 3 secondes
          setTimeout(() => {
            this.redirectToApp();
          }, 3000);
        } else {
          throw new Error('Échec de la connexion Facebook');
        }
        
      } catch (error) {
        console.error('❌ Erreur callback Facebook:', error);
        this.success = false;
        
        // Gestion spéciale pour l'erreur "Non connecté à Facebook" ou problème de connexion
        if (error.message.includes('Non connecté à Facebook') || 
            error.message.includes('Échec de l\'établissement de la connexion')) {
          console.log('🔧 Tentative de correction automatique pour erreur de token/connexion...');
          
          try {
            await this.fixTokenConnectionIssue();
            return; // Ne pas afficher l'erreur si la correction réussit
          } catch (fixError) {
            console.error('❌ Échec de la correction automatique:', fixError);
            // Continuer avec l'affichage de l'erreur
          }
        }
        
        this.errorMessage = this.getErrorMessage(error.message);
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Retourne un message d'erreur convivial
     */
    getErrorMessage(errorMessage) {
      if (errorMessage.includes('État OAuth invalide')) {
        return 'Erreur de sécurité détectée. Veuillez réessayer la connexion.';
      }
      if (errorMessage.includes('Code d\'autorisation manquant')) {
        return 'Paramètres de connexion manquants. Veuillez réessayer.';
      }
      if (errorMessage.includes('Non connecté à Facebook')) {
        return 'Problème de synchronisation. Correction en cours...';
      }
      return errorMessage || 'Une erreur inattendue s\'est produite';
    },
    
    /**
     * Redirige vers l'application principale
     */
    redirectToApp() {
      // Rediriger vers la page des connexions sociales ou le dashboard
      this.$router.push({ name: 'Integrations' }).catch(() => {
        // Fallback si la route n'existe pas
        this.$router.push({ name: 'Dashboard' }).catch(() => {
          // Fallback ultime
          this.$router.push('/');
        });
      });
    },
    
    /**
     * Réessaie la connexion
     */
    async retryConnection() {
      try {
        this.loading = true;
        this.success = false;
        this.errorMessage = '';
        
        // Relancer le processus d'authentification
        await facebookService.authenticate();
        
      } catch (error) {
        console.error('Erreur lors de la nouvelle tentative:', error);
        this.errorMessage = error.message || 'Erreur lors de la nouvelle tentative';
        this.loading = false;
      }
    },
    
    async fixTokenConnectionIssue() {
      console.log('🔧 Correction automatique du problème de token...');
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (!code || !state) {
        throw new Error('Paramètres de callback manquants');
      }
      
      // Test direct de l'échange de token
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      
      const response = await fetch(`${backendUrl}/api/facebook/oauth/exchange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, state })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur backend: ${errorData.message}`);
      }
      
      const data = await response.json();
      console.log('📊 Réponse backend:', data);
      
      if (!data.data || !data.data.accessToken) {
        throw new Error('Structure de réponse backend invalide');
      }
      
      // Appliquer manuellement les tokens avec correction d'expiration
      const { accessToken, expiresIn } = data.data;
      
      // Vérification et correction de expires_in
      let correctedExpiresIn = expiresIn;
      if (!expiresIn || expiresIn <= 0) {
        console.warn('⚠️ expires_in invalide, utilisation valeur par défaut');
        correctedExpiresIn = 60 * 24 * 60 * 60; // 60 jours
      }
      
      // Appliquer les tokens
      this.facebookService.currentUser.accessToken = accessToken;
      this.facebookService.currentUser.longLivedToken = accessToken;
      this.facebookService.currentUser.expiresAt = Date.now() + (correctedExpiresIn * 1000);
      
      // Sauvegarder
      this.facebookService.saveUserData();
      
      // Vérifier la connexion
      if (!this.facebookService.isConnected()) {
        throw new Error('La connexion échoue encore après correction');
      }
      
      console.log('✅ Correction réussie, continuation du processus...');
      
      // Continuer avec getUserId et loadUserPages
      try {
        const userId = await this.facebookService.getUserId();
        this.facebookService.currentUser.userId = userId;
        
        await this.facebookService.loadUserPages();
        this.facebookService.saveUserData();
        
        // Marquer comme succès
        this.success = true;
        this.userInfo = {
          id: userId,
          name: 'Utilisateur Facebook',
          pages: this.facebookService.currentUser.pages?.length || 0
        };
        this.errorMessage = '';
        
        console.log('🎉 Processus complet réussi!');
        
        // Redirection automatique
        setTimeout(() => {
          this.redirectToApp();
        }, 2000);
        
      } catch (apiError) {
        console.warn('⚠️ Erreur API mais token valide, redirection...');
        
        // Même en cas d'erreur API, si le token est valide, on peut continuer
        this.success = true;
        this.userInfo = {
          id: 'unknown',
          name: 'Utilisateur Facebook',
          pages: 0
        };
        this.errorMessage = '';
        
        setTimeout(() => {
          this.redirectToApp();
        }, 2000);
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

.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}
</style>