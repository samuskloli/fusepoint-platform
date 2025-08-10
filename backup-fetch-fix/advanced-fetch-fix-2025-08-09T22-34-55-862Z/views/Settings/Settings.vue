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
                  <input type="email" v-model="profile.email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input type="tel" v-model="profile.phone" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                </div>
                
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Entreprise</label>
                  <input type="text" v-model="profile.company" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                </div>
                
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea v-model="profile.bio" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"></textarea>
                </div>
              </div>
              
              <div class="mt-6">
                <button class="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
                  Sauvegarder les modifications
                </button>
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
                  <input type="password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                  <input type="password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
                  <input type="password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                </div>
                
                <button class="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
                  Mettre à jour le mot de passe
                </button>
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
                <button class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                  Activer 2FA
                </button>
              </div>
            </div>

            <!-- Login Sessions -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-6">Sessions actives</h2>
              
              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div class="p-2 bg-green-100 rounded-lg">
                      <svg class="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586l-2 2V5H5v14h14v-1.586l2-2V19a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">MacBook Pro - Chrome</p>
                      <p class="text-sm text-gray-500">Paris, France • Session actuelle</p>
                    </div>
                  </div>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Actuelle
                  </span>
                </div>
                
                <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div class="p-2 bg-blue-100 rounded-lg">
                      <svg class="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 110 2h-1v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6H4a1 1 0 110-2h3zM9 3v1h6V3H9z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">iPhone - Safari</p>
                      <p class="text-sm text-gray-500">Paris, France • Il y a 2 heures</p>
                    </div>
                  </div>
                  <button class="text-red-600 hover:text-red-700 text-sm font-medium">
                    Révoquer
                  </button>
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
                    <button class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Copier
                    </button>
                    <button class="text-red-600 hover:text-red-700 text-sm font-medium">
                      Révoquer
                    </button>
                  </div>
                </div>
                
                <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Clé API de test</h3>
                    <p class="text-sm text-gray-500 font-mono">fp_test_••••••••••••••••••••••••••••••••</p>
                    <p class="text-sm text-gray-500">Créée le 10 janvier 2024</p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Copier
                    </button>
                    <button class="text-red-600 hover:text-red-700 text-sm font-medium">
                      Révoquer
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="mt-6">
                <button class="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
                  Générer une nouvelle clé
                </button>
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
                <button class="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
                  Ajouter un webhook
                </button>
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
                <button class="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
                  Sauvegarder les informations
                </button>
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
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '+33 1 23 45 67 89',
        company: 'Mon Entreprise',
        bio: 'Responsable marketing digital passionné par l\'innovation et les nouvelles technologies.'
      },
      notifications: {
        email: true,
        push: true,
        weekly: true,
        campaigns: true
      },
      emailFrequency: 'daily',
      billing: {
        companyName: 'Mon Entreprise SARL',
        vatNumber: 'FR12345678901',
        address: '123 Rue de la Paix',
        city: 'Paris',
        zipCode: '75001',
        country: 'FR',
        includeTax: true,
        autoInvoice: true
      }
    }
  }
}
</script>