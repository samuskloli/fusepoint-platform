/**
 * Service de gestion des langues et traductions
 * Centralise la gestion multilingue de l'application
 */

class LanguageService {
  constructor() {
    this.currentLanguage = 'fr'; // Langue par défaut
    this.translations = {};
    this.loadTranslations();
  }

  /**
   * Charge les traductions pour toutes les langues disponibles
   */
  loadTranslations() {
    try {
      // Charger le français (langue par défaut)
      this.translations.fr = require('../lang/fr');
      
      // Ici on pourra ajouter d'autres langues dans le futur
      // this.translations.en = require('../lang/en');
      // this.translations.es = require('../lang/es');
      
    } catch (error) {
      console.error('Erreur lors du chargement des traductions:', error);
      // Fallback avec des traductions minimales
      this.translations.fr = {
        errors: { serverError: 'Erreur serveur' },
        success: { general: 'Succès' }
      };
    }
  }

  /**
   * Définit la langue courante
   * @param {string} language - Code de la langue (fr, en, es, etc.)
   */
  setLanguage(language) {
    if (this.translations[language]) {
      this.currentLanguage = language;
    } else {
      console.warn(`Langue ${language} non disponible, utilisation du français par défaut`);
    }
  }

  /**
   * Récupère une traduction par sa clé
   * @param {string} key - Clé de traduction (ex: 'errors.notFound')
   * @param {object} params - Paramètres pour l'interpolation
   * @returns {string} - Texte traduit
   */
  get(key, params = {}) {
    const translation = this.getNestedValue(this.translations[this.currentLanguage], key);
    
    if (!translation) {
      console.warn(`Traduction manquante pour la clé: ${key}`);
      return key; // Retourne la clé si pas de traduction
    }

    // Interpolation des paramètres
    return this.interpolate(translation, params);
  }

  /**
   * Récupère une valeur dans un objet imbriqué via une clé pointée
   * @param {object} obj - Objet source
   * @param {string} key - Clé pointée (ex: 'errors.notFound')
   * @returns {string|null} - Valeur trouvée ou null
   */
  getNestedValue(obj, key) {
    return key.split('.').reduce((current, keyPart) => {
      return current && current[keyPart] !== undefined ? current[keyPart] : null;
    }, obj);
  }

  /**
   * Interpole les paramètres dans une chaîne de traduction
   * @param {string} text - Texte avec placeholders
   * @param {object} params - Paramètres à interpoler
   * @returns {string} - Texte interpolé
   */
  interpolate(text, params) {
    if (typeof text !== 'string') return text;
    
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  /**
   * Récupère toutes les langues disponibles
   * @returns {array} - Liste des codes de langues
   */
  getAvailableLanguages() {
    return Object.keys(this.translations);
  }

  /**
   * Vérifie si une langue est disponible
   * @param {string} language - Code de la langue
   * @returns {boolean}
   */
  isLanguageAvailable(language) {
    return this.translations.hasOwnProperty(language);
  }

  /**
   * Récupère la langue courante
   * @returns {string} - Code de la langue courante
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Méthodes de convenance pour les messages courants
   */
  
  // Messages d'erreur
  getErrorMessage(errorType, params = {}) {
    return this.get(`errors.${errorType}`, params);
  }

  // Messages de succès
  getSuccessMessage(successType, params = {}) {
    return this.get(`success.${successType}`, params);
  }

  // Messages de validation
  getValidationMessage(validationType, params = {}) {
    return this.get(`validation.${validationType}`, params);
  }

  // Messages spécifiques aux clients
  getClientMessage(messageType, params = {}) {
    return this.get(`clients.${messageType}`, params);
  }

  // Messages spécifiques aux agents
  getAgentMessage(messageType, params = {}) {
    return this.get(`agent.${messageType}`, params);
  }

  // Messages d'email
  getEmailMessage(messageType, params = {}) {
    return this.get(`email.${messageType}`, params);
  }

  // Messages de projets
  getProjectMessage(messageType, params = {}) {
    return this.get(`projects.${messageType}`, params);
  }
}

// Export d'une instance singleton
module.exports = new LanguageService();