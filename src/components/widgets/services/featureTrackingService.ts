// Service pour la gestion du suivi des fonctionnalités
import type { Feature, FeatureResponse } from '../types'

class FeatureTrackingService {
  private baseUrl = '/api/features'

  // Données de démonstration
  private getDemoFeatures(): Feature[] {
    const currentDate = new Date()
    const features = [
      {
        id: 1,
        name: 'Système d\'authentification',
        description: 'Implémentation du système de connexion et d\'inscription',
        priority: 'high' as const,
        status: 'completed' as const,
        assignee: 'Jean Dupont',
        due_date: '2024-01-15',
        created_at: '2024-01-01',
        updated_at: '2024-01-15'
      },
      {
        id: 2,
        name: 'Dashboard utilisateur',
        description: 'Interface principale pour les utilisateurs connectés',
        priority: 'high' as const,
        status: 'in-progress' as const,
        assignee: 'Marie Martin',
        due_date: '2024-02-01',
        created_at: '2024-01-10',
        updated_at: '2024-01-25'
      },
      {
        id: 3,
        name: 'Notifications push',
        description: 'Système de notifications en temps réel',
        priority: 'medium' as const,
        status: 'planned' as const,
        assignee: 'Pierre Durand',
        due_date: '2024-02-15',
        created_at: '2024-01-20',
        updated_at: '2024-01-20'
      },
      {
        id: 4,
        name: 'API mobile',
        description: 'Développement de l\'API pour l\'application mobile',
        priority: 'medium' as const,
        status: 'testing' as const,
        assignee: 'Sophie Leroy',
        due_date: '2024-02-10',
        created_at: '2024-01-05',
        updated_at: '2024-01-28'
      },
      {
        id: 5,
        name: 'Optimisation performances',
        description: 'Amélioration des temps de chargement',
        priority: 'low' as const,
        status: 'planned' as const,
        assignee: 'Luc Bernard',
        due_date: '2024-03-01',
        created_at: '2024-01-25',
        updated_at: '2024-01-25'
      }
    ]

    // Calculer la progression dynamiquement pour chaque fonctionnalité
    return features.map(feature => {
      let progress = 0
      
      switch (feature.status) {
        case 'completed':
          progress = 100
          break
        case 'testing':
          progress = Math.floor(Math.random() * 15) + 80 // 80-95%
          break
        case 'in-progress':
          // Calcul basé sur le temps écoulé
          const createdDate = new Date(feature.created_at)
          const dueDate = new Date(feature.due_date)
          const totalDuration = dueDate.getTime() - createdDate.getTime()
          const elapsedDuration = currentDate.getTime() - createdDate.getTime()
          
          if (totalDuration > 0) {
            const timeProgress = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100))
            
            // Ajuster selon la priorité
            if (feature.priority === 'high') {
              progress = Math.min(85, Math.max(30, timeProgress * 1.1))
            } else if (feature.priority === 'medium') {
              progress = Math.min(75, Math.max(20, timeProgress))
            } else {
              progress = Math.min(60, Math.max(10, timeProgress * 0.9))
            }
            
            // Ajouter une variation pour plus de réalisme
            const variation = (Math.random() - 0.5) * 20 // ±10%
            progress = Math.max(10, Math.min(85, progress + variation))
          } else {
            progress = Math.floor(Math.random() * 30) + 20 // 20-50%
          }
          break
        case 'planned':
          progress = 0
          break
        default:
          progress = 0
      }
      
      return {
        ...feature,
        progress: Math.round(progress)
      }
    })
  }

  async getFeatures(projectId?: string): Promise<FeatureResponse> {
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Retourner les données de démonstration avec progression dynamique
      return {
        success: true,
        data: this.getDemoFeatures(),
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
      
      // Calculer la progression initiale basée sur le statut
      let initialProgress = 0
      if (feature.status === 'completed') {
        initialProgress = 100
      } else if (feature.status === 'in-progress') {
        initialProgress = Math.floor(Math.random() * 30) + 10 // 10-40%
      } else if (feature.status === 'testing') {
        initialProgress = Math.floor(Math.random() * 15) + 80 // 80-95%
      }
      
      const newFeature: Feature = {
        ...feature,
        id: Date.now(),
        progress: initialProgress,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
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
      
      const features = this.getDemoFeatures()
      const featureIndex = features.findIndex((f: Feature) => f.id === id)
      if (featureIndex === -1) {
        return {
          success: false,
          data: [],
          message: 'Fonctionnalité non trouvée'
        }
      }
      
      // Si le statut change, recalculer la progression
      let updatedProgress = updates.progress
      if (updates.status && !updates.progress) {
        switch (updates.status) {
          case 'completed':
            updatedProgress = 100
            break
          case 'testing':
            updatedProgress = Math.floor(Math.random() * 15) + 80 // 80-95%
            break
          case 'in-progress':
            updatedProgress = Math.floor(Math.random() * 40) + 20 // 20-60%
            break
          case 'planned':
            updatedProgress = 0
            break
        }
      }
      
      const updatedFeature = {
        ...features[featureIndex],
        ...updates,
        progress: updatedProgress !== undefined ? updatedProgress : features[featureIndex].progress,
        updated_at: new Date().toISOString()
      }
      
      return {
        success: true,
        data: [updatedFeature],
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
      
      const features = this.getDemoFeatures()
      const featureIndex = features.findIndex((f: Feature) => f.id === id)
      if (featureIndex === -1) {
        return {
          success: false,
          data: [],
          message: 'Fonctionnalité non trouvée'
        }
      }
      
      // Note: Dans un vrai service, on supprimerait de la base de données
      // Ici on simule juste le succès de l'opération
      
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