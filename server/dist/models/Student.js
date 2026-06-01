"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_js_1 = require("../config/db.js");
const Student = {
    /**
     * Obtiene la lista de estudiantes inscritos en un grupo específico a partir de su matrícula.
     * @param groupId ID del grupo
     */
    async getStudentsByGroupId(groupId) {
        try {
            // Nota: Se utilizan los nombres de columna del modelo User.ts (ej. nombres_usuario, email_usuario)
            // que actualmente está en uso en el servidor. Si tu base de datos final usa nombres simplificados
            // (ej. nombres, correo) según 'dbstructure.sql', puedes ajustar estos nombres aquí.
            const query = `
                SELECT 
                    e.id_estudiante,
                    u.id_usuario,
                    u.nombres,
                    u.apellidos,
                    u.correo,
                    u.documento,
                    m.fecha_matricula
                FROM matricula m
                INNER JOIN estudiante e ON m.id_estudiante = e.id_estudiante
                INNER JOIN usuario u ON e.id_usuario = u.id_usuario
                WHERE m.id_grupo = ?
            `;
            const db = (0, db_js_1.getConnection)();
            const [rows] = await db.query(query, [groupId]);
            return rows;
        }
        catch (error) {
            console.error('Error al obtener los estudiantes del grupo en el modelo Student:', error);
            throw error;
        }
    }
};
exports.default = Student;
