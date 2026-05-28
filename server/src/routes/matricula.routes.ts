import { Router } from "express";
import { crearMatricula, obtenerMatricula } from "../controllers/matricula.controller";

const router = Router();

router.post("/", crearMatricula);
router.get("/:id", obtenerMatricula);

export default router;