"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_js_1 = require("../config/db.js");
const OfertaAcademica = {
    async crearPrograma({ nombre, tipoPrograma, facultad }) {
        const db = (0, db_js_1.getConnection)();
        const query = `
            INSERT INTO programa (nombre, tipo_programa, facultad)
            VALUES (?, ?, ?)
        `;
        const [result] = await db.query(query, [nombre, tipoPrograma, facultad]);
        return result.insertId;
    },
    async consultarProgramas() {
        const db = (0, db_js_1.getConnection)();
        const query = `
            SELECT id_programa, nombre, tipo_programa, facultad
            FROM programa
            ORDER BY nombre ASC
        `;
        const [rows] = await db.query(query);
        return rows;
    },
    async existePrograma(idPrograma) {
        const db = (0, db_js_1.getConnection)();
        const [rows] = await db.query("SELECT id_programa FROM programa WHERE id_programa = ? LIMIT 1", [idPrograma]);
        return rows.length > 0;
    },
    async existeProgramaPorNombre(nombre) {
        const db = (0, db_js_1.getConnection)();
        const [rows] = await db.query("SELECT id_programa FROM programa WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?)) LIMIT 1", [nombre]);
        return rows.length > 0;
    },
    async crearAsignatura({ nombre, creditos }) {
        const db = (0, db_js_1.getConnection)();
        const query = `
            INSERT INTO asignatura (nombre, creditos)
            VALUES (?, ?)
        `;
        const [result] = await db.query(query, [nombre, creditos]);
        return result.insertId;
    },
    async consultarAsignaturas() {
        const db = (0, db_js_1.getConnection)();
        const query = `
            SELECT id_asignatura, nombre, creditos
            FROM asignatura
            ORDER BY nombre ASC
        `;
        const [rows] = await db.query(query);
        return rows;
    },
    async existeAsignatura(idAsignatura) {
        const db = (0, db_js_1.getConnection)();
        const [rows] = await db.query("SELECT id_asignatura FROM asignatura WHERE id_asignatura = ? LIMIT 1", [idAsignatura]);
        return rows.length > 0;
    },
    async existeAsignaturaPorNombre(nombre) {
        const db = (0, db_js_1.getConnection)();
        const [rows] = await db.query("SELECT id_asignatura FROM asignatura WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?)) LIMIT 1", [nombre]);
        return rows.length > 0;
    },
    async crearPensum({ idPrograma, estado = "Activo" }) {
        const db = (0, db_js_1.getConnection)();
        const query = `
            INSERT INTO pensum (id_programa, estado)
            VALUES (?, ?)
        `;
        const [result] = await db.query(query, [idPrograma, estado]);
        return result.insertId;
    },
    async consultarPensums() {
        const db = (0, db_js_1.getConnection)();
        const query = `
            SELECT
                p.id_pensum,
                p.id_programa,
                p.estado,
                pr.nombre AS programa,
                pr.facultad
            FROM pensum p
            INNER JOIN programa pr ON pr.id_programa = p.id_programa
            ORDER BY pr.nombre ASC, p.estado ASC
        `;
        const [rows] = await db.query(query);
        return rows;
    },
    async existePensum(idPensum) {
        const db = (0, db_js_1.getConnection)();
        const [rows] = await db.query("SELECT id_pensum FROM pensum WHERE id_pensum = ? LIMIT 1", [idPensum]);
        return rows.length > 0;
    },
    async asociarAsignaturaPensum(idPensum, idAsignatura) {
        const db = (0, db_js_1.getConnection)();
        const query = `
            INSERT INTO pensum_asignatura (id_asignatura, id_pensum)
            VALUES (?, ?)
        `;
        await db.query(query, [idAsignatura, idPensum]);
    },
    async crearGrupo({ numGrupo, cupoMaximo, idAsignatura }) {
        const db = (0, db_js_1.getConnection)();
        const query = `
            INSERT INTO grupo (num_grupo, cupo_maximo, id_asignatura)
            VALUES (?, ?, ?)
        `;
        const [result] = await db.query(query, [numGrupo, cupoMaximo, idAsignatura]);
        return result.insertId;
    },
    async consultarGrupos() {
        const db = (0, db_js_1.getConnection)();
        const query = `
            SELECT
                g.id_grupo,
                g.num_grupo,
                g.cupo_maximo,
                g.id_asignatura,
                a.nombre AS asignatura,
                a.creditos
            FROM grupo g
            INNER JOIN asignatura a ON a.id_asignatura = g.id_asignatura
            ORDER BY a.nombre ASC, g.num_grupo ASC
        `;
        const [rows] = await db.query(query);
        return rows;
    },
    async existeGrupo(idGrupo) {
        const db = (0, db_js_1.getConnection)();
        const [rows] = await db.query("SELECT id_grupo FROM grupo WHERE id_grupo = ? LIMIT 1", [idGrupo]);
        return rows.length > 0;
    },
    async existePensumPorProgramaYEstado(idPrograma, estado) {
        const db = (0, db_js_1.getConnection)();
        const [rows] = await db.query(`
                SELECT id_pensum
                FROM pensum
                WHERE id_programa = ? AND LOWER(TRIM(estado)) = LOWER(TRIM(?))
                LIMIT 1
            `, [idPrograma, estado]);
        return rows.length > 0;
    },
    async existeAsignaturaEnPensumActivo(idAsignatura) {
        const db = (0, db_js_1.getConnection)();
        const [rows] = await db.query(`
                SELECT pa.id_asignatura
                FROM pensum_asignatura pa
                INNER JOIN pensum p ON p.id_pensum = pa.id_pensum
                WHERE pa.id_asignatura = ?
                    AND LOWER(TRIM(p.estado)) = 'activo'
                LIMIT 1
            `, [idAsignatura]);
        return rows.length > 0;
    },
    async existeAsignaturaEnPensum(idPensum, idAsignatura) {
        const db = (0, db_js_1.getConnection)();
        const [rows] = await db.query(`
                SELECT id_asignatura
                FROM pensum_asignatura
                WHERE id_pensum = ? AND id_asignatura = ?
                LIMIT 1
            `, [idPensum, idAsignatura]);
        return rows.length > 0;
    },
    async consultarPrerrequisitosFueraDePensum(idPensum, idAsignatura) {
        const db = (0, db_js_1.getConnection)();
        const [rows] = await db.query(`
                SELECT ar.id_asignatura, ar.nombre
                FROM prerrequisito pr
                INNER JOIN asignatura ar ON ar.id_asignatura = pr.id_asignatura_requisito
                LEFT JOIN pensum_asignatura pa
                    ON pa.id_asignatura = pr.id_asignatura_requisito
                    AND pa.id_pensum = ?
                WHERE pr.id_asignatura = ?
                    AND pa.id_asignatura IS NULL
                ORDER BY ar.nombre ASC
            `, [idPensum, idAsignatura]);
        return rows;
    },
    async existeGrupoPorAsignaturaYNumero(idAsignatura, numGrupo) {
        const db = (0, db_js_1.getConnection)();
        const [rows] = await db.query(`
                SELECT id_grupo
                FROM grupo
                WHERE id_asignatura = ? AND num_grupo = ?
                LIMIT 1
            `, [idAsignatura, numGrupo]);
        return rows.length > 0;
    },
    async crearHorarioAula({ idGrupo, dia, horaInicio, horaFin, piso, bloque, aula }) {
        const db = (0, db_js_1.getConnection)();
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const [horarioResult] = await connection.query(`
                    INSERT INTO horario (dia, hora_inicio, hora_fin)
                    VALUES (?, ?, ?)
                `, [dia, horaInicio, horaFin]);
            const idHorario = horarioResult.insertId;
            await connection.query(`
                    INSERT INTO aula (piso, bloque, horario, id_horario, id_grupo)
                    VALUES (?, ?, ?, ?, ?)
                `, [piso, bloque, aula ?? null, idHorario, idGrupo]);
            await connection.commit();
            return idHorario;
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    },
    async existeHorarioDuplicado({ idGrupo, dia, horaInicio, horaFin, bloque, aula }) {
        const db = (0, db_js_1.getConnection)();
        const [rows] = await db.query(`
                SELECT h.id_horario
                FROM horario h
                INNER JOIN aula au ON au.id_horario = h.id_horario
                WHERE h.dia = ?
                    AND (h.hora_inicio < ? AND h.hora_fin > ?)
                    AND (au.id_grupo = ? OR (au.bloque = ? AND (au.aula = ? OR (? IS NULL AND au.aula IS NULL))))
                LIMIT 1
            `, [dia, horaFin, horaInicio, idGrupo, bloque, aula ?? null, aula ?? null]);
        return rows.length > 0;
    },
    async consultarHorariosAulasPorGrupo(idGrupo) {
        const db = (0, db_js_1.getConnection)();
        const values = [];
        let where = "";
        if (idGrupo) {
            where = "WHERE g.id_grupo = ?";
            values.push(idGrupo);
        }
        const query = `
            SELECT
                h.id_horario,
                DATE_FORMAT(h.dia, '%Y-%m-%d') AS dia,
                TIME_FORMAT(h.hora_inicio, '%H:%i') AS hora_inicio,
                TIME_FORMAT(h.hora_fin, '%H:%i') AS hora_fin,
                au.id_aula,
                au.piso,
                au.bloque,
                au.horario AS aula,
                g.id_grupo,
                g.num_grupo,
                a.nombre AS asignatura
            FROM horario h
            INNER JOIN aula au ON au.id_horario = h.id_horario
            INNER JOIN grupo g ON g.id_grupo = au.id_grupo
            INNER JOIN asignatura a ON a.id_asignatura = g.id_asignatura
            ${where}
            ORDER BY h.dia ASC, h.hora_inicio ASC
        `;
        const [rows] = await db.query(query, values);
        return rows;
    },
    async existePrerrequisito(idAsignatura, idAsignaturaRequisito) {
        const db = (0, db_js_1.getConnection)();
        const [rows] = await db.query(`
                SELECT id_prerrequisito
                FROM prerrequisito
                WHERE id_asignatura = ? AND id_asignatura_requisito = ?
                LIMIT 1
            `, [idAsignatura, idAsignaturaRequisito]);
        return rows.length > 0;
    },
    async existeCicloPrerrequisito(idAsignatura, idAsignaturaRequisito) {
        const db = (0, db_js_1.getConnection)();
        const [rows] = await db.query(`
                WITH RECURSIVE cadena_prerrequisitos AS (
                    SELECT id_asignatura, id_asignatura_requisito
                    FROM prerrequisito
                    WHERE id_asignatura = ?

                    UNION ALL

                    SELECT p.id_asignatura, p.id_asignatura_requisito
                    FROM prerrequisito p
                    INNER JOIN cadena_prerrequisitos c
                        ON p.id_asignatura = c.id_asignatura_requisito
                )
                SELECT id_asignatura_requisito
                FROM cadena_prerrequisitos
                WHERE id_asignatura_requisito = ?
                LIMIT 1
            `, [idAsignaturaRequisito, idAsignatura]);
        return rows.length > 0;
    },
    async crearPrerrequisito(idAsignatura, idAsignaturaRequisito) {
        const db = (0, db_js_1.getConnection)();
        const query = `
            INSERT INTO prerrequisito (id_asignatura, id_asignatura_requisito)
            VALUES (?, ?)
        `;
        const [result] = await db.query(query, [idAsignatura, idAsignaturaRequisito]);
        return result.insertId;
    },
    async consultarPrerrequisitosPorAsignatura(idAsignatura) {
        const db = (0, db_js_1.getConnection)();
        const query = `
            SELECT
                p.id_prerrequisito,
                p.id_asignatura,
                a.nombre AS asignatura,
                p.id_asignatura_requisito,
                ar.nombre AS prerrequisito,
                ar.creditos AS creditos_prerrequisito
            FROM prerrequisito p
            INNER JOIN asignatura a ON a.id_asignatura = p.id_asignatura
            INNER JOIN asignatura ar ON ar.id_asignatura = p.id_asignatura_requisito
            WHERE p.id_asignatura = ?
            ORDER BY ar.nombre ASC
        `;
        const [rows] = await db.query(query, [idAsignatura]);
        return rows;
    },
};
exports.default = OfertaAcademica;
