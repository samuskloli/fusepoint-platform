<template>
  <div class="notification-center">
    <!-- Bouton de notification avec badge -->
    <div class="notification-trigger" @click="toggleNotifications">
      <i class="fas fa-bell"></i>
      <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
    </div>

    <!-- Panel de notifications -->
    <div v-if="showNotifications" class="notification-panel" @click.stop>
      <div class="notification-header">
        <h3>
          <i class="fas fa-brain"></i>
          Notifications IA
        </h3>
        <div class="header-actions">
          <button @click="markAllAsRead" class="mark-read-btn" v-if="unreadCount > 0">
            <i class="fas fa-check-double"></i>
            Tout marquer lu
          </button>
          <button @click="openSettings" class="settings-btn">
            <i class="fas fa-cog"></i>
          </button>
        </div>
      </div>

      <!-- Filtres intelligents -->
      <div class="notification-filters">
        <button v-for="filter in filters" :key="filter.id" 
                @click="setActiveFilter(filter.id)"
                :class="['filter-btn', { active: activeFilter === filter.id }]">
          <i :class="filter.icon"></i>
          {{ filter.label }}
          <span v-if="filter.count > 0" class="filter-count">{{ filter.count }}</span>
        </button>
      </div>

      <!-- Suggestions IA -->
      <div v-if="aiSuggestions.length > 0" class="ai-suggestions">
        <h4><i class="fas fa-lightbulb"></i> Suggestions IA</h4>
        <div v-for="suggestion in aiSuggestions" :key="suggestion.id" 
             class="suggestion-item" @click="applySuggestion(suggestion)">
          <div class="suggestion-icon">{{ suggestion.icon }}</div>
          <div class="suggestion-content">
            <div class="suggestion-title">{{ suggestion.title }}</div>
            <div class="suggestion-description">{{ suggestion.description }}</div>
          </div>
          <div class="suggestion-confidence">
            <div class="confidence-bar">
              <div class="confidence-fill" :style="{ width: suggestion.confidence * 100 + '%' }"></div>
            </div>
            <span class="confidence-text">{{ Math.round(suggestion.confidence * 100) }}%</span>
          </div>
        </div>
      </div>

      <!-- Liste des notifications -->
      <div class="notifications-list">
        <div v-if="filteredNotifications.length === 0" class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>Aucune notification {{ activeFilter !== 'all' ? 'dans cette catégorie' : '' }}</p>
        </div>
        
        <div v-for="notification in filteredNotifications" :key="notification.id" 
             :class="['notification-item', notification.type, { unread: !notification.read }]"
             @click="handleNotificationClick(notification)">
          
          <!-- Notification de Performance -->
          <div v-if="notification.type === 'performance'" class="notification-content">
            <div class="notification-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="notification-body">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message-container">
                <div class="notification-message" :class="{ 'expanded': expandedNotifications.has(notification.id) }">
                  {{ getDisplayMessage(notification) }}
                </div>
                <button 
                  v-if="isMessageLong(notification.message)"
                  @click.stop="toggleMessageExpansion(notification.id)"
                  class="see-more-btn"
                >
                  {{ expandedNotifications.has(notification.id) ? 'Voir moins' : 'Voir plus' }}
                </button>
              </div>
              <div class="notification-metrics" v-if="notification.metrics">
                <span v-for="metric in notification.metrics" :key="metric.label" 
                      class="metric-chip">
                  {{ metric.label }}: {{ metric.value }}
                </span>
              </div>
              <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
            </div>
            <div class="notification-actions">
              <button @click.stop="viewDetails(notification)" class="action-btn primary">
                Voir détails
              </button>
            </div>
          </div>

          <!-- Notification d'Alerte -->
          <div v-else-if="notification.type === 'alert'" class="notification-content">
            <div class="notification-icon">
              <i :class="getAlertIcon(notification.severity)"></i>
            </div>
            <div class="notification-body">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message-container">
                <div class="notification-message" :class="{ 'expanded': expandedNotifications.has(notification.id) }">
                  {{ getDisplayMessage(notification) }}
                </div>
                <button 
                  v-if="isMessageLong(notification.message)"
                  @click.stop="toggleMessageExpansion(notification.id)"
                  class="see-more-btn"
                >
                  {{ expandedNotifications.has(notification.id) ? 'Voir moins' : 'Voir plus' }}
                </button>
              </div>
              <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
            </div>
            <div class="notification-actions">
              <button @click.stop="resolveAlert(notification)" class="action-btn danger">
                Résoudre
              </button>
            </div>
          </div>

          <!-- Notification d'Opportunité -->
          <div v-else-if="notification.type === 'opportunity'" class="notification-content">
            <div class="notification-icon">
              <i class="fas fa-bullseye"></i>
            </div>
            <div class="notification-body">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message-container">
                <div class="notification-message" :class="{ 'expanded': expandedNotifications.has(notification.id) }">
                  {{ getDisplayMessage(notification) }}
                </div>
                <button 
                  v-if="isMessageLong(notification.message)"
                  @click.stop="toggleMessageExpansion(notification.id)"
                  class="see-more-btn"
                >
                  {{ expandedNotifications.has(notification.id) ? 'Voir moins' : 'Voir plus' }}
                </button>
              </div>
              <div class="opportunity-value" v-if="notification.potentialValue">
                Valeur potentielle: <strong>{{ notification.potentialValue }}</strong>
              </div>
              <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
            </div>
            <div class="notification-actions">
              <button @click.stop="seizeOpportunity(notification)" class="action-btn success">
                Saisir
              </button>
            </div>
          </div>

          <!-- Notification d'Automatisation -->
          <div v-else-if="notification.type === 'automation'" class="notification-content">
            <div class="notification-icon">
              <i class="fas fa-robot"></i>
            </div>
            <div class="notification-body">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message-container">
                <div class="notification-message" :class="{ 'expanded': expandedNotifications.has(notification.id) }">
                  {{ getDisplayMessage(notification) }}
                </div>
                <button 
                  v-if="isMessageLong(notification.message)"
                  @click.stop="toggleMessageExpansion(notification.id)"
                  class="see-more-btn"
                >
                  {{ expandedNotifications.has(notification.id) ? 'Voir moins' : 'Voir plus' }}
                </button>
              </div>
              <div class="automation-savings" v-if="notification.timeSaved">
                Temps économisé: <strong>{{ notification.timeSaved }}</strong>
              </div>
              <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
            </div>
            <div class="notification-actions">
              <button @click.stop="configureAutomation(notification)" class="action-btn info">
                Configurer
              </button>
            </div>
          </div>

          <!-- Notification générique -->
          <div v-else class="notification-content">
            <div class="notification-icon">
              <i class="fas fa-info-circle"></i>
            </div>
            <div class="notification-body">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message-container">
                <div class="notification-message" :class="{ 'expanded': expandedNotifications.has(notification.id) }">
                  {{ getDisplayMessage(notification) }}
                </div>
                <button 
                  v-if="isMessageLong(notification.message)"
                  @click.stop="toggleMessageExpansion(notification.id)"
                  class="see-more-btn"
                >
                  {{ expandedNotifications.has(notification.id) ? 'Voir moins' : 'Voir plus' }}
                </button>
              </div>
              <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
            </div>
          </div>

          <!-- Indicateur de priorité -->
          <div :class="['priority-indicator', notification.priority]"></div>
        </div>
      </div>

      <!-- Actions en bas -->
      <div class="notification-footer">
        <button @click="loadMoreNotifications" v-if="hasMoreNotifications" 
                class="load-more-btn" :disabled="loadingMore">
          <i class="fas fa-spinner fa-spin" v-if="loadingMore"></i>
          <i class="fas fa-chevron-down" v-else></i>
          Charger plus
        </button>
      </div>
    </div>

    <!-- Modal de paramètres -->
    <div v-if="showSettings" class="modal-overlay" @click="closeSettings">
      <div class="settings-modal" @click.stop>
        <div class="modal-header">
          <h3>Paramètres de Notifications</h3>
          <button @click="closeSettings" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-content">
          <div class="settings-section">
            <h4>Fréquence des notifications</h4>
            <label class="setting-option">
              <input type="radio" value="realtime" v-model="settings.frequency">
              <span>Temps réel</span>
            </label>
            <label class="setting-option">
              <input type="radio" value="hourly" v-model="settings.frequency">
              <span>Toutes les heures</span>
            </label>
            <label class="setting-option">
              <input type="radio" value="daily" v-model="settings.frequency">
              <span>Quotidienne</span>
            </label>
          </div>
          
          <div class="settings-section">
            <h4>Types de notifications</h4>
            <label class="setting-option">
              <input type="checkbox" v-model="settings.types.performance">
              <span>Alertes de performance</span>
            </label>
            <label class="setting-option">
              <input type="checkbox" v-model="settings.types.opportunities">
              <span>Opportunités détectées</span>
            </label>
            <label class="setting-option">
              <input type="checkbox" v-model="settings.types.automation">
              <span>Mises à jour d'automatisation</span>
            </label>
            <label class="setting-option">
              <input type="checkbox" v-model="settings.types.insights">
              <span>Insights IA</span>
            </label>
          </div>
          
          <div class="settings-section">
            <h4>Niveau d'intelligence IA</h4>
            <div class="ai-level-slider">
              <input type="range" min="1" max="5" v-model="settings.aiLevel" class="slider">
              <div class="slider-labels">
                <span>Basique</span>
                <span>Avancé</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeSettings" class="cancel-btn">Annuler</button>
          <button @click="saveSettings" class="save-btn">Sauvegarder</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import aiPersonalizationService from '../services/aiPersonalizationService.js';
