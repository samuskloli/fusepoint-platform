<template>
  <BaseWidget
    :title="t('widgets.team.title')"
    :loading="loading"
    :error="error"
    :config="widgetConfig"
    @refresh="handleRefresh"
    @configure="showConfigModal = true"
    @export="handleExport"
    class="team-widget"
  >
    <!-- Barre d'outils -->
    <template #toolbar>
      <div class="toolbar">
        <!-- Recherche -->
        <div class="search-section">
          <div class="search-input">
            <i class="fas fa-search"></i>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('widgets.team.searchMembers')"
              class="search-field"
            />
          </div>
        </div>
        
        <!-- Filtres -->
        <div class="filters-section">
          <select v-model="selectedDepartment" class="filter-select">
            <option value="">{{ t('widgets.team.allDepartments') }}</option>
            <option v-for="dept in departments" :key="dept" :value="dept">
              {{ t(`widgets.team.departments.${dept}`) }}
            </option>
          </select>
          
          <select v-model="selectedRole" class="filter-select">
            <option value="">{{ t('widgets.team.allRoles') }}</option>
            <option v-for="role in roles" :key="role" :value="role">
              {{ t(`widgets.team.roles.${role}`) }}
            </option>
          </select>
          
          <select v-model="selectedStatus" class="filter-select">
            <option value="">{{ t('widgets.team.allStatuses') }}</option>
            <option v-for="status in statuses" :key="status" :value="status">
              {{ t(`widgets.team.statuses.${status}`) }}
            </option>
          </select>
        </div>
        
        <!-- Actions -->
        <div class="actions-section">
          <button @click="showAddModal = true" class="btn-primary">
            <i class="fas fa-plus"></i>
            {{ t('widgets.team.addMember') }}
          </button>
          
          <div class="view-toggle">
            <button
              @click="currentView = 'grid'"
              class="view-btn"
              :class="{ 'active': currentView === 'grid' }"
              :title="t('widgets.team.gridView')"
            >
              <i class="fas fa-th"></i>
            </button>
            <button
              @click="currentView = 'list'"
              class="view-btn"
              :class="{ 'active': currentView === 'list' }"
              :title="t('widgets.team.listView')"
            >
              <i class="fas fa-list"></i>
            </button>
            <button
              @click="currentView = 'org'"
              class="view-btn"
              :class="{ 'active': currentView === 'org' }"
              :title="t('widgets.team.orgChart')"
            >
              <i class="fas fa-sitemap"></i>
            </button>
          </div>
        </div>
      </div>
    </template>
    
    <!-- Statistiques -->
    <template #stats v-if="config.showStats">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalMembers }}</div>
            <div class="stat-label">{{ t('widgets.team.totalMembers') }}</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon active">
            <i class="fas fa-user-check"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.activeMembers }}</div>
            <div class="stat-label">{{ t('widgets.team.activeMembers') }}</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon departments">
            <i class="fas fa-building"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.departments }}</div>
            <div class="stat-label">{{ t('widgets.team.departments') }}</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon new">
            <i class="fas fa-user-plus"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.newThisMonth }}</div>
            <div class="stat-label">{{ t('widgets.team.newThisMonth') }}</div>
          </div>
        </div>
      </div>
    </template>
    
    <!-- Contenu principal -->
    <div class="team-content">
      <!-- Vue grille -->
      <div v-if="currentView === 'grid'" class="grid-view">
        <div class="members-grid">
          <MemberCard
            v-for="member in filteredMembers"
            :key="member.id"
            :member="member"
            @edit="handleEditMember"
            @delete="handleDeleteMember"
            @view-details="handleViewDetails"
            @update-status="handleUpdateStatus"
          />
        </div>
      </div>
      
      <!-- Vue liste -->
      <div v-else-if="currentView === 'list'" class="list-view">
        <MemberList
          :members="filteredMembers"
          :sort-by="sortBy"
          :sort-order="sortOrder"
          @sort="handleSort"
          @edit="handleEditMember"
          @delete="handleDeleteMember"
          @view-details="handleViewDetails"
          @update-status="handleUpdateStatus"
        />
      </div>
      
      <!-- Organigramme -->
      <div v-else-if="currentView === 'org'" class="org-view">
        <OrgChart
          :members="filteredMembers"
          @edit="handleEditMember"
          @view-details="handleViewDetails"
        />
      </div>
      
      <!-- État vide -->
      <div v-if="filteredMembers.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-users"></i>
        </div>
        <h3 class="empty-title">{{ t('widgets.team.noMembers') }}</h3>
        <p class="empty-description">{{ t('widgets.team.noMembersDesc') }}</p>
        <button @click="showAddModal = true" class="btn-primary">
          <i class="fas fa-plus"></i>
          {{ t('widgets.team.addFirstMember') }}
        </button>
      </div>
    </div>
    
    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        @click="currentPage--"
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      
      <span class="pagination-info">
        {{ t('widgets.team.pageInfo', { current: currentPage, total: totalPages }) }}
      </span>
      
      <button
        @click="currentPage++"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </BaseWidget>
  
  <!-- Modales -->
  <AddMemberModal
    v-if="showAddModal"
    @close="showAddModal = false"
    @add="handleAddMember"
  />
  
  <EditMemberModal
    v-if="showEditModal && selectedMember"
    :member="selectedMember"
    @close="showEditModal = false"
    @update="handleUpdateMember"
  />
  
  <MemberDetailsModal
    v-if="showDetailsModal && selectedMember"
    :member="selectedMember"
    @close="showDetailsModal = false"
    @edit="handleEditFromDetails"
  />
  
  <TeamConfigModal
    v-if="showConfigModal"
    :config="config"
    @close="showConfigModal = false"
    @save="handleSaveConfig"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useWidget } from '@/components/widgets/shared/composables'
