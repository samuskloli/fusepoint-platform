const path = require('path');
const bcrypt = require('bcryptjs');
const databaseService = require('../services/databaseService');

/**
 * Script pour créer un agent simple sans colonnes optionnelles
 */
async function createSimpleAgent() {
  try {
    // Initialiser la base de données
    await databaseService.initialize();
    console.log('✅ Connexion à la base de données établie');
    
    // Informations utilisateur Agent
    const agentData = {
      email: 'agent.test@fusepoint.com',
      password: 'Agent2024!', // Mot de passe temporaire sécurisé
      firstName: 'Agent',
      lastName: 'Test',
      role: 'agent'
    };
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await databaseService.db.get(
      'SELECT id, role FROM users WHERE email = ?',
      [agentData.email]
    );
    
    let userId;
    
    if (existingUser) {
      console.log('⚠️ L\'agent test existe déjà avec l\'ID:', existingUser.id);
      userId = existingUser.id;
      
      // Mettre à jour le mot de passe et les informations
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(agentData.password, saltRounds);
      
      await databaseService.db.run(
        `UPDATE users SET 
         password_hash = ?, 
         first_name = ?, 
         last_name = ?, 
         role = ?, 
         is_active = 1 
         WHERE id = ?`,
        [passwordHash, agentData.firstName, agentData.lastName, agentData.role, userId]
      );
      console.log('✅ Agent test mis à jour');
    } else {
      // Hasher le mot de passe
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(agentData.password, saltRounds);
      
      // Créer l'utilisateur
      const userResult = await databaseService.db.run(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) 
         VALUES (?, ?, ?, ?, ?, 1)`,
        [agentData.email, passwordHash, agentData.firstName, agentData.lastName, agentData.role]
      );
      
      userId = userResult.lastID;
      console.log('✅ Agent test créé avec l\'ID:', userId);
    }
    
    // Afficher les informations de connexion
    console.log('\n🎉 Agent de test créé/mis à jour avec succès!');
    console.log('📧 Email:', agentData.email);
    console.log('🔑 Mot de passe:', agentData.password);
    console.log('👤 Rôle: Agent');
    console.log('🆔 ID utilisateur:', userId);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'agent test:', error);
  } finally {
    // Fermer la connexion à la base de données
    if (databaseService.db) {
      await databaseService.db.close();
      console.log('🔒 Connexion à la base de données fermée');
    }
  }
}

// Exécuter le script
if (require.main === module) {
  createSimpleAgent();
}

module.exports = { createSimpleAgent };