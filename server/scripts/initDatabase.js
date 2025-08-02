const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

/**
 * Script d'initialisation de la base de données
 */
async function initializeDatabase() {
  try {
    console.log('🚀 Initialisation de la base de données...');
    
    // Chemin vers la base de données
    const dbPath = path.join(__dirname, '..', 'database', 'fusepoint.db');
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    
    // Créer le répertoire database s'il n'existe pas
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log('📁 Répertoire database créé');
    }
    
    // Lire le fichier SQL
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Fichier schema.sql non trouvé:', schemaPath);
      process.exit(1);
    }
    
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');
    console.log('📄 Fichier schema.sql lu avec succès');
    
    // Créer la base de données
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Erreur création base de données:', err);
        process.exit(1);
      }
      console.log('✅ Base de données créée/ouverte:', dbPath);
    });
    
    // Exécuter le script SQL
    return new Promise((resolve, reject) => {
      db.exec(sqlContent, (err) => {
        if (err) {
          console.error('❌ Erreur exécution SQL:', err);
          reject(err);
        } else {
          console.log('✅ Tables créées et données de test insérées');
          
          // Vérifier les tables créées
          db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
            if (err) {
              console.error('❌ Erreur vérification tables:', err);
            } else {
              console.log('📋 Tables créées:', tables.map(t => t.name).join(', '));
            }
            
            db.close((err) => {
              if (err) {
                console.error('❌ Erreur fermeture base de données:', err);
                reject(err);
              } else {
                console.log('✅ Base de données fermée');
                resolve();
              }
            });
          });
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Erreur initialisation:', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Initialisation terminée avec succès!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Échec initialisation:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };