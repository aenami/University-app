import { ResultSetHeader, RowDataPacket } from "mysql2";
import { getConnection } from "../config/db.js";

export interface ProgramaRow extends RowDataPacket {
    id_programa: number;
    nombre: string;
    tipo_programa: string;
    facultad: string;
}

export interface AsignaturaRow extends RowDataPacket {
    id_asignatura: number;
    nombre: string;
    creditos: number;
}

export interface PensumRow extends RowDataPacket {
    id_pensum: number;
    id_programa: number;
    estado: string;
    programa: string;
    facultad: string;
}

export interface GrupoRow extends RowDataPacket {
    id_grupo: number;
    num_grupo: number;
    cupo_maximo: number;
    id_asignatura: number;
    asignatura: string;
    creditos: number;
}

export interface HorarioAulaRow extends RowDataPacket {
    id_horario: number;
    dia: string;
    hora_inicio: string;
    hora_fin: string;
    id_aula: number;
    piso: number;
    bloque: string;
    aula: string | null;
    id_grupo: number;
    num_grupo: number;
    asignatura: string;
}

export interface PrerrequisitoRow extends RowDataPacket {
    id_prerrequisito: number;
    id_asignatura: number;
    asignatura: string;
    id_asignatura_requisito: number;
    prerrequisito: string;
    creditos_prerrequisito: number;
}

export interface AsignaturaBasicaRow extends RowDataPacket {
    id_asignatura: number;
    nombre: string;
}

interface CrearProgramaData {
    nombre: string;
    tipoPrograma: string;
    facultad: string;
}

interface CrearAsignaturaData {
    nombre: string;
    creditos: number;
}

interface CrearPensumData {
    idPrograma: number;
    estado?: string;
}

interface CrearGrupoData {
    numGrupo: number;
    cupoMaximo: number;
    idAsignatura: number;
}

interface CrearHorarioAulaData {
    idGrupo: number;
    dia: string;
    horaInicio: string;
    horaFin: string;
    piso: number;
    bloque: string;
    aula?: string;
}

interface OfertaAcademicaModel {
    crearPrograma: (data: CrearProgramaData) => Promise<number>;
    consultarProgramas: () => Promise<ProgramaRow[]>;
    existePrograma: (idPrograma: number) => Promise<boolean>;
    existeProgramaPorNombre: (nombre: string) => Promise<boolean>;
    crearAsignatura: (data: CrearAsignaturaData) => Promise<number>;
    consultarAsignaturas: () => Promise<AsignaturaRow[]>;
    existeAsignatura: (idAsignatura: number) => Promise<boolean>;
    existeAsignaturaPorNombre: (nombre: string) => Promise<boolean>;
    crearPensum: (data: CrearPensumData) => Promise<number>;
    consultarPensums: () => Promise<PensumRow[]>;
    existePensum: (idPensum: number) => Promise<boolean>;
    existePensumPorProgramaYEstado: (idPrograma: number, estado: string) => Promise<boolean>;
    existeAsignaturaEnPensumActivo: (idAsignatura: number) => Promise<boolean>;
    existeAsignaturaEnPensum: (idPensum: number, idAsignatura: number) => Promise<boolean>;
    consultarPrerrequisitosFueraDePensum: (idPensum: number, idAsignatura: number) => Promise<AsignaturaBasicaRow[]>;
    consultarPrerrequisitosFueraDePensumActivo: (idAsignatura: number) => Promise<AsignaturaBasicaRow[]>;
    consultarNombreAsignatura: (idAsignatura: number) => Promise<string | null>;
    asociarAsignaturaPensum: (idPensum: number, idAsignatura: number) => Promise<void>;
    crearGrupo: (data: CrearGrupoData) => Promise<number>;
    consultarGrupos: () => Promise<GrupoRow[]>;
    existeGrupo: (idGrupo: number) => Promise<boolean>;
    existeGrupoPorAsignaturaYNumero: (idAsignatura: number, numGrupo: number) => Promise<boolean>;
    crearHorarioAula: (data: CrearHorarioAulaData) => Promise<number>;
    existeHorarioDuplicado: (data: Pick<CrearHorarioAulaData, "idGrupo" | "dia" | "horaInicio" | "horaFin" | "bloque" | "aula">) => Promise<boolean>;
    consultarHorariosAulasPorGrupo: (idGrupo?: number) => Promise<HorarioAulaRow[]>;
    existePrerrequisito: (idAsignatura: number, idAsignaturaRequisito: number) => Promise<boolean>;
    existeCicloPrerrequisito: (idAsignatura: number, idAsignaturaRequisito: number) => Promise<boolean>;
    crearPrerrequisito: (idAsignatura: number, idAsignaturaRequisito: number) => Promise<number>;
    consultarPrerrequisitosPorAsignatura: (idAsignatura: number) => Promise<PrerrequisitoRow[]>;
}

