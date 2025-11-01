#!/usr/bin/env node

/**
 * Script d'analyse du système de réactivité et des listeners en temps réel
 * Examine les watchers Vue, les propriétés calculées et les événements
 */

const fs = require('fs').promises
const path = require('path')

class ReactivityAnalyzer {
  constructor() {
    this.results = {
      watchers: [],
      computedProperties: [],
      eventListeners: [],
      vueComponents: [],
      performanceIssues: [],
      recommendations: []
    }
    this.sourceDir = path.join(__dirname, 'src')
  }

  async analyze() {
    console.log('🔍 Analyse du système de réactivité en cours...\n')
    
    try {
      await this.scanVueComponents()
      await this.analyzeTaskProgressComponents()
      await this.checkPerformancePatterns()
      await this.generateReport()
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse:', error.message)
    }
  }

  async scanVueComponents() {
    console.log('📁 Scan des composants Vue...')
    
    const vueFiles = await this.findVueFiles(this.sourceDir)
    
    for (const filePath of vueFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8')
        const analysis = this.analyzeVueFile(filePath, content)
        
        if (analysis.hasProgressLogic) {
          this.results.vueComponents.push(analysis)
        }
      } catch (error) {
        console.warn(`⚠️  Impossible de lire ${filePath}: ${error.message}`)
      }
    }
    
