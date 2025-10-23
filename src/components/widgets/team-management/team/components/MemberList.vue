<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <!-- En-tête du tableau -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900">Membres de l'équipe</h3>
        <div class="text-sm text-gray-500">
          {{ members.length }} membre{{ members.length > 1 ? 's' : '' }}
        </div>
      </div>
    </div>

    <!-- Tableau -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <!-- Sélection -->
            <th class="px-6 py-3 text-left">
              <input
                type="checkbox"
                :checked="allSelected"
                :indeterminate="someSelected"
                @change="toggleSelectAll"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </th>
            
            <!-- Avatar/Nom -->
            <th 
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              @click="handleSort('name')"
            >
              <div class="flex items-center space-x-1">
                <span>Membre</span>
                <svg 
                  :class="[
                    'w-4 h-4 transition-transform',
                    sortBy === 'name' && sortOrder === 'desc' ? 'rotate-180' : ''
                  ]"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </th>
            
            <!-- Rôle -->
            <th 
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              @click="handleSort('role')"
            >
              <div class="flex items-center space-x-1">
                <span>Rôle</span>
                <svg 
                  :class="[
                    'w-4 h-4 transition-transform',
                    sortBy === 'role' && sortOrder === 'desc' ? 'rotate-180' : ''
                  ]"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </th>
            
            <!-- Département -->
            <th 
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              @click="handleSort('department')"
            >
              <div class="flex items-center space-x-1">
                <span>Département</span>
                <svg 
                  :class="[
                    'w-4 h-4 transition-transform',
                    sortBy === 'department' && sortOrder === 'desc' ? 'rotate-180' : ''
                  ]"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </th>
            
            <!-- Contact -->
            <th v-if="showContactInfo" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            
            <!-- Compétences -->
            <th v-if="showSkills" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Compétences
            </th>
            
            <!-- Statut -->
            <th 
              v-if="showStatus"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              @click="handleSort('status')"
            >
              <div class="flex items-center space-x-1">
                <span>Statut</span>
                <svg 
                  :class="[
                    'w-4 h-4 transition-transform',
                    sortBy === 'status' && sortOrder === 'desc' ? 'rotate-180' : ''
                  ]"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </th>
            
            <!-- Dernière activité -->
            <th 
              v-if="showLastActive"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              @click="handleSort('lastActive')"
            >
              <div class="flex items-center space-x-1">
                <span>Dernière activité</span>
                <svg 
                  :class="[
                    'w-4 h-4 transition-transform',
                    sortBy === 'lastActive' && sortOrder === 'desc' ? 'rotate-180' : ''
                  ]"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </th>
            
            <!-- Actions -->
            <th v-if="showActions" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        
        <tbody class="bg-white divide-y divide-gray-200">
          <tr 
            v-for="member in sortedMembers" 
            :key="member.id"
            :class="[
              'hover:bg-gray-50 transition-colors',
              selectedMembers.includes(member.id) ? 'bg-blue-50' : ''
            ]"
          >
            <!-- Sélection -->
            <td class="px-6 py-4">
              <input
                type="checkbox"
                :checked="selectedMembers.includes(member.id)"
                @change="toggleSelectMember(member.id)"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </td>
            
            <!-- Avatar/Nom -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center space-x-3">
                <div class="relative">
                  <img
                    v-if="showAvatar && member.avatar"
                    :src="member.avatar"
                    :alt="member.name"
                    class="w-10 h-10 rounded-full object-cover"
                  />
                  <div
                    v-else-if="showAvatar"
                    class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm"
                  >
                    {{ getInitials(member.name) }}
                  </div>
                  <!-- Indicateur de statut -->
                  <div
                    v-if="showStatus"
                    :class="[
                      'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white',
                      getStatusColor(member.status)
                    ]"
                  ></div>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="text-sm font-medium text-gray-900 truncate">{{ member.name }}</div>
                  <div v-if="member.location" class="text-sm text-gray-500 truncate">{{ member.location }}</div>
                </div>
              </div>
            </td>
            
            <!-- Rôle -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ getRoleLabel(member.role) }}</div>
            </td>
            
            <!-- Département -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {{ getDepartmentLabel(member.department) }}
              </span>
            </td>
            
            <!-- Contact -->
            <td v-if="showContactInfo" class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ member.email }}</div>
              <div v-if="member.phone" class="text-sm text-gray-500">{{ member.phone }}</div>
            </td>
            
            <!-- Compétences -->
            <td v-if="showSkills" class="px-6 py-4">
              <div class="flex flex-wrap gap-1 max-w-xs">
                <span
                  v-for="skill in member.skills.slice(0, 2)"
                  :key="skill"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ skill }}
                </span>
                <span
                  v-if="member.skills.length > 2"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                >
                  +{{ member.skills.length - 2 }}
                </span>
              </div>
            </td>
            
            <!-- Statut -->
            <td v-if="showStatus" class="px-6 py-4 whitespace-nowrap">
              <span :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                getStatusBadgeColor(member.status)
              ]">
                {{ getStatusLabel(member.status) }}
              </span>
            </td>
            
            <!-- Dernière activité -->
            <td v-if="showLastActive" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ member.lastActive ? formatLastActive(member.lastActive) : 'Jamais' }}
            </td>
            
            <!-- Actions -->
            <td v-if="showActions" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center justify-end space-x-2">
                <button
                  @click="viewDetails(member)"
                  class="text-blue-600 hover:text-blue-900 transition-colors"
                  title="Voir les détails"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  @click="editMember(member)"
                  class="text-indigo-600 hover:text-indigo-900 transition-colors"
                  title="Modifier"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="sendMessage(member)"
                  class="text-green-600 hover:text-green-900 transition-colors"
                  title="Envoyer un message"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                <button
                  @click="deleteMember(member)"
                  class="text-red-600 hover:text-red-900 transition-colors"
                  title="Supprimer"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Actions en lot -->
    <div v-if="selectedMembers.length > 0" class="px-6 py-4 bg-gray-50 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-700">
          {{ selectedMembers.length }} membre{{ selectedMembers.length > 1 ? 's' : '' }} sélectionné{{ selectedMembers.length > 1 ? 's' : '' }}
        </div>
        <div class="flex space-x-2">
          <button
            @click="bulkEdit"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modifier
          </button>
          <button
            @click="bulkDelete"
            class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TeamMember, MemberListProps, SortOrder } from '../types'

