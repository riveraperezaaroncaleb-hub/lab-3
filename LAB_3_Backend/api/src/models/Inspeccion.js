import { createModel } from './base.js';

export const Inspeccion = createModel({
  table: 'inspeccion',
  columns: ['fecha', 'resultado', 'observaciones', 'id_declaracion'],
});
