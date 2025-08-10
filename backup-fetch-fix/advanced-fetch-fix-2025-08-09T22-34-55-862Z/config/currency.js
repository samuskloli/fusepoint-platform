/**
 * Configuration centralisée des devises
 * Permet de changer facilement la devise utilisée dans toute l'application
 */

// Configuration principale de la devise
export const CURRENCY_CONFIG = {
  // Code de la devise (ISO 4217)
  code: 'CHF',
  
  // Symbole de la devise
  symbol: 'CHF',
  
  // Position du symbole (before/after)
  symbolPosition: 'after',
  
  // Séparateur décimal
  decimalSeparator: '.',
  
  // Séparateur des milliers
  thousandsSeparator: ',',
  
  // Nombre de décimales
  decimals: 2,
  
  // Locale pour le formatage
  locale: 'fr-CH'
}

// Devises disponibles pour la configuration
export const AVAILABLE_CURRENCIES = {
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    symbolPosition: 'after',
    locale: 'fr-CH',
    name: 'Franc suisse'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    symbolPosition: 'after',
    locale: 'fr-FR',
    name: 'Euro'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    symbolPosition: 'before',
    locale: 'en-US',
    name: 'Dollar américain'
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    symbolPosition: 'before',
    locale: 'en-GB',
    name: 'Livre sterling'
  }
}

/**
 * Fonction pour formater un montant selon la configuration de devise
 * @param {number} amount - Le montant à formater
 * @param {object} options - Options de formatage personnalisées
 * @returns {string} - Le montant formaté
 */
export function formatCurrency(amount, options = {}) {
  const config = { ...CURRENCY_CONFIG, ...options }
  
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `0 ${config.symbol}`
  }
  
  try {
    // Utiliser Intl.NumberFormat pour un formatage précis
    const formatter = new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals
    })
    
    return formatter.format(amount)
  } catch (error) {
    // Fallback en cas d'erreur
    const formattedAmount = Number(amount).toFixed(config.decimals)
    return config.symbolPosition === 'before' 
      ? `${config.symbol}${formattedAmount}`
      : `${formattedAmount} ${config.symbol}`
  }
}

/**
 * Fonction pour obtenir le symbole de la devise actuelle
 * @returns {string} - Le symbole de la devise
 */
export function getCurrencySymbol() {
  return CURRENCY_CONFIG.symbol
}

/**
 * Fonction pour obtenir le code de la devise actuelle
 * @returns {string} - Le code de la devise
 */
export function getCurrencyCode() {
  return CURRENCY_CONFIG.code
}

/**
 * Fonction pour changer la devise de l'application
 * @param {string} currencyCode - Le code de la nouvelle devise
 */
export function setCurrency(currencyCode) {
  if (AVAILABLE_CURRENCIES[currencyCode]) {
    Object.assign(CURRENCY_CONFIG, AVAILABLE_CURRENCIES[currencyCode])
  } else {
    console.warn(`Devise ${currencyCode} non supportée`)
  }
}

/**
 * Fonction pour formater un montant simple avec juste le symbole
 * @param {number} amount - Le montant à formater
 * @returns {string} - Le montant formaté simplement
 */
export function formatSimpleCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `0${CURRENCY_CONFIG.symbol}`
  }
  
  const formattedAmount = Number(amount).toLocaleString(CURRENCY_CONFIG.locale)
  return CURRENCY_CONFIG.symbolPosition === 'before'
    ? `${CURRENCY_CONFIG.symbol}${formattedAmount}`
    : `${formattedAmount}${CURRENCY_CONFIG.symbol}`
}

export default {
  CURRENCY_CONFIG,
  AVAILABLE_CURRENCIES,
  formatCurrency,
  getCurrencySymbol,
  getCurrencyCode,
  setCurrency,
  formatSimpleCurrency
}