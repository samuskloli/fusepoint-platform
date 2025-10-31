class AIChatService {
  constructor() {
    const apiEnv = import.meta.env.VITE_API_URL
    const backendEnv = import.meta.env.VITE_BACKEND_URL
    const host = typeof window !== 'undefined' ? window.location.hostname : ''
    const isLocalNetworkHost = !!host && host !== 'localhost' && host !== '127.0.0.1'
    this.baseUrl = isLocalNetworkHost
      ? ''
      : (apiEnv && apiEnv.startsWith('http')
          ? apiEnv.replace(/\/+$/, '')
          : backendEnv && backendEnv.startsWith('http')
            ? backendEnv.replace(/\/+$/, '')
            : '')
    this.authToken = this.getAuthToken();
  }

  getAuthToken() {
    // Utiliser le token d'authentification stocké par le système d'auth
    return localStorage.getItem('accessToken') || localStorage.getItem('authToken') || null;
  }

  async sendMessage(message, agentType = 'strategy', conversationHistory = [], options = {}) {
    try {
      const { userId, companyId } = options;
      
      const response = await fetch(`${this.baseUrl}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({
          message,
          agentType,
          conversationHistory: this.formatConversationHistory(conversationHistory),
          userId,
          companyId
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('Données reçues du serveur:', data);
      
      // Retourner la structure correcte
      return {
        content: data.response || data.content,
        suggestions: data.suggestions || [],
        agent: data.agent || 'Agent IA',
        contextual: data.contextual,
        userId: data.userId,
        companyId: data.companyId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      return this.getFallbackResponse(message, agentType);
    }
  }

  // Méthode pour récupérer les agents humains disponibles
  async getAvailableAgents() {
    try {
      const response = await fetch(`${this.baseUrl}/api/agent/available`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.agents || [];
      } else {
        console.warn('Erreur lors de la récupération des agents, utilisation du fallback');
        return this.getDefaultAgents();
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des agents:', error);
      return this.getDefaultAgents();
    }
  }

  // Méthode pour vérifier si un client a un agent attribué
  async checkAgentAssignment(clientId) {
    const token = this.getAuthToken();
    // Ne pas appeler l'API si non authentifié ou pas d'ID
    if (!token || !clientId) {
      return { hasAssignedAgent: false, data: null };
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/client/${clientId}/assigned-agent`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Erreur lors de la vérification de l\'attribution');
      }
    } catch (error) {
      console.warn('Erreur lors de la vérification de l\'attribution:', error);
      return { hasAssignedAgent: false, data: null };
    }
  }

  // Méthode pour demander l'attribution automatique d'un agent
  async requestAgentAssignment(clientId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/agent/auto-assign/${clientId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'attribution');
      }
    } catch (error) {
      console.error('Erreur lors de la demande d\'attribution:', error);
      throw error;
    }
  }

  getFallbackResponse(message, agentType) {
    const fallbackResponses = {
      content: {
        content: `📝 En tant qu'expert contenu, je peux vous aider avec la création et l'optimisation de votre contenu marketing.\n\nPour des réponses IA personnalisées, configurez votre clé OpenAI dans les paramètres du serveur.\n\nQue souhaitez-vous améliorer en priorité ?`,
        suggestions: ['Idées d\'articles', 'Optimisation SEO', 'Calendrier éditorial', 'Performance contenu'],
        agent: 'Agent Contenu',
        timestamp: new Date().toISOString()
      },
      social: {
        content: `📱 Spécialiste réseaux sociaux à votre service ! Je peux vous conseiller sur la stratégie sociale.\n\nPour des recommandations IA personnalisées, ajoutez votre clé OpenAI.\n\nSur quel réseau souhaitez-vous vous concentrer ?`,
        suggestions: ['Stratégie Instagram', 'Contenu LinkedIn', 'Hashtags optimisés', 'Engagement communauté'],
        agent: 'Agent Social',
        timestamp: new Date().toISOString()
      },
      email: {
        content: `📧 Expert email marketing ! Je peux vous aider avec vos campagnes email.\n\nPour des conseils IA avancés, configurez OpenAI.\n\nQuel est votre défi email actuel ?`,
        suggestions: ['Automatisation email', 'Segmentation audience', 'Taux d\'ouverture', 'Personnalisation'],
        agent: 'Agent Email',
        timestamp: new Date().toISOString()
      },
      analytics: {
        content: `📊 Analyste de données marketing ! Je peux interpréter vos métriques.\n\nPour des insights IA détaillés, ajoutez votre clé OpenAI.\n\nQuelles données souhaitez-vous analyser ?`,
        suggestions: ['Performance campagnes', 'Analyse conversions', 'Rapports KPI', 'Prédictions tendances'],
        agent: 'Agent Analytics',
        timestamp: new Date().toISOString()
      },
      strategy: {
        content: `🎯 Stratège marketing à votre écoute ! Je peux vous aider avec la planification.\n\nPour des stratégies IA personnalisées, configurez OpenAI.\n\nQuel est votre objectif principal ?`,
        suggestions: ['Stratégie globale', 'Plan campagne', 'Analyse concurrence', 'Optimisation budget'],
        agent: 'Agent Stratégie',
        timestamp: new Date().toISOString()
      }
    };

    return fallbackResponses[agentType] || fallbackResponses.strategy;
  }

  getDefaultAgents() {
    return [
      {
        id: 'content',
        name: 'Agent Contenu',
        specialty: 'Création et optimisation de contenu',
        avatar: '📝'
      },
      {
        id: 'social',
        name: 'Agent Social',
        specialty: 'Gestion des réseaux sociaux',
        avatar: '📱'
      },
      {
        id: 'email',
        name: 'Agent Email',
        specialty: 'Marketing par email',
        avatar: '📧'
      },
      {
        id: 'analytics',
        name: 'Agent Analytics',
        specialty: 'Analyse de données',
        avatar: '📊'
      },
      {
        id: 'strategy',
        name: 'Agent Stratégie',
        specialty: 'Planification marketing',
        avatar: '🎯'
      }
    ];
  }

  // Méthode pour tester la connexion à l'API
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Erreur de connexion à l\'API:', error);
      return false;
    }
  }

  formatConversationHistory(messages) {
    if (!Array.isArray(messages)) return [];

    return messages.map(msg => ({
      role: msg.role || (msg.isUser ? 'user' : 'assistant'),
      content: msg.content,
      timestamp: msg.timestamp || new Date().toISOString()
    }));
  }
}

export default new AIChatService();