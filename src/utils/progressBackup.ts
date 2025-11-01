/**
 * Système de sauvegarde automatique pour la progression des tâches
 * Résout le problème critique de résilience identifié dans l'analyse
 */

export interface BackupEntry {
  id: string
  taskId: string
  data: any
  timestamp: number
  synced: boolean
  retryCount: number
}

export interface SyncOperation {
  id: string
  type: 'update' | 'create' | 'delete'
  taskId: string
  data: any
  timestamp: number
  priority: 'high' | 'medium' | 'low'
}

/**
 * Service de sauvegarde automatique avec synchronisation différée
 */
export class ProgressBackupService {
  private static instance: ProgressBackupService
  private backups: Map<string, BackupEntry> = new Map()
  private syncQueue: SyncOperation[] = []
  private isOnline = navigator.onLine
  private syncInterval: number | null = null
  private readonly STORAGE_KEY = 'fusepoint_progress_backup'
  private readonly SYNC_INTERVAL = 30000 // 30 secondes

  private constructor() {
    this.initializeEventListeners()
    this.loadFromStorage()
    this.startSyncInterval()
  }

  static getInstance(): ProgressBackupService {
    if (!ProgressBackupService.instance) {
      ProgressBackupService.instance = new ProgressBackupService()
    }
    return ProgressBackupService.instance
  }

  /**
   * Sauvegarde automatique des données de progression
   */
  autoSave(taskId: string, data: any, priority: 'high' | 'medium' | 'low' = 'medium'): void {
    const backupId = `backup_${taskId}_${Date.now()}`
    
    // Sauvegarde locale immédiate
    const backup: BackupEntry = {
      id: backupId,
      taskId,
      data: this.sanitizeData(data),
      timestamp: Date.now(),
      synced: false,
      retryCount: 0
    }

    this.backups.set(backupId, backup)
    this.saveToStorage()

    // Ajouter à la queue de synchronisation
    const syncOp: SyncOperation = {
      id: backupId,
      type: 'update',
      taskId,
      data: backup.data,
      timestamp: backup.timestamp,
      priority
    }

    this.enqueueSync(syncOp)

    console.log(`[ProgressBackup] Sauvegarde automatique: ${taskId}`)
  }

  /**
   * Synchronisation avec le serveur quand en ligne
   */
  async syncWhenOnline(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return
    }

    console.log(`[ProgressBackup] Synchronisation de ${this.syncQueue.length} opération(s)`)

