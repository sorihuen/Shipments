import "reflect-metadata";
import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import authRoutes from "./routes/AuthRoutes";
import orderRoutes from "./routes/OrderRoutes";
import routeRouter from "./routes/RoutRoutes";
import driveRoute from "./routes/DriverRoutes";
import { setupSwagger } from "./Config/swagger";
import { AppDataSource } from "./Config/data-source";
import { connectRedis } from './Config/redis.config';
dotenv.config();

// Validar variables de entorno en producción
if (process.env.NODE_ENV === "production") {
    if (!process.env.JWT_SECRET) {
        console.error("❌ Error: JWT_SECRET no está definido en producción.");
        process.exit(1);
    }
    if (!process.env.JWT_EXPIRES_IN) {
        console.error("❌ Error: JWT_EXPIRES_IN no está definido en producción.");
        process.exit(1);
    }
}

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Configurar Swagger
setupSwagger(app);


// Registrar las rutas

app.use('/auth', authRoutes); // Rutas de autenticación
app.use('/api/orders', orderRoutes); // Rutas de órdenes
app.use('/api/routes', routeRouter); //Rutas de las rutas
app.use('/api/drive', driveRoute ); //Rutas de los Driver

// Conexión a Redis
(async () => {
    try {
        await connectRedis(); // Asegura que Redis esté conectado
    } catch (error) {
        console.error('No se pudo conectar a Redis:', error);
        process.exit(1); // Detiene la aplicación si Redis no está disponible
    }
})();

// Inicializar DataSource
AppDataSource.initialize()
    .then(() => {
        console.log("📦 Conectado a PostgreSQL con TypeORM");
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Error al conectar a PostgreSQL con TypeORM:", err);
    });
