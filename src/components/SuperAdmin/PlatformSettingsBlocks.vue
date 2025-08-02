<template>
  <div class="platform-settings-blocks">
    <!-- En-tête -->
    <div class="settings-header">
      <h2 class="settings-title">
        <i class="fas fa-cogs"></i>
        Paramètres de la Plateforme
      </h2>
      <p class="settings-description">
        Gérez les paramètres de votre plateforme par catégories pour une configuration simplifiée.
      </p>
    </div>

    <!-- Actions globales -->
    <div class="global-actions">
      <button 
        @click="initializeAllBlocks" 
        class="btn btn-primary"
        :disabled="loading"
      >
        <i class="fas fa-magic"></i>
        Initialiser tous les blocs
      </button>
      
      <button 
        @click="saveAllSettings" 
        class="btn btn-success"
        :disabled="loading || !hasChanges"
      >
        <i class="fas fa-save"></i>
        Sauvegarder tout
      </button>
      
      <button 
        @click="refreshSettings" 
        class="btn btn-secondary"
        :disabled="loading"
      >
        <i class="fas fa-sync-alt"></i>
        Actualiser
      </button>
    </div>

    <!-- Indicateur de chargement -->
    <div v-if="loading" class="loading-indicator">
      <i class="fas fa-spinner fa-spin"></i>
      Chargement des paramètres...
    </div>

    <!-- Blocs de paramètres -->
    <div v-else class="settings-blocks">
      <div 
        v-for="(block, blockKey) in settingsBlocks" 
        :key="blockKey"
        class="settings-block"
        :class="{ 'has-changes': blockHasChanges(blockKey) }"
      >
        <!-- En-tête du bloc -->
        <div class="block-header" @click="toggleBlock(blockKey)">
          <div class="block-info">
            <h3 class="block-title">
              <i :class="getBlockIcon(blockKey)"></i>
              {{ block.title }}
            </h3>
            <p class="block-description">{{ block.description }}</p>
          </div>
          
          <div class="block-controls">
            <span class="settings-count">
              {{ block.settings?.length || 0 }} paramètres
            </span>
            
            <button 
              @click.stop="resetBlock(blockKey)"
              class="btn btn-sm btn-warning"
              :disabled="loading"
              title="Réinitialiser aux valeurs par défaut"
            >
              <i class="fas fa-undo"></i>
            </button>
            
            <button 
              @click.stop="exportBlock(blockKey)"
              class="btn btn-sm btn-info"
              :disabled="loading"
              title="Exporter ce bloc"
            >
              <i class="fas fa-download"></i>
            </button>
            
            <i 
              class="fas fa-chevron-down toggle-icon"
              :class="{ 'rotated': expandedBlocks.includes(blockKey) }"
            ></i>
          </div>
        </div>

        <!-- Contenu du bloc -->
        <div 
          v-show="expandedBlocks.includes(blockKey)"
          class="block-content"
        >
          <div class="settings-grid">
            <div 
              v-for="setting in block.settings" 
              :key="setting.key"
              class="setting-item"
              :class="{ 'modified': isSettingModified(blockKey, setting.key) }"
            >
              <label class="setting-label">
                {{ formatSettingLabel(setting.key) }}
                <span v-if="setting.required" class="required">*</span>
              </label>
              
              <div class="setting-input-group">
                <!-- Input URL -->
                <input 
                  v-if="setting.type === 'url'"
                  v-model="settingValues[blockKey][setting.key]"
                  type="url"
                  class="form-control"
                  :placeholder="setting.description"
                  @input="markAsModified(blockKey, setting.key)"
                />
                
                <!-- Input Number -->
                <input 
                  v-else-if="setting.type === 'number'"
                  v-model.number="settingValues[blockKey][setting.key]"
                  type="number"
                  class="form-control"
                  :placeholder="setting.description"
                  @input="markAsModified(blockKey, setting.key)"
                />
                
                <!-- Toggle Boolean -->
                <div 
                  v-else-if="setting.type === 'boolean'"
                  class="toggle-switch"
                >
                  <input 
                    :id="`toggle-${blockKey}-${setting.key}`"
                    v-model="settingValues[blockKey][setting.key]"
                    type="checkbox"
                    class="toggle-input"
                    @change="markAsModified(blockKey, setting.key)"
                  />
                  <label 
                    :for="`toggle-${blockKey}-${setting.key}`"
                    class="toggle-label"
                  >
                    <span class="toggle-slider"></span>
                  </label>
                  <span class="toggle-text">
                    {{ settingValues[blockKey][setting.key] ? 'Activé' : 'Désactivé' }}
                  </span>
                </div>
                
                <!-- Select -->
                <select 
                  v-else-if="getSelectOptions(setting.key).length > 0"
                  v-model="settingValues[blockKey][setting.key]"
                  class="form-control"
                  @change="markAsModified(blockKey, setting.key)"
                >
                  <option 
                    v-for="option in getSelectOptions(setting.key)" 
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                
                <!-- Input Text par défaut -->
                <input 
                  v-else
                  v-model="settingValues[blockKey][setting.key]"
                  type="text"
                  class="form-control"
                  :placeholder="setting.description"
                  @input="markAsModified(blockKey, setting.key)"
                />
                
                <!-- Bouton de sauvegarde individuelle -->
                <button 
                  v-if="isSettingModified(blockKey, setting.key)"
                  @click="saveSingleSetting(blockKey, setting)"
                  class="btn btn-sm btn-success save-individual"
                  :disabled="loading"
                  title="Sauvegarder ce paramètre"
                >
                  <i class="fas fa-check"></i>
                </button>
              </div>
              
              <small class="setting-description">{{ setting.description }}</small>
            </div>
          </div>
          
          <!-- Actions du bloc -->
          <div class="block-actions">
            <button 
              @click="saveBlockSettings(blockKey)"
              class="btn btn-primary"
              :disabled="loading || !blockHasChanges(blockKey)"
            >
              <i class="fas fa-save"></i>
              Sauvegarder ce bloc
            </button>
            
            <input 
              ref="fileInput"
              type="file"
              accept=".json"
              style="display: none"
              @change="importBlock(blockKey, $event)"
            />
            
            <button 
              @click="$refs.fileInput.click()"
              class="btn btn-secondary"
              :disabled="loading"
            >
              <i class="fas fa-upload"></i>
              Importer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div 
      v-if="notification.show" 
      class="notification"
      :class="notification.type"
    >
      <i :class="getNotificationIcon(notification.type)"></i>
      {{ notification.message }}
      <button @click="hideNotification" class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import superAdminAPI from '../../services/superAdminAPI.js'

