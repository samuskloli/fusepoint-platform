<template>
  <div v-if="isOpen && member" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay -->
      <div 
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="closeModal"
      ></div>

      <!-- Modal -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        <!-- En-tête -->
        <div class="bg-white px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <!-- Avatar -->
              <div class="relative">
                <img
                  :src="member.avatar || '/api/placeholder/80/80'"
                  :alt="member.name"
                  class="w-16 h-16 rounded-full object-cover"
                />
                <div 
                  class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white"
                  :class="getStatusColor(member.status)"
                ></div>
              </div>
              
              <!-- Informations de base -->
              <div>
                <h3 class="text-xl font-semibold text-gray-900">{{ member.name }}</h3>
                <p class="text-sm text-gray-600">{{ getRoleLabel(member.role) }}</p>
                <p class="text-sm text-gray-500">{{ getDepartmentLabel(member.department) }}</p>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex items-center space-x-2">
              <button
                @click="$emit('edit', member)"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier
              </button>
              
              <button
                @click="$emit('message', member)"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a9.863 9.863 0 01-4.906-1.289l-3.087.924.924-3.087A9.863 9.863 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
                Message
              </button>
              
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
        </div>

        <!-- Contenu -->
        <div class="bg-white max-h-96 overflow-y-auto">
          <div class="px-6 py-4">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Colonne principale -->
              <div class="lg:col-span-2 space-y-6">
                <!-- Informations de contact -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-lg font-medium text-gray-900 mb-3">Informations de contact</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex items-center space-x-3">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p class="text-sm font-medium text-gray-900">Email</p>
                        <a :href="`mailto:${member.email}`" class="text-sm text-blue-600 hover:text-blue-800">{{ member.email }}</a>
                      </div>
                    </div>
                    
                    <div v-if="member.phone" class="flex items-center space-x-3">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <p class="text-sm font-medium text-gray-900">Téléphone</p>
                        <a :href="`tel:${member.phone}`" class="text-sm text-blue-600 hover:text-blue-800">{{ member.phone }}</a>
                      </div>
                    </div>
                    
                    <div v-if="member.location" class="flex items-center space-x-3">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p class="text-sm font-medium text-gray-900">Localisation</p>
                        <p class="text-sm text-gray-600">{{ member.location }}</p>
                      </div>
                    </div>
                    
                    <div class="flex items-center space-x-3">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 13a2 2 0 002 2h6a2 2 0 002-2L16 7" />
                      </svg>
                      <div>
                        <p class="text-sm font-medium text-gray-900">Date d'embauche</p>
                        <p class="text-sm text-gray-600">{{ formatDate(member.joinDate) }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Biographie -->
                <div v-if="member.bio" class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-lg font-medium text-gray-900 mb-3">À propos</h4>
                  <p class="text-sm text-gray-700 leading-relaxed">{{ member.bio }}</p>
                </div>

                <!-- Compétences -->
                <div v-if="member.skills && member.skills.length > 0" class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-lg font-medium text-gray-900 mb-3">Compétences</h4>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="skill in member.skills"
                      :key="skill"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {{ skill }}
                    </span>
                  </div>
                </div>

                <!-- Objectifs -->
                <div v-if="member.goals && member.goals.length > 0" class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-lg font-medium text-gray-900 mb-3">Objectifs</h4>
                  <ul class="space-y-2">
                    <li
                      v-for="goal in member.goals"
                      :key="goal"
                      class="flex items-start space-x-2"
                    >
                      <svg class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      <span class="text-sm text-gray-700">{{ goal }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Projets -->
                <div v-if="member.projects && member.projects.length > 0" class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-lg font-medium text-gray-900 mb-3">Projets</h4>
                  <div class="space-y-3">
                    <div
                      v-for="project in member.projects"
                      :key="project"
                      class="flex items-center justify-between p-3 bg-white rounded-md border"
                    >
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ project }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Horaires de travail -->
                <div v-if="member.workingHours" class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-lg font-medium text-gray-900 mb-3">Horaires de travail</h4>
                  <div class="flex items-center space-x-4">
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="text-sm text-gray-700">
                        {{ member.workingHours.start }} - {{ member.workingHours.end }}
                      </span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="text-sm text-gray-700">{{ member.workingHours.timezone }}</span>
                    </div>
                  </div>
                </div>

                <!-- Liens sociaux -->
                <div v-if="hasSocialLinks" class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-lg font-medium text-gray-900 mb-3">Liens sociaux</h4>
                  <div class="flex space-x-4">
                    <a
                      v-if="member.socialLinks?.linkedin"
                      :href="member.socialLinks.linkedin"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd" />
                      </svg>
                      <span class="text-sm">LinkedIn</span>
                    </a>
                    
                    <a
                      v-if="member.socialLinks?.github"
                      :href="member.socialLinks.github"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd" />
                      </svg>
                      <span class="text-sm">GitHub</span>
                    </a>
                    
                    <a
                      v-if="member.socialLinks?.twitter"
                      :href="member.socialLinks.twitter"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center space-x-2 text-blue-400 hover:text-blue-600"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                      <span class="text-sm">Twitter</span>
                    </a>
                  </div>
                </div>
              </div>

              <!-- Colonne latérale -->
              <div class="space-y-6">
                <!-- Statistiques -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-lg font-medium text-gray-900 mb-3">Statistiques</h4>
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">Statut</span>
                      <span 
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        :class="getStatusClass(member.status)"
                      >
                        {{ getStatusLabel(member.status) }}
                      </span>
                    </div>
                    
                    <div v-if="member.performanceRating" class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">Performance</span>
                      <div class="flex items-center space-x-2">
                        <div class="flex space-x-1">
                          <svg
                            v-for="i in 5"
                            :key="i"
                            class="w-4 h-4"
                            :class="i <= Math.round(member.performanceRating) ? 'text-yellow-400' : 'text-gray-300'"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <span class="text-sm font-medium text-gray-900">{{ member.performanceRating.toFixed(1) }}</span>
                      </div>
                    </div>
                    
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">Ancienneté</span>
                      <span class="text-sm font-medium text-gray-900">{{ getWorkDuration(member.joinDate) }}</span>
                    </div>
                    
                    <div v-if="member.lastActive" class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">Dernière activité</span>
                      <span class="text-sm font-medium text-gray-900">{{ formatRelativeTime(member.lastActive) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Manager -->
                <div v-if="manager" class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-lg font-medium text-gray-900 mb-3">Manager</h4>
                  <div class="flex items-center space-x-3">
                    <img
                      :src="manager.avatar || '/api/placeholder/40/40'"
                      :alt="manager.name"
                      class="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ manager.name }}</p>
                      <p class="text-xs text-gray-500">{{ getRoleLabel(manager.role) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Équipe -->
                <div v-if="teamMembers.length > 0" class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-lg font-medium text-gray-900 mb-3">Équipe ({{ teamMembers.length }})</h4>
                  <div class="space-y-2">
                    <div
                      v-for="teamMember in teamMembers.slice(0, 3)"
                      :key="teamMember.id"
                      class="flex items-center space-x-2"
                    >
                      <img
                        :src="teamMember.avatar || '/api/placeholder/24/24'"
                        :alt="teamMember.name"
                        class="w-6 h-6 rounded-full object-cover"
                      />
                      <span class="text-xs text-gray-700">{{ teamMember.name }}</span>
                    </div>
                    <div v-if="teamMembers.length > 3" class="text-xs text-gray-500">
                      +{{ teamMembers.length - 3 }} autres
                    </div>
                  </div>
                </div>

                <!-- Notes -->
                <div v-if="member.notes" class="bg-yellow-50 rounded-lg p-4">
                  <h4 class="text-lg font-medium text-gray-900 mb-3">Notes</h4>
                  <p class="text-sm text-gray-700">{{ member.notes }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TeamMember } from '../types'

// Props
interface Props {
  isOpen: boolean
  member?: TeamMember | null
  allMembers?: TeamMember[]
}

const props = withDefaults(defineProps<Props>(), {
  member: null,
  allMembers: () => []
})

// Émissions
const emit = defineEmits<{
  close: []
  edit: [member: TeamMember]
  message: [member: TeamMember]
}>()

// Computed
const manager = computed(() => {
  if (!props.member?.managerId) return null
  return props.allMembers.find(m => m.id === props.member?.managerId)
})

const teamMembers = computed(() => {
  if (!props.member) return []
  return props.allMembers.filter(m => m.managerId === props.member?.id)
})

const hasSocialLinks = computed(() => {
  if (!props.member?.socialLinks) return false
  return props.member.socialLinks.linkedin || props.member.socialLinks.github || props.member.socialLinks.twitter
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

const getDepartmentLabel = (department: string): string => {
  const labels = {
    engineering: 'Ingénierie',
    design: 'Design',
    marketing: 'Marketing',
    sales: 'Ventes',
    hr: 'Ressources Humaines',
    finance: 'Finance',
    operations: 'Opérations'
  }
  return labels[department as keyof typeof labels] || department
}

const getStatusLabel = (status: string): string => {
  const labels = {
    active: 'Actif',
    pending: 'En attente',
    inactive: 'Inactif'
  }
  return labels[status as keyof typeof labels] || status
}

const getStatusColor = (status: string): string => {
  const colors = {
    active: 'bg-green-400',
    pending: 'bg-yellow-400',
    inactive: 'bg-red-400'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-400'
}

const getStatusClass = (status: string): string => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-red-100 text-red-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getProjectStatusLabel = (status: string): string => {
  const labels = {
    active: 'En cours',
    completed: 'Terminé',
    paused: 'En pause',
    cancelled: 'Annulé'
  }
  return labels[status as keyof typeof labels] || status
}

const getProjectStatusClass = (status: string): string => {
  const classes = {
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Aujourd\'hui'
  if (diffInDays === 1) return 'Hier'
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`
  if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`
  if (diffInDays < 365) return `Il y a ${Math.floor(diffInDays / 30)} mois`
  return `Il y a ${Math.floor(diffInDays / 365)} ans`
}

const getWorkDuration = (joinDate: string): string => {
  const start = new Date(joinDate)
  const now = new Date()
  const diffInMs = now.getTime() - start.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays < 30) return `${diffInDays} jours`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} mois`
  
  const years = Math.floor(diffInDays / 365)
  const months = Math.floor((diffInDays % 365) / 30)
  
  if (months === 0) return `${years} an${years > 1 ? 's' : ''}`
  return `${years} an${years > 1 ? 's' : ''} ${months} mois`
}

// Gestionnaires d'événements
const closeModal = () => {
  emit('close')
}
</script>