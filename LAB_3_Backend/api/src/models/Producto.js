import { createModel } from './base.js';

export const Producto = createModel({
  table: 'producto',
  columns: ['descripcion', 'unidad', 'valor_unitario', 'arancel'],
});
