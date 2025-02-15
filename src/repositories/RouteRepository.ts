// src/repositories/RouteRepository.ts
import { AppDataSource } from "../Config/data-source";
import { Route } from '../entities/Route';
import { Driver } from '../entities/Drive';

export class RouteRepository {
    private routeRepository = AppDataSource.getRepository(Route);

    /**
     * Crea una nueva ruta en la base de datos.
     * @param name - Nombre de la ruta (ej. "Bogotá-Cali").
     * @param origin - Dirección de origen.
     * @param destination - Dirección de destino.
     * @returns La ruta creada.
     */
    async createRoute(name: string, origin: string, destination: string): Promise<Route> {
        const newRoute = this.routeRepository.create({
            name,
            origin,
            destination,
        });
        return await this.routeRepository.save(newRoute);
    }

    /**
     * Busca una ruta por su ID.
     * @param routeId - ID de la ruta.
     * @returns La ruta encontrada.
     * @throws Error si la ruta no existe.
     */
    async findOneOrFail(routeId: number) {
        return await this.routeRepository.findOneOrFail({
            where: { id: routeId },
            relations: ['drivers'], // Carga los transportistas asignados a la ruta
        });
    }

    /**
     * Asigna un transportista a una ruta específica.
     * @param routeId - ID de la ruta.
     * @param driverId - ID del transportista.
     */
    async addDriverToRoute(routeId: number, driverId: number): Promise<void> {
        // Busca la ruta y carga los transportistas asignados
        const route = await this.routeRepository.findOneOrFail({
            where: { id: routeId },
            relations: ['drivers'], // Carga los transportistas asignados a la ruta
        });

        // Busca el transportista
        const driver = await AppDataSource.getRepository(Driver).findOneOrFail({
            where: { id: driverId },
        });

        // Verifica si el transportista ya está asignado a la ruta
        if (!route.drivers.some((d) => d.id === driver.id)) {
            route.drivers.push(driver); // Agrega el transportista a la lista
            await this.routeRepository.save(route); // Guarda los cambios en la ruta
        }

        // Actualiza la disponibilidad del transportista a false (no disponible)
        await AppDataSource.getRepository(Driver).update(driverId, { isAvailable: false });
    }

    /**
     * Obtiene todas las rutas disponibles.
     * @returns Lista de todas las rutas.
     */
    async getAllRoutes(): Promise<Route[]> {
        return await this.routeRepository.find();
    }

    /**
     * Elimina una ruta específica por su ID.
     * @param routeId - ID de la ruta.
     */
    async deleteRoute(routeId: number): Promise<void> {
        await this.routeRepository.delete(routeId);
    }
}