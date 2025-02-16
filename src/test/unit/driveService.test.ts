import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DriverService } from '../../services/DriveService';
import { DriverRepository } from '../../repositories/DriverRepository';


vi.mock('../../repositories/DriverRepository', () => ({
  DriverRepository: vi.fn().mockImplementation(() => ({
    createDriver: vi.fn(),
    getAllDrivers: vi.fn()
  }))
}));

describe('DriverService', () => {
  let driverService: DriverService;
  let driverRepository: DriverRepository;

  beforeEach(() => {
    // Resetea todos los mocks
    vi.clearAllMocks();
    // Crea nuevas instancias para cada test
    driverRepository = new DriverRepository();
    driverService = new DriverService(driverRepository);
  });

  describe('createDriver', () => {
    it('should create a driver successfully', async () => {
      // Arrange
      const driverName = 'John Doe';
      const vehicleCapacity = 1000;
      const mockDriver = {
        id: 1,
        name: driverName,
        vehicleCapacity,
        isAvailable: true,
        routes: [],
        orders: []
      };

      // el mock para que retorne el driver simulado
      vi.mocked(driverRepository.createDriver).mockResolvedValue(mockDriver);

      // Act
      const result = await driverService.createDriver(driverName, vehicleCapacity);

      // Assert
      expect(driverRepository.createDriver).toHaveBeenCalledWith(driverName, vehicleCapacity);
      expect(result).toEqual({
        message: 'Transportista creado exitosamente',
        driver: mockDriver
      });
    });

    it('should propagate errors from repository', async () => {
      // Arrange
      const driverName = 'John Doe';
      const vehicleCapacity = 1000;
      const error = new Error('Database error');

      vi.mocked(driverRepository.createDriver).mockRejectedValue(error);

      // Act & Assert
      await expect(driverService.createDriver(driverName, vehicleCapacity))
        .rejects.toThrow('Database error');
    });
  });

  describe('getAllDrivers', () => {
    it('should return all drivers when no filter is provided', async () => {
      // Arrange
      const mockDrivers = [
        {
          id: 1,
          name: 'John Doe',
          vehicleCapacity: 1000,
          isAvailable: true,
          routes: [
            {
              id: 1,
              name: 'Route 1',      
              origin: 'A',
              destination: 'B',
              drivers: [],
              orders: []
            }
          ],
          orders: []
        },
        {
          id: 2,
          name: 'Jane Smith',
          vehicleCapacity: 1500,
          isAvailable: false,
          routes: [
            {
              id: 2,
              name: 'Route 2',       // Propiedad obligatoria en la entidad Route
              origin: 'C',
              destination: 'D',
              drivers: [],
              orders: []
            }
          ],
          orders: []
        }
      ];

      vi.mocked(driverRepository.getAllDrivers).mockResolvedValue(mockDrivers);

      // Act
      const result = await driverService.getAllDrivers();

      // Assert
      expect(driverRepository.getAllDrivers).toHaveBeenCalledWith(undefined);
      expect(result).toEqual({
        message: 'Lista de transportistas',
        drivers: [
          {
            id: 1,
            name: 'John Doe',
            vehicleCapacity: 1000,
            isAvailable: true,
            assignedRoutes: [
              { routeId: 1, origin: 'A', destination: 'B' }
            ]
          },
          {
            id: 2,
            name: 'Jane Smith',
            vehicleCapacity: 1500,
            isAvailable: false,
            assignedRoutes: [
              { routeId: 2, origin: 'C', destination: 'D' }
            ]
          }
        ]
      });
    });

    it('should filter drivers by availability', async () => {
      // Arrange
      const isAvailable = true;
      const mockDrivers = [
        {
          id: 1,
          name: 'John Doe',
          vehicleCapacity: 1000,
          isAvailable: true,
          routes: [],
          orders: []
        }
      ];

      vi.mocked(driverRepository.getAllDrivers).mockResolvedValue(mockDrivers);

      // Act
      const result = await driverService.getAllDrivers(isAvailable);

      // Assert
      expect(driverRepository.getAllDrivers).toHaveBeenCalledWith(isAvailable);
      expect(result).toEqual({
        message: 'Lista de transportistas',
        drivers: [
          {
            id: 1,
            name: 'John Doe',
            vehicleCapacity: 1000,
            isAvailable: true,
            assignedRoutes: []
          }
        ]
      });
    });

    it('should handle empty result', async () => {
      // Arrange
      vi.mocked(driverRepository.getAllDrivers).mockResolvedValue([]);

      // Act
      const result = await driverService.getAllDrivers();

      // Assert
      expect(result).toEqual({
        message: 'Lista de transportistas',
        drivers: []
      });
    });

    it('should propagate errors from repository', async () => {
      // Arrange
      const error = new Error('Database error');
      vi.mocked(driverRepository.getAllDrivers).mockRejectedValue(error);

      // Act & Assert
      await expect(driverService.getAllDrivers()).rejects.toThrow('Database error');
    });
  });
});