export default {
  name: 'PlatformSettingsBlocks',
  setup() {
    // État réactif
    const loading = ref(false)
    const settingsBlocks = ref({})
    const settingValues = reactive({})
    const modifiedSettings = reactive({})
    const expandedBlocks = ref(['general']) // Bloc général ouvert par défaut
    const notification = reactive({
      show: false,
      type: 'success',
      message: ''
    })

    // Computed
    const hasChanges = computed(() => {
      return Object.keys(modifiedSettings).some(blockKey => 
        Object.keys(modifiedSettings[blockKey] || {}).length > 0
      )
    })

    // Méthodes
    const showNotification = (message, type = 'success') => {
      notification.message = message
      notification.type = type
      notification.show = true
      
      setTimeout(() => {
        hideNotification()
      }, 5000)
    }

    const hideNotification = () => {
      notification.show = false
    }

    const loadSettings = async () => {
      loading.value = true
      try {
        const response = await superAdminAPI.getAllSettingsBlocks()
        
        if (response.success) {
          settingsBlocks.value = response.blocks
          
          // Initialiser les valeurs
          Object.keys(response.blocks).forEach(blockKey => {
            if (!settingValues[blockKey]) {
              settingValues[blockKey] = {}
            }
            if (!modifiedSettings[blockKey]) {
              modifiedSettings[blockKey] = {}
            }
            
            response.blocks[blockKey].settings?.forEach(setting => {
              let value = setting.value
              
              // Conversion des types
              if (setting.type === 'boolean') {
                value = value === 'true' || value === true
              } else if (setting.type === 'number') {
                value = parseFloat(value) || 0
              }
              
              settingValues[blockKey][setting.key] = value
            })
          })
          
          showNotification('Paramètres chargés avec succès')
        } else {
          throw new Error(response.message || 'Erreur lors du chargement')
        }
      } catch (error) {
        console.error('Erreur chargement paramètres:', error)
        showNotification('Erreur lors du chargement des paramètres', 'error')
      } finally {
        loading.value = false
      }
    }

    const toggleBlock = (blockKey) => {
      const index = expandedBlocks.value.indexOf(blockKey)
      if (index > -1) {
        expandedBlocks.value.splice(index, 1)
      } else {
        expandedBlocks.value.push(blockKey)
      }
    }

    const markAsModified = (blockKey, settingKey) => {
      if (!modifiedSettings[blockKey]) {
        modifiedSettings[blockKey] = {}
      }
      modifiedSettings[blockKey][settingKey] = true
    }

    const isSettingModified = (blockKey, settingKey) => {
      return modifiedSettings[blockKey]?.[settingKey] || false
    }

    const blockHasChanges = (blockKey) => {
      return Object.keys(modifiedSettings[blockKey] || {}).length > 0
    }

    const saveSingleSetting = async (blockKey, setting) => {
      loading.value = true
      try {
        const value = settingValues[blockKey][setting.key]
        
        const response = await superAdminAPI.saveSettingsBlock(blockKey, [{
          key: setting.key,
          value: value.toString(),
          type: setting.type,
          description: setting.description
        }])
        
        if (response.success) {
          delete modifiedSettings[blockKey][setting.key]
          showNotification(`Paramètre "${formatSettingLabel(setting.key)}" sauvegardé`)
        } else {
          throw new Error(response.message || 'Erreur lors de la sauvegarde')
        }
      } catch (error) {
        console.error('Erreur sauvegarde paramètre:', error)
        showNotification('Erreur lors de la sauvegarde', 'error')
      } finally {
        loading.value = false
      }
    }

    const saveBlockSettings = async (blockKey) => {
      loading.value = true
      try {
        const block = settingsBlocks.value[blockKey]
        const settingsToSave = []
        
        block.settings?.forEach(setting => {
          if (isSettingModified(blockKey, setting.key)) {
            settingsToSave.push({
              key: setting.key,
              value: settingValues[blockKey][setting.key].toString(),
              type: setting.type,
              description: setting.description
            })
          }
        })
        
        if (settingsToSave.length === 0) {
          showNotification('Aucune modification à sauvegarder', 'warning')
          return
        }
        
        const response = await superAdminAPI.saveSettingsBlock(blockKey, settingsToSave)
        
        if (response.success) {
          modifiedSettings[blockKey] = {}
          showNotification(`Bloc "${block.title}" sauvegardé (${settingsToSave.length} paramètres)`)
        } else {
          throw new Error(response.message || 'Erreur lors de la sauvegarde')
        }
      } catch (error) {
        console.error('Erreur sauvegarde bloc:', error)
        showNotification('Erreur lors de la sauvegarde du bloc', 'error')
      } finally {
        loading.value = false
      }
    }

    const saveAllSettings = async () => {
      loading.value = true
      try {
        let totalSaved = 0
        
        for (const blockKey of Object.keys(modifiedSettings)) {
          if (blockHasChanges(blockKey)) {
            await saveBlockSettings(blockKey)
            totalSaved++
          }
        }
        
        if (totalSaved > 0) {
          showNotification(`${totalSaved} blocs sauvegardés avec succès`)
        } else {
          showNotification('Aucune modification à sauvegarder', 'warning')
        }
      } catch (error) {
        console.error('Erreur sauvegarde globale:', error)
        showNotification('Erreur lors de la sauvegarde globale', 'error')
      } finally {
        loading.value = false
      }
    }

    const resetBlock = async (blockKey) => {
      if (!confirm(`Êtes-vous sûr de vouloir réinitialiser le bloc "${settingsBlocks.value[blockKey]?.title}" ?`)) {
        return
      }
      
      loading.value = true
      try {
        const response = await superAdminAPI.resetSettingsBlock(blockKey)
        
        if (response.success) {
          await loadSettings() // Recharger pour voir les nouvelles valeurs
          showNotification(`Bloc "${settingsBlocks.value[blockKey]?.title}" réinitialisé`)
        } else {
          throw new Error(response.message || 'Erreur lors de la réinitialisation')
        }
      } catch (error) {
        console.error('Erreur réinitialisation bloc:', error)
        showNotification('Erreur lors de la réinitialisation', 'error')
      } finally {
        loading.value = false
      }
    }

    const exportBlock = async (blockKey) => {
      loading.value = true
      try {
        const response = await superAdminAPI.exportSettingsBlock(blockKey)
        
        // Créer et télécharger le fichier
        const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${blockKey}-settings-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        showNotification(`Bloc "${settingsBlocks.value[blockKey]?.title}" exporté`)
      } catch (error) {
        console.error('Erreur export bloc:', error)
        showNotification('Erreur lors de l\'export', 'error')
      } finally {
        loading.value = false
      }
    }

    const importBlock = async (blockKey, event) => {
      const file = event.target.files[0]
      if (!file) return
      
      loading.value = true
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        
        const response = await superAdminAPI.importSettingsBlock(blockKey, data)
        
        if (response.success) {
          await loadSettings() // Recharger pour voir les nouvelles valeurs
          showNotification(`Bloc "${settingsBlocks.value[blockKey]?.title}" importé`)
        } else {
          throw new Error(response.message || 'Erreur lors de l\'import')
        }
      } catch (error) {
        console.error('Erreur import bloc:', error)
        showNotification('Erreur lors de l\'import', 'error')
      } finally {
        loading.value = false
        event.target.value = '' // Reset input
      }
    }

    const initializeAllBlocks = async () => {
      if (!confirm('Êtes-vous sûr de vouloir initialiser tous les blocs avec leurs valeurs par défaut ?')) {
        return
      }
      
      loading.value = true
      try {
        const response = await superAdminAPI.initializeSettingsBlocks()
        
        if (response.success) {
          await loadSettings()
          showNotification(`${response.totalSettings} paramètres initialisés dans ${response.blocks.length} blocs`)
        } else {
          throw new Error(response.message || 'Erreur lors de l\'initialisation')
        }
      } catch (error) {
        console.error('Erreur initialisation:', error)
        showNotification('Erreur lors de l\'initialisation', 'error')
      } finally {
        loading.value = false
      }
    }

    const refreshSettings = () => {
      loadSettings()
    }

    // Utilitaires
    const formatSettingLabel = (key) => {
      return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
    }

    const getBlockIcon = (blockKey) => {
      const icons = {
        general: 'fas fa-cog',
        email: 'fas fa-envelope',
        security: 'fas fa-shield-alt',
        api: 'fas fa-plug',
        ui: 'fas fa-palette'
      }
      return icons[blockKey] || 'fas fa-cog'
    }

    const getNotificationIcon = (type) => {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
      }
      return icons[type] || 'fas fa-info-circle'
    }

    const getSelectOptions = (settingKey) => {
      const options = {
        theme_mode: [
          { value: 'light', label: 'Clair' },
          { value: 'dark', label: 'Sombre' },
          { value: 'auto', label: 'Automatique' }
        ],
        items_per_page: [
          { value: '10', label: '10 éléments' },
          { value: '25', label: '25 éléments' },
          { value: '50', label: '50 éléments' },
          { value: '100', label: '100 éléments' }
        ]
      }
      return options[settingKey] || []
    }

    // Lifecycle
    onMounted(() => {
      loadSettings()
    })

    return {
      loading,
      settingsBlocks,
      settingValues,
      modifiedSettings,
      expandedBlocks,
      notification,
      hasChanges,
      showNotification,
      hideNotification,
      loadSettings,
      toggleBlock,
      markAsModified,
      isSettingModified,
      blockHasChanges,
      saveSingleSetting,
      saveBlockSettings,
      saveAllSettings,
      resetBlock,
      exportBlock,
      importBlock,
      initializeAllBlocks,
      refreshSettings,
      formatSettingLabel,
      getBlockIcon,
      getNotificationIcon,
      getSelectOptions
    }
  }
}
</script>

