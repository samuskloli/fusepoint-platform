<template>
  <div class="bg-gray-800 text-white h-full flex flex-col transition-all duration-300" :class="isCollapsed ? 'w-16' : 'w-64'">
    <!-- Sidebar header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-700">
      <div class="flex items-center space-x-3" v-if="!isCollapsed">
        <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-sm">F</span>
        </div>
        <span class="text-white font-semibold text-lg">Fusepoint</span>
      </div>
      <div class="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg" v-else>
        <span class="text-white font-bold text-sm">F</span>
      </div>
      
      <!-- Collapse/Expand button -->
      <button
        @click="toggleCollapse"
        class="hidden md:flex p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors duration-200"
        :title="isCollapsed ? 'Étendre le menu' : 'Réduire le menu'"
      >
        <svg class="h-5 w-5 transition-transform duration-200" :class="{ 'rotate-180': isCollapsed }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <!-- Mobile close button -->
      <button
        @click="$emit('close-sidebar')"
        class="md:hidden p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto" :class="{ 'px-2': isCollapsed }">
      <router-link
        to="/dashboard"
        class="nav-item"
        :class="{ 'nav-item-active': $route.path === '/dashboard', 'justify-center': isCollapsed }"
        :title="isCollapsed ? 'Tableau de bord' : ''"
      >
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
        <span v-if="!isCollapsed">Tableau de bord</span>
      </router-link>

      <!-- Collapsed mode - All links as icons -->
      <div v-if="isCollapsed" class="space-y-1">
        <!-- Analytics -->
        <router-link
          to="/analytics"
          class="nav-item justify-center"
          :class="{ 'nav-item-active': $route.path.startsWith('/analytics') && $route.path === '/analytics' }"
          title="Analytics - Vue d'ensemble"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </router-link>
        
        <router-link
          to="/analytics/google"
          class="nav-item justify-center"
          :class="{ 'nav-item-active': $route.path === '/analytics/google' }"
          title="Google Analytics"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </router-link>
        
        <router-link
          to="/analytics/meta"
          class="nav-item justify-center"
          :class="{ 'nav-item-active': $route.path === '/analytics/meta' }"
          title="Meta Insights"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v2a1 1 0 01-1 1h-1v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
          </svg>
        </router-link>
        
        <!-- Services -->
        <router-link
          to="/services"
          class="nav-item justify-center"
          :class="{ 'nav-item-active': $route.path === '/services' }"
          title="Catalogue de Services"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </router-link>
        
        <router-link
          to="/accompagnement"
          class="nav-item justify-center"
          :class="{ 'nav-item-active': $route.path === '/accompagnement' }"
          title="Mon Accompagnement"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </router-link>
        
        <router-link
          to="/projects"
          class="nav-item justify-center"
          :class="{ 'nav-item-active': $route.path.startsWith('/projects') }"
          title="Suivi des Projets"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 4h.01M9 12h.01M9 16h.01M13 12h6m-3-3v6" />
          </svg>
        </router-link>
        
        <!-- Marketing -->
        <router-link
          to="/marketing/campaigns"
          class="nav-item justify-center"
          :class="{ 'nav-item-active': $route.path.startsWith('/marketing/campaigns') }"
          title="Campagnes Marketing"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        </router-link>
        
        <router-link
          to="/marketing/emails"
          class="nav-item justify-center"
          :class="{ 'nav-item-active': $route.path.startsWith('/marketing/emails') }"
          title="E-mails / Newsletters"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </router-link>
        
        <router-link
          to="/marketing/templates"
          class="nav-item justify-center"
          :class="{ 'nav-item-active': $route.path.startsWith('/marketing/templates') }"
          title="Modèles Marketing"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </router-link>
        
        <!-- Chat IA -->
        <router-link
          to="/chat"
          class="nav-item justify-center"
          :class="{ 'nav-item-active': $route.path === '/chat' }"
          title="Chat IA"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </router-link>
        

        
        <!-- Rapports -->
        <router-link
          to="/reports"
          class="nav-item justify-center"
          :class="{ 'nav-item-active': $route.path === '/reports' }"
          title="Rapports"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </router-link>
        
        <!-- Gestion -->
        <router-link
          to="/integrations"
          class="nav-item justify-center"
          :class="{ 'nav-item-active': $route.path === '/integrations' }"
          title="Intégrations"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </router-link>
        
        <router-link
          to="/team"
          class="nav-item justify-center"
          :class="{ 'nav-item-active': $route.path === '/team' }"
          title="Équipe"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </router-link>
        
        <router-link
          to="/user-settings"
          class="nav-item justify-center"
          :class="{ 'nav-item-active': $route.path === '/user-settings' }"
          title="Mon Compte"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </router-link>
        
        <router-link
          to="/billing"
          class="nav-item justify-center"
          :class="{ 'nav-item-active': $route.path === '/billing' }"
          title="Facturation"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </router-link>
        
        <!-- Administration Agent (si agent et pas super admin) -->
        <div v-if="isAgent && !isSuperAdmin">
          <router-link
            to="/agent"
            class="nav-item justify-center"
            :class="{ 'nav-item-active': $route.path === '/agent' }"
            title="Tableau de Bord Agent"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0a2 2 0 012-2h6l2 2h6a2 2 0 012 2z" />
            </svg>
          </router-link>
          
          <router-link
            to="/agent/clients"
            class="nav-item justify-center"
            :class="{ 'nav-item-active': $route.path === '/agent/clients' }"
            title="Gestion Clients"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </router-link>
          

          
          <router-link
            to="/agent/service-requests"
            class="nav-item justify-center"
            :class="{ 'nav-item-active': $route.path === '/agent/service-requests' }"
            title="Demandes Service"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </router-link>
          
          <router-link
            to="/agent/prestataires"
            class="nav-item justify-center"
            :class="{ 'nav-item-active': $route.path === '/agent/prestataires' }"
            title="Prestataires"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </router-link>
          
          <router-link
            to="/agent/reports"
            class="nav-item justify-center"
            :class="{ 'nav-item-active': $route.path === '/agent/reports' }"
            title="Rapports & Analytics Agent"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </router-link>
        </div>
        
        <!-- Super Administration -->
        <div v-if="isSuperAdmin">
          <router-link
            to="/super-admin"
            class="nav-item justify-center"
            :class="{ 'nav-item-active': $route.path.startsWith('/super-admin') }"
            title="Tableau de Bord Super Admin"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </router-link>
          
          <router-link
            to="/agent"
            class="nav-item justify-center"
            :class="{ 'nav-item-active': $route.path === '/agent' }"
            title="Tableau de Bord Agent"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0a2 2 0 012-2h6l2 2h6a2 2 0 012 2z" />
            </svg>
          </router-link>
          
          <router-link
            to="/agent/clients"
            class="nav-item justify-center"
            :class="{ 'nav-item-active': $route.path === '/agent/clients' }"
            title="Gestion Clients"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </router-link>
          

          
          <router-link
            to="/agent/service-requests"
            class="nav-item justify-center"
            :class="{ 'nav-item-active': $route.path === '/agent/service-requests' }"
            title="Demandes Service"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </router-link>
          
          <router-link
            to="/agent/prestataires"
            class="nav-item justify-center"
            :class="{ 'nav-item-active': $route.path === '/agent/prestataires' }"
            title="Prestataires"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </router-link>
          
          <router-link
            to="/agent/reports"
            class="nav-item justify-center"
            :class="{ 'nav-item-active': $route.path === '/agent/reports' }"
            title="Rapports & Analytics Agent"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </router-link>
        </div>
        
        <!-- Paramètres -->
        <router-link
          to="/settings"
          class="nav-item justify-center"
          :class="{ 'nav-item-active': $route.path === '/settings' }"
          title="Paramètres"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </router-link>
      </div>

      <!-- Analytics Section -->
      <div class="pt-4" v-if="!isCollapsed">
        <h3 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Analytics
        </h3>
        <div class="mt-2 space-y-1">
          <router-link
            to="/analytics"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path.startsWith('/analytics') && $route.path === '/analytics' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Vue d'ensemble</span>
          </router-link>

          <router-link
            to="/analytics/google"
            class="nav-item pl-8"
            :class="{ 'nav-item-active': $route.path === '/analytics/google' }"
          >
            <span>Google Analytics</span>
            <span class="ml-auto w-2 h-2 bg-green-400 rounded-full"></span>
          </router-link>

          <!-- Facebook et Instagram Insights sont maintenant intégrés dans Meta Insights -->

          <router-link
            to="/analytics/meta"
            class="nav-item pl-8"
            :class="{ 'nav-item-active': $route.path === '/analytics/meta' }"
          >
            <span>Meta Insights</span>
            <span class="ml-auto w-2 h-2 bg-blue-400 rounded-full"></span>
          </router-link>
        </div>
      </div>

      <!-- Accompagnement Fusepoint Section -->
      <div class="pt-4" v-if="!isCollapsed">
        <h3 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Accompagnement Fusepoint
        </h3>
        <div class="mt-2 space-y-1">
          <router-link
            to="/services"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/services' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Catalogue de Services</span>
          </router-link>

          <router-link
            to="/accompagnement"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/accompagnement' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Mon Accompagnement</span>
            <span class="ml-auto px-2 py-1 text-xs bg-blue-600 text-white rounded-full">Nouveau</span>
          </router-link>

          <router-link
            to="/projects"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path.startsWith('/projects') }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 4h.01M9 12h.01M9 16h.01M13 12h6m-3-3v6" />
            </svg>
            <span>Suivi des Projets</span>
          </router-link>
        </div>
      </div>

      <!-- Marketing Section -->
      <div class="pt-4" v-if="!isCollapsed">
        <h3 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Marketing
        </h3>
        <div class="mt-2 space-y-1">
          <router-link
            to="/marketing/campaigns"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path.startsWith('/marketing/campaigns') }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <span>Campagnes</span>
          </router-link>

          <router-link
            to="/marketing/emails"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path.startsWith('/marketing/emails') }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>E-mails / Newsletters</span>
          </router-link>

          <router-link
             to="/marketing/templates"
             class="nav-item"
             :class="{ 'nav-item-active': $route.path.startsWith('/marketing/templates') }"
           >
             <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
             </svg>
             <span>Modèles</span>
           </router-link>
        </div>
      </div>

      <!-- AI Section -->
      <div class="pt-4" v-if="!isCollapsed">
        <h3 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Intelligence Artificielle
        </h3>
        <div class="mt-2 space-y-1">
          <router-link
            to="/chat"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/chat' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Chat IA</span>
            <span class="ml-auto px-2 py-1 text-xs bg-purple-600 text-white rounded-full">Nouveau</span>
          </router-link>

          <router-link
            to="/client/chat"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/client/chat' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2m-4 9h.01M13 16h.01M16 16h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Support Chat</span>
            <span class="ml-auto px-2 py-1 text-xs bg-blue-600 text-white rounded-full">Nouveau</span>
          </router-link>
        </div>
      </div>



      <!-- Reports Section -->
      <div class="pt-4" v-if="!isCollapsed">
        <h3 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Rapports
        </h3>
        <div class="mt-2 space-y-1">
          <router-link
            to="/reports"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/reports' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Rapports</span>
          </router-link>
        </div>
      </div>

      <!-- Administration Section (visible pour agents/admins seulement) -->
      <div v-if="isAgent && !isSuperAdmin && !isCollapsed" class="pt-4">
        <h3 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Administration Agent
        </h3>
        <div class="mt-2 space-y-1">
          <!-- Tableau de bord Agent -->
          <router-link
            to="/agent"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/agent' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0a2 2 0 012-2h6l2 2h6a2 2 0 012 2z" />
            </svg>
            <span>Tableau de Bord Agent</span>
          </router-link>

          <!-- Gestion des Clients -->
          <router-link
            to="/agent/clients"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/agent/clients' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Gestion Clients</span>
            <span class="ml-auto px-2 py-1 text-xs bg-red-600 text-white rounded-full">Agent</span>
          </router-link>



          <!-- Demandes Service -->
          <router-link
            to="/agent/service-requests"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/agent/service-requests' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>Demandes Service</span>
          </router-link>

          <!-- Prestataires -->
          <router-link
            to="/agent/prestataires"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/agent/prestataires' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>Prestataires</span>
          </router-link>

          <!-- Rapports & Analytics Agent -->
          <router-link
            to="/agent/reports"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/agent/reports' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Rapports & Analytics Agent</span>
          </router-link>
        </div>
      </div>

      <!-- Super Admin Section -->
      <div v-if="isSuperAdmin && !isCollapsed" class="pt-4">
        <h3 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Super Administration
        </h3>
        <div class="mt-2 space-y-1">
          <router-link
            to="/super-admin"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path.startsWith('/super-admin') }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Tableau de Bord Super Admin</span>
            <span class="ml-auto px-2 py-1 text-xs bg-red-600 text-white rounded-full">Admin</span>
          </router-link>

          <!-- Tableau de bord Agent -->
          <router-link
            to="/agent"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/agent' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0a2 2 0 012-2h6l2 2h6a2 2 0 012 2z" />
            </svg>
            <span>Tableau de Bord Agent</span>
          </router-link>

          <!-- Gestion des Clients -->
          <router-link
            to="/agent/clients"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/agent/clients' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Gestion Clients</span>
          </router-link>



          <!-- Demandes Service -->
          <router-link
            to="/agent/service-requests"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/agent/service-requests' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>Demandes Service</span>
          </router-link>

          <!-- Prestataires -->
          <router-link
            to="/agent/prestataires"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/agent/prestataires' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>Prestataires</span>
          </router-link>

          <!-- Rapports & Analytics Agent -->
          <router-link
            to="/agent/reports"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/agent/reports' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Rapports & Analytics Agent</span>
          </router-link>
        </div>
      </div>

      <!-- Management Section -->
      <div class="pt-4" v-if="!isCollapsed">
        <h3 class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Gestion
        </h3>
        <div class="mt-2 space-y-1">
          <router-link
            to="/integrations"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/integrations' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>Intégrations</span>
          </router-link>

          <router-link
            to="/team"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/team' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>Équipe</span>
          </router-link>

          <router-link
            to="/user-settings"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/user-settings' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Mon Compte</span>
          </router-link>

          <router-link
            to="/billing"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/billing' }"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>Facturation</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Bottom section -->
    <div class="p-4 border-t border-gray-700" v-if="!isCollapsed">
      <router-link
        to="/settings"
        class="nav-item"
        :class="{ 'nav-item-active': $route.path === '/settings' }"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Paramètres</span>
      </router-link>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { ref } from 'vue'

