// src/entities/Order.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Route } from './Route';
import { Driver } from './Drive'; // Asegúrate de que el nombre del archivo sea correcto

@Entity()
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Relación ManyToOne con User
    @ManyToOne(() => User, (user) => user.orders)
    user: User;

    // Relación ManyToOne con Route
    @ManyToOne(() => Route, (route) => route.orders, { nullable: true })
    route: Route;

    // Relación ManyToOne con Driver
    @ManyToOne(() => Driver, (driver) => driver.orders, { nullable: true })
    driver: Driver;

    // Datos del paquete
    @Column({ type: 'float', nullable: false })
    weight: number; // Peso del paquete en kg

    @Column({ type: 'jsonb', nullable: false })
    dimensions: { length: number; width: number; height: number }; // Dimensiones en cm

    @Column({ type: 'varchar', length: 255, nullable: false })
    productType: string; // Tipo de producto (ej. electrónico, ropa, etc.)

    // Dirección de destino
    @Column({ type: 'varchar', length: 255, nullable: false })
    destinationAddress: string;

    // Dirección de retorno
    @Column({ type: 'varchar', length: 255, nullable: false })
    returnAddress: string;

    // Estado de la orden
    @Column({ type: 'varchar', length: 50, default: 'En espera' })
    status: string;

    // Timestamps
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}