<template>
  <div class="file-grid-container">
    <div
      class="files-grid"
      role="grid"
      @keydown="onGridKeydown"
      ref="gridRef"
    >
      <div
        v-for="(file, idx) in files"
        :key="file.id"
        class="file-card group focus:outline-none"
        :class="{ selected: selectedIdsLocal.has(String(file.id)), folder: isFolder(file) }"
        role="gridcell"
        tabindex="0"
        :aria-selected="selectedIdsLocal.has(String(file.id)) ? 'true' : 'false'"
        @click="onTileClick($event, file, idx)"
        @dblclick="onTileDblClick(file)"
        @keydown="onTileKeydown($event, idx, file)"
        ref="tileRefs"
      >
        <div
          class="file-preview"
          :ref="el => observeVisibility(el, String(file.id))"
        >
          <template v-if="shouldShowThumbnail(file)">
            <div v-if="!loadedIds.has(String(file.id))" class="absolute inset-0 bg-gray-200 animate-pulse"></div>
            <img
              v-if="visibleIds.has(String(file.id)) && !errorIds.has(String(file.id)) && (((isImageFile(file) || isPdfFile(file)) && imgSrcMap[String(file.id)]) || (!isImageFile(file) && !isPdfFile(file) && getPreviewSrc(file)))"
              :src="imgSrcMap[String(file.id)] || getPreviewSrc(file)"
              :alt="file.name"
              class="preview-image"
              loading="lazy"
              @error="onThumbnailError(file)"
              @load="onThumbnailLoad(file)"
            />
          </template>
          <template v-else-if="forbiddenIds.has(String(file.id))">
            <div class="absolute inset-0 flex items-center justify-center bg-gray-100 text-red-600 text-sm font-medium">Accès refusé</div>
          </template>
          <template v-else-if="isFolder(file)">
            <i class="far fa-folder-open text-4xl text-blue-500"></i>
          </template>
          <template v-else>
            <i :class="getFileIcon(file.mime_type)" class="text-4xl text-gray-400"></i>
          </template>
        </div>
        <div class="overlay-actions">
          <button
            @click.stop="$emit('open', file)"
            class="action-btn"
            :title="'Prévisualiser'"
            v-if="!isFolder(file)"
          >
            <i class="fas fa-eye"></i>
          </button>
          <label class="select-checkbox">
            <input
              type="checkbox"
              :checked="selectedIdsLocal.has(String(file.id))"
              @change.stop="toggleSelection(file.id)"
            />
          </label>
        </div>
        <div class="file-info">
          <h5 class="file-name" :title="file.name">{{ file.name }}</h5>
          <div class="file-meta">
            <span v-if="!isFolder(file)" class="file-size">
              {{ formatFileSize(file.size) }}
            </span>
            <span class="file-date">
              {{ formatFileDate(file.updated_at) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import http from '@/services/api'
import type { FileItem } from '@/services/multiTenantService'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerPort = new Worker(pdfWorkerSrc, { type: 'module' })

const props = defineProps<{
  files: FileItem[],
  selectedIds?: Set<string> | Array<string | number>,
  tileMin?: number // min width per tile px
}>()

const emit = defineEmits<{
  (e: 'open', file: FileItem): void
  (e: 'update:selectedIds', ids: Set<string>): void
}>()

// Local selection mirrors parent
const selectedIdsLocal = ref<Set<string>>(new Set(
  Array.isArray(props.selectedIds)
    ? props.selectedIds.map(x => String(x))
    : (props.selectedIds instanceof Set ? Array.from(props.selectedIds) : [])
))

watch(() => props.selectedIds, (val) => {
  const ids = Array.isArray(val) ? val.map(String) : (val instanceof Set ? Array.from(val) : [])
  selectedIdsLocal.value = new Set(ids)
})

const gridRef = ref<HTMLElement | null>(null)
const tileRefs = ref<Array<HTMLElement | null>>([])
const focusedIndex = ref<number>(-1)
const lastSelectedIndex = ref<number | null>(null)

const isFolder = (file: any): boolean => {
  const t = file?.mime_type || file?.type || ''
  return typeof t === 'string' && (t === 'folder' || t === 'application/x-directory' || t.startsWith('inode/directory'))
}

const isImageFile = (file: FileItem): boolean => {
  if (!file) return false
  const f = file as any
  const mime = f.mime_type || f.type || ''
  if (mime && typeof mime === 'string' && mime.startsWith('image/')) return true
  const exts = ['jpg','jpeg','png','gif','bmp','svg','webp','avif','heic','heif','tif','tiff','ico','jfif']
  const extFrom = (s?: string) => s?.split('?')[0]?.split('#')[0]?.split('.').pop()?.toLowerCase()
  const candidateExts = [extFrom(file.name), extFrom(f.original_name), extFrom(f.url)].filter(Boolean) as string[]
  return candidateExts.some(e => exts.includes(e))
}

const isPdfFile = (file: FileItem): boolean => {
  if (!file) return false
  const f = file as any
  const mime = f.mime_type || f.type || ''
  if (mime === 'application/pdf') return true
  const ext = file.name?.split('?')[0]?.split('#')[0]?.split('.').pop()?.toLowerCase()
  return ext === 'pdf'
}

// Thumbnail and lazy-loading state
const visibleIds = ref<Set<string>>(new Set())
const loadedIds = ref<Set<string>>(new Set())
const errorIds = ref<Set<string>>(new Set())
const forbiddenIds = ref<Set<string>>(new Set())
const imgSrcMap = ref<Record<string, string>>({})
const signedExpiry = ref<Record<string, number>>({})
let io: IntersectionObserver | null = null

const toAbsoluteUrl = (u?: string): string => {
  if (!u) return ''
  try {
    if (u.startsWith('/uploads')) return u
    if (u.startsWith('data:') || /^https?:\/\//.test(u)) return u
    const base = (import.meta as any).env?.VITE_BACKEND_URL || (import.meta as any).env?.VITE_API_URL || (http as any)?.defaults?.baseURL || window.location.origin
    const normalized = u.startsWith('/') ? u : `/${u}`
    return new URL(normalized, base).href
  } catch {
    return u
  }
}

const buildThumbnailUrl = (file: FileItem, size: number = 256): string => {
  const id = String((file as any).id)
  const base = (import.meta as any).env?.VITE_BACKEND_URL || (import.meta as any).env?.VITE_API_URL || (http as any)?.defaults?.baseURL || window.location.origin
  const cleanBase = String(base || '').replace(/\/$/, '')
  return `${cleanBase}/api/thumbnails/${encodeURIComponent(id)}?size=${size}`
}

const shouldShowThumbnail = (file: FileItem): boolean => {
  if (isFolder(file)) return false
  const f = file as any
  if (errorIds.value.has(String(f.id))) return false
  // Show area for images immediately, and for PDFs to allow skeleton while generating
  return isImageFile(file) || isPdfFile(file) || !!f?.thumbnail || !!f?.preview_url
}

const getPreviewSrc = (file: FileItem): string => {
  if (isImageFile(file)) return ''
  if (isPdfFile(file)) return '' // will use generated imgSrcMap data URL when ready
  const f = file as any
  const src = f.thumbnail || f.preview_url || ''
  return toAbsoluteUrl(src)
}

const onThumbnailLoad = (file: FileItem): void => {
  loadedIds.value.add(String((file as any).id))
}

const onThumbnailError = async (file: FileItem): Promise<void> => {
  const id = String((file as any).id)
  if (imgSrcMap.value[id]) {
    errorIds.value.add(id)
    return
  }
  try {
    const resp = await http.post('/api/files/signed-url', { fileId: id, intent: 'thumbnail' })
    const url = resp.data?.url || resp.data?.data?.url
    const exp = resp.data?.expiresAt || resp.data?.data?.expiresAt
    if (url) {
      imgSrcMap.value[id] = url
      if (exp) signedExpiry.value[id] = new Date(exp).getTime()
    } else {
      errorIds.value.add(id)
    }
  } catch (e: any) {
    if (e?.response?.status === 403) {
      forbiddenIds.value.add(id)
      errorIds.value.add(id)
    } else {
      errorIds.value.add(id)
    }
  }
}

const headOk = async (url: string, id?: string): Promise<boolean> => {
  try {
    // Utilise le client Axios autorisé (injecte Bearer automatiquement + refresh sur 401)
    const resp = await http.head(url)
    const headerVal = (resp.headers?.['x-thumbnail-available'] ?? resp.headers?.['X-Thumbnail-Available'] ?? '').toString()
    return resp.status >= 200 && resp.status < 300 && headerVal === '1'
  } catch (err: any) {
    if (err?.response?.status === 403) {
      if (id) forbiddenIds.value.add(id)
      return false
    }
    // Fallback: certains serveurs ne gèrent pas HEAD → tenter un GET léger pour valider l'accès
    try {
      const getResp = await http.get(url, { responseType: 'blob' })
      return getResp.status >= 200 && getResp.status < 300
    } catch (e2: any) {
      if (e2?.response?.status === 403 && id) forbiddenIds.value.add(id)
      return false
    }
  }
}

const resolveThumbnailUrl = async (file: FileItem, size: number = 256): Promise<void> => {
  const id = String((file as any).id)
  if (!isImageFile(file)) return
  if (imgSrcMap.value[id]) return
  const url = buildThumbnailUrl(file, size)
  if (await headOk(url, id)) {
    imgSrcMap.value[id] = url
    return
  }
  try {
    const resp = await http.post('/api/files/signed-url', { fileId: id, intent: 'thumbnail' })
    const signed = resp.data?.url || resp.data?.data?.url
    const exp = resp.data?.expiresAt || resp.data?.data?.expiresAt
    if (signed) {
      imgSrcMap.value[id] = signed
      if (exp) signedExpiry.value[id] = new Date(exp).getTime()
    } else {
      errorIds.value.add(id)
    }
  } catch (e: any) {
    if (e?.response?.status === 403) {
      forbiddenIds.value.add(id)
      errorIds.value.add(id)
    } else {
      errorIds.value.add(id)
    }
  }
}

const maybeRefreshSignedUrl = async (id: string): Promise<void> => {
  const exp = signedExpiry.value[id]
  if (!exp) return
  const fiveMin = 5 * 60 * 1000
  if (Date.now() > exp - fiveMin) {
    try {
      const resp = await http.post('/api/files/signed-url', { fileId: id, intent: 'thumbnail' })
      const url = resp.data?.url || resp.data?.data?.url
      const newExp = resp.data?.expiresAt || resp.data?.data?.expiresAt
      if (url) {
        imgSrcMap.value[id] = url
        if (newExp) signedExpiry.value[id] = new Date(newExp).getTime()
      }
    } catch (e: any) {
      if (e?.response?.status === 403) {
        forbiddenIds.value.add(id)
        errorIds.value.add(id)
      }
    }
  }
}

const generatePdfThumbnail = async (file: FileItem, size: number = 256): Promise<void> => {
  const id = String((file as any).id)
  if (imgSrcMap.value[id]) return
  try {
    const srcUrl = toAbsoluteUrl((file as any).url)
    const loadingTask = (getDocument as any)({ url: srcUrl })
    const pdf = await loadingTask.promise
    const page = await pdf.getPage(1)
    const viewport0 = page.getViewport({ scale: 1 })
    const scale = size / Math.max(viewport0.width, viewport0.height)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    await page.render({ canvasContext: ctx as CanvasRenderingContext2D, viewport }).promise
    imgSrcMap.value[id] = canvas.toDataURL('image/png')
  } catch (e) {
    console.warn('PDF thumbnail generation failed', e)
    // Fallback to signed thumbnail endpoint (may still fail if server cannot render)
    await onThumbnailError(file)
  }
}

const observeVisibility = (el: any, id: string): void => {
  if (!id) return
  const elem: Element | null = el?.$el ? (el.$el as Element) : (el as Element | null)
  if (!elem) return
  if (!io) {
    io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const targetId = (entry.target as any).__fileId as string
        if (!targetId) return
        if (entry.isIntersecting) {
          visibleIds.value.add(targetId)
          maybeRefreshSignedUrl(targetId)
          // Resolve image src lazily when visible
          const file = props.files.find(f => String((f as any).id) === targetId)
          if (file) {
            if (isImageFile(file)) {
              resolveThumbnailUrl(file).catch(() => {})
            } else if (isPdfFile(file)) {
              generatePdfThumbnail(file).catch(() => {})
            }
          }
        }
      })
    }, { rootMargin: '200px' })
  }
  ;(elem as any).__fileId = id
  io.observe(elem)
}