<style scoped>
.platform-settings-blocks {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.settings-header {
  text-align: center;
  margin-bottom: 30px;
}

.settings-title {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2.5rem;
}

.settings-title i {
  margin-right: 15px;
  color: #3498db;
}

.settings-description {
  color: #7f8c8d;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

.global-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-success {
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.btn-secondary {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  color: white;
}

.btn-warning {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.btn-info {
  background: linear-gradient(135deg, #17a2b8, #138496);
  color: white;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.875rem;
}

.loading-indicator {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  font-size: 1.1rem;
}

.loading-indicator i {
  margin-right: 10px;
  color: #3498db;
}

.settings-blocks {
  display: grid;
  gap: 20px;
}

.settings-block {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.settings-block.has-changes {
  border-left: 4px solid #f39c12;
  box-shadow: 0 2px 15px rgba(243, 156, 18, 0.2);
}

.block-header {
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.3s ease;
}

.block-header:hover {
  background: linear-gradient(135deg, #e9ecef, #dee2e6);
}

.block-info {
  flex: 1;
}

.block-title {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.block-description {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.block-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.settings-count {
  background: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.toggle-icon {
  transition: transform 0.3s ease;
  color: #7f8c8d;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.block-content {
  padding: 20px;
}

.settings-grid {
  display: grid;
  gap: 20px;
  margin-bottom: 20px;
}

.setting-item {
  padding: 15px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.setting-item.modified {
  border-color: #f39c12;
  background: #fef9e7;
}

.setting-label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.required {
  color: #e74c3c;
  margin-left: 4px;
}

.setting-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.form-control {
  flex: 1;
  padding: 10px;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.toggle-input {
  display: none;
}

.toggle-label {
  position: relative;
  width: 50px;
  height: 24px;
  background: #bdc3c7;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.toggle-input:checked + .toggle-label {
  background: #27ae60;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked + .toggle-label .toggle-slider {
  transform: translateX(26px);
}

.toggle-text {
  font-weight: 600;
  color: #2c3e50;
}

.save-individual {
  flex-shrink: 0;
}

.setting-description {
  color: #7f8c8d;
  font-style: italic;
  line-height: 1.4;
}

.block-actions {
  display: flex;
  gap: 15px;
  padding-top: 15px;
  border-top: 1px solid #ecf0f1;
  flex-wrap: wrap;
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification.success {
  background: linear-gradient(135deg, #27ae60, #229954);
}

.notification.error {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.notification.warning {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.notification.info {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.notification-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  margin-left: auto;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.notification-close:hover {
  opacity: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .platform-settings-blocks {
    padding: 15px;
  }
  
  .settings-title {
    font-size: 2rem;
  }
  
  .global-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .block-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .block-controls {
    justify-content: center;
  }
  
  .block-actions {
    flex-direction: column;
  }
  
  .notification {
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>