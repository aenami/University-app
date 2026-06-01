import express from "express";
import {
    asociarAsignaturaPensum,
    consultarAsignaturas,
    consultarGrupos,
    consultarHorariosAulas,
    consultarProgramas,
    crearAsignatura,
    crearGrupo,
    crearHorarioAula,
    crearPensum,
    crearPrograma,
} from "../controllers/ofertaAcademica.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { authenticateRole } from "../middleware/roleAuth.middleware.js";

const router = express.Router();

/**
 * Rutas de Consulta de Oferta Académica (Públicas/Autenticados)
 * 
 * Los estudiantes pueden acceder a estas rutas para ver la oferta disponible
 * al momento de realizar su selección académica.
 */
router.get("/programas", consultarProgramas);
router.get("/asignaturas", consultarAsignaturas);
router.get("/grupos", consultarGrupos);
router.get("/grupos/:idGrupo/horarios", consultarHorariosAulas);
router.get("/horarios", consultarHorariosAulas);

/**
 * Rutas de Creación e Infraestructura Académica (Protegidas)
 * 
 * Solo accesibles por ADMINISTRADORES o COORDINADORES para evitar modificaciones
 * no autorizadas por parte de estudiantes.
 */
router.use(authenticateUser);
router.use(authenticateRole("ADMINISTRADOR", "COORDINADOR"));

router.post("/programas", crearPrograma);
router.post("/asignaturas", crearAsignatura);
router.post("/pensums", crearPensum);
router.post("/pensums/:idPensum/asignaturas", asociarAsignaturaPensum);
router.post("/grupos", crearGrupo);
router.post("/grupos/:idGrupo/horarios", crearHorarioAula);

export default router;
