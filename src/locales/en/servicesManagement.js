export default {
  title: 'Service management',
  subtitle: 'Add, edit, and delete offered services. All changes are saved to the database.',
  addService: 'Add a service',
  loading: 'Loading services...',
  empty: 'No services yet.',

  badges: {
    visible: 'Visible',
    hidden: 'Hidden',
    available: 'Available',
    unavailable: 'Unavailable'
  },

  noCategory: 'No category',

  pricing: {
    label: 'Pricing:',
    type: {
      fixed: 'Fixed',
      hourly: 'Hourly'
    }
  },

  duration: {
    label: 'Estimated duration:'
  },

  actions: {
    deactivateCard: 'Deactivate card',
    activateCard: 'Activate card',
    makeUnavailable: 'Make unavailable',
    makeAvailable: 'Make available',
    edit: 'Edit',
    delete: 'Delete'
  },

  modal: {
    title: {
      edit: 'Edit service',
      create: 'Create service'
    },
    cancel: 'Cancel',
    save: {
      create: 'Create',
      update: 'Update'
    },
    saving: 'Saving...'
  },

  form: {
    name: 'Name *',
    category: 'Category',
    addCategory: 'Add a category…',
    newCategory: 'New category',
    newCategoryPlaceholder: 'New category name',
    description: 'Description',
    priceType: 'Price type',
    basePrice: 'Base price',
    displayOrder: 'Display order',
    durationEstimate: 'Estimated duration',
    durationEstimatePlaceholder: 'e.g., 2h, 3-5 days',
    isActive: 'Visible (card displayed)',
    isAvailable: 'Available (bookable)',
    deliverables: 'Deliverables (comma-separated)',
    requirements: 'Requirements (comma-separated)',
    icon: 'Icon',
    iconSelect: 'Choose an icon',
    color: 'Color'
  },

  colorPicker: {
    aria: 'Choose color {color}'
  },

  preview: {
    label: 'Preview:'
  },

  errors: {
    nameRequired: 'Name is required.',
    newCategoryRequired: 'Please enter a new category.',
    saveError: 'Error while saving.',
    visibilityToggle: 'Error while toggling visibility.',
    availabilityToggle: 'Error while toggling availability.'
  },

  delete: {
    confirm: 'Delete service "{name}"?',
    error: 'Error while deleting.'
  }
}