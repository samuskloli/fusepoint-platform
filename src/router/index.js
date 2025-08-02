import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ConfirmAccount from '../views/ConfirmAccount.vue'
import SetPassword from '../views/SetPassword.vue'
import ClientDashboard from '../views/ClientDashboard.vue'



// Middlewares d'authentification
import { requireAuth, requireGuest, initializeAuth } from '../middleware/auth.js'
import { requireAgent } from '../middleware/roleAuth.js'
import { requireSuperAdmin } from '../middleware/superAdminAuth.js'
import { requirePrestataire } from '../middleware/prestataireAuth.js'

// Analytics
import Analytics from '../views/Analytics/Analytics.vue'
// Pages Facebook et Instagram supprimées - utiliser MetaInsights à la place
import MetaInsights from '../views/Analytics/MetaInsights.vue'

// Marketing
import Marketing from '../views/Marketing/Marketing.vue'
import Campaigns from '../views/Marketing/Campaigns.vue'
import Emails from '../views/Marketing/Emails.vue'
import Templates from '../views/Marketing/Templates.vue'

// Integrations
import Integrations from '../views/Integrations/Integrations.vue'

// Team
import Team from '../views/Team/Team.vue'

// Billing
import Billing from '../views/Billing/Billing.vue'

// Reports
import Reports from '../views/Reports/Reports.vue'

// Settings
import Settings from '../views/Settings/Settings.vue'
import UserSettings from '../views/UserSettings.vue'

// OAuth
import OAuthCallback from '../views/OAuthCallback.vue'
import FacebookCallback from '../views/FacebookCallback.vue'
import InstagramCallback from '../views/InstagramCallback.vue'

// Accompagnement
import ServiceCatalog from '../components/accompagnement/ServiceCatalog.vue'
import AccompagnementDashboard from '../components/accompagnement/AccompagnementDashboard.vue'

// Agent Dashboard
import AgentDashboard from '../views/AgentDashboard.vue'

import AgentReports from '../views/AgentReports.vue'
import AgentClients from '../views/AgentClients.vue'
import AgentServiceRequests from '../views/AgentServiceRequests.vue'
import AgentPrestataires from '../views/AgentPrestataires.vue'

// Super Admin Dashboard
import SuperAdminDashboard from '../views/SuperAdminDashboard.vue'

// Prestataire
import RegisterPrestataire from '../views/RegisterPrestataire.vue'
import PrestataireDashboard from '../views/PrestataireDashboard.vue'

// Project Management
import ProjectManagement from '../views/ProjectManagement.vue'

// Changelog
import Changelog from '../views/Changelog.vue'

// Test Chat
import TestChat from '../views/TestChat.vue'

