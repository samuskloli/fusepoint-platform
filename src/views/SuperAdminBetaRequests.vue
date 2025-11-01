<template>
  <RoleLayout>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Demandes d'accès bêta</h1>

      <!-- Éditeur du modèle d'email de bienvenue bêta (ouvert dans une modale) -->
      <div class="bg-white rounded-lg shadow mb-6">
        <div class="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold">Modèle d'email envoyé aux inscrits à la bêta</h2>
            <p class="text-sm text-gray-500">Personnalisez le sujet et le message envoyés automatiquement lors d'une inscription à la bêta.</p>
          </div>
          <div class="flex items-center gap-2">
            <button @click="openTemplateModal" class="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Modifier le modèle d’email</button>
            <button @click="openEmailConfig" class="px-3 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 border border-gray-300">Configurer l’envoi d’email</button>
          </div>
        </div>
        <div class="p-6 space-y-2">
          <p class="text-sm text-gray-600">Utilisez le bouton ci-dessus pour modifier, tester et prévisualiser le modèle dans une modale.</p>
        </div>
      </div>

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
<!-- Modal configuration email dans le template principal -->
  <div v-if="showEmailConfigModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" @click.self="closeEmailConfig">
    <div class="bg-white w-full max-w-lg rounded-lg shadow-lg">
      <div class="px-6 py-4 border-b flex items-center justify-between">
        <h3 class="text-lg font-semibold">Configuration de l’envoi d’email</h3>
        <button @click="closeEmailConfig" class="text-gray-500 hover:text-gray-700">✕</button>
      </div>
    <div class="p-6 space-y-4">
      <div v-if="emailConfigLoading" class="text-gray-600">Chargement…</div>
      <div v-else>
        <label class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">Activer SMTP</span>
          <input type="checkbox" v-model="emailSettings.smtp_enabled" true-value="true" false-value="false" class="h-4 w-4">
        </label>
        <label class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">Notifications par email</span>
          <input type="checkbox" v-model="emailSettings.email_notifications" true-value="true" false-value="false" class="h-4 w-4">
        </label>
        <label class="block">
          <span class="text-sm font-medium text-gray-700">Nom de l’expéditeur</span>
          <input v-model="emailSettings.email_from_name" type="text" class="mt-1 block w-full rounded border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" placeholder="Fusepoint Hub">
        </label>
      </div>
      <div class="flex items-center gap-2">
        <button @click="saveEmailSettings" :disabled="emailConfigSaving" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
          {{ emailConfigSaving ? 'Enregistrement…' : 'Sauvegarder' }}
        </button>
        <button @click="closeEmailConfig" class="px-3 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 border border-gray-300">Fermer</button>
        <span v-if="emailConfigSuccess" class="text-green-600 text-sm">{{ emailConfigSuccess }}</span>
        <span v-if="emailConfigError" class="text-red-600 text-sm">{{ emailConfigError }}</span>
      </div>
    </div>
  </div>
</div>
<!-- Modale: Édition du modèle d'email de bienvenue bêta -->
<div v-if="showTemplateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" @click.self="closeTemplateModal">
  <div class="bg-white w-full max-w-2xl rounded-lg shadow-lg">
    <div class="px-6 py-4 border-b flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">Modèle d'email envoyé aux inscrits à la bêta</h3>
        <p class="text-sm text-gray-500">Personnalisez le sujet et le message envoyés automatiquement lors d'une inscription à la bêta.</p>
      </div>
      <button @click="closeTemplateModal" class="text-gray-500 hover:text-gray-700">✕</button>
    </div>
    <div class="p-6 space-y-4">
      <div v-if="templateLoading" class="text-gray-600">Chargement du modèle…</div>
      <div v-else>
        <div class="grid grid-cols-1 gap-4">
          <label class="block">
            <span class="text-sm font-medium text-gray-700">Sujet de l'email</span>
            <input v-model="templateSubject" type="text" class="mt-1 block w-full rounded border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" placeholder="Bienvenue dans la bêta Fusepoint — construisons la suite ensemble">
          </label>
          <label class="block">
            <span class="text-sm font-medium text-gray-700">Message</span>
