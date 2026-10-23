import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const databasePath = path.join(apiRoot, 'data', 'laboratorio3_aduana.db');
const scriptPath = path.resolve(apiRoot, '../../laboratorio3_aduana.sql');

fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const agentDb = new Database(databasePath, { readonly: false });
agentDb.pragma('foreign_keys = ON');

const schemaExists = agentDb.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'empresa'").get();
if (!schemaExists) {
  agentDb.exec(fs.readFileSync(scriptPath, 'utf8'));
}

export default agentDb;