export default {
  name: 'Sidebar',
  emits: ['close-sidebar', 'toggle-collapse'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    const isCollapsed = ref(false)
    
    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value
      emit('toggle-collapse', isCollapsed.value)
    }
    
    return {
      isAgent: authStore.isAgent,
      isSuperAdmin: authStore.isSuperAdmin,
      isCollapsed,
      toggleCollapse
    }
  }
}
</script>

<style scoped>
.nav-item {
  @apply flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors duration-200;
}

.nav-item-active {
  @apply bg-primary-600 text-white;
}

/* Styles pour le mode réduit */
.nav-item.justify-center {
  justify-content: center;
  padding: 0.75rem;
  margin: 0.25rem;
  min-height: 3rem;
  display: flex;
  align-items: center;
}

.nav-item.justify-center svg {
  width: 1.5rem;
  height: 1.5rem;
  margin: 0 auto;
}

/* Animation pour la transition */
.nav-item {
  transition: all 0.3s ease;
}

/* Ajustements pour le sidebar réduit */
.w-16 .nav-item {
  margin: 0.25rem 0.125rem;
  padding: 0.75rem 0.25rem;
}

.w-16 .nav-item svg {
  margin: 0 auto;
  width: 1.5rem;
  height: 1.5rem;
}
</style>