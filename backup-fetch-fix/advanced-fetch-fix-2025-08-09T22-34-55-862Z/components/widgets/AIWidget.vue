<template>
  <BaseWidget 
    :widget="widgetConfig=loading=error='showConfigModal = true=toggleWidget="loadSuggestions="ai-widget=ai-header='ai-status="status-indicator=aiStatus="status-info='status-label=last-analysis="ai-actions="refreshAnalysis=isAnalyzing='refresh-btn="t('widgets.ai.refreshAnalysis={ 'fa-spin="showChatModal = true='chat-btn=t('widgets.ai.openChat="ai-metrics="aiMetrics=metrics-grid='metric-card></i>
            </div>
            <div  class="metric-content=metric-value metric-label='metric-card=metric-icon="fas fa-lightbulb text-yellow-500></i>
            </div>
            <div  class="metric-content=metric-value metric-label='metric-card=metric-icon="fas fa-exclamation-triangle text-red-500></i>
            </div>
            <div  class="metric-content=metric-value metric-label='suggestions-filters=filter-tabs="activeFilter = 'all="filter-tab={ active: activeFilter === 'all='activeFilter = 'optimization="filter-tab={ active: activeFilter === 'optimization="activeFilter = 'risks='filter-tab={ active: activeFilter === 'risks="activeFilter = 'opportunities="filter-tab={ active: activeFilter === 'opportunities='suggestions-list="suggestion in filteredSuggestions=suggestion.id="suggestion-item'
        >
          <div class="suggestion-header=suggestion-icon getSuggestionIcon(suggestion.type)></i>
            </div>
            
            <div  class="suggestion-info=suggestion-title-row suggestion-title='suggestion-badges=priority-badge="`priority-${suggestion.priority}`
                  >
                    {{ t(`widgets.ai.priority.${suggestion.priority}`) }}
                  </div>
                  
                  <span  
                    class="confidence-badge=getConfidenceClass(suggestion.confidence)'
                  >
                    {{ suggestion.confidence }}% {{ t('widgets.ai.confidence="suggestion-description=suggestion-meta=meta-item='fas fa-clock=meta-item="suggestion.impact="fas fa-chart-bar=meta-item='suggestion.effort="fas fa-hammer=suggestion-actions="applySuggestion(suggestion)'
                class="action-btn apply=suggestion.actionable="t('widgets.ai.applySuggestion='dismissSuggestion(suggestion)"
                class="action-btn dismiss=t('widgets.ai.dismissSuggestion='viewSuggestionDetails(suggestion)"
                class="action-btn details=t('widgets.ai.viewDetails='expandedSuggestion === suggestion.id="suggestion-details"suggestion.reasoning=detail-title="detail-text='detail-section=suggestion.steps?.length &gt; 0">
                <h 6 class="detail-title=steps-list='step in suggestion.steps="step.id=step-item="detail-section='suggestion.data_sources?.length &gt; 0>
                <h 6 class="detail-title=data-sources='source in suggestion.data_sources="source=data-source-tag="detail-section='suggestion.related_metrics=detail-title="metrics-list="(value, metric) in suggestion.related_metrics=metric='metric-item="metric-name=metric-value="filteredSuggestions.length === 0' class="no-suggestions=fas fa-robot text-gray-400 text-4xl mb-3></i>
          <h 5 class="text-gray-600 mb-2'>{{ t('widgets.ai.noSuggestions="text-gray-500 text-sm mb-4>{{ t('widgets.ai.noSuggestionsDescription="refreshAnalysis=analyze-btn='fas fa-brain mr-2"></i>
            {{ t('widgets.ai.analyzeProject="quick-insights=quickInsights?.length &gt; 0'>
        <h5 class="insights-title=fas fa-lightbulb mr-2"></i>
          {{ t('widgets.ai.quickInsights="insights-list=insight in quickInsights='insight.id="insight-item"insight-content=insight-text="insight-value='showChatModal=projectId="showChatModal = false="showDetailsModal=selectedSuggestion='showDetailsModal = false="applySuggestion=dismissSuggestion="showConfigModal='widgetConfig=configOptions="showConfigModal = false="updateConfig"
    />
  </BaseWidget>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import BaseWidget from './BaseWidget.vue'
import AIChatModal from '../modals/AIChatModal.vue'
import SuggestionDetailsModal from '../modals/SuggestionDetailsModal.vue'
import WidgetConfigModal from '../modals/WidgetConfigModal.vue'
import projectManagementService from '@/services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'

export default {
  name: 'AIWidget',
  components: {
    BaseWidget,
    AIChatModal,
    SuggestionDetailsModal,
    WidgetConfigModal
  },
  props: {
    projectId: {
      type: [String, Number],
      required: true
    },
    widgetData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update-widget'],
  setup(props, { emit }) {
    const { success, error: showError } = useNotifications()
    const { t } = useTranslation()
    
    // État réactif
    const loading = ref(false)
    const error = ref(null)
    const suggestions = ref([])
    const aiMetrics = ref(null)
    const quickInsights = ref([])
    const aiStatus = ref('active')
    const lastAnalysis = ref(new Date())
    const isAnalyzing = ref(false)
    const activeFilter = ref('all')
    const expandedSuggestion = ref(null)
    const showChatModal = ref(false)
    const showDetailsModal = ref(false)
    const showConfigModal = ref(false)
    const selectedSuggestion = ref(null)
    
    // Configuration du widget
    const widgetConfig = ref({
      id: 'ai',
      name: 'IA',
      icon: 'fas fa-brain',
      titleKey: 'widgets.ai.title',
      isEnabled: true,
      autoAnalysis: true,
      analysisInterval: 3600000, // 1 heure
      showMetrics: true,
      showInsights: true,
      confidenceThreshold: 70,
      maxSuggestions: 10,
      ...props.widgetData
    })
    
    // Options de configuration
    const configOptions = ref([
      {
        key: 'autoAnalysis',
        type: 'boolean',
        label: 'Analyse automatique',
        default: true
      },
      {
        key: 'analysisInterval',
        type: 'number',
        label: 'Intervalle d\'analyse (ms)',
        default: 3600000,
        min: 300000,
        max: 86400000
      },
      {
        key: 'showMetrics',
        type: 'boolean',
        label: 'Afficher les métriques',
        default: true
      },
      {
        key: 'showInsights',
        type: 'boolean',
        label: 'Afficher les insights rapides',
        default: true
      },
      {
        key: 'confidenceThreshold',
        type: 'number',
        label: 'Seuil de confiance (%)',
        default: 70,
        min: 50,
        max: 95
      },
      {
        key: 'maxSuggestions',
        type: 'number',
        label: 'Nombre max de suggestions',
        default: 10,
        min: 5,
        max: 50
      }
    ])
    
    // Propriétés calculées
    const optimizationSuggestions = computed(() => 
      suggestions.value.filter(s => s.type === 'optimization')
    )
    
    const riskSuggestions = computed(() => 
      suggestions.value.filter(s => s.type === 'risk')
    )
    
    const opportunitySuggestions = computed(() => 
      suggestions.value.filter(s => s.type === 'opportunity')
    )
    
    const filteredSuggestions = computed(() => {
      let filtered = [...suggestions.value]
      
      // Filtrer par type
      if (activeFilter.value !== 'all') {
        filtered = filtered.filter(s => {
          switch (activeFilter.value) {
            case 'optimization':
              return s.type === 'optimization'
            case 'risks':
              return s.type === 'risk'
            case 'opportunities':
              return s.type === 'opportunity'
            default:
              return true
          }
        })
      }
      
      // Filtrer par seuil de confiance
      filtered = filtered.filter(s => s.confidence >= widgetConfig.value.confidenceThreshold)
      
      // Limiter le nombre
      filtered = filtered.slice(0, widgetConfig.value.maxSuggestions)
      
      // Trier par priorité et confiance
      filtered.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        return b.confidence - a.confidence
      })
      
      return filtered
    })
    
    // Méthodes
    const loadSuggestions = async () => {
      loading.value = true
      error.value = null
      
      try {
        // Simuler le chargement des suggestions IA
        const result = await projectManagementService.getAISuggestions?.(props.projectId) || {
          success: true,
          data: {
            suggestions: [
              {
                id: 1,
                title: 'Optimiser le taux de conversion',
                description: 'Basé sur l\'analyse des données, vous pourriez améliorer le taux de conversion de 23% en optimisant la page d\'accueil.',
                type: 'optimization',
                priority: 'high',
                confidence: 87,
                impact: '+23% conversion',
                effort: 'medium',
                actionable: true,
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                reasoning: 'L\'analyse des données de navigation montre un taux de rebond élevé sur la page d\'accueil. Les utilisateurs quittent principalement après 15 secondes.',
                steps: [
                  { id: 1, description: 'Réduire le temps de chargement de la page' },
                  { id: 2, description: 'Simplifier le message principal' },
                  { id: 3, description: 'Ajouter un call-to-action plus visible' }
                ],
                data_sources: ['analytics', 'user_behavior', 'conversion_data'],
                related_metrics: {
                  bounce_rate: '68%',
                  avg_session_duration: '1m 23s',
                  conversion_rate: '2.4%'
                }
              },
              {
                id: 2,
                title: 'Risque de dépassement de budget',
                description: 'Le projet risque de dépasser le budget de 15% si les dépenses actuelles continuent au même rythme.',
                type: 'risk',
                priority: 'high',
                confidence: 92,
                impact: '-15% budget',
                effort: 'low',
                actionable: true,
                created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                reasoning: 'L\'analyse des dépenses montre une accélération des coûts dans les dernières semaines, principalement due aux heures supplémentaires.',
                steps: [
                  { id: 1, description: 'Réviser la planification des tâches' },
                  { id: 2, description: 'Réduire les heures supplémentaires' },
                  { id: 3, description: 'Négocier avec les fournisseurs' }
                ],
                data_sources: ['budget_tracking', 'time_logs', 'expense_reports'],
                related_metrics: {
                  budget_used: '78%',
                  time_remaining: '45%',
                  burn_rate: '€2,340/semaine'
                }
              },
              {
                id: 3,
                title: 'Opportunité d\'expansion',
                description: 'Les données montrent un potentiel d\'expansion vers le marché mobile avec un ROI estimé à 340%.',
                type: 'opportunity',
                priority: 'medium',
                confidence: 76,
                impact: '+340% ROI',
                effort: 'high',
                actionable: false,
                created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                reasoning: 'L\'analyse du marché montre une forte demande pour une version mobile de votre produit, avec peu de concurrents directs.',
                steps: [
                  { id: 1, description: 'Étude de marché approfondie' },
                  { id: 2, description: 'Développement d\'un prototype mobile' },
                  { id: 3, description: 'Test avec un groupe d\'utilisateurs' }
                ],
                data_sources: ['market_analysis', 'user_requests', 'competitor_analysis'],
                related_metrics: {
                  mobile_traffic: '45%',
                  user_requests: '127',
                  market_size: '€2.3M'
                }
              }
            ],
            metrics: {
              performance_score: 78,
              suggestions_count: 3,
              risks_detected: 1
            },
            insights: [
              {
                id: 1,
                icon: 'fas fa-trending-up',
                text: 'Croissance du trafic',
                value: '+12% cette semaine'
              },
              {
                id: 2,
                icon: 'fas fa-users',
                text: 'Nouveaux utilisateurs',
                value: '234 cette semaine'
              },
              {
                id: 3,
                icon: 'fas fa-clock',
                text: 'Temps moyen sur site',
                value: '3m 45s'
              }
            ]
          }
        }
        
        if (result.success) {
          suggestions.value = result.data.suggestions
          aiMetrics.value = result.data.metrics
          if (widgetConfig.value.showInsights) {
            quickInsights.value = result.data.insights
          }
          lastAnalysis.value = new Date()
        }
      } catch (err) {
        error.value = t('errors.loadingFailed')
        aiStatus.value = 'error'
      } finally {
        loading.value = false
      }
    }
    
    const refreshAnalysis = async () => {
      isAnalyzing.value = true
      aiStatus.value = 'analyzing'
      
      try {
        await loadSuggestions()
        aiStatus.value = 'active'
        success(t('widgets.ai.analysisCompleted'))
      } catch (err) {
        aiStatus.value = 'error'
        showError(t('widgets.ai.analysisFailed'))
      } finally {
        isAnalyzing.value = false
      }
    }
    
    const formatLastAnalysis = () => {
      if (!lastAnalysis.value) return t('widgets.ai.never')
      
      const now = new Date()
      const diff = now - lastAnalysis.value
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      
      if (minutes < 1) return t('widgets.ai.justNow')
      if (minutes < 60) return t('widgets.ai.minutesAgo', { count: minutes })
      if (hours < 24) return t('widgets.ai.hoursAgo', { count: hours })
      
      return lastAnalysis.value.toLocaleDateString('fr-FR')
    }
    
    const formatSuggestionTime = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      if (diffHours < 1) return t('widgets.ai.justNow')
      if (diffHours < 24) return t('widgets.ai.hoursAgo', { count: diffHours })
      return t('widgets.ai.daysAgo', { count: diffDays })
    }
    
    const getSuggestionIcon = (type) => {
      const icons = {
        optimization: 'fas fa-chart-line text-blue-500',
        risk: 'fas fa-exclamation-triangle text-red-500',
        opportunity: 'fas fa-lightbulb text-yellow-500'
      }
      return icons[type] || 'fas fa-info-circle text-gray-500'
    }
    
    const getConfidenceClass = (confidence) => {
      if (confidence >= 90) return 'confidence-high'
      if (confidence >= 70) return 'confidence-medium'
      return 'confidence-low'
    }
    
    const applySuggestion = async (suggestion) => {
      try {
        // Simuler l'application de la suggestion
        suggestion.applied = true
        suggestions.value = suggestions.value.filter(s => s.id !== suggestion.id)
        success(t('widgets.ai.suggestionApplied'))
      } catch (err) {
        showError(t('widgets.ai.applyFailed'))
      }
    }
    
    const dismissSuggestion = async (suggestion) => {
      try {
        suggestions.value = suggestions.value.filter(s => s.id !== suggestion.id)
        success(t('widgets.ai.suggestionDismissed'))
      } catch (err) {
        showError(t('widgets.ai.dismissFailed'))
      }
    }
    
    const viewSuggestionDetails = (suggestion) => {
      if (expandedSuggestion.value === suggestion.id) {
        expandedSuggestion.value = null
      } else {
        expandedSuggestion.value = suggestion.id
      }
    }
    
    const toggleWidget = () => {
      widgetConfig.value.isEnabled = !widgetConfig.value.isEnabled
      emit('update-widget', widgetConfig.value)
    }
    
    const updateConfig = (newConfig) => {
      widgetConfig.value = { ...widgetConfig.value, ...newConfig }
      emit('update-widget', widgetConfig.value)
      showConfigModal.value = false
      
      // Recharger si les paramètres affectent les données
      if (newConfig.confidenceThreshold || newConfig.maxSuggestions) {
        // Les suggestions filtrées seront automatiquement mises à jour
      }
    }
    
    // Watchers
    watch(() => props.projectId, loadSuggestions, { immediate: true })
    
    // Auto-analysis
    let analysisInterval
    watch(() => widgetConfig.value.autoAnalysis, (enabled) => {
      if (analysisInterval) {
        clearInterval(analysisInterval)
      }
      
      if (enabled) {
        analysisInterval = setInterval(refreshAnalysis, widgetConfig.value.analysisInterval)
      }
    }, { immediate: true })
    
    onMounted(() => {
      loadSuggestions()
    })
    
    return {
      loading,
      error,
      suggestions,
      aiMetrics,
      quickInsights,
      aiStatus,
      lastAnalysis,
      isAnalyzing,
      activeFilter,
      expandedSuggestion,
      showChatModal,
      showDetailsModal,
      showConfigModal,
      selectedSuggestion,
      widgetConfig,
      configOptions,
      optimizationSuggestions,
      riskSuggestions,
      opportunitySuggestions,
      filteredSuggestions,
      loadSuggestions,
      refreshAnalysis,
      formatLastAnalysis,
      formatSuggestionTime,
      getSuggestionIcon,
      getConfidenceClass,
      applySuggestion,
      dismissSuggestion,
      viewSuggestionDetails,
      toggleWidget,
      updateConfig,
      t
    }
  }
}
</script>

<style scoped>
.ai-widget {
  @apply space-y-4;
}

.ai-header {
  @apply flex items-center justify-between;
}

.ai-status {
  @apply flex items-center space-x-3;
}

.status-indicator {
  @apply w-3 h-3 rounded-full;
}

.status-indicator.active {
  @apply bg-green-500;
}

.status-indicator.analyzing {
  @apply bg-blue-500 animate-pulse;
}

.status-indicator.error {
  @apply bg-red-500;
}

.status-indicator.inactive {
  @apply bg-gray-400;
}

.status-info {
  @apply flex flex-col;
}

.status-label {
  @apply text-sm font-medium text-gray-900;
}

.last-analysis {
  @apply text-xs text-gray-500;
}

.ai-actions {
  @apply flex items-center space-x-2;
}

.refresh-btn,
.chat-btn {
  @apply p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors;
}

.ai-metrics {
  @apply bg-gray-50 rounded-lg p-4;
}

.metrics-grid {
  @apply grid grid-cols-3 gap-4;
}

.metric-card {
  @apply flex items-center space-x-3;
}

.metric-icon {
  @apply w-10 h-10 rounded-lg bg-white flex items-center justify-center text-lg;
}

.metric-content {
  @apply flex-1;
}

.metric-value {
  @apply text-lg font-bold text-gray-900;
}

.metric-label {
  @apply text-xs text-gray-600;
}

.suggestions-filters {
  @apply border-b border-gray-200 pb-3;
}

.filter-tabs {
  @apply flex items-center space-x-1;
}

.filter-tab {
  @apply px-3 py-2 text-sm rounded-md transition-colors;
}

.filter-tab:not(.active) {
  @apply text-gray-600 hover:text-gray-900 hover:bg-gray-100;
}

.filter-tab.active {
  @apply bg-blue-100 text-blue-700;
}

.suggestions-list {
  @apply space-y-3 max-h-96 overflow-y-auto;
}

.suggestion-item {
  @apply bg-white border rounded-lg p-4 transition-all;
}

.suggestion-optimization {
  @apply border-blue-200 bg-blue-50;
}

.suggestion-risk {
  @apply border-red-200 bg-red-50;
}

.suggestion-opportunity {
  @apply border-yellow-200 bg-yellow-50;
}

.suggestion-header {
  @apply flex items-start space-x-3;
}

.suggestion-icon {
  @apply w-10 h-10 rounded-lg bg-white flex items-center justify-center text-lg flex-shrink-0;
}

.suggestion-info {
  @apply flex-1;
}

.suggestion-title-row {
  @apply flex items-start justify-between mb-2;
}

.suggestion-title {
  @apply text-base font-semibold text-gray-900;
}

.suggestion-badges {
  @apply flex items-center space-x-2;
}

.priority-badge {
  @apply px-2 py-1 text-xs rounded-full font-medium;
}

.priority-high {
  @apply bg-red-100 text-red-800;
}

.priority-medium {
  @apply bg-yellow-100 text-yellow-800;
}

.priority-low {
  @apply bg-green-100 text-green-800;
}

.confidence-badge {
  @apply px-2 py-1 text-xs rounded-full font-medium;
}

.confidence-high {
  @apply bg-green-100 text-green-800;
}

.confidence-medium {
  @apply bg-yellow-100 text-yellow-800;
}

.confidence-low {
  @apply bg-red-100 text-red-800;
}

.suggestion-description {
  @apply text-sm text-gray-700 mb-3;
}

.suggestion-meta {
  @apply flex items-center space-x-4 text-xs text-gray-600;
}

.meta-item {
  @apply flex items-center space-x-1;
}

.suggestion-actions {
  @apply flex items-center space-x-1 flex-shrink-0;
}

.action-btn {
  @apply w-8 h-8 flex items-center justify-center rounded-md transition-colors;
}

.action-btn.apply {
  @apply bg-green-100 text-green-600 hover:bg-green-200;
}

.action-btn.dismiss {
  @apply bg-red-100 text-red-600 hover:bg-red-200;
}

.action-btn.details {
  @apply bg-gray-100 text-gray-600 hover:bg-gray-200;
}

.suggestion-details {
  @apply mt-4 pt-4 border-t border-gray-200;
}

.details-content {
  @apply space-y-4;
}

.detail-section {
  @apply space-y-2;
}

.detail-title {
  @apply text-sm font-semibold text-gray-900;
}

.detail-text {
  @apply text-sm text-gray-700;
}

.steps-list {
  @apply list-decimal list-inside space-y-1 text-sm text-gray-700;
}

.step-item {
  @apply pl-2;
}

.data-sources {
  @apply flex flex-wrap gap-2;
}

.data-source-tag {
  @apply px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md;
}

.metrics-list {
  @apply space-y-2;
}

.metric-item {
  @apply flex items-center justify-between text-sm;
}

.metric-name {
  @apply text-gray-700;
}

.metric-value {
  @apply font-medium text-gray-900;
}

.no-suggestions {
  @apply text-center py-8;
}

.analyze-btn {
  @apply px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center;
}

.quick-insights {
  @apply bg-gray-50 rounded-lg p-4;
}

.insights-title {
  @apply text-sm font-semibold text-gray-900 mb-3 flex items-center;
}

.insights-list {
  @apply space-y-2;
}

.insight-item {
  @apply flex items-center space-x-3;
}

.insight-icon {
  @apply w-8 h-8 rounded-lg bg-white flex items-center justify-center text-sm;
}

.insight-content {
  @apply flex-1 flex items-center justify-between;
}

.insight-text {
  @apply text-sm text-gray-700;
}

.insight-value {
  @apply text-sm font-medium text-gray-900;
}
</style>