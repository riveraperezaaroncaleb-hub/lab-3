import { createModel } from './base.js';

export const Importador = createModel({
  table: 'importador',
  columns: ['nombre', 'nit', 'telefono', 'correo'],
});
