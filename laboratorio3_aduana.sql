-- Laboratorio #3 – Sistema de Inventario Aduanero, Parte III
-- Gestor: SQLite
-- Fecha: 2026-10-23
-- Integrante 1: <Nombre> - <Carné>
-- Integrante 2: <Nombre> - <Carné>
-- Integrante 3: <Nombre> - <Carné>
-- Ejecutar con: sqlite3 aduana.db < laboratorio3_aduana.sql

PRAGMA foreign_keys = ON;
BEGIN TRANSACTION;

DROP TABLE IF EXISTS tributo;
DROP TABLE IF EXISTS stock;
DROP TABLE IF EXISTS almacen;
DROP TABLE IF EXISTS inspeccion;
DROP TABLE IF EXISTS inspector;
DROP TABLE IF EXISTS detalle_declaracion;
DROP TABLE IF EXISTS declaracion;
DROP TABLE IF EXISTS producto;
DROP TABLE IF EXISTS categoria;
DROP TABLE IF EXISTS empresa;
DROP TABLE IF EXISTS aduana;
DROP TABLE IF EXISTS pais;

CREATE TABLE pais (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  codigo_iso TEXT NOT NULL UNIQUE CHECK (length(codigo_iso) = 2),
  continente TEXT NOT NULL CHECK (continente IN ('América','Europa','Asia','África','Oceanía'))
);
CREATE TABLE aduana (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  id_pais INTEGER NOT NULL REFERENCES pais(id)
);
CREATE TABLE empresa (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  nit TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('Importador','Exportador','Transportista')),
  id_pais INTEGER NOT NULL REFERENCES pais(id)
);
CREATE TABLE categoria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE
);
CREATE TABLE producto (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL UNIQUE CHECK (codigo GLOB '[0-9][0-9][0-9][0-9].[0-9][0-9].[0-9][0-9]'),
  nombre TEXT NOT NULL,
  id_categoria INTEGER NOT NULL REFERENCES categoria(id),
  precio_unitario_usd REAL NOT NULL CHECK (precio_unitario_usd > 0),
  unidad_medida TEXT NOT NULL CHECK (unidad_medida IN ('Unidad','Kg','Litro','Metro','Caja','Tonelada','Par')),
  requiere_licencia INTEGER NOT NULL DEFAULT 0 CHECK (requiere_licencia IN (0,1))
);
CREATE TABLE declaracion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero TEXT NOT NULL UNIQUE,
  fecha TEXT NOT NULL CHECK (date(fecha) IS NOT NULL),
  regimen TEXT NOT NULL CHECK (regimen IN ('Importación','Exportación','Tránsito')),
  estado TEXT NOT NULL DEFAULT 'Retenida' CHECK (estado IN ('Recibida','En inspección','Retenida','Liberada')),
  id_pais_origen INTEGER NOT NULL REFERENCES pais(id),
  id_empresa INTEGER NOT NULL REFERENCES empresa(id),
  id_aduana INTEGER NOT NULL REFERENCES aduana(id),
  valor_fob_usd REAL NOT NULL CHECK (valor_fob_usd > 0),
  flete_usd REAL NOT NULL DEFAULT 0 CHECK (flete_usd >= 0),
  seguro_usd REAL NOT NULL DEFAULT 0 CHECK (seguro_usd >= 0)
);
CREATE TABLE detalle_declaracion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_declaracion INTEGER NOT NULL REFERENCES declaracion(id) ON DELETE CASCADE,
  id_producto INTEGER NOT NULL REFERENCES producto(id),
  cantidad REAL NOT NULL CHECK (cantidad > 0),
  precio_unitario_usd REAL NOT NULL CHECK (precio_unitario_usd > 0),
  subtotal_usd REAL NOT NULL CHECK (subtotal_usd > 0),
  UNIQUE (id_declaracion, id_producto),
  CHECK (subtotal_usd = cantidad * precio_unitario_usd)
);
CREATE TABLE inspector (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  documento TEXT NOT NULL UNIQUE,
  turno TEXT NOT NULL CHECK (turno IN ('Mañana','Tarde','Noche')),
  id_aduana INTEGER NOT NULL REFERENCES aduana(id)
);
CREATE TABLE inspeccion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_declaracion INTEGER NOT NULL UNIQUE REFERENCES declaracion(id) ON DELETE CASCADE,
  id_inspector INTEGER NOT NULL REFERENCES inspector(id),
  fecha TEXT NOT NULL CHECK (date(fecha) IS NOT NULL),
  resultado TEXT NOT NULL CHECK (resultado IN ('Aprobada','Observada','Rechazada','Pendiente')),
  observaciones TEXT
);
CREATE TABLE almacen (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  id_aduana INTEGER NOT NULL REFERENCES aduana(id),
  capacidad_m3 REAL NOT NULL CHECK (capacidad_m3 > 0)
);
CREATE TABLE stock (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_producto INTEGER NOT NULL REFERENCES producto(id),
  id_almacen INTEGER NOT NULL REFERENCES almacen(id),
  cantidad REAL NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  fecha_ingreso TEXT NOT NULL CHECK (date(fecha_ingreso) IS NOT NULL),
  UNIQUE (id_producto, id_almacen)
);
CREATE TABLE tributo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_declaracion INTEGER NOT NULL REFERENCES declaracion(id) ON DELETE CASCADE,
  concepto TEXT NOT NULL CHECK (concepto IN ('Arancel','IVA','ICE','Tasa de servicio')),
  monto_usd REAL NOT NULL CHECK (monto_usd >= 0),
  fecha_pago TEXT CHECK (fecha_pago IS NULL OR date(fecha_pago) IS NOT NULL),
  estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente','Pagado')),
  CHECK ((estado = 'Pendiente' AND fecha_pago IS NULL) OR (estado = 'Pagado' AND fecha_pago IS NOT NULL))
);

