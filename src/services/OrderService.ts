// src/services/OrderService.ts
import { OrderRepository } from "../repositories/OrderRepository";
import { RouteRepository } from "../repositories/RouteRepository";
import { validateAddress } from "../utils/geocoding";
import { User } from "../entities/User";
import { OrderStatus } from "../entities/Order";
import { redisClient } from "../Config/redis.config";

export class OrderService {
  private orderRepository: OrderRepository;
  private routeRepository: RouteRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.routeRepository = new RouteRepository();
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
    // Validar direcciones
    const isDestinationAddressValid = await validateAddress(destinationAddress);
    if (!isDestinationAddressValid) {
      throw new Error("La dirección de destino no es válida.");
    }
    const isReturnAddressValid = await validateAddress(returnAddress);
    if (!isReturnAddressValid) {
      throw new Error("La dirección de retorno no es válida.");
    }

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
    const initialStatus = "En espera"; // Estado inicial predeterminado
    await redisClient.set(redisKey, initialStatus, { EX: 3600 }); // TTL de 1 hora

    // Opcional: Almacenar la orden en una lista específica para su estado
    const statusKey = `order:status:${initialStatus}`;
    await redisClient.sAdd(statusKey, order.id); // Usamos un conjunto (SET) para evitar duplicados

    console.log(
      `Orden creada y estado inicial almacenado en Redis: ${initialStatus}`
    );

    return order;
  }

  /**
   * Asigna una ruta a una orden específica y actualiza su estado en Redis.
   */
  async assignRoute(orderId: string, routeId: number) {
    // Actualizar la orden en la base de datos (asignar la ruta)
    const updatedOrder = await this.orderRepository.assignRoute(
      orderId,
      routeId
    );

    // Obtener el estado anterior desde Redis
    const redisKey = `order:${orderId}:status`;
    const oldStatus = await redisClient.get(redisKey);

    // Actualizar el estado en Redis a "En tránsito"
    const newStatus = "En tránsito";
    await redisClient.set(redisKey, newStatus, { EX: 3600 }); // TTL de 1 hora

    // Actualizar las listas de estados en Redis
    if (oldStatus) {
      const oldStatusKey = `order:status:${oldStatus}`;
      await redisClient.sRem(oldStatusKey, orderId); // Elimina la orden del estado anterior
    }
    const newStatusKey = `order:status:${newStatus}`;
    await redisClient.sAdd(newStatusKey, orderId); // Agrega la orden al nuevo estado

    console.log(`Estado actualizado en Redis: ${newStatus}`);

    return updatedOrder;
  }

  /**
   * Lista todas las órdenes, con opción de filtrar por estado.
   */
  async getAllOrders(status?: OrderStatus) {
    return await this.orderRepository.getAllOrders(status);
  }

  /**
   * Obtiene el estado de una orden desde Redis o la base de datos.
   */
  async getOrderStatus(orderId: string): Promise<OrderStatus | null> {
    const redisKey = `order:${orderId}:status`;

    // Intenta obtener el estado desde Redis
    const cachedStatus = await redisClient.get(redisKey);
    if (cachedStatus) {
      return cachedStatus as OrderStatus; // Devuelve el estado desde Redis
    }

    // Si no está en Redis, consulta la base de datos
    const order = await this.orderRepository.findOneBy({ id: orderId }); // Usa findOneBy
    if (!order) {
      throw new Error("Orden no encontrada.");
    }

    // Almacena el estado en Redis para futuras consultas
    await redisClient.set(redisKey, order.status, { EX: 300 }); // Expira en 300 segundos (5 minutos)

    return order.status;
  }

  /**
   * Actualiza el estado de una orden específica.
   */
  /**
 * Actualiza el estado de una orden específica.
 */
async updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<{ message: string }> {
  // Busca la orden en la base de datos
  const order = await this.orderRepository.findOneBy({ id: orderId });
  if (!order) {
    throw new Error("Orden no encontrada.");
  }

  // Validar que el nuevo estado sea "Entregado"
  if (newStatus !== OrderStatus.ENTREGADO) {
    throw new Error("Solo se permite cambiar el estado a 'Entregado'.");
  }

  // Validar que el estado actual sea "En tránsito"
  if (order.status !== OrderStatus.EN_TRANSITO) {
    return {
      message:
        "No se realizó ningún cambio. La orden no está en estado 'En tránsito'.",
    };
  }

  // Actualiza el estado en la base de datos
  await this.orderRepository.updateOrderStatus(orderId, newStatus);

  // Obtener el estado anterior desde Redis
  const redisKey = `order:${orderId}:status`;
  const oldStatus = await redisClient.get(redisKey);

  // Actualizar el estado en Redis con un TTL de 1 hora
  await redisClient.set(redisKey, newStatus, { EX: 3600 }); // Expira en 3600 segundos (1 hora)

  // Actualizar las listas de estados en Redis
  if (oldStatus) {
    const oldStatusKey = `order:status:${oldStatus}`;
    await redisClient.sRem(oldStatusKey, orderId); // Elimina la orden del estado anterior
  }
  const newStatusKey = `order:status:${newStatus}`;
  await redisClient.sAdd(newStatusKey, orderId); // Agrega la orden al nuevo estado

  console.log(`Estado actualizado en Redis: ${newStatus}`);

  return { message: "Estado actualizado exitosamente" };
}
}
