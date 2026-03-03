const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initSchema() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS master_type (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      code  TEXT NOT NULL,
      label TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS master_process (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      code  TEXT NOT NULL,
      label TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS knowledge_item (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      title             TEXT NOT NULL,
      designation       TEXT,
      date              TEXT NOT NULL,
      owner             TEXT NOT NULL,
      author            TEXT NOT NULL,
      type_id           INTEGER NOT NULL,
      project           TEXT,
      plant             TEXT,
      document_link     TEXT,
      visibility_status TEXT NOT NULL DEFAULT 'PENDING',
      is_active         INTEGER NOT NULL DEFAULT 1,
      created_at        TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (type_id) REFERENCES master_type(id)
    );

    CREATE TABLE IF NOT EXISTS knowledge_item_process (
      knowledge_item_id INTEGER NOT NULL,
      process_id        INTEGER NOT NULL,
      PRIMARY KEY (knowledge_item_id, process_id),
      FOREIGN KEY (knowledge_item_id) REFERENCES knowledge_item(id),
      FOREIGN KEY (process_id) REFERENCES master_process(id)
    );

    CREATE TABLE IF NOT EXISTS knowledge_item_file (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      knowledge_item_id INTEGER NOT NULL,
      file_kind         TEXT NOT NULL CHECK (file_kind IN ('DOCUMENT', 'IMAGE')),
      filename_original TEXT NOT NULL,
      storage_path      TEXT NOT NULL,
      uploaded_at       TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (knowledge_item_id) REFERENCES knowledge_item(id)
    );

    CREATE TABLE IF NOT EXISTS project_knowledge_item (
      project           TEXT NOT NULL,
      knowledge_item_id INTEGER NOT NULL,
      added_at          TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (project, knowledge_item_id),
      FOREIGN KEY (knowledge_item_id) REFERENCES knowledge_item(id)
    );
  `);

  console.log('[DB] Schema initialized');
}

module.exports = { getDb, initSchema };
