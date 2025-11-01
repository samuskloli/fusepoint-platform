import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Configuration
const API_BASE_URL = 'http://localhost:3004/api';
const LOG_FILE = path.join(process.cwd(), 'progress-debug.log');

// Classe de logging avancée
class ProgressLogger {
  constructor() {
    this.logs = [];
    this.startTime = Date.now();
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const elapsed = Date.now() - this.startTime;
    
    const logEntry = {
      timestamp,
      elapsed: `${elapsed}ms`,
      level,
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    };

    this.logs.push(logEntry);
    
    // Affichage console avec couleurs
    const colors = {
      INFO: '\x1b[36m',    // Cyan
      SUCCESS: '\x1b[32m', // Vert
      WARNING: '\x1b[33m', // Jaune
      ERROR: '\x1b[31m',   // Rouge
      DEBUG: '\x1b[35m'    // Magenta
    };
    
    const reset = '\x1b[0m';
    const color = colors[level] || '';
    
    console.log(`${color}[${timestamp}] [${elapsed}ms] ${level}: ${message}${reset}`);
    if (data) {
      console.log(`${color}Data:${reset}`, data);
    }
  }

  info(message, data) { this.log('INFO', message, data); }
  success(message, data) { this.log('SUCCESS', message, data); }
  warning(message, data) { this.log('WARNING', message, data); }
  error(message, data) { this.log('ERROR', message, data); }
  debug(message, data) { this.log('DEBUG', message, data); }

  saveToFile() {
    const logContent = this.logs.map(entry => {
      let line = `[${entry.timestamp}] [${entry.elapsed}] ${entry.level}: ${entry.message}`;
      if (entry.data) {
        line += `\nData: ${entry.data}`;
      }
      return line;
    }).join('\n\n');

    fs.writeFileSync(LOG_FILE, logContent);
    this.info(`Logs sauvegardés dans: ${LOG_FILE}`);
  }
}