const getFileIcon = (mimeType: string): string => {
  if (!mimeType) return 'far fa-file'
  if (mimeType.includes('pdf')) return 'far fa-file-pdf text-red-500'
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) return 'far fa-file-archive text-yellow-500'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'far fa-file-excel text-green-500'
  if (mimeType.includes('word') || mimeType.includes('document') || mimeType.includes('msword')) return 'far fa-file-word text-blue-500'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'far fa-file-powerpoint text-orange-500'
  if (mimeType.startsWith('image/')) return 'far fa-file-image text-purple-500'
  if (mimeType.startsWith('video/')) return 'far fa-file-video text-indigo-500'
  if (mimeType.startsWith('audio/')) return 'far fa-file-audio text-pink-500'
  return 'far fa-file text-gray-400'
}

const formatFileSize = (size: number): string => {
  if (!size && size !== 0) return '—'
  const units = ['o','Ko','Mo','Go','To']
  let idx = 0
  let s = size
  while (s >= 1024 && idx < units.length - 1) {
    s /= 1024
    idx++
  }
  return `${s.toFixed(s < 10 ? 1 : 0)} ${units[idx]}`
}

const formatFileDate = (dateStr?: string): string => {
  if (!dateStr) return '—'
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffInHours = Math.round(diffMs / (1000 * 60 * 60))
    if (diffInHours < 24) {
      const diffInMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)))
      return diffInMinutes < 60 ? `Il y a ${diffInMinutes} min` : `Il y a ${Math.round(diffInHours)} h`
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    }
  } catch {
    return '—'
  }
}

