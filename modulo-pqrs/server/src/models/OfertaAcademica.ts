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
    crearAsignatura: (data: CrearAsignaturaData) => Promise<number>;
    consultarAsignaturas: () => Promise<AsignaturaRow[]>;
    existeAsignatura: (idAsignatura: number) => Promise<boolean>;
    crearPensum: (data: CrearPensumData) => Promise<number>;
    existePensum: (idPensum: number) => Promise<boolean>;
    asociarAsignaturaPensum: (idPensum: number, idAsignatura: number) => Promise<void>;
    crearGrupo: (data: CrearGrupoData) => Promise<number>;
    consultarGrupos: () => Promise<GrupoRow[]>;
    existeGrupo: (idGrupo: number) => Promise<boolean>;
    crearHorarioAula: (data: CrearHorarioAulaData) => Promise<number>;
    consultarHorariosAulasPorGrupo: (idGrupo?: number) => Promise<HorarioAulaRow[]>;
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

    async crearPensum({ idPrograma, estado = "Activo" }) {
        const db = getConnection();
        const query = `
            INSERT INTO pensum (id_programa, estado)
            VALUES (?, ?)
        `;

        const [result] = await db.query<ResultSetHeader>(query, [idPrograma, estado]);
        return result.insertId;
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

        const [rows] = await db.query<HorarioAulaRow[]>(query, values);
        return rows;
    },
};

export default OfertaAcademica;
