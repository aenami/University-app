import { ResultSetHeader } from "mysql2";
import type { PoolConnection } from "mysql2/promise";
import { getConnection } from "../config/db.js";

type AuditExecutor = PoolConnection;

interface AuditLogModel {
    createLog: (action: string, userId: number, executor?: AuditExecutor) => Promise<void>;
}

const AuditLog: AuditLogModel = {
    async createLog(action, userId, executor) {
        try {
            // Registramos una descripcion breve de la accion y el administrador que la ejecuto.
            const db = executor ?? getConnection();
            const query = `
                INSERT INTO log_auditoria (accion_usuario, id_usuario)
                VALUES (?, ?)
            `;

            await db.query<ResultSetHeader>(query, [action, userId]);
        } catch (error) {
            console.log("Error al registrar la accion en log_auditoria");
            throw error;
        }
    },
};

export default AuditLog;
