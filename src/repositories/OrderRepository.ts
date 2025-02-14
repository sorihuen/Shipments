// src/repositories/order.repository.ts
import { AppDataSource } from "../Config/data-source";
import { Order } from '../entities/Order';
import { User } from '../entities/User';
import { Driver } from '../entities/Drive';
import { Route } from '../entities/Route';

export class OrderRepository {
    private orderRepository = AppDataSource.getRepository(Order);

    /**
     * Crea una nueva orden en la base de datos.
     * @param user - El usuario que crea la orden.
     * @param weight - Peso del paquete en kg.
     * @param dimensions - Dimensiones del paquete (largo, ancho, alto).
     * @param productType - Tipo de producto (ej. electrónico, ropa, etc.).
     * @param destinationAddress - Dirección de destino del envío.
     * @param returnAddress - Dirección de retorno del envío.
     * @returns La orden creada.
     */
    async createOrder(
        user: User,
        weight: number,
        dimensions: { length: number; width: number; height: number },
        productType: string,
        destinationAddress: string,
        returnAddress: string,
    ) {
        const newOrder = this.orderRepository.create({
            user,
            weight,
            dimensions,
            productType,
            destinationAddress,
            returnAddress,
            status: 'En espera', // Estado inicial de la orden
        });
        return await this.orderRepository.save(newOrder);
    }

    /**
     * Busca todas las órdenes asociadas a un usuario específico.
     * @param userId - ID del usuario.
     * @returns Lista de órdenes del usuario con sus relaciones cargadas.
     */
    async findOrdersByUser(userId: string) {
        const userIdAsNumber = Number(userId); // Convierte el ID a número si es necesario
        return await this.orderRepository.find({
            where: {
                user: {
                    id: userIdAsNumber,
                },
            },
            relations: ['user'], // Carga la relación con el usuario
        });
    }

    /**
     * Busca todas las órdenes que tienen un estado específico.
     * @param status - Estado de la orden (ej. "En espera", "Asignado").
     * @returns Lista de órdenes con el estado especificado.
     */
    async findOrdersByStatus(status: string) {
        return await this.orderRepository.find({ where: { status } });
    }

    /**
     * Cuenta el número total de órdenes en la base de datos.
     * @returns El número total de órdenes.
     */
    async countOrders() {
        return await this.orderRepository.count();
    }

    /**
     * Actualiza el estado de una orden específica.
     * @param orderId - ID de la orden.
     * @param newStatus - Nuevo estado de la orden (ej. "Asignado", "Entregado").
     */
    async updateOrderStatus(orderId: string, newStatus: string) {
        await this.orderRepository.update(orderId, { status: newStatus });
    }

    /**
     * Asigna un transportista y una ruta a una orden específica.
     * @param orderId - ID de la orden.
     * @param driverId - ID del transportista.
     * @param routeId - ID de la ruta.
     * @returns La orden actualizada con el transportista y la ruta asignados.
     * @throws Error si la orden ya ha sido asignada o no existe.
     */
    async assignDriverAndRoute(orderId: string, driverId: number, routeId: number): Promise<Order> {
        // Busca la orden y carga las relaciones necesarias
        const order = await this.orderRepository.findOneOrFail({
            where: { id: orderId },
            relations: ['driver', 'route'],
        });

        // Verifica que la orden esté en estado "En espera"
        if (order.status !== 'En espera') {
            throw new Error('La orden ya ha sido asignada.');
        }

        // Asigna el transportista y la ruta
        order.driver = { id: driverId } as Driver; // Asigna solo el ID del transportista
        order.route = { id: routeId } as Route;   // Asigna solo el ID de la ruta
        order.status = 'Asignado';               // Cambia el estado de la orden

        // Guarda los cambios en la base de datos
        return await this.orderRepository.save(order);
    }

    /**
     * Busca todas las órdenes asignadas a un transportista específico.
     * @param driverId - ID del transportista.
     * @returns Lista de órdenes asignadas al transportista con sus relaciones cargadas.
     */
    async findOrdersByDriver(driverId: number): Promise<Order[]> {
        return await this.orderRepository.find({
            where: {
                driver: {
                    id: driverId,
                },
            },
            relations: ['driver', 'route'], // Carga las relaciones con el transportista y la ruta
        });
    }
}