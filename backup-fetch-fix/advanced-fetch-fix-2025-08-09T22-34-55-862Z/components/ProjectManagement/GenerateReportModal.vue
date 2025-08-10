<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" @click.stop>
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Générer un rapport</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form @submit.prevent="generateReport" class="mt-6">
        <div class="space-y-6">
          <!-- Type de rapport -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type de rapport</label>
            <div class="grid grid-cols-2 gap-3">
              <label v-for="type in reportTypes" :key="type.value" class="relative">
                <input
                  v-model="form.type"
                  :value="type.value"
                  type="radio"
                  class="sr-only"
                >
                <div class="flex items-center p-3 border rounded-lg cursor-pointer transition-colors" :class="{
                  'border-blue-500 bg-blue-50': form.type === type.value,
                  'border-gray-300 hover:border-gray-400': form.type !== type.value
                }">
                  <div class="flex-shrink-0">
                    <svg class="w-5 h-5" :class="form.type === type.value ? 'text-blue-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="type.icon"></path>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium" :class="form.type === type.value ? 'text-blue-900' : 'text-gray-900'">{{ type.label }}</div>
                    <div class="text-xs" :class="form.type === type.value ? 'text-blue-700' : 'text-gray-500'">{{ type.description }}</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Période -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Période</label>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-500 mb-1">Date de début</label>
                <input
                  v-model="form.start_date"
                  type="date"
                  required
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Date de fin</label>
                <input
                  v-model="form.end_date"
                  type="date"
                  required
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
              </div>
            </div>
          </div>

          <!-- Sections à inclure -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Sections à inclure</label>
            <div class="space-y-2">
              <label v-for="section in availableSections" :key="section.value" class="flex items-center">
                <input
                  v-model="form.sections"
                  :value="section.value"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
                <span class="ml-2 text-sm text-gray-700">{{ section.label }}</span>
                <span class="ml-1 text-xs text-gray-500">({{ section.description }})</span>
              </label>
            </div>
          </div>

          <!-- Format de sortie -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Format de sortie</label>
            <select
              v-model="form.format"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel (.xlsx)</option>
              <option value="word">Word (.docx)</option>
              <option value="html">HTML</option>
            </select>
          </div>

          <!-- Options avancées -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Options avancées</label>
            <div class="space-y-3">
              <label class="flex items-center">
                <input
                  v-model="form.include_charts"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
                <span class="ml-2 text-sm text-gray-700">Inclure les graphiques</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="form.include_attachments"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
                <span class="ml-2 text-sm text-gray-700">Inclure les pièces jointes</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="form.detailed_breakdown"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
                <span class="ml-2 text-sm text-gray-700">Analyse détaillée</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="form.send_email"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
                <span class="ml-2 text-sm text-gray-700">Envoyer par email</span>
              </label>
            </div>
          </div>

          <!-- Destinataires email (si option activée) -->
          <div v-if="form.send_email">
            <label class="block text-sm font-medium text-gray-700 mb-2">Destinataires</label>
            <div class="space-y-2">
              <div v-for="(email, index) in form.email_recipients" :key="index" class="flex items-center space-x-2">
                <input
                  v-model="form.email_recipients[index]"
                  type="email"
                  placeholder="email@exemple.com"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                <button
                  @click="removeEmailRecipient(index)"
                  type="button"
                  class="p-2 text-red-600 hover:text-red-800"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
              <button
                @click="addEmailRecipient"
                type="button"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Ajouter un destinataire
              </button>
            </div>
          </div>

          <!-- Message personnalisé -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Message personnalisé (optionnel)</label>
            <textarea
              v-model="form.custom_message"
              rows="3"
              placeholder="Ajoutez un message personnalisé qui sera inclus dans le rapport..."
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            ></textarea>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <button
            @click="closeModal"
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Génération...' : 'Générer le rapport' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { projectManagementService } from '@/services/projectManagementService'

