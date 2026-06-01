"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_js_1 = require("../config/db.js");
const AuditLog = {
    async createLog(action, userId, executor) {
        try {
            // Registramos una descripcion breve de la accion y el administrador que la ejecuto.
            const db = executor ?? (0, db_js_1.getConnection)();
            const query = `
                INSERT INTO log_auditoria (accion_usuario, id_usuario)
                VALUES (?, ?)
            `;
            await db.query(query, [action, userId]);
        }
        catch (error) {
            console.log("Error al registrar la accion en log_auditoria");
            throw error;
        }
    },
};
exports.default = AuditLog;
