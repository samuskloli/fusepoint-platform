import { formatCurrency, getCurrencySymbol, getCurrencyCode, formatSimpleCurrency } from '@/config/currency'

/**
 * Plugin Vue pour les fonctions de devise
 */
export default {
  install(app) {
    // Ajouter les fonctions de devise comme propriétés globales
    app.config.globalProperties.$formatCurrency = formatCurrency
    app.config.globalProperties.$getCurrencySymbol = getCurrencySymbol
    app.config.globalProperties.$getCurrencyCode = getCurrencyCode
    app.config.globalProperties.$formatSimpleCurrency = formatSimpleCurrency
    
    // Ajouter comme provide/inject pour la Composition API
    app.provide('formatCurrency', formatCurrency)
    app.provide('getCurrencySymbol', getCurrencySymbol)
    app.provide('getCurrencyCode', getCurrencyCode)
    app.provide('formatSimpleCurrency', formatSimpleCurrency)
  }
}