<template>
  <div class="widget-card" :class="{ featured: widget.featured, installed: isInstalled }">
    <!-- Featured Badge -->
    <div v-if="widget.featured" class="featured-badge">
      <i class="fas fa-star"></i>
      {{ tt('widgets.marketplace.featured', 'Recommandé') }}
    </div>

    <!-- Installed Badge -->
    <div v-if="isInstalled" class="installed-badge">
      <i class="fas fa-check"></i>
      {{ tt('widgets.marketplace.installed', 'Installé') }}
    </div>

    <!-- Widget Icon/Screenshot -->
    <div class="widget-visual" @click="$emit('view-details', widget)">
      <div v-if="widget.screenshot" class="widget-screenshot">
        <img :src="widget.screenshot" :alt="widget.name" />
        <div class="screenshot-overlay">
          <i class="fas fa-eye"></i>
          {{ tt('widgets.marketplace.preview', 'Aperçu') }}
        </div>
      </div>
      <div v-else class="widget-icon-container">
        <div class="widget-icon" :style="{ background: widget.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }">
          <i :class="widget.icon || 'fas fa-puzzle-piece'"></i>
        </div>
      </div>
    </div>
    
    <!-- Widget Info -->
    <div class="widget-info">
      <!-- Header -->
      <div class="widget-header">
        <h3 class="widget-name" @click="$emit('view-details', widget)">{{ widget.name }}</h3>
        <button @click="toggleFavorite" class="favorite-btn" :class="{ active: isFavorite }">
          <i class="fas fa-heart"></i>
        </button>
      </div>

      <!-- Category -->
      <div class="widget-category">
        <i class="fas fa-tag"></i>
        {{ getCategoryLabel(widget.category) }}
      </div>

      <!-- Description -->
      <p class="widget-description">{{ widget.description }}</p>

      <!-- Rating & Stats -->
      <div class="widget-stats">
        <div class="rating">
          <div class="stars">
            <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ filled: n <= widget.rating }"></i>
          </div>
          <span class="rating-text">{{ widget.rating }}</span>
        </div>
        <div class="downloads">
          <i class="fas fa-download"></i>
          {{ formatNumber(widget.downloads) }}
        </div>
      </div>

      <!-- Tags -->
      <div v-if="widget.tags && widget.tags.length" class="widget-tags">
        <span v-for="tag in widget.tags.slice(0, 3)" :key="tag" class="tag">
          {{ tag }}
        </span>
        <span v-if="widget.tags.length > 3" class="tag-more">
          +{{ widget.tags.length - 3 }}
        </span>
      </div>

      <!-- Compatibility -->
      <div class="compatibility">
        <span
          v-for="role in widget.compatibility"
          :key="role"
          class="compatibility-badge"
          :class="role"
        >
          {{ role === 'agent' ? 'Agent' : 'Client' }}
        </span>
      </div>

      <!-- Price & Actions -->
      <div class="widget-footer">
        <div class="price-section">
          <div v-if="widget.price === 0" class="price free">
            {{ tt('widgets.marketplace.free', 'Gratuit') }}
          </div>
          <div v-else class="price paid">
            {{ formatPrice(widget.price) }}
          </div>
        </div>

        <div class="action-buttons">
          <button
            v-if="!isInstalled"
            @click="handleInstall"
            class="btn-install"
            :class="{ primary: widget.price === 0, secondary: widget.price > 0 }"
          >
            <i class="fas fa-download"></i>
            {{ widget.price === 0 ? tt('widgets.marketplace.install', 'Installer') : tt('widgets.marketplace.buy', 'Acheter') }}
          </button>
          
          <button v-else @click="$emit('configure', widget)" class="btn-configure">
            <i class="fas fa-cog"></i>
            {{ tt('widgets.marketplace.configure', 'Configurer') }}
          </button>

          <button @click="$emit('view-details', widget)" class="btn-details">
            <i class="fas fa-info-circle"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="installing" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>{{ tt('widgets.marketplace.installing', 'Installation...') }}</p>
      </div>
    </div>

    <!-- Update Available -->
    <div v-if="hasUpdate" class="update-badge">
      <i class="fas fa-arrow-up"></i>
      {{ tt('widgets.marketplace.updateAvailable', 'Mise à jour') }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, te } = useI18n()

const onImageError = (e) => {
  if (e && e.target) {
    e.target.src = '/fusepoint-logo.svg'
  }
}

const getWidgetPlaceholder = (widget) => {
  try {
    const name = (widget?.name || 'Widget').trim()
    const text = encodeURIComponent(name)
    // Utiliser un asset local pour éviter les erreurs de DNS/host
    return '/fusepoint-logo.svg'
  } catch (e) {
    return '/fusepoint-logo.svg'
  }
}
const tt = (key, fallback) => (te(key) ? t(key) : fallback)

