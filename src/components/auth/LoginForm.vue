<template>
  <div class="login-form">
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">{{ $t('auth.emailRequired') }}</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          :class="{ 'error': errors.email }"
          :placeholder="$t('auth.emailRequired')"
        />
        <span v-if="errors.email" class="error-message">
          {{ errors.email }}
        </span>
      </div>

      <div class="form-group">
        <label for="password">{{ $t('auth.passwordRequired') }}</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          :class="{ 'error': errors.password }"
          :placeholder="$t('auth.passwordRequired')"
        />
        <span v-if="errors.password" class="error-message">
          {{ errors.password }}
        </span>
      </div>

      <div v-if="generalError" class="general-error">
        {{ generalError }}
      </div>

      <button type="submit" :disabled="isLoading" class="login-button">
        <span v-if="isLoading">{{ $t('common.loading') }}</span>
        <span v-else>{{ $t('auth.login') }}</span>
      </button>
    </form>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { authService } from '@/services/authService'
import { useTranslation } from '@/composables/useTranslation'

export default {
  name: 'LoginForm',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const notificationStore = useNotificationStore()
    const { t } = useTranslation()
    
    const isLoading = ref(false)
    const generalError = ref('')
    
    const form = reactive({
      email: '',
      password: ''
    })
    
    const errors = reactive({
      email: '',
      password: ''
    })
    
    const clearErrors = () => {
      errors.email = ''
      errors.password = ''
      generalError.value = ''
    }
    
    const validateForm = () => {
      clearErrors()
      let isValid = true
      
      if (!form.email) {
        errors.email = t('auth.emailRequired')
        isValid = false
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = t('auth.invalidEmailFormat')
        isValid = false
      }
      
      if (!form.password) {
        errors.password = t('auth.passwordRequired')
        isValid = false
      } else if (form.password.length < 8) {
        errors.password = t('auth.passwordTooShort')
        isValid = false
      }
      
      return isValid
    }
    
    const handleLogin = async () => {
      if (!validateForm()) {
        return
      }
      
      isLoading.value = true
      clearErrors()
      
      try {
        await authService.login(form.email, form.password)
        
        notificationStore.addNotification({
          type: 'success',
          message: t('auth.loginSuccess')
        })
        
        router.push('/dashboard')
      } catch (error) {
        console.error('Erreur de connexion:', error)
        
        // Gestion spécifique des erreurs d'authentification
        const errorMessage = error.message
        
        if (errorMessage.includes(t('auth.accountNotFound')) || 
            errorMessage.includes(t('auth.emailIncorrect'))) {
          errors.email = t('auth.emailIncorrect')
        } else if (errorMessage.includes(t('auth.passwordIncorrect'))) {
          errors.password = t('auth.passwordIncorrect')
        } else if (errorMessage.includes(t('auth.emailOrPasswordIncorrect'))) {
          generalError.value = t('auth.emailOrPasswordIncorrect')
        } else {
          generalError.value = errorMessage || t('auth.loginError')
        }
        
        notificationStore.addNotification({
          type: 'error',
          message: generalError.value || t('auth.loginFailed')
        })
      } finally {
        isLoading.value = false
      }
    }
    
    return {
      form,
      errors,
      generalError,
      isLoading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

input.error {
  border-color: #ef4444;
}

.error-message {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #ef4444;
}

.general-error {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  color: #dc2626;
  font-size: 0.875rem;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.login-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
</style>