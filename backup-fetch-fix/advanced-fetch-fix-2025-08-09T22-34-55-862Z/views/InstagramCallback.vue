<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-6">
      <div class="text-center">
        <!-- Loading State -->
        <div v-if="loading" class="space-y-4">
          <div class="w-16 h-16 mx-auto bg-pink-100 rounded-full flex items-center justify-center">
            <svg class="animate-spin h-8 w-8 text-pink-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-800">Connexion à Instagram</h2>
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
          <p class="text-gray-600">Votre compte Instagram a été connecté avec succès.</p>
          <div v-if="userInfo" class="mt-4 p-4 bg-pink-50 rounded-lg">
            <p class="text-sm text-gray-700">
              <strong>Compte:</strong> {{ userInfo.username || 'Non disponible' }}
            </p>
            <p class="text-sm text-gray-700">
              <strong>Type:</strong> {{ userInfo.account_type || 'Personnel' }}
            </p>
          </div>
          <button
            @click="redirectToApp"
            class="mt-4 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
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
              class="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
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
import instagramService from '@/services/instagramService';

export default {
  name: 'InstagramCallback',
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
     * Traite la callback OAuth d'Instagram
     */
    async handleCallback() {
      try {
        // Récupérer les paramètres de l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        // Vérifier s'il y a une erreur dans la callback
        if (error) {
          throw new Error(errorDescription || `Erreur OAuth: ${error}`);
        }
        
        // Vérifier que le code est présent
        if (!code) {
          throw new Error('Code d\'autorisation manquant');
        }
        
        // Traiter la callback avec le service Instagram
        const result = await instagramService.handleOAuthCallback(code, state);
        
        if (result.success) {
          this.success = true;
          this.userInfo = result.user;
          
          // Nettoyer l'URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Rediriger automatiquement après 3 secondes
          setTimeout(() => {
            this.redirectToApp();
          }, 3000);
        } else {
          throw new Error('Échec de la connexion Instagram');
        }
        
      } catch (error) {
        console.error('Erreur callback Instagram:', error);
        this.success = false;
        this.errorMessage = error.message || 'Une erreur inattendue s\'est produite';
      } finally {
        this.loading = false;
      }
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
        await instagramService.authenticate();
        
      } catch (error) {
        console.error('Erreur lors de la nouvelle tentative:', error);
        this.errorMessage = error.message || 'Erreur lors de la nouvelle tentative';
        this.loading = false;
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