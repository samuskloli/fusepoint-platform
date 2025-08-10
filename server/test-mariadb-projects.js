const MariaDBConfig = require('./config/mariadb.config');
const axios = require('axios');

async function testMariaDBProjects() {
  let connection;
  
  try {
    console.log('🔍 Test des projets d\'agent avec MariaDB...');
    
    const mariadb = new MariaDBConfig();
    connection = await mariadb.getConnection();
    console.log('✅ Connexion MariaDB établie');
    
    // Test 1: Récupération des agents
    console.log('\n📋 Test 1: Récupération des agents...');
    const agentsResult = await connection.query('SELECT id, email, role FROM users WHERE role = "agent" LIMIT 5');
    console.log(`Agents trouvés: ${agentsResult.length}`);
    if (agentsResult && agentsResult.length > 0) {
      agentsResult.forEach(agent => {
        console.log(`  - Agent ${agent.id}: ${agent.email}`);
      });
    } else {
      console.log('  ⚠️ Aucun agent trouvé');
    }
    
    // Test 2: Vérifier les projets
    console.log('\n📋 Test 2: Récupération des projets...');
    const projectsResult = await connection.query('SELECT * FROM projects LIMIT 5');
    console.log(`Projets trouvés: ${projectsResult.length}`);
    if (projectsResult && projectsResult.length > 0) {
      projectsResult.forEach(project => {
        console.log(`  - Projet ${project.id}: ${project.title} (Client: ${project.client_id})`);
      });
    } else {
      console.log('  ⚠️ Aucun projet trouvé');
    }
    
    // Test 3: Vérifier les relations agent_clients
    console.log('\n📋 Test 3: Relations agent-clients...');
    const relationsResult = await connection.query('SELECT * FROM agent_clients LIMIT 5');
    console.log(`Relations trouvées: ${relationsResult.length}`);
    if (relationsResult && relationsResult.length > 0) {
      relationsResult.forEach(relation => {
        console.log(`  - Agent ${relation.agent_id} → Client ${relation.client_id}`);
      });
    } else {
      console.log('  ⚠️ Aucune relation agent-client trouvée');
    }
    
    // Test 4: Projets visibles par un agent spécifique
    if (relationsResult && relationsResult.length > 0) {
      const agentId = relationsResult[0].agent_id;
      console.log(`\n📋 Test 4: Projets visibles par l'agent ${agentId}...`);
      const agentProjectsResult = await connection.query(`
        SELECT p.*, u.username as client_name 
        FROM projects p 
        JOIN users u ON p.client_id = u.id 
        JOIN agent_clients ac ON ac.client_id = p.client_id 
        WHERE ac.agent_id = ?
      `, [agentId]);
      console.log(`Projets visibles: ${agentProjectsResult.length}`);
      if (agentProjectsResult && agentProjectsResult.length > 0) {
        agentProjectsResult.forEach(project => {
          console.log(`  - ${project.title} (Client: ${project.client_name})`);
        });
      } else {
        console.log('  ⚠️ Aucun projet visible pour cet agent');
      }
    }
    
    // Test 5: Test de l'API endpoint
    console.log('\n📋 Test 5: Test de l\'endpoint API...');
    const axios = require('axios');
    
    try {
      const response = await axios.get('http://localhost:3000/api/agent/projects', {
        timeout: 5000
      });
      console.log(`✅ API Response Status: ${response.status}`);
      console.log(`✅ Projets retournés par l'API: ${response.data.projects ? response.data.projects.length : 'N/A'}`);
    } catch (apiError) {
      console.log(`❌ Erreur API: ${apiError.message}`);
    }
    
    await connection.end();
    console.log('\n✅ Test terminé - Connexion MariaDB fermée');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack:', error.stack);
  }
}

testMariaDBProjects();