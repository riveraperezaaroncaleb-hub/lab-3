import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { initializeDatabase } from './database.js';
import db from './database.js';

dotenv.config();
initializeDatabase();

const app = express();
const PORT = Number(process.env.PORT || 4000);
app.use(cors());
app.use(express.json());

const resources = {
  paises: { table: 'pais', columns: ['nombre', 'codigo_iso'] },
  importadores: { table: 'importador', columns: ['nombre', 'nit', 'telefono', 'correo'] },
  productos: { table: 'producto', columns: ['descripcion', 'unidad', 'valor_unitario', 'arancel'] },
  bodegas: { table: 'bodega', columns: ['nombre', 'ubicacion', 'capacidad'] },
};

function fields(body, columns) {
  const data = Object.fromEntries(columns.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));
  if (!Object.keys(data).length) throw new Error('No se enviaron campos válidos.');
  return data;
}

function errorResponse(res, error) {
  const message = error.message.includes('UNIQUE') ? 'Ya existe un registro con ese valor único.'
    : error.message.includes('FOREIGN KEY') ? 'No existe el registro relacionado.' : error.message;
  return res.status(400).json({ error: message });
}

const ESTADOS_DB = {
  'Recibida': 'RECIBIDA',
  'En inspección': 'EN_INSPECCION',
  'Retenida': 'RETENIDA',
  'Liberada': 'LIBERADA',
};
const ESTADOS_UI = Object.fromEntries(Object.entries(ESTADOS_DB).map(([ui, database]) => [database, ui]));
const toDbEstado = (estado) => ESTADOS_DB[estado] || String(estado).toUpperCase().replaceAll(' ', '_');
const toUiEstado = (estado) => ESTADOS_UI[estado] || estado;

