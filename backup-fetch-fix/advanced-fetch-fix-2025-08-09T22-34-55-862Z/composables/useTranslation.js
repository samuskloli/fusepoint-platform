import { useI18n } from 'vue-i18n'
import { formatDate, formatCurrency, formatNumber, setLocale } from '../plugins/i18n.js'

/**
 * Composable pour la traduction utilisant Vue I18n
 * Remplace l'ancien système de traduction personnalisé
 */
export function useTranslation() {
  const { t, locale, availableLocales } = useI18n()

  // Fonction de traduction principale
  const translate = (key, params = {}) => {
    return t(key, params)
  }

  // Fonction pour changer la langue
  const changeLocale = (newLocale) => {
    return setLocale(newLocale)
  }

  // Fonction pour obtenir la langue actuelle
  const getCurrentLocale = () => {
    return locale.value
  }

  // Fonction pour obtenir les langues disponibles
  const getAvailableLocales = () => {
    return availableLocales
  }

  // Fonctions de formatage
  const $formatDate = formatDate
  const $formatCurrency = formatCurrency
  const $formatNumber = formatNumber

  return {
    // Fonction de traduction principale (compatible avec l'ancien système)
    t: translate,
    
    // Gestion des langues
    locale,
    availableLocales,
    changeLocale,
    getCurrentLocale,
    getAvailableLocales,
    
    // Fonctions de formatage (compatibilité avec l'ancien système)
    $formatDate,
    $formatCurrency,
    $formatNumber
  }
}

// Export par défaut pour la compatibilité
export default useTranslation