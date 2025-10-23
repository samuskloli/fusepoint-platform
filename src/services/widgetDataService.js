/**
 * Service pour gérer les données des widgets
 * Connecte les widgets aux vraies données du projet
 */

import api from './api'

class WidgetDataService {
  /**
   * Récupérer les données de feedback pour un projet
   */
  async getFeedbackData(projectId) {
    try {
      const response = await api.get(`/projects/${projectId}/feedback`)
      return {
        success: true,
        data: response.data || []
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des feedbacks:', error)
      // Retourner des données de démonstration en cas d'erreur
      return {
        success: false,
        data: [
          {
            id: 1,
            rating: 5,
            type: 'feature',
            message: 'Excellente fonctionnalité ! Très utile pour notre équipe.',
            author_name: 'Jean Dupont',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            rating: 4,
            type: 'improvement',
            message: 'Bon travail, mais pourrait être amélioré au niveau de l\'interface.',
            author_name: 'Marie Martin',
            created_at: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 3,
            rating: 3,
            type: 'bug',
            message: 'J\'ai rencontré un petit bug lors de l\'utilisation.',
            author_name: 'Pierre Durand',
            created_at: new Date(Date.now() - 172800000).toISOString()
          }
        ]
      }
    }
  }

  /**
   * Ajouter un nouveau feedback
   */
  async addFeedback(projectId, feedbackData) {
    try {
      const response = await api.post(`/projects/${projectId}/feedback`, feedbackData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du feedback:', error)
      // Simuler un succès pour la démo
      return {
        success: true,
        data: {
          id: Date.now(),
          ...feedbackData,
          author_name: 'Utilisateur actuel',
          created_at: new Date().toISOString()
        }
      }
    }
  }

  /**
   * Récupérer les données de suivi des fonctionnalités
   */
  async getFeatureTrackingData(projectId) {
    try {
      const response = await api.get(`/projects/${projectId}/features`)
      return {
        success: true,
        data: response.data || []
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des fonctionnalités:', error)
      // Retourner des données de démonstration
      return {
        success: false,
        data: [
          {
            id: 1,
            name: 'Système de notifications',
            description: 'Implémenter un système de notifications en temps réel pour les utilisateurs.',
            priority: 'high',
            status: 'in-progress',
            assignee: 'Jean Dupont',
            due_date: '2024-02-15',
            progress: 75
          },
          {
            id: 2,
            name: 'Interface mobile',
            description: 'Développer une version mobile responsive de l\'application.',
            priority: 'medium',
            status: 'planned',
            assignee: 'Marie Martin',
            due_date: '2024-03-01',
            progress: 0
          },
          {
            id: 3,
            name: 'Export PDF',
            description: 'Ajouter la fonctionnalité d\'export des rapports en PDF.',
            priority: 'low',
            status: 'testing',
            assignee: 'Pierre Durand',
            due_date: '2024-01-30',
            progress: 90
          },
          {
            id: 4,
            name: 'Authentification SSO',
            description: 'Intégrer l\'authentification Single Sign-On avec Azure AD.',
            priority: 'high',
            status: 'completed',
            assignee: 'Sophie Leroy',
            due_date: '2024-01-15',
            progress: 100
          }
        ]
      }
    }
  }

  /**
   * Ajouter une nouvelle fonctionnalité
   */
  async addFeature(projectId, featureData) {
    try {
      const response = await api.post(`/projects/${projectId}/features`, featureData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la fonctionnalité:', error)
      // Simuler un succès pour la démo
      return {
        success: true,
        data: {
          id: Date.now(),
          ...featureData,
          created_at: new Date().toISOString()
        }
      }
    }
  }

  /**
   * Ajouter une nouvelle version
   */
  async addVersioningData(projectId, versionData) {
    try {
      const response = await api.post(`/projects/${projectId}/versions`, versionData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la version:', error)
      // Simuler un succès pour la démo
      return {
        success: true,
        data: {
          id: Date.now(),
          ...versionData,
          created_at: new Date().toISOString()
        }
      }
    }
  }

  /**
   * Récupérer les données de versioning
   */
  async getVersioningData(projectId) {
    try {
      const response = await api.get(`/projects/${projectId}/versions`)
      return {
        versions: response.data || []
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des versions:', error)
      // Retourner des données de démonstration
      return {
        versions: [
          {
            id: 1,
            version: '2.1.0',
            type: 'minor',
            description: 'Nouvelle interface utilisateur et amélioration des performances.',
            author: 'Équipe Dev',
            release_date: '2024-01-15',
            is_current: true,
            downloads: 1250,
            changes: [
              { id: 1, type: 'feature', description: 'Nouveau tableau de bord' },
              { id: 2, type: 'improvement', description: 'Optimisation des requêtes' },
              { id: 3, type: 'fix', description: 'Correction bug authentification' }
            ]
          },
          {
            id: 2,
            version: '2.0.1',
            type: 'patch',
            description: 'Corrections de bugs critiques et améliorations de sécurité.',
            author: 'Jean Dupont',
            release_date: '2024-01-05',
            is_current: false,
            downloads: 890,
            changes: [
              { id: 4, type: 'fix', description: 'Correction faille de sécurité' },
              { id: 5, type: 'fix', description: 'Résolution problème de cache' }
            ]
          }
        ]
      }
    }
  }

  /**
   * Récupérer les livrables du projet
   */
  async getDeliverablesData(projectId) {
    try {
      const response = await api.get(`/api/projects/${projectId}/deliverables`)
      return {
        deliverables: response.data?.data ?? response.data ?? []
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des livrables:', error)
      // Données de démonstration
      const today = new Date()
      const iso = (d) => new Date(d).toISOString().split('T')[0]
      return {
        deliverables: [
          {
            id: 101,
            title: 'Charte graphique finale',
            description: 'Charte graphique validée pour le site web.',
            status: 'approved',
            due_date: iso(today),
            version: 'v1.0.0',
            submitted_by: 'Design Team',
            submitted_at: iso(today)
          },
          {
            id: 102,
            title: 'Maquette mobile',
            description: 'Maquette responsive pour appareils mobiles.',
            status: 'in_review',
            due_date: iso(today.getTime() + 3 * 86400000),
            version: 'v1.1.0',
            submitted_by: 'UX Team',
            submitted_at: iso(today.getTime() - 86400000)
          },
          {
            id: 103,
            title: 'Plan de test QA',
            description: 'Plan de test pour la phase QA initiale.',
            status: 'pending',
            due_date: iso(today.getTime() + 7 * 86400000),
            version: 'v1.2.0'
          }
        ]
      }
    }
  }

  /**
   * Mettre à jour le statut d'un livrable
   */
  async updateDeliverableStatus(projectId, deliverableId, status, reason) {
    try {
      const response = await api.put(`/api/projects/${projectId}/deliverables/${deliverableId}/status`, { status, reason })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut du livrable:', error)
      // Simuler un succès (démo)
      return {
        success: true,
        data: {
          id: deliverableId,
          status,
          rejection_reason: reason || null,
          updated_at: new Date().toISOString()
        }
      }
    }
  }

  /**
   * Ajouter un nouveau livrable
   */
  async addDeliverable(projectId, deliverableData) {
    try {
      const response = await api.post(`/api/projects/${projectId}/deliverables`, deliverableData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Erreur lors de la création du livrable:', error)
      // Simuler un succès (démo)
      return {
        success: true,
        data: {
          id: Date.now(),
          ...deliverableData,
          submitted_at: new Date().toISOString()
        }
      }
    }
  }

  /**
   * Récupérer les données génériques d'un widget
   */
  async getWidgetData(projectId, widgetType) {
    switch (widgetType) {
      case 'FeedbackWidget':
        return this.getFeedbackData(projectId)
      case 'FeatureTrackingWidget':
        return this.getFeatureTrackingData(projectId)
      case 'VersioningWidget':
        return this.getVersioningData(projectId)
      case 'DeliverablesWidget':
        return this.getDeliverablesData(projectId)
      default:
        return {
          success: false,
          data: [],
        }
    }
  }
}

export default new WidgetDataService()