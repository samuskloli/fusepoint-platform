const databaseService = require('../services/databaseService');

/**
 * Migration: Create note_categories table and add category_id to notes
 */
async function migrateNoteCategories() {
  console.log('🚀 Starting migration: note_categories + notes.category_id');

  try {
    // 1) Create note_categories table if not exists
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS note_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        color VARCHAR(20) DEFAULT NULL,
        icon VARCHAR(50) DEFAULT NULL,
        parent_id INT DEFAULT NULL,
        client_id INT NOT NULL,
        project_id INT NOT NULL,
        created_by INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_note_categories_scope (client_id, project_id),
        INDEX idx_note_categories_parent (parent_id),
        UNIQUE KEY uniq_category_name_per_project (project_id, name)
      )
    `;

    await databaseService.query(createTableSql);
    console.log('✅ note_categories table ensured');

    // 2) Check if notes.category_id exists
    const checkColumnSql = `
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'notes'
        AND COLUMN_NAME = 'category_id'
    `;
    const check = await databaseService.query(checkColumnSql);
    const hasCategoryId = Number(check?.[0]?.count || 0) > 0;

    if (!hasCategoryId) {
      const addColumnSql = `
        ALTER TABLE notes
        ADD COLUMN category_id INT NULL AFTER widget_instance_id,
        ADD INDEX idx_notes_category (category_id)
      `;
      await databaseService.query(addColumnSql);
      console.log('✅ Added notes.category_id + index');
    } else {
      console.log('ℹ️ notes.category_id already exists');
    }

    console.log('🎉 Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

// Execute migration if run directly
if (require.main === module) {
  migrateNoteCategories()
    .then(() => {
      console.log('✅ Done');
      process.exit(0);
    })
    .catch((err) => {
      console.error('💥 Migration error:', err);
      process.exit(1);
    });
}

module.exports = { migrateNoteCategories };