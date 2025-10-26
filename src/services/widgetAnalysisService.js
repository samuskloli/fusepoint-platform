import api from './api'
import { ref } from 'vue'
import { componentNameToType } from '@/utils/widgetsMap.js'

class WidgetAnalysisService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutes
  }

  /**
   * Analyse un widget Vue pour déterminer son niveau de développement
   */
  analyzeVueWidget(widgetPath) {
    try {
      const fs = require('fs')
      const path = require('path')
      
      if (!fs.existsSync(widgetPath)) {
        return {
          score: 0,
          status: 'not_found',
          details: {
            hasTemplate: false,
            hasScript: false,
            hasStyle: false,
            hasTypeScript: false,
            hasCompositionAPI: false,
            hasExport: false,
            hasManifest: false
          },
          alerts: ['Fichier non trouvé']
        }
      }

      const content = fs.readFileSync(widgetPath, 'utf8')
      const details = {
        hasTemplate: /<template[^>]*>/.test(content),
        hasScript: /<script[^>]*>/.test(content),
        hasStyle: /<style[^>]*>/.test(content),
        hasTypeScript: /lang=["']ts["']/.test(content) || /<script[^>]*setup[^>]*lang=["']ts["']/.test(content),
        hasCompositionAPI: false,
        hasExport: false,
        hasManifest: false
      }

      // Vérifier la Composition API
      const compositionAPIPatterns = [
        /\bref\s*\(/,
        /\breactive\s*\(/,
        /\bcomputed\s*\(/,
        /\bonMounted\s*\(/,
        /\bwatch\s*\(/,
        /\bdefineProps\s*\(/,
        /\bdefineEmits\s*\(/
      ]
      details.hasCompositionAPI = compositionAPIPatterns.some(pattern => pattern.test(content))

      // Vérifier l'export (ancien style ou script setup)
      const isScriptSetup = /<script[^>]*setup/.test(content)
      const hasExportDefault = /export\s+default/.test(content)
      details.hasExport = isScriptSetup || hasExportDefault

      // Calculer le score
      let score = 0
      if (details.hasTemplate) score += 20
      if (details.hasScript) score += 30
      if (details.hasStyle) score += 10
      if (details.hasTypeScript) score += 15
      if (details.hasCompositionAPI) score += 15
      if (details.hasExport) score += 10

      // Vérifier le manifeste
      const widgetName = path.basename(widgetPath, '.vue')
      const manifestPath = path.join(path.dirname(widgetPath), '../../registry/manifests', `${widgetName}.json`)
      details.hasManifest = fs.existsSync(manifestPath)

      // Déterminer le statut
      let status = 'not_developed'
      const alerts = []

      if (score >= 90) {
        status = 'fully_developed'
      } else if (score >= 60) {
        status = 'partially_developed'
      } else if (score >= 30) {
        status = 'basic_structure'
      }

      if (!details.hasManifest) {
        alerts.push('Pas de manifeste')
      }

      return {
        score,
        status,
        details,
        alerts
      }
    } catch (error) {
      return {
        score: 0,
        status: 'error',
        details: {},
        alerts: [`Erreur d'analyse: ${error.message}`]
      }
    }
  }

  /**
   * Récupère tous les widgets depuis la base de données
   */
  async getDatabaseWidgets() {
    try {
      const response = await api.get('/api/widgets')
      return response.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des widgets DB:', error)
      return []
    }
  }

  /**
   * Récupère la liste des widgets développés dans le système de fichiers
   */
  async getFileSystemWidgets() {
    try {
      // Liste des widgets développés (basée sur les composants existants)
      const developedWidgets = [
        { name: 'TaskListWidget', componentName: 'TaskListWidget', path: '/src/components/widgets/TaskListWidget.vue', category: 'project-management' },
        { name: 'StatsWidget', componentName: 'StatsWidget', path: '/src/components/widgets/StatsWidget.vue', category: 'analytics' },
        { name: 'CalendarWidget', componentName: 'CalendarWidget', path: '/src/components/widgets/CalendarWidget.vue', category: 'planning' },
        { name: 'CommentsWidget', componentName: 'CommentsWidget', path: '/src/components/widgets/CommentsWidget.vue', category: 'communication' },
        { name: 'GoalsWidget', componentName: 'GoalsWidget', path: '/src/components/widgets/GoalsWidget.vue', category: 'project-management' },
        { name: 'AIWidget', componentName: 'AIWidget', path: '/src/components/widgets/AIWidget.vue', category: 'ai' },
        { name: 'FilesWidget', componentName: 'FilesWidget', path: '/src/components/widgets/FilesWidget.vue', category: 'files' },
        { name: 'HistoryWidget', componentName: 'HistoryWidget', path: '/src/components/widgets/HistoryWidget.vue', category: 'analytics' },
        { name: 'ChecklistWidget', componentName: 'ChecklistWidget', path: '/src/components/widgets/ChecklistWidget.vue', category: 'project-management' },
        { name: 'TeamWidget', componentName: 'TeamWidget', path: '/src/components/widgets/TeamWidget.vue', category: 'team' },
        { name: 'DeliverablesWidget', componentName: 'DeliverablesWidget', path: '/src/components/widgets/DeliverablesWidget.vue', category: 'project-management' },
        { name: 'FeatureTrackingWidget', componentName: 'FeatureTrackingWidget', path: '/src/components/widgets/FeatureTrackingWidget.vue', category: 'development' },
        { name: 'FeedbackWidget', componentName: 'FeedbackWidget', path: '/src/components/widgets/FeedbackWidget.vue', category: 'analytics' },
        { name: 'VersioningWidget', componentName: 'VersioningWidget', path: '/src/components/widgets/VersioningWidget.vue', category: 'development' }
      ]

      return developedWidgets.map(widget => ({
        ...widget,
        status: 'developed',
        inDatabase: false, // Sera mis à jour lors de la comparaison
        category: this.getWidgetCategory(widget.componentName)
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération des widgets développés:', error)
      return []
    }
  }

  /**
   * Détermine la catégorie d'un widget
   */
  getWidgetCategory(widgetName) {
    const categories = {
      'StatsWidget': 'analytics',
      'TaskListWidget': 'project-management',
      'TeamWidget': 'team-management',
      'CalendarWidget': 'project-management',
      'ChecklistWidget': 'project-management',
      'CommentsWidget': 'communication',
      'FeatureTrackingWidget': 'project-management',
      'VersioningWidget': 'development',
      'NotesWidget': 'productivity',
      'FilesWidget': 'file-management',
      'TimeTrackingWidget': 'time-management',
      'BudgetWidget': 'finance',
      'ReportsWidget': 'analytics',
      'IntegrationsWidget': 'integrations',
      'NotificationsWidget': 'communication',
      'BackupWidget': 'system',
      'SecurityWidget': 'security',
      'PerformanceWidget': 'analytics'
    }
    return categories[widgetName] || 'other'
  }

  /**
   * Analyse complète de tous les widgets
   */
  async getCompleteAnalysis() {
    const cacheKey = 'complete_analysis'
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const [dbWidgets, fsWidgets] = await Promise.all([
        this.getDatabaseWidgets(),
        this.getFileSystemWidgets()
      ])

      // S'assurer que les résultats sont des tableaux
      const safeDbWidgets = Array.isArray(dbWidgets) ? dbWidgets : []
      const safeFsWidgets = Array.isArray(fsWidgets) ? fsWidgets : []

      // Widgets présents en DB mais pas développés (en tenant compte des équivalences)
      const missingInCode = safeDbWidgets.filter(dbWidget => 
        !safeFsWidgets.some(fsWidget => this.isEquivalent(dbWidget.component_name, fsWidget.componentName))
      ).map(widget => ({
        ...widget,
        status: 'missing_in_code',
        equivalent: null
      }))

      // Widgets développés mais pas en DB (en tenant compte des équivalences)
      const missingInDatabase = safeFsWidgets.filter(fsWidget => 
        !safeDbWidgets.some(dbWidget => this.isEquivalent(dbWidget.component_name, fsWidget.componentName))
      ).map(widget => ({
        ...widget,
        status: 'missing_in_database'
      }))

      // Widgets synchronisés (présents partout, y compris équivalences)
      const synchronized = safeDbWidgets.filter(dbWidget => 
        safeFsWidgets.some(fsWidget => this.isEquivalent(dbWidget.component_name, fsWidget.componentName))
      ).map(dbWidget => {
        const fsWidget = safeFsWidgets.find(fsWidget => 
          this.isEquivalent(dbWidget.component_name, fsWidget.componentName)
        )
        return {
          ...dbWidget,
          status: 'synchronized',
          developedAs: fsWidget ? fsWidget.componentName : dbWidget.component_name,
          path: fsWidget ? fsWidget.path : null
        }
      })

      const analysis = {
        database: {
          total: safeDbWidgets.length,
          widgets: safeDbWidgets.map(widget => ({
            ...widget,
            isDeveloped: safeFsWidgets.some(fsWidget => 
              this.isEquivalent(widget.component_name, fsWidget.componentName)
            ),
            developedAs: safeFsWidgets.find(fsWidget => 
              this.isEquivalent(widget.component_name, fsWidget.componentName)
            )?.componentName || null
          }))
        },
        filesystem: {
          total: safeFsWidgets.length,
          widgets: safeFsWidgets.map(widget => ({
            ...widget,
            inDatabase: safeDbWidgets.some(dbWidget => 
              this.isEquivalent(dbWidget.component_name, widget.componentName)
            ),
            dbEquivalent: safeDbWidgets.find(dbWidget => 
              this.isEquivalent(dbWidget.component_name, widget.componentName)
            )?.component_name || null
          }))
        },
        comparison: {
          missingInCode: missingInCode.length,
          missingInDatabase: missingInDatabase.length,
          synchronized: synchronized.length,
          widgets: {
            missingInCode,
            missingInDatabase,
            synchronized
          }
        },
        stats: {
          total: safeDbWidgets.length + missingInDatabase.length,
          developed: safeFsWidgets.length,
          inDatabase: safeDbWidgets.length,
          synchronized: synchronized.length,
          byCategory: this.getStatsByCategory(safeDbWidgets, safeFsWidgets)
        }
      }

      // Mettre en cache
      this.cache.set(cacheKey, {
        data: analysis,
        timestamp: Date.now()
      })
      
      return analysis
    } catch (error) {
      console.error('Erreur lors de l\'analyse complète:', error)
      throw error
    }
  }

  /**
   * Calcule les statistiques par catégorie
   */
  getStatsByCategory(dbWidgets, fsWidgets) {
    const categories = {}
    
    // Traiter les widgets de la base de données
    dbWidgets.forEach(widget => {
      const category = widget.category || 'other'
      if (!categories[category]) {
        categories[category] = {
          total: 0,
          inDatabase: 0,
          developed: 0,
          synchronized: 0
        }
      }
      categories[category].total++
      categories[category].inDatabase++
      
      // Vérifier si développé
      const isDeveloped = fsWidgets.some(fsWidget => 
        this.isEquivalent(widget.component_name, fsWidget.componentName)
      )
      if (isDeveloped) {
        categories[category].developed++
        categories[category].synchronized++
      }
    })
    
    // Traiter les widgets développés non en DB
    fsWidgets.forEach(widget => {
      const category = widget.category || 'other'
      const inDatabase = dbWidgets.some(dbWidget => 
        this.isEquivalent(dbWidget.component_name, widget.componentName)
      )
      
      if (!inDatabase) {
        if (!categories[category]) {
          categories[category] = {
            total: 0,
            inDatabase: 0,
            developed: 0,
            synchronized: 0
          }
        }
        categories[category].total++
        categories[category].developed++
      }
    })
    
    return categories
  }

  /**
   * Vérifie l'équivalence entre deux noms de composants
   */
  isEquivalent(dbComponentName, fsComponentName) {
    const equivalenceMap = {
      'TasksWidget': 'TaskListWidget',
      'NotesWidget': 'CommentsWidget'
    }

    const a = dbComponentName || ''
    const b = fsComponentName || ''

    if (a === b) return true

    // Si les deux noms se résolvent au même type centralisé, considérer équivalents
    const typeA = componentNameToType(a)
    const typeB = componentNameToType(b)
    if (typeA && typeB && typeA === typeB) return true

    // Équivalences explicites conservées pour les cas historiques
    return equivalenceMap[a] === b || equivalenceMap[b] === a
  }

  /**
   * Invalide le cache
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * Ajoute un widget à la base de données
   */
  async addWidgetToDatabase(widget) {
    try {
      const response = await api.post('/api/widgets', {
        name: widget.name,
        component_name: widget.component_name || widget.name,
        category: widget.category,
        description: widget.description || `Widget ${widget.name}`,
        is_enabled: true,
        config: widget.config || {}
      })
      
      this.clearCache() // Invalider le cache
      return response.data
    } catch (error) {
      console.error('Erreur lors de l\'ajout du widget:', error)
      throw error
    }
  }

  /**
   * Met à jour un widget dans la base de données
   */
  async updateWidget(widgetId, updates) {
    try {
      const response = await api.put(`/api/widgets/${widgetId}`, updates)
      this.clearCache() // Invalider le cache
      return response.data
    } catch (error) {
      console.error('Erreur lors de la mise à jour du widget:', error)
      throw error
    }
  }

  /**
   * Supprime un widget de la base de données
   */
  async deleteWidget(widgetId) {
    try {
      const response = await api.delete(`/api/widgets/${widgetId}`)
      this.clearCache() // Invalider le cache
      return response.data
    } catch (error) {
      console.error('Erreur lors de la suppression du widget:', error)
      throw error
    }
  }
}

export default new WidgetAnalysisService()