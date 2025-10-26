const databaseService = require('../services/databaseService');

/**
 * Migration script to add is_required column to project_template_widgets table
 */

async function migrateIsRequiredColumn() {
  console.log('🚀 Starting migration: Add is_required column to project_template_widgets...');
  
  try {
    // Check if column already exists
    const checkColumnQuery = `
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'project_template_widgets'
      AND COLUMN_NAME = 'is_required'
    `;
    
    const result = await databaseService.query(checkColumnQuery);
    const columnExists = result[0].count > 0;
    
    if (columnExists) {
      console.log('✅ Column is_required already exists in project_template_widgets table');
      return;
    }
    
    // Add the column
    const addColumnQuery = `
      ALTER TABLE project_template_widgets 
      ADD COLUMN is_required BOOLEAN DEFAULT FALSE 
      COMMENT 'Indique si le widget est requis dans le modèle'
    `;
    
    await databaseService.query(addColumnQuery);
    console.log('✅ Successfully added is_required column to project_template_widgets table');
    
    // Verify the column was added
    const verifyQuery = `
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'project_template_widgets'
      AND COLUMN_NAME = 'is_required'
    `;
    
    const verification = await databaseService.query(verifyQuery);
    if (verification.length > 0) {
      console.log('📋 Column details:', verification[0]);
    }
    
    // Show current table structure
    const showStructureQuery = `
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'project_template_widgets'
      ORDER BY ORDINAL_POSITION
    `;
    
    const structure = await databaseService.query(showStructureQuery);
    console.log('📋 Current table structure:');
    structure.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

// Execute migration if run directly
if (require.main === module) {
  migrateIsRequiredColumn()
    .then(() => {
      console.log('🎉 Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateIsRequiredColumn };