<template>
  <div class="system-health">
    <!-- En-tête -->
    <div class="health-header">
      <div class="header-content">
        <h2 class="header-title">
          <font-awesome-icon icon="heartbeat" />
          Santé du Système
        </h2>
        <p class="header-description">
          Surveillez les performances et l'état du système en temps réel
        </p>
      </div>
      <div class="header-actions">
        <button @click="refreshHealth" class="btn btn-secondary" :disabled="loading">
          <font-awesome-icon :icon="loading ? 'spinner' : 'sync-alt'" :class="{ 'fa-spin': loading }" />
          Actualiser
        </button>
        <button @click="createBackup" class="btn btn-primary" :disabled="backupLoading">
          <font-awesome-icon :icon="backupLoading ? 'spinner' : 'download'" :class="{ 'fa-spin': backupLoading }" />
          Créer Sauvegarde
        </button>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="loading-state">
      <font-awesome-icon icon="spinner" class="fa-spin" />
      <p>Chargement des données de santé...</p>
    </div>

    <!-- État d'erreur -->
    <div v-else-if="error" class="error-state">
      <font-awesome-icon icon="exclamation-triangle" />
      <h3>Erreur de chargement</h3>
      <p>{{ error }}</p>
      <button @click="refreshHealth" class="btn btn-primary">
        <font-awesome-icon icon="redo" />
        Réessayer
      </button>
    </div>

    <!-- Contenu principal -->
    <div v-else class="health-content">
      <!-- Statut global -->
      <div class="global-status">
        <div class="status-card">
          <div class="status-icon">
            <font-awesome-icon 
              :icon="getStatusIcon(healthData?.status)" 
              :class="getStatusClass(healthData?.status)"
            />
          </div>
          <div class="status-info">
            <h3 class="status-title">Statut Global</h3>
            <p class="status-value">{{ getStatusLabel(healthData?.status) }}</p>
            <p class="status-description">{{ getStatusDescription(healthData?.status) }}</p>
          </div>
          <div class="status-meta">
            <div class="uptime-info">
              <span class="uptime-label">Temps de fonctionnement</span>
              <span class="uptime-value">{{ healthData?.uptime?.process || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Métriques de performance -->
      <div class="performance-metrics">
        <h3 class="section-title">
          <font-awesome-icon icon="tachometer-alt" />
          Métriques de Performance
        </h3>
        
        <div class="metrics-grid">
          <!-- CPU -->
          <div class="metric-card">
            <div class="metric-header">
              <div class="metric-icon cpu">
                <font-awesome-icon icon="microchip" />
              </div>
              <div class="metric-info">
                <h4 class="metric-title">Processeur (CPU)</h4>
                <p class="metric-value">{{ (healthData?.metrics?.cpu?.percentage || 0).toFixed(1) }}%</p>
              </div>
            </div>
            <div class="metric-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${healthData?.metrics?.cpu?.percentage || 0}%` }"
                  :class="getUsageClass(healthData?.metrics?.cpu?.percentage || 0)"
                ></div>
              </div>
              <div class="progress-labels">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <!-- Mémoire -->
          <div class="metric-card">
            <div class="metric-header">
              <div class="metric-icon memory">
                <font-awesome-icon icon="memory" />
              </div>
              <div class="metric-info">
                <h4 class="metric-title">Mémoire (RAM)</h4>
                <p class="metric-value">{{ (healthData?.metrics?.memory?.percentage || 0).toFixed(1) }}%</p>
              </div>
            </div>
            <div class="metric-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${healthData?.metrics?.memory?.percentage || 0}%` }"
                  :class="getUsageClass(healthData?.metrics?.memory?.percentage || 0)"
                ></div>
              </div>
              <div class="progress-labels">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
            <div class="metric-details">
              <span>Utilisée: {{ healthData?.metrics?.memory?.used || '0 B' }}</span>
              <span>Total: {{ healthData?.metrics?.memory?.total || '0 B' }}</span>
            </div>
          </div>

          <!-- Stockage -->
          <div class="metric-card">
            <div class="metric-header">
              <div class="metric-icon storage">
                <font-awesome-icon icon="hdd" />
              </div>
              <div class="metric-info">
                <h4 class="metric-title">Stockage</h4>
                <p class="metric-value">{{ (healthData?.metrics?.storage?.percentage || 0).toFixed(1) }}%</p>
              </div>
            </div>
            <div class="metric-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${healthData?.metrics?.storage?.percentage || 0}%` }"
                  :class="getUsageClass(healthData?.metrics?.storage?.percentage || 0)"
                ></div>
              </div>
              <div class="progress-labels">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
            <div class="metric-details">
              <span>Utilisée: {{ healthData?.metrics?.storage?.used || '0 B' }}</span>
              <span>Total: {{ healthData?.metrics?.storage?.total || '0 B' }}</span>
            </div>
          </div>

          <!-- Charge réseau -->
          <div class="metric-card">
            <div class="metric-header">
              <div class="metric-icon network">
                <font-awesome-icon icon="network-wired" />
              </div>
              <div class="metric-info">
                <h4 class="metric-title">Réseau</h4>
                <p class="metric-value">{{ formatNetworkSpeed(healthData?.metrics?.network?.bytesReceived || 0) }}</p>
              </div>
            </div>
            <div class="metric-details network-details">
              <div class="network-stat">
                <font-awesome-icon icon="arrow-up" class="upload" />
                <span>{{ formatBytes(healthData?.network_tx || 0) }}/s</span>
              </div>
              <div class="network-stat">
                <font-awesome-icon icon="arrow-down" class="download" />
                <span>{{ formatBytes(healthData?.network_rx || 0) }}/s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Services et composants -->
      <div class="services-section">
        <h3 class="section-title">
          <font-awesome-icon icon="cogs" />
          État des Services
        </h3>
        
        <div class="services-grid">
          <div 
            v-for="service in healthData?.services || []" 
            :key="service.name"
            class="service-card"
          >
            <div class="service-header">
              <div class="service-status">
                <font-awesome-icon 
                  :icon="service.status === 'running' ? 'check-circle' : 'times-circle'" 
                  :class="service.status === 'running' ? 'status-running' : 'status-stopped'"
                />
              </div>
              <div class="service-info">
                <h4 class="service-name">{{ service.name }}</h4>
                <p class="service-description">{{ service.description || 'Service système' }}</p>
              </div>
            </div>
            <div class="service-details">
              <div class="service-meta">
                <span class="service-version">v{{ service.version || '1.0.0' }}</span>
                <span class="service-uptime">{{ formatUptime(service.uptime) }}</span>
              </div>
              <div v-if="service.health_check" class="health-check">
                <span class="health-label">Dernière vérification:</span>
                <span class="health-time">{{ formatDateTime(service.last_check) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Informations système -->
      <div class="system-info">
        <h3 class="section-title">
          <font-awesome-icon icon="server" />
          Informations Système
        </h3>
        
        <div class="info-grid">
          <div class="info-card">
            <h4 class="info-title">Environnement</h4>
            <div class="info-content">
              <div class="info-item">
                <span class="info-label">Node.js:</span>
                <span class="info-value">{{ healthData?.system?.nodeVersion || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Version App:</span>
                <span class="info-value">{{ healthData?.system?.appVersion || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Environnement:</span>
                <span class="info-value environment">{{ healthData?.system?.environment || 'production' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Démarrage:</span>
                <span class="info-value">{{ formatDateTime(healthData?.start_time) }}</span>
              </div>
            </div>
          </div>

          <div class="info-card">
            <h4 class="info-title">Base de Données</h4>
            <div class="info-content">
              <div class="info-item">
                <span class="info-label">Statut:</span>
                <span :class="['info-value', 'db-status', healthData?.database?.status === 'connected' ? 'connected' : 'disconnected']">
                  <font-awesome-icon 
                    :icon="healthData?.database?.status === 'connected' ? 'check-circle' : 'times-circle'" 
                  />
                  {{ healthData?.database?.status === 'connected' ? 'Connectée' : 'Déconnectée' }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Connexions:</span>
                <span class="info-value">{{ healthData?.database?.connections || 0 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Latence:</span>
                <span class="info-value">{{ healthData?.database?.latency || 0 }}ms</span>
              </div>
            </div>
          </div>

          <div class="info-card">
            <h4 class="info-title">Cache</h4>
            <div class="info-content">
              <div class="info-item">
                <span class="info-label">Statut:</span>
                <span :class="['info-value', 'cache-status', healthData?.cache?.status === 'connected' ? 'connected' : 'disconnected']">
                  <font-awesome-icon 
                    :icon="healthData?.cache?.status === 'connected' ? 'check-circle' : 'times-circle'" 
                  />
                  {{ healthData?.cache?.status === 'connected' ? 'Actif' : 'Inactif' }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Utilisation:</span>
                <span class="info-value">{{ (healthData?.cache?.usage || 0).toFixed(1) }}%</span>
              </div>
              <div class="info-item">
                <span class="info-label">Clés:</span>
                <span class="info-value">{{ healthData?.cache?.keys || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sauvegardes récentes -->
      <div class="backups-section">
        <h3 class="section-title">
          <font-awesome-icon icon="archive" />
          Sauvegardes Récentes
        </h3>
        
        <div v-if="healthData?.recent_backups?.length" class="backups-list">
          <div 
            v-for="backup in healthData.recent_backups" 
            :key="backup.id"
            class="backup-item"
          >
            <div class="backup-icon">
              <font-awesome-icon 
                :icon="backup.status === 'completed' ? 'check-circle' : backup.status === 'failed' ? 'times-circle' : 'clock'" 
                :class="getBackupStatusClass(backup.status)"
              />
            </div>
            <div class="backup-info">
              <div class="backup-header">
                <h4 class="backup-name">{{ backup.name || `Sauvegarde ${backup.id}` }}</h4>
                <span class="backup-status">{{ getBackupStatusLabel(backup.status) }}</span>
              </div>
              <div class="backup-meta">
                <span class="backup-date">{{ formatDateTime(backup.created_at) }}</span>
                <span class="backup-size">{{ formatBytes(backup.size || 0) }}</span>
                <span v-if="backup.duration" class="backup-duration">{{ formatDuration(backup.duration) }}</span>
              </div>
            </div>
            <div class="backup-actions">
              <button 
                v-if="backup.status === 'completed'" 
                @click="downloadBackup(backup)" 
                class="btn-icon"
                title="Télécharger"
              >
                <font-awesome-icon icon="download" />
              </button>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-backups">
          <font-awesome-icon icon="archive" />
          <p>Aucune sauvegarde récente</p>
          <button @click="createBackup" class="btn btn-primary" :disabled="backupLoading">
            <font-awesome-icon :icon="backupLoading ? 'spinner' : 'plus'" :class="{ 'fa-spin': backupLoading }" />
            Créer une sauvegarde
          </button>
        </div>
      </div>
    </div>

    <!-- Notification -->
    <div v-if="notification.show" :class="['notification', notification.type]">
      <font-awesome-icon :icon="getNotificationIcon(notification.type)" />
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';
import authService from '@/services/authService'

export default {
  name: 'SystemHealth',
  setup() {
    // État réactif
    const loading = ref(false);
    const error = ref(null);
    const healthData = ref(null);
    const backupLoading = ref(false);
    
    // Notification
    const notification = reactive({
      show: false,
      type: 'success',
      message: ''
    });

    // Méthodes utilitaires
    const getStatusIcon = (status) => {
      const icons = {
        'healthy': 'check-circle',
        'warning': 'exclamation-triangle',
        'critical': 'times-circle',
        'degraded': 'exclamation-circle'
      };
      return icons[status] || 'question-circle';
    };

    const getStatusClass = (status) => {
      const classes = {
        'healthy': 'status-healthy',
        'warning': 'status-warning',
        'critical': 'status-critical',
        'degraded': 'status-degraded'
      };
      return classes[status] || 'status-unknown';
    };

    const getStatusLabel = (status) => {
      const labels = {
        'healthy': 'Système en bonne santé',
        'warning': 'Attention requise',
        'critical': 'Problème critique',
        'degraded': 'Performance dégradée'
      };
      return labels[status] || 'Statut inconnu';
    };

    const getStatusDescription = (status) => {
      const descriptions = {
        'healthy': 'Tous les systèmes fonctionnent normalement',
        'warning': 'Certains composants nécessitent une attention',
        'critical': 'Intervention immédiate requise',
        'degraded': 'Les performances sont réduites'
      };
      return descriptions[status] || 'Aucune information disponible';
    };

    const getUsageClass = (percentage) => {
      if (percentage < 70) return 'usage-good';
      if (percentage < 85) return 'usage-warning';
      return 'usage-critical';
    };

    const getBackupStatusClass = (status) => {
      const classes = {
        'completed': 'backup-completed',
        'failed': 'backup-failed',
        'in_progress': 'backup-progress'
      };
      return classes[status] || 'backup-unknown';
    };

    const getBackupStatusLabel = (status) => {
      const labels = {
        'completed': 'Terminée',
        'failed': 'Échouée',
        'in_progress': 'En cours'
      };
      return labels[status] || status;
    };

    const getNotificationIcon = (type) => {
      const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
      };
      return icons[type] || 'info-circle';
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

    const formatBytes = (bytes) => {
      if (!bytes) return '0 B';
      
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      
      return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    };

    const formatNetworkSpeed = (bytesPerSecond) => {
      return formatBytes(bytesPerSecond) + '/s';
    };

    const formatDateTime = (dateString) => {
      if (!dateString) return 'Inconnu';
      return new Date(dateString).toLocaleString('fr-FR');
    };

    const formatDuration = (seconds) => {
      if (!seconds) return '0s';
      
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      
      if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
      } else {
        return `${remainingSeconds}s`;
      }
    };

    // Gestion des notifications
    const showNotification = (message, type = 'success') => {
      notification.show = true;
      notification.type = type;
      notification.message = message;
      
      setTimeout(() => {
        notification.show = false;
      }, 5000);
    };

    // API calls
    const fetchHealthData = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/super-admin/system/health', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await response.data;
        
        // L'API retourne { success: true, data: {...} }
        // Donc on doit utiliser result.data, pas result directement
        healthData.value = result.data;
        
      } catch (err) {
        if (err.response?.status === 401) {
          router.push('/login');
          return;
        }
        error.value = err.message;
        console.error('Erreur chargement santé système:', err);
      } finally {
        loading.value = false;
      }
    };

    const refreshHealth = () => {
      fetchHealthData();
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

        const data = await response.data;
        showNotification('Sauvegarde créée avec succès');
        
        // Actualiser les données pour voir la nouvelle sauvegarde
        setTimeout(() => {
          fetchHealthData();
        }, 2000);
        
      } catch (err) {
        if (err.response?.status === 401) {
          router.push('/login');
          return;
        }
        showNotification(`Erreur lors de la création de la sauvegarde: ${err.message}`, 'error');
        console.error('Erreur création sauvegarde:', err);
      } finally {
        backupLoading.value = false;
      }
    };

    const downloadBackup = async (backup) => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/super-admin/system/backup/${backup.id}/download`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const blob = await response.blob();
        // Convertir en data: URL pour contourner blob:
        const url = await (async () => {
          try {
            const { blobToDataURL } = await import('@/utils/blob')
            return await blobToDataURL(blob)
          } catch (_) {
            return ''
          }
        })()
        const a = document.createElement('a');
        a.href = url;
        a.download = backup.name || `backup-${backup.id}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        showNotification('Téléchargement de la sauvegarde démarré');
        
      } catch (err) {
        if (err.response?.status === 401) {
          router.push('/login');
          return;
        }
        showNotification(`Erreur lors du téléchargement: ${err.message}`, 'error');
        console.error('Erreur téléchargement sauvegarde:', err);
      }
    };

    // Initialisation
    onMounted(() => {
      fetchHealthData();
      
      // Actualisation automatique toutes les 30 secondes
      const interval = setInterval(() => {
        if (!loading.value) {
          fetchHealthData();
        }
      }, 30000);
      
      // Nettoyer l'intervalle lors de la destruction du composant
      return () => {
        clearInterval(interval);
      };
    });

    return {
      // État
      loading,
      error,
      healthData,
      backupLoading,
      notification,
      
      // Méthodes
      getStatusIcon,
      getStatusClass,
      getStatusLabel,
      getStatusDescription,
      getUsageClass,
      getBackupStatusClass,
      getBackupStatusLabel,
      getNotificationIcon,
      formatUptime,
      formatBytes,
      formatNetworkSpeed,
      formatDateTime,
      formatDuration,
      refreshHealth,
      createBackup,
      downloadBackup
    };
  }
};
</script>

<style scoped>
.system-health {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.health-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.header-content {
  flex: 1;
}

.header-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-description {
  color: #718096;
  margin: 0;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-state .fa-spin {
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 16px;
}

.error-state .fa-exclamation-triangle {
  font-size: 2rem;
  color: #e53e3e;
  margin-bottom: 16px;
}

.health-content {
  space-y: 32px;
}

/* Statut global */
.global-status {
  margin-bottom: 32px;
}

.status-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  color: white;
  display: flex;
  align-items: center;
  gap: 24px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.status-icon {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  flex-shrink: 0;
}

.status-icon .status-healthy {
  color: #48bb78;
}

.status-icon .status-warning {
  color: #ed8936;
}

.status-icon .status-critical {
  color: #e53e3e;
}

.status-icon .status-degraded {
  color: #ecc94b;
}

.status-info {
  flex: 1;
}

.status-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.status-value {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: rgba(255, 255, 255, 0.95);
}

.status-description {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.5;
}

.status-meta {
  text-align: right;
}

.uptime-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.uptime-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.uptime-value {
  font-size: 1.5rem;
  font-weight: 700;
}

/* Sections */
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Métriques de performance */
.performance-metrics {
  margin-bottom: 32px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.metric-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.metric-icon.cpu {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.metric-icon.memory {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.metric-icon.storage {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.metric-icon.network {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.metric-info {
  flex: 1;
}

.metric-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 4px 0;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.metric-progress {
  margin-bottom: 16px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-fill.usage-good {
  background: linear-gradient(90deg, #48bb78, #38a169);
}

.progress-fill.usage-warning {
  background: linear-gradient(90deg, #ed8936, #dd6b20);
}

.progress-fill.usage-critical {
  background: linear-gradient(90deg, #e53e3e, #c53030);
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #a0aec0;
}

.metric-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #718096;
}

.network-details {
  flex-direction: column;
  gap: 8px;
}

.network-stat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.network-stat .upload {
  color: #e53e3e;
}

.network-stat .download {
  color: #38a169;
}

/* Services */
.services-section {
  margin-bottom: 32px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.service-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid transparent;
}

.service-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.service-status {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.service-status .status-running {
  color: #38a169;
}

.service-status .status-stopped {
  color: #e53e3e;
}

.service-info {
  flex: 1;
}

.service-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 4px 0;
}

.service-description {
  color: #718096;
  margin: 0;
  font-size: 0.9rem;
}

.service-details {
  space-y: 8px;
}

.service-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.service-version,
.service-uptime {
  padding: 4px 8px;
  background: #f7fafc;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #4a5568;
}

.health-check {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #718096;
}

/* Informations système */
.system-info {
  margin-bottom: 32px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.info-content {
  space-y: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.info-label {
  font-weight: 500;
  color: #4a5568;
}

.info-value {
  color: #2d3748;
  font-weight: 600;
}

.info-value.environment {
  text-transform: uppercase;
  background: #667eea;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.info-value.db-status,
.info-value.cache-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-value.connected {
  color: #38a169;
}

.info-value.disconnected {
  color: #e53e3e;
}

/* Sauvegardes */
.backups-section {
  margin-bottom: 32px;
}

.backups-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.backup-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.3s ease;
}

.backup-item:last-child {
  border-bottom: none;
}

.backup-item:hover {
  background: #f7fafc;
}

.backup-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.backup-icon .backup-completed {
  color: #38a169;
}

.backup-icon .backup-failed {
  color: #e53e3e;
}

.backup-icon .backup-progress {
  color: #ed8936;
}

.backup-info {
  flex: 1;
}

.backup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.backup-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.backup-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  background: #f7fafc;
  color: #4a5568;
}

.backup-meta {
  display: flex;
  gap: 16px;
  font-size: 0.9rem;
  color: #718096;
}

.backup-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: #f7fafc;
  color: #4a5568;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-icon:hover {
  background: #667eea;
  color: white;
}

.empty-backups {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-backups .fa-archive {
  font-size: 2rem;
  color: #a0aec0;
  margin-bottom: 16px;
}

/* Boutons */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a67d8;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover:not(:disabled) {
  background: #cbd5e0;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Notification */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 300px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.notification.success {
  background: #38a169;
}

.notification.error {
  background: #e53e3e;
}

.notification.warning {
  background: #ed8936;
}

.notification.info {
  background: #3182ce;
}

/* Responsive */
@media (max-width: 768px) {
  .system-health {
    padding: 16px;
  }
  
  .health-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .status-card {
    flex-direction: column;
    text-align: center;
    gap: 20px;
    padding: 24px;
  }
  
  .status-meta {
    text-align: center;
  }
  
  .metrics-grid,
  .services-grid,
  .info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .metric-card,
  .service-card,
  .info-card {
    padding: 16px;
  }
  
  .backup-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 16px;
  }
  
  .backup-header {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .backup-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .notification {
    left: 20px;
    right: 20px;
    min-width: auto;
  }
}
</style>