import { createRouter, createWebHistory } from 'vue-router'
// Lazy-loaded in routes
// import Login from '../views/Login.vue'
// import Register from '../views/Register.vue'
// import ConfirmAccount from '../views/ConfirmAccount.vue'
// import SetPassword from '../views/SetPassword.vue'
// import ClientDashboard from '../views/ClientDashboard.vue'
// import LandingFusepoint from '../views/LandingFusepoint.vue'
// import LinkPointPublic from '../views/LinkPointPublic.vue'

// Store d'authentification
import { useAuthStore } from '../stores/auth.js'

// Middlewares d'authentification
import { requireAuth, requireGuest, initializeAuth } from '../middleware/auth.js'
import { requireAgent } from '../middleware/roleAuth.js'
import { requireSuperAdmin } from '../middleware/superAdminAuth.js'
import { requirePrestataire } from '../middleware/prestataireAuth.js'
import { requireAdmin, requireAdminOrAgent } from '../middleware/adminAuth.js'

// Import pour la gestion de la langue
import { getSavedLocale, setLocale } from '../plugins/i18n.js'

// Analytics
// import Analytics from '../views/Analytics/Analytics.vue'
// Pages Facebook et Instagram supprimées - utiliser MetaInsights à la place
// import MetaInsights from '../views/Analytics/MetaInsights.vue'

// Marketing
// import Marketing from '../views/Marketing/Marketing.vue'
// import Campaigns from '../views/Marketing/Campaigns.vue'
// import Emails from '../views/Marketing/Emails.vue'
// import Templates from '../views/Marketing/Templates.vue'

// Integrations
// import Integrations from '../views/Integrations/Integrations.vue'

// Team
// import Team from '../views/Team/Team.vue'

// Billing
// import Billing from '../views/Billing/Billing.vue'

// Reports
// import Reports from '../views/Reports/Reports.vue'

// Settings
// import Settings from '../views/Settings/Settings.vue'
// import UserSettings from '../views/UserSettings.vue'

// OAuth
// import OAuthCallback from '../views/OAuthCallback.vue'
// import FacebookCallback from '../views/FacebookCallback.vue'
// import InstagramCallback from '../views/InstagramCallback.vue'

// Accompagnement
// import ServiceCatalog from '../components/accompagnement/ServiceCatalog.vue'
// import AccompagnementDashboard from '../components/accompagnement/AccompagnementDashboard.vue'

// Agent Dashboard
// import AgentDashboard from '../views/AgentDashboard.vue'

// import AgentReports from '../views/AgentReports.vue'
// import AgentClients from '../views/AgentClients.vue'
// import ClientStatusDemo from '../views/ClientStatusDemo.vue'
// import AgentServiceRequests from '../views/AgentServiceRequests.vue'
// import AgentPrestataires from '../views/AgentPrestataires.vue'

// Super Admin Dashboard
// import SuperAdminDashboard from '../views/SuperAdminDashboard.vue'
// import SuperAdminBetaRequests from '../views/SuperAdminBetaRequests.vue'

// Admin Dashboard
// import Admin from '../views/Admin.vue'
// import AdminUsers from '../views/AdminUsers.vue'

// Prestataire
// import RegisterPrestataire from '../views/RegisterPrestataire.vue'
// import PrestataireDashboard from '../views/PrestataireDashboard.vue'

// Project Management
// import ProjectManagement from '../views/ProjectManagement.vue'

// Changelog
// import Changelog from '../views/Changelog.vue'

