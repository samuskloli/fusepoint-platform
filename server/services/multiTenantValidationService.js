/**
 * Service de validation multi-tenant
 * Vérifie l'intégrité et la sécurité du scoping multi-tenant
 */

const db = require('../config/database');
const logger = require('../utils/logger');

class MultiTenantValidationService {
  /**
   * Valide que toutes les données respectent le scoping multi-tenant
   */
  async validateDataIntegrity() {
    const results = {
      timestamp: new Date().toISOString(),
      checks: [],
      errors: [],
      warnings: [],
      summary: {
        total_checks: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };

    try {
      // Vérification 1: Données sans client_id ou project_id
      await this._checkMissingScope(results);
      
      // Vérification 2: Cohérence des clés étrangères
      await this._checkForeignKeyConsistency(results);
      
      // Vérification 3: Unicité des instances de widgets
      await this._checkWidgetInstanceUniqueness(results);
      
      // Vérification 4: Isolation des données entre clients
      await this._checkDataIsolation(results);
      
      // Vérification 5: Permissions d'accès
      await this._checkAccessPermissions(results);
      
      // Vérification 6: Index de performance
      await this._checkPerformanceIndexes(results);
      
      // Vérification 7: Audit trail
      await this._checkAuditTrail(results);

      // Calculer le résumé
      results.summary.total_checks = results.checks.length;
      results.summary.passed = results.checks.filter(c => c.status === 'PASS').length;
      results.summary.failed = results.checks.filter(c => c.status === 'FAIL').length;
      results.summary.warnings = results.warnings.length;

      return results;
    } catch (error) {
      logger.error('Erreur lors de la validation multi-tenant:', error);
      results.errors.push({
        type: 'SYSTEM_ERROR',
        message: error.message,
        timestamp: new Date().toISOString()
      });
      return results;
    }
  }

  /**
   * Vérifie les données sans scope approprié
   */
  async _checkMissingScope(results) {
    const tables = ['files', 'tasks', 'notes', 'events', 'metrics', 'task_assignees'];
    
    for (const table of tables) {
      try {
        const [rows] = await db.execute(`
          SELECT COUNT(*) as count 
          FROM ${table} 
          WHERE client_id IS NULL OR project_id IS NULL
        `);
        
        const count = rows[0].count;
        const check = {
          name: `Missing scope in ${table}`,
          table: table,
          type: 'DATA_INTEGRITY',
          status: count === 0 ? 'PASS' : 'FAIL',
          details: {
            missing_scope_count: count,
            message: count === 0 ? 'Toutes les données ont un scope approprié' : `${count} enregistrements sans scope`
          },
          timestamp: new Date().toISOString()
        };
        
        results.checks.push(check);
        
        if (count > 0) {
          results.errors.push({
            type: 'MISSING_SCOPE',
            table: table,
            count: count,
            message: `${count} enregistrements dans ${table} n'ont pas de scope client_id/project_id`
          });
        }
      } catch (error) {
        results.errors.push({
          type: 'CHECK_ERROR',
          table: table,
          message: `Erreur lors de la vérification de ${table}: ${error.message}`
        });
      }
    }
  }

  /**
   * Vérifie la cohérence des clés étrangères
   */
  async _checkForeignKeyConsistency(results) {
    const checks = [
      {
        name: 'Projects belong to valid clients',
        query: `
          SELECT COUNT(*) as count 
          FROM projects p 
          LEFT JOIN clients c ON p.client_id = c.id 
          WHERE c.id IS NULL
        `
      },
      {
        name: 'Files belong to valid projects',
        query: `
          SELECT COUNT(*) as count 
          FROM files f 
          LEFT JOIN projects p ON f.project_id = p.id AND f.client_id = p.client_id 
          WHERE p.id IS NULL
        `
      },
      {
        name: 'Tasks belong to valid projects',
        query: `
          SELECT COUNT(*) as count 
          FROM tasks t 
          LEFT JOIN projects p ON t.project_id = p.id AND t.client_id = p.client_id 
          WHERE p.id IS NULL
        `
      },
      {
        name: 'Widget instances belong to valid projects',
        query: `
          SELECT COUNT(*) as count 
          FROM widget_instances wi 
          LEFT JOIN projects p ON wi.project_id = p.id AND wi.client_id = p.client_id 
          WHERE p.id IS NULL
        `
      }
    ];

    for (const check of checks) {
      try {
        const [rows] = await db.execute(check.query);
        const count = rows[0].count;
        
        results.checks.push({
          name: check.name,
          type: 'FOREIGN_KEY_CONSISTENCY',
          status: count === 0 ? 'PASS' : 'FAIL',
          details: {
            invalid_references: count,
            message: count === 0 ? 'Toutes les références sont valides' : `${count} références invalides`
          },
          timestamp: new Date().toISOString()
        });
        
        if (count > 0) {
          results.errors.push({
            type: 'INVALID_FOREIGN_KEY',
            check: check.name,
            count: count,
            message: `${count} références de clés étrangères invalides`
          });
        }
      } catch (error) {
        results.errors.push({
          type: 'CHECK_ERROR',
          check: check.name,
          message: `Erreur lors de la vérification: ${error.message}`
        });
      }
    }
  }

  /**
   * Vérifie l'unicité des instances de widgets
   */
  async _checkWidgetInstanceUniqueness(results) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          client_id, 
          project_id, 
          widget_key, 
          COUNT(*) as count
        FROM widget_instances 
        WHERE is_active = TRUE
        GROUP BY client_id, project_id, widget_key 
        HAVING COUNT(*) > 1
      `);
      
      const duplicates = rows.length;
      
      results.checks.push({
        name: 'Widget instance uniqueness',
        type: 'UNIQUENESS_CONSTRAINT',
        status: duplicates === 0 ? 'PASS' : 'FAIL',
        details: {
          duplicate_instances: duplicates,
          message: duplicates === 0 ? 'Toutes les instances de widgets sont uniques' : `${duplicates} doublons détectés`,
          duplicates: rows
        },
        timestamp: new Date().toISOString()
      });
      
      if (duplicates > 0) {
        results.errors.push({
          type: 'DUPLICATE_WIDGET_INSTANCES',
          count: duplicates,
          details: rows,
          message: `${duplicates} instances de widgets dupliquées détectées`
        });
      }
    } catch (error) {
      results.errors.push({
        type: 'CHECK_ERROR',
        check: 'Widget instance uniqueness',
        message: `Erreur lors de la vérification: ${error.message}`
      });
    }
  }

  /**
   * Vérifie l'isolation des données entre clients
   */
  async _checkDataIsolation(results) {
    try {
      // Vérifier qu'aucune donnée n'est partagée entre clients différents
      const [crossClientData] = await db.execute(`
        SELECT 
          'files' as table_name,
          f1.client_id as client1,
          f2.client_id as client2,
          COUNT(*) as shared_count
        FROM files f1
        JOIN files f2 ON f1.id = f2.id AND f1.client_id != f2.client_id
        GROUP BY f1.client_id, f2.client_id
        
        UNION ALL
        
        SELECT 
          'tasks' as table_name,
          t1.client_id as client1,
          t2.client_id as client2,
          COUNT(*) as shared_count
        FROM tasks t1
        JOIN tasks t2 ON t1.id = t2.id AND t1.client_id != t2.client_id
        GROUP BY t1.client_id, t2.client_id
      `);
      
      const isolationViolations = crossClientData.length;
      
      results.checks.push({
        name: 'Data isolation between clients',
        type: 'DATA_ISOLATION',
        status: isolationViolations === 0 ? 'PASS' : 'FAIL',
        details: {
          isolation_violations: isolationViolations,
          message: isolationViolations === 0 ? 'Isolation parfaite entre clients' : `${isolationViolations} violations d'isolation`,
          violations: crossClientData
        },
        timestamp: new Date().toISOString()
      });
      
      if (isolationViolations > 0) {
        results.errors.push({
          type: 'DATA_ISOLATION_VIOLATION',
          count: isolationViolations,
          details: crossClientData,
          message: `${isolationViolations} violations d'isolation entre clients détectées`
        });
      }
    } catch (error) {
      results.errors.push({
        type: 'CHECK_ERROR',
        check: 'Data isolation',
        message: `Erreur lors de la vérification: ${error.message}`
      });
    }
  }

  /**
   * Vérifie les permissions d'accès
   */
  async _checkAccessPermissions(results) {
    try {
      // Vérifier que tous les utilisateurs ont des permissions appropriées
      const [usersWithoutPermissions] = await db.execute(`
        SELECT 
          u.id,
          u.email,
          u.role,
          COUNT(tm.project_id) as project_access_count
        FROM users u
        LEFT JOIN team_members tm ON u.id = tm.user_id
        WHERE u.status = 'active'
        GROUP BY u.id, u.email, u.role
        HAVING (u.role NOT IN ('admin', 'super_admin') AND project_access_count = 0)
      `);
      
      const usersWithoutAccess = usersWithoutPermissions.length;
      
      results.checks.push({
        name: 'User access permissions',
        type: 'ACCESS_PERMISSIONS',
        status: usersWithoutAccess === 0 ? 'PASS' : 'WARN',
        details: {
          users_without_access: usersWithoutAccess,
          message: usersWithoutAccess === 0 ? 'Tous les utilisateurs ont des permissions' : `${usersWithoutAccess} utilisateurs sans accès projet`,
          users: usersWithoutPermissions
        },
        timestamp: new Date().toISOString()
      });
      
      if (usersWithoutAccess > 0) {
        results.warnings.push({
          type: 'USERS_WITHOUT_ACCESS',
          count: usersWithoutAccess,
          details: usersWithoutPermissions,
          message: `${usersWithoutAccess} utilisateurs actifs n'ont accès à aucun projet`
        });
      }
    } catch (error) {
      results.errors.push({
        type: 'CHECK_ERROR',
        check: 'Access permissions',
        message: `Erreur lors de la vérification: ${error.message}`
      });
    }
  }

  /**
   * Vérifie la présence des index de performance
   */
  async _checkPerformanceIndexes(results) {
    const requiredIndexes = [
      { table: 'files', columns: ['client_id', 'project_id'] },
      { table: 'tasks', columns: ['client_id', 'project_id'] },
      { table: 'tasks', columns: ['client_id', 'project_id', 'status'] },
      { table: 'widget_instances', columns: ['client_id', 'project_id', 'widget_key'] },
      { table: 'team_members', columns: ['client_id', 'project_id'] },
      { table: 'metrics', columns: ['client_id', 'project_id'] }
    ];

    for (const indexInfo of requiredIndexes) {
      try {
        const [indexes] = await db.execute(`
          SHOW INDEX FROM ${indexInfo.table} 
          WHERE Column_name IN (${indexInfo.columns.map(() => '?').join(', ')})
        `, indexInfo.columns);
        
        const hasRequiredIndex = indexInfo.columns.every(col => 
          indexes.some(idx => idx.Column_name === col)
        );
        
        results.checks.push({
          name: `Performance index on ${indexInfo.table}(${indexInfo.columns.join(', ')})`,
          type: 'PERFORMANCE_INDEX',
          status: hasRequiredIndex ? 'PASS' : 'WARN',
          details: {
            table: indexInfo.table,
            required_columns: indexInfo.columns,
            has_index: hasRequiredIndex,
            message: hasRequiredIndex ? 'Index présent' : 'Index manquant - performance dégradée possible'
          },
          timestamp: new Date().toISOString()
        });
        
        if (!hasRequiredIndex) {
          results.warnings.push({
            type: 'MISSING_PERFORMANCE_INDEX',
            table: indexInfo.table,
            columns: indexInfo.columns,
            message: `Index de performance manquant sur ${indexInfo.table}(${indexInfo.columns.join(', ')})`
          });
        }
      } catch (error) {
        results.errors.push({
          type: 'CHECK_ERROR',
          check: `Index check for ${indexInfo.table}`,
          message: `Erreur lors de la vérification: ${error.message}`
        });
      }
    }
  }

  /**
   * Vérifie le trail d'audit
   */
  async _checkAuditTrail(results) {
    try {
      // Vérifier que les logs d'accès sont générés
      const [recentLogs] = await db.execute(`
        SELECT COUNT(*) as count 
        FROM access_logs 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `);
      
      const logCount = recentLogs[0].count;
      
      results.checks.push({
        name: 'Audit trail activity',
        type: 'AUDIT_TRAIL',
        status: logCount > 0 ? 'PASS' : 'WARN',
        details: {
          recent_logs_count: logCount,
          message: logCount > 0 ? `${logCount} logs d'accès dans les 24h` : 'Aucun log d\'accès récent'
        },
        timestamp: new Date().toISOString()
      });
      
      if (logCount === 0) {
        results.warnings.push({
          type: 'NO_RECENT_AUDIT_LOGS',
          message: 'Aucun log d\'audit généré dans les dernières 24 heures'
        });
      }
    } catch (error) {
      results.errors.push({
        type: 'CHECK_ERROR',
        check: 'Audit trail',
        message: `Erreur lors de la vérification: ${error.message}`
      });
    }
  }

  /**
   * Teste l'isolation des données avec des requêtes de test
   */
  async testDataIsolation(clientId, projectId, testUserId) {
    const testResults = {
      timestamp: new Date().toISOString(),
      client_id: clientId,
      project_id: projectId,
      test_user_id: testUserId,
      tests: [],
      passed: 0,
      failed: 0
    };

    try {
      // Test 1: Créer un fichier de test
      const testFileName = `test_isolation_${Date.now()}.txt`;
      await db.execute(`
        INSERT INTO files (name, client_id, project_id, created_by, size, mime_type) 
        VALUES (?, ?, ?, ?, 100, 'text/plain')
      `, [testFileName, clientId, projectId, testUserId]);
      
      // Test 2: Vérifier que le fichier n'est visible que dans le bon scope
      const [filesInScope] = await db.execute(`
        SELECT COUNT(*) as count 
        FROM files 
        WHERE name = ? AND client_id = ? AND project_id = ?
      `, [testFileName, clientId, projectId]);
      
      const [filesOutOfScope] = await db.execute(`
        SELECT COUNT(*) as count 
        FROM files 
        WHERE name = ? AND (client_id != ? OR project_id != ?)
      `, [testFileName, clientId, projectId]);
      
      testResults.tests.push({
        name: 'File scope isolation',
        status: filesInScope[0].count === 1 && filesOutOfScope[0].count === 0 ? 'PASS' : 'FAIL',
        details: {
          files_in_scope: filesInScope[0].count,
          files_out_of_scope: filesOutOfScope[0].count
        }
      });
      
      // Test 3: Créer une tâche de test
      const testTaskTitle = `Test Task Isolation ${Date.now()}`;
      await db.execute(`
        INSERT INTO tasks (title, client_id, project_id, created_by, status) 
        VALUES (?, ?, ?, ?, 'todo')
      `, [testTaskTitle, clientId, projectId, testUserId]);
      
      // Test 4: Vérifier l'isolation des tâches
      const [tasksInScope] = await db.execute(`
        SELECT COUNT(*) as count 
        FROM tasks 
        WHERE title = ? AND client_id = ? AND project_id = ?
      `, [testTaskTitle, clientId, projectId]);
      
      const [tasksOutOfScope] = await db.execute(`
        SELECT COUNT(*) as count 
        FROM tasks 
        WHERE title = ? AND (client_id != ? OR project_id != ?)
      `, [testTaskTitle, clientId, projectId]);
      
      testResults.tests.push({
        name: 'Task scope isolation',
        status: tasksInScope[0].count === 1 && tasksOutOfScope[0].count === 0 ? 'PASS' : 'FAIL',
        details: {
          tasks_in_scope: tasksInScope[0].count,
          tasks_out_of_scope: tasksOutOfScope[0].count
        }
      });
      
      // Nettoyer les données de test
      await db.execute('DELETE FROM files WHERE name = ?', [testFileName]);
      await db.execute('DELETE FROM tasks WHERE title = ?', [testTaskTitle]);
      
      // Calculer les résultats
      testResults.passed = testResults.tests.filter(t => t.status === 'PASS').length;
      testResults.failed = testResults.tests.filter(t => t.status === 'FAIL').length;
      
      return testResults;
    } catch (error) {
      logger.error('Erreur lors du test d\'isolation:', error);
      testResults.error = error.message;
      return testResults;
    }
  }

  /**
   * Génère un rapport de santé du système multi-tenant
   */
  async generateHealthReport() {
    const report = {
      timestamp: new Date().toISOString(),
      system_health: 'UNKNOWN',
      statistics: {},
      recommendations: []
    };

    try {
      // Statistiques générales
      const [clientStats] = await db.execute('SELECT COUNT(*) as count FROM clients WHERE status = "active"');
      const [projectStats] = await db.execute('SELECT COUNT(*) as count FROM projects WHERE status = "active"');
      const [widgetStats] = await db.execute('SELECT COUNT(*) as count FROM widget_instances WHERE is_active = TRUE');
      const [fileStats] = await db.execute('SELECT COUNT(*) as count, SUM(size) as total_size FROM files WHERE is_deleted = FALSE');
      const [taskStats] = await db.execute('SELECT COUNT(*) as count FROM tasks WHERE status != "cancelled"');
      
      report.statistics = {
        active_clients: clientStats[0].count,
        active_projects: projectStats[0].count,
        active_widgets: widgetStats[0].count,
        total_files: fileStats[0].count,
        total_storage_bytes: fileStats[0].total_size || 0,
        active_tasks: taskStats[0].count
      };
      
      // Validation complète
      const validation = await this.validateDataIntegrity();
      
      // Déterminer la santé du système
      if (validation.summary.failed === 0 && validation.errors.length === 0) {
        report.system_health = 'HEALTHY';
      } else if (validation.summary.failed > 0 || validation.errors.length > 0) {
        report.system_health = 'CRITICAL';
      } else if (validation.warnings.length > 0) {
        report.system_health = 'WARNING';
      }
      
      // Recommandations basées sur les résultats
      if (validation.warnings.some(w => w.type === 'MISSING_PERFORMANCE_INDEX')) {
        report.recommendations.push('Créer les index de performance manquants pour améliorer les performances');
      }
      
      if (validation.warnings.some(w => w.type === 'USERS_WITHOUT_ACCESS')) {
        report.recommendations.push('Réviser les permissions d\'accès des utilisateurs');
      }
      
      if (validation.warnings.some(w => w.type === 'NO_RECENT_AUDIT_LOGS')) {
        report.recommendations.push('Vérifier la configuration des logs d\'audit');
      }
      
      if (report.statistics.total_storage_bytes > 1000000000) { // > 1GB
        report.recommendations.push('Considérer un nettoyage des anciens fichiers');
      }
      
      report.validation_details = validation;
      
      return report;
    } catch (error) {
      logger.error('Erreur lors de la génération du rapport de santé:', error);
      report.system_health = 'ERROR';
      report.error = error.message;
      return report;
    }
  }
}

module.exports = new MultiTenantValidationService();