<template>
  <RoleLayout>
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold">{{ t('widgets.libraryTitle') }}</h1>
        <p class="text-gray-500">{{ t('widgets.librarySubtitle') }}</p>
      </div>

      <!-- Onglets -->
      <div class="flex items-center gap-2 mb-6">
        <button
          class="px-3 py-2 rounded-md border"
          :class="{ 'bg-blue-600 text-white border-blue-600': activeTab === 'installed' }"
          @click="activeTab = 'installed'"
        >
          {{ t('widgets.installedTab') || 'Widgets installés' }}
        </button>
        <button
          class="px-3 py-2 rounded-md border"
          :class="{ 'bg-blue-600 text-white border-blue-600': activeTab === 'catalog' }"
          @click="activeTab = 'catalog'"
        >
          {{ t('widgets.catalogTab') || 'Librairie' }}
        </button>
        <div v-if="activeTab === 'installed'" class="ml-auto flex items-center gap-2">
          <label class="text-sm text-gray-600">{{ t('widgets.selectProject') }}</label>
          <select class="px-3 py-2 border rounded-md" v-model="selectedProjectId" @change="loadInstalled">
            <option value="">--</option>
            <option v-for="p in agentProjects" :key="p.id" :value="String(p.id)">{{ p.name }}</option>
          </select>
        </div>
      </div>

      <!-- Filtres et tri (catalogue uniquement) -->
      <div v-if="activeTab === 'catalog'" class="flex flex-col lg:flex-row lg:items-end gap-4 mb-6">
        <div class="flex-1">
          <label class="block text-sm text-gray-600 mb-1">{{ t('widgets.search') || t('widgets.searchPlaceholder') }}</label>
          <input
            type="text"
            class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
            :placeholder="t('widgets.searchPlaceholder')"
            v-model="search"
          />
        </div>

        <div class="w-full lg:w-64">
          <label class="block text-sm text-gray-600 mb-1">{{ t('widgets.category') || t('widgets.allCategories') }}</label>
          <select class="w-full px-3 py-2 border rounded-md" v-model="selectedCategory">
            <option value="">{{ t('widgets.allCategories') }}</option>
            <option v-for="cat in categories" :key="cat.value" :value="cat.value">
              {{ t(cat.labelKey || cat.label || cat.value) }}
            </option>
          </select>
        </div>

        <div class="w-full lg:w-52">
          <label class="block text-sm text-gray-600 mb-1">{{ t('widgets.sortBy') }}</label>
          <select class="w-full px-3 py-2 border rounded-md" v-model="sortKey">
            <option value="name">{{ t('widgets.sort.name') }}</option>
            <option value="category">{{ t('widgets.sort.category') }}</option>
            <option value="newest">{{ t('widgets.sort.newest') }}</option>
          </select>
        </div>

        <div class="w-full lg:w-52">
          <label class="block text-sm text-gray-600 mb-1">{{ t('widgets.statusFilter') }}</label>
          <select class="w-full px-3 py-2 border rounded-md" v-model="statusFilter">
            <option value="">{{ t('widgets.filters.all') || 'All' }}</option>
            <option value="installed">{{ t('widgets.status.installed') || 'Installé' }}</option>
            <option value="active">{{ t('widgets.status.active') || 'Active' }}</option>
            <option value="coming_soon">{{ t('widgets.status.comingSoon') || 'Coming soon' }}</option>
          </select>
        </div>

        <div class="w-full lg:w-52">
          <label class="block text-sm text-gray-600 mb-1">{{ t('widgets.compatibilityFilter') }}</label>
          <select class="w-full px-3 py-2 border rounded-md" v-model="compatibilityFilter">
            <option value="">{{ t('widgets.filters.all') || 'All' }}</option>
            <option value="agent">Agent</option>
            <option value="client">Client</option>
            <option value="both">{{ t('widgets.compatibility.both') || 'Agent + Client' }}</option>
          </select>
        </div>

        <div class="flex-1">
          <label class="block text-sm text-gray-600 mb-1">{{ t('widgets.tagsFilter') }}</label>
          <input
            type="text"
            class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
            :placeholder="t('widgets.tagsPlaceholder')"
            v-model="tagsQuery"
          />
        </div>

        <div class="w-full lg:w-40">
          <label class="block text-sm text-gray-600 mb-1">{{ t('widgets.perPage') }}</label>
          <select class="w-full px-3 py-2 border rounded-md" v-model.number="pageSize">
            <option :value="6">6</option>
            <option :value="9">9</option>
            <option :value="12">12</option>
          </select>
        </div>
      </div>

      <div v-if="activeTab === 'installed'">
        <!-- Liste des widgets installés -->
        <div v-if="!currentProjectId" class="text-gray-600">{{ t('widgets.selectProject') }}</div>
        <div v-else>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="entry in installedWidgets" :key="entry.key" class="border rounded-lg p-4 bg-white shadow-sm">
              <div class="flex items-start justify-between gap-3 mb-2">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                    <i v-if="isIconClass(entry.icon)" :class="entry.icon" class="text-xl"></i>
                    <span v-else class="text-gray-600">{{ entry.icon || '🔧' }}</span>
                  </div>
                  <div>
                    <h2 class="font-medium">{{ entry.name }}</h2>
                    <p class="text-sm text-gray-500">{{ entry.description }}</p>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-end gap-2 mt-4">
                <button class="px-3 py-1 text-sm rounded-md bg-red-600 text-white hover:bg-red-700" @click="removeInstalled(entry.key)">
                  {{ t('widgets.remove') || 'Retirer' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Catalogue -->
      <div v-else>
        <div class="flex-1">
          <label class="block text-sm text-gray-600 mb-1">{{ t('widgets.search') || t('widgets.searchPlaceholder') }}</label>
          <input
            type="text"
            class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
            :placeholder="t('widgets.searchPlaceholder')"
            v-model="search"
          />
        </div>

        <div class="w-full lg:w-64">
          <label class="block text-sm text-gray-600 mb-1">{{ t('widgets.category') || t('widgets.allCategories') }}</label>
          <select class="w-full px-3 py-2 border rounded-md" v-model="selectedCategory">
            <option value="">{{ t('widgets.allCategories') }}</option>
            <option v-for="cat in categories" :key="cat.value" :value="cat.value">
              {{ t(cat.labelKey || cat.label || cat.value) }}
            </option>
          </select>
        </div>

        <div class="w-full lg:w-52">
          <label class="block text-sm text-gray-600 mb-1">{{ t('widgets.sortBy') }}</label>
          <select class="w-full px-3 py-2 border rounded-md" v-model="sortKey">
            <option value="name">{{ t('widgets.sort.name') }}</option>
            <option value="category">{{ t('widgets.sort.category') }}</option>
            <option value="newest">{{ t('widgets.sort.newest') }}</option>
          </select>
        </div>

        <div class="w-full lg:w-52">
          <label class="block text-sm text-gray-600 mb-1">{{ t('widgets.statusFilter') }}</label>
          <select class="w-full px-3 py-2 border rounded-md" v-model="statusFilter">
            <option value="">{{ t('widgets.filters.all') || 'All' }}</option>
            <option value="installed">{{ t('widgets.status.installed') || 'Installé' }}</option>
            <option value="active">{{ t('widgets.status.active') || 'Active' }}</option>
            <option value="coming_soon">{{ t('widgets.status.comingSoon') || 'Coming soon' }}</option>
          </select>
        </div>

        <div class="w-full lg:w-52">
          <label class="block text-sm text-gray-600 mb-1">{{ t('widgets.compatibilityFilter') }}</label>
          <select class="w-full px-3 py-2 border rounded-md" v-model="compatibilityFilter">
            <option value="">{{ t('widgets.filters.all') || 'All' }}</option>
            <option value="agent">Agent</option>
            <option value="client">Client</option>
            <option value="both">{{ t('widgets.compatibility.both') || 'Agent + Client' }}</option>
          </select>
        </div>

        <div class="flex-1">
          <label class="block text-sm text-gray-600 mb-1">{{ t('widgets.tagsFilter') }}</label>
          <input
            type="text"
            class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
            :placeholder="t('widgets.tagsPlaceholder')"
            v-model="tagsQuery"
          />
        </div>

        <div class="w-full lg:w-40">
          <label class="block text-sm text-gray-600 mb-1">{{ t('widgets.perPage') }}</label>
          <select class="w-full px-3 py-2 border rounded-md" v-model.number="pageSize">
            <option :value="6">6</option>
            <option :value="9">9</option>
            <option :value="12">12</option>
          </select>
        </div>
      </div>

      <div class="flex items-center justify-between mt-6">
        <div class="text-sm text-gray-500">
          {{ t('widgets.page') }} {{ page }} / {{ totalPages }}
        </div>
        <div class="flex items-center gap-2">
          <button class="px-3 py-1 border rounded" :disabled="page <= 1" @click="page--">Prev</button>
          <button class="px-3 py-1 border rounded" :disabled="page >= totalPages" @click="page++">Next</button>
        </div>
      </div>
    </div>
  </RoleLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useToast } from '@/composables/useToast'
import widgetsCatalogService from '@/services/widgetsCatalogService'
import widgetApiService from '@/components/widgets/shared/services/widgetApiService'
import projectTemplateService from '@/services/projectTemplateService'
import projectManagementService from '@/services/projectManagementService'

const { t } = useI18n()
const { success, error } = useToast()
const route = useRoute()

// Filtres et tri
const search = ref('')
const selectedCategory = ref('')
const sortKey = ref('name')
const statusFilter = ref('')
const compatibilityFilter = ref('')
const tagsQuery = ref('')

// Pagination
const page = ref(1)
const pageSize = ref(9)

// Données
const categories = ref([])
const widgets = ref([])
const loading = ref(false)

// Favoris (localStorage)
const favorites = ref(new Set())
const FAVORITES_KEY = 'widgetFavorites'

// Sélecteurs projet/modèle
const showProjectPicker = ref(false)
const agentProjects = ref([])
const selectedProjectId = ref('')
const pendingWidgetForProject = ref(null)

const showTemplatePicker = ref(false)
const templates = ref([])
const selectedTemplateId = ref('')
const pendingWidgetForTemplate = ref(null)

// Widgets installés (par projet)
const installedTypes = ref(new Set())
const currentProjectId = computed(() => selectedProjectId.value || (route.query.projectId ? String(route.query.projectId) : ''))

const isIconClass = (icon) => {
  if (!icon) return false
  const s = String(icon)
  return s.startsWith('fa') || s.startsWith('mdi') || s.startsWith('icon-')
}

const componentNameToType = (name) => {
  const map = {
    TasksWidget: 'tasks',
    TaskListWidget: 'task_list',
    StatsWidget: 'stats',
    FilesWidget: 'files',
    TeamWidget: 'team',
    CalendarWidget: 'calendar',
    CommentsWidget: 'comments',
    DeliverablesWidget: 'deliverables',
    GoalsWidget: 'goals',
    AIWidget: 'ai',
    HistoryWidget: 'history',
    ChecklistWidget: 'checklist'
  }
  return map[name] || (name ? String(name).replace('Widget', '').toLowerCase() : 'widgets')
}

const isInstalled = (w) => {
  const type = w.type || w.widget_type || componentNameToType(w.component_name)
  return installedTypes.value.has(type)
}

const loadInstalled = async () => {
  installedTypes.value = new Set()
  installedEntries.value = []
  if (!currentProjectId.value) return
  try {
    const dashboardData = await widgetApiService.getProjectDashboardLayout(String(currentProjectId.value))
    const layout = (dashboardData && dashboardData.layout && dashboardData.layout.widgetsLayout) || {}
    const set = new Set()
    const entries = []
    Object.entries(layout).forEach(([key, entry]) => {
      const t = (entry && (entry.widget_type || entry.type)) || ''
      if (t) set.add(String(t))
      entries.push({ key, type: t, config: entry?.widget_config || {}, width: entry?.width, height: entry?.height })
    })
    installedTypes.value = set
    installedEntries.value = entries
  } catch (e) {
    console.warn('Impossible de charger les widgets installés pour le projet', currentProjectId.value, e)
  }
}

// Traitements
const processedWidgets = computed(() => {
  // Base: recherche + catégorie
  const s = search.value.trim().toLowerCase()
  const base = widgets.value.filter(w => {
    const matchesCategory = selectedCategory.value ? (w.category === selectedCategory.value) : true
    const matchesSearch = s
      ? [w.name, w.description, w.component_name].filter(Boolean).some(v => String(v).toLowerCase().includes(s))
      : true
    return matchesCategory && matchesSearch
  })

  // Filtres supplémentaires
  const tagList = tagsQuery.value.split(',').map(v => v.trim().toLowerCase()).filter(Boolean)
  let filtered = base

  // Filtre par statut: inclure cas "installed"
  if (statusFilter.value === 'installed') {
    filtered = base.filter(isInstalled)
  } else if (statusFilter.value) {
    filtered = base.filter(w => String(w.status || '').toLowerCase() === statusFilter.value)
  }

  const byCompat = compatibilityFilter.value ? filtered.filter(w => {
    const compat = (w.compatibility || w.roles || w.permissions?.roles || [])
    const norm = Array.isArray(compat) ? compat.map(String) : []
    if (compatibilityFilter.value === 'both') {
      return norm.includes('agent') && (norm.includes('client') || norm.includes('user'))
    }
    return norm.includes(compatibilityFilter.value)
  }) : filtered
  const byTags = tagList.length ? byCompat.filter(w => {
    const wt = (w.tags || []).map(s => String(s).toLowerCase())
    return tagList.every(tag => wt.includes(tag))
  }) : byCompat

  // Tri
  const sorted = [...byTags].sort((a, b) => {
    if (sortKey.value === 'category') return String(a.category || '').localeCompare(String(b.category || ''))
    if (sortKey.value === 'newest') return (b.created_at || 0) - (a.created_at || 0)
    return String(a.name || '').localeCompare(String(b.name || ''))
  })

  return sorted
})

const totalPages = computed(() => Math.max(1, Math.ceil(processedWidgets.value.length / pageSize.value)))
const paginatedWidgets = computed(() => {
  if (page.value > totalPages.value) page.value = totalPages.value
  const start = (page.value - 1) * pageSize.value
  return processedWidgets.value.slice(start, start + pageSize.value)
})

const displayCategory = (cat) => {
  const found = categories.value.find(c => c.value === cat)
  return found ? t(found.labelKey || found.label || found.value) : (cat || '')
}

const loadFavorites = () => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    const arr = raw ? JSON.parse(raw) : []
    favorites.value = new Set(arr)
  } catch {}
}

