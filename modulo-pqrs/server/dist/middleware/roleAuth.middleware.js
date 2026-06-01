"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateRole = void 0;
const authenticateRole = (...rolesPermitidos) => {
    return (req, res, next) => {
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
exports.authenticateRole = authenticateRole;
