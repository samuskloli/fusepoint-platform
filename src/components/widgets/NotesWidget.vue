<template>
  <div class="notes-widget">
    <div class="notes-header">
      <h4>{{ t('widgets.notes.title') }}</h4>
      <div class="notes-header-actions">
        <select v-model="selectedCategoryFilter" class="filter-select" :disabled="loading">
          <option :value="''">{{ t('widgets.allCategories') || 'Toutes les catégories' }}</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
        <label class="ml-2 text-sm text-secondary">
          <input type="checkbox" v-model="includeArchived" :disabled="loading" />
          {{ t('widgets.notes.showArchived') || 'Afficher archivées' }}
        </label>
        <button class="btn btn-sm btn-primary" @click="addNote" :disabled="loading">
        <i class="fas fa-plus"></i>
        {{ t('widgets.notes.add') }}
        </button>
      </div>
    </div>
    <div class="notes-content">
      <div v-if="loading && notes.length === 0" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>{{ t('common.loading') }}</p>
      </div>
      <div v-else-if="notes.length === 0" class="empty-state">
        <i class="fas fa-sticky-note"></i>
        <p>{{ t('widgets.notes.noNotes') }}</p>
      </div>
        <div v-else class="notes-list">
          <div v-for="note in filteredNotes" :key="note.id" class="note-item">
            <div class="note-header">
              <span class="note-date">{{ formatDate(note.created_at || note.createdAt) }}</span>
              <div class="note-actions">
                <button class="btn-icon" @click="viewNote(note)" :title="t('common.view') || 'Voir'" :disabled="loading">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" @click="editNote(note)" :title="t('common.edit')" :disabled="loading">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" @click="deleteNote(note)" :title="t('common.delete')" :disabled="loading">
                  <i class="fas fa-trash"></i>
                </button>
                <button class="btn-icon" @click="toggleArchive(note)" :title="note.archived ? (t('widgets.notes.restore') || 'Restaurer') : (t('widgets.notes.archive') || 'Archiver')" :disabled="loading">
                  <i :class="note.archived ? 'fas fa-undo' : 'fas fa-archive'"></i>
                </button>
              </div>
            </div>
          <div class="note-content">
            <h5 v-if="note.title" class="note-title">{{ note.title }}</h5>
            <!-- Aperçu de la note (contenu tronqué) avec option Voir plus pour étendre -->
            <div
              class="note-text"
              :class="[{ 'preview-collapsed': !isNoteExpanded(note) }, { 'is-truncated': !isNoteExpanded(note) && isOverflow(note.id) }]"
              v-html="renderContent(note)"
              :ref="setNoteRef(note.id)"
              @click="(evt) => onChecklistToggle(evt, note)"
            ></div>
            <div class="note-footer">
              <span v-if="note.category_id && categoryById[note.category_id]" class="note-category-chip" :style="{ backgroundColor: categoryById[note.category_id].color || '#6b7280' }">
                <i v-if="categoryById[note.category_id].icon" :class="categoryById[note.category_id].icon" class="mr-1"></i>
                {{ categoryById[note.category_id].name }}
              </span>
              <button v-if="isOverflow(note.id)" class="btn-see-more" @click="toggleExpand(note)" :disabled="loading">
                <i :class="isNoteExpanded(note) ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="mr-1"></i>
                {{ isNoteExpanded(note) ? (t('common.viewLess') || 'Voir moins') : (t('common.viewMore') || 'Voir plus') }}
              </button>
            </div>
          </div>
          <div v-if="note.tags && note.tags.length > 0" class="note-tags">
            <span v-for="tag in note.tags" :key="tag" class="note-tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pour ajouter/éditer une note -->
    <div v-if="showNoteModal" class="modal-overlay" @click="closeNoteModal">
      <div class="modal-container modal-large" @click.stop>
        <div class="modal-header">
          <h3>{{ editingNote ? t('widgets.notes.editNote') : t('widgets.notes.addNote') }}</h3>
          <div class="modal-mode-toggle">
            <button
              class="toggle-btn"
              :class="{ active: modalMode === 'edit' }"
              @click="modalMode = 'edit'"
              :title="t('common.edit')"
            >{{ t('common.edit') }}</button>
            <button
              class="toggle-btn"
              :class="{ active: modalMode === 'view' }"
              @click="modalMode = 'view'"
              :title="t('common.view') || 'Voir'"
            >{{ t('common.view') || 'Voir' }}</button>
          </div>
          <button class="btn-icon" @click="closeNoteModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">{{ t('widgets.notes.titleLabel') || 'Titre' }}</label>
            <input v-model="noteForm.title" type="text" class="form-input" :placeholder="t('widgets.notes.titlePlaceholder')" :disabled="modalMode === 'view'">
          </div>
          <div class="form-group" v-if="modalMode === 'edit'">
            <label class="form-label">{{ t('widgets.notes.content') }}</label>
            <RichTextNoteEditor v-model="noteForm.content" :placeholder="t('widgets.notes.contentPlaceholder')" />
            <!-- Aperçu interactif: permet de cliquer sur les carrés pour cocher/décocher pendant l'édition -->
            <div class="form-group" style="margin-top:0.75rem;">
              <label class="form-label">{{ t('common.preview') || 'Aperçu' }}</label>
              <div class="note-viewer" v-html="renderFormContent(noteForm.content)" @click="onChecklistToggleInForm"></div>
            </div>
          </div>
          <div class="form-group" v-else>
            <label class="form-label">{{ t('widgets.notes.content') }}</label>
            <div class="note-viewer" v-html="renderFormContent(noteForm.content)" @click="onChecklistToggleInForm"></div>
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('widgets.category') || 'Catégorie' }}</label>
            <select v-model="noteForm.category_id" class="form-input" :disabled="modalMode === 'view'">
              <option :value="null">{{ t('widgets.none') || 'Aucune' }}</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('widgets.notes.tags') }}</label>
            <input v-model="noteForm.tagsInput" type="text" class="form-input" :placeholder="t('widgets.notes.tagsPlaceholder')" :disabled="modalMode === 'view'">
          </div>
          <div class="form-group" style="display:flex;align-items:center;gap:0.5rem;">
            <input id="archive-on-create" type="checkbox" v-model="noteForm.archived" :disabled="modalMode === 'view'" />
            <label for="archive-on-create" class="form-label" style="margin:0;">{{ t('widgets.notes.archiveOnCreate') || 'Archiver cette note' }}</label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeNoteModal" :disabled="saving">{{ t('common.cancel') }}</button>
          <button class="btn-primary" @click="saveNote" :disabled="saving || !contentToMarkdownString(noteForm.content).trim()">
            <i v-if="saving" class="fas fa-spinner fa-spin"></i>
            {{ saving ? t('common.saving') : t('common.save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { marked } from 'marked'
import { sanitizeTasksInteractive, sanitizeTasksPreview } from '@/utils/sanitize'
import { useTranslation } from '@/composables/useTranslation'
import notesService from '@/services/notesService'
import noteCategoriesService from '@/services/noteCategoriesService'
import RichTextNoteEditor from '@/components/common/RichTextNoteEditor.vue'

export default {
  name: 'NotesWidget',
  components: { RichTextNoteEditor },
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
    const categories = ref([])
    const selectedCategoryFilter = ref('')
    const showNoteModal = ref(false)
    const editingNote = ref(null)
    const modalMode = ref('edit')
    const loading = ref(false)
    const saving = ref(false)
    const noteForm = ref({
      title: '',
      content: '',
      tagsInput: '',
      category_id: null,
      archived: false
    })

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Utilitaires pour extraire un texte robuste quel que soit le format (string, objet, tableau)
    const stripHtml = (html) => String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

    const extractTextFromAny = (val, depth = 0) => {
      if (val == null) return ''
      if (typeof val === 'string') return val
      if (depth > 4) return ''
      if (Array.isArray(val)) {
        // Concatène le texte de chaque élément
        return val.map(v => extractTextFromAny(v, depth + 1)).filter(Boolean).join('\n')
      }
      if (typeof val === 'object') {
        // Cas courants d'éditeurs riches
        if (typeof val.markdown === 'string') return val.markdown
        if (typeof val.content === 'string') return val.content
        if (typeof val.text === 'string') return val.text
        if (typeof val.html === 'string') return stripHtml(val.html)
        // TipTap / ProseMirror JSON (noeuds avec type/content)
        if (val.type === 'text' && typeof val.text === 'string') return val.text
        if (Array.isArray(val.content)) return extractTextFromAny(val.content, depth + 1)
        if (val.doc && Array.isArray(val.doc.content)) return extractTextFromAny(val.doc.content, depth + 1)
        if (Array.isArray(val.ops)) {
          // Format Quill Delta
          return val.ops.map(op => (typeof op.insert === 'string' ? op.insert : '')).join('')
        }
        if (Array.isArray(val.children)) {
          return extractTextFromAny(val.children, depth + 1)
        }
        // Parcours générique des valeurs
        return Object.values(val).map(v => extractTextFromAny(v, depth + 1)).filter(Boolean).join('\n')
      }
      // Pour les types non-objets
      try {
        return typeof val === 'object' ? '' : String(val)
      } catch (e) {
        return ''
      }
    }

    // Conversion robuste ProseMirror/TipTap JSON -> Markdown
    const toMarkdownFromRichJSON = (node, opts = {}) => {
      if (node == null) return ''
      if (typeof node === 'string') return node
      if (Array.isArray(node)) return node.map(n => toMarkdownFromRichJSON(n, opts)).filter(Boolean).join('\n')
      if (typeof node !== 'object') return String(node)

      const joinChildren = (n, sep = '') => {
        const c = Array.isArray(n?.content) ? n.content : []
        return c.map(child => toMarkdownFromRichJSON(child, opts)).join(sep)
      }

      const type = node.type
      switch (type) {
        case 'doc':
          return joinChildren(node, '\n')
        case 'paragraph':
          return joinChildren(node, '') + '\n'
        case 'text':
          return node.text || ''
        case 'heading': {
          const level = node.attrs?.level || 1
          return `${'#'.repeat(Math.min(6, Math.max(1, level)))} ${joinChildren(node, '')}\n`
        }
        case 'bulletList':
          return (node.content || []).map(li => toMarkdownFromRichJSON(li, opts)).join('\n')
        case 'orderedList': {
          let i = 1
          return (node.content || []).map(li => `${i++}. ${toMarkdownFromRichJSON(li, opts).replace(/^\s*-\s*/,'')}`).join('\n')
        }
        case 'listItem': {
          const inner = joinChildren(node, '')
          return `- ${inner}`
        }
        case 'taskList':
          return (node.content || []).map(item => toMarkdownFromRichJSON(item, opts)).join('\n')
        case 'taskItem': {
          const checked = !!(node.attrs?.checked)
          const inner = joinChildren(node, '')
          return `- [${checked ? 'x' : ' '}] ${inner}`
        }
        case 'blockquote':
          return '> ' + joinChildren(node, '') + '\n'
        case 'codeBlock':
        case 'code': {
          const text = joinChildren(node, '')
          return '```\n' + text + '\n```\n'
        }
        case 'horizontalRule':
          return '\n---\n'
        case 'hardBreak':
          return '\n'
        case 'image': {
          const src = node.attrs?.src || ''
          const alt = node.attrs?.alt || ''
          return `![${alt}](${src})`
        }
        case 'link': {
          const href = node.attrs?.href || ''
          const text = joinChildren(node, '')
          return `[${text}](${href})`
        }
        default:
          // Par défaut, tenter de concaténer le texte des enfants
          if (Array.isArray(node.content)) return joinChildren(node, '')
          return ''
      }
    }

    const contentToMarkdownString = (content) => {
      try {
        if (typeof content === 'string') {
          // Si la chaîne contient des échappements (\n, \t, etc.) ou est une chaîne JSON entourée de guillemets,
          // on la "déséchappe" pour retrouver de vrais sauts de ligne et tabulations.
          let s = content
          const trimmed = s.trim()
          // Chaîne JSON entourée de guillemets
          if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
            try {
              const parsed = JSON.parse(trimmed)
              if (typeof parsed === 'string') s = parsed
            } catch {}
          }
          // Remplacer les séquences d'échappement courantes si présentes (y compris double-échappées) et HTML <br>
          if (/\\\\n|\\n|\\\\t|\\t|\\\\r|\\r/.test(s) || /<br\s*\/?>(?![^]*<\/br>)|&#10;|&#x0A;/i.test(s)) {
            s = s
              .replace(/\\\\r\\\\n/g, '\r\n')
              .replace(/\\\\n/g, '\n')
              .replace(/\\n/g, '\n')
              .replace(/\\\\t/g, '\t')
              .replace(/\\t/g, '\t')
              .replace(/\\\\r/g, '\r')
              .replace(/\\r/g, '\r')
              .replace(/<br\s*\/?>(?![^]*<\/br>)/gi, '\n')
              .replace(/&#10;|&#x0A;/gi, '\n')
          }
          // Gérer chaînes entourées de quotes simples
          const t2 = s.trim()
          if (t2.startsWith('\'') && t2.endsWith('\'')) {
            s = t2.slice(1, -1)
          }
          return s
        }
        if (content && typeof content === 'object') {
          // Cas: contenu encapsulé dans { doc: {...} }
          if (content.doc && typeof content.doc === 'object') {
            try {
              const mdDoc = toMarkdownFromRichJSON(content.doc)
              const mdDocStr = typeof mdDoc === 'string' ? mdDoc : ''
              if (mdDocStr.trim().length > 0) return mdDocStr
            } catch {}
          }
          // Cas: contenu racine avec un tableau de noeuds { content: [...] }
          if (Array.isArray(content.content)) {
            try {
              const mdRoot = toMarkdownFromRichJSON({ type: 'doc', content: content.content })
              const mdRootStr = typeof mdRoot === 'string' ? mdRoot : ''
              if (mdRootStr.trim().length > 0) return mdRootStr
            } catch {}
          }
          // Essayer conversion ProseMirror/TipTap
          try {
            const md = toMarkdownFromRichJSON(content)
            const mdStr = typeof md === 'string' ? md : ''
            if (mdStr.trim().length > 0) return mdStr
          } catch {}
          // Quill Delta
          if (Array.isArray(content.ops)) {
            return content.ops.map(op => (typeof op.insert === 'string' ? op.insert : '')).join('\n')
          }
          // Extraction générique
          const text = extractTextFromAny(content)
          if (typeof text === 'string' && text.trim().length > 0) return text
          // Dernier recours: afficher le JSON formatté pour éviter [object Object]
          return '```json\n' + JSON.stringify(content, null, 2) + '\n```'
        }
        return String(content ?? '')
      } catch (e) {
        if (content && typeof content === 'object') {
          try {
            return '```json\n' + JSON.stringify(content, null, 2) + '\n```'
          } catch (_) {
            return ''
          }
        }
        return typeof content === 'string' ? content : ''
      }
    }

    // Normalise les lignes de checklist qui ne commencent pas par un marqueur de liste Markdown
    // Exemple: "[ ] Tâche" devient "- [ ] Tâche" pour que marked les traite comme des <li>
    const normalizeChecklistMarkdown = (text) => {
      const lines = String(text || '').split(/\r?\n/)
      return lines
        .map((line) => {
          // Si la ligne commence par un item de checklist sans puce, on ajoute "- "
          if (/^\s*\[( |x|X)\]\s*/.test(line) && !/^\s*(?:[-*+]|\d+\.)\s+\[( |x|X)\]\s*/.test(line)) {
            return '- ' + line.trim()
          }
          return line
        })
        .join('\n')
    }

    // Rendu Markdown sécurisé avec cases à cocher interactives (vue détaillée)
    const renderContent = (note) => {
      try {
        const raw = contentToMarkdownString(note?.content)
        const text = normalizeChecklistMarkdown(raw)
        let taskIndex = 0
        const renderer = new marked.Renderer()
        // Rendre les items de liste en exploitant le support natif "task list" de marked,
        // tout en gardant un fallback via regex si le parseur ne marque pas l'item comme une tâche.
        renderer.listitem = (text, task, checked) => {
          // Cas natif: marked identifie un item de tâche (GFM)
          if (task === true) {
            const idx = taskIndex++
            const checkbox = `<input type="checkbox" class="md-task-checkbox" data-task-index="${idx}" ${checked ? 'checked' : ''}>`
            return `<li class="task-list-item">${checkbox} ${text}</li>`
          }
          // Fallback: tolérer les items qui commencent par [ ] ou [x] dans le texte
          const m = text.match(/^\s*\[( |x|X)\]\s*(.*)$/)
          if (m) {
            const isChecked = m[1].toLowerCase() === 'x'
            const body = m[2]
            const idx = taskIndex++
            const checkbox = `<input type="checkbox" class="md-task-checkbox" data-task-index="${idx}" ${isChecked ? 'checked' : ''}>`
            return `<li class="task-list-item">${checkbox} ${body}</li>`
          }
          return `<li>${text}</li>`
        }
        marked.setOptions({ gfm: true, breaks: true })
        let md = marked.parse(text, { renderer })
        if (typeof md === 'string' && md.includes('[object Object]')) {
          const fallbackText = (() => {
            try { return '```json\n' + JSON.stringify(note?.content, null, 2) + '\n```' } catch (_) { return '' }
          })()
          md = marked.parse(fallbackText, { renderer })
        }
        // Autoriser explicitement les inputs et attributs nécessaires aux cases à cocher interactives
        return sanitizeTasksInteractive(md)
      } catch (e) {
        const safe = contentToMarkdownString(note?.content)
        return sanitizeTasksInteractive(marked.parse(typeof safe === 'string' ? safe : ''))
      }
    }

    // Aperçu court: tronque le contenu pour lister les notes de façon lisible
    const renderPreview = (note) => {
      try {
        const fullText = normalizeChecklistMarkdown(contentToMarkdownString(note?.content)).trim()
        // Limiter à ~300 caractères ou 5 lignes pour un aperçu
        const lines = fullText.split(/\r?\n/)
        let acc = ''
        for (let i = 0; i < lines.length && i < 5 && acc.length < 300; i++) {
          const next = lines[i]
          if (!next) continue
          if (acc.length > 0) acc += '\n'
          acc += next
        }
        const previewText = acc.length < fullText.length ? acc + '…' : acc
        marked.setOptions({ gfm: true, breaks: true })
        // Utiliser le même renderer pour afficher des cases à cocher interactives dans l'aperçu
        let taskIndex = 0
        const renderer = new marked.Renderer()
        renderer.listitem = (text, task, checked) => {
          // Cas natif GFM: marked fournit task/checked
          if (task === true) {
            const idx = taskIndex++
            const checkbox = `<input type="checkbox" class="md-task-checkbox" data-task-index="${idx}" ${checked ? 'checked' : ''}>`
            return `<li class="task-list-item">${checkbox} ${text}</li>`
          }
          // Fallback via regex (tolère zéro ou plusieurs espaces après le crochet)
          const m = text.match(/^\s*\[( |x|X)\]\s*(.*)$/)
          if (m) {
            const isChecked = m[1].toLowerCase() === 'x'
            const body = m[2]
            const idx = taskIndex++
            const checkbox = `<input type="checkbox" class="md-task-checkbox" data-task-index="${idx}" ${isChecked ? 'checked' : ''}>`
            return `<li class="task-list-item">${checkbox} ${body}</li>`
          }
          return `<li>${text}</li>`
        }
        let md = marked.parse(previewText, { renderer })
        if (typeof md === 'string' && md.includes('[object Object]')) {
          const fallbackText = (() => {
            try { return '```json\n' + JSON.stringify(note?.content, null, 2) + '\n```' } catch (_) { return '' }
          })()
          md = marked.parse(fallbackText, { renderer })
        }
        return sanitizeTasksInteractive(md)
      } catch (e) {
        const safe = contentToMarkdownString(note?.content)
        return sanitizeTasksInteractive(marked.parse(typeof safe === 'string' ? safe : ''))
      }
    }


    const addNote = () => {
      editingNote.value = null
      noteForm.value = { title: '', content: '', tagsInput: '', category_id: null, archived: false }
      modalMode.value = 'edit'
      showNoteModal.value = true
    }

    const editNote = (note) => {
      editingNote.value = note
      noteForm.value = {
        title: note.title || '',
        // Normaliser en chaîne Markdown pour l'éditeur
        content: contentToMarkdownString(note.content || ''),
        tagsInput: Array.isArray(note.tags) ? note.tags.join(', ') : '',
        category_id: note.category_id ?? null,
        archived: !!note.archived
      }
      modalMode.value = 'edit'
      showNoteModal.value = true
    }

    const viewNote = (note) => {
      editingNote.value = note
      noteForm.value = {
        title: note.title || '',
        // Normaliser en chaîne Markdown pour le viewer
        content: contentToMarkdownString(note.content || ''),
        tagsInput: Array.isArray(note.tags) ? note.tags.join(', ') : '',
        category_id: note.category_id ?? null,
        archived: !!note.archived
      }
      modalMode.value = 'view'
      showNoteModal.value = true
    }

    const deleteNote = async (note) => {
      if (!confirm(t('widgets.notes.confirmDelete'))) return

      loading.value = true
      try {
        const result = await notesService.deleteNote(props.projectId, note.id)
        if (result.success) {
          // Supprimer la note de la liste locale
          const index = notes.value.findIndex(n => n.id === note.id)
          if (index > -1) {
            notes.value.splice(index, 1)
          }
        } else {
          console.error('Erreur lors de la suppression:', result.error)
          alert(t('common.error') + ': ' + result.error)
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de la note:', error)
        alert(t('common.error') + ': ' + error.message)
      } finally {
        loading.value = false
      }
    }

    const closeNoteModal = () => {
      showNoteModal.value = false
      editingNote.value = null
      noteForm.value = { title: '', content: '', tagsInput: '', category_id: null, archived: false }
    }

    const saveNote = async () => {
      const normalized = contentToMarkdownString(noteForm.value.content).trim()
      if (!normalized) return

      saving.value = true
      try {
        const tags = noteForm.value.tagsInput
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)

        const noteData = {
          title: noteForm.value.title.trim(),
          content: normalized,
          tags,
          widget_instance_id: props.widget?.id || null,
          category_id: noteForm.value.category_id,
          archived: !!noteForm.value.archived
        }

        let result
        if (editingNote.value) {
          // Édition
          result = await notesService.updateNote(props.projectId, editingNote.value.id, noteData)
          if (result.success) {
            // Mettre à jour la note dans la liste locale
            const index = notes.value.findIndex(n => n.id === editingNote.value.id)
            if (index > -1) {
              notes.value[index] = { ...notes.value[index], ...result.data }
            }
          }
        } else {
          // Ajout
          result = await notesService.createNote(props.projectId, noteData)
          if (result.success) {
            // Ajouter la nouvelle note en tête de liste
            notes.value.unshift(result.data)
          }
        }

        if (result.success) {
          closeNoteModal()
        } else {
          console.error('Erreur lors de la sauvegarde:', result.error)
          alert(t('common.error') + ': ' + result.error)
        }
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la note:', error)
        alert(t('common.error') + ': ' + error.message)
      } finally {
        saving.value = false
      }
    }

    const loadNotes = async () => {
      loading.value = true
      try {
        const result = await notesService.getNotes(props.projectId, { includeArchived: includeArchived.value })
        if (result.success) {
          notes.value = result.data || []
        } else {
          console.error('Erreur lors du chargement des notes:', result.error)
          // En cas d'erreur, on garde une liste vide plutôt que de planter
          notes.value = []
        }
      } catch (error) {
        console.error('Erreur lors du chargement des notes:', error)
        notes.value = []
      } finally {
        loading.value = false
      }
    }

    const loadCategories = async () => {
      try {
        const res = await noteCategoriesService.getCategories(props.projectId)
        if (res.success) {
          categories.value = res.data
        } else {
          console.warn('Impossible de charger les catégories:', res.error)
          categories.value = []
        }
      } catch (e) {
        console.warn('Erreur de chargement des catégories:', e)
        categories.value = []
      }
    }

    const categoryById = computed(() => {
      const map = {}
      for (const c of categories.value) {
        map[c.id] = c
      }
      return map
    })

    const includeArchived = ref(false)
    // Gestion de l'état d'expansion des aperçus de notes (Voir plus / Voir moins)
    const expandedNotes = ref(new Set())
    const isNoteExpanded = (note) => expandedNotes.value.has(note.id)
    const toggleExpand = (note) => {
      const s = expandedNotes.value
      if (s.has(note.id)) s.delete(note.id)
      else s.add(note.id)
      // Réassigner pour déclencher la réactivité
      expandedNotes.value = new Set(s)
    }

    // Prévisualisation fixe et détection réelle du dépassement via mesure du DOM
    const PREVIEW_MAX_HEIGHT = 160 // px
    const noteTextRefs = ref({})
    const overflowByNoteId = ref({})

    const setNoteRef = (id) => (el) => {
      if (el) {
        noteTextRefs.value[id] = el
        computeOverflow(id)
      }
    }

    const computeOverflow = (id) => {
      const el = noteTextRefs.value[id]
      if (!el) return
      // scrollHeight correspond à la hauteur totale du contenu; on compare à la hauteur de prévisualisation fixe
      overflowByNoteId.value[id] = el.scrollHeight > PREVIEW_MAX_HEIGHT
    }

    const recomputeAllOverflow = () => {
      nextTick(() => {
        Object.keys(noteTextRefs.value).forEach((id) => computeOverflow(id))
      })
    }

    const isOverflow = (id) => !!overflowByNoteId.value[id]
    const filteredNotes = computed(() => {
      let list = includeArchived.value ? notes.value : notes.value.filter(n => !n.archived)
      if (!selectedCategoryFilter.value) return list
      const filterId = parseInt(String(selectedCategoryFilter.value), 10)
      return list.filter(n => n.category_id === filterId)
    })

    const toggleArchive = async (note) => {
      loading.value = true
      try {
        const archived = !note.archived
        const res = await notesService.updateNote(props.projectId, note.id, { archived })
        if (res.success) {
          const idx = notes.value.findIndex(n => n.id === note.id)
          if (idx > -1) {
            notes.value[idx] = { ...notes.value[idx], archived, archived_at: archived ? new Date().toISOString() : null }
          }
        }
      } catch (e) {
        console.error('Erreur archivage note:', e)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadNotes()
      loadCategories()
      recomputeAllOverflow()
    })

    watch(includeArchived, () => {
      loadNotes()
    })

    watch(notes, () => {
      // Recalculer les dépassements lorsque les notes changent
      recomputeAllOverflow()
    }, { deep: true })

    watch(expandedNotes, () => {
      // Recalcul optionnel (utile si le contenu évolue après des interactions)
      recomputeAllOverflow()
    })

    const renderFormContent = (content) => {
      try {
        let text = ''
        if (typeof content === 'string') {
          text = content
        } else {
          const normalized = contentToMarkdownString(content)
          if (typeof normalized === 'string' && normalized.trim().length > 0) {
            text = normalized
          } else {
            try {
              text = '```json\n' + JSON.stringify(content, null, 2) + '\n```'
            } catch (_) {
              text = ''
            }
          }
        }
        let taskIndex = 0
        const renderer = new marked.Renderer()
        renderer.listitem = (text, task, checked) => {
          // Cas natif GFM
          if (task === true) {
            taskIndex++
            const checkbox = `<input type="checkbox" class="md-task-checkbox" ${checked ? 'checked' : ''} disabled>`
            return `<li class="task-list-item">${checkbox} ${text}</li>`
          }
          // Fallback regex
          const m = text.match(/^\s*\[( |x|X)\]\s*(.*)$/)
          if (m) {
            const isChecked = m[1].toLowerCase() === 'x'
            const body = m[2]
            taskIndex++
            const checkbox = `<input type="checkbox" class="md-task-checkbox" ${isChecked ? 'checked' : ''} disabled>`
            return `<li class="task-list-item">${checkbox} ${body}</li>`
          }
          return `<li>${text}</li>`
        }
        marked.setOptions({ gfm: true, breaks: true })
        let md = marked.parse(text, { renderer })
        if (typeof md === 'string' && md.includes('[object Object]')) {
          const fallbackText = (() => {
            try { return '```json\n' + JSON.stringify(content, null, 2) + '\n```' } catch (_) { return '' }
          })()
          md = marked.parse(fallbackText, { renderer })
        }
        return sanitizeTasksPreview(md)
      } catch (e) {
        const safe = contentToMarkdownString(content)
        return sanitizeTasksPreview(marked.parse(typeof safe === 'string' ? safe : ''))
      }
    }

    return {
      t,
      notes,
      showNoteModal,
      editingNote,
      modalMode,
      noteForm,
      loading,
      saving,
      categories,
      selectedCategoryFilter,
      includeArchived,
      isNoteExpanded,
      toggleExpand,
      setNoteRef,
      isOverflow,
      filteredNotes,
      categoryById,
      formatDate,
      renderContent,
      contentToMarkdownString,
      renderFormContent,
      
      renderPreview,
      toggleArchive,
      addNote,
      editNote,
      viewNote,
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

.loading-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.loading-state i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
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
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
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

.note-text.preview-collapsed {
  max-height: var(--preview-max-height, 160px);
  overflow: hidden;
}

.note-text.is-truncated {
  position: relative;
}

.note-text.is-truncated::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2.2rem;
  background: linear-gradient(to bottom, rgba(255,255,255,0), var(--bg-secondary));
  pointer-events: none;
}

/* Indiquer que les items de checklist sont cliquables dans le viewer */
.note-text :deep(.task-list-item) {
  cursor: pointer;
}

.btn-see-more {
  background: var(--primary-color, #2563eb);
  border: 1px solid var(--primary-color, #2563eb);
  color: #fff;
  font-size: 0.85rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
}

.btn-see-more:hover {
  filter: brightness(0.95);
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

.note-category-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  color: #fff;
  font-size: 0.75rem;
}

.notes-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
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

/* Modal styles: utiliser les classes globales de components.css (modal-overlay, modal-container, modal-header, modal-body, modal-footer, form-input) */
.form-group {
  margin-bottom: 1rem;
}

/* Toggle entre modes édition et visualisation */
.modal-mode-toggle {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;
}

.toggle-btn {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.toggle-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.note-viewer {
  padding: 0.5rem;
  border: 1px dashed var(--border-color);
  border-radius: 6px;
  background: var(--bg-tertiary);
}

/* Mise en page propre du contenu Markdown inséré via v-html */
.note-viewer :deep(ul),
.note-text :deep(ul) {
  list-style: disc;
  padding-left: 1.25rem;
  margin: 0.5rem 0;
}

.note-viewer :deep(ol),
.note-text :deep(ol) {
  list-style: decimal;
  padding-left: 1.25rem;
  margin: 0.5rem 0;
}

.note-viewer :deep(li),
.note-text :deep(li) {
  margin: 0.25rem 0;
}

/* Listes de tâches avec cases à cocher */
.note-viewer :deep(.task-list-item),
.note-text :deep(.task-list-item) {
  list-style: none;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.note-viewer :deep(.md-task-checkbox),
.note-text :deep(.md-task-checkbox) {
  margin-top: 0.15rem;
}

.note-viewer :deep(p),
.note-text :deep(p) {
  margin: 0.5rem 0;
}

.note-viewer :deep(h1),
.note-viewer :deep(h2),
.note-viewer :deep(h3),
.note-viewer :deep(h4),
.note-viewer :deep(h5),
.note-viewer :deep(h6),
.note-text :deep(h1),
.note-text :deep(h2),
.note-text :deep(h3),
.note-text :deep(h4),
.note-text :deep(h5),
.note-text :deep(h6) {
  margin: 0.5rem 0;
  font-weight: 600;
}

.note-viewer :deep(blockquote),
.note-text :deep(blockquote) {
  border-left: 3px solid var(--border-color);
  padding-left: 0.75rem;
  margin: 0.5rem 0;
  color: var(--text-secondary);
}

.note-viewer :deep(pre),
.note-text :deep(pre),
.note-viewer :deep(code),
.note-text :deep(code) {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
}

.note-viewer :deep(pre),
.note-text :deep(pre) {
  padding: 0.5rem 0.75rem;
  overflow-x: auto;
}

/* Responsive modal sizing for a friendlier editing experience */
:deep(.modal-container.modal-large) {
  /* Override global Tailwind max-w-md */
  max-width: none;
  /* Larger width on desktop while keeping responsive bounds */
  width: min(1100px, 92vw);
}

@media (min-width: 1280px) {
  :deep(.modal-container.modal-large) {
    width: min(1200px, 90vw);
  }
}

/* Full-screen modal on mobile */
@media (max-width: 768px) {
  :deep(.modal-container.modal-large) {
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
  }
  :deep(.modal-body) {
    flex: 1;
    overflow: auto;
  }
}
</style>
/* Pied de carte des notes (catégorie + bouton Voir plus) */
.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}
    // Bascule la n-ième checklist Markdown ([ ]/[x]) selon l'état
    const toggleNthChecklist = (text, nth, nextChecked) => {
      const lines = String(text || '').split('\n')
      let count = 0
      // Accepter les lignes avec ou sans puce Markdown avant [ ] / [x]
      const isChecklistLine = (line) => /^\s*(?:(?:[-*+]|\d+\.)\s+)?\[(?: |x|X)\]\s*/.test(line)
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (isChecklistLine(line)) {
          if (count === nth) {
            lines[i] = line.replace(/\[(?: |x|X)\]/, nextChecked ? '[x]' : '[ ]')
            break
          }
          count++
        }
      }
      return lines.join('\n')
    }

    const onChecklistToggle = async (evt, note) => {
      const target = evt.target
      let checkboxEl = null
      if (target && target.classList && target.classList.contains('md-task-checkbox')) {
        checkboxEl = target
      } else if (target && typeof target.closest === 'function') {
        const item = target.closest('.task-list-item')
        if (item) {
          checkboxEl = item.querySelector('.md-task-checkbox')
          if (checkboxEl) {
            // Permettre le clic partout sur l'item pour basculer la case
            checkboxEl.checked = !checkboxEl.checked
          }
        }
      }
      if (!checkboxEl) return
      const idx = parseInt(checkboxEl.getAttribute('data-task-index'), 10)
      if (Number.isNaN(idx)) return
      const current = contentToMarkdownString(note.content)
      const nextContent = toggleNthChecklist(current, idx, checkboxEl.checked)
      try {
        const result = await notesService.updateNote(props.projectId, note.id, { content: nextContent })
        if (result.success) {
          const index = notes.value.findIndex(n => n.id === note.id)
          if (index > -1) notes.value[index] = { ...notes.value[index], content: nextContent, updated_at: new Date().toISOString() }
        }
      } catch (e) {
        console.warn('Erreur mise à jour checklist:', e)
      }
    }

    const onChecklistToggleInForm = async (evt) => {
      const target = evt.target
      let checkboxEl = null
      if (target && target.classList && target.classList.contains('md-task-checkbox')) {
        checkboxEl = target
      } else if (target && typeof target.closest === 'function') {
        const item = target.closest('.task-list-item')
        if (item) {
          checkboxEl = item.querySelector('.md-task-checkbox')
          if (checkboxEl) {
            checkboxEl.checked = !checkboxEl.checked
          }
        }
      }
      if (!checkboxEl) return
      const idx = parseInt(checkboxEl.getAttribute('data-task-index'), 10)
      if (Number.isNaN(idx)) return
      // Toujours travailler sur une chaîne Markdown canonique
      const current = contentToMarkdownString(noteForm.value.content)
      const nextContent = toggleNthChecklist(current, idx, checkboxEl.checked)
      noteForm.value.content = nextContent
      // Sauvegarde immédiate si on est en mode "édition d'une note existante" et en mode visualisation
      if (editingNote.value) {
        try {
          const result = await notesService.updateNote(props.projectId, editingNote.value.id, { content: nextContent })
          if (result.success) {
            const index = notes.value.findIndex(n => n.id === editingNote.value.id)
            if (index > -1) notes.value[index] = { ...notes.value[index], content: nextContent, updated_at: new Date().toISOString() }
          }
        } catch (e) {
          console.warn('Erreur mise à jour checklist (form):', e)
        }
      }
    }