import { Request, Response } from 'express';
import { AuthController } from '../../controller/AuthController';
import { RegisterUserDto } from '../../dtos/RegisterUserDto';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { validate } from 'class-validator';
import { AuthService } from '../../services/security/AuthService';
import { UserRepository } from '../../repositories/UserRepository';

// Mock de class-validator
vi.mock('class-validator', async (importOriginal) => {
  const actual = await importOriginal();
  if (typeof actual === 'object' && actual !== null) {
    return {
      ...actual,
      validate: vi.fn().mockResolvedValue([]),
    };
  }
  throw new Error('Imported module is not an object');
});

// Mock de class-transformer
vi.mock('class-transformer', () => ({
  plainToInstance: vi.fn((dto, data) => {
    const instance = new RegisterUserDto();
    Object.assign(instance, data);
    return instance;
  }),
}));

// Mock del UserRepository
const mockUserRepository = {
  findByEmail: vi.fn(),
  createUser: vi.fn(),
  findOne: vi.fn(),
} as unknown as UserRepository;

// Mock del AuthService
vi.mock('../../services/security/AuthService', () => {
  return {
    AuthService: vi.fn().mockImplementation((userRepository) => ({
      register: vi.fn().mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
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
      }),
    })),
  };
});

// Mock de bcrypt
vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashedPassword'),
  compare: vi.fn().mockResolvedValue(true),
}));

describe('AuthController', () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = { body: {} } as Request;
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    // Limpiar los mocks entre pruebas
    vi.clearAllMocks();
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

      await AuthController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuario registrado exitosamente',
        user: expect.objectContaining({
          id: expect.any(Number), // Acepta cualquier número
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
      req.body = invalidData;

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

      await AuthController.register(req, res);

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
});