<template>
  <div class="currency-selector">
    <div class="flex items-center space-x-2">
      <label class="text-sm font-medium text-gray-700">
        Devise:
      </label>
      <select 
        v-model="selectedCurrency" 
        @change="changeCurrency"
        class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option 
          v-for="(currency, code) in availableCurrencies" 
          :key="code" 
          :value="code"
        >
          {{ currency.symbol }} {{ currency.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import { AVAILABLE_CURRENCIES, getCurrencyCode, setCurrency } from '@/config/currency'

export default {
  name: 'CurrencySelector',
  data() {
    return {
      selectedCurrency: getCurrencyCode(),
      availableCurrencies: AVAILABLE_CURRENCIES
    }
  },
  methods: {
    changeCurrency() {
      setCurrency(this.selectedCurrency)
      
      // Émettre un événement pour notifier le changement
      this.$emit('currency-changed', this.selectedCurrency)
      
      // Afficher une notification si disponible
      if (this.$toast) {
        const currencyName = AVAILABLE_CURRENCIES[this.selectedCurrency].name
        this.$toast.success(`Devise changée vers ${currencyName}`)
      }
      
      // Recharger la page pour appliquer les changements
      setTimeout(() => {
        window.location.reload()
      }, 500)
    }
  },
  mounted() {
    // Synchroniser avec la devise actuelle au montage
    this.selectedCurrency = getCurrencyCode()
  }
}
</script>

<style scoped>
.currency-selector {
  display: inline-block;
}

select {
  min-width: 120px;
}
</style>