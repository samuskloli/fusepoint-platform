<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    @click="$emit('close')"
  >
    <div
      class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
      @click.stop
    >
      <!-- En-tête de la modale -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">
              Modifier le mot de passe
            </h3>
            <p class="text-sm text-gray-500">
              {{ client.first_name }} {{ client.last_name }}
            </p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="handleSubmit" class="mt-6">
        <div class="space-y-4">
          <!-- Nouveau mot de passe -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe *
            </label>
            <div class="relative">
              <input
                v-model="form.newPassword"
                :type="showPassword ? 'text' : 'password'"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :class="{
                  'border-red-300 focus:ring-red-500': errors.newPassword
                }"
                placeholder="Entrez le nouveau mot de passe"
                required
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <p v-if="errors.newPassword" class="mt-1 text-sm text-red-600">
              {{ errors.newPassword }}
            </p>
            <p class="mt-1 text-xs text-gray-500">
              Le mot de passe doit contenir au moins 6 caractères
            </p>
          </div>

          <!-- Confirmation du mot de passe -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe *
            </label>
            <input
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :class="{
                'border-red-300 focus:ring-red-500': errors.confirmPassword
              }"
              placeholder="Confirmez le nouveau mot de passe"
              required
            />
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="text-gray-400 hover:text-gray-600"
              >
                <svg v-if="showConfirmPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
              {{ errors.confirmPassword }}
            </p>
          </div>
        </div>

        <!-- Message d'erreur général -->
        <div v-if="errors.general" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">{{ errors.general }}</p>
        </div>

        <!-- Actions -->
        <div class="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            :disabled="loading"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Modification...
            </span>
            <span v-else>Modifier le mot de passe</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChangePasswordModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    client: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'submit'],
  data() {
    return {
      form: {
        newPassword: '',
        confirmPassword: ''
      },
      errors: {},
      showPassword: false,
      showConfirmPassword: false
    }
  },
  computed: {
    isFormValid() {
      return (
        this.form.newPassword.length >= 6 &&
        this.form.confirmPassword.length >= 6 &&
        this.form.newPassword === this.form.confirmPassword
      )
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.resetForm()
      }
    },
    'form.newPassword'() {
      this.validatePassword()
    },
    'form.confirmPassword'() {
      this.validateConfirmPassword()
    }
  },
  methods: {
    resetForm() {
      this.form = {
        newPassword: '',
        confirmPassword: ''
      }
      this.errors = {}
      this.showPassword = false
      this.showConfirmPassword = false
    },
    
    validatePassword() {
      if (this.form.newPassword && this.form.newPassword.length < 6) {
        this.errors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères'
      } else {
        delete this.errors.newPassword
      }
      
      // Re-valider la confirmation si elle existe
      if (this.form.confirmPassword) {
        this.validateConfirmPassword()
      }
    },
    
    validateConfirmPassword() {
      if (this.form.confirmPassword && this.form.newPassword !== this.form.confirmPassword) {
        this.errors.confirmPassword = 'Les mots de passe ne correspondent pas'
      } else {
        delete this.errors.confirmPassword
      }
    },
    
    handleSubmit() {
      // Validation finale
      this.validatePassword()
      this.validateConfirmPassword()
      
      if (Object.keys(this.errors).length === 0 && this.isFormValid) {
        this.$emit('submit', {
          clientId: this.client.id,
          newPassword: this.form.newPassword
        })
      }
    },
    
    setError(message) {
      this.errors.general = message
    },
    
    clearErrors() {
      this.errors = {}
    }
  }
}
</script>

<style scoped>
.relative {
  position: relative;
}
</style>