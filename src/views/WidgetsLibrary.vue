<template>
  <RoleLayout>
    <div class="marketplace-container">
      <!-- Header avec recherche principale -->
      <div class="marketplace-header">
        <div class="header-content">
          <div class="title-section">
            <h1 class="marketplace-title">{{ tt('widgets.marketplace.title', 'Marketplace des Widgets') }}</h1>
            <p class="marketplace-subtitle">{{ tt('widgets.marketplace.subtitle', 'Découvrez et installez des widgets pour enrichir vos projets') }}</p>
          </div>
          
          <!-- Barre de recherche principale -->
          <div class="search-section">
            <div class="search-bar">
              <i class="fas fa-search search-icon"></i>
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="tt('widgets.marketplace.searchPlaceholder', 'Rechercher des widgets...')"
                class="search-input"
                @input="handleSearch"
              />
              <button v-if="searchQuery" @click="clearSearch" class="clear-search">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation par onglets -->
      <div class="tabs-navigation">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="tab-button"
          :class="{ active: activeTab === tab.key }"
        >
          <i :class="tab.icon"></i>
          <span>{{ tt(tab.labelKey, tab.label) }}</span>
          <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Contenu principal -->
      <div class="marketplace-content">
        <!-- Sidebar avec catégories et filtres -->
        <aside class="marketplace-sidebar">
          <!-- Catégories -->
          <div class="filter-section">
            <h3 class="filter-title">{{ tt('widgets.marketplace.categories', 'Catégories') }}</h3>
            <div class="category-list">
              <button
                v-for="category in categories"
                :key="category.value"
                @click="selectedCategory = category.value"
                class="category-item"
                :class="{ active: selectedCategory === category.value }"
              >
                <i :class="category.icon"></i>
                <span>{{ tt(category.labelKey, category.label) }}</span>
                <span class="category-count">{{ category.count || 0 }}</span>
              </button>
            </div>
          </div>

          <!-- Filtres -->
          <div class="filter-section">
            <h3 class="filter-title">{{ tt('widgets.marketplace.filters', 'Filtres') }}</h3>
            
            <!-- Statut -->
            <div class="filter-group">
              <label class="filter-label">{{ tt('widgets.marketplace.status', 'Statut') }}</label>
              <select v-model="statusFilter" class="filter-select">
                <option value="">{{ tt('widgets.filters.all', 'Tous') }}</option>
                <option value="free">{{ tt('widgets.marketplace.free', 'Gratuit') }}</option>
                <option value="premium">{{ tt('widgets.marketplace.premium', 'Premium') }}</option>
                <option value="installed">{{ tt('widgets.marketplace.installed', 'Installé') }}</option>
              </select>
            </div>

            <!-- Compatibilité -->
            <div class="filter-group">
              <label class="filter-label">{{ tt('widgets.marketplace.compatibility', 'Compatibilité') }}</label>
              <select v-model="compatibilityFilter" class="filter-select">
                <option value="">{{ tt('widgets.filters.all', 'Tous') }}</option>
                <option value="agent">Agent</option>
                <option value="client">Client</option>
                <option value="both">{{ tt('widgets.compatibility.both', 'Les deux') }}</option>
              </select>
            </div>

            <!-- Tri -->
            <div class="filter-group">
              <label class="filter-label">{{ tt('widgets.marketplace.sortBy', 'Trier par') }}</label>
              <select v-model="sortBy" class="filter-select">
                <option value="popularity">{{ tt('widgets.sort.popularity', 'Popularité') }}</option>
                <option value="rating">{{ tt('widgets.sort.rating', 'Note') }}</option>
                <option value="newest">{{ tt('widgets.sort.newest', 'Plus récent') }}</option>
                <option value="name">{{ tt('widgets.sort.name', 'Nom') }}</option>
                <option value="price">{{ tt('widgets.sort.price', 'Prix') }}</option>
              </select>
            </div>
          </div>

          <!-- Widgets populaires -->
          <div class="filter-section">
            <h3 class="filter-title">{{ tt('widgets.marketplace.popular', 'Populaires') }}</h3>
            <div class="popular-widgets">
              <div
                v-for="widget in popularWidgets"
                :key="widget.id"
                @click="selectWidget(widget)"
                class="popular-widget-item"
              >
                <div class="widget-icon">
                  <i :class="widget.icon"></i>
                </div>
                <div class="widget-info">
                  <div class="widget-name">{{ widget.name }}</div>
                  <div class="widget-rating">
                    <div class="stars">
                      <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ filled: n <= widget.rating }"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Zone principale des widgets -->
        <main class="widgets-main">
          <!-- Widgets en vedette (si onglet découvrir) -->
          <section v-if="activeTab === 'discover' && featuredWidgets.length" class="featured-section">
            <h2 class="section-title">{{ tt('widgets.marketplace.featured', 'En vedette') }}</h2>
            <div class="featured-carousel">
              <div
                v-for="widget in featuredWidgets"
                :key="widget.id"
                class="featured-card"
                @click="selectWidget(widget)"
              >
                <div class="featured-image">
                  <img :src="widget.screenshot || getWidgetPlaceholder(widget)" :alt="widget.name" @error="onImageError" />
                  <div class="featured-overlay">
                                 <button class="featured-action">
                                   <i class="fas fa-play"></i>
                                   {{ tt('widgets.marketplace.preview', 'Aperçu') }}
                                 </button>
                               </div>
                             </div>
                <div class="featured-info">
                  <h3 class="featured-title">{{ widget.name }}</h3>
                  <p class="featured-description">{{ widget.description }}</p>
                  <div class="featured-meta">
                    <div class="rating">
                      <div class="stars">
                        <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ filled: n <= widget.rating }"></i>
                      </div>
                      <span class="rating-text">{{ widget.rating }}</span>
                    </div>
                    <div class="price">
                      <span v-if="widget.price === 0" class="free">{{ tt('widgets.marketplace.free', 'Gratuit') }}</span>
                      <span v-else class="paid">{{ formatPrice(widget.price) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Grille des widgets -->
          <section class="widgets-grid-section">
            <div class="section-header">
              <h2 class="section-title">
                {{ getSectionTitle() }}
              </h2>
              <div class="view-controls">
                <button
                  @click="viewMode = 'grid'"
                  class="view-btn"
                  :class="{ active: viewMode === 'grid' }"
                >
                  <i class="fas fa-th"></i>
                </button>
                <button
                  @click="viewMode = 'list'"
                  class="view-btn"
                  :class="{ active: viewMode === 'list' }"
                >
                  <i class="fas fa-list"></i>
                </button>
              </div>
            </div>

            <!-- Loading state -->
            <div v-if="loading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>{{ tt('widgets.marketplace.loading', 'Chargement des widgets...') }}</p>
            </div>

            <!-- Empty state -->
            <div v-else-if="!filteredWidgets.length" class="empty-state">
              <div class="empty-icon">
                <i class="fas fa-search"></i>
              </div>
              <h3>{{ tt('widgets.marketplace.noResults', 'Aucun widget trouvé') }}</h3>
              <p>{{ tt('widgets.marketplace.noResultsDesc', 'Essayez de modifier vos critères de recherche') }}</p>
              <button @click="clearFilters" class="btn-primary">{{ tt('widgets.marketplace.clearFilters', 'Effacer les filtres') }}</button>
            </div>

            <!-- Grille des widgets -->
            <div v-else class="widgets-grid" :class="{ 'list-view': viewMode === 'list' }">
              <div
                v-for="widget in paginatedWidgets"
                :key="widget.id"
                class="widget-card"
                @click="selectWidget(widget)"
              >
                <!-- Image/Screenshot -->
                <div class="widget-image">
                  <img :src="widget.screenshot || getWidgetPlaceholder(widget)" :alt="widget.name" @error="onImageError" />
                  <div class="widget-overlay">
                    <button class="preview-btn">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button v-if="!isWidgetInstalled(widget)" @click.stop="installWidget(widget)" class="install-btn">
                      <i class="fas fa-download"></i>
                    </button>
                    <button v-else @click.stop="confirmUninstall(widget)" class="uninstall-btn">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                  
                  <!-- Badge statut -->
                  <div class="widget-badges">
                    <span v-if="widget.price === 0" class="badge free">{{ tt('widgets.marketplace.free', 'Gratuit') }}</span>
                    <span v-else class="badge premium">{{ tt('widgets.marketplace.premium', 'Premium') }}</span>
                    <span v-if="widget.isNew" class="badge new">{{ tt('widgets.marketplace.new', 'Nouveau') }}</span>
                    <span v-if="isWidgetInstalled(widget)" class="badge installed">{{ tt('widgets.marketplace.installed', 'Installé') }}</span>
                  </div>
                </div>

                <!-- Informations -->
                <div class="widget-info">
                  <div class="widget-header">
                    <div class="widget-icon">
                      <i :class="widget.icon"></i>
                    </div>
                    <div class="widget-details">
                      <h3 class="widget-name">{{ widget.name }}</h3>
                      <p class="widget-category">{{ getCategoryLabel(widget.category) }}</p>
                    </div>
                  </div>
                  
                  <p class="widget-description">{{ widget.description }}</p>
                  
                  <div class="widget-meta">
                    <div class="rating">
                      <div class="stars">
                        <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ filled: n <= widget.rating }"></i>
                      </div>
                      <span class="rating-text">{{ widget.rating }} ({{ widget.reviewCount }})</span>
                    </div>
                    
                    <div class="widget-stats">
                      <span class="downloads">
                        <i class="fas fa-download"></i>
                        {{ formatNumber(widget.downloads) }}
                      </span>
                      <span class="updated">
                        <i class="fas fa-clock"></i>
                        {{ formatDate(widget.updatedAt) }}
                      </span>
                    </div>
                  </div>

                  <div class="widget-actions">
                    <button
                      v-if="!isWidgetInstalled(widget)"
                      @click.stop="installWidget(widget)"
                      class="btn-primary btn-install"
                    >
                      <i class="fas fa-download"></i>
                      {{ widget.price === 0 ? tt('widgets.marketplace.install', 'Installer') : formatPrice(widget.price) }}
                    </button>
                    <button v-else class="btn-danger btn-uninstall" @click.stop="confirmUninstall(widget)">
                      <i class="fas fa-trash"></i>
                      {{ tt('widgets.marketplace.uninstall', 'Désinstaller') }}
                    </button>
                    <button @click.stop="toggleFavorite(widget)" class="btn-favorite" :class="{ active: isFavorite(widget) }">
                      <i class="fas fa-heart"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="pagination">
              <button
                @click="currentPage--"
                :disabled="currentPage <= 1"
                class="pagination-btn"
              >
                <i class="fas fa-chevron-left"></i>
                {{ tt('common.previous', 'Précédent') }}
              </button>
              
              <div class="pagination-pages">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="currentPage = page"
                  class="pagination-page"
                  :class="{ active: currentPage === page }"
                >
                  {{ page }}
                </button>
              </div>
              
              <button
                @click="currentPage++"
                :disabled="currentPage >= totalPages"
                class="pagination-btn"
              >
                {{ tt('common.next', 'Suivant') }}
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </section>
        </main>
      </div>

      <!-- Modal de détails du widget -->
      <WidgetDetailsModal
        v-if="selectedWidget"
        :widget="selectedWidget"
        :is-installed="isWidgetInstalled(selectedWidget)"
        @close="selectedWidget = null"
        @install="installWidget"
        @uninstall="uninstallWidget"
      />

      <!-- Modal de sélection de projet -->
      <ProjectSelectionModal
        v-if="showProjectSelector"
        :projects="availableProjects"
        :widget="pendingWidget"
        @close="showProjectSelector = false"
        @confirm="confirmInstallation"
      />
    </div>
  </RoleLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch, onErrorCaptured } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useToast } from '@/composables/useToast'
