/**
 * Service de traduction côté client
 * Gère la localisation et les traductions de l'application frontend
 */

class TranslationService {
  constructor() {
    this.defaultLanguage = 'fr'
    this.currentLanguage = 'fr'
    this.translations = {}
    this.loadTranslations()
  }

  /**
   * Charge les traductions pour toutes les langues disponibles
   */
  loadTranslations() {
    try {
      // Charger le français (langue par défaut)
      this.translations.fr = {
        // Navigation et interface générale
        navigation: {
          dashboard: 'Tableau de bord',
          clients: 'Clients',
          projects: 'Projets',
          reports: 'Rapports',
          settings: 'Paramètres',
          logout: 'Déconnexion',
          profile: 'Profil',
          notifications: 'Notifications',
          integrations: 'Intégrations',
          team: 'Équipe',
          billing: 'Facturation',
          analytics: 'Analyses',
          marketing: 'Marketing'
        },

        // Actions communes
        actions: {
          save: 'Enregistrer',
          cancel: 'Annuler',
          delete: 'Supprimer',
          edit: 'Modifier',
          create: 'Créer',
          add: 'Ajouter',
          remove: 'Retirer',
          search: 'Rechercher',
          filter: 'Filtrer',
          reset: 'Réinitialiser',
          confirm: 'Confirmer',
          close: 'Fermer',
          view: 'Voir',
          download: 'Télécharger',
          upload: 'Téléverser',
          send: 'Envoyer',
          refresh: 'Actualiser',
          loading: 'Chargement...',
          saving: 'Enregistrement...',
          deleting: 'Suppression...',
          processing: 'Traitement...'
        },

        // Statuts
        status: {
          active: 'Actif',
          inactive: 'Inactif',
          pending: 'En attente',
          completed: 'Terminé',
          cancelled: 'Annulé',
          suspended: 'Suspendu',
          archived: 'Archivé',
          draft: 'Brouillon',
          published: 'Publié',
          approved: 'Approuvé',
          rejected: 'Rejeté'
        },

        // Messages d'erreur
        errors: {
          general: 'Une erreur est survenue',
          network: 'Erreur de connexion réseau',
          unauthorized: 'Accès non autorisé',
          forbidden: 'Accès refusé',
          notFound: 'Ressource non trouvée',
          validation: 'Erreur de validation',
          required: 'Ce champ est requis',
          invalidEmail: 'Adresse email invalide',
          invalidPhone: 'Numéro de téléphone invalide',
          passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
          passwordMismatch: 'Les mots de passe ne correspondent pas',
          fileTooBig: 'Le fichier est trop volumineux',
          invalidFileType: 'Type de fichier non autorisé'
        },

        // Messages de succès
        success: {
          saved: 'Enregistré avec succès',
          created: 'Créé avec succès',
          updated: 'Mis à jour avec succès',
          deleted: 'Supprimé avec succès',
          sent: 'Envoyé avec succès',
          uploaded: 'Téléversé avec succès',
          copied: 'Copié dans le presse-papiers'
        },

        // Gestion des clients
        clients: {
          title: 'Gestion des Clients',
          subtitle: 'Gérez vos clients et leurs informations',
          addClient: 'Ajouter un client',
          editClient: 'Modifier le client',
          deleteClient: 'Supprimer le client',
          clientDetails: 'Détails du client',
          noClients: 'Aucun client trouvé',
          searchPlaceholder: 'Rechercher un client...',
          firstName: 'Prénom',
          lastName: 'Nom',
          email: 'Email',
          phone: 'Téléphone',
          company: 'Entreprise',
          status: 'Statut',
          lastLogin: 'Dernière connexion',
          createdAt: 'Créé le',
          assignAgent: 'Attribuer un agent',
          sendEmail: 'Envoyer un email',
          activate: 'Activer',
          deactivate: 'Désactiver',
          never: 'Jamais'
        },

        // Gestion des projets
        projects: {
          title: 'Gestion des Projets',
          subtitle: 'Gérez vos projets et leur progression',
          addProject: 'Ajouter un projet',
          editProject: 'Modifier le projet',
          deleteProject: 'Supprimer le projet',
          projectDetails: 'Détails du projet',
          noProjects: 'Aucun projet trouvé',
          name: 'Nom du projet',
          description: 'Description',
          startDate: 'Date de début',
          endDate: 'Date de fin',
          priority: 'Priorité',
          progress: 'Progression',
          team: 'Équipe',
          files: 'Fichiers',
          tasks: 'Tâches',
          comments: 'Commentaires'
        },

        // Formulaires
        forms: {
          required: 'Requis',
          optional: 'Optionnel',
          selectOption: 'Sélectionner une option',
          chooseFile: 'Choisir un fichier',
          dragDropFile: 'Glissez-déposez un fichier ici ou cliquez pour sélectionner',
          maxFileSize: 'Taille maximale: {size}',
          allowedFormats: 'Formats autorisés: {formats}'
        },

        // Pagination
        pagination: {
          previous: 'Précédent',
          next: 'Suivant',
          first: 'Premier',
          last: 'Dernier',
          showing: 'Affichage de',
          to: 'à',
          of: 'sur',
          results: 'résultats',
          page: 'Page',
          itemsPerPage: 'Éléments par page'
        },

        // Filtres
        filters: {
          all: 'Tous',
          active: 'Actifs',
          inactive: 'Inactifs',
          recent: 'Récents',
          today: 'Aujourd\'hui',
          thisWeek: 'Cette semaine',
          thisMonth: 'Ce mois',
          thisYear: 'Cette année',
          custom: 'Personnalisé',
          dateRange: 'Plage de dates',
          from: 'Du',
          to: 'Au'
        },

        // Modales
        modals: {
          confirmDelete: 'Confirmer la suppression',
          confirmDeleteMessage: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
          confirmDeleteWarning: 'Cette action est irréversible.',
          passwordConfirmation: 'Confirmation par mot de passe',
          enterPassword: 'Entrez votre mot de passe pour confirmer',
          reasonOptional: 'Raison (optionnel)',
          reasonPlaceholder: 'Veuillez expliquer la raison de cette action...'
        },

        // Notifications
        notifications: {
          title: 'Notifications',
          markAllRead: 'Marquer tout comme lu',
          noNotifications: 'Aucune notification',
          newNotification: 'Nouvelle notification',
          unreadCount: '{count} non lues'
        },

        // Dates et temps
        datetime: {
          now: 'Maintenant',
          today: 'Aujourd\'hui',
          yesterday: 'Hier',
          tomorrow: 'Demain',
          thisWeek: 'Cette semaine',
          lastWeek: 'La semaine dernière',
          thisMonth: 'Ce mois',
          lastMonth: 'Le mois dernier',
          minutesAgo: 'Il y a {minutes} minutes',
          hoursAgo: 'Il y a {hours} heures',
          daysAgo: 'Il y a {days} jours'
        },

        // Messages d'authentification
        auth: {
          emailRequired: 'L\'adresse email est requise',
          passwordRequired: 'Le mot de passe est requis',
          emailPasswordRequired: 'Email et mot de passe requis',
          invalidEmailFormat: 'Format d\'email invalide',
          passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
          passwordWeak: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
          passwordsNotMatch: 'Les mots de passe ne correspondent pas',
          emailIncorrect: 'Adresse email incorrecte',
          passwordIncorrect: 'Mot de passe incorrect',
          emailOrPasswordIncorrect: 'Email ou mot de passe incorrect',
          accountNotFound: 'Aucun compte associé à cette adresse email',
          accountLocked: 'Compte temporairement verrouillé',
          accountDisabled: 'Compte désactivé',
          sessionExpired: 'Session expirée',
          loginError: 'Erreur lors de la connexion',
          registrationError: 'Erreur lors de l\'inscription',
          logoutError: 'Erreur lors de la déconnexion',
          tokenInvalid: 'Token invalide ou expiré',
          tokenRefreshInvalid: 'Token de rafraîchissement invalide',
          tokenPasswordRequired: 'Token et nouveau mot de passe requis',
          resetPasswordError: 'Erreur lors de la réinitialisation du mot de passe',
          resetPasswordSuccess: 'Mot de passe réinitialisé avec succès',
          emailSentSuccess: 'Email de réinitialisation envoyé avec succès',
          allFieldsRequired: 'Tous les champs sont requis',
          firstNameRequired: 'Le prénom est requis',
          lastNameRequired: 'Le nom est requis',
          confirmPasswordRequired: 'La confirmation du mot de passe est requise',
          termsAcceptanceRequired: 'Vous devez accepter les conditions d\'utilisation',
          loginSuccess: 'Connexion réussie',
          registrationSuccess: 'Inscription réussie',
          logoutSuccess: 'Déconnexion réussie'
        }
      }

      // Ici on pourra ajouter d'autres langues dans le futur
      // this.translations.en = require('../lang/en')
      // this.translations.es = require('../lang/es')
    } catch (error) {
      console.error('❌ Erreur lors du chargement des traductions:', error)
    }
  }

