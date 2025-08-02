const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin vers la base de données
const dbPath = path.join(__dirname, '../database/fusepoint.db');

// Fonction utilitaire pour promisifier les requêtes SQLite
function dbAll(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function dbRun(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// Fonction pour migrer vers le système de companies
async function migrateToCompanies() {
  const db = new sqlite3.Database(dbPath);
  
  try {
    console.log('🔄 Début de la migration vers le système de companies...');
    
    // 1. Créer quelques entreprises par défaut
    const defaultCompanies = [
      { name: 'Entreprise Générale', description: 'Entreprise par défaut pour les clients sans entreprise spécifique' },
      { name: 'Startup Tech', description: 'Entreprise technologique innovante' },
      { name: 'Commerce Local', description: 'Commerce de proximité' },
      { name: 'Services Professionnels', description: 'Entreprise de services aux professionnels' }
    ];
    
    // Insérer les entreprises par défaut
    for (const company of defaultCompanies) {
      await dbRun(db, 'INSERT OR IGNORE INTO companies (name, description) VALUES (?, ?)', 
        [company.name, company.description]);
    }
    
    console.log(`✅ ${defaultCompanies.length} entreprises par défaut créées`);
    
    // 2. Migrer les données existantes des users
    const existingCompanies = await dbAll(db, `
      SELECT DISTINCT company 
      FROM users 
      WHERE company IS NOT NULL AND company != ''
    `);
    
    console.log(`📊 Trouvé ${existingCompanies.length} entreprises uniques dans les données existantes`);
    
    // Créer les entreprises manquantes
    for (const row of existingCompanies) {
      if (row.company) {
        await dbRun(db, 'INSERT OR IGNORE INTO companies (name) VALUES (?)', [row.company]);
      }
    }
    
    // 3. Mettre à jour les company_id dans la table users
    const userCompanyRows = await dbAll(db, `
      SELECT u.id, u.company, c.id as company_id
      FROM users u
      LEFT JOIN companies c ON u.company = c.name
      WHERE u.company IS NOT NULL AND u.company != ''
    `);
    
    console.log(`🔄 Mise à jour de ${userCompanyRows.length} utilisateurs avec company_id`);
    
    for (const row of userCompanyRows) {
      if (row.company_id) {
        await dbRun(db, 'UPDATE users SET company_id = ? WHERE id = ?', 
          [row.company_id, row.id]);
      }
    }
    
    // 4. Mettre à jour les company_id dans la table projects
    const projectRows = await dbAll(db, `
      SELECT p.id, u.company_id
      FROM projects p
      JOIN users u ON p.client_id = u.id
      WHERE u.company_id IS NOT NULL
    `);
    
    console.log(`🔄 Mise à jour de ${projectRows.length} projets avec company_id`);
    
    for (const row of projectRows) {
      await dbRun(db, 'UPDATE projects SET company_id = ? WHERE id = ?', 
        [row.company_id, row.id]);
    }
    
    console.log('✅ Migration terminée avec succès!');
    console.log('📋 Résumé:');
    console.log(`   - Entreprises créées: ${defaultCompanies.length + existingCompanies.length}`);
    console.log(`   - Utilisateurs mis à jour: ${userCompanyRows.length}`);
    console.log(`   - Projets mis à jour: ${projectRows.length}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrateToCompanies()
    .then(() => {
      console.log('🎉 Migration terminée!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur lors de la migration:', error);
      process.exit(1);
    });
}

module.exports = { migrateToCompanies };