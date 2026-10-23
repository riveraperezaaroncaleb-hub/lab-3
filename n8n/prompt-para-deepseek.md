# Prompt para DeepSeek

Actúa como un especialista senior en n8n (versión actual), DeepSeek y SQLite. Necesito que generes un flujo **realmente importable y ejecutable** en n8n, no pseudocódigo ni una explicación genérica.

## Objetivo

Construye un agente de IA para un Sistema de Inventario Aduanero. Debe recibir preguntas en español, consultar datos reales y responder en español. El frontend React enviará `POST` JSON a este webhook:

`http://127.0.0.1:5678/webhook/aduana-chat`

Entrada esperada:

```json
{ "chatInput": "¿Qué mercancías siguen retenidas?", "sessionId": "aduana-frontend" }
```

Respuesta esperada:

```json
{ "output": "respuesta del agente" }
```

## Restricciones importantes

1. Usa estos nodos: **Webhook** (POST `/aduana-chat`, response mode usando `Respond to Webhook`), **AI Agent**, **DeepSeek Chat Model**, **Simple Memory**, **HTTP Request Tool** y **Respond to Webhook**. Si puedes, añade también un Chat Trigger conectado al mismo agente para cumplir la demostración por chat de n8n.
2. El modelo debe ser `deepseek-chat`; deja la credencial DeepSeek sin valores secretos para que yo la seleccione al importar.
3. El HTTP Request Tool debe hacer `POST` con JSON a `http://host.docker.internal:4000/api/consultas/sql`. Para n8n instalado sin Docker, explicar qué cambiar a `http://127.0.0.1:4000/api/consultas/sql`.
4. El cuerpo del HTTP Tool debe recibir la consulta desde el agente mediante `$fromAI`, con esta forma:

```json
{ "sql": "{{ $fromAI('sql', 'Una única consulta SQLite SELECT o WITH, sin punto y coma', 'string') }}" }
```

5. El backend ya bloquea INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, PRAGMA y sentencias múltiples. De todas formas, el prompt del AI Agent debe prohibirlas explícitamente y exigir únicamente SELECT/WITH sin `;`.
6. La memoria debe usar `sessionId` recibido por el webhook. El agente debe tomar la pregunta de `chatInput`.
7. Conecta los puertos correctamente: modelo → AI Agent (`ai_languageModel`), memoria → AI Agent (`ai_memory`), HTTP Tool → AI Agent (`ai_tool`), Webhook → AI Agent y AI Agent → Respond to Webhook.
8. No uses nodos inexistentes, credenciales inventadas, expresiones antiguas ni código personalizado innecesario. Genera un JSON de workflow compatible con la versión actual de n8n y asegúrate de que sea JSON válido.

## Esquema SQLite que el agente puede consultar

- pais(id, nombre, codigo_iso)
- importador(id, nombre, nit, telefono, correo)
- producto(id, descripcion, unidad, valor_unitario, arancel)
- bodega(id, nombre, ubicacion, capacidad)
- declaracion(id, numero, fecha, regimen, estado, id_importador, id_pais)
- detalle_declaracion(id_declaracion, id_producto, cantidad, valor)
- inspeccion(id, fecha, resultado, observaciones, id_declaracion)
- inventario(id_bodega, id_producto, cantidad, fecha_ingreso, estado)

Relaciones: declaración → importador/país; detalle_declaracion → declaración/producto; inventario → bodega/producto; inspeccion → declaración. Los estados se guardan en mayúsculas: RECIBIDA, EN_INSPECCION, RETENIDA, LIBERADA.

## Prompt de sistema obligatorio dentro del AI Agent

Eres el asistente de consulta de la Aduana. Responde en español y usa la herramienta SQL antes de responder preguntas sobre datos. Solo puedes enviar una sentencia SELECT o WITH, sin punto y coma. Nunca ejecutes ni propongas INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, PRAGMA, ATTACH o DETACH. Usa JOIN según las relaciones descritas, ROUND para montos, strftime('%Y-%m', fecha) para meses y LIMIT 50 en listados. Si no hay filas, dilo sin inventar información.

## Entrega que debes darme

1. Primero, solo el JSON completo del workflow dentro de un bloque `json`, listo para importar.
2. Después, una lista corta de exactamente cinco pasos para importar, configurar la credencial DeepSeek, activar el webhook y probarlo.
3. Incluye dos comandos curl para probar el webhook: una consulta válida y un caso de error.
4. Revisa internamente el JSON antes de responder: todas las conexiones deben apuntar a nombres de nodos existentes y ningún nodo debe contener credenciales o claves secretas.
