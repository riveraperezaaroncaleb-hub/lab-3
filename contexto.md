# Prompt: Contexto del quiz (Inventario aduanero + agente IA en n8n)

Actúa como un desarrollador senior full stack con experiencia en bases de datos y automatización con n8n. Voy a hacer un quiz práctico y necesito que me ayudes siguiendo este contexto al pie de la letra.

## 1. Contexto del caso

Una aduana controla la mercancía que entra y sale del país. Cada día recibe contenedores y cargamentos de distintos importadores, que llegan desde varios países, se registran mediante declaraciones aduaneras, se almacenan en depósitos o bodegas, pasan por inspecciones y pagan aranceles antes de ser liberados.

Actualmente toda esa información se lleva en hojas de cálculo dispersas, lo que provoca errores, mercancía "perdida" y lentitud para responder preguntas básicas.

## 2. Lo que debo entregar

1. **Base de datos** del sistema de inventario aduanero (diseño y script SQL).
2. **Datos de prueba** realistas para llenarla.
3. **Agente de IA en n8n** que permita a los funcionarios consultar la información escribiendo preguntas en lenguaje natural.

Ejemplo de pregunta que el agente debe responder:
> "¿Qué mercancías de China siguen retenidas en la bodega 2?"

## 3. Entidades mínimas a modelar

- Importadores
- Países de origen
- Contenedores / cargamentos
- Declaraciones aduaneras
- Mercancías (productos)
- Bodegas / depósitos
- Inspecciones
- Aranceles y pagos
- Estados de la mercancía (ej. recibida, en inspección, retenida, liberada)

## 4. Reglas

- Responde en español, con tono casual y directo.
- Sé conciso: no sobre-entregues ni agregues extras que no pedí.
- Cada entregable debe ser un archivo independiente, sin referencias a trabajos anteriores.
- El código se pega crudo directamente en el chat.
- Primero muestra el diagrama/relaciones de tablas, luego el SQL, luego los datos de prueba, y al final el flujo de n8n (nodos, prompt del agente y consultas SQL).
- El agente debe poder responder preguntas por país, bodega, estado, importador y fechas.
- Incluye una breve justificación de las decisiones de diseño.

## 5. Antes de empezar

Si algo del enunciado no está claro, haz **una sola pregunta** y espera mi respuesta. Si no, empieza directo por el diseño de la base de datos.# Prompt: Contexto del quiz (Inventario aduanero + agente IA en n8n)

Actúa como un desarrollador senior full stack con experiencia en bases de datos y automatización con n8n. Voy a hacer un quiz práctico y necesito que me ayudes siguiendo este contexto al pie de la letra.

## 1. Contexto del caso

Una aduana controla la mercancía que entra y sale del país. Cada día recibe contenedores y cargamentos de distintos importadores, que llegan desde varios países, se registran mediante declaraciones aduaneras, se almacenan en depósitos o bodegas, pasan por inspecciones y pagan aranceles antes de ser liberados.

Actualmente toda esa información se lleva en hojas de cálculo dispersas, lo que provoca errores, mercancía "perdida" y lentitud para responder preguntas básicas.

## 2. Lo que debo entregar

1. **Base de datos** del sistema de inventario aduanero (diseño y script SQL).
2. **Datos de prueba** realistas para llenarla.
3. **Agente de IA en n8n** que permita a los funcionarios consultar la información escribiendo preguntas en lenguaje natural.

Ejemplo de pregunta que el agente debe responder:
> "¿Qué mercancías de China siguen retenidas en la bodega 2?"

## 3. Entidades mínimas a modelar

- Importadores
- Países de origen
- Contenedores / cargamentos
- Declaraciones aduaneras
- Mercancías (productos)
- Bodegas / depósitos
- Inspecciones
- Aranceles y pagos
- Estados de la mercancía (ej. recibida, en inspección, retenida, liberada)

## 4. Reglas

- Responde en español, con tono casual y directo.
- Sé conciso: no sobre-entregues ni agregues extras que no pedí.
- Cada entregable debe ser un archivo independiente, sin referencias a trabajos anteriores.
- El código se pega crudo directamente en el chat.
- Primero muestra el diagrama/relaciones de tablas, luego el SQL, luego los datos de prueba, y al final el flujo de n8n (nodos, prompt del agente y consultas SQL).
- El agente debe poder responder preguntas por país, bodega, estado, importador y fechas.
- Incluye una breve justificación de las decisiones de diseño.

## 5. Antes de empezar

Si algo del enunciado no está claro, haz **una sola pregunta** y espera mi respuesta. Si no, empieza directo por el diseño de la base de datos.