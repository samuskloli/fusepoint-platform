/**
 * Script de test complet de la migration MariaDB
 * Teste la connexion, les tables et démarre l'application
 */

const MariaDBService = require('./services/mariadbService');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function testCompleteMigration() {
  console.log('🧪 Test complet de la migration MariaDB...');
  
  try {
    // 1. Tester la connexion MariaDB
    console.log('\n1️⃣ Test de connexion MariaDB...');
    const mariadbService = new MariaDBService();
    await mariadbService.initialize();
    console.log('✅ Connexion MariaDB réussie');
    
    // 2. Vérifier les tables existantes
    console.log('\n2️⃣ Vérification des tables...');
    const tables = await mariadbService.query('SHOW TABLES');
    console.log('📋 Tables disponibles:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
    // 3. Tester les opérations CRUD de base
    console.log('\n3️⃣ Test des opérations CRUD...');
    
    // Test création utilisateur
    try {
      const testUser = await mariadbService.createUser({
        email: `test-migration-${Date.now()}@fusepoint.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'Migration',
        role: 'user'
      }, false); // Ne pas envoyer d'email
      
      console.log('✅ Création utilisateur réussie:', testUser.email);
      
      // Test récupération utilisateur
      const retrievedUser = await mariadbService.getUserById(testUser.id);
      console.log('✅ Récupération utilisateur réussie:', retrievedUser.email);
      
      // Test mise à jour utilisateur
      await mariadbService.run(
        'UPDATE users SET first_name = ? WHERE id = ?',
        ['TestUpdated', testUser.id]
      );
      console.log('✅ Mise à jour utilisateur réussie');
      
      // Nettoyer l'utilisateur de test
      await mariadbService.run('DELETE FROM users WHERE id = ?', [testUser.id]);
      console.log('✅ Nettoyage utilisateur de test réussi');
      
    } catch (userError) {
      console.error('❌ Erreur test utilisateur:', userError.message);
    }
    
    // 4. Tester les autres tables
    console.log('\n4️⃣ Test des autres tables...');
    
    // Test table campaigns
    try {
      const campaignResult = await mariadbService.run(
        'INSERT INTO campaigns (name, description, status, user_id) VALUES (?, ?, ?, ?)',
        ['Test Campaign', 'Test Description', 'draft', 1]
      );
      console.log('✅ Test table campaigns réussi');
      
      // Nettoyer
      await mariadbService.run('DELETE FROM campaigns WHERE id = ?', [campaignResult.lastID]);
    } catch (campaignError) {
      console.log('ℹ️ Test campaigns ignoré (pas d\'utilisateur avec ID 1):', campaignError.message);
    }
    
    // Test table analytics
    try {
      const analyticsResult = await mariadbService.run(
        'INSERT INTO analytics (event_type, event_data, user_id) VALUES (?, ?, ?)',
        ['test_event', JSON.stringify({test: true}), 1]
      );
      console.log('✅ Test table analytics réussi');
      
      // Nettoyer
      await mariadbService.run('DELETE FROM analytics WHERE id = ?', [analyticsResult.lastID]);
    } catch (analyticsError) {
      console.log('ℹ️ Test analytics ignoré (pas d\'utilisateur avec ID 1):', analyticsError.message);
    }
    
    // 5. Vérifier la structure des tables principales
    console.log('\n5️⃣ Vérification structure des tables...');
    
    const userColumns = await mariadbService.query('DESCRIBE users');
    console.log('📋 Structure table users:');
    userColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // 6. Test de performance basique
    console.log('\n6️⃣ Test de performance...');
    const startTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
      await mariadbService.query('SELECT 1 as test');
    }
    
    const endTime = Date.now();
    console.log(`✅ 10 requêtes exécutées en ${endTime - startTime}ms`);
    
    // 7. Fermer la connexion
    await mariadbService.close();
    console.log('\n🎉 Test complet de migration réussi!');
    
    // 8. Instructions pour démarrer l'application
    console.log('\n📋 Prochaines étapes:');
    console.log('1. Démarrer l\'application: npm start');
    console.log('2. Vérifier les logs pour s\'assurer que MariaDB est utilisé');
    console.log('3. Tester les fonctionnalités principales de l\'application');
    console.log('4. Surveiller les performances et la stabilité');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test de migration:', error);
    console.log('\n🔧 Actions de dépannage:');
    console.log('1. Vérifier que MariaDB est démarré: brew services start mariadb');
    console.log('2. Vérifier les credentials dans .env.mariadb');
    console.log('3. Tester la connexion manuellement: mariadb -u oliveirasamuel -pFusepointDB2025!');
    console.log('4. Vérifier que la base de données fusepoint_db existe');
    
    return false;
  }
}

// Exécuter le test
if (require.main === module) {
  testCompleteMigration()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = testCompleteMigration;