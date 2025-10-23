// Service pour la gestion du suivi des fonctionnalités
import type { Feature, FeatureResponse } from '../types'

class FeatureTrackingService {
  private baseUrl = '/api/features'

  // Données de démonstration
  private demoFeatures: Feature[] = [
    {
      id: 1,
      name: 'Système d\'authentification',
      description: 'Implémentation du système de connexion et d\'inscription',
      priority: 'high',
      status: 'completed',
      assignee: 'Jean Dupont',
      due_date: '2024-01-15',
      progress: 100,
      created_at: '2024-01-01',
      updated_at: '2024-01-15'
    },
    {
      id: 2,
      name: 'Dashboard utilisateur',
      description: 'Interface principale pour les utilisateurs connectés',
      priority: 'high',
      status: 'in-progress',
      assignee: 'Marie Martin',
      due_date: '2024-02-01',
      progress: 75,
      created_at: '2024-01-10',
      updated_at: '2024-01-25'
    },
    {
      id: 3,
      name: 'Notifications push',
      description: 'Système de notifications en temps réel',
      priority: 'medium',
      status: 'planned',
      assignee: 'Pierre Durand',
      due_date: '2024-02-15',
      progress: 0,
      created_at: '2024-01-20',
      updated_at: '2024-01-20'
    },
    {
      id: 4,
      name: 'API mobile',
      description: 'Développement de l\'API pour l\'application mobile',
      priority: 'medium',
      status: 'testing',
      assignee: 'Sophie Leroy',
      due_date: '2024-02-10',
      progress: 90,
      created_at: '2024-01-05',
      updated_at: '2024-01-28'
    },
    {
      id: 5,
      name: 'Optimisation performances',
      description: 'Amélioration des temps de chargement',
      priority: 'low',
      status: 'planned',
      assignee: 'Luc Bernard',
      due_date: '2024-03-01',
      progress: 0,
      created_at: '2024-01-25',
      updated_at: '2024-01-25'
    }
  ]

  async getFeatures(projectId?: string): Promise<FeatureResponse> {
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Retourner les données de démonstration
      return {
        success: true,
        data: this.demoFeatures,
        message: 'Fonctionnalités chargées avec succès'
      }
    } catch (error) {
      console.error('Erreur lors du chargement des fonctionnalités:', error)
      return {
        success: false,
        data: [],
        message: 'Erreur lors du chargement des fonctionnalités'
      }
    }
  }

  async createFeature(feature: Omit<Feature, 'id' | 'created_at' | 'updated_at'>): Promise<FeatureResponse> {
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const newFeature: Feature = {
        ...feature,
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      this.demoFeatures.unshift(newFeature)
      
      return {
        success: true,
        data: [newFeature],
        message: 'Fonctionnalité créée avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la création de la fonctionnalité:', error)
      return {
        success: false,
        data: [],
        message: 'Erreur lors de la création de la fonctionnalité'
      }
    }
  }

  async updateFeature(id: number, updates: Partial<Feature>): Promise<FeatureResponse> {
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const featureIndex = this.demoFeatures.findIndex(f => f.id === id)
      if (featureIndex === -1) {
        return {
          success: false,
          data: [],
          message: 'Fonctionnalité non trouvée'
        }
      }
      
      this.demoFeatures[featureIndex] = {
        ...this.demoFeatures[featureIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      return {
        success: true,
        data: [this.demoFeatures[featureIndex]],
        message: 'Fonctionnalité mise à jour avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la fonctionnalité:', error)
      return {
        success: false,
        data: [],
        message: 'Erreur lors de la mise à jour de la fonctionnalité'
      }
    }
  }

  async deleteFeature(id: number): Promise<FeatureResponse> {
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const featureIndex = this.demoFeatures.findIndex(f => f.id === id)
      if (featureIndex === -1) {
        return {
          success: false,
          data: [],
          message: 'Fonctionnalité non trouvée'
        }
      }
      
      this.demoFeatures.splice(featureIndex, 1)
      
      return {
        success: true,
        data: [],
        message: 'Fonctionnalité supprimée avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la fonctionnalité:', error)
      return {
        success: false,
        data: [],
        message: 'Erreur lors de la suppression de la fonctionnalité'
      }
    }
  }
}

export const featureTrackingService = new FeatureTrackingService()
export default featureTrackingService