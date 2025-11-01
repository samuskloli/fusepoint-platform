const databaseService = require('../services/databaseService');

/**
 * Migration: add archived fields to notes table
 * - notes.archived TINYINT(1) DEFAULT 0
 * - notes.archived_at DATETIME NULL
 * - index on archived for filtering
 */
async function migrateNotesArchive() {
  console.log('🚀 Starting migration: Add archived fields to notes table...')

  try {
    // Check if columns already exist
    const checkColumnsQuery = `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'notes'
        AND COLUMN_NAME IN ('archived', 'archived_at')
    `

    const existingCols = await databaseService.query(checkColumnsQuery)
    const existing = new Set(existingCols.map(c => c.COLUMN_NAME))

    if (!existing.has('archived')) {
      const addArchivedQuery = `
        ALTER TABLE notes
        ADD COLUMN archived TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Note archivée (1) ou active (0)'
      `
      await databaseService.query(addArchivedQuery)
      console.log('✅ Added notes.archived column')
    } else {
      console.log('ℹ️ notes.archived already exists')
    }

    if (!existing.has('archived_at')) {
      const addArchivedAtQuery = `
        ALTER TABLE notes
        ADD COLUMN archived_at DATETIME NULL DEFAULT NULL COMMENT 'Date d''archivage de la note'
      `
      await databaseService.query(addArchivedAtQuery)
      console.log('✅ Added notes.archived_at column')
    } else {
      console.log('ℹ️ notes.archived_at already exists')
    }

    // Ensure index on archived
    const checkIndexQuery = `
      SELECT INDEX_NAME
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'notes'
        AND INDEX_NAME = 'idx_notes_archived'
    `
    const idx = await databaseService.query(checkIndexQuery)
    if (!idx || idx.length === 0) {
      await databaseService.query(`CREATE INDEX idx_notes_archived ON notes(archived)`)
      console.log('✅ Created index idx_notes_archived on notes.archived')
    } else {
      console.log('ℹ️ Index idx_notes_archived already exists')
    }

    console.log('🎉 Migration completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    throw error
  }
}

// Execute migration if run directly
if (require.main === module) {
  migrateNotesArchive()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Migration failed:', error)
      process.exit(1)
    })
}

module.exports = { migrateNotesArchive }