// src/repositories/OrderRepository.ts
import { AppDataSource } from "../Config/data-source";
import { Order } from "../entities/Order";
import { User } from "../entities/User";
import { Route } from "../entities/Route";
import { OrderStatus } from "../entities/Order";
import { redisClient, connectRedis } from "../Config/redis.config";

export class OrderRepository {
  private orderRepository = AppDataSource.getRepository(Order);

  /**************************************************************
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

  /*************************************************************
   * Busca todas las órdenes que tienen un estado específico.
   */
  async findOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    return await this.orderRepository.find({ where: { status } });
  }

  /***********************************************************
   * Cuenta el número total de órdenes en la base de datos.
   */
  async countOrders(): Promise<number> {
    return await this.orderRepository.count();
  }

  /*************************************************
   * Actualiza el estado de una orden específica.
   */
  async updateOrderStatus(
    orderId: string,
    updates: Partial<Order>
  ): Promise<void> {
    await this.orderRepository.update(orderId, updates);
    // Almacena el estado en Redis con un TTL de 1 hora
    const redisKey = `order:${orderId}:status`;
    await redisClient.set(redisKey, updates.status || "", { EX: 3600 });
  }

  /*******************************************************************
   * Asigna un transportista y una ruta a una orden específica.
   */
  async assignRoute(orderId: string, routeId: number): Promise<Order> {
    // Buscar la orden por su ID usando findOneBy
    const order = await this.findOneBy({ id: orderId });
    if (!order) {
      throw new Error("Orden no encontrada.");
    }

    // Verificar si la orden ya ha sido asignada
    if (order.status !== OrderStatus.EN_ESPERA) {
      throw new Error("La orden ya ha sido asignada.");
    }

    // Asignar la ruta y actualizar el estado de la orden
    order.route = { id: routeId } as Route;
    order.status = OrderStatus.EN_TRANSITO;
    order.assignedAt = new Date();

    // Guardar los cambios en la base de datos
    return await this.orderRepository.save(order);
  }
  /**
   * Busca una orden con relaciones cargadas usando QueryBuilder.
   */
  async findOneWithRelations(orderId: string): Promise<Order | null> {
    return await AppDataSource.getRepository(Order)
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.driver", "driver")
      .leftJoinAndSelect("order.route", "route")
      .leftJoinAndSelect("route.drivers", "drivers") // 🔥 Agregar conductores de la ruta
      .where("order.id = :orderId", { orderId })
      .getOne();
  }

  /*******************************************************************
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

  /************************************************************************
   * Lista todas las órdenes con sus relaciones cargadas, con opción de filtrar por estado.
   */
  async getAllOrders(
    status?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Order[]> {
    const query = this.orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.user", "user")
      .leftJoinAndSelect("order.route", "route")
      .leftJoinAndSelect("route.drivers", "drivers")
      .where("1=1");
  
    // Filtrar por múltiples estados si se proporciona
    if (status) {
      // Se espera un string con estados separados por coma, ej: "En espera,En tránsito"
      const statuses = status.split(",").map(s => s.trim());
      query.andWhere("order.status IN (:...statuses)", { statuses });
    }
  
    // Filtrar por rango de fechas (ajustando la fecha de fin para incluir el día completo)
    if (startDate && endDate) {
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
      query.andWhere(
        "order.createdAt >= :startDate AND order.createdAt < :adjustedEndDate",
        {
          startDate: startDate.toISOString(),
          adjustedEndDate: adjustedEndDate.toISOString(),
        }
      );
    } else if (startDate) {
      query.andWhere("order.createdAt >= :startDate", {
        startDate: startDate.toISOString(),
      });
    } else if (endDate) {
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
      query.andWhere("order.createdAt < :adjustedEndDate", {
        adjustedEndDate: adjustedEndDate.toISOString(),
      });
    }
  
    return await query.getMany();
  }
  
  
  
  /**********************************************************
   * Encuentra una orden por condiciones específicas.
   */
  async findOneBy(options: any): Promise<Order | null> {
    return await this.orderRepository.findOneBy(options);
  }
  /********************************************************
   * Busca órdenes según las condiciones proporcionadas.
   */
  async find(options: any): Promise<Order[]> {
    return await this.orderRepository.find(options);
  }

  async saveOrder(order: Order): Promise<Order> {
    return await this.orderRepository.save(order);
  }
}
