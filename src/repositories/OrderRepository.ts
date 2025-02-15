// src/repositories/OrderRepository.ts
import { AppDataSource } from "../Config/data-source";
import { Order } from "../entities/Order";
import { User } from "../entities/User";
import { Route } from "../entities/Route";
import { OrderStatus } from "../entities/Order";
import { redisClient, connectRedis } from "../Config/redis.config";

export class OrderRepository {
    private orderRepository = AppDataSource.getRepository(Order);

    /**
     * Crea una nueva orden en la base de datos.
     */
    async createOrder(
        user: User,
        weight: number,
        dimensions: { length: number; width: number; height: number },
        productType: string,
        destinationAddress: string,
        returnAddress: string,
        recipientName: string,
        recipientPhone: string,
        recipientEmail: string,
        senderName?: string,
        senderPhone?: string,
        senderEmail?: string
    ): Promise<Order> {
        const order = this.orderRepository.create({
            user,
            weight,
            dimensions,
            productType,
            destinationAddress,
            returnAddress,
            recipientName,
            recipientPhone,
            recipientEmail,
            senderName,
            senderPhone,
            senderEmail,
            status: OrderStatus.EN_ESPERA,
        });
        return await this.orderRepository.save(order);
    }

    /**
     * Busca todas las órdenes que tienen un estado específico.
     */
    async findOrdersByStatus(status: OrderStatus): Promise<Order[]> {
        return await this.orderRepository.find({ where: { status } });
    }

    /**
     * Cuenta el número total de órdenes en la base de datos.
     */
    async countOrders(): Promise<number> {
        return await this.orderRepository.count();
    }

    /**
     * Actualiza el estado de una orden específica.
     */
    async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
        await this.orderRepository.update(orderId, { status: newStatus });

        // Almacena el estado en Redis con un TTL de 5 minutos
        const redisKey = `order:${orderId}:status`;
        await redisClient.set(redisKey, newStatus, { EX: 300 }); // Expira en 300 segundos (5 minutos)
    }

    /**
     * Asigna un transportista y una ruta a una orden específica.
     */
    async assignRoute(orderId: string, routeId: number): Promise<Order> {
        const order = await this.findOneBy({ id: orderId });
        if (!order) {
            throw new Error("Orden no encontrada.");
        }

        if (order.status !== OrderStatus.EN_ESPERA) {
            throw new Error("La orden ya ha sido asignada.");
        }

        order.route = { id: routeId } as Route;
        order.status = OrderStatus.EN_TRANSITO;
        order.assignedAt = new Date();

        return await this.orderRepository.save(order);
    }

    /**
     * Busca todas las órdenes asignadas a un transportista específico.
     */
    async findOrdersByDriver(driverId: number): Promise<Order[]> {
        return await this.orderRepository.find({
            where: {
                driver: {
                    id: driverId,
                },
            },
            relations: ["driver", "route"],
        });
    }

    /**
     * Lista todas las órdenes con sus relaciones cargadas, con opción de filtrar por estado.
     */
    async getAllOrders(status?: OrderStatus): Promise<Order[]> {
        const query = this.orderRepository
            .createQueryBuilder("order")
            .leftJoinAndSelect("order.user", "user")
            .leftJoinAndSelect("order.route", "route")
            .leftJoinAndSelect("route.drivers", "drivers");

        if (status) {
            query.where("order.status = :status", { status });
        }

        return await query.getMany();
    }

    /**
     * Encuentra una orden por condiciones específicas.
     */
    async findOneBy(options: any): Promise<Order | null> {
        return await this.orderRepository.findOneBy(options);
    }

    
}