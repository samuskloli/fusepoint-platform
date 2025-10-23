import api from './api'
import axios from 'axios'

class ProjectManagementService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 20000,
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
  // Gestion des projets
  async createProject(clientId, projectData) {
    try {
      const response = await this.api.post(`/api/agent/clients/${clientId}/projects`, projectData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la création du projet' }
    }
  }

  async updateProject(projectId, projectData) {
    try {
      const response = await this.api.put(`/api/agent/projects/${projectId}`, projectData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la mise à jour du projet' }
    }
  }

  async deleteProject(projectId) {
    try {
      await this.api.delete(`/api/agent/projects/${projectId}`)
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la suppression du projet' }
    }
  }

  async deleteMultipleProjects(projectIds) {
    try {
      const response = await this.api.delete('/api/agent/projects/bulk', {
        data: { projectIds }
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la suppression multiple des projets:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la suppression multiple des projets' }
    }
  }

  async duplicateProject(projectId) {
    try {
      const response = await this.api.post(`/api/agent/projects/${projectId}/duplicate`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la duplication du projet:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la duplication du projet' }
    }
  }

  async getProjectDetails(projectId) {
    try {
      console.log('🔍 Récupération des détails du projet:', projectId);
      
      // Récupérer les informations de l'utilisateur connecté
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      let response;
      
      // Si l'utilisateur est un client, utiliser la route client
      if (user && (user.role === 'user' || user.role === 'client')) {
        console.log('🔍 Utilisation de la route client pour récupérer les détails du projet');
        response = await this.api.get(`/api/client/projects/${projectId}`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          params: {
            _t: Date.now()
          }
        });
      } else {
        // Pour les agents, admins et super_admins, utiliser la route agent
        console.log('🔍 Utilisation de la route agent pour récupérer les détails du projet');
        response = await this.api.get(`/api/agent/projects/${projectId}`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          params: {
            _t: Date.now()
          }
        });
      }
      
      console.log('✅ Détails du projet récupérés:', response.data);
      
      // Pour les routes client, l'API retourne directement l'objet projet
      // Pour les routes agent, l'API retourne { success: true, data: {...} }
      if (user && (user.role === 'user' || user.role === 'client')) {
        // Route client : réponse directe
        if (response.data && response.data.id) {
          return { success: true, data: response.data }
        }
      } else {
        // Route agent : structure avec success et data
        if (response.data && response.data.success && response.data.data) {
          return { success: true, data: response.data.data }
        }
      }
      
      console.error('❌ Structure de réponse inattendue:', response.data)
      return { success: false, error: 'Structure de réponse inattendue' }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des détails du projet:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      })
      return { success: false, error: error.response?.data?.message || error.message || 'Erreur lors de la récupération des détails du projet' }
    }
  }

  // Méthodes spécifiques aux projets individuels
  async getProjectTasks(projectId) {
    try {
      console.log('🔍 Récupération des tâches du projet:', projectId);
      
      // Récupérer les informations de l'utilisateur connecté
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      let response;
      
      // Si l'utilisateur est un client, utiliser la route client avec company_id/client_id/id
      if (user && (user.role === 'user' || user.role === 'client')) {
        const clientParam = user.company_id ?? user.client_id ?? user.id
        console.log('🔍 Utilisation de la route client pour récupérer les tâches du projet', { clientParam })
        response = await this.api.get(`/api/clients/${clientParam}/projects/${projectId}/widgets/tasks`);
      } else {
        // Pour les agents, admins et super_admins, utiliser la route agent
        console.log('🔍 Utilisation de la route agent pour récupérer les tâches du projet');
        response = await this.api.get(`/api/agent/projects/${projectId}/tasks`);
      }
      
      console.log('✅ Tâches du projet récupérées:', response.data);
      
      // L'API retourne { success: true, data: { tasks: [...], stats: {...}, pagination: {...} } }
      if (response.data && response.data.success) {
        // Pour les routes client widgets, les tâches sont dans data.tasks
        if (response.data.data && response.data.data.tasks) {
          return { success: true, data: response.data.data.tasks }
        }
        // Pour les routes agent, les tâches sont directement dans data
        else if (Array.isArray(response.data.data)) {
          return { success: true, data: response.data.data }
        }
      }
      
      console.error('❌ Structure de réponse inattendue pour les tâches:', response.data)
      return { success: true, data: [] } // Retourner un tableau vide si pas de tâches
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des tâches du projet:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      })
      return { success: false, error: error.response?.data?.message || error.message || 'Erreur lors de la récupération des tâches du projet' }
    }
  }

  async getProjectFiles(projectId) {
    try {
      console.log('🔍 Récupération des fichiers du projet:', projectId);
      
      // Récupérer les informations de l'utilisateur connecté
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      let response;
      
      // Si l'utilisateur est un client, utiliser la route client avec company_id/client_id/id
      if (user && (user.role === 'user' || user.role === 'client')) {
        const clientParam = user.company_id ?? user.client_id ?? user.id
        console.log('🔍 Utilisation de la route client pour récupérer les fichiers du projet', { clientParam })
        response = await this.api.get(`/api/clients/${clientParam}/projects/${projectId}/widgets/files`);
      } else {
        // Pour les agents, admins et super_admins, utiliser la route agent
        console.log('🔍 Utilisation de la route agent pour récupérer les fichiers du projet');
        response = await this.api.get(`/api/agent/projects/${projectId}/files`);
      }
      
      console.log('✅ Fichiers du projet récupérés:', response.data);
      
      // L'API retourne { success: true, data: [...] }
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return { success: true, data: response.data.data }
      } else {
        return { success: true, data: [] } // Retourner un tableau vide si pas de fichiers
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers du projet:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      })
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des fichiers du projet' }
    }
  }

  async getProjectTeamMembers(projectId) {
    try {
      console.log('🔍 Récupération des membres de l\'équipe du projet:', projectId);
      
      // Récupérer les informations de l'utilisateur connecté
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      let response;
      
      // Si l'utilisateur est un client, utiliser la route client
       if (user && (user.role === 'user' || user.role === 'client')) {
         console.log('🔍 Utilisation de la route client pour récupérer les membres de l\'équipe du projet');
         response = await this.api.get(`/api/client/${user.id}/projects/${projectId}/team`);
       } else {
        // Pour les agents, admins et super_admins, utiliser la route agent
        console.log('🔍 Utilisation de la route agent pour récupérer les membres de l\'équipe du projet');
        response = await this.api.get(`/api/agent/projects/${projectId}/team`);
      }
      
      console.log('✅ Membres de l\'équipe du projet récupérés:', response.data);
      
      // L'API retourne { success: true, data: [...] }, donc on accède à response.data.data
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return { success: true, data: response.data.data }
      } else {
        return { success: true, data: [] } // Retourner un tableau vide si pas de membres
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des membres de l\'équipe du projet:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des membres de l\'équipe du projet' }
    }
  }

  async createTask(projectId, taskData) {
    try {
      const response = await this.api.post(`/api/agent/projects/${projectId}/tasks`, taskData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la création de la tâche' }
    }
  }

  async uploadFile(projectId, fileData) {
    try {
      const formData = new FormData()
      formData.append('file', fileData.file)
      formData.append('description', fileData.description || '')
      
      const response = await this.api.post(`/api/agent/projects/${projectId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors du téléchargement du fichier' }
    }
  }

  async inviteProvider(projectId, providerData) {
    try {
      const response = await this.api.post(`/api/agent/projects/${projectId}/team/invite`, providerData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de l\'invitation du prestataire:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de l\'invitation du prestataire' }
    }
  }

  async removeMember(projectId, memberId) {
    try {
      await this.api.delete(`/api/agent/projects/${projectId}/team/members/${memberId}`)
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la suppression du membre:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la suppression du membre' }
    }
  }

  async updateMemberRole(projectId, memberId, role) {
    try {
      const response = await this.api.put(`/api/agent/projects/${projectId}/team/members/${memberId}/role`, { role })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la mise à jour du rôle' }
    }
  }

  // Gestion des tâches
  async getTasks(clientId) {
    try {
      const response = await this.api.get(`/api/agent/clients/${clientId}/tasks`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des tâches' }
    }
  }

  async createTask(clientId, taskData) {
    try {
      const response = await this.api.post(`/api/agent/clients/${clientId}/tasks`, taskData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la création de la tâche' }
    }
  }

  async updateTask(taskId, taskData) {
    try {
      const response = await this.api.put(`/api/agent/tasks/${taskId}`, taskData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la mise à jour de la tâche' }
    }
  }

  async deleteTask(taskId) {
    try {
      await this.api.delete(`/api/agent/tasks/${taskId}`)
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la suppression de la tâche' }
    }
  }

  async assignTask(taskId, assigneeId) {
    try {
      const response = await this.api.put(`/api/agent/tasks/${taskId}/assign`, { assignee_id: assigneeId })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de l\'attribution de la tâche:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de l\'attribution de la tâche' }
    }
  }

  async updateTaskStatus(taskId, status) {
    try {
      const response = await this.api.put(`/api/agent/tasks/${taskId}/status`, { status })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de la tâche:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la mise à jour du statut de la tâche' }
    }
  }

  // Gestion des fichiers
  async getFiles(clientId) {
    try {
      const response = await this.api.get(`/api/agent/clients/${clientId}/files`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des fichiers' }
    }
  }

  // === Méthodes fusionnées de ClientProjectService ===

  /**
   * Récupérer les actions/projets en cours du client
   */
  async getCurrentActions(clientId) {
    try {
      const response = await this.api.get(`/api/client/${clientId}/actions`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des actions:', error);
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

  /**
   * Récupérer toutes les données du dashboard en une seule fois
   */
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
      return {
        success: true,
        data: response.data.data || response.data || []
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des projets de l\'agent:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Récupérer les projets d'un client spécifique
   * Utilise la route appropriée selon le rôle de l'utilisateur
   */
  async getClientProjects(clientId) {
    try {
      // Récupérer les informations de l'utilisateur connecté
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      let response;
      
      // Si l'utilisateur est un client et que clientId correspond à son ID, utiliser la route client
      if (user && (user.role === 'user' || user.role === 'client') && user.id == clientId) {
        console.log('🔍 Utilisation de la route client pour récupérer les projets');
        response = await this.api.get('/api/client/projects', {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          params: {
            _t: Date.now()
          }
        });
        
        // La route client retourne directement les projets
        return {
          success: true,
          data: response.data || []
        };
      } else {
        // Pour les agents, admins et super_admins, utiliser la route agent
        console.log('🔍 Utilisation de la route agent pour récupérer les projets du client:', clientId);
        response = await this.api.get(`/api/agent/clients/${clientId}/projects`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          params: {
            _t: Date.now()
          }
        });
        
        // La réponse du serveur a la structure: { success: true, data: { projects, pagination } }
        let projects = [];
        
        if (response.data && response.data.data && response.data.data.projects) {
          projects = response.data.data.projects;
        } else if (response.data && response.data.data && response.data.data.items) {
          projects = response.data.data.items;
        } else if (response.data && response.data.projects) {
          projects = response.data.projects;
        } else if (response.data && response.data.items) {
          projects = response.data.items;
        } else if (Array.isArray(response.data)) {
          projects = response.data;
        }
        
        return {
          success: true,
          data: projects
        };
      }
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

  async uploadFile(clientId, fileData) {
    try {
      const formData = new FormData()
      formData.append('file', fileData.file)
      formData.append('project_id', fileData.project_id)
      formData.append('description', fileData.description || '')
      
      const response = await this.api.post(`/api/agent/clients/${clientId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors du téléchargement du fichier' }
    }
  }

  async deleteFile(fileId) {
    try {
      await this.api.delete(`/api/agent/files/${fileId}`)
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la suppression du fichier' }
    }
  }

  async downloadFile(fileId) {
    try {
      const response = await this.api.get(`/api/agent/files/${fileId}/download`, {
        responseType: 'blob'
      })
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      
      // Extraire le nom du fichier depuis les headers
      const contentDisposition = response.headers['content-disposition']
      let filename = 'download'
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      return { success: true }
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors du téléchargement du fichier' }
    }
  }

  // Gestion de l'équipe
  async getTeamMembers(clientId) {
    try {
      const response = await this.api.get(`/api/agent/clients/${clientId}/team`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la récupération des membres de l\'équipe:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des membres de l\'équipe' }
    }
  }

  async getAvailableProviders() {
    try {
      const response = await this.api.get('/api/agent/providers/available')
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la récupération des prestataires disponibles:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des prestataires disponibles' }
    }
  }

  // Méthode pour récupérer les clients assignés (compatibilité avec clientManagementService)
  async getAssignedClients() {
    try {
      // Ajouter des headers pour forcer le rafraîchissement et éviter le cache
      const response = await this.api.get('/api/agent/assigned-clients', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        // Ajouter un timestamp pour forcer une nouvelle requête
        params: {
          _t: Date.now()
        }
      });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('Erreur lors de la récupération des clients assignés:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async inviteProvider(clientId, providerData) {
    try {
      const response = await this.api.post(`/api/agent/clients/${clientId}/team/invite`, providerData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de l\'invitation du prestataire:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de l\'invitation du prestataire' }
    }
  }

  async removeMember(memberId) {
    try {
      await this.api.delete(`/api/agent/team/members/${memberId}`)
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la suppression du membre:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la suppression du membre' }
    }
  }

  async updateMemberRole(memberId, newRole) {
    try {
      const response = await this.api.put(`/api/agent/team/members/${memberId}/role`, { role: newRole })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la mise à jour du rôle' }
    }
  }

  async updateMemberPermissions(memberId, permissions) {
    try {
      const response = await this.api.put(`/api/agent/team/members/${memberId}/permissions`, { permissions })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des permissions:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la mise à jour des permissions' }
    }
  }

  // Méthodes pour la gestion des événements
  async createEventAdvanced(projectId, eventData) {
    try {
      const response = await this.api.post(`/api/agent/projects/${projectId}/events`, eventData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la création de l\'événement' }
    }
  }

  async updateEventAdvanced(projectId, eventId, eventData) {
    try {
      const response = await this.api.put(`/api/agent/projects/${projectId}/events/${eventId}`, eventData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'événement:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la mise à jour de l\'événement' }
    }
  }

  async deleteEventAdvanced(projectId, eventId) {
    try {
      await this.api.delete(`/api/agent/projects/${projectId}/events/${eventId}`)
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la suppression de l\'événement' }
    }
  }

  async getEventsAdvanced(projectId) {
    try {
      const response = await api.get(`/api/agent/projects/${projectId}/events`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des événements' }
    }
  }

  // Gestion du calendrier
  async getEvents(clientId) {
    try {
      const response = await api.get(`/api/agent/clients/${clientId}/events`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des événements' }
    }
  }

  async createEvent(clientId, eventData) {
    try {
      const response = await api.post(`/api/agent/clients/${clientId}/events`, eventData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la création de l\'événement' }
    }
  }

  async updateEvent(eventId, eventData) {
    try {
      const response = await api.put(`/api/agent/events/${eventId}`, eventData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'événement:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la mise à jour de l\'événement' }
    }
  }

  async deleteEvent(eventId) {
    try {
      await api.delete(`/api/agent/events/${eventId}`)
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la suppression de l\'événement' }
    }
  }

  // Rapports et statistiques
  async getProjectStats(clientId) {
    try {
      const response = await api.get(`/api/agent/clients/${clientId}/stats`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des statistiques' }
    }
  }

  async generateReport(clientId, reportType, dateRange) {
    try {
      const response = await api.post(`/api/agent/clients/${clientId}/reports`, {
        type: reportType,
        date_range: dateRange
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la génération du rapport' }
    }
  }

  // Notifications
  async getNotifications(projectId) {
    try {
      const response = await api.get(`/projects/${projectId}/notifications`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la récupération des notifications' }
    }
  }

  async markNotificationAsRead(projectId, notificationId) {
    try {
      const response = await api.put(`/projects/${projectId}/notifications/${notificationId}/read`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors du marquage de la notification' }
    }
  }

  // Méthodes pour les rapports avancés
  async generateAdvancedReport(projectId, reportConfig) {
    try {
      const response = await api.post(`/projects/${projectId}/reports/generate`, reportConfig)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la génération du rapport' }
    }
  }

  async exportAdvancedProjectData(projectId, format = 'pdf') {
    try {
      const response = await api.get(`/projects/${projectId}/export`, {
        params: { format },
        responseType: 'blob'
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de l\'export' }
    }
  }

  // Méthodes pour la recherche d'utilisateurs
  async searchUsers(query) {
    try {
      const response = await api.get('/users/search', {
        params: { q: query }
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error)
      return { success: false, error: error.response?.data?.message || 'Erreur lors de la recherche d\'utilisateurs' }
    }
  }
}

const projectManagementService = new ProjectManagementService()

// Export pour compatibilité avec clientProjectService
export const clientProjectService = projectManagementService;

export { projectManagementService }
export default projectManagementService