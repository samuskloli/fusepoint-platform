import { useI18n } from 'vue-i18n'
import { formatDate, formatCurrency, formatNumber, setLocale } from '../plugins/i18n.js'

import { t as globalT, locale as globalLocale, availableLocales as globalAvailableLocales } from '../plugins/i18n.js'

/**
 * Composable pour la traduction utilisant Vue I18n
 * Remplace l'ancien système de traduction personnalisé
 */
export function useTranslation() {
  // Récupérer le composer local si disponible
  const composer = useI18n()

  // Toujours fournir une fonction de traduction valide
  const localT = typeof composer?.t === 'function' ? composer.t : globalT

  // Assurer un locale réactif valide
  const localLocale = composer?.locale ?? globalLocale

  // Assurer une liste de locales disponible
  const localAvailableLocales = (composer?.availableLocales && composer.availableLocales.length > 0)
    ? composer.availableLocales
    : globalAvailableLocales

  // Fonction de traduction principale
  const translate = (key, params = {}) => {
    return localT(key, params)
  }

  // Fonction pour changer la langue
  const changeLocale = (newLocale) => {
    return setLocale(newLocale)
  }

  // Fonction pour obtenir la langue actuelle
  const getCurrentLocale = () => {
    return localLocale.value
  }

  // Fonction pour obtenir les langues disponibles
  const getAvailableLocales = () => {
    return localAvailableLocales
  }

  // Fonctions de formatage
  const $formatDate = formatDate
  const $formatCurrency = formatCurrency
  const $formatNumber = formatNumber

  return {
    // Fonction de traduction principale (compatible avec l'ancien système)
    t: translate,
    
    // Gestion des langues
    locale: localLocale,
    availableLocales: localAvailableLocales,
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