// src/services/RouteService.ts
import { RouteRepository } from '../repositories/RouteRepository';

export class RouteService {
    private routeRepository: RouteRepository;

    constructor(routeRepository: RouteRepository) {
        this.routeRepository = routeRepository;
    }

    /**
     * Crea una nueva ruta.
     * @param name - Nombre de la ruta (ej. "Bogotá-Cali").
     * @param origin - Dirección de origen.
     * @param destination - Dirección de destino.
     * @returns Un mensaje indicando que la ruta fue creada exitosamente.
     */
    async createRoute(name: string, origin: string, destination: string): Promise<any> {
        const route = await this.routeRepository.createRoute(name, origin, destination);
        return {
            message: 'Ruta creada exitosamente',
            route,
        };
    }

    /**
     * Obtiene todas las rutas disponibles.
     * @returns Lista de todas las rutas.
     */
    async getAllRoutes(): Promise<any> {
        const routes = await this.routeRepository.getAllRoutes();
        return {
            message: 'Lista de rutas',
            routes,
        };
    }

    /**
     * Obtiene una ruta específica por su ID.
     * @param routeId - ID de la ruta.
     * @returns La ruta encontrada.
     */
    async getRouteById(routeId: number): Promise<any> {
        const route = await this.routeRepository.findOneOrFail(routeId);
        return {
            message: 'Ruta encontrada',
            route,
        };
    }

    /**
     * Asigna un transportista a una ruta específica.
     * @param routeId - ID de la ruta.
     * @param driverId - ID del transportista.
     * @returns Un mensaje indicando que el transportista fue asignado exitosamente.
     */
    async addDriverToRoute(routeId: number, driverId: number): Promise<any> {
        await this.routeRepository.addDriverToRoute(routeId, driverId);
        return {
            message: 'Transportista agregado a la ruta exitosamente',
        };
    }

    /**
     * Elimina una ruta específica por su ID.
     * @param routeId - ID de la ruta.
     * @returns Un mensaje indicando que la ruta fue eliminada exitosamente.
     */
    async deleteRoute(routeId: number): Promise<any> {
        await this.routeRepository.deleteRoute(routeId);
        return {
            message: 'Ruta eliminada exitosamente',
        };
    }
}