<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md bg-white shadow rounded-xl p-6">
      <h1 class="text-2xl font-bold mb-2">{{ tt('resetPassword.title', 'Réinitialiser le mot de passe') }}</h1>
      <p class="text-sm text-gray-600 mb-6">{{ tt('resetPassword.subtitle', 'Saisissez votre nouveau mot de passe') }}</p>

      <div v-if="tokenError" class="mb-4 p-3 rounded bg-red-50 text-red-700">
        {{ tt('resetPassword.tokenError', 'Lien invalide ou expiré. Demandez un nouveau lien.') }}
      </div>

      <div v-if="passwordReset" class="mb-4 p-3 rounded bg-green-50 text-green-700">
        {{ tt('resetPassword.success', 'Votre mot de passe a été réinitialisé avec succès.') }}
      </div>

      <form v-if="!passwordReset && !tokenError" @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ tt('resetPassword.passwordLabel', 'Nouveau mot de passe') }}</label>
          <input v-model="form.password" type="password" class="w-full border rounded px-3 py-2" :placeholder="tt('resetPassword.passwordPlaceholder', 'Votre nouveau mot de passe')" />
          <p class="mt-1 text-xs text-gray-500">{{ tt('resetPassword.passwordHint', 'Au moins 8 caractères avec majuscules, minuscules, chiffres et symboles.') }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ tt('resetPassword.confirmPasswordLabel', 'Confirmer le mot de passe') }}</label>
          <input v-model="form.confirmPassword" type="password" class="w-full border rounded px-3 py-2" :placeholder="tt('resetPassword.confirmPasswordPlaceholder', 'Confirmez votre mot de passe')" />
        </div>
        <div class="text-xs text-gray-600">
          {{ tt('resetPassword.passwordStrength', 'Force du mot de passe') }}:
          <span :class="passwordStrengthColor">{{ passwordStrengthText }}</span>
        </div>

        <button type="submit" class="w-full bg-blue-600 text-white font-semibold rounded px-4 py-2" :disabled="loading || !isFormValid">
          {{ loading ? tt('resetPassword.submitting', 'Réinitialisation...') : tt('resetPassword.submit', 'Réinitialiser') }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <router-link to="/login" class="text-sm text-blue-600 hover:text-blue-500">
          {{ tt('resetPassword.backToLogin', '← Retour à la connexion') }}
        </router-link>
      </div>

      <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import authService from '@/services/authService'

const { t, te } = useI18n()
const tt = (key, fallback) => (te(key) ? t(key) : fallback)

const route = useRoute()
const form = ref({ password: '', confirmPassword: '' })
const loading = ref(false)
const error = ref('')
const passwordReset = ref(false)
const tokenError = ref(false)
const token = ref('')

onMounted(() => {
  token.value = route.query?.token || ''
  if (!token.value) tokenError.value = true
})

const isFormValid = computed(() => form.value.password.length >= 8 && form.value.password === form.value.confirmPassword)

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
  const s = passwordStrength.value
  return s <= 1 ? 'Très faible' : s === 2 ? 'Faible' : s === 3 ? 'Moyen' : s === 4 ? 'Fort' : 'Très fort'
})

const passwordStrengthColor = computed(() => {
  const s = passwordStrength.value
  return s <= 1 ? 'text-red-500' : s === 2 ? 'text-orange-500' : s === 3 ? 'text-yellow-500' : s === 4 ? 'text-blue-500' : 'text-green-500'
})

const submitForm = async () => {
  if (!isFormValid.value) {
    error.value = tt('resetPassword.invalidForm', 'Vérifiez que les mots de passe correspondent et respectent les critères')
    return
  }
  loading.value = true
  error.value = ''
  try {
    const response = await authService.resetPassword(token.value, form.value.password)
    if (response.success) {
      passwordReset.value = true
    } else {
      error.value = response.message || tt('resetPassword.error', 'Une erreur est survenue')
    }
  } catch (err) {
    console.error('Erreur réinitialisation mot de passe:', err)
    if (err.response?.status === 400) {
      tokenError.value = true
    } else {
      error.value = err.response?.data?.error || tt('resetPassword.errorSubmitting', 'Erreur lors de la réinitialisation')
    }
  } finally {
    loading.value = false
  }
}
</script>