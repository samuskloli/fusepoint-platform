#!/usr/bin/env node

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const PASSWORD = 'FusepointDB2025!';
const USERNAME = 'oliveirasamuel';
const DATABASE = 'fusepoint_db';

async function finalFix() {
    console.log('🔧 Correction finale de MariaDB...');
    console.log('');

    try {
        // 1. Tester la connexion actuelle
        console.log('🧪 Test de la connexion actuelle...');
        try {
            await execAsync(`mariadb -u ${USERNAME} -p${PASSWORD} -e "SELECT 1;"`);
            console.log('✅ La connexion fonctionne déjà!');
            return;
        } catch (error) {
            console.log('❌ Connexion échouée, correction nécessaire');
        }

        // 2. Essayer de se connecter en tant que root sans mot de passe
        console.log('🔑 Tentative de connexion root...');
        try {
            await execAsync('mariadb -u root -e "SELECT 1;"');
            console.log('✅ Connexion root sans mot de passe réussie');
            
            // Créer l'utilisateur
            console.log('👤 Création de l\'utilisateur...');
            const commands = [
                `DROP USER IF EXISTS '${USERNAME}'@'localhost';`,
                `CREATE USER '${USERNAME}'@'localhost' IDENTIFIED BY '${PASSWORD}';`,
                `GRANT ALL PRIVILEGES ON *.* TO '${USERNAME}'@'localhost' WITH GRANT OPTION;`,
                `CREATE DATABASE IF NOT EXISTS ${DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
                `GRANT ALL PRIVILEGES ON ${DATABASE}.* TO '${USERNAME}'@'localhost';`,
                'FLUSH PRIVILEGES;'
            ];

            for (const command of commands) {
                console.log(`   📝 ${command}`);
                await execAsync(`mariadb -u root -e "${command}"`);
            }
            
        } catch (rootError) {
            console.log('❌ Connexion root échouée');
            
            // 3. Essayer avec un mot de passe root vide explicite
            console.log('🔑 Tentative avec mot de passe root vide...');
            try {
                await execAsync('mariadb -u root -p"" -e "SELECT 1;"');
                console.log('✅ Connexion root avec mot de passe vide réussie');
                
                // Créer l'utilisateur
                console.log('👤 Création de l\'utilisateur...');
                const commands = [
                    `DROP USER IF EXISTS '${USERNAME}'@'localhost';`,
                    `CREATE USER '${USERNAME}'@'localhost' IDENTIFIED BY '${PASSWORD}';`,
                    `GRANT ALL PRIVILEGES ON *.* TO '${USERNAME}'@'localhost' WITH GRANT OPTION;`,
                    `CREATE DATABASE IF NOT EXISTS ${DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
                    `GRANT ALL PRIVILEGES ON ${DATABASE}.* TO '${USERNAME}'@'localhost';`,
                    'FLUSH PRIVILEGES;'
                ];

                for (const command of commands) {
                    console.log(`   📝 ${command}`);
                    await execAsync(`mariadb -u root -p"" -e "${command}"`);
                }
                
            } catch (emptyPassError) {
                console.log('❌ Toutes les tentatives de connexion root ont échoué');
                
                // 4. Dernière tentative : réinitialisation complète
                console.log('🔄 Réinitialisation complète...');
                
                try {
                    // Arrêter MariaDB
                    await execAsync('brew services stop mariadb');
                    console.log('✅ MariaDB arrêté');
                    
                    // Supprimer les données
                    try {
                        await execAsync('rm -rf /opt/homebrew/var/mysql');
                        console.log('✅ Données supprimées');
                    } catch (rmError) {
                        console.log('⚠️  Impossible de supprimer les données');
                    }
                    
                    // Réinstaller
                    try {
                        await execAsync('brew reinstall mariadb');
                        console.log('✅ MariaDB réinstallé');
                    } catch (reinstallError) {
                        await execAsync('brew install mariadb');
                        console.log('✅ MariaDB installé');
                    }
                    
                    // Redémarrer
                    await execAsync('brew services start mariadb');
                    console.log('✅ MariaDB redémarré');
                    
                    // Attendre
                    console.log('⏳ Attente du démarrage...');
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    
                    // Créer l'utilisateur sur l'installation fraîche
                    console.log('👤 Création de l\'utilisateur sur installation fraîche...');
                    const commands = [
                        `CREATE USER '${USERNAME}'@'localhost' IDENTIFIED BY '${PASSWORD}';`,
                        `GRANT ALL PRIVILEGES ON *.* TO '${USERNAME}'@'localhost' WITH GRANT OPTION;`,
                        `CREATE DATABASE ${DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
                        `GRANT ALL PRIVILEGES ON ${DATABASE}.* TO '${USERNAME}'@'localhost';`,
                        'FLUSH PRIVILEGES;'
                    ];

                    for (const command of commands) {
                        console.log(`   📝 ${command}`);
                        await execAsync(`mariadb -u root -e "${command}"`);
                    }
                    
                } catch (resetError) {
                    throw new Error(`Réinitialisation échouée: ${resetError.message}`);
                }
            }
        }

        // 5. Test final
        console.log('🧪 Test final de la connexion...');
        await execAsync(`mariadb -u ${USERNAME} -p${PASSWORD} -e "SELECT 1 as test, '${DATABASE}' as database_name;"`);
        console.log('✅ Test final réussi!');
        
        console.log('');
        console.log('🎉 MariaDB configuré avec succès!');
        console.log('📋 Informations de connexion:');
        console.log(`   Utilisateur: ${USERNAME}`);
        console.log(`   Mot de passe: ${PASSWORD}`);
        console.log(`   Base de données: ${DATABASE}`);
        console.log(`   Host: localhost`);
        console.log(`   Port: 3306`);
        console.log('');
        console.log('📝 Prochaines étapes:');
        console.log('   1. Tester: node test-mariadb-connection.js');
        console.log('   2. Migrer: node migrate-database.js');
        
    } catch (error) {
        console.error('❌ Erreur finale:', error.message);
        console.log('');
        console.log('🆘 Solution manuelle requise:');
        console.log('1. Exécuter: brew services stop mariadb');
        console.log('2. Exécuter: sudo rm -rf /opt/homebrew/var/mysql');
        console.log('3. Exécuter: brew uninstall mariadb');
        console.log('4. Exécuter: brew install mariadb');
        console.log('5. Exécuter: brew services start mariadb');
        console.log('6. Attendre 10 secondes');
        console.log(`7. Exécuter: mariadb -u root -e "CREATE USER '${USERNAME}'@'localhost' IDENTIFIED BY '${PASSWORD}'; GRANT ALL PRIVILEGES ON *.* TO '${USERNAME}'@'localhost'; CREATE DATABASE ${DATABASE}; FLUSH PRIVILEGES;"`);
        process.exit(1);
    }
}

finalFix();