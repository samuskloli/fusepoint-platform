<template>
  <div class="system-logs">
    <!-- En-tête -->
    <div class="logs-header">
      <div class="header-content">
        <h2 class="header-title">
          <font-awesome-icon icon="clipboard-list" />
          Logs Système
        </h2>
        <p class="header-description">
          Consultez l'activité et les événements du système
        </p>
      </div>
      <div class="header-actions">
        <button @click="refreshLogs" class="btn btn-secondary" :disabled="loading">
          <font-awesome-icon :icon="loading ? 'spinner' : 'sync-alt'" :class="{ 'fa-spin': loading }" />
          Actualiser
        </button>
        <button @click="exportLogs" class="btn btn-primary" :disabled="exporting || logs.length === 0">
          <font-awesome-icon :icon="exporting ? 'spinner' : 'download'" :class="{ 'fa-spin': exporting }" />
          Exporter
        </button>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="logs-filters">
      <div class="filters-row">
        <!-- Recherche -->
        <div class="search-box">
          <font-awesome-icon icon="search" class="search-icon" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Rechercher dans les logs..."
            class="search-input"
          />
        </div>
        
        <!-- Filtres -->
        <div class="filter-controls">
          <!-- Type d'action -->
          <select v-model="selectedActionType" class="filter-select">
            <option value="">Tous les types</option>
            <option value="login">Connexion</option>
            <option value="logout">Déconnexion</option>
            <option value="platform_settings_update">Paramètres</option>
            <option value="user_management">Gestion utilisateurs</option>
            <option value="permission_change">Permissions</option>
            <option value="system_backup">Sauvegarde</option>
          </select>
          
          <!-- Code de statut -->
          <select v-model="selectedStatusCode" class="filter-select">
            <option value="">Tous les statuts</option>
            <option value="200">Succès (200)</option>
            <option value="400">Erreur client (400)</option>
            <option value="401">Non autorisé (401)</option>
            <option value="403">Interdit (403)</option>
            <option value="500">Erreur serveur (500)</option>
          </select>
          
          <!-- Période -->
          <select v-model="selectedPeriod" class="filter-select">
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="all">Toute la période</option>
          </select>
        </div>
      </div>
      
      <!-- Filtres actifs -->
      <div v-if="hasActiveFilters" class="active-filters">
        <span class="filters-label">Filtres actifs :</span>
        <div class="filter-tags">
          <span v-if="searchQuery" class="filter-tag">
            Recherche: "{{ searchQuery }}"
            <button @click="searchQuery = ''" class="filter-remove">
              <font-awesome-icon icon="times" />
            </button>
          </span>
          <span v-if="selectedActionType" class="filter-tag">
            Type: {{ getActionTypeLabel(selectedActionType) }}
            <button @click="selectedActionType = ''" class="filter-remove">
              <font-awesome-icon icon="times" />
            </button>
          </span>
          <span v-if="selectedStatusCode" class="filter-tag">
            Statut: {{ selectedStatusCode }}
            <button @click="selectedStatusCode = ''" class="filter-remove">
              <font-awesome-icon icon="times" />
            </button>
          </span>
          <span v-if="selectedPeriod !== 'all'" class="filter-tag">
            Période: {{ getPeriodLabel(selectedPeriod) }}
            <button @click="selectedPeriod = 'all'" class="filter-remove">
              <font-awesome-icon icon="times" />
            </button>
          </span>
          <button @click="clearAllFilters" class="clear-all-filters">
            <font-awesome-icon icon="times-circle" />
            Effacer tout
          </button>
        </div>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="loading-state">
      <font-awesome-icon icon="spinner" class="fa-spin" />
      <p>Chargement des logs...</p>
    </div>

    <!-- État d'erreur -->
    <div v-else-if="error" class="error-state">
      <font-awesome-icon icon="exclamation-triangle" />
      <h3>Erreur de chargement</h3>
      <p>{{ error }}</p>
      <button @click="refreshLogs" class="btn btn-primary">
        <font-awesome-icon icon="redo" />
        Réessayer
      </button>
    </div>

    <!-- Liste des logs -->
    <div v-else class="logs-content">
      <!-- Résumé -->
      <div class="logs-summary">
        <div class="summary-stats">
          <div class="stat-item">
            <span class="stat-value">{{ filteredLogs.length }}</span>
            <span class="stat-label">Logs affichés</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ totalLogs }}</span>
            <span class="stat-label">Total des logs</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ successfulActions }}</span>
            <span class="stat-label">Actions réussies</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ failedActions }}</span>
            <span class="stat-label">Actions échouées</span>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div v-if="filteredLogs.length === 0" class="empty-state">
        <font-awesome-icon icon="search" />
        <h3>Aucun log trouvé</h3>
        <p v-if="hasActiveFilters">
          Aucun log ne correspond aux critères de recherche.
          <button @click="clearAllFilters" class="link-button">Effacer les filtres</button>
        </p>
        <p v-else>Aucun log disponible pour le moment.</p>
      </div>
      
      <!-- Table des logs -->
      <div v-else class="logs-table-container">
        <table class="logs-table">
          <thead>
            <tr>
              <th @click="sortBy('created_at')" class="sortable">
                Date/Heure
                <font-awesome-icon 
                  :icon="getSortIcon('created_at')" 
                  class="sort-icon"
                />
              </th>
              <th @click="sortBy('action_type')" class="sortable">
                Action
                <font-awesome-icon 
                  :icon="getSortIcon('action_type')" 
                  class="sort-icon"
                />
              </th>
              <th>Utilisateur</th>
              <th @click="sortBy('status_code')" class="sortable">
                Statut
                <font-awesome-icon 
                  :icon="getSortIcon('status_code')" 
                  class="sort-icon"
                />
              </th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="log in paginatedLogs" 
              :key="log.id"
              class="log-row"
              @click="showLogDetails(log)"
            >
              <td class="log-date">
                <div class="date-time">
                  <div class="date">{{ formatDate(log.created_at) }}</div>
                  <div class="time">{{ formatTime(log.created_at) }}</div>
                </div>
              </td>
              
              <td class="log-action">
                <div class="action-info">
                  <font-awesome-icon 
                    :icon="getActionIcon(log.action_type)" 
                    class="action-icon"
                  />
                  <span class="action-label">{{ getActionTypeLabel(log.action_type) }}</span>
                </div>
              </td>
              
              <td class="log-user">
                <div class="user-info">
                  <div class="user-name">{{ log.first_name }} {{ log.last_name }}</div>
                  <div class="user-email">{{ log.email }}</div>
                </div>
              </td>
              
              <td class="log-status">
                <span :class="['status-badge', getStatusClass(log.status_code)]">
                  {{ log.status_code }}
                </span>
              </td>
              
              <td class="log-description">
                <div class="description-text">
                  {{ truncateText(log.description, 80) }}
                </div>
              </td>
              
              <td class="log-actions">
                <button 
                  @click.stop="showLogDetails(log)" 
                  class="btn-icon"
                  title="Voir les détails"
                >
                  <font-awesome-icon icon="eye" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage = 1" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          <font-awesome-icon icon="angle-double-left" />
        </button>
        
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          <font-awesome-icon icon="angle-left" />
        </button>
        
        <div class="pagination-info">
          Page {{ currentPage }} sur {{ totalPages }}
        </div>
        
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          <font-awesome-icon icon="angle-right" />
        </button>
        
        <button 
          @click="currentPage = totalPages" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          <font-awesome-icon icon="angle-double-right" />
        </button>
      </div>
    </div>

    <!-- Modal de détails -->
    <div v-if="selectedLog" class="modal-overlay" @click="closeLogDetails">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <font-awesome-icon :icon="getActionIcon(selectedLog.action_type)" />
            Détails du Log
          </h3>
          <button @click="closeLogDetails" class="btn-close">
            <font-awesome-icon icon="times" />
          </button>
        </div>
        
        <div class="modal-body">
          <div class="log-details">
            <div class="detail-section">
              <h4 class="section-title">Informations générales</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>ID du log :</label>
                  <span>{{ selectedLog.id }}</span>
                </div>
                <div class="detail-item">
                  <label>Date/Heure :</label>
                  <span>{{ formatDateTime(selectedLog.created_at) }}</span>
                </div>
                <div class="detail-item">
                  <label>Type d'action :</label>
                  <span class="action-type">{{ getActionTypeLabel(selectedLog.action_type) }}</span>
                </div>
                <div class="detail-item">
                  <label>Code de statut :</label>
                  <span :class="['status-badge', getStatusClass(selectedLog.status_code)]">
                    {{ selectedLog.status_code }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4 class="section-title">Utilisateur</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Nom complet :</label>
                  <span>{{ selectedLog.first_name }} {{ selectedLog.last_name }}</span>
                </div>
                <div class="detail-item">
                  <label>Email :</label>
                  <span>{{ selectedLog.email }}</span>
                </div>
                <div class="detail-item">
                  <label>Rôle :</label>
                  <span class="user-role">{{ selectedLog.role || 'Non spécifié' }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4 class="section-title">Description</h4>
              <div class="description-full">
                {{ selectedLog.description }}
              </div>
            </div>
            
            <div v-if="selectedLog.metadata" class="detail-section">
              <h4 class="section-title">Métadonnées</h4>
              <pre class="metadata-content">{{ formatMetadata(selectedLog.metadata) }}</pre>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeLogDetails" class="btn btn-secondary">
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import authService from '@/services/authService'

export default {
  name: 'SystemLogs',
  setup() {
    // État réactif
    const loading = ref(false);
    const error = ref(null);
    const logs = ref([]);
    const exporting = ref(false);
    
    // Filtres
    const searchQuery = ref('');
    const selectedActionType = ref('');
    const selectedStatusCode = ref('');
    const selectedPeriod = ref('all');
    
    // Tri
    const sortField = ref('created_at');
    const sortDirection = ref('desc');
    
    // Pagination
    const currentPage = ref(1);
    const itemsPerPage = 20;
    
    // Modal
    const selectedLog = ref(null);

    // Computed
    const hasActiveFilters = computed(() => {
      return searchQuery.value || selectedActionType.value || 
             selectedStatusCode.value || selectedPeriod.value !== 'all';
    });

    const filteredLogs = computed(() => {
      let filtered = [...logs.value];
      
      // Filtrer par recherche
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(log => 
          log.description.toLowerCase().includes(query) ||
          log.action_type.toLowerCase().includes(query) ||
          `${log.first_name} ${log.last_name}`.toLowerCase().includes(query) ||
          log.email.toLowerCase().includes(query)
        );
      }
      
      // Filtrer par type d'action
      if (selectedActionType.value) {
        filtered = filtered.filter(log => log.action_type === selectedActionType.value);
      }
      
      // Filtrer par code de statut
      if (selectedStatusCode.value) {
        filtered = filtered.filter(log => log.status_code.toString() === selectedStatusCode.value);
      }
      
      // Filtrer par période
      if (selectedPeriod.value !== 'all') {
        const now = new Date();
        const filterDate = new Date();
        
        switch (selectedPeriod.value) {
          case 'today':
            filterDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            filterDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            filterDate.setMonth(now.getMonth() - 1);
            break;
        }
        
        filtered = filtered.filter(log => new Date(log.created_at) >= filterDate);
      }
      
      // Trier
      filtered.sort((a, b) => {
        let aValue = a[sortField.value];
        let bValue = b[sortField.value];
        
        if (sortField.value === 'created_at') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        
        if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1;
        return 0;
      });
      
      return filtered;
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredLogs.value.length / itemsPerPage);
    });

    const paginatedLogs = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredLogs.value.slice(start, end);
    });

    const totalLogs = computed(() => logs.value.length);
    
    const successfulActions = computed(() => {
      return logs.value.filter(log => log.status_code >= 200 && log.status_code < 300).length;
    });
    
    const failedActions = computed(() => {
      return logs.value.filter(log => log.status_code >= 400).length;
    });

    // Méthodes utilitaires
    const getActionIcon = (actionType) => {
      const icons = {
        'login': 'sign-in-alt',
        'logout': 'sign-out-alt',
        'platform_settings_update': 'cog',
        'user_management': 'users',
        'permission_change': 'shield-alt',
        'system_backup': 'download',
        'default': 'info-circle'
      };
      return icons[actionType] || icons.default;
    };

    const getActionTypeLabel = (actionType) => {
      const labels = {
        'login': 'Connexion',
        'logout': 'Déconnexion',
        'platform_settings_update': 'Paramètres',
        'user_management': 'Gestion utilisateurs',
        'permission_change': 'Permissions',
        'system_backup': 'Sauvegarde'
      };
      return labels[actionType] || actionType;
    };

    const getStatusClass = (statusCode) => {
      if (statusCode >= 200 && statusCode < 300) return 'success';
      if (statusCode >= 400 && statusCode < 500) return 'warning';
      if (statusCode >= 500) return 'error';
      return 'info';
    };

    const getPeriodLabel = (period) => {
      const labels = {
        'today': 'Aujourd\'hui',
        'week': 'Cette semaine',
        'month': 'Ce mois',
        'all': 'Toute la période'
      };
      return labels[period] || period;
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const formatTime = (dateString) => {
      return new Date(dateString).toLocaleTimeString('fr-FR');
    };

    const formatDateTime = (dateString) => {
      return new Date(dateString).toLocaleString('fr-FR');
    };

    const truncateText = (text, maxLength) => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

    const formatMetadata = (metadata) => {
      try {
        return JSON.stringify(JSON.parse(metadata), null, 2);
      } catch {
        return metadata;
      }
    };

    // Tri
    const sortBy = (field) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortField.value = field;
        sortDirection.value = 'desc';
      }
    };

    const getSortIcon = (field) => {
      if (sortField.value !== field) return 'sort';
      return sortDirection.value === 'asc' ? 'sort-up' : 'sort-down';
    };

    // Filtres
    const clearAllFilters = () => {
      searchQuery.value = '';
      selectedActionType.value = '';
      selectedStatusCode.value = '';
      selectedPeriod.value = 'all';
      currentPage.value = 1;
    };

    // Modal
    const showLogDetails = (log) => {
      selectedLog.value = log;
    };

    const closeLogDetails = () => {
      selectedLog.value = null;
    };

    // API calls
    const fetchLogs = async () => {
      try {
        loading.value = true;
        error.value = null;
        
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/super-admin/logs', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.data;
        logs.value = data.logs || [];
        
      } catch (err) {
        if (err.response?.status === 401) {
          router.push('/login');
          return;
        }
        error.value = err.message;
        console.error('Erreur chargement logs:', err);
      } finally {
        loading.value = false;
      }
    };

    const refreshLogs = () => {
      fetchLogs();
    };

    const exportLogs = async () => {
      try {
        exporting.value = true;
        
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/super-admin/logs/export', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const blob = await response.blob();
        // CSP friendly: convertir en data: URL
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
        a.download = `logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
      } catch (err) {
        if (err.response?.status === 401) {
          router.push('/login');
          return;
        }
        console.error('Erreur export logs:', err);
        // Notification d'erreur
      } finally {
        exporting.value = false;
      }
    };

    // Watchers
    watch([searchQuery, selectedActionType, selectedStatusCode, selectedPeriod], () => {
      currentPage.value = 1;
    });

    // Initialisation
    onMounted(() => {
      fetchLogs();
    });

    return {
      // État
      loading,
      error,
      logs,
      exporting,
      
      // Filtres
      searchQuery,
      selectedActionType,
      selectedStatusCode,
      selectedPeriod,
      
      // Tri
      sortField,
      sortDirection,
      
      // Pagination
      currentPage,
      
      // Modal
      selectedLog,
      
      // Computed
      hasActiveFilters,
      filteredLogs,
      totalPages,
      paginatedLogs,
      totalLogs,
      successfulActions,
      failedActions,
      
      // Méthodes
      getActionIcon,
      getActionTypeLabel,
      getStatusClass,
      getPeriodLabel,
      formatDate,
      formatTime,
      formatDateTime,
      truncateText,
      formatMetadata,
      sortBy,
      getSortIcon,
      clearAllFilters,
      showLogDetails,
      closeLogDetails,
      refreshLogs,
      exportLogs
    };
  }
};
</script>

<style scoped>
.system-logs {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.logs-header {
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

.logs-filters {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filters-row {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  margin-bottom: 16px;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.filter-controls {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.filter-select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  min-width: 150px;
  transition: border-color 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filters-label {
  font-weight: 600;
  color: #4a5568;
}

.filter-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tag {
  background: #667eea;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.filter-remove:hover {
  background: rgba(255, 255, 255, 0.2);
}

.clear-all-filters {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.3s ease;
}

.clear-all-filters:hover {
  background: #c53030;
}

.loading-state,
.error-state,
.empty-state {
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

.empty-state .fa-search {
  font-size: 2rem;
  color: #a0aec0;
  margin-bottom: 16px;
}

.link-button {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  text-decoration: underline;
}

.logs-content {
  space-y: 24px;
}

.logs-summary {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 24px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 4px;
}

.stat-label {
  color: #718096;
  font-size: 0.9rem;
  font-weight: 500;
}

.logs-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
}

.logs-table th {
  background: #f7fafc;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #2d3748;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.logs-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s ease;
}

.logs-table th.sortable:hover {
  background: #edf2f7;
}

.sort-icon {
  margin-left: 6px;
  color: #a0aec0;
}

.logs-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: top;
}

.log-row {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.log-row:hover {
  background: #f7fafc;
}

.date-time {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.date {
  font-weight: 600;
  color: #2d3748;
}

.time {
  font-size: 0.9rem;
  color: #718096;
}

.action-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-label {
  font-weight: 500;
  color: #2d3748;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  color: #2d3748;
}

.user-email {
  font-size: 0.9rem;
  color: #718096;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
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

.description-text {
  color: #4a5568;
  line-height: 1.4;
}

.log-actions {
  text-align: center;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pagination-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #667eea;
  background: #f7fafc;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-weight: 600;
  color: #2d3748;
  padding: 0 16px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 24px 24px 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 24px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #a0aec0;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: #f7fafc;
  color: #4a5568;
}

.modal-body {
  padding: 0 24px 24px 24px;
}

.modal-footer {
  padding: 0 24px 24px 24px;
  display: flex;
  justify-content: flex-end;
}

.log-details {
  space-y: 24px;
}

.detail-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
}

.detail-item span {
  color: #2d3748;
}

.action-type {
  font-family: 'Monaco', 'Menlo', monospace;
  background: #f7fafc;
  padding: 4px 8px;
  border-radius: 4px;
}

.user-role {
  text-transform: capitalize;
  font-weight: 500;
}

.description-full {
  background: #f7fafc;
  padding: 16px;
  border-radius: 8px;
  color: #2d3748;
  line-height: 1.6;
  white-space: pre-wrap;
}

.metadata-content {
  background: #1a202c;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  overflow-x: auto;
  margin: 0;
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

/* Responsive */
@media (max-width: 1024px) {
  .logs-table-container {
    overflow-x: auto;
  }
  
  .logs-table {
    min-width: 800px;
  }
}

@media (max-width: 768px) {
  .system-logs {
    padding: 16px;
  }
  
  .logs-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .filters-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .filter-controls {
    flex-direction: column;
    gap: 8px;
  }
  
  .filter-select {
    min-width: auto;
  }
  
  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .logs-table th,
  .logs-table td {
    padding: 12px 8px;
  }
  
  .modal-content {
    margin: 10px;
    max-width: none;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>