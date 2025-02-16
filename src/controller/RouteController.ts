// src/controllers/RouteController.ts
import { EntityNotFoundError } from 'typeorm';
import { Request, Response } from 'express';
import { RouteService } from '../services/RouteService';


export class RouteController {
    private routeService: RouteService;

    constructor(routeService: RouteService) {
        this.routeService = routeService;
    }

    /**
     * Crea una nueva ruta.
     * @param req - Solicitud HTTP.
     * @param res - Respuesta HTTP.
     */
    async createRoute(req: Request, res: Response) {
        try {
            const { name, origin, destination } = req.body;
            const result = await this.routeService.createRoute(name, origin, destination);
            res.status(201).json(result); // Código 201 para indicar creación exitosa
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Ocurrió un error desconocido.' });
            }
        }
    }

    /**
     * Obtiene todas las rutas disponibles.
     * @param req - Solicitud HTTP.
     * @param res - Respuesta HTTP.
     */
    async getAllRoutes(req: Request, res: Response) {
        try {
            const routes = await this.routeService.getAllRoutes();
            res.status(200).json(routes);
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Ocurrió un error desconocido.' });
            }
        }
    }

    /**
     * Obtiene una ruta específica por su ID.
     * @param req - Solicitud HTTP.
     * @param res - Respuesta HTTP.
     */
    async getRouteById(req: Request, res: Response) {
        try {
            const { routeId } = req.params;
    
            // Validar que el ID sea un número
            const id = Number(routeId);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'El ID de la ruta debe ser un número válido.' });
            }
    
            // Obtener la ruta por ID
            const route = await this.routeService.getRouteById(id);
            res.status(200).json(route);
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                // Manejar el caso en el que la ruta no existe
                res.status(404).json({ error: `La ruta con ID ${req.params.routeId} no existe.` });
            } else if (error instanceof Error) {
                // Manejar otros errores
                res.status(400).json({ error: error.message });
            } else {
                // Manejar errores desconocidos
                res.status(500).json({ error: 'Ocurrió un error desconocido.' });
            }
        }
    }

    /**
     * Asigna un transportista a una ruta específica.
     * @param req - Solicitud HTTP.
     * @param res - Respuesta HTTP.
     */
    async assignDriverToRoute(req: Request, res: Response) {
        try {
            const { routeId } = req.params; // Obtiene el ID de la ruta de los parámetros de la URL
            const { driverId } = req.body; // Obtiene el ID del transportista del cuerpo de la solicitud

            // Validar que el ID de la ruta sea un número
            const id = Number(routeId);
            if (isNaN(id)) {
                return res.status(400).json({ error: 'El ID de la ruta debe ser un número válido.' });
            }

            // Validar que el ID del transportista sea un número
            const driverIdNumber = Number(driverId);
            if (isNaN(driverIdNumber)) {
                return res.status(400).json({ error: 'El ID del transportista debe ser un número válido.' });
            }

            // Asignar el transportista a la ruta
            const result = await this.routeService.addDriverToRoute(id, driverIdNumber);
            res.status(200).json(result); // Devuelve un mensaje de éxito
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Ocurrió un error desconocido.' });
            }
        }
    }

    /**
     * Elimina una ruta específica por su ID.
     * @param req - Solicitud HTTP.
     * @param res - Respuesta HTTP.
     */
    async deleteRoute(req: Request, res: Response) {
        try {
            const { routeId } = req.params;
            const result = await this.routeService.deleteRoute(Number(routeId));
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof Error) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Ocurrió un error desconocido.' });
            }
        }
    }
    /**
     * Verifica si un conductor ha entregado todas sus órdenes y actualiza su estado a disponible.
     * @param req - Solicitud HTTP.
     * @param res - Respuesta HTTP.
     */
    
}