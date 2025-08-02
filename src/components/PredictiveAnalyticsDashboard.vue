<template>
  <div class="predictive-dashboard">
    <!-- Header avec contrôles -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1>
          <i class="fas fa-crystal-ball"></i>
          Analyse Prédictive IA
        </h1>
        <p class="header-subtitle">Anticipez les tendances et optimisez vos stratégies marketing</p>
      </div>
      
      <div class="header-controls">
        <select v-model="selectedTimeframe" @change="loadPredictions" class="timeframe-select">
          <option value="7d">7 jours</option>
          <option value="30d">30 jours</option>
          <option value="90d">90 jours</option>
          <option value="1y">1 an</option>
        </select>
        
        <button @click="refreshPredictions" class="refresh-btn" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          Actualiser
        </button>
        
        <button @click="exportReport" class="export-btn">
          <i class="fas fa-download"></i>
          Exporter
        </button>
      </div>
    </div>

    <!-- Indicateurs de confiance globale -->
    <div class="confidence-overview">
      <div class="confidence-card">
        <div class="confidence-header">
          <h3>Niveau de Confiance Global</h3>
          <div class="confidence-badge" :class="getConfidenceLevel(report?.confidence)">
            {{ Math.round((report?.confidence || 0) * 100) }}%
          </div>
        </div>
        <div class="confidence-bar">
          <div class="confidence-fill" :style="{ width: (report?.confidence || 0) * 100 + '%' }"></div>
        </div>
        <p class="confidence-description">{{ getConfidenceDescription(report?.confidence) }}</p>
      </div>
      
      <div class="models-status">
        <h4>État des Modèles IA</h4>
        <div class="models-grid">
          <div v-for="(model, key) in models" :key="key" class="model-status">
            <div class="model-icon">
              <i :class="getModelIcon(key)"></i>
            </div>
            <div class="model-info">
              <div class="model-name">{{ model.name }}</div>
              <div class="model-accuracy">{{ Math.round(model.accuracy * 100) }}% précision</div>
            </div>
            <div class="model-indicator active"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Résumé exécutif -->
    <div v-if="report?.summary" class="executive-summary">
      <h2>
        <i class="fas fa-chart-line"></i>
        Résumé Exécutif
      </h2>
      
      <div class="summary-grid">
        <div class="summary-insights">
          <h3>Insights Clés</h3>
          <ul class="insights-list">
            <li v-for="insight in report.summary.keyInsights" :key="insight" class="insight-item">
              <i class="fas fa-lightbulb"></i>
              {{ insight }}
            </li>
          </ul>
        </div>
        
        <div class="summary-outlook">
          <h3>Perspectives</h3>
          <div class="outlook-indicator" :class="report.summary.overallOutlook">
            <i :class="getOutlookIcon(report.summary.overallOutlook)"></i>
            <span>{{ getOutlookLabel(report.summary.overallOutlook) }}</span>
          </div>
          <div class="confidence-level">
            Niveau de confiance: <strong>{{ report.summary.confidenceLevel }}</strong>
          </div>
        </div>
        
        <div class="priority-actions">
          <h3>Actions Prioritaires</h3>
          <div class="actions-list">
            <div v-for="(action, index) in report.summary.priorityActions" :key="index" 
                 class="action-item">
              <div class="action-priority">{{ index + 1 }}</div>
              <div class="action-text">{{ action }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Prédictions détaillées -->
    <div class="predictions-section">
      <h2>
        <i class="fas fa-chart-area"></i>
        Prédictions Détaillées
      </h2>
      
      <div class="predictions-tabs">
        <button v-for="tab in predictionTabs" :key="tab.id" 
                @click="activePredictionTab = tab.id"
                :class="['tab-btn', { active: activePredictionTab === tab.id }]">
          <i :class="tab.icon"></i>
          {{ tab.label }}
        </button>
      </div>
      
      <div class="predictions-content">
        <!-- Prédictions de Trafic -->
        <div v-if="activePredictionTab === 'traffic'" class="prediction-panel">
          <div class="prediction-header">
            <h3>Prédictions de Trafic</h3>
            <div class="prediction-confidence">
              Confiance: {{ Math.round((report?.predictions?.traffic?.confidence || 0) * 100) }}%
            </div>
          </div>
          
          <div class="traffic-predictions">
            <div class="traffic-overview">
              <div class="metric-card">
                <div class="metric-value">+{{ report?.predictions?.traffic?.overall?.expectedGrowth || 0 }}%</div>
                <div class="metric-label">Croissance Prévue</div>
                <div class="metric-trend up">
                  <i class="fas fa-arrow-up"></i>
                  {{ report?.predictions?.traffic?.overall?.trend || 'upward' }}
                </div>
              </div>
              
              <div class="metric-card">
                <div class="metric-value">{{ report?.predictions?.traffic?.overall?.volatility || 'low' }}</div>
                <div class="metric-label">Volatilité</div>
                <div class="metric-indicator low"></div>
              </div>
              
              <div class="metric-card">
                <div class="metric-value">{{ report?.predictions?.traffic?.overall?.seasonalImpact || 'moderate' }}</div>
                <div class="metric-label">Impact Saisonnier</div>
                <div class="metric-indicator moderate"></div>
              </div>
            </div>
            
            <div class="traffic-scenarios">
              <h4>Scénarios de Croissance</h4>
              <div class="scenarios-grid">
                <div v-for="(scenario, key) in report?.predictions?.traffic?.scenarios || {}" 
                     :key="key" class="scenario-card">
                  <div class="scenario-header">
                    <span class="scenario-name">{{ getScenarioLabel(key) }}</span>
                    <span class="scenario-probability">{{ Math.round(scenario.probability * 100) }}%</span>
                  </div>
                  <div class="scenario-growth">+{{ scenario.growth }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Prédictions de Conversion -->
        <div v-if="activePredictionTab === 'conversions'" class="prediction-panel">
          <div class="prediction-header">
            <h3>Prédictions de Conversion</h3>
            <div class="prediction-confidence">
              Confiance: {{ Math.round((report?.predictions?.conversions?.confidence || 0) * 100) }}%
            </div>
          </div>
          
          <div class="conversion-predictions">
            <div class="conversion-overview">
              <div class="conversion-comparison">
                <div class="current-rate">
                  <span class="rate-value">{{ report?.predictions?.conversions?.overall?.currentRate || 0 }}%</span>
                  <span class="rate-label">Taux Actuel</span>
                </div>
                <div class="arrow-indicator">
                  <i class="fas fa-arrow-right"></i>
                </div>
                <div class="predicted-rate">
                  <span class="rate-value">{{ report?.predictions?.conversions?.overall?.predictedRate || 0 }}%</span>
                  <span class="rate-label">Taux Prévu</span>
                </div>
                <div class="improvement-badge">
                  +{{ report?.predictions?.conversions?.overall?.improvement || 0 }}%
                </div>
              </div>
            </div>
            
            <div class="channel-conversions">
              <h4>Prédictions par Canal</h4>
              <div class="channels-list">
                <div v-for="channel in report?.predictions?.conversions?.byChannel || []" 
                     :key="channel.channel" class="channel-item">
                  <div class="channel-name">{{ channel.channel }}</div>
                  <div class="channel-rates">
                    <span class="current">{{ channel.current }}%</span>
                    <i class="fas fa-arrow-right"></i>
                    <span class="predicted">{{ channel.predicted }}%</span>
                  </div>
                  <div class="channel-improvement">+{{ channel.improvement }}%</div>
                </div>
              </div>
            </div>
            
            <div class="optimization-opportunities">
              <h4>Opportunités d'Optimisation</h4>
              <div class="opportunities-list">
                <div v-for="opp in report?.predictions?.conversions?.optimizationOpportunities || []" 
                     :key="opp.area" class="opportunity-item">
                  <div class="opp-header">
                    <span class="opp-area">{{ opp.area }}</span>
                    <span class="opp-impact" :class="opp.impact">{{ opp.impact }}</span>
                  </div>
                  <div class="opp-details">
                    <span class="opp-improvement">+{{ opp.expectedImprovement }}%</span>
                    <span class="opp-effort">Effort: {{ opp.effort }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Prévisions de Revenus -->
        <div v-if="activePredictionTab === 'revenue'" class="prediction-panel">
          <div class="prediction-header">
            <h3>Prévisions de Revenus</h3>
            <div class="prediction-confidence">
              Confiance: {{ Math.round((report?.predictions?.revenue?.confidence || 0) * 100) }}%
            </div>
          </div>
          
          <div class="revenue-predictions">
            <div class="revenue-overview">
              <div class="revenue-total">
                <div class="total-amount">{{ $formatCurrency(report?.predictions?.revenue?.forecast?.total || 0) }}</div>
                <div class="total-label">Revenus Prévus</div>
                <div class="growth-indicator">
                  <i class="fas fa-arrow-up"></i>
                  +{{ report?.predictions?.revenue?.forecast?.growth || 0 }}%
                </div>
              </div>
            </div>
            
            <div class="revenue-breakdown">
              <h4>Répartition des Revenus</h4>
              <div class="breakdown-chart">
                <div v-for="(item, key) in report?.predictions?.revenue?.breakdown || {}" 
                     :key="key" class="breakdown-item">
                  <div class="breakdown-bar">
                    <div class="bar-fill" :style="{ width: item.percentage + '%' }"></div>
                  </div>
                  <div class="breakdown-info">
                    <span class="breakdown-label">{{ getBreakdownLabel(key) }}</span>
                    <span class="breakdown-amount">{{ $formatCurrency(item.amount) }}</span>
                    <span class="breakdown-percentage">{{ item.percentage }}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="revenue-drivers">
              <h4>Moteurs de Croissance</h4>
              <div class="drivers-list">
                <div v-for="driver in report?.predictions?.revenue?.drivers || []" 
                     :key="driver.driver" class="driver-item">
                  <div class="driver-name">{{ driver.driver }}</div>
                  <div class="driver-impact">{{ driver.impact }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Analyse de Churn -->
        <div v-if="activePredictionTab === 'churn'" class="prediction-panel">
          <div class="prediction-header">
            <h3>Analyse de Churn</h3>
            <div class="prediction-confidence">
              Confiance: {{ Math.round((report?.predictions?.churn?.confidence || 0) * 100) }}%
            </div>
          </div>
          
          <div class="churn-analysis">
            <div class="churn-overview">
              <div class="churn-rates">
                <div class="current-churn">
                  <span class="churn-value">{{ report?.predictions?.churn?.overview?.currentChurnRate || 0 }}%</span>
                  <span class="churn-label">Taux Actuel</span>
                </div>
                <div class="arrow-indicator">
                  <i class="fas fa-arrow-down"></i>
                </div>
                <div class="predicted-churn">
                  <span class="churn-value">{{ report?.predictions?.churn?.overview?.predictedChurnRate || 0 }}%</span>
                  <span class="churn-label">Taux Prévu</span>
                </div>
                <div class="improvement-badge positive">
                  -{{ report?.predictions?.churn?.overview?.improvement || 0 }}%
                </div>
              </div>
            </div>
            
            <div class="risk-segments">
              <h4>Segments de Risque</h4>
              <div class="segments-list">
                <div v-for="segment in report?.predictions?.churn?.riskSegments || []" 
                     :key="segment.segment" class="segment-item">
                  <div class="segment-header">
                    <span class="segment-name">{{ segment.segment }}</span>
                    <span class="segment-risk" :class="segment.segment.toLowerCase().replace(' ', '-')">
                      {{ segment.segment }}
                    </span>
                  </div>
                  <div class="segment-stats">
                    <div class="stat">
                      <span class="stat-value">{{ segment.customers }}</span>
                      <span class="stat-label">Clients</span>
                    </div>
                    <div class="stat">
                      <span class="stat-value">{{ segment.percentage }}%</span>
                      <span class="stat-label">Pourcentage</span>
                    </div>
                    <div class="stat">
                      <span class="stat-value">{{ $formatCurrency(segment.averageValue) }}</span>
                      <span class="stat-label">Valeur Moyenne</span>
                    </div>
                  </div>
                  <div class="segment-indicators">
                    <div class="indicators-list">
                      <span v-for="indicator in segment.indicators" :key="indicator" 
                            class="indicator-tag">{{ indicator }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="prevention-strategies">
              <h4>Stratégies de Prévention</h4>
              <div class="strategies-list">
                <div v-for="strategy in report?.predictions?.churn?.preventionStrategies || []" 
                     :key="strategy.strategy" class="strategy-item">
                  <div class="strategy-header">
                    <span class="strategy-name">{{ strategy.strategy }}</span>
                    <span class="strategy-target">{{ strategy.targetSegment }}</span>
                  </div>
                  <div class="strategy-metrics">
                    <div class="metric">
                      <span class="metric-value">-{{ strategy.expectedReduction }}%</span>
                      <span class="metric-label">Réduction Attendue</span>
                    </div>
                    <div class="metric">
                      <span class="metric-value">{{ strategy.cost }}</span>
                      <span class="metric-label">Coût</span>
                    </div>
                    <div class="metric">
                      <span class="metric-value">{{ strategy.timeline }}</span>
                      <span class="metric-label">Délai</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommandations stratégiques -->
    <div class="recommendations-section">
      <h2>
        <i class="fas fa-lightbulb"></i>
        Recommandations Stratégiques
      </h2>
      
      <div class="recommendations-grid">
        <div v-for="category in report?.recommendations || []" :key="category.category" 
             class="recommendation-category">
          <div class="category-header">
            <h3>{{ category.category }}</h3>
            <span class="priority-badge" :class="category.priority">{{ category.priority }}</span>
          </div>
          
          <div class="recommendations-list">
            <div v-for="rec in category.recommendations" :key="rec.action" 
                 class="recommendation-item">
              <div class="rec-header">
                <span class="rec-action">{{ rec.action }}</span>
                <span class="rec-timeline">{{ rec.timeline }}</span>
              </div>
              <div class="rec-metrics">
                <div class="rec-metric">
                  <span class="metric-label">Impact:</span>
                  <span class="metric-value" :class="rec.impact">{{ rec.impact }}</span>
                </div>
                <div class="rec-metric">
                  <span class="metric-label">Effort:</span>
                  <span class="metric-value" :class="rec.effort">{{ rec.effort }}</span>
                </div>
                <div class="rec-metric" v-if="rec.expectedROI">
                  <span class="metric-label">ROI:</span>
                  <span class="metric-value">{{ rec.expectedROI }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Facteurs de risque et opportunités -->
    <div class="risks-opportunities">
      <div class="risks-section">
        <h3>
          <i class="fas fa-exclamation-triangle"></i>
          Facteurs de Risque
        </h3>
        <div class="risks-list">
          <div v-for="risk in report?.riskFactors || []" :key="risk.risk" class="risk-item">
            <div class="risk-header">
              <span class="risk-name">{{ risk.risk }}</span>
              <span class="risk-probability">{{ Math.round(risk.probability * 100) }}%</span>
            </div>
            <div class="risk-impact" :class="risk.impact">Impact: {{ risk.impact }}</div>
            <div class="risk-mitigation">{{ risk.mitigation }}</div>
          </div>
        </div>
      </div>
      
      <div class="opportunities-section">
        <h3>
          <i class="fas fa-bullseye"></i>
          Opportunités
        </h3>
        <div class="opportunities-list">
          <div v-for="opp in report?.opportunities || []" :key="opp.opportunity" class="opportunity-item">
            <div class="opp-header">
              <span class="opp-name">{{ opp.opportunity }}</span>
              <span class="opp-potential" :class="opp.potential">{{ opp.potential }}</span>
            </div>
            <div class="opp-timeline">Délai: {{ opp.timeline }}</div>
            <div class="opp-return">{{ opp.expectedReturn }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import predictiveAnalyticsService from '../services/predictiveAnalyticsService.js';
import aiPersonalizationService from '../services/aiPersonalizationService.js';

export default {
  name: 'PredictiveAnalyticsDashboard',
  data() {
    return {
      loading: false,
      selectedTimeframe: '30d',
      activePredictionTab: 'traffic',
      report: null,
      models: {},
      predictionTabs: [
        { id: 'traffic', label: 'Trafic', icon: 'fas fa-chart-line' },
        { id: 'conversions', label: 'Conversions', icon: 'fas fa-percentage' },
        { id: 'revenue', label: 'Revenus', icon: 'fas fa-euro-sign' },
        { id: 'churn', label: 'Churn', icon: 'fas fa-user-times' }
      ]
    };
  },
  async mounted() {
    await this.loadPredictions();
    this.trackPageView();
  },
  methods: {
    async loadPredictions() {
      this.loading = true;
      try {
        this.report = await predictiveAnalyticsService.generatePredictiveReport(this.selectedTimeframe);
        this.models = predictiveAnalyticsService.models;
      } catch (error) {
        console.error('Erreur lors du chargement des prédictions:', error);
        this.showErrorMessage('Erreur lors du chargement des prédictions');
      } finally {
        this.loading = false;
      }
    },
    
    async refreshPredictions() {
      await this.loadPredictions();
      this.showSuccessMessage('Prédictions actualisées');
    },
    
    exportReport() {
      // Implémenter l'export du rapport
      const reportData = JSON.stringify(this.report, null, 2);
      const blob = new Blob([reportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `predictive-report-${this.selectedTimeframe}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    
    trackPageView() {
      aiPersonalizationService.trackBehavior('view_predictive_analytics', {
        timeframe: this.selectedTimeframe
      });
    },
    
    getConfidenceLevel(confidence) {
      if (confidence >= 0.9) return 'excellent';
      if (confidence >= 0.8) return 'good';
      if (confidence >= 0.7) return 'fair';
      return 'low';
    },
    
    getConfidenceDescription(confidence) {
      if (confidence >= 0.9) return 'Prédictions très fiables avec une forte précision';
      if (confidence >= 0.8) return 'Prédictions fiables avec une bonne précision';
      if (confidence >= 0.7) return 'Prédictions modérément fiables';
      return 'Prédictions à interpréter avec prudence';
    },
    
    getModelIcon(modelKey) {
      const icons = {
        trafficPrediction: 'fas fa-chart-line',
        conversionPrediction: 'fas fa-percentage',
        revenueForecasting: 'fas fa-euro-sign',
        churnPrediction: 'fas fa-user-times',
        campaignOptimization: 'fas fa-bullseye',
        marketTrends: 'fas fa-trending-up'
      };
      return icons[modelKey] || 'fas fa-brain';
    },
    
    getOutlookIcon(outlook) {
      const icons = {
        positive: 'fas fa-arrow-up',
        neutral: 'fas fa-minus',
        negative: 'fas fa-arrow-down'
      };
      return icons[outlook] || 'fas fa-question';
    },
    
    getOutlookLabel(outlook) {
      const labels = {
        positive: 'Positif',
        neutral: 'Neutre',
        negative: 'Négatif'
      };
      return labels[outlook] || 'Inconnu';
    },
    
    getScenarioLabel(scenario) {
      const labels = {
        optimistic: 'Optimiste',
        realistic: 'Réaliste',
        pessimistic: 'Pessimiste'
      };
      return labels[scenario] || scenario;
    },
    
    getBreakdownLabel(key) {
      const labels = {
        recurring: 'Récurrent',
        newCustomers: 'Nouveaux Clients',
        upsells: 'Montées en Gamme'
      };
      return labels[key] || key;
    },
    
    formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toLocaleString();
    },
    
    showSuccessMessage(message) {
      alert(message);
    },
    
    showErrorMessage(message) {
      alert('Erreur: ' + message);
    }
  }
};
</script>

<style scoped>
.predictive-dashboard {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  background: #f8f9fa;
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
}

.header-content h1 {
  margin: 0;
  font-size: 2.2rem;
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-subtitle {
  margin: 8px 0 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.header-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.timeframe-select {
  padding: 10px 15px;
  border: 2px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.1);
  color: white;
  border-radius: 8px;
  font-size: 0.9rem;
}

.timeframe-select option {
  background: #2d3436;
  color: white;
}

.refresh-btn, .export-btn {
  padding: 10px 20px;
  border: 2px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.1);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-btn:hover, .export-btn:hover {
  background: rgba(255,255,255,0.2);
  border-color: rgba(255,255,255,0.5);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Confidence Overview */
.confidence-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-bottom: 30px;
}

.confidence-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.confidence-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.confidence-header h3 {
  margin: 0;
  color: #2d3436;
}

.confidence-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1.1rem;
}

.confidence-badge.excellent {
  background: #d1f2eb;
  color: #00b894;
}

.confidence-badge.good {
  background: #e3f2fd;
  color: #1976d2;
}

.confidence-badge.fair {
  background: #fff3e0;
  color: #f57c00;
}

.confidence-badge.low {
  background: #ffebee;
  color: #d32f2f;
}

.confidence-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 15px;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, #fdcb6e, #00b894);
  transition: width 0.8s ease;
}

.confidence-description {
  margin: 0;
  color: #636e72;
  font-size: 0.9rem;
}

.models-status {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.models-status h4 {
  margin: 0 0 20px 0;
  color: #2d3436;
}

.models-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.model-status {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
}

.model-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #74b9ff, #0984e3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
}

.model-info {
  flex: 1;
}

.model-name {
  font-weight: 600;
  color: #2d3436;
  font-size: 0.9rem;
}

.model-accuracy {
  color: #636e72;
  font-size: 0.8rem;
}

.model-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.model-indicator.active {
  background: #00b894;
}

/* Executive Summary */
.executive-summary {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  margin-bottom: 30px;
}

.executive-summary h2 {
  margin: 0 0 25px 0;
  color: #2d3436;
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 30px;
}

.summary-insights h3,
.summary-outlook h3,
.priority-actions h3 {
  margin: 0 0 15px 0;
  color: #2d3436;
  font-size: 1.1rem;
}

.insights-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.insight-item i {
  color: #f39c12;
  margin-top: 2px;
}

.outlook-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  border-radius: 10px;
  font-weight: 600;
  margin-bottom: 15px;
}

.outlook-indicator.positive {
  background: #d1f2eb;
  color: #00b894;
}

.outlook-indicator.neutral {
  background: #e3f2fd;
  color: #1976d2;
}

.outlook-indicator.negative {
  background: #ffebee;
  color: #d32f2f;
}

.confidence-level {
  color: #636e72;
  font-size: 0.9rem;
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.action-priority {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #74b9ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
}

.action-text {
  flex: 1;
  color: #2d3436;
  font-size: 0.9rem;
}

/* Predictions Section */
.predictions-section {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  margin-bottom: 30px;
  overflow: hidden;
}

.predictions-section h2 {
  margin: 0;
  padding: 25px 30px;
  color: #2d3436;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #e9ecef;
}

.predictions-tabs {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.tab-btn {
  flex: 1;
  padding: 15px 20px;
  border: none;
  background: transparent;
  color: #636e72;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
}

.tab-btn:hover {
  background: #e9ecef;
  color: #2d3436;
}

.tab-btn.active {
  background: white;
  color: #74b9ff;
  border-bottom: 3px solid #74b9ff;
}

.predictions-content {
  padding: 30px;
}

.prediction-panel {
  min-height: 400px;
}

.prediction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f1f2f6;
}

.prediction-header h3 {
  margin: 0;
  color: #2d3436;
}

.prediction-confidence {
  background: #e3f2fd;
  color: #1976d2;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Traffic Predictions */
.traffic-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  text-align: center;
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  color: #2d3436;
  margin-bottom: 8px;
}

.metric-label {
  color: #636e72;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.metric-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 0.8rem;
  font-weight: 600;
}

.metric-trend.up {
  color: #00b894;
}

.metric-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin: 0 auto;
}

.metric-indicator.low {
  background: #00b894;
}

.metric-indicator.moderate {
  background: #f39c12;
}

.scenarios-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.scenario-card {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  text-align: center;
}

.scenario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 0.8rem;
  color: #636e72;
}

.scenario-growth {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00b894;
}

/* Conversion Predictions */
.conversion-overview {
  margin-bottom: 30px;
}

.conversion-comparison {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 25px;
  background: #f8f9fa;
  border-radius: 12px;
}

.current-rate, .predicted-rate {
  text-align: center;
}

.rate-value {
  display: block;
  font-size: 2.5rem;
  font-weight: bold;
  color: #2d3436;
}

.rate-label {
  color: #636e72;
  font-size: 0.9rem;
}

.arrow-indicator {
  font-size: 1.5rem;
  color: #74b9ff;
}

.improvement-badge {
  background: #d1f2eb;
  color: #00b894;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
}

.improvement-badge.positive {
  background: #d1f2eb;
  color: #00b894;
}

.channels-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.channel-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.channel-name {
  font-weight: 600;
  color: #2d3436;
}

.channel-rates {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #636e72;
}

.channel-rates .current {
  color: #636e72;
}

.channel-rates .predicted {
  color: #00b894;
  font-weight: bold;
}

.channel-improvement {
  background: #d1f2eb;
  color: #00b894;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.opportunities-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.opportunity-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.opp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.opp-area {
  font-weight: 600;
  color: #2d3436;
}

.opp-impact {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
}

.opp-impact.high {
  background: #ffebee;
  color: #d32f2f;
}

.opp-impact.medium {
  background: #fff3e0;
  color: #f57c00;
}

.opp-impact.low {
  background: #e8f5e8;
  color: #2e7d32;
}

.opp-details {
  display: flex;
  gap: 15px;
  color: #636e72;
  font-size: 0.8rem;
}

.opp-improvement {
  color: #00b894;
  font-weight: bold;
}

/* Revenue Predictions */
.revenue-overview {
  margin-bottom: 30px;
}

.revenue-total {
  text-align: center;
  padding: 30px;
  background: linear-gradient(135deg, #74b9ff, #0984e3);
  border-radius: 15px;
  color: white;
}

.total-amount {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 8px;
}

.total-label {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 10px;
}

.growth-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 1.2rem;
  font-weight: bold;
}

.breakdown-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.breakdown-bar {
  flex: 1;
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

.breakdown-info {
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 200px;
}

.breakdown-label {
  font-weight: 600;
  color: #2d3436;
}

.breakdown-amount {
  color: #00b894;
  font-weight: bold;
}

.breakdown-percentage {
  color: #636e72;
  font-size: 0.9rem;
}

.drivers-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.driver-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.driver-name {
  color: #2d3436;
  font-weight: 500;
}

.driver-impact {
  color: #00b894;
  font-weight: bold;
}

/* Churn Analysis */
.churn-overview {
  margin-bottom: 30px;
}

.churn-rates {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 25px;
  background: #f8f9fa;
  border-radius: 12px;
}

.current-churn, .predicted-churn {
  text-align: center;
}

.churn-value {
  display: block;
  font-size: 2.5rem;
  font-weight: bold;
  color: #2d3436;
}

.churn-label {
  color: #636e72;
  font-size: 0.9rem;
}

.segments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.segment-item {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.segment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.segment-name {
  font-weight: 600;
  color: #2d3436;
}

.segment-risk {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
}

.segment-risk.high-risk {
  background: #ffebee;
  color: #d32f2f;
}

.segment-risk.medium-risk {
  background: #fff3e0;
  color: #f57c00;
}

.segment-risk.low-risk {
  background: #e8f5e8;
  color: #2e7d32;
}

.segment-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 15px;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2d3436;
}

.stat-label {
  color: #636e72;
  font-size: 0.8rem;
}

.indicators-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.indicator-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.strategies-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.strategy-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.strategy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.strategy-name {
  font-weight: 600;
  color: #2d3436;
}

.strategy-target {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.strategy-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.metric {
  text-align: center;
}

.metric-value {
  display: block;
  font-weight: bold;
  color: #2d3436;
  margin-bottom: 4px;
}

.metric-label {
  color: #636e72;
  font-size: 0.8rem;
}

/* Recommendations */
.recommendations-section {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  margin-bottom: 30px;
}

.recommendations-section h2 {
  margin: 0 0 25px 0;
  color: #2d3436;
  display: flex;
  align-items: center;
  gap: 12px;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 25px;
}

.recommendation-category {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.category-header h3 {
  margin: 0;
  color: #2d3436;
}

.priority-badge {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.priority-badge.high {
  background: #ffebee;
  color: #d32f2f;
}

.priority-badge.medium {
  background: #fff3e0;
  color: #f57c00;
}

.priority-badge.low {
  background: #e8f5e8;
  color: #2e7d32;
}

.recommendations-list {
  padding: 20px;
}

.recommendation-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 15px;
}

.recommendation-item:last-child {
  margin-bottom: 0;
}

.rec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.rec-action {
  font-weight: 600;
  color: #2d3436;
}

.rec-timeline {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.rec-metrics {
  display: flex;
  gap: 15px;
}

.rec-metric {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
}

.rec-metric .metric-label {
  color: #636e72;
}

.rec-metric .metric-value {
  font-weight: bold;
}

.rec-metric .metric-value.high {
  color: #d32f2f;
}

.rec-metric .metric-value.medium {
  color: #f57c00;
}

.rec-metric .metric-value.low {
  color: #2e7d32;
}

/* Risks and Opportunities */
.risks-opportunities {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}

.risks-section, .opportunities-section {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.risks-section h3, .opportunities-section h3 {
  margin: 0 0 20px 0;
  color: #2d3436;
  display: flex;
  align-items: center;
  gap: 10px;
}

.risks-list, .opportunities-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.risk-item, .opportunity-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.risk-header, .opp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.risk-name, .opp-name {
  font-weight: 600;
  color: #2d3436;
}

.risk-probability {
  background: #ffebee;
  color: #d32f2f;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
}

.opp-potential {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
}

.opp-potential.high {
  background: #e8f5e8;
  color: #2e7d32;
}

.opp-potential.medium {
  background: #fff3e0;
  color: #f57c00;
}

.risk-impact {
  color: #636e72;
  font-size: 0.8rem;
  margin-bottom: 8px;
}

.risk-impact.high {
  color: #d32f2f;
  font-weight: 600;
}

.risk-impact.medium {
  color: #f57c00;
  font-weight: 600;
}

.risk-mitigation, .opp-timeline, .opp-return {
  color: #636e72;
  font-size: 0.8rem;
  line-height: 1.4;
}

.opp-return {
  color: #00b894;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .confidence-overview {
    grid-template-columns: 1fr;
  }
  
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
  
  .risks-opportunities {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .header-controls {
    flex-direction: column;
    width: 100%;
  }
  
  .predictions-tabs {
    flex-direction: column;
  }
  
  .traffic-overview {
    grid-template-columns: 1fr;
  }
  
  .scenarios-grid {
    grid-template-columns: 1fr;
  }
  
  .conversion-comparison {
    flex-direction: column;
    gap: 15px;
  }
  
  .segment-stats {
    grid-template-columns: 1fr;
  }
  
  .strategy-metrics {
    grid-template-columns: 1fr;
  }
}
</style>