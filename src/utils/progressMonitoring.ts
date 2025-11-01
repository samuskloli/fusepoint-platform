/**
 * Système de monitoring en temps réel pour la progression des tâches
 * Surveille les performances et détecte les anomalies
 */

export interface PerformanceMetric {
  id: string
  type: 'api_call' | 'ui_update' | 'data_sync' | 'validation'
  duration: number
  timestamp: number
  success: boolean
  error?: string
  metadata?: Record<string, any>
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  score: number // 0-100
  issues: string[]
  recommendations: string[]
  lastCheck: number
}

/**
 * Service de monitoring des performances en temps réel
 */
export class ProgressMonitoringService {
  private static instance: ProgressMonitoringService
  private metrics: PerformanceMetric[] = []
  private readonly MAX_METRICS = 1000
  private readonly HEALTH_CHECK_INTERVAL = 60000 // 1 minute
  private healthCheckInterval: number | null = null
  private observers: ((health: SystemHealth) => void)[] = []

  private constructor() {
    this.startHealthChecks()
  }

  static getInstance(): ProgressMonitoringService {
    if (!ProgressMonitoringService.instance) {
      ProgressMonitoringService.instance = new ProgressMonitoringService()
    }
    return ProgressMonitoringService.instance
  }

  /**
   * Enregistre une métrique de performance
   */
  recordMetric(
    type: PerformanceMetric['type'],
    duration: number,
    success: boolean,
    error?: string,
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      duration,
      timestamp: Date.now(),
      success,
      error,
      metadata
    }

    this.metrics.push(metric)

