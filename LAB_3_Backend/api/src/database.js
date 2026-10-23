import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
fs.mkdirSync(path.join(root, 'data'), { recursive: true });
const db = new Database(path.join(root, 'data', 'aduanas.db'));
db.pragma('foreign_keys = ON');

export function initializeDatabase() {
  db.exec(fs.readFileSync(path.join(root, 'sql', 'schema.sql'), 'utf8'));

  const declarationColumns = db.prepare('PRAGMA table_info(declaracion)').all().map((column) => column.name);
  if (!declarationColumns.includes('regimen')) {
    db.exec("ALTER TABLE declaracion ADD COLUMN regimen TEXT NOT NULL DEFAULT 'Importación'");
  }

  db.exec(fs.readFileSync(path.join(root, 'sql', 'seed.sql'), 'utf8'));
}

export default db;
