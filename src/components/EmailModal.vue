<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ recipient ? 'Envoyer Email' : 'Email Groupé' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="submitEmail">
          <div class="space-y-4">
            <div v-if="!recipient">
              <label class="block text-sm font-medium text-gray-700 mb-2">Destinataires</label>
              <p class="text-sm text-gray-600">{{ recipientCount }} client(s) sélectionné(s)</p>
            </div>
            <div v-else>
              <label class="block text-sm font-medium text-gray-700 mb-2">Destinataire</label>
              <p class="text-sm text-gray-600">{{ recipient.first_name }} {{ recipient.last_name }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
              <input
                v-model="emailForm.subject"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Sujet de l'email"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                v-model="emailForm.content"
                rows="6"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contenu de l'email"
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="sending"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <span v-if="sending">Envoi...</span>
                <span v-else>Envoyer</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import api from '@/services/api'
import { useNotifications } from '@/composables/useNotifications'

export default {
  name: 'EmailModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    recipient: {
      type: Object,
      default: null
    },
    recipientCount: {
      type: Number,
      default: 0
    },
    selectedClientIds: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const { success, error } = useNotifications()
    
    const sending = ref(false)
    const emailForm = ref({
      subject: '',
      content: ''
    })
    
    const isGroupEmail = computed(() => {
      return props.selectedClientIds && props.selectedClientIds.length > 1
    })
    
    const recipientText = computed(() => {
      if (isGroupEmail.value) {
        return `${props.recipientCount} clients sélectionnés`
      }
      return props.recipient ? props.recipient.email : ''
    })
    
    const closeModal = () => {
      emailForm.value = {
        subject: '',
        content: ''
      }
      emit('close')
    }
    
    const submitEmail = async () => {
      try {
        sending.value = true
        
        if (props.recipient) {
          // Email individuel
          const response = await api.post(`/api/agent/clients/${props.recipient.id}/email`, {
            subject: emailForm.value.subject,
            message: emailForm.value.content
          })
          
          if (response.data.success) {
            success('Email envoyé avec succès!')
            closeModal()
          } else {
            error(response.data.message || 'Erreur lors de l\'envoi de l\'email')
          }
        } else {
          // Email groupé
          const promises = props.selectedClientIds.map(clientId => 
            api.post(`/api/agent/clients/${clientId}/email`, {
              subject: emailForm.value.subject,
              message: emailForm.value.content
            })
          )
          
          await Promise.all(promises)
          success(`Emails envoyés avec succès à ${props.selectedClientIds.length} clients!`)
          closeModal()
        }
      } catch (err) {
        console.error('Erreur lors de l\'envoi de l\'email:', err)
        error('Erreur lors de l\'envoi de l\'email')
      } finally {
        sending.value = false
      }
    }
    
    return {
      sending,
      emailForm,
      isGroupEmail,
      recipientText,
      closeModal,
      submitEmail
    }
  }
}
</script>