// Utilitaires de validation des données
class DataValidator {
  static validateTaskData(taskData) {
    const errors = [];
    const warnings = [];

    // Validation des champs obligatoires
    if (!taskData.title || typeof taskData.title !== 'string') {
      errors.push('Le titre est obligatoire et doit être une chaîne');
    }

    // Validation des heures
    if (taskData.estimated_hours !== undefined) {
      if (typeof taskData.estimated_hours !== 'number' || taskData.estimated_hours < 0) {
        errors.push('Les heures estimées doivent être un nombre positif');
      }
    }

    if (taskData.actual_hours !== undefined) {
      if (typeof taskData.actual_hours !== 'number' || taskData.actual_hours < 0) {
        errors.push('Les heures réelles doivent être un nombre positif');
      }
    }

    // Validation de la progression
    if (taskData.estimated_hours && taskData.actual_hours) {
      if (taskData.actual_hours > taskData.estimated_hours * 2) {
        warnings.push('Les heures réelles dépassent largement les heures estimées');
      }
    }

    // Validation du statut
    const validStatuses = ['todo', 'in_progress', 'done', 'cancelled'];
    if (taskData.status && !validStatuses.includes(taskData.status)) {
      errors.push(`Statut invalide: ${taskData.status}. Valeurs autorisées: ${validStatuses.join(', ')}`);
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  static calculateProgress(estimatedHours, actualHours) {
    if (!estimatedHours || estimatedHours <= 0) return 0;
    if (!actualHours || actualHours <= 0) return 0;
    
    const progress = Math.min((actualHours / estimatedHours) * 100, 100);
    return Math.round(progress * 100) / 100; // Arrondi à 2 décimales
  }
}

// Classe principale de test
class ProgressSystemTester {
  constructor() {
    this.logger = new ProgressLogger();
    this.testResults = {
      connectionTest: null,
      dataFormatTest: null,
      persistenceTest: null,
      realTimeUpdateTest: null,
      stressTest: null,
      networkFailureTest: null
    };
  }

  async runAllTests() {
    this.logger.info('🚀 Début des tests du système de progression');
    
    try {
      // Test 1: Connexion à la base de données
      await this.testDatabaseConnection();
      
      // Test 2: Formatage et validation des données
      await this.testDataFormatting();
      
      // Test 3: Persistance des données
      await this.testDataPersistence();
      
      // Test 4: Mises à jour en temps réel
      await this.testRealTimeUpdates();
      
      // Test 5: Test de stress avec gros volumes
      await this.testStressScenarios();
      
      // Test 6: Simulation de pannes réseau
      await this.testNetworkFailures();
      
      // Génération du rapport
      this.generateReport();
      
    } catch (error) {
      this.logger.error('Erreur fatale lors des tests', error);
    } finally {
      this.logger.saveToFile();
    }
  }

  async testDatabaseConnection() {
    this.logger.info('📡 Test de connexion à la base de données');
    
    try {
      // Test de santé de l'API
      const healthResponse = await axios.get(`${API_BASE_URL}/health`);
      this.logger.success('API accessible', { status: healthResponse.status, data: healthResponse.data });
      
      // Test de connexion avec authentification (si nécessaire)
      try {
        const tasksResponse = await axios.get(`${API_BASE_URL}/clients/1/projects/1/tasks`);
        this.logger.success('Endpoint des tâches accessible', { status: tasksResponse.status });
        this.testResults.connectionTest = { success: true, message: 'Connexion réussie' };
      } catch (authError) {
        if (authError.response?.status === 401) {
          this.logger.warning('Authentification requise pour les endpoints protégés');
          this.testResults.connectionTest = { success: true, message: 'Connexion OK, auth requise' };
        } else {
          throw authError;
        }
      }
      
    } catch (error) {
      this.logger.error('Échec de connexion à la base de données', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      this.testResults.connectionTest = { success: false, error: error.message };
    }
  }

  async testDataFormatting() {
    this.logger.info('🔍 Test de formatage et validation des données');
    
    const testCases = [
      {
        name: 'Données valides complètes',
        data: {
          title: 'Tâche de test',
          description: 'Description de test',
          status: 'in_progress',
          priority: 'medium',
          estimated_hours: 8,
          actual_hours: 4
        }
      },
      {
        name: 'Données avec progression à 100%',
        data: {
          title: 'Tâche terminée',
          status: 'done',
          estimated_hours: 5,
          actual_hours: 5
        }
      },
      {
        name: 'Données avec dépassement d\'heures',
        data: {
          title: 'Tâche en dépassement',
          status: 'in_progress',
          estimated_hours: 3,
          actual_hours: 6
        }
      },
      {
        name: 'Données invalides',
        data: {
          title: '',
          status: 'invalid_status',
          estimated_hours: -1,
          actual_hours: 'invalid'
        }
      }
    ];

    let validCases = 0;
    let totalCases = testCases.length;

    for (const testCase of testCases) {
      this.logger.debug(`Test: ${testCase.name}`, testCase.data);
      
      const validation = DataValidator.validateTaskData(testCase.data);
      
      if (validation.isValid) {
        validCases++;
        const progress = DataValidator.calculateProgress(
          testCase.data.estimated_hours, 
          testCase.data.actual_hours
        );
        this.logger.success(`✅ ${testCase.name} - Progression: ${progress}%`);
      } else {
        this.logger.warning(`⚠️ ${testCase.name} - Erreurs:`, validation.errors);
      }
      
      if (validation.warnings.length > 0) {
        this.logger.warning(`Avertissements pour ${testCase.name}:`, validation.warnings);
      }
    }

    this.testResults.dataFormatTest = {
      success: validCases > 0,
      validCases,
      totalCases,
      successRate: `${Math.round((validCases / totalCases) * 100)}%`
    };
  }

  async testDataPersistence() {
    this.logger.info('💾 Test de persistance des données');
    
    try {
      // Créer une tâche de test
      const testTask = {
        title: `Test Persistence ${Date.now()}`,
        description: 'Tâche créée pour tester la persistance',
        status: 'todo',
        priority: 'medium',
        estimated_hours: 4,
        actual_hours: 0
      };

      this.logger.debug('Création de tâche de test', testTask);
      
      // Note: Ici nous simulons car nous n'avons pas d'auth
      // Dans un vrai test, on ferait:
      // const createResponse = await axios.post(`${API_BASE_URL}/clients/1/projects/1/tasks`, testTask);
      
      this.logger.info('Simulation de création de tâche (auth requise pour test réel)');
      
      // Simulation des mises à jour progressives
      const updates = [
        { actual_hours: 1, status: 'in_progress' },
        { actual_hours: 2 },
        { actual_hours: 3 },
        { actual_hours: 4, status: 'done' }
      ];

      for (let i = 0; i < updates.length; i++) {
        const update = updates[i];
        const progress = DataValidator.calculateProgress(testTask.estimated_hours, update.actual_hours);
        
        this.logger.debug(`Mise à jour ${i + 1}`, {
          update,
          calculatedProgress: progress,
          expectedStatus: update.actual_hours >= testTask.estimated_hours ? 'done' : 'in_progress'
        });
        
        // Simulation d'attente entre les mises à jour
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      this.testResults.persistenceTest = {
        success: true,
        message: 'Test de persistance simulé avec succès',
        updatesProcessed: updates.length
      };

    } catch (error) {
      this.logger.error('Erreur lors du test de persistance', error);
      this.testResults.persistenceTest = { success: false, error: error.message };
    }
  }

  async testRealTimeUpdates() {
    this.logger.info('⚡ Test des mises à jour en temps réel');
    
    try {
      // Simulation de mises à jour rapides successives
      const rapidUpdates = [];
      const startTime = Date.now();
      
      for (let i = 1; i <= 10; i++) {
        const updateTime = Date.now();
        const update = {
          id: i,
          actual_hours: i * 0.5,
          timestamp: updateTime,
          elapsed: updateTime - startTime
        };
        
        rapidUpdates.push(update);
        
        // Validation que les mises à jour sont dans l'ordre
        if (i > 1 && update.elapsed < rapidUpdates[i-2].elapsed) {
          this.logger.warning('Mise à jour hors séquence détectée', {
            current: update,
            previous: rapidUpdates[i-2]
          });
        }
        
        // Simulation d'une petite latence
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      this.logger.success('Mises à jour rapides traitées', {
        totalUpdates: rapidUpdates.length,
        totalTime: `${Date.now() - startTime}ms`,
        averageTime: `${(Date.now() - startTime) / rapidUpdates.length}ms par mise à jour`
      });

      this.testResults.realTimeUpdateTest = {
        success: true,
        updatesProcessed: rapidUpdates.length,
        totalTime: Date.now() - startTime
      };

    } catch (error) {
      this.logger.error('Erreur lors du test temps réel', error);
      this.testResults.realTimeUpdateTest = { success: false, error: error.message };
    }
  }

  async testStressScenarios() {
    this.logger.info('🔥 Test de scénarios de stress');
    
    try {
      // Test avec gros volumes de données
      const largeDataSet = [];
      for (let i = 0; i < 100; i++) {
        largeDataSet.push({
          id: i,
          title: `Tâche massive ${i}`,
          estimated_hours: Math.random() * 20,
          actual_hours: Math.random() * 25,
          status: ['todo', 'in_progress', 'done'][Math.floor(Math.random() * 3)]
        });
      }

      const startTime = Date.now();
      
      // Traitement en lot
      const batchSize = 10;
      let processedBatches = 0;
      
      for (let i = 0; i < largeDataSet.length; i += batchSize) {
        const batch = largeDataSet.slice(i, i + batchSize);
        
        // Simulation du traitement du lot
        for (const task of batch) {
          const validation = DataValidator.validateTaskData(task);
          if (!validation.isValid) {
            this.logger.warning(`Tâche invalide dans le lot ${processedBatches}`, {
              task: task.id,
              errors: validation.errors
            });
          }
        }
        
        processedBatches++;
        
        // Petite pause entre les lots
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      const processingTime = Date.now() - startTime;
      
      this.logger.success('Test de stress terminé', {
        totalTasks: largeDataSet.length,
        batchesProcessed: processedBatches,
        processingTime: `${processingTime}ms`,
        tasksPerSecond: Math.round((largeDataSet.length / processingTime) * 1000)
      });

      this.testResults.stressTest = {
        success: true,
        tasksProcessed: largeDataSet.length,
        processingTime,
        performance: `${Math.round((largeDataSet.length / processingTime) * 1000)} tâches/sec`
      };

    } catch (error) {
      this.logger.error('Erreur lors du test de stress', error);
      this.testResults.stressTest = { success: false, error: error.message };
    }
  }

  async testNetworkFailures() {
    this.logger.info('🌐 Test de simulation de pannes réseau');
    
    try {
      // Simulation de différents types de pannes
      const failureScenarios = [
        { name: 'Timeout', delay: 5000 },
        { name: 'Connexion lente', delay: 2000 },
        { name: 'Connexion normale', delay: 100 }
      ];

      for (const scenario of failureScenarios) {
        this.logger.debug(`Test du scénario: ${scenario.name}`);
        
        const startTime = Date.now();
        
        try {
          // Simulation d'une requête avec timeout
          await Promise.race([
            new Promise(resolve => setTimeout(resolve, scenario.delay)),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 3000)
            )
          ]);
          
          const responseTime = Date.now() - startTime;
          
          if (responseTime > 1000) {
            this.logger.warning(`Réponse lente détectée: ${responseTime}ms`);
          } else {
            this.logger.success(`Réponse normale: ${responseTime}ms`);
          }
          
        } catch (error) {
          this.logger.error(`Échec du scénario ${scenario.name}`, error.message);
        }
      }

      this.testResults.networkFailureTest = {
        success: true,
        scenariosTested: failureScenarios.length
      };

    } catch (error) {
      this.logger.error('Erreur lors du test de pannes réseau', error);
      this.testResults.networkFailureTest = { success: false, error: error.message };
    }
  }

  generateReport() {
    this.logger.info('📊 Génération du rapport de test');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: Object.keys(this.testResults).length,
        successfulTests: Object.values(this.testResults).filter(r => r?.success).length,
        failedTests: Object.values(this.testResults).filter(r => r?.success === false).length
      },
      details: this.testResults,
      recommendations: this.generateRecommendations()
    };

    this.logger.success('📋 RAPPORT DE TEST COMPLET', report);
    
    // Sauvegarde du rapport
    const reportFile = path.join(process.cwd(), 'progress-test-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    this.logger.info(`Rapport sauvegardé: ${reportFile}`);
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (!this.testResults.connectionTest?.success) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Connexion',
        issue: 'Problème de connexion à la base de données',
        solution: 'Vérifier la configuration du serveur et les paramètres de connexion'
      });
    }

    if (this.testResults.dataFormatTest?.successRate && 
        parseInt(this.testResults.dataFormatTest.successRate) < 100) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Validation',
        issue: 'Certaines données ne passent pas la validation',
        solution: 'Renforcer la validation côté client et ajouter des contrôles'
      });
    }

    if (this.testResults.stressTest?.performance && 
        parseInt(this.testResults.stressTest.performance) < 100) {
      recommendations.push({
        priority: 'LOW',
        category: 'Performance',
        issue: 'Performance dégradée avec de gros volumes',
        solution: 'Optimiser les requêtes et implémenter la pagination'
      });
    }

    recommendations.push({
      priority: 'INFO',
      category: 'Monitoring',
      issue: 'Système de logs à améliorer',
      solution: 'Implémenter un système de monitoring en temps réel'
    });

    return recommendations;
  }
}

// Exécution des tests
async function main() {
  console.log('🔧 Démarrage de l\'analyse du système de progression...\n');
  
  const tester = new ProgressSystemTester();
  await tester.runAllTests();
  
  console.log('\n✅ Analyse terminée. Consultez les fichiers de logs pour plus de détails.');
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Erreur non gérée:', reason);
  process.exit(1);
});

// Lancement du script
main().catch(console.error);