// Utilitaires de validation et gestion d'erreurs
// Fusepoint Hub - Google Analytics Proxy

const config = require('../config/server.config');

/**
 * Valide un ID de propriété GA4
 * @param {string} propertyId - L'ID de propriété à valider
 * @returns {boolean} - True si valide
 */
function validatePropertyId(propertyId) {
  if (!propertyId || typeof propertyId !== 'string') {
    return false;
  }
  
  // Format GA4: nombres uniquement
  return /^\d+$/.test(propertyId.trim());
}

/**
 * Valide une date au format YYYY-MM-DD
 * @param {string} date - La date à valider
 * @returns {boolean} - True si valide
 */
function validateDate(date) {
  if (!date || typeof date !== 'string') {
    return false;
  }
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }
  
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
}

/**
 * Valide une plage de dates
 * @param {string} startDate - Date de début
 * @param {string} endDate - Date de fin
 * @returns {object} - Résultat de validation
 */
function validateDateRange(startDate, endDate) {
  const result = {
    isValid: true,
    errors: []
  };
  
  if (!validateDate(startDate)) {
    result.isValid = false;
    result.errors.push('Date de début invalide (format requis: YYYY-MM-DD)');
  }
  
  if (!validateDate(endDate)) {
    result.isValid = false;
    result.errors.push('Date de fin invalide (format requis: YYYY-MM-DD)');
  }
  
  if (result.isValid) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    if (start > end) {
      result.isValid = false;
      result.errors.push('La date de début doit être antérieure à la date de fin');
    }
    
    if (end > today) {
      result.isValid = false;
      result.errors.push('La date de fin ne peut pas être dans le futur');
    }
    
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (daysDiff > config.limits.maxDateRange) {
      result.isValid = false;
      result.errors.push(`La plage de dates ne peut pas dépasser ${config.limits.maxDateRange} jours`);
    }
  }
  
  return result;
}

/**
 * Middleware de validation pour les requêtes analytics
 * @param {object} requiredFields - Champs requis
 * @returns {function} - Middleware Express
 */
function validateAnalyticsRequest(requiredFields = []) {
  return (req, res, next) => {
    const errors = [];
    
    // Vérifier les champs requis
    for (const field of requiredFields) {
      if (!req.body[field]) {
        errors.push(`Le champ '${field}' est requis`);
      }
    }
    
    // Validation spécifique pour propertyId
    if (req.body.propertyId && !validatePropertyId(req.body.propertyId)) {
      errors.push('ID de propriété GA4 invalide (doit contenir uniquement des chiffres)');
    }
    
    // Validation des dates si présentes
    if (req.body.startDate || req.body.endDate) {
      if (!req.body.startDate || !req.body.endDate) {
        errors.push('Les dates de début et de fin sont toutes deux requises');
      } else {
        const dateValidation = validateDateRange(req.body.startDate, req.body.endDate);
        if (!dateValidation.isValid) {
          errors.push(...dateValidation.errors);
        }
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        error: config.errorMessages.badRequest,
        details: errors
      });
    }
    
    next();
  };
}

/**
 * Gestionnaire d'erreurs Google Analytics
 * @param {Error} error - L'erreur à traiter
 * @returns {object} - Réponse d'erreur formatée
 */
function handleGoogleAnalyticsError(error) {
  console.error('Erreur Google Analytics:', error);
  
  let statusCode = 500;
  let message = config.errorMessages.internalError;
  
  if (error.code === 404) {
    statusCode = 404;
    message = config.errorMessages.propertyNotFound;
  } else if (error.code === 403) {
    statusCode = 403;
    message = config.errorMessages.accessDenied;
  } else if (error.code === 400) {
    statusCode = 400;
    message = config.errorMessages.badRequest;
  }
  
  return {
    statusCode,
    error: message,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  };
}

/**
 * Sanitise les données de sortie
 * @param {any} data - Données à sanitiser
 * @returns {any} - Données sanitisées
 */
function sanitizeOutput(data) {
  if (Array.isArray(data)) {
    return data.map(sanitizeOutput);
  }
  
  if (data && typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      // Éviter les propriétés sensibles
      if (!key.toLowerCase().includes('password') && 
          !key.toLowerCase().includes('secret') &&
          !key.toLowerCase().includes('token')) {
        sanitized[key] = sanitizeOutput(value);
      }
    }
    return sanitized;
  }
  
  return data;
}

module.exports = {
  validatePropertyId,
  validateDate,
  validateDateRange,
  validateAnalyticsRequest,
  handleGoogleAnalyticsError,
  sanitizeOutput
};