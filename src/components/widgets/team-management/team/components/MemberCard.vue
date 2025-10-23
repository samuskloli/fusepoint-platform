<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-6">
    <!-- En-tête avec avatar et statut -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center space-x-3">
        <div class="relative">
          <img
            v-if="showAvatar && member.avatar"
            :src="member.avatar"
            :alt="member.name"
            class="w-12 h-12 rounded-full object-cover"
          />
          <div
            v-else-if="showAvatar"
            class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg"
          >
            {{ getInitials(member.name) }}
          </div>
          <!-- Indicateur de statut -->
          <div
            v-if="showStatus"
            :class="[
              'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white',
              getStatusColor(member.status)
            ]"
          ></div>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-gray-900 truncate">{{ member.name }}</h3>
          <p class="text-sm text-gray-600">{{ getRoleLabel(member.role) }}</p>
          <p class="text-xs text-gray-500">{{ getDepartmentLabel(member.department) }}</p>
        </div>
      </div>
      
      <!-- Menu d'actions -->
      <div v-if="showActions" class="relative">
        <button
          @click="toggleActionsMenu"
          class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
        
        <!-- Menu déroulant -->
        <div
          v-if="showActionsDropdown"
          class="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
        >
          <button
            @click="viewDetails"
            class="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{{ t('widgets.team.viewDetails') }}</span>
          </button>
          <button
            @click="editMember"
            class="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>{{ t('widgets.team.edit') }}</span>
          </button>
          <button
            @click="sendMessage"
            class="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{{ t('widgets.team.sendMessage') }}</span>
          </button>
          <hr class="my-1">
          <button
            @click="deleteMember"
            class="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>{{ t('widgets.team.deleteMember') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Informations de contact -->
    <div v-if="showContactInfo" class="mb-4 space-y-2">
      <div class="flex items-center space-x-2 text-sm text-gray-600">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span class="truncate">{{ member.email }}</span>
      </div>
      <div v-if="member.phone" class="flex items-center space-x-2 text-sm text-gray-600">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <span>{{ member.phone }}</span>
      </div>
      <div v-if="member.location" class="flex items-center space-x-2 text-sm text-gray-600">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>{{ member.location }}</span>
      </div>
    </div>

    <!-- Compétences -->
    <div v-if="showSkills && member.skills.length > 0" class="mb-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">{{ t('widgets.team.skills') }}</h4>
      <div class="flex flex-wrap gap-1">
        <span
          v-for="skill in member.skills.slice(0, 3)"
          :key="skill"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          {{ skill }}
        </span>
        <span
          v-if="member.skills.length > 3"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
        >
          {{ t('widgets.team.moreSkills', { count: member.skills.length - 3 }) }}
        </span>
      </div>
    </div>

    <!-- Projets -->
    <div v-if="member.projects.length > 0" class="mb-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">{{ t('widgets.team.projects') }} ({{ member.projects.length }})</h4>
      <div class="space-y-1">
        <div
          v-for="project in member.projects.slice(0, 2)"
          :key="project"
          class="text-sm text-gray-600 truncate"
        >
          • {{ project }}
        </div>
        <div v-if="member.projects.length > 2" class="text-xs text-gray-500">
          {{ t('widgets.team.moreProjects', { count: member.projects.length - 2 }) }}
        </div>
      </div>
    </div>

    <!-- Dernière activité -->
    <div v-if="showLastActive && member.lastActive" class="mb-4">
      <div class="flex items-center space-x-2 text-sm text-gray-600">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ t('widgets.team.lastActive') }}: {{ formatLastActive(member.lastActive) }}</span>
      </div>
    </div>

    <!-- Liens sociaux -->
    <div v-if="member.socialLinks && Object.keys(member.socialLinks).length > 0" class="mb-4">
      <div class="flex space-x-2">
        <a
          v-if="member.socialLinks.linkedin"
          :href="member.socialLinks.linkedin"
          target="_blank"
          class="text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd" />
          </svg>
        </a>
        <a
          v-if="member.socialLinks.github"
          :href="member.socialLinks.github"
          target="_blank"
          class="text-gray-700 hover:text-gray-900 transition-colors"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd" />
          </svg>
        </a>
        <a
          v-if="member.socialLinks.twitter"
          :href="member.socialLinks.twitter"
          target="_blank"
          class="text-blue-400 hover:text-blue-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
          </svg>
        </a>
      </div>
    </div>

    <!-- Pied de carte -->
    <div class="flex items-center justify-between pt-4 border-t border-gray-100">
      <div class="text-xs text-gray-500">
        Rejoint le {{ formatDate(member.joinDate) }}
      </div>
      <div class="flex items-center space-x-2">
        <span :class="[
          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
          getStatusBadgeColor(member.status)
        ]">
          {{ getStatusLabel(member.status) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTranslation } from '@/composables'
import type { TeamMember } from '../types'

// Composables
const { t } = useTranslation()

// Props
const props = withDefaults(defineProps<MemberCardProps>(), {
  showAvatar: true,
  showContactInfo: true,
  showSkills: true,
  showStatus: true,
  showLastActive: true,
  showActions: true
})

// Émissions
const emit = defineEmits<{
  viewDetails: [member: TeamMember]
  editMember: [member: TeamMember]
  deleteMember: [member: TeamMember]
  sendMessage: [member: TeamMember]
}>()

// État local
const showActionsDropdown = ref(false)

// Méthodes utilitaires
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

const getStatusColor = (status: string): string => {
  const colors = {
    active: 'bg-green-500',
    inactive: 'bg-gray-400',
    pending: 'bg-yellow-500'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-400'
}

const getStatusBadgeColor = (status: string): string => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string): string => {
  const labels = {
    active: 'Actif',
    inactive: 'Inactif',
    pending: 'En attente'
  }
  return labels[status as keyof typeof labels] || status
}

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

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatLastActive = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) {
    return "Aujourd'hui"
  } else if (diffInDays === 1) {
    return 'Hier'
  } else if (diffInDays < 7) {
    return `Il y a ${diffInDays} jours`
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`
  } else {
    const months = Math.floor(diffInDays / 30)
    return `Il y a ${months} mois`
  }
}

// Gestionnaires d'événements
const toggleActionsMenu = () => {
  showActionsDropdown.value = !showActionsDropdown.value
}

const viewDetails = () => {
  emit('viewDetails', props.member)
  showActionsDropdown.value = false
}

const editMember = () => {
  emit('editMember', props.member)
  showActionsDropdown.value = false
}

const deleteMember = () => {
  emit('deleteMember', props.member)
  showActionsDropdown.value = false
}

const sendMessage = () => {
  emit('sendMessage', props.member)
  showActionsDropdown.value = false
}

// Fermer le menu quand on clique ailleurs
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showActionsDropdown.value = false
  }
}

// Ajouter l'écouteur d'événement
if (typeof window !== 'undefined') {
  document.addEventListener('click', handleClickOutside)
}
</script>