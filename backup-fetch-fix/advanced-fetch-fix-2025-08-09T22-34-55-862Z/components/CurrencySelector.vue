<template>
  <div class="currency-selector">
    <div class="flex items-center space-x-2">
      <label class="form-label">
        Devise:
      </label>
      <select 
        v-model="selectedCurrency" 
        @change="changeCurrency"
        class="form-select"
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
/* Styles spécifiques au sélecteur de devise */
.currency-selector {
  @apply inline-block;
}

.currency-selector select {
  min-width: 120px;
}
</style>