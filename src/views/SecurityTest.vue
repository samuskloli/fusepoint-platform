<template>
  <div class="p-8 space-y-10 bg-gray-50 min-h-screen">
    <h1 class="text-2xl font-bold">Validation sécurité et rendu (sanitisation centralisée)</h1>

    <!-- Section AIWidget -->
    <section class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">AIWidget — balises autorisées: strong, em, code, br</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Contenu d'entrée</label>
          <textarea v-model="aiInput" rows="6" class="w-full border border-gray-300 rounded-md px-3 py-2"></textarea>
          <div class="mt-3 flex flex-wrap gap-2">
            <button class="px-3 py-1 bg-gray-100 rounded" @click="aiInput='**Gras** et *italique* avec `code`\nNouvelle ligne'">Exemple Markdown</button>
            <button class="px-3 py-1 bg-gray-100 rounded" @click="aiInput='<img src=x onerror=alert(1)>'">Payload img onerror</button>
            <button class="px-3 py-1 bg-gray-100 rounded" @click="aiInput='<script>alert(1)</script>'">Payload script</button>
            <button class="px-3 py-1 bg-gray-100 rounded" @click="aiInput='<a href=javascript:alert(1)>click</a>'">Lien javascript:</button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Sortie rendue (sanitisée)</label>
          <div class="border border-green-200 bg-green-50 rounded-md p-3" v-html="aiSanitized"></div>
          <p class="text-sm text-gray-500 mt-2">Attendu: seules les balises <strong>strong</strong>, <em>em</em>, <code>code</code> et <code>br</code> restent. Aucune exécution JS.</p>
        </div>
      </div>
    </section>

    <!-- Section MarketingChatBot -->
    <section class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">MarketingChatBot — balises autorisées: strong, em, code, br (aucun attribut)</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Contenu d'entrée</label>
          <textarea v-model="marketingInput" rows="6" class="w-full border border-gray-300 rounded-md px-3 py-2"></textarea>
          <div class="mt-3 flex flex-wrap gap-2">
            <button class="px-3 py-1 bg-gray-100 rounded" @click="marketingInput='**Promo** *italique* avec `code`\nNouvelle ligne'">Exemple Markdown</button>
            <button class="px-3 py-1 bg-gray-100 rounded" @click="marketingInput='<img src=x onerror=alert(1)>'">Payload img onerror</button>
            <button class="px-3 py-1 bg-gray-100 rounded" @click="marketingInput='<script>alert(1)</script>'">Payload script</button>
            <button class="px-3 py-1 bg-gray-100 rounded" @click="marketingInput='<a href=javascript:alert(1)>click</a>'">Lien javascript:</button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Sortie rendue (sanitisée)</label>
          <div class="border border-green-200 bg-green-50 rounded-md p-3" v-html="marketingSanitized"></div>
          <p class="text-sm text-gray-500 mt-2">Attendu: seules <strong>strong</strong>, <em>em</em>, <code>code</code> et <code>br</code> restent. Aucun attribut n'est conservé; aucune exécution JS.</p>
        </div>
      </div>
    </section>

    <!-- Section CommentsWidget -->
    <section class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">CommentsWidget — balises autorisées: span, a, br; attributs: href, target, rel, class</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Contenu d'entrée</label>
          <textarea v-model="commentsInput" rows="6" class="w-full border border-gray-300 rounded-md px-3 py-2"></textarea>
          <div class="mt-3 flex flex-wrap gap-2">
            <button class="px-3 py-1 bg-gray-100 rounded" @click="commentsInput='Bonjour @alice, voici un lien: https://example.com\nNouvelle ligne'">Exemple mention + lien</button>
            <button class="px-3 py-1 bg-gray-100 rounded" @click="commentsInput='<a href=javascript:alert(1) target=_blank>click</a>'">Lien javascript:</button>
            <button class="px-3 py-1 bg-gray-100 rounded" @click="commentsInput='<img src=x onerror=alert(1)>'">Payload img onerror</button>
            <button class="px-3 py-1 bg-gray-100 rounded" @click="commentsInput='<iframe src=https://evil.example></iframe>'">Payload iframe</button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Sortie rendue (sanitisée)</label>
          <div class="border border-green-200 bg-green-50 rounded-md p-3" v-html="commentsSanitized"></div>
          <p class="text-sm text-gray-500 mt-2">Attendu: les mentions deviennent <span class="mention">@alice</span>, les URLs sont en liens sûrs avec <code>rel="noopener noreferrer"</code>. Les scripts/iframes/images dangereuses sont supprimés.</p>
        </div>
      </div>
    </section>

    <!-- Section NotesWidget (checklist GFM) -->
    <section class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">NotesWidget — checklist Markdown (input autorisé + attributs nécessaires)</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Contenu d'entrée (Markdown)</label>
          <textarea v-model="notesInput" rows="6" class="w-full border border-gray-300 rounded-md px-3 py-2"></textarea>
          <div class="mt-3 flex flex-wrap gap-2">
            <button class="px-3 py-1 bg-gray-100 rounded" @click="notesInput='- [ ] Tâche à faire\n- [x] Tâche complétée'">Exemple checklist</button>
            <button class="px-3 py-1 bg-gray-100 rounded" @click="notesInput='<script>alert(1)</script>'">Payload script</button>
            <button class="px-3 py-1 bg-gray-100 rounded" @click="notesInput='![img](x onerror=alert(1))'">Image onerror via Markdown</button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Sortie rendue (sanitisée)</label>
          <div class="border border-green-200 bg-green-50 rounded-md p-3" v-html="notesSanitized"></div>
          <p class="text-sm text-gray-500 mt-2">Attendu: cases à cocher interactives rendues via <code>&lt;input type="checkbox" class="md-task-checkbox" data-task-index&gt;</code>. Aucune exécution JS.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { sanitizeBasic, sanitizeComments, sanitizeTasksInteractive } from '@/utils/sanitize'
