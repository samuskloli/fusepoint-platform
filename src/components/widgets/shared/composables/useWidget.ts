import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import type { Widget, WidgetConfig } from '@/types/widgets'

/**
 * Composable pour la gestion commune des widgets
 */
export function useWidget(widget: Widget, config?: WidgetConfig) {
  const { t } = useTranslation()
  
  // États réactifs
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<any>(null)
  const isConfiguring = ref(false)
  
  // Configuration du widget
  const widgetConfig = computed(() => ({
    ...widget,
    ...config,
    titleKey: widget.titleKey || `widgets.${widget.name}.title`,
    descriptionKey: widget.description || `widgets.${widget.name}.description`
  }))
  
  // Méthodes communes
  const setLoading = (state: boolean) => {
    loading.value = state
  }
  
  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }
  
  const setData = (newData: any) => {
    data.value = newData
    error.value = null
  }
  
  const toggleWidget = () => {
    widget.isEnabled = !widget.isEnabled
  }
  
  const showConfiguration = () => {
    isConfiguring.value = true
  }
  
  const hideConfiguration = () => {
    isConfiguring.value = false
  }
  
  const refreshWidget = async () => {
    if (typeof loadData === 'function') {
      await loadData()
    }
  }
  
  // Méthode de chargement des données (à surcharger)
  const loadData = async (): Promise<void> => {
    // À implémenter dans chaque widget spécifique
    console.warn(`loadData not implemented for widget: ${widget.name}`)
  }
  
  // Gestion des erreurs
  const handleError = (err: any) => {
    console.error(`Error in widget ${widget.name}:`, err)
    setError(err.message || t('common.error'))
    setLoading(false)
  }
  
  // Cycle de vie
  onMounted(() => {
    if (widget.isEnabled) {
      loadData().catch(handleError)
    }
  })
  
  return {
    // États
    loading,
    error,
    data,
    isConfiguring,
    widgetConfig,
    
    // Méthodes
    setLoading,
    setError,
    setData,
    toggleWidget,
    showConfiguration,
    hideConfiguration,
    refreshWidget,
    loadData,
    handleError
  }
}