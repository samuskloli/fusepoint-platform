import axios from 'axios';

// Configuration
const BASE_URL = 'http://localhost:3004';
const CLIENT_ID = 1; // Remplacer par un ID client valide
const PROJECT_ID = 1; // Remplacer par un ID projet valide

// Fonction pour tester la mise à jour d'une tâche
async function testTaskUpdate() {
  try {
    console.log('🔍 Test de mise à jour de tâche - Débogage de la synchronisation');
    console.log('='.repeat(60));
    
    // 1. Récupérer les tâches existantes
    console.log('\n1. Récupération des tâches existantes...');
    const tasksResponse = await axios.get(`${BASE_URL}/api/multi-tenant/clients/${CLIENT_ID}/projects/${PROJECT_ID}/tasks`);
    const tasks = tasksResponse.data.data?.tasks || [];
    
    if (tasks.length === 0) {
      console.log('❌ Aucune tâche trouvée. Créons une tâche de test...');
      
      // Créer une tâche de test
      const createResponse = await axios.post(`${BASE_URL}/api/multi-tenant/clients/${CLIENT_ID}/projects/${PROJECT_ID}/tasks`, {
        title: 'Tâche de test - Progression',
        description: 'Tâche créée pour tester la mise à jour de progression',
        priority: 'medium',
        estimated_hours: 10,
        actual_hours: 3
      });
      
      if (createResponse.data.success) {
        console.log('✅ Tâche de test créée:', createResponse.data.data.task);
        tasks.push(createResponse.data.data.task);
      } else {
        console.log('❌ Erreur lors de la création de la tâche de test');
        return;
      }
    }
    
    const testTask = tasks[0];
    console.log(`✅ Tâche sélectionnée pour le test: ${testTask.title} (ID: ${testTask.id})`);
    console.log(`   État initial: ${testTask.actual_hours || 0}h / ${testTask.estimated_hours || 0}h`);
    
    // 2. Effectuer une mise à jour
    console.log('\n2. Mise à jour de la progression...');
    const newActualHours = (testTask.actual_hours || 0) + 2;
    const updateData = {
      actual_hours: newActualHours
    };
    
    console.log(`   Mise à jour: actual_hours = ${newActualHours}`);
    
    const updateResponse = await axios.patch(
      `${BASE_URL}/api/multi-tenant/clients/${CLIENT_ID}/projects/${PROJECT_ID}/tasks/${testTask.id}`,
      updateData
    );
    
    console.log('📤 Réponse de mise à jour:');
    console.log('   Status:', updateResponse.status);
    console.log('   Success:', updateResponse.data.success);
    console.log('   Message:', updateResponse.data.message);
    
    if (updateResponse.data.data?.task) {
      const updatedTask = updateResponse.data.data.task;
      console.log('   Tâche mise à jour:', {
        id: updatedTask.id,
        actual_hours: updatedTask.actual_hours,
        estimated_hours: updatedTask.estimated_hours,
        updated_at: updatedTask.updated_at
      });
      
      // Calculer le pourcentage
      const percentage = updatedTask.estimated_hours > 0 
        ? Math.min(100, Math.round((updatedTask.actual_hours / updatedTask.estimated_hours) * 100))
        : 0;
      console.log(`   Pourcentage calculé: ${percentage}%`);
    }
    
    // 3. Vérifier la persistance en récupérant à nouveau la tâche
    console.log('\n3. Vérification de la persistance...');
    await new Promise(resolve => setTimeout(resolve, 100)); // Petit délai
    
    const verifyResponse = await axios.get(`${BASE_URL}/api/multi-tenant/clients/${CLIENT_ID}/projects/${PROJECT_ID}/tasks`);
    const verifyTasks = verifyResponse.data.data?.tasks || [];
    const verifyTask = verifyTasks.find(t => t.id === testTask.id);
    
    if (verifyTask) {
      console.log('✅ Tâche récupérée après mise à jour:');
      console.log('   ID:', verifyTask.id);
      console.log('   Actual hours:', verifyTask.actual_hours);
      console.log('   Estimated hours:', verifyTask.estimated_hours);
      console.log('   Updated at:', verifyTask.updated_at);
      
      // Vérifier la cohérence
      if (verifyTask.actual_hours === newActualHours) {
        console.log('✅ SUCCÈS: Les données sont correctement persistées');
      } else {
        console.log('❌ ERREUR: Incohérence dans les données persistées');
        console.log(`   Attendu: ${newActualHours}, Trouvé: ${verifyTask.actual_hours}`);
      }
    } else {
      console.log('❌ ERREUR: Tâche non trouvée après mise à jour');
    }
    
    // 4. Test de calcul côté client
    console.log('\n4. Test de calcul côté client...');
    if (verifyTask && verifyTask.estimated_hours > 0) {
      const clientPercentage = Math.min(100, Math.round((verifyTask.actual_hours / verifyTask.estimated_hours) * 100));
      console.log(`   Pourcentage côté client: ${clientPercentage}%`);
      console.log(`   Formule: Math.min(100, Math.round((${verifyTask.actual_hours} / ${verifyTask.estimated_hours}) * 100))`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Fonction pour tester plusieurs mises à jour rapides
async function testRapidUpdates() {
  try {
    console.log('\n🚀 Test de mises à jour rapides...');
    console.log('='.repeat(60));
    
    // Récupérer une tâche
    const tasksResponse = await axios.get(`${BASE_URL}/api/multi-tenant/clients/${CLIENT_ID}/projects/${PROJECT_ID}/tasks`);
    const tasks = tasksResponse.data.data?.tasks || [];
    
    if (tasks.length === 0) {
      console.log('❌ Aucune tâche disponible pour le test');
      return;
    }
    
    const testTask = tasks[0];
    console.log(`Tâche de test: ${testTask.title} (ID: ${testTask.id})`);
    
    // Effectuer 3 mises à jour rapides
    const updates = [
      { actual_hours: (testTask.actual_hours || 0) + 1 },
      { actual_hours: (testTask.actual_hours || 0) + 2 },
      { actual_hours: (testTask.actual_hours || 0) + 3 }
    ];
    
    const promises = updates.map((update, index) => 
      axios.patch(
        `${BASE_URL}/api/multi-tenant/clients/${CLIENT_ID}/projects/${PROJECT_ID}/tasks/${testTask.id}`,
        update
      ).then(response => ({ index, response }))
    );
    
    const results = await Promise.allSettled(promises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ Mise à jour ${index + 1}: Succès`);
        console.log(`   Actual hours: ${result.value.response.data.data?.task?.actual_hours}`);
      } else {
        console.log(`❌ Mise à jour ${index + 1}: Échec`);
        console.log(`   Erreur: ${result.reason.message}`);
      }
    });
    
    // Vérifier l'état final
    await new Promise(resolve => setTimeout(resolve, 200));
    const finalResponse = await axios.get(`${BASE_URL}/api/multi-tenant/clients/${CLIENT_ID}/projects/${PROJECT_ID}/tasks`);
    const finalTask = finalResponse.data.data?.tasks?.find(t => t.id === testTask.id);
    
    if (finalTask) {
      console.log(`\n📊 État final: ${finalTask.actual_hours}h / ${finalTask.estimated_hours}h`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test de mises à jour rapides:', error.message);
  }
}

// Exécuter les tests
async function runTests() {
  console.log('🧪 Démarrage des tests de débogage des tâches');
  console.log('Serveur:', BASE_URL);
  console.log('Client ID:', CLIENT_ID);
  console.log('Project ID:', PROJECT_ID);
  
  await testTaskUpdate();
  await testRapidUpdates();
  
  console.log('\n✅ Tests terminés');
}

// Vérifier que le serveur est accessible
axios.get(`${BASE_URL}/health`)
  .then(() => {
    console.log('✅ Serveur accessible');
    runTests();
  })
  .catch(() => {
    console.log('❌ Serveur non accessible. Assurez-vous que le serveur backend est démarré.');
    console.log('   Commande: npm run dev (dans le dossier server)');
  });