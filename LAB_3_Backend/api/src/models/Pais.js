import { createModel } from './base.js';

export const Pais = createModel({
  table: 'pais',
  columns: ['nombre', 'codigo_iso'],
});
