export default {
  title: 'Gestion des services',
  subtitle: 'Ajoutez, modifiez et supprimez les services proposés. Toutes les modifications sont enregistrées en base de données.',
  addService: 'Ajouter un service',
  loading: 'Chargement des services...',
  empty: 'Aucun service pour le moment.',

  badges: {
    visible: 'Visible',
    hidden: 'Masquée',
    available: 'Disponible',
    unavailable: 'Indisponible'
  },

  noCategory: 'Sans catégorie',

  pricing: {
    label: 'Tarification:',
    type: {
      fixed: 'Fixe',
      hourly: 'Horaire'
    }
  },

  duration: {
    label: 'Durée estimée:'
  },

  actions: {
    deactivateCard: 'Désactiver la carte',
    activateCard: 'Activer la carte',
    makeUnavailable: 'Rendre indisponible',
    makeAvailable: 'Rendre disponible',
    edit: 'Modifier',
    delete: 'Supprimer'
  },

  modal: {
    title: {
      edit: 'Modifier le service',
      create: 'Créer un service'
    },
    cancel: 'Annuler',
    save: {
      create: 'Créer',
      update: 'Mettre à jour'
    },
    saving: 'Enregistrement...'
  },

  form: {
    name: 'Nom *',
    category: 'Catégorie',
    addCategory: 'Ajouter une catégorie…',
    newCategory: 'Nouvelle catégorie',
    newCategoryPlaceholder: 'Nom de la nouvelle catégorie',
    description: 'Description',
    priceType: 'Type de prix',
    basePrice: 'Prix de base',
    displayOrder: "Ordre d'affichage",
    durationEstimate: 'Durée estimée',
    durationEstimatePlaceholder: 'ex: 2h, 3-5 jours',
    isActive: 'Visible (carte affichée)',
    isAvailable: 'Disponible (réservable)',
    deliverables: 'Livrables (séparés par des virgules)',
    requirements: 'Prérequis (séparés par des virgules)',
    icon: 'Icône',
    iconSelect: 'Choisir une icône',
    color: 'Couleur'
  },

  colorPicker: {
    aria: 'Choisir couleur {color}'
  },

  preview: {
    label: 'Aperçu:'
  },

  errors: {
    nameRequired: 'Le nom est requis.',
    newCategoryRequired: 'Veuillez saisir une nouvelle catégorie.',
    saveError: "Erreur lors de l'enregistrement.",
    visibilityToggle: 'Erreur lors de la bascule de visibilité.',
    availabilityToggle: 'Erreur lors de la bascule de disponibilité.'
  },

  delete: {
    confirm: 'Supprimer le service "{name}" ?',
    error: 'Erreur lors de la suppression.'
  }
}