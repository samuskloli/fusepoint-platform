const path = require('path');
const MariaDBConfig = require('../config/mariadb.config');

/**
 * Script pour synchroniser les assignations agent-client
 * entre la colonne users.agent_id et la table agent_clients
 */
async function syncAgentClientAssignments() {
  let conn;
  
  try {
    console.log('🔄 Début de la synchronisation des assignations agent-client...');
    
    // Créer une instance de configuration MariaDB
    const config = new MariaDBConfig();
    conn = await config.getConnection();
    
    console.log('✅ Connexion à la base de données établie');
    
    // 1. Vider la table agent_clients pour éviter les doublons
    console.log('🗑️ Suppression des anciennes assignations dans agent_clients...');
    await conn.query('DELETE FROM agent_clients');
    
    // 2. Insérer toutes les assignations basées sur users.agent_id
    console.log('📝 Insertion des assignations basées sur users.agent_id...');
    const insertQuery = `
      INSERT INTO agent_clients (agent_id, client_id, status, assigned_at, created_at, updated_at)
      SELECT 
        u.agent_id,
        u.id as client_id,
        'active' as status,
        NOW() as assigned_at,
        NOW() as created_at,
        NOW() as updated_at
      FROM users u
      WHERE u.agent_id IS NOT NULL 
        AND u.role IN ('user', 'client')
        AND u.agent_id IN (SELECT id FROM users WHERE role IN ('agent', 'admin', 'super_admin'))
    `;
    
    const result = await conn.query(insertQuery);
    console.log(`✅ ${result.affectedRows} assignations synchronisées dans agent_clients`);
    
    // 3. Vérifier les assignations créées
    const verificationQuery = `
      SELECT 
        ac.agent_id,
        a.first_name as agent_first_name,
        a.last_name as agent_last_name,
        a.email as agent_email,
        COUNT(ac.client_id) as clients_count
      FROM agent_clients ac
      JOIN users a ON ac.agent_id = a.id
      GROUP BY ac.agent_id, a.first_name, a.last_name, a.email
      ORDER BY clients_count DESC
    `;
    
    const verification = await conn.query(verificationQuery);
    
    console.log('\n📊 Résumé des assignations:');
    verification.forEach(row => {
      console.log(`   Agent: ${row.agent_first_name} ${row.agent_last_name} (${row.agent_email}) - ${row.clients_count} client(s)`);
    });
    
    // 4. Afficher les détails des assignations
    const detailsQuery = `
      SELECT 
        a.first_name as agent_first_name,
        a.last_name as agent_last_name,
        a.email as agent_email,
        c.first_name as client_first_name,
        c.last_name as client_last_name,
        c.email as client_email,
        ac.status
      FROM agent_clients ac
      JOIN users a ON ac.agent_id = a.id
      JOIN users c ON ac.client_id = c.id
      ORDER BY a.email, c.email
    `;
    
    const details = await conn.query(detailsQuery);
    
    console.log('\n📋 Détails des assignations:');
    details.forEach(row => {
      console.log(`   ${row.agent_first_name} ${row.agent_last_name} (${row.agent_email}) -> ${row.client_first_name} ${row.client_last_name} (${row.client_email}) [${row.status}]`);
    });
    
    console.log('\n✅ Synchronisation terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
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
  syncAgentClientAssignments()
    .then(() => {
      console.log('🎉 Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { syncAgentClientAssignments };