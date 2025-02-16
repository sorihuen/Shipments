// src/controllers/DriverController.ts
/* El controller invoca correctamente los métodos del service.
Se validan las entradas (por ejemplo, el nombre y la capacidad).
Se formatea correctamente la respuesta (códigos de estado y cuerpo de la respuesta). */

import { Request, Response } from "express";
import { DriverService } from "../services/DriveService";

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
      if (!name || typeof name !== "string") {
        return res
          .status(400)
          .json({
            error:
              "El nombre del transportista es obligatorio y debe ser una cadena.",
          });
      }

      // Validar que la capacidad del vehículo sea un número positivo
      const capacity = Number(vehicleCapacity);
      if (isNaN(capacity) || capacity <= 0) {
        return res
          .status(400)
          .json({
            error: "La capacidad del vehículo debe ser un número positivo.",
          });
      }

      // Crear el transportista
      const result = await this.driverService.createDriver(name, capacity);
      res.status(201).json(result); // Código 201 para indicar creación exitosa
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Ocurrió un error desconocido." });
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

      if (available === "true") {
        isAvailable = true;
      } else if (available === "false") {
        isAvailable = false;
      }

      // Obtener los transportistas filtrados
      const drivers = await this.driverService.getAllDrivers(isAvailable);
      res.status(200).json(drivers);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Ocurrió un error desconocido." });
      }
    }
  }
  async getDriverPerformanceMetrics(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ error: "startDate y endDate son obligatorios." });
      }

      const parsedStartDate = new Date(startDate as string);
      const parsedEndDate = new Date(endDate as string);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({ error: "Fechas no válidas." });
      }

      const metrics = await this.driverService.getPerformanceMetrics(
        parsedStartDate,
        parsedEndDate
      );

      res.status(200).json({
        message: "Métricas obtenidas exitosamente",
        metrics,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Ocurrió un error desconocido." });
      }
    }
  }
  async getDriverPerformanceMetricsById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ error: "startDate y endDate son obligatorios." });
      }

      const parsedStartDate = new Date(startDate as string);
      const parsedEndDate = new Date(endDate as string);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({ error: "Fechas no válidas." });
      }

      const driverId = parseInt(id, 10);
      const metrics = await this.driverService.getPerformanceMetricsByDriver(
        driverId,
        parsedStartDate,
        parsedEndDate
      );

      res.status(200).json({
        message: "Métricas obtenidas exitosamente",
        metrics,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Ocurrió un error desconocido." });
      }
    }
  }
  // En el DriverController
  async updateDriverAvailability(req: Request, res: Response) {
    try {
      // Extraer el ID del conductor desde los parámetros de la solicitud
      const { id } = req.params; 
      
  
      // Validar que el ID del conductor sea un número entero positivo
      const driverId = Number(id); 

      if (isNaN(driverId) || driverId <= 0) {
        return res.status(400).json({
          error: "El ID del conductor debe ser un número entero positivo válido.",
        });
      }
  
      /**
       * Llamar al servicio para actualizar la disponibilidad del conductor.
       * El servicio verifica si el conductor tiene órdenes activas o peso asignado.
       */
      const result = await this.driverService.updateDriverAvailability(driverId);
  
      /**
       * Manejar la respuesta según el resultado del servicio.
       * - Si el conductor fue actualizado correctamente, devolver 200 OK.
       * - Si el conductor tiene órdenes activas, devolver 409 Conflict.
       * - Para otros errores, devolver 400 Bad Request.
       */
      if (result.success) {
        
        res.status(200).json(result); // Conductor actualizado correctamente
      } else if (result.message.includes("órdenes activas")) {
        res.status(409).json(result); // Conflicto: conductor tiene órdenes activas
      } else {
        res.status(400).json(result); // Otros errores
      }
    } catch (error) {
      /**
       * Manejar errores inesperados.
       * - Si el error es una instancia de Error, devolver el mensaje del error con código 400.
       * - Para errores desconocidos, registrar el error en los logs y devolver un mensaje genérico con código 500.
       */
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Ocurrió un error inesperado en el servidor." });
      }
    }
  }
}
