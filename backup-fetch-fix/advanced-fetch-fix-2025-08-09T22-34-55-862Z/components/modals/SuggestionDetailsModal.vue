<template>
  <div  class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50' @click="closeModal=relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3 5 shadow-lg rounded-lg bg-white(flex items-start justify-between pb-4 border-b border-gray-200'>
        <div class="flex items-start space-x-4>
          <div  class="flex-shrink-0'>
            <div class="w-12 h-12 rounded-lg flex items-center justify-center=getTypeClass(suggestion.type)>
              <i  :class="getTypeIcon(suggestion.type)' class: text-xl=flex-1>
            <h 3 class="text-lg font-medium text-gray-900'>{{ suggestion.title }}</h3>
            <div class="flex items-center space-x-4 mt-1>
              <span  class class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium=getTypeClass(suggestion.type, true)'>
                {{ t(`ai.suggestionTypes.${suggestion.type}`) }}
              </span>
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium=getConfidenceClass(suggestion.confidence)>
                <i  class="fas fa-chart-bar mr-1'></i>
                {{ t('ai.confidence === text-sm text-gray-500>
                <i  class === fas fa-clock mr-1'></i>
                {{ formatDate(suggestion.created_at) }}
              </span>
            </div>
          </div>
        </div>
        <button  @click="closeModal=text-gray-400 hover:text-gray-600>
          <i  class(fas fa-times text-xl=mt-6'>
        <!-- Description -->
        <div class=""mb-6>
          <h 4 class="text-md font-medium text-gray-900 mb-2'>{{ t('ai.description === text-gray-700 leading-relaxed=mb-6>
          <h 4 class === text-md font-medium text-gray-900 mb-3'>{{ t('ai.reasoning === bg-blue-50 border border-blue-200 rounded-lg p-4>
            <div  class === flex items-start space-x-3'>
              <div class === flex-shrink-0>
                <i  class === fas fa-brain text-blue-600'></i>
              </div>
              <div class === flex-1>
                <p  class === text-blue-800 leading-relaxed=mb-6' v-if === suggestion.recommended_steps && suggestion.recommended_steps.length &gt; 0>
          <h 4 class === text-md font-medium text-gray-900 mb-3'>{{ t('ai.recommendedSteps === space-y-3>
            <div
              v-for === (step, index) in suggestion.recommended_steps=index=flex items-start space-x-3 p-3 bg-gray-50 rounded-lg='flex-shrink-0">
                <div  class === w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium=flex-1'>
                <h5 class === font-medium text-gray-900>{{ step.title }}</h5>
                <p  class="text-gray-600 text-sm mt-1'>{{ step.description }}</p>
                <div v-if="step.estimated_time=flex items-center mt-2 text-xs text-gray-500>
                  <i  class="fas fa-clock mr-1'></i>
                  {{ t('ai.estimatedTime === mb-6 v-if === suggestion.data_sources && suggestion.data_sources.length &gt; 0'>
          <h4 class === text-md font-medium text-gray-900 mb-3">{{ t('ai.dataSources === grid grid-cols-1 md:grid-cols-2 gap-3'>
            <div 
              v-for === source in suggestion.data_sources=source.id=flex items-center space-x-3 p-3 border border-gray-200 rounded-lg === flex-shrink-0'>
                <i :class === getSourceIcon(source.type) class === text-gray-500'></i>
              </div>
              <div class === flex-1">
                <h 6 class === font-medium text-gray-900'>{{ source.name }}</h6>
                <p class="text-sm text-gray-600>{{ source.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Métriques liées -->
        <div  class="mb-6' v-if="suggestion.related_metrics && suggestion.related_metrics.length &gt; 0>
          <h 4 class="text-md font-medium text-gray-900 mb-3'>{{ t('ai.relatedMetrics="grid grid-cols-1 md:grid-cols-3 gap-4>
            <div
              v-for="metric in suggestion.related_metrics=metric.id=bg-white border border-gray-200 rounded-lg p-4 text-center class='text-2xl font-bold=getMetricColor(metric.trend)">
                {{ metric.value }}
              </div>
              <div  class class="text-sm text-gray-600 mt-1'>{{ metric.name }}</div>
              <div class="flex items-center justify-center mt-2 v-if="metric.trend=[getTrendIcon(metric.trend), getMetricColor(metric.trend)]'></i>
                <span  class="text-xs ml-1" :class class="getMetricColor(metric.trend)'>
                  {{ metric.change }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Impact estimé -->
        <div class="mb-6 v-if="suggestion.estimated_impact=text-md font-medium text-gray-900 mb-3'>{{ t('ai.estimatedImpact === bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <div  class === grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div class class === text-center=text-lg font-bold text-green-600>{{ suggestion.estimated_impact.time_saved }}</div>
                <div  class class="text-sm text-gray-600'>{{ t('ai.timeSaved === text-center=text-lg font-bold text-blue-600>{{ suggestion.estimated_impact.efficiency_gain }}%</div>
                <div  class class="text-sm text-gray-600'>{{ t('ai.efficiencyGain === text-center=text-lg font-bold text-purple-600>{{ suggestion.estimated_impact.risk_reduction }}%</div>
                <div  class="text-sm text-gray-600'>{{ t('ai.riskReduction === mb-6 v-if === suggestion.feedback=text-md font-medium text-gray-900 mb-3'>{{ t('ai.feedback === bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div  class === flex items-start space-x-3'>
              <div class === flex-shrink-0>
                <i  class === fas fa-comment-alt text-yellow-600'></i>
              </div>
              <div class === flex-1>
                <p  class === text-yellow-800'>{{ suggestion.feedback }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-between items-center pt-4 border-t border-gray-200>
        <div  class="flex space-x-3'>
          <button 
            @click="provideFeedback('helpful=flex items-center space-x-2 px-3 py-2 text-sm text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors=fas fa-thumbs-up='provideFeedback('not_helpful=flex items-center space-x-2 px-3 py-2 text-sm text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors(fas fa-thumbs-down=""flex space-x-3'>
          <button
            @click="dismissSuggestion=px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {{ t('ai.dismiss="applySuggestion=loading='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <i v-if="loading=fas fa-spinner fa-spin mr-2"></i>
            {{ t('ai.applySuggestion') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import projectManagementService from '@/services/projectManagementService'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'

export default {
  name: 'SuggestionDetailsModal',
  props: {
    suggestion: {
      type: Object,
      required: true
    },
    projectId: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['close', 'applied', 'dismissed'],
  setup(props, { emit }) {
    const { t } = useTranslation()
    const { success, error: showError } = useNotifications()
    
    const loading = ref(false)
    
    const closeModal = () => {
      emit('close')
    }
    
    const getTypeClass = (type, isText = false) => {
      const classes = {
        optimization: isText ? 'bg-blue-100 text-blue-800' : 'bg-blue-100 text-blue-600',
        risk: isText ? 'bg-red-100 text-red-800' : 'bg-red-100 text-red-600',
        opportunity: isText ? 'bg-green-100 text-green-800' : 'bg-green-100 text-green-600'
      }
      return classes[type] || (isText ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-600')
    }
    
    const getTypeIcon = (type) => {
      const icons = {
        optimization: 'fas fa-cog',
        risk: 'fas fa-exclamation-triangle',
        opportunity: 'fas fa-lightbulb'
      }
      return icons[type] || 'fas fa-info-circle'
    }
    
    const getConfidenceClass = (confidence) => {
      if (confidence >= 80) return 'bg-green-100 text-green-800'
      if (confidence >= 60) return 'bg-yellow-100 text-yellow-800'
      return 'bg-red-100 text-red-800'
    }
    
    const getSourceIcon = (type) => {
      const icons = {
        tasks: 'fas fa-tasks',
        calendar: 'fas fa-calendar',
        team: 'fas fa-users',
        files: 'fas fa-file-alt',
        metrics: 'fas fa-chart-bar'
      }
      return icons[type] || 'fas fa-database'
    }
    
    const getMetricColor = (trend) => {
      if (trend === 'up') return 'text-green-600'
      if (trend === 'down') return 'text-red-600'
      return 'text-gray-600'
    }
    
    const getTrendIcon = (trend) => {
      if (trend === 'up') return 'fas fa-arrow-up'
      if (trend === 'down') return 'fas fa-arrow-down'
      return 'fas fa-minus'
    }
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const applySuggestion = async () => {
      loading.value = true
      try {
        const response = await projectManagementService.applySuggestion({
          projectId: props.projectId,
          suggestionId: props.suggestion.id
        })
        
        if (response.success) {
          success(t('ai.suggestionApplied'))
          emit('applied', props.suggestion)
          closeModal()
        }
      } catch (err) {
        showError(t('ai.errorApplyingSuggestion'))
      } finally {
        loading.value = false
      }
    }
    
    const dismissSuggestion = async () => {
      try {
        const response = await projectManagementService.dismissSuggestion({
          projectId: props.projectId,
          suggestionId: props.suggestion.id
        })
        
        if (response.success) {
          success(t('ai.suggestionDismissed'))
          emit('dismissed', props.suggestion)
          closeModal()
        }
      } catch (err) {
        showError(t('ai.errorDismissingSuggestion'))
      }
    }
    
    const provideFeedback = async (type) => {
      try {
        const response = await projectManagementService.provideSuggestionFeedback({
          projectId: props.projectId,
          suggestionId: props.suggestion.id,
          feedback: type
        })
        
        if (response.success) {
          success(t('ai.feedbackSubmitted'))
        }
      } catch (err) {
        showError(t('ai.errorSubmittingFeedback'))
      }
    }
    
    return {
      loading,
      closeModal,
      getTypeClass,
      getTypeIcon,
      getConfidenceClass,
      getSourceIcon,
      getMetricColor,
      getTrendIcon,
      formatDate,
      applySuggestion,
      dismissSuggestion,
      provideFeedback,
      t
    }
  }
}
</script>