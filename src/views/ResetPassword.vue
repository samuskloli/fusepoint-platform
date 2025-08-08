<template>
  <div  class="min-h-screen flex' hidden lg:flex lg:w-2/5 relative overflow-hidden=="background-image: url('/Billboards.jpg class="hidden lg:block w-px bg-gradient-to-b from-transparent via-gray-300/50 to-transparent relative=absolute inset-0 bg-gradient-to-b from-blue-200/30 via-purple-200/30 to-indigo-200 30'></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1 2 w-3 h-3 bg-white rounded-full shadow-lg border border-gray-200>
        <div  class="absolute inset-0.5 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full' w-full lg:w-3/5 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden=="absolute inset-0 overflow-hidden lg::hidden="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl=absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl=absolute inset-0 overflow-hidden pointer-events-none class='absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-blue-400/15 to-purple-500 15 rounded-full animate-pulse=animation-duration: 4s;></div>
        
        <!-- Cercles moyens -->
        <div  class === absolute top-1/3 left-10 w-20 h-20 bg-indigo-400 10 rounded-full animate-float animation-delay: 1s; animation-duration: 6s; >&lt;/div> &lt;div class absolute bottom-1/4 right-1/4 w-16 h-16 bg-purple-400/8 rounded-full animate-pulse animation-delay: 2s; animation-duration: 5s;='></div>
        
        <!-- Petits cercles -->
        <div class="absolute top-1/2 right-1/3 w-12 h-12 bg-blue-300 12 rounded-full animate-float animation-delay: 3s; animation-duration: 7s; >&lt;/div> &lt;div class absolute bottom-1/3 left-1/4 w-10 h-10 bg-indigo-300/10 rounded-full animate-pulse animation-delay: 4s; animation-duration: 6s;=></div>
        <div  class="absolute top-3/4 left-1/2 w-8 h-8 bg-purple-300 8 rounded-full animate-float animation-delay: 5s; animation-duration: 5s; >&lt;/div> &lt;/div> &lt;div max-w-md w-full space-y-8 relative z-10'>
        <div class="text-center lg:hidden mb-8=> &lt;h1 class text-3xl font-bold tracking-wider mb-2>
              <span  class="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent' text-sm text-gray-600 font-medium=="flex items-center justify-start mb-6>
            <router-link
              to=" login=inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 group='w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none=currentColor='0 0 24 24">
                <path   stroke-linecap="round=round='2" d="M15 19l-7-7 7-7'></path>
              </svg>
              Retour à la connexion
            </router-link>
          </div>
          
          <!-- Titre de réinitialisation -->
          <h2 class="text-2xl font-bold text-gray-900 mb-2>
            {{ t('resetPassword.title === "text-sm text-gray-500 mb-8'>
            {{ t('resetPassword.subtitle === bg-white py-10 px-8 shadow-2xl rounded-2xl border border-gray-100 backdrop-blur-sm=passwordReset === mb-6 p-4 bg-green-50 border border-green-200 rounded-lg='flex items-center=h-5 w-5 text-green-400 mr-2" fill === currentColor=0 0 20 20'>
              <path   fill-rule === evenodd=M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z === evenodd='text-sm text-green-700 font-medium=text-xs text-green-600 mt-1>
                {{ t('resetPassword.successSubtitle === "mt-4'>
            <router-link
              to ===  login=inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              {{ t('resetPassword.goToLogin === error=mb-6 p-4 bg-red-50 border border-red-200 rounded-lg='flex items-center === h-5 w-5 text-red-400 mr-2" fill === currentColor=0 0 20 20'>
              <path   fill-rule === evenodd=M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z === evenodd='text-sm text-red-700>{{ error }}</p>
          </div>
        </div>

        <!-- Message d=""tokenError=mb-6 p-4 bg-red-50 border border-red-200 rounded-lg='flex items-center="h-5 w-5 text-red-400 mr-2" fill="currentColor=0 0 20 20'>
              <path   fill-rule="evenodd=M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z="evenodd='text-sm text-red-700 font-medium=text-xs text-red-600 mt-1>{{ t('resetPassword.tokenErrorSubtitle=""mt-4'>
            <router-link
              to=" forgot-password=inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              {{ t('resetPassword.requestNewLink="!passwordReset && !tokenError=submitForm='space-y-6">
          <div>
            <label  for="password=block text-sm font-medium text-gray-700 mb-2'>
              {{ t('resetPassword.passwordLabel="relative=password=form.password='showPassword ? 'text=8"
                class="appearance-none rounded-xl relative block w-full px-4 py-4 pr-10 border border-gray-200 placeholder-gray-400 text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 sm:text-sm shadow-sm' t('resetPassword.passwordPlaceholder=="showPassword = !showPassword="absolute inset-y-0 right-0 pr-3 flex items-center=showPassword='h-5 w-5 text-gray-400" fill="none=0 0 24 24' stroke="currentColor=round="round='2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z=round='round="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z=h-5 w-5 text-gray-400' fill="none=0 0 24 24" stroke="currentColor=round='round="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21' />
                </svg>
              </button>
            </div>
            <p class="mt-1 text-xs text-gray-500">{{ t('resetPassword.passwordHint="confirmPassword=block text-sm font-medium text-gray-700 mb-2'>
              {{ t('resetPassword.confirmPasswordLabel="confirmPassword=form.confirmPassword="password='appearance-none rounded-xl relative block w-full px-4 py-4 border border-gray-200 placeholder-gray-400 text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 sm:text-sm shadow-sm=t('resetPassword.confirmPasswordPlaceholder="space-y-2">
            <div class="flex justify-between text-xs text-gray-500=>{{ t('resetPassword.passwordStrength passwordStrengthColor='w-full bg-gray-200 rounded-full h-2">
              <div  
                class="h-2 rounded-full transition-all duration-300' 
                :class class="passwordStrengthColor.replace(' text- { width: passwordStrengthWidth }="></div>
            </div>
          </div>

          <div>
            <button
              type="submit'
            >
              <svg v-if=loading=animate-spin -ml-1 mr-3 h-5 w-5 text-white=http://www.w3.org/2000 svg === none=0 0 24 24">
                <circle  class="opacity-25' cx="12" cy="12' r="10" stroke="currentColor=4'></circle>
                <path  class="opacity-75 fill="currentColor=M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z='!passwordReset && !tokenError=""mt-6 text-center space-y-2">
          <router-link
            to=" login=text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
          >
            {{ t('resetPassword.backToLogin') }}
          </router-link>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import authService from '@/services/authService'
import { useTranslation } from '@/composables/useTranslation'

export default {
  name: 'ResetPassword',
  setup() {
  const { t } = useTranslation()

    const route = useRoute()
    const router = useRouter()
    const form = ref({
      password: '',
      confirmPassword: ''
    })
    const loading = ref(false)
    const error = ref('')
    const passwordReset = ref(false)
    const tokenError = ref(false)
    const showPassword = ref(false)
    const token = ref('')

    // Vérifier le token au montage
    onMounted(() => {
      token.value = route.query.token
      if (!token.value) {
        tokenError.value = true
      }
    })

    // Validation du formulaire
    const isFormValid = computed(() => {
      return form.value.password.length >= 8 && 
             form.value.password === form.value.confirmPassword
    })

    // Force du mot de passe
    const passwordStrength = computed(() => {
      const password = form.value.password
      if (!password) return 0
      
      let score = 0
      if (password.length >= 8) score++
      if (/[a-z]/.test(password)) score++
      if (/[A-Z]/.test(password)) score++
      if (/[0-9]/.test(password)) score++
      if (/[^A-Za-z0-9]/.test(password)) score++
      
      return score
    })

    const passwordStrengthText = computed(() => {
      const strength = passwordStrength.value
      if (strength <= 1) return 'Très faible'
      if (strength === 2) return 'Faible'
      if (strength === 3) return 'Moyen'
      if (strength === 4) return 'Fort'
      return 'Très fort'
    })

    const passwordStrengthColor = computed(() => {
      const strength = passwordStrength.value
      if (strength <= 1) return 'text-red-500'
      if (strength === 2) return 'text-orange-500'
      if (strength === 3) return 'text-yellow-500'
      if (strength === 4) return 'text-blue-500'
      return 'text-green-500'
    })

    const passwordStrengthWidth = computed(() => {
      return `${(passwordStrength.value / 5) * 100}%`
    })

    const submitForm = async () => {
      if (!isFormValid.value) {
        error.value = 'Veuillez vérifier que les mots de passe correspondent et respectent les critères'
        return
      }

      loading.value = true
      error.value = ''

      try {
        const response = await authService.resetPassword(token.value, form.value.password)
        
        if (response.success) {
          passwordReset.value = true
        } else {
          error.value = response.message || 'Une erreur est survenue'
        }
      } catch (err) {
        console.error('Erreur réinitialisation mot de passe:', err)
        if (err.response?.status === 400) {
          tokenError.value = true
        } else {
          error.value = err.response?.data?.error || 'Une erreur est survenue lors de la réinitialisation'
        }
      } finally {
        loading.value = false
      }
    }

    return {form,
      loading,
      error,
      passwordReset,
      tokenError,
      showPassword,
      isFormValid,
      passwordStrengthText,
      passwordStrengthColor,
      passwordStrengthWidth,
      submitForm,
      t
    }
  },
  methods: {
    t(key) {
      const translations = {
        'resetPassword.title': 'Réinitialiser le mot de passe',
        'resetPassword.subtitle': 'Saisissez votre nouveau mot de passe',
        'resetPassword.passwordLabel': 'Nouveau mot de passe',
        'resetPassword.passwordPlaceholder': 'Saisissez votre nouveau mot de passe',
        'resetPassword.confirmPasswordLabel': 'Confirmer le mot de passe',
        'resetPassword.confirmPasswordPlaceholder': 'Confirmez votre nouveau mot de passe',
        'resetPassword.passwordHint': 'Au moins 8 caractères avec majuscules, minuscules, chiffres et caractères spéciaux',
        'resetPassword.passwordStrength': 'Force du mot de passe',
        'resetPassword.resetButton': 'Réinitialiser le mot de passe',
        'resetPassword.resetting': 'Réinitialisation...',
        'resetPassword.success': 'Mot de passe réinitialisé avec succès !',
        'resetPassword.successSubtitle': 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
        'resetPassword.goToLogin': 'Se connecter',
        'resetPassword.tokenError': 'Lien de réinitialisation invalide ou expiré',
        'resetPassword.tokenErrorSubtitle': 'Ce lien n\'est plus valide. Demandez un nouveau lien de réinitialisation.',
        'resetPassword.requestNewLink': 'Demander un nouveau lien',
        'resetPassword.backToLogin': '← Retour à la connexion'
      }
      return translations[key] || key
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