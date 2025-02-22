import { DriverRepository } from "../repositories/DriverRepository";
import { AppDataSource } from "../Config/data-source";
import { In } from "typeorm";
import { Route } from "../entities/Route";
import { Driver } from "../entities/Drive";
import { Order } from "../entities/Order";
import { OrderStatus } from "../entities/Order";


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
    const driver = await this.driverRepository.createDriver(
      name,
      vehicleCapacity
    );
    return {
      message: "Transportista creado exitosamente",
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

    const formattedDrivers = drivers.map((driver) => ({
      id: driver.id,
      name: driver.name,
      vehicleCapacity: driver.vehicleCapacity,
      isAvailable: driver.isAvailable,
      assignedWeight: driver.assignedWeight, // Se incluye el campo de peso asignado
      assignedRoutes: driver.routes.map((route: Route) => ({
        routeId: route.id,
        origin: route.origin,
        destination: route.destination,
      })),
    }));

    return {
      message: "Lista de transportistas",
      drivers: formattedDrivers,
    };
  }

  /**
   * Obtiene las métricas de desempeño de TODOS los drivers en un rango de fechas.
   * Se formatea el tiempo promedio de entrega en formato HH:MM:SS.
   */
  async getPerformanceMetrics(startDate: Date, endDate: Date) {
    const rawMetrics = await this.driverRepository.getDriverPerformanceMetrics(
      startDate,
      endDate
    );
    const formattedMetrics = rawMetrics.map((m: any) => {
      const avgTimeInSeconds = parseFloat(m.avgDeliveryTime) || 0;
      return {
        driverId: m.driverId,
        avgDeliveryTime: avgTimeInSeconds.toFixed(2),
        formattedAvgDeliveryTime: this.formatTime(avgTimeInSeconds),
        completedShipments: parseInt(m.completedShipments, 10),
        totalOrders: parseInt(m.totalOrders, 10),
      };
    });
    return formattedMetrics;
  }

  /**
   * Obtiene las métricas de desempeño de un driver específico en un rango de fechas.
   * Se verifica que el driver exista. Si no existe, se lanza un error.
   * Si el driver existe pero no ha recibido órdenes, se devuelve un objeto informativo.
   */
  async getPerformanceMetricsByDriver(
    driverId: number,
    startDate: Date,
    endDate: Date
  ) {
    // Verificar que el driver exista
    const driver = await this.driverRepository.getDriverById(driverId);
    if (!driver) {
      throw new Error(`Driver con id ${driverId} no existe.`);
    }

    const rawMetrics =
      await this.driverRepository.getDriverPerformanceMetricsById(
        driverId,
        startDate,
        endDate
      );
    if (!rawMetrics) {
      return {
        driverId,
        avgDeliveryTime: "0.00",
        formattedAvgDeliveryTime: "00:00:00",
        completedShipments: 0,
        totalOrders: 0,
        message:
          "No se han recibido órdenes para este driver en el período especificado.",
      };
    }
    const avgTimeInSeconds = parseFloat(rawMetrics.avgDeliveryTime) || 0;
    return {
      driverId: rawMetrics.driverId,
      avgDeliveryTime: avgTimeInSeconds.toFixed(2),
      formattedAvgDeliveryTime: this.formatTime(avgTimeInSeconds),
      completedShipments: parseInt(rawMetrics.completedShipments, 10),
      totalOrders: parseInt(rawMetrics.totalOrders, 10),
    };
  }

  /**
   * Convierte segundos a formato HH:MM:SS.
   * @param seconds - Tiempo en segundos.
   * @returns Tiempo formateado en HH:MM:SS.
   */
  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  /**
   * Verifica si un conductor ha entregado todas sus órdenes y actualiza su estado a disponible.
   * @param driverId - ID del conductor a verificar.
   * @returns Objeto con el resultado de la operación.
   */
  async updateDriverAvailability(driverId: number): Promise<{
    success: boolean;
    message: string;
    driver?: Driver;
  }> {
    try {
      const driverRepository = AppDataSource.getRepository(Driver);
      const orderRepository = AppDataSource.getRepository(Order);
  
      // Buscar el conductor por ID
      const driver = await driverRepository.findOne({
        where: { id: driverId },
        relations: ["orders"],
      });
  
      if (!driver) {
        return {
          success: false,
          message: `No se encontró conductor con ID ${driverId}`,
        };
      }
  
      // Buscar órdenes pendientes o en tránsito del conductor
      const activeOrders = await orderRepository.count({
        where: {
          driver: { id: driverId },
          status: In([OrderStatus.EN_ESPERA, OrderStatus.EN_TRANSITO]), // Usa el método In
        },
      });
  
      // Si no hay órdenes activas y el peso asignado es 0, actualizar a disponible
      if (activeOrders === 0 && driver.assignedWeight === 0) {
        driver.isAvailable = true;
        await driverRepository.save(driver);
        return {
          success: true,
          message: "Conductor actualizado a disponible correctamente",
          driver,
        };
      } else if (activeOrders > 0) {
        return {
          success: false,
          message: `El conductor aún tiene ${activeOrders} órdenes activas`,
          driver,
        };
      } else if (driver.assignedWeight > 0) {
        return {
          success: false,
          message: `El conductor aún tiene peso asignado: ${driver.assignedWeight} kg`,
          driver,
        };
      } else if (driver.isAvailable) {
        return {
          success: true,
          message: "El conductor ya está disponible",
          driver,
        };
      }
  
      return {
        success: false,
        message: "No se pudo actualizar el estado del conductor",
        driver,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al actualizar disponibilidad: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      };
    }
  }

}
