<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <!-- En-tête -->
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-medium text-gray-900">{{ t('widgets.team.orgChartTitle') }}</h3>
      <div class="flex items-center space-x-2">
        <button
        @click="expandAll"
        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
        {{ t('widgets.team.expandAll') }}
      </button>
        <button
        @click="collapseAll"
        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
        {{ t('widgets.team.collapseAll') }}
      </button>
      </div>
    </div>

    <!-- Organigramme -->
    <div class="overflow-x-auto">
      <div class="min-w-max">
        <!-- Nœuds racines (sans manager) -->
        <div class="space-y-4">
          <OrgNode
            v-for="rootNode in rootNodes"
            :key="rootNode.id"
            :node="rootNode"
            :show-avatar="showAvatar"
            :show-contact-info="showContactInfo"
            @toggle-expand="toggleExpand"
            @view-details="viewDetails"
            @edit-member="editMember"
            @send-message="sendMessage"
          />
        </div>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="mt-6 pt-6 border-t border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">{{ totalMembers }}</div>
          <div class="text-sm text-gray-500">{{ t('widgets.team.totalMembers') }}</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">{{ maxDepth }}</div>
          <div class="text-sm text-gray-500">{{ t('widgets.team.hierarchyLevels') }}</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">{{ managersCount }}</div>
          <div class="text-sm text-gray-500">{{ t('widgets.team.managers') }}</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">{{ avgTeamSize }}</div>
          <div class="text-sm text-gray-500">{{ t('widgets.team.avgTeamSize') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTranslation } from '@/composables'
import type { TeamMember, OrgNode } from '../types'
import OrgNode from './OrgNode.vue'

// Types
interface OrgChartProps {
  members: TeamMember[]
  showAvatar?: boolean
  showContactInfo?: boolean
  expandAll?: boolean
}

// Props
const props = withDefaults(defineProps<OrgChartProps>(), {
  showAvatar: true,
  showContactInfo: false,
  expandAll: false
})

// Composables
const { t } = useTranslation()

// Émissions
const emit = defineEmits<{
  viewDetails: [member: TeamMember]
  editMember: [member: TeamMember]
  sendMessage: [member: TeamMember]
}>()

// État local
const orgNodes = ref<Map<string, OrgNode>>(new Map())
const expandedNodes = ref<Set<string>>(new Set())

// Computed
const rootNodes = computed(() => {
  return Array.from(orgNodes.value.values())
    .filter(node => !node.member.managerId)
    .sort((a, b) => a.member.name.localeCompare(b.member.name))
})

const totalMembers = computed(() => props.members.length)

const maxDepth = computed(() => {
  let depth = 0
  const calculateDepth = (nodeId: string, currentDepth: number) => {
    const node = orgNodes.value.get(nodeId)
    if (!node) return currentDepth
    
    depth = Math.max(depth, currentDepth)
    
    for (const child of node.children) {
      calculateDepth(child.id, currentDepth + 1)
    }
  }
  
  for (const rootNode of rootNodes.value) {
    calculateDepth(rootNode.id, 1)
  }
  
  return depth
})

const managersCount = computed(() => {
  return props.members.filter(member => member.directReports.length > 0).length
})

const avgTeamSize = computed(() => {
  const managers = props.members.filter(member => member.directReports.length > 0)
  if (managers.length === 0) return 0
  
  const totalReports = managers.reduce((sum, manager) => sum + manager.directReports.length, 0)
  return Math.round(totalReports / managers.length)
})

// Méthodes
const buildOrgChart = () => {
  // Créer les nœuds
  const nodes = new Map<string, OrgNode>()
  
  props.members.forEach(member => {
    nodes.set(member.id, {
      id: member.id,
      member,
      children: [],
      level: 0,
      isExpanded: props.expandAll || expandedNodes.value.has(member.id)
    })
  })
  
  // Construire la hiérarchie
  props.members.forEach(member => {
    if (member.managerId) {
      const managerNode = nodes.get(member.managerId)
      const memberNode = nodes.get(member.id)
      
      if (managerNode && memberNode) {
        managerNode.children.push(memberNode)
        memberNode.level = managerNode.level + 1
      }
    }
  })
  
  // Trier les enfants par nom
  nodes.forEach(node => {
    node.children.sort((a, b) => a.member.name.localeCompare(b.member.name))
  })
  
  orgNodes.value = nodes
}

const toggleExpand = (nodeId: string) => {
  const node = orgNodes.value.get(nodeId)
  if (!node) return
  
  node.isExpanded = !node.isExpanded
  
  if (node.isExpanded) {
    expandedNodes.value.add(nodeId)
  } else {
    expandedNodes.value.delete(nodeId)
  }
}

const expandAll = () => {
  orgNodes.value.forEach(node => {
    node.isExpanded = true
    expandedNodes.value.add(node.id)
  })
}

const collapseAll = () => {
  orgNodes.value.forEach(node => {
    node.isExpanded = false
  })
  expandedNodes.value.clear()
}

const viewDetails = (member: TeamMember) => {
  emit('viewDetails', member)
}

const editMember = (member: TeamMember) => {
  emit('editMember', member)
}

const sendMessage = (member: TeamMember) => {
  emit('sendMessage', member)
}

// Lifecycle
onMounted(() => {
  buildOrgChart()
})

// Watcher pour reconstruire l'organigramme quand les membres changent
watch(() => props.members, () => {
  buildOrgChart()
}, { deep: true })
</script>

<style scoped>
/* Styles pour l'organigramme */
.org-chart {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.org-node {
  position: relative;
}

.org-node::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 50%;
  width: 1px;
  height: 20px;
  background-color: #d1d5db;
  transform: translateX(-50%);
}

.org-node::after {
  content: '';
  position: absolute;
  top: -20px;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #d1d5db;
}

.org-node:first-child::after {
  left: 50%;
}

.org-node:last-child::after {
  right: 50%;
}

.org-node:only-child::after {
  display: none;
}

.org-children {
  position: relative;
}

.org-children::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 1px;
  height: 20px;
  background-color: #d1d5db;
  transform: translateX(-50%);
}
</style>