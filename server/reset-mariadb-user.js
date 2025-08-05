#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execAsync = util.promisify(exec);

const PASSWORD = 'FusepointDB2025!';
const USERNAME = 'oliveirasamuel';
const DATABASE = 'fusepoint_db';

async function resetMariaDBUser() {
    console.log('🔧 Réinitialisation de l\'utilisateur MariaDB...');
    console.log('');

    try {
        // 1. Vérifier si MariaDB est en cours d'exécution
        console.log('🔍 Vérification du statut de MariaDB...');
        try {
            const { stdout } = await execAsync('brew services list | grep mariadb');
            console.log('📊 Statut MariaDB:', stdout.trim());
        } catch (error) {
            console.log('⚠️  Impossible de vérifier le statut');
        }

        // 2. Redémarrer MariaDB pour s'assurer qu'il fonctionne
        console.log('🔄 Redémarrage de MariaDB...');
        await execAsync('brew services restart mariadb');
        console.log('✅ MariaDB redémarré');
        
        // Attendre que le serveur soit prêt
        console.log('⏳ Attente du démarrage complet...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 3. Essayer de se connecter en tant que root sans mot de passe
        console.log('🔑 Tentative de connexion root...');
        try {
            await execAsync('mariadb -u root -e "SELECT 1;"');
            console.log('✅ Connexion root réussie sans mot de passe');
            
            // Configurer l'utilisateur
            console.log('👤 Configuration de l\'utilisateur...');
            const commands = [
                `DROP USER IF EXISTS '${USERNAME}'@'localhost';`,
                `CREATE USER '${USERNAME}'@'localhost' IDENTIFIED BY '${PASSWORD}';`,
                `GRANT ALL PRIVILEGES ON *.* TO '${USERNAME}'@'localhost';`,
                `CREATE DATABASE IF NOT EXISTS ${DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
                `GRANT ALL PRIVILEGES ON ${DATABASE}.* TO '${USERNAME}'@'localhost';`,
                'FLUSH PRIVILEGES;'
            ];

            for (const command of commands) {
                console.log(`   📝 ${command}`);
                await execAsync(`mariadb -u root -e "${command}"`);
            }
            
        } catch (rootError) {
            console.log('⚠️  Connexion root échouée, tentative avec mot de passe vide...');
            try {
                await execAsync('mariadb -u root -p"" -e "SELECT 1;"');
                console.log('✅ Connexion root réussie avec mot de passe vide');
                
                // Même configuration mais avec mot de passe vide
                const commands = [
                    `DROP USER IF EXISTS '${USERNAME}'@'localhost';`,
                    `CREATE USER '${USERNAME}'@'localhost' IDENTIFIED BY '${PASSWORD}';`,
                    `GRANT ALL PRIVILEGES ON *.* TO '${USERNAME}'@'localhost';`,
                    `CREATE DATABASE IF NOT EXISTS ${DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
                    `GRANT ALL PRIVILEGES ON ${DATABASE}.* TO '${USERNAME}'@'localhost';`,
                    'FLUSH PRIVILEGES;'
                ];

                for (const command of commands) {
                    console.log(`   📝 ${command}`);
                    await execAsync(`mariadb -u root -p"" -e "${command}"`);
                }
                
            } catch (emptyPassError) {
                throw new Error('Impossible de se connecter en tant que root avec ou sans mot de passe');
            }
        }

        // 4. Tester la nouvelle connexion
        console.log('🧪 Test de la nouvelle connexion...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await execAsync(`mariadb -u ${USERNAME} -p${PASSWORD} -e "SELECT 1 as test, '${DATABASE}' as database_name;"`);
        console.log('✅ Test de connexion utilisateur réussi!');

        // 5. Mettre à jour le fichier .env.mariadb
        console.log('📝 Mise à jour du fichier .env.mariadb...');
        const envPath = path.join(__dirname, '.env.mariadb');
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // S'assurer que le mot de passe est correct
        envContent = envContent.replace(/MARIADB_PASSWORD=.*/, `MARIADB_PASSWORD=${PASSWORD}`);
        fs.writeFileSync(envPath, envContent);
        
        console.log('✅ Fichier .env.mariadb mis à jour');
        console.log('');
        console.log('🎉 Configuration MariaDB terminée avec succès!');
        console.log('📋 Informations de connexion:');
        console.log(`   Utilisateur: ${USERNAME}`);
        console.log(`   Mot de passe: ${PASSWORD}`);
        console.log(`   Base de données: ${DATABASE}`);
        console.log(`   Host: localhost`);
        console.log(`   Port: 3306`);
        console.log('');
        console.log('📝 Prochaines étapes:');
        console.log('   1. Tester la connexion: node test-mariadb-connection.js');
        console.log('   2. Exécuter la migration: node migrate-database.js');
        
    } catch (error) {
        console.error('❌ Erreur lors de la réinitialisation:', error.message);
        console.log('');
        console.log('🔧 Solutions alternatives:');
        console.log('1. Exécuter mariadb-secure-installation:');
        console.log('   mariadb-secure-installation');
        console.log('');
        console.log('2. Réinstaller MariaDB complètement:');
        console.log('   brew uninstall mariadb');
        console.log('   brew install mariadb');
        console.log('   brew services start mariadb');
        console.log('');
        console.log('3. Configuration manuelle (voir MARIADB_MANUAL_SETUP.md)');
        process.exit(1);
    }
}

resetMariaDBUser();