import RoleLayout from '@/components/RoleLayout.vue'
import WidgetDetailsModal from '@/components/widgets/modals/WidgetDetailsModal.vue'
import ProjectSelectionModal from '@/components/widgets/modals/ProjectSelectionModal.vue'

// Services (à adapter selon votre architecture)
import widgetsCatalogService from '@/services/widgetsCatalogService'
import widgetApiService from '@/components/widgets/shared/services/widgetApiService'
import projectManagementService from '@/services/projectManagementService'
import projectTemplateService from '@/services/projectTemplateService'

const { t, te } = useI18n()
const tt = (key, fallback) => (te(key) ? t(key) : fallback)
const { success, error } = useToast()
const route = useRoute()

// État réactif
const loading = ref(false)
const searchQuery = ref('')
const activeTab = ref('discover')
const selectedCategory = ref('')
const statusFilter = ref('')
const compatibilityFilter = ref('')
const sortBy = ref('popularity')
const viewMode = ref('grid')
const currentPage = ref(1)
const pageSize = ref(12)

// Données
const widgets = ref([])
const categories = ref([])
const installedWidgets = ref([])
const availableProjects = ref([])
const selectedWidget = ref(null)
const pendingWidget = ref(null)
const showProjectSelector = ref(false)

// Favoris
const favorites = ref(new Set())

