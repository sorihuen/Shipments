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
 * @openapi
 * tags:
 *   - name: Orders
 *     description: Operaciones relacionadas con la gestión de órdenes de envío
 */

/**
 * @openapi
 * /api/orders:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Crea una nueva orden de envío
 *     description: Crea una nueva orden de envío en el sistema. Requiere autenticación.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weight:
 *                 type: number
 *                 description: Peso del paquete (en kg)
 *               dimensions:
 *                 type: string
 *                 description: Dimensiones del paquete (ej. "10x10x10")
 *               productType:
 *                 type: string
 *                 description: Tipo de producto a enviar
 *               destinationAddress:
 *                 type: string
 *                 description: Dirección de destino
 *               returnAddress:
 *                 type: string
 *                 description: Dirección de retorno (opcional)
 *               recipientName:
 *                 type: string
 *                 description: Nombre del destinatario
 *               recipientPhone:
 *                 type: string
 *                 description: Teléfono del destinatario
 *               recipientEmail:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del destinatario
 *               senderName:
 *                 type: string
 *                 description: Nombre del remitente
 *               senderPhone:
 *                 type: string
 *                 description: Teléfono del remitente
 *               senderEmail:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del remitente
 *             required:
 *               - weight
 *               - productType
 *               - destinationAddress
 *               - recipientName
 *               - recipientPhone
 *               - recipientEmail
 *               - senderName
 *               - senderPhone
 *               - senderEmail
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID de la orden
 *                     weight:
 *                       type: number
 *                       description: Peso del paquete
 *                     productType:
 *                       type: string
 *                       description: Tipo de producto
 *                     status:
 *                       type: string
 *                       description: Estado de la orden
 *       400:
 *         description: Datos inválidos o faltantes
 *       500:
 *         description: Error interno del servidor
 */
orderRouter.post('/', authenticateUser, (req, res) => orderController.createOrder(req, res));

/**
 * @openapi
 * /api/orders/{orderId}/assign:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Asigna una ruta a una orden específica
 *     description: Asigna una ruta específica a una orden. Requiere autenticación y rol de administrador.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la orden
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               routeId:
 *                 type: integer
 *                 description: ID de la ruta a asignar
 *             required:
 *               - routeId
 *     responses:
 *       200:
 *         description: Ruta asignada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito
 *       400:
 *         description: Datos inválidos o faltantes
 *       404:
 *         description: Orden o ruta no encontrados
 *       500:
 *         description: Error interno del servidor
 */
orderRouter.post('/:orderId/assign', authenticateUser, isAdmin, (req, res) => orderController.assignRoute(req, res));

/**
 * @openapi
 * /api/orders/{orderId}/status:
 *   put:
 *     tags:
 *       - Orders
 *     summary: Actualiza el estado de una orden específica
 *     description: Actualiza el estado de una orden específica a "Entregado". Requiere autenticación y rol de administrador.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la orden
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - Entregado
 *                 description: Nuevo estado de la orden
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Estado de la orden actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito
 *                 status:
 *                   type: string
 *                   description: Nuevo estado de la orden
 *       400:
 *         description: Datos inválidos o faltantes
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error interno del servidor
 */
orderRouter.put('/:orderId/status', authenticateUser, isAdmin, (req, res) => orderController.updateOrderStatus(req, res));

/**
 * @openapi
 * /api/orders:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Lista todas las órdenes
 *     description: Devuelve una lista de todas las órdenes disponibles, con opción de filtrar por estado y rango de fechas. Requiere autenticación y rol de administrador.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar órdenes por estado (opcional)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del rango (opcional, formato YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del rango (opcional, formato YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de órdenes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID de la orden
 *                       weight:
 *                         type: number
 *                         description: Peso del paquete
 *                       productType:
 *                         type: string
 *                         description: Tipo de producto
 *                       status:
 *                         type: string
 *                         description: Estado de la orden
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 */
orderRouter.get('/', authenticateUser, isAdmin, (req, res) => orderController.getAllOrders(req, res));

/**
 * @openapi
 * /api/orders/{orderId}/status:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Obtiene el estado de una orden específica
 *     description: Devuelve el estado actual de una orden específica, incluyendo información del transportista asignado (si existe). Requiere autenticación.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la orden
 *     responses:
 *       200:
 *         description: Estado de la orden obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito
 *                 orderId:
 *                   type: string
 *                   description: ID de la orden
 *                 productType:
 *                   type: string
 *                   description: Tipo de producto
 *                 destinationAddress:
 *                   type: string
 *                   description: Dirección de destino
 *                 status:
 *                   type: string
 *                   description: Estado actual de la orden
 *                 driver:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID del transportista
 *                     name:
 *                       type: string
 *                       description: Nombre del transportista
 *                     vehicleCapacity:
 *                       type: number
 *                       description: Capacidad del vehículo del transportista
 *                     isAvailable:
 *                       type: boolean
 *                       description: Indica si el transportista está disponible
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error interno del servidor
 */
orderRouter.get('/:orderId/status', authenticateUser, (req, res) => orderController.getOrderStatusById(req, res));

export default orderRouter;