/**
 * Utilitaires de validation pour la fonctionnalité de progression des tâches
 * Assure la cohérence et la réactivité des barres de progression
 */

export interface ProgressValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  performance: {
    calculationTime: number
    renderTime?: number
  }
}

export interface TaskProgressData {
  id: string
  estimatedHours?: number
  actualHours?: number
  status?: string
}

/**
 * Valide les données de progression d'une tâche
 */
export function validateTaskProgress(task: TaskProgressData): ProgressValidationResult {
  const startTime = performance.now()
  const errors: string[] = []
  const warnings: string[] = []

  // Validation des types
  if (task.estimatedHours !== undefined && typeof task.estimatedHours !== 'number') {
    errors.push(`Task ${task.id}: estimatedHours must be a number, got ${typeof task.estimatedHours}`)
  }

  if (task.actualHours !== undefined && typeof task.actualHours !== 'number') {
    errors.push(`Task ${task.id}: actualHours must be a number, got ${typeof task.actualHours}`)
  }

  // Validation des valeurs
  if (typeof task.estimatedHours === 'number') {
    if (task.estimatedHours < 0) {
      errors.push(`Task ${task.id}: estimatedHours cannot be negative (${task.estimatedHours})`)
    }
    if (task.estimatedHours === 0) {
      warnings.push(`Task ${task.id}: estimatedHours is 0, progress calculation will be disabled`)
    }
  }

  if (typeof task.actualHours === 'number') {
    if (task.actualHours < 0) {
      errors.push(`Task ${task.id}: actualHours cannot be negative (${task.actualHours})`)
    }
  }

  // Validation de cohérence
  if (
    typeof task.estimatedHours === 'number' && 
    typeof task.actualHours === 'number' &&
    task.estimatedHours > 0
  ) {
    const progressPercentage = (task.actualHours / task.estimatedHours) * 100
    
    if (progressPercentage > 150) {
      warnings.push(`Task ${task.id}: actual hours (${task.actualHours}) significantly exceed estimated hours (${task.estimatedHours}) - ${Math.round(progressPercentage)}%`)
    }
    
    if (task.status === 'completed' && progressPercentage < 80) {
      warnings.push(`Task ${task.id}: marked as completed but progress is only ${Math.round(progressPercentage)}%`)
    }
  }

  const calculationTime = performance.now() - startTime

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    performance: {
      calculationTime
    }
  }
}

/**
 * Calcule le pourcentage de progression avec validation
 */
export function calculateProgressPercentage(estimatedHours?: number, actualHours?: number): number {
  // Validation stricte des types et valeurs
  if (typeof estimatedHours !== 'number' || typeof actualHours !== 'number') {
    return 0
  }
  
  if (estimatedHours <= 0 || actualHours < 0) {
    return 0
  }
  
  return Math.min(100, Math.round((actualHours / estimatedHours) * 100))
}

/**
 * Vérifie si les données de progression sont disponibles
 */
export function hasValidProgressData(estimatedHours?: number, actualHours?: number): boolean {
  return typeof estimatedHours === 'number' && 
         typeof actualHours === 'number' && 
         estimatedHours > 0 && 
         actualHours >= 0
}

/**
 * Teste la réactivité des mises à jour de progression
 */
export class ProgressReactivityTester {
  private updateCallbacks: Array<(task: TaskProgressData) => void> = []
  private lastUpdateTime = 0

  /**
   * Enregistre un callback pour les mises à jour
   */
  onUpdate(callback: (task: TaskProgressData) => void) {
    this.updateCallbacks.push(callback)
  }

  /**
   * Simule une mise à jour de tâche et mesure la réactivité
   */
  async testUpdate(task: TaskProgressData): Promise<{ latency: number; success: boolean }> {
    const startTime = performance.now()
    this.lastUpdateTime = startTime

    // Déclenche tous les callbacks
    const promises = this.updateCallbacks.map(callback => {
      return new Promise<void>((resolve) => {
        callback(task)
        // Simule le temps de rendu avec requestAnimationFrame
        requestAnimationFrame(() => resolve())
      })
    })

    await Promise.all(promises)
    
    const endTime = performance.now()
    const latency = endTime - startTime

    return {
      latency,
      success: latency < 16 // 60 FPS = 16ms par frame
    }
  }

  /**
   * Nettoie les callbacks
   */
  cleanup() {
    this.updateCallbacks = []
  }
}

/**
 * Utilitaire de logging pour le débogage de la progression
 */
export class ProgressLogger {
  private static instance: ProgressLogger
  private logs: Array<{ timestamp: number; message: string; data?: any }> = []

  static getInstance(): ProgressLogger {
    if (!ProgressLogger.instance) {
      ProgressLogger.instance = new ProgressLogger()
    }
    return ProgressLogger.instance
  }

  log(message: string, data?: any) {
    const timestamp = performance.now()
    this.logs.push({ timestamp, message, data })
    
    // Garde seulement les 100 derniers logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100)
    }

    console.log(`🔍 [Progress] ${message}`, data || '')
  }

  getLogs() {
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
  }

  getPerformanceReport() {
    if (this.logs.length < 2) return null

    const firstLog = this.logs[0]
    const lastLog = this.logs[this.logs.length - 1]
    const totalTime = lastLog.timestamp - firstLog.timestamp

    return {
      totalLogs: this.logs.length,
      timeSpan: totalTime,
      averageInterval: totalTime / (this.logs.length - 1),
      logs: this.logs
    }
  }
}