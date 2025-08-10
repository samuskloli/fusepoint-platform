import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, Middleware } from '../types/routes';

interface JWTPayload {
  id?: number;
  userId?: number;
  email: string;
  role: string;
  company_id?: number;
}

/**
 * Middleware d'authentification JWT
 * Vérifie la validité du token d'accès dans les en-têtes de la requête
 */
const authMiddleware: Middleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    // Ignorer les requêtes OPTIONS (preflight CORS)
    if (req.method === 'OPTIONS') {
      return next();
    }
    
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token d\'authentification requis'
      });
      return;
    }

    // Extraire le token
    const token = authHeader.substring(7); // Enlever "Bearer "
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token manquant'
      });
      return;
    }

    // Vérifier le token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // Ajouter les informations utilisateur à la requête
    req.user = {
      id: decoded.id || decoded.userId || 0, // Support des deux formats
      email: decoded.email,
      password: '', // Non utilisé dans le middleware
      role: decoded.role as 'admin' | 'agent' | 'client' | 'prestataire' | 'super_admin',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    req.userId = decoded.id || decoded.userId;
    req.userRole = decoded.role;
    
    next();
    
  } catch (error: any) {
    console.error('Erreur authentification:', error);
    
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
      return;
    }
    
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token expiré'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'authentification'
    });
  }
};

export default authMiddleware;
module.exports = authMiddleware;