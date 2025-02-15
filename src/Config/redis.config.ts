// src/Config/redis.config.ts
import { createClient } from 'redis';

// Crea el cliente de Redis
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379', // URL de Redis
});

// Maneja errores de conexión
redisClient.on('error', (err) => {
    console.error('Error al conectar con Redis:', err);
});

// Maneja reconexiones automáticas
redisClient.on('reconnecting', () => {
    console.log('Intentando reconectar con Redis...');
});

// Función para conectar el cliente de Redis
async function connectRedis() {
    if (!redisClient.isReady) {
        try {
            await redisClient.connect();
            console.log('Conexión exitosa a Redis.');
        } catch (error) {
            console.error('No se pudo conectar a Redis:', error);
            throw new Error('Error al conectar con Redis.');
        }
    }
}

// Exporta el cliente y la función de conexión
export { redisClient, connectRedis };