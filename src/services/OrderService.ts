// src/services/OrderService.ts
import { OrderRepository } from "../repositories/OrderRepository";
import { RouteRepository } from "../repositories/RouteRepository";
import { DriverRepository } from "../repositories/DriverRepository";
import { AppDataSource } from "../Config/data-source";
import { validateAddress } from "../utils/geocoding";
import { User } from "../entities/User";
import { Driver } from "../entities/Drive";
import { OrderStatus } from "../entities/Order";
import { redisClient } from "../Config/redis.config";
import { Order } from "../entities/Order";

export class OrderService {
  private orderRepository: OrderRepository;
  private routeRepository: RouteRepository;
  private driverRepository: DriverRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.routeRepository = new RouteRepository();
    this.driverRepository = new DriverRepository();
  }

  /**
   * Crea una nueva orden en la base de datos y almacena su estado inicial en Redis.
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
    senderName: string,
    senderPhone: string,
    senderEmail: string
) {
    // Validar campos obligatorios
    if (!dimensions || !dimensions.width || !dimensions.height || !dimensions.length) {
        throw new Error(
            "Las dimensiones del paquete son requeridas y deben incluir 'width', 'height' y 'length'"
        );
    }

    // Validar direcciones con la nueva estructura de respuesta
    const destinationValidation = await validateAddress(destinationAddress);
    if (!destinationValidation.isValid) {
        throw new Error(`Error en dirección de destino: ${destinationValidation.reason}`);
    }

    const returnValidation = await validateAddress(returnAddress);
    if (!returnValidation.isValid) {
        throw new Error(`Error en dirección de retorno: ${returnValidation.reason}`);
    }

    // Validaciones adicionales de negocio
    if (weight <= 0) {
        throw new Error("El peso debe ser mayor que 0");
    }

    if (!productType) {
        throw new Error("El tipo de producto es requerido");
    }

    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
        throw new Error("El correo electrónico del destinatario no es válido");
    }
    if (!emailRegex.test(senderEmail)) {
        throw new Error("El correo electrónico del remitente no es válido");
    }

    // Validar formato de teléfono (asumiendo formato colombiano)
    const phoneRegex = /^3\d{9}$/;
    if (!phoneRegex.test(recipientPhone)) {
        throw new Error("El teléfono del destinatario debe ser un celular válido de Colombia");
    }
    if (!phoneRegex.test(senderPhone)) {
        throw new Error("El teléfono del remitente debe ser un celular válido de Colombia");
    }

    try {
        // Crear la orden en la base de datos
        const order = await this.orderRepository.createOrder(
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
            senderEmail
        );

        // Almacenar el estado inicial de la orden en Redis
        const redisKey = `order:${order.id}:status`;
        const initialStatus = "En espera";
        await redisClient.set(redisKey, initialStatus, { EX: 3600 }); // TTL de 1 hora

        // Almacenar la orden en una lista específica para su estado
        const statusKey = `order:status:${initialStatus}`;
        await redisClient.sAdd(statusKey, order.id);

        console.log(`Orden ${order.id} creada con éxito - Estado: ${initialStatus}`);
        console.log('Validaciones de dirección:', {
            destino: destinationValidation,
            retorno: returnValidation
        });

        return order;
    } catch (error) {
        console.error('Error al crear la orden:', error);
        throw new Error('No se pudo crear la orden. Por favor, intente nuevamente.');
    }
}
  /**
   * Asigna una ruta a una orden específica y actualiza su estado en Redis.
   */
  async assignRoute(orderId: string, routeId: number) {
    // Obtener la orden con la ruta y los conductores asociados
    const order = await this.orderRepository.findOneWithRelations(orderId);
    if (!order) {
      throw new Error("La orden no existe");
    }

    // Buscar la ruta con los conductores asignados
    const route = await this.routeRepository.findOneWithDrivers(routeId);

    if (!route) {
      throw new Error("La ruta no existe");
    }
    if (!route.drivers || route.drivers.length === 0) {
      throw new Error("La ruta no tiene conductores asignados");
    }

    // Seleccionar el primer conductor relacionado con la ruta
    const assignedDriver = route.drivers[0]; // Selecciona el primer conductor de la lista

    if (!assignedDriver) {
      console.log(
        "No hay conductores relacionados con esta ruta:",
        route.drivers
      );
      throw new Error("No hay conductores relacionados con esta ruta");
    }

    // Validar que el peso total no exceda la capacidad del vehículo
    const totalWeight = assignedDriver.assignedWeight + order.weight;
    if (totalWeight > assignedDriver.vehicleCapacity) {
      throw new Error(
        `El peso total (${totalWeight} kg) supera la capacidad del vehículo (${assignedDriver.vehicleCapacity} kg)`
      );
    }

    // Actualizar el peso asignado al conductor
    assignedDriver.assignedWeight = totalWeight;

    // Asignar ruta y conductor a la orden
    order.route = route;
    order.driver = assignedDriver;
    order.status = OrderStatus.EN_TRANSITO;
    order.assignedAt = new Date();

    // Guardar en la base de datos
    await this.driverRepository.save(assignedDriver); // Guardar el conductor actualizado
    const updatedOrder = await this.orderRepository.saveOrder(order);

    // Actualizar el estado en Redis
    const redisKey = `order:${orderId}:status`;
    const oldStatus = await redisClient.get(redisKey);
    const newStatus = "En tránsito";
    await redisClient.set(redisKey, newStatus, { EX: 3600 });
    if (oldStatus) {
      await redisClient.sRem(`order:status:${oldStatus}`, orderId);
    }
    await redisClient.sAdd(`order:status:${newStatus}`, orderId);
    console.log(`Estado actualizado en Redis: ${newStatus}`);

    // Devolver la orden completa, la ruta y el conductor asignado
    return {
      message: "Orden asignada exitosamente",
      order: {
        id: updatedOrder.id,
        weight: updatedOrder.weight,
        dimensions: updatedOrder.dimensions,
        productType: updatedOrder.productType,
        destinationAddress: updatedOrder.destinationAddress,
        returnAddress: updatedOrder.returnAddress,
        recipientName: updatedOrder.recipientName,
        recipientPhone: updatedOrder.recipientPhone,
        recipientEmail: updatedOrder.recipientEmail,
        senderName: updatedOrder.senderName,
        senderPhone: updatedOrder.senderPhone,
        senderEmail: updatedOrder.senderEmail,
        status: updatedOrder.status,
        createdAt: updatedOrder.createdAt,
        updatedAt: updatedOrder.updatedAt,
        assignedAt: updatedOrder.assignedAt,
        deliveredAt: updatedOrder.deliveredAt,
      },
      route: {
        id: route.id,
        name: route.name,
        origin: route.origin,
        destination: route.destination,
      },
      driver: {
        id: assignedDriver.id,
        name: assignedDriver.name,
        vehicleCapacity: assignedDriver.vehicleCapacity,
        isAvailable: assignedDriver.isAvailable,
        assignedWeight: assignedDriver.assignedWeight, // Peso total asignado
      },
    };
  }

  /**
   * Lista todas las órdenes, con opción de filtrar por estado.
   */
  async getAllOrders(status?: string, startDate?: Date, endDate?: Date) {
    return await this.orderRepository.getAllOrders(status, startDate, endDate);
  }

  /***********************************************************************
   * Actualiza el estado de una orden específica.
   */

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus
  ): Promise<{ message: string }> {
    // Buscar la orden con relaciones necesarias
    const order = await this.orderRepository.findOneWithRelations(orderId);
    if (!order) {
      throw new Error("Orden no encontrada.");
    }

    // Validar que el nuevo estado sea "Entregado"
    if (newStatus !== OrderStatus.ENTREGADO) {
      throw new Error("Solo se permite cambiar el estado a 'Entregado'.");
    }

    // Validar que la orden esté en estado "En tránsito"
    if (order.status !== OrderStatus.EN_TRANSITO) {
      return {
        message:
          "No se realizó ningún cambio. La orden no está en estado 'En tránsito'.",
      };
    }

    // Verificar que la orden tenga una ruta y conductores asignados
    if (
      !order.route ||
      !order.route.drivers ||
      order.route.drivers.length === 0
    ) {
      throw new Error("La orden no tiene conductor asignado.");
    }

    // Seleccionar el primer conductor asignado a la ruta
    const driver = await this.driverRepository.findOneOrFail(
      order.route.drivers[0].id
    );

    // Actualizar el peso asignado al conductor
    driver.assignedWeight -= order.weight;

    // Actualizar el estado y la fecha de entrega de la orden en la base de datos
    await AppDataSource.getRepository(Order).update(orderId, {
      status: newStatus,
      deliveredAt: new Date(),
    });

    // Guardar el conductor actualizado
    await this.driverRepository.save(driver);

    // Actualizar el estado en Redis y sus listas
    const redisKey = `order:${orderId}:status`;
    const oldStatus = await redisClient.get(redisKey);
    await redisClient.set(redisKey, newStatus, { EX: 3600 });

    if (oldStatus) {
      const oldStatusKey = `order:status:${oldStatus}`;
      await redisClient.sRem(oldStatusKey, orderId);
    }

    const newStatusKey = `order:status:${newStatus}`;
    await redisClient.sAdd(newStatusKey, orderId);

    // Invalidar la caché de la orden
    await redisClient.del(`order:${orderId}`);

    return { message: "Estado actualizado exitosamente" };
  }

  /*******************************************************
   * Obtiene órdenes específicas o filtra por estado.
   * @param orderId - ID de la orden (opcional).
   * @param status - Estado de la orden (opcional).
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    const redisKey = `order:${orderId}`;
    // Intenta obtener la orden desde Redis
    const cachedOrder = await redisClient.get(redisKey);
    if (cachedOrder) {
      console.log(`Orden obtenida desde Redis: ${cachedOrder}`);
      return JSON.parse(cachedOrder); // Deserializa el objeto JSON
    }
    console.log(
      "Orden no encontrada en Redis. Consultando la base de datos..."
    );
    // Usa QueryBuilder del repositorio predeterminado
    const order = await AppDataSource.getRepository(Order)
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.user", "user")
      .leftJoinAndSelect("order.route", "route")
      .leftJoinAndSelect("route.drivers", "drivers")
      .leftJoinAndSelect("order.driver", "driver") // Cargar la relación directa con el conductor
      .where("order.id = :orderId", { orderId })
      .getOne();

    if (!order) {
      return null;
    }

    // Almacena la orden en Redis para futuras consultas
    await redisClient.set(redisKey, JSON.stringify(order), { EX: 3600 }); // Expira en 3600 segundos (1 hora)
    console.log(`Orden almacenada en Redis: ${JSON.stringify(order)}`);
    return order;
  }

  /*******************************************************
   * Obtiene órdenes específicas o filtra por estado.
   * @param orderId - ID de la orden (opcional).
   * @param status - Estado de la orden (opcional).
   */

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    const redisKey = `order:status:${status}`;
    // Intenta obtener las órdenes desde Redis
    const cachedOrderIds = await redisClient.sMembers(redisKey);
    if (cachedOrderIds.length > 0) {
      console.log(`Órdenes obtenidas desde Redis: ${cachedOrderIds}`);
      // Obtener las órdenes completas desde Redis
      const orders = await Promise.all(
        cachedOrderIds.map(async (id) => {
          const orderKey = `order:${id}`;
          const cachedOrder = await redisClient.get(orderKey);
          return cachedOrder ? JSON.parse(cachedOrder) : null;
        })
      );
      return orders.filter((order) => order !== null);
    }
    console.log(
      "Órdenes no encontradas en Redis. Consultando la base de datos..."
    );
    // Si no están en Redis, consulta la base de datos
    const orders = await this.orderRepository.find({ where: { status } });
    // Almacena las órdenes en Redis para futuras consultas
    const pipeline = redisClient.multi();
    orders.forEach((order) => {
      const orderKey = `order:${order.id}`;
      pipeline.set(orderKey, JSON.stringify(order), { EX: 3600 });
      pipeline.sAdd(redisKey, order.id);
    });
    await pipeline.exec();
    console.log(`Órdenes almacenadas en Redis: ${orders.length}`);
    return orders;
  }
}