export default {
  name: 'GenerateReportModal',
  props: {
    projectId: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['close', 'generated'],
  setup(props, { emit }) {
    const loading = ref(false)
    
    const form = reactive({
      type: 'overview',
      start_date: '',
      end_date: '',
      sections: ['overview', 'tasks', 'team'],
      format: 'pdf',
      include_charts: true,
      include_attachments: false,
      detailed_breakdown: false,
      send_email: false,
      email_recipients: [''],
      custom_message: ''
    })
    
    const reportTypes = [
      {
        value: 'overview',
        label: 'Vue d\'ensemble',
        description: 'Rapport général du projet',
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
      },
      {
        value: 'performance',
        label: 'Performance',
        description: 'Analyse des performances',
        icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
      },
      {
        value: 'financial',
        label: 'Financier',
        description: 'Rapport budgétaire',
        icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
      },
      {
        value: 'timeline',
        label: 'Chronologie',
        description: 'Suivi temporel',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
      },
      {
        value: 'team',
        label: 'Équipe',
        description: 'Performance de l\'équipe',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
      },
      {
        value: 'custom',
        label: 'Personnalisé',
        description: 'Rapport sur mesure',
        icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4'
      }
    ]
    
    const availableSections = [
      { value: 'overview', label: 'Vue d\'ensemble', description: 'Résumé du projet' },
      { value: 'tasks', label: 'Tâches', description: 'Détail des tâches' },
      { value: 'team', label: 'Équipe', description: 'Performance de l\'équipe' },
      { value: 'timeline', label: 'Chronologie', description: 'Planning et jalons' },
      { value: 'budget', label: 'Budget', description: 'Analyse financière' },
      { value: 'risks', label: 'Risques', description: 'Gestion des risques' },
      { value: 'quality', label: 'Qualité', description: 'Métriques de qualité' },
      { value: 'resources', label: 'Ressources', description: 'Utilisation des ressources' },
      { value: 'communications', label: 'Communications', description: 'Historique des communications' },
      { value: 'deliverables', label: 'Livrables', description: 'État des livrables' }
    ]
    
    // Initialiser les dates par défaut
    const today = new Date()
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
    form.start_date = lastMonth.toISOString().split('T')[0]
    form.end_date = today.toISOString().split('T')[0]

    const closeModal = () => {
      emit('close')
    }

    const addEmailRecipient = () => {
      form.email_recipients.push('')
    }

    const removeEmailRecipient = (index) => {
      if (form.email_recipients.length > 1) {
        form.email_recipients.splice(index, 1)
      }
    }

    const generateReport = async () => {
      try {
        loading.value = true
        
        // Nettoyer les emails vides
        const cleanedForm = {
          ...form,
          email_recipients: form.email_recipients.filter(email => email.trim() !== '')
        }
        
        const response = await projectManagementService.generateReport(props.projectId, cleanedForm)
        
        if (response.data.download_url) {
          // Télécharger le fichier
          const link = document.createElement('a')
          link.href = response.data.download_url
          link.download = response.data.filename || `rapport-${props.projectId}-${Date.now()}.${form.format}`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
        
        emit('generated', response.data)
        closeModal()
      } catch (error) {
        console.error('Erreur lors de la génération du rapport:', error)
        // Ici vous pourriez ajouter une notification d'erreur
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      form,
      reportTypes,
      availableSections,
      closeModal,
      addEmailRecipient,
      removeEmailRecipient,
      generateReport
    }
  }
}
</script>

<style scoped>
/* Styles pour les options de type de rapport */
.report-type-option {
  transition: all 0.2s ease;
}

.report-type-option:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Animation pour le modal */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

/* Styles pour les checkboxes */
input[type="checkbox"]:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* Styles pour les boutons radio */
input[type="radio"]:checked + div {
  border-color: #3b82f6;
  background-color: #eff6ff;
}
</style>