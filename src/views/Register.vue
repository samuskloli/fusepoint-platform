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

    <!-- Colonne droite - Formulaire -->
    <div class="w-full lg:w-3/5 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Éléments décoratifs d'arrière-plan pour mobile -->
      <div class="absolute inset-0 overflow-hidden lg:hidden">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <!-- Éléments décoratifs flottants graphiques -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <!-- Cercles flottants de grande taille pour impact graphique maximal -->
        <div class="absolute top-20 left-10 w-20 h-20 bg-blue-300/15 rounded-full animate-pulse" style="animation-delay: 0s; animation-duration: 4s;"></div>
        <div class="absolute top-1/3 right-1/4 w-24 h-24 bg-indigo-300/12 rounded-full animate-pulse" style="animation-delay: 2s; animation-duration: 5s;"></div>
        <div class="absolute bottom-32 left-1/4 w-16 h-16 bg-purple-400/18 rounded-full animate-pulse" style="animation-delay: 1.5s; animation-duration: 4.5s;"></div>
        
        <!-- Cercles flottants avec mouvement vertical - très grandes tailles -->
        <div class="absolute top-1/4 right-12 w-14 h-14 bg-blue-200/25 rounded-full" style="animation: float 6s ease-in-out infinite;"></div>
        <div class="absolute bottom-1/4 left-12 w-18 h-18 bg-purple-200/20 rounded-full" style="animation: float 8s ease-in-out infinite reverse;"></div>
        
        <!-- Cercle géant avec dégradé pour impact maximal -->
        <div class="absolute top-16 right-1/2 w-32 h-32 bg-gradient-to-br from-blue-200/8 to-purple-200/8 rounded-full animate-pulse" style="animation-delay: 3s; animation-duration: 7s;"></div>
      </div>
      <!-- Flèche de retour -->
      <div class="absolute top-6 left-6 lg:left-auto lg:right-6">
        <button
          @click="$router.push('/login')"
          class="group flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all duration-200 hover:scale-105"
        >
          <svg class="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          <span class="text-sm font-medium">Retour à la connexion</span>
        </button>
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
          
          <!-- Titre de création de compte -->
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Créer votre compte
          </h2>
          <p class="text-sm text-gray-500 mb-8">
            Rejoignez la plateforme marketing centralisée
          </p>
        </div>

        <!-- Formulaire -->
        <div class="bg-white py-10 px-8 shadow-2xl rounded-2xl border border-gray-100 backdrop-blur-sm">
        <form class="space-y-6" @submit.prevent="handleRegister">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <div class="mt-1">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  v-model="form.firstName"
                  class="appearance-none rounded-xl relative block w-full px-4 py-4 border border-gray-200 placeholder-gray-400 text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 sm:text-sm shadow-sm"
                  placeholder="Prénom"
                />
              </div>
            </div>

            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <div class="mt-1">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  v-model="form.lastName"
                  class="appearance-none rounded-xl relative block w-full px-4 py-4 border border-gray-200 placeholder-gray-400 text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 sm:text-sm shadow-sm"
                  placeholder="Nom"
                />
              </div>
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Adresse e-mail
            </label>
            <div class="mt-1">
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
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <div class="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="new-password"
                required
                v-model="form.password"
                @input="validatePassword"
                class="appearance-none rounded-xl relative block w-full px-4 py-4 border border-gray-200 placeholder-gray-400 text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 sm:text-sm shadow-sm"
                placeholder="••••••••"
              />
            </div>
            
            <!-- Indicateur de force du mot de passe -->
            <div v-if="form.password" class="mt-2">
              <div class="flex items-center space-x-2">
                <div class="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-300"
                    :class="passwordStrengthClass"
                    :style="{ width: passwordStrengthWidth }"
                  ></div>
                </div>
                <span class="text-xs font-medium" :class="passwordStrengthTextClass">
                  {{ passwordStrengthText }}
                </span>
              </div>
              
              <!-- Critères du mot de passe -->
              <div class="mt-2 space-y-1">
                <div class="flex items-center space-x-2">
                  <svg class="h-4 w-4" :class="passwordCriteria.length ? 'text-green-500' : 'text-gray-400'" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-xs" :class="passwordCriteria.length ? 'text-green-600' : 'text-gray-500'">
                    Au moins 8 caractères
                  </span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="h-4 w-4" :class="passwordCriteria.uppercase ? 'text-green-500' : 'text-gray-400'" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-xs" :class="passwordCriteria.uppercase ? 'text-green-600' : 'text-gray-500'">
                    Une majuscule
                  </span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="h-4 w-4" :class="passwordCriteria.lowercase ? 'text-green-500' : 'text-gray-400'" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-xs" :class="passwordCriteria.lowercase ? 'text-green-600' : 'text-gray-500'">
                    Une minuscule
                  </span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="h-4 w-4" :class="passwordCriteria.number ? 'text-green-500' : 'text-gray-400'" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-xs" :class="passwordCriteria.number ? 'text-green-600' : 'text-gray-500'">
                    Un chiffre
                  </span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="h-4 w-4" :class="passwordCriteria.special ? 'text-green-500' : 'text-gray-400'" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-xs" :class="passwordCriteria.special ? 'text-green-600' : 'text-gray-500'">
                    Un caractère spécial (@$!%*?&)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirmer le mot de passe
            </label>
            <div class="mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autocomplete="new-password"
                required
                v-model="form.confirmPassword"
                class="appearance-none rounded-xl relative block w-full px-4 py-4 border border-gray-200 placeholder-gray-400 text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 sm:text-sm shadow-sm"
                placeholder="••••••••"
              />
            </div>
            <div v-if="form.confirmPassword && form.password !== form.confirmPassword" class="mt-1">
              <p class="text-sm text-red-600">Les mots de passe ne correspondent pas</p>
            </div>
          </div>

          <!-- Message d'erreur -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-3">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-800">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- Message de succès -->
          <div v-if="success" class="bg-green-50 border border-green-200 rounded-md p-3">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-green-800">{{ success }}</p>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="group relative w-full flex justify-center py-4 px-6 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Création...' : 'Créer mon compte' }}
            </button>
          </div>
        </form>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService';

