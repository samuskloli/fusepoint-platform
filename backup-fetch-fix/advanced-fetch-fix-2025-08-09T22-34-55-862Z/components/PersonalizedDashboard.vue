<template>
  <div class="personalized-dashboard">
    <!-- Header avec salutation personnalisée -->
    <div class="dashboard-header">
      <div class="welcome-section">
        <h1 class="welcome-title">
          <span class="greeting">{{ getGreeting() }}</span>
          <span class="user-name">{{ userProfile.name || 'Utilisateur' }}</span>
          <span class="wave">👋</span>
        </h1>
        <p class="welcome-subtitle">{{ getPersonalizedSubtitle() }}</p>
      </div>
      
      <div class="dashboard-actions">
        <button @click="refreshDashboard" class="refresh-btn" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          Actualiser
        </button>
        <button @click="customizeDashboard" class="customize-btn">
          <i class="fas fa-cog"></i>
          Personnaliser
        </button>
      </div>
    </div>

    <!-- Alertes personnalisées -->
    <div v-if="alerts.length > 0" class="alerts-section">
      <div v-for="alert in alerts" :key="alert.id" 
           :class="['alert', `alert-${alert.level}`]">
        <div class="alert-content">
          <div class="alert-icon">
            <i :class="getAlertIcon(alert.type)"></i>
          </div>
          <div class="alert-text">
            <h4>{{ alert.title }}</h4>
            <p>{{ alert.message }}</p>
          </div>
          <button v-if="alert.action" @click="executeAction(alert.action)" 
                  class="alert-action">
            Action
          </button>
        </div>
      </div>
    </div>

    <!-- Recommandations IA -->
    <div v-if="recommendations.length > 0" class="recommendations-section">
      <h2 class="section-title">
        <i class="fas fa-lightbulb"></i>
        Recommandations IA
      </h2>
      <div class="recommendations-grid">
        <div v-for="rec in recommendations" :key="rec.id" 
             :class="['recommendation-card', `priority-${rec.priority}`]">
          <div class="rec-icon">{{ rec.icon }}</div>
          <div class="rec-content">
            <h3>{{ rec.title }}</h3>
            <p>{{ rec.description }}</p>
          </div>
          <button @click="executeAction(rec.action)" class="rec-action">
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Widgets personnalisés -->
    <div class="widgets-container" :class="`layout-${dashboardLayout}`">
      <div v-for="widget in widgets" :key="widget.type" 
           :class="['widget', `widget-${widget.type}`, `size-${widget.size}`]">
        
        <!-- Widget Métriques Clés -->
        <div v-if="widget.type === 'key_metrics'" class="key-metrics-widget">
          <div class="widget-header">
            <h3><i class="fas fa-chart-line"></i> Métriques Clés</h3>
            <span class="widget-period">30 derniers jours</span>
          </div>
          <div class="metrics-grid">
            <div class="metric-item">
              <div class="metric-value">{{ formatNumber(widget.data?.sessions || 0) }}</div>
              <div class="metric-label">Sessions</div>
              <div class="metric-trend positive">+12.5%</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">{{ formatNumber(widget.data?.users || 0) }}</div>
              <div class="metric-label">Utilisateurs</div>
              <div class="metric-trend positive">+8.3%</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">{{ formatPercentage(widget.data?.bounceRate || 0) }}</div>
              <div class="metric-label">Taux de Rebond</div>
              <div class="metric-trend negative">-2.1%</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">{{ formatDuration(widget.data?.avgSessionDuration || 0) }}</div>
              <div class="metric-label">Durée Moyenne</div>
              <div class="metric-trend positive">+15.2%</div>
            </div>
          </div>
        </div>

        <!-- Widget ROI Tracker -->
        <div v-else-if="widget.type === 'roi_tracker'" class="roi-widget">
          <div class="widget-header">
            <h3><i class="fas fa-dollar-sign"></i> Suivi ROI</h3>
            <span class="roi-current">{{ widget.data?.currentROI || 0 }}%</span>
          </div>
          <div class="roi-content">
            <div class="roi-comparison">
              <span class="roi-previous">Précédent: {{ widget.data?.previousROI || 0 }}%</span>
              <span :class="['roi-change', widget.data?.trend]">
                <i :class="widget.data?.trend === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                {{ widget.data?.improvement || 0 }}%
              </span>
            </div>
            <div class="roi-channels">
              <div v-for="channel in widget.data?.topChannels || []" :key="channel.channel" 
                   class="channel-roi">
                <span class="channel-name">{{ channel.channel }}</span>
                <span class="channel-value">{{ channel.roi }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Widget Entonnoir de Conversion -->
        <div v-else-if="widget.type === 'conversion_funnel'" class="conversion-widget">
          <div class="widget-header">
            <h3><i class="fas fa-filter"></i> Entonnoir de Conversion</h3>
            <span class="conversion-rate">{{ widget.data?.overallRate || 0 }}%</span>
          </div>
          <div class="funnel-stages">
            <div v-for="stage in widget.data?.funnel || []" :key="stage.stage" 
                 class="funnel-stage">
              <div class="stage-bar" :style="{ width: stage.rate + '%' }"></div>
              <div class="stage-info">
                <span class="stage-name">{{ stage.stage }}</span>
                <span class="stage-count">{{ formatNumber(stage.count) }}</span>
                <span class="stage-rate">{{ stage.rate }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Widget Statut Automation -->
        <div v-else-if="widget.type === 'automation_status'" class="automation-widget">
          <div class="widget-header">
            <h3><i class="fas fa-robot"></i> Automatisation</h3>
          </div>
          <div class="automation-stats">
            <div class="auto-stat">
              <div class="stat-value">{{ widget.data?.activeWorkflows || 0 }}</div>
              <div class="stat-label">Workflows Actifs</div>
            </div>
            <div class="auto-stat">
              <div class="stat-value">{{ widget.data?.totalSaved || 0 }}h</div>
              <div class="stat-label">Temps Économisé</div>
            </div>
            <div class="auto-stat">
              <div class="stat-value">{{ widget.data?.efficiency || 0 }}%</div>
              <div class="stat-label">Efficacité</div>
            </div>
          </div>
        </div>

        <!-- Widget Insights IA -->
        <div v-else-if="widget.type === 'ai_insights'" class="insights-widget">
          <div class="widget-header">
            <h3><i class="fas fa-brain"></i> Insights IA</h3>
          </div>
          <div class="insights-list">
            <div v-for="(insight, index) in getTopInsights(widget.data)" :key="index" 
                 class="insight-item">
              <div class="insight-icon">🔍</div>
              <div class="insight-text">{{ insight }}</div>
            </div>
          </div>
        </div>

        <!-- Widget Tendances Performance -->
        <div v-else-if="widget.type === 'performance_trends'" class="trends-widget">
          <div class="widget-header">
            <h3><i class="fas fa-trending-up"></i> Tendances</h3>
          </div>
          <div class="trends-grid">
            <div v-for="(trend, key) in widget.data || {}" :key="key" class="trend-item">
              <div class="trend-label">{{ getTrendLabel(key) }}</div>
              <div :class="['trend-value', trend.direction]">
                <i :class="trend.direction === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                {{ Math.abs(trend.value) }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions Rapides Personnalisées -->
    <div class="quick-actions-section">
      <h2 class="section-title">
        <i class="fas fa-bolt"></i>
        Actions Rapides
      </h2>
      <div class="quick-actions-grid">
        <button v-for="action in quickActions" :key="action.id" 
                @click="executeAction(action.id)" 
                class="quick-action-btn">
          <div class="action-icon">{{ action.icon }}</div>
          <div class="action-label">{{ action.label }}</div>
        </button>
      </div>
    </div>

    <!-- Modal de Personnalisation -->
    <div v-if="showCustomizeModal" class="modal-overlay" @click="closeCustomizeModal">
      <div class="customize-modal" @click.stop>
        <div class="modal-header">
          <h3>Personnaliser le Tableau de Bord</h3>
          <button @click="closeCustomizeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-content">
          <div class="customize-section">
            <h4>Disposition</h4>
            <div class="layout-options">
              <label v-for="layout in layoutOptions" :key="layout.value" class="layout-option">
                <input type="radio" :value="layout.value" v-model="selectedLayout">
                <span>{{ layout.label }}</span>
              </label>
            </div>
          </div>
          
          <div class="customize-section">
            <h4>Objectifs</h4>
            <div class="goals-options">
              <label v-for="goal in goalOptions" :key="goal.value" class="goal-option">
                <input type="checkbox" :value="goal.value" v-model="selectedGoals">
                <span>{{ goal.label }}</span>
              </label>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeCustomizeModal" class="cancel-btn">Annuler</button>
          <button @click="saveCustomization" class="save-btn">Sauvegarder</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import aiPersonalizationService from '../services/aiPersonalizationService.js';
import marketingIntelligenceService from '../services/marketingIntelligenceService.js';

export default {
  name: 'PersonalizedDashboard',
  data() {
    return {
      loading: false,
      userProfile: {},
      preferences: {},
      dashboardData: null,
      alerts: [],
      recommendations: [],
      widgets: [],
      quickActions: [],
      dashboardLayout: 'balanced',
      showCustomizeModal: false,
      selectedLayout: 'balanced',
      selectedGoals: [],
      layoutOptions: [
        { value: 'balanced', label: 'Équilibré' },
        { value: 'analytics_focused', label: 'Axé Analytics' },
        { value: 'automation_focused', label: 'Axé Automatisation' },
        { value: 'reporting_focused', label: 'Axé Rapports' }
      ],
      goalOptions: [
        { value: 'increase_roi', label: 'Augmenter le ROI' },
        { value: 'improve_conversion', label: 'Améliorer les Conversions' },
        { value: 'automate_workflows', label: 'Automatiser les Workflows' },
        { value: 'optimize_budget', label: 'Optimiser le Budget' },
        { value: 'enhance_engagement', label: 'Améliorer l\'Engagement' }
      ]
    };
  },
  async mounted() {
    await this.initializeDashboard();
    this.trackPageView();
  },
  methods: {
    async initializeDashboard() {
      this.loading = true;
      try {
        // Charger le profil utilisateur et les préférences
        this.userProfile = aiPersonalizationService.getUserProfile();
        this.preferences = aiPersonalizationService.getPreferences();
        
        // Générer le tableau de bord personnalisé
        this.dashboardData = await aiPersonalizationService.generatePersonalizedDashboard();
        
        // Extraire les données
        this.alerts = this.dashboardData.alerts || [];
        this.recommendations = this.dashboardData.recommendations || [];
        this.widgets = this.dashboardData.widgets || [];
        this.quickActions = this.dashboardData.quickActions || [];
        this.dashboardLayout = this.dashboardData.layout || 'balanced';
        
        // Initialiser les options de personnalisation
        this.selectedLayout = this.dashboardLayout;
        this.selectedGoals = this.userProfile.goals || [];
        
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du tableau de bord:', error);
        this.showErrorMessage('Erreur lors du chargement du tableau de bord');
      } finally {
        this.loading = false;
      }
    },
    
    async refreshDashboard() {
      await this.initializeDashboard();
      this.showSuccessMessage('Tableau de bord actualisé');
    },
    
    customizeDashboard() {
      this.showCustomizeModal = true;
    },
    
    closeCustomizeModal() {
      this.showCustomizeModal = false;
    },
    
    async saveCustomization() {
      try {
        // Mettre à jour le profil utilisateur
        await aiPersonalizationService.updateProfile({
          goals: this.selectedGoals,
          preferences: {
            ...this.userProfile.preferences,
            dashboardLayout: this.selectedLayout
          }
        });
        
        // Régénérer le tableau de bord
        await this.refreshDashboard();
        
        this.closeCustomizeModal();
        this.showSuccessMessage('Personnalisation sauvegardée');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        this.showErrorMessage('Erreur lors de la sauvegarde');
      }
    },
    
    executeAction(actionId) {
      // Tracker l'action
      aiPersonalizationService.trackBehavior('execute_action', { actionId });
      
      // Router vers l'action appropriée
      switch (actionId) {
        case 'create_campaign':
          this.$router.push('/marketing?view=automated');
          break;
        case 'view_reports':
          this.$router.push('/analytics');
          break;
        case 'manage_agents':
          this.$router.push('/marketing?view=agents');
          break;
        case 'connect_analytics':
          this.$router.push('/integrations');
          break;
        case 'optimize_budget':
          this.showOptimizationSuggestions();
          break;
        case 'create_automated_campaign':
          this.$router.push('/marketing?view=automated&action=create');
          break;
        default:
          console.log('Action non implémentée:', actionId);
      }
    },
    
    trackPageView() {
      aiPersonalizationService.trackBehavior('view_dashboard', {
        layout: this.dashboardLayout,
        widgetCount: this.widgets.length,
        hasAlerts: this.alerts.length > 0
      });
    },
    
    getGreeting() {
      const hour = new Date().getHours();
      if (hour < 12) return 'Bonjour';
      if (hour < 18) return 'Bon après-midi';
      return 'Bonsoir';
    },
    
    getPersonalizedSubtitle() {
      const goals = this.userProfile.goals || [];
      if (goals.includes('increase_roi')) {
        return 'Optimisons votre ROI aujourd\'hui !';
      } else if (goals.includes('automate_workflows')) {
        return 'Automatisons vos processus marketing !';
      } else if (goals.includes('improve_conversion')) {
        return 'Améliorons vos taux de conversion !';
      }
      return 'Votre tableau de bord marketing intelligent';
    },
    
    getAlertIcon(type) {
      const icons = {
        performance: 'fas fa-chart-line',
        automation: 'fas fa-robot',
        insight: 'fas fa-lightbulb',
        warning: 'fas fa-exclamation-triangle',
        success: 'fas fa-check-circle'
      };
      return icons[type] || 'fas fa-info-circle';
    },
    
    getTopInsights(data) {
      if (!data) return [];
      
      const allInsights = [
        ...(data.audienceInsights || []),
        ...(data.contentInsights || []),
        ...(data.trafficInsights || [])
      ];
      
      return allInsights.slice(0, 3);
    },
    
    getTrendLabel(key) {
      const labels = {
        traffic: 'Trafic',
        conversions: 'Conversions',
        revenue: 'Revenus',
        costs: 'Coûts'
      };
      return labels[key] || key;
    },
    
    formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    },
    
    formatPercentage(value) {
      return (value * 100).toFixed(1) + '%';
    },
    
    formatDuration(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    
    showOptimizationSuggestions() {
      // Afficher des suggestions d'optimisation
      alert('Suggestions d\'optimisation disponibles dans la section Agents IA');
    },
    
    showSuccessMessage(message) {
      // Implémentation simple avec alert, peut être remplacée par un système de notifications
      alert(message);
    },
    
    showErrorMessage(message) {
      alert('Erreur: ' + message);
    }
  }
};
</script>

<style scoped>
.personalized-dashboard {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
}

.welcome-title {
  font-size: 2.2rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.wave {
  animation: wave 2s infinite;
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(20deg); }
  75% { transform: rotate(-10deg); }
}

.welcome-subtitle {
  margin: 5px 0 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.dashboard-actions {
  display: flex;
  gap: 10px;
}

.refresh-btn, .customize-btn {
  padding: 10px 20px;
  border: 2px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.1);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover, .customize-btn:hover {
  background: rgba(255,255,255,0.2);
  border-color: rgba(255,255,255,0.5);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Alertes */
.alerts-section {
  margin-bottom: 30px;
}

.alert {
  margin-bottom: 10px;
  border-radius: 10px;
  overflow: hidden;
}

.alert-info {
  background: linear-gradient(135deg, #74b9ff, #0984e3);
}

.alert-success {
  background: linear-gradient(135deg, #00b894, #00a085);
}

.alert-warning {
  background: linear-gradient(135deg, #fdcb6e, #e17055);
}

.alert-content {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: white;
}

.alert-icon {
  font-size: 1.5rem;
  margin-right: 15px;
}

.alert-text {
  flex: 1;
}

.alert-text h4 {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
}

.alert-text p {
  margin: 0;
  opacity: 0.9;
}

.alert-action {
  padding: 8px 16px;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.alert-action:hover {
  background: rgba(255,255,255,0.3);
}

/* Recommandations */
.recommendations-section {
  margin-bottom: 30px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #2d3436;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.recommendation-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  border-left: 4px solid #74b9ff;
}

.recommendation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.priority-high {
  border-left-color: #e17055;
}

.priority-medium {
  border-left-color: #fdcb6e;
}

.rec-icon {
  font-size: 2rem;
  margin-right: 15px;
}

.rec-content {
  flex: 1;
}

.rec-content h3 {
  margin: 0 0 8px 0;
  color: #2d3436;
  font-size: 1.1rem;
}

.rec-content p {
  margin: 0;
  color: #636e72;
  font-size: 0.9rem;
}

.rec-action {
  padding: 8px 12px;
  background: #74b9ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.rec-action:hover {
  background: #0984e3;
}

/* Widgets */
.widgets-container {
  display: grid;
  gap: 20px;
  margin-bottom: 30px;
}

.layout-balanced {
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}

.layout-analytics_focused .widget-key_metrics,
.layout-analytics_focused .widget-performance_trends {
  grid-column: span 2;
}

.widget {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}

.widget:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
}

.size-large {
  grid-column: span 2;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f1f2f6;
}

.widget-header h3 {
  margin: 0;
  color: #2d3436;
  display: flex;
  align-items: center;
  gap: 10px;
}

.widget-period {
  color: #636e72;
  font-size: 0.9rem;
}

/* Métriques Clés */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.metric-item {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  color: #2d3436;
  margin-bottom: 5px;
}

.metric-label {
  color: #636e72;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.metric-trend {
  font-size: 0.8rem;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 12px;
}

.metric-trend.positive {
  background: #d1f2eb;
  color: #00b894;
}

.metric-trend.negative {
  background: #fadbd8;
  color: #e74c3c;
}

/* Widget ROI */
.roi-current {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00b894;
}

.roi-comparison {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.roi-change.up {
  color: #00b894;
}

.roi-change.down {
  color: #e74c3c;
}

.roi-channels {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.channel-roi {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f1f2f6;
  border-radius: 6px;
}

/* Widget Conversion */
.conversion-rate {
  font-size: 1.5rem;
  font-weight: bold;
  color: #74b9ff;
}

.funnel-stages {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.funnel-stage {
  position: relative;
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}

.stage-bar {
  height: 40px;
  background: linear-gradient(135deg, #74b9ff, #0984e3);
  transition: width 0.8s ease;
}

.stage-info {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  color: white;
  font-weight: bold;
}

/* Widget Automation */
.automation-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.auto-stat {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #6c5ce7;
  margin-bottom: 5px;
}

.stat-label {
  color: #636e72;
  font-size: 0.9rem;
}

/* Widget Insights */
.insights-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.insight-icon {
  font-size: 1.2rem;
}

.insight-text {
  flex: 1;
  color: #2d3436;
  line-height: 1.4;
}

/* Widget Tendances */
.trends-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.trend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.trend-label {
  color: #636e72;
  font-weight: 500;
}

.trend-value {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: bold;
}

.trend-value.up {
  color: #00b894;
}

.trend-value.down {
  color: #e74c3c;
}

/* Actions Rapides */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: white;
  border: 2px solid #ddd;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-action-btn:hover {
  border-color: #74b9ff;
  background: #f8f9ff;
  transform: translateY(-2px);
}

.action-icon {
  font-size: 2rem;
}

.action-label {
  font-weight: 500;
  color: #2d3436;
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
  z-index: 1000;
}

.customize-modal {
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
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

.customize-section {
  margin-bottom: 25px;
}

.customize-section h4 {
  margin: 0 0 15px 0;
  color: #2d3436;
}

.layout-options, .goals-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.layout-option, .goal-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.layout-option:hover, .goal-option:hover {
  background: #f8f9fa;
  border-color: #74b9ff;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
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
  background: #ddd;
  color: #636e72;
}

.cancel-btn:hover {
  background: #bbb;
}

.save-btn {
  background: #74b9ff;
  color: white;
}

.save-btn:hover {
  background: #0984e3;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .welcome-title {
    font-size: 1.8rem;
  }
  
  .widgets-container {
    grid-template-columns: 1fr;
  }
  
  .size-large {
    grid-column: span 1;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .trends-grid {
    grid-template-columns: 1fr;
  }
}
</style>