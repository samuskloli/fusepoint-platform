/**
 * Script pour diagnostiquer les assignations d'agents
 */

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function debugAgentAssignments() {
  console.log('🔍 Diagnostic des assignations d\'agents...');
  
  try {
    // Ouvrir la base de données
    const db = await open({
      filename: path.join(__dirname, 'database/fusepoint.db'),
      driver: sqlite3.Database
    });
    
    console.log('✅ Base de données ouverte');
    
    // Vérifier la structure de la table users
    console.log('\n📋 Structure de la table users:');
    const tableInfo = await db.all('PRAGMA table_info(users)');
    const hasAgentId = tableInfo.some(col => col.name === 'agent_id');
    console.log(`Colonne agent_id présente: ${hasAgentId ? '✅' : '❌'}`);
    
    // Compter les utilisateurs par rôle
    console.log('\n👥 Statistiques des utilisateurs:');
    const userStats = await db.all(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `);
    userStats.forEach(stat => {
      console.log(`  - ${stat.role}: ${stat.count}`);
    });
    
    // Vérifier les agents disponibles
    console.log('\n🔧 Agents disponibles:');
    const agents = await db.all(`
      SELECT id, email, first_name, last_name, role 
      FROM users 
      WHERE role IN ('agent', 'admin', 'super_admin')
    `);
    console.log(`Nombre d'agents: ${agents.length}`);
    agents.forEach(agent => {
      console.log(`  - ID: ${agent.id}, Email: ${agent.email}, Nom: ${agent.first_name} ${agent.last_name}`);
    });
    
    // Vérifier les clients et leurs assignations
    console.log('\n👤 Clients et assignations:');
    const clients = await db.all(`
      SELECT 
        c.id, 
        c.email, 
        c.first_name, 
        c.last_name, 
        c.agent_id,
        a.email as agent_email,
        a.first_name as agent_first_name,
        a.last_name as agent_last_name
      FROM users c
      LEFT JOIN users a ON c.agent_id = a.id
      WHERE c.role IN ('user', 'client')
      ORDER BY c.id
    `);
    
    const assignedClients = clients.filter(c => c.agent_id);
    const unassignedClients = clients.filter(c => !c.agent_id);
    
    console.log(`Total clients: ${clients.length}`);
    console.log(`Clients assignés: ${assignedClients.length}`);
    console.log(`Clients non assignés: ${unassignedClients.length}`);
    
    if (assignedClients.length > 0) {
      console.log('\n✅ Clients assignés:');
      assignedClients.forEach(client => {
        console.log(`  - ${client.first_name} ${client.last_name} (${client.email}) → Agent: ${client.agent_first_name} ${client.agent_last_name} (${client.agent_email})`);
      });
    }
    
    if (unassignedClients.length > 0) {
      console.log('\n⚠️ Clients non assignés:');
      unassignedClients.forEach(client => {
        console.log(`  - ${client.first_name} ${client.last_name} (${client.email})`);
      });
      
      // Proposer une solution d'auto-assignation
      if (agents.length > 0) {
        console.log('\n💡 Solution proposée:');
        console.log('Assignation automatique des clients non assignés au premier agent disponible...');
        
        const firstAgent = agents[0];
        console.log(`Agent sélectionné: ${firstAgent.first_name} ${firstAgent.last_name} (ID: ${firstAgent.id})`);
        
        // Demander confirmation avant d'assigner
        console.log('\n⚠️ Pour assigner automatiquement, exécutez:');
        console.log(`UPDATE users SET agent_id = ${firstAgent.id} WHERE role IN ('user', 'client') AND agent_id IS NULL;`);
      }
    }
    
    await db.close();
    console.log('\n🎉 Diagnostic terminé!');
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
}

// Exécuter le diagnostic
debugAgentAssignments();