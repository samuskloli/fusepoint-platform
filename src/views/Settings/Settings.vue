<template>
  <Layout>
    <div>
          <!-- Page Header -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Paramètres</h1>
            <p class="mt-2 text-gray-600">Gérez vos préférences et configurations</p>
          </div>

          <!-- Settings Navigation -->
          <div class="bg-white rounded-lg shadow mb-8">
            <div class="border-b border-gray-200">
              <nav class="-mb-px flex space-x-8 px-6">
                <button 
                  v-for="tab in tabs" 
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  :class="[
                    'py-4 px-1 border-b-2 font-medium text-sm',
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  ]"
                >
                  {{ tab.name }}
                </button>
              </nav>
            </div>
          </div>

          <!-- Profile Settings -->
          <div v-if="activeTab === 'profile'" class="space-y-6">
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-6">Informations du profil</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <input type="text" v-model="profile.firstName" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input type="text" v-model="profile.lastName" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" v-model="profile.email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="votre@email.com">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input type="tel" v-model="profile.phone" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Ex: +33 1 23 45 67 89">
                </div>
                
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Entreprise</label>
                  <input type="text" v-model="profile.company" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Nom de votre entreprise">
                </div>
                
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea v-model="profile.bio" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Parlez brièvement de vous"></textarea>
                </div>
              </div>
              
              <div class="mt-6">
                <button @click="saveProfile" :disabled="isSaving" class="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-60">
                  <span v-if="!isSaving">Sauvegarder les modifications</span>
                  <span v-else>Sauvegarde...</span>
                </button>
                <p v-if="saveMessage" :class="['mt-2 text-sm', saveError ? 'text-red-600' : 'text-green-600']">{{ saveMessage }}</p>
                <!-- Infos: tous les champs pertinents sont désormais gérés par le backend et liés à l'entreprise lorsque nécessaire. -->
              </div>
            </div>

            <!-- Avatar Section -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-6">Photo de profil</h2>
              
              <div class="flex items-center space-x-6">
                <div class="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                  <svg class="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <button class="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Changer la photo
                  </button>
                  <p class="mt-2 text-sm text-gray-500">JPG, GIF ou PNG. 1MB max.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Account Settings -->
          <div v-if="activeTab === 'account'" class="space-y-6">
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-6">Sécurité du compte</h2>
              
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                  <input type="password" v-model="account.currentPassword" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                  <input type="password" v-model="account.newPassword" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
                  <input type="password" v-model="account.confirmPassword" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                </div>
                
                <button @click="changePassword" :disabled="isSavingPassword" class="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-60">
                  <span v-if="!isSavingPassword">Mettre à jour le mot de passe</span>
                  <span v-else>Mise à jour...</span>
                </button>
                <p v-if="passwordMessage" :class="['mt-2 text-sm', passwordError ? 'text-red-600' : 'text-green-600']">{{ passwordMessage }}</p>
              </div>
            </div>

            <!-- Two-Factor Authentication -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-6">Authentification à deux facteurs</h2>
              
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-900">Sécurisez votre compte avec l'authentification à deux facteurs</p>
                  <p class="text-sm text-gray-500">Ajoutez une couche de sécurité supplémentaire à votre compte</p>
                </div>
                <button disabled class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md cursor-not-allowed">
                  Bientôt disponible
                </button>
              </div>
            </div>

            <!-- Login Sessions -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-6">Sessions actives</h2>
              
              <div v-if="sessionsLoading" class="text-sm text-gray-500">Chargement des sessions...</div>
              <div v-else-if="sessions.length === 0" class="text-sm text-gray-500">Aucune session active trouvée.</div>
              <div v-else class="space-y-4">
                <div v-for="session in sessions" :key="session.created_at || session.token" class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div class="p-2 rounded-lg" :class="isCurrentSession(session) ? 'bg-green-100' : 'bg-blue-100'">
                      <svg class="h-5 w-5" :class="isCurrentSession(session) ? 'text-green-600' : 'text-blue-600'" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586l-2 2V5H5v14h14v-1.586l2-2V19a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ session.user_agent || 'Session' }}</p>
                      <p class="text-sm text-gray-500">Exp. {{ formatDate(session.expires_at) }} • IP {{ session.ip_address || '—' }}</p>
                    </div>
                  </div>
                  <span v-if="isCurrentSession(session)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Actuelle</span>
                  <button v-else @click="revokeSession(session)" class="text-red-600 hover:text-red-700 text-sm font-medium">Révoquer</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Notifications Settings -->
          <div v-if="activeTab === 'notifications'" class="space-y-6">
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-6">Préférences de notification</h2>
              
              <div class="space-y-6">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Notifications par email</h3>
                    <p class="text-sm text-gray-500">Recevez des notifications par email</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="notifications.email" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Notifications push</h3>
                    <p class="text-sm text-gray-500">Recevez des notifications push dans le navigateur</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="notifications.push" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Rapports hebdomadaires</h3>
                    <p class="text-sm text-gray-500">Recevez un résumé hebdomadaire de vos performances</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="notifications.weekly" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Alertes de campagne</h3>
                    <p class="text-sm text-gray-500">Soyez notifié des événements importants de vos campagnes</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="notifications.campaigns" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Email Frequency -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-6">Fréquence des emails</h2>
              
              <div class="space-y-4">
                <label class="flex items-center">
                  <input type="radio" v-model="emailFrequency" value="immediate" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300">
                  <span class="ml-3 text-sm text-gray-900">Immédiatement</span>
                </label>
                
                <label class="flex items-center">
                  <input type="radio" v-model="emailFrequency" value="daily" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300">
                  <span class="ml-3 text-sm text-gray-900">Résumé quotidien</span>
                </label>
                
                <label class="flex items-center">
                  <input type="radio" v-model="emailFrequency" value="weekly" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300">
                  <span class="ml-3 text-sm text-gray-900">Résumé hebdomadaire</span>
                </label>
                
                <label class="flex items-center">
                  <input type="radio" v-model="emailFrequency" value="never" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300">
                  <span class="ml-3 text-sm text-gray-900">Jamais</span>
                </label>
              </div>
              <div class="mt-6">
                <button @click="saveNotifications" :disabled="isSavingNotifications" class="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-60">
                  <span v-if="!isSavingNotifications">Sauvegarder les préférences</span>
                  <span v-else>Sauvegarde...</span>
                </button>
                <p v-if="notificationsMessage" :class="['mt-2 text-sm', notificationsError ? 'text-red-600' : 'text-green-600']">{{ notificationsMessage }}</p>
              </div>
            </div>
          </div>

          <!-- API Settings -->
          <div v-if="activeTab === 'api'" class="space-y-6">
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-6">Clés API</h2>
              
              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Clé API principale</h3>
                    <p class="text-sm text-gray-500 font-mono">fp_live_••••••••••••••••••••••••••••••••</p>
                    <p class="text-sm text-gray-500">Créée le 15 janvier 2024</p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button disabled class="text-gray-400 text-sm font-medium cursor-not-allowed">Copier (à venir)</button>
                    <button disabled class="text-gray-400 text-sm font-medium cursor-not-allowed">Révoquer (à venir)</button>
                  </div>
                </div>
                
                <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Clé API de test</h3>
                    <p class="text-sm text-gray-500 font-mono">fp_test_••••••••••••••••••••••••••••••••</p>
                    <p class="text-sm text-gray-500">Créée le 10 janvier 2024</p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button disabled class="text-gray-400 text-sm font-medium cursor-not-allowed">Copier (à venir)</button>
                    <button disabled class="text-gray-400 text-sm font-medium cursor-not-allowed">Révoquer (à venir)</button>
                  </div>
                </div>
              </div>
              
              <div class="mt-6">
                <button disabled class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md cursor-not-allowed">Génération de clé (à venir)</button>
              </div>
            </div>

            <!-- Email Marketing Integration -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-6">Intégration Email Marketing</h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Clé API</label>
                  <input type="text" v-model="apiConfig.emailMarketing.apiKey" placeholder="Entrez votre clé API" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                </div>
                <div>
                  <button @click="saveApiConfig('email_marketing')" :disabled="apiSaving" class="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-60">
                    <span v-if="!apiSaving">Sauvegarder la configuration</span>
                    <span v-else>Sauvegarde...</span>
                  </button>
                  <p v-if="apiMessage" :class="['mt-2 text-sm', apiError ? 'text-red-600' : 'text-green-600']">{{ apiMessage }}</p>
                </div>
              </div>
            </div>

            <!-- Webhooks -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-6">Webhooks</h2>
              
              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Campaign Events</h3>
                    <p class="text-sm text-gray-500">https://api.monsite.com/webhooks/campaigns</p>
                    <div class="flex items-center mt-2">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Actif
                      </span>
                      <span class="ml-2 text-xs text-gray-500">Dernière livraison: Il y a 2 heures</span>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Modifier
                    </button>
                    <button class="text-red-600 hover:text-red-700 text-sm font-medium">
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="mt-6">
                <button disabled class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md cursor-not-allowed">Ajouter un webhook (à venir)</button>
              </div>
            </div>
          </div>

          <!-- Billing Settings -->
          <div v-if="activeTab === 'billing'" class="space-y-6">
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-6">Informations de facturation</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise</label>
                  <input type="text" v-model="billing.companyName" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Numéro de TVA</label>
                  <input type="text" v-model="billing.vatNumber" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                </div>
                
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                  <input type="text" v-model="billing.address" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                  <input type="text" v-model="billing.city" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Code postal</label>
                  <input type="text" v-model="billing.zipCode" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                  <select v-model="billing.country" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="FR">France</option>
                    <option value="BE">Belgique</option>
                    <option value="CH">Suisse</option>
                    <option value="CA">Canada</option>
                    <option value="US">États-Unis</option>
                  </select>
                </div>
              </div>
              
              <div class="mt-6">
                <button @click="saveBilling" class="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
                  Sauvegarder les informations
                </button>
                <p v-if="billingMessage" class="mt-2 text-sm text-gray-600">{{ billingMessage }}</p>
              </div>
            </div>

            <!-- Tax Settings -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-6">Paramètres fiscaux</h2>
              
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Facturation avec TVA</h3>
                    <p class="text-sm text-gray-500">Inclure la TVA sur les factures</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="billing.includeTax" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Factures automatiques</h3>
                    <p class="text-sm text-gray-500">Générer automatiquement les factures</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="billing.autoInvoice" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
    </div>
  </Layout>
