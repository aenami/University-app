"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const matricula_controller_js_1 = require("../controllers/matricula.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// Proteger todas las rutas de matrículas para que requieran sesión activa y poder obtener req.idUser
router.use(auth_middleware_js_1.authenticateUser);
router.post("/", matricula_controller_js_1.crearMatricula);
router.get("/:id", matricula_controller_js_1.obtenerMatricula);
exports.default = router;
