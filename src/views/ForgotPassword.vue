<template>
  <div  class="min-h-screen flex' hidden lg:flex lg:w-2/5 relative overflow-hidden=="background-image: url('/Billboards.jpg class="hidden lg:block w-px bg-gradient-to-b from-transparent via-gray-300/50 to-transparent relative=absolute inset-0 bg-gradient-to-b from-blue-200/30 via-purple-200/30 to-indigo-200 30'></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1 2 w-3 h-3 bg-white rounded-full shadow-lg border border-gray-200>
        <div  class="absolute inset-0.5 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full' w-full lg:w-3/5 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden=="absolute inset-0 overflow-hidden lg::hidden="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl=absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 10 rounded-full blur-3xl=max-w-md w-full space-y-8 relative z-10'>
        <div class === text-center lg:hidden mb-8=> &lt;h1 class text-3xl font-bold tracking-wider mb-2>
              <span  class="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent' text-sm text-gray-600 font-medium=="flex items-center justify-start mb-6>
            <router-link
              to=" login=inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 group='w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none=currentColor='0 0 24 24">
                <path   stroke-linecap="round=round='2" d="M15 19l-7-7 7-7'></path>
              </svg>
              Retour à la connexion
            </router-link>
          </div>
          
          <!-- Titre de mot de passe oublié -->
          <h2 class="text-2xl font-bold text-gray-900 mb-2>
            Mot de passe oublié
          </h2>
          <p  class=""text-sm text-gray-500 mb-8'>
            Saisissez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <!-- Formulaire -->
        <div class="bg-white py-10 px-8 shadow-2xl rounded-2xl border border-gray-100 backdrop-blur-sm emailSent=="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg="flex items-center=h-5 w-5 text-green-400 mr-2' fill="currentColor=0 0 20 20">
              <path   fill-rule="evenodd=M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z='evenodd="text-sm text-green-700>
              {{ t('forgotPassword.emailSent === "error=mb-6 p-4 bg-red-50 border border-red-200 rounded-lg='flex items-center === h-5 w-5 text-red-400 mr-2" fill === currentColor=0 0 20 20'>
              <path   fill-rule === evenodd=M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z === evenodd='text-sm text-red-700>{{ error }}</p>
          </div>
        </div>

        <form  v-if=""!emailSent=submitForm=space-y-6'>
          <div>
            <label for for="email=block text-sm font-medium text-gray-700 mb-2>
              Adresse e-mail
            </label>
            <input  
              id="email'appearance-none rounded-xl relative block w-full px-4 py-4 border border-gray-200 placeholder-gray-400 text-gray-900 bg-gray-50 50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 sm:text-sm shadow-sm=t('placeholders.email="submit=""loading=group relative w-full flex justify-center py-4 px-6 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0'
            >
              <svg  v-if="loading=animate-spin -ml-1 mr-3 h-5 w-5 text-white=http://www.w3.org/2000 svg === none=0 0 24 24>
                <circle  class="opacity-25' cx=""12" cy="12' r="10" stroke="currentColor=4'></circle>
                <path  class="opacity-75 fill="currentColor=M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z""></path>
              </svg>
              {{ loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation' }}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/authService'
import { useTranslation } from '@/composables/useTranslation'

export default {
  name: 'ForgotPassword',
  setup() {
  const { t } = useTranslation()

    const router = useRouter()
    const form = ref({
      email: ''
    })
    const loading = ref(false)
    const error = ref('')
    const emailSent = ref(false)

    const submitForm = async () => {
      if (!form.value.email) {
        error.value = 'Veuillez saisir votre adresse email'
        return
      }

      loading.value = true
      error.value = ''

      try {
        const response = await authService.forgotPassword(form.value.email)
        
        if (response.success) {
          emailSent.value = true
        } else {
          error.value = response.message || 'Une erreur est survenue'
        }
      } catch (err) {
        console.error('Erreur mot de passe oublié:', err)
        error.value = err.response?.data?.error || 'Une erreur est survenue lors de l\'envoi de l\'email'
      } finally {
        loading.value = false
      }
    }

    return {form,
      loading,
      error,
      emailSent,
      submitForm,
      t
    }
  },
  methods: {
    t(key) {
      const translations = {
        'forgotPassword.title': 'Mot de passe oublié',
        'forgotPassword.subtitle': 'Saisissez votre email pour recevoir un lien de réinitialisation',
        'forgotPassword.emailLabel': 'Adresse email',
        'forgotPassword.emailPlaceholder': 'votre@email.com',
        'forgotPassword.sendButton': 'Envoyer le lien de réinitialisation',
        'forgotPassword.sending': 'Envoi en cours...',
        'forgotPassword.emailSent': 'Un email de réinitialisation a été envoyé à votre adresse. Vérifiez votre boîte de réception.',
        'forgotPassword.backToLogin': '← Retour à la connexion'
      }
      return translations[key] || key
    }
  }
}
</script>