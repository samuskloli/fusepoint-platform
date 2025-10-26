<template>
  <div :class="['w-full flex items-center justify-center p-0 sm:p-6 relative', pageClass]" :style="{ minHeight: '100svh', minHeight2: '100dvh', ...pageStyle }">
    <div v-if="error" class="text-red-200 sm:text-red-600">{{ error }}</div>
    <div v-else-if="showLoader" class="text-gray-100 sm:text-gray-500">Chargement…</div>
    
    <!-- External: redirection effectuée, fallback -->
    <div v-else-if="lp && lp.type === 'external'" class="text-white sm:text-gray-700">
      Redirection en cours… <a :href="normalizeUrl(lp.external_url)" class="text-white underline sm:text-primary-600 sm:no-underline">cliquer ici</a>
    </div>

    <!-- Generated mini-page -->
    <div v-else-if="lp && lp.type === 'generated'" class="w-full max-w-[420px] sm:max-w-md mx-auto">
      <div :class="[cardClass, 'text-center']">
        <img v-if="(lp.logo_url || lp.publicOptions?.logo_url)" :src="lp.logo_url || lp.publicOptions?.logo_url" alt="logo" :class="['mx-auto h-16 w-16 object-cover mb-3', logoClass]" />
        <h1 class="text-xl font-semibold">{{ lp.name || lp.publicOptions?.title || lp.slug }}</h1>
        <p class="text-sm mt-1" :class="sloganClass">{{ sloganText }}</p>
        <div class="mt-6 space-y-3">
          <button
            v-for="b in links"
            :key="b.id || b.label"
            @click="handleClick(b)"
            :class="buttonClass"
          >
            {{ b.label }}
          </button>
          <!-- Bouton vCard -->
          <button
            v-if="vcardEnabled"
            @click="downloadVCard"
            :class="buttonClass"
          >
            <div class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
              </svg>
              <span class="text-sm">Ajouter à mes contacts</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else class="text-gray-100 sm:text-gray-600">Ce LinkPoint n'existe pas ou a été archivé.</div>

    <!-- Attribution footer (non-payant) -->
    <div v-if="showAttribution" :class="['absolute bottom-2 left-0 right-0 text-center text-[11px]', attributionClass]">
      propulsé par 
      <a href="https://www.fusepoint.ch" target="_blank" rel="noopener" class="underline">fusepoint</a>
      — rejoignez nous !
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const slug = route.params.slug

const lp = ref(null)
const links = ref([])
const loading = ref(false)
const error = ref('')
// Loader contrôlé côté UI
const showLoader = ref(false)

// Détection ultra-early via API dédiée (sans cookie)
const paidEarly = ref(false)

// Thème et attribution
const theme = computed(() => {
  const t = lp.value?.theme
  if (!t) return {}
  if (typeof t === 'string') { try { return JSON.parse(t) } catch { return {} } }
  return t || {}
})
const showAttribution = computed(() => !Boolean(theme.value?.branding_hide))
const attributionClass = computed(() => {
  const preset = theme.value?.preset || 'classic'
  return preset === 'bold' ? 'text-white/80' : 'text-gray-600'
})

// Background et styles
const pageClass = computed(() => {
  const preset = theme.value?.preset || 'classic'
  if (preset === 'bold') return 'bg-gradient-to-br from-indigo-600 to-purple-600'
  return 'bg-gray-50'
})
const pageStyle = computed(() => {
  const t = theme.value || {}
  const style = {}
  if (t.background_url) {
    style.backgroundImage = `url(${t.background_url})`
    style.backgroundSize = 'cover'
    style.backgroundPosition = 'center'
  } else if (t.background_color) {
    style.backgroundColor = t.background_color
  }
  return style
})

