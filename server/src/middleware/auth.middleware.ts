import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/tokenService.js";

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
    // 1. Extraemos el header Authorization enviado por el frontend.
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: true,
            message: "No se envio un token de autenticacion valido",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        // 2. Verificamos el token y guardamos el id del usuario en la request para reutilizarlo despues.
        const payload = verifyToken(token);
        req.idUser = payload.id;

        // 3. Si todo salio bien, dejamos pasar la peticion a la ruta protegida.
        next();
    } catch (error) {
        return res.status(401).json({
            error: true,
            message: "La sesion expiro o el token es invalido",
        });
    }
}
