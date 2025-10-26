<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md bg-white shadow rounded-xl p-6">
      <h1 class="text-2xl font-bold mb-2">{{ tt('forgotPassword.title', 'Mot de passe oublié') }}</h1>
      <p class="text-sm text-gray-600 mb-6">{{ tt('forgotPassword.subtitle', 'Entrez votre email pour recevoir un lien de réinitialisation') }}</p>

      <div v-if="success" class="mb-4 p-3 rounded bg-green-50 text-green-700">
        {{ tt('forgotPassword.success', 'Si un compte existe avec cet email, un lien a été envoyé.') }}
      </div>

      <form v-if="!success" @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ tt('forgotPassword.emailLabel', 'Email') }}</label>
          <input v-model="email" type="email" class="w-full border rounded px-3 py-2" :placeholder="tt('forgotPassword.emailPlaceholder', 'Votre adresse email')" />
        </div>
        <button type="submit" class="w-full bg-blue-600 text-white font-semibold rounded px-4 py-2" :disabled="loading || !isValidEmail">
          {{ loading ? tt('forgotPassword.submitting', 'Envoi...') : tt('forgotPassword.submit', 'Envoyer le lien') }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <router-link to="/login" class="text-sm text-blue-600 hover:text-blue-500">
          {{ tt('forgotPassword.backToLogin', '← Retour à la connexion') }}
        </router-link>
      </div>

      <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import authService from '@/services/authService'

const { t, te } = useI18n()
const tt = (key, fallback) => (te(key) ? t(key) : fallback)

const email = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')

const isValidEmail = computed(() => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email.value))

const submitForm = async () => {
  if (!isValidEmail.value) {
    error.value = tt('forgotPassword.invalidEmail', 'Veuillez saisir un email valide')
    return
  }
  loading.value = true
  error.value = ''
  try {
    const response = await authService.requestPasswordReset(email.value)
    if (response.success) {
      success.value = true
    } else {
      error.value = response.message || tt('forgotPassword.error', 'Une erreur est survenue')
    }
  } catch (err) {
    console.error('Erreur envoi lien réinitialisation:', err)
    error.value = err.response?.data?.error || tt('forgotPassword.errorSubmitting', 'Erreur lors de l’envoi du lien')
  } finally {
    loading.value = false
  }
}
</script>