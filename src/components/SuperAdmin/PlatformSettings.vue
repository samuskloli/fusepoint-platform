<template>
  <div class="platform-settings">
    <!-- En-tête avec actions -->
    <div class="settings-header">
      <div class="header-content">
        <h2 class="header-title">
          <font-awesome-icon icon="cog" />
          Paramètres de la Plateforme
        </h2>
        <p class="header-description">
          Configurez les paramètres globaux de la plateforme
        </p>
      </div>
      <div class="header-actions">
        <button @click="refreshSettings" class="btn btn-secondary" :disabled="loading">
          <font-awesome-icon :icon="loading ? 'spinner' : 'sync-alt'" :class="{ 'fa-spin': loading }" />
          Actualiser
        </button>
        <button @click="showCreateDialog = true" class="btn btn-primary">
          <font-awesome-icon icon="plus" />
          Nouveau Paramètre
        </button>
      </div>
    </div>

    <!-- Barre de recherche et filtres -->
    <div class="search-filters">
      <div class="search-box">
        <font-awesome-icon icon="search" class="search-icon" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Rechercher un paramètre..."
          class="search-input"
        />
      </div>
      <div class="filter-tabs">
        <button 
          v-for="category in categories" 
          :key="category"
          @click="selectedCategory = category"
          :class="['filter-tab', { active: selectedCategory === category }]"
        >
          {{ getCategoryLabel(category) }}
        </button>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="loading-state">
      <font-awesome-icon icon="spinner" class="fa-spin" />
      <p>Chargement des paramètres...</p>
    </div>

    <!-- État d'erreur -->
    <div v-else-if="error" class="error-state">
      <font-awesome-icon icon="exclamation-triangle" />
      <h3>Erreur de chargement</h3>
      <p>{{ error }}</p>
      <button @click="refreshSettings" class="btn btn-primary">
        <font-awesome-icon icon="redo" />
        Réessayer
      </button>
    </div>

    <!-- Liste des paramètres -->
    <div v-else class="settings-content">
      <div v-if="filteredSettings.length === 0" class="empty-state">
        <font-awesome-icon icon="search" />
        <h3>Aucun paramètre trouvé</h3>
        <p v-if="searchQuery">Aucun paramètre ne correspond à votre recherche "{{ searchQuery }}"</p>
        <p v-else>Aucun paramètre disponible dans cette catégorie</p>
      </div>
      
      <div v-else class="settings-grid">
        <div 
          v-for="setting in filteredSettings" 
          :key="setting.key"
          class="setting-card"
        >
          <div class="setting-header">
            <div class="setting-info">
              <h3 class="setting-key">{{ setting.key }}</h3>
              <p v-if="setting.description" class="setting-description">
                {{ setting.description }}
              </p>
              <div class="setting-meta">
                <span class="setting-category">{{ getCategoryLabel(setting.category) }}</span>
                <span class="setting-type">{{ getTypeLabel(setting.value_type) }}</span>
                <span v-if="setting.is_sensitive" class="setting-sensitive">
                  <font-awesome-icon icon="lock" />
                  Sensible
                </span>
              </div>
            </div>
            <div class="setting-actions">
              <button 
                @click="editSetting(setting)" 
                class="btn-icon" 
                title="Modifier"
              >
                <font-awesome-icon icon="edit" />
              </button>
              <button 
                @click="deleteSetting(setting)" 
                class="btn-icon btn-danger" 
                title="Supprimer"
                :disabled="setting.is_system"
              >
                <font-awesome-icon icon="trash" />
              </button>
            </div>
          </div>
          
          <div class="setting-value">
            <div v-if="editingSettings[setting.key]" class="setting-edit">
              <!-- Champ d'édition selon le type -->
              <div v-if="setting.value_type === 'boolean'" class="boolean-input">
                <label class="switch">
                  <input 
                    type="checkbox" 
                    v-model="editingSettings[setting.key].value"
                  />
                  <span class="slider"></span>
                </label>
              </div>
              
              <div v-else-if="setting.value_type === 'number'" class="number-input">
                <input 
                  type="number" 
                  v-model.number="editingSettings[setting.key].value"
                  class="form-input"
                />
              </div>
              
              <div v-else-if="setting.value_type === 'json'" class="json-input">
                <textarea 
                  v-model="editingSettings[setting.key].value"
                  class="form-textarea"
                  rows="4"
                  placeholder="JSON valide..."
                ></textarea>
              </div>
              
              <div v-else class="text-input">
                <input 
                  :type="setting.is_sensitive ? 'password' : 'text'"
                  v-model="editingSettings[setting.key].value"
                  class="form-input"
                  :placeholder="setting.is_sensitive ? '••••••••' : 'Valeur...'"
                />
              </div>
              
              <!-- Actions d'édition -->
              <div class="edit-actions">
                <button 
                  @click="saveSetting(setting.key)" 
                  class="btn btn-sm btn-primary"
                  :disabled="savingSettings[setting.key]"
                >
                  <font-awesome-icon :icon="savingSettings[setting.key] ? 'spinner' : 'check'" :class="{ 'fa-spin': savingSettings[setting.key] }" />
                  Sauvegarder
                </button>
                <button 
                  @click="cancelEdit(setting.key)" 
                  class="btn btn-sm btn-secondary"
                >
                  <font-awesome-icon icon="times" />
                  Annuler
                </button>
              </div>
              
              <!-- Erreurs de validation -->
              <div v-if="validationErrors[setting.key]" class="validation-error">
                <font-awesome-icon icon="exclamation-circle" />
                {{ validationErrors[setting.key] }}
              </div>
            </div>
            
            <div v-else class="setting-display">
              <div class="current-value">
                <span v-if="setting.is_sensitive" class="sensitive-value">
                  ••••••••
                </span>
                <span v-else-if="setting.value_type === 'boolean'" class="boolean-value">
                  <font-awesome-icon :icon="setting.value ? 'check-circle' : 'times-circle'" :class="setting.value ? 'text-success' : 'text-danger'" />
                  {{ setting.value ? 'Activé' : 'Désactivé' }}
                </span>
                <span v-else-if="setting.value_type === 'json'" class="json-value">
                  <pre>{{ formatJsonValue(setting.value) }}</pre>
                </span>
                <span v-else class="text-value">
                  {{ setting.value || 'Non défini' }}
                </span>
              </div>
              
              <div class="setting-timestamps">
                <small class="timestamp">
                  Modifié le {{ formatDate(setting.updated_at) }}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog de création -->
    <div v-if="showCreateDialog" class="modal-overlay" @click="closeCreateDialog">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <font-awesome-icon icon="plus" />
            Nouveau Paramètre
          </h3>
          <button @click="closeCreateDialog" class="btn-close">
            <font-awesome-icon icon="times" />
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="createSetting">
            <div class="form-group">
              <label class="form-label">Clé *</label>
              <input 
                v-model="newSetting.key" 
                type="text" 
                class="form-input"
                placeholder="ex: app.maintenance_mode"
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Valeur *</label>
              <input 
                v-model="newSetting.value" 
                type="text" 
                class="form-input"
                placeholder="Valeur du paramètre"
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Type de valeur</label>
              <select v-model="newSetting.value_type" class="form-select">
                <option value="string">Texte</option>
                <option value="number">Nombre</option>
                <option value="boolean">Booléen</option>
                <option value="json">JSON</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Catégorie</label>
              <select v-model="newSetting.category" class="form-select">
                <option value="general">Général</option>
                <option value="security">Sécurité</option>
                <option value="email">Email</option>
                <option value="api">API</option>
                <option value="ui">Interface</option>
                <option value="performance">Performance</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea 
                v-model="newSetting.description" 
                class="form-textarea"
                rows="3"
                placeholder="Description du paramètre (optionnel)"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="newSetting.is_sensitive"
                />
                <span class="checkmark"></span>
                Paramètre sensible (masquer la valeur)
              </label>
            </div>
            
            <div v-if="createError" class="error-message">
              <font-awesome-icon icon="exclamation-circle" />
              {{ createError }}
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button @click="closeCreateDialog" class="btn btn-secondary">
            Annuler
          </button>
          <button 
            @click="createSetting" 
            class="btn btn-primary"
            :disabled="creating || !newSetting.key || !newSetting.value"
          >
            <font-awesome-icon :icon="creating ? 'spinner' : 'plus'" :class="{ 'fa-spin': creating }" />
            Créer
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
import { ref, computed, onMounted, reactive } from 'vue';
import authService from '@/services/authService'

