const path = require('path');
const bcrypt = require('bcryptjs');
const databaseService = require('../services/databaseService');
const permissionsService = require('../services/permissionsService');

/**
 * Script pour créer un utilisateur Super Administrateur
 */
async function createSuperAdmin() {
  try {
    // Initialiser la base de données
    await databaseService.initialize();
    console.log('✅ Connexion à la base de données établie');
    
    // Informations utilisateur Super Admin
    const userData = {
      email: 'samuskl@gmail.com',
      password: 'SuperAdmin2024!', // Mot de passe temporaire sécurisé
      firstName: 'Samuel',
      lastName: 'Oliveira',
      role: 'super_admin'
    };
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await databaseService.db.get(
      'SELECT id, role FROM users WHERE email = ?',
      [userData.email]
    );
    
    let userId;
    
    if (existingUser) {
      console.log('⚠️ L\'utilisateur samuskl@gmail.com existe déjà avec l\'ID:', existingUser.id);
      userId = existingUser.id;
      
      // Mettre à jour le rôle si nécessaire
      if (existingUser.role !== 'super_admin') {
        await databaseService.db.run(
          'UPDATE users SET role = ? WHERE id = ?',
          ['super_admin', userId]
        );
        console.log('✅ Rôle mis à jour vers super_admin');
      } else {
        console.log('✅ L\'utilisateur a déjà le rôle super_admin');
      }
    } else {
      // Hasher le mot de passe
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);
      
      // Créer l'utilisateur
      const userResult = await databaseService.db.run(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) 
         VALUES (?, ?, ?, ?, ?, 1)`,
        [userData.email, passwordHash, userData.firstName, userData.lastName, userData.role]
      );
      
      userId = userResult.lastID;
      console.log('✅ Utilisateur Super Admin créé avec l\'ID:', userId);
    }
    
    // Vérifier et assigner le rôle super_admin dans la table user_roles
    const superAdminRole = await databaseService.db.get(
      'SELECT id FROM roles WHERE name = "super_admin"'
    );
    
    if (superAdminRole) {
      // Vérifier si l'utilisateur a déjà le rôle assigné
      const existingRoleAssignment = await databaseService.db.get(
        'SELECT id FROM user_roles WHERE user_id = ? AND role_id = ?',
        [userId, superAdminRole.id]
      );
      
      if (!existingRoleAssignment) {
        await databaseService.db.run(
          'INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES (?, ?, ?)',
          [userId, superAdminRole.id, userId]
        );
        console.log('✅ Rôle super_admin assigné dans user_roles');
      } else {
        console.log('✅ Rôle super_admin déjà assigné dans user_roles');
      }
    } else {
      console.log('⚠️ Rôle super_admin non trouvé dans la table roles');
    }
    
    // Activer l'utilisateur s'il ne l'est pas
    await databaseService.db.run(
      'UPDATE users SET is_active = 1 WHERE id = ?',
      [userId]
    );
    
    console.log('✅ Utilisateur activé');
    
    // Afficher les informations de connexion
    console.log('\n🎉 Super Administrateur créé/mis à jour avec succès!');
    console.log('📧 Email:', userData.email);
    if (!existingUser) {
      console.log('🔑 Mot de passe temporaire:', userData.password);
      console.log('\n⚠️ Veuillez changer le mot de passe lors de la première connexion');
    }
    console.log('👑 Rôle: Super Administrateur');
    console.log('🆔 ID utilisateur:', userId);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du Super Admin:', error);
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
  createSuperAdmin();
}

module.exports = { createSuperAdmin };