import { marked } from 'marked'

export default {
  name: 'SecurityTest',
  setup() {
    // AIWidget — même logique que formatMessage
    const aiInput = ref('**Gras** et *italique* avec `code`\nNouvelle ligne')
    const aiSanitized = computed(() => {
      const html = String(aiInput.value || '')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>')
      return sanitizeBasic(html)
    })

    // MarketingChatBot — même logique que formatMessageContent
    const marketingInput = ref('**Promo** *italique* avec `code`\nNouvelle ligne')
    const marketingSanitized = computed(() => {
      const html = String(marketingInput.value || '')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>')
      return sanitizeBasic(html)
    })

    // CommentsWidget — même logique que formatCommentText
    const commentsInput = ref('Bonjour @alice, voici un lien: https://example.com\nNouvelle ligne')
    const commentsSanitized = computed(() => {
      let input = String(commentsInput.value ?? '')
      // mentions
      input = input.replace(/@([\w\-\.]+)/g, '<span class="mention">@$1</span>')
      // liens
      input = input.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="comment-link">$1</a>'
      )
      // sauts de ligne
      input = input.replace(/\n/g, '<br>')
      return sanitizeComments(input)
    })

    // NotesWidget — checklist Markdown avec input autorisé
    const notesInput = ref('- [ ] Tâche à faire\n- [x] Tâche complétée')
    const notesSanitized = computed(() => {
      marked.setOptions({ gfm: true, breaks: true })
      let taskIndex = 0
      const renderer = new marked.Renderer()
      renderer.listitem = (text, task, checked) => {
        const safeText = typeof text === 'string' ? text : String(text || '')
        if (task === true) {
          const idx = taskIndex++
          const checkbox = `<input type="checkbox" class="md-task-checkbox" data-task-index="${idx}" ${checked ? 'checked' : ''}>`
          return `<li class="task-list-item">${checkbox} ${safeText}</li>`
        }
        const m = safeText.match(/^\s*\[( |x|X)\]\s*(.*)$/)
        if (m) {
          const isChecked = m[1].toLowerCase() === 'x'
          const body = m[2]
          const idx = taskIndex++
          const checkbox = `<input type="checkbox" class="md-task-checkbox" data-task-index="${idx}" ${isChecked ? 'checked' : ''}>`
          return `<li class="task-list-item">${checkbox} ${body}</li>`
        }
        return `<li>${safeText}</li>`
      }
      let md = marked.parse(String(notesInput.value || ''), { renderer })
      if (typeof md === 'string' && md.includes('[object Object]')) {
        md = marked.parse(String(notesInput.value || ''), { renderer })
      }
      return sanitizeTasksInteractive(md)
    })

    return { aiInput, aiSanitized, marketingInput, marketingSanitized, commentsInput, commentsSanitized, notesInput, notesSanitized }
  }
}
</script>

<style scoped>
.mention { color: #2563eb; font-weight: 600; }
.comment-link { color: #1f2937; text-decoration: underline; }
.task-list-item { list-style: none; margin: 0.25rem 0; }
.md-task-checkbox { margin-right: 0.5rem; }
</style>