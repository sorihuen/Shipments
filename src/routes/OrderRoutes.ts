// src/routes/order.routes.ts
import { Router } from 'express';
import { OrderController } from '../controller/OrderController';
import { OrderService } from '../services/OrderService';
import { authenticateUser } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';

// Instancia del servicio y controlador
const orderService = new OrderService();
const orderController = new OrderController(orderService);

// Definición del router
const orderRouter = Router();

/**
 * Ruta para crear una nueva orden.
 * POST /api/orders
 */
orderRouter.post('/', authenticateUser, (req, res) => orderController.createOrder(req, res));

/**
 * Ruta para asignar un transportista y una ruta a una orden específica.
 * POST /api/orders/:orderId/assign
 */
orderRouter.post('/:orderId/assign', authenticateUser, isAdmin, (req, res) => orderController.assignRoute(req, res));

/**
 * Ruta para actualizar el estado de una orden a "Entregado".
 * PUT /api/orders/:orderId/status
 */
orderRouter.put('/:orderId/status', authenticateUser, isAdmin, (req, res) => orderController.updateOrderStatus(req, res));


/**
 * Ruta para listar todas las órdenes.
 * GET /api/orders
 */
orderRouter.get('/', authenticateUser, isAdmin, (req, res) => orderController.getAllOrders(req, res));

export default orderRouter;