const saveFavorites = () => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites.value)))
}

const isFavorite = (w) => {
  const key = w.component_name || w.name
  return favorites.value.has(key)
}

const toggleFavorite = (w) => {
  const key = w.component_name || w.name
  if (favorites.value.has(key)) {
    favorites.value.delete(key)
    saveFavorites()
    success(t('widgets.favoriteRemoved') || 'Removed from favorites')
  } else {
    favorites.value.add(key)
    saveFavorites()
    success(t('widgets.favoriteAdded') || 'Added to favorites')
  }
}

const loadData = async () => {
  loading.value = true
  try {
    loadFavorites()
    const cats = await widgetsCatalogService.getCategories()
    if (cats.success) {
      categories.value = cats.data
    }

    const list = await widgetsCatalogService.getWidgets({ category: selectedCategory.value || undefined })
    if (list.success) {
      widgets.value = list.data
    } else {
      error(list.error || t('widgets.loadError'))
    }
  } catch (e) {
    console.error(e)
    error(t('widgets.loadError'))
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadData()
  await loadInstalled()
})

watch(currentProjectId, async () => {
  await loadInstalled()
})

// Ajout au projet courant (via API dashboard)
const addToProject = async (w) => {
  try {
    const projectIdFromRoute = route.query.projectId ? String(route.query.projectId) : ''
    const targetProjectId = selectedProjectId.value || projectIdFromRoute

    if (!targetProjectId) {
      // Ouvrir sélecteur de projet
      const res = await projectManagementService.getAgentProjects()
      agentProjects.value = res.data || []
      pendingWidgetForProject.value = w
      showProjectPicker.value = true
      return
    }

    // Charger layout courant
    const dashboardData = await widgetApiService.getProjectDashboardLayout(String(targetProjectId))
    const layout = (dashboardData && dashboardData.layout) || { dashboard: {}, layout: {}, widgetsLayout: {} }
    const version = dashboardData?.version || 0

    if (!layout.widgetsLayout) layout.widgetsLayout = {}

    const type = w.type || w.widget_type || componentNameToType(w.component_name)
    const newKey = `${type}:widget_${Date.now()}`
    const count = Object.keys(layout.widgetsLayout).length

    layout.widgetsLayout[newKey] = {
      widget_type: type,
      width: w.default_width ?? 4,
      height: w.default_height ?? 2,
      position_x: 0,
      position_y: count,
      is_enabled: true,
      widget_config: {}
    }

    const ok = await widgetApiService.updateProjectDashboardLayout(String(targetProjectId), layout, version)
    if (ok) {
      success(t('widgets.widgetAdded'))
      selectedProjectId.value = String(targetProjectId)
      await loadInstalled()
    } else {
      error(t('errors.saveFailed') || 'Save failed')
    }
  } catch (e) {
    console.error(e)
    error(t('errors.saveFailed') || 'Save failed')
  }
}

