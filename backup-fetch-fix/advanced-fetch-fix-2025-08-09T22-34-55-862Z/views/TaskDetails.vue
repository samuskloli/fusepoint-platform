<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- En-tête -->
      <div class="mb-8">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-4">
            <li>
              <router-link to="/dashboard" class="text-gray-400 hover:text-gray-500">
                <svg class="flex-shrink-0 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span class="sr-only">Dashboard</span>
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="ml-4 text-sm font-medium text-gray-500">Détail de la tâche</span>
              </div>
            </li>
          </ol>
        </nav>
        
        <div class="mt-4">
          <h1 class="text-3xl font-bold text-gray-900">{{ task.title }}</h1>
          <div class="mt-2 flex items-center space-x-4">
            <span 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="getStatusBadge(task.status)"
            >
              {{ task.status }}
            </span>
            <span class="text-gray-500">Créée le: {{ formatDate(task.createdAt) }}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Contenu principal -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Description de la tâche -->
          <div class="bg-white shadow-sm rounded-lg border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Description</h2>
            </div>
            <div class="p-6">
              <p class="text-gray-700 leading-relaxed">{{ task.description }}</p>
            </div>
          </div>

          <!-- Éléments à valider -->
          <div class="bg-white shadow-sm rounded-lg border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Éléments à valider</h2>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div 
                  v-for="item in task.validationItems" 
                  :key="item.id"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="font-medium text-gray-900 mb-2">{{ item.title }}</h3>
                      <p class="text-sm text-gray-600 mb-3">{{ item.description }}</p>
                      <div v-if="item.preview" class="mb-3">
                        <img 
                          :src="item.preview" 
                          :alt="item.title"
                          class="max-w-xs rounded-lg border border-gray-200"
                        />
                      </div>
                    </div>
                    <div class="flex flex-col space-y-2 ml-4">
                      <button 
                        @click="approveItem(item.id)"
                        class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        Approuver
                      </button>
                      <button 
                        @click="requestChanges(item.id)"
                        class="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        Demander des modifications
                      </button>
                      <button 
                        @click="viewFullSize(item.id)"
                        class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        Voir en grand
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Commentaires -->
          <div class="bg-white shadow-sm rounded-lg border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Commentaires</h2>
            </div>
            <div class="p-6">
              <!-- Liste des commentaires -->
              <div class="space-y-4 mb-6">
                <div 
                  v-for="comment in task.comments" 
                  :key="comment.id"
                  class="flex space-x-3"
                >
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span class="text-gray-600 font-medium text-sm">{{ comment.authorInitials }}</span>
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center space-x-2">
                      <span class="font-medium text-gray-900">{{ comment.author }}</span>
                      <span class="text-sm text-gray-500">{{ formatDate(comment.createdAt) }}</span>
                    </div>
                    <p class="text-gray-700 mt-1">{{ comment.content }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Nouveau commentaire -->
              <div class="border-t border-gray-200 pt-6">
                <div class="flex space-x-3">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span class="text-white font-medium text-sm">{{ userInitials }}</span>
                    </div>
                  </div>
                  <div class="flex-1">
                    <textarea
                      v-model="newComment"
                      rows="3"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ajouter un commentaire..."
                    ></textarea>
                    <div class="mt-3 flex justify-end">
                      <button 
                        @click="addComment"
                        :disabled="!newComment.trim()"
                        class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                      >
                        Publier
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-8">
          <!-- Informations de la tâche -->
          <div class="bg-white shadow-sm rounded-lg border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Informations</h2>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Agent responsable</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ task.assignedAgent }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Priorité</dt>
                <dd class="mt-1">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getPriorityBadge(task.priority)"
                  >
                    {{ task.priority }}
                  </span>
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Date limite</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(task.dueDate) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Projet associé</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ task.project }}</dd>
              </div>
            </div>
          </div>

          <!-- Actions rapides -->
          <div class="bg-white shadow-sm rounded-lg border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Actions</h2>
            </div>
            <div class="p-6 space-y-3">
              <button 
                @click="validateAllItems"
                class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Tout valider
              </button>
              <button 
                @click="contactAgent"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Contacter l'agent
              </button>
              <button 
                @click="requestMeeting"
                class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Demander un rendez-vous
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService';

