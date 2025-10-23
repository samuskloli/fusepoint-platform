const databaseService = require('../services/databaseService');
const projectDashboardService = require('../services/projectDashboardService');

/**
 * Migration script to initialize project dashboards from existing configurations
 * This script migrates dashboard settings from project_configurations to project_dashboards
 */

class ProjectDashboardMigration {
  constructor() {
    this.db = databaseService;
  }

  async migrate() {
    console.log('🚀 Starting project dashboard migration...');
    
    try {
      // Get all projects that have configuration data
      const projects = await this.getProjectsWithConfigurations();
      console.log(`📊 Found ${projects.length} projects with configurations to migrate`);

      let migratedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const project of projects) {
        try {
          // Check if dashboard already exists
          const existingDashboard = await projectDashboardService.getProjectDashboard(project.project_id);
          if (existingDashboard) {
            console.log(`⏭️  Skipping project ${project.project_id} - dashboard already exists`);
            skippedCount++;
            continue;
          }

          // Extract dashboard layout from configuration
          const layoutData = this.extractDashboardLayout(project.config_data);
          
          if (layoutData) {
            // Create new dashboard entry
            await projectDashboardService.createDefaultDashboard(project.project_id, layoutData);
            console.log(`✅ Migrated dashboard for project ${project.project_id}`);
            migratedCount++;
          } else {
            // Create default dashboard
            await projectDashboardService.createDefaultDashboard(project.project_id);
            console.log(`🆕 Created default dashboard for project ${project.project_id}`);
            migratedCount++;
          }
        } catch (error) {
          console.error(`❌ Error migrating project ${project.project_id}:`, error.message);
          errorCount++;
        }
      }

      // Also migrate projects without configurations but with widgets
      const projectsWithWidgets = await this.getProjectsWithWidgets();
      console.log(`🔧 Found ${projectsWithWidgets.length} additional projects with widgets`);

      for (const project of projectsWithWidgets) {
        try {
          // Check if dashboard already exists
          const existingDashboard = await projectDashboardService.getProjectDashboard(project.project_id);
          if (existingDashboard) {
            skippedCount++;
            continue;
          }

          // Create default dashboard
          await projectDashboardService.createDefaultDashboard(project.project_id);
          console.log(`🆕 Created default dashboard for project ${project.project_id}`);
          migratedCount++;
        } catch (error) {
          console.error(`❌ Error creating dashboard for project ${project.project_id}:`, error.message);
          errorCount++;
        }
      }

      console.log('\n📈 Migration Summary:');
      console.log(`✅ Migrated: ${migratedCount}`);
      console.log(`⏭️  Skipped: ${skippedCount}`);
      console.log(`❌ Errors: ${errorCount}`);
      console.log('🎉 Project dashboard migration completed!');

      return {
        migrated: migratedCount,
        skipped: skippedCount,
        errors: errorCount
      };

    } catch (error) {
      console.error('💥 Migration failed:', error);
      throw error;
    }
  }

  async getProjectsWithConfigurations() {
    const query = `
      SELECT DISTINCT project_id, config_data 
      FROM project_configurations 
      WHERE config_type = 'settings' 
      AND config_data IS NOT NULL
      AND JSON_VALID(config_data) = 1
    `;
    
    try {
      const results = await this.db.query(query);
      return results.map(row => ({
        project_id: row.project_id,
        config_data: typeof row.config_data === 'string' ? JSON.parse(row.config_data) : row.config_data
      }));
    } catch (error) {
      console.warn('Could not fetch projects with configurations:', error.message);
      return [];
    }
  }

  async getProjectsWithWidgets() {
    const query = `
      SELECT DISTINCT p.id as project_id
      FROM projects p
      WHERE EXISTS (
        SELECT 1 FROM project_widgets pw WHERE pw.project_id = p.id
      )
      AND NOT EXISTS (
        SELECT 1 FROM project_dashboards pd WHERE pd.project_id = p.id
      )
    `;
    
    try {
      const results = await this.db.query(query);
      return results;
    } catch (error) {
      console.warn('Could not fetch projects with widgets:', error.message);
      return [];
    }
  }

  extractDashboardLayout(configData) {
    try {
      if (!configData || typeof configData !== 'object') {
        return null;
      }

      // Look for dashboard-related configuration
      const layout = {};
      
      if (configData.dashboard) {
        layout.dashboard = configData.dashboard;
      }
      
      if (configData.layout) {
        layout.layout = configData.layout;
      }
      
      if (configData.widgetsLayout) {
        layout.widgetsLayout = configData.widgetsLayout;
      }

      // Return layout only if it has meaningful data
      return Object.keys(layout).length > 0 ? layout : null;
    } catch (error) {
      console.warn('Error extracting dashboard layout:', error.message);
      return null;
    }
  }

  async rollback() {
    console.log('🔄 Rolling back project dashboard migration...');
    
    try {
      const query = 'DELETE FROM project_dashboards WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)';
      const result = await this.db.query(query);
      console.log(`🗑️  Removed ${result.affectedRows} recently created dashboard entries`);
      console.log('✅ Rollback completed');
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const migration = new ProjectDashboardMigration();
  
  const command = process.argv[2];
  
  if (command === 'rollback') {
    migration.rollback()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('Migration rollback failed:', error);
        process.exit(1);
      });
  } else {
    migration.migrate()
      .then((result) => {
        console.log('Migration completed successfully:', result);
        process.exit(0);
      })
      .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
      });
  }
}

module.exports = ProjectDashboardMigration;