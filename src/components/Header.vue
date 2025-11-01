<template>
  <header class="header">
    <div class="header-container">
    <!-- Bouton menu (mobile) collé à gauche -->
    <button
      class="btn-icon md:hidden mr-2"
      type="button"
      aria-label="Ouvrir le menu"
      @click.stop.prevent="openMobileMenu"
    >
      <i class="fas fa-bars text-2xl"></i>
    </button>
    <!-- Logo -->
      <router-link to="/dashboard" class="flex items-center" aria-label="Aller au tableau de bord">
        <div class="flex-shrink-0 flex items-center">
          <div class="logo-icon cursor-pointer">
            <span class="text-white font-bold text-sm">F</span>
          </div>
          <span class="logo-text">Fusepoint</span>
        </div>
      </router-link>

      <!-- User menu -->
      <div class="header-actions">
         <!-- Language Selector -->
          <LanguageSelector />
           
            <!-- Notifications via NotificationCenter -->
         <NotificationCenter />
         <button v-if="showPushIcon" class="hidden md:inline-flex ml-2 btn-icon text-blue-600 hover:text-blue-800 animate-pulse" @click="enablePush" title="Activer les notifications">
           <i class="fas fa-bell text-xl"></i>
         </button>
        <!-- User dropdown -->
        <div class="dropdown">
          <button
            @click.stop="onUserMenuTrigger"
            @keydown.enter.prevent="onUserMenuTrigger"
            class="user-menu-trigger"
            :aria-expanded="showUserMenu ? 'true' : 'false'"
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

    <!-- Mobile full-screen menu -->
    <div v-if="isMobileMenuOpen" class="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900" role="dialog" aria-labelledby="mobileMenuTitle" aria-modal="true">
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h2 id="mobileMenuTitle" class="sr-only">Menu principal</h2>
        <router-link to="/dashboard" class="flex items-center" @click="closeMobileMenu" aria-label="Aller au tableau de bord">
          <div class="logo-icon cursor-pointer">
            <span class="text-white font-bold text-base">F</span>
          </div>
          <span class="ml-2 text-2xl font-bold text-gray-900 dark:text-white">Fusepoint</span>
        </router-link>
        <button class="btn-icon" aria-label="Fermer" @click="closeMobileMenu">
          <i class="fas fa-times text-2xl"></i>
        </button>
      </div>
      <nav class="flex-1 overflow-y-auto px-5 py-6 space-y-4">
        <!-- Navigation principale visible pour tous -->
        <router-link to="/dashboard" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
          <i class="fas fa-home mr-3 text-2xl"></i> Tableau de bord
        </router-link>
        <router-link to="/linkpoints" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
          <i class="fas fa-link mr-3 text-2xl"></i> LinkPoints
        </router-link>
        <router-link to="/analytics" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
          <i class="fas fa-chart-bar mr-3 text-2xl"></i> Analytics
        </router-link>
        <router-link to="/services" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
          <i class="fas fa-cogs mr-3 text-2xl"></i> Services
        </router-link>
        <router-link to="/projects" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
          <i class="fas fa-diagram-project mr-3 text-2xl"></i> Projets
        </router-link>
        <router-link to="/marketing" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
          <i class="fas fa-bullhorn mr-3 text-2xl"></i> Marketing
        </router-link>
        <router-link to="/reports" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
          <i class="fas fa-chart-line mr-3 text-2xl"></i> Rapports
        </router-link>

        <!-- Section Agent -->
        <template v-if="isAgent">
          <router-link to="/agent" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
            <i class="fas fa-user-tie mr-3 text-2xl"></i> Tableau de Bord Agent
          </router-link>
          <router-link to="/agent/projects" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
            <i class="fas fa-users-gear mr-3 text-2xl"></i> Gestion des clients
          </router-link>
          <router-link to="/agent/project-templates" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
            <i class="fas fa-copy mr-3 text-2xl"></i> Modèles de Projets
          </router-link>
          <router-link to="/agent/service-requests" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
            <i class="fas fa-clipboard-list mr-3 text-2xl"></i> Demandes Service
          </router-link>
          <router-link to="/agent/prestataires" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
            <i class="fas fa-people-arrows mr-3 text-2xl"></i> Prestataires
          </router-link>
          <router-link to="/agent/reports" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
            <i class="fas fa-file-alt mr-3 text-2xl"></i> Rapports Agent
          </router-link>
          <router-link to="/agent/clients" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
            <i class="fas fa-users mr-3 text-2xl"></i> Base client
          </router-link>
        </template>

        <!-- Section Gestion/Admin: visible pour tous sauf client -->
        <template v-if="!isClient">
          <router-link to="/integrations" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
            <i class="fas fa-plug mr-3 text-2xl"></i> Intégrations
          </router-link>
          <router-link to="/agent/widgets-library" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
            <i class="fas fa-th mr-3 text-2xl"></i> Librairie de Widgets
          </router-link>
          <router-link to="/management/services" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
            <i class="fas fa-tools mr-3 text-2xl"></i> Gestion des Services
          </router-link>
          <router-link to="/team" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
            <i class="fas fa-user-friends mr-3 text-2xl"></i> Équipe
          </router-link>
          <router-link to="/settings" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
            <i class="fas fa-user-cog mr-3 text-2xl"></i> Mon Compte
          </router-link>
          <router-link to="/billing" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
            <i class="fas fa-file-invoice-dollar mr-3 text-2xl"></i> Facturation
          </router-link>
        </template>

        <!-- Section Super Admin -->
        <template v-if="isSuperAdmin">
          <router-link to="/super-admin" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
            <i class="fas fa-shield-alt mr-3 text-2xl"></i> Tableau de Bord Super Admin
          </router-link>
          <router-link to="/admin/widgets" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
            <i class="fas fa-th-large mr-3 text-2xl"></i> Gestion des Widgets
          </router-link>
        </template>

        <!-- Paramètres généraux (visible pour tous) -->
        <router-link to="/settings" class="block px-5 py-4 text-xl font-semibold rounded-xl hover:bg-gray-50 dark:hoverbg-gray-800">
          <i class="fas fa-sliders-h mr-3 text-2xl"></i> Paramètres
        </router-link>
      </nav>
      <div class="px-5 pb-6">
        <button @click="logout" class="w-full px-5 py-4 rounded-xl bg-gray-900 text-white hover:bg-black text-xl">
          <i class="fas fa-sign-out-alt mr-2 text-2xl"></i> Déconnexion
        </button>
      </div>
    </div>
  </header>
  <!-- Modale paramètres utilisateur (mobile) -->
  <div v-if="isUserModalOpen" class="fixed inset-0 z-50 md:hidden">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="isUserModalOpen = false"></div>
    <div class="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-xl">
      <div class="px-5 pt-4 pb-2 flex items-center justify-between border-b">
        <div class="flex items-center">
          <div class="avatar mr-3">
            <span class="text-gray-600 font-medium text-sm">{{ userInitials }}</span>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
            <p class="text-xs text-gray-500">{{ userEmail }}</p>
          </div>
        </div>
        <button class="btn-icon" aria-label="Fermer" @click="isUserModalOpen = false">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      <div class="px-5 py-4 space-y-2">
        <router-link to="/settings" class="block px-4 py-3 rounded-lg hover:bg-gray-50" @click="isUserModalOpen = false">
          <i class="fas fa-sliders-h mr-3"></i> Paramètres
        </router-link>
        <a href="#" class="block px-4 py-3 rounded-lg hover:bg-gray-50">
          <i class="fas fa-circle-question mr-3"></i> Aide
        </a>
        <button @click="logout" class="w-full px-4 py-3 rounded-lg bg-gray-900 text-white hover:bg-black">
          <i class="fas fa-sign-out-alt mr-2"></i> Déconnexion
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService';
import NotificationCenter from '@/components/NotificationCenter.vue';
import LanguageSelector from '@/components/LanguageSelector.vue';
import { useAuthStore } from '@/stores/auth';
import { computed } from 'vue';
import { ensureSubscribed, isPushSupported } from '@/services/pushNotifications.js';

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
      user: null,
      isMobileMenuOpen: false,
      isUserModalOpen: false,
      _handleEsc: null,
      pushEnabled: false,
      pushSupported: true
    }
  },
  setup() {
    const authStore = useAuthStore();
    const isAgent = authStore.isAgent;
    const isSuperAdmin = authStore.isSuperAdmin;
    const isClient = computed(() => authStore.userRole === 'client' || authStore.user?.role === 'client');
    return { isAgent, isSuperAdmin, isClient };
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
    },
    showPushIcon() {
      return this.pushSupported && !this.pushEnabled;
    }
  },
  methods: {
    onUserMenuTrigger() {
      // Sur mobile, ouvrir la modale; sur desktop, basculer le dropdown
      if (window.innerWidth < 768) {
        this.isUserModalOpen = true;
        this.showUserMenu = false;
        return;
      }
      this.showUserMenu = !this.showUserMenu;
    },
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
    },
    openMobileMenu() {
      this.isMobileMenuOpen = true;
      try {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
      } catch (e) {}
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false;
      try {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      } catch (e) {}
    },
    async enablePush() {
      try {
        const supported = await isPushSupported();
        if (!supported) {
          this.pushSupported = false;
          this.$toast && this.$toast.error('Notifications push non supportées sur cet appareil');
          return;
        }
        const res = await ensureSubscribed();
        if (res.success) {
          this.pushEnabled = true;
          this.$toast && this.$toast.success('Notifications push activées');
        } else {
          this.$toast && this.$toast.error(res.error || 'Échec activation des notifications');
        }
      } catch (e) {
        this.$toast && this.$toast.error('Erreur activation des notifications');
      }
    }
  },
  mounted() {
    // Charger les données utilisateur
    this.loadUserData();

    // Déterminer support + état permission au montage
    (async () => {
      try {
        this.pushSupported = await isPushSupported();
      } catch (e) {
        this.pushSupported = false;
      }
      try {
        this.pushEnabled = typeof Notification !== 'undefined' && Notification.permission === 'granted';
      } catch (e) {
        this.pushEnabled = false;
      }
    })();
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown')) {
        this.showUserMenu = false;
      }
    });

    // Fermer le menu sur ESC
    this._handleEsc = (e) => {
      if (e.key === 'Escape') {
        this.closeMobileMenu();
        this.isUserModalOpen = false;
        this.showUserMenu = false;
      }
    };
    window.addEventListener('keydown', this._handleEsc);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this._handleEsc);
  },
  
  watch: {
    // Surveiller les changements de route pour recharger les données utilisateur
    '$route'() {
      this.loadUserData();
      // Fermer les menus lors d’un changement de route
      this.closeMobileMenu();
      this.isUserModalOpen = false;
      this.showUserMenu = false;
    }
  }
}
</script>

<style>
/* Styles spécifiques au header sont gérés via Tailwind et src/style.css */
</style>