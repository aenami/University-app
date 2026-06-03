import { Router } from "express";
import {
  reporteUsuarios,
  reporteOferta,
  reporteMatriculas,
  reporteNotas,
  reporteAsistencia,
  reportePqr,
  reporteResumen,
} from "../controllers/reportes.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { authenticateRole } from "../middleware/roleAuth.middleware.js";

const router = Router();

router.use(authenticateUser);
router.use(authenticateRole("ADMINISTRADOR", "COORDINADOR", "DOCENTE"));

router.get("/resumen",    reporteResumen);
router.get("/usuarios",   reporteUsuarios);
router.get("/oferta",     reporteOferta);
router.get("/matriculas", reporteMatriculas);
router.get("/notas",      reporteNotas);
router.get("/asistencia", reporteAsistencia);
router.get("/pqr",        reportePqr);

export default router;
