<template>
  <header class="header">
    <div class="header-container">
      <!-- Mobile menu button -->
      <button
        @click="$emit('toggle-sidebar')"
        class="btn-icon md:hidden"
      >
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Logo -->
      <div class="flex items-center">
        <div class="flex-shrink-0 flex items-center">
          <div class="logo-icon">
            <span class="text-white font-bold text-sm">F</span>
          </div>
          <span class="logo-text">Fusepoint</span>
        </div>
      </div>

      <!-- User menu -->
      <div class="header-actions">
        <!-- Language Selector -->
        <LanguageSelector />
        
        <!-- Notifications via NotificationCenter -->
        <NotificationCenter />

        <!-- User dropdown -->
        <div class="dropdown">
          <button
            @click="showUserMenu = !showUserMenu"
            class="user-menu-trigger"
          >
            <div class="avatar">
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
            class="dropdown-menu"
          >
            <div class="dropdown-header">
              <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
              <p class="text-xs text-gray-500">{{ userEmail }}</p>
            </div>
            <router-link
              to="/settings"
              class="dropdown-item"
              @click="showUserMenu = false"
            >
              {{ $t('navigation.settings') }}
            </router-link>
            <a
              href="#"
              class="dropdown-item"
            >
              {{ $t('interface.Aide') }}
            </a>
            <hr class="my-1">
            <button
              @click="logout"
              class="dropdown-item w-full text-left"
            >
              {{ $t('navigation.logout') }}
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
import LanguageSelector from '@/components/LanguageSelector.vue';

export default {
  name: 'Header',
  components: {
    NotificationCenter,
    LanguageSelector
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