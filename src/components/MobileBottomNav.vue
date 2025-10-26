<template>
  <nav class="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-sm md:hidden">
    <div class="grid grid-cols-5 gap-x-1">
      <router-link :to="'/agent'" class="nav-item" :class="{ active: isActive('/agent') }">
        <i class="fas fa-home"></i>
        <span>Accueil</span>
      </router-link>
      <router-link :to="'/agent/projects'" class="nav-item" :class="{ active: isActive('/agent/projects') }">
        <i class="fas fa-diagram-project"></i>
        <span>Projets</span>
      </router-link>
      <router-link :to="'/agent/clients'" class="nav-item" :class="{ active: isActive('/agent/clients') }">
        <i class="fas fa-users"></i>
        <span>Clients</span>
      </router-link>
      <router-link :to="'/agent/service-requests'" class="nav-item" :class="{ active: isActive('/agent/service-requests') }">
        <i class="fas fa-headset"></i>
        <span>Demandes</span>
      </router-link>
      <router-link :to="'/agent/reports'" class="nav-item" :class="{ active: isActive('/agent/reports') }">
        <i class="fas fa-chart-line"></i>
        <span>Rapports</span>
      </router-link>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'MobileBottomNav',
  methods: {
    isActive(prefix) {
      return this.$route.path.startsWith(prefix)
    }
  }
}
</script>

<style scoped>
.nav-item {
  @apply flex flex-col items-center justify-center py-2 text-xs text-gray-600 hover:text-gray-900;
}
.nav-item i {
  @apply text-lg mb-1;
}
.nav-item.active {
  @apply text-blue-600;
}
</style>