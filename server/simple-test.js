#!/usr/bin/env node

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const PASSWORD = 'FusepointDB2025!';
const USERNAME = 'oliveirasamuel';
const DATABASE = 'fusepoint_db';

async function simpleTest() {
    console.log('🧪 Test simple de connexion MariaDB...');
    console.log('');

    try {
        // Test 1: Connexion simple
        console.log('1️⃣ Test de connexion simple...');
        const result1 = await execAsync(`mariadb -u ${USERNAME} -p${PASSWORD} -e "SELECT 1 as test;"`);
        console.log('✅ Connexion simple réussie');
        console.log('Résultat:', result1.stdout.trim());
        console.log('');

        // Test 2: Test avec la base de données
        console.log('2️⃣ Test avec la base de données...');
        const result2 = await execAsync(`mariadb -u ${USERNAME} -p${PASSWORD} -D ${DATABASE} -e "SELECT DATABASE() as current_db;"`);
        console.log('✅ Test avec base de données réussi');
        console.log('Résultat:', result2.stdout.trim());
        console.log('');

        // Test 3: Vérifier les privilèges
        console.log('3️⃣ Test des privilèges...');
        const result3 = await execAsync(`mariadb -u ${USERNAME} -p${PASSWORD} -e "SHOW GRANTS FOR CURRENT_USER();"`);
        console.log('✅ Test des privilèges réussi');
        console.log('Privilèges:', result3.stdout.trim());
        console.log('');

        // Test 4: Créer une table de test
        console.log('4️⃣ Test de création de table...');
        await execAsync(`mariadb -u ${USERNAME} -p${PASSWORD} -D ${DATABASE} -e "CREATE TABLE IF NOT EXISTS test_table (id INT PRIMARY KEY, name VARCHAR(50)); INSERT INTO test_table (id, name) VALUES (1, 'test') ON DUPLICATE KEY UPDATE name='test'; SELECT * FROM test_table WHERE id=1;"`);
        console.log('✅ Test de création de table réussi');
        console.log('');

        console.log('🎉 Tous les tests sont passés!');
        console.log('📝 MariaDB est correctement configuré et fonctionnel.');
        console.log('');
        console.log('🔧 Le problème semble venir du driver Node.js mariadb.');
        console.log('💡 Solutions possibles:');
        console.log('   1. Réinstaller le module: npm uninstall mariadb && npm install mariadb');
        console.log('   2. Utiliser mysql2 à la place: npm install mysql2');
        console.log('   3. Vérifier la version de Node.js et du driver');
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        console.log('');
        console.log('🔍 Diagnostic:');
        
        // Diagnostic détaillé
        try {
            console.log('📊 Statut de MariaDB:');
            const status = await execAsync('brew services list | grep mariadb');
            console.log(status.stdout.trim());
        } catch (statusError) {
            console.log('❌ Impossible de vérifier le statut');
        }
        
        try {
            console.log('👥 Utilisateurs MariaDB:');
            const users = await execAsync('mariadb -u root -e "SELECT User, Host FROM mysql.user WHERE User LIKE \'%oliv%\' OR User = \'oliveirasamuel\';"');
            console.log(users.stdout.trim());
        } catch (usersError) {
            console.log('❌ Impossible de lister les utilisateurs');
        }
        
        process.exit(1);
    }
}

simpleTest();