// Test Chat
// import TestChat from '../views/TestChat.vue'
// import AuthDebug from '../views/AuthDebug.vue'
// import AuthDebugTemp from '../views/AuthDebugTemp.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: (to) => {
      // Vérifier l'authentification de manière synchrone
      const token = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');
      const expiresAt = localStorage.getItem('tokenExpiresAt');

      // Considérer expiré si horodatage manquant ou invalide
      let isExpired = true;
      if (expiresAt) {
        const expiryDate = new Date(expiresAt);
        isExpired = Number.isNaN(expiryDate.getTime()) || new Date() >= expiryDate;
      }

      if (token && user && !isExpired) {
        return '/dashboard';
      } else {
        return '/login';
      }
    }
  },
  {
    path: '/landing',
    name: 'LandingFusepoint',
    component: () => import('../views/LandingFusepoint.vue')
  },
  {
    path: '/l/:slug',
    name: 'LinkPointPublic',
    component: () => import('../views/LinkPointPublic.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    beforeEnter: requireGuest
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    beforeEnter: requireGuest
  },
  {
    path: '/confirm-account',
    name: 'ConfirmAccount',
    component: () => import('../views/ConfirmAccount.vue')
  },
  {
    path: '/set-password',
    name: 'SetPassword',
    component: () => import('../views/SetPassword.vue'),
    beforeEnter: requireGuest
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/ClientDashboard.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/linkpoints',
    name: 'LinkPoints',
    component: () => import('../views/LinkPoints.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/linkpoints/status',
    name: 'LinkPointsStatus',
    component: () => import('../views/LinkPointsStatus.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/actions/:id',
    name: 'ActionDetails',
    component: () => import('../views/ActionDetails.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/tasks/:id',
    name: 'TaskDetails', 
    component: () => import('../views/TaskDetails.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/projects',
    name: 'ClientProjectTracking',
    component: () => import('../views/ClientProjectTracking.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/projects/:id/:tab?',
    name: 'ProjectDetails',
    component: () => import('../views/ProjectDetailDashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/projects/:id/widgets/:type/:widgetId?',
    name: 'ProjectWidgetView',
    component: () => import('../views/ProjectWidgetView.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('../views/Analytics/Analytics.vue'),
    beforeEnter: requireAuth
  },

  // Routes Facebook et Instagram supprimées - utiliser /analytics/meta à la place
  {
    path: '/analytics/meta',
    name: 'MetaInsights',
    component: () => import('../views/Analytics/MetaInsights.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/marketing',
    name: 'Marketing',
    component: () => import('../views/Marketing/Marketing.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/marketing/campaigns',
    name: 'MarketingCampaigns',
    component: () => import('../views/Marketing/Campaigns.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/marketing/emails',
    name: 'Emails',
    component: () => import('../views/Marketing/Emails.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/marketing/templates',
    name: 'Templates',
    component: () => import('../views/Marketing/Templates.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/integrations',
    name: 'Integrations',
    component: () => import('../views/Integrations/Integrations.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/team',
    name: 'Team',
    component: () => import('../views/Team/Team.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/billing',
    name: 'Billing',
    component: () => import('../views/Billing/Billing.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../views/Reports/Reports.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings/Settings.vue'),
    beforeEnter: requireAuth
  },
  {
    // Page UserSettings supprimée, utiliser /settings
    path: '/user-settings',
    redirect: '/settings'
  },
  {
    path: '/oauth/callback',
    name: 'OAuthCallback',
    component: () => import('../views/OAuthCallback.vue')
  },
  {
    path: '/oauth/facebook/callback',
    name: 'FacebookCallback',
    component: () => import('../views/FacebookCallback.vue')
  },
  {
    path: '/oauth/instagram/callback',
    name: 'InstagramCallback',
    component: () => import('../views/InstagramCallback.vue')
  },


  {
    path: '/services',
    name: 'ServiceCatalog',
    component: () => import('../components/accompagnement/ServiceCatalog.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/accompagnement',
    name: 'AccompagnementDashboard',
    component: () => import('../components/accompagnement/AccompagnementDashboard.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/agent',
    name: 'AgentDashboard',
    component: () => import('../views/AgentDashboard.vue'),
    beforeEnter: requireAgent
  },

  {
    path: '/agent/reports',
    name: 'AgentReports',
    component: () => import('../views/AgentReports.vue'),
    beforeEnter: requireAgent
  },
  {
    path: '/agent/clients',
    name: 'AgentClients',
    component: () => import('../views/AgentClients.vue'),
    beforeEnter: requireAgent
  },
  {
    path: '/agent/status-demo',
    name: 'ClientStatusDemo',
    component: () => import('../views/ClientStatusDemo.vue'),
    beforeEnter: requireAgent
  },
  {
    path: '/agent/service-requests',
    name: 'AgentServiceRequests',
    component: () => import('../views/AgentServiceRequests.vue'),
    beforeEnter: requireAgent
  },
  {
    path: '/agent/widgets-library',
    name: 'WidgetsLibrary',
    component: () => import('../views/WidgetsLibrary.vue'),
    beforeEnter: requireAgent
  },
  {
      path: '/agent/projects',
      name: 'AgentProjects',
      component: () => import('../views/AgentProjects.vue'),
      beforeEnter: requireAgent
    },
    {
      path: '/agent/project-templates',
      name: 'ProjectTemplatesManagement',
      component: () => import('../views/ProjectTemplatesManagement.vue'),
      beforeEnter: requireAgent
    },
    {
      path: '/agent/clients/:clientId/dashboard',
      name: 'ClientProjectDashboard',
      component: () => import('../views/ClientProjectDashboard.vue'),
      beforeEnter: requireAgent
    },
    {
      path: '/agent/clients/:clientId/projects',
      name: 'ClientProjectManagement',
      component: () => import('../views/ProjectManagement.vue'),
      beforeEnter: requireAgent
    },
    {
      path: '/agent/clients/:clientId/projects/:projectId/:tab?',
      name: 'ProjectDetailDashboard',
      component: () => import('../views/ProjectDetailDashboard.vue'),
      meta: { requiresAuth: true, requiresAgent: true },
    },
    {
      path: '/agent/clients/:clientId/projects/:projectId/widgets/:type/:widgetId?',
      name: 'AgentProjectWidgetView',
      component: () => import('../views/ProjectWidgetView.vue'),
      beforeEnter: requireAgent
    },
  {
    path: '/agent/prestataires',
    name: 'AgentPrestataires',
    component: () => import('../views/AgentPrestataires.vue'),
    beforeEnter: requireAgent
  },
  {
    path: '/email',
    name: 'EmailMarketing',
    component: () => import('../views/Marketing/Emails.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/agent/chat',
    name: 'AgentChat',
    component: () => import('../views/AgentChat.vue'),
    beforeEnter: requireAgent
  },
  {
    path: '/agent/customization/themes',
    name: 'AgentThemes',
    component: () => import('../views/AgentCustomization/Themes.vue'),
    beforeEnter: requireAgent
  },
  {
    path: '/agent/customization/dashboard',
    name: 'AgentDashboardCustomization',
    component: () => import('../views/AgentCustomization/Dashboard.vue'),
    beforeEnter: requireAgent
  },
  {
    path: '/agent/customization/notifications',
    name: 'AgentNotifications',
    component: () => import('../views/AgentCustomization/Notifications.vue'),
    beforeEnter: requireAgent
  },
  {
    path: '/agent/customization/workflows',
    name: 'AgentWorkflows',
    component: () => import('../views/AgentCustomization/Workflows.vue'),
    beforeEnter: requireAgent
  },
  // Routes Admin (accessibles aux admin et super_admin)
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../views/Admin.vue'),
    beforeEnter: requireAdmin
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('../views/AdminUsers.vue'),
    beforeEnter: requireAdmin
  },
  {
    path: '/admin/widgets',
    name: 'AdminWidgetManagement',
    component: () => import('../views/Admin/WidgetManagement.vue'),
    beforeEnter: requireAdmin
  },
  {
    path: '/admin/agent-view',
    name: 'AdminAgentView',
    component: () => import('../views/AgentDashboard.vue'),
    beforeEnter: requireAdminOrAgent
  },
  // Route Management Services (admin ou agent)
  {
    path: '/management/services',
    name: 'ServicesManagement',
    component: () => import('../views/Management/ServicesManagement.vue'),
    beforeEnter: requireAdminOrAgent
  },
  // Routes Super Admin
  {
    path: '/super-admin',
    name: 'SuperAdminDashboard',
    component: () => import('../views/SuperAdminDashboard.vue'),
    beforeEnter: requireSuperAdmin
  },
  {
    path: '/super-admin/beta-requests',
    name: 'SuperAdminBetaRequests',
    component: () => import('../views/SuperAdminBetaRequests.vue'),
    beforeEnter: requireSuperAdmin
  },
  {
    path: '/super-admin/agent-view',
    name: 'SuperAdminAgentView',
    component: () => import('../views/AgentDashboard.vue'),
    beforeEnter: requireSuperAdmin
  },
  // Routes Prestataire
  {
    path: '/register-prestataire/:token',
    name: 'RegisterPrestataire',
    component: () => import('../views/RegisterPrestataire.vue'),
    beforeEnter: requireGuest
  },
  {
    path: '/prestataire/dashboard',
    name: 'PrestataireDashboard',
    component: () => import('../views/PrestataireDashboard.vue'),
    beforeEnter: requirePrestataire
  },
  // Route publique pour le changelog
  {
    path: '/changelog',
    name: 'Changelog',
    component: () => import('../views/Changelog.vue')
  },
  // Route de test pour le chat IA
  {
    path: '/test-chat',
    name: 'TestChat',
    component: () => import('../views/TestChat.vue')
  },
  // Route de test sécurité/sanitisation (publique)
  {
    path: '/security-test',
    name: 'SecurityTest',
    component: () => import('../views/SecurityTest.vue')
  },
  // Route de debug pour l'authentification
  {
    path: '/auth-debug',
    name: 'AuthDebug',
    component: () => import('../views/AuthDebug.vue')
  },
  {
    path: '/auth-debug-temp',
    name: 'AuthDebugTemp',
    component: () => import('../views/AuthDebugTemp.vue')
  },
  {
    path: '/install',
    name: 'Install',
    component: () => import('../views/Install.vue')
  }
]

const router = createRouter({
  history: createWebHistory('/app/'),
  routes
})

// Middleware global pour restaurer la langue sauvegardée
router.beforeEach((to, from, next) => {
  // Restaurer la langue sauvegardée à chaque navigation
  const savedLocale = getSavedLocale()
  if (savedLocale) {
    setLocale(savedLocale)
  }
  next()
})

// Middleware global d'authentification
router.beforeEach(initializeAuth)

// Mise à jour du titre de page et de la meta description après chaque navigation
router.afterEach((to) => {
  const baseTitle = 'Fusepoint'
  const metaTitle = to.meta && to.meta.title
  const routeName = typeof to.name === 'string' ? to.name : ''
  const pageTitle = metaTitle || routeName || baseTitle
  document.title = pageTitle ? `${pageTitle} · ${baseTitle}` : baseTitle

  const description = to.meta && to.meta.description
  if (description) {
    let tag = document.querySelector('meta[name="description"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('name', 'description')
      document.head.appendChild(tag)
    }
    tag.setAttribute('content', description)
  }
})

export default router