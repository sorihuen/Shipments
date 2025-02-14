// src/routes/route.routes.ts
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

// Proteger todas las rutas con authenticateUser y isAdmin
routeRouter.post('/', authenticateUser, isAdmin, (req, res) => routeController.createRoute(req, res));
routeRouter.get('/', authenticateUser, isAdmin, (req, res) => routeController.getAllRoutes(req, res));
routeRouter.get('/:routeId', authenticateUser, isAdmin, (req, res) => routeController.getRouteById(req, res));
routeRouter.post('/:routeId/assign-driver', authenticateUser, isAdmin, (req, res) => routeController.assignDriverToRoute(req, res));
routeRouter.delete('/:routeId', authenticateUser, isAdmin, (req, res) => routeController.deleteRoute(req, res));

export default routeRouter;