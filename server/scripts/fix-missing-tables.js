const databaseService = require('../services/databaseService');
const systemLogsService = require('../services/systemLogsService');

async function createMissingTables() {
  try {
    console.log('🔧 Initialisation des tables manquantes...');
    
    // Initialiser la base de données principale
    await databaseService.initialize();
    console.log('✅ Base de données principale initialisée');
    
    // Créer la table system_logs
    const createSystemLogsQuery = `
      CREATE TABLE IF NOT EXISTS system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        user_id INTEGER,
        ip_address TEXT,
        user_agent TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await databaseService.run(createSystemLogsQuery);
    console.log('✅ Table system_logs créée');
    
    // Créer la table accompagnement_requests
    const createAccompagnementRequestsQuery = `
      CREATE TABLE IF NOT EXISTS accompagnement_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        company_id INTEGER,
        type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        priority VARCHAR(20) DEFAULT 'normal',
        assigned_to INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
      )
    `;
    
    await databaseService.run(createAccompagnementRequestsQuery);
    console.log('✅ Table accompagnement_requests créée');
    
    // Créer la table messages si elle n'existe pas
    const createMessagesQuery = `
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        recipient_id INTEGER NOT NULL,
        conversation_id INTEGER,
        content TEXT NOT NULL,
        message_type VARCHAR(50) DEFAULT 'text',
        read_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    
    await databaseService.run(createMessagesQuery);
    console.log('✅ Table messages créée');
    
    console.log('🎉 Toutes les tables manquantes ont été créées avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  createMissingTables().then(() => {
    console.log('✅ Script terminé avec succès');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = { createMissingTables };