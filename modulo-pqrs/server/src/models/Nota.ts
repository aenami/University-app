import { ResultSetHeader, RowDataPacket } from "mysql2";
import { getConnection } from "../config/db.js";

// ============================================================
// INTERFACES
// ============================================================
export interface NotaRow extends RowDataPacket {
    id_nota: number;
    valor: number;
    fecha_registro: Date;
    version_numero: number;
    id_asignatura: number;
    id_corte: number;
    id_docente: number;
}

export interface NotaDetalleRow extends RowDataPacket {
    id_nota: number;
    valor: number;
    fecha_registro: Date;
    version_numero: number;
    id_estudiante: number;
    nombres_usuario: string;
    apellidos_usuario: string;
    documento_usuario: string;
    id_asignatura: number;
    asignatura: string;
    id_corte: number;
    nombre_corte: string;
    porcentaje: number;
}

export interface MatriculaGrupoRow extends RowDataPacket {
    id_estudiante: number;
    id_asignatura: number;
}

// ============================================================
// MODELO
// ============================================================
const Nota = {

    async getDocenteByUsuario(idUsuario: number): Promise<number | null> {
        const db = getConnection();
        const [rows] = await db.query<RowDataPacket[]>(
            `SELECT id_docente FROM docente WHERE id_usuario = ? LIMIT 1`,
            [idUsuario]
        );
        return rows.length ? rows[0].id_docente : null;
    },

    async getMatriculaByEstudianteYGrupo(idEstudiante: number, idGrupo: number): Promise<MatriculaGrupoRow | null> {
        const db = getConnection();
        const [rows] = await db.query<MatriculaGrupoRow[]>(
            `SELECT m.id_estudiante, g.id_asignatura
             FROM matricula m
             INNER JOIN detalle_matricula dm ON dm.id_matricula = m.id_matricula
             INNER JOIN grupo g ON g.id_grupo = dm.id_grupo
             WHERE m.id_estudiante = ? AND dm.id_grupo = ?
             LIMIT 1`,
            [idEstudiante, idGrupo]
        );
        return rows.length ? rows[0] : null;
    },

    async existeCorte(idCorte: number): Promise<boolean> {
        const db = getConnection();
        const [rows] = await db.query<RowDataPacket[]>(
            `SELECT id_corte FROM corte WHERE id_corte = ? LIMIT 1`,
            [idCorte]
        );
        return rows.length > 0;
    },

    async existeNota(idEstudiante: number, idAsignatura: number, idCorte: number): Promise<boolean> {
        const db = getConnection();
        const [rows] = await db.query<RowDataPacket[]>(
            `SELECT n.id_nota
             FROM nota n
             INNER JOIN grupo g ON g.id_asignatura = n.id_asignatura
             INNER JOIN detalle_matricula dm ON dm.id_grupo = g.id_grupo
             INNER JOIN matricula m ON m.id_matricula = dm.id_matricula
             WHERE m.id_estudiante = ? AND n.id_asignatura = ? AND n.id_corte = ?
             LIMIT 1`,
            [idEstudiante, idAsignatura, idCorte]
        );
        return rows.length > 0;
    },

    async crearNota(valor: number, idAsignatura: number, idCorte: number, idDocente: number): Promise<number> {
        const db = getConnection();
        const [result] = await db.query<ResultSetHeader>(
            `INSERT INTO nota (valor, fecha_registro, version_numero, id_asignatura, id_corte, id_docente)
             VALUES (?, CURDATE(), 1, ?, ?, ?)`,
            [valor, idAsignatura, idCorte, idDocente]
        );
        return result.insertId;
    },

    async getNotasByGrupo(idGrupo: number): Promise<NotaDetalleRow[]> {
        const db = getConnection();
        const [rows] = await db.query<NotaDetalleRow[]>(
            `SELECT
                n.id_nota,
                n.valor,
                n.fecha_registro,
                n.version_numero,
                e.id_estudiante,
                u.nombres_usuario,
                u.apellidos_usuario,
                u.documento_usuario,
                a.id_asignatura,
                a.nombre AS asignatura,
                c.id_corte,
                c.nombre_corte,
                c.porcentaje
             FROM nota n
             INNER JOIN asignatura a         ON a.id_asignatura = n.id_asignatura
             INNER JOIN grupo g              ON g.id_asignatura = n.id_asignatura
             INNER JOIN detalle_matricula dm ON dm.id_grupo     = g.id_grupo
             INNER JOIN matricula m          ON m.id_matricula  = dm.id_matricula
             INNER JOIN estudiante e         ON e.id_estudiante = m.id_estudiante
             INNER JOIN usuario u            ON u.id_usuario    = e.id_usuario
             INNER JOIN corte c              ON c.id_corte      = n.id_corte
             WHERE g.id_grupo = ?
             ORDER BY u.apellidos_usuario, u.nombres_usuario, c.porcentaje`,
            [idGrupo]
        );
        return rows;
    },

    async existeGrupo(idGrupo: number): Promise<boolean> {
        const db = getConnection();
        const [rows] = await db.query<RowDataPacket[]>(
            `SELECT id_grupo FROM grupo WHERE id_grupo = ? LIMIT 1`,
            [idGrupo]
        );
        return rows.length > 0;
    },

    async getNotaById(idNota: number): Promise<NotaRow | null> {
        const db = getConnection();
        const [rows] = await db.query<NotaRow[]>(
            `SELECT id_nota, valor, version_numero FROM nota WHERE id_nota = ? LIMIT 1`,
            [idNota]
        );
        return rows.length ? rows[0] : null;
    },

    async actualizarNota(idNota: number, valor: number): Promise<void> {
        const db = getConnection();
        await db.query(
            `UPDATE nota SET valor = ?, fecha_registro = CURDATE(), version_numero = version_numero + 1 WHERE id_nota = ?`,
            [valor, idNota]
        );
    },

    async getAdminByUsuario(idUsuario: number): Promise<number | null> {
        const db = getConnection();
        const [rows] = await db.query<RowDataPacket[]>(
            `SELECT id_administrador FROM administrador WHERE id_usuario = ? LIMIT 1`,
            [idUsuario]
        );
        return rows.length ? rows[0].id_administrador : null;
    },

    async crearAuditoriaNote(valorAnterior: number, valorNuevo: number, idAdministrador: number, idNota: number): Promise<void> {
        const db = getConnection();
        await db.query(
            `INSERT INTO auditoria_nota (valor_anterior, valor_nuevo, id_administrador, id_nota)
             VALUES (?, ?, ?, ?)`,
            [valorAnterior, valorNuevo, idAdministrador, idNota]
        );
    },
};

export default Nota;