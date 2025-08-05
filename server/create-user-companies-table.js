const MariaDBService = require('./services/mariadbService');

async function createUserCompaniesTable() {
  const mariadbService = new MariaDBService();
  
  try {
    console.log('🔄 Initialisation de la connexion MariaDB...');
    await mariadbService.initialize();
    
    console.log('🔧 Création de la table user_companies...');
    
    // Créer d'abord la table companies si elle n'existe pas
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
    
    // Créer la table user_companies
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
    console.log('✅ Table user_companies créée');
    
    // Insérer une entreprise par défaut
    await mariadbService.query(`
      INSERT IGNORE INTO companies (id, name, industry, size, location, website) VALUES 
      (1, 'Fusepoint Demo', 'Marketing Digital', 'PME', 'France', 'https://fusepoint.com')
    `);
    console.log('✅ Entreprise par défaut créée');
    
    // Associer l'utilisateur existant (ID 11) à l'entreprise
    await mariadbService.query(`
      INSERT IGNORE INTO user_companies (user_id, company_id, role, permissions) VALUES 
      (11, 1, 'owner', '{"admin": true, "analytics": true, "social": true}')
    `);
    console.log('✅ Association utilisateur-entreprise créée');
    
    // Vérifier que la table existe
    const tables = await mariadbService.query('SHOW TABLES LIKE "user_companies"');
    console.log('📊 Tables trouvées:', tables);
    
    // Vérifier le contenu
    const userCompanies = await mariadbService.query('SELECT * FROM user_companies');
    console.log('📋 Contenu user_companies:', userCompanies);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    if (mariadbService.pool) {
      await mariadbService.close();
    }
    process.exit(0);
  }
}

createUserCompaniesTable();