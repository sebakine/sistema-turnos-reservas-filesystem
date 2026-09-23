# Sistema Backend de Turnos y Reservas — API con FileSystem

Primera versión funcional del **Sistema Backend de Turnos y Reservas**, construida con **Node.js, Express y FileSystem**. La API gestiona dos recursos:

- **`services`**: servicios disponibles para reservar turnos.
- **`bookings`**: reservas creadas por los clientes.

Los datos se guardan en archivos JSON (`src/data/services.json` y `src/data/bookings.json`), por lo que **no se pierden al reiniciar el servidor**.

## Tecnologías

- Node.js 18 o superior
- Express 5
- FileSystem (`node:fs/promises`)
- dotenv
- Módulos ES (`"type": "module"`)

## Estructura del proyecto

```
src/
  app.js                      # Configuración de Express, routers y manejo de errores
  server.js                   # Arranque del servidor
  config/
    env.config.js             # Variables de entorno (puerto y rutas de los JSON)
  managers/
    ServiceManager.js         # Lógica y persistencia de services
    BookingManager.js         # Lógica y persistencia de bookings
  routes/
    services.router.js        # Endpoints de /api/services
    bookings.router.js        # Endpoints de /api/bookings
  data/
    services.json             # Persistencia de servicios
    bookings.json             # Persistencia de reservas
  utils/
    errors.js                 # Errores de validación (400) y de recurso inexistente (404)
    jsonFile.js               # Lectura/escritura de JSON y cola de escrituras
package.json
.env.example
.gitignore
README.md
```

## Instalación y ejecución

1. Clonar el repositorio e ingresar a la carpeta:

   ```bash
   git clone https://github.com/sebakine/sistema-turnos-reservas-filesystem.git
   cd sistema-turnos-reservas-filesystem
   ```

2. Instalar las dependencias:

   ```bash
   npm install
   ```

3. (Opcional) Crear el archivo `.env` a partir del ejemplo. Si no existe, el servidor usa el puerto `8080`:

   ```bash
   cp .env.example .env      # En Windows (PowerShell): Copy-Item .env.example .env
   ```

4. Levantar el servidor:

   ```bash
   npm start       # modo normal
   npm run dev     # modo desarrollo (se reinicia al guardar cambios)
   ```

El servidor queda disponible en `http://localhost:8080`.

### Scripts

| Script        | Comando                      | Descripción                              |
|---------------|------------------------------|------------------------------------------|
| `npm start`   | `node src/server.js`         | Inicia el servidor                       |
| `npm run dev` | `node --watch src/server.js` | Inicia el servidor y lo reinicia al guardar |

### Variables de entorno

| Variable        | Descripción                          | Valor por defecto        |
|-----------------|--------------------------------------|--------------------------|
| `PORT`          | Puerto del servidor                  | `8080`                   |
| `SERVICES_FILE` | Archivo JSON de servicios            | `src/data/services.json` |
| `BOOKINGS_FILE` | Archivo JSON de reservas             | `src/data/bookings.json` |

---

## Recurso `services`

### Modelo

| Campo         | Tipo    | Reglas                                               |
|---------------|---------|------------------------------------------------------|
| `id`          | string  | Generado automáticamente (UUID). No se envía en el body |
| `name`        | string  | Obligatorio, no vacío                                |
| `description` | string  | Obligatorio, no vacío                                |
| `duration`    | integer | Obligatorio, minutos, mayor a 0                      |
| `price`       | number  | Obligatorio, mayor o igual a 0                       |
| `category`    | string  | Obligatorio, no vacío (se guarda en minúsculas)      |
| `available`   | boolean | Obligatorio, `true` o `false`                        |

### Endpoints

| Método | Ruta                 | Descripción | Respuestas |
|--------|----------------------|-------------|------------|
| GET    | `/api/services`      | Devuelve todos los servicios. Filtros opcionales: `?category=salud`, `?available=true` | 200 · 400 filtro inválido |
| GET    | `/api/services/:sid` | Devuelve un servicio por id | 200 · 404 |
| POST   | `/api/services`      | Crea un servicio. Se validan todos los campos y el id se genera internamente | 201 · 400 |
| PUT    | `/api/services/:sid` | Actualiza los campos enviados. El id no se puede modificar | 200 · 400 · 404 |
| DELETE | `/api/services/:sid` | Elimina un servicio | 200 · 404 |

---

## Recurso `bookings`

### Modelo

| Campo         | Tipo   | Reglas                                                        |
|---------------|--------|---------------------------------------------------------------|
| `id`          | string | Generado automáticamente (UUID)                               |
| `clientName`  | string | Obligatorio, no vacío                                         |
| `clientEmail` | string | Obligatorio, email válido                                     |
| `date`        | string | Obligatorio, formato `YYYY-MM-DD` y fecha existente           |
| `time`        | string | Obligatorio, formato `HH:mm` (24 horas)                       |
| `status`      | string | Opcional: `pending` (por defecto), `confirmed` o `cancelled`  |
| `services`    | array  | Opcional, puede iniciar vacío. Elementos `{ "service": idDelServicio, "quantity": 1 }` |

