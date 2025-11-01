const databaseService = require('../services/databaseService');

/**
 * Migration script to add company billing columns and user profile columns
 */

async function migrateCompanyBillingAndUserProfile() {
  console.log('🚀 Starting migration: Add billing columns to companies and profile columns to users...');

  try {
    // Helper to check if a column exists
    const columnExists = async (table, column) => {
      const result = await databaseService.query(
        `SELECT COUNT(*) as count
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND COLUMN_NAME = ?`,
        [table, column]
      );
      return result[0].count > 0;
    };

    // Companies: add billing/address columns
    const companyColumns = [
      { name: 'vat_number', ddl: 'ALTER TABLE companies ADD COLUMN vat_number VARCHAR(50)' },
      { name: 'address', ddl: 'ALTER TABLE companies ADD COLUMN address VARCHAR(255)' },
      { name: 'city', ddl: 'ALTER TABLE companies ADD COLUMN city VARCHAR(100)' },
      { name: 'zip_code', ddl: 'ALTER TABLE companies ADD COLUMN zip_code VARCHAR(20)' },
      { name: 'country', ddl: 'ALTER TABLE companies ADD COLUMN country VARCHAR(2)' },
      { name: 'include_tax', ddl: 'ALTER TABLE companies ADD COLUMN include_tax BOOLEAN DEFAULT 1' },
      { name: 'auto_invoice', ddl: 'ALTER TABLE companies ADD COLUMN auto_invoice BOOLEAN DEFAULT 1' },
    ];

    for (const col of companyColumns) {
      const exists = await columnExists('companies', col.name);
      if (!exists) {
        console.log(`➡️ Adding companies.${col.name}...`);
        await databaseService.run(col.ddl);
        console.log(`✅ Added companies.${col.name}`);
      } else {
        console.log(`ℹ️ Column companies.${col.name} already exists`);
      }
    }

    // Users: add profile columns
    const userColumns = [
      { name: 'phone', ddl: 'ALTER TABLE users ADD COLUMN phone VARCHAR(50)' },
      { name: 'bio', ddl: 'ALTER TABLE users ADD COLUMN bio TEXT' },
      { name: 'avatar_url', ddl: 'ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500)' },
      { name: 'language', ddl: "ALTER TABLE users ADD COLUMN language VARCHAR(10) DEFAULT 'fr'" },
    ];

    for (const col of userColumns) {
      const exists = await columnExists('users', col.name);
      if (!exists) {
        console.log(`➡️ Adding users.${col.name}...`);
        await databaseService.run(col.ddl);
        console.log(`✅ Added users.${col.name}`);
      } else {
        console.log(`ℹ️ Column users.${col.name} already exists`);
      }
    }

    console.log('🎉 Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

// Execute migration if run directly
if (require.main === module) {
  migrateCompanyBillingAndUserProfile()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { migrateCompanyBillingAndUserProfile };