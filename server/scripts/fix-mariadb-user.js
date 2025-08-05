#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Configuration de l\'utilisateur MariaDB...');
console.log('ℹ️  Cette configuration utilise un mot de passe fixe pour éviter les problèmes d\'authentification.');

// Mot de passe fixe et visible
const FIXED_PASSWORD = 'FusepointDB2025!';

console.log(`🔑 Mot de passe qui sera utilisé: ${FIXED_PASSWORD}`);

// Fonction pour exécuter des commandes MariaDB avec sudo
function executeMariaDBWithSudo(command) {
    try {
        const result = execSync(`sudo mariadb -e "${command}"`, { 
            encoding: 'utf8',
            stdio: ['inherit', 'pipe', 'pipe']
        });
        return { success: true, output: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function fixMariaDBUser() {
    try {
        console.log('📋 Étape 1: Vérification de MariaDB...');
        
        // Vérifier si MariaDB est en cours d'exécution
        try {
            const serviceStatus = execSync('brew services list | grep mariadb', { encoding: 'utf8' });
            if (serviceStatus.includes('started')) {
                console.log('✅ Service MariaDB en cours d\'exécution');
            } else {
                console.log('🔄 Démarrage de MariaDB...');
                execSync('brew services start mariadb');
                console.log('✅ MariaDB démarré');
                // Attendre que le service démarre
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        } catch (error) {
            console.log('❌ Erreur avec le service MariaDB:', error.message);
            return false;
        }

        console.log('📋 Étape 2: Configuration avec sudo...');
        console.log('⚠️  Vous devrez entrer votre mot de passe système pour configurer MariaDB.');
        
        // Créer la base de données si elle n'existe pas
        console.log('📋 Création de la base de données...');
        let result = executeMariaDBWithSudo('CREATE DATABASE IF NOT EXISTS fusepoint_db;');
        if (!result.success) {
            console.error('❌ Erreur lors de la création de la base de données:', result.error);
            return false;
        }
        console.log('✅ Base de données créée/vérifiée');

        // Configurer l'utilisateur
        console.log('📋 Configuration de l\'utilisateur oliveirasamuel...');
        const commands = [
            `DROP USER IF EXISTS 'oliveirasamuel'@'localhost';`,
            `CREATE USER 'oliveirasamuel'@'localhost' IDENTIFIED BY '${FIXED_PASSWORD}';`,
            `GRANT ALL PRIVILEGES ON fusepoint_db.* TO 'oliveirasamuel'@'localhost';`,
            `GRANT CREATE, DROP, ALTER ON *.* TO 'oliveirasamuel'@'localhost';`,
            `FLUSH PRIVILEGES;`
        ];

        for (const command of commands) {
            result = executeMariaDBWithSudo(command);
            if (!result.success) {
                console.error(`❌ Erreur lors de l'exécution: ${command}`);
                console.error(result.error);
                return false;
            }
        }

        console.log('✅ Utilisateur configuré avec succès');

        console.log('📋 Étape 3: Mise à jour du fichier .env.mariadb...');
        
        // Mettre à jour le fichier .env.mariadb
        const envPath = path.join(__dirname, '..', '.env.mariadb');
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Remplacer la ligne du mot de passe
        envContent = envContent.replace(
            /MARIADB_PASSWORD=.*/,
            `MARIADB_PASSWORD=${FIXED_PASSWORD}`
        );
        
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Fichier .env.mariadb mis à jour');

        console.log('📋 Étape 4: Test de connexion...');
        
        // Tester la connexion avec le nouvel utilisateur
        try {
            const testCmd = `mariadb -u oliveirasamuel -p${FIXED_PASSWORD} -e "SELECT 'Connexion réussie' as status;"`;
            const testResult = execSync(testCmd, { encoding: 'utf8', stdio: 'pipe' });
            console.log('✅ Test de connexion réussi');
            console.log('📊 Résultat du test:', testResult.trim());
        } catch (testError) {
            console.error('❌ Test de connexion échoué:', testError.message);
            return false;
        }

        console.log('\n🎉 Configuration terminée avec succès!');
        console.log('\n📝 Informations de connexion:');
        console.log(`   Utilisateur: oliveirasamuel`);
        console.log(`   Mot de passe: ${FIXED_PASSWORD}`);
        console.log(`   Base de données: fusepoint_db`);
        console.log('\n📝 Prochaines étapes:');
        console.log('1. Exécutez: node scripts/migrate-sqlite-to-mariadb.js');
        console.log('2. Testez: node scripts/test-mariadb-migration.js');
        
        return true;
        
    } catch (error) {
        console.error('❌ Erreur lors de la configuration:', error.message);
        return false;
    }
}

// Exécuter le script
if (require.main === module) {
    fixMariaDBUser().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { fixMariaDBUser };