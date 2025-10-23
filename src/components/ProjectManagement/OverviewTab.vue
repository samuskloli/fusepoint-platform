<template>
  <div class="overview-dashboard">
    <!-- Tableau de bord projet (overview) -->
    <ProjectDashboard
      :project-id="projectId"
    />
  </div>
</template>

<script setup>
import ProjectDashboard from '../ProjectDashboard.vue'

const props = defineProps({
  projectId: {
    type: [String, Number],
    required: true
  }
})
</script>

<style scoped>
.overview-dashboard {
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>