<template>
  <div class="integrated-ai-dashboard">
    <!-- Header Principal -->
    <div class="main-header">
      <div class="header-content">
        <div class="brand-section">
          <div class="logo">
            <i class="fas fa-rocket"></i>
          </div>
          <div class="brand-info">
            <h1>Fusepoint AI Marketing</h1>
            <p>Plateforme Intelligence Marketing Avancée</p>
          </div>
        </div>
        
        <div class="ai-status">
          <div class="status-indicator active">
            <i class="fas fa-brain"></i>
            <span>IA Active</span>
          </div>
          <div class="performance-score">
            <div class="score-value">{{ aiPerformanceScore }}%</div>
            <div class="score-label">Performance IA</div>
          </div>
        </div>
      </div>
      
      <div class="quick-actions">
        <button @click="refreshAllData" class="action-btn primary" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          Actualiser Tout
        </button>
        <button @click="openAIChat" class="action-btn secondary">
          <i class="fas fa-comments"></i>
          Chat IA
        </button>
        <button @click="exportGlobalReport" class="action-btn tertiary">
          <i class="fas fa-download"></i>
          Rapport Global
        </button>
      </div>
    </div>

    <!-- Navigation Intelligente -->
    <div class="smart-navigation">
      <div class="nav-tabs">
        <button v-for="tab in navigationTabs" :key="tab.id" 
                @click="activeTab = tab.id"
                :class="['nav-tab', { active: activeTab === tab.id }]">
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
          <div v-if="tab.notifications" class="notification-badge">{{ tab.notifications }}</div>
        </button>
      </div>
      
      <div class="ai-suggestions">
        <div class="suggestion-item" v-for="suggestion in aiSuggestions.slice(0, 3)" :key="suggestion.id">
          <i class="fas fa-lightbulb"></i>
          <span>{{ suggestion.text }}</span>
          <button @click="applySuggestion(suggestion)" class="apply-btn">
            <i class="fas fa-check"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Tableau de Bord Unifié -->
    <div class="unified-dashboard">
      <!-- Vue d'ensemble -->
      <div v-if="activeTab === 'overview'" class="overview-section">
        <div class="metrics-grid">
          <div class="metric-card primary">
            <div class="metric-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ $formatCurrency(overviewMetrics.totalRevenue) }}</div>
              <div class="metric-label">Revenus Générés par l'IA</div>
              <div class="metric-change positive">+{{ overviewMetrics.revenueGrowth }}%</div>
            </div>
          </div>
          
          <div class="metric-card secondary">
            <div class="metric-icon">
              <i class="fas fa-robot"></i>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ overviewMetrics.activeAgents }}</div>
              <div class="metric-label">Agents IA Actifs</div>
              <div class="metric-change positive">+{{ overviewMetrics.agentsGrowth }}</div>
            </div>
          </div>
          
          <div class="metric-card tertiary">
            <div class="metric-icon">
              <i class="fas fa-magic"></i>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ overviewMetrics.automatedTasks }}</div>
              <div class="metric-label">Tâches Automatisées</div>
              <div class="metric-change positive">+{{ overviewMetrics.tasksGrowth }}%</div>
            </div>
          </div>
          
          <div class="metric-card quaternary">
            <div class="metric-icon">
              <i class="fas fa-crystal-ball"></i>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ overviewMetrics.predictionAccuracy }}%</div>
              <div class="metric-label">Précision Prédictive</div>
              <div class="metric-change positive">+{{ overviewMetrics.accuracyImprovement }}%</div>
            </div>
          </div>
        </div>
        
        <!-- Graphiques de Performance -->
        <div class="performance-charts">
          <div class="chart-container">
            <h3>Performance IA en Temps Réel</h3>
            <div class="chart-placeholder">
              <div class="chart-line" v-for="(point, index) in performanceData" :key="index" 
                   :style="{ height: point + '%', left: (index * 10) + '%' }"></div>
            </div>
          </div>
          
          <div class="insights-panel">
            <h3>Insights IA du Jour</h3>
            <div class="insights-list">
              <div v-for="insight in dailyInsights" :key="insight.id" class="insight-item">
                <div class="insight-icon" :class="insight.type">
                  <i :class="insight.icon"></i>
                </div>
                <div class="insight-content">
                  <div class="insight-title">{{ insight.title }}</div>
                  <div class="insight-description">{{ insight.description }}</div>
                  <div class="insight-impact">Impact: {{ insight.impact }}</div>
                </div>
                <button @click="viewInsightDetails(insight)" class="insight-action">
                  <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Actions Recommandées -->
        <div class="recommended-actions">
          <h3>Actions Recommandées par l'IA</h3>
          <div class="actions-grid">
            <div v-for="action in recommendedActions" :key="action.id" class="action-card">
              <div class="action-header">
                <div class="action-priority" :class="action.priority">{{ action.priority }}</div>
                <div class="action-type">{{ action.type }}</div>
              </div>
              <div class="action-content">
                <h4>{{ action.title }}</h4>
                <p>{{ action.description }}</p>
                <div class="action-metrics">
                  <span class="metric">ROI: +{{ action.expectedROI }}%</span>
                  <span class="metric">Effort: {{ action.effort }}</span>
                  <span class="metric">Délai: {{ action.timeline }}</span>
                </div>
              </div>
              <div class="action-buttons">
                <button @click="executeAction(action)" class="execute-btn">
                  <i class="fas fa-play"></i>
                  Exécuter
                </button>
                <button @click="scheduleAction(action)" class="schedule-btn">
                  <i class="fas fa-clock"></i>
                  Programmer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Agents IA -->
      <div v-if="activeTab === 'agents'" class="agents-section">
        <MarketingAgents />
      </div>
      
      <!-- Campagnes Automatisées -->
      <div v-if="activeTab === 'campaigns'" class="campaigns-section">
        <AutomatedCampaigns />
      </div>
      
      <!-- Assistant IA -->
      <div v-if="activeTab === 'assistant'" class="assistant-section">
        <MarketingAssistant />
      </div>
      
      <!-- Analyse Prédictive -->
      <div v-if="activeTab === 'predictive'" class="predictive-section">
        <PredictiveAnalyticsDashboard />
      </div>
      
      <!-- Personnalisation -->
      <div v-if="activeTab === 'personalization'" class="personalization-section">
        <PersonalizedDashboard />
      </div>
      
      <!-- Analytics Avancées -->
      <div v-if="activeTab === 'analytics'" class="analytics-section">
        <div class="analytics-header">
          <h2>Analytics IA Avancées</h2>
          <div class="analytics-controls">
            <select v-model="analyticsTimeframe" @change="loadAnalytics">
              <option value="24h">24 heures</option>
              <option value="7d">7 jours</option>
              <option value="30d">30 jours</option>
              <option value="90d">90 jours</option>
            </select>
          </div>
        </div>
        
        <div class="analytics-grid">
          <div class="analytics-card">
            <h3>Performance des Modèles IA</h3>
            <div class="models-performance">
              <div v-for="model in aiModelsPerformance" :key="model.name" class="model-item">
                <div class="model-info">
                  <span class="model-name">{{ model.name }}</span>
                  <span class="model-accuracy">{{ model.accuracy }}%</span>
                </div>
                <div class="model-bar">
                  <div class="bar-fill" :style="{ width: model.accuracy + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="analytics-card">
            <h3>ROI par Canal IA</h3>
            <div class="roi-channels">
              <div v-for="channel in roiByChannel" :key="channel.name" class="channel-roi">
                <div class="channel-name">{{ channel.name }}</div>
                <div class="channel-value">{{ channel.roi }}%</div>
                <div class="channel-trend" :class="channel.trend">
                  <i :class="channel.trend === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                </div>
              </div>
            </div>
          </div>
          
          <div class="analytics-card">
            <h3>Optimisations Automatiques</h3>
            <div class="optimizations-list">
              <div v-for="opt in recentOptimizations" :key="opt.id" class="optimization-item">
                <div class="opt-icon">
                  <i :class="opt.icon"></i>
                </div>
                <div class="opt-details">
                  <div class="opt-title">{{ opt.title }}</div>
                  <div class="opt-impact">{{ opt.impact }}</div>
                  <div class="opt-time">{{ formatTime(opt.timestamp) }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="analytics-card">
            <h3>Prédictions vs Réalité</h3>
            <div class="predictions-accuracy">
              <div class="accuracy-chart">
                <div class="chart-bars">
                  <div v-for="(data, index) in predictionAccuracy" :key="index" class="accuracy-bar">
                    <div class="predicted-bar" :style="{ height: data.predicted + '%' }"></div>
                    <div class="actual-bar" :style="{ height: data.actual + '%' }"></div>
                    <div class="bar-label">{{ data.label }}</div>
                  </div>
                </div>
                <div class="chart-legend">
                  <div class="legend-item">
                    <div class="legend-color predicted"></div>
                    <span>Prédit</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color actual"></div>
                    <span>Réel</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications IA -->
    <div class="ai-notifications" v-if="notifications.length > 0">
      <div v-for="notification in notifications" :key="notification.id" 
           :class="['notification', notification.type]">
        <div class="notification-icon">
          <i :class="notification.icon"></i>
        </div>
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
        </div>
        <button @click="dismissNotification(notification.id)" class="notification-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import MarketingAgents from './MarketingAgents.vue';
import AutomatedCampaigns from './AutomatedCampaigns.vue';
import MarketingAssistant from './MarketingAssistant.vue';
import PredictiveAnalyticsDashboard from './PredictiveAnalyticsDashboard.vue';
import PersonalizedDashboard from './PersonalizedDashboard.vue';
import aiPersonalizationService from '../services/aiPersonalizationService.js';
import marketingIntelligenceService from '../services/marketingIntelligenceService.js';
import predictiveAnalyticsService from '../services/predictiveAnalyticsService.js';

export default {
  name: 'IntegratedAIDashboard',
  components: {
    MarketingAgents,
    AutomatedCampaigns,
    MarketingAssistant,
    PredictiveAnalyticsDashboard,
    PersonalizedDashboard
  },
  data() {
    return {
      loading: false,
      activeTab: 'overview',
      analyticsTimeframe: '7d',
      aiPerformanceScore: 94,
      navigationTabs: [
        { id: 'overview', label: 'Vue d\'ensemble', icon: 'fas fa-tachometer-alt', notifications: 0 },
        { id: 'agents', label: 'Agents IA', icon: 'fas fa-robot', notifications: 3 },
        { id: 'campaigns', label: 'Campagnes', icon: 'fas fa-magic', notifications: 1 },
        { id: 'assistant', label: 'Assistant', icon: 'fas fa-brain', notifications: 0 },
        { id: 'predictive', label: 'Prédictif', icon: 'fas fa-crystal-ball', notifications: 2 },
        { id: 'personalization', label: 'Personnalisation', icon: 'fas fa-user-cog', notifications: 0 },
        { id: 'analytics', label: 'Analytics', icon: 'fas fa-chart-bar', notifications: 0 }
      ],
      overviewMetrics: {
        totalRevenue: 125000,
        revenueGrowth: 23,
        activeAgents: 12,
        agentsGrowth: 4,
        automatedTasks: 1847,
        tasksGrowth: 31,
        predictionAccuracy: 94,
        accuracyImprovement: 7
      },
      performanceData: [65, 72, 68, 75, 82, 78, 85, 88, 92, 89],
      dailyInsights: [],
      recommendedActions: [],
      aiSuggestions: [],
      aiModelsPerformance: [],
      roiByChannel: [],
      recentOptimizations: [],
      predictionAccuracy: [],
      notifications: []
    };
  },
  async mounted() {
    await this.initializeDashboard();
    this.startRealTimeUpdates();
  },
  beforeUnmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  },
  methods: {
    async initializeDashboard() {
      this.loading = true;
      try {
        await Promise.all([
          this.loadOverviewData(),
          this.loadAISuggestions(),
          this.loadDailyInsights(),
          this.loadRecommendedActions(),
          this.loadAnalytics()
        ]);
        
        // Tracker l'utilisation
        aiPersonalizationService.trackBehavior('dashboard_view', {
          tab: this.activeTab,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        this.showNotification('Erreur lors du chargement du tableau de bord', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    async loadOverviewData() {
      // Simuler le chargement des données d'aperçu
      this.dailyInsights = [
        {
          id: 1,
          type: 'opportunity',
          icon: 'fas fa-bullseye',
          title: 'Opportunité de Conversion',
          description: 'Augmentation de 15% du trafic mobile détectée',
          impact: 'Élevé'
        },
        {
          id: 2,
          type: 'warning',
          icon: 'fas fa-exclamation-triangle',
          title: 'Baisse de Performance',
          description: 'Campagne Facebook sous-performante',
          impact: 'Moyen'
        },
        {
          id: 3,
          type: 'success',
          icon: 'fas fa-check-circle',
          title: 'Optimisation Réussie',
          description: 'ROI email marketing +23%',
          impact: 'Élevé'
        }
      ];
    },
    
    async loadAISuggestions() {
      this.aiSuggestions = [
        {
          id: 1,
          text: 'Optimiser les enchères Google Ads pour +12% ROI',
          action: 'optimize_google_ads',
          priority: 'high'
        },
        {
          id: 2,
          text: 'Lancer campagne de ré-engagement email',
          action: 'launch_reengagement',
          priority: 'medium'
        },
        {
          id: 3,
          text: 'Ajuster targeting Facebook pour audience mobile',
          action: 'adjust_facebook_targeting',
          priority: 'high'
        }
      ];
    },
    
    async loadDailyInsights() {
      // Les insights sont déjà chargés dans loadOverviewData
    },
    
    async loadRecommendedActions() {
      this.recommendedActions = [
        {
          id: 1,
          priority: 'high',
          type: 'Optimisation',
          title: 'Optimiser les Landing Pages',
          description: 'L\'IA a détecté des opportunités d\'amélioration du taux de conversion sur 3 pages clés.',
          expectedROI: 25,
          effort: 'Moyen',
          timeline: '2 semaines'
        },
        {
          id: 2,
          priority: 'medium',
          type: 'Automation',
          title: 'Automatiser le Lead Scoring',
          description: 'Mise en place d\'un système de scoring automatique basé sur l\'IA pour qualifier les prospects.',
          expectedROI: 18,
          effort: 'Élevé',
          timeline: '1 mois'
        },
        {
          id: 3,
          priority: 'low',
          type: 'Analyse',
          title: 'Analyser les Tendances Saisonnières',
          description: 'Étude approfondie des patterns saisonniers pour optimiser la planification des campagnes.',
          expectedROI: 12,
          effort: 'Faible',
          timeline: '1 semaine'
        }
      ];
    },
    
    async loadAnalytics() {
      this.aiModelsPerformance = [
        { name: 'Prédiction Trafic', accuracy: 94 },
        { name: 'Scoring Leads', accuracy: 87 },
        { name: 'Optimisation Enchères', accuracy: 91 },
        { name: 'Segmentation Client', accuracy: 89 },
        { name: 'Prédiction Churn', accuracy: 85 }
      ];
      
      this.roiByChannel = [
        { name: 'Google Ads', roi: 245, trend: 'up' },
        { name: 'Facebook', roi: 189, trend: 'up' },
        { name: 'Email', roi: 312, trend: 'up' },
        { name: 'LinkedIn', roi: 156, trend: 'down' },
        { name: 'SEO', roi: 278, trend: 'up' }
      ];
      
      this.recentOptimizations = [
        {
          id: 1,
          icon: 'fas fa-chart-line',
          title: 'Enchères Google Ads optimisées',
          impact: '+12% ROI',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: 2,
          icon: 'fas fa-envelope',
          title: 'Segmentation email affinée',
          impact: '+8% ouvertures',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
        },
        {
          id: 3,
          icon: 'fas fa-bullseye',
          title: 'Targeting Facebook ajusté',
          impact: '+15% CTR',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
        }
      ];
      
      this.predictionAccuracy = [
        { label: 'Sem 1', predicted: 85, actual: 82 },
        { label: 'Sem 2', predicted: 78, actual: 81 },
        { label: 'Sem 3', predicted: 92, actual: 89 },
        { label: 'Sem 4', predicted: 88, actual: 91 }
      ];
    },
    
    startRealTimeUpdates() {
      this.updateInterval = setInterval(() => {
        this.updateRealTimeMetrics();
      }, 30000); // Mise à jour toutes les 30 secondes
    },
    
    updateRealTimeMetrics() {
      // Simuler des mises à jour en temps réel
      this.aiPerformanceScore = Math.min(100, this.aiPerformanceScore + Math.random() * 2 - 1);
      
      // Ajouter de nouvelles données de performance
      this.performanceData.shift();
      this.performanceData.push(Math.floor(Math.random() * 30) + 70);
    },
    
    async refreshAllData() {
      await this.initializeDashboard();
      this.showNotification('Données actualisées avec succès', 'success');
    },
    
    openAIChat() {
      // Ouvrir le chat IA (déjà intégré dans App.vue)
      this.$emit('open-chat');
    },
    
    exportGlobalReport() {
      const reportData = {
        overview: this.overviewMetrics,
        insights: this.dailyInsights,
        recommendations: this.recommendedActions,
        analytics: {
          models: this.aiModelsPerformance,
          roi: this.roiByChannel,
          optimizations: this.recentOptimizations
        },
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      // Utiliser data: URL pour respecter la CSP
      (async () => {
        try {
          const { blobToDataURL } = await import('@/utils/blob')
          const url = await blobToDataURL(blob)
          const a = document.createElement('a');
          a.href = url;
          a.download = `fusepoint-ai-report-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
        } catch (_) {
          // Fallback silencieux
        }
      })()
    },
    
    applySuggestion(suggestion) {
      this.showNotification(`Application de la suggestion: ${suggestion.text}`, 'info');
      // Implémenter l'application de la suggestion
    },
    
    viewInsightDetails(insight) {
      this.showNotification(`Détails de l'insight: ${insight.title}`, 'info');
      // Implémenter l'affichage des détails
    },
    
    executeAction(action) {
      this.showNotification(`Exécution de l'action: ${action.title}`, 'success');
      // Implémenter l'exécution de l'action
    },
    
    scheduleAction(action) {
      this.showNotification(`Action programmée: ${action.title}`, 'info');
      // Implémenter la programmation de l'action
    },
    
    dismissNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id);
    },
    
    showNotification(message, type = 'info') {
      const notification = {
        id: Date.now(),
        title: type === 'error' ? 'Erreur' : type === 'success' ? 'Succès' : 'Information',
        message,
        type,
        icon: type === 'error' ? 'fas fa-exclamation-circle' : 
              type === 'success' ? 'fas fa-check-circle' : 'fas fa-info-circle'
      };
      
      this.notifications.push(notification);
      
      // Auto-dismiss après 5 secondes
      setTimeout(() => {
        this.dismissNotification(notification.id);
      }, 5000);
    },
    
    formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toLocaleString();
    },
    
    formatTime(timestamp) {
      const now = new Date();
      const time = new Date(timestamp);
      const diff = now - time;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      
      if (hours < 1) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `Il y a ${minutes} min`;
      } else if (hours < 24) {
        return `Il y a ${hours}h`;
      } else {
        const days = Math.floor(hours / 24);
        return `Il y a ${days}j`;
      }
    }
  }
};
</script>

<style scoped>
.integrated-ai-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 0;
}

/* Header Principal */
.main-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 30px;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo {
  width: 60px;
  height: 60px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}

.brand-info h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.brand-info p {
  margin: 5px 0 0 0;
  opacity: 0.9;
  font-size: 1rem;
}

.ai-status {
  display: flex;
  align-items: center;
  gap: 25px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background: rgba(255,255,255,0.2);
  border-radius: 25px;
  font-weight: 600;
}

.status-indicator.active {
  background: rgba(0,184,148,0.3);
}

.performance-score {
  text-align: center;
}

.score-value {
  font-size: 2rem;
  font-weight: bold;
  display: block;
}

.score-label {
  font-size: 0.8rem;
  opacity: 0.9;
}

.quick-actions {
  display: flex;
  gap: 15px;
}

.action-btn {
  padding: 12px 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.action-btn.primary {
  background: rgba(255,255,255,0.2);
  color: white;
}

.action-btn.secondary {
  background: rgba(0,184,148,0.2);
  color: white;
}

.action-btn.tertiary {
  background: rgba(116,185,255,0.2);
  color: white;
}

.action-btn:hover {
  background: rgba(255,255,255,0.3);
  border-color: rgba(255,255,255,0.5);
  transform: translateY(-2px);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Navigation Intelligente */
.smart-navigation {
  background: white;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border-bottom: 1px solid #e9ecef;
}

.nav-tabs {
  display: flex;
  gap: 5px;
}

.nav-tab {
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: #636e72;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  position: relative;
}

.nav-tab:hover {
  background: #f8f9fa;
  color: #2d3436;
}

.nav-tab.active {
  background: linear-gradient(135deg, #74b9ff, #0984e3);
  color: white;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e17055;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
}

.ai-suggestions {
  display: flex;
  gap: 15px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #856404;
}

.apply-btn {
  background: #00b894;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.7rem;
}

/* Tableau de Bord Unifié */
.unified-dashboard {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Vue d'ensemble */
.overview-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 25px;
}

.metric-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-5px);
}

.metric-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.metric-card.primary .metric-icon {
  background: linear-gradient(135deg, #74b9ff, #0984e3);
}

.metric-card.secondary .metric-icon {
  background: linear-gradient(135deg, #fd79a8, #e84393);
}

.metric-card.tertiary .metric-icon {
  background: linear-gradient(135deg, #fdcb6e, #e17055);
}

.metric-card.quaternary .metric-icon {
  background: linear-gradient(135deg, #a29bfe, #6c5ce7);
}

.metric-content {
  flex: 1;
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

.metric-change {
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.metric-change.positive {
  color: #00b894;
}

.metric-change.negative {
  color: #e17055;
}

/* Graphiques de Performance */
.performance-charts {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
}

.chart-container, .insights-panel {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.chart-container h3, .insights-panel h3 {
  margin: 0 0 20px 0;
  color: #2d3436;
}

.chart-placeholder {
  height: 200px;
  background: #f8f9fa;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.chart-line {
  position: absolute;
  bottom: 0;
  width: 8px;
  background: linear-gradient(to top, #74b9ff, #0984e3);
  border-radius: 4px 4px 0 0;
  transition: height 0.5s ease;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: background 0.3s ease;
}

.insight-item:hover {
  background: #e9ecef;
}

.insight-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
}

.insight-icon.opportunity {
  background: #00b894;
}

.insight-icon.warning {
  background: #fdcb6e;
}

.insight-icon.success {
  background: #74b9ff;
}

.insight-content {
  flex: 1;
}

.insight-title {
  font-weight: 600;
  color: #2d3436;
  margin-bottom: 5px;
}

.insight-description {
  color: #636e72;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.insight-impact {
  font-size: 0.8rem;
  color: #74b9ff;
  font-weight: 600;
}

.insight-action {
  background: #74b9ff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Actions Recommandées */
.recommended-actions {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.recommended-actions h3 {
  margin: 0 0 25px 0;
  color: #2d3436;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.action-card {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.action-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.action-priority {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
}

.action-priority.high {
  background: #ffebee;
  color: #d32f2f;
}

.action-priority.medium {
  background: #fff3e0;
  color: #f57c00;
}

.action-priority.low {
  background: #e8f5e8;
  color: #2e7d32;
}

.action-type {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.action-content {
  padding: 20px;
}

.action-content h4 {
  margin: 0 0 10px 0;
  color: #2d3436;
}

.action-content p {
  margin: 0 0 15px 0;
  color: #636e72;
  line-height: 1.5;
}

.action-metrics {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.action-metrics .metric {
  background: #f8f9fa;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  color: #636e72;
}

.action-buttons {
  display: flex;
  gap: 10px;
  padding: 15px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.execute-btn, .schedule-btn {
  flex: 1;
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
}

.execute-btn {
  background: #00b894;
  color: white;
}

.execute-btn:hover {
  background: #00a085;
}

.schedule-btn {
  background: #74b9ff;
  color: white;
}

.schedule-btn:hover {
  background: #0984e3;
}

/* Analytics Avancées */
.analytics-section {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.analytics-header h2 {
  margin: 0;
  color: #2d3436;
}

.analytics-controls select {
  padding: 10px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  color: #2d3436;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}

.analytics-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.analytics-card h3 {
  margin: 0 0 20px 0;
  color: #2d3436;
}

.models-performance {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.model-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.model-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.model-name {
  font-weight: 600;
  color: #2d3436;
}

.model-accuracy {
  color: #00b894;
  font-weight: bold;
}

.model-bar {
  flex: 2;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #74b9ff, #0984e3);
  transition: width 0.8s ease;
}

.roi-channels {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.channel-roi {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.channel-name {
  font-weight: 600;
  color: #2d3436;
}

.channel-value {
  color: #00b894;
  font-weight: bold;
}

.channel-trend {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.channel-trend.up {
  background: #d1f2eb;
  color: #00b894;
}

.channel-trend.down {
  background: #ffebee;
  color: #e17055;
}

.optimizations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.optimization-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.opt-icon {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: #74b9ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.opt-details {
  flex: 1;
}

.opt-title {
  font-weight: 600;
  color: #2d3436;
  margin-bottom: 3px;
}

.opt-impact {
  color: #00b894;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 3px;
}

.opt-time {
  color: #636e72;
  font-size: 0.7rem;
}

.predictions-accuracy {
  height: 200px;
}

.accuracy-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-bars {
  flex: 1;
  display: flex;
  align-items: end;
  gap: 15px;
  padding: 20px 0;
}

.accuracy-bar {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: end;
  gap: 5px;
  position: relative;
}

.predicted-bar, .actual-bar {
  flex: 1;
  border-radius: 4px 4px 0 0;
  transition: height 0.5s ease;
}

.predicted-bar {
  background: #74b9ff;
}

.actual-bar {
  background: #00b894;
}

.bar-label {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  color: #636e72;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #636e72;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.predicted {
  background: #74b9ff;
}

.legend-color.actual {
  background: #00b894;
}

/* Notifications IA */
.ai-notifications {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
}

.notification {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
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
  border-left: 4px solid #00b894;
}

.notification.error {
  border-left: 4px solid #e17055;
}

.notification.info {
  border-left: 4px solid #74b9ff;
}

.notification-icon {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
}

.notification.success .notification-icon {
  background: #00b894;
}

.notification.error .notification-icon {
  background: #e17055;
}

.notification.info .notification-icon {
  background: #74b9ff;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  color: #2d3436;
  margin-bottom: 3px;
}

.notification-message {
  color: #636e72;
  font-size: 0.9rem;
}

.notification-close {
  background: none;
  border: none;
  color: #636e72;
  cursor: pointer;
  font-size: 1rem;
  padding: 5px;
}

.notification-close:hover {
  color: #2d3436;
}

/* Responsive */
@media (max-width: 1200px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .performance-charts {
    grid-template-columns: 1fr;
  }
  
  .analytics-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .header-content {
    flex-direction: column;
    gap: 15px;
  }
  
  .smart-navigation {
    flex-direction: column;
    gap: 15px;
  }
  
  .nav-tabs {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .ai-suggestions {
    flex-direction: column;
    width: 100%;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .unified-dashboard {
    padding: 15px;
  }
  
  .ai-notifications {
    left: 10px;
    right: 10px;
    max-width: none;
  }
}
</style>