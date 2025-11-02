const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const databaseService = require('./databaseService');
const PlatformSettingsService = require('./platformSettingsService');

/**
 * Service d'authentification sécurisé
 * Gère les JWT tokens, sessions et autorisations
 */
class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || this.generateJwtSecret();
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
    this.platformSettingsService = new PlatformSettingsService();
  }

  /**
   * Générer un secret JWT
   */
  generateJwtSecret() {
    const secret = crypto.randomBytes(64).toString('hex');
    console.log('🔑 Secret JWT généré. Ajoutez JWT_SECRET à votre .env');
    return secret;
  }

  /**
   * Générer un token JWT
   */
  generateToken(payload, expiresIn = this.jwtExpiresIn) {
    return jwt.sign(payload, this.jwtSecret, { expiresIn });
  }

  /**
   * Vérifier un token JWT
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Token invalide ou expiré');
    }
  }

  /**
   * Générer un token de session
   */
  generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Connexion utilisateur
   */
  async login(email, password, ipAddress, userAgent) {
    try {
      // Authentifier l'utilisateur
      const user = await databaseService.authenticateUser(email, password);
      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Récupérer la company_id de l'utilisateur (soit depuis user.company_id, soit depuis user_companies)
      let primaryCompanyId = user.company_id; // Utiliser d'abord la company_id directe
      
      if (!primaryCompanyId) {
        // Fallback: chercher dans user_companies si pas de company_id directe
        const userCompanies = await databaseService.getUserCompanies(user.id);
        primaryCompanyId = userCompanies.length > 0 ? userCompanies[0].id : null;
      }

      // Générer les tokens
      const accessToken = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        company_id: primaryCompanyId,
        tenantId: primaryCompanyId // Pour la compatibilité multi-tenant
      });

      const refreshToken = this.generateToken({
        userId: user.id,
        type: 'refresh'
      }, this.refreshTokenExpiresIn);

      const sessionToken = this.generateSessionToken();

      // Calculer l'expiration du token JWT (24h par défaut)
      const tokenExpiresAt = new Date();
      if (this.jwtExpiresIn.endsWith('h')) {
        const hours = parseInt(this.jwtExpiresIn.replace('h', ''));
        tokenExpiresAt.setHours(tokenExpiresAt.getHours() + hours);
      } else if (this.jwtExpiresIn.endsWith('d')) {
        const days = parseInt(this.jwtExpiresIn.replace('d', ''));
        tokenExpiresAt.setDate(tokenExpiresAt.getDate() + days);
      } else {
        // Par défaut 24h
        tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24);
      }

      // Calculer l'expiration de la session (7 jours)
      const sessionExpiresAt = new Date();
      sessionExpiresAt.setDate(sessionExpiresAt.getDate() + 7); // 7 jours

      // Créer la session en base
      await databaseService.createSession(
        user.id,
        sessionToken,
        sessionExpiresAt.toISOString().slice(0, 19).replace('T', ' '),
        ipAddress,
        userAgent
      );

      // Récupérer les entreprises de l'utilisateur
      const companies = await databaseService.getUserCompanies(user.id);

      // Récupérer le statut d'abonnement de l'utilisateur
      let isPaid = false;
      if (companies && companies.length > 0) {
        try {
          const companyId = companies[0].id;
          const paidSetting = await this.platformSettingsService.getSetting(`company_paid_${companyId}`);
          isPaid = paidSetting && paidSetting.value === 'true';
        } catch (error) {
          console.warn('⚠️ Impossible de récupérer le statut d\'abonnement lors du login:', error);
          // En cas d'erreur, considérer comme gratuit par défaut
          isPaid = false;
        }
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          onboarding_completed: user.onboarding_completed,
          isPaid // Ajouter le statut d'abonnement
        },
        companies,
        tokens: {
          accessToken,
          refreshToken,
          sessionToken
        },
        expiresAt: tokenExpiresAt.toISOString()
      };
    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      throw error;
    }
  }

  /**
   * Inscription utilisateur
   */
  async register(userData, ipAddress) {
    try {
      const { email, password, firstName, lastName, role } = userData;

      // Validation des données
      if (!email || !password || !firstName || !lastName) {
        throw new Error('Tous les champs sont requis');
      }

      if (password.length < 8) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères');
      }

      // Créer l'utilisateur
      const user = await databaseService.createUser({
        email,
        password,
        firstName,
        lastName,
        role
      });

      // Log d'audit
      await databaseService.logAudit(
        user.id,
        null,
        'USER_REGISTERED',
        'users',
        { email },
        ipAddress
      );

      // Notifier les agents qu'un nouvel utilisateur s'est inscrit sans agent attribué
      try {
        await this.notifyAgentsNewUserWithoutAgent(user);
      } catch (notificationError) {
        console.error('⚠️ Erreur notification agents:', notificationError);
        // Ne pas faire échouer l'inscription si la notification échoue
      }

      return user;
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      throw error;
    }
  }

  /**
   * Notifier les agents qu'un nouvel utilisateur s'est inscrit sans agent attribué
   */
  async notifyAgentsNewUserWithoutAgent(user) {
    try {
      // Récupérer tous les agents actifs
      const agents = await databaseService.query(
        'SELECT id, email, first_name, last_name FROM users WHERE role IN ("agent", "admin") AND is_active = 1'
      );

      if (agents.length === 0) {
        console.log('ℹ️ Aucun agent actif trouvé pour la notification');
        return;
      }

      // Importer les services nécessaires
      const EmailService = require('./emailService');
      const AccompagnementService = require('./accompagnementService');
      const emailService = new EmailService();
      const accompagnementService = new AccompagnementService();

      // Envoyer une notification à chaque agent
      for (const agent of agents) {
        try {
          // Envoyer l'email de notification
          await emailService.sendNotification(
            agent.email,
            `${agent.first_name} ${agent.last_name}`,
            'info',
            '👤 Nouvel utilisateur sans agent attribué',
            `Un nouvel utilisateur s'est inscrit sur la plateforme :\n\n` +
            `**Nom :** ${user.firstName} ${user.lastName}\n` +
            `**Email :** ${user.email}\n` +
            `**Date d'inscription :** ${new Date().toLocaleDateString('fr-FR')}\n\n` +
            `Cet utilisateur n'a pas encore d'agent attribué. Vous pouvez lui assigner un agent depuis la page de gestion des clients.`,
            `${process.env.FRONTEND_URL || 'http://localhost:5173'}/agent/clients`
          );
          
          // Créer une notification dans la plateforme
          await accompagnementService.createNotification({
            user_id: agent.id,
            company_id: null,
            type: 'user_assignment',
            title: '👤 Nouvel utilisateur sans agent',
            message: `${user.firstName} ${user.lastName} (${user.email}) s'est inscrit et n'a pas d'agent attribué.`,
            data: {
              new_user_id: user.id,
              new_user_email: user.email,
              new_user_name: `${user.firstName} ${user.lastName}`,
              registration_date: new Date().toISOString()
            },
            action_url: '/agent/clients'
          });
          
          console.log(`✅ Notification email et plateforme envoyées à l'agent ${agent.email}`);
        } catch (emailError) {
          console.error(`❌ Erreur envoi notification à ${agent.email}:`, emailError);
        }
      }

      console.log(`📧 Notifications envoyées à ${agents.length} agent(s) pour le nouvel utilisateur ${user.email}`);
    } catch (error) {
      console.error('❌ Erreur notification agents:', error);
      throw error;
    }
  }

  /**
   * Rafraîchir un token
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = this.verifyToken(refreshToken);
      
      if (decoded.type !== 'refresh') {
        throw new Error('Token de rafraîchissement invalide');
      }

      // Récupérer l'utilisateur
      const user = await databaseService.get(
        'SELECT * FROM users WHERE id = ? AND is_active = 1',
        [decoded.userId]
      );

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Récupérer la company_id de l'utilisateur (soit depuis user.company_id, soit depuis user_companies)
      let primaryCompanyId = user.company_id; // Utiliser d'abord la company_id directe
      
      if (!primaryCompanyId) {
        // Fallback: chercher dans user_companies si pas de company_id directe
        const userCompanies = await databaseService.getUserCompanies(user.id);
        primaryCompanyId = userCompanies.length > 0 ? userCompanies[0].id : null;
      }

      // Générer un nouveau token d'accès
      const newAccessToken = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        company_id: primaryCompanyId,
        tenantId: primaryCompanyId // Pour la compatibilité multi-tenant
      });

      // Calculer la nouvelle expiration du token
      const tokenExpiresAt = new Date();
      if (this.jwtExpiresIn.endsWith('h')) {
        const hours = parseInt(this.jwtExpiresIn.replace('h', ''));
        tokenExpiresAt.setHours(tokenExpiresAt.getHours() + hours);
      } else if (this.jwtExpiresIn.endsWith('d')) {
        const days = parseInt(this.jwtExpiresIn.replace('d', ''));
        tokenExpiresAt.setDate(tokenExpiresAt.getDate() + days);
      } else {
        // Par défaut 24h
        tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24);
      }

      return {
        accessToken: newAccessToken,
        expiresAt: tokenExpiresAt.toISOString(),
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        }
      };
    } catch (error) {
      console.error('❌ Erreur rafraîchissement token:', error);
      throw error;
    }
  }

  /**
   * Déconnexion
   */
  async logout(sessionToken) {
    try {
      if (sessionToken) {
        await databaseService.deleteSession(sessionToken);
      }
      return true;
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      throw error;
    }
  }

  /**
   * Middleware d'authentification
   */
  async authenticateMiddleware(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token d\'authentification requis' });
      }

      const token = authHeader.substring(7);
      const decoded = this.verifyToken(token);

      // Récupérer l'utilisateur complet
      const user = await databaseService.get(
        'SELECT * FROM users WHERE id = ? AND is_active = 1',
        [decoded.userId]
      );

      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé' });
      }

      // Ajouter les informations utilisateur à la requête
      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      };

      next();
    } catch (error) {
      console.error('❌ Erreur authentification middleware:', error);
      return res.status(401).json({ error: 'Token invalide' });
    }
  }

  /**
   * Middleware de vérification des permissions
   */
  async checkPermissions(requiredPermissions = []) {
    return async (req, res, next) => {
      try {
        const { user } = req;
        const { companyId } = req.params || req.body;

        if (!user) {
          return res.status(401).json({ error: 'Authentification requise' });
        }

        // Admin global a tous les droits
        if (user.role === 'admin') {
          return next();
        }

        // Si une entreprise est spécifiée, vérifier les permissions
        if (companyId) {
          const userCompany = await databaseService.get(
            'SELECT * FROM user_companies WHERE user_id = ? AND company_id = ?',
            [user.id, companyId]
          );

          if (!userCompany) {
            return res.status(403).json({ error: 'Accès refusé à cette entreprise' });
          }

          const permissions = JSON.parse(userCompany.permissions || '{}');
          
          // Vérifier les permissions requises
          for (const permission of requiredPermissions) {
            if (!permissions[permission]) {
              return res.status(403).json({ 
                error: `Permission '${permission}' requise` 
              });
            }
          }

          // Ajouter les informations de l'entreprise à la requête
          req.userCompany = userCompany;
          req.permissions = permissions;
        }

        next();
      } catch (error) {
        console.error('❌ Erreur vérification permissions:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
    };
  }

  /**
   * Valider une session par token
   */
  async validateSession(sessionToken) {
    try {
      const session = await databaseService.validateSession(sessionToken);
      return session;
    } catch (error) {
      console.error('❌ Erreur validation session:', error);
      throw error;
    }
  }

  /**
   * Nettoyer les sessions expirées
   */
  async cleanupExpiredSessions() {
    try {
      await databaseService.run(
        'DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP'
      );
      console.log('🧹 Sessions expirées nettoyées');
    } catch (error) {
      console.error('❌ Erreur nettoyage sessions:', error);
    }
  }
}

module.exports = new AuthService();