INSERT INTO pais (nombre,codigo_iso,continente) VALUES
('Costa Rica','CR','América'),('China','CN','Asia'),('Estados Unidos','US','América'),('México','MX','América'),('Colombia','CO','América'),
('Brasil','BR','América'),('Alemania','DE','Europa'),('Japón','JP','Asia'),('India','IN','Asia'),('España','ES','Europa'),
('Canadá','CA','América'),('Chile','CL','América'),('Panamá','PA','América'),('Corea del Sur','KR','Asia'),('Francia','FR','Europa');
INSERT INTO aduana (codigo,nombre,ciudad,id_pais) VALUES
('CR-LIM','Aduana de Limón','Limón',1),('CR-CAL','Aduana de Caldera','Puntarenas',1),('CR-SJO','Aduana Santamaría','Alajuela',1),('CR-PAS','Aduana Paso Canoas','Puntarenas',1),('CR-PEÑ','Aduana Peñas Blancas','Guanacaste',1),
('CN-SHA','Aduana de Shanghái','Shanghái',2),('US-MIA','Aduana de Miami','Miami',3),('MX-VER','Aduana de Veracruz','Veracruz',4),('CO-CTG','Aduana de Cartagena','Cartagena',5),('BR-SAN','Aduana de Santos','Santos',6),
('DE-HAM','Aduana de Hamburgo','Hamburgo',7),('JP-YOK','Aduana de Yokohama','Yokohama',8),('IN-MUM','Aduana de Mumbai','Mumbai',9),('PA-COL','Aduana de Colón','Colón',13),('KR-BUS','Aduana de Busan','Busan',14);
INSERT INTO empresa (nombre,nit,tipo,id_pais) VALUES
('TecnoImport S.A.','3101123456','Importador',1),('Moda Caribe Ltda.','3101987654','Importador',1),('Motores del Valle','3101456789','Importador',1),('Exportadora Tica','3101567890','Exportador',1),('Logística Pacífico','3101678901','Transportista',1),
('Shenzhen Components','CN91310001','Exportador',2),('Textiles de India','IN27340002','Exportador',9),('Auto Parts Japan','JP13450003','Exportador',8),('Café Andino','CO90060004','Exportador',5),('Pacific Freight','PA15570005','Transportista',13),
('Global Pharma','DE27880006','Exportador',7),('Electro Korea','KR34490007','Exportador',14),('Vinos del Sur','CL76500008','Exportador',12),('Norteamérica Trade','US88710009','Importador',3),('Caribe Aduanal','CR3101789012','Transportista',1);
INSERT INTO categoria (nombre) VALUES
('Electrónica'),('Textiles'),('Automotriz'),('Alimentos'),('Juguetes'),('Farmacéutica'),('Maquinaria'),('Bebidas'),('Cosmética'),('Muebles'),('Químicos'),('Herramientas'),('Papelería'),('Calzado'),('Metales');
INSERT INTO producto (codigo,nombre,id_categoria,precio_unitario_usd,unidad_medida,requiere_licencia) VALUES
('8542.31.00','Microprocesadores',1,485,'Unidad',0),('5208.12.00','Tela de algodón',2,18.5,'Metro',0),('8708.40.00','Cajas de cambio',3,738,'Unidad',0),('0901.11.00','Café verde',4,6.4,'Kg',0),('9503.00.00','Juguetes plásticos',5,261,'Caja',0),
('3004.90.00','Medicamentos dosificados',6,89,'Caja',1),('8471.30.00','Computadoras portátiles',1,920,'Unidad',0),('8419.89.00','Equipo de refrigeración',7,3400,'Unidad',0),('2203.00.00','Cerveza de malta',8,29,'Caja',0),('3304.99.00','Cosméticos faciales',9,42,'Caja',0),
('9403.60.00','Muebles de madera',10,560,'Unidad',0),('3907.61.00','Resina PET',11,1.8,'Kg',0),('8205.59.00','Herramientas manuales',12,75,'Caja',0),('4823.90.00','Papel para impresión',13,4.2,'Kg',0),('6403.99.00','Calzado de cuero',14,65,'Par',0);
INSERT INTO declaracion (numero,fecha,regimen,estado,id_pais_origen,id_empresa,id_aduana,valor_fob_usd,flete_usd,seguro_usd) VALUES
('DUA-2025-0001','2025-01-15','Importación','Liberada',2,1,1,48500,3200,485),('DUA-2025-0002','2025-02-10','Importación','Retenida',9,2,2,18241,1200,182),('DUA-2025-0003','2025-03-08','Importación','Liberada',8,3,3,73800,4600,738),
('DUA-2025-0004','2025-04-22','Exportación','Liberada',5,4,1,32000,1700,320),('DUA-2025-0005','2025-05-13','Importación','En inspección',2,1,1,26100,2100,261),('DUA-2025-0006','2025-06-18','Importación','Recibida',7,14,3,8900,900,89),
('DUA-2025-0007','2025-07-04','Tránsito','Liberada',14,5,4,27600,1450,276),('DUA-2025-0008','2025-08-29','Importación','Retenida',7,1,2,27200,1800,272),('DUA-2025-0009','2025-09-11','Importación','Liberada',3,2,3,14500,1100,145),
('DUA-2025-0010','2025-10-25','Importación','En inspección',14,1,1,21000,1300,210),('DUA-2026-0001','2026-01-09','Importación','Liberada',12,2,2,22400,1600,224),('DUA-2026-0002','2026-03-16','Importación','Recibida',2,3,3,18000,1250,180),
('DUA-2026-0003','2026-05-20','Importación','Retenida',3,1,1,22500,1500,225),('DUA-2026-0004','2026-08-07','Importación','Liberada',5,14,2,21000,1400,210),('DUA-2026-0005','2026-10-22','Importación','En inspección',2,1,1,32500,2300,325);
INSERT INTO detalle_declaracion (id_declaracion,id_producto,cantidad,precio_unitario_usd,subtotal_usd) VALUES
(1,1,100,485,48500),(2,2,986,18.5,18241),(3,3,100,738,73800),(4,4,5000,6.4,32000),(5,5,100,261,26100),
(6,6,100,89,8900),(7,7,30,920,27600),(8,8,8,3400,27200),(9,9,500,29,14500),(10,10,500,42,21000),
(11,11,40,560,22400),(12,12,10000,1.8,18000),(13,13,300,75,22500),(14,14,5000,4.2,21000),(15,15,500,65,32500);
INSERT INTO inspector (nombre,documento,turno,id_aduana) VALUES
('Ana Rodríguez','INS-0001','Mañana',1),('Carlos Méndez','INS-0002','Tarde',2),('Lucía Vargas','INS-0003','Noche',3),('Diego Solano','INS-0004','Mañana',4),('Sofía Ramírez','INS-0005','Tarde',5),
('Jorge Castro','INS-0006','Noche',1),('Elena Mora','INS-0007','Mañana',2),('Pablo Rojas','INS-0008','Tarde',3),('Valeria Cruz','INS-0009','Noche',4),('Andrés Salas','INS-0010','Mañana',5),
('María Chacón','INS-0011','Tarde',1),('Ricardo León','INS-0012','Noche',2),('Natalia Pineda','INS-0013','Mañana',3),('Daniel Araya','INS-0014','Tarde',4),('Fernanda Ruiz','INS-0015','Noche',5);
INSERT INTO inspeccion (id_declaracion,id_inspector,fecha,resultado,observaciones) VALUES
(1,1,'2025-01-16','Aprobada','Documentación completa'),(2,2,'2025-02-11','Observada','Falta certificado de origen'),(3,3,'2025-03-09','Aprobada','Sin novedades'),(4,6,'2025-04-23','Aprobada','Carga verificada'),(5,11,'2025-05-14','Pendiente','Revisión física programada'),
(6,8,'2025-06-19','Aprobada','Licencia sanitaria validada'),(7,4,'2025-07-05','Aprobada','Tránsito autorizado'),(8,7,'2025-08-30','Rechazada','Mercancía no conforme'),(9,13,'2025-09-12','Aprobada','Cantidad conforme'),(10,1,'2025-10-26','Pendiente','Esperando muestra'),
(11,2,'2026-01-10','Aprobada','Liberación aprobada'),(12,3,'2026-03-17','Aprobada','Sin observaciones'),(13,6,'2026-05-21','Observada','Declaración de valor requerida'),(14,7,'2026-08-08','Aprobada','Stock ingresado'),(15,11,'2026-10-23','Pendiente','Inspección documental');
INSERT INTO almacen (codigo,nombre,id_aduana,capacidad_m3) VALUES
('ALM-LIM-01','Bodega Limón Norte',1,5000),('ALM-CAL-01','Bodega Caldera A',2,4500),('ALM-SJO-01','Bodega Aeropuerto',3,2800),('ALM-PAS-01','Bodega Paso Canoas',4,3200),('ALM-PB-01','Bodega Peñas Blancas',5,3000),
('ALM-LIM-02','Bodega Limón Sur',1,4200),('ALM-CAL-02','Bodega Caldera B',2,3800),('ALM-SJO-02','Bodega Fiscal 2',3,2500),('ALM-PAS-02','Bodega Frontera Sur',4,2900),('ALM-PB-02','Bodega Frontera Norte',5,3100),
('ALM-LIM-03','Patio Contenedores Limón',1,6500),('ALM-CAL-03','Patio Caldera',2,6100),('ALM-SJO-03','Almacén Courier',3,1800),('ALM-PAS-03','Almacén Transitorio Sur',4,2700),('ALM-PB-03','Almacén Transitorio Norte',5,2600);
INSERT INTO stock (id_producto,id_almacen,cantidad,fecha_ingreso) VALUES
(1,1,100,'2025-01-15'),(2,2,986,'2025-02-10'),(3,3,100,'2025-03-08'),(4,6,5000,'2025-04-22'),(5,1,100,'2025-05-13'),
(6,3,100,'2025-06-18'),(7,4,30,'2025-07-04'),(8,2,8,'2025-08-29'),(9,8,500,'2025-09-11'),(10,1,500,'2025-10-25'),
(11,7,40,'2026-01-09'),(12,3,10000,'2026-03-16'),(13,11,300,'2026-05-20'),(14,12,5000,'2026-08-07'),(15,1,500,'2026-10-22');
INSERT INTO tributo (id_declaracion,concepto,monto_usd,fecha_pago,estado) VALUES
(1,'Arancel',6305,'2025-01-17','Pagado'),(2,'IVA',2371.33,NULL,'Pendiente'),(3,'Arancel',11743,'2025-03-10','Pagado'),(4,'Tasa de servicio',160,'2025-04-24','Pagado'),(5,'IVA',3393,NULL,'Pendiente'),
(6,'Arancel',1157,'2025-06-20','Pagado'),(7,'Tasa de servicio',138,'2025-07-06','Pagado'),(8,'Arancel',3536,NULL,'Pendiente'),(9,'IVA',1885,'2025-09-14','Pagado'),(10,'ICE',2100,NULL,'Pendiente'),
(11,'Arancel',2912,'2026-01-12','Pagado'),(12,'IVA',2340,'2026-03-19','Pagado'),(13,'Arancel',2925,NULL,'Pendiente'),(14,'IVA',2730,'2026-08-10','Pagado'),(15,'Arancel',4225,NULL,'Pendiente');