Dentro de `services`, cada servicio aparece una sola vez: **si el mismo servicio se agrega de nuevo, se incrementa `quantity`**.

### Endpoints

| Método | Ruta                               | Descripción | Respuestas |
|--------|------------------------------------|-------------|------------|
| POST   | `/api/bookings`                    | Crea una reserva (puede iniciar con `services` vacío) | 201 · 400 |
| GET    | `/api/bookings/:bid`               | Devuelve una reserva por id | 200 · 404 |
| POST   | `/api/bookings/:bid/services/:sid` | Agrega un servicio a una reserva existente, validando que ambos existan | 200 · 404 · 400 si la reserva está cancelada |
| GET    | `/api/bookings`                    | (Adicional) Devuelve todas las reservas | 200 |

---

## Ejemplos de uso

### Crear un servicio

```bash
curl -X POST http://localhost:8080/api/services \
  -H "Content-Type: application/json" \
  -d '{"name":"Control dental","description":"Revisión y limpieza dental","duration":40,"price":30000,"category":"salud","available":true}'
```

Respuesta `201 Created`:

```json
{
  "status": "success",
  "message": "Servicio creado",
  "payload": {
    "id": "8f0e1c7a-2b3d-4e5f-9a6b-7c8d9e0f1a2b",
    "name": "Control dental",
    "description": "Revisión y limpieza dental",
    "duration": 40,
    "price": 30000,
    "category": "salud",
    "available": true
  }
}
```

### Listar, obtener, actualizar y eliminar servicios

```bash
curl http://localhost:8080/api/services
curl "http://localhost:8080/api/services?category=salud&available=true"
curl http://localhost:8080/api/services/b3f1c2a4-5d6e-4f70-8a91-0b1c2d3e4f50

curl -X PUT http://localhost:8080/api/services/b3f1c2a4-5d6e-4f70-8a91-0b1c2d3e4f50 \
  -H "Content-Type: application/json" \
  -d '{"price":27000,"available":false}'

curl -X DELETE http://localhost:8080/api/services/b3f1c2a4-5d6e-4f70-8a91-0b1c2d3e4f50
```

### Crear una reserva (con `services` vacío)

```bash
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"clientName":"Juan Pérez","clientEmail":"juan.perez@example.com","date":"2026-10-20","time":"16:00","services":[]}'
```

Respuesta `201 Created`:

```json
{
  "status": "success",
  "message": "Reserva creada",
  "payload": {
    "id": "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d",
    "clientName": "Juan Pérez",
    "clientEmail": "juan.perez@example.com",
    "date": "2026-10-20",
    "time": "16:00",
    "status": "pending",
    "services": []
  }
}
```

### Obtener una reserva

```bash
curl http://localhost:8080/api/bookings/f7d5a6e8-9102-43b4-8e35-4f5061728394
```

### Agregar un servicio a una reserva

```bash
curl -X POST http://localhost:8080/api/bookings/f7d5a6e8-9102-43b4-8e35-4f5061728394/services/d5b3e4c6-7f80-4192-8c13-2d3e4f506172
```

Si se repite la misma petición, el servicio no se duplica: su `quantity` pasa de `1` a `2`.

```json
"services": [
  { "service": "b3f1c2a4-5d6e-4f70-8a91-0b1c2d3e4f50", "quantity": 1 },
  { "service": "d5b3e4c6-7f80-4192-8c13-2d3e4f506172", "quantity": 2 }
]
```

Si la reserva o el servicio no existen, la respuesta es `404 Not Found`.

---

## Formato de respuestas y códigos HTTP

Respuesta exitosa:

```json
{ "status": "success", "payload": { } }
```

Respuesta con error:

```json
{ "status": "error", "error": "Descripción del error", "details": ["..."] }
```

| Código | Uso |
|--------|-----|
| 200 | Consulta, actualización, eliminación o servicio agregado a una reserva |
| 201 | Servicio o reserva creados |
| 400 | Campos faltantes, datos inválidos o JSON mal formado |
| 404 | Servicio, reserva o ruta inexistente |
| 500 | Error inesperado del servidor |

## Decisiones de diseño

- **Separación de responsabilidades:** los routers solo leen `req.params`, `req.query` y `req.body`, llaman al manager y responden. Toda la lógica y la persistencia están en los managers.
- **Ids autogenerados:** se generan con `crypto.randomUUID()`. Cualquier `id` enviado en el body se ignora, y en PUT el servicio conserva su id original.
- **Persistencia en archivos JSON:** cada operación lee y escribe el archivo correspondiente. Si un archivo no existe, se crea vacío automáticamente.
- **Escrituras en serie:** las operaciones que modifican un mismo archivo se encolan para que dos peticiones simultáneas no se sobrescriban.
- **Validación de reservas:** los servicios enviados al crear una reserva deben existir; los repetidos se agrupan sumando `quantity`. No se pueden agregar servicios a una reserva `cancelled`.

## Autor

Sebastián Muñoz
