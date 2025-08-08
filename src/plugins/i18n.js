import { createI18n } from 'vue-i18n'
import fr from '../locales/fr/index.js'
import en from '../locales/en/index.js'
import i18nDirectives from '../directives/i18n.js'

// Configuration Vue I18n
const i18n = createI18n({
  legacy: false, // Utiliser la Composition API
  locale: 'fr', // Langue par défaut
  fallbackLocale: 'en', // Langue de secours
  messages: {
    fr,
    en
  },
  // Options supplémentaires
  globalInjection: true, // Permet d'utiliser $t dans les templates
  warnHtmlMessage: false, // Désactive les avertissements HTML
  silentTranslationWarn: false, // Affiche les avertissements de traduction manquante
  silentFallbackWarn: false // Affiche les avertissements de fallback
})

// Plugin Vue pour installer i18n avec les directives et propriétés globales
const VueI18nPlugin = {
  install(app) {
    // Installer Vue I18n
    app.use(i18n)
    
    // Enregistrer les directives personnalisées
    Object.keys(i18nDirectives).forEach(name => {
      app.directive(name, i18nDirectives[name])
    })
    
    // Ajouter les fonctions de formatage globales pour la compatibilité
    app.config.globalProperties.$formatDate = formatDate
    app.config.globalProperties.$formatCurrency = formatCurrency
    app.config.globalProperties.$formatNumber = formatNumber
  }
}

export default VueI18nPlugin

// Export des fonctions utilitaires pour la compatibilité
export const { t, locale, availableLocales } = i18n.global

// Fonction pour changer la langue
export const setLocale = (newLocale) => {
  if (availableLocales.includes(newLocale)) {
    locale.value = newLocale
    // Sauvegarder la préférence dans localStorage
    localStorage.setItem('preferred-language', newLocale)
    return true
  }
  return false
}

// Fonction pour récupérer la langue sauvegardée
export const getSavedLocale = () => {
  return localStorage.getItem('preferred-language') || 'fr'
}

// Initialiser la langue sauvegardée
const savedLocale = getSavedLocale()
if (availableLocales.includes(savedLocale)) {
  locale.value = savedLocale
}

// Fonctions de formatage pour la compatibilité avec l'ancien système
export const formatDate = (date, options = {}) => {
  if (!date) return ''
  const dateObj = new Date(date)
  const currentLocale = locale.value
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  
  return dateObj.toLocaleDateString(currentLocale, { ...defaultOptions, ...options })
}

export const formatCurrency = (amount, currency = 'EUR') => {
  if (amount === null || amount === undefined) return ''
  const currentLocale = locale.value
  
  return new Intl.NumberFormat(currentLocale, {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export const formatNumber = (number, options = {}) => {
  if (number === null || number === undefined) return ''
  const currentLocale = locale.value
  
  return new Intl.NumberFormat(currentLocale, options).format(number)
}