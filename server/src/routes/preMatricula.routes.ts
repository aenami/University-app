import express from "express";

import {
    obtenerPendientes,
    aprobarPreMatricula,
    rechazarPreMatricula
} from "../controllers/preMatricula.controller.js";

const router = express.Router();

router.get(
    "/pendientes",
    obtenerPendientes
);

router.put(
    "/aprobar/:id",
    aprobarPreMatricula
);

router.put(
    "/rechazar/:id",
    rechazarPreMatricula
);

export default router;