import marketingIntelligenceService from '../services/marketingIntelligenceService.js';

export default {
  name: 'SmartNotificationCenter',
  data() {
    return {
      showNotifications: false,
      showSettings: false,
      activeFilter: 'all',
      loadingMore: false,
      hasMoreNotifications: true,
      notifications: [],
      aiSuggestions: [],
      expandedNotifications: new Set(),
      MESSAGE_PREVIEW_LENGTH: 100,
      settings: {
        frequency: 'realtime',
        types: {
          performance: true,
          opportunities: true,
          automation: true,
          insights: true
        },
        aiLevel: 3
      },
      filters: [
        { id: 'all', label: 'Toutes', icon: 'fas fa-list', count: 0 },
        { id: 'performance', label: 'Performance', icon: 'fas fa-chart-line', count: 0 },
        { id: 'alert', label: 'Alertes', icon: 'fas fa-exclamation-triangle', count: 0 },
        { id: 'opportunity', label: 'Opportunités', icon: 'fas fa-bullseye', count: 0 },
        { id: 'automation', label: 'Automatisation', icon: 'fas fa-robot', count: 0 }
      ]
    };
  },
  computed: {
    unreadCount() {
      return this.notifications.filter(n => !n.read).length;
    },
    filteredNotifications() {
      if (this.activeFilter === 'all') {
        return this.notifications;
      }
      return this.notifications.filter(n => n.type === this.activeFilter);
    }
  },
  async mounted() {
    await this.loadNotifications();
    await this.loadAISuggestions();
    this.loadSettings();
    this.updateFilterCounts();
    
    // Simuler des notifications en temps réel
    this.startRealTimeUpdates();
    
    // Écouter les clics extérieurs pour fermer le panel
    document.addEventListener('click', this.handleOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  },
  methods: {
    async loadNotifications() {
      try {
        // Simuler le chargement de notifications intelligentes
        const mockNotifications = await this.generateSmartNotifications();
        this.notifications = mockNotifications;
        this.updateFilterCounts();
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      }
    },
    
    async generateSmartNotifications() {
      const notifications = [];
      const now = new Date();
      
      // Notifications de performance basées sur les données
      notifications.push({
        id: 'perf_1',
        type: 'performance',
        title: 'Amélioration des conversions détectée',
        message: 'Vos campagnes email montrent une amélioration de 15% cette semaine',
        timestamp: new Date(now - 2 * 60 * 60 * 1000), // Il y a 2h
        read: false,
        priority: 'high',
        metrics: [
          { label: 'Taux de conversion', value: '+15%' },
          { label: 'ROI', value: '+23%' }
        ]
      });
      
      // Alertes intelligentes
      notifications.push({
        id: 'alert_1',
        type: 'alert',
        title: 'Budget publicitaire bientôt épuisé',
        message: 'Votre campagne "Promotion Hiver" atteindra sa limite dans 2 jours',
        timestamp: new Date(now - 30 * 60 * 1000), // Il y a 30min
        read: false,
        priority: 'high',
        severity: 'warning'
      });
      
      // Opportunités détectées par IA
      notifications.push({
        id: 'opp_1',
        type: 'opportunity',
        title: 'Nouveau segment d\'audience identifié',
        message: 'L\'IA a détecté un segment à fort potentiel de conversion dans vos données',
        timestamp: new Date(now - 4 * 60 * 60 * 1000), // Il y a 4h
        read: false,
        priority: 'medium',
        potentialValue: `+${this.formatCurrency ? this.formatCurrency(2500) : '2500€'}/mois`
      });
      
      // Notifications d'automatisation
      notifications.push({
        id: 'auto_1',
        type: 'automation',
        title: 'Workflow d\'email automatisé terminé',
        message: 'Votre séquence de nurturing a converti 12 nouveaux leads',
        timestamp: new Date(now - 6 * 60 * 60 * 1000), // Il y a 6h
        read: true,
        priority: 'low',
        timeSaved: '3.5 heures'
      });
      
      // Insights IA
      notifications.push({
        id: 'insight_1',
        type: 'insight',
        title: 'Tendance saisonnière détectée',
        message: 'L\'IA prédit une augmentation de 30% du trafic la semaine prochaine',
        timestamp: new Date(now - 8 * 60 * 60 * 1000), // Il y a 8h
        read: true,
        priority: 'medium'
      });
      
      return notifications.sort((a, b) => b.timestamp - a.timestamp);
    },
    
    async loadAISuggestions() {
      try {
        // Générer des suggestions basées sur le comportement utilisateur
        this.aiSuggestions = [
          {
            id: 'sug_1',
            title: 'Optimiser le timing d\'envoi',
            description: 'Envoyez vos emails à 14h pour +25% d\'ouvertures',
            icon: '⏰',
            confidence: 0.87,
            action: 'optimize_email_timing'
          },
          {
            id: 'sug_2',
            title: 'Créer une campagne de retargeting',
            description: 'Récupérez 200+ visiteurs perdus cette semaine',
            icon: '🎯',
            confidence: 0.92,
            action: 'create_retargeting_campaign'
          },
          {
            id: 'sug_3',
            title: 'Automatiser le lead scoring',
            description: 'Identifiez automatiquement vos meilleurs prospects',
            icon: '🤖',
            confidence: 0.78,
            action: 'setup_lead_scoring'
          }
        ];
      } catch (error) {
        console.error('Erreur lors du chargement des suggestions IA:', error);
      }
    },
    
    toggleNotifications() {
      this.showNotifications = !this.showNotifications;
      if (this.showNotifications) {
        aiPersonalizationService.trackBehavior('open_notifications');
      }
    },
    
    handleOutsideClick(event) {
      if (!this.$el.contains(event.target)) {
        this.showNotifications = false;
      }
    },
    
    setActiveFilter(filterId) {
      this.activeFilter = filterId;
      aiPersonalizationService.trackBehavior('filter_notifications', { filter: filterId });
    },
    
    updateFilterCounts() {
      this.filters.forEach(filter => {
        if (filter.id === 'all') {
          filter.count = this.notifications.length;
        } else {
          filter.count = this.notifications.filter(n => n.type === filter.id).length;
        }
      });
    },
    
    markAllAsRead() {
      this.notifications.forEach(n => n.read = true);
      aiPersonalizationService.trackBehavior('mark_all_notifications_read');
    },
    
    handleNotificationClick(notification) {
      notification.read = true;
      aiPersonalizationService.trackBehavior('click_notification', {
        type: notification.type,
        id: notification.id
      });
    },
    
    applySuggestion(suggestion) {
      aiPersonalizationService.trackBehavior('apply_ai_suggestion', {
        suggestionId: suggestion.id,
        action: suggestion.action
      });
      
      // Router vers l'action appropriée
      switch (suggestion.action) {
        case 'optimize_email_timing':
          this.$router.push('/marketing?view=automated&optimize=timing');
          break;
        case 'create_retargeting_campaign':
          this.$router.push('/marketing?view=automated&action=retargeting');
          break;
        case 'setup_lead_scoring':
          this.$router.push('/marketing?view=agents&setup=lead_scoring');
          break;
      }
      
      this.showNotifications = false;
    },
    
    viewDetails(notification) {
      aiPersonalizationService.trackBehavior('view_notification_details', {
        notificationId: notification.id
      });
      // Implémenter la vue détaillée
      console.log('Voir détails:', notification);
    },
    
    resolveAlert(notification) {
      notification.read = true;
      aiPersonalizationService.trackBehavior('resolve_alert', {
        alertId: notification.id
      });
      // Implémenter la résolution d'alerte
      console.log('Résoudre alerte:', notification);
    },
    
    seizeOpportunity(notification) {
      aiPersonalizationService.trackBehavior('seize_opportunity', {
        opportunityId: notification.id
      });
      // Implémenter la saisie d'opportunité
      console.log('Saisir opportunité:', notification);
    },
    
    configureAutomation(notification) {
      aiPersonalizationService.trackBehavior('configure_automation', {
        automationId: notification.id
      });
      this.$router.push('/marketing?view=agents');
      this.showNotifications = false;
    },
    
    loadMoreNotifications() {
      this.loadingMore = true;
      // Simuler le chargement
      setTimeout(() => {
        this.loadingMore = false;
        this.hasMoreNotifications = false;
      }, 1000);
    },
    
    openSettings() {
      this.showSettings = true;
    },
    
    closeSettings() {
      this.showSettings = false;
    },
    
    loadSettings() {
      const saved = localStorage.getItem('fusepoint_notification_settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    },
    
    saveSettings() {
      localStorage.setItem('fusepoint_notification_settings', JSON.stringify(this.settings));
      this.closeSettings();
      // Redémarrer les mises à jour avec les nouveaux paramètres
      this.startRealTimeUpdates();
    },
    
    startRealTimeUpdates() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
      }
      
      if (this.settings.frequency === 'realtime') {
        this.updateInterval = setInterval(() => {
          this.checkForNewNotifications();
        }, 30000); // Vérifier toutes les 30 secondes
      }
    },
    
    async checkForNewNotifications() {
      // Simuler la vérification de nouvelles notifications
      const random = Math.random();
      if (random < 0.1) { // 10% de chance
        const newNotification = {
          id: `new_${Date.now()}`,
          type: 'performance',
          title: 'Nouvelle performance détectée',
          message: 'Une amélioration a été détectée dans vos campagnes',
          timestamp: new Date(),
          read: false,
          priority: 'medium'
        };
        
        this.notifications.unshift(newNotification);
        this.updateFilterCounts();
      }
    },
    
    getAlertIcon(severity) {
      const icons = {
        low: 'fas fa-info-circle',
        medium: 'fas fa-exclamation-circle',
        high: 'fas fa-exclamation-triangle',
        critical: 'fas fa-times-circle'
      };
      return icons[severity] || 'fas fa-info-circle';
    },
    
    formatTime(timestamp) {
      const now = new Date();
      const diff = now - timestamp;
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (minutes < 60) {
        return `Il y a ${minutes} min`;
      } else if (hours < 24) {
        return `Il y a ${hours}h`;
      } else {
        return `Il y a ${days}j`;
      }
    },
    
    isMessageLong(message) {
      return message && message.length > this.MESSAGE_PREVIEW_LENGTH;
    },
    
    getDisplayMessage(notification) {
      if (!this.isMessageLong(notification.message)) {
        return notification.message;
      }
      
      if (this.expandedNotifications.has(notification.id)) {
        return notification.message;
      }
      
      return notification.message.substring(0, this.MESSAGE_PREVIEW_LENGTH) + '...';
    },
    
    toggleMessageExpansion(notificationId) {
      if (this.expandedNotifications.has(notificationId)) {
        this.expandedNotifications.delete(notificationId);
      } else {
        this.expandedNotifications.add(notificationId);
      }
    }
  }
};
</script>

<style scoped>
.notification-center {
  position: relative;
}

.notification-trigger {
  position: relative;
  padding: 10px;
  cursor: pointer;
  color: #636e72;
  transition: color 0.3s ease;
}

.notification-trigger:hover {
  color: #2d3436;
}

.notification-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.notification-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 400px;
  max-height: 600px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  z-index: 1000;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.notification-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.mark-read-btn, .settings-btn {
  padding: 6px 12px;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.mark-read-btn:hover, .settings-btn:hover {
  background: rgba(255,255,255,0.3);
}

.notification-filters {
  display: flex;
  padding: 15px;
  gap: 8px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  overflow-x: auto;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.8rem;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  border-color: #74b9ff;
  background: #f8f9ff;
}

.filter-btn.active {
  background: #74b9ff;
  color: white;
  border-color: #74b9ff;
}

.filter-count {
  background: rgba(0,0,0,0.1);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: bold;
}

.filter-btn.active .filter-count {
  background: rgba(255,255,255,0.3);
}

.ai-suggestions {
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.ai-suggestions h4 {
  margin: 0 0 10px 0;
  color: #2d3436;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.suggestion-item:hover {
  background: #e3f2fd;
  transform: translateX(2px);
}

.suggestion-item:last-child {
  margin-bottom: 0;
}

.suggestion-icon {
  font-size: 1.2rem;
}

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  font-weight: 600;
  color: #2d3436;
  font-size: 0.85rem;
  margin-bottom: 2px;
}

.suggestion-description {
  color: #636e72;
  font-size: 0.75rem;
}

.suggestion-confidence {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.confidence-bar {
  width: 30px;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, #fdcb6e, #00b894);
  transition: width 0.3s ease;
}

.confidence-text {
  font-size: 0.7rem;
  color: #636e72;
  font-weight: bold;
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #636e72;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.5;
}

.notification-item {
  position: relative;
  border-bottom: 1px solid #f1f2f6;
  transition: all 0.3s ease;
  cursor: pointer;
}

.notification-item:hover {
  background: #f8f9fa;
}

.notification-item.unread {
  background: #f8f9ff;
  border-left: 4px solid #74b9ff;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px 20px;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.notification-item.performance .notification-icon {
  background: linear-gradient(135deg, #74b9ff, #0984e3);
  color: white;
}

.notification-item.alert .notification-icon {
  background: linear-gradient(135deg, #fdcb6e, #e17055);
  color: white;
}

.notification-item.opportunity .notification-icon {
  background: linear-gradient(135deg, #00b894, #00a085);
  color: white;
}

.notification-item.automation .notification-icon {
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  color: white;
}

.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  color: #2d3436;
  margin-bottom: 5px;
  font-size: 0.9rem;
}

.notification-message {
  color: #636e72;
  font-size: 0.8rem;
  line-height: 1.4;
  margin-bottom: 8px;
}

.notification-metrics {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.metric-chip {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.opportunity-value, .automation-savings {
  color: #00b894;
  font-size: 0.8rem;
  margin-bottom: 8px;
}

.notification-time {
  color: #95a5a6;
  font-size: 0.7rem;
}

.notification-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: #74b9ff;
  color: white;
}

.action-btn.primary:hover {
  background: #0984e3;
}

.action-btn.danger {
  background: #e74c3c;
  color: white;
}

.action-btn.danger:hover {
  background: #c0392b;
}

.action-btn.success {
  background: #00b894;
  color: white;
}

.action-btn.success:hover {
  background: #00a085;
}

.action-btn.info {
  background: #6c5ce7;
  color: white;
}

.action-btn.info:hover {
  background: #5f3dc4;
}

.priority-indicator {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

.priority-indicator.high {
  background: #e74c3c;
}

.priority-indicator.medium {
  background: #f39c12;
}

.priority-indicator.low {
  background: #95a5a6;
}

.notification-footer {
  padding: 15px;
  text-align: center;
  border-top: 1px solid #f1f2f6;
}

.load-more-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  color: #636e72;
  transition: all 0.3s ease;
  margin: 0 auto;
}

.load-more-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}

.load-more-btn:disabled {
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
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.settings-modal {
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #2d3436;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #636e72;
}

.modal-content {
  padding: 20px;
}

.settings-section {
  margin-bottom: 25px;
}

.settings-section h4 {
  margin: 0 0 15px 0;
  color: #2d3436;
  font-size: 1rem;
}

.setting-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.setting-option:hover {
  background: #f8f9fa;
  border-color: #74b9ff;
}

.ai-level-slider {
  padding: 10px;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #dee2e6;
  outline: none;
  margin-bottom: 10px;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #74b9ff;
  cursor: pointer;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #636e72;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e9ecef;
}

.cancel-btn, .save-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #dee2e6;
  color: #636e72;
}

.cancel-btn:hover {
  background: #ced4da;
}

.save-btn {
  background: #74b9ff;
  color: white;
}

.save-btn:hover {
  background: #0984e3;
}

/* Message expansion styles */
.message-container {
  position: relative;
}

.notification-message {
  margin: 8px 0;
  color: #636e72;
  line-height: 1.4;
  transition: all 0.3s ease;
}

.notification-message.expanded {
  max-height: none;
}

.see-more-btn {
  background: none;
  border: none;
  color: #74b9ff;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 4px 0;
  margin-top: 4px;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.see-more-btn:hover {
  color: #0984e3;
}

/* Responsive */
@media (max-width: 768px) {
  .notification-panel {
    width: 350px;
    right: -50px;
  }
  
  .notification-filters {
    padding: 10px;
  }
  
  .filter-btn {
    padding: 6px 10px;
    font-size: 0.75rem;
  }
  
  .notification-content {
    padding: 12px 15px;
  }
  
  .settings-modal {
    width: 95%;
  }
}
</style>