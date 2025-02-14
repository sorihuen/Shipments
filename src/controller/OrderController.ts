// src/controller/OrderController.ts
import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';

export class OrderController {
    private orderService: OrderService;

    constructor(orderService: OrderService) {
        this.orderService = orderService;
    }

    async createOrder(req: Request, res: Response) {
        try {
            const user = res.locals.user;
            if (!user) {
                return res.status(401).json({ error: 'Usuario no autenticado.' });
            }

            const { weight, dimensions, productType, destinationAddress, returnAddress } = req.body;

            // Crear la orden usando el servicio
            const order = await this.orderService.createOrder(
                user,
                weight,
                dimensions,
                productType,
                destinationAddress,
                returnAddress,
            );

            // Formatear la respuesta organizada
            const response = {
                message: 'Orden de envío creada exitosamente',
                order: {
                    id: order.id,
                    status: order.status,
                    productType: order.productType,
                    weight: order.weight,
                    dimensions: {
                        length: order.dimensions.length,
                        width: order.dimensions.width,
                        height: order.dimensions.height,
                    },
                    destinationAddress: order.destinationAddress,
                    returnAddress: order.returnAddress,
                    user: {
                        id: order.user.id,
                    },
                    timestamps: {
                        createdAt: order.createdAt,
                        updatedAt: order.updatedAt,
                    },
                },
            };

            // Devolver la respuesta con el formato organizado
            res.status(201).json(response);
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(400).json({ error: 'Ocurrió un error desconocido.' });
            }
        }
    }
}