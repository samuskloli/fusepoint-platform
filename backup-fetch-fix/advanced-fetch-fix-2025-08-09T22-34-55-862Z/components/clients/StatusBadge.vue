<template>
  <span
    :class="[
      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
      statusClasses
    ]"
  >
    {{ statusText }}
  </span>
</template>

<script>
export default {
  name: 'StatusBadge',
  props: {
    client: {
      type: Object,
      required: true
    },
    messages: {
      type: Object,
      required: true
    }
  },
  computed: {
    isActive() {
      return this.client.is_active === 1 || this.client.is_active === true
    },
    
    statusClasses() {
      return this.isActive 
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800'
    },
    
    statusText() {
      return this.isActive 
        ? (this.messages.statusActive || 'Actif')
        : (this.messages.statusInactive || 'Inactif')
    }
  }
}
</script>