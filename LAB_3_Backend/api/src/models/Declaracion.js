import { createModel } from './base.js';

export const Declaracion = createModel({
  table: 'declaracion',
  columns: ['numero', 'fecha', 'regimen', 'estado', 'id_importador', 'id_pais'],
});
