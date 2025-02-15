// testRedis.ts
import { redisClient, connectRedis } from "./src/Config/redis.config";

async function testRedis() {
    try {
        // Conectar a Redis
        await redisClient.connect();
        console.log('Conexión a Redis establecida.');

        // Guardar un valor en Redis
        await redisClient.set('testKey', 'Hello Redis!');
        console.log('Valor guardado en Redis.');

        // Leer un valor de Redis
        const value = await redisClient.get('testKey');
        console.log('Valor obtenido de Redis:', value);

        // Eliminar el valor de Redis
        await redisClient.del('testKey');
        console.log('Valor eliminado de Redis.');
    } catch (error) {
        console.error('Error al probar Redis:', error);
    } finally {
        // Cerrar la conexión
        await redisClient.quit();
        console.log('Conexión a Redis cerrada.');
    }
}

testRedis();