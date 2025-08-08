/**
 * Service de Gestion des Données d'Entreprise
 * Intègre Facebook et autres sources de données
 */

// Google Analytics integration removed
const databaseService = require('./databaseService');

class CompanyDataService {
  constructor() {
    // Google Analytics integration removed
    
    // Cache des données d'entreprise - vidé pour forcer le rechargement
    this.companyCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    
    // Vider le cache au démarrage pour forcer le rechargement des données
    console.log('🔄 Cache des données d\'entreprise vidé pour forcer le rechargement');
  }

  /**
   * Récupérer les données d'une entreprise depuis la base de données
   */
  async getCompanyDataFromDatabase(companyId) {
    try {
      console.log('🏢 Récupération données entreprise depuis la base de données:', companyId);
      
      // Récupérer les informations de base de l'entreprise
      const company = await databaseService.get(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );

      if (!company) {
        throw new Error(`Entreprise ${companyId} non trouvée`);
      }

      // Google Analytics integration removed - using mock data
      const analyticsData = this.getMockAnalyticsData();
      
      // Récupérer les données des réseaux sociaux
      const socialData = await this.getSocialMediaDataFromDB(companyId);
      
      // Récupérer les données email marketing
      const emailData = await this.getEmailMarketingDataFromDB(companyId);
      
      // Récupérer les données de vente
      const salesData = await this.getSalesDataFromDB(companyId);

      return {
        company: {
          id: company.id,
          name: company.name,
          industry: company.industry,
          size: company.size,
          location: company.location,
          website: company.website
        },
        analytics: analyticsData,
        social: socialData,
        email: emailData,
        sales: salesData,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Erreur récupération données entreprise depuis la base de données:', error);
      
      // Retourner des données de démonstration en cas d'erreur
      return this.getMockCompanyData(companyId);
    }
  }

  /**
   * Récupère toutes les données d'une entreprise
   */
  async getCompanyData(companyId, options = {}) {
    try {
      // Vérifier le cache
      const cached = this.getCachedData(companyId);
      if (cached && !options.forceRefresh) {
        return cached;
      }

      // Vérifier si l'entreprise existe dans la base de données
      const company = await databaseService.get(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );

      let companyData;

      if (company) {
        // Utiliser les données réelles de la base de données
        console.log('📊 Utilisation des données réelles pour l\'entreprise:', company.name);
        companyData = await this.getCompanyDataFromDatabase(companyId);
      } else {
        // Fallback vers les données mock pour les IDs non existants
        console.log('⚠️ Entreprise non trouvée, utilisation des données mock pour:', companyId);
        
        // Récupérer les informations de base de l'entreprise
        const companyInfo = await this.getCompanyInfo(companyId);
        
        // Récupérer les données en parallèle (Google Analytics removed)
        const [facebookData, emailData, salesData] = await Promise.allSettled([
          this.getFacebookData(companyInfo.facebookPageId),
          this.getEmailMarketingData(companyInfo.emailProvider),
          this.getSalesData(companyInfo.crmProvider)
        ]);
        
        const analyticsData = { status: 'fulfilled', value: this.getMockAnalyticsData() };

        companyData = {
          id: companyId,
          ...companyInfo,
          analytics: analyticsData.value,
          facebook: facebookData.status === 'fulfilled' ? facebookData.value : null,
          email: emailData.status === 'fulfilled' ? emailData.value : null,
          sales: salesData.status === 'fulfilled' ? salesData.value : null,
          lastUpdated: new Date().toISOString()
        };
      }

      // Mettre en cache
      this.setCachedData(companyId, companyData);
      
      return companyData;
      
    } catch (error) {
      console.error(`Erreur récupération données entreprise ${companyId}:`, error);
      return this.getMockCompanyData(companyId);
    }
  }

  /**
   * Récupère les informations de base de l'entreprise
   */
  async getCompanyInfo(companyId) {
    try {
      console.log('🏢 Récupération informations entreprise depuis la base de données:', companyId);
      
      // Récupérer les informations de base de l'entreprise depuis la base de données
      const company = await databaseService.get(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );

      if (!company) {
        console.log('⚠️ Entreprise non trouvée, utilisation des données de démonstration');
        // Fallback vers les données mock si l'entreprise n'est pas trouvée
        return {
          name: 'Entreprise Demo',
          industry: 'Démonstration',
          size: 'PME',
          website: 'https://demo.com',
          googleAnalyticsPropertyId: null,
          facebookPageId: null,
          emailProvider: null,
          crmProvider: null,
          goals: ['Augmenter les conversions', 'Améliorer la notoriété'],
          challenges: ['Acquisition client', 'Optimisation du budget']
        };
      }

      // Récupérer les configurations API pour cette entreprise
      const [googleConfig, facebookConfig, emailConfig, salesConfig] = await Promise.allSettled([
        databaseService.getApiConfiguration(companyId, 'google_analytics'),
        databaseService.getApiConfiguration(companyId, 'facebook'),
        databaseService.getApiConfiguration(companyId, 'email_marketing'),
        databaseService.getApiConfiguration(companyId, 'sales')
      ]);

      return {
        name: company.name,
        industry: company.industry,
        size: company.size,
        location: company.location,
        website: company.website,
        description: company.description,
        googleAnalyticsPropertyId: googleConfig.status === 'fulfilled' && googleConfig.value ? 
          googleConfig.value.config_data?.propertyId : null,
        facebookPageId: facebookConfig.status === 'fulfilled' && facebookConfig.value ? 
          facebookConfig.value.config_data?.pageId : null,
        emailProvider: emailConfig.status === 'fulfilled' && emailConfig.value ? 
          emailConfig.value.config_data?.provider : null,
        crmProvider: salesConfig.status === 'fulfilled' && salesConfig.value ? 
          salesConfig.value.config_data?.provider : null,
        goals: ['Augmenter les conversions', 'Améliorer la notoriété', 'Développer le lead generation'],
        challenges: ['Acquisition client', 'Optimisation du taux de conversion', 'Budget marketing limité']
      };
      
    } catch (error) {
      console.error('❌ Erreur récupération informations entreprise:', error);
      // Fallback vers les données mock en cas d'erreur
      return {
        name: 'Entreprise Demo',
        industry: 'Démonstration',
        size: 'PME',
        website: 'https://demo.com',
        googleAnalyticsPropertyId: null,
        facebookPageId: null,
        emailProvider: null,
        crmProvider: null,
        goals: ['Augmenter les conversions', 'Améliorer la notoriété'],
        challenges: ['Acquisition client', 'Optimisation du budget']
      };
    }
  }

  // Google Analytics methods removed - using mock data only

  /**
   * Récupère les données Facebook/Meta
   */
  async getFacebookData(pageId) {
    try {
      // En production, utilisez l'API Facebook Graph
      // Pour l'instant, on utilise des données mock réalistes
      return this.getMockFacebookData();
      
    } catch (error) {
      console.error('Erreur Facebook API:', error);
      return this.getMockFacebookData();
    }
  }

  /**
   * Récupère les données d'email marketing
   */
  async getEmailMarketingData(provider) {
    try {
      // En production, intégrez avec Mailchimp, Klaviyo, etc.
      return this.getMockEmailData();
      
    } catch (error) {
      console.error('Erreur Email Marketing:', error);
      return this.getMockEmailData();
    }
  }

  /**
   * Récupère les données de ventes
   */
  async getSalesData(crmProvider) {
    try {
      // En production, intégrez avec HubSpot, Salesforce, etc.
      return this.getMockSalesData();
      
    } catch (error) {
      console.error('Erreur CRM:', error);
      return this.getMockSalesData();
    }
  }

  /**
   * Données mock Google Analytics
   */
  getMockAnalyticsData() {
    const baseValue = Math.floor(Math.random() * 1000) + 3000;
    return {
      sessions: baseValue + Math.floor(Math.random() * 2000),
      users: Math.floor(baseValue * 0.7) + Math.floor(Math.random() * 1000),
      pageviews: baseValue * 3 + Math.floor(Math.random() * 5000),
      bounceRate: 45 + Math.random() * 30, // 45-75%
      avgSessionDuration: 120 + Math.floor(Math.random() * 180), // 2-5 minutes
      conversions: Math.floor(baseValue * 0.025) + Math.floor(Math.random() * 50),
      conversionRate: 1.5 + Math.random() * 3, // 1.5-4.5%
      topSources: [
        { source: 'Organic Search', sessions: Math.floor(baseValue * 0.4) },
        { source: 'Direct', sessions: Math.floor(baseValue * 0.25) },
        { source: 'Social', sessions: Math.floor(baseValue * 0.15) },
        { source: 'Paid Search', sessions: Math.floor(baseValue * 0.12) },
        { source: 'Email', sessions: Math.floor(baseValue * 0.08) }
      ],
      period: 'Derniers 30 jours'
    };
  }

  /**
   * Données mock Facebook
   */
  getMockFacebookData() {
    const baseReach = Math.floor(Math.random() * 10000) + 15000;
    return {
      reach: baseReach,
      impressions: baseReach * 2.5 + Math.floor(Math.random() * 10000),
      engagement: 2 + Math.random() * 4, // 2-6%
      clicks: Math.floor(baseReach * 0.03) + Math.floor(Math.random() * 200),
      likes: Math.floor(baseReach * 0.02) + Math.floor(Math.random() * 150),
      shares: Math.floor(baseReach * 0.005) + Math.floor(Math.random() * 50),
      comments: Math.floor(baseReach * 0.008) + Math.floor(Math.random() * 80),
      cpm: 8 + Math.random() * 12, // 8-20€
      cpc: 0.5 + Math.random() * 2, // 0.5-2.5€
      ctr: 1 + Math.random() * 3, // 1-4%
      period: 'Derniers 30 jours'
    };
  }

  /**
   * Données mock Email Marketing
   */
  getMockEmailData() {
    return {
      subscribers: Math.floor(Math.random() * 5000) + 8000,
      emailsSent: Math.floor(Math.random() * 2000) + 3000,
      openRate: 18 + Math.random() * 12, // 18-30%
      clickRate: 2 + Math.random() * 4, // 2-6%
      unsubscribeRate: 0.2 + Math.random() * 0.8, // 0.2-1%
      deliveryRate: 96 + Math.random() * 3, // 96-99%
      bounceRate: 1 + Math.random() * 3, // 1-4%
      revenue: Math.floor(Math.random() * 15000) + 5000,
      period: 'Derniers 30 jours'
    };
  }

  /**
   * Données mock Ventes
   */
  getMockSalesData() {
    const baseRevenue = Math.floor(Math.random() * 30000) + 40000;
    return {
      revenue: baseRevenue,
      deals: Math.floor(baseRevenue / 2000) + Math.floor(Math.random() * 20),
      pipeline: baseRevenue * 1.8 + Math.floor(Math.random() * 20000),
      averageDealSize: Math.floor(baseRevenue / 25) + Math.floor(Math.random() * 1000),
      conversionRate: 15 + Math.random() * 20, // 15-35%
      salesCycle: 25 + Math.floor(Math.random() * 40), // 25-65 jours
      newLeads: Math.floor(Math.random() * 100) + 150,
      qualifiedLeads: Math.floor(Math.random() * 50) + 80,
      period: 'Derniers 30 jours'
    };
  }

  /**
   * Données mock Google Analytics
   */
  getMockAnalyticsData(companyId = 'demo') {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return {
      sessions: 15420,
      users: 12350,
      pageViews: 45680,
      bounceRate: 0.42,
      avgSessionDuration: 185,
      topPages: [
        { path: '/', views: 8500, title: 'Accueil' },
        { path: '/produits', views: 3200, title: 'Nos Produits' },
        { path: '/contact', views: 1800, title: 'Contact' },
        { path: '/blog', views: 1200, title: 'Blog' },
        { path: '/about', views: 950, title: 'À propos' }
      ],
      trafficSources: [
        { source: 'Organic Search', sessions: 6200, percentage: 40.2 },
        { source: 'Direct', sessions: 4600, percentage: 29.8 },
        { source: 'Social Media', sessions: 2800, percentage: 18.1 },
        { source: 'Paid Search', sessions: 1820, percentage: 11.9 }
      ],
      period: { startDate, endDate },
      dataSource: 'mock'
    };
  }

  /**
   * Données mock complètes pour une entreprise
   */
  getMockCompanyData(companyId) {
    const companyInfo = {
      'company_1': {
        name: 'TechStart Solutions',
        industry: 'Technologie',
        size: 'Startup'
      },
      'company_2': {
        name: 'E-Commerce Plus',
        industry: 'E-commerce',
        size: 'PME'
      }
    };

    const info = companyInfo[companyId] || companyInfo['company_1'];

    return {
      id: companyId,
      ...info,
      analytics: this.getMockAnalyticsData(companyId),
      facebook: this.getMockFacebookData(),
      email: this.getMockEmailData(),
      sales: this.getMockSalesData(),
      goals: ['Augmenter les conversions', 'Améliorer la notoriété'],
      challenges: ['Acquisition client', 'Optimisation du budget'],
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Récupérer les données des réseaux sociaux depuis la base de données
   */
  async getSocialMediaDataFromDB(companyId) {
    try {
      // Récupérer les configurations des réseaux sociaux
      const facebookConfig = await databaseService.getApiConfiguration(companyId, 'facebook');
      const instagramConfig = await databaseService.getApiConfiguration(companyId, 'instagram');
      const linkedinConfig = await databaseService.getApiConfiguration(companyId, 'linkedin');

      // Pour l'instant, retourner des données de démonstration
      // TODO: Implémenter les appels API réels
      return {
        facebook: {
          followers: 15420,
          engagement: 4.2,
          reach: 45000,
          posts: 28,
          configured: !!facebookConfig
        },
        instagram: {
          followers: 8930,
          engagement: 6.8,
          reach: 25000,
          posts: 35,
          configured: !!instagramConfig
        },
        linkedin: {
          followers: 3240,
          engagement: 3.1,
          reach: 12000,
          posts: 15,
          configured: !!linkedinConfig
        }
      };
    } catch (error) {
      console.error('❌ Erreur récupération données réseaux sociaux:', error);
      return {
        facebook: { followers: 0, engagement: 0, reach: 0, posts: 0, configured: false },
        instagram: { followers: 0, engagement: 0, reach: 0, posts: 0, configured: false },
        linkedin: { followers: 0, engagement: 0, reach: 0, posts: 0, configured: false }
      };
    }
  }

  /**
   * Récupérer les données email marketing depuis la base de données
   */
  async getEmailMarketingDataFromDB(companyId) {
    try {
      const config = await databaseService.getApiConfiguration(companyId, 'email_marketing');
      
      // Pour l'instant, retourner des données de démonstration
      // TODO: Implémenter les appels API réels (Mailchimp, SendGrid, etc.)
      return {
        subscribers: 5420,
        openRate: 24.5,
        clickRate: 3.2,
        campaigns: 12,
        configured: !!config
      };
    } catch (error) {
      console.error('❌ Erreur récupération données email marketing:', error);
      return {
        subscribers: 0,
        openRate: 0,
        clickRate: 0,
        campaigns: 0,
        configured: false
      };
    }
  }

  /**
   * Récupérer les données de vente depuis la base de données
   */
  async getSalesDataFromDB(companyId) {
    try {
      const config = await databaseService.getApiConfiguration(companyId, 'sales');
      
      // Pour l'instant, retourner des données de démonstration
      // TODO: Implémenter les appels API réels (Salesforce, HubSpot, etc.)
      return {
        revenue: 125000,
        deals: 45,
        conversion: 2.8,
        pipeline: 89000,
        configured: !!config
      };
    } catch (error) {
      console.error('❌ Erreur récupération données de vente:', error);
      return {
        revenue: 0,
        deals: 0,
        conversion: 0,
        pipeline: 0,
        configured: false
      };
    }
  }

  /**
   * Gestion du cache
   */
  getCachedData(companyId) {
    const cached = this.companyCache.get(companyId);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(companyId, data) {
    this.companyCache.set(companyId, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Nettoie le cache ancien
   */
  cleanCache() {
    const now = Date.now();
    for (const [key, value] of this.companyCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.companyCache.delete(key);
      }
    }
  }

  /**
   * Force le rafraîchissement des données
   */
  async refreshCompanyData(companyId) {
    this.companyCache.delete(companyId);
    return await this.getCompanyData(companyId, { forceRefresh: true });
  }

  /**
   * Récupère les métriques en temps réel
   */
  async getRealTimeMetrics(companyId) {
    try {
      const companyInfo = await this.getCompanyInfo(companyId);
      
      if (companyInfo.googleAnalyticsPropertyId) {
        const authClient = await this.auth.getClient();
        
        // Requête temps réel GA4
        const realTimeData = await this.analytics.properties.runRealtimeReport({
          auth: authClient,
          property: `properties/${companyInfo.googleAnalyticsPropertyId}`,
          requestBody: {
            metrics: [
              { name: 'activeUsers' },
              { name: 'screenPageViews' }
            ]
          }
        });

        const activeUsers = parseInt(realTimeData.data.rows?.[0]?.metricValues?.[0]?.value || 0);
        const pageViews = parseInt(realTimeData.data.rows?.[0]?.metricValues?.[1]?.value || 0);

        return {
          activeUsers,
          pageViews,
          timestamp: new Date().toISOString()
        };
      }
      
      // Fallback avec données simulées
      return {
        activeUsers: Math.floor(Math.random() * 50) + 10,
        pageViews: Math.floor(Math.random() * 100) + 20,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Erreur métriques temps réel:', error);
      return {
        activeUsers: Math.floor(Math.random() * 50) + 10,
        pageViews: Math.floor(Math.random() * 100) + 20,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new CompanyDataService();