const databaseService = require('../services/databaseService');
const systemLogsService = require('../services/systemLogsService');

async function checkUserProjects() {
  try {
    // Initialiser la base de données
    await databaseService.initialize();
    console.log('✅ Connexion à la base de données établie');
    
    const email = 'samuskl@gmail.com';
    
    // Vérifier si l'utilisateur existe
    const user = await databaseService.get(
      'SELECT id, email, first_name, last_name, role FROM users WHERE email = ?',
      [email]
    );
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé:', email);
      return;
    }
    
    console.log('👤 Utilisateur trouvé:');
    console.log('  - ID:', user.id);
    console.log('  - Email:', user.email);
    console.log('  - Nom:', user.first_name, user.last_name);
    console.log('  - Rôle:', user.role);
    
    // Vérifier les projets où l'utilisateur est client
    const clientProjects = await databaseService.query(
      'SELECT id, title, description, status, priority, client_id, agent_id, created_at FROM projects WHERE client_id = ?',
      [user.id]
    );
    
    console.log('\n📋 Projets en tant que client:', clientProjects.length);
    if (clientProjects.length > 0) {
      clientProjects.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.title} (ID: ${project.id})`);
        console.log(`     - Statut: ${project.status}`);
        console.log(`     - Priorité: ${project.priority}`);
        console.log(`     - Agent ID: ${project.agent_id}`);
        console.log(`     - Créé le: ${project.created_at}`);
      });
    }
    
    // Vérifier les projets où l'utilisateur est agent
    const agentProjects = await databaseService.query(
      'SELECT id, title, description, status, priority, client_id, agent_id, created_at FROM projects WHERE agent_id = ?',
      [user.id]
    );
    
    console.log('\n🔧 Projets en tant qu\'agent:', agentProjects.length);
    if (agentProjects.length > 0) {
      agentProjects.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.title} (ID: ${project.id})`);
        console.log(`     - Statut: ${project.status}`);
        console.log(`     - Priorité: ${project.priority}`);
        console.log(`     - Client ID: ${project.client_id}`);
        console.log(`     - Créé le: ${project.created_at}`);
      });
    }
    
    // Vérifier tous les projets dans la base
    const allProjects = await databaseService.query(
      'SELECT id, title, client_id, agent_id, status FROM projects ORDER BY created_at DESC LIMIT 10'
    );
    
    console.log('\n📊 Tous les projets (10 derniers):');
    if (allProjects.length > 0) {
      allProjects.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.title} (ID: ${project.id})`);
        console.log(`     - Client ID: ${project.client_id}`);
        console.log(`     - Agent ID: ${project.agent_id}`);
        console.log(`     - Statut: ${project.status}`);
      });
    } else {
      console.log('  Aucun projet trouvé dans la base de données');
    }
    
    // Vérifier les utilisateurs clients
    const clients = await databaseService.query(
      'SELECT id, email, first_name, last_name FROM users WHERE role = "client" LIMIT 5'
    );
    
    console.log('\n👥 Clients dans la base (5 premiers):');
    if (clients.length > 0) {
      clients.forEach((client, index) => {
        console.log(`  ${index + 1}. ${client.email} (ID: ${client.id}) - ${client.first_name} ${client.last_name}`);
      });
    } else {
      console.log('  Aucun client trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

checkUserProjects();