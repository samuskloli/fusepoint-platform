const path = require('path');
const bcrypt = require('bcryptjs');
const databaseService = require('../services/databaseService');

/**
 * Script pour créer un agent de test avec un mot de passe valide
 */
async function createTestAgent() {
  try {
    // Initialiser la base de données
    await databaseService.initialize();
    console.log('✅ Connexion à la base de données établie');
    
    // Informations utilisateur Agent de test
    const agentData = {
      email: 'agent.test@fusepoint.com',
      password: 'Agent2024!', // Mot de passe temporaire sécurisé
      firstName: 'Agent',
      lastName: 'Test',
      role: 'agent',
      userCode: 'AG999',
      specialties: '["Marketing Digital", "SEO", "Social Media"]'
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
         user_code = ?, 
         status = 'active', 
         specialties = ?, 
         is_active = 1 
         WHERE id = ?`,
        [passwordHash, agentData.firstName, agentData.lastName, agentData.role, agentData.userCode, agentData.specialties, userId]
      );
      console.log('✅ Agent test mis à jour');
    } else {
      // Hasher le mot de passe
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(agentData.password, saltRounds);
      
      // Créer l'utilisateur
      const userResult = await databaseService.db.run(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, user_code, status, specialties, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, 'active', ?, 1)`,
        [agentData.email, passwordHash, agentData.firstName, agentData.lastName, agentData.role, agentData.userCode, agentData.specialties]
      );
      
      userId = userResult.lastID;
      console.log('✅ Agent test créé avec l\'ID:', userId);
    }
    
    // Vérifier et assigner le rôle agent dans la table user_roles si elle existe
    const agentRole = await databaseService.db.get(
      'SELECT id FROM roles WHERE name = "agent"'
    );
    
    if (agentRole) {
      // Vérifier si l'utilisateur a déjà le rôle assigné
      const existingRoleAssignment = await databaseService.db.get(
        'SELECT id FROM user_roles WHERE user_id = ? AND role_id = ?',
        [userId, agentRole.id]
      );
      
      if (!existingRoleAssignment) {
        await databaseService.db.run(
          'INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES (?, ?, ?)',
          [userId, agentRole.id, userId]
        );
        console.log('✅ Rôle agent assigné dans user_roles');
      } else {
        console.log('✅ Rôle agent déjà assigné dans user_roles');
      }
    }
    
    // Afficher les informations de connexion
    console.log('\n🎉 Agent de test créé/mis à jour avec succès!');
    console.log('📧 Email:', agentData.email);
    console.log('🔑 Mot de passe:', agentData.password);
    console.log('👤 Rôle: Agent');
    console.log('🆔 ID utilisateur:', userId);
    console.log('🏷️ Code utilisateur:', agentData.userCode);
    console.log('🎯 Spécialités:', agentData.specialties);
    
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
  createTestAgent();
}

module.exports = { createTestAgent };