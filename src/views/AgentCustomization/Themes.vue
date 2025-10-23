<template>
  <RoleLayout>
    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Page Header -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="px-6 py-4">
          <h1 class="text-2xl font-bold text-gray-900">
            <i class="fas fa-palette mr-3 text-blue-600"></i>
            Personnalisation des Thèmes
          </h1>
        </div>
      </div>

      <!-- Content -->
      <main class="flex-1 overflow-y-auto bg-gray-50">
        <div class="flex-1 p-6">
          <div class="max-w-4xl mx-auto">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="text-center text-gray-500">
                <i class="fas fa-palette text-4xl mb-4"></i>
                <h3 class="text-lg font-medium mb-2">Personnalisation des Thèmes</h3>
                <p>Cette fonctionnalité sera bientôt disponible.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </RoleLayout>
</template>

<script>
import RoleLayout from '../../components/RoleLayout.vue'

export default {
  name: 'AgentThemes',
  components: {
    RoleLayout
  }
}
</script>

<style scoped>
/* Styles spécifiques au composant */
</style>