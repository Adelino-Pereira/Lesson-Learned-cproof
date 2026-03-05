/**
 * ProjectController.js — Handles project queries and the "Documents Used" feature.
 * Provides project listing with search, customer/vehicle lookups, and
 * CRUD for linking knowledge items to projects (documents-used junction).
 */

const { getDb } = require('../database');

class ProjectController {

  /**
   * GET /api/projects
   * Lists active projects with optional search (across name, designation,
   * customer, vehicle, description) and customer filter.
   * Sorted by customer → vehicle → name for grouped display.
   */
  static getProjects(req, res) {
    const db = getDb();
    const { search, customer } = req.query;

    let sql = 'SELECT * FROM master_project WHERE is_active = 1';
    const params = [];

    // Full-text-like search across multiple fields
    if (search) {
      sql += ' AND (name LIKE ? OR designation LIKE ? OR customer LIKE ? OR vehicle LIKE ? OR description LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }
    if (customer) {
      sql += ' AND customer = ?';
      params.push(customer);
    }

    sql += ' ORDER BY customer, vehicle, name';

    try {
      const rows = db.prepare(sql).all(...params);
      res.json(rows);
    } catch (err) {
      console.error('[ProjectController.getProjects]', err.message);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }

  /** GET /api/projects/customers — Returns distinct customer (OEM) names. */
  static getCustomers(req, res) {
    const db = getDb();
    try {
      const rows = db.prepare(
        "SELECT DISTINCT customer FROM master_project WHERE is_active = 1 ORDER BY customer"
      ).all();
      res.json(rows.map(r => r.customer));
    } catch (err) {
      console.error('[ProjectController.getCustomers]', err.message);
      res.status(500).json({ error: 'Failed to fetch customers' });
    }
  }

  /** GET /api/projects/vehicles — Returns distinct vehicle names, optionally filtered by customer. */
  static getVehicles(req, res) {
    const db = getDb();
    const { customer } = req.query;
    let sql = 'SELECT DISTINCT vehicle FROM master_project WHERE is_active = 1';
    const params = [];
    if (customer) {
      sql += ' AND customer = ?';
      params.push(customer);
    }
    sql += ' ORDER BY vehicle';
    try {
      const rows = db.prepare(sql).all(...params);
      res.json(rows.map(r => r.vehicle));
    } catch (err) {
      console.error('[ProjectController.getVehicles]', err.message);
      res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
  }

  /**
   * GET /api/projects/:projectId/documents-used
   * Returns all knowledge items linked to a project via the junction table.
   * Includes type info and aggregated process labels.
   */
  static getDocumentsUsed(req, res) {
    const db = getDb();
    const { projectId } = req.params;

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
        WHERE pki.project_id = ? AND ki.is_active = 1
        GROUP BY ki.id
        ORDER BY ki.date DESC
      `).all(projectId);

      res.json(rows);
    } catch (err) {
      console.error('[ProjectController.getDocumentsUsed]', err.message);
      res.status(500).json({ error: 'Failed to fetch documents used' });
    }
  }

  /**
   * GET /api/projects/:projectId/items-with-usage
   * Returns ALL active knowledge items with an is_used flag (1/0) indicating
   * whether each item is linked to the given project.
   * Used by the Add Document dialog to show toggle switches.
   */
  static getItemsWithUsage(req, res) {
    const db = getDb();
    const { projectId } = req.params;

    try {
      // LEFT JOIN on junction table: is_used = 1 if linked, 0 otherwise
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
        LEFT JOIN project_knowledge_item pki ON pki.knowledge_item_id = ki.id AND pki.project_id = ?
        WHERE ki.is_active = 1
        GROUP BY ki.id
        ORDER BY is_used DESC, ki.date DESC
      `).all(projectId);

      res.json(rows);
    } catch (err) {
      console.error('[ProjectController.getItemsWithUsage]', err.message);
      res.status(500).json({ error: 'Failed to fetch items with usage' });
    }
  }

  /**
   * POST /api/projects/:projectId/documents-used
   * Links a knowledge item to a project. Uses INSERT OR IGNORE to prevent duplicates.
   */
  static linkDocument(req, res) {
    const db = getDb();
    const { projectId } = req.params;
    const { knowledge_item_id } = req.body;

    try {
      db.prepare('INSERT OR IGNORE INTO project_knowledge_item (project_id, knowledge_item_id) VALUES (?, ?)').run(projectId, knowledge_item_id);
      res.json({ message: 'Linked' });
    } catch (err) {
      console.error('[ProjectController.linkDocument]', err.message);
      res.status(500).json({ error: 'Failed to link document' });
    }
  }

  /**
   * DELETE /api/projects/:projectId/documents-used/:itemId
   * Removes the link between a knowledge item and a project.
   */
  static unlinkDocument(req, res) {
    const db = getDb();
    const { projectId, itemId } = req.params;

    try {
      db.prepare('DELETE FROM project_knowledge_item WHERE project_id = ? AND knowledge_item_id = ?').run(projectId, itemId);
      res.json({ message: 'Unlinked' });
    } catch (err) {
      console.error('[ProjectController.unlinkDocument]', err.message);
      res.status(500).json({ error: 'Failed to unlink document' });
    }
  }
}

module.exports = ProjectController;
