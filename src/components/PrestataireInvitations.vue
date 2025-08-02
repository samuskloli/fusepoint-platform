<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-gray-900">Gestion des Prestataires</h2>
      <button
        @click="showInviteModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
      >
        Inviter un Prestataire
      </button>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-blue-50 p-4 rounded-lg">
        <div class="text-2xl font-bold text-blue-600">{{ stats.totalPrestataires }}</div>
        <div class="text-sm text-gray-600">Prestataires Actifs</div>
      </div>
      <div class="bg-yellow-50 p-4 rounded-lg">
        <div class="text-2xl font-bold text-yellow-600">{{ stats.invitationsPendantes }}</div>
        <div class="text-sm text-gray-600">Invitations en Attente</div>
      </div>
      <div class="bg-green-50 p-4 rounded-lg">
        <div class="text-2xl font-bold text-green-600">{{ stats.invitationsAcceptees }}</div>
        <div class="text-sm text-gray-600">Invitations Acceptées</div>
      </div>
    </div>

    <!-- Onglets -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'prestataires'"
          :class="[
            activeTab === 'prestataires'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          Prestataires Actifs
        </button>
        <button
          @click="activeTab = 'invitations'"
          :class="[
            activeTab === 'invitations'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          Invitations
        </button>
      </nav>
    </div>

    <!-- Contenu des onglets -->
    <div v-if="activeTab === 'prestataires'">
      <div v-if="prestataires.length === 0" class="text-center py-8 text-gray-500">
        Aucun prestataire actif pour le moment.
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="prestataire in prestataires"
          :key="prestataire.id"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-medium text-gray-900">
                {{ prestataire.prenom }} {{ prestataire.nom }}
              </h3>
              <p class="text-sm text-gray-600">{{ prestataire.email }}</p>
              <p v-if="prestataire.telephone" class="text-sm text-gray-600">
                {{ prestataire.telephone }}
              </p>
              <div class="mt-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Actif depuis {{ formatDate(prestataire.created_at) }}
                </span>
              </div>
            </div>
            <div class="flex space-x-2">
              <button
                @click="viewPrestataire(prestataire)"
                class="text-blue-600 hover:text-blue-800 text-sm"
              >
                Voir Détails
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'invitations'">
      <div v-if="invitations.length === 0" class="text-center py-8 text-gray-500">
        Aucune invitation envoyée pour le moment.
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="invitation in invitations"
          :key="invitation.id"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-medium text-gray-900">{{ invitation.email }}</h3>
              <p class="text-sm text-gray-600">
                Invité le {{ formatDate(invitation.created_at) }}
              </p>
              <p class="text-sm text-gray-600">
                Expire le {{ formatDate(invitation.expires_at) }}
              </p>
              <div class="mt-2">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    invitation.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : invitation.status === 'accepted'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ getStatusLabel(invitation.status) }}
                </span>
              </div>
            </div>
            <div class="flex space-x-2">
              <button
                v-if="invitation.status === 'pending'"
                @click="resendInvitation(invitation.id)"
                class="text-blue-600 hover:text-blue-800 text-sm"
                :disabled="loading"
              >
                Renvoyer
              </button>
              <button
                v-if="invitation.status === 'pending'"
                @click="cancelInvitation(invitation.id)"
                class="text-red-600 hover:text-red-800 text-sm"
                :disabled="loading"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'invitation -->
    <div
      v-if="showInviteModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="showInviteModal = false"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        @click.stop
      >
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Inviter un Prestataire
          </h3>
          <form @submit.prevent="sendInvitation">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Adresse Email
              </label>
              <input
                v-model="inviteForm.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@exemple.com"
              />
            </div>
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Message personnalisé (optionnel)
              </label>
              <textarea
                v-model="inviteForm.message"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Message d'accompagnement pour l'invitation..."
              ></textarea>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="showInviteModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ loading ? 'Envoi...' : 'Envoyer l\'invitation' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

export default {
  name: 'PrestataireInvitations',
  setup() {
    const activeTab = ref('prestataires')
    const showInviteModal = ref(false)
    const loading = ref(false)
    const prestataires = ref([])
    const invitations = ref([])
    
    const inviteForm = ref({
      email: '',
      message: ''
    })

    const stats = computed(() => {
      return {
        totalPrestataires: prestataires.value.length,
        invitationsPendantes: invitations.value.filter(inv => inv.status === 'pending').length,
        invitationsAcceptees: invitations.value.filter(inv => inv.status === 'accepted').length
      }
    })

    const loadData = async () => {
      try {
        loading.value = true
        const token = localStorage.getItem('accessToken')
        
        // Charger les prestataires
        const prestataireResponse = await axios.get('/api/prestataire/my-prestataires', {
          headers: { Authorization: `Bearer ${token}` }
        })
        prestataires.value = prestataireResponse.data.prestataires || []
        
        // Charger les invitations
        const invitationResponse = await axios.get('/api/prestataire/invitations', {
          headers: { Authorization: `Bearer ${token}` }
        })
        invitations.value = invitationResponse.data.invitations || []
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      } finally {
        loading.value = false
      }
    }

    const sendInvitation = async () => {
      try {
        loading.value = true
        const token = localStorage.getItem('accessToken')
        
        await axios.post('/api/prestataire/invite', inviteForm.value, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        // Réinitialiser le formulaire
        inviteForm.value = { email: '', message: '' }
        showInviteModal.value = false
        
        // Recharger les données
        await loadData()
        
        alert('Invitation envoyée avec succès!')
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'invitation:', error)
        alert('Erreur lors de l\'envoi de l\'invitation')
      } finally {
        loading.value = false
      }
    }

    const cancelInvitation = async (invitationId) => {
      if (!confirm('Êtes-vous sûr de vouloir annuler cette invitation ?')) {
        return
      }
      
      try {
        loading.value = true
        const token = localStorage.getItem('accessToken')
        
        await axios.delete(`/api/prestataire/invitations/${invitationId}/cancel`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        await loadData()
        alert('Invitation annulée avec succès!')
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error)
        alert('Erreur lors de l\'annulation de l\'invitation')
      } finally {
        loading.value = false
      }
    }

    const resendInvitation = async (invitationId) => {
      try {
        loading.value = true
        const token = localStorage.getItem('accessToken')
        
        await axios.post(`/api/prestataire/invitations/${invitationId}/resend`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        alert('Invitation renvoyée avec succès!')
      } catch (error) {
        console.error('Erreur lors du renvoi:', error)
        alert('Erreur lors du renvoi de l\'invitation')
      } finally {
        loading.value = false
      }
    }

    const viewPrestataire = (prestataire) => {
      // Logique pour voir les détails du prestataire
      console.log('Voir prestataire:', prestataire)
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('fr-FR')
    }

    const getStatusLabel = (status) => {
      const labels = {
        pending: 'En attente',
        accepted: 'Acceptée',
        expired: 'Expirée',
        cancelled: 'Annulée'
      }
      return labels[status] || status
    }

    onMounted(() => {
      loadData()
    })

    return {
      activeTab,
      showInviteModal,
      loading,
      prestataires,
      invitations,
      inviteForm,
      stats,
      sendInvitation,
      cancelInvitation,
      resendInvitation,
      viewPrestataire,
      formatDate,
      getStatusLabel
    }
  }
}
</script>