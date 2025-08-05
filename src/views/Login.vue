<template>
  <div class="min-h-screen flex">
    <!-- Colonne gauche - Image FUSEPOINT (cachée sur mobile) -->
    <div class="hidden lg:flex lg:w-2/5 relative overflow-hidden" style="background-image: url('/Billboards.jpg'); background-size: cover; background-position: center;">
    </div>
    
    <!-- Séparateur élégant entre les colonnes -->
    <div class="hidden lg:block w-px bg-gradient-to-b from-transparent via-gray-300/50 to-transparent relative">
      <div class="absolute inset-0 bg-gradient-to-b from-blue-200/30 via-purple-200/30 to-indigo-200/30"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg border border-gray-200">
        <div class="absolute inset-0.5 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"></div>
      </div>
    </div>
    
    <!-- Colonne droite - Formulaire de connexion -->
    <div class="w-full lg:w-3/5 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Éléments décoratifs d'arrière-plan pour mobile -->
      <div class="absolute inset-0 overflow-hidden lg:hidden">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <!-- Éléments décoratifs flottants -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <!-- Cercle géant avec dégradé -->
        <div class="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-blue-400/15 to-purple-500/15 rounded-full animate-pulse" style="animation-duration: 4s;"></div>
        
        <!-- Cercles moyens -->
        <div class="absolute top-1/3 left-10 w-20 h-20 bg-indigo-400/10 rounded-full animate-float" style="animation-delay: 1s; animation-duration: 6s;"></div>
        <div class="absolute bottom-1/4 right-1/4 w-16 h-16 bg-purple-400/8 rounded-full animate-pulse" style="animation-delay: 2s; animation-duration: 5s;"></div>
        
        <!-- Petits cercles -->
        <div class="absolute top-1/2 right-1/3 w-12 h-12 bg-blue-300/12 rounded-full animate-float" style="animation-delay: 3s; animation-duration: 7s;"></div>
        <div class="absolute bottom-1/3 left-1/4 w-10 h-10 bg-indigo-300/10 rounded-full animate-pulse" style="animation-delay: 4s; animation-duration: 6s;"></div>
        <div class="absolute top-3/4 left-1/2 w-8 h-8 bg-purple-300/8 rounded-full animate-float" style="animation-delay: 5s; animation-duration: 5s;"></div>
      </div>
      
      <div class="max-w-md w-full space-y-8 relative z-10">
        <div class="text-center">
          <!-- Logo mobile uniquement -->
          <div class="lg:hidden mb-8">
            <h1 class="text-3xl font-bold tracking-wider mb-2">
              <span class="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                FUSEPOINT
              </span>
            </h1>
            <p class="text-sm text-gray-600 font-medium">
              Marketing & Communication
            </p>
          </div>
          
          <!-- Titre de connexion -->
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Connexion à votre espace
          </h2>
          <p class="text-sm text-gray-500 mb-8">
            Accédez à votre plateforme marketing
          </p>
        </div>

        <!-- Formulaire -->
        <div class="bg-white py-10 px-8 shadow-2xl rounded-2xl border border-gray-100 backdrop-blur-sm">
          <form class="space-y-6" @submit.prevent="handleLogin">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                v-model="form.email"
                class="appearance-none rounded-xl relative block w-full px-4 py-4 border border-gray-200 placeholder-gray-400 text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 sm:text-sm shadow-sm"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div class="relative">
                <input
                  id="password"
                  name="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  v-model="form.password"
                  class="appearance-none rounded-xl relative block w-full px-4 py-4 border border-gray-200 placeholder-gray-400 text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 sm:text-sm shadow-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg v-if="!showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                  Se souvenir de moi
                </label>
              </div>

              <div class="text-sm">
                <router-link to="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                  Mot de passe oublié ?
                </router-link>
              </div>
            </div>

            <!-- Message d'erreur -->
            <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div class="flex items-center">
                <svg class="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <p class="text-sm text-red-700">{{ error }}</p>
              </div>
            </div>

            <div>
              <button
                type="submit"
                :disabled="loading"
                class="group relative w-full flex justify-center py-4 px-6 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0"
              >
                <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ loading ? 'Connexion...' : 'Se connecter' }}
              </button>
            </div>
          </form>

          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300" />
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">Nouveau sur Fusepoint ?</span>
              </div>
            </div>

            <div class="mt-6">
              <button
                @click="$router.push('/register')"
                class="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
              >
                Créer un compte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'Login',
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      loading: false,
      error: null,
      showPassword: false
    }
  },
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    
    async handleLogin() {
      this.loading = true;
      this.error = null;

      try {
        // Validation côté client
        if (!this.form.email || !this.form.password) {
          throw new Error('Email et mot de passe requis');
        }

        // Authentification via le store qui gère les rôles multiples
        const result = await this.authStore.login({
          email: this.form.email,
          password: this.form.password
        });
        
        if (result.success) {
          console.log('✅ Connexion réussie avec rôles:', result.user);
          this.$router.push('/dashboard');
        } else {
          throw new Error(result.error || 'Erreur de connexion');
        }
      } catch (error) {
        console.error('❌ Erreur connexion:', error);
        if (error.message.includes('Compte inexistant')) {
          this.error = 'Aucun compte trouvé avec cet email.';
        } else if (error.message.includes('Mot de passe incorrect')) {
          this.error = 'Mot de passe incorrect.';
        } else {
          this.error = error.message || 'Erreur lors de la connexion';
        }
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
</style>