<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-2">Configuration des devises</h3>
      <p class="text-sm text-gray-600">Choisissez la devise principale utilisée dans l'application</p>
    </div>

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Devise actuelle</label>
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <span class="text-2xl font-bold text-gray-900">{{ currentCurrency.symbol }}</span>
            <div>
              <p class="text-sm font-medium text-gray-900">{{ currentCurrency.name }}</p>
              <p class="text-xs text-gray-500">{{ currentCurrency.code }}</p>
            </div>
          </div>
          <div class="text-sm text-gray-600">
            Exemple: {{ $formatCurrency(1234.56) }}
          </div>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Changer la devise</label>
        <select 
          v-model="selectedCurrency" 
          @change="updateCurrency"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Sélectionner une devise</option>
          <option 
            v-for="(currency, code) in availableCurrencies" 
            :key="code" 
            :value="code"
            :disabled="code === currentCurrency.code"
          >
            {{ currency.symbol }} - {{ currency.name }} ({{ currency.code }})
          </option>
        </select>
      </div>

      <div v-if="selectedCurrency" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div>
            <h4 class="text-sm font-medium text-blue-800">Aperçu du changement</h4>
            <div class="mt-2 text-sm text-blue-700">
              <p>Nouvelle devise: <strong>{{ availableCurrencies[selectedCurrency].name }}</strong></p>
              <p>Exemple de formatage: <strong>{{ formatPreview(1234.56) }}</strong></p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div>
            <h4 class="text-sm font-medium text-yellow-800">Important</h4>
            <p class="mt-1 text-sm text-yellow-700">
              Le changement de devise affectera l'affichage dans toute l'application. 
              Les montants existants ne seront pas convertis automatiquement.
            </p>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3">
        <button
          @click="resetToDefault"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          Réinitialiser
        </button>
        <button
          @click="applyCurrencyChange"
          :disabled="!selectedCurrency"
          class="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Appliquer les changements
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { CURRENCY_CONFIG, AVAILABLE_CURRENCIES, setCurrency, formatCurrency } from '@/config/currency'

export default {
  name: 'CurrencySettings',
  data() {
    return {
      selectedCurrency: '',
      availableCurrencies: AVAILABLE_CURRENCIES,
      currentCurrency: { ...CURRENCY_CONFIG }
    }
  },
  methods: {
    updateCurrency() {
      // Mise à jour en temps réel pour l'aperçu
      if (this.selectedCurrency) {
        this.currentCurrency = { ...AVAILABLE_CURRENCIES[this.selectedCurrency] }
      }
    },
    formatPreview(amount) {
      if (!this.selectedCurrency) return ''
      const currency = AVAILABLE_CURRENCIES[this.selectedCurrency]
      try {
        return new Intl.NumberFormat(currency.locale, {
          style: 'currency',
          currency: currency.code
        }).format(amount)
      } catch (error) {
        return `${amount} ${currency.symbol}`
      }
    },
    applyCurrencyChange() {
      if (!this.selectedCurrency) return
      
      // Appliquer le changement de devise
      setCurrency(this.selectedCurrency)
      
      // Mettre à jour l'état local
      this.currentCurrency = { ...AVAILABLE_CURRENCIES[this.selectedCurrency] }
      this.selectedCurrency = ''
      
      // Émettre un événement pour notifier le changement
      this.$emit('currency-changed', this.currentCurrency)
      
      // Afficher une notification de succès
      if (this.$toast) {
        this.$toast.success(`Devise changée vers ${this.currentCurrency.name}`)
      }
      
      // Recharger la page pour appliquer les changements partout
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    },
    resetToDefault() {
      setCurrency('CHF')
      this.currentCurrency = { ...AVAILABLE_CURRENCIES.CHF }
      this.selectedCurrency = ''
      
      if (this.$toast) {
        this.$toast.success('Devise réinitialisée vers CHF')
      }
      
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  },
  mounted() {
    // Initialiser avec la devise actuelle
    this.currentCurrency = { ...CURRENCY_CONFIG }
  }
}
</script>