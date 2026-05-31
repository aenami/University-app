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

const router = express.Router();

router.post("/programas", crearPrograma);
router.get("/programas", consultarProgramas);

router.post("/asignaturas", crearAsignatura);
router.get("/asignaturas", consultarAsignaturas);

router.post("/pensums", crearPensum);
router.post("/pensums/:idPensum/asignaturas", asociarAsignaturaPensum);

router.post("/grupos", crearGrupo);
router.get("/grupos", consultarGrupos);

router.post("/grupos/:idGrupo/horarios", crearHorarioAula);
router.get("/grupos/:idGrupo/horarios", consultarHorariosAulas);
router.get("/horarios", consultarHorariosAulas);

export default router;
