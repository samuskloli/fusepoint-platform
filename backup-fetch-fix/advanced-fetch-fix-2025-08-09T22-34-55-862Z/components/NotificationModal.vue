<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ getModalTitle }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="submitNotification">
          <div class="space-y-4">
            <!-- Destinataires -->
            <div v-if="!recipient">
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ messages.recipients }}</label>
              <p class="text-sm text-gray-600">{{ recipientCount }} {{ messages.clientsSelected }}</p>
            </div>
            <div v-else>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ messages.recipient }}</label>
              <p class="text-sm text-gray-600">{{ recipient.first_name }} {{ recipient.last_name }}</p>
            </div>
            
            <!-- Type de notification -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ messages.type }}</label>
              <select
                v-model="notificationForm.type"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="info">{{ messages.types.info }}</option>
                <option value="success">{{ messages.types.success }}</option>
                <option value="warning">{{ messages.types.warning }}</option>
                <option value="error">{{ messages.types.error }}</option>
                <option value="update">{{ messages.types.update }}</option>
                <option value="message">{{ messages.types.message }}</option>
              </select>
            </div>
            
            <!-- Priorité -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ messages.priority }}</label>
              <select
                v-model="notificationForm.priority"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">{{ messages.priorities.low }}</option>
                <option value="normal">{{ messages.priorities.normal }}</option>
                <option value="high">{{ messages.priorities.high }}</option>
                <option value="urgent">{{ messages.priorities.urgent }}</option>
              </select>
            </div>
            
            <!-- Titre -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ messages.title }}</label>
              <input
                v-model="notificationForm.title"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :placeholder="messages.titlePlaceholder"
              />
            </div>
            
            <!-- Message -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ messages.message }}</label>
              <textarea
                v-model="notificationForm.message"
                rows="6"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :placeholder="messages.messagePlaceholder"
              ></textarea>
            </div>
            
            <!-- Options avancées -->
            <div class="border-t pt-4">
              <h4 class="text-sm font-medium text-gray-700 mb-3">{{ messages.advancedOptions }}</h4>
              
              <div class="space-y-3">
                <!-- Envoyer par email -->
                <label class="flex items-center">
                  <input
                    v-model="notificationForm.sendEmail"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                  <span class="ml-2 text-sm text-gray-700">{{ messages.sendByEmail }}</span>
                </label>
                
                <!-- Programmer l'envoi -->
                <label class="flex items-center">
                  <input
                    v-model="notificationForm.scheduled"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                  <span class="ml-2 text-sm text-gray-700">{{ messages.scheduleDelivery }}</span>
                </label>
                
                <!-- Date de programmation -->
                <div v-if="notificationForm.scheduled" class="ml-6">
                  <input
                    v-model="notificationForm.scheduledDate"
                    type="datetime-local"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :min="minDateTime"
                  >
                </div>
                
                <!-- URL d'action -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ messages.actionUrl }}</label>
                  <input
                    v-model="notificationForm.actionUrl"
                    type="url"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :placeholder="messages.actionUrlPlaceholder"
                  >
                </div>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {{ messages.cancel }}
              </button>
              <button
                type="submit"
                :disabled="sending"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <span v-if="sending">{{ messages.sending }}</span>
                <span v-else>{{ messages.send }}</span>
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
import { NOTIFICATION_MESSAGES } from '@/constants/notificationMessages'

export default {
  name: 'NotificationModal',
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
    },
    messages: {
      type: Object,
      default: () => NOTIFICATION_MESSAGES.fr
    }
  },
  emits: ['close', 'sent'],
  setup(props, { emit }) {
    const { success, error } = useNotifications()
    
    const sending = ref(false)
    const notificationForm = ref({
      type: 'info',
      priority: 'normal',
      title: '',
      message: '',
      sendEmail: false,
      scheduled: false,
      scheduledDate: '',
      actionUrl: ''
    })
    
    const isGroupNotification = computed(() => {
      return props.selectedClientIds && props.selectedClientIds.length > 1
    })
    
    const getModalTitle = computed(() => {
      if (props.recipient) {
        return `Envoyer une notification à ${props.recipient.first_name} ${props.recipient.last_name}`
      }
      return isGroupNotification.value ? props.messages.groupTitle : props.messages.singleTitle
    })
    
    const minDateTime = computed(() => {
      const now = new Date()
      now.setMinutes(now.getMinutes() + 5) // Minimum 5 minutes dans le futur
      return now.toISOString().slice(0, 16)
    })
    
    const closeModal = () => {
      notificationForm.value = {
        type: 'info',
        priority: 'normal',
        title: '',
        message: '',
        sendEmail: false,
        scheduled: false,
        scheduledDate: '',
        actionUrl: ''
      }
      emit('close')
    }
    
    const submitNotification = async () => {
      try {
        sending.value = true
        
        const notificationData = {
          type: notificationForm.value.type,
          priority: notificationForm.value.priority,
          title: notificationForm.value.title,
          message: notificationForm.value.message,
          sendEmail: notificationForm.value.sendEmail,
          actionUrl: notificationForm.value.actionUrl || null
        }
        
        if (notificationForm.value.scheduled && notificationForm.value.scheduledDate) {
          notificationData.scheduledDate = notificationForm.value.scheduledDate
        }
        
        if (props.recipient) {
          // Notification individuelle
          const response = await api.post(`/api/agent/clients/${props.recipient.id}/notification`, notificationData)
          
          if (response.data.success) {
            success(props.messages.notificationSent)
            emit('sent', { type: 'single', recipient: props.recipient })
            closeModal()
          } else {
            error(response.data.message || props.messages.sendError)
          }
        } else {
          // Notifications groupées
          const promises = props.selectedClientIds.map(clientId => 
            api.post(`/api/agent/clients/${clientId}/notification`, notificationData)
          )
          
          const results = await Promise.allSettled(promises)
          const successCount = results.filter(result => result.status === 'fulfilled').length
          const failureCount = results.length - successCount
          
          if (successCount > 0) {
            success(`${successCount} ${props.messages.notificationsSent}`)
            if (failureCount > 0) {
              error(`${failureCount} ${props.messages.notificationsFailed}`)
            }
            emit('sent', { type: 'group', successCount, failureCount })
            closeModal()
          } else {
            error(props.messages.allNotificationsFailed)
          }
        }
      } catch (err) {
        console.error('Erreur lors de l\'envoi de la notification:', err)
        error(props.messages.sendError)
      } finally {
        sending.value = false
      }
    }
    
    // Réinitialiser le formulaire quand la modale se ferme
    watch(() => props.show, (newValue) => {
      if (!newValue) {
        notificationForm.value = {
          type: 'info',
          priority: 'normal',
          title: '',
          message: '',
          sendEmail: false,
          scheduled: false,
          scheduledDate: '',
          actionUrl: ''
        }
      }
    })
    
    return {
      sending,
      notificationForm,
      isGroupNotification,
      getModalTitle,
      minDateTime,
      closeModal,
      submitNotification
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques à la modale de notification */
.notification-modal {
  /* Styles personnalisés si nécessaire */
}
</style>