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
.version-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.8);
  padding: 4px 12px;
  font-size: 10px;
  z-index: 1000;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.platform-name {
  font-weight: 500;
  font-size: 11px;
  opacity: 0.9;
}

.version-badge {
  background: rgba(255, 255, 255, 0.15);
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 9px;
  font-weight: 400;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 12px;
}

.changelog-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 9px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-block;
}

.changelog-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: translateY(-1px);
  text-decoration: none;
}

.last-update {
  font-size: 9px;
  opacity: 0.6;
}



/* Hover effect pour rendre le footer encore plus discret */
.version-footer:not(:hover) {
  opacity: 0.6;
}

.version-footer:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.8);
}

/* Responsive */
@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 2px;
  }
  
  .version-footer {
    padding: 3px 8px;
  }
  
  .platform-name, .version-badge, .changelog-btn, .last-update {
    font-size: 8px;
  }
  
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-content {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 8px;
  }
  
  .modal-header {
    padding: 15px;
  }
  
  .modal-body {
    padding: 15px;
  }
}
</style>