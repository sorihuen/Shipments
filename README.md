# 🚚 Shipment API

![Express](https://img.shields.io/badge/Express-4.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue)
![Redis](https://img.shields.io/badge/Redis-Latest-red)
![JWT](https://img.shields.io/badge/JWT-Authentication-yellow)

## 📖 Descripción

Esta API RESTful está diseñada para gestionar operaciones relacionadas con envíos, conductores y rutas. La plataforma permite optimizar la logística de entrega mediante la asignación eficiente de conductores a rutas y el seguimiento de órdenes.

### 🛠️ Tecnologías principales

- **TypeScript**: Lenguaje de programación tipado
- **Express**: Framework web rápido y minimalista
- **PostgreSQL** (con TypeORM): Sistema de base de datos relacional
- **Redis**: Sistema de caché en memoria
- **JWT**: Autenticación basada en tokens
- **class-validator**: Validaciones robustas
- **Swagger**: Documentación interactiva de la API

## ✅ Requisitos previos

Antes de ejecutar este proyecto, asegúrate de tener instalado:

- **Node.js**: Versión ≥ 20.x
- **npm**: Gestor de paquetes de Node.js
- **PostgreSQL**: Base de datos relacional
- **Redis**: Para caché
- **Git**: Para clonar el repositorio

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/shipment.git
cd shipment
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con la siguiente configuración:

```env
# Puerto de la aplicación
PORT=3000

# Configuración de JWT
JWT_SECRET=3f1175579889919ee16893c54e61e5e81d3355947607fb43fd3ce999a6e64993
JWT_EXPIRES_IN=86400

# Base de datos remota (Neon)
DATABASE_URL=postgresql://neondb_owner:npg_eM1tqGJgxAC9@ep-damp-wildflower-a5cdp56o-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require

# Configuración de Redis
REDIS_URL=redis://localhost:6379

# Entorno de ejecución
NODE_ENV=development
```

## ▶️ Ejecución del proyecto

### Modo desarrollo

Para ejecutar el proyecto con recarga automática:

```bash
npm run dev
```

### Modo producción

```bash
npm run build
npm start
```

## 🧪 Pruebas

El proyecto utiliza **Vitest** para pruebas unitarias y de integración.

```bash
npm test
```

## 📚 Documentación API

La documentación de la API está disponible a través de Swagger UI. Una vez que el servidor esté en ejecución, puedes acceder a:

```
http://localhost:3000/api-docs
```

## 🔄 Estructura del proyecto

```
├── src/
│   ├── config/        # Configuración de la aplicación
│   ├── controllers/   # Controladores de la API
│   ├── entities/      # Entidades de TypeORM
│   ├── middlewares/   # Middlewares personalizados
│   ├── repositories/  # Repositorios de acceso a datos
│   ├── routes/        # Definición de rutas
│   ├── services/      # Lógica de negocio
│   ├── utils/         # Utilidades
│   ├── app.ts         # Configuración de Express
│   └── index.ts       # Punto de entrada
├── tests/             # Pruebas automatizadas
├── .env.example       # Ejemplo de variables de entorno
├── package.json
└── README.md
```

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. Para acceder a las rutas protegidas, debes obtener un token a través del endpoint de login e incluirlo en el encabezado de tus solicitudes:

```
Authorization: Bearer {tu-token}
```

## 🤝 Contribución

Si deseas contribuir a este proyecto, por favor:

1. Haz fork del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo [MIT License](LICENSE).