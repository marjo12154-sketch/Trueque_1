# Registro de Prompts - Trueque Escolar

## P0 · Prompt cero

```text
ROL: Sos un desarrollador senior de aplicaciones web.

CONTEXTO: Estoy construyendo una app llamada Trueque Escolar para estudiantes del instituto.
El problema que resuelve es: Los libros del año pasado duermen en una caja mientras otro los necesita.

TAREA: Generá la primera versión funcional, con estas tres funciones y nada más:
1. Publicar un artículo con foto, materia y estado.
2. Buscar por materia o palabra clave.
3. Marcar como entregado y retirarlo de la lista.

RESTRICCIONES: en español, sin librerías de pago, sin login, sin base de datos en servidor todavía. Que se vea bien en un celular. Código comentado en los puntos donde alguien vaya a equivocarse.

FORMATO DE SALIDA: 
1. Los archivos completos del código de la app (HTML, CSS, JS), cada uno con su nombre claro.
2. El contenido formateado en Markdown para un archivo llamado PROMPTS.md, donde registres este Prompt P0 bajo la sección "## P0 · Prompt cero".
3. Al final, una lista de lo que NO hiciste y por qué.

CRITERIO DE ACEPTACIÓN: abro la app, hago clic en publicar un libro de Matemáticas de 2.º año, luego lo busco en la barra por "Matemáticas" y lo veo en pantalla sin ningún error en la consola.
```

## M1 · Modificación 1

```text
ROL: Sos un desarrollador senior de aplicaciones web.

CONTEXTO: Estoy refinando la app "Trueque Escolar".
Actualmente, la app ya hace publicar un artículo con foto, materia y estado, y buscar por materia o palabra clave.
Necesito agregar/corregir la función de marcar como entregado y retirarlo de la lista.

RESTRICCIONES Y FORMATO DE SALIDA:
No reescribas lo que ya funciona ni me des todo el código de nuevo. Dame únicamente:

1. Los fragmentos nuevos o modificados, indicando en qué archivo (HTML, CSS o JS) y en qué parte específica (función o línea) va cada uno.
2. Una prueba manual de tres pasos para comprobar que la función quedó bien implementada.
3. Qué podría romperse en el resto de la app por este cambio.
4. El contenido exacto en formato Markdown para agregar a mi archivo PROMPTS.md bajo el encabezado "## M1 · Modificación 1".

CRITERIO DE ACEPTACIÓN: Mantenés todo el código anterior intacto y solo me entregás el parche exacto para solucionar esta función puntual.
```

## M2 · Persistencia de datos

```text
ROL: Sos un desarrollador senior de aplicaciones web.

CONTEXTO: Estoy refinando la app "Trueque Escolar". Necesito implementar la Mejora 2 (M2): Persistencia de datos para que la información no se pierda al cerrar o recargar la app.

TAREA Y REQUISITOS:
Quiero que los datos de la app no se pierdan al cerrarla utilizando `localStorage`.

Por favor, explicame de forma clara:
1. Dónde queda guardada la información exactamente.
2. Qué pasa si el usuario borra el caché o cambia de dispositivo.
3. Cómo hago para exportar los datos a un archivo JSON, por si quiero respaldarlos.

RESTRICCIONES Y FORMATO DE SALIDA:
No reescribas lo que ya funciona. Dame únicamente:
1. Las respuestas explicativas a los 3 puntos anteriores.
2. Los fragmentos de código específicos para guardar (setItem), leer (getItem) y borrar datos de `localStorage`, junto con un dato de ejemplo ya cargado para hacer pruebas. Indica en qué archivo y en qué lugar exacto va cada bloque.
3. Una función para exportar/descargar los datos en un archivo JSON.
4. El texto exacto en formato Markdown para agregar a mi archivo PROMPTS.md bajo el encabezado "## M2 · Persistencia de datos".

CRITERIO DE ACEPTACIÓN: Mantenés la estructura de la app intacta, los datos sobreviven al cerrar la pestaña por completo y me das el contenido formateado para PROMPTS.md.
```

