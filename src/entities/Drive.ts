// src/entities/Driver.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Route } from './Route';
import { Order } from './Order';
@Entity()
export class Driver {
    @PrimaryGeneratedColumn() // ID autoincremental
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false }) // Nombre del transportista
    name: string;

    @Column({ type: 'float', nullable: false }) // Capacidad máxima del vehículo (en kg)
    vehicleCapacity: number;

    @Column({ type: 'boolean', default: true }) // Disponibilidad del transportista
    isAvailable: boolean;

    @Column({ type: "float", nullable: false, default: 0 }) // Peso total asignado
    assignedWeight: number;

    // Relación muchos a muchos con Route
    @ManyToMany(() => Route, (route) => route.drivers)
    routes: Route[];

    // Relación uno a muchos con Order
    @OneToMany(() => Order, (order: Order) => order.driver) // Especifica explícitamente el tipo
    orders: Order[];
}