import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
    BeforeUpdate,
    Index,
    OneToMany 
} from "typeorm";
import { IsEmail, Length, IsString } from "class-validator";
import { Order } from './Order';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn({ type: 'int' })
    id!: number;

    @Column({ type: 'varchar', length: 50 })
    @Length(3, 50, { message: 'El username debe tener entre 3 y 50 caracteres' })
    @IsString()
    username!: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    @Index()
    @IsEmail({}, { message: 'El email debe ser válido' })
    email!: string;

    @Column({ type: 'varchar', length: 255, select: false })
    passwordHash!: string;

    @Column({ type: 'varchar', length: 50 })
    role!: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt!: Date;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @Column({ type: 'timestamp', nullable: true })
    lastLoginAt?: Date;

    @OneToMany(() => Order, (order) => order.user)
    orders!: Order[];

    @BeforeInsert()
    @BeforeUpdate()
    async validateUser() {
        if (this.email) {
            this.email = this.email.toLowerCase();
        }
    }

    toJSON() {
        const { passwordHash, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }
}