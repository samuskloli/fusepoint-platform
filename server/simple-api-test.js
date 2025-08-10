const http = require('http');

function makeRequest(path, method = 'GET', headers = {}, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5173,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testAPI() {
  try {
    console.log('🔍 Test de connectivité API...');
    
    // Test de santé
    console.log('\n1. Test endpoint /health');
    const healthResponse = await makeRequest('/health');
    console.log('Status:', healthResponse.status);
    console.log('Data:', healthResponse.data);
    
    // Test de connexion
    console.log('\n2. Test connexion agent');
    const loginResponse = await makeRequest('/api/auth/login', 'POST', {}, {
      email: 'agent@fusepoint.ch',
      password: 'agent123'
    });
    console.log('Status:', loginResponse.status);
    console.log('Data:', loginResponse.data);
    
    if (loginResponse.status === 200 && loginResponse.data.token) {
      const token = loginResponse.data.token;
      
      // Test récupération des projets
      console.log('\n3. Test récupération des projets');
      const projectsResponse = await makeRequest('/api/agent/projects', 'GET', {
        'Authorization': `Bearer ${token}`
      });
      console.log('Status:', projectsResponse.status);
      console.log('Data:', JSON.stringify(projectsResponse.data, null, 2));
      
      // Test récupération des clients assignés
      console.log('\n4. Test récupération des clients assignés');
      const clientsResponse = await makeRequest('/api/agent/assigned-clients', 'GET', {
        'Authorization': `Bearer ${token}`
      });
      console.log('Status:', clientsResponse.status);
      console.log('Data:', JSON.stringify(clientsResponse.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testAPI();