const OfertaAcademica: OfertaAcademicaModel = {
    async crearPrograma({ nombre, tipoPrograma, facultad }) {
        const db = getConnection();
        const query = `
            INSERT INTO programa (nombre, tipo_programa, facultad)
            VALUES (?, ?, ?)
        `;

        const [result] = await db.query<ResultSetHeader>(query, [nombre, tipoPrograma, facultad]);
        return result.insertId;
    },

    async consultarProgramas() {
        const db = getConnection();
        const query = `
            SELECT id_programa, nombre, tipo_programa, facultad
            FROM programa
            ORDER BY nombre ASC
        `;

        const [rows] = await db.query<ProgramaRow[]>(query);
        return rows;
    },

    async existePrograma(idPrograma) {
        const db = getConnection();
        const [rows] = await db.query<RowDataPacket[]>(
            "SELECT id_programa FROM programa WHERE id_programa = ? LIMIT 1",
            [idPrograma]
        );

        return rows.length > 0;
    },

    async existeProgramaPorNombre(nombre) {
        const db = getConnection();
        const [rows] = await db.query<RowDataPacket[]>(
            "SELECT id_programa FROM programa WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?)) LIMIT 1",
            [nombre]
        );

        return rows.length > 0;
    },

    async crearAsignatura({ nombre, creditos }) {
        const db = getConnection();
        const query = `
            INSERT INTO asignatura (nombre, creditos)
            VALUES (?, ?)
        `;

        const [result] = await db.query<ResultSetHeader>(query, [nombre, creditos]);
        return result.insertId;
    },

    async consultarAsignaturas() {
        const db = getConnection();
        const query = `
            SELECT id_asignatura, nombre, creditos
            FROM asignatura
            ORDER BY nombre ASC
        `;

        const [rows] = await db.query<AsignaturaRow[]>(query);
        return rows;
    },

    async existeAsignatura(idAsignatura) {
        const db = getConnection();
        const [rows] = await db.query<RowDataPacket[]>(
            "SELECT id_asignatura FROM asignatura WHERE id_asignatura = ? LIMIT 1",
            [idAsignatura]
        );

        return rows.length > 0;
    },

    async existeAsignaturaPorNombre(nombre) {
        const db = getConnection();
        const [rows] = await db.query<RowDataPacket[]>(
            "SELECT id_asignatura FROM asignatura WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?)) LIMIT 1",
            [nombre]
        );

        return rows.length > 0;
    },

    async crearPensum({ idPrograma, estado = "Activo" }) {
        const db = getConnection();
        const query = `
            INSERT INTO pensum (id_programa, estado)
            VALUES (?, ?)
        `;

        const [result] = await db.query<ResultSetHeader>(query, [idPrograma, estado]);
        return result.insertId;
    },

    async consultarPensums() {
        const db = getConnection();
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

        const [rows] = await db.query<PensumRow[]>(query);
        return rows;
    },

    async existePensum(idPensum) {
        const db = getConnection();
        const [rows] = await db.query<RowDataPacket[]>(
            "SELECT id_pensum FROM pensum WHERE id_pensum = ? LIMIT 1",
            [idPensum]
        );

        return rows.length > 0;
    },

    async asociarAsignaturaPensum(idPensum, idAsignatura) {
        const db = getConnection();
        const query = `
            INSERT INTO pensum_asignatura (id_asignatura, id_pensum)
            VALUES (?, ?)
        `;

        await db.query<ResultSetHeader>(query, [idAsignatura, idPensum]);
    },

    async crearGrupo({ numGrupo, cupoMaximo, idAsignatura }) {
        const db = getConnection();
        const query = `
            INSERT INTO grupo (num_grupo, cupo_maximo, id_asignatura)
            VALUES (?, ?, ?)
        `;

        const [result] = await db.query<ResultSetHeader>(query, [numGrupo, cupoMaximo, idAsignatura]);
        return result.insertId;
    },

    async consultarGrupos() {
        const db = getConnection();
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

        const [rows] = await db.query<GrupoRow[]>(query);
        return rows;
    },

    async existeGrupo(idGrupo) {
        const db = getConnection();
        const [rows] = await db.query<RowDataPacket[]>(
            "SELECT id_grupo FROM grupo WHERE id_grupo = ? LIMIT 1",
            [idGrupo]
        );

        return rows.length > 0;
    },

    async existePensumPorProgramaYEstado(idPrograma, estado) {
        const db = getConnection();
        const [rows] = await db.query<RowDataPacket[]>(
            `
                SELECT id_pensum
                FROM pensum
                WHERE id_programa = ? AND LOWER(TRIM(estado)) = LOWER(TRIM(?))
                LIMIT 1
            `,
            [idPrograma, estado]
        );

        return rows.length > 0;
    },

    async existeAsignaturaEnPensumActivo(idAsignatura) {
        const db = getConnection();
        const [rows] = await db.query<RowDataPacket[]>(
            `
                SELECT pa.id_asignatura
                FROM pensum_asignatura pa
                INNER JOIN pensum p ON p.id_pensum = pa.id_pensum
                WHERE pa.id_asignatura = ?
                    AND LOWER(TRIM(p.estado)) = 'activo'
                LIMIT 1
            `,
            [idAsignatura]
        );

        return rows.length > 0;
    },

    async existeAsignaturaEnPensum(idPensum, idAsignatura) {
        const db = getConnection();
        const [rows] = await db.query<RowDataPacket[]>(
            `
                SELECT id_asignatura
                FROM pensum_asignatura
                WHERE id_pensum = ? AND id_asignatura = ?
                LIMIT 1
            `,
            [idPensum, idAsignatura]
        );

        return rows.length > 0;
    },

    async consultarPrerrequisitosFueraDePensum(idPensum, idAsignatura) {
        const db = getConnection();
        const [rows] = await db.query<AsignaturaBasicaRow[]>(
            `
                SELECT ar.id_asignatura, ar.nombre
                FROM prerrequisito pr
                INNER JOIN asignatura ar ON ar.id_asignatura = pr.id_asignatura_requisito
                LEFT JOIN pensum_asignatura pa
                    ON pa.id_asignatura = pr.id_asignatura_requisito
                    AND pa.id_pensum = ?
                WHERE pr.id_asignatura = ?
                    AND pa.id_asignatura IS NULL
                ORDER BY ar.nombre ASC
            `,
            [idPensum, idAsignatura]
        );

        return rows;
    },

    async consultarPrerrequisitosFueraDePensumActivo(idAsignatura) {
        const db = getConnection();
        const [rows] = await db.query<AsignaturaBasicaRow[]>(
            `
                SELECT ar.id_asignatura, ar.nombre
                FROM prerrequisito pr
                INNER JOIN asignatura ar ON ar.id_asignatura = pr.id_asignatura_requisito
                WHERE pr.id_asignatura = ?
                    AND NOT EXISTS (
                        SELECT 1
                        FROM pensum_asignatura pa
                        INNER JOIN pensum p ON p.id_pensum = pa.id_pensum
                        WHERE pa.id_asignatura = pr.id_asignatura_requisito
                            AND LOWER(TRIM(p.estado)) = 'activo'
                    )
                ORDER BY ar.nombre ASC
            `,
            [idAsignatura],
        );

        return rows;
    },

    async consultarNombreAsignatura(idAsignatura) {
        const db = getConnection();
        const [rows] = await db.query<RowDataPacket[]>(
            `
                SELECT nombre
                FROM asignatura
                WHERE id_asignatura = ?
                LIMIT 1
            `,
            [idAsignatura],
        );

        return rows.length ? String(rows[0].nombre) : null;
    },

    async existeGrupoPorAsignaturaYNumero(idAsignatura, numGrupo) {
        const db = getConnection();
        const [rows] = await db.query<RowDataPacket[]>(
            `
                SELECT id_grupo
                FROM grupo
                WHERE id_asignatura = ? AND num_grupo = ?
                LIMIT 1
            `,
            [idAsignatura, numGrupo]
        );

        return rows.length > 0;
    },

    async crearHorarioAula({ idGrupo, dia, horaInicio, horaFin, piso, bloque, aula }) {
        const db = getConnection();
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [horarioResult] = await connection.query<ResultSetHeader>(
                `
                    INSERT INTO horario (dia, hora_inicio, hora_fin)
                    VALUES (?, ?, ?)
                `,
                [dia, horaInicio, horaFin]
            );

            const idHorario = horarioResult.insertId;

            await connection.query<ResultSetHeader>(
                `
                    INSERT INTO aula (piso, bloque, horario, id_horario, id_grupo)
                    VALUES (?, ?, ?, ?, ?)
                `,
                [piso, bloque, aula ?? null, idHorario, idGrupo]
            );

            await connection.commit();
            return idHorario;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    async existeHorarioDuplicado({ idGrupo, dia, horaInicio, horaFin, bloque, aula }) {
        const db = getConnection();
        const [rows] = await db.query<RowDataPacket[]>(
            `
                SELECT h.id_horario
                FROM horario h
                INNER JOIN aula au ON au.id_horario = h.id_horario
                WHERE h.dia = ?
                    AND (h.hora_inicio < ? AND h.hora_fin > ?)
                    AND (au.id_grupo = ? OR (au.bloque = ? AND (au.aula = ? OR (? IS NULL AND au.aula IS NULL))))
                LIMIT 1
            `,
            [dia, horaFin, horaInicio, idGrupo, bloque, aula ?? null, aula ?? null]
        );

        return rows.length > 0;
    },

    async consultarHorariosAulasPorGrupo(idGrupo) {
        const db = getConnection();
        const values: number[] = [];
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

        const [rows] = await db.query<HorarioAulaRow[]>(query, values);
        return rows;
    },

    async existePrerrequisito(idAsignatura, idAsignaturaRequisito) {
        const db = getConnection();
        const [rows] = await db.query<RowDataPacket[]>(
            `
                SELECT id_prerrequisito
                FROM prerrequisito
                WHERE id_asignatura = ? AND id_asignatura_requisito = ?
                LIMIT 1
            `,
            [idAsignatura, idAsignaturaRequisito]
        );

        return rows.length > 0;
    },

    async existeCicloPrerrequisito(idAsignatura, idAsignaturaRequisito) {
        const db = getConnection();
        const [rows] = await db.query<RowDataPacket[]>(
            `
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
            `,
            [idAsignaturaRequisito, idAsignatura]
        );

        return rows.length > 0;
    },

    async crearPrerrequisito(idAsignatura, idAsignaturaRequisito) {
        const db = getConnection();
        const query = `
            INSERT INTO prerrequisito (id_asignatura, id_asignatura_requisito)
            VALUES (?, ?)
        `;

        const [result] = await db.query<ResultSetHeader>(query, [idAsignatura, idAsignaturaRequisito]);
        return result.insertId;
    },

    async consultarPrerrequisitosPorAsignatura(idAsignatura) {
        const db = getConnection();
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

        const [rows] = await db.query<PrerrequisitoRow[]>(query, [idAsignatura]);
        return rows;
    },
};

export default OfertaAcademica;
