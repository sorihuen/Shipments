// src/entities/Order.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Route } from './Route';
import { Driver } from './Drive';


export enum OrderStatus {
    EN_ESPERA = 'En espera',
    EN_TRANSITO = 'En tránsito',
    ENTREGADO = 'Entregado',
}

@Entity()
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Relación ManyToOne con User (quien crea la orden)
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

    // Datos del destinatario
    @Column({ type: 'varchar', length: 255, nullable: false })
    recipientName: string; // Nombre del destinatario

    @Column({ type: 'varchar', length: 20, nullable: false })
    recipientPhone: string; // Teléfono del destinatario

    @Column({ type: 'varchar', length: 255, nullable: false })
    recipientEmail: string; // Email del destinatario

    // Datos del remitente externo (opcionales)
    @Column({ type: 'varchar', length: 255, nullable: true })
    senderName?: string; // Nombre del remitente externo

    @Column({ type: 'varchar', length: 20, nullable: true })
    senderPhone?: string; // Teléfono del remitente externo

    @Column({ type: 'varchar', length: 255, nullable: true })
    senderEmail?: string; // Email del remitente externo

    // Estado de la orden
    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.EN_ESPERA })
    status: OrderStatus;

    // Timestamps
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    assignedAt?: Date;
}