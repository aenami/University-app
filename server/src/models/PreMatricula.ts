import { ResultSetHeader, RowDataPacket } from "mysql2";
import { getConnection } from "../config/db.js";

export interface PreMatriculaRow extends RowDataPacket {
    id_matricula: number;
    id_estudiante: number;
    id_programa: number;
    total_creditos: number;
    fecha_matricula: string;
    estado_matricula: string;
}

interface PreMatriculaModel {
    obtenerPendientes: () => Promise<PreMatriculaRow[]>;
    aprobarPreMatricula: (idMatricula: number) => Promise<boolean>;
    rechazarPreMatricula: (idMatricula: number) => Promise<boolean>;
}

const PreMatricula: PreMatriculaModel = {

    async obtenerPendientes() {
        const db = getConnection();

        const query = `
            SELECT
                id_matricula,
                id_estudiante,
                id_programa,
                total_creditos,
                fecha_matricula,
                estado_matricula
            FROM matricula
            WHERE estado_matricula = 'PENDIENTE'
            ORDER BY fecha_matricula ASC
        `;

        const [rows] = await db.query<PreMatriculaRow[]>(query);
        return rows;
    },

    async aprobarPreMatricula(idMatricula) {
        const db = getConnection();

        const query = `
            UPDATE matricula
            SET estado_matricula = 'APROBADA'
            WHERE id_matricula = ?
        `;

        const [result] = await db.query<ResultSetHeader>(
            query,
            [idMatricula]
        );

        return result.affectedRows > 0;
    },

    async rechazarPreMatricula(idMatricula) {
        const db = getConnection();

        const query = `
            UPDATE matricula
            SET estado_matricula = 'RECHAZADA'
            WHERE id_matricula = ?
        `;

        const [result] = await db.query<ResultSetHeader>(
            query,
            [idMatricula]
        );

        return result.affectedRows > 0;
    }
};

export default PreMatricula;