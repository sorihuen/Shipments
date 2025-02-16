// src/controllers/OrderController.ts
import { Request, Response } from "express";
import { OrderService } from "../services/OrderService";
import { validate } from "uuid";
import { User } from "../entities/User";
import { OrderStatus } from "../entities/Order";

interface AuthenticatedRequest extends Request {
  user?: User; // Agrega la propiedad "user" al tipo Request
}

export class OrderController {
    private orderService: OrderService;

    constructor(orderService: OrderService) {
        this.orderService = orderService;
    }

    /**
     * Crea una nueva orden de envío.
     */
    async createOrder(req: any, res: Response) {
        try {
            const {
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
            } = req.body;
            const user = req.user; // Usuario autenticado

            // Validar campos obligatorios del remitente
            if (!senderName || !senderPhone || !senderEmail) {
                return res.status(400).json({
                    error:
                        "Todos los campos del remitente (senderName, senderPhone, senderEmail) son obligatorios.",
                });
            }

            // Crear la orden
            const newOrder = await this.orderService.createOrder(
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

            res.status(201).json({
                message: "Orden creada exitosamente",
                order: newOrder,
            });
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Ocurrió un error desconocido." });
            }
        }
    }

    /**
     * Lista todas las órdenes, con opción de filtrar por estado.
     */
    async getAllOrders(req: Request, res: Response) {
        try {
            const { status } = req.query;

            // Validar el estado si se proporciona
            let parsedStatus: OrderStatus | undefined;
            if (status) {
                if (Object.values(OrderStatus).includes(status as OrderStatus)) {
                    parsedStatus = status as OrderStatus;
                } else {
                    return res.status(400).json({ error: "Estado no válido." });
                }
            }

            // Obtener las órdenes
            const orders = await this.orderService.getAllOrders(parsedStatus);

            res.status(200).json({
                message: "Órdenes obtenidas exitosamente",
                orders,
            });
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Ocurrió un error desconocido." });
            }
        }
    }

    /**
     * Asigna una ruta a una orden específica.
     */
    async assignRoute(req: Request, res: Response) {
        try {
            const { orderId } = req.params;
            const { routeId } = req.body;

            // Validar que el ID de la orden sea un UUID válido
            if (!validate(orderId)) {
                return res.status(400).json({ error: "El ID de la orden no es un UUID válido." });
            }

            // Validar que el ID de la ruta sea un número
            if (isNaN(Number(routeId))) {
                return res.status(400).json({ error: "El ID de la ruta debe ser un número válido." });
            }

            // Asignar la ruta a la orden
            const result = await this.orderService.assignRoute(orderId, Number(routeId));

            res.status(200).json(result);
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Ocurrió un error desconocido." });
            }
        }
    }

    /**
     * Actualiza el estado de una orden específica.
     */
    async updateOrderStatus(req: Request, res: Response) {
        try {
            const { orderId } = req.params;
            const { status } = req.body;

            // Validar que el ID de la orden sea un UUID válido
            if (!validate(orderId)) {
                return res.status(400).json({ error: "El ID de la orden no es un UUID válido." });
            }

            // Validar que el cuerpo de la solicitud contenga el campo "status"
            if (!status) {
                return res.status(400).json({ error: "El campo 'status' es obligatorio." });
            }

            // Validar que el estado sea "Entregado"
            if (status !== OrderStatus.ENTREGADO) {
                return res.status(400).json({ error: "Solo se permite cambiar el estado a 'Entregado'." });
            }

            // Actualizar el estado de la orden
            const result = await this.orderService.updateOrderStatus(orderId, status as OrderStatus);

            // Devolver la respuesta adecuada
            if (result.message.includes("No se realizó ningún cambio")) {
                return res.status(200).json({ message: result.message });
            }

            res.status(200).json({
                message: result.message,
                status,
            });
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Ocurrió un error desconocido." });
            }
        }
    }

    /**
     * Obtiene el estado actual de una orden específica por su ID.
     */
    async getOrderStatusById(req: Request, res: Response) {
        try {
            const { orderId } = req.params;

            // Llama al servicio para obtener la orden completa
            const order = await this.orderService.getOrderById(orderId);
            if (!order) {
                throw new Error("Orden no encontrada.");
            }

            // Determinar el driver a usar
            let driver = null;

            // Primero, intentar obtener el driver directamente desde la orden
            if (order.driver) {
                driver = {
                    id: order.driver.id,
                    name: order.driver.name,
                    vehicleCapacity: order.driver.vehicleCapacity,
                    isAvailable: order.driver.isAvailable,
                };
            }
            // Si no hay un driver directo, buscarlo a través de la ruta
            else if (order.route && order.route.drivers && order.route.drivers.length > 0) {
                driver = {
                    id: order.route.drivers[0].id,
                    name: order.route.drivers[0].name,
                    vehicleCapacity: order.route.drivers[0].vehicleCapacity,
                    isAvailable: order.route.drivers[0].isAvailable,
                };
            }

            // Construye la respuesta incluyendo la información del driver
            const response = {
                message: "Información de la orden obtenida exitosamente",
                orderId,
                productType: order.productType, // Tipo de producto
                destinationAddress: order.destinationAddress, // Dirección de destino
                status: order.status, // Estado actual de la orden
                driver, // Información del driver (si está asignado)
            };

            // Devuelve la información de la orden en la respuesta
            res.status(200).json(response);
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Ocurrió un error desconocido." });
            }
        }
    }

}