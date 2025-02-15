// Importar las dependencias necesarias
import { DataSource } from "typeorm"; // Importar DataSource de TypeORM para configurar la conexión a la base de datos
import dotenv from 'dotenv'; // Importar dotenv para cargar variables de entorno desde un archivo .env
import { User } from "../entities/User"; // Importar la entidad User
import { Order } from "../entities/Order"; // Importar la entidad Order
import { Driver } from "../entities/Drive"; // Importar la entidad Driver
import { Route } from "../entities/Route"; // Importar la entidad Route

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

// Obtener la cadena de conexión y otras variables de entorno
const {
    DATABASE_URL = '', // Cadena de conexión completa para la base de datos (proporcionada por Neon)
    NODE_ENV = 'development' // Entorno de ejecución (development, production, etc.)
} = process.env;

// Configuración de la fuente de datos (DataSource) de TypeORM
export const AppDataSource = new DataSource({
    type: "postgres", // Tipo de base de datos: PostgreSQL
    url: DATABASE_URL, // Usar la cadena de conexión completa (proporcionada por Neon)
    
    // Sincronización automática (solo en desarrollo)
    // WARNING: No usar en producción, ya que puede sobrescribir datos accidentalmente
    synchronize: NODE_ENV === 'development', 
    
    // Configuración de registro de errores
    logging: ["error"], // Registrar solo errores (puedes agregar "query" para registrar todas las consultas)
    
    // Entidades de la aplicación
    entities: [User, Order, Driver, Route], // Lista de entidades que representan las tablas en la base de datos
    
    // Migraciones (opcional)
    migrations: [], // Archivos de migración para gestionar cambios en el esquema de la base de datos
    
    // Suscriptores (opcional)
    subscribers: [], // Suscriptores para eventos de TypeORM (por ejemplo, hooks antes/después de guardar datos)
    
    // Configuración SSL para conexiones seguras
    ssl: NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } // Permitir conexiones sin verificar el certificado SSL en producción
        : false, // Desactivar SSL en desarrollo (si usas una base de datos local sin SSL)
    
    // Configuración de caché
    cache: {
        duration: 30000 // Duración de la caché en milisegundos (30 segundos)
    },
    
    // Configuración del pool de conexiones
    poolSize: 10, // Número máximo de conexiones en el pool (ajusta según tus necesidades)
    
    // Tiempo máximo de ejecución de consultas
    maxQueryExecutionTime: 5000 // Alerta si una consulta toma más de 1 segundo (en milisegundos)
});