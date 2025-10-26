/**
 * Service de génération de vCard
 * Génère des fichiers vCard (.vcf) à partir des données de contact des LinkPoints
 */

class VCardService {
  /**
   * Génère le contenu vCard à partir des données de contact
   * @param {Object} vcardData - Données de contact
   * @param {string} vcardData.first_name - Prénom
   * @param {string} vcardData.last_name - Nom de famille
   * @param {string} vcardData.organization - Entreprise
   * @param {string} vcardData.title - Poste/Titre
   * @param {string} vcardData.phone - Téléphone
   * @param {string} vcardData.email - Email
   * @param {string} vcardData.website - Site web
   * @param {string} vcardData.address - Adresse
   * @returns {string} Contenu vCard formaté
   */
  static generateVCard(vcardData) {
    if (!vcardData || typeof vcardData !== 'object') {
      throw new Error('Données vCard invalides');
    }

    const {
      first_name = '',
      last_name = '',
      organization = '',
      title = '',
      phone = '',
      email = '',
      website = '',
      address = ''
    } = vcardData;

    // Fonction pour échapper les caractères spéciaux dans vCard
    const escapeVCardValue = (value) => {
      if (!value) return '';
      return value
        .replace(/\\/g, '\\\\')  // Échapper les backslashes
        .replace(/;/g, '\\;')    // Échapper les points-virgules
        .replace(/,/g, '\\,')    // Échapper les virgules
        .replace(/\n/g, '\\n')   // Échapper les retours à la ligne
        .replace(/\r/g, '');     // Supprimer les retours chariot
    };

    // Construction du vCard
    let vcard = 'BEGIN:VCARD\n';
    vcard += 'VERSION:3.0\n';

    // Nom complet (FN) - obligatoire
    const fullName = `${first_name} ${last_name}`.trim();
    if (fullName) {
      vcard += `FN:${escapeVCardValue(fullName)}\n`;
    }

    // Nom structuré (N) - Nom;Prénom;Deuxième prénom;Préfixe;Suffixe
    if (last_name || first_name) {
      vcard += `N:${escapeVCardValue(last_name)};${escapeVCardValue(first_name)};;;\n`;
    }

    // Organisation
    if (organization) {
      vcard += `ORG:${escapeVCardValue(organization)}\n`;
    }

    // Titre/Poste
    if (title) {
      vcard += `TITLE:${escapeVCardValue(title)}\n`;
    }

    // Téléphone
    if (phone) {
      vcard += `TEL;TYPE=WORK,VOICE:${escapeVCardValue(phone)}\n`;
    }

    // Email
    if (email) {
      vcard += `EMAIL;TYPE=WORK:${escapeVCardValue(email)}\n`;
    }

    // Site web
    if (website) {
      // S'assurer que l'URL commence par http:// ou https://
      let formattedWebsite = website;
      if (!website.match(/^https?:\/\//)) {
        formattedWebsite = `https://${website}`;
      }
      vcard += `URL:${escapeVCardValue(formattedWebsite)}\n`;
    }

    // Adresse
    if (address) {
      // Format ADR: Boîte postale;Adresse étendue;Rue;Ville;Région;Code postal;Pays
      // Pour simplifier, on met tout dans le champ "Rue"
      vcard += `ADR;TYPE=WORK:;;${escapeVCardValue(address)};;;;\n`;
    }

    // Timestamp de révision
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    vcard += `REV:${timestamp}\n`;

    vcard += 'END:VCARD\n';

    return vcard;
  }

  /**
   * Valide les données vCard
   * @param {Object} vcardData - Données à valider
   * @returns {Object} Résultat de validation { isValid: boolean, errors: string[] }
   */
  static validateVCardData(vcardData) {
    const errors = [];

    if (!vcardData || typeof vcardData !== 'object') {
      errors.push('Données vCard manquantes ou invalides');
      return { isValid: false, errors };
    }

    const { first_name, last_name, email, phone } = vcardData;

    // Au moins un nom doit être fourni
    if (!first_name && !last_name) {
      errors.push('Au moins un prénom ou nom de famille est requis');
    }

    // Validation de l'email si fourni
    if (email && !this.isValidEmail(email)) {
      errors.push('Format d\'email invalide');
    }

    // Validation du téléphone si fourni (format très basique)
    if (phone && !this.isValidPhone(phone)) {
      errors.push('Format de téléphone invalide');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valide un format d'email
   * @param {string} email - Email à valider
   * @returns {boolean}
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valide un format de téléphone (très basique)
   * @param {string} phone - Téléphone à valider
   * @returns {boolean}
   */
  static isValidPhone(phone) {
    // Accepte les numéros avec espaces, tirets, parenthèses, et le signe +
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{6,20}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Génère un nom de fichier vCard basé sur les données
   * @param {Object} vcardData - Données vCard
   * @returns {string} Nom de fichier
   */
  static generateFileName(vcardData) {
    const { first_name = '', last_name = '', organization = '' } = vcardData;
    
    let fileName = '';
    
    if (first_name || last_name) {
      fileName = `${first_name}_${last_name}`.replace(/\s+/g, '_');
    } else if (organization) {
      fileName = organization.replace(/\s+/g, '_');
    } else {
      fileName = 'contact';
    }

    // Nettoyer le nom de fichier
    fileName = fileName
      .replace(/[^a-zA-Z0-9_-]/g, '')  // Supprimer les caractères spéciaux
      .replace(/_{2,}/g, '_')          // Remplacer les underscores multiples
      .replace(/^_|_$/g, '')           // Supprimer les underscores en début/fin
      .toLowerCase();

    return `${fileName}.vcf`;
  }
}

module.exports = VCardService;