<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-gray-50 flex flex-col">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">F</div>
          <h1 class="ml-3 text-xl font-bold text-gray-900">Fusepoint</h1>
        </div>
      </div>
    </header>

    <main class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-lg">
        <h2 class="text-center text-3xl font-extrabold text-gray-900 mb-2">Bienvenue sur Fusepoint</h2>
        <p class="text-center text-sm text-gray-600 mb-8">Configurez votre compte en quelques étapes simples pour commencer à utiliser la plateforme marketing centralisée.</p>

        <div class="bg-white py-8 px-6 shadow-xl rounded-xl ring-1 ring-gray-200">
          <form @submit.prevent="submitOnboarding" class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Informations de votre entreprise</h3>
              <div class="space-y-4">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700">Nom de l'entreprise</label>
                  <input id="name" v-model="form.name" type="text" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder="Ex: Ma Société SARL" />
                </div>
                <div>
                  <label for="industry" class="block text-sm font-medium text-gray-700">Secteur d'activité</label>
                  <select id="industry" v-model="form.industry" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                    <option value="">Sélectionnez un secteur</option>
                    <option value="technologie">Technologie</option>
                    <option value="commerce">Commerce</option>
                    <option value="sante">Santé</option>
                    <option value="education">Éducation</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label for="size" class="block text-sm font-medium text-gray-700">Taille de l'entreprise</label>
                  <select id="size" v-model="form.size" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                    <option value="">Sélectionnez une taille</option>
                    <option value="1-10">1-10 employés</option>
                    <option value="11-50">11-50 employés</option>
                    <option value="51-200">51-200 employés</option>
                    <option value="201+">201+ employés</option>
                  </select>
                </div>
                <div>
                  <label for="location" class="block text-sm font-medium text-gray-700">Localisation</label>
                  <input id="location" v-model="form.location" type="text" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder="Ex: Paris, France" />
                </div>
                <div>
                  <label for="website" class="block text-sm font-medium text-gray-700">Site web</label>
                  <input id="website" v-model="form.website" type="url" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder="https://www.exemple.com" />
                </div>
                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea id="description" v-model="form.description" rows="3" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder="Décrivez brièvement votre entreprise..."></textarea>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Découvrez Fusepoint</h3>
              <div class="bg-primary-50 p-4 rounded-md">
                <p class="text-sm text-gray-600">Fusepoint est votre plateforme marketing centralisée qui intègre tous vos outils : analytiques (Google Analytics), réseaux sociaux (Facebook, Instagram), email marketing (Mailchimp), et plus. Centralisez vos données, analysez vos performances, et optimisez vos campagnes en un seul endroit.</p>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Connectez vos comptes</h3>
              <div class="space-y-4">
                <div class="bg-gray-50 p-4 rounded-md">
                  <h4 class="font-medium text-gray-800">Google Analytics</h4>
                  <p class="text-sm text-gray-600 mt-1">Connectez votre compte Google pour importer vos données analytiques. Allez dans Intégrations après l'onboarding pour configurer.</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-md">
                  <h4 class="font-medium text-gray-800">Réseaux Sociaux</h4>
                  <p class="text-sm text-gray-600 mt-1">Liez vos pages Facebook et Instagram pour gérer vos publications et analyser l'engagement. Configuration disponible dans le dashboard.</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-md">
                  <h4 class="font-medium text-gray-800">Email Marketing</h4>
                  <p class="text-sm text-gray-600 mt-1">Intégrez Mailchimp ou d'autres outils pour vos campagnes email. Suivez les instructions dans la section Intégrations.</p>
                </div>
              </div>
            </div>

            <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <span class="block sm:inline">{{ error }}</span>
            </div>

            <button type="submit" :disabled="loading" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
              <span v-if="loading">Enregistrement...</span>
              <span v-else>Terminer la configuration et commencer</span>
            </button>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import authService from '@/services/authService';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      form: {
        name: '',
        industry: '',
        size: '',
        location: '',
        website: '',
        description: ''
      },
      loading: false,
      error: null
    };
  },
  methods: {
    async submitOnboarding() {
      this.loading = true;
      this.error = null;
      try {
        const result = await authService.completeOnboarding(this.form);
        if (result.success) {
          this.router.push('/dashboard');
        }
      } catch (error) {
        this.error = error.message;
        console.error('Erreur onboarding:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>