// Selection handling
const toggleSelection = (id: string | number, idx?: number, additive?: boolean): void => {
  const sid = String(id)
  const next = new Set(selectedIdsLocal.value)
  if (additive) {
    if (next.has(sid)) next.delete(sid)
    else next.add(sid)
  } else {
    // Single select
    if (next.has(sid) && next.size === 1) next.clear()
    else next.clear(), next.add(sid)
  }
  selectedIdsLocal.value = next
  emit('update:selectedIds', next)
  if (typeof idx === 'number') lastSelectedIndex.value = idx
}

const onTileClick = (e: MouseEvent, file: FileItem, idx: number): void => {
  const additive = e.metaKey || e.ctrlKey
  const range = e.shiftKey
  if (range && lastSelectedIndex.value !== null) {
    const [start, end] = [lastSelectedIndex.value, idx].sort((a,b) => a-b)
    const ids = new Set(selectedIdsLocal.value)
    for (let i = start; i <= end; i++) {
      const fid = String((props.files[i] as any).id)
      ids.add(fid)
    }
    selectedIdsLocal.value = ids
    emit('update:selectedIds', ids)
  } else {
    toggleSelection((file as any).id, idx, additive)
  }
}

const onTileDblClick = (file: FileItem): void => {
  emit('open', file)
}

