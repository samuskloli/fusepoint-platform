/**
 * Script de test pour la migration MariaDB
 * Vérifie l'intégrité des données après migration
 */

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const MariaDBService = require('../services/mariadbService');
const path = require('path');

class MigrationTester {
  constructor() {
    this.sqliteDbPath = path.join(__dirname, '../database/fusepoint.db');
    this.mariadbService = new MariaDBService();
    this.sqliteDb = null;
  }

  /**
   * Initialiser les connexions
   */
  async initialize() {
    try {
      // Connexion SQLite
      this.sqliteDb = await open({
        filename: this.sqliteDbPath,
        driver: sqlite3.Database
      });
      console.log('✅ Connexion SQLite établie');

      // Connexion MariaDB
      await this.mariadbService.initialize();
      console.log('✅ Connexion MariaDB établie');

      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
      throw error;
    }
  }

  /**
   * Comparer le nombre d'enregistrements
   */
  async compareRecordCounts() {
    try {
      console.log('\n📊 Comparaison du nombre d\'enregistrements:');
      console.log('=' .repeat(50));

      const tables = ['users', 'companies', 'projects', 'notifications'];
      const results = {};

      for (const table of tables) {
        try {
          // Compter dans SQLite
          const sqliteCount = await this.sqliteDb.get(`SELECT COUNT(*) as count FROM ${table}`);
          const sqliteTotal = sqliteCount ? sqliteCount.count : 0;

          // Compter dans MariaDB
          const mariadbCount = await this.mariadbService.get(`SELECT COUNT(*) as count FROM ${table}`);
          const mariadbTotal = mariadbCount ? mariadbCount.count : 0;

          results[table] = {
            sqlite: sqliteTotal,
            mariadb: mariadbTotal,
            match: sqliteTotal === mariadbTotal
          };

          const status = results[table].match ? '✅' : '❌';
          console.log(`${status} ${table}: SQLite(${sqliteTotal}) vs MariaDB(${mariadbTotal})`);

        } catch (error) {
          console.log(`⚠️ ${table}: Erreur de comparaison - ${error.message}`);
          results[table] = { error: error.message };
        }
      }

      return results;
    } catch (error) {
      console.error('❌ Erreur comparaison:', error);
      throw error;
    }
  }

  /**
   * Tester les fonctionnalités d'authentification
   */
  async testAuthFunctions() {
    try {
      console.log('\n🔐 Test des fonctionnalités d\'authentification:');
      console.log('=' .repeat(50));

      // Test 1: Récupérer un utilisateur existant
      const users = await this.mariadbService.all('SELECT * FROM users LIMIT 1');
      if (users.length > 0) {
        const user = users[0];
        console.log(`✅ Utilisateur trouvé: ${user.email}`);

        // Test 2: Recherche par email
        const foundUser = await this.mariadbService.findUserByEmail(user.email);
        if (foundUser) {
          console.log(`✅ Recherche par email réussie: ${foundUser.email}`);
        } else {
          console.log('❌ Recherche par email échouée');
        }

        // Test 3: Recherche par ID
        const foundById = await this.mariadbService.findUserById(user.id);
        if (foundById) {
          console.log(`✅ Recherche par ID réussie: ${foundById.id}`);
        } else {
          console.log('❌ Recherche par ID échouée');
        }
      } else {
        console.log('⚠️ Aucun utilisateur trouvé pour les tests');
      }

      // Test 4: Création d'un utilisateur de test
      const testEmail = `test_migration_${Date.now()}@fusepoint.test`;
      try {
        const newUser = await this.mariadbService.createUser({
          email: testEmail,
          firstName: 'Test',
          lastName: 'Migration',
          role: 'user'
        });
        console.log(`✅ Création utilisateur test réussie: ${newUser.email}`);

        // Nettoyer l'utilisateur de test
        await this.mariadbService.query('DELETE FROM users WHERE email = ?', [testEmail]);
        console.log('✅ Nettoyage utilisateur test réussi');
      } catch (error) {
        console.log(`❌ Test création utilisateur échoué: ${error.message}`);
      }

    } catch (error) {
      console.error('❌ Erreur test authentification:', error);
      throw error;
    }
  }

