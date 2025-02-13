import 'reflect-metadata'
import { Request, Response } from 'express';
import { AuthController } from '../../controller/AuthController';
import { AuthService } from '@services/security/AuthService';
import { UserRepository } from '@repositories/UserRepository';
import { RegisterUserDto } from '@dtos/RegisterUserDto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { User } from '@entities/User';

jest.mock('class-validator');
jest.mock('class-transformer');
jest.mock('@services/security/AuthService');
jest.mock('@repositories/UserRepository');

describe('AuthController', () => {
    let authController: typeof AuthController;
    let authService: jest.Mocked<AuthService>;
    let req: Request;
    let res: Response;

    beforeEach(() => {
        authService = new AuthService(new UserRepository()) as jest.Mocked<AuthService>;
        authController = AuthController;
        req = {
            body: {},
        } as Request;
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;
    });

    describe('register', () => {
        it('should register a new user and return 201 status', async () => {
            const registerData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                role: 'user',
            };

            req.body = registerData;
            (plainToInstance as jest.Mock).mockReturnValue(registerData);
            (validate as jest.Mock).mockResolvedValue([]);

            // Mock que coincide con la estructura de User
            authService.register.mockResolvedValue({
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                role: 'user',
                passwordHash: 'hashedPassword',
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
            } as User);

            await authController.register(req, res);

            expect(plainToInstance).toHaveBeenCalledWith(RegisterUserDto, registerData);
            expect(validate).toHaveBeenCalledWith(registerData);
            expect(authService.register).toHaveBeenCalledWith(registerData);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                role: 'user',
                passwordHash: 'hashedPassword',
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
                isActive: true,
            });
        });

        it('should return 400 status if validation fails', async () => {
            const registerData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                role: 'user',
            };

            req.body = registerData;
            (plainToInstance as jest.Mock).mockReturnValue(registerData);
            (validate as jest.Mock).mockResolvedValue([{ constraints: { isEmail: 'Invalid email' } }]);

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ errors: ['Invalid email'] });
        });
    });
});