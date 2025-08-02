<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      <!-- Mobile menu button -->
      <button
        @click="$emit('toggle-sidebar')"
        class="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
      >
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Logo -->
      <div class="flex items-center">
        <div class="flex-shrink-0 flex items-center">
          <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">F</span>
          </div>
          <span class="ml-2 text-xl font-semibold text-gray-900 hidden sm:block">Fusepoint</span>
        </div>
      </div>

      <!-- User menu -->
      <div class="flex items-center space-x-4">
        <!-- Currency Selector -->
        <CurrencySelector />
        
        <!-- Notifications via NotificationCenter -->
        <NotificationCenter />

        <!-- User dropdown -->
        <div class="relative">
          <button
            @click="showUserMenu = !showUserMenu"
            class="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span class="text-gray-600 font-medium text-sm">{{ userInitials }}</span>
            </div>
            <span class="hidden md:block text-gray-700 font-medium">{{ userName }}</span>
            <svg class="hidden md:block h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown menu -->
          <div
            v-if="showUserMenu"
            class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
          >
            <div class="px-4 py-2 border-b border-gray-100">
              <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
              <p class="text-xs text-gray-500">{{ userEmail }}</p>
            </div>
            <router-link
              to="/settings"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click="showUserMenu = false"
            >
              Paramètres
            </router-link>
            <a
              href="#"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Aide
            </a>
            <hr class="my-1">
            <button
              @click="logout"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import authService from '@/services/authService';
import NotificationCenter from '@/components/NotificationCenter.vue';
import CurrencySelector from '@/components/CurrencySelector.vue';

export default {
  name: 'Header',
  components: {
    NotificationCenter,
    CurrencySelector
  },
  emits: ['toggle-sidebar'],
  data() {
    return {
      showUserMenu: false,
      user: null
    }
  },
  computed: {
    userName() {
      if (this.user) {
        return `${this.user.firstName} ${this.user.lastName}`;
      }
      return localStorage.getItem('userName') || 'Utilisateur';
    },
    userEmail() {
      return this.user?.email || localStorage.getItem('userEmail') || '';
    },
    userInitials() {
      if (this.user) {
        const firstName = this.user.firstName || '';
        const lastName = this.user.lastName || '';
        return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
      }
      const name = this.userName;
      return name.charAt(0).toUpperCase() + (name.charAt(1) || '').toUpperCase();
    }
  },
  methods: {
    async logout() {
      try {
        await authService.logout();
        this.$router.push('/login');
      } catch (error) {
        console.error('❌ Erreur déconnexion:', error);
        // Forcer la déconnexion même en cas d'erreur
        authService.clearTokens();
        authService.clearUser();
        this.$router.push('/login');
      }
    },
    
    loadUserData() {
      this.user = authService.getUser();
    }
  },
  mounted() {
    // Charger les données utilisateur
    this.loadUserData();
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.showUserMenu = false;
      }
    });
  },
  
  watch: {
    // Surveiller les changements de route pour recharger les données utilisateur
    '$route'() {
      this.loadUserData();
    }
  }
}
</script>