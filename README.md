# Shipment API

### Este proyecto es una API RESTful diseñada para gestionar operaciones relacionadas con envíos, conductores y rutas. Utiliza tecnologías como TypeScript , Express , PostgreSQL (con TypeORM ), Redis , y Swagger para la documentación de la API. Además, incluye autenticación basada en tokens JWT y validaciones robustas con class-validator.

### Requisitos previos
Antes de ejecutar este proyecto, asegúrate de tener instalado lo siguiente:

Node.js : Versión >= 20.x
npm 
PostgreSQL : Base de datos relacional.
Redis : Para caché.
Git : Para clonar el repositorio.

### Instalacion
git clone https://github.com/tu-usuario/shipment.git

npm install

Crea un archivo .env en la raíz del proyecto y configura las siguientes variables
### Puerto de la aplicación
PORT=3000

### Configuración de JWT
JWT_SECRET=3f1175579889919ee16893c54e61e5e81d3355947607fb43fd3ce999a6e64993
JWT_EXPIRES_IN=86400

### Base de datos remota (Neon)
DATABASE_URL=postgresql://neondb_owner:npg_eM1tqGJgxAC9@ep-damp-wildflower-a5cdp56o-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require

### Configuración de Redis
REDIS_URL=redis://localhost:6379

### Entorno de ejecución
NODE_ENV=development

## Ejecución del Proyecto

### Modo desarrollo
Para ejecutar el proyecto en modo desarrollo (con `nodemon`):

```bash
npm run dev

## Pruebas

Las pruebas unitarias y de integración se realizan con **Vitest**.

### Ejecutar pruebas
```bash
npm vitest