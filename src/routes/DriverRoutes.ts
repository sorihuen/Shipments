// src/routes/driver.routes.ts
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
 * Ruta para crear un nuevo transportista.
 * POST /api/drivers
 */
driverRouter.post('/', authenticateUser, isAdmin, (req, res) => driverController.createDriver(req, res));

/**
 * Ruta para listar todos los transportistas.
 * GET /api/drivers
 */
driverRouter.get('/', authenticateUser, isAdmin, (req, res) => driverController.getAllDrivers(req, res));


export default driverRouter;