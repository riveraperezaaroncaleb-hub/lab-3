# Parte IV — Agente IA en n8n

## Entregables

- `flujo-agente-aduana.json`: flujo para importar en n8n.
- `prompt-sistema-aduana.md`: mensaje de sistema del agente.

## Configuración

1. Inicia la API: `cd LAB_3_Backend/api` y `npm run dev`.
2. En n8n importa `flujo-agente-aduana.json`.
3. Crea y selecciona la credencial de DeepSeek (API key) en `DeepSeek Chat Model` y usa el modelo `deepseek-chat`.
4. En `AI Agent`, pega el contenido de `prompt-sistema-aduana.md` como System Message.
5. Configura la URL de la herramienta:
   - n8n en Docker: `http://host.docker.internal:4000/api/consultas/sql`.
   - n8n instalado en el mismo equipo: `http://localhost:4000/api/consultas/sql`.
6. Abre el chat del Chat Trigger y prueba las preguntas de abajo.

La herramienta invoca `POST /api/consultas/sql`. La API acepta una sola sentencia `SELECT`/`WITH`, sin `;`, y rechaza DML/DDL. SQLite no soporta usuarios; la protección de solo lectura está aplicada en la API. Para una instalación real, expón la API por HTTPS, exige un token en el proxy y monta `aduanas.db` como solo lectura para el proceso que atiende consultas.

## Evidencia requerida

Toma una captura de cada respuesta del chat para estas ocho pruebas:

1. ¿Cuántas declaraciones de importación se registraron en octubre?
2. ¿Qué mercancías siguen retenidas y en qué bodega están?
3. ¿Cuál es el país de origen con más declaraciones recibidas?
4. ¿Qué importador ha declarado el mayor valor total en mercancías?
5. ¿Qué inspecciones tuvieron resultado OBSERVADA?
6. ¿Cuánta cantidad de cada producto hay en las bodegas?
7. ¿Qué declaraciones están retenidas por importador?
8. ¿Cuántas declaraciones hubo por mes y régimen durante 2026?
