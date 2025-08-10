import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import projectManagementService, { clientProjectService } from '../services/projectManagementService'

/**
 * Store de gestion des projets utilisant Pinia
 * Gère l'état des projets et leur persistance lors du rafraîchissement
 */
export const useProjectsStore = defineStore('projects', () => {
  // État réactif
  const assignedClients = ref([])
  const agentProjects = ref([])
  const clientProjects = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const lastUpdated = ref(null)

  // Getters calculés
  const totalProjects = computed(() => {
    return agentProjects.value.length
  })

  const activeProjects = computed(() => {
    return agentProjects.value.filter(project => project.status === 'active')
  })

  const completedProjects = computed(() => {
    return agentProjects.value.filter(project => project.status === 'completed')
  })

  const projectsByClient = computed(() => {
    const grouped = {}
    agentProjects.value.forEach(project => {
      if (!grouped[project.client_id]) {
        grouped[project.client_id] = []
      }
      grouped[project.client_id].push(project)
    })
    return grouped
  })

  // Actions
  const loadAssignedClients = async (forceRefresh = false) => {
    console.log('🔍 DEBUG - loadAssignedClients appelé avec forceRefresh:', forceRefresh)
    console.log('🔍 DEBUG - assignedClients.value.length:', assignedClients.value.length)
    console.log('🔍 DEBUG - lastUpdated.value:', lastUpdated.value)
    
    // Si les données sont récentes et qu'on ne force pas le rafraîchissement, les retourner
    if (!forceRefresh && assignedClients.value.length > 0 && lastUpdated.value) {
      const timeDiff = Date.now() - lastUpdated.value
      console.log('🔍 DEBUG - timeDiff:', timeDiff, 'ms')
      // Cache valide pendant 5 minutes
      if (timeDiff < 5 * 60 * 1000) {
        console.log('📦 Utilisation du cache pour les clients assignés')
        return { success: true, data: assignedClients.value }
      }
    }

    try {
      isLoading.value = true
      error.value = null
      
      console.log('🔄 Chargement des clients assignés...')
      console.log('🔍 DEBUG - Appel de projectManagementService.getAssignedClients()')
      
      // Récupérer les clients assignés à l'agent
      const clientsResponse = await projectManagementService.getAssignedClients()
      console.log('🔍 DEBUG - Réponse de getAssignedClients:', {
        success: clientsResponse.success,
        dataType: typeof clientsResponse.data,
        dataLength: Array.isArray(clientsResponse.data) ? clientsResponse.data.length : 'N/A',
        data: clientsResponse.data
      })
      
      if (clientsResponse.success) {
        assignedClients.value = Array.isArray(clientsResponse.data) ? clientsResponse.data : []
        console.log('🔍 DEBUG - assignedClients.value après assignation:', assignedClients.value)
        
        // Calculer les statistiques pour chaque client
        for (const client of assignedClients.value) {
          console.log(`🔍 DEBUG - Traitement du client ${client.id}: ${client.first_name} ${client.last_name}`)
          try {
            const projectsResponse = await clientProjectService.getClientProjects(client.id)
            console.log(`🔍 DEBUG - Projets pour client ${client.id}:`, projectsResponse)
            
            if (projectsResponse.success && Array.isArray(projectsResponse.data)) {
              client.projects = projectsResponse.data
              client.totalProjects = projectsResponse.data.length
              client.activeProjects = projectsResponse.data.filter(p => p.status === 'active').length
              client.completedProjects = projectsResponse.data.filter(p => p.status === 'completed').length
              
              // Ajouter les projets à la liste globale des projets de l'agent
              projectsResponse.data.forEach(project => {
                project.client_id = client.id
                project.client_name = `${client.first_name} ${client.last_name}`
                project.client_company = client.company_name
              })
              
              // Mettre à jour la liste des projets de l'agent
              const existingProjectIds = agentProjects.value.map(p => p.id)
              const newProjects = projectsResponse.data.filter(p => !existingProjectIds.includes(p.id))
              agentProjects.value.push(...newProjects)
            } else {
              client.projects = []
              client.totalProjects = 0
              client.activeProjects = 0
              client.completedProjects = 0
            }
          } catch (projectError) {
            console.error(`❌ Erreur lors du chargement des projets pour le client ${client.id}:`, projectError)
            client.projects = []
            client.totalProjects = 0
            client.activeProjects = 0
            client.completedProjects = 0
          }
        }
        
        lastUpdated.value = Date.now()
        console.log('✅ Clients assignés chargés avec succès:', assignedClients.value.length)
        console.log('🔍 DEBUG - Données finales assignedClients.value:', assignedClients.value)
        return { success: true, data: assignedClients.value }
      } else {
        console.error('❌ Échec de getAssignedClients:', clientsResponse)
        throw new Error(clientsResponse.message || 'Erreur lors du chargement des clients')
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des clients assignés:', err)
      error.value = err.message || 'Erreur lors du chargement des clients'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const loadAgentProjects = async (forceRefresh = false) => {
    // Si les données sont récentes et qu'on ne force pas le rafraîchissement, les retourner
    if (!forceRefresh && agentProjects.value.length > 0 && lastUpdated.value) {
      const timeDiff = Date.now() - lastUpdated.value
      // Cache valide pendant 5 minutes
      if (timeDiff < 5 * 60 * 1000) {
        console.log('📦 Utilisation du cache pour les projets de l\'agent')
        return { success: true, data: agentProjects.value }
      }
    }

    try {
      isLoading.value = true
      error.value = null
      
      console.log('🔄 Chargement des projets de l\'agent...')
      
      const response = await clientProjectService.getAgentProjects()
      if (response.success) {
        agentProjects.value = Array.isArray(response.data) ? response.data : []
        lastUpdated.value = Date.now()
        console.log('✅ Projets de l\'agent chargés avec succès:', agentProjects.value.length)
        return { success: true, data: agentProjects.value }
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des projets')
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des projets de l\'agent:', err)
      error.value = err.message || 'Erreur lors du chargement des projets'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const loadClientProjects = async (clientId, forceRefresh = false) => {
    try {
      isLoading.value = true
      error.value = null
      
      console.log(`🔄 Chargement des projets pour le client ${clientId}...`)
      
      const response = await clientProjectService.getClientProjects(clientId)
      if (response.success) {
        const projects = Array.isArray(response.data) ? response.data : []
        
        // Mettre à jour le cache des projets clients
        const existingIndex = clientProjects.value.findIndex(cp => cp.clientId === clientId)
        if (existingIndex !== -1) {
          clientProjects.value[existingIndex] = { clientId, projects, lastUpdated: Date.now() }
        } else {
          clientProjects.value.push({ clientId, projects, lastUpdated: Date.now() })
        }
        
        console.log(`✅ Projets du client ${clientId} chargés avec succès:`, projects.length)
        return { success: true, data: projects }
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des projets du client')
      }
    } catch (err) {
      console.error(`❌ Erreur lors du chargement des projets du client ${clientId}:`, err)
      error.value = err.message || 'Erreur lors du chargement des projets du client'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const addProject = (project) => {
    agentProjects.value.push(project)
    
    // Mettre à jour aussi dans les clients assignés si applicable
    const client = assignedClients.value.find(c => c.id === project.client_id)
    if (client && client.projects) {
      client.projects.push(project)
      client.totalProjects = client.projects.length
      client.activeProjects = client.projects.filter(p => p.status === 'active').length
      client.completedProjects = client.projects.filter(p => p.status === 'completed').length
    }
  }

  const updateProject = (updatedProject) => {
    const index = agentProjects.value.findIndex(p => p.id === updatedProject.id)
    if (index !== -1) {
      agentProjects.value[index] = updatedProject
    }
    
    // Mettre à jour aussi dans les clients assignés si applicable
    const client = assignedClients.value.find(c => c.id === updatedProject.client_id)
    if (client && client.projects) {
      const projectIndex = client.projects.findIndex(p => p.id === updatedProject.id)
      if (projectIndex !== -1) {
        client.projects[projectIndex] = updatedProject
        client.activeProjects = client.projects.filter(p => p.status === 'active').length
        client.completedProjects = client.projects.filter(p => p.status === 'completed').length
      }
    }
  }

  const removeProject = (projectId) => {
    const projectIndex = agentProjects.value.findIndex(p => p.id === projectId)
    if (projectIndex !== -1) {
      const project = agentProjects.value[projectIndex]
      agentProjects.value.splice(projectIndex, 1)
      
      // Mettre à jour aussi dans les clients assignés si applicable
      const client = assignedClients.value.find(c => c.id === project.client_id)
      if (client && client.projects) {
        const clientProjectIndex = client.projects.findIndex(p => p.id === projectId)
        if (clientProjectIndex !== -1) {
          client.projects.splice(clientProjectIndex, 1)
          client.totalProjects = client.projects.length
          client.activeProjects = client.projects.filter(p => p.status === 'active').length
          client.completedProjects = client.projects.filter(p => p.status === 'completed').length
        }
      }
    }
  }

  const clearCache = () => {
    assignedClients.value = []
    agentProjects.value = []
    clientProjects.value = []
    lastUpdated.value = null
    error.value = null
    console.log('🗑️ Cache des projets vidé')
  }

  const refreshData = async () => {
    console.log('🔄 Rafraîchissement forcé des données...')
    clearCache()
    await loadAssignedClients(true)
  }

  return {
    // État
    assignedClients,
    agentProjects,
    clientProjects,
    isLoading,
    error,
    lastUpdated,
    
    // Getters
    totalProjects,
    activeProjects,
    completedProjects,
    projectsByClient,
    
    // Actions
    loadAssignedClients,
    loadAgentProjects,
    loadClientProjects,
    addProject,
    updateProject,
    removeProject,
    clearCache,
    refreshData
  }
})