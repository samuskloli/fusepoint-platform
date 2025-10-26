/**
 * Service de validation
 * Centralise toutes les validations de données pour la réutilisabilité
 */

const translationService = require('./translationService');

class ValidationService {
  /**
   * Valide un email
   * @param {string} email - Email à valider
   * @returns {Object} - {isValid: boolean, message: string}
   */
  validateEmail(email) {
    if (!email) {
      return {
        isValid: false,
        message: translationService.t('validation.required')
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        message: translationService.t('validation.invalidEmail')
      };
    }

    return { isValid: true, message: null };
  }

  /**
   * Valide un numéro de téléphone
   * @param {string} phone - Numéro de téléphone à valider
   * @returns {Object} - {isValid: boolean, message: string}
   */
  validatePhone(phone) {
    if (!phone) {
      return { isValid: true, message: null }; // Téléphone optionnel
    }

    const phoneRegex = /^[+]?[0-9\s\-\(\)]{8,}$/;
    if (!phoneRegex.test(phone)) {
      return {
        isValid: false,
        message: translationService.t('validation.invalidPhone')
      };
    }

    return { isValid: true, message: null };
  }

  /**
   * Valide un mot de passe
   * @param {string} password - Mot de passe à valider
   * @returns {Object} - {isValid: boolean, message: string}
   */
  validatePassword(password) {
    if (!password) {
      return {
        isValid: false,
        message: translationService.t('validation.required')
      };
    }

    if (password.length < 8) {
      return {
        isValid: false,
        message: translationService.t('validation.passwordTooShort')
      };
    }

    return { isValid: true, message: null };
  }

  /**
   * Valide un rôle utilisateur
   * @param {string} role - Rôle à valider
   * @returns {Object} - {isValid: boolean, message: string}
   */
  validateRole(role) {
    const validRoles = ['user', 'client', 'agent', 'admin', 'super_admin'];
    
    if (!role) {
      return {
        isValid: false,
        message: translationService.t('validation.required')
      };
    }

    if (!validRoles.includes(role)) {
      return {
        isValid: false,
        message: translationService.t('validation.invalidRole')
      };
    }

    return { isValid: true, message: null };
  }

  /**
   * Valide un statut (active/inactive)
   * @param {string} status - Statut à valider
   * @returns {Object} - {isValid: boolean, message: string}
   */
  validateStatus(status) {
    const validStatuses = ['active', 'inactive'];
    
    if (!status) {
      return {
        isValid: false,
        message: translationService.t('client.statusRequired')
      };
    }

    if (!validStatuses.includes(status)) {
      return {
        isValid: false,
        message: translationService.t('client.invalidStatus')
      };
    }

    return { isValid: true, message: null };
  }

