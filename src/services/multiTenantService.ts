import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import authService from './authService.js'

// Types pour le multi-tenant
export interface ClientContext {
  id: number;
  name: string;
  status: string;
}

export interface ProjectContext {
  id: number;
  name: string;
  status: string;
  client_id: number;
}

export interface MultiTenantContext {
  client: ClientContext | null;
  project: ProjectContext | null;
  isValid: boolean;
}

export interface FileItem {
  id: number;
  name: string;
  original_name: string;
  size: number;
  mime_type: string;
  folder_path: string;
  url: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  client_id: number;
  project_id: number;
}

export interface TaskItem {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: number;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  client_id: number;
  project_id: number;
}

export interface DashboardStats {
  project_name: string;
  project_status: string;
  project_priority: string;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  total_files: number;
  total_file_size: number;
  total_file_size_mb: number;
  active_widgets: number;
  progress: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [K in keyof T]: T[K];
  } & {
    pagination: {
      page: number;
      limit: number;
      total?: number;
      pages?: number;
    };
  };
  error?: string;
}

// Store global pour le contexte multi-tenant
class MultiTenantStore {
  private _currentClient = ref<ClientContext | null>(null);
  private _currentProject = ref<ProjectContext | null>(null);
  private _isLoading = ref(false);
  private _error = ref<string | null>(null);
  private _widgetStates = ref<Map<string, any>>(new Map());

  // Getters réactifs
  get currentClient() {
    return this._currentClient;
  }

  get currentProject() {
    return this._currentProject;
  }

  get isLoading() {
    return this._isLoading;
  }

  get error() {
    return this._error;
  }

  get context(): MultiTenantContext {
    return {
      client: this._currentClient.value,
      project: this._currentProject.value,
      isValid: !!(this._currentClient.value && this._currentProject.value)
    };
  }

  get isContextValid() {
    return computed(() => !!(this._currentClient.value && this._currentProject.value));
  }

  // Méthodes pour gérer le contexte
  setClient(client: ClientContext | null) {
    const previousClientId = this._currentClient.value?.id;
    this._currentClient.value = client;
    
    // Si le client change, réinitialiser le projet et les états des widgets
    if (previousClientId !== client?.id) {
      this._currentProject.value = null;
      this.clearAllWidgetStates();
    }
  }

  setProject(project: ProjectContext | null) {
    const previousProjectId = this._currentProject.value?.id;
    
    // Vérifier que le projet appartient au client courant
    if (project && this._currentClient.value && project.client_id !== this._currentClient.value.id) {
      throw new Error('Le projet ne correspond pas au client courant');
    }
    
    this._currentProject.value = project;
    
    // Si le projet change, réinitialiser les états des widgets
    if (previousProjectId !== project?.id) {
      this.clearAllWidgetStates();
    }
  }

  setContext(client: ClientContext | null, project: ProjectContext | null) {
    this.setClient(client);
    this.setProject(project);
  }

  clearContext() {
    this._currentClient.value = null;
    this._currentProject.value = null;
    this.clearAllWidgetStates();
  }

  setLoading(loading: boolean) {
    this._isLoading.value = loading;
  }

  setError(error: string | null) {
    this._error.value = error;
  }

  // Gestion des états des widgets
  getWidgetState(widgetKey: string) {
    const contextKey = this.getContextKey();
    const fullKey = `${contextKey}:${widgetKey}`;
    return this._widgetStates.value.get(fullKey);
  }

  setWidgetState(widgetKey: string, state: any) {
    const contextKey = this.getContextKey();
    const fullKey = `${contextKey}:${widgetKey}`;
    this._widgetStates.value.set(fullKey, state);
  }

  clearWidgetState(widgetKey: string) {
    const contextKey = this.getContextKey();
    const fullKey = `${contextKey}:${widgetKey}`;
    this._widgetStates.value.delete(fullKey);
  }

  clearAllWidgetStates() {
    this._widgetStates.value.clear();
  }

  private getContextKey(): string {
    const client = this._currentClient.value;
    const project = this._currentProject.value;
    return `${client?.id || 'no-client'}:${project?.id || 'no-project'}`;
  }

