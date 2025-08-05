import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import translationService from '../services/translationService'

/**
 * Store de traduction utilisant Pinia
 * Gère l'état des traductions et de la langue courante
 */
export const useTranslationStore = defineStore('translation', () => {
  // État réactif
  const currentLanguage = ref(translationService.getCurrentLanguage())
  const isLoading = ref(false)
  const error = ref(null)

  // Getters calculés
  const availableLanguages = computed(() => {
    return translationService.getAvailableLanguages().map(code => ({
      code,
      ...translationService.getLanguageInfo(code)
    }))
  })

  const currentLanguageInfo = computed(() => {
    return translationService.getLanguageInfo(currentLanguage.value)
  })

  // Actions
  const setLanguage = async (languageCode) => {
    try {
      isLoading.value = true
      error.value = null
      
      // Changer la langue dans le service
      translationService.setLanguage(languageCode)
      currentLanguage.value = languageCode
      
      // Ici on pourrait ajouter une logique pour charger dynamiquement
      // les traductions depuis le serveur si nécessaire
      
    } catch (err) {
      error.value = err.message
      console.error('❌ Erreur lors du changement de langue:', err)
    } finally {
      isLoading.value = false
    }
  }

  const t = (key, params = {}) => {
    return translationService.t(key, params)
  }

  const getSection = (section) => {
    return translationService.getSection(section)
  }

  const exists = (key) => {
    return translationService.exists(key)
  }

  const clearError = () => {
    error.value = null
  }

  // Initialisation
  const initialize = () => {
    translationService.initializeLanguage()
    currentLanguage.value = translationService.getCurrentLanguage()
  }

  return {
    // État
    currentLanguage,
    isLoading,
    error,
    
    // Getters
    availableLanguages,
    currentLanguageInfo,
    
    // Actions
    setLanguage,
    t,
    getSection,
    exists,
    clearError,
    initialize
  }
})