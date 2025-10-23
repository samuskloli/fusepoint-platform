const databaseService = require('../server/services/databaseService');

(async () => {
  try {
    await databaseService.initialize();
    const templates = await databaseService.query('SELECT id, name, category, is_active FROM project_templates ORDER BY id DESC LIMIT 10');
    console.log('Templates:', templates);
    const widgetsLink = await databaseService.query('SELECT id, template_id, widget_id, position, is_enabled FROM project_template_widgets ORDER BY id DESC LIMIT 10');
    console.log('Template-Widgets:', widgetsLink);
    const widgets = await databaseService.query('SELECT id, name, category, is_active FROM widgets ORDER BY id DESC LIMIT 10');
    console.log('Widgets:', widgets);
    process.exit(0);
  } catch (e) {
    console.error('Query error:', e.message || e);
    process.exit(1);
  }
})();