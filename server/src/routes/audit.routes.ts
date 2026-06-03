import express from "express";
import { getAuditLogs } from "../controllers/audit.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { authenticateRole } from "../middleware/roleAuth.middleware.js";

const router = express.Router();

/**
 * Rutas de Auditoría
 * 
 * Este módulo contiene las rutas para consultar el registro de logs de auditoría.
 * Queda protegido de modo que solo usuarios autenticados con rol ADMINISTRADOR puedan ingresar.
 */
router.get("/", authenticateUser, authenticateRole("ADMINISTRADOR"), getAuditLogs);

export default router;
