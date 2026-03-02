const { getDb } = require('../database');

class MasterController {

  static getTypes(req, res) {
    const db = getDb();
    try {
      const rows = db.prepare('SELECT * FROM master_type WHERE is_active = 1 ORDER BY label').all();
      res.json(rows);
    } catch (err) {
      console.error('[MasterController.getTypes]', err.message);
      res.status(500).json({ error: 'Failed to fetch types' });
    }
  }

  static getProcesses(req, res) {
    const db = getDb();
    try {
      const rows = db.prepare('SELECT * FROM master_process WHERE is_active = 1 ORDER BY label').all();
      res.json(rows);
    } catch (err) {
      console.error('[MasterController.getProcesses]', err.message);
      res.status(500).json({ error: 'Failed to fetch processes' });
    }
  }
}

module.exports = MasterController;
