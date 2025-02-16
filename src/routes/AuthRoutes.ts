import { Router } from 'express';
import { AuthController } from '../controller/AuthController';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Autenticación
 *     description: Operaciones relacionadas con la Authenticación
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Autenticación
 *     summary: Registra un nuevo usuario
 *     description: Crea un nuevo usuario en el sistema.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nombre de usuario
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *             required:
 *               - username
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID del usuario
 *                     username:
 *                       type: string
 *                       description: Nombre de usuario
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: Correo electrónico del usuario
 *                     role:
 *                       type: string
 *                       description: Rol del usuario
 *       400:
 *         description: Datos inválidos o faltantes
 *       409:
 *         description: El correo ya está registrado
 */
router.post('/register', AuthController.register.bind(AuthController));

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Autenticación
 *     summary: Inicia sesión de un usuario
 *     description: Autentica a un usuario en el sistema.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token de autenticación JWT
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', AuthController.login.bind(AuthController));

export default router;
