// src/services/DriverService.ts
import { DriverRepository } from '../repositories/DriverRepository';

export class DriverService {
    private driverRepository: DriverRepository;

    constructor(driverRepository: DriverRepository) {
        this.driverRepository = driverRepository;
    }

    /**
     * Actualiza la disponibilidad de un transportista.
     * @param driverId - ID del transportista.
     * @param isAvailable - Nuevo estado de disponibilidad.
     * @returns Un mensaje indicando el resultado de la operación.
     */
    async updateDriverAvailability(driverId: number, isAvailable: boolean): Promise<any> {
        await this.driverRepository.updateAvailability(driverId, isAvailable);
        return {
            message: `Disponibilidad del transportista actualizada a ${isAvailable ? 'disponible' : 'no disponible'}`,
        };
    }
}