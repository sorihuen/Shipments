// src/repositories/DriverRepository.ts
import { AppDataSource } from "../Config/data-source";
import { Driver } from "../entities/Drive";
import {Order} from "../entities/Order"

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
        relations: ["routes"], // Carga las rutas asignadas a cada transportista
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
  /**
   * Guarda un transportista en la base de datos.
   * @param driver - El transportista a guardar.
   * @returns El transportista guardado.
   */
  async save(driver: Driver): Promise<Driver> {
    return await this.driverRepository.save(driver);
  }
  /**
   * Busca un transportista por condiciones específicas.
   */
  async findOneBy(options: any): Promise<Driver | null> {
    return await this.driverRepository.findOneBy(options);
  }

   /**
   * Verificar si existe el Driver.
   */
  async getDriverById(driverId: number): Promise<Driver | null> {
    return await this.driverRepository.findOneBy({ id: driverId });
  }
  

  /**
   * Obtiene las métricas de desempeño para un driver específico en un rango de fechas.
   * Se cuentan todas las órdenes (totalOrders) y se filtra para las completadas (deliveredAt no nulo)
   * para calcular el promedio de tiempo y los envíos completados.
   */
  async getDriverPerformanceMetricsById(
    driverId: number,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    const metrics = await AppDataSource.getRepository(Order)
      .createQueryBuilder("order")
      .select("order.driverId", "driverId")
      // Calcula el promedio en segundos solo para órdenes entregadas.
      .addSelect(
        "AVG(EXTRACT(EPOCH FROM (order.deliveredAt - order.assignedAt))) FILTER (WHERE order.deliveredAt IS NOT NULL)",
        "avgDeliveryTime"
      )
      // Cuenta las órdenes completadas (entregadas).
      .addSelect(
        "COUNT(order.id) FILTER (WHERE order.deliveredAt IS NOT NULL)",
        "completedShipments"
      )
      // Cuenta el total de órdenes recibidas en el período.
      .addSelect("COUNT(order.id)", "totalOrders")
      .where("order.driverId = :driverId", { driverId })
      .andWhere("order.createdAt BETWEEN :startDate AND :adjustedEndDate", {
        startDate: startDate.toISOString(),
        adjustedEndDate: adjustedEndDate.toISOString(),
      })
      .groupBy("order.driverId")
      .getRawOne();

    return metrics;
  }

  /**
   * Obtiene las métricas de desempeño para TODOS los drivers en un rango de fechas.
   */
  async getDriverPerformanceMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    const metrics = await AppDataSource.getRepository(Order)
      .createQueryBuilder("order")
      .select("order.driverId", "driverId")
      .addSelect(
        "AVG(EXTRACT(EPOCH FROM (order.deliveredAt - order.assignedAt))) FILTER (WHERE order.deliveredAt IS NOT NULL)",
        "avgDeliveryTime"
      )
      .addSelect(
        "COUNT(order.id) FILTER (WHERE order.deliveredAt IS NOT NULL)",
        "completedShipments"
      )
      .addSelect("COUNT(order.id)", "totalOrders")
      .where("order.createdAt BETWEEN :startDate AND :adjustedEndDate", {
        startDate: startDate.toISOString(),
        adjustedEndDate: adjustedEndDate.toISOString(),
      })
      .groupBy("order.driverId")
      .getRawMany();

    return metrics;
  }
  
  
}
