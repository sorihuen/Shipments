// User.ts
import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
    BeforeUpdate,
    Index
} from "typeorm";
import { IsEmail, Length, IsString } from "class-validator";

@Entity('users') // Mejor práctica usar plural para nombres de tablas
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 50 })
    @Length(3, 50, { message: 'El username debe tener entre 3 y 50 caracteres' })
    @IsString()
    username!: string;

    @Column({ length: 100, unique: true })
    @Index()
    @IsEmail({}, { message: 'El email debe ser válido' })
    email!: string;

    @Column({ length: 255, select: false }) // No seleccionar por defecto en consultas
    passwordHash!: string;

    @Column({ 
        length: 50
    })
    role!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ default: true })
    isActive!: boolean;

    @Column({ nullable: true })
    lastLoginAt?: Date;

    // Hooks
    @BeforeInsert()
    @BeforeUpdate()
    async validateUser() {
        // Aquí puedes añadir validaciones personalizadas
        if (this.email) {
            this.email = this.email.toLowerCase();
        }
    }

    // Método para ocultar campos sensibles
    toJSON() {
        const { passwordHash, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }
}