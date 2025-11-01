<template>
  <div class="rich-text-note-editor">
    <textarea ref="editorEl"></textarea>
  </div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import EasyMDE from 'easymde'
import 'easymde/dist/easymde.min.css'

export default {
  name: 'RichTextNoteEditor',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const editorEl = ref(null)
    let mde = null

    const insertChecklist = () => {
      if (!mde) return
      const cm = mde.codemirror
      const doc = cm.getDoc()
      const cursor = doc.getCursor()
      // Insère une case à cocher en début de ligne
      doc.replaceRange('- [ ] ', { line: cursor.line, ch: 0 })
      cm.focus()
    }

    onMounted(() => {
      mde = new EasyMDE({
        element: editorEl.value,
        initialValue: props.modelValue || '',
        placeholder: props.placeholder || '',
        spellChecker: false,
        status: false,
        autoDownloadFontAwesome: false,
        toolbar: [
          'undo', 'redo', '|',
          'bold', 'italic', 'heading', '|',
          'quote', 'unordered-list', 'ordered-list',
          {
            name: 'checklist',
            action: insertChecklist,
            className: 'fa fa-check-square',
            title: 'Checklist'
          },
          'horizontal-rule', '|',
          'link', 'code', '|',
          'preview', 'side-by-side', 'fullscreen'
        ],
        ...props.options
      })

      // Permettre de cliquer n'importe où sur la ligne de checklist pour cocher/décocher
      mde.codemirror.on('mousedown', (cm, evt) => {
        try {
          const doc = cm.getDoc()
          const pos = cm.coordsChar({ left: evt.clientX, top: evt.clientY }, 'page')
          const lineText = doc.getLine(pos.line) || ''
          // Détecter une ligne de checklist: '- [ ] ' ou '- [x] '
          const checklistMatch = lineText.match(/^\s*(?:[-*+]|\d+\.)\s+\[( |x|X)\]\s*/)
          if (!checklistMatch) return
          const bracketStart = lineText.indexOf('[')
          const bracketEnd = lineText.indexOf(']', bracketStart + 1)
          if (bracketStart === -1 || bracketEnd === -1) return
          const currentFlag = checklistMatch[1]
          const nextFlag = currentFlag.toLowerCase() === 'x' ? ' ' : 'x'
          const newLine = lineText.slice(0, bracketStart + 1) + nextFlag + lineText.slice(bracketEnd)
          // Remplacer toute la ligne
          doc.replaceRange(newLine, { line: pos.line, ch: 0 }, { line: pos.line, ch: lineText.length })
          // Empêcher la sélection inutile
          evt.preventDefault()
        } catch (e) {
          // Aucun blocage si erreur
        }
      })

      // Indiquer visuellement la cliquabilité (curseur pointer) lorsque la souris survole une ligne de checklist
      const wrapper = mde.codemirror.getWrapperElement()
      mde.codemirror.on('mousemove', (cm, evt) => {
        try {
          const pos = cm.coordsChar({ left: evt.clientX, top: evt.clientY }, 'page')
          const lineText = cm.getDoc().getLine(pos.line) || ''
          const isChecklist = /^\s*(?:[-*+]|\d+\.)\s+\[( |x|X)\]\s*/.test(lineText)
          wrapper.style.cursor = isChecklist ? 'pointer' : 'text'
        } catch (e) {
          wrapper.style.cursor = 'text'
        }
      })
      wrapper.addEventListener('mouseleave', () => {
        wrapper.style.cursor = 'text'
      })

      mde.codemirror.on('change', () => {
        const value = mde.value() || ''
        emit('update:modelValue', value)
      })
    })

    watch(() => props.modelValue, (val) => {
      if (!mde) return
      const current = mde.value() || ''
      if (val !== current) {
        mde.value(val || '')
      }
    })

    onBeforeUnmount(() => {
      if (mde && mde.toTextArea) {
        mde.toTextArea()
        mde = null
      }
    })

    return { editorEl }
  }
}
</script>

<style scoped>
.rich-text-note-editor :deep(.EasyMDEContainer) {
  border: 1px solid var(--border-color);
  border-radius: 6px;
}
.rich-text-note-editor :deep(.editor-toolbar) {
  background: var(--bg-secondary);
}
.rich-text-note-editor :deep(.CodeMirror) {
  min-height: 160px;
}
</style>