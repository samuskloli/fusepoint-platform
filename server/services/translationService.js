/**
 * Service de traduction
 * Gère la localisation et les traductions de l'application
 */

class TranslationService {
  constructor() {
    this.defaultLanguage = 'fr';
    this.currentLanguage = 'fr';
    this.translations = {};
    this.loadTranslations();
  }

  /**
   * Charge les traductions pour toutes les langues disponibles
   */
  loadTranslations() {
    try {
      this.translations.fr = require('../lang/fr');
      // Ajouter d'autres langues ici quand elles seront disponibles
      // this.translations.en = require('../lang/en');
      // this.translations.de = require('../lang/de');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des traductions:', error);
    }
  }

  /**
   * Définit la langue courante
   * @param {string} language - Code de la langue (fr, en, de, etc.)
   */
  setLanguage(language) {
    if (this.translations[language]) {
      this.currentLanguage = language;
    } else {
      console.warn(`⚠️ Langue '${language}' non disponible, utilisation de '${this.defaultLanguage}'`);
      this.currentLanguage = this.defaultLanguage;
    }
  }

  /**
   * Récupère une traduction par sa clé
   * @param {string} key - Clé de traduction (ex: 'errors.notFound')
   * @param {Object} params - Paramètres pour l'interpolation
   * @returns {string} - Texte traduit
   */
  t(key, params = {}) {
    const translation = this.getNestedValue(this.translations[this.currentLanguage], key);
    
    if (!translation) {
      console.warn(`⚠️ Traduction manquante pour la clé: ${key}`);
      return key; // Retourne la clé si la traduction n'existe pas
    }

    // Vérifier que la traduction est une chaîne et non un objet
    if (typeof translation !== 'string') {
      console.warn(`⚠️ Traduction invalide (objet au lieu de chaîne) pour la clé: ${key}`);
      return key; // Retourne la clé si la traduction n'est pas une chaîne
    }

    // Interpolation des paramètres
    return this.interpolate(translation, params);
  }

  /**
   * Récupère une valeur imbriquée dans un objet par sa clé
   * @param {Object} obj - Objet contenant les traductions
   * @param {string} key - Clé avec notation pointée (ex: 'errors.notFound')
   * @returns {string|undefined} - Valeur trouvée ou undefined
   */
  getNestedValue(obj, key) {
    return key.split('.').reduce((current, keyPart) => {
      return current && current[keyPart];
    }, obj);
  }

  /**
   * Interpole les paramètres dans une chaîne de traduction
   * @param {string} text - Texte avec des placeholders {param}
   * @param {Object} params - Paramètres à interpoler
   * @returns {string} - Texte avec les paramètres interpolés
   */
  interpolate(text, params) {
    return text.replace(/{(\w+)}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  /**
   * Récupère toutes les traductions pour une section
   * @param {string} section - Section des traductions (ex: 'errors', 'success')
   * @returns {Object} - Objet contenant toutes les traductions de la section
   */
  getSection(section) {
    return this.translations[this.currentLanguage][section] || {};
  }

  /**
   * Vérifie si une traduction existe
   * @param {string} key - Clé de traduction
   * @returns {boolean} - True si la traduction existe
   */
  exists(key) {
    return !!this.getNestedValue(this.translations[this.currentLanguage], key);
  }

  /**
   * Récupère la liste des langues disponibles
   * @returns {Array} - Liste des codes de langues disponibles
   */
  getAvailableLanguages() {
    return Object.keys(this.translations);
  }

  /**
   * Récupère la langue courante
   * @returns {string} - Code de la langue courante
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }
}

// Instance singleton
const translationService = new TranslationService();

module.exports = translationService;