#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

/**
 * Script de finalisation de la migration vers MariaDB
 * Supprime les dépendances SQLite et nettoie les fichiers obsolètes
 */

class MariaDBMigrationFinalizer {
    constructor() {
        this.projectRoot = path.join(__dirname, '..', '..');
        this.serverRoot = path.join(__dirname, '..');
    }

    async finalize() {
        console.log('🔧 Finalisation de la migration vers MariaDB...');
        console.log('=' .repeat(60));

        try {
            await this.removeSQLiteDependency();
            await this.cleanupSQLiteFiles();
            await this.createMigrationSummary();
            
            console.log('\n✅ Migration vers MariaDB finalisée avec succès!');
            console.log('\n📋 Prochaines étapes recommandées:');
            console.log('   1. Testez toutes les fonctionnalités de l\'application');
            console.log('   2. Vérifiez que la base de données MariaDB fonctionne correctement');
            console.log('   3. Créez une sauvegarde de la base de données MariaDB');
            console.log('   4. Supprimez les anciens fichiers SQLite si tout fonctionne');
            
        } catch (error) {
            console.error('❌ Erreur lors de la finalisation:', error);
            process.exit(1);
        }
    }

    async removeSQLiteDependency() {
        console.log('\n📦 Suppression de la dépendance SQLite...');
        
        const packagePath = path.join(this.projectRoot, 'package.json');
        
        if (!fs.existsSync(packagePath)) {
            console.log('⚠️  Fichier package.json non trouvé');
            return;
        }
        
        const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // Supprimer sqlite3 des dépendances
        if (packageContent.dependencies && packageContent.dependencies.sqlite3) {
            delete packageContent.dependencies.sqlite3;
            console.log('✅ Dépendance sqlite3 supprimée des dependencies');
        }
        
        if (packageContent.devDependencies && packageContent.devDependencies.sqlite3) {
            delete packageContent.devDependencies.sqlite3;
            console.log('✅ Dépendance sqlite3 supprimée des devDependencies');
        }
        
        // Sauvegarder le package.json modifié
        fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 2));
        console.log('✅ Fichier package.json mis à jour');
        
        // Supprimer sqlite3 des node_modules si présent
        try {
            await execAsync('npm uninstall sqlite3', { cwd: this.projectRoot });
            console.log('✅ Package sqlite3 désinstallé');
        } catch (error) {
            console.log('ℹ️  Package sqlite3 déjà absent des node_modules');
        }
    }

    async cleanupSQLiteFiles() {
        console.log('\n🧹 Nettoyage des fichiers SQLite...');
        
        const filesToCheck = [
            path.join(this.serverRoot, 'fusepoint.db'),
            path.join(this.serverRoot, 'fusepoint.db-shm'),
            path.join(this.serverRoot, 'fusepoint.db-wal'),
            path.join(this.projectRoot, 'fusepoint.db'),
            path.join(this.projectRoot, 'fusepoint.db-shm'),
            path.join(this.projectRoot, 'fusepoint.db-wal')
        ];
        
        let foundFiles = [];
        
        for (const filePath of filesToCheck) {
            if (fs.existsSync(filePath)) {
                foundFiles.push(filePath);
            }
        }
        
        if (foundFiles.length > 0) {
            console.log('\n📁 Fichiers SQLite détectés:');
            foundFiles.forEach(file => {
                const stats = fs.statSync(file);
                const sizeKB = (stats.size / 1024).toFixed(2);
                console.log(`   • ${path.basename(file)} (${sizeKB} KB)`);
            });
            
            console.log('\n⚠️  IMPORTANT: Ces fichiers SQLite ont été conservés pour sécurité.');
            console.log('   Vous pouvez les supprimer manuellement après avoir vérifié que');
            console.log('   la migration vers MariaDB fonctionne correctement.');
            
            // Créer un script de suppression
            const cleanupScript = foundFiles.map(file => `rm "${file}"`).join('\n');
            const cleanupScriptPath = path.join(this.serverRoot, 'scripts', 'cleanup-sqlite-files.sh');
            
            fs.writeFileSync(cleanupScriptPath, `#!/bin/bash\n\n# Script de suppression des fichiers SQLite\n# Exécutez ce script uniquement après avoir vérifié que MariaDB fonctionne\n\n${cleanupScript}\n\necho "Fichiers SQLite supprimés"\n`);
            fs.chmodSync(cleanupScriptPath, '755');
            
            console.log(`\n📝 Script de nettoyage créé: ${cleanupScriptPath}`);
        } else {
            console.log('✅ Aucun fichier SQLite trouvé');
        }
    }

    async createMigrationSummary() {
        console.log('\n📊 Création du résumé de migration...');
        
        const summaryPath = path.join(this.serverRoot, 'MIGRATION_MARIADB_SUMMARY.md');
        
        const summary = `# Résumé de la Migration vers MariaDB

## Date de migration
${new Date().toISOString()}

## Services migrés

Les services suivants ont été migrés de SQLite vers MariaDB :

### ✅ Services complètement migrés
- **accompagnementService.js** - Gestion des prestations et demandes
- **agentService.js** - Gestion des agents
- **backupService.js** - Système de sauvegarde
- **bulkEmailService.js** - Envoi d'emails en masse
- **clientService.js** - Gestion des clients
- **databaseService.js** - Service de base de données principal
- **mariadbService.js** - Service MariaDB spécialisé
- **notificationManagementService.js** - Gestion des notifications
- **permissionsService.js** - Gestion des permissions
- **platformSettingsService.js** - Paramètres de la plateforme
- **prestataireInvitationService.js** - Invitations des prestataires
- **projectService.js** - Gestion des projets
- **systemHealthService.js** - Santé du système
- **systemLogsService.js** - Journalisation système

## Modifications apportées

### 1. Remplacement des imports
- \`require('sqlite3')\` → \`MariaDBService\`
- Suppression des références directes à \`fusepoint.db\`

### 2. Adaptation des méthodes
- \`.lastID\` → \`.insertId\`
- \`.changes\` → \`.affectedRows\`
- \`datetime('now')\` → \`NOW()\`

### 3. Configuration
- Ajout des variables d'environnement MariaDB dans \`.env.mariadb\`
- Configuration de la connexion MariaDB

### 4. Schémas de base de données
- Adaptation des types de données SQLite vers MariaDB
- Conversion des contraintes et index

## Configuration MariaDB

### Variables d'environnement (\`.env.mariadb\`)
\`\`\`
DB_TYPE=mariadb
DB_HOST=localhost
DB_PORT=3306
DB_USER=oliveirasamuel
DB_PASSWORD=FusepointDB2025!
DB_NAME=fusepoint_db
\`\`\`

### Dépendances
- **Ajoutée**: \`mysql2\` pour la connexion MariaDB
- **Supprimée**: \`sqlite3\` (ancienne dépendance)

## Scripts de vérification

- \`verify-mariadb-migration.js\` - Vérification de la migration
- \`finalize-mariadb-migration.js\` - Finalisation de la migration
- \`cleanup-sqlite-files.sh\` - Nettoyage des fichiers SQLite (optionnel)

## Tests recommandés

1. **Test de connexion** - Vérifier que l'application se connecte à MariaDB
2. **Test CRUD** - Tester les opérations de création, lecture, mise à jour, suppression
3. **Test des services** - Vérifier chaque service migré
4. **Test de performance** - Comparer les performances avec SQLite
5. **Test de sauvegarde** - Vérifier le système de sauvegarde MariaDB

## Notes importantes

- ⚠️  **Sauvegarde**: Assurez-vous d'avoir une sauvegarde complète avant de supprimer les fichiers SQLite
- 🔒 **Sécurité**: Les mots de passe MariaDB doivent être sécurisés en production
- 📈 **Performance**: MariaDB offre de meilleures performances pour les applications multi-utilisateurs
- 🔄 **Maintenance**: Planifiez des sauvegardes régulières de MariaDB

## Support

En cas de problème, consultez :
1. Les logs de l'application
2. Les logs MariaDB
3. Le script de vérification \`verify-mariadb-migration.js\`

---
*Migration générée automatiquement le ${new Date().toLocaleString('fr-FR')}*
`;
        
        fs.writeFileSync(summaryPath, summary);
        console.log(`✅ Résumé de migration créé: ${summaryPath}`);
    }
}

// Exécution du script
if (require.main === module) {
    const finalizer = new MariaDBMigrationFinalizer();
    finalizer.finalize();
}

module.exports = MariaDBMigrationFinalizer;