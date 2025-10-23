<template>
  <div class="multi-tenant-context-selector">
    <!-- Sélecteur de client -->
    <div class="context-selector-section">
      <label for="client-select" class="context-label">
        <i class="fas fa-building"></i>
        {{ $t('multiTenant.client') }}
      </label>
      <select 
        id="client-select"
        v-model="selectedClientId" 
        class="context-select"
        :disabled="isLoading || !canChangeClient"
        @change="onClientChange"
      >
        <option value="">
          {{ $t('multiTenant.selectClient') }}
        </option>
        <option 
          v-for="client in availableClients" 
          :key="client.id" 
          :value="client.id"
        >
          {{ client.name }}
          <span v-if="client.status !== 'active'" class="status-indicator">
            ({{ $t(`status.${client.status}`) }})
          </span>
        </option>
      </select>
    </div>

    <!-- Sélecteur de projet -->
    <div class="context-selector-section">
      <label for="project-select" class="context-label">
        <i class="fas fa-project-diagram"></i>
        {{ $t('multiTenant.project') }}
      </label>
      <select 
        id="project-select"
        v-model="selectedProjectId" 
        class="context-select"
        :disabled="isLoading || !selectedClientId || availableProjects.length === 0"
        @change="onProjectChange"
      >
        <option value="">
          {{ selectedClientId ? $t('multiTenant.selectProject') : $t('multiTenant.selectClientFirst') }}
        </option>
        <option 
          v-for="project in availableProjects" 
          :key="project.id" 
          :value="project.id"
        >
          {{ project.name }}
          <span v-if="project.status !== 'active'" class="status-indicator">
            ({{ $t(`status.${project.status}`) }})
          </span>
        </option>
      </select>
    </div>

    <!-- Indicateur de contexte actuel -->
    <div v-if="isContextValid" class="context-indicator">
      <div class="context-info">
        <i class="fas fa-check-circle text-success"></i>
        <span class="context-text">
          {{ currentClient?.name }} / {{ currentProject?.name }}
        </span>
      </div>
      <button 
        v-if="canClearContext" 
        @click="clearContext" 
        class="btn-clear-context"
        :title="$t('multiTenant.clearContext')"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Messages d'erreur -->
    <div v-if="error" class="context-error">
      <i class="fas fa-exclamation-triangle"></i>
      {{ error }}
    </div>

    <!-- Indicateur de chargement -->
    <div v-if="isLoading" class="context-loading">
      <i class="fas fa-spinner fa-spin"></i>
      {{ $t('multiTenant.loading') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useMultiTenant, type ClientContext, type ProjectContext } from '@/services/multiTenantService';
import { useAuth } from '@/composables/useAuth';
import { useI18n } from 'vue-i18n';

// Props
interface Props {
  autoSelect?: boolean; // Auto-sélectionner si un seul client/projet disponible
  showClearButton?: boolean; // Afficher le bouton de clear
  compact?: boolean; // Mode compact
}

const props = withDefaults(defineProps<Props>(), {
  autoSelect: false,
  showClearButton: true,
  compact: false
});

// Émissions
const emit = defineEmits<{
  contextChanged: [context: { client: ClientContext | null; project: ProjectContext | null }];
  clientChanged: [client: ClientContext | null];
  projectChanged: [project: ProjectContext | null];
}>();

// Composables
const { t } = useI18n();
const { user } = useAuth();
const {
  currentClient,
  currentProject,
  isContextValid,
  error,
  setClient,
  setProject,
  clearContext: clearMultiTenantContext
} = useMultiTenant();

// État local
const isLoading = ref(false);
const availableClients = ref<ClientContext[]>([]);
const availableProjects = ref<ProjectContext[]>([]);
const selectedClientId = ref<number | ''>('');
const selectedProjectId = ref<number | ''>('');

// Computed
const canChangeClient = computed(() => {
  return user.value?.role === 'admin' || user.value?.role === 'agent';
});

const canClearContext = computed(() => {
  return props.showClearButton && isContextValid.value;
});

// Méthodes
const loadAvailableClients = async () => {
  if (!user.value) return;
  
  isLoading.value = true;
  
  try {
    const response = await fetch('/api/clients', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des clients');
    }
    
    const data = await response.json();
    availableClients.value = data.data || [];
    
    // Auto-sélection si un seul client et autoSelect activé
    if (props.autoSelect && availableClients.value.length === 1) {
      selectedClientId.value = availableClients.value[0].id;
      await onClientChange();
    }
  } catch (err) {
    console.error('Erreur chargement clients:', err);
    availableClients.value = [];
  } finally {
    isLoading.value = false;
  }
};

const loadAvailableProjects = async (clientId: number) => {
  if (!clientId) {
    availableProjects.value = [];
    return;
  }
  
  isLoading.value = true;
  
  try {
    const response = await fetch(`/api/clients/${clientId}/projects`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des projets');
    }
    
    const data = await response.json();
    availableProjects.value = data.data || [];
    
    // Auto-sélection si un seul projet et autoSelect activé
    if (props.autoSelect && availableProjects.value.length === 1) {
      selectedProjectId.value = availableProjects.value[0].id;
      await onProjectChange();
    }
  } catch (err) {
    console.error('Erreur chargement projets:', err);
    availableProjects.value = [];
  } finally {
    isLoading.value = false;
  }
};

const onClientChange = async () => {
  const clientId = selectedClientId.value;
  
  if (!clientId) {
    setClient(null);
    setProject(null);
    selectedProjectId.value = '';
    availableProjects.value = [];
    emit('clientChanged', null);
    emit('contextChanged', { client: null, project: null });
    return;
  }
  
  const client = availableClients.value.find(c => c.id === clientId);
  if (client) {
    setClient(client);
    setProject(null); // Reset project when client changes
    selectedProjectId.value = '';
    emit('clientChanged', client);
    emit('contextChanged', { client, project: null });
    
    // Charger les projets pour ce client
    await loadAvailableProjects(clientId);
  }
};

const onProjectChange = () => {
  const projectId = selectedProjectId.value;
  
  if (!projectId) {
    setProject(null);
    emit('projectChanged', null);
    emit('contextChanged', { client: currentClient.value, project: null });
    return;
  }
  
  const project = availableProjects.value.find(p => p.id === projectId);
  if (project) {
    setProject(project);
    emit('projectChanged', project);
    emit('contextChanged', { client: currentClient.value, project });
  }
};

const clearContext = () => {
  selectedClientId.value = '';
  selectedProjectId.value = '';
  availableProjects.value = [];
  clearMultiTenantContext();
  emit('contextChanged', { client: null, project: null });
};

// Watchers
watch(() => user.value, (newUser) => {
  if (newUser) {
    loadAvailableClients();
  } else {
    clearContext();
  }
}, { immediate: true });

// Synchroniser les sélections avec le contexte actuel
watch(currentClient, (newClient) => {
  if (newClient && selectedClientId.value !== newClient.id) {
    selectedClientId.value = newClient.id;
  } else if (!newClient) {
    selectedClientId.value = '';
  }
});

watch(currentProject, (newProject) => {
  if (newProject && selectedProjectId.value !== newProject.id) {
    selectedProjectId.value = newProject.id;
  } else if (!newProject) {
    selectedProjectId.value = '';
  }
});

// Lifecycle
onMounted(() => {
  // Synchroniser avec le contexte existant
  if (currentClient.value) {
    selectedClientId.value = currentClient.value.id;
    loadAvailableProjects(currentClient.value.id);
  }
  
  if (currentProject.value) {
    selectedProjectId.value = currentProject.value.id;
  }
});
</script>

<style scoped>
.multi-tenant-context-selector {
  @apply bg-white border border-gray-200 rounded-lg p-4 shadow-sm;
}

.context-selector-section {
  @apply mb-4 last:mb-0;
}

.context-label {
  @apply flex items-center gap-2 text-sm font-medium text-gray-700 mb-2;
}

.context-select {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  @apply disabled:bg-gray-100 disabled:cursor-not-allowed;
}

.context-indicator {
  @apply flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md;
}

.context-info {
  @apply flex items-center gap-2;
}

.context-text {
  @apply text-sm font-medium text-green-800;
}

.btn-clear-context {
  @apply p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded;
  @apply transition-colors duration-200;
}

.context-error {
  @apply flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md;
  @apply text-sm text-red-800;
}

.context-loading {
  @apply flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md;
  @apply text-sm text-blue-800;
}

.status-indicator {
  @apply text-xs text-gray-500;
}

.text-success {
  @apply text-green-600;
}

/* Mode compact */
.multi-tenant-context-selector.compact {
  @apply p-2;
}

.multi-tenant-context-selector.compact .context-selector-section {
  @apply mb-2;
}

.multi-tenant-context-selector.compact .context-label {
  @apply text-xs mb-1;
}

.multi-tenant-context-selector.compact .context-select {
  @apply px-2 py-1 text-sm;
}

.multi-tenant-context-selector.compact .context-indicator {
  @apply p-2;
}

.multi-tenant-context-selector.compact .context-text {
  @apply text-xs;
}

/* Responsive */
@media (max-width: 640px) {
  .multi-tenant-context-selector {
    @apply p-3;
  }
  
  .context-selector-section {
    @apply mb-3;
  }
  
  .context-label {
    @apply text-xs;
  }
  
  .context-select {
    @apply text-sm;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .multi-tenant-context-selector {
    @apply bg-gray-800 border-gray-700;
  }
  
  .context-label {
    @apply text-gray-300;
  }
  
  .context-select {
    @apply bg-gray-700 border-gray-600 text-white;
    @apply focus:ring-blue-400 focus:border-blue-400;
  }
  
  .context-select:disabled {
    @apply bg-gray-600;
  }
  
  .context-indicator {
    @apply bg-green-900 border-green-700;
  }
  
  .context-text {
    @apply text-green-200;
  }
  
  .btn-clear-context {
    @apply text-green-400 hover:text-green-200 hover:bg-green-800;
  }
  
  .context-error {
    @apply bg-red-900 border-red-700 text-red-200;
  }
  
  .context-loading {
    @apply bg-blue-900 border-blue-700 text-blue-200;
  }
  
  .status-indicator {
    @apply text-gray-400;
  }
}
</style>