const props = defineProps({
  widget: {
    type: Object,
    required: true
  },
  isInstalled: {
    type: Boolean,
    default: false
  },
  hasUpdate: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['install', 'view-details', 'configure', 'toggle-favorite'])

const installing = ref(false)

const isFavorite = computed(() => {
  let favorites = []
  try {
    favorites = JSON.parse(localStorage.getItem('widgetFavorites') || '[]')
  } catch (e) {
    console.warn('WidgetCard: invalid widgetFavorites in localStorage, using []', e)
    favorites = []
  }
  return favorites.includes(props.widget.id)
})

const getCategoryLabel = (categoryValue) => {
  const categories = {
    'analytics': 'Analytics',
    'marketing': 'Marketing',
    'social': 'Réseaux sociaux',
    'productivity': 'Productivité',
    'communication': 'Communication',
    'finance': 'Finance',
    'project': 'Gestion de projet',
    'crm': 'CRM',
    'reporting': 'Reporting',
    'automation': 'Automatisation'
  }
  return categories[categoryValue] || categoryValue
}

const toggleFavorite = () => {
  let favorites = []
  try {
    favorites = JSON.parse(localStorage.getItem('widgetFavorites') || '[]')
  } catch (e) {
    console.warn('WidgetCard: invalid widgetFavorites in localStorage, reinitializing', e)
    favorites = []
  }
  const exists = favorites.includes(props.widget.id)
  if (!exists) favorites.push(props.widget.id)
  else favorites = favorites.filter(id => id !== props.widget.id)
  try {
    localStorage.setItem('widgetFavorites', JSON.stringify(favorites))
  } catch (e) {
    console.warn('WidgetCard: failed to store widgetFavorites', e)
  }
  emit('toggle-favorite')
}

const formatNumber = (value) => {
  try {
    const num = Number(value) || 0
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return `${num}`
  } catch (e) {
    return `${value}`
  }
}

const formatPrice = (value) => {
  try {
    const num = Number(value)
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(num)
  } catch (e) {
    return `${value} €`
  }
}
</script>

<style scoped>
.widget-card {
  @apply bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-300 relative group;
}

.widget-card.featured {
  @apply ring-2 ring-yellow-400 ring-opacity-50;
}

.widget-card.installed {
  @apply bg-green-50 border-green-200;
}

.featured-badge {
  @apply absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 z-10;
}

.installed-badge {
  @apply absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 z-10;
}

.update-badge {
  @apply absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 z-10;
}

.widget-visual {
  @apply relative cursor-pointer;
}

.widget-screenshot {
  @apply relative aspect-video bg-gray-100 overflow-hidden;
}

.widget-screenshot img {
  @apply w-full h-full object-cover transition-transform duration-300 group-hover:scale-105;
}

.screenshot-overlay {
  @apply absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300;
}

.widget-icon-container {
  @apply aspect-video bg-gray-50 flex items-center justify-center;
}

.widget-icon {
  @apply w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg;
}

.widget-info {
  @apply p-4 space-y-3;
}

.widget-header {
  @apply flex items-start justify-between;
}

.widget-name {
  @apply font-semibold text-gray-900 text-lg cursor-pointer hover:text-blue-600 transition-colors flex-1 pr-2;
}

.favorite-btn {
  @apply p-1 text-gray-400 hover:text-red-500 transition-colors;
}

.favorite-btn.active {
  @apply text-red-500;
}

.widget-category {
  @apply flex items-center gap-2 text-sm text-gray-500;
}

.widget-description {
  @apply text-gray-600 text-sm line-clamp-2;
}

.widget-stats {
  @apply flex items-center justify-between text-sm;
}

.rating {
  @apply flex items-center gap-2;
}

.stars {
  @apply flex gap-1;
}

.stars i {
  @apply text-gray-300 text-xs;
}

.stars i.filled {
  @apply text-yellow-400;
}

.rating-text {
  @apply text-gray-600 font-medium;
}

.downloads {
  @apply flex items-center gap-1 text-gray-500;
}

.widget-tags {
  @apply flex flex-wrap gap-1;
}

.tag {
  @apply bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs;
}

.tag-more {
  @apply bg-gray-200 text-gray-500 px-2 py-1 rounded text-xs;
}

.compatibility {
  @apply flex gap-2;
}

.compatibility-badge {
  @apply px-2 py-1 rounded-full text-xs font-medium;
}

.compatibility-badge.agent {
  @apply bg-blue-100 text-blue-800;
}

.compatibility-badge.client {
  @apply bg-purple-100 text-purple-800;
}

.widget-footer {
  @apply flex items-center justify-between pt-3 border-t border-gray-100;
}

.price-section {
  @apply flex items-center;
}

.price {
  @apply font-semibold;
}

.price.free {
  @apply text-green-600;
}

.price.paid {
  @apply text-gray-900;
}

.action-buttons {
  @apply flex items-center gap-2;
}

.btn-install {
  @apply px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1;
}

.btn-install.primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-install.secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
}

.btn-configure {
  @apply px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center gap-1;
}

.btn-details {
  @apply p-1.5 text-gray-400 hover:text-gray-600 transition-colors;
}

.loading-overlay {
  @apply absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-20;
}

.loading-content {
  @apply text-center;
}

.spinner {
  @apply w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2;
}

.loading-content p {
  @apply text-gray-600 text-sm;
}

/* Responsive */
@media (max-width: 640px) {
  .widget-info {
    @apply p-3 space-y-2;
  }
  
  .widget-name {
    @apply text-base;
  }
  
  .widget-footer {
    @apply flex-col gap-3 items-stretch;
  }
  
  .action-buttons {
    @apply justify-center;
  }
}

/* Animation pour les cartes */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.widget-card {
  animation: slideIn 0.3s ease-out;
}

/* Hover effects */
.widget-card:hover {
  transform: translateY(-2px);
}

.widget-card:hover .widget-icon {
  transform: scale(1.05);
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>