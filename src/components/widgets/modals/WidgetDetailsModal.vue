<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-container" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div class="widget-header-info">
          <div class="widget-icon-large">
            <i :class="widget.icon"></i>
          </div>
          <div class="widget-title-section">
            <h2 class="widget-title">{{ widget.name }}</h2>
            <p class="widget-category">{{ getCategoryLabel(widget.category) }}</p>
            <div class="widget-rating">
              <div class="stars">
                <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ filled: n <= widget.rating }"></i>
              </div>
              <span class="rating-text">{{ widget.rating }} ({{ widget.reviewCount }} avis)</span>
            </div>
          </div>
        </div>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Content -->
      <div class="modal-content">
        <!-- Screenshots -->
        <div class="screenshots-section">
          <div class="main-screenshot">
            <img :src="widget.screenshot || '/placeholder-widget.png'" :alt="widget.name" />
          </div>
          <div v-if="widget.screenshots && widget.screenshots.length" class="screenshot-thumbnails">
            <img
              v-for="(screenshot, index) in widget.screenshots"
              :key="index"
              :src="screenshot"
              :alt="`${widget.name} screenshot ${index + 1}`"
              class="thumbnail"
            />
          </div>
        </div>

        <!-- Info Grid -->
        <div class="info-grid">
          <!-- Description -->
          <div class="info-section">
            <h3 class="section-title">{{ tt('widgets.modal.description', 'Description') }}</h3>
            <p class="description-text">{{ widget.description }}</p>
            
            <div v-if="widget.features && widget.features.length" class="features-list">
              <h4 class="features-title">{{ tt('widgets.modal.features', 'Fonctionnalités') }}</h4>
              <ul class="features">
                <li v-for="feature in widget.features" :key="feature">
                  <i class="fas fa-check text-green-500"></i>
                  {{ feature }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Sidebar Info -->
          <div class="sidebar-info">
            <!-- Stats -->
            <div class="stats-card">
              <div class="stat-item">
                <i class="fas fa-download text-blue-500"></i>
                <div>
                  <div class="stat-value">{{ formatNumber(widget.downloads) }}</div>
                  <div class="stat-label">{{ tt('widgets.modal.downloads', 'Téléchargements') }}</div>
                </div>
              </div>
              <div class="stat-item">
                <i class="fas fa-star text-yellow-500"></i>
                <div>
                  <div class="stat-value">{{ widget.rating }}</div>
                  <div class="stat-label">{{ tt('widgets.modal.rating', 'Note moyenne') }}</div>
                </div>
              </div>
              <div class="stat-item">
                <i class="fas fa-clock text-gray-500"></i>
                <div>
                  <div class="stat-value">{{ formatDate(widget.updatedAt) }}</div>
                  <div class="stat-label">{{ tt('widgets.modal.lastUpdate', 'Dernière mise à jour') }}</div>
                </div>
              </div>
            </div>

            <!-- Compatibility -->
            <div class="compatibility-card">
              <h4 class="card-title">{{ tt('widgets.modal.compatibility', 'Compatibilité') }}</h4>
              <div class="compatibility-badges">
                <span
                  v-for="role in widget.compatibility"
                  :key="role"
                  class="compatibility-badge"
                >
                  {{ role === 'agent' ? 'Agent' : 'Client' }}
                </span>
              </div>
            </div>

            <!-- Tags -->
            <div v-if="widget.tags && widget.tags.length" class="tags-card">
              <h4 class="card-title">{{ tt('widgets.modal.tags', 'Tags') }}</h4>
              <div class="tags">
                <span v-for="tag in widget.tags" :key="tag" class="tag">
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Version Info -->
            <div class="version-card">
              <h4 class="card-title">{{ tt('widgets.modal.version', 'Version') }}</h4>
              <div class="version-info">
                <div class="version-number">{{ widget.version || '1.0.0' }}</div>
                <div class="version-size">{{ widget.size || '2.5 MB' }}</div>
              </div>
            </div>

            <!-- Developer -->
            <div class="developer-card">
              <h4 class="card-title">{{ tt('widgets.modal.developer', 'Développeur') }}</h4>
              <div class="developer-info">
                <div class="developer-name">{{ widget.developer || 'Fusepoint' }}</div>
                <div class="developer-website">
                  <a href="#" class="developer-link">
                    {{ t('widgets.modal.website', 'Site web') }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reviews Section -->
        <div v-if="widget.reviews && widget.reviews.length" class="reviews-section">
          <h3 class="section-title">{{ tt('widgets.modal.reviews', 'Avis') }}</h3>
          <div class="reviews-list">
            <div v-for="review in widget.reviews.slice(0, 3)" :key="review.id" class="review-item">
              <div class="review-header">
                <div class="reviewer-info">
                  <div class="reviewer-avatar">
                    <img :src="review.avatar || '/default-avatar.png'" :alt="review.name" />
                  </div>
                  <div>
                    <div class="reviewer-name">{{ review.name }}</div>
                    <div class="review-date">{{ formatDate(review.date) }}</div>
                  </div>
                </div>
                <div class="review-rating">
                  <div class="stars">
                    <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ filled: n <= review.rating }"></i>
                  </div>
                </div>
              </div>
              <p class="review-text">{{ review.comment }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="modal-footer">
        <div class="price-section">
          <div v-if="widget.price === 0" class="price free">
            {{ t('widgets.marketplace.free', 'Gratuit') }}
          </div>
          <div v-else class="price paid">
            {{ formatPrice(widget.price) }}
          </div>
        </div>

        <div class="action-buttons">
          <button
            v-if="!isInstalled"
            @click="$emit('install', widget)"
            class="btn-primary btn-install"
          >
            <i class="fas fa-download"></i>
            {{ widget.price === 0 ? t('widgets.marketplace.install', 'Installer') : t('widgets.marketplace.buy', 'Acheter') }}
          </button>
          <button v-else class="btn-secondary btn-installed" disabled>
            <i class="fas fa-check"></i>
            {{ t('widgets.marketplace.installed', 'Installé') }}
          </button>
          
          <button @click="toggleFavorite" class="btn-favorite" :class="{ active: isFavorite }">
            <i class="fas fa-heart"></i>
            {{ isFavorite ? t('widgets.modal.removeFromFavorites', 'Retirer des favoris') : t('widgets.modal.addToFavorites', 'Ajouter aux favoris') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, te } = useI18n()
const tt = (key, fallback) => (te(key) ? t(key) : fallback)

const props = defineProps({
  widget: {
    type: Object,
    required: true
  },
  isInstalled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'install', 'uninstall'])

const isFavorite = computed(() => {
  // Logique pour vérifier si le widget est en favori
  let favorites = []
  try {
    favorites = JSON.parse(localStorage.getItem('widgetFavorites') || '[]')
  } catch (e) {
    console.warn('WidgetDetailsModal: invalid widgetFavorites in localStorage, using []', e)
    favorites = []
  }
  return favorites.includes(props.widget.id)
})

const getCategoryLabel = (categoryValue) => {
  // Mapping des catégories (à adapter selon vos catégories)
  const categories = {
    'analytics': 'Analytics',
    'marketing': 'Marketing',
    'social': 'Réseaux sociaux',
    'productivity': 'Productivité',
    'communication': 'Communication',
    'finance': 'Finance',
    'project': 'Gestion de projet'
  }
  return categories[categoryValue] || categoryValue
}

const toggleFavorite = () => {
  let favorites = []
  try {
    favorites = JSON.parse(localStorage.getItem('widgetFavorites') || '[]')
  } catch (e) {
    console.warn('WidgetDetailsModal: invalid widgetFavorites in localStorage, reinitializing', e)
    favorites = []
  }
  const index = favorites.indexOf(props.widget.id)
  
  if (index > -1) {
    favorites.splice(index, 1)
  } else {
    favorites.push(props.widget.id)
  }
  
  try {
    localStorage.setItem('widgetFavorites', JSON.stringify(favorites))
  } catch (e) {
    console.error('WidgetDetailsModal: failed to save widgetFavorites', e)
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-container {
  @apply bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col;
}

.modal-header {
  @apply flex items-start justify-between p-6 border-b border-gray-200;
}

.widget-header-info {
  @apply flex items-start gap-4;
}

.widget-icon-large {
  @apply w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl;
}

.widget-title-section {
  @apply flex-1;
}

.widget-title {
  @apply text-2xl font-bold text-gray-900 mb-1;
}

.widget-category {
  @apply text-gray-500 mb-2;
}

.widget-rating {
  @apply flex items-center gap-2;
}

.stars {
  @apply flex gap-1;
}

.stars i {
  @apply text-gray-300;
}

.stars i.filled {
  @apply text-yellow-400;
}

.rating-text {
  @apply text-sm text-gray-600;
}

.close-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors;
}

.modal-content {
  @apply flex-1 overflow-y-auto p-6 space-y-8;
}

.screenshots-section {
  @apply space-y-4;
}

.main-screenshot {
  @apply aspect-video bg-gray-100 rounded-xl overflow-hidden;
}

.main-screenshot img {
  @apply w-full h-full object-cover;
}

.screenshot-thumbnails {
  @apply flex gap-3 overflow-x-auto pb-2;
}

.thumbnail {
  @apply w-20 h-12 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity;
}

.info-grid {
  @apply grid grid-cols-1 lg:grid-cols-3 gap-8;
}

.info-section {
  @apply lg:col-span-2 space-y-6;
}

.section-title {
  @apply text-xl font-semibold text-gray-900 mb-4;
}

.description-text {
  @apply text-gray-600 leading-relaxed;
}

.features-list {
  @apply mt-6;
}

.features-title {
  @apply text-lg font-medium text-gray-900 mb-3;
}

.features {
  @apply space-y-2;
}

.features li {
  @apply flex items-center gap-3 text-gray-600;
}

.sidebar-info {
  @apply space-y-6;
}

.stats-card, .compatibility-card, .tags-card, .version-card, .developer-card {
  @apply bg-gray-50 rounded-xl p-4;
}

.card-title {
  @apply font-medium text-gray-900 mb-3;
}

.stat-item {
  @apply flex items-center gap-3 mb-3 last:mb-0;
}

.stat-value {
  @apply font-semibold text-gray-900;
}

.stat-label {
  @apply text-sm text-gray-500;
}

.compatibility-badges {
  @apply flex flex-wrap gap-2;
}

.compatibility-badge {
  @apply bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium;
}

.tags {
  @apply flex flex-wrap gap-2;
}

.tag {
  @apply bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm;
}

.version-info {
  @apply space-y-1;
}

.version-number {
  @apply font-medium text-gray-900;
}

.version-size {
  @apply text-sm text-gray-500;
}

.developer-info {
  @apply space-y-1;
}

.developer-name {
  @apply font-medium text-gray-900;
}

.developer-link {
  @apply text-blue-600 hover:text-blue-700 text-sm;
}

.reviews-section {
  @apply space-y-4;
}

.reviews-list {
  @apply space-y-4;
}

.review-item {
  @apply bg-gray-50 rounded-xl p-4;
}

.review-header {
  @apply flex items-center justify-between mb-3;
}

.reviewer-info {
  @apply flex items-center gap-3;
}

.reviewer-avatar {
  @apply w-10 h-10 rounded-full overflow-hidden;
}

.reviewer-avatar img {
  @apply w-full h-full object-cover;
}

.reviewer-name {
  @apply font-medium text-gray-900;
}

.review-date {
  @apply text-sm text-gray-500;
}

.review-rating .stars {
  @apply text-sm;
}

.review-text {
  @apply text-gray-600;
}

.modal-footer {
  @apply flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50;
}

.price-section {
  @apply flex items-center;
}

.price {
  @apply text-2xl font-bold;
}

.price.free {
  @apply text-green-600;
}

.price.paid {
  @apply text-gray-900;
}

.action-buttons {
  @apply flex items-center gap-3;
}

.btn-primary {
  @apply bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2;
}

.btn-favorite {
  @apply p-3 text-gray-400 hover:text-red-500 transition-colors border border-gray-300 rounded-lg hover:border-red-300;
}

.btn-favorite.active {
  @apply text-red-500 border-red-300 bg-red-50;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    @apply max-w-full m-2;
  }
  
  .modal-header {
    @apply p-4;
  }
  
  .modal-content {
    @apply p-4;
  }
  
  .modal-footer {
    @apply p-4 flex-col gap-4;
  }
  
  .info-grid {
    @apply grid-cols-1;
  }
  
  .action-buttons {
    @apply w-full justify-center;
  }
}
</style>