class AIConfigService {
  constructor() {
    this.baseURL = `${import.meta.env.VITE_API_URL || 'http://localhost:3004'}/api/ai`;
  }

  // Vérifier le statut de l'IA
  async getStatus() {
    try {
      const response = await fetch(`${this.baseURL}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || 'demo-token-123'}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la vérification du statut');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur getStatus:', error);
      throw error;
    }
  }

  // Tester la connexion OpenAI
  async testConnection(model = 'gpt-3.5-turbo') {
    try {
      const response = await fetch(`${this.baseURL}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || 'demo-token-123'}`
        },
        body: JSON.stringify({
          model
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du test de connexion');
      }

      return data;
    } catch (error) {
      console.error('Erreur testConnection:', error);
      throw error;
    }
  }

  // Configurer l'IA
  async configure(config) {
    try {
      const response = await fetch(`${this.baseURL}/configure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || 'demo-token-123'}`
        },
        body: JSON.stringify(config)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la configuration');
      }

      return data;
    } catch (error) {
      console.error('Erreur configure:', error);
      throw error;
    }
  }

  // Obtenir les modèles disponibles
  getAvailableModels() {
    return [
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Rapide et économique, idéal pour la plupart des tâches'
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        description: 'Plus puissant et précis, recommandé pour les tâches complexes'
      },
      {
        id: 'gpt-4-turbo-preview',
        name: 'GPT-4 Turbo',
        description: 'Version optimisée de GPT-4 avec de meilleures performances'
      }
    ];
  }
}

export default new AIConfigService();