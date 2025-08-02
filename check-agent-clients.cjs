const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkAgentClients() {
  console.log('🔍 Vérification des clients pour agent@fusepoint.ch...');
  
  const dbPath = path.join(__dirname, 'server/database/fusepoint.db');
  
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Erreur connexion DB:', err.message);
      return;
    }
    console.log('✅ Connexion à la base de données établie');
  });

  // Vérifier l'agent agent@fusepoint.ch
  db.get('SELECT id, email, first_name, last_name, role FROM users WHERE email = ?', ['agent@fusepoint.ch'], (err, agent) => {
    if (err) {
      console.error('❌ Erreur requête agent:', err.message);
      return;
    }
    
    if (!agent) {
      console.log('❌ Agent agent@fusepoint.ch non trouvé dans la base de données');
      db.close();
      return;
    }
    
    console.log('\n👤 Agent trouvé:');
    console.log(`  ID: ${agent.id}`);
    console.log(`  Email: ${agent.email}`);
    console.log(`  Nom: ${agent.first_name} ${agent.last_name}`);
    console.log(`  Rôle: ${agent.role}`);
    
    const agentId = agent.id;
    
    // Vérifier les clients assignés via agent_id
    db.all('SELECT id, email, first_name, last_name, agent_id, role, is_active FROM users WHERE agent_id = ? AND role IN ("user", "client")', [agentId], (err, assignedClients) => {
      if (err) {
        console.error('❌ Erreur requête clients assignés:', err.message);
        return;
      }
      
      console.log(`\n📋 Clients assignés à l'agent ${agent.email} (via agent_id):`);
      if (assignedClients.length === 0) {
        console.log('  ❌ Aucun client assigné trouvé');
      } else {
        assignedClients.forEach((client, index) => {
          console.log(`  ${index + 1}. ${client.first_name} ${client.last_name} (${client.email})`);
          console.log(`     ID: ${client.id}, Agent ID: ${client.agent_id}, Actif: ${client.is_active}`);
        });
      }
      
      // Vérifier tous les clients disponibles
      db.all('SELECT id, email, first_name, last_name, agent_id, role, is_active FROM users WHERE role IN ("user", "client")', [], (err, allClients) => {
        if (err) {
          console.error('❌ Erreur requête tous clients:', err.message);
          return;
        }
        
        console.log(`\n📊 Tous les clients dans la base de données:`);
        if (allClients.length === 0) {
          console.log('  ❌ Aucun client trouvé dans la base de données');
        } else {
          allClients.forEach((client, index) => {
            const assignedTo = client.agent_id ? `Agent ID: ${client.agent_id}` : 'Non assigné';
            console.log(`  ${index + 1}. ${client.first_name} ${client.last_name} (${client.email})`);
            console.log(`     ID: ${client.id}, ${assignedTo}, Actif: ${client.is_active}`);
          });
        }
        
        // Fermer la connexion
        db.close((err) => {
          if (err) {
            console.error('❌ Erreur fermeture DB:', err.message);
          } else {
            console.log('\n✅ Vérification terminée');
          }
        });
      });
    });
  });
}

checkAgentClients();