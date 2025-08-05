#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Charger la configuration depuis .env.mariadb
const envPath = path.join(__dirname, '.env.mariadb');
const envContent = fs.readFileSync(envPath, 'utf8');

const config = {};
envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
            config[key.trim()] = value.trim();
        }
    }
});

async function testSimpleConnection() {
    console.log('🔍 Test simple de connexion MariaDB avec mysql2...');
    console.log('📋 Configuration:');
    console.log(`   Host: ${config.MARIADB_HOST}`);
    console.log(`   Port: ${config.MARIADB_PORT}`);
    console.log(`   User: ${config.MARIADB_USER}`);
    console.log(`   Database: ${config.MARIADB_DATABASE}`);
    console.log('');

    let connection;
    try {
        // Test 1: Connexion au serveur
        console.log('1️⃣ Test de connexion au serveur...');
        connection = await mysql.createConnection({
            host: config.MARIADB_HOST,
            port: parseInt(config.MARIADB_PORT),
            user: config.MARIADB_USER,
            password: config.MARIADB_PASSWORD
        });
        console.log('✅ Connexion au serveur réussie!');

        // Test 2: Test simple
        console.log('2️⃣ Test de requête simple...');
        const [result1] = await connection.execute('SELECT 1 as test');
        console.log('✅ Requête simple réussie:', result1[0]);

        // Test 3: Vérifier la base de données
        console.log('3️⃣ Vérification de la base de données...');
        const [databases] = await connection.execute(`SHOW DATABASES LIKE '${config.MARIADB_DATABASE}'`);
        if (databases.length > 0) {
            console.log('✅ Base de données trouvée!');
        } else {
            console.log('⚠️  Base de données non trouvée, création...');
            await connection.execute(`CREATE DATABASE ${config.MARIADB_DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
            console.log('✅ Base de données créée!');
        }

        // Fermer et reconnecter avec la base de données
        await connection.end();
        
        console.log('4️⃣ Test de connexion à la base de données...');
        connection = await mysql.createConnection({
            host: config.MARIADB_HOST,
            port: parseInt(config.MARIADB_PORT),
            user: config.MARIADB_USER,
            password: config.MARIADB_PASSWORD,
            database: config.MARIADB_DATABASE
        });
        console.log('✅ Connexion à la base de données réussie!');

        // Test 5: Requête dans la base de données
        console.log('5️⃣ Test de requête dans la base de données...');
        const [result2] = await connection.execute('SELECT 1 as test');
        console.log('✅ Requête dans la base de données réussie:', result2[0]);

        // Test 6: Création et test d'une table
        console.log('6️⃣ Test de création de table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS test_connection (
                id INT PRIMARY KEY AUTO_INCREMENT,
                message VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await connection.execute(
            'INSERT INTO test_connection (message) VALUES (?)',
            ['Test de connexion mysql2 réussi!']
        );
        
        const [testResult] = await connection.execute(
            'SELECT * FROM test_connection ORDER BY created_at DESC LIMIT 1'
        );
        
        console.log('✅ Test de table réussi:', testResult[0]);

        await connection.end();
        console.log('');
        console.log('🎉 Tous les tests sont passés avec succès!');
        console.log('📝 MariaDB est maintenant correctement configuré avec mysql2');
        console.log('📝 Vous pouvez maintenant:');
        console.log('   1. Exécuter les migrations de base de données');
        console.log('   2. Démarrer votre application');
        console.log('');
        console.log('💡 Note: Utilisez mysql2 au lieu de mariadb dans vos scripts Node.js');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        
        if (connection) {
            try {
                await connection.end();
            } catch (closeError) {
                // Ignorer les erreurs de fermeture
            }
        }
        process.exit(1);
    }
}

testSimpleConnection();