<template>
  <router-link
    :to="to"
    class="nav-item"
    :class="{
      'nav-item-active': isActive,
      'justify-center items-center': isCollapsed
    }"
  >
    <component :is="'svg'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconPath" />
    </component>
    <span v-if="!isCollapsed">{{ label }}</span>
    <span v-if="badge && !isCollapsed" :class="badgeClass">{{ badge }}</span>
  </router-link>
</template>

<script>
export default {
  name: 'SidebarNavItem',
  props: {
    to: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    iconPath: {
      type: String,
      required: true
    },
    badge: {
      type: String,
      default: null
    },
    badgeClass: {
      type: String,
      default: 'ml-auto px-2 py-1 text-xs bg-blue-600 text-white rounded-full'
    },
    isCollapsed: {
      type: Boolean,
      default: false
    },
    exactMatch: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    isActive() {
      if (this.exactMatch) {
        return this.$route.path === this.to
      }
      return this.$route.path.startsWith(this.to)
    }
  }
}
</script>

<style scoped>
.nav-item {
  @apply flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-300 rounded-lg;
  @apply hover:bg-gray-700 hover:text-white transition-all duration-200 cursor-pointer;
}

.nav-item:hover {
  transform: translateY(-1px);
}

.nav-item-active {
  @apply bg-primary-600 text-white;
}

.nav-item.justify-center {
  @apply p-3 m-1 min-h-[3rem];
}

.nav-item.justify-center svg {
  @apply h-5 w-5 mx-auto;
}
</style>