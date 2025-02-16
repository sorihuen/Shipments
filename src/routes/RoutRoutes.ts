import { Router } from 'express';
import { RouteController } from '../controller/RouteController';
import { RouteService } from '../services/RouteService';
import { RouteRepository } from '../repositories/RouteRepository';
import { authenticateUser } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';

const routeRepository = new RouteRepository();
const routeService = new RouteService(routeRepository);
const routeController = new RouteController(routeService);

const routeRouter = Router();

/**
 * @openapi
 * tags:
 *   - name: Routes
 *     description: Operaciones relacionadas con la gestión de rutas de envío
 */

/**
 * @openapi
 * /api/routes:
 *   post:
 *     tags:
 *       - Routes
 *     summary: Crea una nueva ruta
 *     description: Crea una nueva ruta en el sistema. Requiere autenticación y rol de administrador.
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
 *                 description: Nombre de la ruta
 *               origin:
 *                 type: string
 *                 description: Origen de la ruta
 *               destination:
 *                 type: string
 *                 description: Destino de la ruta
 *             required:
 *               - name
 *               - origin
 *               - destination
 *     responses:
 *       201:
 *         description: Ruta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID de la ruta creada
 *                 name:
 *                   type: string
 *                   description: Nombre de la ruta
 *                 origin:
 *                   type: string
 *                   description: Origen de la ruta
 *                 destination:
 *                   type: string
 *                   description: Destino de la ruta
 *       400:
 *         description: Datos inválidos o faltantes
 *       500:
 *         description: Error interno del servidor
 */
routeRouter.post('/', authenticateUser, isAdmin, (req, res) =>
  routeController.createRoute(req, res)
);

/**
 * @openapi
 * /api/routes:
 *   get:
 *     tags:
 *       - Routes
 *     summary: Obtiene todas las rutas
 *     description: Devuelve una lista de todas las rutas disponibles. Requiere autenticación y rol de administrador.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de rutas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID de la ruta
 *                   name:
 *                     type: string
 *                     description: Nombre de la ruta
 *                   origin:
 *                     type: string
 *                     description: Origen de la ruta
 *                   destination:
 *                     type: string
 *                     description: Destino de la ruta
 *       500:
 *         description: Error interno del servidor
 */
routeRouter.get('/', authenticateUser, isAdmin, (req, res) =>
  routeController.getAllRoutes(req, res)
);

/**
 * @openapi
 * /api/routes/{routeId}:
 *   get:
 *     tags:
 *       - Routes
 *     summary: Obtiene una ruta por ID
 *     description: Devuelve los detalles de una ruta específica basada en su ID. Requiere autenticación y rol de administrador.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la ruta a obtener
 *     responses:
 *       200:
 *         description: Ruta obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID de la ruta
 *                 name:
 *                   type: string
 *                   description: Nombre de la ruta
 *                 origin:
 *                   type: string
 *                   description: Origen de la ruta
 *                 destination:
 *                   type: string
 *                   description: Destino de la ruta
 *       400:
 *         description: ID de ruta inválido
 *       404:
 *         description: Ruta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
routeRouter.get('/:routeId', authenticateUser, isAdmin, (req, res) =>
  routeController.getRouteById(req, res)
);

/**
 * @openapi
 * /api/routes/{routeId}/assign-driver:
 *   post:
 *     tags:
 *       - Routes
 *     summary: Asigna un transportista a una ruta
 *     description: Asigna un transportista a una ruta específica. Requiere autenticación y rol de administrador.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la ruta a la que se asignará el transportista
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               driverId:
 *                 type: integer
 *                 description: ID del transportista a asignar
 *             required:
 *               - driverId
 *     responses:
 *       200:
 *         description: Transportista asignado exitosamente
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
 *         description: Ruta o transportista no encontrado
 *       500:
 *         description: Error interno del servidor
 */
routeRouter.post(
  '/:routeId/assign-driver',
  authenticateUser,
  isAdmin,
  (req, res) => routeController.assignDriverToRoute(req, res)
);

/**
 * @openapi
 * /api/routes/{routeId}:
 *   delete:
 *     tags:
 *       - Routes
 *     summary: Elimina una ruta
 *     description: Elimina una ruta específica basada en su ID. Requiere autenticación y rol de administrador.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la ruta a eliminar
 *     responses:
 *       200:
 *         description: Ruta eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito
 *       400:
 *         description: ID de ruta inválido
 *       404:
 *         description: Ruta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
routeRouter.delete('/:routeId', authenticateUser, isAdmin, (req, res) =>
  routeController.deleteRoute(req, res)
);

export default routeRouter;