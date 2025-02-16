import { Router } from 'express';
import { DriverController } from '../controller/DriverController';
import { DriverService } from '../services/DriveService';
import { DriverRepository } from '../repositories/DriverRepository';
import { authenticateUser } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';

// Instancia del repositorio, servicio y controlador
const driverRepository = new DriverRepository();
const driverService = new DriverService(driverRepository);
const driverController = new DriverController(driverService);

// Definición del router
const driverRouter = Router();

/**
 * @openapi
 * /api/drivers:
 *   post:
 *     summary: Crea un nuevo transportista
 *     description: Crea un nuevo transportista en el sistema. Requiere autenticación y rol de administrador.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del transportista
 *               vehicleCapacity:
 *                 type: number
 *                 description: Capacidad del vehículo del transportista (en kg o unidades)
 *             required:
 *               - name
 *               - vehicleCapacity
 *     responses:
 *       201:
 *         description: Transportista creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID del transportista
 *                 name:
 *                   type: string
 *                   description: Nombre del transportista
 *                 vehicleCapacity:
 *                   type: number
 *                   description: Capacidad del vehículo del transportista
 *       400:
 *         description: Datos inválidos o faltantes
 *       500:
 *         description: Error interno del servidor
 */
driverRouter.post('/', authenticateUser, isAdmin, (req, res) => driverController.createDriver(req, res));

/**
 * @openapi
 * /api/drivers:
 *   get:
 *     summary: Lista todos los transportistas
 *     description: Devuelve una lista de todos los transportistas disponibles. Opcionalmente, se puede filtrar por disponibilidad. Requiere autenticación y rol de administrador.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filtrar transportistas disponibles (true/false). Este parámetro es opcional.
 *     responses:
 *       200:
 *         description: Lista de transportistas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID del transportista
 *                   name:
 *                     type: string
 *                     description: Nombre del transportista
 *                   vehicleCapacity:
 *                     type: number
 *                     description: Capacidad del vehículo del transportista
 *                   isAvailable:
 *                     type: boolean
 *                     description: Indica si el transportista está disponible
 *       500:
 *         description: Error interno del servidor
 */
driverRouter.get('/', authenticateUser, isAdmin, (req, res) => driverController.getAllDrivers(req, res));

/**
 * @openapi
 * /api/drivers/metrics:
 *   get:
 *     summary: Obtiene métricas de desempeño de los transportistas
 *     description: Devuelve métricas de desempeño de todos los transportistas en un rango de fechas específico. Requiere autenticación y rol de administrador.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del rango (formato YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del rango (formato YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Métricas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito
 *                 metrics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       driverId:
 *                         type: integer
 *                         description: ID del transportista
 *                       totalDeliveries:
 *                         type: integer
 *                         description: Total de entregas realizadas
 *                       averageDeliveryTime:
 *                         type: number
 *                         description: Tiempo promedio de entrega (en minutos)
 *       400:
 *         description: Parámetros inválidos o faltantes
 *       500:
 *         description: Error interno del servidor
 */
driverRouter.get('/metrics', authenticateUser, isAdmin, (req, res) => driverController.getDriverPerformanceMetrics(req, res));

/**
 * @openapi
 * /api/drivers/{id}/performance-metrics:
 *   get:
 *     summary: Obtiene métricas de desempeño de un transportista específico
 *     description: Devuelve métricas de desempeño de un transportista específico en un rango de fechas. Requiere autenticación y rol de administrador.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del transportista
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del rango (formato YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del rango (formato YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Métricas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito
 *                 metrics:
 *                   type: object
 *                   properties:
 *                     totalDeliveries:
 *                       type: integer
 *                       description: Total de entregas realizadas
 *                     averageDeliveryTime:
 *                       type: number
 *                       description: Tiempo promedio de entrega (en minutos)
 *       400:
 *         description: Parámetros inválidos o faltantes
 *       404:
 *         description: Transportista no encontrado
 *       500:
 *         description: Error interno del servidor
 */
driverRouter.get('/:id/performance-metrics', authenticateUser, isAdmin, (req, res) => driverController.getDriverPerformanceMetricsById(req, res));

export default driverRouter;