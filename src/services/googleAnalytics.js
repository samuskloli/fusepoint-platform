/**
 * Service d'intégration Google Analytics 4 (GA4)
 * Utilise l'API Google Analytics Reporting v4 et Data API v1
 */

class GoogleAnalyticsService {
  constructor() {
    this.accessToken = null;
    this.propertyId = null;
    this.isInitialized = false;
  }

  /**
   * Initialise le service avec les credentials
   * @param {string} accessToken - Token d'accès OAuth2
   * @param {string} propertyId - ID de la propriété GA4
   */
  async initialize(accessToken, propertyId) {
    this.accessToken = accessToken;
    this.propertyId = propertyId;
    this.isInitialized = true;
    
    // Sauvegarder les credentials dans localStorage
    localStorage.setItem('ga_access_token', accessToken);
    localStorage.setItem('ga_property_id', propertyId);
    
    return this.testConnection();
  }

  /**
   * Charge les credentials depuis localStorage
   */
  loadCredentials() {
    const token = localStorage.getItem('ga_access_token');
    const propertyId = localStorage.getItem('ga_property_id');
    
    if (token && propertyId) {
      this.accessToken = token;
      this.propertyId = propertyId;
      this.isInitialized = true;
      return true;
    }
    return false;
  }

  /**
   * Vérifie si l'API Google Analytics Data est activée
   */
  async checkApiStatus() {
    try {
      // Test simple pour vérifier si l'API répond
      const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${this.propertyId}`, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      if (response.status === 404) {
        return { enabled: true, propertyExists: false };
      } else if (response.status === 403) {
        // Essayer de récupérer le texte d'erreur pour un diagnostic plus précis
        try {
          const errorText = await response.text();
          if (errorText.includes('API has not been used') || 
              errorText.includes('disabled') || 
              errorText.includes('not enabled')) {
            return { enabled: false, propertyExists: true };
          }
        } catch (e) {
          // Si on ne peut pas lire le texte d'erreur, on assume que l'API est activée
          console.warn('Impossible de lire le détail de l\'erreur 403, on assume que l\'API est activée');
        }
        return { enabled: true, propertyExists: true, permissionError: true };
      }
      
      return { enabled: true, propertyExists: true };
    } catch (error) {
      // En cas d'erreur réseau, on assume que l'API est activée pour éviter les faux positifs
      console.warn('Erreur lors de la vérification du statut API, on assume qu\'elle est activée:', error.message);
      return { enabled: true, error: error.message };
    }
  }

  /**
   * Teste la connexion à l'API
   */
  async testConnection() {
    try {
      // Essayer directement la connexion à l'API
      await this.makeRequest('GET', 
        `https://analyticsdata.googleapis.com/v1beta/properties/${this.propertyId}/metadata`);
      return true;
    } catch (error) {
      console.error('Erreur de connexion GA:', error);
      
      // Diagnostics détaillés pour les erreurs 403
      if (error.message.includes('403')) {
        console.error('Diagnostic erreur 403:');
        console.error('- Vérifiez que l\'API Google Analytics Data est activée');
        console.error('- Vérifiez que votre compte a accès à la propriété GA4:', this.propertyId);
        console.error('- Vérifiez les scopes OAuth (analytics.readonly requis)');
        console.error('- Attendez 5-10 minutes après activation de l\'API');
        
        // Vérifier le statut de l'API pour un diagnostic plus précis
        try {
          const apiStatus = await this.checkApiStatus();
          if (!apiStatus.enabled) {
            throw new Error('API Google Analytics Data non activée. Activez-la dans Google Cloud Console.');
          }
          if (!apiStatus.propertyExists) {
            throw new Error(`Propriété GA4 ${this.propertyId} introuvable. Vérifiez l'ID de propriété.`);
          }
          if (apiStatus.permissionError) {
            throw new Error('Permissions insuffisantes. Vérifiez l\'accès à la propriété GA4.');
          }
        } catch (diagError) {
          // Si le diagnostic échoue, on garde l'erreur originale
          console.warn('Diagnostic API échoué:', diagError.message);
        }
      }
      
      throw error;
    }
  }

  /**
   * Effectue une requête à l'API Google Analytics
   */
  async makeRequest(method, url, body = null) {
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };

    const config = {
      method,
      headers
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Récupère les métriques principales
   * @param {string} startDate - Date de début (YYYY-MM-DD)
   * @param {string} endDate - Date de fin (YYYY-MM-DD)
   */
  async getMainMetrics(startDate, endDate) {
    if (!this.isInitialized) {
      throw new Error('Service non initialisé');
    }

    const requestBody = {
      requests: [{
        property: `properties/${this.propertyId}`,
        dateRanges: [{
          startDate,
          endDate
        }],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
          { name: 'screenPageViews' }
        ],
        dimensions: []
      }]
    };

    try {
      const response = await this.makeRequest('POST', 
        `https://analyticsdata.googleapis.com/v1beta/properties/${this.propertyId}:batchRunReports`,
        requestBody
      );
      
      return this.formatMainMetrics(response.reports[0]);
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques:', error);
      throw error;
    }
  }

