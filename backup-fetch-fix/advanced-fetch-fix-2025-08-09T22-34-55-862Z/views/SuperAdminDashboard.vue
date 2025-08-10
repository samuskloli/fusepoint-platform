<template>
  <div class="super-admin-dashboard">
    <!-- En-tête -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="dashboard-title">
            <font-awesome-icon icon="shield-alt" class="title-icon" />
            Tableau de Bord Super Administrateur
          </h1>
          <p class="dashboard-subtitle">
            Gestion complète de la plateforme Fusepoint
          </p>
        </div>
        <div class="header-actions">
          <button 
            @click="refreshData" 
            :disabled="loading"
            class="btn btn-outline"
          >
            <font-awesome-icon 
              :icon="loading ? 'spinner' : 'sync-alt'" 
              :class="{ 'fa-spin': loading }"
            />
            Actualiser
          </button>
        </div>
      </div>
    </div>

    <!-- Alertes -->
    <div v-if="error" class="alert alert-error">
      <font-awesome-icon icon="exclamation-triangle" />
      {{ error }}
    </div>

    <!-- Navigation par onglets -->
    <div class="tabs-container">
      <div class="tabs-nav">
        <button 
          v-for="(tab, index) in tabs" 
          :key="index"
          @click="currentTab = index"
          :class="['tab-button', { active: currentTab === index }]"
        >
          <font-awesome-icon :icon="tab.icon" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Contenu des onglets -->
    <div class="tab-content">
      <!-- Onglet Tableau de Bord -->
      <div v-if="currentTab === 0" class="tab-panel">
        <DashboardOverview 
          :data="dashboardData" 
          :loading="loading" 
          @refresh="loadDashboardData"
        />
      </div>

      <!-- Onglet Paramètres de la Plateforme -->
      <div v-if="currentTab === 1" class="tab-panel">
        <PlatformSettings />
      </div>

      <!-- Onglet Blocs de Paramètres -->
      <div v-if="currentTab === 2" class="tab-panel">
        <PlatformSettingsBlocks />
      </div>

      <!-- Onglet Gestion des Permissions -->
      <div v-if="currentTab === 3" class="tab-panel">
        <PermissionsManager />
      </div>

      <!-- Onglet Gestion des Utilisateurs -->
      <div v-if="currentTab === 4" class="tab-panel">
        <UserManager />
      </div>

      <!-- Onglet Logs Système -->
        <div v-if="currentTab === 5" class="tab-panel">
          <SystemLogs />
        </div>

        <!-- Onglet Santé Système -->
        <div v-if="currentTab === 6" class="tab-panel">
          <SystemHealth />
        </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getSuperAdminUser } from '../middleware/superAdminAuth.js';
import authService from '@/services/authService';
import DashboardOverview from '../components/SuperAdmin/DashboardOverview.vue';
import PlatformSettings from '../components/SuperAdmin/PlatformSettings.vue';
import PlatformSettingsBlocks from '../components/SuperAdmin/PlatformSettingsBlocks.vue';
import PermissionsManager from '../components/SuperAdmin/PermissionsManager.vue';
import UserManager from '../components/SuperAdmin/UserManager.vue';
import SystemLogs from '../components/SuperAdmin/SystemLogs.vue';
import SystemHealth from '../components/SuperAdmin/SystemHealth.vue';

export default {
  name: 'SuperAdminDashboard',
  components: {
    DashboardOverview,
    PlatformSettings,
    PlatformSettingsBlocks,
    PermissionsManager,
    UserManager,
    SystemLogs,
    SystemHealth
  },
  setup() {
    const router = useRouter();
    const currentTab = ref(0);
    const dashboardData = ref(null);
    const loading = ref(true);
    const error = ref(null);

    const tabs = [
      { label: 'Tableau de Bord', icon: 'tachometer-alt' },
      { label: 'Paramètres Plateforme', icon: 'cog' },
      { label: 'Blocs de Paramètres', icon: 'th-large' },
      { label: 'Permissions', icon: 'shield-alt' },
      { label: 'Utilisateurs', icon: 'users' },
      { label: 'Logs Système', icon: 'clipboard-list' },
      { label: 'Santé Système', icon: 'heartbeat' }
    ];

    const user = computed(() => getSuperAdminUser());

    const loadDashboardData = async () => {
      try {
        loading.value = true;
        error.value = null;

        const response = await authService.getApiInstance().get('/super-admin/dashboard');
        dashboardData.value = response.data.data;

      } catch (err) {
        console.error('Erreur chargement données:', err);
        error.value = 'Erreur lors du chargement des données du tableau de bord';
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          // Token invalide ou accès refusé
          router.push('/login');
        }
      } finally {
        loading.value = false;
      }
    };

    const refreshData = () => {
      loadDashboardData();
    };

    onMounted(() => {
      // Vérifier l'accès Super Admin
      if (!user.value) {
        router.push('/login');
        return;
      }

      loadDashboardData();
    });

    return {
      currentTab,
      tabs,
      dashboardData,
      loading,
      error,
      user,
      loadDashboardData,
      refreshData
    };
  }
};
</script>

<style scoped>
.super-admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 24px;
  position: relative;
}

.super-admin-dashboard::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 103, 103, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

.dashboard-header {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 8px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.dashboard-title {
  font-size: 2.2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #e74c3c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  letter-spacing: -0.5px;
}

.title-icon {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(231, 76, 60, 0.3));
}

.dashboard-subtitle {
  color: #64748b;
  margin: 12px 0 0 0;
  font-size: 1.15rem;
  font-weight: 500;
  opacity: 0.8;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
}

.btn-outline {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.05) 0%, rgba(22, 33, 62, 0.05) 100%);
  border: 2px solid transparent;
  background-clip: padding-box;
  color: #1a1a2e;
  position: relative;
}

.btn-outline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 10px;
  padding: 2px;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
}

.btn-outline:hover:not(:disabled) {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(26, 26, 46, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
}

.alert-error {
  background: #fed7d7;
  color: #c53030;
  border: 1px solid #feb2b2;
}

.tabs-container {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  margin-bottom: 32px;
  box-shadow: 
    0 16px 32px rgba(0, 0, 0, 0.12),
    0 4px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.tabs-nav {
  display: flex;
  overflow-x: auto;
  border-bottom: 1px solid #e2e8f0;
}

.tab-button {
  padding: 18px 28px;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: #64748b;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  border-bottom: 3px solid transparent;
  position: relative;
  font-size: 0.95rem;
}

.tab-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.03) 0%, rgba(22, 33, 62, 0.03) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tab-button:hover {
  color: #1a1a2e;
  transform: translateY(-1px);
}

.tab-button:hover::before {
  opacity: 1;
}

.tab-button.active {
  color: #1a1a2e;
  border-bottom-color: #e74c3c;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.05) 0%, rgba(231, 76, 60, 0.05) 100%);
  font-weight: 700;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 3px;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  border-radius: 2px 2px 0 0;
  box-shadow: 0 -2px 8px rgba(231, 76, 60, 0.3);
}

.tab-content {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 8px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-height: 650px;
  position: relative;
  z-index: 1;
}

.tab-panel {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .super-admin-dashboard {
    padding: 12px;
  }
  
  .dashboard-header {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .dashboard-title {
    font-size: 1.5rem;
  }
  
  .tabs-nav {
    flex-wrap: wrap;
  }
  
  .tab-button {
    padding: 12px 16px;
    font-size: 0.9rem;
  }
  
  .tab-content {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .dashboard-title {
    font-size: 1.3rem;
  }
  
  .tab-button {
    padding: 10px 12px;
    font-size: 0.8rem;
  }
}
</style>