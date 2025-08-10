<template>
  <Layout>
    <div class="p-6">
      <!-- En-tête -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Gestion des Prestataires</h1>
        <p class="mt-2 text-gray-600">
          Invitez et gérez vos prestataires externes pour collaborer sur vos projets clients.
        </p>
      </div>

      <!-- Composant principal de gestion -->
      <PrestataireInvitations />

      <!-- Section d'aide -->
      <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-blue-900 mb-3">
          Comment ça fonctionne ?
        </h3>
        <div class="space-y-2 text-sm text-blue-800">
          <p>• <strong>Invitez un prestataire :</strong> Saisissez son email et envoyez une invitation sécurisée</p>
          <p>• <strong>Lien d'inscription :</strong> Le prestataire reçoit un email avec un lien pour créer son compte</p>
          <p>• <strong>Accès restreint :</strong> Les prestataires n'ont accès qu'à leur tableau de bord dédié</p>
          <p>• <strong>Collaboration :</strong> Assignez des tâches et suivez l'avancement des projets</p>
          <p>• <strong>Sécurité :</strong> Chaque prestataire n'a accès qu'aux données qui lui sont assignées</p>
        </div>
      </div>

      <!-- Section des bonnes pratiques -->
      <div class="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-yellow-900 mb-3">
          Bonnes Pratiques
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
          <div>
            <h4 class="font-medium mb-2">Avant l'invitation :</h4>
            <ul class="space-y-1 list-disc list-inside">
              <li>Vérifiez l'adresse email du prestataire</li>
              <li>Définissez clairement le périmètre de collaboration</li>
              <li>Préparez les informations de projet nécessaires</li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium mb-2">Après l'acceptation :</h4>
            <ul class="space-y-1 list-disc list-inside">
              <li>Assignez des tâches spécifiques et claires</li>
              <li>Définissez des échéances réalistes</li>
              <li>Maintenez une communication régulière</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
import Layout from '@/components/Layout.vue'
import PrestataireInvitations from '@/components/PrestataireInvitations.vue'

export default {
  name: 'AgentPrestataires',
  components: {
    Layout,
    PrestataireInvitations
  }
}
</script>