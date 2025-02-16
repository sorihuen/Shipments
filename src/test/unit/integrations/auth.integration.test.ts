import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthController } from '../../../controller/AuthController';
import { Request, Response } from 'express';


// Mock completo de class-validator con todos los decoradores que usas
vi.mock('class-validator', async () => {
    return {
        validate: vi.fn().mockResolvedValue([]),
        // Todos los decoradores que usas en RegisterUserDto y User
        IsString: () => vi.fn(),
        IsEmail: () => vi.fn(),
        MinLength: () => vi.fn(),
        MaxLength: () => vi.fn(),
        Length: () => vi.fn(),
        IsIn: () => vi.fn(),
        IsOptional: () => vi.fn()
    };
});

// Mock para AuthService
vi.mock('../../../services/security/AuthService', () => {
    return {
        AuthService: vi.fn().mockImplementation(() => ({
            register: vi.fn().mockResolvedValue({
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                role: 'user',
            }),
            login: vi.fn().mockImplementation(async (email, password) => {
                if (email === 'test@example.com' && password === 'password123') {
                    return {
                        token: 'mockedToken',
                        user: {
                            id: 1,
                            email: 'test@example.com',
                            username: 'testuser',
                            role: 'user',
                        },
                    };
                }
                throw new Error('Credenciales inválidas');
            }),
        })),
    };
});

describe('AuthController Integration Test', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        // Mock de la solicitud y respuesta
        req = { body: {} };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };

        // Limpiar mocks entre pruebas
        vi.clearAllMocks();
    });

    describe('POST /register', () => {
        it('should register a new user successfully', async () => {
            const registerData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                role: 'user',
            };

            // Simular datos de entrada
            req.body = registerData;

            // Ejecutar el método estático del controlador
            await AuthController.register(req as Request, res as Response);

            // Verificar la respuesta
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Usuario registrado exitosamente',
                user: expect.objectContaining({
                    id: 1,
                    username: 'testuser',
                    email: 'test@example.com',
                    role: 'user',
                }),
            });
        });

        it('should return 400 if validation fails', async () => {
            const invalidData = {
                username: 'te',
                email: 'invalid-email',
                password: '123',
                role: 'invalid-role',
            };

            // Simular datos de entrada
            req.body = invalidData;

            // Simular errores de validación
            const { validate } = await import('class-validator');
            vi.mocked(validate).mockResolvedValueOnce([
                {
                    property: 'username',
                    constraints: {
                        minLength: 'El nombre de usuario debe tener al menos 3 caracteres',
                    },
                },
                {
                    property: 'email',
                    constraints: {
                        isEmail: 'El correo electrónico no es válido',
                    },
                },
                {
                    property: 'password',
                    constraints: {
                        isString: 'La contraseña debe ser texto',
                    },
                },
                {
                    property: 'role',
                    constraints: {
                        isIn: 'El rol debe ser "user" o "admin"',
                    },
                },
            ]);

            // Ejecutar el método estático del controlador
            await AuthController.register(req as Request, res as Response);

            // Verificar la respuesta
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                errors: [
                    'El nombre de usuario debe tener al menos 3 caracteres',
                    'El correo electrónico no es válido',
                    'La contraseña debe ser texto',
                    'El rol debe ser "user" o "admin"',
                ],
            });
        });
    });

    describe('POST /login', () => {
        it('should login successfully', async () => {
            const credentials = {
                email: 'test@example.com',
                password: 'password123',
            };

            // Simular datos de entrada
            req.body = credentials;

            // Ejecutar el método estático del controlador
            await AuthController.login(req as Request, res as Response);

            // Verificar la respuesta
            expect(res.json).toHaveBeenCalledWith({
                token: 'mockedToken',
                user: expect.objectContaining({
                    id: 1,
                    email: 'test@example.com',
                    username: 'testuser',
                    role: 'user',
                }),
            });
        });

        it('should return 401 on invalid credentials', async () => {
            const invalidCredentials = {
                email: 'test@example.com',
                password: 'wrongPassword',
            };

            // Simular datos de entrada
            req.body = invalidCredentials;

            // Ejecutar el método estático del controlador
            await AuthController.login(req as Request, res as Response);

            // Verificar la respuesta
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Credenciales inválidas',
            });
        });
    });
});