#!/usr/bin/env node

/**
 * Script pour réinitialiser le mot de passe d'un utilisateur admin
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const MariaDBService = require('./server/services/mariadbService.js');

async function resetAdminPassword() {
  const dbService = new MariaDBService();
  
  try {
    console.log('🔧 Réinitialisation du mot de passe admin...\n');
    
    // Initialiser la connexion
    await dbService.initialize();
    
    const email = 'info@fusepoint.ch';
    const newPassword = 'admin123';
    
    // Vérifier que l'utilisateur existe
    const user = await dbService.findUserByEmail(email);
    if (!user) {
      console.log(`❌ Utilisateur ${email} non trouvé`);
      return;
    }
    
    console.log(`✅ Utilisateur trouvé: ${user.email} (ID: ${user.id}, Rôle: ${user.role})`);
    
    // Hasher le nouveau mot de passe
    const hashedPassword = await dbService.hashPassword(newPassword);
    
    // Mettre à jour le mot de passe (utiliser la colonne password_hash)
    await dbService.updateUser(user.id, { password_hash: hashedPassword });
    
    console.log(`✅ Mot de passe mis à jour pour ${email}`);
    console.log(`🔑 Nouveau mot de passe: ${newPassword}`);
    
    // Tester l'authentification
    console.log('\n🔍 Test d\'authentification...');
    const authResult = await dbService.authenticateUser(email, newPassword);
    
    if (authResult) {
      console.log('✅ Authentification réussie!');
      console.log(`   ID: ${authResult.id}`);
      console.log(`   Email: ${authResult.email}`);
      console.log(`   Rôle: ${authResult.role}`);
    } else {
      console.log('❌ Échec de l\'authentification');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await dbService.close();
  }
}

resetAdminPassword().catch(console.error);