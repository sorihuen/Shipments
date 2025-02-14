// src/middlewares/role.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { User } from '../entities/User';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    // Obtener el usuario desde res.locals (proporcionado por authenticateUser)
    const user: User = res.locals.user;

    // Verificar si el usuario tiene el rol de administrador
    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }

    // Si el usuario es administrador, continuar con la siguiente función en la cadena de middleware
    next();
};