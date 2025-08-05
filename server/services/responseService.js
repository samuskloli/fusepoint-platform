/**
 * Service de réponse standardisé
 * Centralise la gestion des réponses HTTP pour une cohérence dans l'API
 */

const translationService = require('./translationService');

class ResponseService {
  /**
   * Envoie une réponse de succès
   * @param {Object} res - Objet de réponse Express
   * @param {string} messageKey - Clé de traduction du message
   * @param {Object} data - Données à retourner
   * @param {number} statusCode - Code de statut HTTP (défaut: 200)
   * @param {Object} messageParams - Paramètres pour l'interpolation du message
   */
  success(res, messageKey, data = null, statusCode = 200, messageParams = {}) {
    const response = {
      success: true,
      message: translationService.t(messageKey, messageParams)
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Envoie une réponse d'erreur
   * @param {Object} res - Objet de réponse Express
   * @param {string} messageKey - Clé de traduction du message d'erreur
   * @param {number} statusCode - Code de statut HTTP (défaut: 400)
   * @param {Object} messageParams - Paramètres pour l'interpolation du message
   * @param {Array} errors - Liste détaillée des erreurs
   */
  error(res, messageKey, statusCode = 400, messageParams = {}, errors = null) {
    const response = {
      success: false,
      message: translationService.t(messageKey, messageParams)
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Envoie une réponse de validation échouée
   * @param {Object} res - Objet de réponse Express
   * @param {Array} validationErrors - Liste des erreurs de validation
   */
  validationError(res, validationErrors) {
    return this.error(
      res,
      'errors.validationError',
      400,
      {},
      validationErrors
    );
  }

  /**
   * Envoie une réponse d'accès non autorisé
   * @param {Object} res - Objet de réponse Express
   * @param {string} customMessageKey - Clé de message personnalisée (optionnel)
   */
  unauthorized(res, customMessageKey = 'errors.unauthorized') {
    return this.error(res, customMessageKey, 401);
  }

  /**
   * Envoie une réponse d'accès interdit
   * @param {Object} res - Objet de réponse Express
   * @param {string} customMessageKey - Clé de message personnalisée (optionnel)
   */
  forbidden(res, customMessageKey = 'errors.forbidden') {
    return this.error(res, customMessageKey, 403);
  }

  /**
   * Envoie une réponse de ressource non trouvée
   * @param {Object} res - Objet de réponse Express
   * @param {string} customMessageKey - Clé de message personnalisée (optionnel)
   */
  notFound(res, customMessageKey = 'errors.notFound') {
    return this.error(res, customMessageKey, 404);
  }

  /**
   * Envoie une réponse d'erreur serveur
   * @param {Object} res - Objet de réponse Express
   * @param {Error} error - Objet d'erreur
   * @param {string} customMessageKey - Clé de message personnalisée (optionnel)
   */
  serverError(res, error = null, customMessageKey = 'errors.serverError') {
    // Log de l'erreur pour le débogage
    if (error) {
      console.error('❌ Erreur serveur:', error);
    }

    const response = {
      success: false,
      message: translationService.t(customMessageKey)
    };

    // En mode développement, inclure les détails de l'erreur
    if (process.env.NODE_ENV === 'development' && error) {
      response.error = error.message;
      response.stack = error.stack;
    }

    return res.status(500).json(response);
  }

  /**
   * Envoie une réponse de création réussie
   * @param {Object} res - Objet de réponse Express
   * @param {string} messageKey - Clé de traduction du message
   * @param {Object} data - Données créées
   * @param {Object} messageParams - Paramètres pour l'interpolation du message
   */
  created(res, messageKey, data, messageParams = {}) {
    return this.success(res, messageKey, data, 201, messageParams);
  }

  /**
   * Envoie une réponse de mise à jour réussie
   * @param {Object} res - Objet de réponse Express
   * @param {string} messageKey - Clé de traduction du message
   * @param {Object} data - Données mises à jour
   * @param {Object} messageParams - Paramètres pour l'interpolation du message
   */
  updated(res, messageKey, data, messageParams = {}) {
    return this.success(res, messageKey, data, 200, messageParams);
  }

  /**
   * Envoie une réponse de suppression réussie
   * @param {Object} res - Objet de réponse Express
   * @param {string} messageKey - Clé de traduction du message
   * @param {Object} messageParams - Paramètres pour l'interpolation du message
   */
  deleted(res, messageKey, messageParams = {}) {
    return this.success(res, messageKey, null, 200, messageParams);
  }

  /**
   * Envoie une réponse avec des données paginées
   * @param {Object} res - Objet de réponse Express
   * @param {Array} items - Liste des éléments
   * @param {Object} pagination - Informations de pagination
   * @param {string} messageKey - Clé de traduction du message
   */
  paginated(res, items, pagination, messageKey) {
    const data = {
      items,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        total: pagination.total || items.length,
        totalPages: Math.ceil((pagination.total || items.length) / (pagination.limit || 10))
      }
    };

    return this.success(res, messageKey, data);
  }

  /**
   * Envoie une réponse avec des statistiques
   * @param {Object} res - Objet de réponse Express
   * @param {Object} stats - Données statistiques
   * @param {string} messageKey - Clé de traduction du message
   */
  stats(res, stats, messageKey = 'agent.statsRetrieved') {
    return this.success(res, messageKey, stats);
  }
}

module.exports = new ResponseService();