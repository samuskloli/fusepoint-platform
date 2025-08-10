import { createI18n } from 'vue-i18n'
import fr from '../locales/fr/index.js'
import en from '../locales/en/index.js'
import i18nDirectives from '../directives/i18n.js'

// Fonction pour aplatir les objets de traduction
function flattenMessages(obj, prefix = '') {
  const flattened = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenMessages(obj[key], newKey))
      } else {
        flattened[newKey] = obj[key]
      }
    }
  }
  return flattened
}

// Aplatir les messages pour permettre l'accès direct aux clés
const flattenedFr = flattenMessages(fr)
const flattenedEn = flattenMessages(en)

// Fonctions de formatage pour la compatibilité avec l'ancien système
const formatDate = (date, options = {}) => {
  if (!date) return ''
  const dateObj = new Date(date)
  const currentLocale = 'fr' // Valeur par défaut avant l'initialisation
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  
  return dateObj.toLocaleDateString(currentLocale, { ...defaultOptions, ...options })
}

const formatCurrency = (amount, currency = 'EUR') => {
  if (amount === null || amount === undefined) return ''
  const currentLocale = 'fr' // Valeur par défaut avant l'initialisation
  
  return new Intl.NumberFormat(currentLocale, {
    style: 'currency',
    currency: currency
  }).format(amount)
}

const formatNumber = (number, options = {}) => {
  if (number === null || number === undefined) return ''
  const currentLocale = 'fr' // Valeur par défaut avant l'initialisation
  
  return new Intl.NumberFormat(currentLocale, options).format(number)
}

// Configuration Vue I18n
const i18n = createI18n({
  legacy: false, // Utiliser la Composition API
  locale: 'fr', // Langue par défaut
  fallbackLocale: 'en', // Langue de secours
  messages: {
    fr: { ...fr, ...flattenedFr },
    en: { ...en, ...flattenedEn }
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
    
    // Enregistrer seulement les directives personnalisées qui ne sont pas déjà fournies par Vue I18n
    // Vue I18n fournit déjà la directive 't', donc on évite de la réenregistrer
    Object.keys(i18nDirectives).forEach(name => {
      if (name !== 't') {
        app.directive(name, i18nDirectives[name])
      }
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

// Export des fonctions de formatage pour la compatibilité avec l'ancien système
export { formatDate, formatCurrency, formatNumber }