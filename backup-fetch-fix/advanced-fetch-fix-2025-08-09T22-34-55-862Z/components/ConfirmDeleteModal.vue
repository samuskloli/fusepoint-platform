<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
      <div class="p-6">
        <!-- Icône d'avertissement -->
        <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>

        <!-- Titre -->
        <h3 class="text-lg font-semibold text-gray-900 text-center mb-2">
          {{ title || 'Confirmer la suppression' }}
        </h3>

        <!-- Message -->
        <p class="text-sm text-gray-600 text-center mb-6">
          {{ message || 'Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?' }}
        </p>

        <!-- Actions -->
        <div class="flex justify-center space-x-3">
          <button
            @click="$emit('close')"
            type="button"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            @click="$emit('confirm')"
            type="button"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmDeleteModal',
  props: {
    title: {
      type: String,
      default: 'Confirmer la suppression'
    },
    message: {
      type: String,
      default: 'Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?'
    }
  },
  emits: ['close', 'confirm']
}
</script>