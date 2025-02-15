// src/controllers/DriverController.ts
import { Request, Response } from 'express';
import { DriverService } from '../services/DriveService';

export class DriverController {
    private driverService: DriverService;

    constructor(driverService: DriverService) {
        this.driverService = driverService;
    }
    /**
     * Crea un nuevo transportista.
     * @param req - Solicitud HTTP.
     * @param res - Respuesta HTTP.
     */
    async createDriver(req: Request, res: Response) {
        try {
            const { name, vehicleCapacity } = req.body;

            // Validar que el nombre sea una cadena no vacía
            if (!name || typeof name !== 'string') {
                return res.status(400).json({ error: 'El nombre del transportista es obligatorio y debe ser una cadena.' });
            }

            // Validar que la capacidad del vehículo sea un número positivo
            const capacity = Number(vehicleCapacity);
            if (isNaN(capacity) || capacity <= 0) {
                return res.status(400).json({ error: 'La capacidad del vehículo debe ser un número positivo.' });
            }

            // Crear el transportista
            const result = await this.driverService.createDriver(name, capacity);
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
     * Lista todos los transportistas.
     * @param req - Solicitud HTTP.
     * @param res - Respuesta HTTP.
     */
        async getAllDrivers(req: Request, res: Response) {
            try {
                // Leer el parámetro de consulta "available" (opcional)
                const { available } = req.query;
                let isAvailable: boolean | undefined;
    
                if (available === 'true') {
                    isAvailable = true;
                } else if (available === 'false') {
                    isAvailable = false;
                }
    
                // Obtener los transportistas filtrados
                const drivers = await this.driverService.getAllDrivers(isAvailable);
                res.status(200).json(drivers);
            } catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ error: error.message });
                } else {
                    res.status(500).json({ error: 'Ocurrió un error desconocido.' });
                }
            }
        }
    
}