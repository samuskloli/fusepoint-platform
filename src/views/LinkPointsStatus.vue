<template>
  <Layout>
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-2xl font-semibold">Statut des LinkPoints</h1>
          <p class="text-gray-600">Suivez la source utilisée (base vs backup) et la fraîcheur des sauvegardes.</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="load" class="px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">Rafraîchir</button>
          <router-link to="/linkpoints" class="px-3 py-2 rounded bg-primary-600 text-white hover:bg-primary-700">Retour</router-link>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-left border-b">
              <th class="py-2 px-4">Slug</th>
              <th class="py-2 px-4">Lien public</th>
              <th class="py-2 px-4">Backup présent</th>
              <th class="py-2 px-4">DB mis à jour</th>
              <th class="py-2 px-4">Backup mis à jour</th>
              <th class="py-2 px-4">Mode</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in status" :key="row.slug" class="border-b">
              <td class="py-2 px-4 font-medium">{{ row.slug }}</td>
              <td class="py-2 px-4">
                <a :href="publicUrl(row.slug)" target="_blank" rel="noopener" class="text-primary-600 hover:underline">{{ publicUrl(row.slug) }}</a>
              </td>
              <td class="py-2 px-4">
                <span :class="row.hasFile ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-1 rounded">{{ row.hasFile ? 'Oui' : 'Non' }}</span>
              </td>
              <td class="py-2 px-4">{{ formatDate(row.dbUpdatedAt) }}</td>
              <td class="py-2 px-4">{{ formatDate(row.lastBackup) }}</td>
              <td class="py-2 px-4">
                <span :class="modeBadgeClass(effectiveMode(row))" class="px-2 py-1 rounded">{{ modeLabel(effectiveMode(row)) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="status.length === 0" class="p-4 text-gray-500">Aucun LinkPoint actif.</div>
      </div>

      <div class="text-xs text-gray-500 mt-3">Dernière vérification: {{ formatDate(checkedAt) }}</div>
    </div>
  </Layout>
</template>

<script>
import Layout from '@/components/Layout.vue'
import linkpointsAPI from '@/services/linkpointsAPI'

export default {
  name: 'LinkPointsStatus',
  components: { Layout },
  data() {
    return {
      status: [],
      checkedAt: null,
      loading: false,
    }
  },
  created() { this.load() },
  methods: {
    publicUrl(slug) { return linkpointsAPI.publicUrl(slug) },
    async load() {
      this.loading = true
      try {
        const res = await linkpointsAPI.backupStatus()
        this.status = Array.isArray(res?.status) ? res.status : []
        this.checkedAt = res?.checkedAt || null
      } catch (e) {
        console.error('Erreur chargement statut backups:', e)
        this.status = []
      } finally {
        this.loading = false
      }
    },
    formatDate(d) {
      if (!d) return '—'
      try {
        const dt = new Date(d)
        if (isNaN(dt.getTime())) return '—'
        return dt.toLocaleString()
      } catch (e) {
        return '—'
      }
    },
    effectiveMode(row) {
      const dbTs = row.dbUpdatedAt ? new Date(row.dbUpdatedAt).getTime() : 0
      const backupTs = row.lastBackup ? new Date(row.lastBackup).getTime() : 0
      if (row.hasFile && backupTs > dbTs) return 'backup'
      return 'base'
    },
    modeLabel(mode) {
      return mode === 'backup' ? 'Backup' : 'Base (DB)'
    },
    modeBadgeClass(mode) {
      return mode === 'backup' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
    }
  }
}
</script>

<style scoped>
</style>