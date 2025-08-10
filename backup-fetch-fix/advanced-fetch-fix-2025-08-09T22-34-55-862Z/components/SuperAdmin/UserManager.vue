<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Gestion des Utilisateurs</h2>

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
          <label class="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Email, nom, prénom..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
          <select
            v-model="roleFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les rôles</option>
            <option v-for="role in roles" :key="role.value" :value="role.value">
              {{ role.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="flex items-center">
            <input
              v-model="activeOnlyFilter"
              type="checkbox"
              class="mr-2"
            />
            Actifs uniquement
          </label>
        </div>
        <div>
          <button
            @click="loadUsers"
            :disabled="loading"
            class="btn-primary w-full"
          >
            <font-awesome-icon :icon="loading ? 'spinner' : 'sync-alt'" :class="{ 'animate-spin': loading }" class="w-4 h-4 mr-2" />
            Actualiser
          </button>
        </div>
      </div>
    </div>

    <!-- Loading spinner -->
    <div v-if="loading && users.length === 0" class="flex justify-center items-center min-h-96">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <!-- Tableau des utilisateurs -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rôle
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Créé le
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dernière connexion
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ user.first_name }} {{ user.last_name }}
                  </div>
                  <div class="text-sm text-gray-500">
                    ID: {{ user.id }}
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
                  {{ user.is_active ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(user.last_login) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <div class="flex space-x-2 justify-center">
                  <button
                    @click="handleViewDetails(user)"
                    class="btn-action btn-info"
                    title="Voir les détails"
                  >
                    <font-awesome-icon icon="eye" class="w-4 h-4" />
                    <span class="hidden sm:inline ml-1">Détails</span>
                  </button>
                  <button
                    @click="handleEditUser(user)"
                    class="btn-action btn-success"
                    title="Modifier l'utilisateur"
                  >
                    <font-awesome-icon icon="edit" class="w-4 h-4" />
                    <span class="hidden sm:inline ml-1">Modifier</span>
                  </button>
                  <button
                    @click="handleEditRole(user)"
                    class="btn-action btn-warning"
                    title="Modifier le rôle"
                  >
                    <font-awesome-icon icon="user-tag" class="w-4 h-4" />
                    <span class="hidden sm:inline ml-1">Rôle</span>
                  </button>
                  <button
                    @click="handleEditPassword(user)"
                    class="btn-action btn-orange"
                    title="Modifier le mot de passe"
                  >
                    <font-awesome-icon icon="key" class="w-4 h-4" />
                    <span class="hidden sm:inline ml-1">Mot de passe</span>
                  </button>
                  <button
                    @click="handleToggleStatus(user)"
                    :class="user.is_active ? 'btn-action btn-orange' : 'btn-action btn-success'"
                    :title="user.is_active ? 'Désactiver l\'utilisateur' : 'Activer l\'utilisateur'"
                  >
                    <font-awesome-icon :icon="user.is_active ? 'user-slash' : 'user-check'" class="w-4 h-4" />
                    <span class="hidden sm:inline ml-1">{{ user.is_active ? 'Désactiver' : 'Activer' }}</span>
                  </button>
                  <button
                    @click="handleDeleteUser(user)"
                    class="btn-action btn-danger"
                    title="Supprimer l'utilisateur"
                  >
                    <font-awesome-icon icon="trash" class="w-4 h-4" />
                    <span class="hidden sm:inline ml-1">Supprimer</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-center border-t border-gray-200">
        <div class="flex space-x-2">
          <button
            v-for="pageNum in totalPages"
            :key="pageNum"
            @click="page = pageNum"
            :class="page === pageNum ? 'btn-pagination-active' : 'btn-pagination'"
          >
            {{ pageNum }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal d'édition complète de l'utilisateur -->
    <div v-if="editUserDialogOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Modifier l'utilisateur</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Informations personnelles -->
            <div>
              <h4 class="text-md font-medium text-gray-800 mb-3">Informations personnelles</h4>
              <form @submit.prevent="updateUserInfo" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input
                    v-model="editUserForm.first_name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    v-model="editUserForm.last_name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    v-model="editUserForm.email"
                    type="email"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    v-model="editUserForm.phone"
                    type="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </form>
            </div>
            
            <!-- Gestion des entreprises -->
            <div>
              <h4 class="text-md font-medium text-gray-800 mb-3">Entreprises associées</h4>
              
              <!-- Liste des entreprises actuelles -->
              <div class="mb-4">
                <div v-if="isLoadingCompanies" class="text-sm text-gray-500">Chargement...</div>
                <div v-else-if="userCompanies.length === 0" class="text-sm text-gray-500">Aucune entreprise associée</div>
                <div v-else class="space-y-2">
                  <div
                    v-for="company in userCompanies"
                    :key="company.id"
                    class="flex items-center justify-between p-2 bg-gray-50 rounded border"
                  >
                    <span class="text-sm font-medium">{{ company.name }}</span>
                    <button
                      @click="removeUserFromCompany(company.id)"
                      class="btn-danger btn-xs"
                      title="Supprimer l'association"
                    >
                      <font-awesome-icon icon="times" class="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Ajouter une nouvelle entreprise -->
              <div class="space-y-3">
                <label class="block text-sm font-medium text-gray-700">Ajouter une entreprise</label>
                <div class="flex space-x-2">
                  <select
                    v-model="selectedCompanyId"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner une entreprise</option>
                    <option
                      v-for="company in allCompanies.filter(c => !userCompanies.some(uc => uc.id === c.id))"
                      :key="company.id"
                      :value="company.id"
                    >
                      {{ company.name }}
                    </option>
                  </select>
                  <button
                    @click="addUserToCompany"
                    :disabled="!selectedCompanyId"
                    class="btn-success btn-sm"
                  >
                    <font-awesome-icon icon="plus" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Section Modification du mot de passe -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <h4 class="text-md font-medium text-gray-800 mb-3">
              <font-awesome-icon icon="key" class="mr-2 text-orange-500" />
              Modifier le mot de passe
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                <input
                  v-model="editUserForm.newPassword"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Entrez le nouveau mot de passe"
                  minlength="8"
                />
                <p class="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                <input
                  v-model="editUserForm.confirmPassword"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Confirmez le nouveau mot de passe"
                />
                <p v-if="editUserForm.newPassword && editUserForm.confirmPassword && editUserForm.newPassword !== editUserForm.confirmPassword" class="text-xs text-red-500 mt-1">
                  Les mots de passe ne correspondent pas
                </p>
              </div>
            </div>
            <div class="mt-4">
              <button
                @click="updateUserPassword"
                :disabled="!editUserForm.newPassword || !editUserForm.confirmPassword || editUserForm.newPassword !== editUserForm.confirmPassword || isUpdatingPassword"
                class="btn-orange btn-sm"
              >
                <font-awesome-icon :icon="isUpdatingPassword ? 'spinner' : 'key'" :class="{ 'animate-spin': isUpdatingPassword }" class="w-4 h-4 mr-2" />
                {{ isUpdatingPassword ? 'Modification...' : 'Modifier le mot de passe' }}
              </button>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 pt-6 mt-6 border-t">
            <button
              type="button"
              @click="editUserDialogOpen = false"
              class="btn-secondary"
            >
              <font-awesome-icon icon="times" class="w-4 h-4 mr-2" />
              Annuler
            </button>
            <button
              @click="updateUserInfo"
              :disabled="isUpdatingUser"
              class="btn-primary"
            >
              <font-awesome-icon :icon="isUpdatingUser ? 'spinner' : 'save'" :class="{ 'animate-spin': isUpdatingUser }" class="w-4 h-4 mr-2" />
              {{ isUpdatingUser ? 'Mise à jour...' : 'Mettre à jour' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de modification du rôle -->
    <div v-if="editDialogOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Modifier le rôle de {{ selectedUser?.first_name }} {{ selectedUser?.last_name }}
          </h3>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Nouveau rôle</label>
            <select
              v-model="newRole"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option v-for="role in roles" :key="role.value" :value="role.value">
                {{ role.label }} - {{ role.description }}
              </option>
            </select>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              @click="editDialogOpen = false"
              class="btn-secondary"
            >
              <font-awesome-icon icon="times" class="w-4 h-4 mr-2" />
              Annuler
            </button>
            <button
              @click="handleUpdateRole"
              :disabled="!newRole || newRole === selectedUser?.role"
              class="btn-primary"
            >
              <font-awesome-icon icon="user-tag" class="w-4 h-4 mr-2" />
              Mettre à jour
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation du changement de statut -->
    <div v-if="statusDialogOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ selectedUser?.is_active ? 'Désactiver' : 'Activer' }} l'utilisateur
          </h3>
          <p class="text-sm text-gray-600 mb-4">
            Êtes-vous sûr de vouloir {{ selectedUser?.is_active ? 'désactiver' : 'activer' }} l'utilisateur
            <strong>{{ selectedUser?.first_name }} {{ selectedUser?.last_name }}</strong> ?
          </p>
          <div v-if="selectedUser?.is_active" class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            La désactivation empêchera cet utilisateur de se connecter à la plateforme.
          </div>
          <div class="flex justify-end space-x-3">
            <button
              @click="statusDialogOpen = false"
              class="btn-secondary"
            >
              <font-awesome-icon icon="times" class="w-4 h-4 mr-2" />
              Annuler
            </button>
            <button
              @click="handleUpdateStatus"
              :disabled="isUpdatingStatus"
              :class="selectedUser?.is_active ? 'btn-danger' : 'btn-success'"
            >
              <font-awesome-icon :icon="isUpdatingStatus ? 'spinner' : (selectedUser?.is_active ? 'user-slash' : 'user-check')" :class="{ 'animate-spin': isUpdatingStatus }" class="w-4 h-4 mr-2" />
              {{ isUpdatingStatus ? 'Mise à jour...' : (selectedUser?.is_active ? 'Désactiver' : 'Activer') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal des détails de l'utilisateur -->
    <div v-if="detailsDialogOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-medium text-gray-900">
              Détails de l'utilisateur
            </h3>
            <button
              @click="detailsDialogOpen = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <font-awesome-icon icon="times" class="text-xl" />
            </button>
          </div>
          
          <div v-if="userDetails" class="space-y-6">
            <!-- Informations personnelles -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-md font-semibold text-gray-800 mb-3">Informations personnelles</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-600">Prénom</label>
                  <p class="text-sm text-gray-900">{{ userDetails.first_name || 'Non renseigné' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600">Nom</label>
                  <p class="text-sm text-gray-900">{{ userDetails.last_name || 'Non renseigné' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600">Email</label>
                  <p class="text-sm text-gray-900">{{ userDetails.email }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600">Téléphone</label>
                  <p class="text-sm text-gray-900">{{ userDetails.phone || 'Non renseigné' }}</p>
                </div>
              </div>
            </div>

            <!-- Informations du compte -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-md font-semibold text-gray-800 mb-3">Informations du compte</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-600">ID Utilisateur</label>
                  <p class="text-sm text-gray-900">{{ userDetails.id }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600">Rôle</label>
                  <span :class="getRoleColorClass(userDetails.role)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getRoleLabel(userDetails.role) }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600">Statut</label>
                  <span :class="userDetails.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ userDetails.is_active ? 'Actif' : 'Inactif' }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600">Email vérifié</label>
                  <span :class="userDetails.email_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ userDetails.email_verified ? 'Vérifié' : 'Non vérifié' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Activité -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-md font-semibold text-gray-800 mb-3">Activité</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-600">Créé le</label>
                  <p class="text-sm text-gray-900">{{ formatDate(userDetails.created_at) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600">Dernière connexion</label>
                  <p class="text-sm text-gray-900">{{ formatDate(userDetails.last_login) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600">Onboarding terminé</label>
                  <span :class="userDetails.onboarding_completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ userDetails.onboarding_completed ? 'Terminé' : 'En cours' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de modification du mot de passe -->
    <div v-if="passwordDialogOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-orange-600">
            <font-awesome-icon icon="key" class="mr-2" />
            Modifier le mot de passe
          </h3>
          <button
            @click="passwordDialogOpen = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <font-awesome-icon icon="times" />
          </button>
        </div>
        <div>
          <p class="text-gray-700 mb-4">
            Modifier le mot de passe pour <strong>{{ selectedUser?.first_name }} {{ selectedUser?.last_name }}</strong>
          </p>
          <form @submit.prevent="handleUpdatePassword">
            <div class="mb-4">
              <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <input
                id="newPassword"
                v-model="newPassword"
                type="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Entrez le nouveau mot de passe"
                required
                minlength="8"
              >
              <p class="text-xs text-gray-500 mt-1">
                Le mot de passe doit contenir au moins 8 caractères
              </p>
            </div>
            <div class="mb-6">
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Confirmez le nouveau mot de passe"
                required
              >
              <p v-if="newPassword && confirmPassword && newPassword !== confirmPassword" class="text-xs text-red-500 mt-1">
                Les mots de passe ne correspondent pas
              </p>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="passwordDialogOpen = false"
                class="btn-secondary"
              >
                <font-awesome-icon icon="times" class="w-4 h-4 mr-2" />
                Annuler
              </button>
              <button
                type="submit"
                :disabled="!newPassword || !confirmPassword || newPassword !== confirmPassword || isUpdatingPassword"
                class="btn-orange"
              >
                <font-awesome-icon :icon="isUpdatingPassword ? 'spinner' : 'key'" :class="{ 'animate-spin': isUpdatingPassword }" class="w-4 h-4 mr-2" />
                {{ isUpdatingPassword ? 'Modification...' : 'Modifier le mot de passe' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="deleteDialogOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Supprimer l'utilisateur
          </h3>
          <p class="text-sm text-gray-600 mb-4">
            Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur
            <strong>{{ selectedUser?.first_name }} {{ selectedUser?.last_name }}</strong> ?
          </p>
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Attention :</strong> Cette action est irréversible. Toutes les données associées à cet utilisateur seront supprimées.
          </div>
          <div class="flex justify-end space-x-3">
            <button
              @click="deleteDialogOpen = false"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              @click="handleConfirmDelete"
              :disabled="isDeletingUser"
              class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 inline-flex items-center"
            >
              <font-awesome-icon :icon="isDeletingUser ? 'spinner' : 'trash'" :class="{ 'animate-spin': isDeletingUser }" class="w-4 h-4 mr-2" />
              {{ isDeletingUser ? 'Suppression...' : 'Supprimer définitivement' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import superAdminAPI from '../../services/superAdminAPI';

export default {
  name: 'UserManager',
  data() {
    return {
      users: [],
      roles: [],
      loading: true,
      error: null,
      success: null,
      
      // Pagination et filtres
      page: 1,
      totalPages: 1,
      searchTerm: '',
      roleFilter: '',
      activeOnlyFilter: true,
      
      // Dialog states
      editDialogOpen: false,
      editUserDialogOpen: false,
      statusDialogOpen: false,
      detailsDialogOpen: false,
      deleteDialogOpen: false,
      passwordDialogOpen: false,
      selectedUser: null,
      userDetails: null,
      newRole: '',
      newPassword: '',
      confirmPassword: '',
      isUpdatingPassword: false,
      editUserForm: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        newPassword: '',
        confirmPassword: ''
      },
      isUpdatingUser: false,
      isUpdatingPassword: false,
      isUpdatingStatus: false,
      isDeletingUser: false,
      userCompanies: [],
      allCompanies: [],
      selectedCompanyId: '',
      isLoadingCompanies: false
    };
  },
  
  async mounted() {
    await this.loadInitialData();
  },
  
  watch: {
    page() {
      this.loadUsers();
    },
    searchTerm() {
      this.page = 1;
      this.loadUsers();
    },
    roleFilter() {
      this.page = 1;
      this.loadUsers();
    },
    activeOnlyFilter() {
      this.page = 1;
      this.loadUsers();
    }
  },
  
  methods: {
    async loadInitialData() {
      try {
        const [usersData, rolesData] = await Promise.all([
          superAdminAPI.getUsers({ page: 1 }),
          superAdminAPI.getUserRoles()
        ]);
        
        this.users = usersData.users;
        this.totalPages = usersData.pagination.totalPages;
        this.roles = rolesData.roles;
      } catch (err) {
        this.error = 'Erreur lors du chargement des données: ' + err.message;
      } finally {
        this.loading = false;
      }
    },
    
    async loadUsers() {
      try {
        this.loading = true;
        const response = await superAdminAPI.getUsers({
          page: this.page,
          search: this.searchTerm || null,
          role: this.roleFilter || null,
          activeOnly: this.activeOnlyFilter
        });
        
        this.users = response.users;
        this.totalPages = response.pagination.totalPages;
      } catch (err) {
        this.error = 'Erreur lors du chargement des utilisateurs: ' + err.message;
      } finally {
        this.loading = false;
      }
    },
    
    handleEditRole(user) {
      console.log('handleEditRole appelé avec:', user);
      if (!user || !user.id) {
        this.error = 'Utilisateur invalide';
        return;
      }
      
      this.selectedUser = user;
      this.newRole = user.role;
      this.editDialogOpen = true;
      this.error = null;
    },
    
    async handleUpdateRole() {
      try {
        await superAdminAPI.updateUserRole(this.selectedUser.id, this.newRole);
        this.success = 'Rôle mis à jour avec succès';
        this.editDialogOpen = false;
        await this.loadUsers();
      } catch (err) {
        this.error = 'Erreur lors de la mise à jour du rôle: ' + err.message;
      }
    },
    
    handleToggleStatus(user) {
      console.log('handleToggleStatus appelé avec:', user);
      if (!user || !user.id) {
        this.error = 'Utilisateur invalide';
        return;
      }
      
      this.selectedUser = user;
      this.statusDialogOpen = true;
      this.error = null;
    },
    
    async handleUpdateStatus() {
      if (!this.selectedUser) {
        this.error = 'Aucun utilisateur sélectionné';
        return;
      }

      this.isUpdatingStatus = true;
      this.error = null;

      try {
        const newStatus = !this.selectedUser.is_active;
        console.log('Mise à jour du statut utilisateur:', {
          userId: this.selectedUser.id,
          currentStatus: this.selectedUser.is_active,
          newStatus: newStatus
        });
        
        const response = await superAdminAPI.updateUserStatus(this.selectedUser.id, newStatus);
        console.log('Réponse API updateUserStatus:', response);
        
        // Vérifier si la réponse contient une propriété success
        if (response && (response.success === true || response.message)) {
          // Mettre à jour l'utilisateur dans la liste locale
          const userIndex = this.users.findIndex(u => u.id === this.selectedUser.id);
          if (userIndex !== -1) {
            this.users[userIndex].is_active = newStatus;
          }
          
          // Mettre à jour l'utilisateur sélectionné
          this.selectedUser.is_active = newStatus;
          
          this.success = `Utilisateur ${newStatus ? 'activé' : 'désactivé'} avec succès`;
          this.statusDialogOpen = false;
        } else {
          throw new Error('Réponse API invalide');
        }
        
        // Recharger la liste pour s'assurer de la cohérence
        await this.loadUsers();
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        this.error = error.response?.data?.error || 'Erreur lors de la mise à jour du statut';
      } finally {
        this.isUpdatingStatus = false;
      }
    },

    async handleViewDetails(user) {
      this.selectedUser = user;
      this.detailsDialogOpen = true;
      this.userDetails = null;
      
      try {
        this.userDetails = await superAdminAPI.getUserDetails(user.id);
      } catch (error) {
        console.error('Erreur lors de la récupération des détails:', error);
        this.$toast.error('Erreur lors de la récupération des détails de l\'utilisateur');
        this.detailsDialogOpen = false;
      }
    },

    async handleEditUser(user) {
      console.log('handleEditUser appelé avec:', user);
      if (!user || !user.id) {
        this.error = 'Utilisateur invalide';
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
      
      // Charger les entreprises
      await this.loadAllCompanies();
      await this.loadUserCompanies(user.id);
    },

    async updateUserInfo() {
      if (!this.selectedUser || !this.selectedUser.id) {
        this.error = 'Aucun utilisateur sélectionné';
        return;
      }

      // Validation des champs requis
      if (!this.editUserForm.first_name || !this.editUserForm.last_name || !this.editUserForm.email) {
        this.error = 'Veuillez remplir tous les champs obligatoires';
        return;
      }

      // Validation de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.editUserForm.email)) {
        this.error = 'Veuillez saisir une adresse email valide';
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

        await superAdminAPI.updateUser(this.selectedUser.id, userData);
        
        // Mettre à jour l'utilisateur dans la liste
        const userIndex = this.users.findIndex(u => u.id === this.selectedUser.id);
        if (userIndex !== -1) {
          this.users[userIndex] = { ...this.users[userIndex], ...userData };
        }
        
        this.success = 'Informations utilisateur mises à jour avec succès';
        this.editUserDialogOpen = false;
        
        // Recharger la liste pour s'assurer de la cohérence
        await this.loadUsers();
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
        this.error = error.response?.data?.error || 'Erreur lors de la mise à jour de l\'utilisateur';
      } finally {
        this.isUpdatingUser = false;
      }
    },

    async updateUserPassword() {
      if (!this.editUserForm.newPassword || !this.editUserForm.confirmPassword) {
        this.error = 'Veuillez remplir tous les champs de mot de passe';
        return;
      }

      if (this.editUserForm.newPassword !== this.editUserForm.confirmPassword) {
        this.error = 'Les mots de passe ne correspondent pas';
        return;
      }

      if (this.editUserForm.newPassword.length < 8) {
        this.error = 'Le mot de passe doit contenir au moins 8 caractères';
        return;
      }

      this.isUpdatingPassword = true;
      this.error = null;

      try {
        await superAdminAPI.updateUserPassword(this.selectedUser.id, this.editUserForm.newPassword);
        this.success = 'Mot de passe mis à jour avec succès';
        
        // Réinitialiser les champs de mot de passe
        this.editUserForm.newPassword = '';
        this.editUserForm.confirmPassword = '';
      } catch (error) {
        console.error('Erreur lors de la mise à jour du mot de passe:', error);
        this.error = error.response?.data?.error || 'Erreur lors de la mise à jour du mot de passe';
      } finally {
        this.isUpdatingPassword = false;
      }
    },

    async loadUserCompanies(userId) {
      this.isLoadingCompanies = true;
      try {
        this.userCompanies = await superAdminAPI.getUserCompanies(userId);
      } catch (error) {
        console.error('Erreur lors du chargement des entreprises utilisateur:', error);
        this.userCompanies = [];
      } finally {
        this.isLoadingCompanies = false;
      }
    },

    async loadAllCompanies() {
      try {
        this.allCompanies = await superAdminAPI.getAllCompanies();
      } catch (error) {
        console.error('Erreur lors du chargement des entreprises:', error);
        this.allCompanies = [];
      }
    },

    async addUserToCompany() {
      if (!this.selectedCompanyId) {
        this.error = 'Veuillez sélectionner une entreprise';
        return;
      }

      try {
        await superAdminAPI.addUserToCompany(this.selectedUser.id, this.selectedCompanyId);
        this.success = 'Utilisateur associé à l\'entreprise avec succès';
        this.selectedCompanyId = '';
        await this.loadUserCompanies(this.selectedUser.id);
      } catch (error) {
        console.error('Erreur lors de l\'association:', error);
        this.error = error.response?.data?.error || 'Erreur lors de l\'association à l\'entreprise';
      }
    },

    async removeUserFromCompany(companyId) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette association ?')) {
        return;
      }

      try {
        await superAdminAPI.removeUserFromCompany(this.selectedUser.id, companyId);
        this.success = 'Association supprimée avec succès';
        await this.loadUserCompanies(this.selectedUser.id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        this.error = error.response?.data?.error || 'Erreur lors de la suppression de l\'association';
      }
    },

    handleEditPassword(user) {
      this.selectedUser = user;
      this.newPassword = '';
      this.confirmPassword = '';
      this.passwordDialogOpen = true;
    },

    async handleUpdatePassword() {
      if (!this.newPassword || !this.confirmPassword) {
        this.error = 'Veuillez remplir tous les champs';
        return;
      }

      if (this.newPassword !== this.confirmPassword) {
        this.error = 'Les mots de passe ne correspondent pas';
        return;
      }

      if (this.newPassword.length < 8) {
        this.error = 'Le mot de passe doit contenir au moins 8 caractères';
        return;
      }

      this.isUpdatingPassword = true;
      this.error = null;

      try {
        await superAdminAPI.updateUserPassword(this.selectedUser.id, this.newPassword);
        this.success = 'Mot de passe mis à jour avec succès';
        this.passwordDialogOpen = false;
        this.newPassword = '';
        this.confirmPassword = '';
      } catch (error) {
        console.error('Erreur lors de la mise à jour du mot de passe:', error);
        this.error = error.response?.data?.error || 'Erreur lors de la mise à jour du mot de passe';
      } finally {
        this.isUpdatingPassword = false;
      }
    },

    handleDeleteUser(user) {
      console.log('handleDeleteUser appelé avec:', user);
      if (!user || !user.id) {
        this.error = 'Utilisateur invalide';
        return;
      }
      
      this.selectedUser = user;
      this.deleteDialogOpen = true;
      this.error = null;
    },

    async handleConfirmDelete() {
      if (!this.selectedUser || !this.selectedUser.id) {
        this.error = 'Aucun utilisateur sélectionné';
        return;
      }

      this.isDeletingUser = true;
      this.error = null;

      try {
        await superAdminAPI.deleteUser(this.selectedUser.id);
        
        // Retirer l'utilisateur de la liste
        this.users = this.users.filter(u => u.id !== this.selectedUser.id);
        
        this.success = 'Utilisateur supprimé avec succès';
        this.deleteDialogOpen = false;
        this.selectedUser = null;
        
        // Recharger la liste pour s'assurer de la cohérence
        await this.loadUsers();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        this.error = error.response?.data?.error || 'Erreur lors de la suppression de l\'utilisateur';
      } finally {
        this.isDeletingUser = false;
      }
    },

    async handleConfirmDelete() {
      try {
        await superAdminAPI.deleteUser(this.selectedUser.id);
        
        // Supprimer l'utilisateur de la liste
        this.users = this.users.filter(u => u.id !== this.selectedUser.id);
        
        this.deleteDialogOpen = false;
        this.selectedUser = null;
        
        this.$toast.success('Utilisateur supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        this.$toast.error('Erreur lors de la suppression de l\'utilisateur');
      }
    },
    
    getRoleColorClass(role) {
      const colors = {
        'super_admin': 'bg-red-100 text-red-800',
        'admin': 'bg-yellow-100 text-yellow-800',
        'agent': 'bg-blue-100 text-blue-800',
        'prestataire': 'bg-green-100 text-green-800',
        'user': 'bg-gray-100 text-gray-800'
      };
      return colors[role] || 'bg-gray-100 text-gray-800';
    },
    
    getRoleLabel(role) {
      const roleObj = this.roles.find(r => r.value === role);
      return roleObj ? roleObj.label : role;
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Non disponible';
      
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
</script>

<style scoped>
/* Styles de boutons modernes et professionnels */
.btn-primary {
  @apply inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.btn-secondary {
  @apply inline-flex items-center justify-center px-4 py-2 text-sm font-semibold;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  color: #475569;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-action {
  @apply inline-flex items-center justify-center px-3 py-2 text-sm font-medium;
  border: none;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  min-width: 40px;
}

.btn-action:hover {
  transform: translateY(-1px);
}

.btn-action:active {
  transform: translateY(0);
}

.btn-info {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
}

.btn-info:hover {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-success:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.btn-warning:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.btn-orange {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.btn-orange:hover {
  background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.btn-danger:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

/* Tailles de boutons */
.btn-xs {
  @apply px-2 py-1 text-xs;
  min-width: 28px;
  border-radius: 6px;
}

.btn-sm {
  @apply px-3 py-1.5 text-sm;
  min-width: 32px;
  border-radius: 7px;
}

/* Effets spéciaux */
.btn-primary::before,
.btn-success::before,
.btn-danger::before,
.btn-warning::before,
.btn-info::before,
.btn-orange::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-primary:hover::before,
.btn-success:hover::before,
.btn-danger:hover::before,
.btn-warning:hover::before,
.btn-info:hover::before,
.btn-orange:hover::before {
  left: 100%;
}

/* Responsive */
@media (max-width: 640px) {
  .btn-action {
    min-width: 36px;
    padding: 8px;
  }
  
  .btn-action span {
    display: none;
  }
}

/* Animation pour les icônes */
.btn-action:hover .fa-icon,
.btn-primary:hover .fa-icon,
.btn-secondary:hover .fa-icon {
  transform: scale(1.1);
}

.fa-icon {
  transition: transform 0.2s ease;
}

/* Styles de pagination */
.btn-pagination {
  @apply inline-flex items-center justify-center px-3 py-2 text-sm font-medium;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 40px;
}

.btn-pagination:hover {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-pagination-active {
  @apply inline-flex items-center justify-center px-3 py-2 text-sm font-medium;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  min-width: 40px;
  font-weight: 600;
}

.btn-pagination-active:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}
</style>