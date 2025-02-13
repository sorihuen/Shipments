// src/controller/AuthController.ts
import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { RegisterUserDto } from "@dtos/RegisterUserDto";
import { AuthService } from "@services/security/AuthService";
import { UserRepository } from "@repositories/UserRepository";

//instancia de UserRepository
const userRepository = new UserRepository();

// Pasar la instancia de UserRepository al constructor de AuthService
const authService = new AuthService(userRepository);

export class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const registerData = plainToInstance(RegisterUserDto, req.body);
            const errors = await validate(registerData);
            if (errors.length > 0) {
                return res.status(400).json({ errors: errors.map(err => Object.values(err.constraints!)).flat() });
            }
            const user = await authService.register(registerData);
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ error: error instanceof Error ? error.message : "Error desconocido" });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            res.json(result);
        } catch (error) {
            res.status(401).json({ error: error instanceof Error ? error.message : "Error desconocido" });
        }
    }
}

