import { createModel } from './base.js';

export const Inventario = createModel({
  table: 'inventario',
  columns: ['id_bodega', 'id_producto', 'cantidad', 'fecha_ingreso', 'estado'],
  primaryKey: ['id_bodega', 'id_producto'],
});