import { WidgetApiService } from '@/components/widgets/shared/services'
import { useTranslation } from '@/composables/useTranslation'
import BaseWidget from '@/components/widgets/shared/components/BaseWidget.vue'
import MemberCard from './components/MemberCard.vue'
import MemberList from './components/MemberList.vue'
import OrgChart from './components/OrgChart.vue'
import AddMemberModal from './components/AddMemberModal.vue'
import EditMemberModal from './components/EditMemberModal.vue'
import MemberDetailsModal from './components/MemberDetailsModal.vue'
import TeamConfigModal from './components/TeamConfigModal.vue'
import type {
  TeamMember,
  TeamStats,
  TeamWidgetConfig,
  CreateMemberData,
  UpdateMemberData,
  MemberFilter
} from './types'

interface Props {
  widgetId: string
  initialConfig?: Partial<TeamWidgetConfig>
}

const props = defineProps<Props>()
const { t } = useTranslation()

// Composable du widget
const {
  loading,
  error,
  data: members,
  config,
  widgetConfig,
  loadData,
  updateData,
  updateConfig
} = useWidget<TeamMember[], TeamWidgetConfig>(props.widgetId, {
  defaultView: 'grid',
  showStats: true,
  showFilters: true,
  showSearch: true,
  itemsPerPage: 12,
  sortBy: 'name',
  sortOrder: 'asc',
  showDepartments: true,
  showRoles: true,
  showStatus: true,
  showAvatar: true,
  showContactInfo: true,
  enableExport: true,
  ...props.initialConfig
})

// État local
const currentView = ref(config.value.defaultView)
const searchQuery = ref('')
const selectedDepartment = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')
const sortBy = ref(config.value.sortBy)
const sortOrder = ref<'asc' | 'desc'>(config.value.sortOrder)
const currentPage = ref(1)
const selectedMember = ref<TeamMember | null>(null)

// Modales
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDetailsModal = ref(false)
const showConfigModal = ref(false)

// Statistiques
const stats = computed<TeamStats>(() => {
  if (!members.value) {
    return {
      totalMembers: 0,
      activeMembers: 0,
      departments: 0,
      newThisMonth: 0
    }
  }
  
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  return {
    totalMembers: members.value.length,
    activeMembers: members.value.filter(m => m.status === 'active').length,
    departments: new Set(members.value.map(m => m.department)).size,
    newThisMonth: members.value.filter(m => new Date(m.joinDate) >= thisMonth).length
  }
})

// Options de filtrage
const departments = computed(() => {
  if (!members.value) return []
  return [...new Set(members.value.map(m => m.department))].sort()
})

const roles = computed(() => {
  if (!members.value) return []
  return [...new Set(members.value.map(m => m.role))].sort()
})

const statuses = ['active', 'inactive', 'pending']

// Membres filtrés
const filteredMembers = computed(() => {
  if (!members.value) return []
  
  let filtered = [...members.value]
  
  // Recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(member =>
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.department.toLowerCase().includes(query) ||
      member.role.toLowerCase().includes(query)
    )
  }
  
  // Filtres
  if (selectedDepartment.value) {
    filtered = filtered.filter(member => member.department === selectedDepartment.value)
  }
  
  if (selectedRole.value) {
    filtered = filtered.filter(member => member.role === selectedRole.value)
  }
  
  if (selectedStatus.value) {
    filtered = filtered.filter(member => member.status === selectedStatus.value)
  }
  
  // Tri
  filtered.sort((a, b) => {
    let aValue: any = a[sortBy.value as keyof TeamMember]
    let bValue: any = b[sortBy.value as keyof TeamMember]
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }
    
    if (sortOrder.value === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })
  
  // Pagination
  const startIndex = (currentPage.value - 1) * config.value.itemsPerPage
  const endIndex = startIndex + config.value.itemsPerPage
  
  return filtered.slice(startIndex, endIndex)
})

// Pagination
const totalPages = computed(() => {
  if (!members.value) return 1
  return Math.ceil(members.value.length / config.value.itemsPerPage)
})

