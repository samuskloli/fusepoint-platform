<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">🎯 Fusepoint</h1>
        <h2 class="text-xl font-semibold text-gray-700 mb-4">Inscription Prestataire</h2>
        <p class="text-sm text-gray-600">Créez votre compte pour rejoindre la plateforme</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-md p-8">
        <div class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">Vérification de l'invitation...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-lg shadow-md p-8">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Invitation invalide</h3>
          <p class="text-sm text-gray-600 mb-6">{{ error }}</p>
          <router-link 
            to="/login" 
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Retour à la connexion
          </router-link>
        </div>
      </div>

      <!-- Registration Form -->
      <div v-else class="bg-white rounded-lg shadow-md p-8">
        <!-- Invitation Info -->
        <div v-if="invitationData" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 class="text-sm font-medium text-blue-800 mb-2">Invitation de {{ invitationData.agentName }}</h3>
          <p class="text-sm text-blue-600">Email: {{ invitationData.email }}</p>
          <p v-if="invitationData.invitationData.speciality" class="text-sm text-blue-600">
            Spécialité: {{ invitationData.invitationData.speciality }}
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Prénom -->
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
              Prénom *
            </label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              :class="{ 'border-red-500': errors.firstName }"
              placeholder="Votre prénom"
            />
            <p v-if="errors.firstName" class="mt-1 text-sm text-red-600">{{ errors.firstName }}</p>
          </div>

          <!-- Nom -->
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              :class="{ 'border-red-500': errors.lastName }"
              placeholder="Votre nom"
            />
            <p v-if="errors.lastName" class="mt-1 text-sm text-red-600">{{ errors.lastName }}</p>
          </div>

          <!-- Téléphone -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              :class="{ 'border-red-500': errors.phone }"
              placeholder="Votre numéro de téléphone"
            />
            <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
          </div>

          <!-- Mot de passe -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe *
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                :class="{ 'border-red-500': errors.password }"
                placeholder="Votre mot de passe"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg v-if="showPassword" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
                <svg v-else class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
            <p class="mt-1 text-xs text-gray-500">
              Le mot de passe doit contenir au moins 8 caractères avec une majuscule, une minuscule, un chiffre et un caractère spécial.
            </p>
          </div>

          <!-- Confirmation mot de passe -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe *
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              :class="{ 'border-red-500': errors.confirmPassword }"
              placeholder="Confirmez votre mot de passe"
            />
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
          </div>

          <!-- Conditions d'utilisation -->
          <div class="flex items-start">
            <input
              id="acceptTerms"
              v-model="form.acceptTerms"
              type="checkbox"
              required
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            />
            <label for="acceptTerms" class="ml-2 block text-sm text-gray-700">
              J'accepte les 
              <a href="#" class="text-blue-600 hover:text-blue-500">conditions d'utilisation</a>
              et la 
              <a href="#" class="text-blue-600 hover:text-blue-500">politique de confidentialité</a>
            </label>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="submitting"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="submitting" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              </span>
              {{ submitting ? 'Création du compte...' : 'Créer mon compte' }}
            </button>
          </div>
        </form>

        <!-- Success Message -->
        <div v-if="success" class="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">Compte créé avec succès !</h3>
              <p class="mt-1 text-sm text-green-700">
                Votre compte prestataire a été créé. Vous allez être redirigé vers la page de connexion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

export default {
  name: 'RegisterPrestataire',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const loading = ref(true)
    const error = ref('')
    const success = ref(false)
    const submitting = ref(false)
    const showPassword = ref(false)
    const invitationData = ref(null)
    
    const form = ref({
      firstName: '',
      lastName: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    })
    
    const errors = ref({})
    
    // Vérifier le token au chargement
    onMounted(async () => {
      const token = route.query.token
      
      if (!token) {
        error.value = 'Token d\'invitation manquant'
        loading.value = false
        return
      }
      
      try {
        const response = await axios.get(`/api/prestataire/verify-token/${token}`)
        
        if (response.data.success) {
          invitationData.value = response.data.data
          
          // Pré-remplir le formulaire avec les données de l'invitation
          if (invitationData.value.invitationData.firstName) {
            form.value.firstName = invitationData.value.invitationData.firstName
          }
          if (invitationData.value.invitationData.lastName) {
            form.value.lastName = invitationData.value.invitationData.lastName
          }
        } else {
          error.value = response.data.message
        }
      } catch (err) {
        console.error('Erreur vérification token:', err)
        error.value = err.response?.data?.message || 'Erreur lors de la vérification de l\'invitation'
      } finally {
        loading.value = false
      }
    })
    
    // Validation du formulaire
    const validateForm = () => {
      errors.value = {}
      
      if (!form.value.firstName.trim()) {
        errors.value.firstName = 'Le prénom est requis'
      }
      
      if (!form.value.lastName.trim()) {
        errors.value.lastName = 'Le nom est requis'
      }
      
      if (form.value.phone && !/^[+]?[0-9\s\-\(\)]{10,}$/.test(form.value.phone)) {
        errors.value.phone = 'Format de téléphone invalide'
      }
      
      if (!form.value.password) {
        errors.value.password = 'Le mot de passe est requis'
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(form.value.password)) {
        errors.value.password = 'Le mot de passe ne respecte pas les critères de sécurité'
      }
      
      if (form.value.password !== form.value.confirmPassword) {
        errors.value.confirmPassword = 'Les mots de passe ne correspondent pas'
      }
      
      if (!form.value.acceptTerms) {
        errors.value.acceptTerms = 'Vous devez accepter les conditions d\'utilisation'
      }
      
      return Object.keys(errors.value).length === 0
    }
    
    // Soumission du formulaire
    const handleSubmit = async () => {
      if (!validateForm()) {
        return
      }
      
      submitting.value = true
      
      try {
        const token = route.query.token
        
        const response = await axios.post('/api/prestataire/accept-invitation', {
          token,
          firstName: form.value.firstName.trim(),
          lastName: form.value.lastName.trim(),
          phone: form.value.phone.trim(),
          password: form.value.password
        })
        
        if (response.data.success) {
          success.value = true
          
          // Rediriger vers la page de connexion après 3 secondes
          setTimeout(() => {
            router.push('/login?message=account-created')
          }, 3000)
        }
      } catch (err) {
        console.error('Erreur création compte:', err)
        
        if (err.response?.data?.errors) {
          // Erreurs de validation du serveur
          err.response.data.errors.forEach(error => {
            errors.value[error.param] = error.msg
          })
        } else {
          error.value = err.response?.data?.message || 'Erreur lors de la création du compte'
        }
      } finally {
        submitting.value = false
      }
    }
    
    return {
      loading,
      error,
      success,
      submitting,
      showPassword,
      invitationData,
      form,
      errors,
      handleSubmit
    }
  }
}
</script>