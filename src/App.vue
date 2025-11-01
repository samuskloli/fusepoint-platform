<template>
  <div id="app">
    <!-- Skip link for keyboard users -->
    <a href="#main-content" class="skip-link">Aller au contenu principal</a>
    <router-view />
    <NotificationToast />
    <VersionFooter />
    <PushPrompt v-if="showPushPrompt" :permission-state="permissionState" @accept="onAcceptPush" @decline="onDeclinePush" />
  </div>
</template>

<script>
import NotificationToast from '@/components/NotificationToast.vue'
import VersionFooter from '@/components/VersionFooter.vue'
import PushPrompt from '@/components/modals/PushPrompt.vue'
import { ensureSubscribed, isPushSupported } from '@/services/pushNotifications.js'

export default {
  name: 'App',
  components: {
    NotificationToast,
    VersionFooter,
    PushPrompt
  },
  data() {
    return {
      showPushPrompt: false,
      permissionState: 'default'
    }
  },
  async mounted() {
    try {
      const supported = await isPushSupported();
      const asked = localStorage.getItem('pushPromptAsked') === 'true';
      const permission = (typeof Notification !== 'undefined') ? Notification.permission : 'unsupported';
      this.permissionState = permission;
      if (supported && permission === 'default' && !asked) {
        this.showPushPrompt = true;
      }
    } catch (e) {
      // ignore
    }
  },
  methods: {
    async onAcceptPush() {
      try {
        localStorage.setItem('pushPromptAsked', 'true');
        const res = await ensureSubscribed();
        if (res.success) {
          this.$toast && this.$toast.success('Notifications push activées');
          this.showPushPrompt = false;
          this.permissionState = (typeof Notification !== 'undefined') ? Notification.permission : 'unsupported';
        } else {
          this.permissionState = (typeof Notification !== 'undefined') ? Notification.permission : 'unsupported';
          this.$toast && this.$toast.error(res.error || 'Échec activation des notifications');
          this.showPushPrompt = false;
        }
      } catch (e) {
        this.permissionState = (typeof Notification !== 'undefined') ? Notification.permission : 'unsupported';
        this.$toast && this.$toast.error('Erreur activation des notifications');
        this.showPushPrompt = false;
      }
    },
    onDeclinePush() {
      localStorage.setItem('pushPromptAsked', 'true');
      this.showPushPrompt = false;
    }
  }
}
</script>

<style>
/* Global styles are handled by Tailwind CSS */
</style>
