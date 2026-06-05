"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarCoherenciaPrematricula = void 0;
const db_js_1 = require("../config/db.js");
const APROBACION_MINIMA = 3;
const getQueryable = (connection) => connection ?? (0, db_js_1.getConnection)();
const validarCoherenciaPrematricula = async (idEstudiante, idsGrupos, connection) => {
    const db = getQueryable(connection);
    const [grupos] = await db.query(`
            SELECT g.id_grupo, g.id_asignatura, a.nombre AS asignatura
            FROM grupo g
            INNER JOIN asignatura a ON a.id_asignatura = g.id_asignatura
            WHERE g.id_grupo IN (?)
        `, [idsGrupos]);
    if (grupos.length !== idsGrupos.length) {
        return {
            valido: false,
            mensaje: "Uno o mas grupos seleccionados no existen",
        };
    }
    const asignaturasSeleccionadas = grupos.map((grupo) => grupo.id_asignatura);
    const asignaturasDuplicadas = asignaturasSeleccionadas.filter((idAsignatura, index) => {
        return asignaturasSeleccionadas.indexOf(idAsignatura) !== index;
    });
    if (asignaturasDuplicadas.length > 0) {
        return {
            valido: false,
            mensaje: "No puedes seleccionar dos grupos de la misma asignatura",
        };
    }
    const [materiasYaInscritas] = await db.query(`
            SELECT g.id_grupo, g.id_asignatura, a.nombre AS asignatura
            FROM matricula m
            INNER JOIN detalle_matricula dm ON dm.id_matricula = m.id_matricula
            INNER JOIN grupo g ON g.id_grupo = dm.id_grupo
            INNER JOIN asignatura a ON a.id_asignatura = g.id_asignatura
            WHERE m.id_estudiante = ?
                AND g.id_asignatura IN (?)
        `, [idEstudiante, asignaturasSeleccionadas]);
    if (materiasYaInscritas.length > 0) {
        return {
            valido: false,
            mensaje: `El estudiante ya tiene inscrita la asignatura ${materiasYaInscritas[0].asignatura}`,
        };
    }
    const [prerrequisitos] = await db.query(`
            SELECT
                p.id_asignatura,
                a.nombre AS asignatura,
                p.id_asignatura_requisito,
                ar.nombre AS prerrequisito
            FROM prerrequisito p
            INNER JOIN asignatura a ON a.id_asignatura = p.id_asignatura
            INNER JOIN asignatura ar ON ar.id_asignatura = p.id_asignatura_requisito
            WHERE p.id_asignatura IN (?)
            ORDER BY a.nombre ASC, ar.nombre ASC
        `, [asignaturasSeleccionadas]);
    if (prerrequisitos.length === 0) {
        return { valido: true };
    }
    const [materiasAprobadas] = await db.query(`
            SELECT g.id_asignatura
            FROM matricula m
            INNER JOIN detalle_matricula dm ON dm.id_matricula = m.id_matricula
            INNER JOIN grupo g ON g.id_grupo = dm.id_grupo
            INNER JOIN nota n ON n.id_asignatura = g.id_asignatura
            WHERE m.id_estudiante = ?
            GROUP BY g.id_asignatura
            HAVING AVG(n.valor) >= ?
        `, [idEstudiante, APROBACION_MINIMA]);
    const aprobadas = new Set(materiasAprobadas.map((materia) => Number(materia.id_asignatura)));
    const faltantes = prerrequisitos.filter((prerrequisito) => {
        return !aprobadas.has(prerrequisito.id_asignatura_requisito);
    });
    if (faltantes.length > 0) {
        const nombresFaltantes = [...new Set(faltantes.map((prerrequisito) => prerrequisito.prerrequisito))];
        return {
            valido: false,
            mensaje: `Debe aprobar ${nombresFaltantes.join(", ")} antes de matricular la asignatura seleccionada`,
            faltantes: nombresFaltantes,
        };
    }
    return { valido: true };
};
exports.validarCoherenciaPrematricula = validarCoherenciaPrematricula;