// Chat System
import Chat from '../views/Chat.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: (to) => {
      // Vérifier l'authentification de manière synchrone
      const token = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        return '/dashboard';
      } else {
        return '/login';
      }
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    beforeEnter: requireGuest
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    beforeEnter: requireGuest
  },
  {
    path: '/confirm-account',
    name: 'ConfirmAccount',
    component: ConfirmAccount
  },
  {
    path: '/set-password',
    name: 'SetPassword',
    component: SetPassword,
    beforeEnter: requireGuest
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: ClientDashboard,
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
    path: '/projects/:id',
    name: 'ProjectDetails',
    component: () => import('../views/ProjectDetailDashboard.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: Analytics,
    beforeEnter: requireAuth
  },

  // Routes Facebook et Instagram supprimées - utiliser /analytics/meta à la place
  {
    path: '/analytics/meta',
    name: 'MetaInsights',
    component: MetaInsights,
    beforeEnter: requireAuth
  },
  {
    path: '/marketing',
    name: 'Marketing',
    component: Marketing,
    beforeEnter: requireAuth
  },
  {
    path: '/marketing/campaigns',
    name: 'MarketingCampaigns',
    component: Campaigns,
    beforeEnter: requireAuth
  },
  {
    path: '/marketing/emails',
    name: 'Emails',
    component: Emails,
    beforeEnter: requireAuth
  },
  {
    path: '/marketing/templates',
    name: 'Templates',
    component: Templates,
    beforeEnter: requireAuth
  },
  {
    path: '/integrations',
    name: 'Integrations',
    component: Integrations,
    beforeEnter: requireAuth
  },
  {
    path: '/team',
    name: 'Team',
    component: Team,
    beforeEnter: requireAuth
  },
  {
    path: '/billing',
    name: 'Billing',
    component: Billing,
    beforeEnter: requireAuth
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports,
    beforeEnter: requireAuth
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    beforeEnter: requireAuth
  },
  {
    path: '/user-settings',
    name: 'UserSettings',
    component: UserSettings,
    beforeEnter: requireAuth
  },
  {
    path: '/oauth/callback',
    name: 'OAuthCallback',
    component: OAuthCallback
  },
  {
    path: '/oauth/facebook/callback',
    name: 'FacebookCallback',
    component: FacebookCallback
  },
  {
    path: '/oauth/instagram/callback',
    name: 'InstagramCallback',
    component: InstagramCallback
  },


  {
    path: '/services',
    name: 'ServiceCatalog',
    component: ServiceCatalog,
    beforeEnter: requireAuth
  },
  {
    path: '/accompagnement',
    name: 'AccompagnementDashboard',
    component: AccompagnementDashboard,
    beforeEnter: requireAuth
  },
  {
    path: '/agent',
    name: 'AgentDashboard',
    component: AgentDashboard,
    beforeEnter: requireAgent
  },

  {
    path: '/agent/reports',
    name: 'AgentReports',
    component: AgentReports,
    beforeEnter: requireAgent
  },
  {
    path: '/agent/clients',
    name: 'AgentClients',
    component: AgentClients,
    beforeEnter: requireAgent
  },
  {
    path: '/agent/service-requests',
    name: 'AgentServiceRequests',
    component: AgentServiceRequests,
    beforeEnter: requireAgent
  },
  {
      path: '/agent/projects',
      name: 'AgentProjects',
      component: () => import('../views/AgentProjects.vue'),
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
      component: ProjectManagement,
      beforeEnter: requireAgent
    },
    {
      path: '/agent/clients/:clientId/projects/:projectId',
      name: 'ProjectDetailDashboard',
      component: () => import('../views/ProjectDetailDashboard.vue'),
      beforeEnter: requireAgent
    },
  {
    path: '/agent/prestataires',
    name: 'AgentPrestataires',
    component: AgentPrestataires,
    beforeEnter: requireAgent
  },
  // Routes Super Admin
  {
    path: '/super-admin',
    name: 'SuperAdminDashboard',
    component: SuperAdminDashboard,
    beforeEnter: requireSuperAdmin
  },
  // Routes Prestataire
  {
    path: '/register-prestataire/:token',
    name: 'RegisterPrestataire',
    component: RegisterPrestataire,
    beforeEnter: requireGuest
  },
  {
    path: '/prestataire/dashboard',
    name: 'PrestataireDashboard',
    component: PrestataireDashboard,
    beforeEnter: requirePrestataire
  },
  // Route publique pour le changelog
  {
    path: '/changelog',
    name: 'Changelog',
    component: Changelog
  },
  // Route de test pour le chat IA
  {
    path: '/test-chat',
    name: 'TestChat',
    component: TestChat
  },
  // Route pour le système de chat
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,
    beforeEnter: requireAuth
  },
  // Route pour le chat agent
  {
    path: '/agent/chat',
    name: 'AgentChat',
    component: () => import('../components/Chat/AgentChat.vue'),
    beforeEnter: requireAgent
  },
  // Route pour le chat client
  {
    path: '/client/chat',
    name: 'ClientChat',
    component: () => import('../components/Chat/ClientChat.vue'),
    beforeEnter: requireAuth
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Middleware global d'authentification - Désactivé temporairement pour éviter les boucles
// router.beforeEach(initializeAuth)

export default router