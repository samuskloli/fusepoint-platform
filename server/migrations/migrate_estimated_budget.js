const databaseService = require('../services/databaseService');

/**
 * Migration script to add estimated_budget column to project_templates table
 */

async function migrateEstimatedBudget() {
  console.log('🚀 Starting migration: Add estimated_budget column to project_templates...');
  
  try {
    // Check if column already exists
    const checkColumnQuery = `
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'project_templates'
      AND COLUMN_NAME = 'estimated_budget'
    `;
    
    const result = await databaseService.query(checkColumnQuery);
    const columnExists = result[0].count > 0;
    
    if (columnExists) {
      console.log('✅ Column estimated_budget already exists in project_templates table');
      return;
    }
    
    // Add the column
    const addColumnQuery = `
      ALTER TABLE project_templates 
      ADD COLUMN estimated_budget DECIMAL(10,2) DEFAULT NULL 
      COMMENT 'Budget estimé pour le projet'
    `;
    
    await databaseService.query(addColumnQuery);
    console.log('✅ Successfully added estimated_budget column to project_templates table');
    
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
      AND TABLE_NAME = 'project_templates'
      AND COLUMN_NAME = 'estimated_budget'
    `;
    
    const verification = await databaseService.query(verifyQuery);
    if (verification.length > 0) {
      console.log('📋 Column details:', verification[0]);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

// Execute migration if run directly
if (require.main === module) {
  migrateEstimatedBudget()
    .then(() => {
      console.log('🎉 Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateEstimatedBudget };