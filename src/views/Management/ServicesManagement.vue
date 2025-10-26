<template>
  <Layout>
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">{{ $t('servicesManagement.title') }}</h1>
          <p class="text-gray-600">{{ $t('servicesManagement.subtitle') }}</p>
        </div>
        <button 
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          @click="openCreate()"
        >
          {{ $t('servicesManagement.addService') }}
        </button>
      </div>

      <!-- Liste des services -->
      <div v-if="loading" class="text-gray-500">{{ $t('servicesManagement.loading') }}</div>
      <div v-else>
        <div v-if="services.length === 0" class="text-gray-600">{{ $t('servicesManagement.empty') }}</div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="svc in services" 
            :key="svc.id" 
            class="bg-white rounded-lg shadow p-5 border border-gray-200 overflow-hidden"
          >
            <div class="flex flex-col gap-2 mb-3">
              <div class="flex items-center min-w-0">
                <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3 shrink-0">
                  <component :is="getIconComponent(svc.icon)" class="w-6 h-6 text-gray-600" />
                </div>
                <div class="min-w-0">
                  <div class="text-lg font-medium text-gray-900 md:truncate" :title="svc.name">{{ svc.name }}</div>
                  <div class="text-sm text-gray-500 md:truncate" :title="translateCategory(svc.category) || $t('servicesManagement.noCategory')">{{ translateCategory(svc.category) || $t('servicesManagement.noCategory') }}</div>
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <span :class="svc.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="text-xs px-2 py-1 rounded-full">
                  {{ svc.is_active ? $t('servicesManagement.badges.visible') : $t('servicesManagement.badges.hidden') }}
                </span>
                <span :class="svc.is_available ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'" class="text-xs px-2 py-1 rounded-full">
                  {{ svc.is_available ? $t('servicesManagement.badges.available') : $t('servicesManagement.badges.unavailable') }}
                </span>
              </div>
            </div>

            <p class="text-gray-700 text-sm mb-3 break-words md:clamp-3" v-if="svc.description">{{ svc.description }}</p>

            <div class="text-sm text-gray-600 space-y-1 mb-4">
              <div v-if="svc.price_type || svc.base_price">
                <span class="font-medium">{{ $t('servicesManagement.pricing.label') }}</span>
                <span>
                  {{ translatePriceType(svc.price_type) }}
                  <template v-if="svc.base_price"> • {{ formatCurrency(svc.base_price) }}</template>
                </span>
              </div>
              <div v-if="svc.duration_estimate">
                <span class="font-medium">{{ $t('servicesManagement.duration.label') }}</span>
                <span>{{ svc.duration_estimate }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-center gap-2 flex-wrap w-full">
                  <button
                    class="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                    @click="toggleVisibility(svc)"
                    :disabled="saving"
                  >
                    {{ svc.is_active ? $t('servicesManagement.actions.deactivateCard') : $t('servicesManagement.actions.activateCard') }}
                  </button>
                  <button
                    class="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                    @click="toggleAvailability(svc)"
                    :disabled="saving"
                  >
                    {{ svc.is_available ? $t('servicesManagement.actions.makeUnavailable') : $t('servicesManagement.actions.makeAvailable') }}
                  </button>
                </div>
                <div class="flex items-center gap-4 w-full sm:w-auto justify-start sm:justify-end">
                  <button class="text-blue-600 hover:text-blue-800 text-sm" @click="openEdit(svc)">{{ $t('servicesManagement.actions.edit') }}</button>
                  <button class="text-red-600 hover:text-red-800 text-sm" @click="confirmDelete(svc)">{{ $t('servicesManagement.actions.delete') }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulaire modal -->
      <div v-if="showForm" class="fixed inset-0 z-50 sm:bg-black sm:bg-opacity-30 sm:flex sm:items-center sm:justify-center">
        <div class="bg-white w-full h-[100dvh] sm:h-auto sm:relative sm:shadow-xl sm:max-w-2xl sm:mx-0 rounded-none sm:rounded-lg sm:max-h-[90vh] flex flex-col">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
            <h2 class="text-xl font-semibold">{{ isEditing ? $t('servicesManagement.modal.title.edit') : $t('servicesManagement.modal.title.create') }}</h2>
            <button class="text-gray-500 hover:text-gray-700" @click="closeForm">✕</button>
          </div>
          <div class="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 pb-24">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-700 mb-1">{{ $t('servicesManagement.form.name') }}</label>
                <input v-model="form.name" type="text" class="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm text-gray-700 mb-1">{{ $t('servicesManagement.form.category') }}</label>
                <select v-model="categorySelect" class="w-full border rounded px-3 py-2">
                  <option value="">—</option>
                  <option v-for="opt in categoryOptions" :key="opt" :value="opt">{{ translateCategory(opt) }}</option>
                  <option value="__add_new__">{{ $t('servicesManagement.form.addCategory') }}</option>
                </select>
                <div v-if="categorySelect === '__add_new__'" class="mt-2">
                  <label class="block text-sm text-gray-700 mb-1">{{ $t('servicesManagement.form.newCategory') }}</label>
                  <input v-model="newCategory" type="text" class="w-full border rounded px-3 py-2" :placeholder="$t('servicesManagement.form.newCategoryPlaceholder')" />
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm text-gray-700 mb-1">{{ $t('servicesManagement.form.description') }}</label>
              <textarea v-model="form.description" rows="3" class="w-full border rounded px-3 py-2"></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm text-gray-700 mb-1">{{ $t('servicesManagement.form.priceType') }}</label>
                <select v-model="form.price_type" class="w-full border rounded px-3 py-2">
                  <option value="">—</option>
                  <option value="fixed">{{ $t('servicesManagement.pricing.type.fixed') }}</option>
                  <option value="hourly">{{ $t('servicesManagement.pricing.type.hourly') }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm text-gray-700 mb-1">{{ $t('servicesManagement.form.basePrice') }}</label>
                <input v-model.number="form.base_price" type="number" step="0.01" class="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm text-gray-700 mb-1">{{ $t('servicesManagement.form.displayOrder') }}</label>
                <input v-model.number="form.display_order" type="number" class="w-full border rounded px-3 py-2" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-700 mb-1">{{ $t('servicesManagement.form.durationEstimate') }}</label>
                <input v-model="form.duration_estimate" type="text" :placeholder="$t('servicesManagement.form.durationEstimatePlaceholder')" class="w-full border rounded px-3 py-2" />
              </div>
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                  <input id="is_active" v-model="form.is_active" type="checkbox" />
                  <label for="is_active" class="text-sm text-gray-700">{{ $t('servicesManagement.form.isActive') }}</label>
                </div>
                <div class="flex items-center gap-2">
                  <input id="is_available" v-model="form.is_available" type="checkbox" />
                  <label for="is_available" class="text-sm text-gray-700">{{ $t('servicesManagement.form.isAvailable') }}</label>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-700 mb-1">{{ $t('servicesManagement.form.deliverables') }}</label>
                <input v-model="deliverablesInput" type="text" class="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm text-gray-700 mb-1">{{ $t('servicesManagement.form.requirements') }}</label>
                <input v-model="requirementsInput" type="text" class="w-full border rounded px-3 py-2" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-700 mb-1">{{ $t('servicesManagement.form.icon') }}</label>
                <input v-model="form.icon" type="text" placeholder="ex: chart-bar" class="w-full border rounded px-3 py-2" />
                <div class="mt-2">
                  <label class="block text-xs text-gray-600 mb-1">{{ $t('servicesManagement.form.iconSelect') }}</label>
                  <div class="grid grid-cols-5 sm:grid-cols-6 gap-2">
                    <button
                      v-for="opt in iconOptions"
                      :key="opt.value"
                      type="button"
                      class="border rounded-md p-3 sm:p-2 flex items-center justify-center hover:bg-gray-50"
                      :class="form.icon === opt.value ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'"
                      @click="form.icon = opt.value"
                    >
                      <component :is="opt.component" class="w-6 h-6" :class="form.icon === opt.value ? 'text-blue-600' : 'text-gray-600'" />
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label class="block text-sm text-gray-700 mb-1">{{ $t('servicesManagement.form.color') }}</label>
                <!-- Sélecteur visuel de couleurs -->
                <div class="mt-1">
                  <div class="grid grid-cols-6 gap-2">
                    <button
                      v-for="c in colorOptions"
                      :key="c"
                      type="button"
                      class="h-8 rounded-md border hover:opacity-90"
                      :class="[colorClassMap[c], form.color === c ? 'ring-2 ring-blue-300 border-blue-500' : 'border-transparent']"
                      @click="form.color = c"
                      :aria-label="t('servicesManagement.colorPicker.aria', { color: c })"
                    />
                  </div>
                  <div class="mt-2 flex items-center gap-2">
                    <span class="text-xs text-gray-600">{{ $t('servicesManagement.preview.label') }}</span>
                    <div class="w-8 h-8 rounded-md flex items-center justify-center" :class="colorClassMap[form.color]">
                      <component :is="getIconComponent(form.icon)" class="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 sm:sticky sm:bottom-0" style="padding-bottom: env(safe-area-inset-bottom)">
              <button class="px-4 py-2 rounded border" @click="closeForm">{{ $t('servicesManagement.modal.cancel') }}</button>
              <button class="px-4 py-2 rounded bg-blue-600 text-white" @click="submitForm" :disabled="saving">
                {{ saving ? $t('servicesManagement.modal.saving') : (isEditing ? $t('servicesManagement.modal.save.update') : $t('servicesManagement.modal.save.create')) }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
import { ref, onMounted, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import Layout from '../../components/Layout.vue'
import accompagnementService from '../../services/accompagnementService'
import { 
  ChartBarIcon, 
  MegaphoneIcon, 
  LightBulbIcon, 
  CogIcon,
  PresentationChartLineIcon,
  UserGroupIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'ServicesManagement',
  components: { Layout },
  setup() {
    const { t, te } = useI18n()
    const formatCurrency = inject('formatCurrency') || ((v) => `${Number(v || 0).toFixed(2)} €`)
    const services = ref([])
    const loading = ref(true)
    const saving = ref(false)

    const showForm = ref(false)
    const isEditing = ref(false)
    const currentId = ref(null)
    const errorMsg = ref('')

    const form = ref({
      name: '',
      description: '',
      category: '',
      price_type: '',
      base_price: null,
      duration_estimate: '',
      deliverables: [],
      requirements: [],
      is_active: true,
      is_available: true,
      display_order: 0,
      icon: '',
      color: 'blue'
    })

    const deliverablesInput = ref('')
    const requirementsInput = ref('')
    // Catégorie: options calculées et saisie nouvelle
    const categoryOptions = ref([])
    const categorySelect = ref('')
    const newCategory = ref('')

    const normalizeKey = (val) => (val || '')
      .toString()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()
      .replace(/[\s_\/]+/g, '-')
    const translateCategory = (val) => {
      const key = normalizeKey(val)
      const catPath = `categories.${key}`
      const tplPath = `projectTemplates.categories.${key}`
      if (te(catPath)) return t(catPath)
      if (te(tplPath)) return t(tplPath)
      // Heuristique basée sur mots-clés pour couvrir les libellés composés
      const raw = (val || '').toString().toLowerCase()
      const has = (token) => raw.includes(token)
      if (has('social')) return t('categories.social')
      if (has('seo') && has('sea')) return `${t('categories.seo')} / ${t('categories.sea')}`
      if (has('seo')) return t('categories.seo')
      if (has('sea')) return t('categories.sea')
      if (has('ads') || has('advertising') || has('ad')) return t('categories.ads')
      if (has('email')) return t('categories.email')
      if (has('content') || has('copy')) return t('categories.content')
      if (has('brand')) return t('categories.branding')
      if (has('website') || has('site') || has('web')) return t('categories.website')
      if (has('design') || has('ui') || has('ux')) return t('categories.design')
      if (has('marketing')) return t('categories.marketing')
      if (has('development') || has('dev')) return t('categories.development')
      if (has('analytics') || has('analysis')) return t('categories.analytics')
      if (has('communication')) return t('categories.communication')
      if (has('productivity')) return t('categories.productivity')
      if (has('strategy') || has('strategies')) return t('categories.strategy')
      if (has('technical') || has('tech')) return t('categories.technical')
      if (has('creation') || has('création')) return t('categories.creation')
      // Essai sur catégories composées: traduire chaque token séparé
      const tokens = raw.split(/[\s\/,&-]+/).filter(Boolean)
      const translateToken = (tok) => {
        const k = normalizeKey(tok)
        const p1 = `categories.${k}`
        const p2 = `projectTemplates.categories.${k}`
        if (te(p1)) return t(p1)
        if (te(p2)) return t(p2)
        if (k.includes('seo') && k.includes('sea')) return `${t('categories.seo')} / ${t('categories.sea')}`
        if (k.includes('seo')) return t('categories.seo')
        if (k.includes('sea')) return t('categories.sea')
        if (k.includes('ads') || k.includes('advertising') || k === 'ad') return t('categories.ads')
        if (k.includes('email')) return t('categories.email')
        if (k.includes('content') || k.includes('copy')) return t('categories.content')
        if (k.includes('brand')) return t('categories.branding')
        if (k.includes('website') || k === 'site' || k === 'web') return t('categories.website')
        if (k.includes('design') || k === 'ui' || k === 'ux') return t('categories.design')
        if (k.includes('marketing')) return t('categories.marketing')
        if (k.includes('development') || k === 'dev') return t('categories.development')
        if (k.includes('analytics') || k.includes('analysis')) return t('categories.analytics')
        if (k.includes('communication')) return t('categories.communication')
        if (k.includes('productivity')) return t('categories.productivity')
        if (k.includes('strategy')) return t('categories.strategy')
        if (k.includes('technical') || k === 'tech') return t('categories.technical')
        if (k.includes('creation') || k.includes('crea')) return t('categories.creation')
        return null
      }
      const parts = tokens.map(translateToken).filter(Boolean)
      if (parts.length) return parts.join(' / ')
      // Dernier fallback: valeur brute ou libellé "Sans catégorie"
      return val || t('servicesManagement.noCategory')
    }
    const translatePriceType = (val) => {
      const key = normalizeKey(val)
      const path = `servicesManagement.pricing.type.${key}`
      return te(path) ? t(path) : (val || '—')
    }
    // Palette de couleurs et mappage des classes Tailwind
    const colorOptions = ['blue', 'green', 'purple', 'orange', 'red', 'indigo']
    const colorClassMap = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      indigo: 'bg-indigo-500'
    }

    const iconOptions = [
      { value: 'chart-bar', component: ChartBarIcon },
      { value: 'megaphone', component: MegaphoneIcon },
      { value: 'light-bulb', component: LightBulbIcon },
      { value: 'cog', component: CogIcon },
      { value: 'presentation-chart-line', component: PresentationChartLineIcon },
      { value: 'user-group', component: UserGroupIcon },
      { value: 'document-text', component: DocumentTextIcon },
      { value: 'academic-cap', component: AcademicCapIcon },
      { value: 'arrow-trending-up', component: ArrowTrendingUpIcon }
    ]

    const iconMap = iconOptions.reduce((acc, o) => { acc[o.value] = o.component; return acc }, {})
    const getIconComponent = (key) => iconMap[key] || ChartBarIcon

    const loadServices = async () => {
      loading.value = true
      try {
        const resp = await accompagnementService.getServices({ activeOnly: false })
        services.value = resp.data || resp || []
        // calcul des catégories existantes
        const cats = Array.from(new Set((services.value || [])
          .map(s => s.category)
          .filter(c => !!c && typeof c === 'string')
          .map(c => c.trim())
          .filter(Boolean)
        )).sort((a, b) => a.localeCompare(b))
        categoryOptions.value = cats
      } catch (e) {
        console.error(e)
      } finally {
        loading.value = false
      }
    }

    // Toggle visibilité (afficher/masquer la carte)
    const toggleVisibility = async (svc) => {
      try {
        saving.value = true
        const newStatus = svc.is_active ? 0 : 1
        await accompagnementService.updateService(svc.id, { is_active: newStatus })
        await loadServices()
      } catch (e) {
        console.error('Erreur bascule visibilité:', e)
        errorMsg.value = e.response?.data?.message || t('servicesManagement.errors.visibilityToggle')
      } finally {
        saving.value = false
      }
    }

    // Toggle disponibilité (réservable ou non)
    const toggleAvailability = async (svc) => {
      try {
        saving.value = true
        const newAvail = svc.is_available ? 0 : 1
        await accompagnementService.updateService(svc.id, { is_available: newAvail })
        await loadServices()
      } catch (e) {
        console.error('Erreur bascule disponibilité:', e)
        errorMsg.value = e.response?.data?.message || t('servicesManagement.errors.availabilityToggle')
      } finally {
        saving.value = false
      }
    }

    const openCreate = () => {
      isEditing.value = false
      currentId.value = null
      errorMsg.value = ''
      form.value = {
        name: '', description: '', category: '', price_type: '', base_price: null,
        duration_estimate: '', deliverables: [], requirements: [], is_active: true, is_available: true,
        display_order: 0, icon: '', color: ''
      }
      deliverablesInput.value = ''
      requirementsInput.value = ''
      // reset catégories
      categorySelect.value = ''
      newCategory.value = ''
      showForm.value = true
    }

    const openEdit = (svc) => {
      isEditing.value = true
      currentId.value = svc.id
      errorMsg.value = ''
      form.value = {
        name: svc.name || '',
        description: svc.description || '',
        category: svc.category || '',
        price_type: svc.price_type || '',
        base_price: svc.base_price ?? null,
        duration_estimate: svc.duration_estimate || '',
        deliverables: Array.isArray(svc.deliverables) ? svc.deliverables : (safeJsonArray(svc.deliverables)),
        requirements: Array.isArray(svc.requirements) ? svc.requirements : (safeJsonArray(svc.requirements)),
        is_active: !!svc.is_active,
        is_available: svc.is_available === undefined ? true : !!svc.is_available,
        display_order: svc.display_order ?? 0,
        icon: svc.icon || '',
        color: svc.color || ''
      }
      deliverablesInput.value = form.value.deliverables.join(', ')
      requirementsInput.value = form.value.requirements.join(', ')
      // catégories
      categorySelect.value = svc.category || ''
      newCategory.value = ''
      showForm.value = true
    }

    const safeJsonArray = (val) => {
      try {
        const v = typeof val === 'string' ? JSON.parse(val || '[]') : (val || [])
        return Array.isArray(v) ? v : []
      } catch {
        return []
      }
    }

    const closeForm = () => {
      showForm.value = false
    }

    const submitForm = async () => {
      errorMsg.value = ''
      if (!form.value.name) {
        errorMsg.value = t('servicesManagement.errors.nameRequired')
        return
      }
      saving.value = true
      try {
        // synchroniser inputs textes
        form.value.deliverables = splitCommaList(deliverablesInput.value)
        form.value.requirements = splitCommaList(requirementsInput.value)

        // définir la catégorie depuis le sélecteur
        const selectedCat = categorySelect.value === '__add_new__' 
          ? (newCategory.value || '').trim() 
          : (categorySelect.value || '')
        if (categorySelect.value === '__add_new__' && !selectedCat) {
          errorMsg.value = t('servicesManagement.errors.newCategoryRequired')
          saving.value = false
          return
        }
        form.value.category = selectedCat || null

        if (isEditing.value && currentId.value) {
          await accompagnementService.updateService(currentId.value, toPayload(form.value))
        } else {
          await accompagnementService.createService(toPayload(form.value))
        }
        await loadServices()
        showForm.value = false
      } catch (e) {
        console.error(e)
        errorMsg.value = e.response?.data?.message || t('servicesManagement.errors.saveError')
      } finally {
        saving.value = false
      }
    }

    const toPayload = (obj) => ({
      name: obj.name,
      description: obj.description || null,
      category: obj.category || null,
      price_type: obj.price_type || null,
      base_price: obj.base_price ?? null,
      duration_estimate: obj.duration_estimate || null,
      deliverables: obj.deliverables || [],
      requirements: obj.requirements || [],
      is_active: obj.is_active ? 1 : 0,
      is_available: obj.is_available ? 1 : 0,
      display_order: obj.display_order ?? 0,
      icon: obj.icon || null,
      color: obj.color || null
    })

    const splitCommaList = (s) => (s || '').split(',').map(v => v.trim()).filter(Boolean)

    const confirmDelete = async (svc) => {
      if (!confirm(t('servicesManagement.delete.confirm', { name: svc.name }))) return
      try {
        await accompagnementService.deleteService(svc.id)
        await loadServices()
      } catch (e) {
        console.error(e)
        alert(e.response?.data?.message || t('servicesManagement.delete.error'))
      }
    }

    onMounted(loadServices)

    return {
      services, loading, formatCurrency,
      showForm, isEditing, form, deliverablesInput, requirementsInput,
      openCreate, openEdit, closeForm, submitForm, saving, errorMsg,
      confirmDelete,
      iconOptions, getIconComponent,
      colorOptions, colorClassMap,
      toggleVisibility, toggleAvailability,
      categoryOptions, categorySelect, newCategory,
      t, te, translateCategory, translatePriceType
    }
  }
}
</script>

<style scoped>
@media (min-width: 768px) {
  .md\:clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
</style>