#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

/**
 * Script de vérification de la migration vers MariaDB
 * Vérifie que tous les services utilisent MariaDB au lieu de SQLite
 */

class MariaDBMigrationVerifier {
    constructor() {
        this.servicesDir = path.join(__dirname, '..', 'services');
        this.issues = [];
        this.warnings = [];
        this.successes = [];
    }

    async verify() {
        console.log('🔍 Vérification de la migration vers MariaDB...');
        console.log('=' .repeat(60));

        try {
            await this.checkServiceFiles();
            await this.checkDatabaseConnection();
            await this.checkEnvironmentConfig();
            await this.checkDependencies();
            
            this.printReport();
            
            if (this.issues.length === 0) {
                console.log('\n✅ Migration vers MariaDB complète et vérifiée!');
                process.exit(0);
            } else {
                console.log('\n❌ Des problèmes ont été détectés dans la migration.');
                process.exit(1);
            }
        } catch (error) {
            console.error('❌ Erreur lors de la vérification:', error);
            process.exit(1);
        }
    }

    async checkServiceFiles() {
        console.log('\n📁 Vérification des fichiers de services...');
        
        const serviceFiles = fs.readdirSync(this.servicesDir)
            .filter(file => file.endsWith('.js'))
            .map(file => path.join(this.servicesDir, file));

        for (const filePath of serviceFiles) {
            const fileName = path.basename(filePath);
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Vérifier les imports SQLite
            if (content.includes("require('sqlite3')") || content.includes('require("sqlite3")'))
            {
                this.issues.push(`${fileName}: Utilise encore sqlite3`);
            }
            
            // Vérifier les références à fusepoint.db
            if (content.includes('fusepoint.db')) {
                this.issues.push(`${fileName}: Contient des références à fusepoint.db`);
            }
            
            // Vérifier l'utilisation de MariaDBService
            if (content.includes('MariaDBService') || content.includes('mariadbService')) {
                this.successes.push(`${fileName}: Utilise MariaDBService ✓`);
            }
            
            // Vérifier les méthodes SQLite spécifiques
            if (content.includes('.lastID')) {
                this.warnings.push(`${fileName}: Utilise .lastID (devrait être .insertId pour MariaDB)`);
            }
            
            if (content.includes('.changes')) {
                this.warnings.push(`${fileName}: Utilise .changes (devrait être .affectedRows pour MariaDB)`);
            }
            
            // Vérifier les fonctions SQLite spécifiques
            if (content.includes('datetime("now")') || content.includes("datetime('now')")) {
                this.warnings.push(`${fileName}: Utilise datetime('now') (devrait être NOW() pour MariaDB)`);
            }
        }
    }

    async checkDatabaseConnection() {
        console.log('\n🔌 Vérification de la connexion MariaDB...');
        
        try {
            const MariaDBService = require('../services/mariadbService');
            const mariadb = new MariaDBService();
            
            const result = await mariadb.get('SELECT 1 as test');
            if (result && result.test === 1) {
                this.successes.push('Connexion MariaDB: Fonctionnelle ✓');
            } else {
                this.issues.push('Connexion MariaDB: Échec du test de connexion');
            }
            
            await mariadb.close();
        } catch (error) {
            this.issues.push(`Connexion MariaDB: ${error.message}`);
        }
    }

    async checkEnvironmentConfig() {
        console.log('\n⚙️  Vérification de la configuration d\'environnement...');
        
        const envPath = path.join(__dirname, '..', '.env.mariadb');
        
        if (!fs.existsSync(envPath)) {
            this.issues.push('Fichier .env.mariadb manquant');
            return;
        }
        
        const envContent = fs.readFileSync(envPath, 'utf8');
        const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
        
        for (const varName of requiredVars) {
            if (!envContent.includes(varName)) {
                this.issues.push(`Variable d'environnement manquante: ${varName}`);
            } else {
                this.successes.push(`Variable d'environnement: ${varName} ✓`);
            }
        }
    }

    async checkDependencies() {
        console.log('\n📦 Vérification des dépendances...');
        
        const packagePath = path.join(__dirname, '..', 'package.json');
        
        if (!fs.existsSync(packagePath)) {
            this.issues.push('Fichier package.json manquant');
            return;
        }
        
        const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const dependencies = { ...packageContent.dependencies, ...packageContent.devDependencies };
        
        // Vérifier mysql2
        if (dependencies.mysql2) {
            this.successes.push(`Dépendance mysql2: ${dependencies.mysql2} ✓`);
        } else {
            this.issues.push('Dépendance mysql2 manquante');
        }
        
        // Vérifier si sqlite3 est encore présent
        if (dependencies.sqlite3) {
            this.warnings.push(`Dépendance sqlite3 encore présente: ${dependencies.sqlite3}`);
        }
    }

    printReport() {
        console.log('\n' + '=' .repeat(60));
        console.log('📊 RAPPORT DE VÉRIFICATION');
        console.log('=' .repeat(60));
        
        if (this.successes.length > 0) {
            console.log('\n✅ SUCCÈS:');
            this.successes.forEach(success => console.log(`  • ${success}`));
        }
        
        if (this.warnings.length > 0) {
            console.log('\n⚠️  AVERTISSEMENTS:');
            this.warnings.forEach(warning => console.log(`  • ${warning}`));
        }
        
        if (this.issues.length > 0) {
            console.log('\n❌ PROBLÈMES À CORRIGER:');
            this.issues.forEach(issue => console.log(`  • ${issue}`));
        }
        
        console.log('\n' + '=' .repeat(60));
        console.log(`📈 RÉSUMÉ: ${this.successes.length} succès, ${this.warnings.length} avertissements, ${this.issues.length} problèmes`);
    }
}

// Exécution du script
if (require.main === module) {
    const verifier = new MariaDBMigrationVerifier();
    verifier.verify();
}

module.exports = MariaDBMigrationVerifier;