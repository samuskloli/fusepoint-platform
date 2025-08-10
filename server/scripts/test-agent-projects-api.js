const databaseService = require('../services/databaseService');
const projectService = require('../services/projectService');

async function testAgentProjectsAPI() {
  try {
    // Initialiser la base de données
    await databaseService.initialize();
    console.log('✅ Connexion à la base de données établie');
    
    // 1. Récupérer l'agent agent@fusepoint.com
    const agent = await databaseService.get(`
      SELECT id, first_name, last_name, email, role 
      FROM users 
      WHERE email = 'agent@fusepoint.com'
    `);
    
    if (!agent) {
      console.error('❌ Agent agent@fusepoint.com non trouvé');
      return;
    }
    
    console.log(`\n👤 Agent trouvé: ${agent.first_name} ${agent.last_name} (ID: ${agent.id})`);
    
    // 2. Vérifier les clients assignés via agent_clients
    const assignedClients = await databaseService.query(`
      SELECT u.id, u.first_name, u.last_name, u.email
      FROM users u
      JOIN agent_clients ac ON u.id = ac.client_id
      WHERE ac.agent_id = ? AND ac.status = 'active'
      ORDER BY u.email
    `, [agent.id]);
    
    console.log(`\n📝 ${assignedClients.length} client(s) assigné(s) via agent_clients:`);
    assignedClients.forEach(client => {
      console.log(`   - ${client.first_name} ${client.last_name} (${client.email}) [ID: ${client.id}]`);
    });
    
    // 3. Vérifier les clients assignés via users.agent_id
    const usersAgentAssignments = await databaseService.query(`
      SELECT id, first_name, last_name, email, agent_id
      FROM users 
      WHERE agent_id = ? AND role IN ('user', 'client')
      ORDER BY email
    `, [agent.id]);
    
    console.log(`\n👥 ${usersAgentAssignments.length} client(s) assigné(s) via users.agent_id:`);
    usersAgentAssignments.forEach(client => {
      console.log(`   - ${client.first_name} ${client.last_name} (${client.email}) [ID: ${client.id}]`);
    });
    
    // 4. Tester projectService.getAgentProjects
    console.log('\n🔧 Test de projectService.getAgentProjects...');
    const serviceProjects = await projectService.getAgentProjects(agent.id);
    
    console.log(`\n📊 ${serviceProjects.length} projet(s) via projectService.getAgentProjects:`);
    serviceProjects.forEach(project => {
      console.log(`   - ${project.name} [${project.status}] (Client: ${project.first_name} ${project.last_name} - ID: ${project.client_id})`);
    });
    
    // 5. Vérifier les projets via requête directe
    const directProjects = await databaseService.query(`
      SELECT p.*, u.first_name, u.last_name, u.email as client_email
      FROM projects p
      LEFT JOIN users u ON p.client_id = u.id
      WHERE p.agent_id = ? OR p.client_id IN (
        SELECT ac.client_id FROM agent_clients ac 
        WHERE ac.agent_id = ? AND ac.status = 'active'
      )
      ORDER BY p.created_at DESC
    `, [agent.id, agent.id]);
    
    console.log(`\n📋 ${directProjects.length} projet(s) via requête directe:`);
    directProjects.forEach(project => {
      console.log(`   - ${project.name} [${project.status}] (Client: ${project.first_name} ${project.last_name} - ID: ${project.client_id})`);
    });
    
    // 6. Comparer les résultats
    if (serviceProjects.length === directProjects.length) {
      console.log('\n✅ Les résultats du service et de la requête directe correspondent');
    } else {
      console.log(`\n❌ Différence: service (${serviceProjects.length}) vs requête directe (${directProjects.length})`);
    }
    
    // 7. Vérifier tous les projets en base
    const allProjects = await databaseService.query('SELECT COUNT(*) as total FROM projects');
    console.log(`\n📊 Total des projets en base: ${allProjects[0].total}`);
    
    console.log('\n✅ Test terminé!');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

testAgentProjectsAPI();