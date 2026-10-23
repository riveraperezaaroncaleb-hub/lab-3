PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS pais (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  codigo_iso TEXT NOT NULL UNIQUE CHECK (length(codigo_iso) BETWEEN 2 AND 3)
);

CREATE TABLE IF NOT EXISTS importador (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  nit TEXT NOT NULL UNIQUE,
  telefono TEXT,
  correo TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS producto (
  id INTEGER PRIMARY KEY,
  descripcion TEXT NOT NULL,
  unidad TEXT NOT NULL,
  valor_unitario REAL NOT NULL CHECK (valor_unitario >= 0),
  arancel REAL NOT NULL DEFAULT 0 CHECK (arancel BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS bodega (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  ubicacion TEXT NOT NULL,
  capacidad INTEGER NOT NULL CHECK (capacidad > 0)
);

CREATE TABLE IF NOT EXISTS declaracion (
  id INTEGER PRIMARY KEY,
  numero TEXT NOT NULL UNIQUE,
  fecha TEXT NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('RECIBIDA', 'EN_INSPECCION', 'RETENIDA', 'LIBERADA')),
  id_importador INTEGER NOT NULL,
  id_pais INTEGER NOT NULL,
  FOREIGN KEY (id_importador) REFERENCES importador(id),
  FOREIGN KEY (id_pais) REFERENCES pais(id)
);

CREATE TABLE IF NOT EXISTS detalle_declaracion (
  id_declaracion INTEGER NOT NULL,
  id_producto INTEGER NOT NULL,
  cantidad REAL NOT NULL CHECK (cantidad > 0),
  valor REAL NOT NULL CHECK (valor >= 0),
  PRIMARY KEY (id_declaracion, id_producto),
  FOREIGN KEY (id_declaracion) REFERENCES declaracion(id) ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES producto(id)
);

CREATE TABLE IF NOT EXISTS inspeccion (
  id INTEGER PRIMARY KEY,
  fecha TEXT NOT NULL,
  resultado TEXT NOT NULL CHECK (resultado IN ('APROBADA', 'OBSERVADA', 'RECHAZADA', 'PENDIENTE')),
  observaciones TEXT,
  id_declaracion INTEGER NOT NULL,
  FOREIGN KEY (id_declaracion) REFERENCES declaracion(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventario (
  id_bodega INTEGER NOT NULL,
  id_producto INTEGER NOT NULL,
  cantidad REAL NOT NULL CHECK (cantidad >= 0),
  fecha_ingreso TEXT NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('RECIBIDA', 'EN_INSPECCION', 'RETENIDA', 'LIBERADA')),
  PRIMARY KEY (id_bodega, id_producto),
  FOREIGN KEY (id_bodega) REFERENCES bodega(id),
  FOREIGN KEY (id_producto) REFERENCES producto(id)
);

CREATE INDEX IF NOT EXISTS idx_declaracion_importador ON declaracion(id_importador);
CREATE INDEX IF NOT EXISTS idx_declaracion_pais ON declaracion(id_pais);
CREATE INDEX IF NOT EXISTS idx_declaracion_estado ON declaracion(estado);
CREATE INDEX IF NOT EXISTS idx_inspeccion_declaracion ON inspeccion(id_declaracion);
