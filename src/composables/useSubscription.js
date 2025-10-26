import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import adminAPI from '../services/adminAPI'

/**
 * Composable pour gérer le statut d'abonnement de l'utilisateur connecté
 */
export function useSubscription() {
  const authStore = useAuthStore()
  const isLoading = ref(false)
  const error = ref(null)

  // Getter pour le statut d'abonnement depuis le store auth
  const isPaid = computed(() => {
    return authStore.user?.isPaid || false
  })

  // Getter pour le statut d'abonnement en format texte
  const subscriptionStatus = computed(() => {
    return isPaid.value ? 'paid' : 'free'
  })

  // Getter pour vérifier si l'utilisateur a un abonnement payant
  const hasPaidSubscription = computed(() => {
    return isPaid.value === true
  })

  // Getter pour vérifier si l'utilisateur a un abonnement gratuit
  const hasFreeSubscription = computed(() => {
    return isPaid.value === false
  })

  /**
   * Rafraîchir le statut d'abonnement depuis le serveur
   */
  const refreshSubscriptionStatus = async () => {
    if (!authStore.user?.id) {
      console.warn('⚠️ Aucun utilisateur connecté pour rafraîchir le statut d\'abonnement')
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await adminAPI.getUserSubscriptionStatus(authStore.user.id)
      
      if (response && response.success !== undefined) {
        // Mettre à jour le statut dans le store auth
        if (authStore.user) {
          authStore.user.isPaid = response.isPaid
          
          // Mettre à jour également dans localStorage pour la persistance
          const userData = authStore.user
          localStorage.setItem('user', JSON.stringify(userData))
          
          console.log('✅ Statut d\'abonnement mis à jour:', response.isPaid ? 'payant' : 'gratuit')
          return true
        }
      }
      
      return false
    } catch (err) {
      console.error('❌ Erreur lors du rafraîchissement du statut d\'abonnement:', err)
      error.value = err.message || 'Erreur lors du rafraîchissement du statut d\'abonnement'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Mettre à jour le statut d'abonnement (pour les admins)
   */
  const updateSubscriptionStatus = async (userId, newIsPaid) => {
    if (!userId) {
      throw new Error('ID utilisateur requis')
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await adminAPI.updateUserSubscriptionStatus(userId, newIsPaid)
      
      if (response && response.success) {
        // Si c'est l'utilisateur connecté, mettre à jour le store
        if (userId === authStore.user?.id) {
          authStore.user.isPaid = newIsPaid
          
          // Mettre à jour également dans localStorage pour la persistance
          const userData = authStore.user
          localStorage.setItem('user', JSON.stringify(userData))
        }
        
        console.log('✅ Statut d\'abonnement mis à jour avec succès')
        return response
      }
      
      throw new Error('Réponse API invalide')
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour du statut d\'abonnement:', err)
      error.value = err.message || 'Erreur lors de la mise à jour du statut d\'abonnement'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // État
    isLoading,
    error,
    
    // Getters
    isPaid,
    subscriptionStatus,
    hasPaidSubscription,
    hasFreeSubscription,
    
    // Actions
    refreshSubscriptionStatus,
    updateSubscriptionStatus
  }
}