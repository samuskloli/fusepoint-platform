<template>
  <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
    <div class="flex items-center justify-between">
      <!-- Navigation mobile -->
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          @click="$emit('previous')"
          :disabled="currentPage === 1"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ messages.previous }}
        </button>
        <button
          @click="$emit('next')"
          :disabled="currentPage === totalPages"
          class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ messages.next }}
        </button>
      </div>
      
      <!-- Navigation desktop -->
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <!-- Informations de pagination -->
        <div>
          <p class="text-sm text-gray-700">
            {{ messages.showing }}
            <span class="font-medium">{{ startIndex + 1 }}</span>
            {{ messages.to }}
            <span class="font-medium">{{ Math.min(endIndex, totalItems) }}</span>
            {{ messages.of }}
            <span class="font-medium">{{ totalItems }}</span>
            {{ messages.results }}
          </p>
        </div>
        
        <!-- Contrôles de navigation -->
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <!-- Bouton précédent -->
            <button
              @click="$emit('previous')"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon class="h-5 w-5" />
            </button>
            
            <!-- Pages -->
            <template v-for="page in visiblePages" :key="page">
              <span
                v-if="page === '...'"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
              >
                ...
              </span>
              <button
                v-else
                @click="$emit('goTo', page)"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  page === currentPage
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
            </template>
            
            <!-- Bouton suivant -->
            <button
              @click="$emit('next')"
              :disabled="currentPage === totalPages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon class="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'Pagination',
  components: {
    ChevronLeftIcon,
    ChevronRightIcon
  },
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    },
    totalItems: {
      type: Number,
      required: true
    },
    itemsPerPage: {
      type: Number,
      required: true
    },
    messages: {
      type: Object,
      required: true
    }
  },
  emits: ['previous', 'next', 'goTo'],
  computed: {
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage
    },
    
    endIndex() {
      return this.startIndex + this.itemsPerPage
    },
    
    visiblePages() {
      const pages = []
      const total = this.totalPages
      const current = this.currentPage
      
      if (total <= 7) {
        // Afficher toutes les pages si il y en a 7 ou moins
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        // Logique pour afficher les pages avec des ellipses
        if (current <= 4) {
          // Début de la liste
          for (let i = 1; i <= 5; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 3) {
          // Fin de la liste
          pages.push(1)
          pages.push('...')
          for (let i = total - 4; i <= total; i++) {
            pages.push(i)
          }
        } else {
          // Milieu de la liste
          pages.push(1)
          pages.push('...')
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        }
      }
      
      return pages
    }
  }
}
</script>