  /**
   * Définit la langue courante
   * @param {string} language - Code de la langue (fr, en, es, etc.)
   */
  setLanguage(language) {
    if (this.translations[language]) {
      this.currentLanguage = language
      // Sauvegarder la préférence dans le localStorage
      localStorage.setItem('preferredLanguage', language)
    } else {
      console.warn(`⚠️ Langue '${language}' non disponible, utilisation de '${this.defaultLanguage}'`)
      this.currentLanguage = this.defaultLanguage
    }
  }

  /**
   * Récupère la langue courante depuis le localStorage ou utilise la langue par défaut
   */
  initializeLanguage() {
    const savedLanguage = localStorage.getItem('preferredLanguage')
    if (savedLanguage && this.translations[savedLanguage]) {
      this.currentLanguage = savedLanguage
    }
  }

  /**
   * Récupère une traduction par sa clé
   * @param {string} key - Clé de traduction (ex: 'errors.notFound')
   * @param {Object} params - Paramètres pour l'interpolation
   * @returns {string} - Texte traduit
   */
  t(key, params = {}) {
    const translation = this.getNestedValue(this.translations[this.currentLanguage], key)
    
    if (!translation) {
      console.warn(`⚠️ Traduction manquante pour la clé: ${key}`)
      return key // Retourne la clé si la traduction n'existe pas
    }

    // Interpolation des paramètres
    return this.interpolate(translation, params)
  }