</template>

<script>
import Layout from '../../components/Layout.vue'
import api from '../../services/api.js'

export default {
  name: 'Settings',
  components: {
    Layout
  },
  data() {
    return {
      activeTab: 'profile',
      tabs: [
        { id: 'profile', name: 'Profil' },
        { id: 'account', name: 'Compte' },
        { id: 'notifications', name: 'Notifications' },
        { id: 'api', name: 'API' },
        { id: 'billing', name: 'Facturation' }
      ],
      profile: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        bio: ''
      },
      originalEmail: '',
      companyId: null,
      isLoading: false,
      isSaving: false,
      saveMessage: '',
      saveError: false,
      notifications: {
        email: true,
        push: false,
        weekly: true,
        campaigns: true
      },
      emailFrequency: 'daily',
      // Détails entreprise et facturation (liés au backend)
      billing: {
        companyName: '',
        vatNumber: '',
        address: '',
        city: '',
        zipCode: '',
        country: 'FR',
        includeTax: false,
        autoInvoice: false
      },
      companyIndustry: 'general',
      // Compte
      account: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      isSavingPassword: false,
      passwordMessage: '',
      passwordError: false,
      // Sessions
      sessions: [],
      sessionsLoading: false,
      // Notifications
      isSavingNotifications: false,
      notificationsMessage: '',
      notificationsError: false,
      // Facturation
      billingMessage: ''
      ,
      // API Configurations
      apiConfig: {
        emailMarketing: { apiKey: '' }
      },
      apiMessage: '',
      apiError: false,
      apiSaving: false
    }
  },
  created() {
    this.loadProfile()
    this.loadSessions()
    this.loadPreferences()
    this.loadApiConfig('email_marketing')
  },
  methods: {
    async loadProfile() {
      try {
        this.isLoading = true
        const { data } = await api.get('/api/auth/me')
        if (data && data.user) {
          const u = data.user
          this.profile.firstName = u.firstName || ''
          this.profile.lastName = u.lastName || ''
          this.profile.email = u.email || ''
          this.originalEmail = this.profile.email
          const companies = data.companies || []
          this.profile.company = companies.length ? (companies[0].name || '') : ''
          this.companyId = companies.length ? companies[0].id : null
          // Charger téléphone et bio si présents
          this.profile.phone = u.phone || ''
          this.profile.bio = u.bio || ''
          // Charger les détails d'entreprise/billing si disponible
          if (this.companyId) {
            await this.loadCompany()
          }
        }
      } catch (error) {
        console.error('Erreur chargement profil:', error)
      } finally {
        this.isLoading = false
      }
    },
    async saveProfile() {
      try {
        this.isSaving = true
        this.saveMessage = ''
        this.saveError = false

        // Validation minimale côté client pour éviter les erreurs 400 côté serveur
        const fn = String(this.profile.firstName || '').trim()
        const ln = String(this.profile.lastName || '').trim()
        if (!fn || !ln) {
          this.saveMessage = 'Prénom et nom requis.'
          this.saveError = true
          this.isSaving = false
          return
        }

        const payload = {
          firstName: fn,
          lastName: ln,
          phone: this.profile.phone || null,
          bio: this.profile.bio || null
        }
        // Inclure l'email uniquement si modifié et valide
        if (this.profile.email !== this.originalEmail) {
          const emailStr = String(this.profile.email || '').trim()
          const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)
          if (!emailStr || !isValid) {
            this.saveMessage = 'Email invalide. Merci d\'entrer une adresse valide ou de rétablir l\'adresse précédente.'
            this.saveError = true
            this.isSaving = false
            return
          }
          payload.email = emailStr
        }
        const { data } = await api.put('/api/auth/profile', payload)

        // Si companyId présent et nom d'entreprise changé, essayer de sauvegarder côté entreprise
        if (this.companyId && this.profile.company) {
          try {
            await api.put(`/api/companies/${this.companyId}`, {
              name: this.profile.company,
              industry: this.companyIndustry || 'general'
            })
          } catch (e) {
            // Permissions insuffisantes ou autres erreurs: ignorer, message reste succès profil
          }
        }

        // Mettre à jour le localStorage si présent
        try {
          const storedUser = localStorage.getItem('user')
          if (storedUser) {
            const userObj = JSON.parse(storedUser)
            userObj.firstName = this.profile.firstName
            userObj.lastName = this.profile.lastName
            if (payload.email) {
              userObj.email = payload.email
              this.originalEmail = payload.email
            }
            localStorage.setItem('user', JSON.stringify(userObj))
          }
        } catch (e) {}

        this.saveMessage = 'Profil mis à jour avec succès.'
        this.saveError = false
      } catch (error) {
        console.error('Erreur sauvegarde profil:', error)
        let msg = error?.response?.data?.error || 'Erreur lors de la sauvegarde du profil'
        const details = error?.response?.data?.details || error?.userMessage || null
        if (details) {
          try {
            const d = typeof details === 'string' ? details : JSON.stringify(details)
            msg = `${msg} (${d})`
          } catch (_) {}
        }
        this.saveMessage = msg
        this.saveError = true
      } finally {
        this.isSaving = false
      }
    },
    // Compte: changement de mot de passe
    async changePassword() {
      try {
        this.passwordMessage = ''
        this.passwordError = false
        if (!this.account.currentPassword || !this.account.newPassword || !this.account.confirmPassword) {
          this.passwordMessage = 'Veuillez remplir tous les champs.'
          this.passwordError = true
          return
        }
        if (this.account.newPassword.length < 8) {
          this.passwordMessage = 'Le nouveau mot de passe doit contenir au moins 8 caractères.'
          this.passwordError = true
          return
        }
        if (this.account.newPassword !== this.account.confirmPassword) {
          this.passwordMessage = 'La confirmation ne correspond pas au nouveau mot de passe.'
          this.passwordError = true
          return
        }
        this.isSavingPassword = true
        const payload = {
          currentPassword: this.account.currentPassword,
          newPassword: this.account.newPassword
        }
        const { data } = await api.post('/api/auth/change-password', payload)
        this.passwordMessage = data?.message || 'Mot de passe changé avec succès.'
        this.passwordError = false
        // Reset champs sensibles
        this.account.currentPassword = ''
        this.account.newPassword = ''
        this.account.confirmPassword = ''
      } catch (error) {
        console.error('Erreur changement mot de passe:', error)
        const msg = error?.response?.data?.error || 'Erreur lors du changement de mot de passe'
        this.passwordMessage = msg
        this.passwordError = true
      } finally {
        this.isSavingPassword = false
      }
    },
    // Sessions
    async loadSessions() {
      try {
        this.sessionsLoading = true
        const { data } = await api.get('/api/auth/sessions')
        const list = data?.sessions || []
        // Adapter aux clés attendues par le template
        this.sessions = list.map(s => ({
          token: s.token,
          token_full: s.tokenFull,
          user_agent: s.userAgent,
          ip_address: s.ipAddress,
          created_at: s.createdAt,
          expires_at: s.expiresAt
        }))
      } catch (error) {
        console.error('Erreur chargement sessions:', error)
        this.sessions = []
      } finally {
        this.sessionsLoading = false
      }
    },
    async revokeSession(session) {
      try {
        if (!session?.token_full) return
        await api.delete('/api/auth/sessions', { data: { token: session.token_full } })
        // Recharger la liste
        await this.loadSessions()
      } catch (error) {
        console.error('Erreur révocation session:', error)
      }
    },
    isCurrentSession(session) {
      try {
        const currentToken = localStorage.getItem('sessionToken') || ''
        if (!currentToken || !session?.token) return false
        const prefix = (session.token || '').replace('...', '')
        return prefix && currentToken.startsWith(prefix)
      } catch (e) {
        return false
      }
    },
    formatDate(iso) {
      if (!iso) return '—'
      try {
        const d = new Date(iso)
        return d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
      } catch (e) {
        return iso
      }
    },
    // Notifications
    async loadPreferences() {
      try {
        // Charger via backend
        const { data } = await api.get('/api/auth/preferences')
        const prefs = data?.preferences || {}
        this.notifications.email = !!prefs.emailNotifications
        this.notifications.push = !!prefs.push
        this.notifications.weekly = !!prefs.weekly
        this.notifications.campaigns = !!prefs.campaigns
        this.emailFrequency = prefs.emailFrequency || this.emailFrequency
      } catch (error) {
        console.error('Erreur chargement préférences:', error)
      }
    },
    async saveNotifications() {
      try {
        this.isSavingNotifications = true
        this.notificationsMessage = ''
        this.notificationsError = false
        const payload = {
          darkMode: false,
          emailNotifications: this.notifications.email,
          language: 'fr',
          push: this.notifications.push,
          weekly: this.notifications.weekly,
          campaigns: this.notifications.campaigns,
          emailFrequency: this.emailFrequency
        }
        await api.put('/api/auth/preferences', payload)
        this.notificationsMessage = 'Préférences mises à jour.'
        this.notificationsError = false
      } catch (error) {
        console.error('Erreur sauvegarde préférences:', error)
        const msg = error?.response?.data?.error || 'Erreur lors de la sauvegarde des préférences'
        this.notificationsMessage = msg
        this.notificationsError = true
      } finally {
        this.isSavingNotifications = false
      }
    },
    // Charger les détails de l'entreprise et lier la facturation
    async loadCompany() {
      try {
        if (!this.companyId) return
        const { data } = await api.get(`/api/companies/${this.companyId}`)
        const c = data?.company || {}
        // Renseigner les informations d'entreprise
        this.profile.company = c.name || this.profile.company
        this.companyIndustry = c.industry || this.companyIndustry
        // Lier les champs de facturation aux colonnes backend
        this.billing.companyName = c.name || ''
        this.billing.vatNumber = c.vat_number || ''
        this.billing.address = c.address || ''
        this.billing.city = c.city || ''
        this.billing.zipCode = c.zip_code || ''
        this.billing.country = c.country || this.billing.country
        this.billing.includeTax = typeof c.include_tax === 'boolean' ? c.include_tax : this.billing.includeTax
        this.billing.autoInvoice = typeof c.auto_invoice === 'boolean' ? c.auto_invoice : this.billing.autoInvoice
      } catch (error) {
        console.error('Erreur chargement entreprise:', error)
        // Fallback local au cas où
        try {
          const ls = JSON.parse(localStorage.getItem('billingInfo') || '{}')
          this.billing = { ...this.billing, ...ls }
        } catch (e) {}
      }
    },
    async saveBilling() {
      try {
        this.billingMessage = ''
        // Sauvegarder côté serveur: endpoint dédié facturation
        if (this.companyId) {
          await api.put(`/api/companies/${this.companyId}/billing`, {
            name: this.billing.companyName || this.profile.company || '',
            vatNumber: this.billing.vatNumber || null,
            address: this.billing.address || null,
            city: this.billing.city || null,
            zipCode: this.billing.zipCode || null,
            country: this.billing.country || null,
            includeTax: !!this.billing.includeTax,
            autoInvoice: !!this.billing.autoInvoice
          })
          this.billingMessage = 'Informations de facturation mises à jour pour l’entreprise.'
        } else {
          // Persistance locale si aucune entreprise associée
          localStorage.setItem('billingInfo', JSON.stringify(this.billing))
          this.billingMessage = 'Informations de facturation sauvegardées localement.'
        }
      } catch (e) {
        // Fallback local en cas d’erreur (permissions, etc.)
        try {
          localStorage.setItem('billingInfo', JSON.stringify(this.billing))
        } catch (_) {}
        this.billingMessage = 'Sauvegarde locale effectuée (permissions serveur insuffisantes ou erreur réseau).'
      }
    },
    // API config
    async loadApiConfig(serviceType) {
      try {
        if (!this.companyId) return
        const { data } = await api.get(`/api/companies/${this.companyId}/api-config/${serviceType}`)
        const conf = data?.config?.config || data?.config || null
        if (serviceType === 'email_marketing' && conf) {
          this.apiConfig.emailMarketing.apiKey = conf.apiKey || ''
        }
      } catch (error) {
        // 404: pas de config, ignorer
      }
    },
    async saveApiConfig(serviceType) {
      try {
        if (!this.companyId) {
          this.apiMessage = 'Aucune entreprise associée.'
          this.apiError = true
          return
        }
        this.apiSaving = true
        this.apiMessage = ''
        this.apiError = false
        let config = {}
        if (serviceType === 'email_marketing') {
          config = { apiKey: this.apiConfig.emailMarketing.apiKey }
        }
        await api.post(`/api/companies/${this.companyId}/api-config`, {
          serviceType,
          config
        })
        this.apiMessage = 'Configuration API sauvegardée.'
        this.apiError = false
      } catch (error) {
        console.error('Erreur sauvegarde API config:', error)
        const msg = error?.response?.data?.error || 'Erreur lors de la sauvegarde de la configuration'
        this.apiMessage = msg
        this.apiError = true
      } finally {
        this.apiSaving = false
      }
    }
  }
}
</script>