  /**
   * Valide les données d'un client
   * @param {Object} clientData - Données du client à valider
   * @returns {Object} - {isValid: boolean, errors: Array}
   */
  validateClientData(clientData) {
    const errors = [];
    const { first_name, last_name, firstName, lastName, email, phone, role } = clientData;

    // Accepter les deux formats : firstName/lastName ou first_name/last_name
    const finalFirstName = firstName || first_name;
    const finalLastName = lastName || last_name;

    // Validation du prénom
    if (!finalFirstName || finalFirstName.trim().length === 0) {
      errors.push({
        field: 'first_name',
        message: translationService.t('validation.required')
      });
    }

    // Validation du nom
    if (!finalLastName || finalLastName.trim().length === 0) {
      errors.push({
        field: 'last_name',
        message: translationService.t('validation.required')
      });
    }

    // Validation de l'email
    const emailValidation = this.validateEmail(email);
    if (!emailValidation.isValid) {
      errors.push({
        field: 'email',
        message: emailValidation.message
      });
    }

    // Validation du téléphone (optionnel)
    if (phone) {
      const phoneValidation = this.validatePhone(phone);
      if (!phoneValidation.isValid) {
        errors.push({
          field: 'phone',
          message: phoneValidation.message
        });
      }
    }

    // Validation du rôle
    if (role) {
      const roleValidation = this.validateRole(role);
      if (!roleValidation.isValid) {
        errors.push({
          field: 'role',
          message: roleValidation.message
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valide les données d'un projet
   * @param {Object} projectData - Données du projet à valider
   * @returns {Object} - {isValid: boolean, errors: Array}
   */
  validateProjectData(projectData) {
    const errors = [];
    const { name, description, status, budget, start_date, end_date } = projectData;

    // Validation du nom (requis)
    if (!name || name.trim().length === 0) {
      errors.push('Le nom du projet est requis');
    }

    // Validation du statut (optionnel, mais doit être valide si fourni)
    if (status) {
      const validStatuses = ['en_cours', 'en_validation', 'en_pause', 'termine', 'annule', 'active', 'completed'];
      if (!validStatuses.includes(status)) {
        errors.push('Statut de projet invalide');
      }
    }

    // Validation du budget (optionnel, mais doit être un nombre positif si fourni)
    if (budget !== undefined && budget !== null) {
      const budgetNum = parseFloat(budget);
      if (isNaN(budgetNum) || budgetNum < 0) {
        errors.push('Le budget doit être un nombre positif');
      }
    }

    // Validation des dates (optionnelles, mais doivent être valides si fournies)
    if (start_date) {
      const startDate = new Date(start_date);
      if (isNaN(startDate.getTime())) {
        errors.push('Date de début invalide');
      }
    }

    if (end_date) {
      const endDate = new Date(end_date);
      if (isNaN(endDate.getTime())) {
        errors.push('Date de fin invalide');
      }
      
      // Vérifier que la date de fin est après la date de début
      if (start_date) {
        const startDate = new Date(start_date);
        if (!isNaN(startDate.getTime()) && endDate <= startDate) {
          errors.push('La date de fin doit être postérieure à la date de début');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valide un ID (doit être un nombre positif)
   * @param {any} id - ID à valider
   * @returns {Object} - {isValid: boolean, message: string}
   */
  validateId(id) {
    if (!id) {
      return {
        isValid: false,
        message: translationService.t('validation.required')
      };
    }

    const numericId = parseInt(id);
    if (isNaN(numericId) || numericId <= 0) {
      return {
        isValid: false,
        message: translationService.t('validation.invalidData')
      };
    }

    return { isValid: true, message: null };
  }

  /**
   * Valide une liste d'IDs
   * @param {Array} ids - Liste d'IDs à valider
   * @returns {Object} - {isValid: boolean, message: string}
   */
  validateIdArray(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return {
        isValid: false,
        message: translationService.t('client.clientIdsRequired')
      };
    }

    for (const id of ids) {
      const idValidation = this.validateId(id);
      if (!idValidation.isValid) {
        return idValidation;
      }
    }

    return { isValid: true, message: null };
  }

  /**
   * Valide les données d'un modèle de projet
   * @param {Object} templateData - Données du modèle à valider
   * @returns {Object} - {isValid: boolean, errors: Array}
   */
  validateProjectTemplate(templateData) {
    const errors = [];
    
    if (!templateData) {
      errors.push('Les données du modèle sont requises');
      return { isValid: false, errors };
    }

    const { name, description, category, estimated_duration, estimated_budget, tags } = templateData;

    // Validation du nom (requis)
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Le nom du modèle est requis');
    } else if (name.trim().length > 100) {
      errors.push('Le nom du modèle ne peut pas dépasser 100 caractères');
    }

    // Validation de la description (optionnelle)
    if (description && typeof description === 'string' && description.length > 500) {
      errors.push('La description ne peut pas dépasser 500 caractères');
    }

    // Validation de la catégorie (optionnelle)
    if (category && typeof category === 'string' && category.length > 50) {
      errors.push('La catégorie ne peut pas dépasser 50 caractères');
    }

    // Validation de la durée estimée (optionnelle, mais doit être un nombre positif si fournie)
    if (estimated_duration !== undefined && estimated_duration !== null) {
      const duration = parseInt(estimated_duration);
      if (isNaN(duration) || duration < 1 || duration > 365) {
        errors.push('La durée estimée doit être un nombre entre 1 et 365 jours');
      }
    }

    // Validation du budget estimé (optionnel, mais doit être un nombre positif si fourni)
    if (estimated_budget !== undefined && estimated_budget !== null) {
      const budget = parseFloat(estimated_budget);
      if (isNaN(budget) || budget < 0) {
        errors.push('Le budget estimé doit être un nombre positif');
      }
    }

    // Validation des tags (optionnel, mais doit être un tableau si fourni)
    if (tags !== undefined && tags !== null && !Array.isArray(tags)) {
      errors.push('Les tags doivent être un tableau');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = new ValidationService();