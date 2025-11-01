<template>
  <div class="progress-health-monitor" :class="healthStatusClass">
    <!-- Indicateur de santé principal -->
    <div class="health-indicator">
      <div class="health-icon">
        <i :class="healthIcon"></i>
      </div>
      <div class="health-info">
        <h4 class="health-title">{{ t('monitoring.systemHealth') }}</h4>
        <p class="health-status">{{ healthStatusText }}</p>
        <div class="health-score">
          <div class="score-bar">
            <div 
              class="score-fill" 
              :style="{ width: `${health.score}%` }"
            ></div>
          </div>
          <span class="score-text">{{ health.score }}/100</span>
        </div>
      </div>
    </div>

    <!-- Statistiques détaillées (collapsible) -->
    <div v-if="showDetails" class="health-details">
      <!-- Métriques de performance -->
      <div class="metrics-section">
        <h5>{{ t('monitoring.performance') }}</h5>
        <div class="metrics-grid">
          <div class="metric-item">
            <span class="metric-label">{{ t('monitoring.totalRequests') }}</span>
            <span class="metric-value">{{ stats.totalRequests }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">{{ t('monitoring.successRate') }}</span>
            <span class="metric-value">{{ (stats.successRate * 100).toFixed(1) }}%</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">{{ t('monitoring.avgDuration') }}</span>
            <span class="metric-value">{{ stats.averageDuration.toFixed(0) }}ms</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">{{ t('monitoring.p95Duration') }}</span>
            <span class="metric-value">{{ stats.p95Duration.toFixed(0) }}ms</span>
          </div>
        </div>
      </div>

      <!-- Problèmes identifiés -->
      <div v-if="health.issues.length > 0" class="issues-section">
        <h5>{{ t('monitoring.issues') }}</h5>
        <ul class="issues-list">
          <li v-for="issue in health.issues" :key="issue" class="issue-item">
            <i class="fas fa-exclamation-triangle"></i>
            {{ issue }}
          </li>
        </ul>
      </div>

      <!-- Recommandations -->
      <div v-if="health.recommendations.length > 0" class="recommendations-section">
        <h5>{{ t('monitoring.recommendations') }}</h5>
        <ul class="recommendations-list">
          <li v-for="recommendation in health.recommendations" :key="recommendation" class="recommendation-item">
            <i class="fas fa-lightbulb"></i>
            {{ recommendation }}
          </li>
        </ul>
      </div>

      <!-- Actions rapides -->
      <div class="actions-section">
        <button @click="exportMetrics" class="action-btn export-btn">
          <i class="fas fa-download"></i>
          {{ t('monitoring.exportMetrics') }}
        </button>
        <button @click="clearMetrics" class="action-btn clear-btn">
          <i class="fas fa-trash"></i>
          {{ t('monitoring.clearMetrics') }}
        </button>
      </div>
    </div>

    <!-- Toggle pour afficher/masquer les détails -->
    <button @click="showDetails = !showDetails" class="toggle-details">
      <i :class="showDetails ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
      {{ showDetails ? t('monitoring.hideDetails') : t('monitoring.showDetails') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import { useProgressMonitoring } from '@/utils/progressMonitoring'

const { t } = useTranslation()
const { getSystemHealth, getPerformanceStats, onHealthChange, exportMetrics: exportMetricsService } = useProgressMonitoring()

// États réactifs
const health = ref(getSystemHealth())
const stats = ref(getPerformanceStats())
const showDetails = ref(false)

// Computed properties pour l'affichage
const healthStatusClass = computed(() => ({
  'health-healthy': health.value.status === 'healthy',
  'health-warning': health.value.status === 'warning',
  'health-critical': health.value.status === 'critical'
}))

const healthIcon = computed(() => {
  switch (health.value.status) {
    case 'healthy': return 'fas fa-check-circle'
    case 'warning': return 'fas fa-exclamation-triangle'
    case 'critical': return 'fas fa-times-circle'
    default: return 'fas fa-question-circle'
  }
})

const healthStatusText = computed(() => {
  switch (health.value.status) {
    case 'healthy': return t('monitoring.status.healthy')
    case 'warning': return t('monitoring.status.warning')
    case 'critical': return t('monitoring.status.critical')
    default: return t('monitoring.status.unknown')
  }
})

// Fonctions
const updateStats = () => {
  health.value = getSystemHealth()
  stats.value = getPerformanceStats()
}

const exportMetrics = () => {
  const data = exportMetricsService('json')
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `progress-metrics-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const clearMetrics = () => {
  if (confirm(t('monitoring.confirmClearMetrics'))) {
    // Réinitialiser les métriques (cette fonctionnalité devrait être ajoutée au service)
    updateStats()
  }
}

// Lifecycle
let unsubscribe: (() => void) | null = null

onMounted(() => {
  // S'abonner aux changements d'état de santé
  unsubscribe = onHealthChange((newHealth) => {
    health.value = newHealth
    stats.value = getPerformanceStats()
  })

  // Mise à jour initiale
  updateStats()
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<style scoped>
.progress-health-monitor {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all duration-300;
}

.health-indicator {
  @apply flex items-center space-x-4;
}

.health-icon {
  @apply flex-shrink-0;
}

.health-icon i {
  @apply text-2xl;
}

.health-healthy .health-icon i {
  @apply text-green-500;
}

.health-warning .health-icon i {
  @apply text-yellow-500;
}

.health-critical .health-icon i {
  @apply text-red-500;
}

.health-info {
  @apply flex-1;
}

.health-title {
  @apply text-lg font-semibold text-gray-900 mb-1;
}

.health-status {
  @apply text-sm text-gray-600 mb-2;
}

.health-score {
  @apply flex items-center space-x-3;
}

.score-bar {
  @apply flex-1 h-2 bg-gray-200 rounded-full overflow-hidden;
}

.score-fill {
  @apply h-full transition-all duration-500 ease-out;
}

.health-healthy .score-fill {
  @apply bg-green-500;
}

.health-warning .score-fill {
  @apply bg-yellow-500;
}

.health-critical .score-fill {
  @apply bg-red-500;
}

.score-text {
  @apply text-sm font-medium text-gray-700;
}

.health-details {
  @apply mt-6 space-y-4 border-t border-gray-100 pt-4;
}

.metrics-section h5,
.issues-section h5,
.recommendations-section h5 {
  @apply text-sm font-semibold text-gray-900 mb-3;
}

.metrics-grid {
  @apply grid grid-cols-2 gap-4;
}

.metric-item {
  @apply flex justify-between items-center p-3 bg-gray-50 rounded-lg;
}

.metric-label {
  @apply text-sm text-gray-600;
}

.metric-value {
  @apply text-sm font-semibold text-gray-900;
}

.issues-list,
.recommendations-list {
  @apply space-y-2;
}

.issue-item,
.recommendation-item {
  @apply flex items-start space-x-2 text-sm;
}

.issue-item {
  @apply text-red-700;
}

.recommendation-item {
  @apply text-blue-700;
}

.issue-item i {
  @apply text-red-500 mt-0.5;
}

.recommendation-item i {
  @apply text-blue-500 mt-0.5;
}

.actions-section {
  @apply flex space-x-3 pt-4 border-t border-gray-100;
}

.action-btn {
  @apply flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200;
}

.export-btn {
  @apply bg-blue-50 text-blue-700 hover:bg-blue-100;
}

.clear-btn {
  @apply bg-red-50 text-red-700 hover:bg-red-100;
}

.toggle-details {
  @apply w-full mt-4 flex items-center justify-center space-x-2 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200;
}

/* Responsive */
@media (max-width: 640px) {
  .metrics-grid {
    @apply grid-cols-1;
  }
  
  .actions-section {
    @apply flex-col space-y-2 space-x-0;
  }
}
</style>