    // Trier par priorité et timestamp
    const sortedQueue = [...this.syncQueue].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp
    })

    const results = await Promise.allSettled(
      sortedQueue.map(op => this.syncOperation(op))
    )

    // Traiter les résultats
    results.forEach((result, index) => {
      const operation = sortedQueue[index]
      
      if (result.status === 'fulfilled') {
        this.markAsSynced(operation.id)
        this.removeFromQueue(operation.id)
      } else {
        this.handleSyncError(operation, result.reason)
      }
    })

    this.saveToStorage()
  }

  /**
   * Récupération des données depuis la sauvegarde
   */
  recoverFromBackup(): BackupEntry[] {
    const unsyncedBackups = Array.from(this.backups.values())
      .filter(backup => !backup.synced)
      .sort((a, b) => b.timestamp - a.timestamp)

    console.log(`[ProgressBackup] Récupération de ${unsyncedBackups.length} sauvegarde(s)`)
    return unsyncedBackups
  }

  /**
   * Récupération spécifique pour une tâche
   */
  recoverTaskData(taskId: string): any | null {
    const taskBackups = Array.from(this.backups.values())
      .filter(backup => backup.taskId === taskId)
      .sort((a, b) => b.timestamp - a.timestamp)

    if (taskBackups.length === 0) {
      return null
    }

    const latestBackup = taskBackups[0]
    console.log(`[ProgressBackup] Récupération des données pour la tâche: ${taskId}`)
    return latestBackup.data
  }

  /**
   * Nettoyage des anciennes sauvegardes
   */
  cleanup(maxAge: number = 7 * 24 * 60 * 60 * 1000): void { // 7 jours par défaut
    const cutoffTime = Date.now() - maxAge
    let cleanedCount = 0

    for (const [id, backup] of this.backups) {
      if (backup.synced && backup.timestamp < cutoffTime) {
        this.backups.delete(id)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      this.saveToStorage()
      console.log(`[ProgressBackup] Nettoyage de ${cleanedCount} ancienne(s) sauvegarde(s)`)
    }
  }

  /**
   * Statistiques de sauvegarde
   */
  getStats(): {
    totalBackups: number
    unsyncedBackups: number
    queueSize: number
    oldestBackup: number | null
    syncSuccessRate: number
  } {
    const backupArray = Array.from(this.backups.values())
    const unsyncedBackups = backupArray.filter(b => !b.synced)
    const oldestBackup = backupArray.length > 0 
      ? Math.min(...backupArray.map(b => b.timestamp))
      : null

    // Calcul du taux de succès de synchronisation
    const totalAttempts = backupArray.reduce((sum, b) => sum + b.retryCount + 1, 0)
    const syncedCount = backupArray.filter(b => b.synced).length
    const syncSuccessRate = totalAttempts > 0 ? (syncedCount / totalAttempts) * 100 : 100

    return {
      totalBackups: backupArray.length,
      unsyncedBackups: unsyncedBackups.length,
      queueSize: this.syncQueue.length,
      oldestBackup,
      syncSuccessRate: Math.round(syncSuccessRate)
    }
  }

  private initializeEventListeners(): void {
    // Écouter les changements de connectivité
    window.addEventListener('online', () => {
      this.isOnline = true
      console.log('[ProgressBackup] Connexion rétablie, synchronisation...')
      this.syncWhenOnline()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('[ProgressBackup] Connexion perdue, mode sauvegarde locale')
    })

    // Sauvegarde avant fermeture de la page
    window.addEventListener('beforeunload', () => {
      this.saveToStorage()
    })

    // Synchronisation périodique
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.syncWhenOnline()
      }
    })
  }

  private startSyncInterval(): void {
    this.syncInterval = window.setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.syncWhenOnline()
      }
      this.cleanup() // Nettoyage périodique
    }, this.SYNC_INTERVAL)
  }

  private enqueueSync(operation: SyncOperation): void {
    // Éviter les doublons
    const existingIndex = this.syncQueue.findIndex(op => 
      op.taskId === operation.taskId && op.type === operation.type
    )

    if (existingIndex !== -1) {
      // Remplacer l'opération existante par la plus récente
      this.syncQueue[existingIndex] = operation
    } else {
      this.syncQueue.push(operation)
    }
  }

  private async syncOperation(operation: SyncOperation): Promise<void> {
    const { taskId, data, type } = operation

    try {
      let response: Response

      switch (type) {
        case 'update':
          response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          break

        case 'create':
          response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          break

        case 'delete':
          response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
          })
          break

        default:
          throw new Error(`Type d'opération non supporté: ${type}`)
      }

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      console.log(`[ProgressBackup] Synchronisation réussie: ${operation.id}`)

    } catch (error) {
      console.error(`[ProgressBackup] Erreur de synchronisation: ${operation.id}`, error)
      throw error
    }
  }

  private markAsSynced(operationId: string): void {
    const backup = this.backups.get(operationId)
    if (backup) {
      backup.synced = true
      backup.retryCount = 0
    }
  }

  private removeFromQueue(operationId: string): void {
    const index = this.syncQueue.findIndex(op => op.id === operationId)
    if (index !== -1) {
      this.syncQueue.splice(index, 1)
    }
  }

  private handleSyncError(operation: SyncOperation, error: any): void {
    const backup = this.backups.get(operation.id)
    if (backup) {
      backup.retryCount++
      
      // Limite de tentatives
      if (backup.retryCount >= 3) {
        console.error(`[ProgressBackup] Abandon après 3 tentatives: ${operation.id}`)
        this.removeFromQueue(operation.id)
      } else {
        console.warn(`[ProgressBackup] Tentative ${backup.retryCount}/3 échouée: ${operation.id}`)
      }
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        backups: Array.from(this.backups.entries()),
        syncQueue: this.syncQueue,
        timestamp: Date.now()
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('[ProgressBackup] Erreur de sauvegarde locale:', error)
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return

      const data = JSON.parse(stored)
      
      // Restaurer les sauvegardes
      this.backups = new Map(data.backups || [])
      
      // Restaurer la queue de synchronisation
      this.syncQueue = data.syncQueue || []
      
      console.log(`[ProgressBackup] Chargement de ${this.backups.size} sauvegarde(s) et ${this.syncQueue.length} opération(s) en attente`)
      
    } catch (error) {
      console.error('[ProgressBackup] Erreur de chargement depuis le stockage:', error)
    }
  }

  private sanitizeData(data: any): any {
    // Nettoyer les données pour éviter les références circulaires
    try {
      return JSON.parse(JSON.stringify(data))
    } catch {
      return { error: 'Données non sérialisables' }
    }
  }

  /**
   * Destruction propre du service
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
    
    this.saveToStorage()
    console.log('[ProgressBackup] Service arrêté proprement')
  }
}

/**
 * Hook Vue pour utiliser le service de sauvegarde
 */
export function useProgressBackup() {
  const backupService = ProgressBackupService.getInstance()

  const autoSave = (taskId: string, data: any, priority?: 'high' | 'medium' | 'low') => {
    backupService.autoSave(taskId, data, priority)
  }

  const recoverTask = (taskId: string) => {
    return backupService.recoverTaskData(taskId)
  }

  const getBackupStats = () => {
    return backupService.getStats()
  }

  const forceSync = async () => {
    await backupService.syncWhenOnline()
  }

  return {
    autoSave,
    recoverTask,
    getBackupStats,
    forceSync
  }
}

// Export du service singleton
export const progressBackup = ProgressBackupService.getInstance()