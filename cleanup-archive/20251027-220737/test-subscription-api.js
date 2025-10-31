// Test de l'API de mise à jour d'abonnement
const testSubscriptionUpdate = async () => {
  try {
    console.log('🧪 Test de mise à jour d\'abonnement...');
    
    // Simuler l'appel comme dans AdminUserManager.vue
    const response = await fetch('/api/admin/users/1/subscription', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ isPaid: true })
    });
    
    const data = await response.json();
    console.log('📊 Réponse:', data);
    
    if (!response.ok) {
      console.error('❌ Erreur HTTP:', response.status, response.statusText);
      console.error('❌ Détails:', data);
    } else {
      console.log('✅ Succès:', data);
    }
    
  } catch (error) {
    console.error('❌ Erreur réseau:', error);
  }
};

testSubscriptionUpdate();