for (const [route, { table, columns }] of Object.entries(resources)) {
  app.get(`/api/${route}`, (_req, res) => res.json(db.prepare(`SELECT * FROM ${table} ORDER BY id DESC`).all()));
  app.get(`/api/${route}/:id`, (req, res) => {
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    return row ? res.json(row) : res.status(404).json({ error: 'Registro no encontrado.' });
  });
  app.post(`/api/${route}`, (req, res) => {
    try { const data = fields(req.body, columns); const keys = Object.keys(data); const result = db.prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`).run(...Object.values(data)); return res.status(201).json(db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(result.lastInsertRowid)); } catch (error) { return errorResponse(res, error); }
  });
  app.put(`/api/${route}/:id`, (req, res) => {
    try { const data = fields(req.body, columns); const set = Object.keys(data).map((key) => `${key} = ?`).join(', '); const result = db.prepare(`UPDATE ${table} SET ${set} WHERE id = ?`).run(...Object.values(data), req.params.id); return result.changes ? res.json(db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id)) : res.status(404).json({ error: 'Registro no encontrado.' }); } catch (error) { return errorResponse(res, error); }
  });
  app.delete(`/api/${route}/:id`, (req, res) => { try { const result = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id); return result.changes ? res.status(204).send() : res.status(404).json({ error: 'Registro no encontrado.' }); } catch (error) { return errorResponse(res, error); } });
}

app.get('/api/declaraciones', (_req, res) => res.json(db.prepare(`SELECT d.*, i.nombre AS importador, p.nombre AS pais FROM declaracion d JOIN importador i ON i.id=d.id_importador JOIN pais p ON p.id=d.id_pais ORDER BY d.fecha DESC`).all()));
app.get('/api/declaraciones/:id', (req, res) => {
  const declaration = db.prepare('SELECT * FROM declaracion WHERE id = ?').get(req.params.id);
  if (!declaration) return res.status(404).json({ error: 'Declaración no encontrada.' });
  declaration.detalles = db.prepare('SELECT dd.*, p.descripcion, p.unidad FROM detalle_declaracion dd JOIN producto p ON p.id=dd.id_producto WHERE dd.id_declaracion = ?').all(req.params.id);
  declaration.inspecciones = db.prepare('SELECT * FROM inspeccion WHERE id_declaracion = ? ORDER BY fecha DESC').all(req.params.id);
  return res.json(declaration);
});
app.post('/api/declaraciones', (req, res) => {
  const { numero, fecha, estado, id_importador, id_pais, detalles = [] } = req.body;
  if (!numero || !fecha || !estado || !id_importador || !id_pais || !detalles.length) return res.status(400).json({ error: 'numero, fecha, estado, importador, país y al menos un detalle son obligatorios.' });
  try {
    const create = db.transaction(() => { const result = db.prepare('INSERT INTO declaracion (numero, fecha, estado, id_importador, id_pais) VALUES (?, ?, ?, ?, ?)').run(numero, fecha, estado, id_importador, id_pais); const detail = db.prepare('INSERT INTO detalle_declaracion (id_declaracion, id_producto, cantidad, valor) VALUES (?, ?, ?, ?)'); detalles.forEach((item) => detail.run(result.lastInsertRowid, item.id_producto, item.cantidad, item.valor)); return result.lastInsertRowid; });
    const id = create(); return res.status(201).json(db.prepare('SELECT * FROM declaracion WHERE id = ?').get(id));
  } catch (error) { return errorResponse(res, error); }
});

app.get('/api/inspecciones', (_req, res) => res.json(db.prepare('SELECT ins.*, d.numero AS declaracion FROM inspeccion ins JOIN declaracion d ON d.id=ins.id_declaracion ORDER BY ins.fecha DESC').all()));
app.post('/api/inspecciones', (req, res) => { try { const { fecha, resultado, observaciones = null, id_declaracion } = req.body; const result = db.prepare('INSERT INTO inspeccion (fecha, resultado, observaciones, id_declaracion) VALUES (?, ?, ?, ?)').run(fecha, resultado, observaciones, id_declaracion); return res.status(201).json(db.prepare('SELECT * FROM inspeccion WHERE id = ?').get(result.lastInsertRowid)); } catch (error) { return errorResponse(res, error); } });

app.get('/api/inventario', (_req, res) => res.json(db.prepare(`SELECT inv.*, b.nombre AS bodega, p.descripcion AS producto, p.unidad FROM inventario inv JOIN bodega b ON b.id=inv.id_bodega JOIN producto p ON p.id=inv.id_producto ORDER BY inv.fecha_ingreso DESC`).all()));
app.put('/api/inventario/:id_bodega/:id_producto', (req, res) => { try { const { cantidad, fecha_ingreso, estado } = req.body; db.prepare('INSERT INTO inventario (id_bodega, id_producto, cantidad, fecha_ingreso, estado) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id_bodega, id_producto) DO UPDATE SET cantidad=excluded.cantidad, fecha_ingreso=excluded.fecha_ingreso, estado=excluded.estado').run(req.params.id_bodega, req.params.id_producto, cantidad, fecha_ingreso, estado); return res.json(db.prepare('SELECT * FROM inventario WHERE id_bodega = ? AND id_producto = ?').get(req.params.id_bodega, req.params.id_producto)); } catch (error) { return errorResponse(res, error); } });

app.get('/api/consultas/mercancias', (req, res) => {
  const { pais, bodega, estado, importador, desde, hasta } = req.query;
  const conditions = []; const params = [];
  for (const [column, value] of Object.entries({ 'pa.nombre': pais, 'b.nombre': bodega, 'inv.estado': estado, 'i.nombre': importador })) if (value) { conditions.push(`${column} LIKE ?`); params.push(`%${value}%`); }
  if (desde) { conditions.push('d.fecha >= ?'); params.push(desde); } if (hasta) { conditions.push('d.fecha <= ?'); params.push(hasta); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  res.json(db.prepare(`SELECT DISTINCT d.numero AS declaracion, d.fecha, i.nombre AS importador, pa.nombre AS pais, p.descripcion AS producto, b.nombre AS bodega, inv.cantidad, inv.estado FROM declaracion d JOIN importador i ON i.id=d.id_importador JOIN pais pa ON pa.id=d.id_pais JOIN detalle_declaracion dd ON dd.id_declaracion=d.id JOIN producto p ON p.id=dd.id_producto JOIN inventario inv ON inv.id_producto=p.id JOIN bodega b ON b.id=inv.id_bodega ${where} ORDER BY d.fecha DESC`).all(...params));
});

// Herramienta para agentes: únicamente permite consultas de lectura.
app.post('/api/consultas/sql', (req, res) => {
  const sql = String(req.body?.sql || '').trim();
  const forbidden = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|PRAGMA|ATTACH|DETACH|VACUUM|REINDEX)\b/i;
  if (!/^(SELECT|WITH)\b/i.test(sql) || sql.includes(';') || forbidden.test(sql)) {
    return res.status(400).json({ error: 'Solo se permite una consulta SELECT de lectura, sin punto y coma.' });
  }
  try {
    const rows = db.prepare(sql).all();
    return res.json({ rows, count: rows.length });
  } catch (error) {
    return res.status(400).json({ error: `Consulta no válida: ${error.message}` });
  }
});

// Operación del frontend: datos reales de la base del laboratorio.
app.get('/api/operacion/catalogos', (_req, res) => {
  res.json({
    paises: db.prepare('SELECT id, nombre FROM pais ORDER BY nombre').all(),
    empresas: db.prepare('SELECT id, nombre FROM importador ORDER BY nombre').all(),
    productos: db.prepare(`SELECT id, descripcion AS nombre, valor_unitario AS precio_unitario_usd, unidad AS unidad_medida
      FROM producto ORDER BY descripcion`).all(),
    almacenes: db.prepare('SELECT id, nombre FROM bodega ORDER BY nombre').all(),
  });
});

app.get('/api/operacion/declaraciones', (req, res) => {
  const { regimen, estado } = req.query;
  const conditions = []; const params = [];
  if (regimen) { conditions.push('d.regimen = ?'); params.push(regimen); }
  if (estado) { conditions.push('d.estado = ?'); params.push(toDbEstado(estado)); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`SELECT d.id, d.numero, d.fecha, d.regimen, d.estado,
      i.nombre AS empresa, p.nombre AS pais_origen,
      GROUP_CONCAT(pr.descripcion, ', ') AS mercancias
    FROM declaracion d
    JOIN importador i ON i.id=d.id_importador
    JOIN pais p ON p.id=d.id_pais
    LEFT JOIN detalle_declaracion dd ON dd.id_declaracion=d.id
    LEFT JOIN producto pr ON pr.id=dd.id_producto
    ${where} GROUP BY d.id ORDER BY d.fecha DESC, d.id DESC`).all(...params);
  res.json(rows.map((row) => ({ ...row, estado: toUiEstado(row.estado) })));
});

app.post('/api/operacion/declaraciones', (req, res) => {
  const { numero, fecha, regimen = 'Importación', estado = 'Recibida', id_pais_origen, id_empresa, id_producto, cantidad, id_almacen } = req.body;
  if (!numero || !fecha || !regimen || !id_pais_origen || !id_empresa || !id_producto || !cantidad || !id_almacen) {
    return res.status(400).json({ error: 'Completa todos los campos obligatorios.' });
  }
  try {
    const createDeclaration = db.transaction(() => {
      const product = db.prepare('SELECT valor_unitario FROM producto WHERE id = ?').get(id_producto);
      if (!product) throw new Error('El producto seleccionado no existe.');
      const subtotal = Number(product.valor_unitario) * Number(cantidad);
      const dbEstado = toDbEstado(estado);
      const declaration = db.prepare(`INSERT INTO declaracion
        (numero, fecha, regimen, estado, id_importador, id_pais)
        VALUES (?, ?, ?, ?, ?, ?)`).run(numero, fecha, regimen, dbEstado, id_empresa, id_pais_origen);
      db.prepare('INSERT INTO detalle_declaracion (id_declaracion, id_producto, cantidad, valor) VALUES (?, ?, ?, ?)')
        .run(declaration.lastInsertRowid, id_producto, cantidad, subtotal);
      db.prepare(`INSERT INTO inventario (id_bodega, id_producto, cantidad, fecha_ingreso, estado) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id_bodega, id_producto) DO UPDATE SET cantidad = inventario.cantidad + excluded.cantidad,
          fecha_ingreso = excluded.fecha_ingreso, estado = excluded.estado`)
        .run(id_almacen, id_producto, cantidad, fecha, dbEstado);
      return declaration.lastInsertRowid;
    });
    const id = createDeclaration();
    const row = db.prepare(`SELECT d.*, i.nombre AS empresa, p.nombre AS pais_origen
      FROM declaracion d JOIN importador i ON i.id=d.id_importador JOIN pais p ON p.id=d.id_pais WHERE d.id = ?`).get(id);
    return res.status(201).json({ ...row, estado: toUiEstado(row.estado) });
  } catch (error) { return errorResponse(res, error); }
});

app.patch('/api/operacion/declaraciones/:id/estado', (req, res) => {
  const { estado } = req.body;
  const allowed = ['Recibida', 'En inspección', 'Retenida', 'Liberada'];
  if (!allowed.includes(estado)) return res.status(400).json({ error: 'Estado no válido.' });
  const dbEstado = toDbEstado(estado);
  const result = db.prepare('UPDATE declaracion SET estado = ? WHERE id = ?').run(dbEstado, req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Declaración no encontrada.' });
  return res.json({ ...db.prepare('SELECT * FROM declaracion WHERE id = ?').get(req.params.id), estado });
});

app.get('/api/operacion/resumen', (_req, res) => {
  const summary = db.prepare(`SELECT
      COUNT(*) AS total_declaraciones,
      SUM(CASE WHEN regimen='Importación' THEN 1 ELSE 0 END) AS ingresos,
      SUM(CASE WHEN regimen='Exportación' THEN 1 ELSE 0 END) AS salidas,
      SUM(CASE WHEN estado='RETENIDA' THEN 1 ELSE 0 END) AS retenidas
    FROM declaracion`).get();
  res.json(summary);
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: 'SQLite', service: 'Inventario aduanero' }));
app.use((error, _req, res, _next) => errorResponse(res, error));

app.listen(PORT, () => console.log(`API de aduanas disponible en http://localhost:${PORT}`));