## M3 · Experiencia de uso en celular

```text
ROL: Sos un diseñador UI/UX y desarrollador senior de aplicaciones web móviles.

CONTEXTO: Estoy optimizando la app "Trueque Escolar". Necesito implementar la Mejora 3 (M3): Experiencia de uso en celular real para que sea usable con una sola mano y sin explicaciones.

TAREA Y REQUISITOS:
Ajustá la interfaz CSS/HTML de la app con estos 6 requisitos, sin modificar la lógica JavaScript existente:
1. Funcione perfectamente desde 320 px de ancho, diseñada para uso con una sola mano y sin hacer zoom.
2. Contraste suficiente para lectura con luz solar directa, con tamaño de texto mínimo de 16 px.
3. Todos los campos de formulario deben tener una etiqueta (<label>) visible, no solo texto dentro del placeholder.
4. Un solo botón principal destacado visualmente por pantalla; los demás botones con estilos secundarios o neutros.
5. Estado vacío: si no hay ningún libro cargado, mostrar un diseño y texto claro que invite a la primera acción (ej: "Aún no hay publicaciones. ¡Sé el primero en intercambiar un libro!").
6. Mensajes de confirmación, éxito y error visibles, en español claro y sin tecnicismos.

RESTRICCIONES Y FORMATO DE SALIDA:
No reescribas la lógica que ya funciona. Dame únicamente:
1. Los cambios en el código CSS e HTML indicando archivo y ubicación exacta.
2. Una respuesta explícita indicando cuál de los 6 puntos NO pudiste cumplir y por qué (o confirmación de cumplimiento de los 6 puntos).
3. El texto exacto en formato Markdown para agregar a mi archivo PROMPTS.md bajo el encabezado "## M3 · Experiencia de uso en celular".

CRITERIO DE ACEPTACIÓN: Mantenés las funciones anteriores intactas, la interfaz es intuitiva en pantallas pequeñas y me entregás el bloque formateado para PROMPTS.md.
```

## M4 · Validaciones y manejo de errores

```text
ROL: Sos un QA Tester de software enfocado en seguridad y estabilidad de aplicaciones web.

CONTEXTO: Estoy refinando la app "Trueque Escolar". Necesito implementar la Mejora 4 (M4): Validaciones y manejo de errores para garantizar que la app no se rompa ante entradas inválidas.

TAREA Y REQUISITOS:
1. Actuá como un tester exigente y dame 10 formas concretas de intentar romper esta app desde la interfaz (campos vacíos, texto en números, números negativos, textos de 500 caracteres, doble clic en guardar, pérdida de conexión, etc.).
2. Para cada una, decime: qué pasaría hoy, qué debería pasar, y el código JS/HTML mínimo que lo evita.
3. Generá una tabla de Markdown con 5 intentos de prueba específicos, mostrando el escenario, el resultado "Antes" (sin validación) y el resultado "Después" (con validación). Esta tabla la incluiré en el README.md.
4. Asegurate de que cualquier error muestre un mensaje visual claro en español para el usuario (usando el contenedor de mensajes de la app) y que NUNCA lance un error en la consola del navegador.

RESTRICCIONES Y FORMATO DE SALIDA:
No reescribas el diseño ni agregues funciones nuevas. Dame únicamente:
1. Las 10 formas de romper la app con sus soluciones mínimas en código indicando en qué archivo van.
2. La tabla de 5 intentos para el README.
3. El contenido exacto en formato Markdown para agregar a mi archivo PROMPTS.md bajo el encabezado "## M4 · Validaciones y manejo de errores".

CRITERIO DE ACEPTACIÓN: Mantenés la app funcional y cualquier entrada inválida se gestiona con mensajes en pantalla sin arrojar errores en la consola.
```




