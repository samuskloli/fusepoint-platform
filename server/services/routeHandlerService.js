/**
 * Service de gestion des handlers de routes
 * Centralise la logique répétitive des routes pour réduire la duplication de code
 */

const translationService = require('./translationService');
const validationService = require('./validationService');
const responseService = require('./responseService');
const languageService = require('./languageService');

class RouteHandlerService {
  /**
   * Wrapper générique pour les routes avec gestion d'erreurs standardisée
   * @param {Function} handler - Fonction handler de la route
   * @param {Object} options - Options de configuration
   * @returns {Function} - Handler Express middleware
   */
  static asyncHandler(handler, options = {}) {
    return async (req, res, next) => {
      try {
        await handler(req, res, next);
      } catch (error) {
        this.handleError(error, res, options);
      }
    };
  }

  /**
   * Gestion centralisée des erreurs
   * @param {Error} error - Erreur à traiter
   * @param {Object} res - Objet response Express
   * @param {Object} options - Options de gestion d'erreur
   */
  static handleError(error, res, options = {}) {
    try {
      const { logKey = 'error', errorKey = 'errors.serverError' } = options;
      
      console.error('❌ Erreur dans RouteHandlerService:', error.message);
      
      // Vérifier si la réponse a déjà été envoyée
      if (res.headersSent) {
        console.error('❌ Réponse déjà envoyée, impossible de gérer l\'erreur');
        return;
      }
      
      // Gestion des erreurs spécifiques
      if (error.message === 'Client not found') {
        return responseService.notFound(res, 'Client non trouvé');
      }
      if (error.message === 'Agent not found') {
        return responseService.notFound(res, 'Agent non trouvé');
      }
      if (error.message === 'Project not found' || error.message === 'Projet non trouvé') {
        return responseService.notFound(res, 'Projet non trouvé');
      }
      if (error.code === 'CLIENT_NOT_FOUND') {
        return responseService.notFound(res, 'Client non trouvé');
      }
      if (error.code === 'AGENT_NOT_FOUND') {
        return responseService.notFound(res, 'Agent non trouvé');
      }
      if (error.code === 'EMAIL_ALREADY_EXISTS') {
        return responseService.badRequest(res, 'Cet email est déjà utilisé');
      }
      if (error.code === 'INVALID_PASSWORD') {
        return responseService.badRequest(res, 'Mot de passe invalide');
      }
      if (error.code === 'ACCESS_DENIED') {
        return responseService.forbidden(res, 'Accès refusé');
      }
      if (error.code === 'INVALID_STATUS') {
        return responseService.badRequest(res, 'Statut invalide');
      }
      if (error.code === 'VALIDATION_ERROR') {
        return responseService.validationError(res, error.message);
      }
      
      // Erreur générique
      console.error('❌ Erreur non gérée:', error);
      return responseService.serverError(res, error, errorKey);
    } catch (handlerError) {
      console.error('❌ Erreur dans le gestionnaire d\'erreurs:', handlerError);
      // Fallback en cas d'erreur dans le gestionnaire d'erreurs
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Erreur interne du serveur'
        });
      }
    }
  }

  /**
   * Validation d'ID avec gestion d'erreur standardisée
   * @param {string} id - ID à valider
   * @param {Object} res - Objet response Express
   * @param {string} fieldName - Nom du champ pour les messages d'erreur
   * @returns {string|null} - ID validé ou null si erreur
   */
  static validateId(id, res, fieldName = 'ID') {
    const validation = validationService.validateId(id);
    if (!validation.isValid) {
      responseService.badRequest(res, 'Données invalides', null, validation.message);
      return null;
    }
    return id;
  }

  /**
   * Validation d'email avec gestion d'erreur standardisée
   * @param {string} email - Email à valider
   * @param {Object} res - Objet response Express
   * @returns {boolean} - True si valide, false sinon
   */
  static validateEmail(email, res) {
    if (!validationService.isValidEmail(email)) {
      responseService.validationError(res, 'Email invalide');
      return false;
    }
    return true;
  }

  /**
   * Validation des champs requis
   * @param {Object} fields - Objet avec les champs à valider
   * @param {Object} res - Objet response Express
   * @returns {boolean} - True si tous les champs sont présents, false sinon
   */
  static validateRequiredFields(fields, res) {
    const missingFields = Object.entries(fields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);
    
    if (missingFields.length > 0) {
      responseService.validationError(res, 'Champs requis manquants');
      return false;
    }
    return true;
  }

  /**
   * Middleware de validation des champs requis
   * @param {Array} requiredFields - Tableau des noms de champs requis
   * @returns {Function} - Middleware Express
   */
  static validateRequiredFieldsMiddleware(requiredFields) {
    return (req, res, next) => {
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return responseService.validationError(res, 'Champs requis manquants', {
          missingFields
        });
      }
      next();
    };
  }

  /**
   * Log standardisé pour les opérations
   * @param {string} operation - Type d'opération
   * @param {Object} data - Données à logger
   */
  static logOperation(operation, data = {}) {
    console.log(`ℹ️ Opération ${operation}:`, data);
  }

  /**
   * Réponse de succès standardisée
   * @param {Object} res - Objet response Express
   * @param {*} data - Données à retourner
   * @param {string} messageKey - Clé du message de succès
   */
  static successResponse(res, data, messageKey = 'Données récupérées avec succès') {
    return responseService.success(res, messageKey, data);
  }

  /**
   * Middleware de validation d'ID pour les paramètres de route
   * @param {string} paramName - Nom du paramètre à valider
   * @returns {Function} - Middleware Express
   */
  static validateIdParam(paramName) {
    return (req, res, next) => {
      const id = req.params[paramName];
      const validatedId = this.validateId(id, res, paramName);
      if (validatedId === null) {
        return; // L'erreur a déjà été envoyée
      }
      req.validatedParams = req.validatedParams || {};
      req.validatedParams[paramName] = validatedId;
      next();
    };
  }

  /**
   * Créer un handler CRUD standardisé
   * @param {Object} service - Service à utiliser
   * @param {string} method - Méthode du service à appeler
   * @param {Object} options - Options de configuration
   * @returns {Function} - Handler Express
   */
  static createCrudHandler(service, method, options = {}) {
    const { 
      logOperation: logOp,
      successMessage = 'success.retrieved',
      errorMessage = 'errors.serverError',
      extractParams = (req) => [req.params.id],
      extractBody = (req) => req.body
    } = options;

    return this.asyncHandler(async (req, res) => {
      if (logOp) {
        this.logOperation(logOp, { userId: req.user?.id, params: req.params });
      }

      const params = extractParams(req);
      const body = extractBody(req);
      
      const result = await service[method](...params, body);
      
      this.successResponse(res, result, successMessage);
    }, { errorKey: errorMessage });
  }
}

module.exports = RouteHandlerService;