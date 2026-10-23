import { createModel } from './base.js';

export const Bodega = createModel({
  table: 'bodega',
  columns: ['nombre', 'ubicacion', 'capacidad'],
});