const cancelProjectPicker = () => {
  pendingWidgetForProject.value = null
  showProjectPicker.value = false
}

const confirmProjectPicker = async () => {
  if (!pendingWidgetForProject.value || !selectedProjectId.value) return
  const w = pendingWidgetForProject.value
  pendingWidgetForProject.value = null
  showProjectPicker.value = false
  await addToProject(w)
}

// Ajout à un modèle
const addToTemplate = async (w) => {
  try {
    const tplIdFromRoute = route.query.templateId ? String(route.query.templateId) : ''
    const targetTemplateId = selectedTemplateId.value || tplIdFromRoute

    if (!targetTemplateId) {
      const res = await projectTemplateService.getTemplates()
      templates.value = res.data || []
      pendingWidgetForTemplate.value = w
      showTemplatePicker.value = true
      return
    }

    // Charger widgets du modèle
    const current = await projectTemplateService.getTemplateWidgets(targetTemplateId)
    const arr = current.data || []

    const type = w.type || w.widget_type || componentNameToType(w.component_name)
    const nextOrder = arr.length
    const payload = [
      ...arr,
      {
        id: `tpl_widget_${Date.now()}`,
        widget_type: type,
        component_name: w.component_name,
        position_x: 0,
        position_y: nextOrder,
        width: w.default_width ?? 4,
        height: w.default_height ?? 2,
        is_enabled: true,
        widget_config: {}
      }
    ]

    const ok = await projectTemplateService.updateTemplateWidgets(targetTemplateId, payload)
    if (ok.success) {
      success(t('widgets.widgetAdded'))
    } else {
      error(ok.error || t('errors.saveFailed') || 'Save failed')
    }
  } catch (e) {
    console.error(e)
    error(t('errors.saveFailed') || 'Save failed')
  }
}

