// src/repositories/DriverRepository.ts
import { AppDataSource } from "../Config/data-source";
import { Driver } from '../entities/Drive';

export class DriverRepository {
    private driverRepository = AppDataSource.getRepository(Driver);

    /**
     * Busca un transportista por su ID.
     * @param driverId - ID del transportista.
     * @returns El transportista encontrado.
     * @throws Error si el transportista no existe.
     */
    async findOneOrFail(driverId: number) {
        return await this.driverRepository.findOneOrFail({
            where: { id: driverId },
        });
    }
    /**
     * Crea un nuevo transportista.
     * @param name - Nombre del transportista.
     * @param vehicleCapacity - Capacidad máxima del vehículo (en kg).
     * @returns El transportista creado.
     */
    async createDriver(name: string, vehicleCapacity: number): Promise<Driver> {
        const newDriver = this.driverRepository.create({
            name,
            vehicleCapacity,
            isAvailable: true, // Por defecto, el transportista está disponible
        });
        return await this.driverRepository.save(newDriver);
    }
    /**
     * Lista todos los transportistas con sus rutas asignadas.
     * @param isAvailable - Filtro opcional para listar transportistas disponibles o no disponibles.
     * @returns Lista de transportistas filtrados.
     */
    async getAllDrivers(isAvailable?: boolean): Promise<Driver[]> {
        const queryOptions: any = {
            relations: ['routes'], // Carga las rutas asignadas a cada transportista
        };

        if (isAvailable !== undefined) {
            queryOptions.where = { isAvailable }; // Filtra por disponibilidad si se proporciona
        }

        return await this.driverRepository.find(queryOptions);
    }
    /**
     * Verifica si un transportista está disponible.
     * @param driverId - ID del transportista.
     * @returns `true` si el transportista está disponible, `false` en caso contrario.
     */
    async isDriverAvailable(driverId: number): Promise<boolean> {
        const driver = await this.driverRepository.findOneOrFail({
            where: { id: driverId },
        });
        return driver.isAvailable;
    }


}