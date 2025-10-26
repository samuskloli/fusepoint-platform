<template>
  <div class="notes-widget">
    <div class="notes-header">
      <h4>{{ t('widgets.notes.title') }}</h4>
      <button class="btn btn-sm btn-primary" @click="addNote">
        <i class="fas fa-plus"></i>
        {{ t('widgets.notes.add') }}
      </button>
    </div>
    <div class="notes-content">
      <div v-if="notes.length === 0" class="empty-state">
        <i class="fas fa-sticky-note"></i>
        <p>{{ t('widgets.notes.noNotes') }}</p>
      </div>
      <div v-else class="notes-list">
        <div v-for="note in notes" :key="note.id" class="note-item">
          <div class="note-header">
            <span class="note-date">{{ formatDate(note.createdAt) }}</span>
            <div class="note-actions">
              <button class="btn-icon" @click="editNote(note)" :title="t('common.edit')">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon" @click="deleteNote(note)" :title="t('common.delete')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="note-content">
            <h5 v-if="note.title" class="note-title">{{ note.title }}</h5>
            <p class="note-text">{{ note.content }}</p>
          </div>
          <div v-if="note.tags && note.tags.length > 0" class="note-tags">
            <span v-for="tag in note.tags" :key="tag" class="note-tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pour ajouter/éditer une note -->
    <div v-if="showNoteModal" class="modal-overlay" @click="closeNoteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingNote ? t('widgets.notes.editNote') : t('widgets.notes.addNote') }}</h3>
          <button class="btn-icon" @click="closeNoteModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>{{ t('widgets.notes.title') }}</label>
            <input v-model="noteForm.title" type="text" class="form-control" :placeholder="t('widgets.notes.titlePlaceholder')">
          </div>
          <div class="form-group">
            <label>{{ t('widgets.notes.content') }}</label>
            <textarea v-model="noteForm.content" class="form-control" rows="4" :placeholder="t('widgets.notes.contentPlaceholder')"></textarea>
          </div>
          <div class="form-group">
            <label>{{ t('widgets.notes.tags') }}</label>
            <input v-model="noteForm.tagsInput" type="text" class="form-control" :placeholder="t('widgets.notes.tagsPlaceholder')">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeNoteModal">{{ t('common.cancel') }}</button>
          <button class="btn btn-primary" @click="saveNote">{{ t('common.save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useTranslation } from '@/composables/useTranslation'

export default {
  name: 'NotesWidget',
  props: {
    projectId: {
      type: [String, Number],
      required: true
    },
    widget: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const { t } = useTranslation()
    const notes = ref([])
    const showNoteModal = ref(false)
    const editingNote = ref(null)
    const noteForm = ref({
      title: '',
      content: '',
      tagsInput: ''
    })

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const addNote = () => {
      editingNote.value = null
      noteForm.value = { title: '', content: '', tagsInput: '' }
      showNoteModal.value = true
    }

    const editNote = (note) => {
      editingNote.value = note
      noteForm.value = {
        title: note.title || '',
        content: note.content || '',
        tagsInput: note.tags ? note.tags.join(', ') : ''
      }
      showNoteModal.value = true
    }

    const deleteNote = (note) => {
      if (confirm(t('widgets.notes.confirmDelete'))) {
        const index = notes.value.findIndex(n => n.id === note.id)
        if (index > -1) {
          notes.value.splice(index, 1)
        }
      }
    }

    const closeNoteModal = () => {
      showNoteModal.value = false
      editingNote.value = null
      noteForm.value = { title: '', content: '', tagsInput: '' }
    }

    const saveNote = () => {
      if (!noteForm.value.content.trim()) return

      const tags = noteForm.value.tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      if (editingNote.value) {
        // Édition
        const index = notes.value.findIndex(n => n.id === editingNote.value.id)
        if (index > -1) {
          notes.value[index] = {
            ...notes.value[index],
            title: noteForm.value.title.trim(),
            content: noteForm.value.content.trim(),
            tags,
            updatedAt: new Date()
          }
        }
      } else {
        // Ajout
        const newNote = {
          id: Date.now(),
          title: noteForm.value.title.trim(),
          content: noteForm.value.content.trim(),
          tags,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        notes.value.unshift(newNote)
      }

      closeNoteModal()
    }

    const loadNotes = async () => {
      // Simulation de données pour l'instant
      notes.value = [
        {
          id: 1,
          title: 'Réunion client',
          content: 'Points importants discutés lors de la réunion avec le client. Modifications à apporter au design.',
          tags: ['réunion', 'client', 'design'],
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: 2,
          title: 'Idées d\'amélioration',
          content: 'Liste des améliorations possibles pour la prochaine version.',
          tags: ['amélioration', 'v2'],
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ]
    }

    onMounted(() => {
      loadNotes()
    })

    return {
      t,
      notes,
      showNoteModal,
      editingNote,
      noteForm,
      formatDate,
      addNote,
      editNote,
      deleteNote,
      closeNoteModal,
      saveNote
    }
  }
}
</script>

<style scoped>
.notes-widget {
  padding: 1rem;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.notes-header h4 {
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.note-item {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.note-date {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.note-actions {
  display: flex;
  gap: 0.25rem;
}

.note-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.note-text {
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);
  line-height: 1.5;
}

.note-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.note-tag {
  padding: 0.25rem 0.5rem;
  background: var(--primary-color);
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
}

.btn-icon {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}
</style>