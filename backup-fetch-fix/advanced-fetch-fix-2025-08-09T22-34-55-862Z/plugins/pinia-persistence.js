/**
 * Plugin Pinia pour la persistance des données dans le localStorage
 * Permet de sauvegarder et restaurer automatiquement l'état des stores
 */

const STORAGE_KEY_PREFIX = 'fusepoint_store_'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function createPiniaPersistence() {
  return {
    key: 'pinia-persistence',
    
    // Fonction appelée après l'installation du plugin
    install(app, pinia) {
      // Ajouter la persistance à tous les stores
      pinia.use(({ store, options }) => {
        // Vérifier si le store doit être persisté
        if (options.persist !== false && store.$id) {
          const storageKey = `${STORAGE_KEY_PREFIX}${store.$id}`
          
          // Restaurer l'état depuis le localStorage au démarrage
          const savedState = loadFromStorage(storageKey)
          if (savedState) {
            console.log(`📦 Restauration du store ${store.$id} depuis le localStorage`)
            store.$patch(savedState)
          }
          
          // Sauvegarder l'état à chaque changement
          store.$subscribe((mutation, state) => {
            // Ne sauvegarder que certaines propriétés pour éviter de stocker des données sensibles
            const persistedState = getPersistedState(store.$id, state)
            if (persistedState) {
              saveToStorage(storageKey, persistedState)
            }
          })
          
          // Ajouter une méthode pour vider le cache
          store.clearPersistedData = () => {
            localStorage.removeItem(storageKey)
            console.log(`🗑️ Cache du store ${store.$id} vidé`)
          }
        }
      })
    }
  }
}

/**
 * Charger les données depuis le localStorage
 */
function loadFromStorage(key) {
  try {
    const item = localStorage.getItem(key)
    if (!item) return null
    
    const data = JSON.parse(item)
    
    // Vérifier si les données ne sont pas expirées
    if (data.timestamp && Date.now() - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(key)
      return null
    }
    
    return data.state
  } catch (error) {
    console.warn(`⚠️ Erreur lors du chargement du cache ${key}:`, error)
    localStorage.removeItem(key)
    return null
  }
}

/**
 * Sauvegarder les données dans le localStorage
 */
function saveToStorage(key, state) {
  try {
    const data = {
      state,
      timestamp: Date.now()
    }
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.warn(`⚠️ Erreur lors de la sauvegarde du cache ${key}:`, error)
  }
}

/**
 * Obtenir l'état à persister selon le store
 */
function getPersistedState(storeId, state) {
  switch (storeId) {
    case 'projects':
      return {
        assignedClients: state.assignedClients,
        agentProjects: state.agentProjects,
        clientProjects: state.clientProjects,
        lastUpdated: state.lastUpdated
      }
    
    case 'auth':
      // Ne pas persister les données sensibles d'authentification
      return null
    
    default:
      // Par défaut, persister tout l'état sauf les propriétés sensibles
      const { error, isLoading, ...persistedState } = state
      return persistedState
  }
}

/**
 * Nettoyer les données expirées du localStorage
 */
export function cleanExpiredCache() {
  const keys = Object.keys(localStorage)
  const expiredKeys = []
  
  keys.forEach(key => {
    if (key.startsWith(STORAGE_KEY_PREFIX)) {
      try {
        const item = localStorage.getItem(key)
        if (item) {
          const data = JSON.parse(item)
          if (data.timestamp && Date.now() - data.timestamp > CACHE_DURATION) {
            expiredKeys.push(key)
          }
        }
      } catch (error) {
        expiredKeys.push(key)
      }
    }
  })
  
  expiredKeys.forEach(key => {
    localStorage.removeItem(key)
  })
  
  if (expiredKeys.length > 0) {
    console.log(`🧹 ${expiredKeys.length} entrées de cache expirées supprimées`)
  }
}

// Nettoyer le cache expiré au démarrage
cleanExpiredCache()