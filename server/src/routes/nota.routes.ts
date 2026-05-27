import { Router } from "express";
import { registrarNota, obtenerNotasPorGrupo, editarNota } from "../controllers/nota.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { authenticateRole } from "../middleware/roleAuth.middleware.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateUser);

// POST /api/notas → registrar nota (solo docente)
router.post(
    "/",
    (req, res, next) => authenticateRole(req, res, next, "DOCENTE"),
    registrarNota
);

// GET /api/notas/grupo/:id_grupo → notas de un grupo (docente o coordinador)
router.get(
    "/grupo/:id_grupo",
    (req, res, next) => authenticateRole(req, res, next, "DOCENTE", "COORDINADOR", "ADMINISTRADOR"),
    obtenerNotasPorGrupo
);

// PUT /api/notas/:id_nota → editar nota (solo docente)
router.put(
    "/:id_nota",
    (req, res, next) => authenticateRole(req, res, next, "DOCENTE"),
    editarNota
);

export default router;