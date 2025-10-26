const databaseService = require('./databaseService');

class SlugService {
  /**
   * Génère un slug unique basé sur le nom du linkpoint
   * @param {string} name - Le nom du linkpoint
   * @param {number} maxLength - Longueur maximale du slug (défaut: 50)
   * @returns {Promise<string>} - Le slug unique généré
   */
  async generateUniqueSlug(name, maxLength = 50) {
    // Nettoyer et normaliser le nom
    let baseSlug = this.sanitizeName(name, maxLength - 10); // Garder de la place pour le suffixe
    
    // Si le slug de base est vide, utiliser un préfixe par défaut
    if (!baseSlug) {
      baseSlug = 'link';
    }
    
    // Vérifier si le slug de base est disponible
    const isAvailable = await this.isSlugAvailable(baseSlug);
    if (isAvailable) {
      return baseSlug;
    }
    
    // Si pas disponible, ajouter un suffixe numérique
    return await this.generateSlugWithSuffix(baseSlug, maxLength);
  }
  
  /**
   * Nettoie et normalise un nom pour créer un slug
   * @param {string} name - Le nom à nettoyer
   * @param {number} maxLength - Longueur maximale
   * @returns {string} - Le slug nettoyé
   */
  sanitizeName(name, maxLength = 50) {
    if (!name || typeof name !== 'string') {
      return '';
    }
    
    return name
      .toLowerCase()
      .trim()
      // Remplacer les caractères accentués
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Remplacer les espaces et caractères spéciaux par des tirets
      .replace(/[^a-z0-9]+/g, '-')
      // Supprimer les tirets en début et fin
      .replace(/^-+|-+$/g, '')
      // Limiter la longueur
      .substring(0, maxLength)
      // Supprimer le tiret final si la coupure en a créé un
      .replace(/-+$/, '');
  }
  
  /**
   * Vérifie si un slug est disponible
   * @param {string} slug - Le slug à vérifier
   * @returns {Promise<boolean>} - True si disponible
   */
  async isSlugAvailable(slug) {
    try {
      const existing = await databaseService.get('SELECT id FROM linkpoints WHERE slug = ?', [slug]);
      return !existing;
    } catch (error) {
      console.error('Erreur lors de la vérification du slug:', error);
      return false;
    }
  }
  
  /**
   * Génère un slug avec un suffixe numérique
   * @param {string} baseSlug - Le slug de base
   * @param {number} maxLength - Longueur maximale
   * @returns {Promise<string>} - Le slug avec suffixe
   */
  async generateSlugWithSuffix(baseSlug, maxLength = 50) {
    let counter = 1;
    let slug;
    
    do {
      const suffix = `-${counter}`;
      const maxBaseLength = maxLength - suffix.length;
      const truncatedBase = baseSlug.substring(0, maxBaseLength);
      slug = `${truncatedBase}${suffix}`;
      
      const isAvailable = await this.isSlugAvailable(slug);
      if (isAvailable) {
        return slug;
      }
      
      counter++;
      
      // Sécurité : éviter une boucle infinie
      if (counter > 9999) {
        // Utiliser un timestamp comme fallback
        const timestamp = Date.now().toString(36);
        return `link-${timestamp}`;
      }
    } while (true);
  }
  
  /**
   * Génère un slug complètement aléatoire (fallback)
   * @param {number} length - Longueur du slug
   * @returns {Promise<string>} - Le slug aléatoire
   */
  async generateRandomSlug(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let slug;
    let attempts = 0;
    
    do {
      slug = '';
      for (let i = 0; i < length; i++) {
        slug += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      const isAvailable = await this.isSlugAvailable(slug);
      if (isAvailable) {
        return slug;
      }
      
      attempts++;
      if (attempts > 100) {
        // Utiliser timestamp comme dernier recours
        return `link-${Date.now().toString(36)}`;
      }
    } while (true);
  }
  
  /**
   * Génère un slug pour la duplication
   * @param {string} originalSlug - Le slug original
   * @returns {Promise<string>} - Le nouveau slug pour la copie
   */
  async generateDuplicateSlug(originalSlug) {
    const baseSlug = originalSlug.replace(/-copie(-\d+)?$/, '');
    return await this.generateSlugWithSuffix(`${baseSlug}-copie`);
  }
}

module.exports = new SlugService();