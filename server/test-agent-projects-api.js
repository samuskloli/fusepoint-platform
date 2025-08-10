const axios = require('axios');

async function testAgentProjectsAPI() {
  try {
    console.log('🔍 Test de l\'API des projets d\'agent...');
    
    // 1. Se connecter pour obtenir un token
    console.log('\n🔐 1. Connexion...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@fusepoint.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Échec de la connexion');
    }
    
    const token = loginResponse.data.loginResult.tokens.accessToken;
    console.log('✅ Connexion réussie, token obtenu');
    
    // 2. Tester l'endpoint /api/agent/projects
    console.log('\n📁 2. Test de /api/agent/projects...');
    const projectsResponse = await axios.get('http://localhost:3000/api/agent/projects', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', projectsResponse.status);
    console.log('Données reçues:', JSON.stringify(projectsResponse.data, null, 2));
    
    if (projectsResponse.data.success && projectsResponse.data.data) {
      const projects = projectsResponse.data.data.projects || projectsResponse.data.data;
      console.log(`\n📊 Nombre de projets retournés: ${projects.length}`);
      
      if (projects.length > 0) {
        console.log('\n📋 Premiers projets:');
        projects.slice(0, 3).forEach((project, index) => {
          console.log(`${index + 1}. "${project.name}" - Client: ${project.first_name} ${project.last_name} (ID: ${project.client_id})`);
        });
      } else {
        console.log('⚠️ Aucun projet retourné par l\'API');
      }
    }
    
    // 3. Tester l'endpoint /api/agent/assigned-clients
    console.log('\n👥 3. Test de /api/agent/assigned-clients...');
    const clientsResponse = await axios.get('http://localhost:3000/api/agent/assigned-clients', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', clientsResponse.status);
    console.log('Clients assignés:', clientsResponse.data.data?.length || 0);
    
    if (clientsResponse.data.data && clientsResponse.data.data.length > 0) {
      console.log('\n👤 Premiers clients:');
      clientsResponse.data.data.slice(0, 3).forEach((client, index) => {
        console.log(`${index + 1}. ${client.first_name} ${client.last_name} (${client.email}) - ID: ${client.id}`);
      });
      
      // 4. Tester les projets d'un client spécifique
      const firstClientId = clientsResponse.data.data[0].id;
      console.log(`\n📁 4. Test des projets du client ${firstClientId}...`);
      
      const clientProjectsResponse = await axios.get(`http://localhost:3000/api/agent/clients/${firstClientId}/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Status:', clientProjectsResponse.status);
      console.log('Projets du client:', JSON.stringify(clientProjectsResponse.data, null, 2));
    }
    
    console.log('\n✅ Test terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('❌ Stack:', error.stack);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    if (error.code) {
      console.error('Code:', error.code);
    }
  }
}

testAgentProjectsAPI().catch(console.error);