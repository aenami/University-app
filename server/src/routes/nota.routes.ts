import { Router } from "express";
import { registrarNota, obtenerNotasPorGrupo, editarNota } from "../controllers/nota.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { authenticateRole } from "../middleware/roleAuth.middleware.js";

const router = Router();

router.use(authenticateUser);

router.post("/", authenticateRole("DOCENTE"), registrarNota);

router.get("/grupo/:id_grupo", authenticateRole("DOCENTE", "COORDINADOR", "ADMINISTRADOR"), obtenerNotasPorGrupo);

router.put("/:id_nota", authenticateRole("DOCENTE"), editarNota);

export default router;