// data-source.ts
import { DataSource, Logger } from "typeorm";
import { User } from "../entities/User";
import dotenv from 'dotenv';

dotenv.config();

const {
    DB_HOST = 'localhost',
    DB_PORT = '5432',
    DB_USERNAME = 'postgres',
    DB_PASSWORD = 'suyin',
    DB_DATABASE = 'envios',
    NODE_ENV = 'development'
} = process.env;

export const AppDataSource = new DataSource({
    type: "postgres",
    host: DB_HOST,
    port: parseInt(DB_PORT),
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    synchronize: NODE_ENV === 'development', // Solo habilitar en desarrollo
    logging: ["error"],
    entities: [User],
    migrations: [],
    subscribers: [],
    ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    cache: {
        duration: 30000 // Cache de 30 segundos
    },
    poolSize: 10,
    maxQueryExecutionTime: 1000 // Alerta si una consulta toma más de 1 segundo
});