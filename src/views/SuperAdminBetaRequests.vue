<template>
  <RoleLayout>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Demandes d'accès bêta</h1>

      <div v-if="loading" class="text-gray-600">Chargement…</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>

      <div v-else>
        <div class="overflow-x-auto bg-white rounded-lg shadow">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cas d’usage</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créé le</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="req in requests" :key="req.id">
                <td class="px-4 py-2">{{ req.company || '—' }}</td>
                <td class="px-4 py-2">{{ req.first_name || '—' }}</td>
                <td class="px-4 py-2">{{ req.last_name || '—' }}</td>
                <td class="px-4 py-2">
                  <a :href="`mailto:${req.contact}`" class="text-indigo-600 hover:underline">{{ req.contact }}</a>
                </td>
                <td class="px-4 py-2 whitespace-pre-line">{{ req.usecase || '—' }}</td>
                <td class="px-4 py-2"><span class="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700">{{ req.status }}</span></td>
                <td class="px-4 py-2">{{ formatDate(req.created_at) }}</td>
              </tr>
              <tr v-if="!requests.length">
                <td colspan="7" class="px-4 py-6 text-center text-gray-500">Aucune demande pour le moment.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </RoleLayout>
</template>

<script>
import RoleLayout from '@/components/RoleLayout.vue'
import api from '../services/api.js'

export default {
  name: 'SuperAdminBetaRequests',
  components: { RoleLayout },
  data(){
    return {
      requests: [],
      loading: true,
      error: ''
    }
  },
  methods: {
    async load(){
      this.loading = true
      this.error = ''
      try {
        const { data } = await api.get('/api/super-admin/beta-requests')
        this.requests = data?.data || []
      } catch (e) {
        this.error = e.userMessage || 'Erreur lors du chargement des demandes'
      } finally {
        this.loading = false
      }
    },
    formatDate(d){
      if(!d) return ''
      try {
        const dt = new Date(d)
        return dt.toLocaleString('fr-FR')
      } catch {
        return String(d)
      }
    }
  },
  mounted(){
    this.load()
  }
}
</script>