export default {
  name: 'PlatformSettings',
  setup() {
    // État réactif
    const loading = ref(false);
    const error = ref(null);
    const settings = ref([]);
    const searchQuery = ref('');
    const selectedCategory = ref('all');
    const editingSettings = reactive({});
    const savingSettings = reactive({});
    const validationErrors = reactive({});
    
    // Dialog de création
    const showCreateDialog = ref(false);
    const creating = ref(false);
    const createError = ref(null);
    const newSetting = reactive({
      key: '',
      value: '',
      value_type: 'string',
      category: 'general',
      description: '',
      is_sensitive: false
    });
    
    // Notification
    const notification = reactive({
      show: false,
      type: 'success',
      message: ''
    });

    // Catégories disponibles
    const categories = computed(() => {
      const cats = ['all', ...new Set(settings.value.map(s => s.category))];
      return cats;
    });

    // Paramètres filtrés
    const filteredSettings = computed(() => {
      let filtered = settings.value;
      
      // Filtrer par catégorie
      if (selectedCategory.value !== 'all') {
        filtered = filtered.filter(s => s.category === selectedCategory.value);
      }
      
      // Filtrer par recherche
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(s => 
          s.key.toLowerCase().includes(query) ||
          (s.description && s.description.toLowerCase().includes(query))
        );
      }
      
      return filtered.sort((a, b) => a.key.localeCompare(b.key));
    });

    // Méthodes utilitaires
    const getCategoryLabel = (category) => {
      const labels = {
        'all': 'Tous',
        'general': 'Général',
        'security': 'Sécurité',
        'email': 'Email',
        'api': 'API',
        'ui': 'Interface',
        'performance': 'Performance'
      };
      return labels[category] || category;
    };

    const getTypeLabel = (type) => {
      const labels = {
        'string': 'Texte',
        'number': 'Nombre',
        'boolean': 'Booléen',
        'json': 'JSON'
      };
      return labels[type] || type;
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'Jamais';
      return new Date(dateString).toLocaleString('fr-FR');
    };

    const formatJsonValue = (value) => {
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch {
        return value;
      }
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
    const fetchSettings = async () => {
      try {
        loading.value = true;
        error.value = null;
        
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/super-admin/settings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.data;
        settings.value = data.settings || [];
        
      } catch (err) {
        if (err.response?.status === 401) {
          router.push('/login');
          return;
        }
        error.value = err.message;
        console.error('Erreur chargement paramètres:', err);
      } finally {
        loading.value = false;
      }
    };

    const refreshSettings = () => {
      fetchSettings();
    };

    // Gestion de l'édition
    const editSetting = (setting) => {
      editingSettings[setting.key] = {
        value: setting.value,
        originalValue: setting.value
      };
      validationErrors[setting.key] = null;
    };

    const cancelEdit = (key) => {
      delete editingSettings[key];
      delete validationErrors[key];
    };

    const validateSetting = (key, value, type) => {
      if (type === 'number' && isNaN(Number(value))) {
        return 'La valeur doit être un nombre valide';
      }
      
      if (type === 'json') {
        try {
          JSON.parse(value);
        } catch {
          return 'La valeur doit être un JSON valide';
        }
      }
      
      return null;
    };

    const saveSetting = async (key) => {
      try {
        savingSettings[key] = true;
        validationErrors[key] = null;
        
        const setting = settings.value.find(s => s.key === key);
        const newValue = editingSettings[key].value;
        
        // Validation
        const validationError = validateSetting(key, newValue, setting.value_type);
        if (validationError) {
          validationErrors[key] = validationError;
          return;
        }
        
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/super-admin/settings/${key}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ value: newValue })
        });

        // Mettre à jour localement
        const settingIndex = settings.value.findIndex(s => s.key === key);
        if (settingIndex !== -1) {
          settings.value[settingIndex].value = newValue;
          settings.value[settingIndex].updated_at = new Date().toISOString();
        }
        
        delete editingSettings[key];
        showNotification('Paramètre mis à jour avec succès');
        
      } catch (err) {
        if (err.response?.status === 401) {
          router.push('/login');
          return;
        }
        validationErrors[key] = err.message;
        console.error('Erreur sauvegarde paramètre:', err);
      } finally {
        savingSettings[key] = false;
      }
    };

    // Gestion de la création
    const closeCreateDialog = () => {
      showCreateDialog.value = false;
      createError.value = null;
      Object.assign(newSetting, {
        key: '',
        value: '',
        value_type: 'string',
        category: 'general',
        description: '',
        is_sensitive: false
      });
    };

    const createSetting = async () => {
      try {
        creating.value = true;
        createError.value = null;
        
        // Validation
        if (!newSetting.key || !newSetting.value) {
          createError.value = 'La clé et la valeur sont obligatoires';
          return;
        }
        
        if (settings.value.some(s => s.key === newSetting.key)) {
          createError.value = 'Cette clé existe déjà';
          return;
        }
        
        const validationError = validateSetting(newSetting.key, newSetting.value, newSetting.value_type);
        if (validationError) {
          createError.value = validationError;
          return;
        }
        
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/super-admin/settings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newSetting)
        });

        const data = await response.data;
        settings.value.push(data.setting);
        
        closeCreateDialog();
        showNotification('Paramètre créé avec succès');
        
      } catch (err) {
        if (err.response?.status === 401) {
          router.push('/login');
          return;
        }
        createError.value = err.message;
        console.error('Erreur création paramètre:', err);
      } finally {
        creating.value = false;
      }
    };

    // Gestion de la suppression
    const deleteSetting = async (setting) => {
      if (setting.is_system) {
        showNotification('Impossible de supprimer un paramètre système', 'error');
        return;
      }
      
      if (!confirm(`Êtes-vous sûr de vouloir supprimer le paramètre "${setting.key}" ?`)) {
        return;
      }
      
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/super-admin/settings/${setting.key}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        settings.value = settings.value.filter(s => s.key !== setting.key);
        showNotification('Paramètre supprimé avec succès');
        
      } catch (err) {
        if (err.response?.status === 401) {
          router.push('/login');
          return;
        }
        showNotification(`Erreur lors de la suppression: ${err.message}`, 'error');
        console.error('Erreur suppression paramètre:', err);
      }
    };

    // Initialisation
    onMounted(() => {
      fetchSettings();
    });

    return {
      // État
      loading,
      error,
      settings,
      searchQuery,
      selectedCategory,
      editingSettings,
      savingSettings,
      validationErrors,
      
      // Dialog création
      showCreateDialog,
      creating,
      createError,
      newSetting,
      
      // Notification
      notification,
      
      // Computed
      categories,
      filteredSettings,
      
      // Méthodes
      getCategoryLabel,
      getTypeLabel,
      formatDate,
      formatJsonValue,
      getNotificationIcon,
      refreshSettings,
      editSetting,
      cancelEdit,
      saveSetting,
      closeCreateDialog,
      createSetting,
      deleteSetting
    };
  }
};
</script>

