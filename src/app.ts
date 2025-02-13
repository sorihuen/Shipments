import "reflect-metadata";
import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import authRoutes from "../src/routes/AuthRoutes";
import { setupSwagger } from "../src/Config/swagger";
import { AppDataSource } from "./Config/data-source";
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


app.use("/auth", authRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('¡Hola, mundo!');
});

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
