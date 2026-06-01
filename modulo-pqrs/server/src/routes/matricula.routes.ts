import { Router } from "express";
import { crearMatricula, obtenerMatricula } from "../controllers/matricula.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = Router();

// Proteger todas las rutas de matrículas para que requieran sesión activa y poder obtener req.idUser
router.use(authenticateUser);

router.post("/", crearMatricula);
router.get("/:id", obtenerMatricula);

export default router;
