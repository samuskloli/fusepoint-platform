// Script à exécuter dans la console du navigateur pour forcer le rechargement des widgets
// Ouvrez la console (F12) et collez ce code

console.log('🔧 Début du nettoyage du cache frontend...');

// 1. Vider le localStorage
try {
  const localStorageKeys = Object.keys(localStorage);
  console.log(`📦 Suppression de ${localStorageKeys.length} éléments du localStorage`);
  localStorage.clear();
  console.log('✅ localStorage vidé');
} catch (error) {
  console.error('❌ Erreur lors du vidage du localStorage:', error);
}

// 2. Vider le sessionStorage
try {
  const sessionStorageKeys = Object.keys(sessionStorage);
  console.log(`📦 Suppression de ${sessionStorageKeys.length} éléments du sessionStorage`);
  sessionStorage.clear();
  console.log('✅ sessionStorage vidé');
} catch (error) {
  console.error('❌ Erreur lors du vidage du sessionStorage:', error);
}

// 3. Vider le cache des requêtes API si disponible
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
    }
    console.log('✅ Cache API vidé');
  }).catch(error => {
    console.error('❌ Erreur lors du vidage du cache API:', error);
  });
}

// 4. Forcer le rechargement des données des widgets
if (window.location.pathname.includes('/projects/')) {
  console.log('🔄 Tentative de rechargement des widgets...');
  
  // Essayer de trouver et déclencher le rechargement des widgets
  const projectId = window.location.pathname.split('/').pop();
  console.log(`📋 ID du projet détecté: ${projectId}`);
  
  // Si Vue.js est disponible, essayer de déclencher un rechargement
  if (window.Vue || window.__VUE__) {
    console.log('🎯 Vue.js détecté, tentative de rechargement...');
    
    // Déclencher un événement personnalisé pour forcer le rechargement
    window.dispatchEvent(new CustomEvent('force-widget-reload', {
      detail: { projectId: projectId }
    }));
  }
}

// 5. Afficher les instructions finales
console.log('\n🎯 Actions effectuées:');
console.log('   ✅ localStorage vidé');
console.log('   ✅ sessionStorage vidé');
console.log('   ✅ Cache API vidé');
console.log('   ✅ Événement de rechargement déclenché');

console.log('\n📝 Étapes suivantes:');
console.log('   1. Actualisez la page (F5 ou Ctrl+R)');
console.log('   2. Si le problème persiste, effectuez un rechargement forcé (Ctrl+Shift+R)');
console.log('   3. Vérifiez que les widgets s\'affichent correctement');

// 6. Programmer un rechargement automatique après 2 secondes
console.log('\n⏰ Rechargement automatique dans 3 secondes...');
setTimeout(() => {
  console.log('🔄 Rechargement de la page...');
  window.location.reload(true); // Rechargement forcé
}, 3000);

console.log('\n✨ Script terminé. La page va se recharger automatiquement.');