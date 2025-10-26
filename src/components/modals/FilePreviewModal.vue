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

const blobUrl = ref<string>('')
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

const displaySrc = computed(() => {
  const direct = (props.file as any)?.preview_url || props.file?.url || (props.file as any)?.thumbnail || ''
  return blobUrl.value || signedUrl.value || toAbsoluteUrl(direct)
})

const createBlobUrl = (blob: Blob) => {
  // Nettoyer l'ancien blob URL si présent
  if (blobUrl.value) {
    URL.revokeObjectURL(blobUrl.value)
  }
  blobUrl.value = URL.createObjectURL(blob)
}

const loadPreviewBlob = async () => {
  try {
    if (!props.file?.id) return
    const blob = await api.downloadFile(Number(props.file.id))
    if (blob) {
      createBlobUrl(blob)
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
  if (!blobUrl.value) {
    await loadPreviewBlob()
  }
}

watch(() => props.visible, (v) => {
  if (v) {
    // Précharger le blob pour PDF/vidéos/images (affichage plus fiable)
    if (props.file && (isImage.value || isVideo.value || isPDF.value)) {
      loadPreviewBlob()
    }
    // Préparer un fallback via URL signée si nécessaire
    if (props.file) {
      loadSignedUrl()
    }
  } else if (!v && blobUrl.value) {
    URL.revokeObjectURL(blobUrl.value)
    blobUrl.value = ''
    signedUrl.value = ''
  }
})

watch(() => props.file?.id, () => {
  if (props.visible) {
    blobUrl.value = ''
    signedUrl.value = ''
    if (props.file && (isImage.value || isVideo.value || isPDF.value)) {
      loadPreviewBlob()
    }
    if (props.file) {
      loadSignedUrl()
    }
  }
})

onUnmounted(() => {
  if (blobUrl.value) URL.revokeObjectURL(blobUrl.value)
})
</script>