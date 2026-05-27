import { getConnection } from '../config/db.js'
import { ResultSetHeader, RowDataPacket } from 'mysql2'

export interface AttendanceRow extends RowDataPacket {
    id_asistencia: number;
    id_estudiante: number;
    id_grupo: number;
    estado: string;
    observacion: string;
    fecha: Date;
}

const Attendance = {

    /**
     * Guarda asistencia de un estudiante
     */
    async createAttendance(
        id_estudiante: number,
        id_grupo: number,
        estado: string,
        observacion: string
    ) {

        try {

            const query = `
                INSERT INTO asistencia (
                    id_estudiante,
                    id_grupo,
                    estado,
                    observacion,
                    fecha
                )
                VALUES (?, ?, ?, ?, NOW())
            `;

            const db = getConnection();

            const [result] = await db.query<ResultSetHeader>(
                query,
                [
                    id_estudiante,
                    id_grupo,
                    estado,
                    observacion
                ]
            );

            return result;

        } catch (error) {

            console.error('Error al guardar asistencia:', error);
            throw error;
        }
    }
}

export default Attendance;