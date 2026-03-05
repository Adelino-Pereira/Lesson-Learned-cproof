/**
 * database.js — SQLite database connection and schema initialization.
 * Uses better-sqlite3 for synchronous, zero-config SQLite access.
 * The database file (data.db) is auto-created in the backend/ directory.
 */

const Database = require('better-sqlite3');
const path = require('path');

// Database file lives one level up from src/, i.e. backend/data.db
const DB_PATH = path.join(__dirname, '..', 'data.db');

let db; // Singleton database connection

/**
 * Returns the singleton SQLite database instance.
 * On first call, opens the connection and enables WAL mode
 * (better concurrency) and foreign key enforcement.
 */
function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');   // Write-Ahead Logging for concurrent reads
    db.pragma('foreign_keys = ON');    // Enforce FK constraints
  }
  return db;
}

/**
 * Creates all 7 tables if they don't already exist.
 * Called once at server startup before seeding.
 *
 * Schema overview:
 *   - master_type:              Knowledge item types (Documentation, Recommendation, etc.)
 *   - master_process:           Manufacturing processes (Injection, Chrome, Paint, etc.)
 *   - master_project:           Automotive projects with customer/vehicle info
 *   - knowledge_item:           Main entity — the knowledge/lesson-learned record
 *   - knowledge_item_process:   M2M junction linking items to processes
 *   - knowledge_item_file:      File attachments (documents or images)
 *   - project_knowledge_item:   M2M junction linking items to projects ("Documents Used" feature)
 */
function initSchema() {
  const db = getDb();

  db.exec(`
    /* Master table: knowledge item types (e.g. Documentation, Lessons-learned, Guide-line) */
    CREATE TABLE IF NOT EXISTS master_type (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      code  TEXT NOT NULL,
      label TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    /* Master table: manufacturing processes (e.g. Injection, Chrome, Paint) */
    CREATE TABLE IF NOT EXISTS master_process (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      code  TEXT NOT NULL,
      label TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    /* Master table: automotive projects — flattened hierarchy with customer (OEM) and vehicle */
    CREATE TABLE IF NOT EXISTS master_project (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      designation TEXT NOT NULL,
      name        TEXT NOT NULL,
      description TEXT,
      customer    TEXT NOT NULL,
      vehicle     TEXT NOT NULL,
      is_active   INTEGER NOT NULL DEFAULT 1
    );

    /* Main entity: knowledge item with visibility workflow (PENDING → APPROVED/REJECTED) */
    CREATE TABLE IF NOT EXISTS knowledge_item (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      title             TEXT NOT NULL,
      designation       TEXT,
      date              TEXT NOT NULL,
      owner             TEXT NOT NULL,
      author            TEXT NOT NULL,
      type_id           INTEGER NOT NULL,
      project_id        INTEGER,
      plant             TEXT,
      document_link     TEXT,
      derived_from_id   INTEGER DEFAULT NULL,         /* Self-referencing FK for officialised items */
      visibility_status TEXT NOT NULL DEFAULT 'PENDING',
      is_active         INTEGER NOT NULL DEFAULT 1,   /* Soft-delete flag (0 = deleted) */
      created_at        TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (type_id) REFERENCES master_type(id),
      FOREIGN KEY (project_id) REFERENCES master_project(id),
      FOREIGN KEY (derived_from_id) REFERENCES knowledge_item(id)
    );

    /* Junction table: many-to-many relationship between items and processes */
    CREATE TABLE IF NOT EXISTS knowledge_item_process (
      knowledge_item_id INTEGER NOT NULL,
      process_id        INTEGER NOT NULL,
      PRIMARY KEY (knowledge_item_id, process_id),
      FOREIGN KEY (knowledge_item_id) REFERENCES knowledge_item(id),
      FOREIGN KEY (process_id) REFERENCES master_process(id)
    );

    /* File attachments: tracks uploaded documents and images per knowledge item */
    CREATE TABLE IF NOT EXISTS knowledge_item_file (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      knowledge_item_id INTEGER NOT NULL,
      file_kind         TEXT NOT NULL CHECK (file_kind IN ('DOCUMENT', 'IMAGE')),
      filename_original TEXT NOT NULL,
      storage_path      TEXT NOT NULL,
      uploaded_at       TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (knowledge_item_id) REFERENCES knowledge_item(id)
    );

    /* Junction table: links knowledge items to projects for the "Documents Used" feature */
    CREATE TABLE IF NOT EXISTS project_knowledge_item (
      project_id        INTEGER NOT NULL,
      knowledge_item_id INTEGER NOT NULL,
      added_at          TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (project_id, knowledge_item_id),
      FOREIGN KEY (project_id) REFERENCES master_project(id),
      FOREIGN KEY (knowledge_item_id) REFERENCES knowledge_item(id)
    );
  `);

  console.log('[DB] Schema initialized');
}

module.exports = { getDb, initSchema };
