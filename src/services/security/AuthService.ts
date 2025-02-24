import * as bcrypt from "bcryptjs";
import { sign, SignOptions } from "jsonwebtoken";
import { User } from "../../entities/User";
import { UserRepository } from "../../repositories/UserRepository";
import { RegisterUserDto } from '../../dtos/RegisterUserDto';
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

interface JWTPayload {
    userId: number;
    role: string;
}

export class AuthService {
    constructor(private userRepository: UserRepository) {}

    async register(registerData: RegisterUserDto) {
        const existingUser = await this.userRepository.findByEmail(registerData.email);
        if (existingUser) throw new Error("El correo ya está registrado");

        const role = registerData.role || "user";
        const validRoles = ["user", "admin"];
        if (!validRoles.includes(role)) {
            throw new Error(`Rol no válido: ${role}`);
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(registerData.password, saltRounds);

        const newUser = new User();
        newUser.username = registerData.username;
        newUser.email = registerData.email;
        newUser.passwordHash = passwordHash;
        newUser.role = role;

        const savedUser = await this.userRepository.createUser(newUser);
        return savedUser;
    }

    async login(email: string, password: string) {
        try {
            const user = await this.userRepository.findOne({
                where: { email },
                select: ['id', 'email', 'username', 'role', 'passwordHash'],
            });

            if (!user) {
                throw new Error("Credenciales inválidas");
            }

            if (!user.passwordHash) {
                throw new Error("Error en la base de datos: passwordHash no está definido");
            }

            const isValid = await bcrypt.compare(password, user.passwordHash);
            if (!isValid) {
                throw new Error("Credenciales inválidas");
            }

            const secretKey = process.env.JWT_SECRET;
            if (!secretKey) {
                throw new Error("JWT_SECRET no está definido en las variables de entorno.");
            }

            const payload: JWTPayload = {
                userId: user.id,
                role: user.role,
            };

            const expiresInEnv = process.env.JWT_EXPIRES_IN || '3600';
            const expiresIn = Number.isNaN(Number(expiresInEnv))
                ? expiresInEnv
                : Number(expiresInEnv);

            const token = sign(
                payload,
                secretKey,
                { expiresIn } as SignOptions
            );

            return {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                },
            };

        } catch (error) {
            console.error("Error en login:", error);
            throw error; 
        }
    }
}
