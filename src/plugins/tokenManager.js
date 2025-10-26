import tokenManager from '../services/tokenManager.js'

export default {
  install(app) {
    // Rendre le gestionnaire de tokens disponible globalement
    app.config.globalProperties.$tokenManager = tokenManager
    
    // Initialiser le gestionnaire avec les tokens existants
    tokenManager.init()
    
    console.log('🔧 Plugin TokenManager installé')
  }
}