#!/usr/bin/env node

/**
 * Script de migration pour modifier la contrainte d'unicité des slugs
 * Permet aux slugs d'être uniques par entreprise plutôt que globalement
 */

const databaseService = require('../services/databaseService');

async function migrateSlugUniqueness() {
  console.log('🔄 Début de la migration des contraintes de slugs...');
  
  try {
    // Obtenir une connexion directe
    const connection = await databaseService.getConnection();
    
    console.log('📊 Vérification de la contrainte actuelle...');
    
    // Vérifier si la contrainte UNIQUE existe déjà
    const [constraints] = await connection.execute(`
      SELECT CONSTRAINT_NAME, COLUMN_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'linkpoints' 
      AND COLUMN_NAME = 'slug'
      AND CONSTRAINT_NAME != 'PRIMARY'
    `);
    
    if (constraints.length > 0) {
      console.log('🗑️ Suppression de l\'ancienne contrainte UNIQUE sur slug...');
      await connection.execute(`ALTER TABLE linkpoints DROP INDEX ${constraints[0].CONSTRAINT_NAME}`);
      console.log('✅ Ancienne contrainte supprimée');
    } else {
      console.log('ℹ️ Aucune contrainte UNIQUE existante trouvée sur slug');
    }
    
    // Vérifier s'il y a des doublons qui pourraient poser problème
    console.log('🔍 Vérification des doublons potentiels...');
    const [duplicates] = await connection.execute(`
      SELECT slug, company_id, COUNT(*) as count
      FROM linkpoints 
      WHERE company_id IS NOT NULL
      GROUP BY slug, company_id 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicates.length > 0) {
      console.log('⚠️ Doublons détectés dans la même entreprise:');
      duplicates.forEach(dup => {
        console.log(`  - Slug "${dup.slug}" dans l'entreprise ${dup.company_id}: ${dup.count} occurrences`);
      });
      
      // Résoudre les doublons en ajoutant un suffixe
      for (const dup of duplicates) {
        console.log(`🔧 Résolution des doublons pour "${dup.slug}" dans l'entreprise ${dup.company_id}...`);
        
        const [linkpoints] = await connection.execute(`
          SELECT id, slug FROM linkpoints 
          WHERE slug = ? AND company_id = ? 
          ORDER BY created_at ASC
        `, [dup.slug, dup.company_id]);
        
        // Garder le premier, renommer les autres
        for (let i = 1; i < linkpoints.length; i++) {
          const newSlug = `${dup.slug}-${i}`;
          await connection.execute(`
            UPDATE linkpoints SET slug = ? WHERE id = ?
          `, [newSlug, linkpoints[i].id]);
          console.log(`  ✅ Renommé linkpoint ${linkpoints[i].id}: "${dup.slug}" → "${newSlug}"`);
        }
      }
    } else {
      console.log('✅ Aucun doublon détecté dans les entreprises');
    }
    
    // Créer la nouvelle contrainte UNIQUE composite
    console.log('🔧 Création de la nouvelle contrainte UNIQUE (slug, company_id)...');
    await connection.execute(`
      ALTER TABLE linkpoints 
      ADD CONSTRAINT unique_slug_per_company 
      UNIQUE (slug, company_id)
    `);
    console.log('✅ Nouvelle contrainte créée avec succès');
    
    // Vérifier la nouvelle contrainte
    const [newConstraints] = await connection.execute(`
      SELECT CONSTRAINT_NAME, COLUMN_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'linkpoints' 
      AND CONSTRAINT_NAME = 'unique_slug_per_company'
    `);
    
    console.log('📋 Nouvelle contrainte vérifiée:');
    newConstraints.forEach(constraint => {
      console.log(`  - ${constraint.CONSTRAINT_NAME}: ${constraint.COLUMN_NAME}`);
    });
    
    await connection.end();
    console.log('🎉 Migration terminée avec succès !');
    console.log('');
    console.log('📝 Résumé des changements:');
    console.log('  - Les slugs peuvent maintenant être identiques entre différentes entreprises');
    console.log('  - Les slugs restent uniques au sein de chaque entreprise');
    console.log('  - Les doublons existants ont été résolus automatiquement');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrateSlugUniqueness()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { migrateSlugUniqueness };