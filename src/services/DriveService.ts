// src/services/DriverService.ts
import { DriverRepository } from '../repositories/DriverRepository';
import { Route } from '../entities/Route';

export class DriverService {
    private driverRepository: DriverRepository;

    constructor(driverRepository: DriverRepository) {
        this.driverRepository = driverRepository;
    }
    /**
     * Crea un nuevo transportista.
     * @param name - Nombre del transportista.
     * @param vehicleCapacity - Capacidad máxima del vehículo (en kg).
     * @returns Un mensaje indicando que el transportista fue creado exitosamente.
     */
    async createDriver(name: string, vehicleCapacity: number): Promise<any> {
        const driver = await this.driverRepository.createDriver(name, vehicleCapacity);
        return {
            message: 'Transportista creado exitosamente',
            driver,
        };
    }
      /**
     * Lista todos los transportistas con información de sus rutas asignadas.
     * @param isAvailable - Filtro opcional para listar transportistas disponibles o no disponibles.
     * @returns Lista de transportistas con información de disponibilidad y rutas asignadas.
     */
    async getAllDrivers(isAvailable?: boolean): Promise<any> {
        const drivers = await this.driverRepository.getAllDrivers(isAvailable);

        // Transformar los datos para incluir solo la información relevante
        const formattedDrivers = drivers.map((driver) => ({
            id: driver.id,
            name: driver.name,
            vehicleCapacity: driver.vehicleCapacity,
            isAvailable: driver.isAvailable,
            assignedRoutes: driver.routes.map((route: Route) => ({
                routeId: route.id,
                origin: route.origin,
                destination: route.destination,
            })),
        }));

        return {
            message: 'Lista de transportistas',
            drivers: formattedDrivers,
        };
    }

}