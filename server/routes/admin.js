const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const databaseService = require('../services/databaseService');
const bcrypt = require('bcryptjs');
const systemLogsService = require('../services/systemLogsService');

// Middleware pour toutes les routes admin - accessible aux admin et super_admin
router.use(authMiddleware);
router.use(roleAuth(['admin', 'super_admin']));

/**
 * Routes Admin pour la gestion des utilisateurs
 * Accessibles aux rôles: admin, super_admin
 */

// Récupérer tous les utilisateurs
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      search,
      activeOnly = 'true'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const options = {
      limit: parseInt(limit),
      offset,
      role: role || null,
      search: search || null,
      activeOnly: activeOnly === 'true'
    };

    const [users, totalCount] = await Promise.all([
      databaseService.getAllUsers(options),
      databaseService.getUsersCount(options)
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Erreur récupération utilisateurs (admin):', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des utilisateurs',
      details: error.message
    });
  }
});

// Récupérer les détails d'un utilisateur
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await databaseService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('❌ Erreur récupération détails utilisateur (admin):', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des détails de l\'utilisateur',
      details: error.message
    });
  }
});

// Mettre à jour le rôle d'un utilisateur
router.put('/users/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const updatedBy = req.user.id;

    if (!role) {
      return res.status(400).json({
        error: 'Le rôle est requis'
      });
    }

    // Les admin ne peuvent pas créer de super_admin
    const validRoles = req.user.role === 'super_admin' 
      ? ['user', 'admin', 'super_admin', 'agent', 'prestataire']
      : ['user', 'admin', 'agent', 'prestataire'];
      
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: 'Rôle invalide',
        validRoles
      });
    }

    // Empêcher les admin de modifier les super_admin
    if (req.user.role === 'admin') {
      const targetUser = await databaseService.getUserById(userId);
      if (targetUser && targetUser.role === 'super_admin') {
        return res.status(403).json({
          error: 'Vous ne pouvez pas modifier un super administrateur'
        });
      }
    }

    const result = await databaseService.updateUserRole(userId, role, updatedBy);
    
    // Log de l'action
    await systemLogsService.logAction(
      req.user.id,
      'user_role_update',
      `Rôle modifié pour l'utilisateur ${userId}: ${role}`,
      { targetUserId: userId, newRole: role }
    );
    
    res.json(result);
  } catch (error) {
    console.error('❌ Erreur mise à jour rôle (admin):', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du rôle',
      details: error.message
    });
  }
});

// Activer/désactiver un utilisateur
router.put('/users/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    const updatedBy = req.user.id;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Le statut isActive doit être un booléen'
      });
    }

    // Vérifier que l'utilisateur existe
    const user = await databaseService.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Empêcher les admin de modifier les super_admin
    if (req.user.role === 'admin' && user.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Vous ne pouvez pas modifier un super administrateur'
      });
    }

    // Empêcher la désactivation de son propre compte
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Vous ne pouvez pas désactiver votre propre compte'
      });
    }

    const result = await databaseService.updateUserStatus(userId, isActive, updatedBy);
    
    // Log de l'action
    await systemLogsService.logAction(
      req.user.id,
      'user_status_update',
      `Utilisateur ${userId} ${isActive ? 'activé' : 'désactivé'}`,
      { targetUserId: userId, newStatus: isActive }
    );
    
    res.json({
      success: true,
      message: `Utilisateur ${isActive ? 'activé' : 'désactivé'} avec succès`,
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour statut (admin):', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du statut',
      details: error.message
    });
  }
});

// Mettre à jour les informations d'un utilisateur
router.put('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { first_name, last_name, email, phone } = req.body;
    const updatedBy = req.user.id;

    // Vérifier que l'utilisateur existe
    const user = await databaseService.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Empêcher les admin de modifier les super_admin
    if (req.user.role === 'admin' && user.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Vous ne pouvez pas modifier un super administrateur'
      });
    }

    // Validation de l'email si fourni
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Format d\'email invalide'
      });
    }

    const updateData = {
      first_name,
      last_name,
      email,
      phone
    };

    // Supprimer les champs undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const result = await databaseService.updateUser(userId, updateData, updatedBy);
    
    // Log de l'action
    await systemLogsService.logAction(
      req.user.id,
      'user_update',
      `Informations mises à jour pour l'utilisateur ${userId}`,
      { targetUserId: userId, updatedFields: Object.keys(updateData) }
    );
    
    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour utilisateur (admin):', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de l\'utilisateur',
      details: error.message
    });
  }
});

// Récupérer les rôles disponibles
router.get('/users/roles', async (req, res) => {
  try {
    const roles = req.user.role === 'super_admin' 
      ? [
          { value: 'user', label: 'Utilisateur', description: 'Utilisateur standard' },
          { value: 'admin', label: 'Administrateur', description: 'Administrateur de l\'entreprise' },
          { value: 'agent', label: 'Agent', description: 'Agent commercial' },
          { value: 'prestataire', label: 'Prestataire', description: 'Prestataire de services' },
          { value: 'super_admin', label: 'Super Admin', description: 'Super administrateur système' }
        ]
      : [
          { value: 'user', label: 'Utilisateur', description: 'Utilisateur standard' },
          { value: 'admin', label: 'Administrateur', description: 'Administrateur de l\'entreprise' },
          { value: 'agent', label: 'Agent', description: 'Agent commercial' },
          { value: 'prestataire', label: 'Prestataire', description: 'Prestataire de services' }
        ];

    res.json({ roles });
  } catch (error) {
    console.error('❌ Erreur récupération rôles (admin):', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des rôles',
      details: error.message
    });
  }
});

// Mettre à jour le mot de passe d'un utilisateur
router.put('/users/:userId/password', async (req, res) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;

    // Validation des données
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Le mot de passe est requis'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Le mot de passe doit contenir au moins 8 caractères'
      });
    }

    // Vérifier que l'utilisateur existe
    const user = await databaseService.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Empêcher les admin de modifier les super_admin
    if (req.user.role === 'admin' && user.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Vous ne pouvez pas modifier un super administrateur'
      });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Mettre à jour le mot de passe dans la base de données
    await databaseService.updateUserPassword(userId, hashedPassword);

    // Log de l'action
    await systemLogsService.logAction(
      req.user.id,
      'user_password_update',
      `Mot de passe modifié pour l'utilisateur ${userId}`,
      { targetUserId: userId }
    );

    res.json({
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur modification mot de passe (admin):', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la modification du mot de passe',
      details: error.message
    });
  }
});

module.exports = router;