import type { Request, Response } from "express";
import { getConnection } from "../config/db.js";
import type { RowDataPacket } from "mysql2";

// Interfaz para la respuesta estructurada de logs de auditoría
interface AuditLogRow extends RowDataPacket {
    id_log: number;
    accion_usuario: string;
    fecha_hora: Date | string;
    id_usuario: number;
    nombres_usuario: string;
    apellidos_usuario: string;
    email_usuario: string;
    rol_usuario: string;
}

/**
 * Controlador de Auditoría
 * 
 * Este controlador expone métodos para que los administradores
 * puedan consultar la tabla de logs de auditoría del sistema de manera detallada.
 */
export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        // Obtenemos la conexión de la base de datos
        const pool = getConnection();

        // Consulta SQL con JOIN en usuario para obtener el nombre, correo y rol del ejecutor
        const query = `
            SELECT 
                l.id_log,
                l.accion_usuario,
                l.fecha_hora,
                l.id_usuario,
                u.nombres_usuario,
                u.apellidos_usuario,
                u.email_usuario,
                u.rol_usuario
            FROM log_auditoria l
            INNER JOIN usuario u ON u.id_usuario = l.id_usuario
            ORDER BY l.fecha_hora DESC, l.id_log DESC
        `;

        const [rows] = await pool.query<AuditLogRow[]>(query);

        // Retornamos los resultados formateados al frontend
        return res.status(200).json({
            error: false,
            message: "Logs de auditoría consultados con éxito",
            data: rows
        });

    } catch (error) {
        console.error("Error al obtener los logs de auditoría:", error);
        return res.status(500).json({
            error: true,
            message: "Ocurrió un error al intentar consultar los logs de auditoría"
        });
    }
};
