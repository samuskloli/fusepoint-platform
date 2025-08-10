<template>
  <div class="admin-users">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- En-tête avec navigation -->
      <div class="mb-8">
        <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <router-link to="/admin" class="hover:text-gray-700">
            {{ $t('admin.dashboard.title') }}
          </router-link>
          <font-awesome-icon icon="chevron-right" class="h-3 w-3" />
          <span class="text-gray-900 font-medium">{{ $t('admin.userManagement.title') }}</span>
        </nav>
        
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ $t('admin.userManagement.title') }}</h1>
            <p class="text-gray-600 mt-2">
              {{ $t('admin.userManagement.subtitle') }}
            </p>
          </div>
          
          <!-- Actions rapides -->
          <div class="flex space-x-3">
            <button
              @click="refreshUsers"
              :disabled="isRefreshing"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <font-awesome-icon 
                :icon="'sync-alt'" 
                :class="['mr-2 h-4 w-4', { 'animate-spin': isRefreshing }]" 
              />
              {{ $t('common.refresh') }}
            </button>
            
            <router-link
              to="/admin"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <font-awesome-icon icon="arrow-left" class="mr-2 h-4 w-4" />
              {{ $t('admin.dashboard.backToDashboard') }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- Statistiques rapides -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <font-awesome-icon icon="users" class="h-6 w-6 text-blue-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    {{ $t('admin.dashboard.totalUsers') }}
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.totalUsers }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <font-awesome-icon icon="user-check" class="h-6 w-6 text-green-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    {{ $t('admin.dashboard.activeUsers') }}
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.activeUsers }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <font-awesome-icon icon="user-tie" class="h-6 w-6 text-yellow-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    {{ $t('admin.dashboard.agents') }}
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.agents }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <font-awesome-icon icon="crown" class="h-6 w-6 text-purple-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    {{ $t('admin.dashboard.admins') }}
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.admins }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Composant de gestion des utilisateurs -->
      <div class="bg-white rounded-lg shadow">
        <AdminUserManager ref="userManager" @stats-updated="updateStats" />
      </div>
    </div>
  </div>
</template>

<script>
import AdminUserManager from '../components/Admin/AdminUserManager.vue';
import adminAPI from '../services/adminAPI.js';

export default {
  name: 'AdminUsers',
  components: {
    AdminUserManager
  },
  data() {
    return {
      isRefreshing: false,
      stats: {
        totalUsers: 0,
        activeUsers: 0,
        agents: 0,
        admins: 0
      }
    };
  },
  
  async mounted() {
    await this.loadStats();
  },
  
  methods: {
    async loadStats() {
      try {
        // Charger les statistiques via l'API admin
        const response = await adminAPI.getUsers({ limit: 1000 }); // Récupérer tous les utilisateurs pour les stats
        const users = response.users || [];
        
        this.updateStatsFromUsers(users);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    },
    
    updateStatsFromUsers(users) {
      this.stats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.is_active).length,
        agents: users.filter(u => u.role === 'agent').length,
        admins: users.filter(u => u.role === 'admin').length
      };
    },
    
    updateStats(newStats) {
      this.stats = { ...this.stats, ...newStats };
    },
    
    async refreshUsers() {
      this.isRefreshing = true;
      try {
        // Rafraîchir les données du composant UserManager
        if (this.$refs.userManager && this.$refs.userManager.loadUsers) {
          await this.$refs.userManager.loadUsers();
        }
        
        // Recharger les statistiques
        await this.loadStats();
        
        // Afficher un message de succès
        this.$toast?.success?.(this.$t('admin.userManagement.success.dataRefreshed'));
      } catch (error) {
        console.error('Erreur lors du rafraîchissement:', error);
        this.$toast?.error?.(this.$t('admin.userManagement.errors.refreshFailed'));
      } finally {
        this.isRefreshing = false;
      }
    }
  }
};
</script>

<style scoped>
.admin-users {
  min-height: 100vh;
  background-color: #f9fafb;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}
</style>