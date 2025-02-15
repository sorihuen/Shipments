import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import { DriverController } from '../../controller/DriverController';
import { DriverService } from '../../services/DriveService';
import { Request, Response } from 'express';

describe('DriverController', () => {
  // Stub del servicio con métodos simulados
  let driverService: Partial<DriverService>;
  let driverController: DriverController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    driverService = {
      createDriver: vi.fn(),
      getAllDrivers: vi.fn(),
    };

    driverController = new DriverController(driverService as DriverService);

    // Simulamos el objeto Response de Express: status retorna el mismo objeto para encadenar json
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  describe('createDriver', () => {
    it('should create a driver successfully', async () => {
      // Arrange
      const resultData = {
        message: 'Transportista creado exitosamente',
        driver: { id: 1, name: 'John Doe', vehicleCapacity: 1000, isAvailable: true, routes: [], orders: [] },
      };
      // Simulamos que el servicio retorna el resultado exitoso
      (driverService.createDriver as Mock).mockResolvedValue(resultData);

      req = {
        body: { name: 'John Doe', vehicleCapacity: 1000 },
      };

      // Act
      await driverController.createDriver(req as Request, res as Response);

      // Assert
      expect(driverService.createDriver).toHaveBeenCalledWith('John Doe', 1000);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(resultData);
    });

    it('should return 400 if name is missing or not a string', async () => {
      // Arrange: nombre faltante
      req = {
        body: { vehicleCapacity: 1000 },
      };

      // Act
      await driverController.createDriver(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'El nombre del transportista es obligatorio y debe ser una cadena.',
      });
    });

    it('should return 400 if vehicleCapacity is not a positive number', async () => {
      // Arrange: capacidad inválida
      req = {
        body: { name: 'John Doe', vehicleCapacity: -100 },
      };

      // Act
      await driverController.createDriver(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'La capacidad del vehículo debe ser un número positivo.',
      });
    });

    it('should return error if driverService.createDriver throws an error', async () => {
      // Arrange: simulamos error en el servicio
      const error = new Error('Database error');
      (driverService.createDriver as Mock).mockRejectedValue(error);

      req = {
        body: { name: 'John Doe', vehicleCapacity: 1000 },
      };

      // Act
      await driverController.createDriver(req as Request, res as Response);

      // Assert: al ser instancia de Error, se retorna status 400
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('getAllDrivers', () => {
    it('should return all drivers with status 200 when no query filter is provided', async () => {
      // Arrange
      const resultData = {
        message: 'Lista de transportistas',
        drivers: [{ id: 1, name: 'John Doe' }],
      };
      (driverService.getAllDrivers as Mock).mockResolvedValue(resultData);

      req = {
        query: {},
      };

      // Act
      await driverController.getAllDrivers(req as Request, res as Response);

      // Assert
      expect(driverService.getAllDrivers).toHaveBeenCalledWith(undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(resultData);
    });

    it('should parse available query parameter to true', async () => {
      // Arrange
      const resultData = {
        message: 'Lista de transportistas',
        drivers: [{ id: 1, name: 'John Doe' }],
      };
      (driverService.getAllDrivers as Mock).mockResolvedValue(resultData);

      req = {
        query: { available: 'true' },
      };

      // Act
      await driverController.getAllDrivers(req as Request, res as Response);

      // Assert
      expect(driverService.getAllDrivers).toHaveBeenCalledWith(true);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(resultData);
    });

    it('should parse available query parameter to false', async () => {
      // Arrange
      const resultData = {
        message: 'Lista de transportistas',
        drivers: [{ id: 2, name: 'Jane Smith' }],
      };
      (driverService.getAllDrivers as Mock).mockResolvedValue(resultData);

      req = {
        query: { available: 'false' },
      };

      // Act
      await driverController.getAllDrivers(req as Request, res as Response);

      // Assert
      expect(driverService.getAllDrivers).toHaveBeenCalledWith(false);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(resultData);
    });

    it('should return error if driverService.getAllDrivers throws an error (Error instance)', async () => {
      // Arrange: error como instancia de Error
      const error = new Error('Some error');
      (driverService.getAllDrivers as Mock).mockRejectedValue(error);

      req = {
        query: {},
      };

      // Act
      await driverController.getAllDrivers(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Some error' });
    });

    it('should return status 500 for non-Error thrown error', async () => {
      // Arrange: error no es instancia de Error
      (driverService.getAllDrivers as Mock).mockRejectedValue('Unexpected error');

      req = {
        query: {},
      };

      // Act
      await driverController.getAllDrivers(req as Request, res as Response);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Ocurrió un error desconocido.' });
    });
  });
});
