const MariaDBConfig = require('./config/mariadb.config');

async function debugAgentClientRelations() {
  let conn;
  
  try {
    console.log('🔍 Début du diagnostic des relations agent-client...');
    
    const config = new MariaDBConfig();
    conn = await config.getConnection();
    
    console.log('✅ Connexion à la base de données établie');
    
    // 1. Vérifier la structure de la table agent_clients
    console.log('\n📋 1. Structure de la table agent_clients:');
    try {
      const tableStructure = await conn.query('DESCRIBE agent_clients');
      console.table(tableStructure);
    } catch (error) {
      console.log('❌ Table agent_clients n\'existe pas:', error.message);
    }
    
    // 2. Vérifier les données dans agent_clients
    console.log('\n📊 2. Données dans la table agent_clients:');
    try {
      const agentClients = await conn.query('SELECT * FROM agent_clients');
      console.log(`Nombre d'assignations: ${agentClients.length}`);
      if (agentClients.length > 0) {
        console.table(agentClients);
      } else {
        console.log('⚠️ Aucune assignation trouvée dans agent_clients');
      }
    } catch (error) {
      console.log('❌ Erreur lors de la lecture de agent_clients:', error.message);
    }
    
    // 3. Vérifier les utilisateurs avec agent_id
    console.log('\n👥 3. Utilisateurs avec agent_id assigné:');
    const usersWithAgent = await conn.query(`
      SELECT id, first_name, last_name, email, role, agent_id 
      FROM users 
      WHERE agent_id IS NOT NULL
    `);
    console.log(`Nombre d'utilisateurs avec agent assigné: ${usersWithAgent.length}`);
    if (usersWithAgent.length > 0) {
      console.table(usersWithAgent);
    }
    
    // 4. Vérifier les agents disponibles
    console.log('\n🕵️ 4. Agents disponibles:');
    const agents = await conn.query(`
      SELECT id, first_name, last_name, email, role 
      FROM users 
      WHERE role IN ('agent', 'admin', 'super_admin')
    `);
    console.log(`Nombre d'agents: ${agents.length}`);
    if (agents.length > 0) {
      console.table(agents);
    }
    
    // 5. Vérifier les clients disponibles
    console.log('\n👤 5. Clients disponibles:');
    const clients = await conn.query(`
      SELECT id, first_name, last_name, email, role, agent_id 
      FROM users 
      WHERE role IN ('client', 'user')
    `);
    console.log(`Nombre de clients: ${clients.length}`);
    if (clients.length > 0) {
      console.table(clients);
    }
    
    // 6. Vérifier les projets existants
    console.log('\n📁 6. Projets existants:');
    try {
      const projects = await conn.query(`
        SELECT p.id, p.name, p.client_id, p.agent_id, p.status,
               c.first_name as client_first_name, c.last_name as client_last_name,
               a.first_name as agent_first_name, a.last_name as agent_last_name
        FROM projects p
        LEFT JOIN users c ON p.client_id = c.id
        LEFT JOIN users a ON p.agent_id = a.id
      `);
      console.log(`Nombre de projets: ${projects.length}`);
      if (projects.length > 0) {
        console.table(projects);
      } else {
        console.log('⚠️ Aucun projet trouvé');
      }
    } catch (error) {
      console.log('❌ Erreur lors de la lecture des projets:', error.message);
    }
    
    // 7. Test de la requête utilisée par getAgentProjectsPaginated
    console.log('\n🔍 7. Test de la requête getAgentProjectsPaginated pour un agent:');
    if (agents.length > 0) {
      const testAgentId = agents[0].id;
      console.log(`Test avec l'agent ID: ${testAgentId} (${agents[0].first_name} ${agents[0].last_name})`);
      
      try {
        const testQuery = `
          SELECT p.*, u.first_name, u.last_name, u.email as client_email
          FROM projects p
          LEFT JOIN users u ON p.client_id = u.id
          WHERE (p.agent_id = ? OR p.client_id IN (
            SELECT client_id FROM agent_clients 
            WHERE agent_id = ? AND status = 'active'
          ))
          ORDER BY p.created_at DESC
        `;
        
        const testProjects = await conn.query(testQuery, [testAgentId, testAgentId]);
        console.log(`Projets trouvés pour l'agent ${testAgentId}: ${testProjects.length}`);
        if (testProjects.length > 0) {
          console.table(testProjects);
        }
      } catch (error) {
        console.log('❌ Erreur lors du test de la requête:', error.message);
      }
    }
    
    console.log('\n✅ Diagnostic terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  } finally {
    if (conn) {
      await conn.end();
      console.log('🔌 Connexion fermée');
    }
  }
}

// Exécuter le diagnostic
debugAgentClientRelations().catch(console.error);