// Charger les données
const fetchMembers = async () => {
  try {
    const response = await WidgetApiService.fetchData(props.widgetId, {
      page: currentPage.value,
      limit: config.value.itemsPerPage,
      search: searchQuery.value,
      department: selectedDepartment.value,
      role: selectedRole.value,
      status: selectedStatus.value,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    })
    
    updateData(response.data)
  } catch (err) {
    console.error('Erreur lors du chargement des membres:', err)
  }
}

// Actions
const handleRefresh = () => {
  fetchMembers()
}

const handleSort = (field: string) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
  currentPage.value = 1
  fetchMembers()
}

const handleAddMember = async (memberData: CreateMemberData) => {
  try {
    const newMember = await WidgetApiService.createItem(props.widgetId, memberData)
    if (members.value) {
      updateData([...members.value, newMember])
    }
    showAddModal.value = false
  } catch (err) {
    console.error('Erreur lors de l\'ajout du membre:', err)
  }
}

const handleEditMember = (member: TeamMember) => {
  selectedMember.value = member
  showEditModal.value = true
}

const handleUpdateMember = async (memberData: UpdateMemberData) => {
  if (!selectedMember.value || !members.value) return
  
  try {
    const updatedMember = await WidgetApiService.updateItem(
      props.widgetId,
      selectedMember.value.id,
      memberData
    )
    
    const index = members.value.findIndex(m => m.id === selectedMember.value!.id)
    if (index !== -1) {
      const newMembers = [...members.value]
      newMembers[index] = updatedMember
      updateData(newMembers)
    }
    
    showEditModal.value = false
    selectedMember.value = null
  } catch (err) {
    console.error('Erreur lors de la mise à jour du membre:', err)
  }
}

const handleDeleteMember = async (member: TeamMember) => {
  if (!confirm(t('widgets.team.confirmDelete', { name: member.name }))) {
    return
  }
  
  try {
    await WidgetApiService.deleteItem(props.widgetId, member.id)
    
    if (members.value) {
      updateData(members.value.filter(m => m.id !== member.id))
    }
  } catch (err) {
    console.error('Erreur lors de la suppression du membre:', err)
  }
}

const handleViewDetails = (member: TeamMember) => {
  selectedMember.value = member
  showDetailsModal.value = true
}

const handleEditFromDetails = () => {
  showDetailsModal.value = false
  showEditModal.value = true
}

const handleUpdateStatus = async (member: TeamMember, status: string) => {
  try {
    await handleUpdateMember({ status })
  } catch (err) {
    console.error('Erreur lors de la mise à jour du statut:', err)
  }
}

const handleSaveConfig = (newConfig: TeamWidgetConfig) => {
  updateConfig(newConfig)
  currentView.value = newConfig.defaultView
  sortBy.value = newConfig.sortBy
  sortOrder.value = newConfig.sortOrder
}

const handleExport = async () => {
  try {
    const data = await WidgetApiService.exportData(props.widgetId, 'csv')
    // Logique d'export
    console.log('Export des données:', data)
  } catch (err) {
    console.error('Erreur lors de l\'export:', err)
  }
}

// Watchers
watch([searchQuery, selectedDepartment, selectedRole, selectedStatus], () => {
  currentPage.value = 1
  fetchMembers()
}, { debounce: 300 })

watch(currentPage, () => {
  fetchMembers()
})

// Initialisation
onMounted(() => {
  loadData(fetchMembers)
})
</script>

<style scoped>
.team-widget {
  @apply h-full;
}

.toolbar {
  @apply flex items-center justify-between gap-4 p-4 bg-gray-50 border-b border-gray-200;
}

.search-section {
  @apply flex-1 max-w-md;
}

.search-input {
  @apply relative;
}

.search-input i {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400;
}

.search-field {
  @apply w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.filters-section {
  @apply flex items-center gap-2;
}

.filter-select {
  @apply px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.actions-section {
  @apply flex items-center gap-3;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2;
}

.view-toggle {
  @apply flex items-center border border-gray-300 rounded-lg overflow-hidden;
}

.view-btn {
  @apply px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors;
}

.view-btn.active {
  @apply bg-blue-600 text-white;
}

.stats-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4;
}

.stat-card {
  @apply bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-3;
}

.stat-icon {
  @apply w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center;
}

.stat-icon.active {
  @apply bg-green-100 text-green-600;
}

.stat-icon.departments {
  @apply bg-purple-100 text-purple-600;
}

.stat-icon.new {
  @apply bg-orange-100 text-orange-600;
}

.stat-content {
  @apply flex-1;
}

.stat-value {
  @apply text-2xl font-bold text-gray-900;
}

.stat-label {
  @apply text-sm text-gray-600;
}

.team-content {
  @apply flex-1 p-4;
}

.members-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-12 text-center;
}

.empty-icon {
  @apply w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4;
}

.empty-title {
  @apply text-lg font-medium text-gray-900 mb-2;
}

.empty-description {
  @apply text-gray-600 mb-4;
}

.pagination {
  @apply flex items-center justify-center gap-4 p-4 border-t border-gray-200;
}

.pagination-btn {
  @apply p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}

.pagination-info {
  @apply text-sm text-gray-600;
}
</style>