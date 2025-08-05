/**
 * Script de debug pour vérifier l'assignation des clients aux agents
 */

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function debugClientAssignment() {
  console.log('🔍 Debug - Vérification de l\'assignation des clients aux agents...');
  
  try {
    // Ouvrir la base de données
    const db = await open({
      filename: path.join(__dirname, 'server/database/fusepoint.db'),
      driver: sqlite3.Database
    });
    
    console.log('✅ Base de données ouverte');
    
    // Vérifier la structure de la table users
    console.log('\n📋 Structure de la table users:');
    const tableInfo = await db.all('PRAGMA table_info(users)');
    tableInfo.forEach(column => {
      console.log(`  - ${column.name}: ${column.type} ${column.notnull ? 'NOT NULL' : ''} ${column.dflt_value ? `DEFAULT ${column.dflt_value}` : ''}`);
    });
    
    // Vérifier s'il y a des agents
    console.log('\n👥 Agents dans la base de données:');
    const agents = await db.all('SELECT id, email, first_name, last_name, role FROM users WHERE role IN ("agent", "admin", "super_admin")');
    console.log(`Nombre d'agents: ${agents.length}`);
    agents.forEach(agent => {
      console.log(`  - ID: ${agent.id}, Email: ${agent.email}, Nom: ${agent.first_name} ${agent.last_name}, Rôle: ${agent.role}`);
    });
    
    // Vérifier s'il y a des clients
    console.log('\n👤 Clients dans la base de données:');
    const clients = await db.all('SELECT id, email, first_name, last_name, role, agent_id FROM users WHERE role IN ("user", "client")');
    console.log(`Nombre de clients: ${clients.length}`);
    clients.forEach(client => {
      console.log(`  - ID: ${client.id}, Email: ${client.email}, Nom: ${client.first_name} ${client.last_name}, Agent ID: ${client.agent_id || 'NON ASSIGNÉ'}`);
    });
    
    // Vérifier les assignations
    console.log('\n🔗 Assignations clients-agents:');
    const assignments = await db.all(`
      SELECT 
        c.id as client_id, 
        c.email as client_email, 
        c.first_name as client_first_name, 
        c.last_name as client_last_name,
        a.id as agent_id,
        a.email as agent_email,
        a.first_name as agent_first_name,
        a.last_name as agent_last_name
      FROM users c
      LEFT JOIN users a ON c.agent_id = a.id
      WHERE c.role IN ('user', 'client')
    `);
    
    const assignedClients = assignments.filter(a => a.agent_id);
    const unassignedClients = assignments.filter(a => !a.agent_id);
    
    console.log(`Clients assignés: ${assignedClients.length}`);
    assignedClients.forEach(assignment => {
      console.log(`  - Client: ${assignment.client_first_name} ${assignment.client_last_name} (${assignment.client_email}) → Agent: ${assignment.agent_first_name} ${assignment.agent_last_name} (${assignment.agent_email})`);
    });
    
    console.log(`\nClients non assignés: ${unassignedClients.length}`);
    unassignedClients.forEach(client => {
      console.log(`  - ${client.client_first_name} ${client.client_last_name} (${client.client_email})`);
    });
    
    await db.close();
    console.log('\n✅ Debug terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du debug:', error);
  }
}

// Exécuter le script
debugClientAssignment();