// Configuration des onglets
const tabs = computed(() => [
  {
    key: 'discover',
    label: 'Découvrir',
    labelKey: 'widgets.marketplace.discover',
    icon: 'fas fa-compass',
    count: null
  },
  {
    key: 'installed',
    label: 'Installés',
    labelKey: 'widgets.marketplace.installed',
    icon: 'fas fa-check-circle',
    count: new Set(installedWidgets.value.map(w => w.id)).size
  },
  {
    key: 'favorites',
    label: 'Favoris',
    labelKey: 'widgets.marketplace.favorites',
    icon: 'fas fa-heart',
    count: favorites.value.size
  }
])

// Widgets en vedette
const featuredWidgets = computed(() => {
  return widgets.value
    .filter(w => w.featured)
    .slice(0, 3)
})

// Widgets populaires pour la sidebar
const popularWidgets = computed(() => {
  return widgets.value
    .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
    .slice(0, 5)
})

// Filtrage des widgets
const filteredWidgets = computed(() => {
  try {
    let filtered = [...(widgets.value || [])]

    // Filtrage par onglet
    if (activeTab.value === 'installed') {
      const installedIds = new Set((installedWidgets.value || []).map(w => w?.id).filter(Boolean))
      filtered = filtered.filter(w => w?.id && installedIds.has(w.id))
    } else if (activeTab.value === 'favorites') {
      filtered = filtered.filter(w => w?.id && favorites.value.has(w.id))
    }

    // Recherche
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(w => {
        if (!w) return false
        const name = (w.name || '').toLowerCase()
        const description = (w.description || '').toLowerCase()
        const tags = w.tags || []
        return name.includes(query) ||
               description.includes(query) ||
               tags.some(tag => (tag || '').toLowerCase().includes(query))
      })
    }

    // Catégorie
    if (selectedCategory.value) {
      filtered = filtered.filter(w => w?.category === selectedCategory.value)
    }

    // Statut
    if (statusFilter.value) {
      if (statusFilter.value === 'free') {
        filtered = filtered.filter(w => (w?.price || 0) === 0)
      } else if (statusFilter.value === 'premium') {
        filtered = filtered.filter(w => (w?.price || 0) > 0)
      } else if (statusFilter.value === 'installed') {
        const installedIds = new Set((installedWidgets.value || []).map(w => w?.id).filter(Boolean))
        filtered = filtered.filter(w => w?.id && installedIds.has(w.id))
      }
    }

    // Compatibilité
    if (compatibilityFilter.value) {
      filtered = filtered.filter(w => {
        const compatibility = w?.compatibility || []
        if (compatibilityFilter.value === 'both') {
          return compatibility.includes('agent') && compatibility.includes('client')
        }
        return compatibility.includes(compatibilityFilter.value)
      })
    }

    // Tri
    filtered.sort((a, b) => {
      try {
        switch (sortBy.value) {
          case 'popularity':
            return (b?.downloads || 0) - (a?.downloads || 0)
          case 'rating':
            return (b?.rating || 0) - (a?.rating || 0)
          case 'newest':
            const dateA = a?.createdAt ? new Date(a.createdAt) : new Date(0)
            const dateB = b?.createdAt ? new Date(b.createdAt) : new Date(0)
            return dateB - dateA
          case 'name':
            return (a?.name || '').localeCompare(b?.name || '')
          case 'price':
            return (a?.price || 0) - (b?.price || 0)
          default:
            return 0
        }
      } catch (e) {
        console.error('Error sorting widgets:', e)
        return 0
      }
    })

    return filtered
  } catch (e) {
    console.error('Error filtering widgets:', e)
    return []
  }
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredWidgets.value.length / pageSize.value))
const paginatedWidgets = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredWidgets.value.slice(start, start + pageSize.value)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Méthodes
const handleSearch = () => {
  currentPage.value = 1
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  statusFilter.value = ''
  compatibilityFilter.value = ''
  sortBy.value = 'popularity'
  currentPage.value = 1
}

