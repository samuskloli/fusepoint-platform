#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execAsync = util.promisify(exec);

const PASSWORD = 'FusepointDB2025!';
const USERNAME = 'oliveirasamuel';
const DATABASE = 'fusepoint_db';

async function fixMariaDBSafe() {
    console.log('🔧 Réparation MariaDB en mode sécurisé...');
    console.log('');

    try {
        // 1. Arrêter MariaDB
        console.log('⏹️  Arrêt de MariaDB...');
        try {
            await execAsync('brew services stop mariadb');
            console.log('✅ MariaDB arrêté');
        } catch (error) {
            console.log('⚠️  MariaDB était déjà arrêté');
        }

        // Attendre un peu
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 2. Démarrer MariaDB en mode sécurisé (skip-grant-tables)
        console.log('🔓 Démarrage de MariaDB en mode sécurisé...');
        
        // Créer un fichier de configuration temporaire
        const tempConfigPath = '/tmp/mariadb-safe.cnf';
        const tempConfig = `[mysqld]
skip-grant-tables
skip-networking
`;
        fs.writeFileSync(tempConfigPath, tempConfig);
        
        // Démarrer MariaDB avec la configuration temporaire
        const mariadbProcess = spawn('mariadbd-safe', [
            `--defaults-file=${tempConfigPath}`,
            '--user=mysql'
        ], {
            detached: true,
            stdio: 'ignore'
        });
        
        mariadbProcess.unref();
        
        console.log('⏳ Attente du démarrage en mode sécurisé...');
        await new Promise(resolve => setTimeout(resolve, 10000));

        // 3. Configurer l'utilisateur sans authentification
        console.log('👤 Configuration de l\'utilisateur en mode sécurisé...');
        
        const commands = [
            'USE mysql;',
            'FLUSH PRIVILEGES;',
            `DROP USER IF EXISTS '${USERNAME}'@'localhost';`,
            `CREATE USER '${USERNAME}'@'localhost' IDENTIFIED BY '${PASSWORD}';`,
            `GRANT ALL PRIVILEGES ON *.* TO '${USERNAME}'@'localhost' WITH GRANT OPTION;`,
            `CREATE DATABASE IF NOT EXISTS ${DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
            `GRANT ALL PRIVILEGES ON ${DATABASE}.* TO '${USERNAME}'@'localhost';`,
            'FLUSH PRIVILEGES;'
        ];

        for (const command of commands) {
            console.log(`   📝 ${command}`);
            try {
                await execAsync(`mariadb -u root --skip-password -e "${command}"`);
                console.log('   ✅ Commande exécutée');
            } catch (error) {
                console.log(`   ⚠️  Erreur: ${error.message}`);
                // Continuer avec les autres commandes
            }
        }

        // 4. Arrêter le processus MariaDB en mode sécurisé
        console.log('⏹️  Arrêt du mode sécurisé...');
        try {
            await execAsync('pkill -f mariadbd-safe');
            await execAsync('pkill -f mysqld');
        } catch (error) {
            console.log('⚠️  Processus déjà arrêté');
        }
        
        // Supprimer le fichier de configuration temporaire
        try {
            fs.unlinkSync(tempConfigPath);
        } catch (error) {
            // Ignorer l'erreur
        }
        
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 5. Redémarrer MariaDB normalement
        console.log('🚀 Redémarrage de MariaDB en mode normal...');
        await execAsync('brew services start mariadb');
        console.log('✅ MariaDB redémarré');
        
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 6. Tester la connexion
        console.log('🧪 Test de la connexion...');
        try {
            await execAsync(`mariadb -u ${USERNAME} -p${PASSWORD} -e "SELECT 1 as test, '${DATABASE}' as database_name;"`);
            console.log('✅ Test de connexion réussi!');
        } catch (error) {
            console.log('❌ Test de connexion échoué:', error.message);
            
            // Essayer une dernière fois avec une approche différente
            console.log('🔄 Tentative alternative...');
            try {
                await execAsync(`mariadb -u root -e "CREATE USER IF NOT EXISTS '${USERNAME}'@'localhost' IDENTIFIED BY '${PASSWORD}'; GRANT ALL PRIVILEGES ON *.* TO '${USERNAME}'@'localhost'; FLUSH PRIVILEGES;"`);
                await execAsync(`mariadb -u ${USERNAME} -p${PASSWORD} -e "SELECT 1;"`);
                console.log('✅ Connexion alternative réussie!');
            } catch (altError) {
                console.log('❌ Connexion alternative échouée:', altError.message);
                throw error;
            }
        }

        // 7. Mettre à jour le fichier .env.mariadb
        console.log('📝 Mise à jour du fichier .env.mariadb...');
        const envPath = path.join(__dirname, '.env.mariadb');
        
        const envContent = `# Configuration MariaDB pour Fusepoint Platform
# Généré automatiquement le ${new Date().toISOString()}

# Base de données
DB_TYPE=mariadb
MARIADB_HOST=localhost
MARIADB_PORT=3306
MARIADB_USER=${USERNAME}
MARIADB_PASSWORD=${PASSWORD}
MARIADB_DATABASE=${DATABASE}

# Clé de chiffrement (générez une nouvelle clé pour la production)
DB_ENCRYPTION_KEY=7e0a674a182ed91fbd64b950bf0b022ad8e1d61096c60e8636e140bedad4bb0d
`;
        
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Fichier .env.mariadb mis à jour');
        
        console.log('');
        console.log('🎉 MariaDB configuré avec succès!');
        console.log('📋 Informations de connexion:');
        console.log(`   Utilisateur: ${USERNAME}`);
        console.log(`   Mot de passe: ${PASSWORD}`);
        console.log(`   Base de données: ${DATABASE}`);
        console.log(`   Host: localhost`);
        console.log(`   Port: 3306`);
        
    } catch (error) {
        console.error('❌ Erreur lors de la réparation:', error.message);
        console.log('');
        console.log('🔧 Solution manuelle recommandée:');
        console.log('1. Arrêter MariaDB: brew services stop mariadb');
        console.log('2. Exécuter: mariadb-secure-installation');
        console.log('3. Ou réinstaller complètement MariaDB');
        process.exit(1);
    }
}

fixMariaDBSafe();