<template>
  <div class="pt-4">
    <h3 v-if="title && !isCollapsed" class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
      {{ title }}
    </h3>
    <div class="mt-2 space-y-1">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarNavSection',
  props: {
    title: {
      type: String,
      default: null
    },
    isCollapsed: {
      type: Boolean,
      default: false
    },
    showWhenCollapsed: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
/* Utilise les classes centralisées */
</style>