const getSectionTitle = () => {
  if (activeTab.value === 'installed') {
    return tt('widgets.marketplace.installedWidgets', 'Widgets installés')
  } else if (activeTab.value === 'favorites') {
    return tt('widgets.marketplace.favoriteWidgets', 'Widgets favoris')
  } else if (selectedCategory.value) {
    const category = categories.value.find(c => c.value === selectedCategory.value)
    return category ? tt(category.labelKey, category.label) : tt('widgets.marketplace.allWidgets', 'Tous les widgets')
  }
  return tt('widgets.marketplace.allWidgets', 'Tous les widgets')
}

const getCategoryLabel = (categoryValue) => {
  const category = categories.value.find(c => c.value === categoryValue)
  return category ? tt(category.labelKey, category.label) : categoryValue
}

const selectWidget = (widget) => {
  selectedWidget.value = widget
}

const isWidgetInstalled = (widget) => {
  const widgetKeys = [widget.id, widget.component_name, widget.name].filter(Boolean)
  return installedWidgets.value.some(installed => {
    const installedKeys = [installed.id, installed.component_name, installed.name].filter(Boolean)
    return installedKeys.some(k => widgetKeys.includes(k))
  })
}

const loadInstalledWidgetsFromAPI = async () => {
  try {
    console.log('WidgetsLibrary: loadInstalledWidgetsFromAPI starting')
    // S’assurer que les projets sont chargés
    if (!Array.isArray(availableProjects.value) || !availableProjects.value.length) {
      await loadProjects()
    }
    if (!Array.isArray(availableProjects.value)) {
      console.warn('WidgetsLibrary: availableProjects is not an array, aborting loadInstalledWidgetsFromAPI', availableProjects.value)
      return
    }
    const aggregated = []
    for (const proj of availableProjects.value) {
      // Utiliser le service de configs client pour récupérer les widgets installés par projet
      const clientId = proj.client_id ?? proj.clientId ?? proj.client?.id
      if (!clientId) {
        console.warn('WidgetsLibrary: clientId manquant pour le projet', proj.id)
        continue
      }
      const resp = await widgetApiService.getClientProjectWidgets(String(clientId), String(proj.id))
      if (Array.isArray(resp)) {
        const items = resp.map(cfg => ({
          id: cfg?.widgetId ?? cfg?.componentName ?? cfg?.widgetName ?? cfg?.id,
          component_name: cfg?.componentName,
          name: cfg?.widgetName,
          projectId: proj.id
        }))
        aggregated.push(...items)
      } else {
        console.warn('WidgetsLibrary: getClientProjectWidgets returned non-array for project', proj.id, resp)
      }
    }
    // Dédupliquer par id/component_name/name
    const map = new Map()
    for (const item of aggregated) {
      const key = item.id || item.component_name || item.name
      if (!key) continue
      if (!map.has(key)) map.set(key, item)
    }
    installedWidgets.value = [...map.values()]
    console.log('WidgetsLibrary: Installed widgets loaded from API, count:', installedWidgets.value.length)
  } catch (e) {
    console.error('WidgetsLibrary: Error loading installed widgets from API:', e)
  }
}

const installWidget = async (widget) => {
  if (!availableProjects.value.length) {
    await loadProjects()
  }
  
  if (availableProjects.value.length === 1) {
    await performInstallation(widget, availableProjects.value[0].id)
  } else {
    pendingWidget.value = widget
    showProjectSelector.value = true
  }
}

