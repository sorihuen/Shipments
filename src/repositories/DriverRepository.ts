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

    /**
     * Actualiza la disponibilidad de un transportista.
     * @param driverId - ID del transportista.
     * @param isAvailable - Nuevo estado de disponibilidad.
     */
    async updateAvailability(driverId: number, isAvailable: boolean): Promise<void> {
        await this.driverRepository.update(driverId, { isAvailable });
    }
}