"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const estudiantes_controller_js_1 = require("../controllers/estudiantes.controller.js");
const router = express_1.default.Router();
/**
 * Ruta para obtener todos los estudiantes inscritos en un grupo mediante matrícula
 * GET /api/groups/:id_grupo/students
 */
router.get('/:id_grupo/students', estudiantes_controller_js_1.getStudentsByGroup);
exports.default = router;
