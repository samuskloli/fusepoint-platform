<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">{{ $t('admin.userManagement.title') }}</h2>

    <!-- Messages d'erreur et de succès -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
      <button @click="error = null" class="float-right font-bold">&times;</button>
    </div>

    <div v-if="success" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      {{ success }}
      <button @click="success = null" class="float-right font-bold">&times;</button>
    </div>

    <!-- Filtres -->
    <div class="bg-white p-6 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('common.search') }}</label>
          <input
            v-model="searchTerm"
            type="text"
            :placeholder="$t('admin.userManagement.searchPlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="debouncedSearch"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('admin.userManagement.role') }}</label>
          <select
            v-model="selectedRole"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="loadUsers"
          >
            <option value="">{{ $t('admin.userManagement.allRoles') }}</option>
            <option v-for="role in availableRoles" :key="role.value" :value="role.value">
              {{ role.label }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('admin.userManagement.status') }}</label>
          <select
            v-model="activeFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="loadUsers"
          >
            <option value="all">{{ $t('admin.userManagement.allStatuses') }}</option>
            <option value="true">{{ $t('admin.userManagement.active') }}</option>
            <option value="false">{{ $t('admin.userManagement.inactive') }}</option>
          </select>
        </div>
        
        <div>
          <button
            @click="resetFilters"
            class="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            {{ $t('common.reset') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Tableau des utilisateurs -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">{{ $t('common.loading') }}</p>
      </div>
      
      <div v-else-if="users.length === 0" class="p-8 text-center text-gray-500">
        {{ $t('admin.userManagement.noUsers') }}
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('admin.userManagement.name') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('admin.userManagement.email') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('admin.userManagement.role') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('admin.userManagement.status') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('admin.userManagement.createdAt') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('admin.userManagement.lastLogin') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('common.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      {{ getInitials(user.first_name, user.last_name) }}
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.first_name }} {{ user.last_name }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getRoleColorClass(user.role)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ user.is_active ? $t('admin.userManagement.active') : $t('admin.userManagement.inactive') }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(user.last_login) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  @click="handleEditUser(user)"
                  class="text-blue-600 hover:text-blue-900 transition-colors"
                  :title="$t('common.edit')"
                >
                  <font-awesome-icon icon="edit" class="w-4 h-4" />
                </button>
                
                <button
                  @click="handleViewDetails(user)"
                  class="text-green-600 hover:text-green-900 transition-colors"
                  :title="$t('common.view')"
                >
                  <font-awesome-icon icon="eye" class="w-4 h-4" />
                </button>
                
                <button
                  @click="openStatusDialog(user)"
                  :class="user.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                  class="transition-colors"
                  :title="user.is_active ? $t('admin.userManagement.deactivate') : $t('admin.userManagement.activate')"
                >
                  <font-awesome-icon :icon="user.is_active ? 'user-slash' : 'user-check'" class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div v-if="pagination && pagination.totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="changePage(pagination.currentPage - 1)"
            :disabled="pagination.currentPage <= 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ $t('common.previous') }}
          </button>
          <button
            @click="changePage(pagination.currentPage + 1)"
            :disabled="pagination.currentPage >= pagination.totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ $t('common.next') }}
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              {{ $t('common.showing') }}
              <span class="font-medium">{{ (pagination.currentPage - 1) * pagination.limit + 1 }}</span>
              {{ $t('common.to') }}
              <span class="font-medium">{{ Math.min(pagination.currentPage * pagination.limit, pagination.total) }}</span>
              {{ $t('common.of') }}
              <span class="font-medium">{{ pagination.total }}</span>
              {{ $t('common.results') }}
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="changePage(pagination.currentPage - 1)"
                :disabled="pagination.currentPage <= 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <font-awesome-icon icon="chevron-left" class="h-5 w-5" />
              </button>
              
              <button
                v-for="page in getVisiblePages()"
                :key="page"
                @click="changePage(page)"
                :class="[
                  page === pagination.currentPage
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                ]"
              >
                {{ page }}
              </button>
              
              <button
                @click="changePage(pagination.currentPage + 1)"
                :disabled="pagination.currentPage >= pagination.totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <font-awesome-icon icon="chevron-right" class="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de changement de statut -->
    <div v-if="statusDialogOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ selectedUser?.is_active ? $t('admin.userManagement.confirmDeactivate') : $t('admin.userManagement.confirmActivate') }}
          </h3>
          <p class="text-sm text-gray-500 mb-6">
            {{ selectedUser?.is_active ? $t('admin.userManagement.deactivateWarning') : $t('admin.userManagement.activateWarning') }}
            <strong>{{ selectedUser?.first_name }} {{ selectedUser?.last_name }}</strong>
          </p>
          <div class="flex justify-end space-x-3">
            <button
              @click="statusDialogOpen = false"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              @click="handleUpdateStatus"
              :disabled="isUpdatingStatus"
              :class="selectedUser?.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'"
              class="px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50"
            >
              <span v-if="isUpdatingStatus" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              {{ selectedUser?.is_active ? $t('admin.userManagement.deactivate') : $t('admin.userManagement.activate') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'édition d'utilisateur -->
    <div v-if="editUserDialogOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('admin.userManagement.editUser') }}</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Informations personnelles -->
            <div>
              <h4 class="text-md font-medium text-gray-800 mb-3">{{ $t('admin.userManagement.personalInfo') }}</h4>
              <form @submit.prevent="updateUserInfo" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.userManagement.firstName') }} *</label>
                  <input
                    v-model="editUserForm.first_name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.userManagement.lastName') }} *</label>
                  <input
                    v-model="editUserForm.last_name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.userManagement.email') }} *</label>
                  <input
                    v-model="editUserForm.email"
                    type="email"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.userManagement.phone') }}</label>
                  <input
                    v-model="editUserForm.phone"
                    type="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  :disabled="isUpdatingUser"
                  class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <span v-if="isUpdatingUser" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  {{ $t('common.save') }}
                </button>
              </form>
            </div>

            <!-- Gestion du mot de passe -->
            <div>
              <h4 class="text-md font-medium text-gray-800 mb-3">{{ $t('admin.userManagement.passwordManagement') }}</h4>
              <form @submit.prevent="updateUserPassword" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.userManagement.newPassword') }}</label>
                  <input
                    v-model="editUserForm.newPassword"
                    type="password"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('admin.userManagement.confirmPassword') }}</label>
                  <input
                    v-model="editUserForm.confirmPassword"
                    type="password"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  :disabled="isUpdatingPassword || !editUserForm.newPassword || !editUserForm.confirmPassword"
                  class="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  <span v-if="isUpdatingPassword" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  {{ $t('admin.userManagement.updatePassword') }}
                </button>
              </form>
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <button
              @click="editUserDialogOpen = false"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              {{ $t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de détails utilisateur -->
    <div v-if="detailsDialogOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('admin.userManagement.userDetails') }}</h3>
          
          <div v-if="userDetails" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('admin.userManagement.firstName') }}</label>
                <p class="mt-1 text-sm text-gray-900">{{ userDetails.first_name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('admin.userManagement.lastName') }}</label>
                <p class="mt-1 text-sm text-gray-900">{{ userDetails.last_name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('admin.userManagement.email') }}</label>
                <p class="mt-1 text-sm text-gray-900">{{ userDetails.email }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('admin.userManagement.phone') }}</label>
                <p class="mt-1 text-sm text-gray-900">{{ userDetails.phone || $t('common.notSpecified') }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('admin.userManagement.role') }}</label>
                <p class="mt-1 text-sm text-gray-900">{{ getRoleLabel(userDetails.role) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('admin.userManagement.status') }}</label>
                <p class="mt-1 text-sm text-gray-900">
                  <span :class="userDetails.is_active ? 'text-green-600' : 'text-red-600'">
                    {{ userDetails.is_active ? $t('admin.userManagement.active') : $t('admin.userManagement.inactive') }}
                  </span>
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('admin.userManagement.createdAt') }}</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(userDetails.created_at) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('admin.userManagement.lastLogin') }}</label>
                <p class="mt-1 text-sm text-gray-900">{{ formatDate(userDetails.last_login) }}</p>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-4">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-gray-600">{{ $t('common.loading') }}</p>
          </div>

          <div class="flex justify-end mt-6">
            <button
              @click="detailsDialogOpen = false"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              {{ $t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import adminAPI from '../../services/adminAPI.js';
import { debounce } from 'lodash';

export default {
  name: 'AdminUserManager',
  data() {
    return {
      users: [],
      loading: false,
      error: null,
      success: null,
      searchTerm: '',
      selectedRole: '',
      activeFilter: 'all',
      pagination: null,
      currentPage: 1,
      
      // Dialogues
      statusDialogOpen: false,
      editUserDialogOpen: false,
      detailsDialogOpen: false,
      
      // États de chargement
      isUpdatingStatus: false,
      isUpdatingUser: false,
      isUpdatingPassword: false,
      
      // Données sélectionnées
      selectedUser: null,
      userDetails: null,
      
      // Formulaires
      editUserForm: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        newPassword: '',
        confirmPassword: ''
      },
      
      // Rôles disponibles
      availableRoles: [
        { value: 'user', label: this.$t('roles.user') },
        { value: 'agent', label: this.$t('roles.agent') },
        { value: 'admin', label: this.$t('roles.admin') }
      ]
    };
  },
  
  computed: {
    debouncedSearch() {
      return debounce(this.loadUsers, 500);
    }
  },
  
  async mounted() {
    await this.loadUsers();
  },
  
  methods: {
    async loadUsers() {
      this.loading = true;
      this.error = null;
      
      try {
        const options = {
          page: this.currentPage,
          limit: 20,
          search: this.searchTerm || null,
          role: this.selectedRole || null,
          activeOnly: this.activeFilter === 'all' ? null : this.activeFilter === 'true'
        };
        
        const response = await adminAPI.getUsers(options);
        this.users = response.users || [];
        this.pagination = response.pagination || null;
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.error = this.$t('admin.userManagement.errors.loadUsers');
      } finally {
        this.loading = false;
      }
    },
    
    resetFilters() {
      this.searchTerm = '';
      this.selectedRole = '';
      this.activeFilter = 'all';
      this.currentPage = 1;
      this.loadUsers();
    },
    
    changePage(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.currentPage = page;
        this.loadUsers();
      }
    },
    
    getVisiblePages() {
      if (!this.pagination) return [];
      
      const current = this.pagination.currentPage;
      const total = this.pagination.totalPages;
      const pages = [];
      
      // Afficher jusqu'à 5 pages autour de la page actuelle
      const start = Math.max(1, current - 2);
      const end = Math.min(total, current + 2);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      return pages;
    },
    
    getInitials(firstName, lastName) {
      const first = firstName ? firstName.charAt(0).toUpperCase() : '';
      const last = lastName ? lastName.charAt(0).toUpperCase() : '';
      return first + last;
    },
    
    getRoleLabel(role) {
      const roleMap = {
        'user': this.$t('roles.user'),
        'agent': this.$t('roles.agent'),
        'admin': this.$t('roles.admin'),
        'super_admin': this.$t('roles.superAdmin')
      };
      return roleMap[role] || role;
    },
    
    getRoleColorClass(role) {
      const colorMap = {
        'user': 'bg-gray-100 text-gray-800',
        'agent': 'bg-blue-100 text-blue-800',
        'admin': 'bg-purple-100 text-purple-800',
        'super_admin': 'bg-red-100 text-red-800'
      };
      return colorMap[role] || 'bg-gray-100 text-gray-800';
    },
    
    formatDate(dateString) {
      if (!dateString) return this.$t('common.never');
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    openStatusDialog(user) {
      this.selectedUser = user;
      this.statusDialogOpen = true;
      this.error = null;
    },
    
    async handleUpdateStatus() {
      if (!this.selectedUser) {
        this.error = this.$t('admin.userManagement.errors.noUserSelected');
        return;
      }

      this.isUpdatingStatus = true;
      this.error = null;

      try {
        const newStatus = !this.selectedUser.is_active;
        const response = await adminAPI.updateUserStatus(this.selectedUser.id, newStatus);
        
        if (response && (response.success === true || response.message)) {
          // Mettre à jour l'utilisateur dans la liste locale
          const userIndex = this.users.findIndex(u => u.id === this.selectedUser.id);
          if (userIndex !== -1) {
            this.users[userIndex].is_active = newStatus;
          }
          
          this.selectedUser.is_active = newStatus;
          this.success = newStatus ? this.$t('admin.userManagement.success.userActivated') : this.$t('admin.userManagement.success.userDeactivated');
          this.statusDialogOpen = false;
        } else {
          throw new Error('Réponse API invalide');
        }
        
        await this.loadUsers();
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        this.error = error.response?.data?.error || this.$t('admin.userManagement.errors.updateStatus');
      } finally {
        this.isUpdatingStatus = false;
      }
    },
    
    async handleViewDetails(user) {
      this.selectedUser = user;
      this.detailsDialogOpen = true;
      this.userDetails = null;
      
      try {
        this.userDetails = await adminAPI.getUserDetails(user.id);
      } catch (error) {
        console.error('Erreur lors de la récupération des détails:', error);
        this.error = this.$t('admin.userManagement.errors.loadUserDetails');
        this.detailsDialogOpen = false;
      }
    },
    
    async handleEditUser(user) {
      if (!user || !user.id) {
        this.error = this.$t('admin.userManagement.errors.invalidUser');
        return;
      }

      this.selectedUser = user;
      this.editUserForm = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        newPassword: '',
        confirmPassword: ''
      };
      this.editUserDialogOpen = true;
      this.error = null;
    },
    
    async updateUserInfo() {
      if (!this.selectedUser || !this.selectedUser.id) {
        this.error = this.$t('admin.userManagement.errors.noUserSelected');
        return;
      }

      // Validation des champs requis
      if (!this.editUserForm.first_name || !this.editUserForm.last_name || !this.editUserForm.email) {
        this.error = this.$t('admin.userManagement.errors.requiredFields');
        return;
      }

      // Validation de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.editUserForm.email)) {
        this.error = this.$t('admin.userManagement.errors.invalidEmail');
        return;
      }

      this.isUpdatingUser = true;
      this.error = null;

      try {
        const userData = {
          first_name: this.editUserForm.first_name.trim(),
          last_name: this.editUserForm.last_name.trim(),
          email: this.editUserForm.email.trim(),
          phone: this.editUserForm.phone ? this.editUserForm.phone.trim() : null
        };

        await adminAPI.updateUser(this.selectedUser.id, userData);
        
        // Mettre à jour l'utilisateur dans la liste
        const userIndex = this.users.findIndex(u => u.id === this.selectedUser.id);
        if (userIndex !== -1) {
          this.users[userIndex] = { ...this.users[userIndex], ...userData };
        }
        
        this.success = this.$t('admin.userManagement.success.userUpdated');
        this.editUserDialogOpen = false;
        
        await this.loadUsers();
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
        this.error = error.response?.data?.error || this.$t('admin.userManagement.errors.updateUser');
      } finally {
        this.isUpdatingUser = false;
      }
    },
    
    async updateUserPassword() {
      if (!this.editUserForm.newPassword || !this.editUserForm.confirmPassword) {
        this.error = this.$t('admin.userManagement.errors.passwordFieldsRequired');
        return;
      }

      if (this.editUserForm.newPassword !== this.editUserForm.confirmPassword) {
        this.error = this.$t('admin.userManagement.errors.passwordMismatch');
        return;
      }

      if (this.editUserForm.newPassword.length < 8) {
        this.error = this.$t('admin.userManagement.errors.passwordTooShort');
        return;
      }

      this.isUpdatingPassword = true;
      this.error = null;

      try {
        await adminAPI.updateUserPassword(this.selectedUser.id, this.editUserForm.newPassword);
        this.success = this.$t('admin.userManagement.success.passwordUpdated');
        
        // Réinitialiser les champs de mot de passe
        this.editUserForm.newPassword = '';
        this.editUserForm.confirmPassword = '';
      } catch (error) {
        console.error('Erreur lors de la mise à jour du mot de passe:', error);
        this.error = error.response?.data?.error || this.$t('admin.userManagement.errors.updatePassword');
      } finally {
        this.isUpdatingPassword = false;
      }
    }
  }
};
</script>

<style scoped>
/* Styles personnalisés pour le composant */
.transition-colors {
  transition: color 0.2s ease-in-out;
}

.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>