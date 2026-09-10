import path from 'path';

let db: any = null;

export function getDb() {
  if (db) return db;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { createClient } = require('@supabase/supabase-js');
    db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    return db;
  }

  const Database = require('better-sqlite3');
  db = new Database(path.join('/tmp', 'app.db'));
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS boards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS columns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      board_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      column_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE
    );
  `);

  const count = db.prepare('SELECT COUNT(*) as c FROM boards').get();
  if (count.c === 0) {
    db.exec(`
      INSERT INTO boards (title) VALUES ('My First Board');
      INSERT INTO columns (board_id, title, position) VALUES (1, 'To Do', 0);
      INSERT INTO columns (board_id, title, position) VALUES (1, 'In Progress', 1);
      INSERT INTO columns (board_id, title, position) VALUES (1, 'Done', 2);
      INSERT INTO tasks (column_id, title, description, position) VALUES (1, 'Sample Task', 'A sample task', 0);
    `);
  }

  return db;
}

export function isSupabase(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}