export default {
  name: 'Register',
  data() {
    return {
      form: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      loading: false,
      error: null,
      success: null,
      passwordCriteria: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      }
    }
  },
  computed: {
    isFormValid() {
      return (
        this.form.firstName &&
        this.form.lastName &&
        this.form.email &&
        this.form.password &&
        this.form.confirmPassword &&
        this.form.password === this.form.confirmPassword &&
        this.isPasswordStrong
      );
    },
    
    isPasswordStrong() {
      return Object.values(this.passwordCriteria).every(criteria => criteria);
    },
    
    passwordStrengthScore() {
      return Object.values(this.passwordCriteria).filter(criteria => criteria).length;
    },
    
    passwordStrengthWidth() {
      return `${(this.passwordStrengthScore / 5) * 100}%`;
    },
    
    passwordStrengthClass() {
      if (this.passwordStrengthScore <= 2) return 'bg-red-500';
      if (this.passwordStrengthScore <= 3) return 'bg-yellow-500';
      if (this.passwordStrengthScore <= 4) return 'bg-blue-500';
      return 'bg-green-500';
    },
    
    passwordStrengthTextClass() {
      if (this.passwordStrengthScore <= 2) return 'text-red-600';
      if (this.passwordStrengthScore <= 3) return 'text-yellow-600';
      if (this.passwordStrengthScore <= 4) return 'text-blue-600';
      return 'text-green-600';
    },
    
    passwordStrengthText() {
      if (this.passwordStrengthScore <= 2) return 'Faible';
      if (this.passwordStrengthScore <= 3) return 'Moyen';
      if (this.passwordStrengthScore <= 4) return 'Bon';
      return 'Excellent';
    }
  },
  methods: {
    validatePassword() {
      const password = this.form.password;
      
      this.passwordCriteria = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[@$!%*?&]/.test(password)
      };
    },
    
    async handleRegister() {
      this.loading = true;
      this.error = null;
      this.success = null;

      try {
        // Validation côté client
        if (!this.isFormValid) {
          throw new Error('Veuillez remplir tous les champs correctement');
        }

        // Inscription sécurisée via l'API
        const result = await authService.register(this.form);
        
        if (result.success) {
          this.success = 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.';
          
          // Redirection vers la page de connexion après 2 secondes
          setTimeout(() => {
            this.$router.push('/login');
          }, 2000);
        }
      } catch (error) {
        console.error('❌ Erreur inscription:', error);
        this.error = error.message;
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
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>