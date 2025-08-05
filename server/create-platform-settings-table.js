const MariaDBService = require('./services/mariadbService');

async function createPlatformSettingsTable() {
  const mariadbService = new MariaDBService();
  
  try {
    console.log('🔄 Initialisation de la connexion MariaDB...');
    await mariadbService.initialize();
    
    console.log('🔧 Création de la table platform_settings...');
    
    // Créer la table platform_settings
    await mariadbService.query(`
      CREATE TABLE IF NOT EXISTS platform_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        \`key\` VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        type VARCHAR(50) DEFAULT 'string',
        category VARCHAR(100) DEFAULT 'general',
        description TEXT,
        is_sensitive BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table platform_settings créée');
    
    // Insérer des paramètres par défaut
    const defaultSettings = [
      ['frontend_url', 'https://fusepoint.ch', 'url', 'general', 'URL de production de la plateforme'],
      ['session_timeout', '3600', 'number', 'security', 'Durée de session en secondes'],
      ['max_upload_size', '10485760', 'number', 'files', 'Taille maximale de fichier en bytes (10MB)'],
      ['email_notifications', 'true', 'boolean', 'notifications', 'Activer les notifications par email'],
      ['maintenance_mode', 'false', 'boolean', 'system', 'Mode maintenance activé']
    ];
    
    for (const [key, value, type, category, description] of defaultSettings) {
      await mariadbService.query(`
        INSERT IGNORE INTO platform_settings (\`key\`, value, type, category, description) 
        VALUES (?, ?, ?, ?, ?)
      `, [key, value, type, category, description]);
    }
    
    console.log('✅ Paramètres par défaut insérés');
    
    // Vérifier le contenu
    const settings = await mariadbService.query('SELECT * FROM platform_settings');
    console.log('📋 Paramètres créés:', settings.length);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    if (mariadbService.pool) {
      await mariadbService.close();
    }
    process.exit(0);
  }
}

createPlatformSettingsTable();