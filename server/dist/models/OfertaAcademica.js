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
    async crearPensum({ idPrograma, estado = "Activo" }) {
        const db = (0, db_js_1.getConnection)();
        const query = `
            INSERT INTO pensum (id_programa, estado)
            VALUES (?, ?)
        `;
        const [result] = await db.query(query, [idPrograma, estado]);
        return result.insertId;
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
                h.dia,
                h.hora_inicio,
                h.hora_fin,
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
};
exports.default = OfertaAcademica;