const sloganText = computed(() => theme.value?.slogan || 'Suivez, notez, contactez — en un scan.')
const sloganClass = computed(() => {
  const preset = theme.value?.preset || 'classic'
  return preset === 'bold' ? 'text-white/90' : 'text-gray-600'
})
const logoClass = computed(() => {
  const s = theme.value?.logo_style || 'circle'
  return s === 'square' ? 'rounded-md' : s === 'rounded' ? 'rounded-lg' : 'rounded-full'
})
const cardClass = computed(() => {
  const preset = theme.value?.preset || 'classic'
  return preset === 'bold' ? 'bg-white/10 backdrop-blur-md rounded-xl p-6 text-white shadow-xl' : 'bg-white rounded-xl p-6 shadow'
})
const buttonClass = computed(() => {
  const preset = theme.value?.preset || 'classic'
  return preset === 'bold' ? 'w-full bg-white/20 text-white rounded-lg py-2 hover:bg-white/30 transition-colors' : 'w-full bg-primary-600 text-white rounded-lg py-2 hover:bg-primary-700 transition-colors'
})

// vCard
const vcardEnabled = computed(() => Boolean(theme.value?.vcard_enabled))

const normalizeUrl = (u) => {
  if (!u) return '#'
  const hasProto = /^https?:\/\//i.test(u)
  return hasProto ? u : `https://${u}`
}

const handleClick = async (b) => {
  try {
    await axios.post(`/api/linkpoints/public/${slug}/click`, { link_id: b.id || null, url: b.url })
  } catch {}
  const u = normalizeUrl(b.url)
  window.open(u, '_blank', 'noopener')
}

const recordScan = async (s) => {
  try {
    await axios.post(`/api/linkpoints/public/${s}/scan`, { ua: navigator.userAgent })
  } catch (e) {
    console.error('Erreur enregistrement scan:', e)
  }
}

const tryLocalBackupFallback = async (s) => {
  try {
    const res = await axios.get(`/backup_redirects/${s}.json`)
    const bk = res?.data
    if (!bk) return false
    lp.value = {
      name: bk.publicOptions?.title || bk.slug,
      type: bk.type === 'external_url' ? 'external' : bk.type === 'links_hub' ? 'links' : 'generated',
      slug: bk.slug,
      logo_url: bk.publicOptions?.logo_url || null,
      external_url: bk.destination?.url || null,
      publicOptions: bk.publicOptions || null
    }
    links.value = Array.isArray(bk.destination)
      ? bk.destination.map((l, idx) => ({ id: idx + 1, label: l.label || 'Ouvrir', url: l.url }))
      : []
    return true
  } catch (e) {
    return false
  }
}

// Chargement (données principales)
const loadForSlug = async (s) => {
  loading.value = true
  error.value = ''

  try {
    const { data } = await axios.get(`/api/linkpoints/public/${s}`)
    lp.value = data.linkpoint
    links.value = data.links || []

    if (lp.value && lp.value.type === 'external' && lp.value.external_url) {
      try { await recordScan(s) } catch {}
      window.location.href = normalizeUrl(lp.value.external_url)
      return
    }

    await recordScan(s)
  } catch (e) {
    const ok = await tryLocalBackupFallback(s)
    if (!ok) {
      error.value = "Introuvable"
    }
  } finally {
    loading.value = false
    // Masquer le loader après le chargement pour toutes les entreprises
    // Le branding sera géré par showAttribution (footer) pour les non-payantes
    showLoader.value = false
  }
}

onMounted(async () => {
  // 1) Interroger le statut payant ultra-early
  try {
    const res = await axios.get(`/api/linkpoints/public/${slug}/paid`)
    paidEarly.value = Boolean(res?.data?.paid)
  } catch {
    paidEarly.value = false
  }
  // 2) Activer le loader immédiatement si gratuit
  showLoader.value = !paidEarly.value
  // 3) Charger les données principales
  await loadForSlug(slug)
})
watch(() => route.params.slug, async (newSlug, oldSlug) => {
  if (newSlug !== oldSlug) {
    // Réévaluer le statut payant et UI au changement de slug
    try {
      const res = await axios.get(`/api/linkpoints/public/${newSlug}/paid`)
      paidEarly.value = Boolean(res?.data?.paid)
    } catch { paidEarly.value = false }
    showLoader.value = !paidEarly.value
    await loadForSlug(newSlug)
  }
})
</script>