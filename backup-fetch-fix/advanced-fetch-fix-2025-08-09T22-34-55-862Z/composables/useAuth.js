import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import authService from '@/services/authService'
import { useNotifications } from '@/composables/useNotifications'
import { useRouter } from 'vue-router'

/**
 * Composable pour la gestion de l'authentification
 * Fournit une interface simple pour accéder aux fonctionnalités d'authentification
 */
export function useAuth() {
  const authStore = useAuthStore()
  const { success, error: showError } = useNotifications()
  const router = useRouter()

  // État réactif depuis le store
  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isLoading = computed(() => authStore.isLoading)
  const error = computed(() => authStore.error)
  const userRole = computed(() => authStore.userRole)
  const permissions = computed(() => authStore.permissions)

  // Méthodes d'authentification
  const login = async (credentials) => {
    try {
      const response = await authStore.login(credentials)
      if (response.success) {
        success('Connexion réussie')
        return response
      }
    } catch (err) {
      showError(err.message || 'Erreur de connexion')
      throw err
    }
  }

  const register = async (userData) => {
    try {
      const response = await authStore.register(userData)
      if (response.success) {
        success('Inscription réussie')
        return response
      }
    } catch (err) {
      showError(err.message || 'Erreur d\'inscription')
      throw err
    }
  }

  const logout = async () => {
    try {
      await authStore.logout()
      success('Déconnexion réussie')
      router.push('/login')
    } catch (err) {
      showError(err.message || 'Erreur de déconnexion')
    }
  }

  const refreshToken = async () => {
    try {
      return await authStore.refreshToken()
    } catch (err) {
      showError('Session expirée, veuillez vous reconnecter')
      await logout()
      throw err
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await authStore.updateProfile(profileData)
      if (response.success) {
        success('Profil mis à jour')
        return response
      }
    } catch (err) {
      showError(err.message || 'Erreur de mise à jour du profil')
      throw err
    }
  }

  const changePassword = async (passwordData) => {
    try {
      const response = await authService.changePassword(passwordData)
      if (response.success) {
        success('Mot de passe modifié avec succès')
        return response
      }
    } catch (err) {
      showError(err.message || 'Erreur de modification du mot de passe')
      throw err
    }
  }

  const forgotPassword = async (email) => {
    try {
      const response = await authService.forgotPassword(email)
      if (response.success) {
        success('Email de réinitialisation envoyé')
        return response
      }
    } catch (err) {
      showError(err.message || 'Erreur d\'envoi de l\'email')
      throw err
    }
  }

  const resetPassword = async (resetData) => {
    try {
      const response = await authService.resetPassword(resetData)
      if (response.success) {
        success('Mot de passe réinitialisé avec succès')
        return response
      }
    } catch (err) {
      showError(err.message || 'Erreur de réinitialisation du mot de passe')
      throw err
    }
  }

  // Vérifications de permissions
  const hasPermission = (permission) => {
    if (!isAuthenticated.value) return false
    const userPermissions = permissions.value || []
    return userPermissions.includes(permission)
  }

  const hasRole = (role) => {
    if (!isAuthenticated.value) return false
    return userRole.value === role
  }

  const hasAnyRole = (roles) => {
    if (!isAuthenticated.value) return false
    return roles.includes(userRole.value)
  }

  const canAccess = (requiredPermissions = [], requiredRoles = []) => {
    if (!isAuthenticated.value) return false
    
    // Vérifier les permissions
    if (requiredPermissions.length > 0) {
      const hasRequiredPermission = requiredPermissions.some(permission => 
        hasPermission(permission)
      )
      if (!hasRequiredPermission) return false
    }
    
    // Vérifier les rôles
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.includes(userRole.value)
      if (!hasRequiredRole) return false
    }
    
    return true
  }

  // Vérifications spécifiques aux projets
  const canManageProject = (projectId) => {
    return hasPermission('project.manage') || 
           hasPermission(`project.${projectId}.manage`) ||
           hasRole('admin')
  }

  const canViewProject = (projectId) => {
    return hasPermission('project.view') || 
           hasPermission(`project.${projectId}.view`) ||
           canManageProject(projectId)
  }

  const canEditProject = (projectId) => {
    return hasPermission('project.edit') || 
           hasPermission(`project.${projectId}.edit`) ||
           canManageProject(projectId)
  }

  const canDeleteProject = (projectId) => {
    return hasPermission('project.delete') || 
           hasPermission(`project.${projectId}.delete`) ||
           hasRole('admin')
  }

  // Vérifications spécifiques aux membres
  const canManageMembers = () => {
    return hasPermission('members.manage') || hasRole('admin')
  }

  const canInviteMembers = () => {
    return hasPermission('members.invite') || canManageMembers()
  }

  const canEditMember = (memberId) => {
    return hasPermission('members.edit') || 
           hasPermission(`member.${memberId}.edit`) ||
           canManageMembers() ||
           user.value?.id === memberId // Peut éditer son propre profil
  }

  const canDeleteMember = (memberId) => {
    return hasPermission('members.delete') || 
           hasPermission(`member.${memberId}.delete`) ||
           hasRole('admin')
  }

  // Vérifications spécifiques aux tâches
  const canCreateTask = () => {
    return hasPermission('tasks.create') || hasRole('admin')
  }

  const canAssignTask = () => {
    return hasPermission('tasks.assign') || hasRole('admin')
  }

  const canEditTask = (taskId) => {
    return hasPermission('tasks.edit') || 
           hasPermission(`task.${taskId}.edit`) ||
           hasRole('admin')
  }

  const canDeleteTask = (taskId) => {
    return hasPermission('tasks.delete') || 
           hasPermission(`task.${taskId}.delete`) ||
           hasRole('admin')
  }

  // Vérifications spécifiques aux fichiers
  const canUploadFiles = () => {
    return hasPermission('files.upload') || hasRole('admin')
  }

  const canDownloadFiles = () => {
    return hasPermission('files.download') || hasRole('admin')
  }

  const canShareFiles = () => {
    return hasPermission('files.share') || hasRole('admin')
  }

  const canDeleteFiles = () => {
    return hasPermission('files.delete') || hasRole('admin')
  }

  // Utilitaires
  const getUserInfo = () => {
    return {
      id: user.value?.id,
      name: user.value?.name,
      email: user.value?.email,
      role: userRole.value,
      permissions: permissions.value,
      avatar: user.value?.avatar
    }
  }

  const isAdmin = computed(() => hasRole('admin'))
  const isManager = computed(() => hasRole('manager'))
  const isMember = computed(() => hasRole('member'))
  const isGuest = computed(() => hasRole('guest'))

  return {
    // État
    user,
    isAuthenticated,
    isLoading,
    error,
    userRole,
    permissions,
    
    // Méthodes d'authentification
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    
    // Vérifications de permissions générales
    hasPermission,
    hasRole,
    hasAnyRole,
    canAccess,
    
    // Vérifications spécifiques aux projets
    canManageProject,
    canViewProject,
    canEditProject,
    canDeleteProject,
    
    // Vérifications spécifiques aux membres
    canManageMembers,
    canInviteMembers,
    canEditMember,
    canDeleteMember,
    
    // Vérifications spécifiques aux tâches
    canCreateTask,
    canAssignTask,
    canEditTask,
    canDeleteTask,
    
    // Vérifications spécifiques aux fichiers
    canUploadFiles,
    canDownloadFiles,
    canShareFiles,
    canDeleteFiles,
    
    // Utilitaires
    getUserInfo,
    isAdmin,
    isManager,
    isMember,
    isGuest
  }
}

export default useAuth