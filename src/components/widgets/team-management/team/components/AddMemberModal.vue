<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay -->
      <div 
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="closeModal"
      ></div>

      <!-- Modal -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <!-- En-tête -->
        <div class="bg-white px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Ajouter un membre</h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Formulaire -->
        <form @submit.prevent="submitForm" class="bg-white">
          <div class="px-6 py-4 max-h-96 overflow-y-auto">
            <div class="space-y-6">
              <!-- Informations de base -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet *
                  </label>
                  <input
                    id="name"
                    v-model="formData.name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    id="email"
                    v-model="formData.email"
                    type="email"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="john.doe@example.com"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    id="phone"
                    v-model="formData.phone"
                    type="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                
                <div>
                  <label for="location" class="block text-sm font-medium text-gray-700 mb-1">
                    Localisation
                  </label>
                  <input
                    id="location"
                    v-model="formData.location"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Paris, France"
                  />
                </div>
              </div>

              <!-- Rôle et département -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label for="role" class="block text-sm font-medium text-gray-700 mb-1">
                    Rôle *
                  </label>
                  <select
                    id="role"
                    v-model="formData.role"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sélectionner un rôle</option>
                    <option value="admin">Administrateur</option>
                    <option value="manager">Manager</option>
                    <option value="developer">Développeur</option>
                    <option value="designer">Designer</option>
                    <option value="analyst">Analyste</option>
                    <option value="intern">Stagiaire</option>
                  </select>
                </div>
                
                <div>
                  <label for="department" class="block text-sm font-medium text-gray-700 mb-1">
                    Département *
                  </label>
                  <select
                    id="department"
                    v-model="formData.department"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sélectionner un département</option>
                    <option value="engineering">Ingénierie</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="sales">Ventes</option>
                    <option value="hr">Ressources Humaines</option>
                    <option value="finance">Finance</option>
                    <option value="operations">Opérations</option>
                  </select>
                </div>
                
                <div>
                  <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
                    Statut *
                  </label>
                  <select
                    id="status"
                    v-model="formData.status"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Actif</option>
                    <option value="pending">En attente</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>

              <!-- Manager -->
              <div>
                <label for="manager" class="block text-sm font-medium text-gray-700 mb-1">
                  Manager
                </label>
                <select
                  id="manager"
                  v-model="formData.managerId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Aucun manager</option>
                  <option 
                    v-for="manager in availableManagers" 
                    :key="manager.id" 
                    :value="manager.id"
                  >
                    {{ manager.name }} - {{ getRoleLabel(manager.role) }}
                  </option>
                </select>
              </div>

              <!-- Date d'embauche -->
              <div>
                <label for="joinDate" class="block text-sm font-medium text-gray-700 mb-1">
                  Date d'embauche *
                </label>
                <input
                  id="joinDate"
                  v-model="formData.joinDate"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <!-- Compétences -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Compétences
                </label>
                <div class="flex flex-wrap gap-2 mb-2">
                  <span
                    v-for="skill in formData.skills"
                    :key="skill"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {{ skill }}
                    <button
                      @click="removeSkill(skill)"
                      type="button"
                      class="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </span>
                </div>
                <div class="flex space-x-2">
                  <input
                    v-model="newSkill"
                    type="text"
                    placeholder="Ajouter une compétence"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    @keyup.enter="addSkill"
                  />
                  <button
                    @click="addSkill"
                    type="button"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              <!-- Horaires de travail -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  Horaires de travail
                </label>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label for="workStart" class="block text-xs text-gray-500 mb-1">
                      Heure de début
                    </label>
                    <input
                      id="workStart"
                      v-model="formData.workingHours!.start"
                      type="time"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label for="workEnd" class="block text-xs text-gray-500 mb-1">
                      Heure de fin
                    </label>
                    <input
                      id="workEnd"
                      v-model="formData.workingHours!.end"
                      type="time"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label for="timezone" class="block text-xs text-gray-500 mb-1">
                      Fuseau horaire
                    </label>
                    <select
                      id="timezone"
                      v-model="formData.workingHours!.timezone"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Europe/Paris">Europe/Paris</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="America/Los_Angeles">America/Los_Angeles</option>
                      <option value="Asia/Tokyo">Asia/Tokyo</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Liens sociaux -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  Liens sociaux
                </label>
                <div class="space-y-3">
                  <div>
                    <label for="linkedin" class="block text-xs text-gray-500 mb-1">
                      LinkedIn
                    </label>
                    <input
                      id="linkedin"
                      v-model="formData.socialLinks!.linkedin"
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label for="github" class="block text-xs text-gray-500 mb-1">
                      GitHub
                    </label>
                    <input
                      id="github"
                      v-model="formData.socialLinks!.github"
                      type="url"
                      placeholder="https://github.com/username"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label for="twitter" class="block text-xs text-gray-500 mb-1">
                      Twitter
                    </label>
                    <input
                      id="twitter"
                      v-model="formData.socialLinks!.twitter"
                      type="url"
                      placeholder="https://twitter.com/username"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <!-- Bio -->
              <div>
                <label for="bio" class="block text-sm font-medium text-gray-700 mb-1">
                  Biographie
                </label>
                <textarea
                  id="bio"
                  v-model="formData.bio"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Description du membre..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="isLoading"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Ajout en cours...
              </span>
              <span v-else>Ajouter le membre</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { CreateMemberData, TeamMember, MemberRole, Department, MemberStatus } from '../types'

