import db from '../database.js';

const quote = (name) => `"${name}"`;

export function createModel({ table, columns, primaryKey = ['id'] }) {
  const primaryKeys = Array.isArray(primaryKey) ? primaryKey : [primaryKey];

  const pick = (data) => Object.fromEntries(
    columns.filter((key) => data[key] !== undefined).map((key) => [key, data[key]])
  );

  const whereFrom = (key) => {
    if (typeof key === 'object' && key !== null) {
      const entries = Object.entries(key);
      return {
        clause: entries.map(([column]) => `${quote(column)} = ?`).join(' AND '),
        params: entries.map(([, value]) => value),
      };
    }
    return {
      clause: primaryKeys.map((column) => `${quote(column)} = ?`).join(' AND '),
      params: primaryKeys.map(() => key),
    };
  };

  const model = {
    table,
    columns,
    primaryKey: primaryKeys,

    all(orderBy = primaryKeys[0]) {
      return db.prepare(`SELECT * FROM ${quote(table)} ORDER BY ${quote(orderBy)}`).all();
    },

    find(key) {
      const { clause, params } = whereFrom(key);
      return db.prepare(`SELECT * FROM ${quote(table)} WHERE ${clause}`).get(...params);
    },

    create(data) {
      const values = pick(data);
      const keys = Object.keys(values);
      if (!keys.length) throw new Error('No se enviaron campos válidos.');
      const placeholders = keys.map(() => '?').join(', ');
      const result = db
        .prepare(`INSERT INTO ${quote(table)} (${keys.map(quote).join(', ')}) VALUES (${placeholders})`)
        .run(...Object.values(values));
      if (primaryKeys.every((column) => data[column] !== undefined)) {
        return model.find(Object.fromEntries(primaryKeys.map((column) => [column, data[column]])));
      }
      return model.find(result.lastInsertRowid);
    },

    update(key, data) {
      const values = pick(data);
      const keys = Object.keys(values);
      if (!keys.length) throw new Error('No se enviaron campos válidos.');
      const { clause, params } = whereFrom(key);
      const set = keys.map((column) => `${quote(column)} = ?`).join(', ');
      const result = db
        .prepare(`UPDATE ${quote(table)} SET ${set} WHERE ${clause}`)
        .run(...Object.values(values), ...params);
      return result.changes ? model.find(key) : null;
    },

    remove(key) {
      const { clause, params } = whereFrom(key);
      return db.prepare(`DELETE FROM ${quote(table)} WHERE ${clause}`).run(...params).changes > 0;
    },
  };

  return model;
}
