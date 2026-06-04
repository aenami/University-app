"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const estudiantes_controller_js_1 = require("../controllers/estudiantes.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const roleAuth_middleware_js_1 = require("../middleware/roleAuth.middleware.js");
const router = express_1.default.Router();
/**
 * Rutas de Consulta de Estudiantes por Grupo (Protegida)
 *
 * Esta ruta permite listar los estudiantes matriculados en un grupo específico.
 * Queda protegida de modo que los alumnos no puedan listar compañeros sin autorización.
 * Únicamente permitido para DOCENTE, COORDINADOR y ADMINISTRADOR.
 */
router.get('/:id_grupo/students', auth_middleware_js_1.authenticateUser, (0, roleAuth_middleware_js_1.authenticateRole)("DOCENTE", "COORDINADOR", "ADMINISTRADOR"), estudiantes_controller_js_1.getStudentsByGroup);
exports.default = router;
