# Documentación del Backend API

## Tecnologías complementarias

### Axios
Axios es una librería cliente HTTP basada en promesas que permite realizar peticiones de forma más sencilla que `fetch`. Ofrece características como:
- Interceptores de peticiones y respuestas.
- Cancelación de peticiones.
- Transformación automática de datos JSON.
- Mejor manejo de errores (captura respuestas con estado > 2xx).

En este proyecto, hemos usado `fetch` nativo para mantener la simplicidad, pero en entornos reales Axios es una opción común.

### Postman
Postman es una herramienta visual para probar APIs REST. Permite:
- Enviar peticiones HTTP sin escribir código.
- Guardar colecciones de pruebas (endpoints GET, POST, etc.).
- Visualizar respuestas, cabeceras y tiempos de respuesta.
- Automatizar pruebas con scripts.

En el desarrollo de este backend, se utilizó Postman para validar todos los endpoints antes de conectar el frontend.

### Sentry
Sentry es un servicio de monitoreo de errores en producción. Captura excepciones y las reporta con información de contexto (pila de llamadas, navegador, usuario). Permite detectar fallos antes de que los usuarios los notifiquen. En este proyecto, aunque no se ha integrado, sería un paso natural para producción.

### Swagger
Swagger (OpenAPI) es una especificación para documentar APIs REST de forma interactiva. Con Swagger UI, los desarrolladores pueden explorar y probar los endpoints directamente desde el navegador. En proyectos reales, Swagger facilita la colaboración entre frontend y backend.

## Endpoints implementados

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET    | `/api/v1/tasks` | Obtiene todas las tareas |
| POST   | `/api/v1/tasks` | Crea una nueva tarea (requiere `text` en el body) |
| PATCH  | `/api/v1/tasks/:id` | Actualiza parcialmente una tarea (ej. `{ "completed": true }`) |
| DELETE | `/api/v1/tasks/:id` | Elimina una tarea por ID |

## Códigos de respuesta comunes
- `200 OK` – Petición exitosa (GET, PATCH).
- `201 Created` – Tarea creada correctamente (POST).
- `204 No Content` – Eliminación exitosa (DELETE).
- `400 Bad Request` – Datos inválidos (falta texto, campos vacíos).
- `404 Not Found` – Tarea no encontrada.
- `500 Internal Server Error` – Error interno del servidor.