<textarea v-model="templateBody" rows="7" class="mt-1 block w-full rounded border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" placeholder="Félicitations et un grand merci pour votre inscription à notre programme de bêta‑test !\n\nVotre participation marque le début d’une belle aventure commune. Vous serez parmi les premiers à découvrir, tester et façonner ce que nous construisons — et votre retour comptera vraiment.\n\nNous vous contacterons dès le lancement officiel de la phase de test.\n\nEn attendant, préparez‑vous à vivre une expérience motivante, pleine d’idées, d’échanges et d’innovation.\n\nÀ très bientôt,"></textarea>
            <p class="text-xs text-gray-500 mt-1">Conseil: utilisez des sauts de ligne pour séparer les paragraphes.</p>
          </label>
        </div>

        <div class="flex items-center gap-2 mt-2 flex-wrap">
          <button @click="saveTemplate" :disabled="templateSaving" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
            {{ templateSaving ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
          <div class="flex items-center gap-2">
            <input v-model="testEmail" type="email" placeholder="Adresse email de test" class="px-3 py-2 rounded border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 w-64">
            <button @click="sendTestEmail" :disabled="testSending || !isValidEmail(testEmail)" class="px-3 py-2 bg-gray-800 text-white rounded hover:bg-black disabled:opacity-50">{{ testSending ? 'Envoi…' : 'Tester l’email' }}</button>
          </div>
          <span v-if="templateSuccess" class="text-green-600 text-sm">Modèle enregistré.</span>
          <span v-if="templateError" class="text-red-600 text-sm">{{ templateError }}</span>
          <span v-if="testSuccessMsg" class="text-green-600 text-sm">{{ testSuccessMsg }}</span>
          <span v-if="testErrorMsg" class="text-red-600 text-sm">{{ testErrorMsg }}</span>
          <a v-if="testPreviewUrl" :href="testPreviewUrl" target="_blank" class="text-indigo-600 text-sm underline">Voir l’aperçu de l’email (dev)</a>
        </div>

        <!-- Aperçu -->
        <div class="mt-4 border-t pt-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Aperçu</h4>
          <div class="bg-gray-50 p-4 rounded">
            <div class="font-semibold mb-2">{{ templateSubject || 'Sujet par défaut' }}</div>
            <div class="prose prose-sm max-w-none">
              <p>Bonjour,</p>
              <div>
                <p v-for="p in paragraphs(templateBody)" :key="p.slice(0,20)" class="mb-2">{{ p }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
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
      error: '',
      // Template d'email bêta
      templateLoading: true,
      templateSaving: false,
      templateSubject: '',
      templateBody: '',
      templateError: '',
      templateSuccess: false,
      showTemplateModal: false,
      // Test email
      testEmail: '',
      testSending: false,
      testSuccessMsg: '',
      testErrorMsg: '',
      testPreviewUrl: '',
      // Modal configuration email
      showEmailConfigModal: false,
      emailConfigLoading: false,
      emailConfigSaving: false,
      emailConfigError: '',
      emailConfigSuccess: '',
      emailSettings: {
        smtp_enabled: 'true',
        email_notifications: 'true',
        email_from_name: 'Fusepoint Hub'
      }
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
    async loadTemplate(){
      this.templateLoading = true
      this.templateError = ''
      try {
        const { data } = await api.get('/api/super-admin/beta-email-template')
        const tpl = data?.data || {}
        this.templateSubject = tpl.subject || ''
        this.templateBody = tpl.body || ''
      } catch (e) {
        this.templateError = e.userMessage || 'Erreur lors du chargement du modèle'
      } finally {
        this.templateLoading = false
      }
    },
    async saveTemplate(){
      this.templateSaving = true
      this.templateError = ''
      this.templateSuccess = false
      try {
        await api.put('/api/super-admin/beta-email-template', {
          subject: this.templateSubject,
          body: this.templateBody
        })
        this.templateSuccess = true
        setTimeout(() => { this.templateSuccess = false }, 2500)
      } catch (e) {
        this.templateError = e.userMessage || 'Erreur lors de l\'enregistrement du modèle'
      } finally {
        this.templateSaving = false
      }
    },
    isValidEmail(e){
      return /^(?:[^\s@]+)@(?:[^\s@]+)\.[^\s@]+$/.test(String(e || ''))
    },
    openTemplateModal(){
      this.showTemplateModal = true
      // Recharger le template à l'ouverture pour récupérer la dernière version (y compris migrations)
      this.loadTemplate()
    },
    closeTemplateModal(){
      this.showTemplateModal = false
    },
    async sendTestEmail(){
      this.testSending = true
      this.testSuccessMsg = ''
      this.testErrorMsg = ''
      this.testPreviewUrl = ''
      try {
        const { data } = await api.post('/api/super-admin/beta-email-test', {
          to: this.testEmail,
          first_name: 'Test',
          last_name: 'User'
        })
        if (data?.success) {
          this.testSuccessMsg = 'Email de test envoyé.'
          this.testPreviewUrl = data?.data?.previewUrl || ''
        } else {
          this.testErrorMsg = data?.message || 'Erreur lors de l\'envoi du test'
        }
      } catch (e) {
        this.testErrorMsg = e?.userMessage || e?.message || 'Erreur lors de l\'envoi de l\'email de test'
      } finally {
        this.testSending = false
      }
    },
    // Email config modal
    openEmailConfig(){
      this.showEmailConfigModal = true
      this.loadEmailSettings()
    },
    closeEmailConfig(){
      this.showEmailConfigModal = false
    },
    async loadEmailSettings(){
      this.emailConfigLoading = true
      this.emailConfigError = ''
      try {
        const { data } = await api.get('/api/super-admin/settings-blocks/email')
        const settingsArr = data?.block?.settings || []
        const map = {}
        settingsArr.forEach(s => { map[s.key] = s.value })
        this.emailSettings.smtp_enabled = String(map.smtp_enabled ?? 'true')
        this.emailSettings.email_notifications = String(map.email_notifications ?? 'true')
        this.emailSettings.email_from_name = String(map.email_from_name ?? 'Fusepoint Hub')
      } catch (e) {
        this.emailConfigError = e?.userMessage || 'Erreur lors du chargement de la configuration email'
      } finally {
        this.emailConfigLoading = false
      }
    },
    async saveEmailSettings(){
      this.emailConfigSaving = true
      this.emailConfigError = ''
      this.emailConfigSuccess = ''
      try {
        const payload = {
          settings: [
            { key: 'smtp_enabled', value: String(this.emailSettings.smtp_enabled), type: 'boolean', description: 'Activer l\'envoi d\'emails via SMTP' },
            { key: 'email_notifications', value: String(this.emailSettings.email_notifications), type: 'boolean', description: 'Envoyer des notifications par email' },
            { key: 'email_from_name', value: String(this.emailSettings.email_from_name), type: 'string', description: 'Nom affiché comme expéditeur des emails' }
          ]
        }
        const { data } = await api.put('/api/super-admin/settings-blocks/email/batch', payload)
        if (data?.success) {
          this.emailConfigSuccess = 'Configuration sauvegardée'
          setTimeout(() => { this.emailConfigSuccess = '' }, 2500)
        } else {
          this.emailConfigError = data?.message || 'Échec de la sauvegarde'
        }
      } catch (e) {
        this.emailConfigError = e?.userMessage || 'Erreur lors de la sauvegarde de la configuration email'
      } finally {
        this.emailConfigSaving = false
      }
    },
    paragraphs(text){
      return String(text || '')
        .split(/\n\n+/)
        .map(s => s.trim())
        .filter(Boolean)
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
    this.loadTemplate()
  }
}
</script>