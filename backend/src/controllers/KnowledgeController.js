/**
 * KnowledgeController.js — Handles all CRUD operations for knowledge items.
 * Provides list (with multi-criteria filtering), detail, create, update,
 * soft-delete, status validation, and statistics aggregation.
 */

const { getDb } = require('../database');

class KnowledgeController {

  /**
   * GET /api/knowledge
   * Lists knowledge items with optional filters (title, type, process, project, etc.).
   * Joins type, process labels, parent item (for derived), and project info.
   * Only returns active items (is_active = 1). Results sorted by date DESC.
   */
  static list(req, res) {
    const db = getDb();
    const { title, type, process, project_id, owner, author, plant, date_from, date_to, visibility_status } = req.query;

    // Base query: join all related tables and aggregate process labels with GROUP_CONCAT
    let sql = `
      SELECT ki.*,
             mt.code  AS type_code,
             mt.label AS type_label,
             GROUP_CONCAT(DISTINCT mp.label) AS process_labels,
             parent.title AS derived_from_title,
             proj.designation AS project_designation,
             proj.name AS project_name,
             proj.customer AS project_customer,
             proj.vehicle AS project_vehicle
      FROM knowledge_item ki
      LEFT JOIN master_type mt ON mt.id = ki.type_id
      LEFT JOIN knowledge_item_process kip ON kip.knowledge_item_id = ki.id
      LEFT JOIN master_process mp ON mp.id = kip.process_id
      LEFT JOIN knowledge_item parent ON parent.id = ki.derived_from_id
      LEFT JOIN master_project proj ON proj.id = ki.project_id
      WHERE ki.is_active = 1
    `;
    const params = [];

    // Dynamically append WHERE clauses based on provided query parameters
    if (title) {
      sql += ' AND ki.title LIKE ?';
      params.push(`%${title}%`);
    }
    if (type) {
      sql += ' AND ki.type_id = ?';
      params.push(type);
    }
    if (project_id) {
      sql += ' AND ki.project_id = ?';
      params.push(project_id);
    }
    if (owner) {
      sql += ' AND ki.owner = ?';
      params.push(owner);
    }
    if (author) {
      sql += ' AND ki.author = ?';
      params.push(author);
    }
    if (plant) {
      sql += ' AND ki.plant = ?';
      params.push(plant);
    }
    if (date_from) {
      sql += ' AND ki.date >= ?';
      params.push(date_from);
    }
    if (date_to) {
      sql += ' AND ki.date <= ?';
      params.push(date_to);
    }
    if (process) {
      // Filter by process uses a subquery on the junction table
      sql += ' AND ki.id IN (SELECT knowledge_item_id FROM knowledge_item_process WHERE process_id = ?)';
      params.push(process);
    }
    if (visibility_status) {
      sql += ' AND ki.visibility_status = ?';
      params.push(visibility_status);
    }

    // GROUP BY needed because of the GROUP_CONCAT on processes
    sql += ' GROUP BY ki.id ORDER BY ki.date DESC';

    try {
      const rows = db.prepare(sql).all(...params);
      res.json(rows);
    } catch (err) {
      console.error('[KnowledgeController.list]', err.message);
      res.status(500).json({ error: 'Failed to fetch knowledge items' });
    }
  }

  /**
   * GET /api/knowledge/:id
   * Returns a single knowledge item with its linked processes and file attachments.
   */
  static getById(req, res) {
    const db = getDb();
    const { id } = req.params;

    try {
      // Fetch the item with type, parent, and project info
      const item = db.prepare(`
        SELECT ki.*,
               mt.code  AS type_code,
               mt.label AS type_label,
               parent.title AS derived_from_title,
               proj.designation AS project_designation,
               proj.name AS project_name,
               proj.customer AS project_customer,
               proj.vehicle AS project_vehicle
        FROM knowledge_item ki
        LEFT JOIN master_type mt ON mt.id = ki.type_id
        LEFT JOIN knowledge_item parent ON parent.id = ki.derived_from_id
        LEFT JOIN master_project proj ON proj.id = ki.project_id
        WHERE ki.id = ?
      `).get(id);

      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      // Fetch linked processes (M2M via junction table)
      const processes = db.prepare(`
        SELECT mp.id, mp.code, mp.label
        FROM knowledge_item_process kip
        JOIN master_process mp ON mp.id = kip.process_id
        WHERE kip.knowledge_item_id = ?
      `).all(id);

      // Fetch attached files (documents and images)
      const files = db.prepare(`
        SELECT id, file_kind, filename_original, storage_path, uploaded_at
        FROM knowledge_item_file
        WHERE knowledge_item_id = ?
      `).all(id);

      // Return combined response with item + processes + files
      res.json({ ...item, processes, files });
    } catch (err) {
      console.error('[KnowledgeController.getById]', err.message);
      res.status(500).json({ error: 'Failed to fetch item' });
    }
  }

