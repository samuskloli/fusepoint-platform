import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, DatabaseService, AuthService as IAuthService, ServiceResponse } from '../types';

const databaseService = require('./databaseService');

interface LoginResult {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    onboarding_completed: boolean;
  };
  companies: any[];
  tokens: {
    accessToken: string;
    refreshToken: string;
    sessionToken: string;
  };
  expiresAt: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * Service d'authentification sécurisé
 * Gère les JWT tokens, sessions et autorisations
 */
class AuthService implements IAuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private refreshTokenExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || this.generateJwtSecret();
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  }

  /**
   * Générer un secret JWT
   */
  private generateJwtSecret(): string {
    const secret = crypto.randomBytes(64).toString('hex');
    console.log('🔑 Secret JWT généré. Ajoutez JWT_SECRET à votre .env');
    return secret;
  }

  /**
   * Générer un token JWT
   */
  private generateToken(payload: object, expiresIn: string | number = this.jwtExpiresIn): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn } as jwt.SignOptions);
  }

  /**
   * Vérifier un token JWT
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Token invalide ou expiré');
    }
  }

  /**
   * Générer un token de session
   */
  private generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Connexion utilisateur
   */
  async login(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<{ user: User; token: string }> {
    try {
      // Authentifier l'utilisateur
      const user = await databaseService.authenticateUser(email, password);
      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Récupérer la première entreprise de l'utilisateur pour le token
      const userCompanies = await databaseService.getUserCompanies(user.id);
      const primaryCompanyId = userCompanies.length > 0 ? userCompanies[0].id : null;

      // Générer les tokens
      const accessToken = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        company_id: primaryCompanyId
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

      return {
        user,
        token: accessToken
      };
    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      throw error;
    }
  }

  /**
   * Inscription utilisateur
   */
  async register(userData: RegisterData, ipAddress?: string): Promise<User> {
    try {
      const { email, password, firstName, lastName } = userData;

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
        lastName
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
   * Hacher un mot de passe
   */
  async hashPassword(password: string): Promise<string> {
    const bcrypt = require('bcrypt');
    return await bcrypt.hash(password, 12);
  }

  /**
   * Comparer un mot de passe
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(password, hash);
  }

  /**
   * Notifier les agents qu'un nouvel utilisateur s'est inscrit sans agent attribué
   */
  private async notifyAgentsNewUserWithoutAgent(user: User): Promise<void> {
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

      // Créer une notification pour chaque agent
      for (const agent of agents) {
        try {
          await accompagnementService.createNotification({
            user_id: agent.id,
            title: 'Nouvel utilisateur sans agent',
            message: `Un nouvel utilisateur (${user.firstName} ${user.lastName} - ${user.email}) s'est inscrit et n'a pas encore d'agent attribué.`,
            type: 'info',
            action_url: `/admin/users/${user.id}`,
            priority: 'medium'
          });
        } catch (notifError) {
          console.error(`⚠️ Erreur création notification pour agent ${agent.id}:`, notifError);
        }
      }

      console.log(`✅ Notifications envoyées à ${agents.length} agents`);
    } catch (error) {
      console.error('❌ Erreur notification agents:', error);
      throw error;
    }
  }
}

module.exports = AuthService;