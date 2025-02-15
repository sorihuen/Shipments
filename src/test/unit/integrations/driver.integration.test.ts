// tests/integration/driver.integration.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { DriverController } from '../../../controller/DriverController';
import { DriverService } from '../../../services/DriveService';
import { DriverRepository } from '../../../repositories/DriverRepository';
import type { Request } from 'express';

// Repositorio "fake" en memoria para las pruebas
class FakeDriverRepository implements Partial<DriverRepository> {
  private drivers: any[] = [];

  async createDriver(name: string, vehicleCapacity: number) {
    const newDriver = {
      id: this.drivers.length + 1,
      name,
      vehicleCapacity,
      isAvailable: true,
      routes: [],
      orders: []
    };
    this.drivers.push(newDriver);
    return newDriver;
  }

  async getAllDrivers(isAvailable?: boolean) {
    let drivers = this.drivers;
    if (typeof isAvailable !== 'undefined') {
      drivers = drivers.filter((driver) => driver.isAvailable === isAvailable);
    }
    return drivers;
  }
}

// Función para simular el objeto Response de Express
function createFakeResponse() {
  const res: any = {};
  res.status = function (code: number) {
    this.statusCode = code;
    return this;
  };
  res.json = function (data: any) {
    this.body = data;
    return this;
  };
  return res;
}

// Helper para simular un objeto Request de Express
function createFakeRequest(body: any = {}, query: any = {}): Request {
  return { body, query } as unknown as Request;
}

describe('Integration Test - DriverController & DriverService', () => {
  let driverService: DriverService;
  let driverController: DriverController;
  let fakeRepo: FakeDriverRepository;

  beforeAll(() => {
    // Inicializamos el repositorio fake y las dependencias del Driver
    fakeRepo = new FakeDriverRepository();
    // Hacemos un cast para que DriverService reciba un objeto similar a DriverRepository
    driverService = new DriverService(fakeRepo as unknown as DriverRepository);
    driverController = new DriverController(driverService);
  });

  it('should return all drivers', async () => {
    // Creamos algunos drivers primero usando la función helper
    await driverController.createDriver(createFakeRequest({ name: 'Driver1', vehicleCapacity: 1000 }), createFakeResponse());
    await driverController.createDriver(createFakeRequest({ name: 'Driver2', vehicleCapacity: 1500 }), createFakeResponse());

    const req = createFakeRequest({}, {});
    const res = createFakeResponse();

    await driverController.getAllDrivers(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Lista de transportistas');
    expect(Array.isArray(res.body.drivers)).toBe(true);
    expect(res.body.drivers.length).toBeGreaterThanOrEqual(2);
    res.body.drivers.forEach((driver: any) => {
      expect(driver).toHaveProperty('assignedRoutes');
    });
  });
});
