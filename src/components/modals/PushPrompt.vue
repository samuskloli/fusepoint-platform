<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center" @keydown="onKeydown">
    <div class="absolute inset-0 bg-black/50" aria-hidden="true" @click="$emit('decline')"></div>
    <div
      ref="dialog"
      class="relative bg-white rounded-xl shadow-xl max-w-sm w-11/12 p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pushPromptTitle"
      aria-describedby="pushPromptDesc"
      tabindex="-1"
    >
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-bell text-yellow-600"></i>
        </div>
        <div>
          <h3 id="pushPromptTitle" class="text-lg font-semibold text-gray-900">Activer les notifications</h3>
          <p id="pushPromptDesc" class="text-sm text-gray-600">Recevez des alertes en temps réel (projets, messages, actions importantes).</p>
        </div>
      </div>

      <div class="space-y-2 text-sm text-gray-700">
        <p>Nous vous demanderons la permission système. Vous pouvez changer d'avis plus tard dans les paramètres de votre appareil.</p>
        <p v-if="permissionState === 'denied'" class="text-red-600">Les notifications sont bloquées. Allez dans les paramètres pour les activer manuellement.</p>
      </div>

      <div class="mt-5 flex justify-end space-x-3">
        <button ref="cancelBtn" type="button" class="px-3 py-2 text-sm text-gray-700 hover:text-gray-900" @click="$emit('decline')">Plus tard</button>
        <button ref="acceptBtn" type="button" class="px-4 py-2 text-sm font-medium bg-yellow-600 text-white rounded-md hover:bg-yellow-700" @click="$emit('accept')">
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
  emits: ['accept', 'decline'],
  data() {
    return {
      focusables: []
    }
  },
  mounted() {
    // Focus the dialog for screen readers and keyboard users
    this.$nextTick(() => {
      const dialog = this.$refs.dialog
      if (dialog) {
        dialog.focus()
        // Collect focusable elements inside the dialog
        this.focusables = Array.from(dialog.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ))
        // Ensure one of the primary actions is focused
        if (this.$refs.acceptBtn) {
          this.$refs.acceptBtn.focus()
        } else if (this.$refs.cancelBtn) {
          this.$refs.cancelBtn.focus()
        }
      }
    })
  },
  methods: {
    onKeydown(e) {
      if (e.key === 'Escape') {
        // Close on Escape
        this.$emit('decline')
        e.stopPropagation()
        return
      }
      if (e.key === 'Tab' && this.focusables && this.focusables.length) {
        const first = this.focusables[0]
        const last = this.focusables[this.focusables.length - 1]
        const active = document.activeElement
        if (e.shiftKey) {
          if (active === first || !this.$refs.dialog.contains(active)) {
            last.focus()
            e.preventDefault()
          }
        } else {
          if (active === last || !this.$refs.dialog.contains(active)) {
            first.focus()
            e.preventDefault()
          }
        }
      }
    }
  }
}
</script>