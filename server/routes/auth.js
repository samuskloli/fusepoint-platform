const express = require('express');
const jwt = require('jsonwebtoken');
const authService = require('../services/authService');
const databaseService = require('../services/databaseService');
const router = express.Router();

// Gestionnaire spécifique pour les requêtes OPTIONS (preflight CORS)
router.options('*', (req, res) => {
  res.status(200).end();
});

/**
 * Routes d'authentification sécurisées
 */

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const ipAddress = req.ip;

    // Validation des données
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Tous les champs sont requis',
        fields: ['email', 'password', 'firstName', 'lastName']
      });
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Format d\'email invalide' });
    }

    // Validation mot de passe
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Le mot de passe doit contenir au moins 8 caractères' 
      });
    }

    const user = await authService.register({
      email,
      password,
      firstName,
      lastName
    }, ipAddress);

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    
    if (error.message.includes('existe déjà')) {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

/**
 * POST /api/auth/login
 * Connexion utilisateur
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');
    const contentType = req.get('Content-Type');
    const origin = req.get('Origin');
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email et mot de passe requis' 
      });
    }

    const loginResult = await authService.login(email, password, ipAddress, userAgent);
    

    res.json({
      success: true,
      message: 'Connexion réussie',
      ...loginResult
    });

  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    
    if (error.message === 'Compte inexistant') {
      return res.status(401).json({ error: 'Compte inexistant' });
    } else if (error.message === 'Mot de passe incorrect') {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }
    
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

/**
 * POST /api/auth/refresh
 * Rafraîchir le token d'accès
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Token de rafraîchissement requis' });
    }

    const result = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('❌ Erreur rafraîchissement:', error);
    res.status(401).json({ error: 'Token de rafraîchissement invalide' });
  }
});

/**
 * POST /api/auth/logout
 * Déconnexion utilisateur
 */
router.post('/logout', async (req, res) => {
  try {
    const { sessionToken } = req.body;

    await authService.logout(sessionToken);

    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });

  } catch (error) {
    console.error('❌ Erreur déconnexion:', error);
    res.status(500).json({ error: 'Erreur lors de la déconnexion' });
  }
});

/**
 * GET /api/auth/confirm/:token
 * Confirmer un compte utilisateur
 */
router.get('/confirm/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: 'Token de confirmation requis' });
    }

    const user = await databaseService.confirmUserAccount(token);

    res.json({
      success: true,
      message: 'Compte confirmé avec succès',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Erreur confirmation compte:', error);
    
    if (error.message.includes('invalide') || error.message.includes('expiré')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Erreur lors de la confirmation du compte' });
  }
});

/**
 * POST /api/auth/forgot-password
 * Demander une réinitialisation de mot de passe
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Format d\'email invalide' });
    }

    const result = await databaseService.generatePasswordResetToken(email);

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('❌ Erreur demande réinitialisation:', error);
    
    if (error.message.includes('Aucun compte')) {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Erreur lors de la demande de réinitialisation' });
  }
});

/**
 * POST /api/auth/reset-password
 * Réinitialiser le mot de passe
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token et nouveau mot de passe requis' });
    }

    // Validation mot de passe
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'Le mot de passe doit contenir au moins 8 caractères' 
      });
    }

    const result = await databaseService.resetPassword(token, newPassword);

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('❌ Erreur réinitialisation mot de passe:', error);
    
    if (error.message.includes('invalide') || error.message.includes('expiré')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Erreur lors de la réinitialisation du mot de passe' });
  }
});

/**
 * POST /api/auth/resend-confirmation
 * Renvoyer l'email de confirmation
 */
router.post('/resend-confirmation', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    // Récupérer l'utilisateur
    const user = await databaseService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Aucun compte trouvé avec cet email' });
    }

    if (user.is_active) {
      return res.status(400).json({ error: 'Ce compte est déjà activé' });
    }

    // Générer un nouveau token
    const confirmationToken = databaseService.generateToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    // Mettre à jour le token
    await databaseService.db.run(
      'UPDATE users SET confirmation_token = ?, token_expiry = ? WHERE id = ?',
      [confirmationToken, tokenExpiry.toISOString(), user.id]
    );

    // Envoyer l'email
    try {
      const emailService = require('../services/emailService');
      await emailService.sendAccountConfirmation(email, user.first_name, confirmationToken);
      console.log(`✅ Email de confirmation renvoyé à ${email}`);
    } catch (emailError) {
      console.error('❌ Erreur envoi email de confirmation:', emailError);
      throw emailError;
    }

    res.json({
      success: true,
      message: 'Email de confirmation renvoyé'
    });

  } catch (error) {
    console.error('❌ Erreur renvoi confirmation:', error);
    res.status(500).json({ error: 'Erreur lors du renvoi de l\'email de confirmation' });
  }
});

/**
 * GET /api/auth/me
 * Récupérer les informations de l'utilisateur connecté
 */
router.post('/complete-onboarding', authService.authenticateMiddleware.bind(authService), async (req, res) => {
  try {
    const { user } = req;
    const companyData = req.body;

    if (user.onboarding_completed) {
      return res.status(400).json({ error: 'Onboarding déjà complété' });
    }

    // Créer l'entreprise
    const company = await databaseService.createCompany(companyData, user.id);

    // Marquer l'onboarding comme complété
    await databaseService.db.run(
      'UPDATE users SET onboarding_completed = 1 WHERE id = ?',
      [user.id]
    );

    res.json({
      success: true,
      message: 'Onboarding complété avec succès',
      company
    });
  } catch (error) {
    console.error('❌ Erreur completion onboarding:', error);
    res.status(500).json({ error: 'Erreur lors de la completion de l\'onboarding' });
  }
});

