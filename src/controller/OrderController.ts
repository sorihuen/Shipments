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
   * @param req - Solicitud HTTP.
   * @param res - Respuesta HTTP.
   */
  async createOrder(req: AuthenticatedRequest, res: Response) {
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
        senderName, // Remitente externo (opcional)
        senderPhone, // Obligatorio
        senderEmail, // Remitente externo (opcional)
      } = req.body;

      const user = req.user as User; //Usuario  autenticado

      // Validar que senderPhone esté presente
      // Validar que todos los campos del remitente estén presentes
      if (!senderName || !senderPhone || !senderEmail) {
        return res
          .status(400)
          .json({
            error:
              "Todos los campos del remitente (senderName, senderPhone, senderEmail) son obligatorios.",
          });
      }

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

      // Convierte el estado de cadena a OrderStatus si se proporciona
      let parsedStatus: OrderStatus | undefined;
      if (status) {
        if (Object.values(OrderStatus).includes(status as OrderStatus)) {
          parsedStatus = status as OrderStatus;
        } else {
          return res.status(400).json({ error: "Estado no válido." });
        }
      }

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
   * @param req - Solicitud HTTP.
   * @param res - Respuesta HTTP.
   */
  async assignRoute(req: Request, res: Response) {
    try {
      const { orderId } = req.params; // Obtiene el ID de la orden de los parámetros de la URL
      const { routeId } = req.body; // Obtiene el ID de la ruta del cuerpo de la solicitud

      // Validar que el ID de la orden sea un UUID válido
      if (!validate(orderId)) {
        return res
          .status(400)
          .json({ error: "El ID de la orden no es un UUID válido." });
      }

      // Validar que el ID de la ruta sea un número
      if (isNaN(Number(routeId))) {
        return res
          .status(400)
          .json({ error: "El ID de la ruta debe ser un número válido." });
      }

      // Asignar la ruta a la orden
      const result = await this.orderService.assignRoute(
        orderId,
        Number(routeId)
      );

      // Devolver la respuesta con el resultado de la asignación
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
            return res
                .status(400)
                .json({ error: "El ID de la orden no es un UUID válido." });
        }

        // Validar que el cuerpo de la solicitud contenga el campo "status"
        if (!status) {
            return res
                .status(400)
                .json({ error: "El campo 'status' es obligatorio." });
        }

        // Validar que el estado sea "Entregado"
        if (status !== OrderStatus.ENTREGADO) {
            return res
                .status(400)
                .json({ error: "Solo se permite cambiar el estado a 'Entregado'." });
        }

        // Intentar actualizar el estado de la orden
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
}
