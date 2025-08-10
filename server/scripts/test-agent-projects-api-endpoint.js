const databaseService = require('../services/databaseService');
const projectService = require('../services/projectService');
const ProjectManagementService = require('../services/projectManagementService');

async function testAgentProjectsAPI() {
  try {
    console.log('🧪 Test de l\'API /api/agent/projects');
    console.log('=' .repeat(50));
    
    // Récupérer l'agent agent@fusepoint.com
    const agent = await databaseService.get(
      'SELECT id, email, role FROM users WHERE email = ?',
      ['agent@fusepoint.com']
    );
    
    if (!agent) {
      console.log('❌ Agent agent@fusepoint.com non trouvé');
      return;
    }
    
    console.log('👤 Agent trouvé:', {
      id: agent.id,
      email: agent.email,
      role: agent.role
    });
    
    // Test 1: Vérifier les clients assignés via agent_clients
    console.log('\n📋 Test 1: Clients assignés via agent_clients');
    const assignedClients = await databaseService.query(
      'SELECT client_id FROM agent_clients WHERE agent_id = ? AND status = "active"',
      [agent.id]
    );
    console.log(`   Clients assignés: ${assignedClients.length}`);
    assignedClients.forEach(client => {
      console.log(`   - Client ID: ${client.client_id}`);
    });
    
    // Test 2: Vérifier les projets via projectService.getAgentProjectsPaginated
    console.log('\n📊 Test 2: Projets via projectService.getAgentProjectsPaginated');
    const projectsResult = await projectService.getAgentProjectsPaginated(agent.id, {}, { page: 1, limit: 50 });
    console.log(`   Projets trouvés: ${projectsResult.projects.length}`);
    console.log(`   Total: ${projectsResult.pagination.total}`);
    
    if (projectsResult.projects.length > 0) {
      console.log('   Échantillon de projets:');
      projectsResult.projects.slice(0, 3).forEach(project => {
        console.log(`   - ${project.name} [${project.status}] (Client ID: ${project.client_id})`);
      });
    }
    
    // Test 3: Vérifier les projets via ProjectManagementService.getAgentProjectsPaginated
    console.log('\n🔧 Test 3: Projets via ProjectManagementService.getAgentProjectsPaginated');
    const managementResult = await ProjectManagementService.getAgentProjectsPaginated(agent.id, { page: 1, limit: 50 });
    console.log(`   Projets trouvés: ${managementResult.projects.length}`);
    console.log(`   Total: ${managementResult.pagination.total}`);
    
    if (managementResult.projects.length > 0) {
      console.log('   Échantillon de projets:');
      managementResult.projects.slice(0, 3).forEach(project => {
        console.log(`   - ${project.name} [${project.status}] (Client: ${project.first_name} ${project.last_name})`);
      });
    }
    
    // Test 4: Comparaison des résultats
    console.log('\n🔍 Test 4: Comparaison des résultats');
    const projectServiceCount = projectsResult.projects.length;
    const managementServiceCount = managementResult.projects.length;
    
    if (projectServiceCount === managementServiceCount) {
      console.log('✅ Les deux services retournent le même nombre de projets');
    } else {
      console.log('❌ Différence entre les services:');
      console.log(`   projectService: ${projectServiceCount}`);
      console.log(`   ProjectManagementService: ${managementServiceCount}`);
    }
    
    // Test 5: Vérifier que tous les projets des clients assignés sont inclus
    console.log('\n🎯 Test 5: Vérification de la logique d\'assignation');
    
    if (assignedClients.length > 0) {
      const clientIds = assignedClients.map(c => c.client_id);
      const allClientProjects = await databaseService.query(
        `SELECT COUNT(*) as total FROM projects WHERE client_id IN (${clientIds.map(() => '?').join(',')})`,
        clientIds
      );
      
      console.log(`   Projets attendus pour les clients assignés: ${allClientProjects[0].total}`);
      console.log(`   Projets retournés par l'API: ${projectServiceCount}`);
      
      if (Number(allClientProjects[0].total) <= projectServiceCount) {
        console.log('✅ Tous les projets des clients assignés sont inclus (ou plus)');
      } else {
        console.log('❌ Certains projets des clients assignés manquent');
      }
    }
    
    console.log('\n🎉 Test terminé!');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await databaseService.close();
  }
}

// Exécuter le test
testAgentProjectsAPI();