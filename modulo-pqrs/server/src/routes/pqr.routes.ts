import express from "express";
import {
    closePqr,
    createPqr,
    listPqrs,
    respondPqr,
} from "../controllers/pqr.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { authenticateRole } from "../middleware/roleAuth.middleware.js";

const router = express.Router();

router.use(authenticateUser);

router.get("/", listPqrs);
router.post("/", createPqr);
router.post("/:pqrId/respuestas", authenticateRole("ADMINISTRADOR"), respondPqr);
router.patch("/:pqrId/cerrar", authenticateRole("ADMINISTRADOR", "COORDINADOR"), closePqr);

export default router;