const confirmInstallation = async (projectId) => {
  if (pendingWidget.value) {
    await performInstallation(pendingWidget.value, projectId)
    pendingWidget.value = null
    showProjectSelector.value = false
  }
}

const performInstallation = async (widget, projectId) => {
  try {
    loading.value = true

    // Récupérer le clientId à partir du projet
    const proj = availableProjects.value.find(p => p.id === projectId)
    const clientId = proj?.client_id ?? proj?.clientId ?? proj?.client?.id
    if (!clientId) {
      console.error('Installation error: clientId introuvable pour le projet', projectId)
      error(tt('widgets.marketplace.installError', 'Erreur lors de l\'installation'))
      return
    }

    // Préparer des valeurs par défaut
    const existingCountForProject = installedWidgets.value.filter(w => w.projectId === projectId).length
    const configData = {
      config: {},
      position: { x: 0, y: 0 },
      size: { width: 4, height: 2 },
      isEnabled: true,
      displayOrder: existingCountForProject,
      permissions: {}
    }

    const ok = await widgetApiService.upsertClientWidgetConfig(String(clientId), String(projectId), String(widget.id), configData)
    if (!ok) {
      throw new Error('API upsertClientWidgetConfig failed')
    }

    // Mettre à jour l\'état local
    const alreadyInstalled = installedWidgets.value.some(w => (w.id === widget.id) || (w.component_name && w.component_name === widget.component_name) || (w.name && w.name === widget.name))
    if (!alreadyInstalled) {
      installedWidgets.value = [...installedWidgets.value, { id: widget.id, component_name: widget.component_name, name: widget.name, projectId }]
      saveInstalledWidgets()
    }

    success(tt('widgets.marketplace.installSuccess', 'Widget installé avec succès'))
  } catch (e) {
    console.error('Installation error:', e)
    error(tt('widgets.marketplace.installError', 'Erreur lors de l\'installation'))
  } finally {
    loading.value = false
  }
}

const uninstallWidget = async (widget) => {
  try {
    // Trouver les occurrences installées (pour gérer multi-projet)
    const matches = installedWidgets.value.filter(w => (w.id === widget.id) || (w.component_name && w.component_name === widget.component_name) || (w.name && w.name === widget.name))
    if (matches.length === 0) {
      console.warn('Uninstall: aucun widget correspondant installé')
      return
    }

    // Choisir le projet cible (si plusieurs, on désinstalle du premier par défaut)
    const target = matches[0]
    const projectId = target.projectId
    const proj = availableProjects.value.find(p => p.id === projectId)
    const clientId = proj?.client_id ?? proj?.clientId ?? proj?.client?.id
    if (!clientId) {
      console.error('Uninstall error: clientId introuvable pour le projet', projectId)
      error(tt('widgets.marketplace.uninstallError', 'Erreur lors de la désinstallation'))
      return
    }

    const ok = await widgetApiService.deleteClientWidgetConfig(String(clientId), String(projectId), String(widget.id))
    if (!ok) {
      throw new Error('API deleteClientWidgetConfig failed')
    }

    const before = installedWidgets.value.length
    installedWidgets.value = installedWidgets.value.filter(w => !( (w.id === widget.id || w.component_name === widget.component_name || w.name === widget.name) && w.projectId === projectId ))
    if (installedWidgets.value.length !== before) {
      saveInstalledWidgets()
      success(tt('widgets.marketplace.uninstallSuccess', 'Widget désinstallé'))
    }
  } catch (e) {
    console.error('Uninstall error:', e)
    error(tt('widgets.marketplace.uninstallError', 'Erreur lors de la désinstallation'))
  }
}

const confirmUninstall = (widget) => {
  try {
    const ok = window.confirm(tt('widgets.marketplace.confirmUninstall', 'Confirmer la désinstallation ?'))
    if (ok) uninstallWidget(widget)
  } catch (e) {
    uninstallWidget(widget)
  }
}
const toggleFavorite = (widget) => {
  if (favorites.value.has(widget.id)) {
    favorites.value.delete(widget.id)
  } else {
    favorites.value.add(widget.id)
  }
  saveFavorites()
}

const isFavorite = (widget) => {
  return favorites.value.has(widget.id)
}

const saveFavorites = () => {
  try {
    console.log('WidgetsLibrary: saveFavorites starting, count:', favorites.value.size)
    localStorage.setItem('widgetFavorites', JSON.stringify([...favorites.value]))
    console.log('WidgetsLibrary: Favorites saved successfully')
  } catch (e) {
    console.error('WidgetsLibrary: Error saving favorites:', e)
  }
}

const loadFavorites = () => {
  try {
    console.log('WidgetsLibrary: loadFavorites starting')
    const saved = localStorage.getItem('widgetFavorites')
    if (saved) {
      const parsed = JSON.parse(saved)
      favorites.value = new Set(parsed)
      console.log('WidgetsLibrary: Favorites loaded, count:', favorites.value.size)
    } else {
      console.log('WidgetsLibrary: No favorites found in localStorage')
    }
  } catch (e) {
    console.error('WidgetsLibrary: Error loading favorites:', e)
    try {
      console.warn('WidgetsLibrary: resetting invalid widgetFavorites to []')
      localStorage.setItem('widgetFavorites', '[]')
      favorites.value = new Set([])
    } catch (err2) {
      console.error('WidgetsLibrary: failed to reset widgetFavorites', err2)
    }
  }
}

