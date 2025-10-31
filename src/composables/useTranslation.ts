// Composable TypeScript pour accéder aux fonctions i18n
// Utilise les exportations du plugin '@/plugins/i18n.js'

// Importer toutes les exportations nommées sous forme d'objet pour éviter les soucis de d.ts
import * as i18n from '@/plugins/i18n.js'

export function useTranslation() {
  const { t, locale, availableLocales, setLocale, getSavedLocale, formatDate, formatCurrency, formatNumber } = i18n as any

  return {
    t,
    locale,
    availableLocales,
    setLocale,
    getSavedLocale,
    formatDate,
    formatCurrency,
    formatNumber,
  }
}

export default useTranslation