<template>
  <div class="admin-dashboard">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- En-tête -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">{{ $t('admin.dashboard.title') }}</h1>
        <p class="text-gray-600 mt-2">
          {{ $t('admin.dashboard.subtitle') }}
        </p>
      </div>

      <!-- Navigation par onglets -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            <font-awesome-icon :icon="tab.icon" class="mr-2" />
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Contenu des onglets -->
      <div class="tab-content">
        <!-- Gestion des utilisateurs -->
        <div v-if="activeTab === 'users'">
          <AdminUserManager />
        </div>

        <!-- Statistiques -->
        <div v-if="activeTab === 'stats'" class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            {{ $t('admin.dashboard.statistics') }}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <font-awesome-icon icon="users" class="h-6 w-6 text-blue-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-blue-600">{{ $t('admin.dashboard.totalUsers') }}</p>
                  <p class="text-2xl font-semibold text-blue-900">{{ stats.totalUsers || 0 }}</p>
                </div>
              </div>
            </div>
            
            <div class="bg-green-50 p-4 rounded-lg">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <font-awesome-icon icon="user-check" class="h-6 w-6 text-green-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-green-600">{{ $t('admin.dashboard.activeUsers') }}</p>
                  <p class="text-2xl font-semibold text-green-900">{{ stats.activeUsers || 0 }}</p>
                </div>
              </div>
            </div>
            
            <div class="bg-yellow-50 p-4 rounded-lg">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <font-awesome-icon icon="user-tie" class="h-6 w-6 text-yellow-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-yellow-600">{{ $t('admin.dashboard.agents') }}</p>
                  <p class="text-2xl font-semibold text-yellow-900">{{ stats.agents || 0 }}</p>
                </div>
              </div>
            </div>
            
            <div class="bg-purple-50 p-4 rounded-lg">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <font-awesome-icon icon="crown" class="h-6 w-6 text-purple-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-purple-600">{{ $t('admin.dashboard.admins') }}</p>
                  <p class="text-2xl font-semibold text-purple-900">{{ stats.admins || 0 }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Paramètres -->
        <div v-if="activeTab === 'settings'" class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            {{ $t('admin.dashboard.settings') }}
          </h2>
          <p class="text-gray-600">
            {{ $t('admin.dashboard.settingsDescription') }}
          </p>
          <!-- Ici vous pouvez ajouter des paramètres spécifiques aux administrateurs -->
        </div>

        <!-- Logs -->
        <div v-if="activeTab === 'logs'" class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            {{ $t('admin.dashboard.systemLogs') }}
          </h2>
          <p class="text-gray-600">
            {{ $t('admin.dashboard.logsDescription') }}
          </p>
          <!-- Ici vous pouvez ajouter l'affichage des logs -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminUserManager from '../components/Admin/AdminUserManager.vue';
import adminAPI from '../services/adminAPI.js';

export default {
  name: 'Admin',
  components: {
    AdminUserManager
  },
  data() {
    return {
      activeTab: 'users',
      stats: {
        totalUsers: 0,
        activeUsers: 0,
        agents: 0,
        admins: 0
      },
      tabs: [
        {
          id: 'users',
          label: this.$t('admin.dashboard.tabs.users'),
          icon: 'users'
        },
        {
          id: 'stats',
          label: this.$t('admin.dashboard.tabs.statistics'),
          icon: 'chart-bar'
        },
        {
          id: 'settings',
          label: this.$t('admin.dashboard.tabs.settings'),
          icon: 'cog'
        },
        {
          id: 'logs',
          label: this.$t('admin.dashboard.tabs.logs'),
          icon: 'file-alt'
        }
      ]
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
        
        this.stats = {
          totalUsers: users.length,
          activeUsers: users.filter(u => u.is_active).length,
          agents: users.filter(u => u.role === 'agent').length,
          admins: users.filter(u => u.role === 'admin').length
        };
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    }
  }
};
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background-color: #f9fafb;
}

.tab-content {
  min-height: 500px;
}

.transition-colors {
  transition: color 0.2s ease-in-out, border-color 0.2s ease-in-out;
}
</style>