const cancelTemplatePicker = () => {
  pendingWidgetForTemplate.value = null
  showTemplatePicker.value = false
}

const confirmTemplatePicker = async () => {
  if (!pendingWidgetForTemplate.value || !selectedTemplateId.value) return
  const w = pendingWidgetForTemplate.value
  pendingWidgetForTemplate.value = null
  showTemplatePicker.value = false
  await addToTemplate(w)
}

// Charger projets agent pour l'onglet installés
onMounted(async () => {
  try {
    const res = await projectManagementService.getAgentProjects()
    agentProjects.value = res.data || []
  } catch {}
})

// Stocker les entrées installées
const installedEntries = ref([])

const installedWidgets = computed(() => {
  // Faire correspondre les entrées installées avec le catalogue pour les métadonnées
  const byType = new Map()
  widgets.value.forEach(w => {
    const type = w.type || w.widget_type || componentNameToType(w.component_name)
    byType.set(type, w)
  })
  return installedEntries.value.map(e => {
    const meta = byType.get(e.type) || {}
    return {
      key: e.key,
      type: e.type,
      name: meta.name || e.type,
      description: meta.description || '',
      icon: meta.icon || '🔧',
      category: meta.category || ''
    }
  })
})

const removeInstalled = async (entryKey) => {
  if (!currentProjectId.value) return
  try {
    const dashboardData = await widgetApiService.getProjectDashboardLayout(String(currentProjectId.value))
    const layout = (dashboardData && dashboardData.layout) || { widgetsLayout: {} }
    if (layout.widgetsLayout && layout.widgetsLayout[entryKey]) {
      delete layout.widgetsLayout[entryKey]
    }
    const ok = await widgetApiService.updateProjectDashboardLayout(String(currentProjectId.value), layout, dashboardData?.version)
    if (ok) {
      success(t('widgets.removeSuccess') || 'Widget retiré')
      await loadInstalled()
    } else {
      error(t('errors.saveFailed') || 'Save failed')
    }
  } catch (e) {
    console.error(e)
    error(t('errors.saveFailed') || 'Save failed')
  }
}
</script>