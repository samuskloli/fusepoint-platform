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

async function testConnection() {
    console.log('🔍 Test de connexion MariaDB...');
    console.log('📋 Configuration:');
    console.log(`   Host: ${config.MARIADB_HOST}`);
    console.log(`   Port: ${config.MARIADB_PORT}`);
    console.log(`   User: ${config.MARIADB_USER}`);
    console.log(`   Database: ${config.MARIADB_DATABASE}`);
    console.log(`   Password: ${config.MARIADB_PASSWORD ? '***' + config.MARIADB_PASSWORD.slice(-3) : 'VIDE'}`);
    console.log('');

    let connection;
    try {
        // Test de connexion sans base de données spécifique
        console.log('🔌 Test de connexion au serveur...');
        connection = await mysql.createConnection({
            host: config.MARIADB_HOST,
            port: parseInt(config.MARIADB_PORT),
            user: config.MARIADB_USER,
            password: config.MARIADB_PASSWORD
        });

        console.log('✅ Connexion au serveur réussie!');

        // Vérifier si la base de données existe
        console.log('🗄️  Vérification de la base de données...');
        const [databases] = await connection.execute(`SHOW DATABASES LIKE '${config.MARIADB_DATABASE}'`);
        
        if (databases.length === 0) {
            console.log('⚠️  Base de données non trouvée. Création...');
            await connection.execute(`CREATE DATABASE ${config.MARIADB_DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
            console.log('✅ Base de données créée avec succès!');
        } else {
            console.log('✅ Base de données trouvée!');
        }

        // Fermer la connexion et se reconnecter avec la base de données
        await connection.end();
        
        console.log('🔌 Test de connexion à la base de données...');
        connection = await mysql.createConnection({
            host: config.MARIADB_HOST,
            port: parseInt(config.MARIADB_PORT),
            user: config.MARIADB_USER,
            password: config.MARIADB_PASSWORD,
            database: config.MARIADB_DATABASE
        });

        // Test simple
        const [result] = await connection.execute('SELECT 1 as test, NOW() as current_datetime');
        console.log('✅ Test de requête réussi:', result[0]);

        await connection.end();
        console.log('');
        console.log('🎉 Tous les tests sont passés avec succès!');
        console.log('📝 Vous pouvez maintenant exécuter la migration:');
        console.log('   cd server && node migrate-database.js');
        
    } catch (error) {
        console.error('❌ Erreur de connexion:', error.message);
        console.log('');
        console.log('🔧 Solutions possibles:');
        console.log('1. Vérifiez que MariaDB est démarré: brew services start mariadb');
        console.log('2. Vérifiez le mot de passe dans .env.mariadb');
        console.log('3. Essayez de vous connecter manuellement:');
        console.log(`   mariadb -u ${config.MARIADB_USER} -p${config.MARIADB_PASSWORD} -h ${config.MARIADB_HOST}`);
        
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

testConnection();