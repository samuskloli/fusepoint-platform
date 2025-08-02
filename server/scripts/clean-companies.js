const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin vers la base de données
const dbPath = path.join(__dirname, '../database/fusepoint.db');

// Fonction utilitaire pour promisifier les requêtes SQLite
function dbRun(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// Fonction pour nettoyer et recréer les entreprises
async function cleanCompanies() {
  const db = new sqlite3.Database(dbPath);
  
  try {
    console.log('🧹 Nettoyage de la table companies...');
    
    // Supprimer toutes les entreprises
    await dbRun(db, 'DELETE FROM companies');
    
    // Réinitialiser l'auto-increment
    await dbRun(db, 'DELETE FROM sqlite_sequence WHERE name="companies"');
    
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
      await dbRun(db, `
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
    db.close();
  }
}

// Exécuter le nettoyage
cleanCompanies().catch(console.error);