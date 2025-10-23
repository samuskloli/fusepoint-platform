import { projectManagementService } from '@/services/projectManagementService'
import type { Checklist, ChecklistItem, ChecklistStatus, ChecklistPriority } from '../types'

class ChecklistService {
  async getChecklists(projectId: string): Promise<{ success: boolean; data?: Checklist[]; error?: string }> {
    try {
      // Utiliser le service de gestion de projet existant
      const response = await projectManagementService.getProjectChecklists(projectId)
      return {
        success: true,
        data: response.data || []
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des checklists:', error)
      return {
        success: false,
        error: 'Erreur lors de la récupération des checklists'
      }
    }
  }

  async createChecklist(projectId: string, checklistData: Partial<Checklist>): Promise<{ success: boolean; data?: Checklist; error?: string }> {
    try {
      const response = await projectManagementService.createChecklist(projectId, checklistData)
      return response
    } catch (error) {
      console.error('Erreur lors de la création de la checklist:', error)
      return {
        success: false,
        error: 'Erreur lors de la création de la checklist'
      }
    }
  }

  async updateChecklist(checklistId: string, checklistData: Partial<Checklist>): Promise<{ success: boolean; data?: Checklist; error?: string }> {
    try {
      const response = await projectManagementService.updateChecklist(checklistId, checklistData)
      return response
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la checklist:', error)
      return {
        success: false,
        error: 'Erreur lors de la mise à jour de la checklist'
      }
    }
  }

  async deleteChecklist(checklistId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await projectManagementService.deleteChecklist(checklistId)
      return response
    } catch (error) {
      console.error('Erreur lors de la suppression de la checklist:', error)
      return {
        success: false,
        error: 'Erreur lors de la suppression de la checklist'
      }
    }
  }

  async duplicateChecklist(checklistId: string): Promise<{ success: boolean; data?: Checklist; error?: string }> {
    try {
      const response = await projectManagementService.duplicateChecklist(checklistId)
      return response
    } catch (error) {
      console.error('Erreur lors de la duplication de la checklist:', error)
      return {
        success: false,
        error: 'Erreur lors de la duplication de la checklist'
      }
    }
  }

  async createChecklistItem(checklistId: string, itemData: Partial<ChecklistItem>): Promise<{ success: boolean; data?: ChecklistItem; error?: string }> {
    try {
      const response = await projectManagementService.createChecklistItem(checklistId, itemData)
      return response
    } catch (error) {
      console.error('Erreur lors de la création de l\'élément:', error)
      return {
        success: false,
        error: 'Erreur lors de la création de l\'élément'
      }
    }
  }

  async updateChecklistItem(itemId: string, itemData: Partial<ChecklistItem>): Promise<{ success: boolean; data?: ChecklistItem; error?: string }> {
    try {
      const response = await projectManagementService.updateChecklistItem(itemId, itemData)
      return response
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'élément:', error)
      return {
        success: false,
        error: 'Erreur lors de la mise à jour de l\'élément'
      }
    }
  }

  async deleteChecklistItem(itemId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await projectManagementService.deleteChecklistItem(itemId)
      return response
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'élément:', error)
      return {
        success: false,
        error: 'Erreur lors de la suppression de l\'élément'
      }
    }
  }
}

export const checklistService = new ChecklistService()
export default checklistService