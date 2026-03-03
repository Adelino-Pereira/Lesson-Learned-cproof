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

  static getItemsWithUsage(req, res) {
    const db = getDb();
    const { project } = req.params;

    try {
      const rows = db.prepare(`
        SELECT ki.*,
               mt.code  AS type_code,
               mt.label AS type_label,
               GROUP_CONCAT(DISTINCT mp.label) AS process_labels,
               CASE WHEN pki.knowledge_item_id IS NOT NULL THEN 1 ELSE 0 END AS is_used
        FROM knowledge_item ki
        LEFT JOIN master_type mt ON mt.id = ki.type_id
        LEFT JOIN knowledge_item_process kip ON kip.knowledge_item_id = ki.id
        LEFT JOIN master_process mp ON mp.id = kip.process_id
        LEFT JOIN project_knowledge_item pki ON pki.knowledge_item_id = ki.id AND pki.project = ?
        WHERE ki.is_active = 1
        GROUP BY ki.id
        ORDER BY is_used DESC, ki.date DESC
      `).all(project);

      res.json(rows);
    } catch (err) {
      console.error('[ProjectController.getItemsWithUsage]', err.message);
      res.status(500).json({ error: 'Failed to fetch items with usage' });
    }
  }

  static linkDocument(req, res) {
    const db = getDb();
    const { project } = req.params;
    const { knowledge_item_id } = req.body;

    try {
      db.prepare('INSERT OR IGNORE INTO project_knowledge_item (project, knowledge_item_id) VALUES (?, ?)').run(project, knowledge_item_id);
      res.json({ message: 'Linked' });
    } catch (err) {
      console.error('[ProjectController.linkDocument]', err.message);
      res.status(500).json({ error: 'Failed to link document' });
    }
  }

  static unlinkDocument(req, res) {
    const db = getDb();
    const { project, itemId } = req.params;

    try {
      db.prepare('DELETE FROM project_knowledge_item WHERE project = ? AND knowledge_item_id = ?').run(project, itemId);
      res.json({ message: 'Unlinked' });
    } catch (err) {
      console.error('[ProjectController.unlinkDocument]', err.message);
      res.status(500).json({ error: 'Failed to unlink document' });
    }
  }

  static getProjects(req, res) {
    const db = getDb();
    try {
      const rows = db.prepare("SELECT DISTINCT project FROM knowledge_item WHERE is_active = 1 AND project IS NOT NULL AND project != '' ORDER BY project").all();
      res.json(rows.map(r => r.project));
    } catch (err) {
      console.error('[ProjectController.getProjects]', err.message);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }
}

module.exports = ProjectController;
