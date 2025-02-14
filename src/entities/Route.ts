// src/entities/Route.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from 'typeorm';
import { Driver } from './Drive'; // Asegúrate de que el nombre del archivo sea correcto
import { Order } from './Order'; // Asegúrate de que el nombre del archivo sea correcto

@Entity()
export class Route {
    @PrimaryGeneratedColumn() // ID autoincremental
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false }) // Nombre de la ruta
    name: string;

    @Column({ type: 'varchar', length: 255, nullable: false }) // Dirección de origen
    origin: string;

    @Column({ type: 'varchar', length: 255, nullable: false }) // Dirección de destino
    destination: string;

    // Relación muchos a muchos con Driver
    @ManyToMany(() => Driver, (driver) => driver.routes)
    drivers: Driver[];

    // Relación uno a muchos con Order
    @OneToMany(() => Order, (order: Order) => order.route) // Especifica explícitamente el tipo
    orders: Order[];
}