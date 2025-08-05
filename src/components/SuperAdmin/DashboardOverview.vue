<template>
  <div class="dashboard-overview">
    <!-- Statistiques générales -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon users">
          <font-awesome-icon icon="users" />
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ data?.stats?.total_users || 0 }}</h3>
          <p class="stat-label">Utilisateurs Total</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon agents">
          <font-awesome-icon icon="user-tie" />
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ data?.stats?.active_agents || 0 }}</h3>
          <p class="stat-label">Agents Actifs</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon admins">
          <font-awesome-icon icon="shield-alt" />
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ data?.stats?.super_admins || 0 }}</h3>
          <p class="stat-label">Super Admins</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon sessions">
          <font-awesome-icon icon="clock" />
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ data?.stats?.active_sessions || 0 }}</h3>
          <p class="stat-label">Sessions Actives</p>
        </div>
      </div>
    </div>

    <!-- Graphiques et métriques -->
    <div class="metrics-grid">
      <!-- Activité récente -->
      <div class="metric-card">
        <div class="card-header">
          <h3 class="card-title">
            <font-awesome-icon icon="chart-line" />
            Activité Récente
          </h3>
          <button @click="$emit('refresh')" class="btn-refresh" :disabled="loading">
            <font-awesome-icon :icon="loading ? 'spinner' : 'sync-alt'" :class="{ 'fa-spin': loading }" />
          </button>
        </div>
        <div class="card-content">
          <div v-if="loading" class="loading-state">
            <font-awesome-icon icon="spinner" class="fa-spin" />
            <p>Chargement des données...</p>
          </div>
          <div v-else-if="data?.recent_activity?.length" class="activity-list">
            <div 
              v-for="activity in data.recent_activity.slice(0, 5)" 
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-icon">
                <font-awesome-icon :icon="getActivityIcon(activity.action_type)" />
              </div>
              <div class="activity-content">
                <p class="activity-description">{{ activity.description }}</p>
                <p class="activity-meta">
                  <span class="activity-user">{{ activity.first_name }} {{ activity.last_name }}</span>
                  <span class="activity-time">{{ formatDate(activity.created_at) }}</span>
                </p>
              </div>
              <div class="activity-status">
                <span :class="['status-badge', getStatusClass(activity.status_code)]">
                  {{ activity.status_code }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <font-awesome-icon icon="info-circle" />
            <p>Aucune activité récente</p>
          </div>
        </div>
      </div>

      <!-- Santé du système -->
      <div class="metric-card">
        <div class="card-header">
          <h3 class="card-title">
            <font-awesome-icon icon="heartbeat" />
            Santé du Système
          </h3>
        </div>
        <div class="card-content">
          <div class="health-metrics">
            <div class="health-item">
              <div class="health-label">CPU</div>
              <div class="health-bar">
                <div 
                  class="health-progress" 
                  :style="{ width: `${data?.system_health?.cpu_usage || 0}%` }"
                  :class="getHealthClass(data?.system_health?.cpu_usage || 0)"
                ></div>
              </div>
              <div class="health-value">{{ (data?.system_health?.cpu_usage || 0).toFixed(1) }}%</div>
            </div>
            
            <div class="health-item">
              <div class="health-label">Mémoire</div>
              <div class="health-bar">
                <div 
                  class="health-progress" 
                  :style="{ width: `${data?.system_health?.memory_usage || 0}%` }"
                  :class="getHealthClass(data?.system_health?.memory_usage || 0)"
                ></div>
              </div>
              <div class="health-value">{{ (data?.system_health?.memory_usage || 0).toFixed(1) }}%</div>
            </div>
            
            <div class="health-item">
              <div class="health-label">Stockage</div>
              <div class="health-bar">
                <div 
                  class="health-progress" 
                  :style="{ width: `${data?.system_health?.disk_usage || 0}%` }"
                  :class="getHealthClass(data?.system_health?.disk_usage || 0)"
                ></div>
              </div>
              <div class="health-value">{{ (data?.system_health?.disk_usage || 0).toFixed(1) }}%</div>
            </div>
          </div>
          
          <div class="system-status">
            <div class="status-item">
              <span class="status-label">Statut Global:</span>
              <span :class="['status-badge', getSystemStatusClass(data?.system_health?.overall_status)]">
                {{ data?.system_health?.overall_status || 'Inconnu' }}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">Temps de fonctionnement:</span>
              <span class="status-value">{{ formatUptime(data?.system_health?.uptime) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions rapides -->
    <div class="quick-actions">
      <h3 class="section-title">
        <font-awesome-icon icon="rocket" />
        Actions Rapides
      </h3>
      <div class="actions-grid">
        <router-link to="/super-admin?tab=1" class="action-card">
          <div class="action-icon">
            <font-awesome-icon icon="cog" />
          </div>
          <div class="action-content">
            <h4>Paramètres Plateforme</h4>
            <p>Configurer les paramètres globaux</p>
          </div>
        </router-link>
        
        <router-link to="/super-admin?tab=2" class="action-card">
          <div class="action-icon">
            <font-awesome-icon icon="shield-alt" />
          </div>
          <div class="action-content">
            <h4>Gestion Permissions</h4>
            <p>Administrer les rôles et permissions</p>
          </div>
        </router-link>
        
        <router-link to="/super-admin?tab=3" class="action-card">
          <div class="action-icon">
            <font-awesome-icon icon="clipboard-list" />
          </div>
          <div class="action-content">
            <h4>Logs Système</h4>
            <p>Consulter l'activité du système</p>
          </div>
        </router-link>
        
        <button @click="createBackup" class="action-card action-button" :disabled="backupLoading">
          <div class="action-icon">
            <font-awesome-icon :icon="backupLoading ? 'spinner' : 'download'" :class="{ 'fa-spin': backupLoading }" />
          </div>
          <div class="action-content">
            <h4>Créer Sauvegarde</h4>
            <p>Sauvegarder le système</p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'DashboardOverview',
  props: {
    data: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['refresh'],
  setup(props, { emit }) {
    const backupLoading = ref(false);

    const getActivityIcon = (actionType) => {
      const icons = {
        'platform_settings_update': 'cog',
        'user_management': 'users',
        'permission_change': 'shield-alt',
        'system_backup': 'download',
        'login': 'sign-in-alt',
        'logout': 'sign-out-alt',
        'default': 'info-circle'
      };
      return icons[actionType] || icons.default;
    };

    const getStatusClass = (statusCode) => {
      if (statusCode >= 200 && statusCode < 300) return 'success';
      if (statusCode >= 400 && statusCode < 500) return 'warning';
      if (statusCode >= 500) return 'error';
      return 'info';
    };

    const getHealthClass = (percentage) => {
      if (percentage < 70) return 'good';
      if (percentage < 85) return 'warning';
      return 'critical';
    };

    const getSystemStatusClass = (status) => {
      const statusMap = {
        'healthy': 'success',
        'warning': 'warning',
        'critical': 'error',
        'degraded': 'warning'
      };
      return statusMap[status?.toLowerCase()] || 'info';
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'Date inconnue';
      return new Date(dateString).toLocaleString('fr-FR');
    };

    const formatUptime = (seconds) => {
      if (!seconds) return 'Inconnu';
      
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      
      if (days > 0) {
        return `${days}j ${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${minutes}m`;
      }
    };

    const createBackup = async () => {
      try {
        backupLoading.value = true;
        
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/super-admin/system/backup', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        // Actualiser les données après la sauvegarde
        emit('refresh');
        
        // Notification de succès (vous pouvez ajouter un système de notification)
        console.log('Sauvegarde créée avec succès');
        
      } catch (error) {
        console.error('Erreur création sauvegarde:', error);
        // Gestion d'erreur (vous pouvez ajouter un système de notification)
      } finally {
        backupLoading.value = false;
      }
    };

    return {
      backupLoading,
      getActivityIcon,
      getStatusClass,
      getHealthClass,
      getSystemStatusClass,
      formatDate,
      formatUptime,
      createBackup
    };
  }
};
</script>

<style scoped>
.dashboard-overview {
  space-y: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 24px;
  color: white;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.stat-label {
  color: rgba(255, 255, 255, 0.9);
  margin: 4px 0 0 0;
  font-size: 0.9rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-refresh {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.btn-refresh:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.1);
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-content {
  padding: 24px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #718096;
}

.loading-state .fa-spin {
  font-size: 2rem;
  margin-bottom: 16px;
}

.activity-list {
  space-y: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f7fafc;
  margin-bottom: 12px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-description {
  font-weight: 500;
  color: #2d3748;
  margin: 0 0 4px 0;
}

.activity-meta {
  font-size: 0.8rem;
  color: #718096;
  margin: 0;
  display: flex;
  gap: 12px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.success {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.warning {
  background: #fef5e7;
  color: #c05621;
}

.status-badge.error {
  background: #fed7d7;
  color: #c53030;
}

.status-badge.info {
  background: #e6fffa;
  color: #234e52;
}

.health-metrics {
  space-y: 16px;
  margin-bottom: 24px;
}

.health-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.health-label {
  width: 80px;
  font-weight: 500;
  color: #4a5568;
}

.health-bar {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.health-progress {
  height: 100%;
  transition: width 0.3s ease;
}

.health-progress.good {
  background: #48bb78;
}

.health-progress.warning {
  background: #ed8936;
}

.health-progress.critical {
  background: #e53e3e;
}

.health-value {
  width: 50px;
  text-align: right;
  font-weight: 600;
  color: #2d3748;
}

.system-status {
  space-y: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.status-label {
  font-weight: 500;
  color: #4a5568;
}

.status-value {
  color: #2d3748;
  font-weight: 600;
}

.quick-actions {
  margin-top: 32px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  width: 100%;
}

.action-card:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.action-card:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.action-content h4 {
  margin: 0 0 4px 0;
  font-weight: 600;
  color: #2d3748;
}

.action-content p {
  margin: 0;
  color: #718096;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .card-content {
    padding: 16px;
  }
}
</style>