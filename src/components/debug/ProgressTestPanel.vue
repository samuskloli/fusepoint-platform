<template>
  <div class="progress-test-panel">
    <div class="test-header">
      <h3>🧪 Test de Réactivité - Barre de Progression</h3>
      <button @click="togglePanel" class="toggle-btn">
        {{ isExpanded ? '🔼' : '🔽' }}
      </button>
    </div>
    
    <div v-if="isExpanded" class="test-content">
      <!-- Contrôles de test -->
      <div class="test-controls">
        <div class="control-group">
          <label>Heures estimées:</label>
          <input 
            v-model.number="testTask.estimatedHours" 
            type="number" 
            min="0" 
            step="0.5"
            @input="updateTestTask"
          />
        </div>
        
        <div class="control-group">
          <label>Heures réelles:</label>
          <input 
            v-model.number="testTask.actualHours" 
            type="number" 
            min="0" 
            step="0.5"
            @input="updateTestTask"
          />
        </div>
        
        <div class="control-group">
          <label>Statut:</label>
          <select v-model="testTask.status" @change="updateTestTask">
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminé</option>
          </select>
        </div>
      </div>
      
      <!-- Aperçu de la progression -->
      <div class="progress-preview">
        <h4>Aperçu de la progression:</h4>
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: progressPercentage + '%' }"
              :class="progressClasses"
            ></div>
          </div>
          <span class="progress-text">{{ progressPercentage }}%</span>
        </div>
        
        <div class="progress-info">
          <p><strong>Heures estimées:</strong> {{ testTask.estimatedHours || 'Non défini' }}</p>
          <p><strong>Heures réelles:</strong> {{ testTask.actualHours || 'Non défini' }}</p>
          <p><strong>Statut:</strong> {{ testTask.status }}</p>
          <p><strong>Données valides:</strong> {{ hasValidData ? '✅' : '❌' }}</p>
        </div>
      </div>
      
      <!-- Tests automatisés -->
      <div class="automated-tests">
        <h4>Tests automatisés:</h4>
        <button @click="runReactivityTest" :disabled="isTestRunning" class="test-btn">
          {{ isTestRunning ? '⏳ Test en cours...' : '🚀 Tester la réactivité' }}
        </button>
        
        <div v-if="testResults.length > 0" class="test-results">
          <h5>Résultats des tests:</h5>
          <div v-for="result in testResults" :key="result.id" class="test-result">
            <span :class="result.success ? 'success' : 'error'">
              {{ result.success ? '✅' : '❌' }}
            </span>
            <span>{{ result.description }}</span>
            <span class="latency">{{ result.latency }}ms</span>
          </div>
        </div>
      </div>
      
      <!-- Logs de performance -->
      <div class="performance-logs">
        <h4>Logs de performance:</h4>
        <button @click="clearLogs" class="clear-btn">🗑️ Effacer</button>
        <button @click="exportLogs" class="export-btn">📥 Exporter</button>
        
        <div class="logs-container">
          <div v-for="log in recentLogs" :key="log.timestamp" class="log-entry">
            <span class="timestamp">{{ formatTimestamp(log.timestamp) }}</span>
            <span class="message">{{ log.message }}</span>
            <span v-if="log.data" class="data">{{ JSON.stringify(log.data) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { 
  validateTaskProgress, 
  calculateProgressPercentage, 
  hasValidProgressData,
  ProgressLogger,
  ProgressReactivityTester 
} from '@/utils/progressValidation'

// États du composant
const isExpanded = ref(false)
const isTestRunning = ref(false)
const progressLogger = ProgressLogger.getInstance()
const reactivityTester = new ProgressReactivityTester()

// Tâche de test
const testTask = ref({
  id: 'test-task-' + Date.now(),
  estimatedHours: 8,
  actualHours: 4,
  status: 'in_progress'
})

// Résultats des tests
const testResults = ref<Array<{
  id: string
  description: string
  success: boolean
  latency: number
}>>([])

// Logs récents
const recentLogs = ref<Array<{
  timestamp: number
  message: string
  data?: any
}>>([])

// Calculs réactifs
const progressPercentage = computed(() => {
  return calculateProgressPercentage(testTask.value.estimatedHours, testTask.value.actualHours)
})

const hasValidData = computed(() => {
  return hasValidProgressData(testTask.value.estimatedHours, testTask.value.actualHours)
})

const progressClasses = computed(() => ({
  'progress-low': progressPercentage.value < 50,
  'progress-medium': progressPercentage.value >= 50 && progressPercentage.value < 80,
  'progress-high': progressPercentage.value >= 80 && progressPercentage.value < 100,
  'progress-complete': progressPercentage.value >= 100
}))

// Méthodes
const togglePanel = () => {
  isExpanded.value = !isExpanded.value
}

const updateTestTask = () => {
  // Déclenche une validation
  const validation = validateTaskProgress(testTask.value)
  progressLogger.log('Test task updated', {
    task: testTask.value,
    validation
  })
}

const runReactivityTest = async () => {
  isTestRunning.value = true
  testResults.value = []
  
  try {
    // Test 1: Mise à jour des heures estimées
    const test1Start = performance.now()
    testTask.value.estimatedHours = 10
    await new Promise(resolve => setTimeout(resolve, 10))
    const test1End = performance.now()
    
    testResults.value.push({
      id: 'test-1',
      description: 'Mise à jour heures estimées',
      success: test1End - test1Start < 50,
      latency: test1End - test1Start
    })
    
    // Test 2: Mise à jour des heures réelles
    const test2Start = performance.now()
    testTask.value.actualHours = 7
    await new Promise(resolve => setTimeout(resolve, 10))
    const test2End = performance.now()
    
    testResults.value.push({
      id: 'test-2',
      description: 'Mise à jour heures réelles',
      success: test2End - test2Start < 50,
      latency: test2End - test2Start
    })
    
    // Test 3: Changement de statut
    const test3Start = performance.now()
    testTask.value.status = 'completed'
    await new Promise(resolve => setTimeout(resolve, 10))
    const test3End = performance.now()
    
    testResults.value.push({
      id: 'test-3',
      description: 'Changement de statut',
      success: test3End - test3Start < 50,
      latency: test3End - test3Start
    })
    
    // Test 4: Réactivité du tester
    const reactivityResult = await reactivityTester.testUpdate(testTask.value)
    
    testResults.value.push({
      id: 'test-4',
      description: 'Test de réactivité globale',
      success: reactivityResult.success,
      latency: reactivityResult.latency
    })
    
  } catch (error) {
    console.error('Erreur lors du test de réactivité:', error)
  } finally {
    isTestRunning.value = false
  }
}

const clearLogs = () => {
  progressLogger.clearLogs()
  updateRecentLogs()
}

const exportLogs = () => {
  const report = progressLogger.getPerformanceReport()
  if (report) {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `progress-performance-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

const updateRecentLogs = () => {
  recentLogs.value = progressLogger.getLogs().slice(-10)
}

// Watchers
watch(() => testTask.value, updateTestTask, { deep: true })

// Lifecycle
let logUpdateInterval: ReturnType<typeof setInterval>

onMounted(() => {
  // Met à jour les logs toutes les secondes
  logUpdateInterval = setInterval(updateRecentLogs, 1000)
  
  // Enregistre le tester pour les mises à jour
  reactivityTester.onUpdate((task) => {
    progressLogger.log('Reactivity test update', task)
  })
})

onUnmounted(() => {
  if (logUpdateInterval) {
    clearInterval(logUpdateInterval)
  }
  reactivityTester.cleanup()
})
</script>

<style scoped>
.progress-test-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 400px;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e1e5e9;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.test-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.toggle-btn:hover {
  background: #e2e8f0;
}

.test-content {
  padding: 16px;
  max-height: 600px;
  overflow-y: auto;
}

.control-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.control-group label {
  font-weight: 500;
  color: #4a5568;
  font-size: 14px;
}

.control-group input,
.control-group select {
  width: 120px;
  padding: 6px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.progress-preview {
  margin: 20px 0;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
}

.progress-preview h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: 4px;
}

.progress-fill.progress-low {
  background: #f56565;
}

.progress-fill.progress-medium {
  background: #ed8936;
}

.progress-fill.progress-high {
  background: #48bb78;
}

.progress-fill.progress-complete {
  background: #38a169;
}

.progress-text {
  font-weight: 600;
  font-size: 14px;
  color: #2d3748;
  min-width: 40px;
}

.progress-info {
  font-size: 12px;
  color: #718096;
}

.progress-info p {
  margin: 4px 0;
}

.automated-tests {
  margin: 20px 0;
  padding: 16px;
  background: #f0fff4;
  border-radius: 8px;
}

.automated-tests h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

.test-btn {
  background: #48bb78;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.test-btn:hover:not(:disabled) {
  background: #38a169;
}

.test-btn:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

.test-results {
  margin-top: 16px;
}

.test-results h5 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #2d3748;
}

.test-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.test-result:last-child {
  border-bottom: none;
}

.test-result .success {
  color: #38a169;
}

.test-result .error {
  color: #e53e3e;
}

.test-result .latency {
  font-weight: 600;
  color: #4a5568;
}

.performance-logs {
  margin: 20px 0;
  padding: 16px;
  background: #fffaf0;
  border-radius: 8px;
}

.performance-logs h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

.clear-btn,
.export-btn {
  background: #ed8936;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  margin-right: 8px;
  margin-bottom: 12px;
}

.export-btn {
  background: #4299e1;
}

.clear-btn:hover {
  background: #dd6b20;
}

.export-btn:hover {
  background: #3182ce;
}

.logs-container {
  max-height: 200px;
  overflow-y: auto;
  font-size: 11px;
  font-family: 'Monaco', 'Menlo', monospace;
}

.log-entry {
  display: flex;
  gap: 8px;
  padding: 4px 0;
  border-bottom: 1px solid #fed7aa;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-entry .timestamp {
  color: #9ca3af;
  min-width: 80px;
}

.log-entry .message {
  color: #374151;
  font-weight: 500;
}

.log-entry .data {
  color: #6b7280;
  font-style: italic;
}
</style>