<template>
  <div v-if="visible" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="emitClose">
    <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-lg bg-white">
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">
          {{ t('widgets.files.preview') }} — {{ file?.name }}
        </h3>
        <div class="flex items-center gap-2">
          <button v-if="allowShare" @click="emitShare" class="text-gray-600 hover:text-gray-800" :title="t('widgets.files.share')">
            <i class="fas fa-share"></i>
          </button>
          <button v-if="allowDownload" @click="emitDownload" class="text-gray-600 hover:text-gray-800" :title="t('widgets.files.download')">
            <i class="fas fa-download"></i>
          </button>
          <button v-if="allowDelete" @click="emitDelete" class="text-red-600 hover:text-red-800" :title="t('widgets.files.delete')">
            <i class="fas fa-trash"></i>
          </button>
          <button @click="emitClose" class="text-gray-400 hover:text-gray-600" :title="t('common.close')">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
      </div>
      <div class="mt-4">
        <div v-if="isImage" class="flex justify-center">
          <img :src="displaySrc" :alt="file?.name" class="max-h-[70vh] object-contain rounded" @error="onError" />
        </div>
        <div v-else-if="isVideo" class="flex justify-center">
          <video :src="displaySrc" controls class="w-full max-h-[70vh] rounded" />
        </div>
        <div v-else-if="isPDF" class="w-full">
          <iframe :src="displaySrc" class="w-full h-[70vh]" />
        </div>
        <div v-else class="w-full">
          <iframe :src="displaySrc" class="w-full h-[70vh]" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useTranslation } from '@/composables/useTranslation'
import type { FileItem } from '@/services/multiTenantService'
import { useMultiTenantApi } from '@/services/multiTenantService'
import http from '@/services/api'

const props = defineProps<{
  file: FileItem | null
  visible: boolean
  allowDownload?: boolean
  allowShare?: boolean
  allowDelete?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'download'): void
  (e: 'share'): void
  (e: 'delete'): void
}>()

const { t } = useTranslation()
const api = useMultiTenantApi()

const mime = computed(() => props.file?.mime_type || (props.file as any)?.type || '')
const isImage = computed(() => !!mime.value && mime.value.startsWith('image/'))
const isVideo = computed(() => !!mime.value && mime.value.startsWith('video/'))
const isPDF = computed(() => mime.value === 'application/pdf')

// Stocke une data: URL générée à partir d'un Blob (compatible CSP)
const dataUrl = ref<string>('')
const signedUrl = ref<string>('')

const toAbsoluteUrl = (url?: string | null): string => {
  const u = (url || '').toString()
  if (!u) return ''
  // Recognize signed token like "<base64url>.<hex>" and wrap into API path
  const tokenPattern = /^[A-Za-z0-9_-]+\.[0-9a-f]{64}$/
  if (tokenPattern.test(u)) return `/api/files/signed/${u}`
  // Laisser les URLs absolues et les chemins relatifs racine tels quels
  if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/')) return u
  // Normaliser sans / initial
  return `/${u}`
}

// Choix de la source d'affichage selon le type MIME et la CSP serveur:
// - Images: autorisées en data: par la CSP actuelle → privilégier dataUrl
// - Vidéos/PDF: data: n'est PAS autorisé (pas de media-src/data ni frame-src/data) → utiliser URL signée ou URL "self"
const displaySrc = computed(() => {
  const direct = (props.file as any)?.preview_url || props.file?.url || (props.file as any)?.thumbnail || ''
  const absolute = toAbsoluteUrl(direct)
  if (isImage.value) {
    return dataUrl.value || signedUrl.value || absolute
  }
  // Pour vidéo/PDF/autres, éviter data: pour respecter la CSP stricte côté serveur
  return signedUrl.value || absolute
})

const setDataUrlFromBlob = async (blob: Blob) => {
  // Convertir le Blob en data: URL (CSP friendly)
  try {
    const { blobToDataURL } = await import('@/utils/blob')
    dataUrl.value = await blobToDataURL(blob)
  } catch (e) {
    console.warn('Conversion blob→data: échouée, prévisualisation indisponible:', e)
    dataUrl.value = ''
  }
}

const loadPreviewBlob = async () => {
  try {
    if (!props.file?.id) return
    const blob = await api.downloadFile(Number(props.file.id))
    if (blob) {
      setDataUrlFromBlob(blob)
    }
  } catch (e) {
    console.warn('Prévisualisation blob non disponible:', e)
  }
}

const loadSignedUrl = async () => {
  try {
    if (!props.file?.id) return
    const resp = await http.post('/api/files/signed-url', { fileId: String(props.file.id), intent: 'preview' })
    const url = resp.data?.url || resp.data?.data?.url
    if (url) signedUrl.value = url
  } catch (e: any) {
    // Ne bloque pas l'aperçu si l'URL signée échoue
    if (e?.response?.status === 403) {
      console.warn('Accès interdit pour URL signée de prévisualisation')
    } else {
      console.warn('Erreur URL signée de prévisualisation:', e)
    }
  }
}

const emitClose = () => emit('close')
const emitDownload = () => emit('download')
const emitShare = () => emit('share')
const emitDelete = () => emit('delete')

const onError = async () => {
  // Si l'URL directe échoue, tenter d'abord une URL signée puis un blob
  if (!signedUrl.value) {
    await loadSignedUrl()
  }
  if (!dataUrl.value) {
    await loadPreviewBlob()
  }
}

watch(() => props.visible, (v) => {
  if (v) {
    // Précharger le blob UNIQUEMENT pour les images (CSP autorise img-src data:)
    if (props.file && isImage.value) {
      loadPreviewBlob()
    }
    // Préparer un fallback via URL signée pour tous les types
    if (props.file) {
      loadSignedUrl()
    }
  } else if (!v && (dataUrl.value || signedUrl.value)) {
    // Nettoyer les URLs temporaires
    dataUrl.value = ''
    signedUrl.value = ''
  }
})

watch(() => props.file?.id, () => {
  if (props.visible) {
    dataUrl.value = ''
    signedUrl.value = ''
    // Blob → data: seulement pour images
    if (props.file && isImage.value) {
      loadPreviewBlob()
    }
    if (props.file) {
      loadSignedUrl()
    }
  }
})

onUnmounted(() => {
  // Rien à révoquer pour une data: URL
})
</script>