const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Chemin vers la base de données
const dbPath = path.join(__dirname, '../database/fusepoint.db');
const schemaPath = path.join(__dirname, '../database/deletion_requests_schema.sql');

console.log('🔧 Création de la table deletion_requests...');
console.log('📁 Base de données:', dbPath);
console.log('📄 Schéma:', schemaPath);

// Vérifier que la base de données existe
if (!fs.existsSync(dbPath)) {
  console.error('❌ Base de données non trouvée:', dbPath);
  process.exit(1);
}

// Vérifier que le fichier de schéma existe
if (!fs.existsSync(schemaPath)) {
  console.error('❌ Fichier de schéma non trouvé:', schemaPath);
  process.exit(1);
}

// Lire le schéma SQL
const schema = fs.readFileSync(schemaPath, 'utf8');

// Connexion à la base de données
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur connexion base de données:', err.message);
    process.exit(1);
  }
  console.log('✅ Connexion à la base de données réussie');
});

// Exécuter le schéma
db.exec(schema, (err) => {
  if (err) {
    console.error('❌ Erreur création table:', err.message);
    process.exit(1);
  }
  
  console.log('✅ Table deletion_requests créée avec succès');
  
  // Vérifier que la table a été créée
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='deletion_requests'", (err, row) => {
    if (err) {
      console.error('❌ Erreur vérification table:', err.message);
    } else if (row) {
      console.log('✅ Table deletion_requests confirmée dans la base de données');
    } else {
      console.error('❌ Table deletion_requests non trouvée après création');
    }
    
    // Fermer la connexion
    db.close((err) => {
      if (err) {
        console.error('❌ Erreur fermeture base de données:', err.message);
      } else {
        console.log('✅ Connexion fermée');
      }
    });
  });
});