router.get('/me', authService.authenticateMiddleware.bind(authService), async (req, res) => {
  try {
    const { user } = req;
    
    // Récupérer les entreprises de l'utilisateur
    const companies = await databaseService.getUserCompanies(user.id);
    
    // Vérifier si l'utilisateur est super admin
    const permissionsService = require('../services/permissionsService');
    const isSuperAdmin = await permissionsService.isSuperAdmin(user.id);
    
    // Si super admin, il a accès à tout
    // Sinon, vérifier les rôles spécifiques
    let canAccessAgent = false;
    if (!isSuperAdmin) {
      const userRoles = await permissionsService.getUserRoles(user.id);
      canAccessAgent = userRoles.some(role => ['agent', 'admin'].includes(role.name));
    }
    
    // Enrichir les informations utilisateur
    const enrichedUser = {
      ...user,
      isSuperAdmin,
      permissions: {
        canAccessSuperAdmin: isSuperAdmin,
        canAccessAgent: isSuperAdmin || canAccessAgent // Super admin a accès à tout
      }
    };

    res.json({
      success: true,
      user: enrichedUser,
      companies
    });

  } catch (error) {
    console.error('❌ Erreur récupération profil:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

/**
 * PUT /api/auth/profile
 * Mettre à jour le profil utilisateur
 */
router.put('/profile', authService.authenticateMiddleware.bind(authService), async (req, res) => {
  try {
    const { user } = req;
    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Prénom et nom requis' 
      });
    }

    await databaseService.db.run(
      'UPDATE users SET first_name = ?, last_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [firstName, lastName, user.id]
    );

    // Log d'audit
    await databaseService.logAudit(
      user.id,
      null,
      'PROFILE_UPDATED',
      'users',
      { firstName, lastName },
      req.ip
    );

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: {
        ...user,
        firstName,
        lastName
      }
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour profil:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
});

/**
 * POST /api/auth/change-password
 * Changer le mot de passe
 */
router.post('/change-password', authService.authenticateMiddleware.bind(authService), async (req, res) => {
  try {
    const { user } = req;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Mot de passe actuel et nouveau mot de passe requis' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' 
      });
    }

    // Vérifier le mot de passe actuel
    const userWithPassword = await databaseService.getUserByEmail(user.email);
    const isValidPassword = await databaseService.verifyPassword(
      currentPassword, 
      userWithPassword.password_hash
    );

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }

    // Hacher le nouveau mot de passe
    const newPasswordHash = await databaseService.hashPassword(newPassword);

    // Mettre à jour le mot de passe
    await databaseService.db.run(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPasswordHash, user.id]
    );

    // Log d'audit
    await databaseService.logAudit(
      user.id,
      null,
      'PASSWORD_CHANGED',
      'users',
      {},
      req.ip
    );

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur changement mot de passe:', error);
    res.status(500).json({ error: 'Erreur lors du changement de mot de passe' });
  }
});

/**
 * GET /api/auth/sessions
 * Récupérer les sessions actives de l'utilisateur
 */
router.get('/sessions', authService.authenticateMiddleware.bind(authService), async (req, res) => {
  try {
    const { user } = req;

    const sessions = await databaseService.db.all(
      `SELECT session_token, ip_address, user_agent, created_at, expires_at 
       FROM user_sessions 
       WHERE user_id = ? AND expires_at > CURRENT_TIMESTAMP 
       ORDER BY created_at DESC`,
      [user.id]
    );

    res.json({
      success: true,
      sessions: sessions.map(session => ({
        token: session.session_token.substring(0, 8) + '...', // Masquer le token complet
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        createdAt: session.created_at,
        expiresAt: session.expires_at
      }))
    });

  } catch (error) {
    console.error('❌ Erreur récupération sessions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des sessions' });
  }
});

/**
 * POST /api/auth/set-password
 * Définir le mot de passe lors de la première connexion avec un token
 */
router.post('/set-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Le token et le mot de passe sont requis'
      });
    }
    
    // Validation du mot de passe
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères'
      });
    }
    
    // Vérifier le token et sa validité
    const userQuery = `
      SELECT id, email, first_name, last_name, first_login_token_expires
      FROM users 
      WHERE first_login_token = ? AND first_login_token_expires > datetime('now')
    `;
    
    const user = await databaseService.get(userQuery, [token]);
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }
    
    // Hasher le nouveau mot de passe
    const hashedPassword = await databaseService.hashPassword(password);
    
    // Mettre à jour l'utilisateur avec le mot de passe et supprimer le token
    const updateQuery = `
      UPDATE users 
      SET password_hash = ?, 
          email_verified = 1,
          first_login_token = NULL,
          first_login_token_expires = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await databaseService.run(updateQuery, [hashedPassword, user.id]);
    
    // Générer un token JWT pour la connexion automatique
    const jwtToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Mot de passe défini avec succès',
      data: {
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: 'user'
        }
      }
    });
    
  } catch (error) {
    console.error('Erreur définition mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la définition du mot de passe'
    });
  }
});

module.exports = router;