// Props
interface Props {
  isOpen: boolean
  teamMembers?: TeamMember[]
}

const props = withDefaults(defineProps<Props>(), {
  teamMembers: () => []
})

// Émissions
const emit = defineEmits<{
  close: []
  submit: [data: CreateMemberData]
}>()

// État local
const isLoading = ref(false)
const newSkill = ref('')

// Données du formulaire
const formData = reactive<CreateMemberData>({
  name: '',
  email: '',
  phone: '',
  role: '' as MemberRole,
  department: '' as Department,
  status: 'active' as MemberStatus,
  joinDate: new Date().toISOString().split('T')[0],
  location: '',
  bio: '',
  skills: [],
  managerId: '',
  workingHours: {
    start: '09:00',
    end: '17:00',
    timezone: 'Europe/Paris'
  },
  socialLinks: {
    linkedin: '',
    github: '',
    twitter: ''
  }
})

// Computed
const availableManagers = computed(() => {
  return props.teamMembers.filter(member => 
    member.role === 'admin' || member.role === 'manager'
  )
})

// Méthodes utilitaires
const getRoleLabel = (role: string): string => {
  const labels = {
    admin: 'Administrateur',
    manager: 'Manager',
    developer: 'Développeur',
    designer: 'Designer',
    analyst: 'Analyste',
    intern: 'Stagiaire'
  }
  return labels[role as keyof typeof labels] || role
}

const addSkill = () => {
  if (newSkill.value.trim() && !formData.skills.includes(newSkill.value.trim())) {
    formData.skills.push(newSkill.value.trim())
    newSkill.value = ''
  }
}

const removeSkill = (skill: string) => {
  const index = formData.skills.indexOf(skill)
  if (index > -1) {
    formData.skills.splice(index, 1)
  }
}

const resetForm = () => {
  Object.assign(formData, {
    name: '',
    email: '',
    phone: '',
    role: '' as MemberRole,
    department: '' as Department,
    status: 'active' as MemberStatus,
    joinDate: new Date().toISOString().split('T')[0],
    location: '',
    bio: '',
    skills: [],
    managerId: '',
    workingHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'Europe/Paris'
    },
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: ''
    }
  })
  newSkill.value = ''
}

// Gestionnaires d'événements
const closeModal = () => {
  resetForm()
  emit('close')
}

const submitForm = async () => {
  isLoading.value = true
  
  try {
    // Nettoyer les données
    const cleanData = {
      ...formData,
      skills: formData.skills.filter(skill => skill.trim()),
      socialLinks: {
        linkedin: formData.socialLinks.linkedin || undefined,
        github: formData.socialLinks.github || undefined,
        twitter: formData.socialLinks.twitter || undefined
      },
      workingHours: formData.workingHours.start && formData.workingHours.end ? formData.workingHours : undefined,
      phone: formData.phone || undefined,
      location: formData.location || undefined,
      bio: formData.bio || undefined,
      managerId: formData.managerId || undefined
    }
    
    emit('submit', cleanData)
    closeModal()
  } catch (error) {
    console.error('Erreur lors de l\'ajout du membre:', error)
  } finally {
    isLoading.value = false
  }
}
</script>