-- Consulta 1: ¿Cuál es el valor importado por país de origen?
SELECT p.nombre AS pais_origen, ROUND(SUM(d.valor_fob_usd), 2) AS valor_importado_usd
FROM declaracion d INNER JOIN pais p ON p.id = d.id_pais_origen
WHERE d.regimen = 'Importación' GROUP BY p.nombre ORDER BY valor_importado_usd DESC;
-- Consulta 2: ¿Cuáles son los productos con mayor cantidad declarada?
SELECT pr.nombre AS producto, ROUND(SUM(dd.cantidad), 2) AS cantidad_total
FROM detalle_declaracion dd INNER JOIN producto pr ON pr.id = dd.id_producto
GROUP BY pr.id, pr.nombre ORDER BY cantidad_total DESC LIMIT 10;
-- Consulta 3: ¿Qué declaraciones permanecen retenidas o en inspección?
SELECT d.numero, d.fecha, e.nombre AS empresa, d.estado, ROUND(d.valor_fob_usd,2) AS fob_usd
FROM declaracion d INNER JOIN empresa e ON e.id = d.id_empresa
WHERE d.estado IN ('Retenida','En inspección') ORDER BY d.fecha DESC;
-- Consulta 4: ¿Cuánto se ha recaudado y cuánto está pendiente por tipo de tributo?
SELECT concepto, estado, ROUND(SUM(monto_usd),2) AS total_usd, COUNT(*) AS movimientos
FROM tributo GROUP BY concepto, estado ORDER BY concepto, estado;
-- Consulta 5: ¿Qué empresas superan USD 20,000 FOB acumulados?
SELECT e.nombre AS empresa, ROUND(SUM(d.valor_fob_usd),2) AS fob_acumulado_usd
FROM empresa e INNER JOIN declaracion d ON d.id_empresa = e.id
GROUP BY e.id, e.nombre HAVING SUM(d.valor_fob_usd) > 20000 ORDER BY fob_acumulado_usd DESC;
-- Consulta 6: ¿Qué existencias son bajas (menos de 50 unidades) por almacén?
SELECT a.nombre AS almacen, p.nombre AS producto, s.cantidad, s.fecha_ingreso
FROM stock s INNER JOIN almacen a ON a.id=s.id_almacen INNER JOIN producto p ON p.id=s.id_producto
WHERE s.cantidad < 50 ORDER BY s.cantidad ASC, a.nombre;
-- Consulta 7: ¿Cuál es el ranking de inspectores por inspecciones realizadas?
SELECT i.nombre AS inspector, i.turno, COUNT(ins.id) AS inspecciones, MAX(ins.fecha) AS ultima_inspeccion
FROM inspector i LEFT JOIN inspeccion ins ON ins.id_inspector=i.id
GROUP BY i.id, i.nombre, i.turno HAVING COUNT(ins.id) > 0 ORDER BY inspecciones DESC, ultima_inspeccion DESC;
-- Consulta 8: ¿Cuántas declaraciones hay por mes y régimen?
SELECT strftime('%Y-%m', fecha) AS mes, regimen, COUNT(*) AS declaraciones, ROUND(AVG(valor_fob_usd),2) AS fob_promedio_usd
FROM declaracion GROUP BY strftime('%Y-%m', fecha), regimen ORDER BY mes, regimen;

COMMIT;