<style scoped>
.platform-settings {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.settings-header {
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

.search-filters {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-box {
  position: relative;
  margin-bottom: 20px;
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

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.filter-tab:hover {
  border-color: #667eea;
  background: #f7fafc;
}

.filter-tab.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
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

.settings-grid {
  display: grid;
  gap: 20px;
}

.setting-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.setting-card:hover {
  transform: translateY(-2px);
}

.setting-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.setting-info {
  flex: 1;
}

.setting-key {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 8px 0;
  font-family: 'Monaco', 'Menlo', monospace;
}

.setting-description {
  color: #718096;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.setting-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.setting-category,
.setting-type,
.setting-sensitive {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.setting-category {
  background: #e6fffa;
  color: #234e52;
}

.setting-type {
  background: #fef5e7;
  color: #c05621;
}

.setting-sensitive {
  background: #fed7d7;
  color: #c53030;
}

.setting-actions {
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

.btn-icon:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.btn-icon.btn-danger:hover:not(:disabled) {
  background: #e53e3e;
  color: white;
}

.btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.setting-value {
  padding: 24px;
}

.setting-edit {
  space-y: 16px;
}

.boolean-input {
  margin-bottom: 16px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #667eea;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  margin-bottom: 16px;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: 'Monaco', 'Menlo', monospace;
}

.edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.validation-error {
  color: #e53e3e;
  font-size: 0.9rem;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.setting-display {
  space-y: 12px;
}

.current-value {
  margin-bottom: 12px;
}

.sensitive-value {
  color: #a0aec0;
  font-family: monospace;
}

.boolean-value {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.text-success {
  color: #38a169;
}

.text-danger {
  color: #e53e3e;
}

.json-value pre {
  background: #f7fafc;
  padding: 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  overflow-x: auto;
  margin: 0;
}

.text-value {
  font-family: 'Monaco', 'Menlo', monospace;
  background: #f7fafc;
  padding: 8px 12px;
  border-radius: 6px;
  display: inline-block;
  max-width: 100%;
  word-break: break-all;
}

.setting-timestamps {
  border-top: 1px solid #e2e8f0;
  padding-top: 12px;
}

.timestamp {
  color: #a0aec0;
  font-size: 0.8rem;
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

.btn-sm {
  padding: 6px 12px;
  font-size: 0.9rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 24px 24px 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  padding: 24px;
}

.modal-footer {
  padding: 0 24px 24px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #4a5568;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
}

.error-message {
  color: #e53e3e;
  font-size: 0.9rem;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
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
  .platform-settings {
    padding: 16px;
  }
  
  .settings-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .header-actions {
    flex-direction: column;
  }
  
  .search-filters {
    padding: 16px;
  }
  
  .filter-tabs {
    gap: 6px;
  }
  
  .filter-tab {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
  
  .setting-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .setting-actions {
    align-self: flex-end;
  }
  
  .modal-content {
    margin: 10px;
    max-width: none;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }
  
  .notification {
    left: 20px;
    right: 20px;
    min-width: auto;
  }
}
</style>