  // Validation du contexte
  validateContext(): boolean {
    if (!this._currentClient.value || !this._currentProject.value) {
      this.setError('Contexte client/projet requis');
      return false;
    }

    if (this._currentProject.value.client_id !== this._currentClient.value.id) {
      this.setError('Le projet ne correspond pas au client');
      return false;
    }

    this.setError(null);
    return true;
  }

  // Méthodes utilitaires pour les URLs
  getApiBaseUrl(): string {
    if (!this.validateContext()) {
      throw new Error('Contexte invalide pour générer l\'URL API');
    }
    
    const { client, project } = this.context;
    return `/api/clients/${client!.id}/projects/${project!.id}/widgets`;
  }

  buildApiUrl(endpoint: string): string {
    return `${this.getApiBaseUrl()}${endpoint}`;
  }
}

// Instance singleton du store
const multiTenantStore = new MultiTenantStore();

// Composable pour utiliser le contexte multi-tenant
export function useMultiTenant() {
  const router = useRouter();

  // Watcher pour rediriger si le contexte devient invalide
  watch(
    () => multiTenantStore.context,
    (newContext) => {
      if (!newContext.isValid && router.currentRoute.value.path !== '/') {
        console.warn('Contexte multi-tenant invalide, redirection vers l\'accueil');
        router.push('/');
      }
    },
    { deep: true }
  );

  return {
    // État réactif
    currentClient: multiTenantStore.currentClient,
    currentProject: multiTenantStore.currentProject,
    isLoading: multiTenantStore.isLoading,
    error: multiTenantStore.error,
    context: computed(() => multiTenantStore.context),
    isContextValid: multiTenantStore.isContextValid,

    // Actions
    setClient: multiTenantStore.setClient.bind(multiTenantStore),
    setProject: multiTenantStore.setProject.bind(multiTenantStore),
    setContext: multiTenantStore.setContext.bind(multiTenantStore),
    clearContext: multiTenantStore.clearContext.bind(multiTenantStore),
    setLoading: multiTenantStore.setLoading.bind(multiTenantStore),
    setError: multiTenantStore.setError.bind(multiTenantStore),
    validateContext: multiTenantStore.validateContext.bind(multiTenantStore),

    // Gestion des états des widgets
    getWidgetState: multiTenantStore.getWidgetState.bind(multiTenantStore),
    setWidgetState: multiTenantStore.setWidgetState.bind(multiTenantStore),
    clearWidgetState: multiTenantStore.clearWidgetState.bind(multiTenantStore),

    // Utilitaires
    getApiBaseUrl: multiTenantStore.getApiBaseUrl.bind(multiTenantStore),
    buildApiUrl: multiTenantStore.buildApiUrl.bind(multiTenantStore)
  };
}

