#!/usr/bin/env node

/**
 * Script d'initialisation de la base de données
 * Crée toutes les tables nécessaires pour le système
 */

const path = require('path');
const fs = require('fs');

// Charger les variables d'environnement depuis .env.mariadb
const envPath = path.join(__dirname, '..', 'server', '.env.mariadb');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=');
        process.env[key.trim()] = value.trim();
      }
    }
  });
  
  console.log('📄 Configuration chargée depuis .env.mariadb');
} else {
  console.warn('⚠️ Fichier .env.mariadb non trouvé, utilisation des variables d\'environnement système');
}

const databaseService = require('../server/services/databaseService');

async function initializeDatabase() {
  console.log('🚀 Initialisation de la base de données...');
  
  try {
    
    console.log('📡 Connexion à la base de données...');
    await databaseService.initialize();
    
    console.log('✅ Base de données initialisée avec succès!');
    console.log('📋 Tables créées:');
    console.log('   - Tables principales (users, system_logs, etc.)');
    console.log('   - Tables agents');
    console.log('   - Tables prestataires');
    console.log('   - Tables agent_clients');
    console.log('   - Tables templates de projets et widgets');
    console.log('     * project_templates');
    console.log('     * widgets');
    console.log('     * project_template_widgets');
    console.log('     * projects');
    console.log('     * project_widgets');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
    console.error('📊 Détails:', error);
    process.exit(1);
  }
}

// Vérifier que les variables d'environnement sont configurées
const requiredVars = ['MARIADB_HOST', 'MARIADB_USER', 'MARIADB_PASSWORD', 'MARIADB_DATABASE'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables d\'environnement manquantes:', missingVars.join(', '));
  console.error('Assurez-vous que le fichier .env.mariadb est correctement configuré.');
  process.exit(1);
}

console.log('✅ Variables d\'environnement chargées:');
console.log(`   - Host: ${process.env.MARIADB_HOST}`);
console.log(`   - Port: ${process.env.MARIADB_PORT}`);
console.log(`   - User: ${process.env.MARIADB_USER}`);
console.log(`   - Database: ${process.env.MARIADB_DATABASE}`);
console.log(`   - Password: ${'*'.repeat(process.env.MARIADB_PASSWORD?.length || 0)}`);

// Lancer l'initialisation
initializeDatabase();