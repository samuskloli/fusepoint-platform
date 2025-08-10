const path = require('path');
const MariaDBConfig = require('../config/mariadb.config');
const projectService = require('../services/projectService');
const agentService = require('../services/agentService');

/**
 * Script de test pour vérifier que les agents voient bien tous les projets de leurs clients
 */
async function testAgentProjectsVisibility() {
  let conn;
  
  try {
    console.log('🧪 Test de visibilité des projets pour les agents...');
    
    // Créer une instance de configuration MariaDB
    const config = new MariaDBConfig();
    conn = await config.getConnection();
    
    console.log('✅ Connexion à la base de données établie');
    
    // 1. Récupérer tous les agents
    const agents = await conn.query(`
      SELECT id, first_name, last_name, email, role 
      FROM users 
      WHERE role IN ('agent', 'admin', 'super_admin') 
      AND is_active = 1
      ORDER BY email
    `);
    
    console.log(`\n📋 ${agents.length} agent(s) trouvé(s):`);
    agents.forEach(agent => {
      console.log(`   - ${agent.first_name} ${agent.last_name} (${agent.email}) [${agent.role}]`);
    });
    
    // 2. Pour chaque agent, tester la visibilité des projets
    for (const agent of agents) {
      console.log(`\n🔍 Test pour l'agent: ${agent.first_name} ${agent.last_name} (${agent.email})`);
      
      // Récupérer les clients assignés à cet agent
      const assignedClients = await conn.query(`
        SELECT u.id, u.first_name, u.last_name, u.email
        FROM users u
        JOIN agent_clients ac ON u.id = ac.client_id
        WHERE ac.agent_id = ? AND ac.status = 'active'
        ORDER BY u.email
      `, [agent.id]);
      
      console.log(`   📝 ${assignedClients.length} client(s) assigné(s):`);
      assignedClients.forEach(client => {
        console.log(`      - ${client.first_name} ${client.last_name} (${client.email})`);
      });
      
      // Récupérer tous les projets de ces clients
      const allClientProjects = await conn.query(`
        SELECT p.id, p.name, p.status, u.first_name, u.last_name, u.email as client_email
        FROM projects p
        JOIN users u ON p.client_id = u.id
        WHERE p.client_id IN (
          SELECT ac.client_id FROM agent_clients ac 
          WHERE ac.agent_id = ? AND ac.status = 'active'
        )
        ORDER BY p.created_at DESC
      `, [agent.id]);
      
      console.log(`   📊 ${allClientProjects.length} projet(s) total des clients assignés:`);
      allClientProjects.forEach(project => {
        console.log(`      - ${project.name} [${project.status}] (Client: ${project.first_name} ${project.last_name})`);
      });
      
      // Tester la méthode getAgentProjects
      try {
        const visibleProjects = await projectService.getAgentProjects(agent.id);
        
        console.log(`   ✅ ${visibleProjects.length} projet(s) visible(s) via getAgentProjects:`);
        visibleProjects.forEach(project => {
          console.log(`      - ${project.name} [${project.status}] (Client: ${project.first_name} ${project.last_name})`);
        });
        
        // Vérifier que tous les projets des clients assignés sont visibles
        const missingProjects = allClientProjects.filter(clientProject => 
          !visibleProjects.some(visibleProject => visibleProject.id === clientProject.id)
        );
        
        if (missingProjects.length === 0) {
          console.log(`   ✅ SUCCÈS: Tous les projets des clients assignés sont visibles`);
        } else {
          console.log(`   ❌ ÉCHEC: ${missingProjects.length} projet(s) manquant(s):`);
          missingProjects.forEach(project => {
            console.log(`      - ${project.name} [${project.status}] (Client: ${project.first_name} ${project.last_name})`);
          });
        }
        
      } catch (error) {
        console.error(`   ❌ Erreur lors du test getAgentProjects:`, error.message);
      }
    }
    
    // 3. Résumé global
    console.log('\n📊 Résumé des assignations dans agent_clients:');
    const assignmentsSummary = await conn.query(`
      SELECT 
        a.first_name as agent_first_name,
        a.last_name as agent_last_name,
        a.email as agent_email,
        COUNT(ac.client_id) as clients_count,
        COUNT(p.id) as projects_count
      FROM users a
      LEFT JOIN agent_clients ac ON a.id = ac.agent_id AND ac.status = 'active'
      LEFT JOIN projects p ON ac.client_id = p.client_id
      WHERE a.role IN ('agent', 'admin', 'super_admin') AND a.is_active = 1
      GROUP BY a.id, a.first_name, a.last_name, a.email
      ORDER BY clients_count DESC, projects_count DESC
    `);
    
    assignmentsSummary.forEach(row => {
      console.log(`   ${row.agent_first_name} ${row.agent_last_name} (${row.agent_email}): ${row.clients_count} client(s), ${row.projects_count} projet(s)`);
    });
    
    console.log('\n✅ Test terminé!');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    throw error;
  } finally {
    if (conn) {
      conn.release();
      console.log('🔌 Connexion fermée');
    }
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  testAgentProjectsVisibility()
    .then(() => {
      console.log('🎉 Test terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { testAgentProjectsVisibility };