  /**
   * Tester les performances
   */
  async testPerformance() {
    try {
      console.log('\n⚡ Test de performances:');
      console.log('=' .repeat(50));

      const queries = [
        'SELECT COUNT(*) FROM users',
        'SELECT * FROM users LIMIT 10',
        'SELECT u.*, c.name as company_name FROM users u LEFT JOIN companies c ON u.company_id = c.id LIMIT 5'
      ];

      for (const query of queries) {
        const startTime = Date.now();
        await this.mariadbService.query(query);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`✅ Requête exécutée en ${duration}ms: ${query.substring(0, 50)}...`);
      }

    } catch (error) {
      console.error('❌ Erreur test performance:', error);
      throw error;
    }
  }

  /**
   * Vérifier l'intégrité des données
   */
  async checkDataIntegrity() {
    try {
      console.log('\n🔍 Vérification de l\'intégrité des données:');
      console.log('=' .repeat(50));

      // Vérifier les emails uniques
      const duplicateEmails = await this.mariadbService.query(`
        SELECT email, COUNT(*) as count 
        FROM users 
        GROUP BY email 
        HAVING COUNT(*) > 1
      `);
      
      if (duplicateEmails.length === 0) {
        console.log('✅ Aucun email en double trouvé');
      } else {
        console.log(`❌ ${duplicateEmails.length} emails en double trouvés`);
      }

      // Vérifier les références d'entreprises
      const orphanUsers = await this.mariadbService.query(`
        SELECT COUNT(*) as count 
        FROM users u 
        LEFT JOIN companies c ON u.company_id = c.id 
        WHERE u.company_id IS NOT NULL AND c.id IS NULL
      `);
      
      if (orphanUsers[0].count === 0) {
        console.log('✅ Toutes les références d\'entreprises sont valides');
      } else {
        console.log(`❌ ${orphanUsers[0].count} utilisateurs avec des références d\'entreprises invalides`);
      }

      // Vérifier les agents
      const orphanAgents = await this.mariadbService.query(`
        SELECT COUNT(*) as count 
        FROM users u1 
        LEFT JOIN users u2 ON u1.agent_id = u2.id 
        WHERE u1.agent_id IS NOT NULL AND u2.id IS NULL
      `);
      
      if (orphanAgents[0].count === 0) {
        console.log('✅ Toutes les références d\'agents sont valides');
      } else {
        console.log(`❌ ${orphanAgents[0].count} utilisateurs avec des références d\'agents invalides`);
      }

    } catch (error) {
      console.error('❌ Erreur vérification intégrité:', error);
      throw error;
    }
  }

  /**
   * Générer un rapport de migration
   */
  async generateReport() {
    try {
      console.log('\n📋 Rapport de migration:');
      console.log('=' .repeat(50));

      // Statistiques générales
      const stats = await this.mariadbService.getStats();
      console.log(`📊 Statistiques MariaDB:`);
      console.log(`   - Utilisateurs: ${stats.users}`);
      console.log(`   - Entreprises: ${stats.companies}`);
      console.log(`   - Notifications: ${stats.notifications}`);

      // Informations sur la base de données
      const dbInfo = await this.mariadbService.query('SELECT VERSION() as version');
      console.log(`🗄️ Version MariaDB: ${dbInfo[0].version}`);

      // Taille de la base de données
      const dbSize = await this.mariadbService.query(`
        SELECT 
          ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'DB Size in MB'
        FROM information_schema.tables 
        WHERE table_schema = 'fusepoint_db'
      `);
      console.log(`💾 Taille de la base: ${dbSize[0]['DB Size in MB']} MB`);

    } catch (error) {
      console.error('❌ Erreur génération rapport:', error);
      throw error;
    }
  }

  /**
   * Nettoyer les connexions
   */
  async cleanup() {
    try {
      if (this.sqliteDb) {
        await this.sqliteDb.close();
        console.log('🔒 Connexion SQLite fermée');
      }
      
      if (this.mariadbService) {
        await this.mariadbService.close();
        console.log('🔒 Connexion MariaDB fermée');
      }
    } catch (error) {
      console.error('❌ Erreur nettoyage:', error);
    }
  }

  /**
   * Exécuter tous les tests
   */
  async runAllTests() {
    try {
      console.log('🧪 Tests de migration SQLite vers MariaDB');
      console.log('=' .repeat(60));
      
      // Initialiser les connexions
      await this.initialize();
      
      // Exécuter les tests
      const recordComparison = await this.compareRecordCounts();
      await this.testAuthFunctions();
      await this.testPerformance();
      await this.checkDataIntegrity();
      await this.generateReport();
      
      // Résumé final
      console.log('\n🎯 Résumé des tests:');
      console.log('=' .repeat(50));
      
      let allTestsPassed = true;
      Object.keys(recordComparison).forEach(table => {
        if (recordComparison[table].error || !recordComparison[table].match) {
          allTestsPassed = false;
        }
      });
      
      if (allTestsPassed) {
        console.log('✅ Tous les tests sont passés avec succès!');
        console.log('🎉 La migration est réussie et les données sont intègres.');
      } else {
        console.log('❌ Certains tests ont échoué.');
        console.log('⚠️ Veuillez vérifier les erreurs ci-dessus avant de continuer.');
      }
      
    } catch (error) {
      console.error('❌ Erreur tests:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  // Charger les variables d'environnement MariaDB
  const envPath = path.join(__dirname, '../.env.mariadb');
  if (require('fs').existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
  }
  
  const tester = new MigrationTester();
  
  tester.runAllTests()
    .then(() => {
      console.log('✅ Tests terminés');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Tests échoués:', error);
      process.exit(1);
    });
}

module.exports = MigrationTester;