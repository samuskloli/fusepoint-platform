#!/usr/bin/env node

/**
 * Script pour vérifier les utilisateurs existants dans la base de données
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Importer le service MariaDB
const MariaDBService = require('./server/services/mariadbService.js');

async function checkUsers() {
  const dbService = new MariaDBService();
  
  try {
    console.log('🔍 Vérification des utilisateurs dans la base de données...\n');
    
    // Initialiser la connexion
    await dbService.initialize();
    
    // Récupérer tous les utilisateurs
    const users = await dbService.query('SELECT id, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 10');
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
      console.log('\n💡 Solutions possibles:');
      console.log('1. Créer un compte admin via l\'interface d\'inscription');
      console.log('2. Utiliser un script de création d\'utilisateur admin');
      console.log('3. Importer des données de test');
    } else {
      console.log(`✅ ${users.length} utilisateur(s) trouvé(s):\n`);
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Rôle: ${user.role}`);
        console.log(`   Créé: ${user.created_at}`);
        console.log('');
      });
      
      console.log('💡 Pour tester l\'authentification, utilisez un de ces emails avec le bon mot de passe.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des utilisateurs:', error.message);
  } finally {
    // Fermer la connexion
    await dbService.close();
  }
}

checkUsers().catch(console.error);