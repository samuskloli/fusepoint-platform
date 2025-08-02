<template>
  <div id="app">
    <router-view />
    <NotificationToast />
    <VersionFooter />
  </div>
</template>

<script>
import NotificationToast from '@/components/NotificationToast.vue'
import VersionFooter from '@/components/VersionFooter.vue'

export default {
  name: 'App',
  components: {
    NotificationToast,
    VersionFooter
  }
}
</script>

<style>
/* Global styles are handled by Tailwind CSS */
</style>
