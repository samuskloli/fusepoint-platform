/**
 * Script de migration MariaDB pour créer les tables et ajouter les colonnes nécessaires
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Charger la configuration depuis .env.mariadb
function loadMariaDBConfig() {
  const envPath = path.join(__dirname, '.env.mariadb');
  if (!fs.existsSync(envPath)) {
    throw new Error('Fichier .env.mariadb non trouvé');
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const config = {};
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      config[key.trim()] = value.trim();
    }
  });
  
  return {
    host: config.MARIADB_HOST || 'localhost',
    port: parseInt(config.MARIADB_PORT) || 3306,
    user: config.MARIADB_USER,
    password: config.MARIADB_PASSWORD,
    database: config.MARIADB_DATABASE
  };
}

async function migrateMariaDB() {
  console.log('🔄 Migration de la base de données MariaDB...');
  
  try {
    const config = loadMariaDBConfig();
    
    // Connexion à MariaDB
    const connection = await mysql.createConnection(config);
    console.log('✅ Connexion à MariaDB établie');
    
    // Créer la table users si elle n'existe pas
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        is_confirmed BOOLEAN DEFAULT FALSE,
        confirmation_token VARCHAR(255),
        token_expiry DATETIME,
        reset_token VARCHAR(255),
        reset_token_expiry DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createUsersTable);
    console.log('✅ Table users créée ou vérifiée');
    
    // Créer la table campaigns si elle n'existe pas
    const createCampaignsTable = `
      CREATE TABLE IF NOT EXISTS campaigns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('draft', 'active', 'paused', 'completed') DEFAULT 'draft',
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createCampaignsTable);
    console.log('✅ Table campaigns créée ou vérifiée');
    
    // Créer la table leads si elle n'existe pas
    const createLeadsTable = `
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        phone VARCHAR(50),
        company VARCHAR(255),
        status ENUM('new', 'contacted', 'qualified', 'converted') DEFAULT 'new',
        source VARCHAR(255),
        campaign_id INT,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createLeadsTable);
    console.log('✅ Table leads créée ou vérifiée');
    
    // Créer la table analytics si elle n'existe pas
    const createAnalyticsTable = `
      CREATE TABLE IF NOT EXISTS analytics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        event_data JSON,
        campaign_id INT,
        lead_id INT,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createAnalyticsTable);
    console.log('✅ Table analytics créée ou vérifiée');
    
    // Vérifier la structure des tables
    const [usersColumns] = await connection.execute('DESCRIBE users');
    console.log('\n📋 Structure de la table users:');
    usersColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });
    
    const [campaignsColumns] = await connection.execute('DESCRIBE campaigns');
    console.log('\n📋 Structure de la table campaigns:');
    campaignsColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });
    
    const [leadsColumns] = await connection.execute('DESCRIBE leads');
    console.log('\n📋 Structure de la table leads:');
    leadsColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });
    
    const [analyticsColumns] = await connection.execute('DESCRIBE analytics');
    console.log('\n📋 Structure de la table analytics:');
    analyticsColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });
    
    await connection.end();
    console.log('\n🎉 Migration MariaDB terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration MariaDB:', error);
    process.exit(1);
  }
}

// Exécuter la migration
migrateMariaDB();