  /**
   * Récupère une valeur imbriquée dans un objet par sa clé
   * @param {Object} obj - Objet contenant les traductions
   * @param {string} key - Clé avec notation pointée (ex: 'errors.notFound')
   * @returns {string|undefined} - Valeur trouvée ou undefined
   */
  getNestedValue(obj, key) {
    return key.split('.').reduce((current, keyPart) => {
      return current && current[keyPart]
    }, obj)
  }

  /**
   * Interpole les paramètres dans une chaîne de traduction
   * @param {string} text - Texte avec des placeholders {param}
   * @param {Object} params - Paramètres à interpoler
   * @returns {string} - Texte avec les paramètres interpolés
   */
  interpolate(text, params) {
    if (typeof text !== 'string') return text
    
    return text.replace(/{(\w+)}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match
    })
  }

  /**
   * Récupère toutes les traductions pour une section
   * @param {string} section - Section des traductions (ex: 'errors', 'success')
   * @returns {Object} - Objet contenant toutes les traductions de la section
   */
  getSection(section) {
    return this.translations[this.currentLanguage][section] || {}
  }

  /**
   * Vérifie si une traduction existe
   * @param {string} key - Clé de traduction
   * @returns {boolean} - True si la traduction existe
   */
  exists(key) {
    return !!this.getNestedValue(this.translations[this.currentLanguage], key)
  }

  /**
   * Récupère la liste des langues disponibles
   * @returns {Array} - Liste des codes de langues disponibles
   */
  getAvailableLanguages() {
    return Object.keys(this.translations)
  }

  /**
   * Récupère la langue courante
   * @returns {string} - Code de la langue courante
   */
  getCurrentLanguage() {
    return this.currentLanguage
  }

  /**
   * Récupère les informations d'une langue
   * @param {string} languageCode - Code de la langue
   * @returns {Object} - Informations de la langue
   */
  getLanguageInfo(languageCode) {
    const languageNames = {
      fr: { name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
      en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
      es: { name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
      de: { name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪' },
      it: { name: 'Italiano', nativeName: 'Italiano', flag: '🇮🇹' }
    }
    
    return languageNames[languageCode] || { name: languageCode, nativeName: languageCode, flag: '🌐' }
  }
}

// Instance singleton
const translationService = new TranslationService()

// Initialiser la langue au démarrage
translationService.initializeLanguage()

export default translationService