// Service API multi-tenant avec scoping strict
export class MultiTenantApiService {
  private baseUrl = '/api';

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<T> {
    const getToken = (): string | undefined =>
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') || undefined;

    const buildConfig = (bearerToken?: string): RequestInit => {
      const headers: Record<string, string> = {
        ...(data instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
        ...((options.headers as any) || {})
      };
      const cfg: RequestInit = { method, headers, ...options };
      if (data && method !== 'GET') {
        if (data instanceof FormData) {
          cfg.body = data;
        } else {
          cfg.body = JSON.stringify(data);
        }
      }
      return cfg;
    };

    let token = getToken();
    let response = await fetch(url, buildConfig(token));

    const parseErrorJson = async (resp: Response) => {
      try {
        return await resp.json();
      } catch {
        return null;
      }
    };

    if (!response.ok) {
      const errorData = await parseErrorJson(response);
      const status = response.status;
      const serverMsg = (errorData && (errorData.error || errorData.message)) || '';
      const authIssue = status === 401 || status === 403;
      const isTokenIssue = serverMsg.toLowerCase().includes('expir') ||
        serverMsg.toLowerCase().includes('invalide') ||
        serverMsg.toLowerCase().includes('token');

      if (authIssue && isTokenIssue) {
        try {
          const newToken = await authService.refreshToken();
          response = await fetch(url, buildConfig(newToken));
          if (!response.ok) {
            const retryData = await parseErrorJson(response);
            const retryMsg = (retryData && (retryData.error || retryData.message)) || `Erreur HTTP ${response.status}`;
            throw new Error(retryMsg);
          }
        } catch (refreshErr) {
          const msg = serverMsg || 'Authentification requise';
          throw new Error(msg);
        }
      } else {
        const msg = serverMsg || `Erreur HTTP ${status}`;
        throw new Error(msg);
      }
    }

    return response.json();
  }

  private buildUrl(clientId: number, projectId: number, endpoint: string): string {
    return `${this.baseUrl}/clients/${clientId}/projects/${projectId}/widgets${endpoint}`;
  }

  // Méthodes pour les fichiers
  async getFiles(
    clientId: number,
    projectId: number,
    path: string = '/',
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<{ files: FileItem[] }>> {
    const url = `/api/projects/${projectId}/files?path=${encodeURIComponent(path)}&page=${page}&limit=${limit}`;
    return this.request<PaginatedResponse<{ files: FileItem[] }>>('GET', url);
  }

  async uploadFiles(
    clientId: number,
    projectId: number,
    files: FileList | File[],
    folderPath: string = '/'
  ): Promise<ApiResponse<{ files: FileItem[] }>> {
    const formData = new FormData();
    
    const filesArray = Array.isArray(files) ? files : Array.from(files);
    for (const file of filesArray) {
      formData.append('files', file);
    }
    formData.append('folder_path', folderPath);

    const url = this.buildUrl(clientId, projectId, '/files');
    return this.request<ApiResponse<{ files: FileItem[] }>>('POST', url, formData);
  }

  async deleteFile(
    clientId: number,
    projectId: number,
    fileId: number
  ): Promise<ApiResponse<void>> {
    const url = this.buildUrl(clientId, projectId, `/files/${fileId}`);
    return this.request<ApiResponse<void>>('DELETE', url);
  }

  async createFolder(
    clientId: number,
    projectId: number,
    folderName: string,
    parentPath: string = '/'
  ): Promise<ApiResponse<{ folder: FileItem }>> {
    const url = this.buildUrl(clientId, projectId, '/files/folders');
    return this.request<ApiResponse<{ folder: FileItem }>>('POST', url, { name: folderName, folder_path: parentPath });
  }

  async renameFolder(
    clientId: number,
    projectId: number,
    folderId: number,
    newName: string
  ): Promise<ApiResponse<{ folder: FileItem }>> {
    const url = this.buildUrl(clientId, projectId, `/files/folders/${folderId}`);
    return this.request<ApiResponse<{ folder: FileItem }>>('PATCH', url, { new_name: newName });
  }

  async moveFolder(
    clientId: number,
    projectId: number,
    folderId: number,
    newParentPath: string
  ): Promise<ApiResponse<{ folder: FileItem }>> {
    const url = this.buildUrl(clientId, projectId, `/files/folders/${folderId}`);
    return this.request<ApiResponse<{ folder: FileItem }>>('PATCH', url, { new_parent_path: newParentPath });
  }

  async deleteFolder(
    clientId: number,
    projectId: number,
    folderId: number
  ): Promise<ApiResponse<void>> {
    const url = this.buildUrl(clientId, projectId, `/files/folders/${folderId}`);
    return this.request<ApiResponse<void>>('DELETE', url);
  }

  // Télécharger un fichier (Blob)
  async downloadFile(
    clientId: number,
    projectId: number,
    fileId: number
  ): Promise<Blob> {
    const url = this.buildUrl(clientId, projectId, `/files/${fileId}/download`);
    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      undefined;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      let message = `Téléchargement échoué (${response.status})`;
      try {
        const text = await response.text();
        if (text) message = text;
      } catch {}
      throw new Error(message);
    }

    return await response.blob();
  }

  async getTasks(
    clientId: number,
    projectId: number,
    filters: {
      status?: string;
      priority?: string;
      assigned_to?: number;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<ApiResponse<{ tasks: TaskItem[]; stats: Record<string, number> }>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const url = `/api/projects/${projectId}/tasks?${params.toString()}`;
    return this.request<ApiResponse<{ tasks: TaskItem[]; stats: Record<string, number> }>>('GET', url);
  }

  async createTask(
    clientId: number,
    projectId: number,
    taskData: {
      title: string;
      description?: string;
      priority?: string;
      assigned_to?: number;
      due_date?: string;
    }
  ): Promise<ApiResponse<{ task: TaskItem }>> {
    const url = this.buildUrl(clientId, projectId, '/tasks');
    return this.request<ApiResponse<{ task: TaskItem }>>('POST', url, taskData);
  }

  async updateTask(
    clientId: number,
    projectId: number,
    taskId: number,
    updates: Partial<TaskItem>
  ): Promise<ApiResponse<{ task: TaskItem }>> {
    const url = this.buildUrl(clientId, projectId, `/tasks/${taskId}`);
    return this.request<ApiResponse<{ task: TaskItem }>>('PATCH', url, updates);
  }

  async assignTask(
    clientId: number,
    projectId: number,
    taskId: number,
    userId: number
  ): Promise<ApiResponse<void>> {
    const url = this.buildUrl(clientId, projectId, `/tasks/${taskId}/assignees`);
    return this.request<ApiResponse<void>>('POST', url, { user_id: userId });
  }

  // Méthodes pour le dashboard
  async getDashboardStats(
    clientId: number,
    projectId: number
  ): Promise<ApiResponse<DashboardStats>> {
    const url = this.buildUrl(clientId, projectId, '/dashboard');
    return this.request<ApiResponse<DashboardStats>>('GET', url);
  }
}

// Instance singleton du service API
export const multiTenantApiService = new MultiTenantApiService();

// Composable pour utiliser l'API multi-tenant
export function useMultiTenantApi() {
  const { currentClient, currentProject, validateContext } = useMultiTenant();

  const ensureContext = () => {
    if (!validateContext()) {
      throw new Error('Contexte client/projet requis pour utiliser l\'API');
    }
    return {
      clientId: currentClient.value!.id,
      projectId: currentProject.value!.id
    };
  };

  return {
    // Méthodes pour les fichiers
    getFiles: async (path?: string, page?: number, limit?: number) => {
      const { clientId, projectId } = ensureContext();
      return multiTenantApiService.getFiles(clientId, projectId, path, page, limit);
    },

    uploadFiles: async (files: FileList | File[], folderPath?: string) => {
      const { clientId, projectId } = ensureContext();
      return multiTenantApiService.uploadFiles(clientId, projectId, files, folderPath);
    },

    deleteFile: async (fileId: number) => {
      const { clientId, projectId } = ensureContext();
      return multiTenantApiService.deleteFile(clientId, projectId, fileId);
    },

    // Dossiers
    createFolder: async (folderName: string, parentPath?: string) => {
      const { clientId, projectId } = ensureContext();
      return multiTenantApiService.createFolder(clientId, projectId, folderName, parentPath ?? '/');
    },

    renameFolder: async (folderId: number, newName: string) => {
      const { clientId, projectId } = ensureContext();
      return multiTenantApiService.renameFolder(clientId, projectId, folderId, newName);
    },

    moveFolder: async (folderId: number, newParentPath: string) => {
      const { clientId, projectId } = ensureContext();
      return multiTenantApiService.moveFolder(clientId, projectId, folderId, newParentPath);
    },

    deleteFolder: async (folderId: number) => {
      const { clientId, projectId } = ensureContext();
      return multiTenantApiService.deleteFolder(clientId, projectId, folderId);
    },

    downloadFile: async (fileId: number) => {
      const { clientId, projectId } = ensureContext();
      return multiTenantApiService.downloadFile(clientId, projectId, fileId);
    },

    // Méthodes pour les tâches
    getTasks: async (filters?: {
      status?: string;
      priority?: string;
      assigned_to?: number;
      page?: number;
      limit?: number;
    }) => {
      const { clientId, projectId } = ensureContext();
      return multiTenantApiService.getTasks(clientId, projectId, filters || {});
    },

    createTask: async (taskData: any) => {
      const { clientId, projectId } = ensureContext();
      return multiTenantApiService.createTask(clientId, projectId, taskData);
    },

    updateTask: async (taskId: number, updates: any) => {
      const { clientId, projectId } = ensureContext();
      return multiTenantApiService.updateTask(clientId, projectId, taskId, updates);
    },

    assignTask: async (taskId: number, userId: number) => {
      const { clientId, projectId } = ensureContext();
      return multiTenantApiService.assignTask(clientId, projectId, taskId, userId);
    },

    // Méthodes pour le dashboard
    getDashboardStats: async () => {
      const { clientId, projectId } = ensureContext();
      return multiTenantApiService.getDashboardStats(clientId, projectId);
    }
  };
}

export default {
  useMultiTenant,
  useMultiTenantApi,
  multiTenantApiService,
  MultiTenantApiService
};