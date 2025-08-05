<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center">
        <div class="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-xl">F</span>
        </div>
      </div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Créer votre compte Fusepoint
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Rejoignez la plateforme marketing centralisée
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Création...' : 'Créer mon compte' }}
            </button>
          </div>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Déjà un compte ?</span>
            </div>
          </div>

          <div class="mt-6">
            <button
              @click="$router.push('/login')"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out"
            >
              Se connecter
            </button>
          </div>
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