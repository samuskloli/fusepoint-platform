const mysql = require('mysql2/promise');
const path = require('path');

// Configuration de la base de données MariaDB
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fusepoint',
  port: process.env.DB_PORT || 3306
};

// Fonction utilitaire pour exécuter les requêtes MariaDB
async function dbRun(connection, query, params = []) {
  const [result] = await connection.execute(query, params);
  return { insertId: result.insertId, affectedRows: result.affectedRows };
}

// Fonction pour nettoyer et recréer les entreprises
async function cleanCompanies() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🧹 Nettoyage de la table companies...');
    
    // Supprimer toutes les entreprises
    await dbRun(connection, 'DELETE FROM companies');
    
    // Réinitialiser l'auto-increment
    await dbRun(connection, 'ALTER TABLE companies AUTO_INCREMENT = 1');
    
    console.log('✅ Table companies nettoyée');
    
    // Recréer les entreprises par défaut
    const defaultCompanies = [
      { 
        name: 'Fusepoint Demo', 
        description: 'Entreprise de démonstration Fusepoint',
        industry: 'Marketing Digital',
        size: 'PME',
        location: 'France',
        website: 'https://fusepoint.com'
      },
      { 
        name: 'E-commerce Plus', 
        description: 'Plateforme e-commerce innovante',
        industry: 'E-commerce',
        size: 'Startup',
        location: 'Paris, France',
        website: 'https://ecommerce-plus.com'
      },
      { 
        name: 'Entreprise Générale', 
        description: 'Entreprise par défaut pour les clients sans entreprise spécifique'
      },
      { 
        name: 'Startup Tech', 
        description: 'Entreprise technologique innovante'
      },
      { 
        name: 'Commerce Local', 
        description: 'Commerce de proximité'
      },
      { 
        name: 'Services Professionnels', 
        description: 'Entreprise de services aux professionnels'
      }
    ];
    
    // Insérer les entreprises
    for (const company of defaultCompanies) {
      await dbRun(connection, `
        INSERT INTO companies (name, description, industry, size, location, website) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        company.name, 
        company.description || null,
        company.industry || null,
        company.size || null,
        company.location || null,
        company.website || null
      ]);
    }
    
    console.log(`✅ ${defaultCompanies.length} entreprises créées`);
    console.log('🎉 Nettoyage terminé!');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Exécuter le nettoyage
cleanCompanies().catch(console.error);