    // Limiter le nombre de métriques en mémoire
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS)
    }

    // Vérifier si cette métrique indique un problème
    this.checkForAnomalies(metric)
  }

  /**
   * Mesure automatiquement la performance d'une fonction
   */
  async measurePerformance<T>(
    type: PerformanceMetric['type'],
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now()
    let success = true
    let error: string | undefined

    try {
      const result = await fn()
      return result
    } catch (err) {
      success = false
      error = err instanceof Error ? err.message : 'Unknown error'
      throw err
    } finally {
      const duration = performance.now() - startTime
      this.recordMetric(type, duration, success, error, metadata)
    }
  }

  /**
   * Obtient l'état de santé du système
   */
  getSystemHealth(): SystemHealth {
    const now = Date.now()
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < 300000) // 5 minutes

    if (recentMetrics.length === 0) {
      return {
        status: 'healthy',
        score: 100,
        issues: [],
        recommendations: [],
        lastCheck: now
      }
    }

    const issues: string[] = []
    const recommendations: string[] = []
    let score = 100

    // Analyser le taux de succès
    const successRate = recentMetrics.filter(m => m.success).length / recentMetrics.length
    if (successRate < 0.9) {
      issues.push(`Taux de succès faible: ${(successRate * 100).toFixed(1)}%`)
      recommendations.push('Vérifier les erreurs réseau et la connectivité')
      score -= 30
    }

    // Analyser les performances
    const avgDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length
    if (avgDuration > 2000) {
      issues.push(`Performance dégradée: ${avgDuration.toFixed(0)}ms en moyenne`)
      recommendations.push('Optimiser les requêtes et la logique métier')
      score -= 20
    }

    // Analyser les erreurs fréquentes
    const errorCounts = new Map<string, number>()
    recentMetrics.filter(m => m.error).forEach(m => {
      const count = errorCounts.get(m.error!) || 0
      errorCounts.set(m.error!, count + 1)
    })

    for (const [error, count] of errorCounts) {
      if (count > 5) {
        issues.push(`Erreur récurrente: ${error} (${count} fois)`)
        recommendations.push(`Investiguer et corriger: ${error}`)
        score -= 15
      }
    }

    // Déterminer le statut
    let status: SystemHealth['status'] = 'healthy'
    if (score < 70) status = 'critical'
    else if (score < 85) status = 'warning'

    return {
      status,
      score: Math.max(0, score),
      issues,
      recommendations,
      lastCheck: now
    }
  }

  /**
   * Obtient les statistiques de performance
   */
  getPerformanceStats(timeRange: number = 300000): {
    totalRequests: number
    successRate: number
    averageDuration: number
    p95Duration: number
    errorsByType: Record<string, number>
    requestsByType: Record<string, number>
  } {
    const now = Date.now()
    const relevantMetrics = this.metrics.filter(m => now - m.timestamp < timeRange)

    if (relevantMetrics.length === 0) {
      return {
        totalRequests: 0,
        successRate: 1,
        averageDuration: 0,
        p95Duration: 0,
        errorsByType: {},
        requestsByType: {}
      }
    }

    const successCount = relevantMetrics.filter(m => m.success).length
    const durations = relevantMetrics.map(m => m.duration).sort((a, b) => a - b)
    const p95Index = Math.floor(durations.length * 0.95)

    const errorsByType: Record<string, number> = {}
    const requestsByType: Record<string, number> = {}

    relevantMetrics.forEach(metric => {
      // Compter les requêtes par type
      requestsByType[metric.type] = (requestsByType[metric.type] || 0) + 1

      // Compter les erreurs par type
      if (metric.error) {
        errorsByType[metric.error] = (errorsByType[metric.error] || 0) + 1
      }
    })

    return {
      totalRequests: relevantMetrics.length,
      successRate: successCount / relevantMetrics.length,
      averageDuration: relevantMetrics.reduce((sum, m) => sum + m.duration, 0) / relevantMetrics.length,
      p95Duration: durations[p95Index] || 0,
      errorsByType,
      requestsByType
    }
  }

  /**
   * S'abonne aux changements d'état de santé
   */
  onHealthChange(callback: (health: SystemHealth) => void): () => void {
    this.observers.push(callback)
    return () => {
      const index = this.observers.indexOf(callback)
      if (index > -1) {
        this.observers.splice(index, 1)
      }
    }
  }

  /**
   * Exporte les métriques pour analyse
   */
  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['id', 'type', 'duration', 'timestamp', 'success', 'error', 'metadata']
      const rows = this.metrics.map(m => [
        m.id,
        m.type,
        m.duration.toString(),
        m.timestamp.toString(),
        m.success.toString(),
        m.error || '',
        JSON.stringify(m.metadata || {})
      ])
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }

    return JSON.stringify(this.metrics, null, 2)
  }

  private checkForAnomalies(metric: PerformanceMetric): void {
    // Vérifier les durées anormalement longues
    if (metric.duration > 5000) {
      console.warn(`Performance dégradée détectée: ${metric.type} a pris ${metric.duration}ms`)
    }

    // Vérifier les erreurs critiques
    if (!metric.success && metric.error) {
      console.error(`Erreur détectée: ${metric.type} - ${metric.error}`)
    }
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = window.setInterval(() => {
      const health = this.getSystemHealth()
      this.observers.forEach(observer => observer(health))
    }, this.HEALTH_CHECK_INTERVAL)
  }

  /**
   * Nettoie les ressources
   */
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
    this.observers = []
    this.metrics = []
  }
}

/**
 * Hook Vue pour utiliser le monitoring
 */
export function useProgressMonitoring() {
  const monitoring = ProgressMonitoringService.getInstance()

  return {
    recordMetric: monitoring.recordMetric.bind(monitoring),
    measurePerformance: monitoring.measurePerformance.bind(monitoring),
    getSystemHealth: monitoring.getSystemHealth.bind(monitoring),
    getPerformanceStats: monitoring.getPerformanceStats.bind(monitoring),
    onHealthChange: monitoring.onHealthChange.bind(monitoring),
    exportMetrics: monitoring.exportMetrics.bind(monitoring)
  }
}

// Instance globale
export const progressMonitoring = ProgressMonitoringService.getInstance()