const onTileKeydown = (e: KeyboardEvent, idx: number, file: FileItem): void => {
  if (e.key === 'Enter') {
    emit('open', file)
    e.preventDefault()
  } else if (e.key === ' ') {
    const additive = e.metaKey || e.ctrlKey
    toggleSelection((file as any).id, idx, additive)
    e.preventDefault()
  } else if (['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'].includes(e.key)) {
    e.stopPropagation()
    navigateFocus(e.key, idx)
  }
}

const navigateFocus = (key: string, idx: number): void => {
  const cols = computeColumns()
  let nextIdx = idx
  if (key === 'ArrowRight') nextIdx = Math.min(props.files.length - 1, idx + 1)
  else if (key === 'ArrowLeft') nextIdx = Math.max(0, idx - 1)
  else if (key === 'ArrowDown') nextIdx = Math.min(props.files.length - 1, idx + cols)
  else if (key === 'ArrowUp') nextIdx = Math.max(0, idx - cols)
  focusedIndex.value = nextIdx
  focusTile(nextIdx)
}

const computeColumns = (): number => {
  const el = gridRef.value
  if (!el) return 5
  const width = el.clientWidth
  const min = props.tileMin ?? 160
  return Math.max(1, Math.floor(width / min))
}

const focusTile = async (idx: number): Promise<void> => {
  await nextTick()
  const el = tileRefs.value[idx]
  if (el) el.focus()
}

const onGridKeydown = (e: KeyboardEvent): void => {
  if (focusedIndex.value < 0) return
  if (['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'].includes(e.key)) {
    e.preventDefault()
  }
}

onMounted(() => {
  window.addEventListener('resize', () => {
    // no-op for now; computeColumns reads width
  })
})

onUnmounted(() => {
  if (io) io.disconnect()
})
</script>

<style scoped>
.file-grid-container {
  display: block;
}
.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--tile-min, 160px), 1fr));
  gap: 1rem;
  width: 100%;
}
.file-card {
  position: relative;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: box-shadow 0.2s ease;
}
.file-card.selected {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}
.file-card:focus {
  outline: 2px solid #93c5fd;
  outline-offset: 2px;
}
.file-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  overflow: hidden;
}
.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.overlay-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
}
.action-btn {
  background: rgba(255,255,255,0.9);
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  color: #374151;
}
.action-btn:hover {
  background: white;
}
.select-checkbox input {
  width: 1rem;
  height: 1rem;
}
.file-info {
  margin-top: 0.5rem;
}
.file-name {
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-meta {
  font-size: 0.75rem;
  color: #6b7280;
  display: flex;
  gap: 0.5rem;
}
</style>