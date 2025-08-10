const MariaDBConfig = require('./config/mariadb.config');

async function checkAgentProjects() {
  let conn;
  
  try {
    console.log('🔍 Vérification des projets des agents...');
    
    const config = new MariaDBConfig();
    conn = await config.getConnection();
    
    // 1. Vérifier les assignations agent-client
    console.log('\n📊 1. Assignations dans agent_clients:');
    const agentClients = await conn.query('SELECT * FROM agent_clients WHERE status = "active"');
    console.log(`Nombre d'assignations actives: ${agentClients.length}`);
    agentClients.forEach(ac => {
      console.log(`- Agent ${ac.agent_id} -> Client ${ac.client_id}`);
    });
    
    // 2. Vérifier les projets existants
    console.log('\n📁 2. Projets existants:');
    const projects = await conn.query(`
      SELECT p.id, p.name, p.client_id, p.agent_id, p.status,
             c.first_name as client_name, a.first_name as agent_name
      FROM projects p
      LEFT JOIN users c ON p.client_id = c.id
      LEFT JOIN users a ON p.agent_id = a.id
    `);
    console.log(`Nombre de projets: ${projects.length}`);
    projects.forEach(p => {
      console.log(`- Projet "${p.name}" (ID: ${p.id}) - Client: ${p.client_name} (${p.client_id}) - Agent: ${p.agent_name} (${p.agent_id})`);
    });
    
    // 3. Test de la requête pour un agent spécifique
    if (agentClients.length > 0) {
      const testAgentId = agentClients[0].agent_id;
      console.log(`\n🔍 3. Test pour l'agent ${testAgentId}:`);
      
      const agentProjects = await conn.query(`
        SELECT p.*, u.first_name, u.last_name, u.email as client_email
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id
        WHERE (p.agent_id = ? OR p.client_id IN (
          SELECT client_id FROM agent_clients 
          WHERE agent_id = ? AND status = 'active'
        ))
        ORDER BY p.created_at DESC
      `, [testAgentId, testAgentId]);
      
      console.log(`Projets trouvés pour l'agent ${testAgentId}: ${agentProjects.length}`);
      agentProjects.forEach(p => {
        console.log(`- "${p.name}" - Client: ${p.first_name} ${p.last_name}`);
      });
    }
    
    // 4. Vérifier s'il y a des clients sans projets
    console.log('\n👤 4. Clients assignés sans projets:');
    const clientsWithoutProjects = await conn.query(`
      SELECT DISTINCT ac.client_id, u.first_name, u.last_name, u.email
      FROM agent_clients ac
      LEFT JOIN users u ON ac.client_id = u.id
      LEFT JOIN projects p ON ac.client_id = p.client_id
      WHERE ac.status = 'active' AND p.id IS NULL
    `);
    
    console.log(`Clients sans projets: ${clientsWithoutProjects.length}`);
    clientsWithoutProjects.forEach(c => {
      console.log(`- ${c.first_name} ${c.last_name} (${c.email}) - ID: ${c.client_id}`);
    });
    
    console.log('\n✅ Vérification terminée');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (conn) {
      await conn.end();
    }
  }
}

checkAgentProjects().catch(console.error);