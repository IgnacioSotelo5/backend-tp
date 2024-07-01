# API de Control de Domótica con NestJS

Esta API de control de domótica proporciona endpoints para gestionar escenarios y dispositivos en un entorno doméstico inteligente. Utiliza NestJS para la implementación del servidor.

## Funcionalidades Principales

1. **Operaciones CRUD**
   - Creación, lectura, actualización y eliminación de escenarios.
   - Gestión de dispositivos asociados a cada escenario.

2. **Endpoints Disponibles**

   - **Obtener todos los escenarios**
     ```
     GET http://localhost:3000/escenarios
     ```

   - **Obtener un escenario por ID**
     ```
     GET http://localhost:3000/escenarios/:id
     ```

   - **Crear un nuevo escenario**
     ```
     POST http://localhost:3000/escenarios
     Content-Type: application/json

     {
       "name": "nombre del escenario",
       "description": "descripción del escenario",
       "devices": [
         {
           "id": "uuid-del-dispositivo",
           "name": "nombre del dispositivo",
           "type": "tipo del dispositivo",
           "status": true,
           "settings": {
             "configuración específica"
           }
         }
       ]
     }
     ```

   - **Actualizar un escenario existente**
     ```
     PATCH http://localhost:3000/escenarios/:id
     Content-Type: application/json

     {
       "name": "nombre actualizado",
       "description": "descripción actualizada",
       "devices": [
         {
           "id": "uuid-del-dispositivo",
           "name": "nombre del dispositivo",
           "type": "tipo del dispositivo",
           "status": true,
           "settings": {
             "configuración actualizada"
           }
         }
       ]
     }
     ```

   - **Eliminar un escenario**
     ```
     DELETE http://localhost:3000/escenarios/:id
     ```

3. **Búsqueda Avanzada**
   - Búsqueda por características representativas de los escenarios o dispositivos mediante parámetros de consulta.

4. **Validaciones Implementadas**
   - Validación para datos no contemplados en la descripción de la entidad.
   - Validación de tipos de datos para cada campo según la entidad definida.

5. **Almacenamiento de Datos**
   - Los datos pueden almacenarse en memoria o en archivos. En este proyecto se prefiere el almacenamiento en archivos para una persistencia mejorada utilizando el modulo fs.

## Documentación API

La documentación completa de la API está disponible en [Swagger](https://swagger.io/). Para acceder a la documentación, visita:

     
     http://localhost:3000/api
     





