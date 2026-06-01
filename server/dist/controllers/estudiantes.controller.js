"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentsByGroup = void 0;
const Student_js_1 = __importDefault(require("../models/Student.js"));
/**
 * Controlador para manejar peticiones relacionadas con Grupos.
 */
const getStudentsByGroup = async (req, res) => {
    const { id_grupo } = req.params;
    // Validación del ID de grupo
    if (!id_grupo || isNaN(Number(id_grupo))) {
        return res.status(400).json({
            error: true,
            message: 'El ID del grupo proporcionado no es válido.'
        });
    }
    try {
        const students = await Student_js_1.default.getStudentsByGroupId(Number(id_grupo));
        return res.status(200).json({
            error: false,
            message: `Estudiantes del grupo ${id_grupo} obtenidos con éxito.`,
            data: students
        });
    }
    catch (error) {
        console.error('Error en getStudentsByGroup controller:', error);
        return res.status(500).json({
            error: true,
            message: 'Ocurrió un error interno en el servidor al intentar obtener la lista de estudiantes.'
        });
    }
};
exports.getStudentsByGroup = getStudentsByGroup;
