import { DataSource } from "typeorm";
import dotenv from 'dotenv';
import { User } from "../entities/User";
import { Order } from "../entities/Order";
import { Driver } from "../entities/Drive";
import { Route } from "../entities/Route";

// Cargar variables de entorno
dotenv.config();

// Obtener la cadena de conexión desde las variables de entorno
const {
    DATABASE_URL = '', // Cadena de conexión completa de Neon
    NODE_ENV = 'development'
} = process.env;

export const AppDataSource = new DataSource({
    type: "postgres",
    url: DATABASE_URL, // Usar la cadena de conexión completa
    synchronize: NODE_ENV === 'development', // Solo habilitar en desarrollo
    logging: ["error"], // Registrar errores
    entities: [User, Order, Driver, Route], // Entidades de tu aplicación
    migrations: [], // Migraciones (si las usas)
    subscribers: [], // Suscriptores (si los usas)
    ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // Configuración SSL para producción
    cache: {
        duration: 30000 // Cache de 30 segundos
    },
    poolSize: 10, // Tamaño del pool de conexiones
    maxQueryExecutionTime: 1000 // Alerta si una consulta toma más de 1 segundo
});

//postgresql://neondb_owner:npg_eM1tqGJgxAC9@ep-damp-wildflower-a5cdp56o-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require