import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../../services/security/AuthService';
import { UserRepository } from '../../repositories/UserRepository';
import { User } from '../../entities/User';
import bcrypt from 'bcrypt';
import 'reflect-metadata';

// Mock para bcrypt
vi.mock('bcrypt', () => ({
    hash: vi.fn(() => Promise.resolve('hashedPassword')), // Simula el resultado de hash
    compare: vi.fn((password, hash) => Promise.resolve(password === 'password123' && hash === 'hashedPassword')), // Simula el resultado de compare
  }));
  
  // Mock para UserRepository
  vi.mock('../../repositories/UserRepository');
  
  describe('AuthService', () => {
    let authService: AuthService;
    let userRepository: jest.Mocked<UserRepository>;
    let mockUser: User;
  
    beforeEach(async () => {
      // Crear mock user antes de cada test
      mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedPassword', // Usar el valor simulado
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        orders: [],
        validateUser: vi.fn().mockResolvedValue(undefined),
        toJSON: vi.fn().mockReturnValue({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'user',
        }),
      } as User;
  
      // Crear un mock completo del repositorio
      userRepository = new UserRepository() as jest.Mocked<UserRepository>;
  
      // Instancia del servicio con el repositorio mockeado
      authService = new AuthService(userRepository);
  
      // Limpiar mocks entre pruebas
      vi.clearAllMocks();
    });
  
    describe('register', () => {
      it('should register a new user', async () => {
        const registerData = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          role: 'user',
        };
  
        // Configurar el comportamiento del repositorio
        userRepository.findByEmail.mockResolvedValue(null); // Simula que el email no existe
        userRepository.createUser.mockResolvedValue(mockUser); // Simula la creación del usuario
  
        // Ejecutar el método
        const result = await authService.register(registerData);
  
        // Verificar el comportamiento
        expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
        expect(userRepository.createUser).toHaveBeenCalledWith(expect.objectContaining({
          username: 'testuser',
          email: 'test@example.com',
          role: 'user',
        }));
        expect(result).toEqual(expect.objectContaining({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'user',
        }));
      });
  
      it('should throw if email exists', async () => {
        userRepository.findByEmail.mockResolvedValue(mockUser); // Simula que el email ya existe
  
        await expect(
          authService.register({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            role: 'user',
          })
        ).rejects.toThrow('El correo ya está registrado');
      });
    });
  
    describe('login', () => {
      it('should login successfully', async () => {
        const credentials = {
          email: 'test@example.com',
          password: 'password123',
        };
  
        // Configurar el comportamiento del repositorio
        userRepository.findOne.mockResolvedValue(mockUser); // Simula que el usuario existe
  
        // Ejecutar el método
        const result = await authService.login(credentials.email, credentials.password);
  
        // Verificar el comportamiento
        expect(result).toEqual({
          token: expect.any(String), // El token debe ser una cadena
          user: expect.objectContaining({
            id: mockUser.id,
            email: mockUser.email,
            username: mockUser.username,
            role: mockUser.role,
          }),
        });
      });
  
      it('should throw on invalid credentials', async () => {
        userRepository.findOne.mockResolvedValue(null); // Simula que el usuario no existe
  
        await expect(
          authService.login('test@example.com', 'wrongPassword')
        ).rejects.toThrow('Credenciales inválidas');
      });
    });
  });