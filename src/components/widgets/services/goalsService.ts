import type { Goal, GoalStatus, GoalPriority } from '../GoalsWidget.vue'

// Service simulé pour la gestion des objectifs
export const goalsService = {
  // Récupérer tous les objectifs
  async getGoals(): Promise<Goal[]> {
    // Simulation d'un appel API avec délai
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return [
      {
        id: '1',
        title: 'Augmenter le trafic web de 25%',
        description: 'Améliorer le référencement naturel et lancer une campagne de contenu pour augmenter le trafic organique du site web.',
        status: 'active' as GoalStatus,
        priority: 'high' as GoalPriority,
        progress: 65,
        deadline: '2024-03-15',
        assignee: {
          id: '1',
          name: 'Marie Dubois',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
        },
        tags: ['SEO', 'Marketing', 'Trafic'],
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-02-10T14:30:00Z'
      },
      {
        id: '2',
        title: 'Lancer la nouvelle campagne email',
        description: 'Créer et déployer une campagne email marketing pour promouvoir nos nouveaux produits.',
        status: 'active' as GoalStatus,
        priority: 'medium' as GoalPriority,
        progress: 30,
        deadline: '2024-02-28',
        assignee: {
          id: '2',
          name: 'Pierre Martin',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
        },
        tags: ['Email', 'Marketing', 'Produits'],
        created_at: '2024-01-20T09:15:00Z',
        updated_at: '2024-02-05T11:45:00Z'
      },
      {
        id: '3',
        title: 'Optimiser le taux de conversion',
        description: 'Analyser le parcours utilisateur et optimiser les pages de destination pour améliorer le taux de conversion.',
        status: 'completed' as GoalStatus,
        priority: 'high' as GoalPriority,
        progress: 100,
        deadline: '2024-01-31',
        assignee: {
          id: '3',
          name: 'Sophie Laurent',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
        },
        tags: ['Conversion', 'UX', 'Analytics'],
        created_at: '2024-01-01T08:00:00Z',
        updated_at: '2024-01-31T16:20:00Z'
      },
      {
        id: '4',
        title: 'Développer le programme de fidélité',
        description: 'Concevoir et implémenter un programme de fidélité pour retenir les clients existants.',
        status: 'paused' as GoalStatus,
        priority: 'low' as GoalPriority,
        progress: 15,
        deadline: '2024-04-30',
        assignee: {
          id: '4',
          name: 'Thomas Rousseau'
        },
        tags: ['Fidélité', 'Rétention', 'Programme'],
        created_at: '2024-01-10T13:30:00Z',
        updated_at: '2024-02-01T10:15:00Z'
      },
      {
        id: '5',
        title: 'Améliorer la présence sur les réseaux sociaux',
        description: 'Développer une stratégie de contenu pour augmenter l\'engagement sur les réseaux sociaux.',
        status: 'active' as GoalStatus,
        priority: 'medium' as GoalPriority,
        progress: 45,
        deadline: '2024-03-31',
        assignee: {
          id: '5',
          name: 'Emma Leroy',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face'
        },
        tags: ['Réseaux sociaux', 'Contenu', 'Engagement'],
        created_at: '2024-01-25T11:00:00Z',
        updated_at: '2024-02-12T15:45:00Z'
      }
    ]
  },

  // Créer un nouvel objectif
  async createGoal(goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal> {
    // Simulation d'un appel API avec délai
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    return newGoal
  },

  // Mettre à jour un objectif existant
  async updateGoal(id: string, goalData: Partial<Goal>): Promise<Goal> {
    // Simulation d'un appel API avec délai
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Récupérer l'objectif existant (simulation)
    const goals = await this.getGoals()
    const existingGoal = goals.find(goal => goal.id === id)
    
    if (!existingGoal) {
      throw new Error(`Goal with id ${id} not found`)
    }
    
    const updatedGoal: Goal = {
      ...existingGoal,
      ...goalData,
      id, // S'assurer que l'ID ne change pas
      updated_at: new Date().toISOString()
    }
    
    return updatedGoal
  },

  // Supprimer un objectif
  async deleteGoal(id: string): Promise<void> {
    // Simulation d'un appel API avec délai
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Dans une vraie application, cela ferait un appel API pour supprimer l'objectif
    console.log(`Goal with id ${id} deleted`)
  },

  // Dupliquer un objectif
  async duplicateGoal(id: string): Promise<Goal> {
    // Simulation d'un appel API avec délai
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Récupérer l'objectif existant
    const goals = await this.getGoals()
    const existingGoal = goals.find(goal => goal.id === id)
    
    if (!existingGoal) {
      throw new Error(`Goal with id ${id} not found`)
    }
    
    // Créer une copie avec un nouveau titre
    const duplicatedGoal: Goal = {
      ...existingGoal,
      id: Date.now().toString(),
      title: `${existingGoal.title} (Copie)`,
      status: 'active' as GoalStatus,
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    return duplicatedGoal
  },

  // Changer le statut d'un objectif
  async toggleGoalStatus(id: string): Promise<Goal> {
    // Simulation d'un appel API avec délai
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Récupérer l'objectif existant
    const goals = await this.getGoals()
    const existingGoal = goals.find(goal => goal.id === id)
    
    if (!existingGoal) {
      throw new Error(`Goal with id ${id} not found`)
    }
    
    // Basculer entre actif et terminé
    const newStatus: GoalStatus = existingGoal.status === 'completed' ? 'active' : 'completed'
    const newProgress = newStatus === 'completed' ? 100 : existingGoal.progress
    
    const updatedGoal: Goal = {
      ...existingGoal,
      status: newStatus,
      progress: newProgress,
      updated_at: new Date().toISOString()
    }
    
    return updatedGoal
  },

  // Archiver un objectif
  async archiveGoal(id: string): Promise<Goal> {
    // Simulation d'un appel API avec délai
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Récupérer l'objectif existant
    const goals = await this.getGoals()
    const existingGoal = goals.find(goal => goal.id === id)
    
    if (!existingGoal) {
      throw new Error(`Goal with id ${id} not found`)
    }
    
    const archivedGoal: Goal = {
      ...existingGoal,
      status: 'cancelled' as GoalStatus,
      updated_at: new Date().toISOString()
    }
    
    return archivedGoal
  }
}

// Export des types pour une utilisation externe
export type { Goal, GoalStatus, GoalPriority } from '../GoalsWidget.vue'