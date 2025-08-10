<template>
  <footer class="version-footer">
    <div class="footer-content">
      <div class="version-info">
        <span class="platform-name">Plateforme Fusepoint</span>
        <span class="version-badge">{{ version }}</span>
      </div>
      <div class="footer-links">
        <router-link to="/changelog" class="changelog-btn">
          📋 Changelog
        </router-link>
        <span class="last-update">Dernière mise à jour: {{ lastUpdate }}</span>
      </div>
    </div>


  </footer>
</template>

<script>
export default {
  name: 'VersionFooter',
  data() {
    return {
      version: 'Alpha 1.0.0',
      lastUpdate: new Date().toLocaleDateString('fr-FR')
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques au footer de version - utilise les classes centralisées */
.version-footer {
  @apply fixed bottom-0 left-0 right-0 z-10 transition-all duration-300 ease-in-out;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  color: rgba(255, 255, 255, 0.6);
  padding: 2px 8px;
  font-size: 9px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  transform: translateY(0);
}

.footer-content {
  @apply flex justify-between items-center max-w-6xl mx-auto;
}

.version-info {
  @apply flex items-center gap-2;
}

.platform-name {
  @apply font-medium opacity-90;
  font-size: 11px;
}

.version-badge {
  @apply px-1.5 py-0.5 rounded-lg border;
  background: rgba(255, 255, 255, 0.15);
  font-size: 9px;
  font-weight: 400;
  border-color: rgba(255, 255, 255, 0.1);
}

.footer-links {
  @apply flex items-center gap-3;
}

.changelog-btn {
  @apply inline-block px-1.5 py-0.5 rounded border no-underline cursor-pointer transition-all duration-200 ease-in-out;
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  font-size: 9px;
}

.changelog-btn:hover {
  @apply text-white no-underline transform -translate-y-px;
  background: rgba(255, 255, 255, 0.2);
}

.last-update {
  @apply opacity-60;
  font-size: 9px;
}

/* Hover effect pour rendre le footer encore plus discret */
.version-footer:not(:hover) {
  @apply opacity-40;
  transform: translateY(50%);
}

.version-footer:hover {
  @apply opacity-100;
  background: rgba(0, 0, 0, 0.7);
  transform: translateY(0);
  color: rgba(255, 255, 255, 0.9);
}

/* Responsive */
@media (max-width: 768px) {
  .footer-content {
    @apply flex-col gap-0.5;
  }
  
  .version-footer {
    padding: 2px 6px;
  }
  
  .platform-name, .version-badge, .changelog-btn, .last-update {
    font-size: 7px;
  }
  
  .version-footer:not(:hover) {
    transform: translateY(70%);
  }
}
</style>