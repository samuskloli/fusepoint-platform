const path = require('path');
const projectManagementService = require('./services/projectManagementService');
const agentService = require('./services/agentService');
const databaseService = require('./services/databaseService');

async function testAgentProjects() {
  try {
    console.log('🔍 Test direct des services backend...');
    
    // Initialiser la base de données
    console.log('\n1. Initialisation de la base de données');
    await databaseService.initialize();
    console.log('✅ Base de données initialisée');
    
    // Récupérer les agents disponibles
    console.log('\n2. Récupération des agents');
    const agents = await databaseService.query('SELECT id, email, role FROM users WHERE role IN ("agent", "admin", "super_admin")');

    console.log('Agents trouvés:', agents.length);
    agents.forEach(agent => {
      console.log(`  - ID: ${agent.id}, Email: ${agent.email}, Role: ${agent.role}`);
    });
    
    if (agents.length === 0) {
      console.log('❌ Aucun agent trouvé');
      return;
    }
    
    const testAgent = agents[0];
    console.log(`\n3. Test avec l'agent: ${testAgent.email} (ID: ${testAgent.id})`);
    
    // Test de récupération des projets via projectManagementService
    console.log('\n4. Test projectManagementService.getAgentProjectsPaginated');
    try {
      const projectsResult = await projectManagementService.getAgentProjectsPaginated(
        testAgent.id,
        1, // page
        10, // limit
        null, // status filter
        null // client filter
      );
      console.log('✅ Résultat projectManagementService:');
      console.log('  - Total projets:', projectsResult.total);
      console.log('  - Projets sur cette page:', projectsResult.projects.length);
      console.log('  - Page actuelle:', projectsResult.currentPage);
      console.log('  - Total pages:', projectsResult.totalPages);
      
      if (projectsResult.projects.length > 0) {
        console.log('\n  Premiers projets:');
        projectsResult.projects.slice(0, 3).forEach((project, index) => {
          console.log(`    ${index + 1}. ${project.name} (Client: ${project.client_name || 'N/A'})`);
        });
      }
    } catch (error) {
      console.error('❌ Erreur projectManagementService:', error.message);
    }
    
    // Test de récupération des clients assignés
    console.log('\n5. Test agentService.getAssignedClients');
    try {
      const assignedClients = await agentService.getAssignedClients(testAgent.id);
      console.log('✅ Clients assignés:', assignedClients.length);
      assignedClients.forEach(client => {
        console.log(`  - Client: ${client.name} (ID: ${client.id})`);
      });
    } catch (error) {
      console.error('❌ Erreur getAssignedClients:', error.message);
    }
    
    // Vérifier les relations agent_clients
    console.log('\n6. Vérification des relations agent_clients');
    const agentClientRelations = await databaseService.query('SELECT * FROM agent_clients WHERE agent_id = ?', [testAgent.id]);
    console.log('Relations agent_clients:', agentClientRelations.length);
    agentClientRelations.forEach(relation => {
      console.log(`  - Agent ${relation.agent_id} -> Client ${relation.client_id}`);
    });
    
    // Vérifier les projets directs
    console.log('\n7. Vérification des projets directs');
    const directProjects = await databaseService.query(`
      SELECT p.*, u.name as client_name 
      FROM projects p 
      LEFT JOIN users u ON p.client_id = u.id 
      WHERE p.agent_id = ?
    `, [testAgent.id]);
    console.log('Projets directs:', directProjects.length);
    
    // Vérifier les projets via clients assignés
    console.log('\n8. Vérification des projets via clients assignés');
    const clientProjects = await databaseService.query(`
      SELECT p.*, u.name as client_name 
      FROM projects p 
      LEFT JOIN users u ON p.client_id = u.id 
      WHERE p.client_id IN (
        SELECT client_id FROM agent_clients WHERE agent_id = ?
      )
    `, [testAgent.id]);
    console.log('Projets via clients assignés:', clientProjects.length);
    
    console.log('\n✅ Test terminé');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAgentProjects();