INSERT OR IGNORE INTO pais (id, nombre, codigo_iso) VALUES
  (1, 'China', 'CN'), (2, 'Japón', 'JP'), (3, 'Colombia', 'CO'), (4, 'India', 'IN');
INSERT OR IGNORE INTO importador (id, nombre, nit, telefono, correo) VALUES
  (1, 'TecnoImport S.A.', '3101123456', '+506 2200-1001', 'contacto@tecnoimport.cr'),
  (2, 'Moda Caribe Ltda.', '3101987654', '+506 2200-1002', 'compras@modacaribe.cr');
INSERT OR IGNORE INTO producto (id, descripcion, unidad, valor_unitario, arancel) VALUES
  (1, 'Componentes electrónicos', 'unidad', 485.00, 13.00),
  (2, 'Textiles de algodón', 'metro', 18.50, 8.00),
  (3, 'Repuestos automotrices', 'unidad', 738.00, 15.00),
  (4, 'Juguetes y artículos plásticos', 'caja', 261.00, 10.00);
INSERT OR IGNORE INTO bodega (id, nombre, ubicacion, capacidad) VALUES
  (1, 'Bodega 1', 'Terminal Norte', 5000), (2, 'Bodega 2', 'Terminal Central', 8000),
  (3, 'Bodega 3', 'Terminal Sur', 3500);
INSERT OR IGNORE INTO declaracion (id, numero, fecha, regimen, estado, id_importador, id_pais) VALUES
  (1, 'DUA-2026-0841', '2026-10-22', 'Importación', 'RETENIDA', 1, 1),
  (2, 'DUA-2026-0839', '2026-10-22', 'Importación', 'EN_INSPECCION', 2, 4),
  (3, 'DUA-2026-0832', '2026-10-21', 'Exportación', 'LIBERADA', 1, 2);
INSERT OR IGNORE INTO detalle_declaracion (id_declaracion, id_producto, cantidad, valor) VALUES
  (1, 1, 100, 48500), (2, 2, 986, 18241), (3, 3, 100, 73800), (1, 4, 100, 26100);
INSERT OR IGNORE INTO inspeccion (id, fecha, resultado, observaciones, id_declaracion) VALUES
  (1, '2026-10-22', 'OBSERVADA', 'Pendiente revisión de certificados de origen.', 1),
  (2, '2026-10-22', 'PENDIENTE', 'Inspección física programada.', 2);
INSERT OR IGNORE INTO inventario (id_bodega, id_producto, cantidad, fecha_ingreso, estado) VALUES
  (2, 1, 100, '2026-10-22', 'RETENIDA'), (1, 2, 986, '2026-10-22', 'EN_INSPECCION'),
  (3, 3, 100, '2026-10-21', 'LIBERADA'), (2, 4, 100, '2026-10-22', 'RETENIDA');
