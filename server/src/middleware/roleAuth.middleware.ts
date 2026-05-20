import type { NextFunction, Request, Response } from "express";

export const authenticateRole = (req: Request, res: Response, next: NextFunction, ...rolesPermitidos: string[]) => {
    //1. Verificamos que el rol del usuario que esta enviando la peticion concuerde con los definidos en la ruta
    if(!rolesPermitidos.includes(req.rolUser!)){
        return res.status(403).json({error: true, message:'No tienes permisos para realizar esa accion'})
    }
    //2. Si el rol del usuario si tiene permitodo acceder a esa ruta, lo dejamos pasar
    next()
}
