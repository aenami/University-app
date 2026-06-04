"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarPrematricula = void 0;
const db_js_1 = require("../config/db.js");
const validacionAcademica_service_js_1 = require("../services/validacionAcademica.service.js");
const validarPrematricula = async (req, res) => {
    try {
        const { grupos, idEstudiante, id_estudiante } = req.body;
        const idEstudianteValidacion = Number(idEstudiante ?? id_estudiante);
        const db = (0, db_js_1.getConnection)();
        if (!Array.isArray(grupos) || grupos.length === 0) {
            return res.status(400).json({
                error: true,
                message: 'Debes seleccionar al menos un grupo'
            });
        }
        // =========================================
        // VALIDAR DUPLICIDAD DE ASIGNATURAS
        // =========================================
        const asignaturas = new Set();
        for (const idGrupo of grupos) {
            const [rows] = await db.query(`
                SELECT id_asignatura
                FROM grupo
                WHERE id_grupo = ?
            `, [idGrupo]);
            if (!rows.length) {
                return res.status(404).json({
                    error: true,
                    message: `El grupo ${idGrupo} no existe`
                });
            }
            const idAsignatura = rows[0].id_asignatura;
            if (asignaturas.has(idAsignatura)) {
                return res.status(400).json({
                    error: true,
                    message: 'No puedes seleccionar dos grupos de la misma asignatura'
                });
            }
            asignaturas.add(idAsignatura);
        }
        if (Number.isInteger(idEstudianteValidacion) && idEstudianteValidacion > 0) {
            const validacionAcademica = await (0, validacionAcademica_service_js_1.validarCoherenciaPrematricula)(idEstudianteValidacion, grupos);
            if (!validacionAcademica.valido) {
                return res.status(400).json({
                    error: true,
                    message: validacionAcademica.mensaje,
                    faltantes: validacionAcademica.faltantes ?? []
                });
            }
        }
        // =========================================
        // VALIDAR CUPOS
        // =========================================
        for (const idGrupo of grupos) {
            const [rows] = await db.query(`
                SELECT 
                    g.cupo_maximo,
                    COUNT(dm.id_detalle) AS ocupados
                FROM grupo g
                LEFT JOIN detalle_matricula dm
                    ON g.id_grupo = dm.id_grupo
                WHERE g.id_grupo = ?
                GROUP BY g.id_grupo
            `, [idGrupo]);
            const grupo = rows[0];
            if (!grupo) {
                return res.status(404).json({
                    error: true,
                    message: `El grupo ${idGrupo} no existe`
                });
            }
            if (grupo.ocupados >= grupo.cupo_maximo) {
                return res.status(400).json({
                    error: true,
                    message: `El grupo ${idGrupo} no tiene cupos disponibles`
                });
            }
        }
        return res.status(200).json({
            error: false,
            message: 'Validaciones de prematrícula correctas'
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: true,
            message: 'Error interno del servidor'
        });
    }
};
exports.validarPrematricula = validarPrematricula;
