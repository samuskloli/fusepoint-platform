<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Loading State -->
        <div v-if="isProcessing" class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 class="text-lg font-medium text-gray-900 mb-2">Finalisation de la connexion...</h2>
          <p class="text-sm text-gray-600">Veuillez patienter pendant que nous configurons votre accès à Google Analytics.</p>
        </div>

        <!-- Success State -->
        <div v-else-if="status === 'success'" class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-lg font-medium text-gray-900 mb-2">Connexion réussie !</h2>
          <p class="text-sm text-gray-600 mb-4">{{ message }}</p>
          <p class="text-xs text-gray-500 mb-6">Propriété GA4: {{ propertyId }}</p>
          <button
            @click="redirectToApp"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continuer vers l'application
          </button>
        </div>

        <!-- Error State -->
        <div v-else-if="status === 'error'" class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 class="text-lg font-medium text-gray-900 mb-2">Erreur de connexion</h2>
          <p class="text-sm text-red-600 mb-4">{{ message }}</p>
          <div class="space-y-3">
            <button
              @click="retryConnection"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Réessayer
            </button>
            <button
              @click="redirectToApp"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Retour à l'application
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Debug Info (Development Only) -->
    <div v-if="isDevelopment && debugInfo" class="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
      <div class="bg-gray-100 rounded-lg p-4">
        <h3 class="text-sm font-medium text-gray-900 mb-2">Informations de débogage</h3>
        <pre class="text-xs text-gray-600 whitespace-pre-wrap">{{ JSON.stringify(debugInfo, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import googleAnalyticsService from '../services/googleAnalyticsService.js';

export default {
  name: 'OAuthCallback',
  data() {
    return {
      isProcessing: true,
      status: null, // 'success', 'error'
      message: '',
      propertyId: null,
      debugInfo: null,
      isDevelopment: import.meta.env.DEV
    };
  },
  async mounted() {
    await this.handleOAuthCallback();
  },
  methods: {
    async handleOAuthCallback() {
      try {
        // Récupérer les paramètres de l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        // Informations de débogage
        this.debugInfo = {
          url: window.location.href,
          params: Object.fromEntries(urlParams.entries()),
          timestamp: new Date().toISOString()
        };

        // Vérifier s'il y a une erreur OAuth
        if (error) {
          throw new Error(errorDescription || `Erreur OAuth: ${error}`);
        }

        // Vérifier que nous avons un code d'autorisation
        if (!code) {
          throw new Error('Code d\'autorisation manquant dans la réponse OAuth');
        }

        // Vérifier que nous avons un state
        if (!state) {
          throw new Error('Paramètre state manquant dans la réponse OAuth');
        }

        // Traiter la callback OAuth
        const result = await googleAnalyticsService.handleOAuthCallback(code, state);
        
        if (result.success) {
          this.status = 'success';
          this.message = result.message;
          this.propertyId = result.propertyId;
          
          // Ajouter les informations de succès au debug
          this.debugInfo.result = result;
        } else {
          throw new Error(result.message || 'Erreur inconnue lors du traitement OAuth');
        }

      } catch (error) {
        console.error('Erreur lors du traitement de la callback OAuth:', error);
        
        this.status = 'error';
        this.message = this.getErrorMessage(error.message);
        
        // Ajouter l'erreur au debug
        this.debugInfo.error = {
          message: error.message,
          stack: error.stack
        };
      } finally {
        this.isProcessing = false;
      }
    },

    getErrorMessage(errorMessage) {
      // Messages d'erreur plus conviviaux pour l'utilisateur
      if (errorMessage.includes('State invalide')) {
        return 'Erreur de sécurité détectée. Veuillez réessayer la connexion.';
      }
      if (errorMessage.includes('Session d\'authentification expirée')) {
        return 'La session d\'authentification a expiré. Veuillez réessayer.';
      }
      if (errorMessage.includes('access_denied')) {
        return 'Accès refusé. Vous devez autoriser l\'accès à Google Analytics pour continuer.';
      }
      if (errorMessage.includes('invalid_grant')) {
        return 'Code d\'autorisation invalide ou expiré. Veuillez réessayer la connexion.';
      }
      if (errorMessage.includes('invalid_client')) {
        return 'Erreur de configuration OAuth. Veuillez contacter le support technique.';
      }
      
      return errorMessage || 'Une erreur inattendue s\'est produite lors de la connexion.';
    },

    redirectToApp() {
      // Rediriger vers la page principale de l'application
      this.$router.push('/analytics').catch(() => {
        // Fallback si le router n'est pas disponible
        window.location.href = '/';
      });
    },

    retryConnection() {
      // Nettoyer les données temporaires et rediriger vers la page de connexion
      localStorage.removeItem('ga_oauth_temp');
      this.$router.push('/analytics/setup').catch(() => {
        // Fallback si le router n'est pas disponible
        window.location.href = '/';
      });
    }
  }
};
</script>

<style scoped>
/* Styles spécifiques au composant */
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