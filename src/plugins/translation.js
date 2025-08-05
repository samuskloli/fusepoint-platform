/**
 * Plugin Vue pour le système de traduction
 * Enregistre globalement les fonctions de traduction et les rend disponibles dans tous les composants
 */

import { useTranslationStore } from '../stores/translation'
import translationService from '../services/translationService'

export default {
  install(app) {
    // Initialiser le store de traduction
    const translationStore = useTranslationStore()
    translationStore.initialize()

    // Enregistrer les propriétés globales
    app.config.globalProperties.$t = (key, params = {}) => {
      return translationService.t(key, params)
    }

    app.config.globalProperties.$tSection = (section) => {
      return translationService.getSection(section)
    }

    app.config.globalProperties.$tExists = (key) => {
      return translationService.exists(key)
    }

    app.config.globalProperties.$setLanguage = (languageCode) => {
      return translationStore.setLanguage(languageCode)
    }

    app.config.globalProperties.$currentLanguage = () => {
      return translationService.getCurrentLanguage()
    }

    app.config.globalProperties.$availableLanguages = () => {
      return translationService.getAvailableLanguages()
    }

    // Fonctions de formatage globales
    app.config.globalProperties.$formatDate = (date, format = 'short') => {
      if (!date) return ''
      
      const dateObj = new Date(date)
      const locale = translationService.getCurrentLanguage() === 'fr' ? 'fr-FR' : 'en-US'
      
      const formats = {
        short: { day: '2-digit', month: '2-digit', year: 'numeric' },
        long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
        time: { hour: '2-digit', minute: '2-digit' },
        datetime: { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit', 
          minute: '2-digit' 
        }
      }
      
      return dateObj.toLocaleDateString(locale, formats[format] || formats.short)
    }

    app.config.globalProperties.$formatCurrency = (amount, currency = 'EUR') => {
      if (typeof amount !== 'number') return amount
      
      const locale = translationService.getCurrentLanguage() === 'fr' ? 'fr-FR' : 'en-US'
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
      }).format(amount)
    }

    app.config.globalProperties.$formatNumber = (number, options = {}) => {
      if (typeof number !== 'number') return number
      
      const locale = translationService.getCurrentLanguage() === 'fr' ? 'fr-FR' : 'en-US'
      return number.toLocaleString(locale, options)
    }

    // Directive personnalisée pour la traduction
    app.directive('t', {
      mounted(el, binding) {
        const { value, arg, modifiers } = binding
        
        if (typeof value === 'string') {
          // Utilisation simple: v-t="'key'"
          el.textContent = translationService.t(value)
        } else if (typeof value === 'object') {
          // Utilisation avec paramètres: v-t="{ key: 'key', params: { name: 'John' } }"
          el.textContent = translationService.t(value.key, value.params || {})
        }
        
        // Modifier pour HTML: v-t.html="'key'"
        if (modifiers.html) {
          el.innerHTML = el.textContent
        }
      },
      
      updated(el, binding) {
        const { value, modifiers } = binding
        
        if (typeof value === 'string') {
          el.textContent = translationService.t(value)
        } else if (typeof value === 'object') {
          el.textContent = translationService.t(value.key, value.params || {})
        }
        
        if (modifiers.html) {
          el.innerHTML = el.textContent
        }
      }
    })

    // Directive pour les placeholders
    app.directive('t-placeholder', {
      mounted(el, binding) {
        el.placeholder = translationService.t(binding.value)
      },
      
      updated(el, binding) {
        el.placeholder = translationService.t(binding.value)
      }
    })

    // Directive pour les titres
    app.directive('t-title', {
      mounted(el, binding) {
        el.title = translationService.t(binding.value)
      },
      
      updated(el, binding) {
        el.title = translationService.t(binding.value)
      }
    })

    console.log('✅ Plugin de traduction initialisé avec succès')
  }
}