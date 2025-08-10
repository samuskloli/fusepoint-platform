import { useTranslation } from '@/composables/useTranslation'

/**
 * Composable pour gérer les notifications toast
 * Utilise le système de traduction centralisé
 */
export function useToast() {
  const { t } = useTranslation()

  /**
   * Affiche une notification de succès
   * @param {string} message - Clé de traduction ou message direct
   * @param {Object} params - Paramètres pour l'interpolation
   */
  const showSuccess = (message, params = {}) => {
    const translatedMessage = message.includes('.') ? t(message, params) : message
    console.log('✅ Success:', translatedMessage)
    // TODO: Intégrer avec un système de toast UI (ex: vue-toastification)
  }

  /**
   * Affiche une notification d'erreur
   * @param {string} message - Clé de traduction ou message direct
   * @param {Object} params - Paramètres pour l'interpolation
   */
  const showError = (message, params = {}) => {
    const translatedMessage = message.includes('.') ? t(message, params) : message
    console.error('❌ Error:', translatedMessage)
    // TODO: Intégrer avec un système de toast UI
  }

  /**
   * Affiche une notification d'information
   * @param {string} message - Clé de traduction ou message direct
   * @param {Object} params - Paramètres pour l'interpolation
   */
  const showInfo = (message, params = {}) => {
    const translatedMessage = message.includes('.') ? t(message, params) : message
    console.info('ℹ️ Info:', translatedMessage)
    // TODO: Intégrer avec un système de toast UI
  }

  /**
   * Affiche une notification d'avertissement
   * @param {string} message - Clé de traduction ou message direct
   * @param {Object} params - Paramètres pour l'interpolation
   */
  const showWarning = (message, params = {}) => {
    const translatedMessage = message.includes('.') ? t(message, params) : message
    console.warn('⚠️ Warning:', translatedMessage)
    // TODO: Intégrer avec un système de toast UI
  }

  /**
   * Fonction générique pour afficher un toast
   * @param {string} type - Type de toast (success, error, info, warning)
   * @param {string} message - Clé de traduction ou message direct
   * @param {Object} params - Paramètres pour l'interpolation
   */
  const showToast = (type = 'info', message, params = {}) => {
    switch (type) {
      case 'success':
        showSuccess(message, params)
        break
      case 'error':
        showError(message, params)
        break
      case 'warning':
        showWarning(message, params)
        break
      default:
        showInfo(message, params)
    }
  }

  return {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning
  }
}