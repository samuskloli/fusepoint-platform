const MariaDBService = require('./services/mariadbService');

async function setupCompleteDatabase() {
  const mariadbService = new MariaDBService();
  
  try {
    console.log('🔄 Initialisation de la connexion MariaDB...');
    await mariadbService.initialize();
    
    console.log('🔧 Création des tables principales...');
    
    // 1. Créer la table users si elle n'existe pas
    await mariadbService.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        status VARCHAR(50) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table users vérifiée/créée');
    
    // 2. Créer la table companies
    await mariadbService.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        industry VARCHAR(100),
        size VARCHAR(50),
        location VARCHAR(255),
        website VARCHAR(255),
        description TEXT,
        logo_url VARCHAR(500),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table companies vérifiée/créée');
    
    // 3. Créer la table user_companies
    await mariadbService.query(`
      CREATE TABLE IF NOT EXISTS user_companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        company_id INT NOT NULL,
        role VARCHAR(50) DEFAULT 'member',
        permissions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        UNIQUE(user_id, company_id)
      )
    `);
    console.log('✅ Table user_companies vérifiée/créée');
    
    // 4. Créer la table user_sessions
    await mariadbService.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table user_sessions vérifiée/créée');
    
    // 5. Créer la table audit_logs
    await mariadbService.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Table audit_logs vérifiée/créée');
    
    // Insérer des données par défaut
    console.log('📊 Insertion des données par défaut...');
    
    // Entreprise par défaut
    await mariadbService.query(`
      INSERT IGNORE INTO companies (id, name, industry, size, location, website) VALUES 
      (1, 'Fusepoint Demo', 'Marketing Digital', 'PME', 'France', 'https://fusepoint.com')
    `);
    
    // Vérifier si l'utilisateur existe
    const existingUser = await mariadbService.query('SELECT id FROM users WHERE id = 11');
    if (existingUser.length === 0) {
      // Créer un utilisateur par défaut
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await mariadbService.query(`
        INSERT INTO users (id, username, email, password, role) VALUES 
        (11, 'admin', 'admin@fusepoint.com', ?, 'admin')
      `, [hashedPassword]);
      console.log('✅ Utilisateur admin créé');
    }
    
    // Association utilisateur-entreprise
    await mariadbService.query(`
      INSERT IGNORE INTO user_companies (user_id, company_id, role, permissions) VALUES 
      (11, 1, 'owner', '{"admin": true, "analytics": true, "social": true}')
    `);
    
    console.log('✅ Données par défaut insérées');
    
    // Vérification finale
    console.log('🔍 Vérification finale...');
    const tables = await mariadbService.query('SHOW TABLES');
    console.log('📋 Tables disponibles:', tables.map(t => Object.values(t)[0]));
    
    const userCompanies = await mariadbService.query('SELECT COUNT(*) as count FROM user_companies');
    console.log('📊 Nombre d\'associations user_companies:', userCompanies[0].count);
    
    console.log('🎉 Base de données configurée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    if (mariadbService.pool) {
      await mariadbService.close();
    }
    process.exit(0);
  }
}

setupCompleteDatabase();