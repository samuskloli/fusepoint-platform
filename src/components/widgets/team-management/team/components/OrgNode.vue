<template>
  <div class="org-node">
    <!-- Carte du membre -->
    <div class="flex flex-col items-center">
      <!-- Nœud principal -->
      <div 
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
        :class="{
          'border-blue-300 bg-blue-50': node.member.role === 'admin',
          'border-purple-300 bg-purple-50': node.member.role === 'manager'
        }"
        @click="viewDetails"
      >
        <div class="flex items-center space-x-3">
          <!-- Avatar -->
          <div class="relative">
            <img
              v-if="showAvatar && node.member.avatar"
              :src="node.member.avatar"
              :alt="node.member.name"
              class="w-12 h-12 rounded-full object-cover"
            />
            <div
              v-else-if="showAvatar"
              class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg"
            >
              {{ getInitials(node.member.name) }}
            </div>
            
            <!-- Indicateur de statut -->
            <div
              :class="[
                'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white',
                getStatusColor(node.member.status)
              ]"
            ></div>
          </div>
          
          <!-- Informations -->
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold text-gray-900 truncate">{{ node.member.name }}</h4>
            <p class="text-xs text-gray-600">{{ getRoleLabel(node.member.role) }}</p>
            <p class="text-xs text-gray-500">{{ getDepartmentLabel(node.member.department) }}</p>
            
            <!-- Informations de contact -->
            <div v-if="showContactInfo" class="mt-1">
              <p class="text-xs text-gray-500 truncate">{{ node.member.email }}</p>
              <p v-if="node.member.phone" class="text-xs text-gray-500">{{ node.member.phone }}</p>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex flex-col space-y-1">
            <button
              @click.stop="editMember"
              class="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              :title="t('widgets.team.edit')"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click.stop="sendMessage"
              class="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              :title="t('widgets.team.sendMessage')"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Indicateur d'équipe -->
        <div v-if="node.children.length > 0" class="mt-2 flex items-center justify-between">
          <div class="text-xs text-gray-500">
            {{ node.children.length }} {{ t('widgets.team.directReports') }}
          </div>
          <button
            @click.stop="toggleExpand"
            class="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            :title="node.isExpanded ? t('widgets.team.collapse') : t('widgets.team.expand')"
          >
            <svg 
              :class="[
                'w-4 h-4 transition-transform',
                node.isExpanded ? 'rotate-180' : ''
              ]"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Ligne de connexion vers les enfants -->
      <div 
        v-if="node.children.length > 0 && node.isExpanded" 
        class="w-px h-6 bg-gray-300"
      ></div>
    </div>
    
    <!-- Enfants -->
    <div v-if="node.children.length > 0 && node.isExpanded" class="org-children mt-6">
      <!-- Ligne horizontale -->
      <div 
        v-if="node.children.length > 1"
        class="relative h-px bg-gray-300 mb-6"
        :style="{ width: `${(node.children.length - 1) * 200 + 160}px`, marginLeft: `${-((node.children.length - 1) * 100 + 80)}px` }"
      >
        <!-- Points de connexion -->
        <div 
          v-for="(child, index) in node.children"
          :key="child.id"
          class="absolute w-px h-6 bg-gray-300"
          :style="{ left: `${index * 200 + 80}px`, top: '0px' }"
        ></div>
      </div>
      
      <!-- Nœuds enfants -->
      <div class="flex justify-center space-x-8">
        <div 
          v-for="child in node.children"
          :key="child.id"
          class="flex-shrink-0"
        >
          <OrgNode
            :node="child"
            :show-avatar="showAvatar"
            :show-contact-info="showContactInfo"
            @toggle-expand="$emit('toggleExpand', child.id)"
            @view-details="$emit('viewDetails', child.member)"
            @edit-member="$emit('editMember', child.member)"
            @send-message="$emit('sendMessage', child.member)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '@/composables'
import type { TeamMember, OrgNode } from '../types'

// Composables
const { t } = useTranslation()

// Props
interface Props {
  node: OrgNode
  showAvatar?: boolean
  showContactInfo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showAvatar: true,
  showContactInfo: false
})

// Émissions
const emit = defineEmits<{
  toggleExpand: [nodeId: string]
  viewDetails: [member: TeamMember]
  editMember: [member: TeamMember]
  sendMessage: [member: TeamMember]
}>()

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

// Gestionnaires d'événements
const toggleExpand = () => {
  emit('toggleExpand', props.node.id)
}

const viewDetails = () => {
  emit('viewDetails', props.node.member)
}

const editMember = () => {
  emit('editMember', props.node.member)
}

const sendMessage = () => {
  emit('sendMessage', props.node.member)
}
</script>

<style scoped>
.org-node {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.org-children {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Animation pour l'expansion/réduction */
.org-children {
  transition: all 0.3s ease-in-out;
}

/* Styles pour les lignes de connexion */
.connection-line {
  background-color: #d1d5db;
}

/* Hover effects */
.org-node:hover .connection-line {
  background-color: #9ca3af;
}
</style>