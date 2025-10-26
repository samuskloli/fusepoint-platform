/**
 * Directives Vue I18n personnalisées
 * Remplacent les anciennes directives v-t, v-t-placeholder, v-t-title
 */

import { useI18n } from 'vue-i18n'

// Helper pour parser en sécurité l'argument JSON
function safeParseArg(arg) {
  if (!arg) return {}
  try {
    return JSON.parse(arg)
  } catch (e) {
    console.warn('i18n directive: invalid JSON arg, fallback to empty object', arg, e)
    return {}
  }
}

// Directive v-t pour traduire le contenu textuel
export const vT = {
  mounted(el, binding) {
    const { t } = useI18n()
    const key = binding.value
    const params = safeParseArg(binding.arg)
    
    if (typeof key === 'string') {
      el.textContent = t(key, params)
    } else if (typeof key === 'object' && key.path) {
      el.textContent = t(key.path, key.params || {})
    }
  },
  
  updated(el, binding) {
    const { t } = useI18n()
    const key = binding.value
    const params = safeParseArg(binding.arg)
    
    if (typeof key === 'string') {
      el.textContent = t(key, params)
    } else if (typeof key === 'object' && key.path) {
      el.textContent = t(key.path, key.params || {})
    }
  }
}

// Directive v-t-placeholder pour traduire les placeholders
export const vTPlaceholder = {
  mounted(el, binding) {
    const { t } = useI18n()
    const key = binding.value
    const params = safeParseArg(binding.arg)
    
    if (typeof key === 'string') {
      el.placeholder = t(key, params)
    } else if (typeof key === 'object' && key.path) {
      el.placeholder = t(key.path, key.params || {})
    }
  },
  
  updated(el, binding) {
    const { t } = useI18n()
    const key = binding.value
    const params = safeParseArg(binding.arg)
    
    if (typeof key === 'string') {
      el.placeholder = t(key, params)
    } else if (typeof key === 'object' && key.path) {
      el.placeholder = t(key.path, key.params || {})
    }
  }
}

// Directive v-t-title pour traduire les titres (attribut title)
export const vTTitle = {
  mounted(el, binding) {
    const { t } = useI18n()
    const key = binding.value
    const params = safeParseArg(binding.arg)
    
    if (typeof key === 'string') {
      el.title = t(key, params)
    } else if (typeof key === 'object' && key.path) {
      el.title = t(key.path, key.params || {})
    }
  },
  
  updated(el, binding) {
    const { t } = useI18n()
    const key = binding.value
    const params = safeParseArg(binding.arg)
    
    if (typeof key === 'string') {
      el.title = t(key, params)
    } else if (typeof key === 'object' && key.path) {
      el.title = t(key.path, key.params || {})
    }
  }
}

// Export des directives pour l'enregistrement global
export default {
  't': vT,
  't-placeholder': vTPlaceholder,
  't-title': vTTitle
}