  /**
   * POST /api/knowledge
   * Creates a new knowledge item. Accepts multipart form data (for file uploads).
   * New items always start with visibility_status = 'PENDING'.
   * Also links the item to its project in the documents-used junction table.
   */
  static create(req, res) {
    const db = getDb();
    const { title, designation, date, owner, author, type_id, project_id, plant, document_link, processes, derived_from_id } = req.body;

    // Validate required fields
    if (!title || !date || !owner || !author || !type_id) {
      return res.status(400).json({ error: 'Missing required fields: title, date, owner, author, type_id' });
    }

    try {
      // Insert the knowledge item (always starts as PENDING)
      const insertItem = db.prepare(`
        INSERT INTO knowledge_item (title, designation, date, owner, author, type_id, project_id, plant, document_link, visibility_status, is_active, derived_from_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 1, ?)
      `);

      const result = insertItem.run(title, designation || null, date, owner, author, type_id, project_id || null, plant || null, document_link || null, derived_from_id || null);
      const itemId = result.lastInsertRowid;

      // Link processes (M2M) — processes come as JSON string from FormData
      const processIds = processes ? JSON.parse(processes) : [];
      const insertProcess = db.prepare('INSERT INTO knowledge_item_process (knowledge_item_id, process_id) VALUES (?, ?)');
      for (const pid of processIds) {
        insertProcess.run(itemId, pid);
      }

      // Auto-link to project for the "Documents Used" feature
      if (project_id) {
        db.prepare('INSERT OR IGNORE INTO project_knowledge_item (project_id, knowledge_item_id) VALUES (?, ?)').run(project_id, itemId);
      }

      // Save uploaded file metadata (Multer handles actual file storage)
      if (req.files) {
        const insertFile = db.prepare(`
          INSERT INTO knowledge_item_file (knowledge_item_id, file_kind, filename_original, storage_path)
          VALUES (?, ?, ?, ?)
        `);
        // Merge document and image arrays, tagging each with its kind
        const allFiles = [
          ...(req.files.documents || []).map(f => ({ ...f, kind: 'DOCUMENT' })),
          ...(req.files.images || []).map(f => ({ ...f, kind: 'IMAGE' })),
        ];
        for (const file of allFiles) {
          insertFile.run(itemId, file.kind, file.originalname, file.path);
        }
      }

      // Return the newly created item
      const created = db.prepare('SELECT * FROM knowledge_item WHERE id = ?').get(itemId);
      res.status(201).json(created);
    } catch (err) {
      console.error('[KnowledgeController.create]', err.message);
      res.status(500).json({ error: 'Failed to create item' });
    }
  }

