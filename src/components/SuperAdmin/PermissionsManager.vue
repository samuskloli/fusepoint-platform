<template>
  <div class="permissions-manager">
    <!-- En-tête -->
    <div class="manager-header">
      <div class="header-content">
        <h2 class="header-title">
          <font-awesome-icon icon="shield-alt" />
          Gestionnaire de Permissions
        </h2>
        <p class="header-description">
          Consultez et gérez les permissions par rôle utilisateur
        </p>
      </div>
      <div class="header-actions">
        <button @click="refreshPermissions" class="btn btn-secondary" :disabled="loading">
          <font-awesome-icon :icon="loading ? 'spinner' : 'sync-alt'" :class="{ 'fa-spin': loading }" />
          Actualiser
        </button>
      </div>
    </div>

    <!-- Sélecteur de rôle -->
    <div class="role-selector">
      <div class="selector-content">
        <label class="selector-label">Sélectionner un rôle :</label>
        <div class="role-tabs">
          <button 
            v-for="role in availableRoles" 
            :key="role"
            @click="selectedRole = role"
            :class="['role-tab', { active: selectedRole === role }]"
          >
            <font-awesome-icon :icon="getRoleIcon(role)" />
            {{ getRoleLabel(role) }}
          </button>
        </div>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="loading-state">
      <font-awesome-icon icon="spinner" class="fa-spin" />
      <p>Chargement des permissions...</p>
    </div>

    <!-- État d'erreur -->
    <div v-else-if="error" class="error-state">
      <font-awesome-icon icon="exclamation-triangle" />
      <h3>Erreur de chargement</h3>
      <p>{{ error }}</p>
      <button @click="refreshPermissions" class="btn btn-primary">
        <font-awesome-icon icon="redo" />
        Réessayer
      </button>
    </div>

    <!-- Contenu des permissions -->
    <div v-else class="permissions-content">
      <!-- Résumé du rôle -->
      <div class="role-summary">
        <div class="summary-card">
          <div class="summary-icon">
            <font-awesome-icon :icon="getRoleIcon(selectedRole)" />
          </div>
          <div class="summary-info">
            <h3 class="summary-title">{{ getRoleLabel(selectedRole) }}</h3>
            <p class="summary-description">{{ getRoleDescription(selectedRole) }}</p>
            <div class="summary-stats">
              <div class="stat-item">
                <span class="stat-value">{{ grantedPermissions.length }}</span>
                <span class="stat-label">Permissions accordées</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ deniedPermissions.length }}</span>
                <span class="stat-label">Permissions refusées</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Permissions par catégorie -->
      <div class="permissions-grid">
        <div 
          v-for="category in permissionCategories" 
          :key="category"
          class="category-section"
        >
          <div class="category-header" @click="toggleCategory(category)">
            <div class="category-info">
              <font-awesome-icon :icon="getCategoryIcon(category)" class="category-icon" />
              <h3 class="category-title">{{ getCategoryLabel(category) }}</h3>
              <span class="category-count">
                {{ getCategoryPermissions(category).length }} permissions
              </span>
            </div>
            <div class="category-toggle">
              <font-awesome-icon 
                :icon="expandedCategories.includes(category) ? 'chevron-up' : 'chevron-down'" 
              />
            </div>
          </div>
          
          <div v-if="expandedCategories.includes(category)" class="category-content">
            <div class="permissions-list">
              <div 
                v-for="permission in getCategoryPermissions(category)" 
                :key="permission.name"
                class="permission-item"
              >
                <div class="permission-info">
                  <div class="permission-header">
                    <h4 class="permission-name">{{ permission.name }}</h4>
                    <div class="permission-status">
                      <span 
                        :class="['status-badge', permission.granted ? 'granted' : 'denied']"
                      >
                        <font-awesome-icon 
                          :icon="permission.granted ? 'check-circle' : 'times-circle'" 
                        />
                        {{ permission.granted ? 'Accordée' : 'Refusée' }}
                      </span>
                    </div>
                  </div>
                  
                  <p v-if="permission.description" class="permission-description">
                    {{ permission.description }}
                  </p>
                  
                  <div class="permission-meta">
                    <span class="permission-resource">{{ permission.resource }}</span>
                    <span class="permission-action">{{ permission.action }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- État vide pour la catégorie -->
            <div v-if="getCategoryPermissions(category).length === 0" class="category-empty">
              <font-awesome-icon icon="info-circle" />
              <p>Aucune permission dans cette catégorie</p>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide global -->
      <div v-if="permissions.length === 0" class="empty-state">
        <font-awesome-icon icon="shield-alt" />
        <h3>Aucune permission trouvée</h3>
        <p>Aucune permission n'est définie pour ce rôle</p>
      </div>
    </div>

    <!-- Note d'information -->
    <div class="info-note">
      <div class="note-content">
        <font-awesome-icon icon="info-circle" class="note-icon" />
        <div class="note-text">
          <h4>Information importante</h4>
          <p>
            Cette interface est en lecture seule. Pour modifier les permissions, 
            veuillez utiliser les outils d'administration de base de données ou 
            contacter l'équipe technique.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import authService from '@/services/authService'

export default {
  name: 'PermissionsManager',
  setup() {
    // État réactif
    const loading = ref(false);
    const error = ref(null);
    const permissions = ref([]);
    const selectedRole = ref('user');
    const expandedCategories = ref(['user_management', 'content_management']);

    // Rôles disponibles
    const availableRoles = ['user', 'agent', 'super_admin'];

    // Permissions filtrées
    const grantedPermissions = computed(() => 
      permissions.value.filter(p => p.granted)
    );

    const deniedPermissions = computed(() => 
      permissions.value.filter(p => !p.granted)
    );

    // Catégories de permissions
    const permissionCategories = computed(() => {
      const categories = [...new Set(permissions.value.map(p => p.category))];
      return categories.sort();
    });

    // Méthodes utilitaires
    const getRoleIcon = (role) => {
      const icons = {
        'user': 'user',
        'agent': 'user-tie',
        'super_admin': 'user-shield'
      };
      return icons[role] || 'user';
    };

    const getRoleLabel = (role) => {
      const labels = {
        'user': 'Utilisateur',
        'agent': 'Agent',
        'super_admin': 'Super Administrateur'
      };
      return labels[role] || role;
    };

    const getRoleDescription = (role) => {
      const descriptions = {
        'user': 'Utilisateur standard avec accès limité aux fonctionnalités de base',
        'agent': 'Agent avec accès étendu pour la gestion des clients et des campagnes',
        'super_admin': 'Administrateur avec accès complet à toutes les fonctionnalités'
      };
      return descriptions[role] || 'Rôle utilisateur';
    };

    const getCategoryIcon = (category) => {
      const icons = {
        'user_management': 'users',
        'content_management': 'file-alt',
        'analytics': 'chart-bar',
        'settings': 'cog',
        'billing': 'credit-card',
        'integrations': 'plug',
        'reports': 'chart-line',
        'system': 'server',
        'api': 'code',
        'security': 'shield-alt'
      };
      return icons[category] || 'folder';
    };

    const getCategoryLabel = (category) => {
      const labels = {
        'user_management': 'Gestion des Utilisateurs',
        'content_management': 'Gestion du Contenu',
        'analytics': 'Analytiques',
        'settings': 'Paramètres',
        'billing': 'Facturation',
        'integrations': 'Intégrations',
        'reports': 'Rapports',
        'system': 'Système',
        'api': 'API',
        'security': 'Sécurité'
      };
      return labels[category] || category.replace('_', ' ').toUpperCase();
    };

    const getCategoryPermissions = (category) => {
      return permissions.value.filter(p => p.category === category);
    };

    const toggleCategory = (category) => {
      const index = expandedCategories.value.indexOf(category);
      if (index > -1) {
        expandedCategories.value.splice(index, 1);
      } else {
        expandedCategories.value.push(category);
      }
    };

    // API calls
    const fetchPermissions = async () => {
      try {
        loading.value = true;
        error.value = null;
        
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/super-admin/roles/${selectedRole.value}/permissions`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.data;
        permissions.value = data.permissions || [];
        
      } catch (err) {
        if (err.response?.status === 401) {
          router.push('/login');
          return;
        }
        error.value = err.message;
        console.error('Erreur chargement permissions:', err);
      } finally {
        loading.value = false;
      }
    };

    const refreshPermissions = () => {
      fetchPermissions();
    };

    // Watchers
    watch(selectedRole, () => {
      fetchPermissions();
    });

    // Initialisation
    onMounted(() => {
      fetchPermissions();
    });

    return {
      // État
      loading,
      error,
      permissions,
      selectedRole,
      expandedCategories,
      
      // Données
      availableRoles,
      
      // Computed
      grantedPermissions,
      deniedPermissions,
      permissionCategories,
      
      // Méthodes
      getRoleIcon,
      getRoleLabel,
      getRoleDescription,
      getCategoryIcon,
      getCategoryLabel,
      getCategoryPermissions,
      toggleCategory,
      refreshPermissions
    };
  }
};
</script>

<style scoped>
.permissions-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.manager-header {
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

.role-selector {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.selector-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selector-label {
  font-weight: 600;
  color: #2d3748;
  font-size: 1.1rem;
}

.role-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.role-tab {
  padding: 12px 20px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
  justify-content: center;
}

.role-tab:hover {
  border-color: #667eea;
  background: #f7fafc;
  transform: translateY(-2px);
}

.role-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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

.empty-state .fa-shield-alt {
  font-size: 2rem;
  color: #a0aec0;
  margin-bottom: 16px;
}

.permissions-content {
  space-y: 24px;
}

.role-summary {
  margin-bottom: 32px;
}

.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  color: white;
  display: flex;
  align-items: center;
  gap: 24px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.summary-icon {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.summary-info {
  flex: 1;
}

.summary-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.summary-description {
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 20px 0;
  font-size: 1.1rem;
  line-height: 1.5;
}

.summary-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  text-align: center;
}

.permissions-grid {
  display: grid;
  gap: 20px;
}

.category-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.category-header {
  padding: 20px 24px;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s ease;
}

.category-header:hover {
  background: #edf2f7;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.category-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.category-count {
  background: #e2e8f0;
  color: #4a5568;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.category-toggle {
  color: #a0aec0;
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.category-content {
  padding: 24px;
}

.permissions-list {
  display: grid;
  gap: 16px;
}

.permission-item {
  background: #f7fafc;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
}

.permission-item:hover {
  background: #edf2f7;
  transform: translateX(4px);
}

.permission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 8px;
}

.permission-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  font-family: 'Monaco', 'Menlo', monospace;
}

.permission-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
}

.status-badge.granted {
  background: #c6f6d5;
  color: #22543d;
  border-left-color: #38a169;
}

.status-badge.denied {
  background: #fed7d7;
  color: #c53030;
  border-left-color: #e53e3e;
}

.permission-item:has(.status-badge.granted) {
  border-left-color: #38a169;
}

.permission-item:has(.status-badge.denied) {
  border-left-color: #e53e3e;
}

.permission-description {
  color: #718096;
  margin: 0 0 12px 0;
  line-height: 1.5;
  font-size: 0.95rem;
}

.permission-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.permission-resource,
.permission-action {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.permission-resource {
  background: #e6fffa;
  color: #234e52;
}

.permission-action {
  background: #fef5e7;
  color: #c05621;
}

.category-empty {
  text-align: center;
  padding: 40px 20px;
  color: #a0aec0;
}

.category-empty .fa-info-circle {
  font-size: 2rem;
  margin-bottom: 12px;
}

.info-note {
  margin-top: 32px;
  background: #ebf8ff;
  border: 1px solid #bee3f8;
  border-radius: 12px;
  padding: 20px;
}

.note-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.note-icon {
  color: #3182ce;
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.note-text h4 {
  color: #2c5282;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.note-text p {
  color: #2d3748;
  margin: 0;
  line-height: 1.5;
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
@media (max-width: 768px) {
  .permissions-manager {
    padding: 16px;
  }
  
  .manager-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .role-tabs {
    flex-direction: column;
    gap: 8px;
  }
  
  .role-tab {
    min-width: auto;
  }
  
  .summary-card {
    flex-direction: column;
    text-align: center;
    gap: 20px;
    padding: 24px;
  }
  
  .summary-stats {
    justify-content: center;
    gap: 24px;
  }
  
  .category-header {
    padding: 16px;
  }
  
  .category-info {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .category-title {
    font-size: 1.1rem;
  }
  
  .permission-header {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .permission-meta {
    gap: 8px;
  }
  
  .note-content {
    flex-direction: column;
    gap: 12px;
  }
}

/* Support pour :has() avec fallback */
@supports not selector(:has(*)) {
  .permission-item {
    border-left-color: #e2e8f0;
  }
}
</style>