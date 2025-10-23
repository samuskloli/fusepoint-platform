#!/usr/bin/env node

/**
 * Script pour vérifier la structure de la base de données
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const MariaDBService = require('./server/services/mariadbService.js');

async function checkDatabaseStructure() {
  const dbService = new MariaDBService();
  
  try {
    console.log('🔍 Vérification de la structure de la base de données...\n');
    
    // Initialiser la connexion
    await dbService.initialize();
    
    // Vérifier la structure de la table users
    console.log('📋 Structure de la table users:');
    const usersStructure = await dbService.run('DESCRIBE users');
    console.table(usersStructure);
    
    // Vérifier quelques utilisateurs
    console.log('\n👥 Échantillon d\'utilisateurs:');
    const users = await dbService.run('SELECT * FROM users LIMIT 3');
    console.table(users);
    
    // Lister toutes les tables
    console.log('\n📊 Tables disponibles:');
    const tables = await dbService.run('SHOW TABLES');
    console.table(tables);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await dbService.close();
  }
}

checkDatabaseStructure().catch(console.error);