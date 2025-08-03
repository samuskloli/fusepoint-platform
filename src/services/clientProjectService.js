import axios from 'axios';

class ClientProjectService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Intercepteur pour ajouter le token aux requêtes
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Récupérer les actions/projets en cours du client
   */
  async getCurrentActions(clientId) {
    try {
      const response = await this.api.get(`/api/client/${clientId}/actions`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des actions:', error);
      // Retourner des données par défaut en cas d'erreur
      return [];
    }
  }

  /**
   * Récupérer les tâches en attente de validation
   */
  async getPendingTasks(clientId) {
    try {
      const response = await this.api.get(`/api/client/${clientId}/pending-tasks`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches en attente:', error);
      return [];
    }
  }

  /**
   * Récupérer les prochaines échéances
   */
  async getUpcomingDeadlines(clientId) {
    try {
      const response = await this.api.get(`/api/client/${clientId}/deadlines`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des échéances:', error);
      return [];
    }
  }

  /**
   * Récupérer les statistiques du client
   */
  async getClientStats(clientId) {
    try {
      const response = await this.api.get(`/api/client/${clientId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        completedProjects: 0,
        activeActions: 0,
        pendingTasks: 0,
        upcomingDeadlines: 0
      };
    }
  }

  // Méthode pour récupérer toutes les données du dashboard en une seule fois
  async getDashboardData(clientId) {
    try {
      const [currentActions, pendingTasks, upcomingDeadlines, stats] = await Promise.all([
        this.getCurrentActions(clientId),
        this.getPendingTasks(clientId),
        this.getUpcomingDeadlines(clientId),
        this.getClientStats(clientId)
      ]);

      return {
        currentActions,
        pendingTasks,
        upcomingDeadlines,
        completedProjects: stats.completedProjects || 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données du dashboard:', error);
      return {
        currentActions: [],
        pendingTasks: [],
        upcomingDeadlines: [],
        completedProjects: 0
      };
    }
  }

  /**
   * Valider une tâche
   */
  async validateTask(taskId, validation) {
    try {
      const response = await this.api.post(`/api/client/tasks/${taskId}/validate`, validation);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la validation de la tâche:', error);
      throw error;
    }
  }

  /**
   * Récupérer les détails d'une action
   */
  async getActionDetails(actionId) {
    try {
      const response = await this.api.get(`/api/client/actions/${actionId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de l\'action:', error);
      throw error;
    }
  }

  /**
   * Récupérer les détails d'une tâche
   */
  async getTaskDetails(taskId) {
    try {
      const response = await this.api.get(`/api/client/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la tâche:', error);
      throw error;
    }
  }

  /**
   * Récupérer tous les projets assignés à l'agent connecté
   */
  async getAgentProjects() {
    try {
      const response = await this.api.get('/api/agent/projects');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des projets de l\'agent:', error);
      return { projects: [] };
    }
  }

  /**
   * Récupérer les détails d'un projet
   */
  async getProjectDetails(projectId) {
    try {
      const response = await this.api.get(`/api/agent/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du projet:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un projet
   */
  async updateProject(projectId, projectData) {
    try {
      const response = await this.api.put(`/api/agent/projects/${projectId}`, projectData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
      throw error;
    }
  }

  /**
   * Récupérer les projets d'un client spécifique (pour les agents)
   */
  async getClientProjects(clientId) {
    try {
      const response = await this.api.get(`/api/agent/clients/${clientId}/projects`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des projets du client:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Récupérer les projets du client connecté (pour les clients)
   */
  async getMyProjects() {
    try {
      const response = await this.api.get('/api/client/projects');
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de mes projets:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Récupérer les détails d'un projet spécifique pour un client
   */
  async getMyProjectDetails(projectId) {
    try {
      const response = await this.api.get(`/api/client/projects/${projectId}`);
      return {
        success: true,
        data: response.data || {}
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du projet:', error);
      return {
        success: false,
        error: error.message,
        data: {}
      };
    }
  }
}

export const clientProjectService = new ClientProjectService();
export default clientProjectService;