  /**
   * Récupère les données de sessions au fil du temps
   */
  async getSessionsOverTime(startDate, endDate) {
    const requestBody = {
      requests: [{
        property: `properties/${this.propertyId}`,
        dateRanges: [{
          startDate,
          endDate
        }],
        metrics: [{ name: 'sessions' }],
        dimensions: [{ name: 'date' }],
        orderBys: [{
          dimension: {
            dimensionName: 'date'
          }
        }]
      }]
    };

    try {
      const response = await this.makeRequest('POST', 
        `https://analyticsdata.googleapis.com/v1beta/properties/${this.propertyId}:batchRunReports`,
        requestBody
      );
      
      return this.formatTimeSeriesData(response.reports[0]);
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions:', error);
      throw error;
    }
  }

  /**
   * Récupère les sources de trafic
   */
  async getTrafficSources(startDate, endDate) {
    const requestBody = {
      requests: [{
        property: `properties/${this.propertyId}`,
        dateRanges: [{
          startDate,
          endDate
        }],
        metrics: [{ name: 'sessions' }],
        dimensions: [{ name: 'sessionDefaultChannelGrouping' }],
        orderBys: [{
          metric: {
            metricName: 'sessions'
          },
          desc: true
        }]
      }]
    };

    try {
      const response = await this.makeRequest('POST', 
        `https://analyticsdata.googleapis.com/v1beta/properties/${this.propertyId}:batchRunReports`,
        requestBody
      );
      
      return this.formatTrafficSources(response.reports[0]);
    } catch (error) {
      console.error('Erreur lors de la récupération des sources:', error);
      throw error;
    }
  }

  /**
   * Récupère les pages les plus visitées
   */
  async getTopPages(startDate, endDate) {
    const requestBody = {
      requests: [{
        property: `properties/${this.propertyId}`,
        dateRanges: [{
          startDate,
          endDate
        }],
        metrics: [{ name: 'screenPageViews' }],
        dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
        orderBys: [{
          metric: {
            metricName: 'screenPageViews'
          },
          desc: true
        }],
        limit: 10
      }]
    };

    try {
      const response = await this.makeRequest('POST', 
        `https://analyticsdata.googleapis.com/v1beta/properties/${this.propertyId}:batchRunReports`,
        requestBody
      );
      
      return this.formatTopPages(response.reports[0]);
    } catch (error) {
      console.error('Erreur lors de la récupération des pages:', error);
      throw error;
    }
  }

  /**
   * Récupère les données géographiques
   */
  async getGeographicData(startDate, endDate) {
    const requestBody = {
      requests: [{
        property: `properties/${this.propertyId}`,
        dateRanges: [{
          startDate,
          endDate
        }],
        metrics: [{ name: 'totalUsers' }],
        dimensions: [{ name: 'country' }],
        orderBys: [{
          metric: {
            metricName: 'totalUsers'
          },
          desc: true
        }],
        limit: 10
      }]
    };

    try {
      const response = await this.makeRequest('POST', 
        `https://analyticsdata.googleapis.com/v1beta/properties/${this.propertyId}:batchRunReports`,
        requestBody
      );
      
      return this.formatGeographicData(response.reports[0]);
    } catch (error) {
      console.error('Erreur lors de la récupération des données géo:', error);
      throw error;
    }
  }

  // Méthodes de formatage des données
  formatMainMetrics(report) {
    if (!report.rows || report.rows.length === 0) {
      return {
        sessions: 0,
        users: 0,
        averageSessionDuration: '0m 0s',
        bounceRate: '0%',
        pageViews: 0
      };
    }

    const row = report.rows[0];
    const sessions = parseInt(row.metricValues[0].value);
    const users = parseInt(row.metricValues[1].value);
    const avgDuration = parseFloat(row.metricValues[2].value);
    const bounceRate = parseFloat(row.metricValues[3].value) * 100;
    const pageViews = parseInt(row.metricValues[4].value);

    return {
      sessions: sessions.toLocaleString(),
      users: users.toLocaleString(),
      averageSessionDuration: this.formatDuration(avgDuration),
      bounceRate: `${bounceRate.toFixed(1)}%`,
      pageViews: pageViews.toLocaleString()
    };
  }

  formatTimeSeriesData(report) {
    if (!report.rows) return [];
    
    return report.rows.map(row => ({
      date: row.dimensionValues[0].value,
      sessions: parseInt(row.metricValues[0].value)
    }));
  }

  formatTrafficSources(report) {
    if (!report.rows) return [];
    
    return report.rows.map(row => ({
      source: row.dimensionValues[0].value,
      sessions: parseInt(row.metricValues[0].value)
    }));
  }

  formatTopPages(report) {
    if (!report.rows) return [];
    
    return report.rows.map(row => ({
      path: row.dimensionValues[0].value,
      title: row.dimensionValues[1].value,
      views: parseInt(row.metricValues[0].value)
    }));
  }

  formatGeographicData(report) {
    if (!report.rows) return [];
    
    return report.rows.map(row => ({
      country: row.dimensionValues[0].value,
      users: parseInt(row.metricValues[0].value)
    }));
  }

  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  }

  /**
   * Déconnecte le service
   */
  disconnect() {
    this.accessToken = null;
    this.propertyId = null;
    this.isInitialized = false;
    localStorage.removeItem('ga_access_token');
    localStorage.removeItem('ga_property_id');
  }

  /**
   * Vérifie si le service est connecté
   */
  isConnected() {
    return this.isInitialized && this.accessToken && this.propertyId;
  }
}

export default new GoogleAnalyticsService();