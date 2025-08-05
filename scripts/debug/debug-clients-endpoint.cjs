const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin vers la base de données
const dbPath = path.join(__dirname, 'server', 'database', 'fusepoint.db');

console.log('🔍 Vérification de l\'endpoint /api/agent/clients');
console.log('📍 Base de données:', dbPath);

// Connexion à la base de données
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
    return;
  }
  console.log('✅ Connexion à la base de données réussie');
});

// Requête SQL simplifiée basée sur la structure réelle
const query = `
  SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    u.created_at,
    u.updated_at,
    u.is_active,
    u.agent_id,
    u.role,
    a.id as assigned_agent_id,
    a.first_name as agent_first_name,
    a.last_name as agent_last_name,
    a.email as agent_email
  FROM users u
  LEFT JOIN users a ON u.agent_id = a.id AND a.role = 'agent'
  WHERE u.role IN ('user', 'client')
  AND u.is_active = 1
  ORDER BY u.created_at DESC
`;

console.log('\n🔍 Exécution de la requête SQL:');
console.log(query);

db.all(query, [], (err, clients) => {
  if (err) {
    console.error('❌ Erreur lors de l\'exécution de la requête:', err.message);
    return;
  }

  console.log(`\n📊 Résultats: ${clients.length} clients trouvés`);
  
  if (clients.length === 0) {
    console.log('⚠️ Aucun client trouvé!');
    
    // Vérifier s'il y a des utilisateurs dans la base
    db.all('SELECT id, email, role, is_active FROM users', [], (err, allUsers) => {
      if (err) {
        console.error('❌ Erreur:', err.message);
        return;
      }
      
      console.log(`\n👥 Tous les utilisateurs (${allUsers.length}):`);
      allUsers.forEach(user => {
        console.log(`  - ID: ${user.id}, Email: ${user.email}, Rôle: ${user.role}, Actif: ${user.is_active}`);
      });
      
      db.close();
    });
  } else {
    console.log('\n👥 Clients trouvés:');
    clients.forEach(client => {
      console.log(`  - ${client.first_name} ${client.last_name} (${client.email})`);
      console.log(`    Rôle: ${client.role}, Actif: ${client.is_active}`);
      if (client.agent_first_name) {
        console.log(`    Agent: ${client.agent_first_name} ${client.agent_last_name}`);
      } else {
        console.log(`    Agent: Non assigné`);
      }
      console.log('');
    });
    
    db.close();
  }
});