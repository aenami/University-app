import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/tokenService.js";

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
    // Permitimos un bypass controlado solo para desarrollo local mientras el login no esta listo.
    if (process.env.ALLOW_DEV_AUTH_BYPASS === "true") {
        req.idUser = 4;
        req.rolUser = "ADMINISTRADOR";
        return next();
    }

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
        req.rolUser = payload.rol; // Adjuntamos el rol al token

        // 3. Si todo salio bien, dejamos pasar la peticion a la ruta protegida.
        next();
    } catch (error) {
        return res.status(401).json({
            error: true,
            message: "La sesion expiro o el token es invalido",
        });
    }
}
