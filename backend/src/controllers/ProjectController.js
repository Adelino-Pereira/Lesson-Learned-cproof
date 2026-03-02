const { getDb } = require('../database');

class ProjectController {

  static getDocumentsUsed(req, res) {
    const db = getDb();
    const { project } = req.params;

    try {
      const rows = db.prepare(`
        SELECT ki.*,
               mt.code  AS type_code,
               mt.label AS type_label,
               pki.added_at AS linked_at,
               GROUP_CONCAT(DISTINCT mp.label) AS process_labels
        FROM project_knowledge_item pki
        JOIN knowledge_item ki ON ki.id = pki.knowledge_item_id
        LEFT JOIN master_type mt ON mt.id = ki.type_id
        LEFT JOIN knowledge_item_process kip ON kip.knowledge_item_id = ki.id
        LEFT JOIN master_process mp ON mp.id = kip.process_id
        WHERE pki.project = ? AND ki.is_active = 1
        GROUP BY ki.id
        ORDER BY ki.date DESC
      `).all(project);

      res.json(rows);
    } catch (err) {
      console.error('[ProjectController.getDocumentsUsed]', err.message);
      res.status(500).json({ error: 'Failed to fetch documents used' });
    }
  }

  static getProjects(req, res) {
    const db = getDb();
    try {
      const rows = db.prepare('SELECT DISTINCT project FROM project_knowledge_item ORDER BY project').all();
      res.json(rows.map(r => r.project));
    } catch (err) {
      console.error('[ProjectController.getProjects]', err.message);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }
}

module.exports = ProjectController;
