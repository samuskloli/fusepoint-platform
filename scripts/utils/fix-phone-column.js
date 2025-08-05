const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin vers la base de données
const dbPath = path.join(__dirname, 'server/database/fusepoint.db');

console.log('🔧 Correction de la colonne phone dans la table users...');
console.log('📍 Base de données:', dbPath);

// Connexion à la base de données
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
    return;
  }
  console.log('✅ Connexion à la base de données établie');
});

// Fonction pour vérifier si la colonne phone existe
function checkPhoneColumn() {
  return new Promise((resolve, reject) => {
    db.all("PRAGMA table_info(users)", (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      const phoneColumn = rows.find(row => row.name === 'phone');
      resolve(!!phoneColumn);
    });
  });
}

// Fonction pour ajouter la colonne phone
function addPhoneColumn() {
  return new Promise((resolve, reject) => {
    db.run("ALTER TABLE users ADD COLUMN phone VARCHAR(20)", (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

// Exécution principale
async function main() {
  try {
    const phoneExists = await checkPhoneColumn();
    
    if (phoneExists) {
      console.log('✅ La colonne phone existe déjà dans la table users');
    } else {
      console.log('⚠️ La colonne phone n\'existe pas, ajout en cours...');
      await addPhoneColumn();
      console.log('✅ Colonne phone ajoutée avec succès');
    }
    
    // Vérification finale
    const finalCheck = await checkPhoneColumn();
    if (finalCheck) {
      console.log('✅ Vérification finale: la colonne phone est présente');
    } else {
      console.log('❌ Erreur: la colonne phone n\'a pas pu être ajoutée');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error.message);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('❌ Erreur lors de la fermeture:', err.message);
      } else {
        console.log('🔒 Connexion fermée');
      }
    });
  }
}

main();