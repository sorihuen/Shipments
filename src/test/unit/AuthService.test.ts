import 'reflect-metadata'
import { AuthService } from '@services/security/AuthService';
import { UserRepository } from '@repositories/UserRepository';
import { User } from '@entities/User';
import * as bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('@repositories/UserRepository');

describe('AuthService', () => {
    let authService: AuthService;
    let userRepository: jest.Mocked<UserRepository>;

    beforeEach(() => {
        userRepository = new UserRepository() as jest.Mocked<UserRepository>;
        authService = new AuthService(userRepository);
        jest.clearAllMocks();
    });

    const createMockUser = (override = {}) => {
        const user = new User();
        Object.assign(user, {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            passwordHash: 'hashedPassword',
            role: 'user',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...override
        });
        return user;
    };

    describe('register', () => {
        it('should register a new user', async () => {
            const registerData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                role: 'user',
            };

            const mockUser = createMockUser();

            userRepository.findByEmail.mockResolvedValue(null);
            userRepository.createUser.mockResolvedValue(mockUser);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

            const result = await authService.register(registerData);

            expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(userRepository.createUser).toHaveBeenCalledWith(expect.objectContaining({
                username: 'testuser',
                email: 'test@example.com',
                role: 'user'
            }));
            expect(result).toEqual(expect.objectContaining({
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                role: 'user'
            }));
        });

        it('should throw an error if email is already registered', async () => {
            const registerData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                role: 'user',
            };

            userRepository.findByEmail.mockResolvedValue(createMockUser());

            await expect(authService.register(registerData))
                .rejects.toThrow('El correo ya está registrado');
        });
    });

    describe('login', () => {
        beforeEach(() => {
            process.env.JWT_SECRET = 'secret';
            process.env.JWT_EXPIRES_IN = '3600';
        });

        it('should login a user and return a token', async () => {
            const mockUser = createMockUser();
            const loginCredentials = {
                email: 'test@example.com',
                password: 'password123'
            };

            userRepository.findOne.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (sign as jest.Mock).mockReturnValue('fakeToken');

            const result = await authService.login(loginCredentials.email, loginCredentials.password);

            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { email: loginCredentials.email },
                select: ['id', 'email', 'username', 'role', 'passwordHash']
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(
                loginCredentials.password,
                mockUser.passwordHash
            );
            expect(sign).toHaveBeenCalledWith(
                { userId: mockUser.id, role: mockUser.role },
                'secret',
                { expiresIn: 3600 }
            );
            expect(result).toEqual({
                token: 'fakeToken',
                user: expect.objectContaining({
                    id: mockUser.id,
                    email: mockUser.email,
                    username: mockUser.username,
                    role: mockUser.role
                })
            });
        });

        it('should throw an error if user is not found', async () => {
            const loginCredentials = {
                email: 'test@example.com',
                password: 'password123'
            };

            userRepository.findOne.mockResolvedValue(null);

            await expect(authService.login(loginCredentials.email, loginCredentials.password))
                .rejects.toThrow('Credenciales inválidas');
        });

        it('should throw an error if password is incorrect', async () => {
            const mockUser = createMockUser();
            const loginCredentials = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            userRepository.findOne.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(authService.login(loginCredentials.email, loginCredentials.password))
                .rejects.toThrow('Credenciales inválidas');
        });
    });
});
