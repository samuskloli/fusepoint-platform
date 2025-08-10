/**
 * Service de traduction côté client
 * Gère la localisation et les traductions de l'application frontend
 */

// Import synchrone des traductions
import frTranslations from '../langold/fr.js'
import enTranslations from '../langold/en.js'

class TranslationService {
  constructor() {
    this.defaultLanguage = 'fr'
    this.currentLanguage = 'fr'
    this.translations = {
      fr: frTranslations,
      en: enTranslations
    }
    this.initializeLanguage()
    console.log('✅ Service de traduction initialisé')
  }

  /**
   * Obtient les langues disponibles
   */
  getAvailableLanguages() {
    return [
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'en', name: 'English', flag: '🇺🇸' }
    ]
  }

  /**
   * Définit la langue courante
   */
  setLanguage(language) {
    if (this.translations[language]) {
      this.currentLanguage = language
      // Sauvegarder la préférence dans le localStorage
      localStorage.setItem('preferredLanguage', language)
      console.log(`🌐 Langue changée vers: ${language}`)
    } else {
      console.warn(`⚠️ Langue non supportée: ${language}`)
    }
  }

  /**
   * Obtient la langue courante
   */
  getCurrentLanguage() {
    return this.currentLanguage
  }

  /**
   * Traduit une clé donnée
   */
  t(key, params = {}) {
    // Vérifier que key est défini
    if (!key || typeof key !== 'string') {
      console.warn(`⚠️ Clé de traduction invalide dans t():`, key)
      return key || '[INVALID_KEY]'
    }
    
    const translation = this.getNestedValue(this.translations[this.currentLanguage], key)
    
    if (!translation) {
      console.warn(`⚠️ Traduction manquante pour la clé: ${key}`)
      return key // Retourne la clé si la traduction n'existe pas
    }

    // Interpolation des paramètres
    return this.interpolate(translation, params)
  }

  /**
   * Obtient une valeur imbriquée dans un objet via une clé pointée
   */
  getNestedValue(obj, key) {
    // Vérifier que key est défini et est une chaîne
    if (!key || typeof key !== 'string') {
      console.warn(`⚠️ Clé de traduction invalide:`, key)
      return null
    }
    
    return key.split('.').reduce((current, prop) => {
      return current && current[prop] !== undefined ? current[prop] : null
    }, obj)
  }

  /**
   * Interpole les paramètres dans une chaîne de traduction
   */
  interpolate(template, params) {
    if (typeof template !== 'string') {
      return template
    }

    return template.replace(/\{([^}]+)\}/g, (match, key) => {
      const value = params[key]
      return value !== undefined ? value : match
    })
  }

  /**
   * Vérifie si une traduction existe
   */
  exists(key) {
    return !!this.getNestedValue(this.translations[this.currentLanguage], key)
  }

  /**
   * Obtient une section complète de traductions
   */
  getSection(section) {
    const sectionData = this.getNestedValue(this.translations[this.currentLanguage], section)
    return sectionData || {}
  }

  /**
   * Initialise la langue depuis le localStorage ou utilise la langue par défaut
   */
  initializeLanguage() {
    const savedLanguage = localStorage.getItem('preferredLanguage')
    if (savedLanguage && this.translations[savedLanguage]) {
      this.setLanguage(savedLanguage)
    } else {
      // Détecter la langue du navigateur
      const browserLanguage = navigator.language.split('-')[0]
      if (this.translations[browserLanguage]) {
        this.setLanguage(browserLanguage)
      }
    }
  }
}

// Créer une instance unique du service
const translationService = new TranslationService()

export default translationService