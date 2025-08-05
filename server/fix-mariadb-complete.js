#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execAsync = util.promisify(exec);

const PASSWORD = 'FusepointDB2025!';
const USERNAME = 'oliveirasamuel';
const DATABASE = 'fusepoint_db';

async function fixMariaDBComplete() {
    console.log('🔧 Réparation complète de MariaDB...');
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

        // 2. Supprimer les données existantes
        console.log('🗑️  Suppression des données MariaDB existantes...');
        const dataDir = '/opt/homebrew/var/mysql';
        try {
            await execAsync(`rm -rf ${dataDir}`);
            console.log('✅ Données supprimées');
        } catch (error) {
            console.log('⚠️  Impossible de supprimer les données:', error.message);
        }

        // 3. Réinstaller MariaDB
        console.log('📦 Réinstallation de MariaDB...');
        try {
            await execAsync('brew uninstall mariadb');
            console.log('✅ MariaDB désinstallé');
        } catch (error) {
            console.log('⚠️  MariaDB n\'était pas installé ou erreur:', error.message);
        }

        console.log('📥 Installation de MariaDB...');
        await execAsync('brew install mariadb');
        console.log('✅ MariaDB installé');

        // 4. Démarrer MariaDB
        console.log('🚀 Démarrage de MariaDB...');
        await execAsync('brew services start mariadb');
        console.log('✅ MariaDB démarré');

        // Attendre que le serveur soit prêt
        console.log('⏳ Attente du démarrage complet...');
        await new Promise(resolve => setTimeout(resolve, 10000));

        // 5. Configurer l'utilisateur (MariaDB fraîchement installé n'a pas de mot de passe root)
        console.log('👤 Configuration de l\'utilisateur...');
        const commands = [
            `CREATE USER '${USERNAME}'@'localhost' IDENTIFIED BY '${PASSWORD}';`,
            `GRANT ALL PRIVILEGES ON *.* TO '${USERNAME}'@'localhost' WITH GRANT OPTION;`,
            `CREATE DATABASE ${DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
            `GRANT ALL PRIVILEGES ON ${DATABASE}.* TO '${USERNAME}'@'localhost';`,
            'FLUSH PRIVILEGES;'
        ];

        for (const command of commands) {
            console.log(`   📝 ${command}`);
            try {
                await execAsync(`mariadb -u root -e "${command}"`);
            } catch (error) {
                console.log(`   ⚠️  Erreur avec la commande: ${error.message}`);
                // Continuer avec les autres commandes
            }
        }

        // 6. Tester la connexion
        console.log('🧪 Test de la connexion...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
            await execAsync(`mariadb -u ${USERNAME} -p${PASSWORD} -e "SELECT 1 as test, '${DATABASE}' as database_name;"`);
            console.log('✅ Test de connexion réussi!');
        } catch (error) {
            console.log('❌ Test de connexion échoué:', error.message);
            throw error;
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

# Configuration existante (à copier depuis votre .env actuel)
# JWT_SECRET=votre_jwt_secret
# SMTP_HOST=votre_smtp_host
# SMTP_PORT=587
# SMTP_USER=votre_smtp_user
# SMTP_PASS=votre_smtp_pass
# etc...
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
        console.log('');
        console.log('📝 Prochaines étapes:');
        console.log('   1. Tester la connexion: node test-mariadb-connection.js');
        console.log('   2. Exécuter la migration: node migrate-database.js');
        
    } catch (error) {
        console.error('❌ Erreur lors de la réparation:', error.message);
        console.log('');
        console.log('🔧 Solution manuelle:');
        console.log('1. Arrêter MariaDB: brew services stop mariadb');
        console.log('2. Supprimer les données: sudo rm -rf /opt/homebrew/var/mysql');
        console.log('3. Désinstaller: brew uninstall mariadb');
        console.log('4. Réinstaller: brew install mariadb');
        console.log('5. Démarrer: brew services start mariadb');
        console.log('6. Configurer manuellement avec les commandes SQL');
        process.exit(1);
    }
}

fixMariaDBComplete();