## Cómo probar la API localmente
1. Ejecutar el servidor: `cd server && npm run dev`.
2. Usar Postman o `curl` para probar los endpoints:
   ```bash
   curl http://localhost:3000/api/v1/tasks
   curl -X POST http://localhost:3000/api/v1/tasks -H "Content-Type: application/json" -d '{"text": "Mi tarea"}'
   curl -X PATCH http://localhost:3000/api/v1/tasks/1 -H "Content-Type: application/json" -d '{"completed": true}'
   curl -X DELETE http://localhost:3000/api/v1/tasks/1


   Creé una carpeta server/ dentro del proyecto y dentro de ella organicé el código en capas:

src/config/: aquí puse el archivo env.js que carga las variables de entorno con dotenv. Me aseguré de que si no existía PORT en el archivo .env, el servidor ni siquiera arrancaba. Es una tontería, pero así evitamos que alguien ejecute el proyecto sin configurar nada.

src/services/task.service.js: esta es la capa de lógica de negocio. Al principio usamos un array en memoria (como una base de datos falsa). Implementé funciones getAllTasks, createTask, deleteTask y updateTask. Aquí, si alguien intenta borrar una tarea que no existe, el servicio lanza un error con el mensaje 'NOT_FOUND'. Eso es importante porque el controlador después capturará ese error y devolverá un 404.

src/controllers/task.controller.js: aquí recibimos las peticiones HTTP. Lo primero que hago es validar los datos que llegan en el body. Por ejemplo, para crear una tarea, compruebo que text existe y no está vacío. Si no, respondo con un 400 Bad Request y un mensaje claro. Luego llamo al servicio correspondiente. Si el servicio lanza 'NOT_FOUND', respondo con un 404. Cualquier otro error lo paso al middleware de errores, que responderá con un 500 genérico.

src/routes/task.routes.js: simplemente enlazo los verbos HTTP con los controladores. Nada más. Esta capa es muy tonta, como debe ser.

src/index.js: el punto de entrada. Configuro los middlewares globales: cors para que el frontend (que corre en otro puerto) pueda llamar a la API, express.json() para parsear el JSON, y un pequeño middleware de logging que mide el tiempo de cada petición y lo muestra en la consola. Luego monto las rutas bajo /api/v1/tasks y añado un middleware de manejo de errores al final. Si llega algún error, lo registro en la consola y devuelvo un 500 con un mensaje genérico, sin exponer detalles internos.

El manejo de errores: el punto más importante
Uno de los requisitos era blindar la API contra datos incorrectos. Por eso en el controlador puse validaciones muy estrictas. Por ejemplo, para crear una tarea:

javascript
if (!text || typeof text !== 'string' || text.trim().length === 0) {
  return res.status(400).json({ error: 'El texto de la tarea es obligatorio' });
}
Así, si alguien intenta enviar un text vacío o un número, el servidor responde con un 400 y el frontend puede mostrar un mensaje adecuado. Lo mismo con el PATCH: si no se envían campos para actualizar, devuelvo 400.

Para el error 404, dentro de deleteTask o updateTask, si el servicio lanza 'NOT_FOUND', el controlador captura y devuelve:

javascript
if (error.message === 'NOT_FOUND') {
  return res.status(404).json({ error: 'Tarea no encontrada' });
}
El 500 lo maneja el middleware final. Si ocurre un error que no hemos previsto (por ejemplo, un fallo en el array o algo que no controlamos), el servidor no se cae, sino que responde con un 500 y un mensaje genérico, y yo puedo ver el error real en la consola para depurar.

Además, durante el desarrollo detecté otros posibles errores que se pueden dar en un entorno real, como el 405 Method Not Allowed (si alguien intenta usar PUT en lugar de PATCH, Express lo rechaza automáticamente), o el 422 Unprocessable Entity (si quisiera validar semánticas más complejas, como que la prioridad solo sea “alta”, “media” o “baja”). No los implementé en esta versión, pero los dejé documentados como mejora futura.

Probar los errores
Para comprobar que todo esto funciona, usé Postman y también el propio navegador. Por ejemplo:

Mandé un POST sin campo text → 400.

Intenté eliminar un ID que no existe → 404.

Modifiqué el servicio para que lanzara un error genérico → 500 (y en la consola del servidor vi el error real).

Luego documenté estos casos en docs/backend-api.md, con ejemplos de peticiones y respuestas, incluyendo una tabla con los códigos más comunes (400, 404, 405, 422, 500, etc.) y su significado. También añadí una sección sobre cómo el frontend captura estos errores con try/catch y muestra alertas al usuario.

Conectar el frontend
El cambio más gordo fue modificar app.js. Quité todas las funciones de localStorage y creé un pequeño cliente API con fetch. Las funciones addTask, deleteTask, etc., ahora son asíncronas y usan ese cliente. Al cargar la página, llamo a loadTasks() que obtiene las tareas del servidor. También añadí try/catch para mostrar alertas si algo falla, y logs en la consola para saber qué ha pasado.

Fue un poco tedioso porque tuve que tocar casi todas las funciones del frontend, pero al final todo quedó más limpio: ahora los datos persisten entre recargas (porque el servidor los guarda en memoria), y la interfaz reacciona a los errores.

Documentación y cierre
Finalicé actualizando el README.md con la arquitectura del backend y los endpoints, y creé docs/backend-api.md donde explico herramientas como Axios, Postman, Sentry y Swagger, además de poner ejemplos de peticiones y errores.

Ahora el proyecto está listo. El backend corre con npm run dev, el frontend con Live Server, y todo funciona perfectamente. Si quiero, puedo subirlo a GitHub y presentarlo. Ha sido un trabajo intenso pero muy satisfactorio. Ahora entiendo mejor cómo se construye una aplicación completa, con capas bien separadas, gestión profesional de errores y un código robusto frente a los problemas típicos de red (400, 404, 500).