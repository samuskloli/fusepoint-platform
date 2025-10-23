// Composant principal
export { default as TeamWidget } from './TeamWidget.vue'

// Composants de vue
export { default as MemberCard } from './components/MemberCard.vue'
export { default as MemberList } from './components/MemberList.vue'
export { default as OrgChart } from './components/OrgChart.vue'
export { default as OrgNode } from './components/OrgNode.vue'

// Modales
export { default as AddMemberModal } from './components/AddMemberModal.vue'
export { default as EditMemberModal } from './components/EditMemberModal.vue'
export { default as MemberDetailsModal } from './components/MemberDetailsModal.vue'
export { default as TeamConfigModal } from './components/TeamConfigModal.vue'

// Types
export type {
  // Types de base
  MemberStatus,
  MemberRole,
  Department,
  TeamView,
  SortOrder,
  
  // Interfaces principales
  TeamMember,
  TeamStats,
  MemberFilter,
  TeamWidgetConfig,
  
  // Types pour les formulaires
  CreateMemberData,
  UpdateMemberData,
  
  // Types pour les composants
  MemberCardProps,
  MemberListProps,
  OrgChartProps,
  
  // Types pour l'organigramme
  OrgNode as OrgNodeType
} from './types.js'

// Export des types
export type * from './types.js'