<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="$emit('decline')"></div>
    <div class="relative bg-white rounded-xl shadow-xl max-w-sm w-11/12 p-5">
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-bell text-yellow-600"></i>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Activer les notifications</h3>
          <p class="text-sm text-gray-600">Recevez des alertes en temps réel (projets, messages, actions importantes).</p>
        </div>
      </div>

      <div class="space-y-2 text-sm text-gray-700">
        <p>Nous vous demanderons la permission système. Vous pouvez changer d'avis plus tard dans les paramètres de votre appareil.</p>
        <p v-if="permissionState === 'denied'" class="text-red-600">Les notifications sont bloquées. Allez dans les paramètres pour les activer manuellement.</p>
      </div>

      <div class="mt-5 flex justify-end space-x-3">
        <button type="button" class="px-3 py-2 text-sm text-gray-700 hover:text-gray-900" @click="$emit('decline')">Plus tard</button>
        <button type="button" class="px-4 py-2 text-sm font-medium bg-yellow-600 text-white rounded-md hover:bg-yellow-700" @click="$emit('accept')">
          Activer
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PushPrompt',
  props: {
    permissionState: {
      type: String,
      default: 'default'
    }
  },
  emits: ['accept', 'decline']
}
</script>