<template>
  <BaseWidget 
    :widget="widgetConfig"
    :loading="isLoading"
    :error="error"
    @configure="showConfigModal = true"
    @toggle="toggleWidget"
    @retry="loadDeliverables"
  >
    <div class="deliverables-widget">
      <!-- Header -->
      <div class="dw-header">
        <div class="header-left">
          <h3 class="dw-title">{{ t('widgets.deliverables.title') }}</h3>
          <div class="dw-stats">
            <span class="stat-item">
              <i class="fas fa-box mr-1"></i>
              {{ totalDeliverables }} {{ t('widgets.deliverables.total') }}
            </span>
            <span class="stat-item" v-if="approvedCount > 0">
              <i class="fas fa-check mr-1"></i>
              {{ approvedCount }} {{ t('widgets.deliverables.approved') }}
            </span>
            <span class="stat-item" v-if="pendingCount > 0">
              <i class="fas fa-hourglass-half mr-1"></i>
              {{ pendingCount }} {{ t('widgets.deliverables.pending') }}
            </span>
          </div>
        </div>
        <div class="header-right">
          <button 
            @click="showAddModal = true" 
            class="btn-primary btn-sm"
            :title="t('widgets.deliverables.addDeliverable')"
          >
            <i class="fas fa-plus mr-1"></i>
            {{ t('widgets.deliverables.add') }}
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="dw-filters">
        <div class="filter-group">
          <select v-model="filterStatus" class="filter-select">
            <option value="all">{{ t('widgets.deliverables.filters.allStatuses') }}</option>
            <option value="pending">{{ t('widgets.deliverables.status.pending') }}</option>
            <option value="in_review">{{ t('widgets.deliverables.status.in_review') }}</option>
            <option value="approved">{{ t('widgets.deliverables.status.approved') }}</option>
            <option value="rejected">{{ t('widgets.deliverables.status.rejected') }}</option>
          </select>
        </div>
        <div class="filter-group">
          <input 
            v-model="searchQuery" 
            type="text" 
            :placeholder="t('widgets.deliverables.searchPlaceholder')"
            class="filter-input"
          >
        </div>
      </div>

      <!-- Timeline -->
      <div class="dw-timeline">
        <div v-if="filteredDeliverables.length === 0" class="empty-state">
          <i class="fas fa-clipboard-check"></i>
          <p>{{ t('widgets.deliverables.noDeliverables') }}</p>
        </div>
        
        <div v-else class="timeline-items">
          <div 
            v-for="item in paginatedDeliverables" 
            :key="item.id" 
            class="timeline-item"
          >
            <div class="timeline-marker" :class="`marker-${item.status}`">
              <i :class="getStatusIcon(item.status)"></i>
            </div>
            <div class="timeline-content">
              <div class="item-header">
                <div class="item-info">
                  <h4 class="item-title">{{ item.title }}</h4>
                  <div class="item-badges">
                    <span class="status-badge" :class="`status-${item.status}`">
                      {{ t(`widgets.deliverables.status.${item.status}`) }}
                    </span>
                    <span v-if="item.version" class="version-badge">
                      <i class="fas fa-tag mr-1"></i>
                      {{ item.version }}
                    </span>
                  </div>
                </div>
                <div class="item-date">{{ formatDate(item.due_date) }}</div>
              </div>

              <p class="item-description">{{ item.description }}</p>

              <div class="item-actions">
                <button 
                  v-if="item.status === 'pending' || item.status === 'in_review'" 
                  @click="openApprove(item)" 
                  class="btn-success btn-sm"
                >
                  <i class="fas fa-check mr-1"></i>
                  {{ t('widgets.deliverables.actions.approve') }}
                </button>
                <button 
                  v-if="item.status === 'pending' || item.status === 'in_review'" 
                  @click="openReject(item)" 
                  class="btn-danger btn-sm"
                >
                  <i class="fas fa-times mr-1"></i>
                  {{ t('widgets.deliverables.actions.reject') }}
                </button>
                <button 
                  @click="selectDeliverable(item)" 
                  class="btn-secondary btn-sm"
                >
                  <i class="fas fa-eye mr-1"></i>
                  {{ t('widgets.deliverables.actions.viewDetails') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button @click="currentPage--" :disabled="currentPage === 1" class="btn-secondary btn-sm">
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="pagination-info">{{ currentPage }} / {{ totalPages }}</span>
        <button @click="currentPage++" :disabled="currentPage === totalPages" class="btn-secondary btn-sm">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Add Deliverable Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ t('widgets.deliverables.addDeliverable') }}</h3>
          <button @click="showAddModal = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitDeliverable">
            <div class="form-group">
              <label>{{ t('widgets.deliverables.fields.title') }}</label>
              <input v-model="newDeliverable.title" type="text" required />
            </div>
            <div class="form-group">
              <label>{{ t('widgets.deliverables.fields.description') }}</label>
              <textarea v-model="newDeliverable.description" rows="3" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('widgets.deliverables.fields.dueDate') }}</label>
                <input v-model="newDeliverable.due_date" type="date" />
              </div>
              <div class="form-group">
                <label>{{ t('widgets.deliverables.fields.version') }}</label>
                <input v-model="newDeliverable.version" type="text" placeholder="v1.0.0" />
              </div>
            </div>
            <div class="form-actions">
              <button type="button" @click="showAddModal = false" class="btn-secondary">
                {{ t('common.cancel') }}
              </button>
              <button type="submit" class="btn-primary">
                {{ t('common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Approve Modal -->
    <div v-if="showApproveModal" class="modal-overlay" @click="closeApprove">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ t('widgets.deliverables.actions.approve') }}</h3>
          <button @click="closeApprove" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ t('widgets.deliverables.approveConfirmation', { title: selectedDeliverable?.title || '' }) }}</p>
          <div class="form-actions">
            <button type="button" @click="closeApprove" class="btn-secondary">
              {{ t('common.cancel') }}
            </button>
            <button type="button" @click="confirmApprove" class="btn-success">
              {{ t('widgets.deliverables.actions.approve') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="modal-overlay" @click="closeReject">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ t('widgets.deliverables.actions.reject') }}</h3>
          <button @click="closeReject" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ t('widgets.deliverables.rejectPrompt') }}</p>
          <div class="form-group">
            <label>{{ t('widgets.deliverables.fields.reason') }}</label>
            <textarea v-model="rejectReason" rows="3" />
          </div>
          <div class="form-actions">
            <button type="button" @click="closeReject" class="btn-secondary">
              {{ t('common.cancel') }}
            </button>
            <button type="button" @click="confirmReject" class="btn-danger">
              {{ t('widgets.deliverables.actions.reject') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Config Modal -->
    <WidgetConfigModal 
      v-if="showConfigModal"
      :widget="widgetConfig"
      :options="configOptions"
      @close="showConfigModal = false"
      @save="updateConfig"
    />
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import BaseWidget from '@/components/widgets/shared/components/BaseWidget.vue'
import WidgetConfigModal from '@/components/modals/WidgetConfigModal.vue'
import { useTranslation } from '@/composables/useTranslation'
import { useNotifications } from '@/composables/useNotifications'
import widgetDataService from '@/services/widgetDataService'

interface Deliverable {
  id: number
  title: string
  description: string
  status: 'pending' | 'in_review' | 'approved' | 'rejected'
  due_date: string
  version?: string
  submitted_by?: string
  submitted_at?: string
  approved_at?: string
  rejection_reason?: string
}

interface Props {
  projectId: string
  widgetData?: any
  widget?: any
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'widget-updated': [widget: any] }>()

const { t } = useTranslation()
const { success: showNotification, error: showError } = useNotifications()

// State
const isLoading = ref(false)
const error = ref<string | null>(null)
const deliverables = ref<Deliverable[]>([])
const filterStatus = ref('all')
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(6)

const showAddModal = ref(false)
const showConfigModal = ref(false)
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const selectedDeliverable = ref<Deliverable | null>(null)
const rejectReason = ref('')

const widgetConfig = ref({
  ...props.widget,
  title: props.widget?.title || t('widgets.deliverables.title'),
  isEnabled: props.widget?.is_enabled ?? true
})

const totalDeliverables = computed(() => deliverables.value.length)
const approvedCount = computed(() => deliverables.value.filter(d => d.status === 'approved').length)
const pendingCount = computed(() => deliverables.value.filter(d => d.status === 'pending').length)

const filteredDeliverables = computed(() => {
  let items = deliverables.value
  if (filterStatus.value !== 'all') {
    items = items.filter(d => d.status === filterStatus.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    items = items.filter(d => 
      d.title.toLowerCase().includes(q) ||
      (d.description || '').toLowerCase().includes(q) ||
      (d.version || '').toLowerCase().includes(q)
    )
  }
  return items.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
})

const totalPages = computed(() => Math.ceil(filteredDeliverables.value.length / itemsPerPage.value))
const paginatedDeliverables = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredDeliverables.value.slice(start, end)
})

const configOptions = computed(() => [
  {
    key: 'autoRefresh',
    label: t('widgets.deliverables.config.autoRefresh'),
    type: 'boolean',
    value: widgetConfig.value.autoRefresh
  },
  {
    key: 'showVersions',
    label: t('widgets.deliverables.config.showVersions'),
    type: 'boolean',
    value: widgetConfig.value.showVersions ?? true
  }
])

const loadDeliverables = async () => {
  try {
    isLoading.value = true
    error.value = null
    const data = await widgetDataService.getDeliverablesData(props.projectId)
    deliverables.value = (data.deliverables || []).map((d: any, idx: number) => ({
      id: (d.id ?? (Date.now() + idx)) as number,
      title: d.title ?? '',
      description: d.description ?? '',
      status: (d.status ?? 'pending') as Deliverable['status'],
      due_date: d.due_date ?? new Date().toISOString().split('T')[0],
      version: d.version,
      submitted_by: d.submitted_by,
      submitted_at: d.submitted_at,
      approved_at: d.approved_at,
      rejection_reason: d.rejection_reason
    }))
  } catch (err) {
    console.error('Erreur lors du chargement des livrables:', err)
    error.value = t('widgets.deliverables.loadError')
    showError(t('widgets.deliverables.loadError'))
  } finally {
    isLoading.value = false
  }
}

const openApprove = (item: Deliverable) => {
  selectedDeliverable.value = item
  showApproveModal.value = true
}
const closeApprove = () => {
  selectedDeliverable.value = null
  showApproveModal.value = false
}
const confirmApprove = async () => {
  if (!selectedDeliverable.value) return
  try {
    isLoading.value = true
    const res = await widgetDataService.updateDeliverableStatus(props.projectId, selectedDeliverable.value.id, 'approved')
    if (res.success) {
      await loadDeliverables()
      showNotification(t('widgets.deliverables.approvedSuccess'))
      closeApprove()
    } else {
      throw new Error(res.error || 'Error approving')
    }
  } catch (err) {
    console.error('Approve error:', err)
    showError(t('widgets.deliverables.updateError'))
  } finally {
    isLoading.value = false
  }
}

const openReject = (item: Deliverable) => {
  selectedDeliverable.value = item
  rejectReason.value = ''
  showRejectModal.value = true
}
const closeReject = () => {
  selectedDeliverable.value = null
  showRejectModal.value = false
}
const confirmReject = async () => {
  if (!selectedDeliverable.value) return
  try {
    isLoading.value = true
    const res = await widgetDataService.updateDeliverableStatus(props.projectId, selectedDeliverable.value.id, 'rejected', rejectReason.value)
    if (res.success) {
      await loadDeliverables()
      showNotification(t('widgets.deliverables.rejectedSuccess'))
      closeReject()
    } else {
      throw new Error(res.error || 'Error rejecting')
    }
  } catch (err) {
    console.error('Reject error:', err)
    showError(t('widgets.deliverables.updateError'))
  } finally {
    isLoading.value = false
  }
}

const newDeliverable = ref<Partial<Deliverable>>({
  title: '',
  description: '',
  status: 'pending',
  due_date: new Date().toISOString().split('T')[0],
  version: ''
})

const submitDeliverable = async () => {
  try {
    isLoading.value = true
    const res = await widgetDataService.addDeliverable(props.projectId, newDeliverable.value)
    if (res.success) {
      await loadDeliverables()
      newDeliverable.value = {
        title: '',
        description: '',
        status: 'pending',
        due_date: new Date().toISOString().split('T')[0],
        version: ''
      }
      showAddModal.value = false
      showNotification(t('widgets.deliverables.created'))
    } else {
      throw new Error(res.error || 'Error creating deliverable')
    }
  } catch (err) {
    console.error('Create deliverable error:', err)
    showError(t('widgets.deliverables.createError'))
  } finally {
    isLoading.value = false
  }
}

const selectDeliverable = (item: Deliverable) => {
  // Placeholder for details drawer/modal
  console.log('Deliverable selected:', item)
}

const toggleWidget = () => {
  widgetConfig.value.isEnabled = !widgetConfig.value.isEnabled
  const updatedWidget = {
    ...props.widget,
    is_enabled: widgetConfig.value.isEnabled
  }
  emit('widget-updated', updatedWidget)
}

const updateConfig = (newConfig: any) => {
  Object.assign(widgetConfig.value, newConfig)
  showConfigModal.value = false
  showNotification(t('widgets.deliverables.configUpdated'))
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

const getStatusIcon = (status: Deliverable['status']) => {
  const icons: Record<Deliverable['status'], string> = {
    pending: 'fas fa-hourglass-half',
    in_review: 'fas fa-search',
    approved: 'fas fa-check',
    rejected: 'fas fa-times'
  }
  return icons[status] || 'fas fa-clipboard-check'
}

onMounted(() => {
  loadDeliverables()
})

watch(() => props.projectId, () => {
  loadDeliverables()
})

watch([filterStatus, searchQuery], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.deliverables-widget {
  @apply h-full flex flex-col;
}
.dw-header {
  @apply flex items-center justify-between mb-4 pb-3 border-b border-gray-200;
}
.header-left { @apply flex-1; }
.dw-title { @apply text-lg font-semibold text-gray-900 mb-1; }
.dw-stats { @apply flex items-center space-x-4 text-sm text-gray-600; }
.stat-item { @apply flex items-center; }
.dw-filters { @apply flex items-center space-x-3 mb-4; }
.filter-group { @apply flex-1; }
.filter-select, .filter-input { @apply w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent; }
.dw-timeline { @apply flex-1 overflow-hidden; }
.empty-state { @apply flex flex-col items-center justify-center h-full text-gray-500; }
.empty-state i { @apply text-4xl mb-2; }
.timeline-items { @apply space-y-4 max-h-full overflow-y-auto; }
.timeline-item { @apply flex items-start space-x-4 transition-all duration-200 hover:bg-gray-50 p-3 rounded-lg; }
.timeline-marker { @apply flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold; }
.marker-pending { @apply bg-gray-400; }
.marker-in_review { @apply bg-blue-500; }
.marker-approved { @apply bg-green-500; }
.marker-rejected { @apply bg-red-500; }
.timeline-content { @apply flex-1 min-w-0; }
.item-header { @apply flex items-start justify-between mb-2; }
.item-info { @apply flex-1; }
.item-title { @apply text-lg font-bold text-gray-900 mb-1; }
.item-badges { @apply flex items-center space-x-2; }
.status-badge { @apply px-2 py-1 rounded-full text-xs font-medium; }
.status-pending { @apply bg-gray-100 text-gray-800; }
.status-in_review { @apply bg-blue-100 text-blue-800; }
.status-approved { @apply bg-green-100 text-green-800; }
.status-rejected { @apply bg-red-100 text-red-800; }
.version-badge { @apply px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800; }
.item-date { @apply text-sm text-gray-500 font-medium; }
.item-description { @apply text-gray-700 mb-3; }
.item-actions { @apply flex items-center space-x-2; }
.pagination { @apply flex items-center justify-center space-x-2 mt-4 pt-3 border-t border-gray-200; }
.pagination-info { @apply text-sm font-medium; }
</style>