// Props
const props = withDefaults(defineProps<MemberListProps>(), {
  showAvatar: true,
  showContactInfo: true,
  showSkills: true,
  showStatus: true,
  showLastActive: true,
  showActions: true
})

// Émissions
const emit = defineEmits<{
  sort: [field: keyof TeamMember, order: SortOrder]
  viewDetails: [member: TeamMember]
  editMember: [member: TeamMember]
  deleteMember: [member: TeamMember]
  sendMessage: [member: TeamMember]
  bulkEdit: [memberIds: string[]]
  bulkDelete: [memberIds: string[]]
}>()

// État local
const selectedMembers = ref<string[]>([])

// Computed
const sortedMembers = computed(() => {
  const sorted = [...props.members]
  
  sorted.sort((a, b) => {
    const aValue = a[props.sortBy] ?? ''
    const bValue = b[props.sortBy] ?? ''
    
    if (aValue === bValue) return 0
    
    let comparison = 0
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue)
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime()
    } else {
      comparison = aValue < bValue ? -1 : 1
    }
    
    return props.sortOrder === 'desc' ? -comparison : comparison
  })
  
  return sorted
})

const allSelected = computed(() => {
  return props.members.length > 0 && selectedMembers.value.length === props.members.length
})

const someSelected = computed(() => {
  return selectedMembers.value.length > 0 && selectedMembers.value.length < props.members.length
})

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
const handleSort = (field: keyof TeamMember) => {
  const newOrder: SortOrder = props.sortBy === field && props.sortOrder === 'asc' ? 'desc' : 'asc'
  emit('sort', field, newOrder)
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedMembers.value = []
  } else {
    selectedMembers.value = props.members.map(member => member.id)
  }
}

const toggleSelectMember = (memberId: string) => {
  const index = selectedMembers.value.indexOf(memberId)
  if (index > -1) {
    selectedMembers.value.splice(index, 1)
  } else {
    selectedMembers.value.push(memberId)
  }
}

const viewDetails = (member: TeamMember) => {
  emit('viewDetails', member)
}

const editMember = (member: TeamMember) => {
  emit('editMember', member)
}

const deleteMember = (member: TeamMember) => {
  emit('deleteMember', member)
}

const sendMessage = (member: TeamMember) => {
  emit('sendMessage', member)
}

const bulkEdit = () => {
  emit('bulkEdit', selectedMembers.value)
}

const bulkDelete = () => {
  emit('bulkDelete', selectedMembers.value)
}
</script>