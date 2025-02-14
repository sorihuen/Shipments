// src/controller/AuthController.ts
import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { RegisterUserDto } from "../dtos/RegisterUserDto";
import { AuthService } from "../services/security/AuthService";
import { UserRepository } from "../repositories/UserRepository";

// Instancia de UserRepository
const userRepository = new UserRepository();

// Pasar la instancia de UserRepository al constructor de AuthService
const authService = new AuthService(userRepository);

export class AuthController {
  /**
   * Registro de un nuevo usuario.
   */
  static async register(req: Request, res: Response) {
    try {
      // Validar los datos del cuerpo de la solicitud
      const registerData = plainToInstance(RegisterUserDto, req.body);
      const errors = await validate(registerData);
  
      // Si hay errores de validación, devolver un error 400
      if (errors.length > 0) {
        return res.status(400).json({
          errors: errors.map(err => Object.values(err.constraints || {})).flat(),
        });
      }
  
      // Registrar el usuario usando el servicio AuthService
      const user = await authService.register(registerData);
  
      // Transformar el objeto user para incluir solo los campos necesarios
      const responseUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };
  
      // Devolver la respuesta con un mensaje y el usuario filtrado
      res.status(201).json({
        message: "Usuario registrado exitosamente",
        user: responseUser,
      });
    } catch (error) {
      // Manejar errores específicos
      if (error instanceof Error && error.message === "El correo ya está registrado") {
        return res.status(409).json({ error: "El correo ya está registrado" });
      }
  
      // Manejar otros errores inesperados
      res.status(500).json({
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }
  /**
   * Inicio de sesión de un usuario.
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Autenticar al usuario usando el servicio AuthService
      const result = await authService.login(email, password);

      // Devolver el resultado de la autenticación
      res.json(result);
    } catch (error) {
      // Manejar errores de autenticación
      res.status(401).json({
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }
}