const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.development') });

const args = process.argv.slice(2);
const FORCE = args.includes('--force');

/**
 * Réaffecte des widgets aux modèles de projet en fonction du nom et de la catégorie.
 * - Cible uniquement les templates sans widgets associés (idempotent, non destructif)
 * - Mappe des "component_name" existants vers des IDs de widgets
 * - Positions incrémentées, config par défaut {}
 */
async function reassignTemplateWidgets() {
  const connection = await mysql.createConnection({
    host: process.env.MARIADB_HOST || 'localhost',
    port: process.env.MARIADB_PORT || 3306,
    user: process.env.MARIADB_USER || 'fusepoint_db',
    password: process.env.MARIADB_PASSWORD || 'FusepointBD2025!',
    database: process.env.MARIADB_DATABASE || 'fusepoint_db'
  });

  try {
    console.log(`🔧 Réaffectation automatique des widgets ${FORCE ? 'en mode force (remplacement)' : 'pour les templates vides'}...\n`);

    // 1) Charger les widgets disponibles (component_name -> id)
    const [widgets] = await connection.execute(
      'SELECT id, name, component_name FROM widgets WHERE is_active = 1'
    );
    const widgetIdByComponent = new Map();
    const widgetNameByComponent = new Map();

    widgets.forEach(w => {
      if (w.component_name) {
        widgetIdByComponent.set(w.component_name.trim(), Number(w.id));
        widgetNameByComponent.set(w.component_name.trim(), w.name);
      }
    });

    // Helper pour résoudre une liste de component_names en IDs de widgets
    const resolveWidgetIds = (components) => {
      const ids = [];
      components.forEach(cmp => {
        const id = widgetIdByComponent.get(cmp);
        if (id) ids.push({ id, component: cmp, name: widgetNameByComponent.get(cmp) });
      });
      return ids;
    };

    // 2) Définir le mapping par catégorie et heuristiques par nom
    const DEFAULT_BY_CATEGORY = {
      marketing: [
        'ProjectOverviewWidget', 'GoalsWidget', 'TaskListWidget', 'CalendarWidget', 'FilesWidget', 'StatsWidget'
      ],
      analytics: [
        'ProjectOverviewWidget', 'StatsWidget', 'HistoryWidget'
      ],
      development: [
        'ProjectOverviewWidget', 'TaskListWidget', 'FilesWidget', 'CalendarWidget', 'CommentsWidget'
      ],
      design: [
        'ProjectOverviewWidget', 'FilesWidget', 'CommentsWidget', 'GoalsWidget'
      ],
      consulting: [
        'ProjectOverviewWidget', 'NotesWidget', 'FilesWidget', 'TaskListWidget'
      ],
      client: [
        'ProjectOverviewWidget', 'FilesWidget', 'CommentsWidget', 'TaskListWidget'
      ],
      communication: [
        'CommentsWidget', 'ProjectOverviewWidget', 'TaskListWidget'
      ],
      productivity: [
        'ProjectOverviewWidget', 'TaskListWidget', 'CalendarWidget', 'NotesWidget'
      ],
      goals: [
        'ProjectOverviewWidget', 'GoalsWidget', 'TaskListWidget'
      ]
    };

    const DEFAULT_FALLBACK = [
      'ProjectOverviewWidget', 'TaskListWidget', 'CalendarWidget', 'FilesWidget', 'StatsWidget', 'CommentsWidget'
    ];

    const nameHeuristics = (name) => {
      const n = (name || '').toLowerCase();
      if (n.includes('marketing')) return DEFAULT_BY_CATEGORY.marketing;
      if (n.includes('analytics')) return DEFAULT_BY_CATEGORY.analytics;
      if (n.includes('design')) return DEFAULT_BY_CATEGORY.design;
      if (n.includes('dev') || n.includes('développement')) return DEFAULT_BY_CATEGORY.development;
      if (n.includes('client')) return DEFAULT_BY_CATEGORY.client;
      if (n.includes('productiv')) return DEFAULT_BY_CATEGORY.productivity;
      if (n.includes('communi')) return DEFAULT_BY_CATEGORY.communication;
      if (n.includes('objectif') || n.includes('goal')) return DEFAULT_BY_CATEGORY.goals;
      if (n.includes('standard')) return DEFAULT_FALLBACK;
      return DEFAULT_FALLBACK;
    };

    // 3) Récupérer tous les templates et leur nombre de widgets
    const [templates] = await connection.execute(`
      SELECT pt.id, pt.name, pt.category,
             (SELECT COUNT(*) FROM project_template_widgets WHERE template_id = pt.id) AS widget_count
      FROM project_templates pt
      WHERE pt.is_active = 1
      ORDER BY pt.name
    `);

    let updatedTemplates = 0;

    for (const tpl of templates) {
      const tplId = Number(tpl.id);
      const tplName = tpl.name || '';
      const tplCat = (tpl.category || '').toLowerCase();
      const count = Number(tpl.widget_count || 0);

      if (count > 0 && !FORCE) {
        console.log(`⏭️  ${tplName} (ID ${tplId}) possède déjà ${count} widget(s) — ignoré.`);
        continue;
      }
      if (count > 0 && FORCE) {
        console.log(`🗑️  Mode force: suppression des ${count} widget(s) pour ${tplName} (ID ${tplId})...`);
        await connection.execute('DELETE FROM project_template_widgets WHERE template_id = ?', [tplId]);
      }

      // Choisir la liste des components selon catégorie puis nom
      let components = [];
      if (tplCat && DEFAULT_BY_CATEGORY[tplCat]) {
        components = DEFAULT_BY_CATEGORY[tplCat];
      } else {
        components = nameHeuristics(tplName);
      }

      const resolved = resolveWidgetIds(components);
      if (resolved.length === 0) {
        console.log(`⚠️  Aucun widget résolu pour ${tplName} (cat: ${tpl.category || 'n/a'}) — vérifiez la table widgets.`);
        continue;
      }

      console.log(`🔁 Réaffectation de ${resolved.length} widgets pour ${tplName} (ID ${tplId})...`);

      // Insérer les widgets (position croissante, config {})
      let position = 1;
      for (const w of resolved) {
        try {
          await connection.execute(
            `INSERT INTO project_template_widgets (template_id, widget_id, position, config, is_required)
             VALUES (?, ?, ?, ?, ?)`,
            [tplId, w.id, position++, '{}', 0]
          );
          console.log(`   ✅ ${w.component} (${w.name || 'id ' + w.id})`);
        } catch (e) {
          // Ignorer les erreurs d’unicité au cas où
          console.log(`   ⚠️  Skip ${w.component}: ${e.message}`);
        }
      }

      updatedTemplates++;
    }

    console.log(`\n🎉 Réaffectation terminée. Templates mis à jour: ${updatedTemplates}`);
  } catch (error) {
    console.error('❌ Erreur lors de la réaffectation:', error);
  } finally {
    // Fermer la connexion
    try { await connection.end(); } catch {}
  }
}

reassignTemplateWidgets();