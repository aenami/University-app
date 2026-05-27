"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_js_1 = require("../config/db.js");
const Grupo = {
    async obtenerOfertaAcademica() {
        try {
            const query = `
                SELECT 
                    g.id_grupo,
                    g.num_grupo,
                    g.cupo_maximo,

                    a.nombre AS nombre_asignatura,
                    a.creditos,

                COUNT(dm.id_detalle) AS cupos_ocupados,

                (g.cupo_maximo - COUNT(dm.id_detalle))
                AS cupos_disponibles

                    a.id_asignatura,
                    a.nombre,
                    a.creditos
                FROM grupo g

                INNER JOIN asignatura a
                ON g.id_asignatura = a.id_asignatura

                LEFT JOIN detalle_matricula dm
                ON g.id_grupo = dm.id_grupo

                GROUP BY
                g.id_grupo,
                g.num_grupo,
                g.cupo_maximo,
                a.nombre,
                a.creditos

                HAVING cupos_disponibles > 0
            `;
            // Obtenemos la conexión  del proyecto
            const db = (0, db_js_1.getConnection)();
            const [rows] = await db.query(query);
            return rows;
        }
        catch (error) {
            console.log("Error al consultar la oferta académica en la entidad Grupo");
            throw error;
        }
    }
};
exports.default = Grupo;
