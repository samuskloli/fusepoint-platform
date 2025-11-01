const express = require('express');
const jwt = require('jsonwebtoken');
const authService = require('../services/authService');
const databaseService = require('../services/databaseService');
const PlatformSettingsService = require('../services/platformSettingsService');
const router = express.Router();

// Initialiser le service de paramètres de plateforme
const platformSettingsService = new PlatformSettingsService();

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
    const { email, password, firstName, lastName, role } = req.body;
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
      lastName,
      role
    }, ipAddress);

    const responsePayload = {
      success: true,
      message: 'Utilisateur créé avec succès',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    };
    if (process.env.NODE_ENV !== 'production') {
      responsePayload.debug = { confirmationToken: user.confirmationToken };
    }
    res.status(201).json(responsePayload);

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
    } else if (error.message === 'Email ou mot de passe incorrect') {
      // Harmoniser le message combiné renvoyé par AuthService
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }
    
    const payload = { error: 'Erreur lors de la connexion' };
    if (process.env.NODE_ENV !== 'production') {
      payload.debug = {
        message: error.message,
        code: error.code,
        sql: error.sql,
        stack: error.stack
      };
    }
    res.status(500).json(payload);
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
    await databaseService.run(
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
    await databaseService.run(
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
      const rolesResult = await permissionsService.getUserRoles(user.id);
      const userRoles = Array.isArray(rolesResult) ? rolesResult : (rolesResult?.data || []);
      canAccessAgent = userRoles.some(role => ['agent', 'admin'].includes(role.name));
    }
    
    // Récupérer le statut d'abonnement de l'utilisateur
    let isPaid = false;
    if (companies && companies.length > 0) {
      try {
        const companyId = companies[0].id;
        const paidSetting = await platformSettingsService.getSetting(`company_paid_${companyId}`);
        isPaid = paidSetting && paidSetting.value === 'true';
      } catch (error) {
        console.warn('⚠️ Impossible de récupérer le statut d\'abonnement:', error);
        // En cas d'erreur, considérer comme gratuit par défaut
        isPaid = false;
      }
    }
    
    // Enrichir les informations utilisateur
    const enrichedUser = {
      ...user,
      isSuperAdmin,
      isPaid, // Ajouter le statut d'abonnement
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
    const { firstName, lastName, phone, bio, avatarUrl, email } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Prénom et nom requis' 
      });
    }

    // Gérer la mise à jour de l'email si fourni
    let newEmail = null;
    if (typeof email !== 'undefined' && email !== user.email) {
      const emailStr = String(email).trim();
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
      if (!isValid) {
        return res.status(400).json({ error: 'Format d\'email invalide' });
      }
      // Vérifier unicité
      const exists = await databaseService.get(
        'SELECT id FROM users WHERE email = ? AND id <> ?',
        [emailStr, user.id]
      );
      if (exists) {
        return res.status(409).json({ error: 'Cet email est déjà utilisé' });
      }
      newEmail = emailStr;
    }

    // Mettre à jour le profil avec les colonnes désormais présentes (phone, bio, avatar_url)
    await databaseService.run(
      'UPDATE users SET first_name = ?, last_name = ?, email = COALESCE(?, email), phone = COALESCE(?, phone), bio = COALESCE(?, bio), avatar_url = COALESCE(?, avatar_url), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [firstName, lastName, newEmail, phone ?? null, bio ?? null, avatarUrl ?? null, user.id]
    );

    // Log d'audit
    await databaseService.logAudit(
      user.id,
      null,
      'PROFILE_UPDATED',
      'users',
      { firstName, lastName, email: newEmail || user.email, phone, bio, avatarUrl },
      req.ip
    );

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: {
        ...user,
        firstName,
        lastName,
        email: newEmail || user.email,
        phone: phone ?? user.phone,
        bio: bio ?? user.bio,
        avatarUrl: avatarUrl ?? user.avatarUrl
      }
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour profil:', error);
    const isDev = process.env.NODE_ENV !== 'production';
    const payload = { error: 'Erreur lors de la mise à jour du profil' };
    if (isDev) {
      payload.details = error?.message || String(error);
    }
    res.status(500).json(payload);
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
    await databaseService.run(
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

    const sessions = await databaseService.query(
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
        tokenFull: session.session_token, // Utilisation interne (révocation)
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
 * DELETE /api/auth/sessions
 * Révoquer une session de l'utilisateur
 */
router.delete('/sessions', authService.authenticateMiddleware.bind(authService), async (req, res) => {
  try {
    const { user } = req;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token de session requis' });
    }

    const existing = await databaseService.get(
      'SELECT id FROM user_sessions WHERE user_id = ? AND session_token = ?',
      [user.id, token]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    await databaseService.run(
      'DELETE FROM user_sessions WHERE user_id = ? AND session_token = ?',
      [user.id, token]
    );

    await databaseService.logAudit(
      user.id,
      null,
      'SESSION_REVOKED',
      'user_sessions',
      { tokenPrefix: token.substring(0, 8) },
      req.ip
    );

    res.json({ success: true, message: 'Session révoquée' });
  } catch (error) {
    console.error('❌ Erreur révocation session:', error);
    res.status(500).json({ error: 'Erreur lors de la révocation de la session' });
  }
});

/**
 * PUT /api/auth/update-language
 * Mettre à jour la préférence de langue de l'utilisateur
 */
router.put('/update-language', authService.authenticateMiddleware.bind(authService), async (req, res) => {
  try {
    const { user } = req;
    const { language } = req.body;

    if (!language) {
      return res.status(400).json({ 
        error: 'La langue est requise' 
      });
    }

    // Validation de la langue (seulement fr et en supportés)
    if (!['fr', 'en'].includes(language)) {
      return res.status(400).json({ 
        error: 'Langue non supportée. Utilisez "fr" ou "en"' 
      });
    }

    // Mettre à jour la langue de l'utilisateur
    await databaseService.run(
      'UPDATE users SET language = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [language, user.id]
    );

    // Log d'audit
    await databaseService.logAudit(
      user.id,
      null,
      'LANGUAGE_UPDATED',
      'users',
      { language },
      req.ip
    );

    res.json({
      success: true,
      message: 'Langue mise à jour avec succès',
      language
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour langue:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la langue' });
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
      WHERE first_login_token = ? AND first_login_token_expires > NOW()
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

/**
 * GET /api/auth/preferences
 * Récupérer les préférences utilisateur
 */
router.get('/preferences', authService.authenticateMiddleware.bind(authService), async (req, res) => {
  try {
    const { user } = req;

    const preferences = await databaseService.get(
      'SELECT preferences FROM user_preferences WHERE user_id = ?',
      [user.id]
    );

    // Préférences par défaut si aucune n'existe
    const defaultPreferences = {
      darkMode: false,
      emailNotifications: true,
      language: 'fr',
      push: false,
      weekly: true,
      campaigns: true,
      emailFrequency: 'daily'
    };

    const userPreferences = preferences 
      ? { ...defaultPreferences, ...JSON.parse(preferences.preferences) }
      : defaultPreferences;

    res.json({
      success: true,
      preferences: userPreferences
    });

  } catch (error) {
    console.error('❌ Erreur récupération préférences:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des préférences' });
  }
});

/**
 * PUT /api/auth/preferences
 * Mettre à jour les préférences utilisateur
 */
router.put('/preferences', authService.authenticateMiddleware.bind(authService), async (req, res) => {
  try {
    const { user } = req;
    const body = req.body || {};

    const preferences = {
      darkMode: Boolean(body.darkMode),
      emailNotifications: Boolean(body.emailNotifications),
      language: body.language || 'fr',
      push: Boolean(body.push),
      weekly: Boolean(body.weekly),
      campaigns: Boolean(body.campaigns),
      emailFrequency: body.emailFrequency || 'daily'
    };

    // Vérifier si des préférences existent déjà
    const existingPrefs = await databaseService.get(
      'SELECT id FROM user_preferences WHERE user_id = ?',
      [user.id]
    );

    if (existingPrefs) {
      // Mettre à jour les préférences existantes
      await databaseService.run(
        'UPDATE user_preferences SET preferences = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [JSON.stringify(preferences), user.id]
      );
    } else {
      // Créer de nouvelles préférences
      await databaseService.run(
        'INSERT INTO user_preferences (user_id, preferences, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        [user.id, JSON.stringify(preferences)]
      );
    }

    // Log d'audit
    await databaseService.logAudit(
      user.id,
      null,
      'PREFERENCES_UPDATED',
      'user_preferences',
      preferences,
      req.ip
    );

    res.json({
      success: true,
      message: 'Préférences mises à jour avec succès',
      preferences
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour préférences:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des préférences' });
  }
});

module.exports = router;