export default {
  name: 'TaskDetails',
  data() {
    return {
      newComment: '',
      user: null,
      task: {
        id: 1,
        title: 'Valider les visuels de la campagne Facebook',
        description: 'Votre agent a préparé 5 visuels pour votre campagne Facebook Automne 2024. Ces visuels ont été créés selon le brief validé et respectent les guidelines de votre marque. Merci de les examiner et de nous faire part de vos retours.',
        status: 'En attente',
        priority: 'Urgent',
        createdAt: new Date('2024-01-10'),
        dueDate: new Date('2024-01-20'),
        assignedAgent: 'Sophie Martin',
        project: 'Campagne Facebook Automne 2024',
        validationItems: [
          {
            id: 1,
            title: 'Visuel principal - Promotion automne',
            description: 'Visuel carré 1080x1080 pour le feed Facebook',
            preview: 'https://via.placeholder.com/300x300/3B82F6/FFFFFF?text=Visuel+1'
          },
          {
            id: 2,
            title: 'Visuel story - Format vertical',
            description: 'Format 1080x1920 pour les stories Facebook',
            preview: 'https://via.placeholder.com/200x350/10B981/FFFFFF?text=Story+1'
          },
          {
            id: 3,
            title: 'Bannière événement',
            description: 'Format 1920x1080 pour l\'événement Facebook',
            preview: 'https://via.placeholder.com/400x225/F59E0B/FFFFFF?text=Bannière'
          }
        ],
        comments: [
          {
            id: 1,
            author: 'Sophie Martin',
            authorInitials: 'SM',
            content: 'Bonjour ! J\'ai terminé les 5 visuels pour votre campagne. Ils sont prêts pour validation. N\'hésitez pas si vous avez des questions !',
            createdAt: new Date('2024-01-10')
          },
          {
            id: 2,
            author: 'Sophie Martin',
            authorInitials: 'SM',
            content: 'J\'ai également préparé une version alternative du visuel principal au cas où vous souhaiteriez des modifications.',
            createdAt: new Date('2024-01-12')
          }
        ]
      }
    }
  },
  computed: {
    userInitials() {
      if (this.user && this.user.firstName && this.user.lastName) {
        return (this.user.firstName.charAt(0) + this.user.lastName.charAt(0)).toUpperCase();
      }
      const name = localStorage.getItem('userName') || 'Client';
      return name.charAt(0).toUpperCase() + (name.charAt(1) || '').toUpperCase();
    }
  },
  methods: {
    formatDate(date) {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    },
    
    getStatusBadge(status) {
      const badges = {
        'En attente': 'bg-orange-100 text-orange-800',
        'En cours': 'bg-blue-100 text-blue-800',
        'Validée': 'bg-green-100 text-green-800',
        'Refusée': 'bg-red-100 text-red-800'
      };
      return badges[status] || 'bg-gray-100 text-gray-800';
    },
    
    getPriorityBadge(priority) {
      const badges = {
        'Urgent': 'bg-red-100 text-red-800',
        'Important': 'bg-orange-100 text-orange-800',
        'Normal': 'bg-blue-100 text-blue-800',
        'Faible': 'bg-gray-100 text-gray-800'
      };
      return badges[priority] || 'bg-gray-100 text-gray-800';
    },
    
    approveItem(itemId) {
      // Logique d'approbation
      console.log('Approving item:', itemId);
      this.$toast?.success('Élément approuvé avec succès!');
    },
    
    requestChanges(itemId) {
      // Logique de demande de modifications
      console.log('Requesting changes for item:', itemId);
      this.$toast?.info('Demande de modifications envoyée à l\'agent');
    },
    
    viewFullSize(itemId) {
      // Logique pour voir en grand
      console.log('Viewing full size for item:', itemId);
    },
    
    validateAllItems() {
      // Valider tous les éléments
      console.log('Validating all items');
      this.$toast?.success('Tous les éléments ont été validés!');
    },
    
    contactAgent() {
      // Contacter l'agent
      this.$toast.info('La fonctionnalité de contact n\'est plus disponible.');
    },
    
    requestMeeting() {
      // Demander un rendez-vous
      console.log('Requesting meeting');
      this.$toast?.info('Demande de rendez-vous envoyée');
    },
    
    addComment() {
      if (this.newComment.trim()) {
        const comment = {
          id: this.task.comments.length + 1,
          author: this.user?.firstName + ' ' + this.user?.lastName || 'Client',
          authorInitials: this.userInitials,
          content: this.newComment.trim(),
          createdAt: new Date()
        };
        this.task.comments.push(comment);
        this.newComment = '';
        this.$toast?.success('Commentaire ajouté!');
      }
    },
    
    loadUserData() {
      this.user = authService.getUser();
    }
  },
  
  mounted() {
    this.loadUserData();
    // Ici on pourrait charger les données de la tâche basées sur l'ID de la route
    const taskId = this.$route.params.id;
    console.log('Loading task details for ID:', taskId);
  }
}
</script>