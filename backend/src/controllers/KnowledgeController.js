const { getDb } = require('../database');

class KnowledgeController {

  static list(req, res) {
    const db = getDb();
    const { type, process, project, owner, author, plant, date_from, date_to } = req.query;

    let sql = `
      SELECT ki.*,
             mt.code  AS type_code,
             mt.label AS type_label,
             GROUP_CONCAT(DISTINCT mp.label) AS process_labels,
             parent.title AS derived_from_title
      FROM knowledge_item ki
      LEFT JOIN master_type mt ON mt.id = ki.type_id
      LEFT JOIN knowledge_item_process kip ON kip.knowledge_item_id = ki.id
      LEFT JOIN master_process mp ON mp.id = kip.process_id
      LEFT JOIN knowledge_item parent ON parent.id = ki.derived_from_id
      WHERE ki.is_active = 1
    `;
    const params = [];

    if (type) {
      sql += ' AND ki.type_id = ?';
      params.push(type);
    }
    if (project) {
      sql += ' AND ki.project = ?';
      params.push(project);
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
      sql += ' AND ki.id IN (SELECT knowledge_item_id FROM knowledge_item_process WHERE process_id = ?)';
      params.push(process);
    }

    sql += ' GROUP BY ki.id ORDER BY ki.date DESC';

    try {
      const rows = db.prepare(sql).all(...params);
      res.json(rows);
    } catch (err) {
      console.error('[KnowledgeController.list]', err.message);
      res.status(500).json({ error: 'Failed to fetch knowledge items' });
    }
  }

  static getById(req, res) {
    const db = getDb();
    const { id } = req.params;

    try {
      const item = db.prepare(`
        SELECT ki.*,
               mt.code  AS type_code,
               mt.label AS type_label,
               parent.title AS derived_from_title
        FROM knowledge_item ki
        LEFT JOIN master_type mt ON mt.id = ki.type_id
        LEFT JOIN knowledge_item parent ON parent.id = ki.derived_from_id
        WHERE ki.id = ?
      `).get(id);

      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      const processes = db.prepare(`
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

      res.json({ ...item, processes, files });
    } catch (err) {
      console.error('[KnowledgeController.getById]', err.message);
      res.status(500).json({ error: 'Failed to fetch item' });
    }
  }

  static create(req, res) {
    const db = getDb();
    const { title, designation, date, owner, author, type_id, project, plant, document_link, processes, derived_from_id } = req.body;

    if (!title || !date || !owner || !author || !type_id) {
      return res.status(400).json({ error: 'Missing required fields: title, date, owner, author, type_id' });
    }

    try {
      const insertItem = db.prepare(`
        INSERT INTO knowledge_item (title, designation, date, owner, author, type_id, project, plant, document_link, visibility_status, is_active, derived_from_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 1, ?)
      `);

      const result = insertItem.run(title, designation || null, date, owner, author, type_id, project || null, plant || null, document_link || null, derived_from_id || null);
      const itemId = result.lastInsertRowid;

      // Link processes (M2M)
      const processIds = processes ? JSON.parse(processes) : [];
      const insertProcess = db.prepare('INSERT INTO knowledge_item_process (knowledge_item_id, process_id) VALUES (?, ?)');
      for (const pid of processIds) {
        insertProcess.run(itemId, pid);
      }

      // Link to project
      if (project) {
        db.prepare('INSERT OR IGNORE INTO project_knowledge_item (project, knowledge_item_id) VALUES (?, ?)').run(project, itemId);
      }

      // Save file metadata
      if (req.files) {
        const insertFile = db.prepare(`
          INSERT INTO knowledge_item_file (knowledge_item_id, file_kind, filename_original, storage_path)
          VALUES (?, ?, ?, ?)
        `);
        const allFiles = [
          ...(req.files.documents || []).map(f => ({ ...f, kind: 'DOCUMENT' })),
          ...(req.files.images || []).map(f => ({ ...f, kind: 'IMAGE' })),
        ];
        for (const file of allFiles) {
          insertFile.run(itemId, file.kind, file.originalname, file.path);
        }
      }

      // Return the created item
      const created = db.prepare('SELECT * FROM knowledge_item WHERE id = ?').get(itemId);
      res.status(201).json(created);
    } catch (err) {
      console.error('[KnowledgeController.create]', err.message);
      res.status(500).json({ error: 'Failed to create item' });
    }
  }

  static update(req, res) {
    const db = getDb();
    const { id } = req.params;
    const { title, designation, date, owner, author, type_id, project, plant, document_link, processes } = req.body;

    if (!title || !date || !owner || !author || !type_id) {
      return res.status(400).json({ error: 'Missing required fields: title, date, owner, author, type_id' });
    }

    try {
      const existing = db.prepare('SELECT id FROM knowledge_item WHERE id = ? AND is_active = 1').get(id);
      if (!existing) {
        return res.status(404).json({ error: 'Item not found' });
      }

      const updateAll = db.transaction(() => {
        db.prepare(`
          UPDATE knowledge_item
          SET title = ?, designation = ?, date = ?, owner = ?, author = ?,
              type_id = ?, project = ?, plant = ?, document_link = ?
          WHERE id = ?
        `).run(title, designation || null, date, owner, author, type_id, project || null, plant || null, document_link || null, id);

        // Replace process links
        db.prepare('DELETE FROM knowledge_item_process WHERE knowledge_item_id = ?').run(id);
        const processIds = processes || [];
        const insertProcess = db.prepare('INSERT INTO knowledge_item_process (knowledge_item_id, process_id) VALUES (?, ?)');
        for (const pid of processIds) {
          insertProcess.run(id, pid);
        }

        // Update project link
        db.prepare('DELETE FROM project_knowledge_item WHERE knowledge_item_id = ?').run(id);
        if (project) {
          db.prepare('INSERT OR IGNORE INTO project_knowledge_item (project, knowledge_item_id) VALUES (?, ?)').run(project, id);
        }
      });

      updateAll();

      // Return full detail
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

  static updateStatus(req, res) {
    const db = getDb();
    const { id } = req.params;
    const { visibility_status } = req.body;

    const allowed = ['VISIBLE', 'NOT_VISIBLE'];
    if (!allowed.includes(visibility_status)) {
      return res.status(400).json({ error: 'visibility_status must be VISIBLE or NOT_VISIBLE' });
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

  static stats(req, res) {
    const db = getDb();

    try {
      const byType = db.prepare(`
        SELECT mt.label, COUNT(ki.id) AS count
        FROM knowledge_item ki
        JOIN master_type mt ON mt.id = ki.type_id
        WHERE ki.is_active = 1
        GROUP BY mt.label
        ORDER BY count DESC
      `).all();

      const byProcess = db.prepare(`
        SELECT mp.label, COUNT(DISTINCT kip.knowledge_item_id) AS count
        FROM knowledge_item_process kip
        JOIN master_process mp ON mp.id = kip.process_id
        JOIN knowledge_item ki ON ki.id = kip.knowledge_item_id
        WHERE ki.is_active = 1
        GROUP BY mp.label
        ORDER BY count DESC
      `).all();

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
