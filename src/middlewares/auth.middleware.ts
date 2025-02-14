// src/middlewares/auth.middleware.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../entities/User';

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
    // Verificar que el encabezado Authorization esté presente y tenga el formato correcto
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    // Extraer el token del encabezado
    const token = authHeader.split(' ')[1];
    try {
        // Verificar el token usando la clave JWT_SECRET de las variables de entorno
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; role: string };

        // Crear una nueva instancia de User con el ID y el rol del usuario decodificado
        const user = new User();
        user.id = decoded.userId;
        user.role = decoded.role; // Asegúrate de asignar el rol aquí

        // Almacenar el usuario en res.locals para que esté disponible en las rutas protegidas
        res.locals.user = user;

        // Continuar con la siguiente función en la cadena de middleware
        next();
    } catch (error) {
        // Si el token es inválido o ha expirado, devolver un error 403
        return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};