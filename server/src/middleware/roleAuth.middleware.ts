import type { NextFunction, Request, Response } from "express";

export const authenticateRole = (...rolesPermitidos: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Verificamos que el rol del usuario autenticado pertenezca al conjunto permitido.
        if (!req.rolUser || !rolesPermitidos.includes(req.rolUser)) {
            return res.status(403).json({
                error: true,
                message: "No tienes permisos para realizar esa accion",
            });
        }

        next();
    };
};