  /**
   * PUT /api/knowledge/:id
   * Updates an existing knowledge item.
   * Uses a transaction to atomically update the item, replace process links,
   * and update the project link.
   */
  static update(req, res) {
    const db = getDb();
    const { id } = req.params;
    const { title, designation, date, owner, author, type_id, project_id, plant, document_link, processes } = req.body;

    if (!title || !date || !owner || !author || !type_id) {
      return res.status(400).json({ error: 'Missing required fields: title, date, owner, author, type_id' });
    }

    try {
      // Verify the item exists and is not soft-deleted
      const existing = db.prepare('SELECT id FROM knowledge_item WHERE id = ? AND is_active = 1').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'Item not found' });
      }

      // Wrap all updates in a transaction for atomicity
      const updateAll = db.transaction(() => {
        // Update the main item fields
        db.prepare(`
          UPDATE knowledge_item
          SET title = ?, designation = ?, date = ?, owner = ?, author = ?,
              type_id = ?, project_id = ?, plant = ?, document_link = ?
          WHERE id = ?
        `).run(title, designation || null, date, owner, author, type_id, project_id || null, plant || null, document_link || null, id);

        // Replace process links: delete all existing, then re-insert
        db.prepare('DELETE FROM knowledge_item_process WHERE knowledge_item_id = ?').run(id);
        const processIds = processes || [];
        const insertProcess = db.prepare('INSERT INTO knowledge_item_process (knowledge_item_id, process_id) VALUES (?, ?)');
        for (const pid of processIds) {
          insertProcess.run(id, pid);
        }

        // Replace project link in documents-used junction
        db.prepare('DELETE FROM project_knowledge_item WHERE knowledge_item_id = ?').run(id);
        if (project_id) {
          db.prepare('INSERT OR IGNORE INTO project_knowledge_item (project_id, knowledge_item_id) VALUES (?, ?)').run(project_id, id);
        }
      });

      updateAll();

      // Return the updated item with type info, processes, and files
      const updated = db.prepare(`
        SELECT ki.*, mt.code AS type_code, mt.label AS type_label
        FROM knowledge_item ki
        LEFT JOIN master_type mt ON mt.id = ki.type_id
        WHERE ki.id = ?
      `).get(id);

      const updatedProcesses = db.prepare(`
        SELECT mp.id, mp.code, mp.label
        FROM knowledge_item_process kip
        JOIN master_process mp ON mp.id = kip.process_id
        WHERE kip.knowledge_item_id = ?
      `).all(id);

      const files = db.prepare(`
        SELECT id, file_kind, filename_original, storage_path, uploaded_at
        FROM knowledge_item_file
        WHERE knowledge_item_id = ?
      `).all(id);

      res.json({ ...updated, processes: updatedProcesses, files });
    } catch (err) {
      console.error('[KnowledgeController.update]', err.message);
      res.status(500).json({ error: 'Failed to update item' });
    }
  }

  /**
   * DELETE /api/knowledge/:id
   * Soft-deletes an item by setting is_active = 0.
   * The item remains in the database but is excluded from all queries.
   */
  static delete(req, res) {
    const db = getDb();
    const { id } = req.params;

    try {
      const result = db.prepare('UPDATE knowledge_item SET is_active = 0 WHERE id = ? AND is_active = 1').run(id);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json({ message: 'Item deleted' });
    } catch (err) {
      console.error('[KnowledgeController.delete]', err.message);
      res.status(500).json({ error: 'Failed to delete item' });
    }
  }

  /**
   * PATCH /api/knowledge/:id/status
   * Updates the visibility status of an item (APPROVED or REJECTED).
   * Used by admin/validator roles to approve or reject pending items.
   */
  static updateStatus(req, res) {
    const db = getDb();
    const { id } = req.params;
    const { visibility_status } = req.body;

    // Only allow valid status transitions
    const allowed = ['APPROVED', 'REJECTED'];
    if (!allowed.includes(visibility_status)) {
      return res.status(400).json({ error: 'visibility_status must be APPROVED or REJECTED' });
    }

    try {
      const result = db.prepare('UPDATE knowledge_item SET visibility_status = ? WHERE id = ? AND is_active = 1').run(visibility_status, id);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      const updated = db.prepare('SELECT * FROM knowledge_item WHERE id = ?').get(id);
      res.json(updated);
    } catch (err) {
      console.error('[KnowledgeController.updateStatus]', err.message);
      res.status(500).json({ error: 'Failed to update status' });
    }
  }

  /**
   * GET /api/knowledge/stats
   * Returns aggregated statistics for the dashboard charts:
   *   - byType:    count of items grouped by knowledge type
   *   - byProcess: count of items grouped by manufacturing process
   *   - byPlant:   count of items grouped by plant location
   */
  static stats(req, res) {
    const db = getDb();

    try {
      // Count items per knowledge type (e.g. Documentation, Lessons-learned)
      const byType = db.prepare(`
        SELECT mt.label, COUNT(ki.id) AS count
        FROM knowledge_item ki
        JOIN master_type mt ON mt.id = ki.type_id
        WHERE ki.is_active = 1
        GROUP BY mt.label
        ORDER BY count DESC
      `).all();

      // Count items per process (uses DISTINCT because of M2M relationship)
      const byProcess = db.prepare(`
        SELECT mp.label, COUNT(DISTINCT kip.knowledge_item_id) AS count
        FROM knowledge_item_process kip
        JOIN master_process mp ON mp.id = kip.process_id
        JOIN knowledge_item ki ON ki.id = kip.knowledge_item_id
        WHERE ki.is_active = 1
        GROUP BY mp.label
        ORDER BY count DESC
      `).all();

      // Count items per plant location
      const byPlant = db.prepare(`
        SELECT plant AS label, COUNT(id) AS count
        FROM knowledge_item
        WHERE is_active = 1 AND plant IS NOT NULL AND plant != ''
        GROUP BY plant
        ORDER BY count DESC
      `).all();

      res.json({ byType, byProcess, byPlant });
    } catch (err) {
      console.error('[KnowledgeController.stats]', err.message);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }
}

module.exports = KnowledgeController;