    console.log(`✅ ${this.results.vueComponents.length} composants avec logique de progression trouvés`)
  }

  async findVueFiles(dir) {
    const files = []
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...await this.findVueFiles(fullPath))
        } else if (entry.isFile() && entry.name.endsWith('.vue')) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      // Ignorer les erreurs de lecture de dossier
    }
    
    return files
  }

  analyzeVueFile(filePath, content) {
    const relativePath = path.relative(this.sourceDir, filePath)
    const analysis = {
      file: relativePath,
      hasProgressLogic: false,
      watchers: [],
      computed: [],
      methods: [],
      events: [],
      performanceIssues: [],
      reactivityPatterns: []
    }

    // Recherche de logique de progression
    const progressKeywords = [
      'progress', 'estimatedHours', 'actualHours', 'progressPercentage',
      'updateTask', 'taskProgress', 'ProgressLogger'
    ]
    
    const hasProgressKeywords = progressKeywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    )
    
    if (!hasProgressKeywords) {
      return analysis
    }
    
    analysis.hasProgressLogic = true

    // Analyse des watchers
    this.analyzeWatchers(content, analysis)
    
    // Analyse des propriétés calculées
    this.analyzeComputedProperties(content, analysis)
    
    // Analyse des méthodes
    this.analyzeMethods(content, analysis)
    
    // Analyse des événements
    this.analyzeEvents(content, analysis)
    
    // Détection des problèmes de performance
    this.detectPerformanceIssues(content, analysis)

    return analysis
  }

  analyzeWatchers(content, analysis) {
    // Recherche des watchers Vue 3 (Composition API)
    const watcherPatterns = [
      /watch\s*\(\s*([^,]+),\s*([^)]+)\)/g,
      /watchEffect\s*\(\s*([^)]+)\)/g,
      /watch:\s*{([^}]+)}/gs
    ]

    watcherPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(content)) !== null) {
        const watcherInfo = {
          type: match[0].includes('watchEffect') ? 'watchEffect' : 'watch',
          target: match[1] ? match[1].trim() : 'unknown',
          callback: match[2] ? match[2].trim() : match[1] ? match[1].trim() : 'unknown',
          line: this.getLineNumber(content, match.index)
        }
        
        analysis.watchers.push(watcherInfo)
        
        // Vérifier si c'est lié à la progression
        if (this.isProgressRelated(match[0])) {
          analysis.reactivityPatterns.push({
            type: 'progress-watcher',
            description: `Watcher pour la progression: ${watcherInfo.target}`,
            line: watcherInfo.line
          })
        }
      }
    })

    // Recherche des watchers Options API
    const optionsWatchPattern = /watch:\s*{([^}]+)}/gs
    let match = optionsWatchPattern.exec(content)
    if (match) {
      const watchBlock = match[1]
      const individualWatchers = watchBlock.split(',')
      
      individualWatchers.forEach(watcher => {
        const watcherMatch = watcher.match(/(\w+):\s*{?([^}]+)}?/)
        if (watcherMatch) {
          analysis.watchers.push({
            type: 'options-watch',
            target: watcherMatch[1].trim(),
            callback: watcherMatch[2].trim(),
            line: this.getLineNumber(content, content.indexOf(watcher))
          })
        }
      })
    }
  }

  analyzeComputedProperties(content, analysis) {
    // Recherche des propriétés calculées
    const computedPatterns = [
      /computed\s*\(\s*\(\)\s*=>\s*([^)]+)\)/g,
      /const\s+(\w+)\s*=\s*computed\s*\(/g,
      /computed:\s*{([^}]+)}/gs
    ]

    computedPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(content)) !== null) {
        const computedInfo = {
          name: match[1] ? match[1].trim() : 'anonymous',
          line: this.getLineNumber(content, match.index),
          isProgressRelated: this.isProgressRelated(match[0])
        }
        
        analysis.computed.push(computedInfo)
        
        if (computedInfo.isProgressRelated) {
          analysis.reactivityPatterns.push({
            type: 'progress-computed',
            description: `Propriété calculée pour la progression: ${computedInfo.name}`,
            line: computedInfo.line
          })
        }
      }
    })
  }

  analyzeMethods(content, analysis) {
    // Recherche des méthodes liées à la progression
    const methodPatterns = [
      /(?:const\s+)?(\w*[Pp]rogress\w*)\s*[=:]\s*(?:async\s+)?(?:function\s*)?\(/g,
      /(?:const\s+)?(\w*[Uu]pdate\w*)\s*[=:]\s*(?:async\s+)?(?:function\s*)?\(/g,
      /(?:const\s+)?(\w*[Cc]alculate\w*)\s*[=:]\s*(?:async\s+)?(?:function\s*)?\(/g
    ]

    methodPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(content)) !== null) {
        const methodInfo = {
          name: match[1],
          line: this.getLineNumber(content, match.index),
          isAsync: match[0].includes('async')
        }
        
        analysis.methods.push(methodInfo)
      }
    })
  }

  analyzeEvents(content, analysis) {
    // Recherche des événements et émissions
    const eventPatterns = [
      /@(\w+)="([^"]+)"/g,
      /emit\s*\(\s*['"`]([^'"`]+)['"`]/g,
      /\$emit\s*\(\s*['"`]([^'"`]+)['"`]/g
    ]

    eventPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(content)) !== null) {
        const eventInfo = {
          type: match[0].includes('emit') ? 'emit' : 'listener',
          name: match[1],
          handler: match[2] || 'unknown',
          line: this.getLineNumber(content, match.index)
        }
        
        analysis.events.push(eventInfo)
      }
    })
  }

  detectPerformanceIssues(content, analysis) {
    const issues = []

    // Détection de watchers sans debounce
    analysis.watchers.forEach(watcher => {
      if (watcher.target.includes('Hours') && !watcher.callback.includes('debounce')) {
        issues.push({
          type: 'missing-debounce',
          description: `Watcher sur ${watcher.target} sans debounce`,
          line: watcher.line,
          severity: 'medium'
        })
      }
    })

    // Détection de calculs complexes dans computed
    const complexComputedPattern = /computed\s*\([^)]*\)\s*{[^}]{200,}/g
    let match
    while ((match = complexComputedPattern.exec(content)) !== null) {
      issues.push({
        type: 'complex-computed',
        description: 'Propriété calculée complexe détectée',
        line: this.getLineNumber(content, match.index),
        severity: 'low'
      })
    }

    // Détection de mutations directes dans les watchers
    analysis.watchers.forEach(watcher => {
      if (watcher.callback.includes('=') && !watcher.callback.includes('===')) {
        issues.push({
          type: 'direct-mutation',
          description: `Possible mutation directe dans watcher ${watcher.target}`,
          line: watcher.line,
          severity: 'high'
        })
      }
    })

    analysis.performanceIssues = issues
    this.results.performanceIssues.push(...issues.map(issue => ({
      ...issue,
      file: analysis.file
    })))
  }

  async analyzeTaskProgressComponents() {
    console.log('🎯 Analyse spécifique des composants de progression...')
    
    const progressComponents = this.results.vueComponents.filter(comp => 
      comp.file.includes('Task') || comp.file.includes('Progress')
    )

    for (const component of progressComponents) {
      await this.deepAnalyzeProgressComponent(component)
    }
  }

  async deepAnalyzeProgressComponent(component) {
    const filePath = path.join(this.sourceDir, component.file)
    
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      
      // Analyse de la logique de cache
      if (content.includes('cache') || content.includes('Cache')) {
        component.reactivityPatterns.push({
          type: 'caching',
          description: 'Système de cache détecté',
          line: this.getLineNumber(content, content.indexOf('cache'))
        })
      }

      // Analyse des optimisations de performance
      if (content.includes('debounce') || content.includes('throttle')) {
        component.reactivityPatterns.push({
          type: 'performance-optimization',
          description: 'Optimisation de performance (debounce/throttle) détectée',
          line: this.getLineNumber(content, content.search(/(debounce|throttle)/))
        })
      }

      // Analyse des mises à jour DOM
      if (content.includes('nextTick') || content.includes('$nextTick')) {
        component.reactivityPatterns.push({
          type: 'dom-update',
          description: 'Gestion explicite des mises à jour DOM',
          line: this.getLineNumber(content, content.search(/(nextTick|\$nextTick)/))
        })
      }

    } catch (error) {
      console.warn(`⚠️  Impossible d'analyser en profondeur ${component.file}`)
    }
  }

  checkPerformancePatterns() {
    console.log('⚡ Vérification des patterns de performance...')
    
    // Analyse globale des patterns
    const totalWatchers = this.results.vueComponents.reduce((sum, comp) => sum + comp.watchers.length, 0)
    const totalComputed = this.results.vueComponents.reduce((sum, comp) => sum + comp.computed.length, 0)
    
    if (totalWatchers > 20) {
      this.results.recommendations.push({
        type: 'performance',
        priority: 'medium',
        description: `Nombre élevé de watchers (${totalWatchers}). Considérez l'optimisation.`
      })
    }

    if (totalComputed > 15) {
      this.results.recommendations.push({
        type: 'performance',
        priority: 'low',
        description: `Nombre élevé de propriétés calculées (${totalComputed}). Vérifiez les dépendances.`
      })
    }

    // Vérification des composants sans optimisation
    const unoptimizedComponents = this.results.vueComponents.filter(comp => 
      comp.watchers.length > 0 && 
      !comp.reactivityPatterns.some(pattern => pattern.type === 'performance-optimization')
    )

    if (unoptimizedComponents.length > 0) {
      this.results.recommendations.push({
        type: 'optimization',
        priority: 'medium',
        description: `${unoptimizedComponents.length} composant(s) sans optimisation de performance détectée.`,
        components: unoptimizedComponents.map(comp => comp.file)
      })
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalComponents: this.results.vueComponents.length,
        totalWatchers: this.results.vueComponents.reduce((sum, comp) => sum + comp.watchers.length, 0),
        totalComputed: this.results.vueComponents.reduce((sum, comp) => sum + comp.computed.length, 0),
        totalEvents: this.results.vueComponents.reduce((sum, comp) => sum + comp.events.length, 0),
        performanceIssues: this.results.performanceIssues.length,
        recommendations: this.results.recommendations.length
      },
      components: this.results.vueComponents,
      performanceIssues: this.results.performanceIssues,
      recommendations: this.results.recommendations,
      analysis: {
        reactivityHealth: this.calculateReactivityHealth(),
        performanceScore: this.calculatePerformanceScore(),
        optimizationLevel: this.calculateOptimizationLevel()
      }
    }

    // Sauvegarde du rapport
    await fs.writeFile(
      path.join(__dirname, 'reactivity-analysis-report.json'),
      JSON.stringify(report, null, 2)
    )

    // Affichage du résumé
    this.displaySummary(report)
  }

  calculateReactivityHealth() {
    const totalComponents = this.results.vueComponents.length
    const componentsWithIssues = this.results.vueComponents.filter(comp => 
      comp.performanceIssues.length > 0
    ).length

    if (totalComponents === 0) return 100
    
    const healthPercentage = ((totalComponents - componentsWithIssues) / totalComponents) * 100
    return Math.round(healthPercentage)
  }

  calculatePerformanceScore() {
    const totalIssues = this.results.performanceIssues.length
    const highSeverityIssues = this.results.performanceIssues.filter(issue => 
      issue.severity === 'high'
    ).length

    let score = 100
    score -= highSeverityIssues * 20
    score -= (totalIssues - highSeverityIssues) * 5
    
    return Math.max(0, score)
  }

  calculateOptimizationLevel() {
    const totalComponents = this.results.vueComponents.length
    const optimizedComponents = this.results.vueComponents.filter(comp =>
      comp.reactivityPatterns.some(pattern => 
        pattern.type === 'performance-optimization' || pattern.type === 'caching'
      )
    ).length

    if (totalComponents === 0) return 0
    
    return Math.round((optimizedComponents / totalComponents) * 100)
  }

  displaySummary(report) {
    console.log('\n' + '='.repeat(60))
    console.log('📊 RAPPORT D\'ANALYSE DE RÉACTIVITÉ')
    console.log('='.repeat(60))
    
    console.log(`\n📈 RÉSUMÉ GÉNÉRAL:`)
    console.log(`   • Composants analysés: ${report.summary.totalComponents}`)
    console.log(`   • Watchers trouvés: ${report.summary.totalWatchers}`)
    console.log(`   • Propriétés calculées: ${report.summary.totalComputed}`)
    console.log(`   • Événements: ${report.summary.totalEvents}`)
    console.log(`   • Problèmes de performance: ${report.summary.performanceIssues}`)
    
    console.log(`\n🎯 SCORES:`)
    console.log(`   • Santé de la réactivité: ${report.analysis.reactivityHealth}%`)
    console.log(`   • Score de performance: ${report.analysis.performanceScore}%`)
    console.log(`   • Niveau d'optimisation: ${report.analysis.optimizationLevel}%`)

    if (report.performanceIssues.length > 0) {
      console.log(`\n⚠️  PROBLÈMES DÉTECTÉS:`)
      report.performanceIssues.slice(0, 5).forEach(issue => {
        const severity = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢'
        console.log(`   ${severity} ${issue.description} (${issue.file}:${issue.line})`)
      })
      
      if (report.performanceIssues.length > 5) {
        console.log(`   ... et ${report.performanceIssues.length - 5} autre(s) problème(s)`)
      }
    }

    if (report.recommendations.length > 0) {
      console.log(`\n💡 RECOMMANDATIONS:`)
      report.recommendations.slice(0, 3).forEach(rec => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'
        console.log(`   ${priority} ${rec.description}`)
      })
    }

    console.log(`\n📄 Rapport détaillé sauvegardé: reactivity-analysis-report.json`)
    console.log('='.repeat(60))
  }

  isProgressRelated(text) {
    const progressKeywords = [
      'progress', 'estimated', 'actual', 'hours', 'percentage',
      'calculate', 'update', 'task', 'completion'
    ]
    
    return progressKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length
  }
}

// Exécution du script
if (require.main === module) {
  const analyzer = new ReactivityAnalyzer()
  analyzer.analyze().catch(console.error)
}

module.exports = ReactivityAnalyzer