// Utilitaires de formatage
const formatPrice = (price) => {
  if (price == null || isNaN(price)) return '0,00 €'
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(Number(price))
  } catch (e) {
    console.error('Error formatting price:', e, price)
    return '0,00 €'
  }
}

const formatNumber = (num) => {
  if (num == null || isNaN(num)) return '0'
  try {
    const number = Number(num)
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M'
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K'
    }
    return number.toString()
  } catch (e) {
    console.error('Error formatting number:', e, num)
    return '0'
  }
}

const formatDate = (date) => {
  if (!date) return 'Date inconnue'
  try {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch (e) {
    console.error('Error formatting date:', e, date)
    return 'Date invalide'
  }
}

// Fallback image utils
const onImageError = (e) => {
  if (e && e.target) {
    e.target.src = '/fusepoint-logo.svg'
  }
}

const getWidgetPlaceholder = (widget) => {
  try {
    const name = (widget?.name || 'Widget').trim()
    const text = encodeURIComponent(name)
    // Utiliser un asset local pour éviter les erreurs de DNS/host
    return '/fusepoint-logo.svg'
  } catch (e) {
    return '/fusepoint-logo.svg'
  }
}

// Chargement des données
const loadWidgets = async () => {
  try {
    console.log('WidgetsLibrary: loadWidgets starting')
    loading.value = true
    
    console.log('WidgetsLibrary: Calling widgetsCatalogService.getWidgets()')
    const response = await widgetsCatalogService.getWidgets()
    
    console.log('WidgetsLibrary: Response received:', response)
    if (response.success) {
      console.log('WidgetsLibrary: Normalizing widgets, count:', (response.data || []).length)
      const normalized = response.data.map(widget => ({
        ...widget,
        id: widget.id ?? widget._id ?? widget.slug ?? `${widget.name}`,
        rating: widget.rating || 4.5,
        reviewCount: widget.reviewCount || Math.floor(Math.random() * 1000) + 10,
        downloads: widget.downloads || Math.floor(Math.random() * 10000) + 100,
        price: widget.price || 0,
        featured: widget.featured || Math.random() > 0.8,
        isNew: widget.isNew || Math.random() > 0.9,
        compatibility: widget.compatibility || ['agent', 'client'],
        screenshot: widget.screenshot || getWidgetPlaceholder(widget),
        createdAt: widget.createdAt || new Date().toISOString(),
        updatedAt: widget.updatedAt || new Date().toISOString()
      }))
      // Déduplication par id
      console.log('WidgetsLibrary: Deduplicating widgets')
      const map = new Map()
      for (const w of normalized) {
        const id = w.id
        if (!id) continue
        if (!map.has(id)) map.set(id, w)
      }
      widgets.value = [...map.values()]
      console.log('WidgetsLibrary: Widgets loaded successfully, final count:', widgets.value.length)
    }
  } catch (e) {
    console.error('WidgetsLibrary: Error loading widgets:', e)
    error(tt('widgets.marketplace.loadError', 'Erreur lors du chargement'))
  } finally {
    loading.value = false
    console.log('WidgetsLibrary: loadWidgets completed')
  }
}

const loadCategories = async () => {
  try {
    console.log('WidgetsLibrary: loadCategories starting')
    const response = await widgetsCatalogService.getCategories()
    console.log('WidgetsLibrary: Categories response:', response)
    if (response.success) {
      const incoming = response.data || []
      const normalized = incoming.map((cat) => {
        if (typeof cat === 'string') {
          const value = cat
          return {
            value,
            label: value,
            labelKey: `widgets.categories.${value}`,
            icon: 'fas fa-tag'
          }
        } else if (cat && typeof cat === 'object') {
          const value = cat.value || cat.name || cat.category || ''
          return {
            value,
            label: cat.label || value,
            labelKey: cat.labelKey || `widgets.categories.${value}`,
            icon: cat.icon || 'fas fa-tag'
          }
        }
        return { value: '', label: '', labelKey: '', icon: 'fas fa-tag' }
      })

      // Calculer les counts en fonction des widgets chargés
      const withCounts = normalized.map((cat) => ({
        ...cat,
        count: cat.value
          ? (widgets.value || []).filter((w) => w?.category === cat.value).length
          : (widgets.value || []).length
      }))

      categories.value = [
        { value: '', label: 'Tous', labelKey: 'widgets.categories.all', icon: 'fas fa-th', count: (widgets.value || []).length },
        ...withCounts
      ]
      console.log('WidgetsLibrary: Categories loaded successfully, count:', categories.value.length)
    }
  } catch (e) {
    console.error('WidgetsLibrary: Error loading categories:', e)
  }
}

const saveInstalledWidgets = () => {
  try {
    console.log('WidgetsLibrary: saveInstalledWidgets starting')
    // Déduplication par identifiant
    const map = new Map()
    for (const item of installedWidgets.value || []) {
      const id = item?.id ?? item?._id ?? item?.name
      if (!id) continue
      if (!map.has(id)) map.set(id, item)
    }
    const unique = [...map.values()]
    installedWidgets.value = unique
    localStorage.setItem('installedWidgets', JSON.stringify(unique))
    console.log('WidgetsLibrary: Installed widgets saved, count:', unique.length)
  } catch (e) {
    console.error('WidgetsLibrary: Error saving installed widgets:', e)
  }
}

const loadInstalledWidgets = () => {
  try {
    console.log('WidgetsLibrary: loadInstalledWidgets starting')
    const saved = localStorage.getItem('installedWidgets')
    const parsed = saved ? JSON.parse(saved) : []
    console.log('WidgetsLibrary: Raw installed widgets from localStorage:', parsed)
    // Déduplication par identifiant
    const map = new Map()
    for (const item of parsed || []) {
      const id = item?.id ?? item?._id ?? item?.name
      if (!id) continue
      if (!map.has(id)) map.set(id, item)
    }
    installedWidgets.value = [...map.values()]
    console.log('WidgetsLibrary: Installed widgets loaded, count:', installedWidgets.value.length)
  } catch (e) {
    console.error('WidgetsLibrary: Error loading installed widgets:', e)
    installedWidgets.value = []
  }
}

const loadProjects = async () => {
  try {
    console.log('WidgetsLibrary: loadProjects starting')
    const response = await projectManagementService.getAgentProjects()
    console.log('WidgetsLibrary: Projects response:', response)
    if (response.success) {
      availableProjects.value = response.data || []
      console.log('WidgetsLibrary: Projects loaded successfully, count:', availableProjects.value.length)
    }
  } catch (e) {
    console.error('WidgetsLibrary: Error loading projects:', e)
    availableProjects.value = []
  }
}

// Watchers
watch([selectedCategory, statusFilter, compatibilityFilter, sortBy], () => {
  currentPage.value = 1
})

watch(activeTab, () => {
  currentPage.value = 1
})

onErrorCaptured((err, instance, info) => {
  const componentName = instance?.type?.name || instance?.proxy?.$options?.name || 'UnknownComponent'
  const componentFile = instance?.type?.__file || 'UnknownFile'
  console.error('WidgetsLibrary: error captured', {
    message: err?.message,
    name: err?.name,
    stack: err?.stack,
    info,
    componentName,
    componentFile
  })
  return false
})

// Lifecycle
onMounted(async () => {
  try {
    await loadWidgets()
    await loadCategories()
    await loadProjects()
    await loadInstalledWidgetsFromAPI()
    loadFavorites()
  } catch (e) {
    console.error('WidgetsLibrary: onMounted error:', e)
  }
})
</script>

<style scoped>
.marketplace-container {
  @apply min-h-screen bg-gray-50;
}

.marketplace-header {
  @apply bg-white border-b border-gray-200 px-6 py-8;
}

.header-content {
  @apply max-w-7xl mx-auto;
}

.title-section {
  @apply mb-6;
}

.marketplace-title {
  @apply text-3xl font-bold text-gray-900 mb-2;
}

.marketplace-subtitle {
  @apply text-lg text-gray-600;
}

.search-section {
  @apply max-w-2xl;
}

.search-bar {
  @apply relative;
}

.search-icon {
  @apply absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg;
}

.search-input {
  @apply w-full pl-12 pr-12 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.clear-search {
  @apply absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600;
}

.tabs-navigation {
  @apply bg-white border-b border-gray-200 px-6;
}

.tab-button {
  @apply inline-flex items-center gap-2 px-6 py-4 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 transition-colors;
}

.tab-button.active {
  @apply text-blue-600 border-blue-600;
}

.tab-count {
  @apply bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs;
}

.tab-button.active .tab-count {
  @apply bg-blue-100 text-blue-600;
}

.marketplace-content {
  @apply flex max-w-7xl mx-auto;
}

.marketplace-sidebar {
  @apply w-80 bg-white border-r border-gray-200 p-6 space-y-8;
}

.filter-section {
  @apply space-y-4;
}

.filter-title {
  @apply text-lg font-semibold text-gray-900;
}

.category-list {
  @apply space-y-1;
}

.category-item {
  @apply w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors;
}

.category-item.active {
  @apply bg-blue-50 text-blue-700;
}

.category-count {
  @apply ml-auto text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full;
}

.category-item.active .category-count {
  @apply bg-blue-100 text-blue-600;
}

.filter-group {
  @apply space-y-2;
}

.filter-label {
  @apply block text-sm font-medium text-gray-700;
}

.filter-select {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.popular-widgets {
  @apply space-y-3;
}

.popular-widget-item {
  @apply flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors;
}

.widget-icon {
  @apply w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white;
}

.widget-info {
  @apply flex-1 min-w-0;
}

.widget-name {
  @apply font-medium text-gray-900 truncate;
}

.stars {
  @apply flex gap-1;
}

.stars i {
  @apply text-gray-300 text-sm;
}

.stars i.filled {
  @apply text-yellow-400;
}

.widgets-main {
  @apply flex-1 p-6 space-y-8;
}

.featured-section {
  @apply space-y-6;
}

.section-title {
  @apply text-2xl font-bold text-gray-900;
}

.featured-carousel {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.featured-card {
  @apply bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer overflow-hidden;
}

.featured-image {
  @apply relative h-48 bg-gradient-to-br from-blue-500 to-purple-600;
}

.featured-image img {
  @apply w-full h-full object-cover;
}

.featured-overlay {
  @apply absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity;
}

.featured-action {
  @apply bg-white text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2;
}

.featured-info {
  @apply p-6;
}

.featured-title {
  @apply text-xl font-semibold text-gray-900 mb-2;
}

.featured-description {
  @apply text-gray-600 mb-4;
}

.featured-meta {
  @apply flex items-center justify-between;
}

.rating {
  @apply flex items-center gap-2;
}

.rating-text {
  @apply text-sm text-gray-600;
}

.price .free {
  @apply text-green-600 font-medium;
}

.price .paid {
  @apply text-gray-900 font-semibold;
}

.widgets-grid-section {
  @apply space-y-6;
}

.section-header {
  @apply flex items-center justify-between;
}

.view-controls {
  @apply flex gap-2;
}

.view-btn {
  @apply p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors;
}

.view-btn.active {
  @apply bg-blue-50 border-blue-300 text-blue-600;
}

.loading-state {
  @apply flex flex-col items-center justify-center py-16 text-gray-500;
}

.loading-spinner {
  @apply w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-16 text-center;
}

.empty-icon {
  @apply text-6xl text-gray-300 mb-4;
}

.empty-state h3 {
  @apply text-xl font-semibold text-gray-900 mb-2;
}

.empty-state p {
  @apply text-gray-600 mb-6;
}

.widgets-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6;
}

.widgets-grid.list-view {
  @apply grid-cols-1;
}

.widget-card {
  @apply bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden;
}

.widget-image {
  @apply relative h-48 bg-gradient-to-br from-gray-100 to-gray-200;
}

.widget-image img {
  @apply w-full h-full object-cover;
}

.widget-overlay {
  @apply absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity;
}

.preview-btn, .install-btn, .installed-btn {
  @apply bg-white text-gray-900 p-3 rounded-full hover:bg-gray-100 transition-colors;
}

.installed-btn {
  @apply bg-green-100 text-green-600;
}

.widget-badges {
  @apply absolute top-3 left-3 flex flex-col gap-2;
}

.badge {
  @apply px-2 py-1 text-xs font-medium rounded-full;
}

.badge.free {
  @apply bg-green-100 text-green-800;
}

.badge.premium {
  @apply bg-purple-100 text-purple-800;
}

.badge.new {
  @apply bg-blue-100 text-blue-800;
}

.badge.installed {
  @apply bg-gray-100 text-gray-800;
}

.widget-info {
  @apply p-6;
}

.widget-header {
  @apply flex items-start gap-3 mb-3;
}

.widget-details {
  @apply flex-1 min-w-0;
}

.widget-name {
  @apply text-lg font-semibold text-gray-900 mb-1;
}

.widget-category {
  @apply text-sm text-gray-500;
}

.widget-description {
  @apply text-gray-600 text-sm mb-4 line-clamp-2;
}

.widget-meta {
  @apply space-y-3 mb-4;
}

.widget-stats {
  @apply flex items-center gap-4 text-sm text-gray-500;
}

.widget-actions {
  @apply flex items-center gap-3;
}

.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors;
}

.btn-install {
  @apply flex-1 flex items-center justify-center gap-2;
}

.btn-installed {
  @apply flex-1 flex items-center justify-center gap-2;
}

.btn-favorite {
  @apply p-2 text-gray-400 hover:text-red-500 transition-colors;
}

.btn-favorite.active {
  @apply text-red-500;
}

.pagination {
  @apply flex items-center justify-center gap-4 mt-8;
}

.pagination-btn {
  @apply flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed;
}

.pagination-pages {
  @apply flex gap-2;
}

.pagination-page {
  @apply w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50;
}

.pagination-page.active {
  @apply bg-blue-600 text-white border-blue-600;
}

/* Responsive */
@media (max-width: 1024px) {
  .marketplace-content {
    @apply flex-col;
  }
  
  .marketplace-sidebar {
    @apply w-full border-r-0 border-b border-gray-200;
  }
  
  .widgets-grid {
    @apply grid-cols-1 md:grid-cols-2 lg:grid-cols-3;
  }
}

@media (max-width: 768px) {
  .marketplace-header {
    @apply px-4 py-6;
  }
  
  .widgets-main {
    @apply p-4;
  }
  
  .marketplace-sidebar {
    @apply p-4;
  }
  
  .featured-carousel {
    @apply grid-cols-1;
  }
  
  .widgets-grid {
    @apply grid-cols-1 md:grid-cols-2;
  }
}
</style>

<script>
const confirmUninstall = (widget) => {
  try {
    const ok = window.confirm(tt('widgets.marketplace.confirmUninstall', 'Confirmer la désinstallation ?'))
    if (ok) uninstallWidget(widget)
  } catch (e) {
    uninstallWidget(widget)
  }
}
</script>