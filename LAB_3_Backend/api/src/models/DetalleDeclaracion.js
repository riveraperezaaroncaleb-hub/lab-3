import { createModel } from './base.js';

export const DetalleDeclaracion = createModel({
  table: 'detalle_declaracion',
  columns: ['id_declaracion', 'id_producto', 'cantidad', 'valor'],
  primaryKey: ['id_declaracion', 'id_producto'],
});
