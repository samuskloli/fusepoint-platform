import { computed } from 'vue'
import { useTranslationStore } from '../stores/translation'

/**
 * Composable pour l'utilisation des traductions
 * Fournit une interface simple pour accéder aux traductions dans les composants
 */
export function useTranslation() {
  const translationStore = useTranslationStore()

  // Fonction de traduction principale
  const t = (key, params = {}) => {
    return translationStore.t(key, params)
  }

  // Fonction pour récupérer une section complète
  const getSection = (section) => {
    return translationStore.getSection(section)
  }

  // Getters réactifs pour les sections couramment utilisées
  const navigation = computed(() => getSection('navigation'))
  const actions = computed(() => getSection('actions'))
  const status = computed(() => getSection('status'))
  const errors = computed(() => getSection('errors'))
  const success = computed(() => getSection('success'))
  const clients = computed(() => getSection('clients'))
  const projects = computed(() => getSection('projects'))
  const forms = computed(() => getSection('forms'))
  const pagination = computed(() => getSection('pagination'))
  const filters = computed(() => getSection('filters'))
  const modals = computed(() => getSection('modals'))
  const notifications = computed(() => getSection('notifications'))
  const datetime = computed(() => getSection('datetime'))

  // Fonctions utilitaires
  const exists = (key) => {
    return translationStore.exists(key)
  }

  const setLanguage = (languageCode) => {
    return translationStore.setLanguage(languageCode)
  }

  // Getters pour l'état
  const currentLanguage = computed(() => translationStore.currentLanguage)
  const availableLanguages = computed(() => translationStore.availableLanguages)
  const currentLanguageInfo = computed(() => translationStore.currentLanguageInfo)
  const isLoading = computed(() => translationStore.isLoading)
  const error = computed(() => translationStore.error)

  // Fonctions de formatage spécifiques
  const formatDate = (date, format = 'short') => {
    if (!date) return ''
    
    const dateObj = new Date(date)
    const locale = currentLanguage.value === 'fr' ? 'fr-FR' : 'en-US'
    
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

  const formatRelativeTime = (date) => {
    if (!date) return ''
    
    const now = new Date()
    const dateObj = new Date(date)
    const diffInMinutes = Math.floor((now - dateObj) / (1000 * 60))
    
    if (diffInMinutes < 1) {
      return t('datetime.now')
    } else if (diffInMinutes < 60) {
      return t('datetime.minutesAgo', { minutes: diffInMinutes })
    } else if (diffInMinutes < 1440) { // 24 heures
      const hours = Math.floor(diffInMinutes / 60)
      return t('datetime.hoursAgo', { hours })
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return t('datetime.daysAgo', { days })
    }
  }

  const formatNumber = (number, options = {}) => {
    if (typeof number !== 'number') return number
    
    const locale = currentLanguage.value === 'fr' ? 'fr-FR' : 'en-US'
    return number.toLocaleString(locale, options)
  }

  const formatCurrency = (amount, currency = 'EUR') => {
    if (typeof amount !== 'number') return amount
    
    const locale = currentLanguage.value === 'fr' ? 'fr-FR' : 'en-US'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  // Fonction pour obtenir le statut traduit avec la classe CSS appropriée
  const getStatusWithClass = (statusKey) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      suspended: 'bg-orange-100 text-orange-800',
      archived: 'bg-purple-100 text-purple-800'
    }
    
    return {
      label: t(`status.${statusKey}`),
      class: statusClasses[statusKey] || 'bg-gray-100 text-gray-800'
    }
  }

  // Fonction pour obtenir les options de statut pour les selects
  const getStatusOptions = (includeAll = false) => {
    const statusKeys = ['active', 'inactive', 'pending', 'completed', 'cancelled', 'suspended', 'archived']
    const options = statusKeys.map(key => ({
      value: key,
      label: t(`status.${key}`)
    }))
    
    if (includeAll) {
      options.unshift({
        value: '',
        label: t('filters.all')
      })
    }
    
    return options
  }

  return {
    // Fonction principale
    t,
    
    // Sections réactives
    navigation,
    actions,
    status,
    errors,
    success,
    clients,
    projects,
    forms,
    pagination,
    filters,
    modals,
    notifications,
    datetime,
    
    // Fonctions utilitaires
    getSection,
    exists,
    setLanguage,
    
    // État
    currentLanguage,
    availableLanguages,
    currentLanguageInfo,
    isLoading,
    error,
    
    // Fonctions de formatage
    formatDate,
    formatRelativeTime,
    formatNumber,
    formatCurrency,
    getStatusWithClass,
    getStatusOptions
  }
}

// Export par défaut pour faciliter l'import
export default useTranslation