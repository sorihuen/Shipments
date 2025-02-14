import { Router } from 'express';
import { OrderController } from '../controller/OrderController';
import { authenticateUser } from '../middlewares/auth.middleware';
import { OrderService } from '../services/OrderService';

const router = Router();

const orderService = new OrderService();
const orderController = new OrderController(orderService);

router.post('/', authenticateUser, orderController.createOrder.bind(orderController)); 

// Puedes agregar más rutas aquí
// router.get('/', authenticateUser, orderController.getOrders);
// router.get('/:id', authenticateUser, orderController.getOrderById);

export default router;