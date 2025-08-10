import express, { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, LoginRequest, RegisterRequest, ApiResponse, RouteHandler } from '../types/routes';

const authService = require('../services/authService');
const databaseService = require('../services/databaseService');
const router: Router = express.Router();

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
const registerHandler: RouteHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName }: RegisterRequest = req.body;
    const ipAddress = req.ip;

    // Validation des données
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ 
        error: 'Tous les champs sont requis',
        fields: ['email', 'password', 'firstName', 'lastName']
      });
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Format d\'email invalide' });
      return;
    }

    // Validation mot de passe
    if (password.length < 8) {
      res.status(400).json({ 
        error: 'Le mot de passe doit contenir au moins 8 caractères' 
      });
      return;
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

  } catch (error: any) {
    console.error('❌ Erreur inscription:', error);
    
    if (error.message.includes('existe déjà')) {
      res.status(409).json({ error: error.message });
      return;
    }
    
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
};

router.post('/register', registerHandler);

/**
 * POST /api/auth/login
 * Connexion utilisateur
 */
const loginHandler: RouteHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');
    const contentType = req.get('Content-Type');
    const origin = req.get('Origin');
    
    if (!email || !password) {
      res.status(400).json({ 
        success: false, 
        message: 'Email et mot de passe requis' 
      });
      return;
    }

    const loginResult = await authService.login(email, password, ipAddress, userAgent);
    
    res.json({
      success: true,
      message: 'Connexion réussie',
      ...loginResult
    });

  } catch (error: any) {
    console.error('❌ Erreur connexion:', error);
    
    if (error.message === 'Compte inexistant') {
      res.status(401).json({ error: 'Compte inexistant' });
      return;
    } else if (error.message === 'Mot de passe incorrect') {
      res.status(401).json({ error: 'Mot de passe incorrect' });
      return;
    }
    
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
};

router.post('/login', loginHandler);

/**
 * POST /api/auth/refresh
 * Rafraîchir le token d'accès
 */
const refreshHandler: RouteHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken }: { refreshToken: string } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Token de rafraîchissement requis' });
      return;
    }

    const result = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      ...result
    });

  } catch (error: any) {
    console.error('❌ Erreur rafraîchissement:', error);
    res.status(401).json({ error: 'Token de rafraîchissement invalide' });
  }
};

router.post('/refresh', refreshHandler);

/**
 * POST /api/auth/logout
 * Déconnexion utilisateur
 */
const logoutHandler: RouteHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { sessionToken }: { sessionToken: string } = req.body;

    await authService.logout(sessionToken);

    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });

  } catch (error: any) {
    console.error('❌ Erreur déconnexion:', error);
    res.status(500).json({ error: 'Erreur lors de la déconnexion' });
  }
};

router.post('/logout', logoutHandler);

/**
 * GET /api/auth/confirm/:token
 * Confirmer un compte utilisateur
 */
const confirmHandler: RouteHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.params as { token: string };

    if (!token) {
      res.status(400).json({ error: 'Token de confirmation requis' });
      return;
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

  } catch (error: any) {
    console.error('❌ Erreur confirmation compte:', error);
    
    if (error.message.includes('invalide') || error.message.includes('expiré')) {
      res.status(400).json({ error: error.message });
      return;
    }
    
    res.status(500).json({ error: 'Erreur lors de la confirmation du compte' });
  }
};

router.get('/confirm/:token', confirmHandler);

/**
 * POST /api/auth/forgot-password
 * Demande de réinitialisation de mot de passe
 */
const forgotPasswordHandler: RouteHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email }: { email: string } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email requis' });
      return;
    }

    await authService.requestPasswordReset(email);

    res.json({
      success: true,
      message: 'Email de réinitialisation envoyé'
    });

  } catch (error: any) {
    console.error('❌ Erreur mot de passe oublié:', error);
    res.status(500).json({ error: 'Erreur lors de la demande de réinitialisation' });
  }
};

router.post('/forgot-password', forgotPasswordHandler);

/**
 * POST /api/auth/reset-password
 * Réinitialisation du mot de passe
 */
const resetPasswordHandler: RouteHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { token, newPassword }: { token: string; newPassword: string } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: 'Token et nouveau mot de passe requis' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ 
        error: 'Le mot de passe doit contenir au moins 8 caractères' 
      });
      return;
    }

    await authService.resetPassword(token, newPassword);

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error: any) {
    console.error('❌ Erreur réinitialisation:', error);
    
    if (error.message.includes('invalide') || error.message.includes('expiré')) {
      res.status(400).json({ error: error.message });
      return;
    }
    
    res.status(500).json({ error: 'Erreur lors de la réinitialisation' });
  }
};

router.post('/reset-password', resetPasswordHandler);

export default router;
module.exports = router;